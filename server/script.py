from flask import Flask, request, jsonify
import csv
import datetime
import os

app = Flask(__name__)

# --- CONFIGURATION ---
API_KEY = "super-secret-api-key"  # Change this!
CSV_FILE = "/var/www/your.domain/sensordata/sensor_data.csv"

def init_csv():
    if not os.path.exists(CSV_FILE):
        with open(CSV_FILE, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(["Timestamp", "Temperature", "Humidity"])

@app.route('/update-sensor', methods=['POST'])
def update_sensor():
    provided_key = request.headers.get("X-API-Key")
    if provided_key != API_KEY:
        return jsonify({"error": "Unauthorized"}), 403

    # Use silent=True to prevent a 400 error if parsing fails
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "No JSON received"}), 400

    temp = data.get("temp")
    hum = data.get("hum")

    # Double check we have actual numbers
    try:
        temp = float(temp)
        hum = float(hum)
    except (TypeError, ValueError):
        return jsonify({"error": "Data is not numeric"}), 400

    with open(CSV_FILE, 'a', newline='') as f:
        writer = csv.writer(f)
        # Use ISO format for best compatibility with JavaScript
        timestamp = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        writer.writerow([timestamp, temp, hum])

    return jsonify({"status": "success"}), 200

if __name__ == "__main__":
    init_csv()
    # Run on localhost; Caddy will proxy to port 5000
    app.run(host='127.0.0.1', port=5000)
