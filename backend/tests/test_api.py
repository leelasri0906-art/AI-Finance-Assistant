import os
import sys
from pathlib import Path

# Set up test environment with local SQLite or test database
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

# Configure environment variables for test
os.environ["SECRET_KEY"] = "test-secret-key-for-unit-testing-32chars"
test_db_path = backend_dir / "test_finance.db"
os.environ["DATABASE_URL"] = f"sqlite:///{test_db_path.as_posix()}"

from fastapi.testclient import TestClient
from app.database import Base, engine
from app.main import app

client = TestClient(app)


def setup_module():
    Base.metadata.create_all(bind=engine)


def teardown_module():
    Base.metadata.drop_all(bind=engine)
    if test_db_path.exists():
        try:
            test_db_path.unlink()
        except Exception:
            pass


def test_health_check():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_auth_and_user_flow():
    # 1. Register User 1
    reg_res = client.post("/api/register", json={
        "name": "Alex Carter",
        "email": "alex@example.com",
        "password": "password123"
    })
    assert reg_res.status_code == 201
    assert "user_id" in reg_res.json()

    # 2. Duplicate registration fails
    dup_res = client.post("/api/register", json={
        "name": "Alex Carter",
        "email": "alex@example.com",
        "password": "password123"
    })
    assert dup_res.status_code == 400

    # 3. Login
    login_res = client.post("/api/login", json={
        "email": "alex@example.com",
        "password": "password123"
    })
    assert login_res.status_code == 200
    token1 = login_res.json()["access_token"]
    headers1 = {"Authorization": f"Bearer {token1}"}

    # 4. Get Profile
    me_res = client.get("/api/me", headers=headers1)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "alex@example.com"

    # 5. Unauthorized access check
    unauth_res = client.get("/api/me")
    assert unauth_res.status_code == 403 or unauth_res.status_code == 401

    # 6. Add Income Transaction
    inc_res = client.post("/api/transactions", headers=headers1, json={
        "description": "Monthly Salary Credit",
        "amount": 75000.0,
        "transaction_type": "Income",
        "transaction_date": "2026-11-01"
    })
    assert inc_res.status_code == 201
    assert inc_res.json()["category"] == "Income"

    # 7. Add Expense Transaction (auto-classify Uber as Transport)
    exp_res = client.post("/api/transactions", headers=headers1, json={
        "description": "uber ride to client meeting",
        "amount": 450.0,
        "transaction_type": "Expense",
        "transaction_date": "2026-11-05"
    })
    assert exp_res.status_code == 201
    assert exp_res.json()["category"] == "Transport"
    tx_id = exp_res.json()["id"]

    # 8. Add Food Expense
    client.post("/api/transactions", headers=headers1, json={
        "description": "swiggy dinner order",
        "amount": 600.0,
        "transaction_type": "Expense",
        "transaction_date": "2026-11-06"
    })

    # 9. Create Budget
    bg_res = client.post("/api/budgets", headers=headers1, json={
        "category": "Transport",
        "amount": 5000.0,
        "month": "2026-11"
    })
    assert bg_res.status_code == 201

    # 10. Check Budgets progress
    bgs_res = client.get("/api/budgets", headers=headers1)
    assert bgs_res.status_code == 200
    b_data = bgs_res.json()[0]
    assert b_data["category"] == "Transport"
    assert b_data["spent"] == 450.0
    assert b_data["remaining"] == 4550.0

    # 11. Check Dashboard
    dash_res = client.get("/api/dashboard", headers=headers1)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["total_income"] == 75000.0
    assert dash_data["total_expenses"] == 1050.0
    assert dash_data["balance"] == 73950.0

    # 12. Check Analytics
    ana_res = client.get("/api/analytics", headers=headers1)
    assert ana_res.status_code == 200
    assert ana_res.json()["average_expense"] == 525.0

    # 13. Check Prediction
    pred_res = client.get("/api/prediction", headers=headers1)
    assert pred_res.status_code == 200
    assert pred_res.json()["has_data"] is True

    # 14. Check Insights
    ins_res = client.get("/api/insights", headers=headers1)
    assert ins_res.status_code == 200
    assert len(ins_res.json()["insights"]) > 0

    # 15. Check Chatbot
    chat_res = client.post("/api/chat", headers=headers1, json={
        "message": "how much did i spend?"
    })
    assert chat_res.status_code == 200
    assert "1,050.00" in chat_res.json()["reply"]

    # 16. Test Multi-tenant isolation: Register User 2
    client.post("/api/register", json={
        "name": "Jordan Smith",
        "email": "jordan@example.com",
        "password": "password456"
    })
    login2 = client.post("/api/login", json={
        "email": "jordan@example.com",
        "password": "password456"
    }).json()
    headers2 = {"Authorization": f"Bearer {login2['access_token']}"}

    # User 2 transactions list should be empty!
    u2_txs = client.get("/api/transactions", headers=headers2).json()
    assert len(u2_txs) == 0

    # User 2 CANNOT delete User 1's transaction
    del_res = client.delete(f"/api/transactions/{tx_id}", headers=headers2)
    assert del_res.status_code == 404

    # User 1 can delete their transaction
    del_res1 = client.delete(f"/api/transactions/{tx_id}", headers=headers1)
    assert del_res1.status_code == 200
