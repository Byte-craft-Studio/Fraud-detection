from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from src.predict import predict_sms, predict_mpesa

app = FastAPI(title="Fraud Shield API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # fine for a hackathon demo
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScanRequest(BaseModel):
    message: str

class TransactionRequest(BaseModel):
    amount: float
    old_bal_org: float
    new_bal_org: float
    old_bal_dest: float = 0.0
    new_bal_dest: float = 0.0
    tx_type: str = "PAYMENT"

@app.post("/scan")
def scan(req: ScanRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="empty_message")
    try:
        return predict_sms(req.message)
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))

@app.post("/scan-transaction")
def scan_transaction(req: TransactionRequest):
    try:
        return predict_mpesa(
            amount=req.amount,
            old_bal_org=req.old_bal_org,
            new_bal_org=req.new_bal_org,
            old_bal_dest=req.old_bal_dest,
            new_bal_dest=req.new_bal_dest,
            tx_type=req.tx_type
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok"}