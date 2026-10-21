import os
import re
import joblib

_MODEL = None
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "sms_model.pkl")

def _load_model():
    global _MODEL
    if _MODEL is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"SMS model not found at {MODEL_PATH}. Get it from the AI pair."
            )
        _MODEL = joblib.load(MODEL_PATH)
    return _MODEL

# The trained model gives verdict + confidence but can't explain itself,
# so we pair it with simple keyword checks to produce human-readable reasons.
_REASON_RULES = [
    (re.compile(r"\bpin\b|m-?pesa pin", re.I), "Asks for your M-Pesa PIN"),
    (re.compile(r"\botp\b|one.time.pass|verification code", re.I), "Asks for an OTP or verification code"),
    (re.compile(r"urgent|act now|immediately|suspend|expire|24 ?hours?", re.I), "Uses urgency or threat language"),
    (re.compile(r"https?://|bit\.ly|tinyurl|www\.", re.I), "Contains a link"),
    (re.compile(r"won|prize|lottery|congratulations|selected", re.I), "Claims you've won a prize"),
    (re.compile(r"send.*money|deposit|fee|charge.*release", re.I), "Asks you to send money or pay a fee"),
]

def _get_reasons(text, verdict):
    reasons = [label for pattern, label in _REASON_RULES if pattern.search(text)]
    if verdict == "safe" and not reasons:
        return ["No urgency, PIN, OTP, or payment requests detected"]
    if not reasons:
        return ["Flagged by the trained model based on message patterns"]
    return reasons

def predict_sms(text):
    """Returns { verdict: 'safe'|'suspicious'|'scam', confidence: float, reasons: [str] }"""
    model = _load_model()
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
        "reasons": _get_reasons(text, verdict),
    }
