from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/health')
def health_check():
    return jsonify({"status": "ok", "message": "Backend API is running"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)