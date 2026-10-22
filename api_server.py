from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from src.predict import predict_sms

app = FastAPI(title="Fraud Shield API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # fine for a hackathon demo
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScanRequest(BaseModel):
    message: str

@app.post("/scan")
def scan(req: ScanRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="empty_message")
    try:
        return predict_sms(req.message)
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok"}
