import os
import logging
from flask import Flask, render_template, request, jsonify

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET")

@app.route("/")
def index():
    """Render the main page."""
    return render_template("index.html")

@app.route("/analyze", methods=["POST"])
def analyze():
    """
    API endpoint to analyze police report text.
    This provides server-side processing capabilities for future enhancements.
    """
    try:
        report_text = request.json.get("text", "")
        
        # Basic validation
        if not report_text:
            return jsonify({"error": "O texto do relatório é obrigatório"}), 400
            
        # Extract data - using the same logic as in the JS file
        # This provides a server-side backup and could be enhanced with more complex analysis
        results = {}
        
        # Location detection
        if "MUANÁ" in report_text:
            results["local"] = "MUANÁ"
        elif "PONTA DE PEDRAS" in report_text:
            results["local"] = "PONTA DE PEDRAS"
        else:
            results["local"] = "NÃO IDENTIFICADO"
            
        # Return the extracted data
        return jsonify({"success": True, "data": results})
        
    except Exception as e:
        logging.error(f"Error processing report: {str(e)}")
        return jsonify({"error": "Ocorreu um erro ao processar o relatório"}), 500

# Run the app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
