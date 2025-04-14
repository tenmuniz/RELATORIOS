from app import app, db
from models import Report

with app.app_context():
    # Adicionar colunas novas ao banco de dados
    print("Atualizando o banco de dados...")
    
    # Criar as tabelas atualizadas
    db.create_all()
    
    print("Atualização concluída!")