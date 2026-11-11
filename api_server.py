from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ValidationError
from src.predict import predict_sms, predict_mpesa
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fraud-shield")

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


VALID_TX_TYPES = {"PAYMENT", "TRANSFER", "CASH_OUT", "CASH_IN"}


@app.post("/scan")
def scan(req: ScanRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="empty_message")
    try:
        return predict_sms(req.message)
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception:
        logger.exception("Unexpected error in /scan")
        raise HTTPException(status_code=500, detail="internal_error")


@app.post("/scan-transaction")
def scan_transaction(req: TransactionRequest):
    # Known, expected client-input problems -> 400, with a clear reason.
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="amount must be greater than 0")
    if req.tx_type not in VALID_TX_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"tx_type must be one of {sorted(VALID_TX_TYPES)}",
        )

    try:
        return predict_mpesa(
            amount=req.amount,
            old_bal_org=req.old_bal_org,
            new_bal_org=req.new_bal_org,
            old_bal_dest=req.old_bal_dest,
            new_bal_dest=req.new_bal_dest,
            tx_type=req.tx_type,
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception:
        # Anything unexpected here is a real bug, not a bad request --
        # log it fully server-side and tell the client the truth: it's on us.
        logger.exception("Unexpected error in /scan-transaction")
        raise HTTPException(status_code=500, detail="internal_error")


@app.get("/health")
def health():
    status = {"status": "ok", "sms_model": "unknown", "mpesa_model": "unknown"}
    try:
        from src.predict import _load_sms_model
        _load_sms_model()
        status["sms_model"] = "loaded"
    except Exception as e:
        status["sms_model"] = f"error: {e}"
        status["status"] = "degraded"

    try:
        from src.predict import _load_mpesa_model
        _load_mpesa_model()
        status["mpesa_model"] = "loaded"
    except Exception as e:
        status["mpesa_model"] = f"error: {e}"
        status["status"] = "degraded"

    return status
