from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

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
    drugs_seized_count = db.Column(db.Integer, default=0)
    
    occurrence = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    @property
    def total_inspections(self):
        """Calculate total inspections"""
        return (self.people_count + self.motorcycles_count + self.cars_count + self.bicycles_count + 
                self.arrests_count + self.seized_motorcycles_count + self.drugs_seized_count)
        
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
            'occurrence': self.occurrence,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'totalInspections': self.total_inspections
        }