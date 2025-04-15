"""
Script para atualizar a estrutura do banco de dados com as novas colunas
para contar armas brancas e armas de fogo.
"""
import os
import psycopg2
import logging

logging.basicConfig(level=logging.INFO)

# Configurar a conexão com o banco de dados PostgreSQL
DATABASE_URL = os.environ.get('DATABASE_URL')

def add_columns():
    """Adiciona as novas colunas à tabela report se elas não existirem."""
    try:
        # Conectar ao banco de dados
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        # Verificar se as colunas já existem
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'report' 
            AND column_name IN ('bladed_weapons_count', 'firearms_count');
        """)
        
        existing_columns = [col[0] for col in cursor.fetchall()]
        
        # Adicionar a coluna de armas brancas se não existir
        if 'bladed_weapons_count' not in existing_columns:
            logging.info("Adicionando coluna bladed_weapons_count")
            cursor.execute("""
                ALTER TABLE report
                ADD COLUMN bladed_weapons_count INTEGER DEFAULT 0;
            """)
        
        # Adicionar a coluna de armas de fogo se não existir
        if 'firearms_count' not in existing_columns:
            logging.info("Adicionando coluna firearms_count")
            cursor.execute("""
                ALTER TABLE report
                ADD COLUMN firearms_count INTEGER DEFAULT 0;
            """)
        
        # Confirmar as alterações
        conn.commit()
        logging.info("Atualizações no banco de dados concluídas com sucesso")
        
    except Exception as e:
        logging.error(f"Erro ao atualizar o banco de dados: {str(e)}")
        # Rollback em caso de erro
        if conn:
            conn.rollback()
    finally:
        # Fechar a conexão
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == '__main__':
    add_columns()
    print("Atualização do banco de dados concluída.")