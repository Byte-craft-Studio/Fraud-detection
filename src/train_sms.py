import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
import joblib
import os

def train_sms():
    print("1. Loading SMS dataset...")
    # Make sure the path is correct
    df = pd.read_csv('data/sms_dataset.csv')
    
    # Drop any empty rows just in case
    df = df.dropna(subset=['text', 'label'])
    
    print(f"2. Training on {len(df)} messages...")
    
    # Create a pipeline: TF-IDF converts text to numbers, Naive Bayes classifies
    model = Pipeline([
        # CRITICAL FIX: Removed stop_words='english' so it doesn't ignore Swahili/Sheng words like 'yako', 'pesa', 'tuma'
        ('tfidf', TfidfVectorizer(lowercase=True)),
        ('clf', MultinomialNB())
    ])
    
    model.fit(df['text'], df['label'])
    
    os.makedirs('models', exist_ok=True)
    joblib.dump(model, 'models/sms_model.pkl')
    print("✅ Success! SMS model saved to models/sms_model.pkl")

if __name__ == "__main__":
    train_sms()