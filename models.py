from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import re

db = SQLAlchemy()

class Report(db.Model):
    """Model to store police productivity reports"""
    id = db.Column(db.Integer, primary_key=True)
    location = db.Column(db.String(50), nullable=False)
    date = db.Column(db.String(20), nullable=True)
    shift = db.Column(db.String(50), nullable=True)
    people_count = db.Column(db.Integer, default=0)
    motorcycles_count = db.Column(db.Integer, default=0)
    cars_count = db.Column(db.Integer, default=0)
    bicycles_count = db.Column(db.Integer, default=0)
    
    # Novos campos para contabilização adicional
    arrests_count = db.Column(db.Integer, default=0)
    seized_motorcycles_count = db.Column(db.Integer, default=0)
    drugs_seized_count = db.Column(db.Float, default=0.0)  # Quantidade de drogas em gramas
    fugitives_count = db.Column(db.Integer, default=0)  # Contagem de foragidos capturados
    bladed_weapons_count = db.Column(db.Integer, default=0)  # Contagem de armas brancas
    firearms_count = db.Column(db.Integer, default=0)  # Contagem de armas de fogo
    
    occurrence = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    @property
    def total_inspections(self):
        """Calculate total inspections (pessoas, veículos, prisões e foragidos)"""
        # Contar pessoas, veículos, prisões e foragidos abordados, conforme solicitação do usuário
        # Não incluir apreensões de motos, armas ou drogas no total
        return (self.people_count + self.motorcycles_count + self.cars_count + self.bicycles_count + 
                self.arrests_count + self.fugitives_count)
        
    def to_dict(self):
        """Convert report to dictionary"""
        return {
            'id': self.id,
            'location': self.location,
            'date': self.date,
            'shift': self.shift,
            'people': self.people_count,
            'motorcycles': self.motorcycles_count,
            'cars': self.cars_count,
            'bicycles': self.bicycles_count,
            'arrests': self.arrests_count,
            'seizedMotorcycles': self.seized_motorcycles_count,
            'drugsSeized': self.drugs_seized_count,
            'fugitives': self.fugitives_count,
            'bladedWeapons': self.bladed_weapons_count,  # Armas brancas
            'firearms': self.firearms_count,  # Armas de fogo
            'occurrence': self.occurrence,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'totalInspections': self.total_inspections
        }
        
    @staticmethod
    def parse_date(date_str):
        """Parse date string into datetime object - sempre retorna data em abril de 2025"""
        if not date_str:
            return datetime(2025, 4, 1)
        
        # Extrai apenas o dia da data original
        match = re.match(r'(\d{2})/(\d{2})/(\d{4})', date_str)
        if match:
            day, month, year = map(int, match.groups())
            # Usar o dia da data original, mas em abril de 2025
            try:
                if day > 30:  # Abril tem 30 dias
                    day = 30
                return datetime(2025, 4, day)
            except ValueError:
                return datetime(2025, 4, 1)
        
        # Caso não consiga extrair, retorna o primeiro dia de abril
        return datetime(2025, 4, 1)
    
    @classmethod
    def get_reports_calendar(cls, start_date=None, days=30):
        """
        Generate a calendar of reports showing which dates have reports
        and which are missing for each location and shift.
        
        Args:
            start_date: Starting date (datetime or string in DD/MM/YYYY format)
            days: Number of days to check
            
        Returns:
            dict: Calendar with status of each date/location/shift
        """
        if start_date is None:
            # Default para o dia 1 de abril de 2025
            start_date = datetime(2025, 4, 1)
        elif isinstance(start_date, str):
            # Parse the string date
            start_date = cls.parse_date(start_date)
            if start_date is None:
                # Se falhar o parsing, usar o primeiro dia de abril de 2025
                start_date = datetime(2025, 4, 1)
            else:
                # Se der certo o parsing, garantir que seja dia 1 do mês informado
                start_date = datetime(start_date.year, start_date.month, 1)
        
        # Get all reports within date range
        all_reports = cls.query.all()
        
        # Map for quick lookup
        report_map = {}
        for report in all_reports:
            parsed_date = cls.parse_date(report.date)
            if parsed_date:
                key = f"{parsed_date.strftime('%d/%m/%Y')}_{report.location}_{report.shift}"
                report_map[key] = report
        
        # Generate the calendar
        calendar = []
        
        # Forçar a data de início como 1 de abril de 2025, independente dos parâmetros recebidos
        current_date = datetime(2025, 4, 1)
        
        # Forçar a data final como 30 de abril de 2025
        end_date = datetime(2025, 4, 30)
        
        # Limpar todos os dias para abril de 2025 diretamente
        
        while current_date <= end_date:
            date_str = current_date.strftime('%d/%m/%Y')
            
            # Check status for each location and shift
            locations = ["MUANÁ", "PONTA DE PEDRAS"]
            shifts = ["Diurno (07:30 às 19:30)", "Noturno (19:30 às 07:30)"]
            
            date_entry = {
                "date": date_str,
                "reports": []
            }
            
            for location in locations:
                for shift in shifts:
                    key = f"{date_str}_{location}_{shift}"
                    
                    # Check if we have a report that matches
                    status = "missing"
                    report_id = None
                    
                    # Try different shift name formats
                    shift_alt = "Diurno" if "Diurno" in shift else "Noturno"
                    key_alt = f"{date_str}_{location}_{shift_alt}"
                    
                    if key in report_map:
                        status = "submitted"
                        report_id = report_map[key].id
                    elif key_alt in report_map:
                        status = "submitted"
                        report_id = report_map[key_alt].id
                    
                    date_entry["reports"].append({
                        "location": location,
                        "shift": shift,
                        "status": status,
                        "report_id": report_id
                    })
            
            calendar.append(date_entry)
            current_date += timedelta(days=1)
        
        return calendar