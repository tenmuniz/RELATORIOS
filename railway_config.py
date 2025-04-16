import os
import re

def fix_postgres_url():
    """
    Railway fornece uma URL DATABASE_URL formatada para PostgreSQL,
    mas algumas versões do SQLAlchemy exigem que o URL comece com 'postgresql://'
    ao invés de 'postgres://'. Esta função corrige isso.
    """
    db_url = os.environ.get('DATABASE_URL')
    if db_url and db_url.startswith('postgres://'):
        # Substituir 'postgres://' por 'postgresql://'
        os.environ['DATABASE_URL'] = db_url.replace('postgres://', 'postgresql://')

def setup_environment():
    """Configurar variáveis de ambiente necessárias para o Railway"""
    # Obter a porta atribuída pelo Railway ou usar 5000 como padrão
    port = os.environ.get('PORT', 5000)
    os.environ['PORT'] = str(port)
    
    # Se não houver uma chave secreta, criar uma
    if not os.environ.get('SESSION_SECRET'):
        os.environ['SESSION_SECRET'] = os.environ.get('RAILWAY_PROJECT_ID', 'secret-key-for-sessions')
    
    # Corrigir a URL do PostgreSQL para SQLAlchemy
    fix_postgres_url()