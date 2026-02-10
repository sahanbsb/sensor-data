# Sensor Data Dashboard

Lightweight hobby project to collect data from a sensor, store/forward it via a small server, and visualise readings in a simple dashboard.

## Overview

This repository contains three parts:

- `sensor/` — PlatformIO project for the sensor firmware (reads sensor and sends data to the server).
- `server/` — Minimal Python script to receive sensor data and persist or forward it.
- `dashboard/` — Static web dashboard showing sensor readings (HTML + JS).

## Repository structure

- `dashboard/` — `index.html` and related frontend assets.
- `sensor/TempSensorUpload/` — PlatformIO firmware project (see `platformio.ini`).
- `server/` — `script.py` server receiving sensor posts and serving an API.

## Prerequisites

- Python 3.8+ (for the server and for serving the dashboard locally).
- PlatformIO (for building & uploading firmware to the sensor board).
- A modern browser to open the dashboard.

## Setup & Run

1) Sensor (build and upload)

   - Open the PlatformIO project in `sensor/TempSensorUpload/` and build/upload following your board's instructions.

   Example (in the `sensor/TempSensorUpload/` folder):

```bash
platformio run
platformio run -t upload
```

2) Server (receive sensor data)

   - Run the Python server from the repository root.

```bash
python server/script.py
```

   - If the server has external dependencies, create a virtual environment and install them first (if a `requirements.txt` is added later):

```bash
python -m venv .venv
.\.venv\Scripts\activate   # Windows
pip install -r server/requirements.txt  # optional
```

3) Dashboard (viewing data)

   - The dashboard is static. Either open `dashboard/index.html` directly in a browser or serve it with a simple HTTP server to avoid CORS/file restrictions:

```bash
python -m http.server 8000 --directory dashboard
# then open http://localhost:8000
```

## Data format

Sensors should POST JSON to the server. Example payload the server expects:

```json
{
  "device_id": "temp-sensor-01",
  "timestamp": "2026-02-11T12:34:56Z",
  "temperature_c": 22.5,
  "humidity_pct": 45.2
}
```

Adjust keys to match your firmware; update `server/script.py` and the dashboard accordingly.

## End-to-end workflow

1. Build & upload firmware from `sensor/TempSensorUpload/`.
2. Start `server/script.py` to receive sensor data.
3. Serve or open the dashboard in your browser and confirm it fetches the stored/readings from the server API.

## Troubleshooting

- If the dashboard shows no data, check that the sensor is successfully POSTing to the server (network address/port).
- If the sensor build fails, confirm PlatformIO environment and board settings in `sensor/TempSensorUpload/platformio.ini`.
- If Python refuses to bind the port, ensure no other process uses it or change the port in `server/script.py`.

## Contributing

Feel free to open issues or submit PRs. Useful contributions:

- Add a `requirements.txt` for the server.
- Improve the dashboard visualisation and add charts.
- Add a persistence layer (lightweight DB) to `server/`.

## License

This hobby project is provided as-is. Add a license file if you want to make usage terms explicit.

---

