from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ... import database, auth_utils
from . import models, schemas
from datetime import timedelta
import random
import string

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = auth_utils.jwt.decode(token, auth_utils.SECRET_KEY, algorithms=[auth_utils.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except auth_utils.JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

def generate_user_id(outlet_name: str) -> str:
    # Get first letter of each word in outlet name
    words = outlet_name.split()
    acronym = "".join([word[0].upper() for word in words if word])
    
    # Generate 4 random alphanumeric characters
    random_chars = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    
    return f"{acronym}{random_chars}"

@router.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    if db.query(models.User).filter(models.User.phone_number == user.phone_number).first():
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    hashed_password = auth_utils.get_password_hash(user.password)
    
    # Generate Custom ID
    custom_id = generate_user_id(user.retail_outlet_name)
    
    # Ensure ID is unique (simple check, could be improved)
    while db.query(models.User).filter(models.User.id == custom_id).first():
        custom_id = generate_user_id(user.retail_outlet_name)

    new_user = models.User(
        id=custom_id,
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role,
        retail_outlet_name=user.retail_outlet_name,
        home_address=user.home_address,
        state=user.state,
        city=user.city,
        district=user.district,
        mandal=user.mandal,
        village=user.village,
        zipcode=user.zipcode,
        phone_number=user.phone_number,
        contact_person=user.contact_person,
        supervisor=user.supervisor
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth_utils.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth_utils.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_utils.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
