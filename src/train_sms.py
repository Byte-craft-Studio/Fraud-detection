import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
import joblib
import os

def train_sms():
    print("Training SMS Scam Model...")
    df = pd.read_csv('data/sms_dataset.csv')
    
    # Create a pipeline: TF-IDF converts text to numbers, Naive Bayes classifies
    model = Pipeline([
        ('tfidf', TfidfVectorizer(stop_words='english', lowercase=True)),
        ('clf', MultinomialNB())
    ])
    
    model.fit(df['text'], df['label'])
    
    os.makedirs('models', exist_ok=True)
    joblib.dump(model, 'models/sms_model.pkl')
    print("✅ Success! SMS model saved to models/sms_model.pkl")

if __name__ == "__main__":
    train_sms()