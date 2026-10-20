from datasets import load_dataset
import pandas as pd
import os

print("Downloading dataset from Hugging Face...")
ds = load_dataset("electricsheepafrica/africa-smishing", split="train")
df_hf = ds.to_pandas()

# Rename columns to match our format
df_hf = df_hf[['sms_text', 'label']].rename(columns={'sms_text': 'text'})
df_hf = df_hf.reset_index(drop=True)

print("Adding Kenyan and Safaricom specific examples...")

# 1. Existing Kenyan Scams (NTSA, Equity, KRA, M-Pesa)
kenyan_scams = [
    "[NTSA] Warning: You have multiple outstanding traffic fines. Please take immediate action or you may face legal action and late fees.",
    "You have an unpaid instant fine. Pay now to avoid a court summons. Click here: ntsca.cc",
    "Dear customer, your Equity Bank account has been flagged for suspicious activity. Verify your details immediately to avoid suspension: equty-verify.co/ke",
    "Your account has been BLOCKED. Call 0763 000 000 to reactivate immediately.",
    "You have principal tax due as of 31.12.2023. Kindly clear by 30.06.2025 for 100% waiver of penalty & interest. Call 0711099999. T&Cs apply.",
    "Our records indicate that you owe principal tax of Sh5434.35 as at 31/12/2023. Please settle by 30/06/2025 to enjoy 100% waiver.",
    "Your M-Pesa account has been suspended. Click bit.ly/fake to verify.",
    "Fuliza limit yako inaweza kupanda hadi 50,000. Tuma KES 300 kwa Till 889XXX for activation.",
    "Bonga points zako (10,500) zina-expire leo saa sita usiku. Click hapa kuredeem kwa cash haraka: bit.ly/bonga-redeem",
    "Your OTP is 4839. Do not share with anyone.",
    "You have received 500 KES from JOHN DOE. New balance is 1500 KES.",
    "Dear customer, your airtime purchase of 100 KES was successful."
]

# 2. Safaricom Official Fraud Awareness Examples
safaricom_awareness = [
    # Fake Recipient Script
    "Tuma kwa hii number ile ingine ikona shida",
    "Please send the money to this other number, my line has a problem",
    
    # False Emergency
    "Niko hospital na accident, tuma pesa haraka kwa hii number ya daktari",
    "I am in trouble, please send me money immediately to this number",
    
    # Fake Jobs / Promotions
    "Hongera! Umepata kazi ya mtandaoni. Tuma 500 ya registration kwa hii number",
    "Congratulations, you have won a job placement. Send processing fee to activate",
    
    # Fake Safaricom Representatives
    "Habari, hii ni Safaricom. Tafadhali toa PIN yako ili tufanye upgrade ya line yako",
    "This is Safaricom customer care. Your line will be disconnected, please confirm your ID number now"
]

# Combine all custom lists
all_custom_scams = kenyan_scams + safaricom_awareness
df_custom = pd.DataFrame(all_custom_scams, columns=['text'])

# Assign labels: 
# The first 9 in kenyan_scams are SCAMS (1)
# The last 3 in kenyan_scams are SAFE (0)
# ALL Safaricom awareness examples are SCAMS (1)
labels = [1] * 9 + [0] * 3 + [1] * len(safaricom_awareness)
df_custom['label'] = labels
df_custom = df_custom.reset_index(drop=True)

print(f"Added {len(df_custom)} custom Kenyan/Safaricom examples.")

print("Combining datasets...")
df_final = pd.concat([df_hf, df_custom], ignore_index=True)

os.makedirs('data', exist_ok=True)
df_final.to_csv('data/sms_dataset.csv', index=False)
print(f"✅ Success! Saved {len(df_final)} messages to data/sms_dataset.csv")