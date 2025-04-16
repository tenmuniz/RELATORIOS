import os
from railway_config import setup_environment

# Configurar ambiente para Railway
setup_environment()

from app import app  # noqa: F401

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)

