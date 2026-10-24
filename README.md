# Fraud Detection 🚨

**Live Demo:** [LIVE_STREAMLIT_APP_URL]  
**GitHub Repo:** [GITHUB_REPO_URL]  
**Hackathon:** Inter-University Hackathon 2026

---

## 📌 The Problem

Mobile money fraud is one of Kenya's most pressing cyber threats. According to INTERPOL's African Cyberthreat Assessment Report 2026:
- SIM swap fraud surged by **327%** in Kenya in 2025.
- Over **123,000 fraudulent SIM cards** were issued.
- An estimated **USD 3.8 million** was drained from mobile wallets.
- **54% of Kenyans** have experienced mobile money fraud (GeoPoll).
- **Sh29.9 billion** lost to cybercrime between July and September 2025 alone.

Current fraud detection systems are **reactive** and **enterprise-focused**. Ordinary Kenyans have no accessible, privacy-preserving tool to verify transactions locally.

---

## 💡 Our Solution

We built a **lightweight, privacy-preserving machine learning web app** that predicts whether a mobile money transaction is likely to be fraudulent **before** it is finalized. Users enter transaction details (amount, sender/receiver balances) and the app instantly returns a fraud risk assessment.

**Key features:**
- Real-time prediction using a trained Random Forest model.
- Processes data **locally** – no financial data leaves the user's browser.
- Mobile-friendly interface built with Streamlit.
- Achieves **near-perfect detection** on the PaySim test set.

---

## 🛠 Tech Stack

| Component | Technology |
|-----------|------------|
| Language | Python 3.9+ |
| Data Processing | Pandas, NumPy |
| Machine Learning | Scikit-learn (Random Forest) |
| Model Persistence | Joblib |
| Frontend / App | Streamlit |
| Deployment | Streamlit Community Cloud |

---

## 🚀 How to Run Locally

1. **Clone the repo:**
   ```bash
   git clone [GITHUB_REPO_URL]
   cd Fraud-detection