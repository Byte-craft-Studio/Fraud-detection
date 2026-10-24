# Fraud Shield — Setup & Run Instructions

This covers everything needed to get the project running from a fresh clone, for anyone on the team joining partway through.

## Project structure

Fraud-detection/
├── frontend/ React + Vite + Tailwind UI (frontend pair)
├── src/ Python ML code (AI pair): predict.py, train.py, train_sms.py
├── models/ trained .pkl files (gitignored, not in git)
├── app.py Streamlit app (optional/backup UI)
├── api_server.py FastAPI wrapper exposing the models as JSON
└── requirements.txt Python dependencies


## Prerequisites
- Python 3.12+ and pip
- Node.js and npm
- The two trained model files (model.pkl, sms_model.pkl) — gitignored, not in the repo. Get them directly from the AI pair and place them in models/.

## Backend setup

cd Fraud-detection
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

Place model files into models/, then run:

uvicorn api_server:app --reload --port 8000

Verify (second terminal):
curl http://localhost:8000/health

## Frontend setup

cd Fraud-detection/frontend
npm install
npm run dev

For phone testing (needed for the PWA share-target feature):
npm run dev -- --host

## API contract

POST /scan
Request:  { "message": "some SMS text" }
Response: { "verdict": "safe|suspicious|scam", "confidence": 0.87, "reasons": ["..."] }

## Common issues already hit

- npm run dev gives 404: frontend/index.html is missing, or you ran the command outside frontend/.
- Port 5173 or 8000 already in use: ss -tlnp | grep 5173 (or 8000), then kill -9 the PID shown, restart.
- git push rejected (fetch first): git fetch origin, then git pull origin main --no-rebase, resolve conflicts, push again.
- /scan returns 503 model not found: the .pkl files aren't in models/ on your machine — get them from the AI pair.
- pip install fails externally-managed-environment: you're not inside the venv — run source venv/bin/activate first.

## Team

- Frontend/UI: this pair — frontend/
- AI/ML: src/, models/, app.py, api_server.py
- Docs/Presentation: pull the architecture and API contract above into slides/writeup — the original Streamlit-only pitch is out of date.
