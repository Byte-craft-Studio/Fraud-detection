import joblib
import pandas as pd
import os

# Load models once so the app is fast
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'model.pkl')
SMS_MODEL_PATH = os.path.join(BASE_DIR, 'models', 'sms_model.pkl')

mpesa_model = joblib.load(MODEL_PATH)
sms_model = joblib.load(SMS_MODEL_PATH)

def predict_mpesa(amount, old_bal_org, new_bal_org, old_bal_dest, new_bal_dest, tx_type):
    # 1. Feature Engineering (Exactly as you trained it)
    balance_error = old_bal_org - new_bal_org - amount
    
    input_data = pd.DataFrame([{
        'type': tx_type,
        'amount': amount,
        'oldbalanceOrg': old_bal_org,
        'newbalanceOrig': new_bal_org,
        'oldbalanceDest': old_bal_dest,
        'newbalanceDest': new_bal_dest,
        'balance_error_orig': balance_error
    }])
    
    # 2. Pre-process (One-Hot Encoding)
    input_data = pd.get_dummies(input_data, columns=['type'], drop_first=True)
    
    # 3. Predict
    pred = mpesa_model.predict(input_data)[0]
    prob = mpesa_model.predict_proba(input_data)[0]
    
    # 4. Build JSON response
    if pred == 1:
        return {
            "verdict": "scam",
            "confidence": round(float(prob[1]), 4),
            "reasons": ["High transfer amount", f"Balance mismatch: {balance_error}"]
        }
    else:
        return {
            "verdict": "safe",
            "confidence": round(float(prob[0]), 4),
            "reasons": ["No balance anomalies detected"]
        }

def predict_sms(text):
    pred = sms_model.predict([text])[0]
    prob = sms_model.predict_proba([text])[0]
    
    if pred == 1:
        return {
            "verdict": "scam",
            "confidence": round(float(prob[1]), 4),
            "reasons": ["Contains scam keywords or links", "Matches known Kenyan phishing patterns"]
        }
    else:
        return {
            "verdict": "safe",
            "confidence": round(float(prob[0]), 4),
            "reasons": ["No suspicious links or keywords found"]
        }