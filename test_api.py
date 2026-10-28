from fastapi.testclient import TestClient
from api_server import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

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