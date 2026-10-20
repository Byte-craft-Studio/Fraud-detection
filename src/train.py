import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

def train():
    print("1. Loading data...")
    # Load the data
    df = pd.read_csv('data/paysim.csv')
    
    print("2. Filtering data...")
    # Fraud only happens in TRANSFER and CASH_OUT
    df = df[df['type'].isin(['TRANSFER', 'CASH_OUT'])].copy()
    
    print("3. Engineering features...")
    # Create the 'balance error' feature
    df['balance_error_orig'] = df['oldbalanceOrg'] - df['newbalanceOrig'] - df['amount']
    
    # Select only the features Team 2 is using in the Streamlit app
    features = [
        'type', 'amount', 'oldbalanceOrg', 'newbalanceOrig', 
        'oldbalanceDest', 'newbalanceDest', 'balance_error_orig'
    ]
    
    X = df[features]
    y = df['isFraud']
    
    # Convert 'type' from text to numbers (One-Hot Encoding)
    X = pd.get_dummies(X, columns=['type'], drop_first=True)
    
    print("4. Splitting data...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("5. Training Random Forest (This might take 1-2 minutes)...")
    # class_weight='balanced' is CRITICAL because fraud is only 0.13% of the data
    model = RandomForestClassifier(n_estimators=50, class_weight='balanced', random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    
    print("6. Evaluating model...")
    y_pred = model.predict(X_test)
    print(classification_report(y_test, y_pred))
    
    print("7. Saving model...")
    os.makedirs('models', exist_ok=True)
    joblib.dump(model, 'models/model.pkl')
    print("✅ Success! Model saved to models/model.pkl")

if __name__ == "__main__":
    train()