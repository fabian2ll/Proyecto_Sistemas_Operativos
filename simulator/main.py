"""
Punto de entrada del simulador de sistema operativo — servidor Flask.
Configura la aplicación Flask con CORS habilitado y registra las rutas de la API.

Puede ejecutarse de dos formas:
  1. Desde la raíz del proyecto:   python -m simulator.main
  2. Desde dentro de simulator/:   python main.py
"""

import os
import sys

# Asegurar que el directorio raíz del proyecto esté en sys.path
# para que los imports `from simulator.xxx` funcionen sin importar
# desde dónde se ejecute el script.
_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_PROJECT_ROOT = os.path.dirname(_THIS_DIR)
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from flask import Flask
from flask_cors import CORS
from simulator.api.routes import api_bp


def create_app() -> Flask:
    """
    Crea y configura la aplicación Flask del simulador.

    Habilita CORS para permitir peticiones desde el frontend Next.js
    en localhost:3000. Registra el Blueprint de rutas de la API bajo
    el prefijo /api.

    Returns:
        Flask: Instancia configurada de la aplicación Flask.
    """
    app = Flask(__name__)

    # Habilitar CORS para el frontend Next.js
    CORS(
        app,
        resources={
            r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}
        },
    )

    # Registrar rutas de la API
    app.register_blueprint(api_bp, url_prefix="/api")

    @app.route("/")
    def health_check():
        """Endpoint de verificación de salud del servidor."""
        return {
            "status": "running",
            "service": "OS Simulator API",
            "version": "1.0.0",
            "university": "UPTC — Sistemas Operativos",
        }

    return app


if __name__ == "__main__":
    app = create_app()
    print("=" * 60)
    print("  Simulador de Sistema Operativo — UPTC")
    print("  Servidor Flask en http://localhost:5000")
    print("=" * 60)
    app.run(host="0.0.0.0", port=5000, debug=True)
