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
database_url = os.environ.get("DATABASE_URL")
# Correção para URLs postgres:// vs postgresql:// (necessário para algumas versões do SQLAlchemy)
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config["SQLALCHEMY_DATABASE_URI"] = database_url
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
    "pool_size": 10,
    "max_overflow": 15,
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

@app.route("/calendario")
def calendar():
    """Render the calendar page."""
    return render_template("calendar.html")

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
                "fugitives": 0,
                "bladedWeapons": 0,
                "firearms": 0,
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
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400
            
        data = request.get_json()
        if 'text' not in data:
            return jsonify({"error": "No text provided for analysis"}), 400
            
        report_text = data['text']
        # Normalize text
        normalized_text = report_text.upper()
        
        # Verificar se é apenas uma solicitação de totais (para exibição ao voltar do calendário)
        is_totals_only_request = "Relatório apenas para carregar totais" in report_text
        
        # Se não for apenas para obter totais, vamos processar e salvar o relatório
        if not is_totals_only_request:
            # Variável para indicar se usamos IA ou não
            using_ai_analysis = False
            
            # Tentar usar a análise por IA primeiro
            try:
                from ai_analyzer import analyze_police_report
                logging.info("Attempting to use AI analysis...")
                
                # Obter resultados da análise por IA
                ai_results = analyze_police_report(report_text)
                
                # Criar relatório com os dados analisados pela IA
                new_report = Report(
                    location=ai_results.get('location', 'NÃO IDENTIFICADO'),
                    date=ai_results.get('date', ''),
                    shift=ai_results.get('shift', 'Não identificado'),
                    people_count=ai_results.get('people_count', 0),
                    motorcycles_count=ai_results.get('motorcycles_count', 0),
                    cars_count=ai_results.get('cars_count', 0),
                    bicycles_count=ai_results.get('bicycles_count', 0),
                    arrests_count=ai_results.get('arrests_count', 0),
                    seized_motorcycles_count=ai_results.get('seized_motorcycles_count', 0),
                    drugs_seized_count=ai_results.get('drugs_seized_count', 0),
                    fugitives_count=ai_results.get('fugitives_count', 0),
                    bladed_weapons_count=ai_results.get('bladed_weapons_count', 0),
                    firearms_count=ai_results.get('firearms_count', 0),
                    occurrence=ai_results.get('occurrence', 'Sem ocorrência relevante')
                )
                
                using_ai_analysis = True
                logging.info(f"Successfully created report from AI analysis")
                
            except Exception as ai_error:
                logging.error(f"Error using AI analysis, falling back to regex: {str(ai_error)}")
                using_ai_analysis = False
            
            # Se não conseguimos usar IA, usamos a análise por regex
            if not using_ai_analysis:
                logging.info("Using regex-based analysis...")
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
                
                # Agora vamos verificar por múltiplas prisões/conduções no texto
                # Iniciar contagem com o valor explícito
                arrests_count = int(arrests_match[1]) if arrests_match else 0
                
                # Lista de palavras-chave que indicam prisão
                arrest_keywords = [
                    'PRISÃO', 'PRESO', 'DETIDO', 'DETENÇÃO', 'FLAGRANTE',
                    'APRESENTAÇÃO NA DELEGACIA', 'APRESENTADO NA DELEGACIA',
                    'CONDUZIDO À DELEGACIA', 'CONDUZIDO PARA DELEGACIA',
                    'CONDUZINDO O MESMO ATÉ A DELEGACIA', 'CONDUZINDO A DELEGACIA',
                    'CONDUZINDO PARA A DELEGACIA', 'ENCAMINHADO À DELEGACIA'
                ]
                
                # Verificar se qualquer keyword existe no texto
                has_arrest_keywords = any(keyword in normalized_text for keyword in arrest_keywords)
                
                # Procurar nomes próprios/identificados no texto
                # Padrões de nome (entre asteriscos ou destacados)
                name_patterns = [
                    r'\*([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+\s+(?:[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+\s+){1,3}[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+)\*',  # Nomes entre asteriscos
                    r'SR\.?\s+([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+\s+(?:[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+\s+){1,3}[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+)',  # Nomes com Sr.
                    r'SRA\.?\s+([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+\s+(?:[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+\s+){1,3}[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+)',  # Nomes com Sra.
                    r'NACIONAL\s*:\s*([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+\s+(?:[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+\s+){1,3}[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+)',  # Após NACIONAL:
                    r'NOME\s*:\s*([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+\s+(?:[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+\s+){1,3}[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+)'  # Após NOME:
                ]
                
                # Encontrar todos os nomes no texto
                identified_names = []
                for pattern in name_patterns:
                    names = re.finditer(pattern, normalized_text)
                    for name_match in names:
                        identified_names.append(name_match.group(1).strip())
                
                # Remover duplicados
                identified_names = list(set(identified_names))
                
                # Se encontramos nomes E há palavras-chave de prisão, cada nome conta como 1 prisão
                if has_arrest_keywords and identified_names:
                    # Se há mais nomes do que a contagem atual de prisões, use o número de nomes como contagem
                    if len(identified_names) > arrests_count:
                        arrests_count = len(identified_names)
                        logging.info(f"Identified {arrests_count} arrests based on names: {identified_names}")
                        
                # Se ainda não encontramos nenhuma prisão, mas temos keywords, considere pelo menos 1
                if arrests_count == 0 and has_arrest_keywords:
                    arrests_count = 1  # Assume pelo menos uma prisão
                    
                if seized_motorcycles_count == 0 and 'MOTO APREENDIDA' in normalized_text:
                    seized_motorcycles_count = 1  # Assume pelo menos uma moto apreendida se mencionado
                    
                if drugs_seized_count == 0 and ('DROGA' in normalized_text or 'ENTORPECENTE' in normalized_text):
                    drugs_seized_count = 1  # Assume pelo menos uma apreensão se mencionado
                    
                # Verificação adicional para contabilizar prisão quando há texto longo
                # com palavras-chave que indicam prisão
                if arrests_count == 0 and len(occurrence) > 50:
                    arrest_indicators = [
                        'DETENÇÃO', 'FAZENDO SUA DETENÇÃO', 
                        'PRESO EM FLAGRANTE', 'DELEGACIA DE POLÍCIA', 
                        'CONDUZINDO', 'CONDUZIDO', 'DETIDO'
                    ]
                    
                    for indicator in arrest_indicators:
                        if indicator in normalized_text:
                            # Verificar se há pelo menos um nome próprio (palavras maiúsculas entre asteriscos)
                            name_pattern = r'\*[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+\s+[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+\s+[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+\*'
                            if re.search(name_pattern, normalized_text):
                                arrests_count = 1
                                break
                
                # Verificar se tem foragidos
                fugitives_count = 0
                fugitive_keywords = ['FORAGIDO', 'EVADIDO', 'MANDADO DE PRISÃO']
                for keyword in fugitive_keywords:
                    if keyword in normalized_text:
                        fugitives_count = 1
                        
                        # Se for foragido, também contabiliza como prisão
                        if arrests_count == 0:
                            arrests_count = 1
                        break
                
                # Verificar se tem armas brancas apreendidas
                bladed_weapons_count = 0
                bladed_weapons_keywords = ['ARMA BRANCA', 'FACA', 'FACÃO', 'CANIVETE', 'ESTILETE', 'FACAS', 'PEIXEIRA']
                for keyword in bladed_weapons_keywords:
                    if keyword in normalized_text:
                        bladed_weapons_count = 1
                        break
                
                # Verificar se tem armas de fogo apreendidas
                firearms_count = 0
                firearms_keywords = ['ARMA DE FOGO', 'REVÓLVER', 'PISTOLA', 'ESPINGARDA', 'RIFLE', 'REVOLVER', 'ARMAMENTO', 'MUNIÇÃO']
                for keyword in firearms_keywords:
                    if keyword in normalized_text:
                        firearms_count = 1
                        break
                        
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
                    fugitives_count=fugitives_count,
                    bladed_weapons_count=bladed_weapons_count,
                    firearms_count=firearms_count,
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
        total_fugitives = sum(report.fugitives_count for report in reports)
        total_bladed_weapons = sum(report.bladed_weapons_count for report in reports)
        total_firearms = sum(report.firearms_count for report in reports)
        # Total de inspeções deve incluir apenas pessoas e veículos abordados
        # Conforme solicitado pelo usuário: não incluir drogas apreendidas no total
        total_inspections = (total_people + total_motorcycles + total_cars + total_bicycles +
                            total_arrests + total_fugitives)
        
        # Return response based on request type
        response_data = {
            "success": True,
            "totals": {
                "people": total_people,
                "motorcycles": total_motorcycles,
                "cars": total_cars,
                "bicycles": total_bicycles,
                "arrests": total_arrests,
                "seizedMotorcycles": total_seized_motorcycles,
                "drugsSeized": total_drugs_seized,
                "fugitives": total_fugitives,
                "bladedWeapons": total_bladed_weapons,
                "firearms": total_firearms,
                "totalInspections": total_inspections,
                "reportsCount": len(reports)
            }
        }
        
        # Se não for uma requisição apenas para totais, incluir os dados do relatório atual
        if not is_totals_only_request:
            response_data["data"] = new_report.to_dict()
        
        return jsonify(response_data)
        
    except Exception as e:
        logging.error(f"Error processing report: {str(e)}")
        return jsonify({"error": f"Ocorreu um erro ao processar o relatório: {str(e)}"}), 500

@app.route("/delete-last", methods=["POST"])
def delete_last_report():
    """
    API endpoint para deletar o último relatório adicionado.
    """
    try:
        # Buscar o último relatório pela data de criação (created_at)
        last_report = Report.query.order_by(Report.created_at.desc()).first()
        
        if not last_report:
            return jsonify({
                "success": False,
                "message": "Não há relatórios para excluir."
            }), 404
        
        # Salvar informações do relatório para exibir
        report_info = {
            "local": last_report.location,
            "data": last_report.date,
            "turno": last_report.shift
        }
        
        # Excluir o último relatório
        db.session.delete(last_report)
        db.session.commit()
        
        # Obter novos totais após a exclusão
        reports = Report.query.all()
        total_people = sum(report.people_count for report in reports)
        total_motorcycles = sum(report.motorcycles_count for report in reports)
        total_cars = sum(report.cars_count for report in reports)
        total_bicycles = sum(report.bicycles_count for report in reports)
        total_arrests = sum(report.arrests_count for report in reports)
        total_seized_motorcycles = sum(report.seized_motorcycles_count for report in reports)
        total_drugs_seized = sum(report.drugs_seized_count for report in reports)
        total_fugitives = sum(report.fugitives_count for report in reports)
        total_bladed_weapons = sum(report.bladed_weapons_count for report in reports)
        total_firearms = sum(report.firearms_count for report in reports)
        # Calcular o total de inspeções (pessoas, veículos, prisões e foragidos)
        total_inspections = (total_people + total_motorcycles + total_cars + total_bicycles + 
                            total_arrests + total_fugitives)
        
        return jsonify({
            "success": True,
            "message": f"Relatório excluído com sucesso: {report_info['local']} - {report_info['data']} ({report_info['turno']})",
            "deleted_report": report_info,
            "totals": {
                "people": total_people,
                "motorcycles": total_motorcycles,
                "cars": total_cars,
                "bicycles": total_bicycles,
                "arrests": total_arrests,
                "seizedMotorcycles": total_seized_motorcycles,
                "drugsSeized": total_drugs_seized,
                "fugitives": total_fugitives,
                "bladedWeapons": total_bladed_weapons,
                "firearms": total_firearms,
                "totalInspections": total_inspections,
                "reportsCount": len(reports)
            }
        })
        
    except Exception as e:
        logging.error(f"Erro ao excluir o último relatório: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Ocorreu um erro ao excluir o último relatório: {str(e)}"
        }), 500

@app.route("/api/calendar", methods=["GET"])
def get_reports_calendar():
    """API endpoint to get the reports calendar."""
    try:
        # Forçar que a data de início seja 01/04/2025 e o período seja abril completo
        start_date = "01/04/2025"
        days = 30  # Abril tem 30 dias
        
        # Obter o calendário de relatórios (forçando abril/2025)
        calendar = Report.get_reports_calendar(start_date, days)
        
        # Filtrar para garantir que só temos datas de abril/2025
        filtered_calendar = []
        for day in calendar:
            date_parts = day["date"].split("/")
            # Verificar se é abril/2025
            if len(date_parts) == 3 and date_parts[1] == "04" and date_parts[2] == "2025":
                filtered_calendar.append(day)
        
        return jsonify({
            "success": True,
            "calendar": filtered_calendar
        })
        
    except Exception as e:
        logging.error(f"Error getting reports calendar: {str(e)}")
        return jsonify({"error": f"Ocorreu um erro ao obter o calendário de relatórios: {str(e)}"}), 500

# Run the app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
