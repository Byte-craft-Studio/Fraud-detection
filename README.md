# Fraud Shield — AI-Powered Fraud Detection for Kenya

**Hackathon Project:** detects scam SMS/WhatsApp messages and suspicious M-Pesa transactions before they cause harm.

## The Problem
Scam messages impersonating M-Pesa, loan apps, and prize notifications are a widespread, everyday risk in Kenya. Most people have no quick way to check whether a message is real before they act on it.

## The Solution
Paste a message, get an instant verdict — Safe / Suspicious / Likely Scam — with plain-language reasons, not just a label. A separate transaction classifier flags suspicious M-Pesa transfers using balance-anomaly detection.

## Architecture
- **Frontend:** React + Vite + Tailwind, installable as a PWA with Android share-target support
- **API:** FastAPI (`api_server.py`) wrapping two trained models
- **SMS model:** TF-IDF + Multinomial Naive Bayes, trained on labeled SMS data (Swahili/Sheng-aware)
- **Transaction model:** Random Forest, trained on the PaySim dataset, flags balance anomalies on M-Pesa-style transfers

## Tech Stack
React, Vite, Tailwind CSS, FastAPI, Python, Scikit-learn, Pandas

## How to Run Locally
**Backend:**
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn api_server:app --reload --port 8000


**Frontend:**

cd frontend
npm install
npm run dev

