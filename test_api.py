from fastapi.testclient import TestClient
from api_server import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["sms_model"] == "loaded"
    assert data["mpesa_model"] == "loaded"

def test_scan_transaction_rejects_non_positive_amount():
    response = client.post("/scan-transaction", json={
        "amount": -5,
        "old_bal_org": 100,
        "new_bal_org": 90,
    })
    assert response.status_code == 400
    assert "amount" in response.json()["detail"]


def test_scan_transaction_rejects_invalid_tx_type():
    response = client.post("/scan-transaction", json={
        "amount": 100,
        "old_bal_org": 1000,
        "new_bal_org": 900,
        "tx_type": "NOT_A_REAL_TYPE",
    })
    assert response.status_code == 400
    assert "tx_type" in response.json()["detail"]

def test_scan_endpoint():
    response = client.post("/scan", json={"message": "Congratulations you won a free phone"})
    assert response.status_code == 200
    data = response.json()
    assert "verdict" in data
    assert data["verdict"] in ["safe", "suspicious", "scam"]

def test_scan_transaction_endpoint():
    response = client.post("/scan-transaction", json={
        "amount": 5000,
        "old_bal_org": 10000,
        "new_bal_org": 5000,
        "old_bal_dest": 0.0,
        "new_bal_dest": 5000.0,
        "tx_type": "PAYMENT"
    })
    assert response.status_code == 200
    data = response.json()
    assert "verdict" in data
