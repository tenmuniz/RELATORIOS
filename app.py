import os
import logging
import re
from flask import Flask, render_template, request, jsonify
from models import db, Report

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET")

# Configure database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize database
db.init_app(app)

# Create tables
with app.app_context():
    db.create_all()

@app.route("/")
def index():
    """Render the main page."""
    return render_template("index.html")

@app.route("/reset", methods=["POST"])
def reset_database():
    """
    API endpoint to reset all data in the database.
    This deletes all reports and resets the counters.
    """
    try:
        # Excluir todos os relatórios
        Report.query.delete()
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Todos os dados foram resetados com sucesso",
            "totals": {
                "people": 0,
                "motorcycles": 0,
                "cars": 0,
                "bicycles": 0,
                "arrests": 0,
                "seizedMotorcycles": 0,
                "drugsSeized": 0,
                "totalInspections": 0,
                "reportsCount": 0
            }
        })
        
    except Exception as e:
        logging.error(f"Erro ao resetar o banco de dados: {str(e)}")
        return jsonify({"error": f"Ocorreu um erro ao resetar os dados: {str(e)}"}), 500

@app.route("/analyze", methods=["POST"])
def analyze():
    """
    API endpoint to analyze police report text.
    This processes and stores the data in the database.
    """
    try:
        report_text = request.json.get("text", "")
        
        # Basic validation
        if not report_text:
            return jsonify({"error": "O texto do relatório é obrigatório"}), 400
            
        # Extract data - using the same logic as in the JS file
        # Normalize text
        normalized_text = report_text.upper()
        
        # Extract location
        location = "NÃO IDENTIFICADO"
        if "MUANÁ" in normalized_text:
            location = "MUANÁ"
        elif "PONTA DE PEDRAS" in normalized_text:
            location = "PONTA DE PEDRAS"
        
        # Extract date
        date_match = re.findall(r'\d{2}/\d{2}/\d{4}', report_text)
        date = date_match[0] if date_match else None
        
        # Extract shift
        shift = "Não identificado"
        if "07:30" in normalized_text and "19:30" in normalized_text:
            shift = "Diurno (07:30 às 19:30)"
        elif "19:30" in normalized_text and "07:30" in normalized_text:
            shift = "Noturno (19:30 às 07:30)"
        
        # Extract inspection counts
        people_match = re.search(r'PESSOAS A PÉ\s*:\s*(\d+)', normalized_text, re.IGNORECASE)
        motorcycles_match = re.search(r'MOTOS\s*:\s*(\d+)', normalized_text, re.IGNORECASE)
        cars_match = re.search(r'CARRO[S]*\s*:\s*(\d+)', normalized_text, re.IGNORECASE)
        bicycles_match = re.search(r'BICICLETAS\s*:\s*(\d+)', normalized_text, re.IGNORECASE)
        
        # Extract occurrence
        occurrence_match = re.search(r'OCORRÊNCIA[^:]*:\s*(.+?)(?=\n|$)', normalized_text, re.IGNORECASE)
        occurrence = occurrence_match[1].strip() if occurrence_match else "Sem ocorrência relevante"
        
        # Extrair dados de prisões, apreensões de motos e apreensões de drogas
        arrests_match = re.search(r'PRIS[ÕO]ES\s*:\s*(\d+)', normalized_text, re.IGNORECASE) or \
                        re.search(r'PRESOS\s*:\s*(\d+)', normalized_text, re.IGNORECASE)
                        
        seized_motorcycles_match = re.search(r'MOTOS\s*APREENDIDAS\s*:\s*(\d+)', normalized_text, re.IGNORECASE) or \
                                   re.search(r'APREENS[ÃA]O\s*DE\s*MOTOS\s*:\s*(\d+)', normalized_text, re.IGNORECASE)
                                   
        drugs_match = re.search(r'DROGAS\s*APREENDIDAS\s*:\s*(\d+)', normalized_text, re.IGNORECASE) or \
                      re.search(r'APREENS[ÃA]O\s*DE\s*DROGAS\s*:\s*(\d+)', normalized_text, re.IGNORECASE)
        
        # Verificar texto da ocorrência para inferir valores não explícitos
        arrests_count = int(arrests_match[1]) if arrests_match else 0
        seized_motorcycles_count = int(seized_motorcycles_match[1]) if seized_motorcycles_match else 0
        drugs_seized_count = int(drugs_match[1]) if drugs_match else 0
        
        # Se não encontrado explicitamente, tenta inferir do texto da ocorrência
        if arrests_count == 0:
            has_arrest_keywords = (
                'PRISÃO' in normalized_text or 
                'PRESO' in normalized_text or 
                'APRESENTAÇÃO NA DELEGACIA' in normalized_text or 
                'APRESENTADO NA DELEGACIA' in normalized_text
            )
            
            # Verificação adicional para nomes próprios após menção de apresentação na delegacia
            has_presentation_with_name = False
            presentation_phrases = [
                'APRESENTAÇÃO NA DELEGACIA', 
                'APRESENTADO NA DELEGACIA',
                'CONDUZIDO À DELEGACIA',
                'CONDUZIDO PARA DELEGACIA',
                'ENCAMINHADO À DELEGACIA'
            ]
            
            for phrase in presentation_phrases:
                if phrase in normalized_text:
                    # Procurar por provável nome próprio após a frase
                    pos = normalized_text.find(phrase) + len(phrase)
                    next_text = normalized_text[pos:pos+150]  # Olhar os próximos 150 caracteres
                    
                    # Padrões comuns para nomes: palavras capitalizadas consecutivas ou com DE, DA, DOS entre elas
                    # ou após "NOME:" ou "NACIONAL:"
                    name_patterns = [
                        r'NOME\s*:\s*([A-Z]+\s+(?:[A-Z]+\s+)+)',
                        r'NACIONAL\s*:\s*([A-Z]+\s+(?:[A-Z]+\s+)+)',
                        r'SR\s*\.?\s*([A-Z]+\s+(?:[A-Z]+\s+)+)',
                        r'SRA\s*\.?\s*([A-Z]+\s+(?:[A-Z]+\s+)+)',
                        r'INDIVÍDUO\s+([A-Z]+\s+(?:[A-Z]+\s+)+)',
                        r'CIDADÃO\s+([A-Z]+\s+(?:[A-Z]+\s+)+)',
                        r'SUSPEITO\s+([A-Z]+\s+(?:[A-Z]+\s+)+)',
                        r'([A-Z]+\s+(?:D[AEOI]S?\s+)?[A-Z]+\s+(?:D[AEOI]S?\s+)?[A-Z]+)'
                    ]
                    
                    for pattern in name_patterns:
                        name_match = re.search(pattern, next_text)
                        if name_match:
                            has_presentation_with_name = True
                            break
                    
                    if has_presentation_with_name:
                        break
            
            if has_arrest_keywords or has_presentation_with_name:
                arrests_count = 1  # Assume pelo menos uma prisão
            
        if seized_motorcycles_count == 0 and 'MOTO APREENDIDA' in normalized_text:
            seized_motorcycles_count = 1  # Assume pelo menos uma moto apreendida se mencionado
            
        if drugs_seized_count == 0 and ('DROGA' in normalized_text or 'ENTORPECENTE' in normalized_text):
            drugs_seized_count = 1  # Assume pelo menos uma apreensão se mencionado
        
        # Create new report
        new_report = Report(
            location=location,
            date=date,
            shift=shift,
            people_count=int(people_match[1]) if people_match else 0,
            motorcycles_count=int(motorcycles_match[1]) if motorcycles_match else 0,
            cars_count=int(cars_match[1]) if cars_match else 0,
            bicycles_count=int(bicycles_match[1]) if bicycles_match else 0,
            arrests_count=arrests_count,
            seized_motorcycles_count=seized_motorcycles_count,
            drugs_seized_count=drugs_seized_count,
            occurrence=occurrence
        )
        
        # Save to database
        db.session.add(new_report)
        db.session.commit()
        
        # Get all data for totals
        reports = Report.query.all()
        total_people = sum(report.people_count for report in reports)
        total_motorcycles = sum(report.motorcycles_count for report in reports)
        total_cars = sum(report.cars_count for report in reports)
        total_bicycles = sum(report.bicycles_count for report in reports)
        total_arrests = sum(report.arrests_count for report in reports)
        total_seized_motorcycles = sum(report.seized_motorcycles_count for report in reports)
        total_drugs_seized = sum(report.drugs_seized_count for report in reports)
        total_inspections = total_people + total_motorcycles + total_cars + total_bicycles
        
        # Return both the current report and the accumulated totals
        return jsonify({
            "success": True, 
            "data": new_report.to_dict(),
            "totals": {
                "people": total_people,
                "motorcycles": total_motorcycles,
                "cars": total_cars,
                "bicycles": total_bicycles,
                "arrests": total_arrests,
                "seizedMotorcycles": total_seized_motorcycles,
                "drugsSeized": total_drugs_seized,
                "totalInspections": total_inspections,
                "reportsCount": len(reports)
            }
        })
        
    except Exception as e:
        logging.error(f"Error processing report: {str(e)}")
        return jsonify({"error": f"Ocorreu um erro ao processar o relatório: {str(e)}"}), 500

# Run the app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
