import os
from railway_config import setup_environment

# Configurar ambiente para Railway
setup_environment()

# Importar o app depois de configurar o ambiente
from main import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)