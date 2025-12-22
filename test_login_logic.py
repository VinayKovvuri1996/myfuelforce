from backend import auth_utils, database
from backend.services.identity import models
from sqlalchemy.orm import Session

# Mock DB Session
db = next(database.get_db())

def test_auth_flow():
    print("--- Testing Auth Flow ---")
    
    # 1. Create a test user
    test_username = "debug_user"
    test_password = "debug_password"
    
    # Check if exists and delete
    existing = db.query(models.User).filter(models.User.username == test_username).first()
    if existing:
        db.delete(existing)
        db.commit()
        
    print(f"Creating user: {test_username} / {test_password}")
    hashed = auth_utils.get_password_hash(test_password)
    print(f"Generated Hash: {hashed}")
    
    user = models.User(
        id="DEBUG001",
        username=test_username,
        email="debug@example.com",
        hashed_password=hashed,
        role="dealer",
        retail_outlet_name="Debug Station",
        phone_number="0000000000"
    )
    db.add(user)
    db.commit()
    
    # 2. Retrieve and Verify
    fetched_user = db.query(models.User).filter(models.User.username == test_username).first()
    print(f"Fetched User Hash: {fetched_user.hashed_password}")
    
    is_valid = auth_utils.verify_password(test_password, fetched_user.hashed_password)
    print(f"Password Verification Result: {is_valid}")
    
    if is_valid:
        print("SUCCESS: Logic is correct.")
    else:
        print("FAILURE: Password mismatch.")

if __name__ == "__main__":
    try:
        test_auth_flow()
    except Exception as e:
        print(f"Error: {e}")
