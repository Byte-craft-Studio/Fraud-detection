import os
import re
import joblib
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MPESA_MODEL_PATH = os.path.join(BASE_DIR, "models", "model.pkl")
SMS_MODEL_PATH = os.path.join(BASE_DIR, "models", "sms_model.pkl")

_mpesa_model = None
_sms_model = None


def _load_mpesa_model():
    global _mpesa_model
    if _mpesa_model is None:
        if not os.path.exists(MPESA_MODEL_PATH):
            raise FileNotFoundError(f"M-Pesa model not found at {MPESA_MODEL_PATH}.")
        _mpesa_model = joblib.load(MPESA_MODEL_PATH)
    return _mpesa_model


def _load_sms_model():
    global _sms_model
    if _sms_model is None:
        if not os.path.exists(SMS_MODEL_PATH):
            raise FileNotFoundError(f"SMS model not found at {SMS_MODEL_PATH}.")
        _sms_model = joblib.load(SMS_MODEL_PATH)
    return _sms_model


def predict_mpesa(amount, old_bal_org, new_bal_org, old_bal_dest, new_bal_dest, tx_type):
    model = _load_mpesa_model()
    balance_error = old_bal_org - new_bal_org - amount

    input_data = pd.DataFrame([{
        "type": tx_type,
        "amount": amount,
        "oldbalanceOrg": old_bal_org,
        "newbalanceOrig": new_bal_org,
        "oldbalanceDest": old_bal_dest,
        "newbalanceDest": new_bal_dest,
        "balance_error_orig": balance_error,
    }])
    input_data = pd.get_dummies(input_data, columns=["type"], drop_first=True)

    # Align columns with what the model was trained on
    if hasattr(model, "feature_names_in_"):
        input_data = input_data.reindex(columns=model.feature_names_in_, fill_value=0)

    pred = model.predict(input_data)[0]
    prob = model.predict_proba(input_data)[0]

    if pred == 1:
        return {
            "verdict": "scam",
            "confidence": round(float(prob[1]), 2),
            "reasons": ["High transfer amount", f"Balance mismatch: {balance_error}"],
        }
    return {
        "verdict": "safe",
        "confidence": round(float(prob[0]), 2),
        "reasons": ["No balance anomalies detected"],
    }


# The SMS model gives verdict + confidence but can't explain itself,
# so we pair it with simple keyword checks to produce human-readable reasons.
_REASON_RULES = [
    (re.compile(r"\bpin\b|m-?pesa pin", re.I), "Asks for your M-Pesa PIN"),
    (re.compile(r"\botp\b|one.time.pass|verification code", re.I), "Asks for an OTP or verification code"),
    (re.compile(r"urgent|act now|immediately|expire|24 ?hours?", re.I), "Uses urgency or threat language"),
    (re.compile(r"suspend|block|deactivat|freeze", re.I), "Threatens to suspend, block, or freeze your account"),
    (re.compile(r"https?://|bit\.ly|tinyurl|www\.", re.I), "Contains a link"),
    (re.compile(r"won|prize|lottery|congratulations|selected", re.I), "Claims you've won a prize"),
    (re.compile(r"send.*money|deposit|fee|charge.*release", re.I), "Asks you to send money or pay a fee"),
    (re.compile(r"safaricom|m-?pesa (customer care|support)|kra\b|central bank", re.I), "Claims to be from a known company, bank, or government agency"),
    (re.compile(r"confirm (your|the) (account|details|identity)|update (your|the) (details|information|account)|verify (your|the) (account|identity)", re.I), "Asks you to confirm or update account details"),
    (re.compile(r"click (here|below|the link)|tap (here|below)", re.I), "Pressures you to click or tap immediately"),
]


def _get_reasons(text, verdict, confidence=None):
    reasons = [label for pattern, label in _REASON_RULES if pattern.search(text)]
    if verdict == "safe" and not reasons:
        return ["No urgency, PIN, OTP, or payment requests detected"]
    if not reasons:
        if confidence is not None:
            pct = round(confidence * 100)
            return [
                f"The trained model rates this {pct}% likely to be a scam based on "
                f"overall wording and structure, though it doesn't match any of our "
                f"known red-flag phrases specifically"
            ]
        return ["Flagged by the trained model based on overall message patterns"]
    return reasons


def predict_sms(text):
    """Returns { verdict: 'safe'|'suspicious'|'scam', confidence: float, reasons: [str] }"""
    model = _load_sms_model()
    pred = model.predict([text])[0]
    prob_scam = model.predict_proba([text])[0][1]

    if pred == 1 and prob_scam >= 0.75:
        verdict, confidence = "scam", prob_scam
    elif pred == 1 or prob_scam >= 0.45:
        verdict, confidence = "suspicious", prob_scam
    else:
        verdict, confidence = "safe", 1 - prob_scam

    return {
        "verdict": verdict,
        "confidence": round(float(confidence), 2),
        "reasons": _get_reasons(text, verdict, confidence),
    }
