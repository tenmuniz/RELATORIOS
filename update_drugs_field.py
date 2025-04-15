"""
Script para atualizar o campo drugs_seized_count da tabela report,
alterando de INTEGER para FLOAT, permitindo registrar a quantidade em gramas.
"""
import os
import psycopg2
import logging

logging.basicConfig(level=logging.INFO)

# Configurar a conexão com o banco de dados PostgreSQL
DATABASE_URL = os.environ.get('DATABASE_URL')

def update_drugs_field():
    """Atualiza o campo drugs_seized_count de INTEGER para FLOAT."""
    conn = None
    cursor = None
    
    try:
        # Conectar ao banco de dados
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        # Verificar o tipo da coluna atual
        cursor.execute("""
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'report' 
            AND column_name = 'drugs_seized_count';
        """)
        
        current_type = cursor.fetchone()
        
        if current_type and current_type[0].upper() in ['INTEGER', 'INT', 'SMALLINT', 'BIGINT']:
            # Converter os valores atuais (0 ou 1) para representação em gramas temporariamente
            # 0 permanece 0, 1 será convertido para 1.0
            logging.info("Convertendo coluna drugs_seized_count para FLOAT")
            
            # Alternativa 1: Criar nova coluna, copiar dados e então renomear
            cursor.execute("""
                ALTER TABLE report 
                ADD COLUMN drugs_seized_grams FLOAT DEFAULT 0.0;
            """)
            
            cursor.execute("""
                UPDATE report 
                SET drugs_seized_grams = CAST(drugs_seized_count AS FLOAT);
            """)
            
            cursor.execute("""
                ALTER TABLE report 
                DROP COLUMN drugs_seized_count;
            """)
            
            cursor.execute("""
                ALTER TABLE report 
                RENAME COLUMN drugs_seized_grams TO drugs_seized_count;
            """)
            
            # Confirmar as alterações
            conn.commit()
            logging.info("Atualização do campo drugs_seized_count concluída com sucesso")
        else:
            logging.info("O campo drugs_seized_count já está no formato adequado ou não existe")
        
    except Exception as e:
        logging.error(f"Erro ao atualizar o campo drugs_seized_count: {str(e)}")
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
    update_drugs_field()
    print("Atualização do campo drugs_seized_count concluída.")