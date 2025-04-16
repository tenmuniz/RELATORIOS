import os
import logging
from railway_config import setup_environment

# Configurar logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

logging.info("Inicializando ambiente para deployment")

try:
    # Configurar ambiente para Railway
    setup_environment()
    logging.info("Ambiente configurado com sucesso")
    
    # Verificar se as variáveis de ambiente críticas estão definidas
    db_vars = ['DATABASE_URL', 'PGHOST', 'PGDATABASE', 'PGUSER', 'PGPASSWORD', 'PGPORT']
    for var in db_vars:
        value = os.environ.get(var)
        if value:
            # Mascarar valores sensíveis
            masked = value[:3] + '***' if var in ['DATABASE_URL', 'PGPASSWORD'] else value
            logging.info(f"Variável {var}: {masked}")
        else:
            logging.warning(f"Variável {var} não definida!")
    
    # Importar o app depois de configurar o ambiente
    from app import app as flask_app
    
    # Usar a app diretamente do módulo app, não do main
    # Isso evita problemas de circular imports
    app = flask_app
    
    logging.info("Aplicação inicializada com sucesso")
    
except Exception as e:
    logging.error(f"Erro ao inicializar aplicação: {str(e)}")
    # Re-raise para que o Gunicorn capture o erro
    raise

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    logging.info(f"Iniciando servidor na porta {port}")
    app.run(host="0.0.0.0", port=port)