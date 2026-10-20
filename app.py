import streamlit as st
import pandas as pd
import joblib
import os

st.set_page_config(page_title="Fraud Detection System", layout="centered")
st.title("🛡️ Kenya Fraud Detection Hub")

# Create Two Tabs
tab1, tab2 = st.tabs(["💸 M-Pesa Transaction", "📱 SMS Scanner"])

# --- TAB 1: TRANSACTION ---
with tab1:
    st.header("Check Transaction Fraud")
    # (Paste Team 2's existing M-Pesa form logic here)
    st.write("Existing form goes here...")

# --- TAB 2: SMS SCANNER ---
with tab2:
    st.header("Scan Suspicious SMS")
    st.write("Paste a text message below to check if it's a scam.")
    
    sms_input = st.text_area("Paste SMS here:")
    
    if st.button("Scan SMS"):
        if sms_input.strip() == "":
            st.warning("Please enter an SMS.")
        else:
            # Load the SMS model
            model_path = "models/sms_model.pkl"
            if os.path.exists(model_path):
                sms_model = joblib.load(model_path)
                
                # Predict
                pred = sms_model.predict([sms_input])[0]
                prob = sms_model.predict_proba([sms_input])[0][1]
                
                if pred == 1:
                    st.error(f"🚨 SCAM DETECTED! (Confidence: {prob:.1%})")
                    st.write("Do not click any links or share your PIN.")
                else:
                    st.success(f"✅ Looks Safe. (Confidence: {1-prob:.1%})")
            else:
                st.error("Model not loaded. Run train_sms.py first.")