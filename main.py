import os
import logging
from railway_config import setup_environment

# Configurar ambiente para Railway
setup_environment()

# Configurar logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# Importar o app apenas depois de configurar o ambiente
from app import app  # noqa: F401

# Log que o app foi importado com sucesso
logging.info("App importado com sucesso em main.py")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    logging.info(f"Iniciando servidor na porta {port}")
    app.run(host="0.0.0.0", port=port)

