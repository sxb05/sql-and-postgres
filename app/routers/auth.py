from fastapi import APIRouter, FastAPI, HTTPException, status, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models
from ..schemas import LoginOut, Login
from ..utils import verify_password
from.. import oauth2
router = APIRouter(tags=["auth"])


@router.post("/login")
def login(log_cred: Login, db: Session = Depends(get_db), response_model = LoginOut):
    user_login = db.query(models.User).filter(models.User.email == log_cred.email).first()
    if not user_login:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"user with email {log_cred.email} not found")
    if not verify_password(log_cred.password, user_login.password):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"invalid password")

    access_token = oauth2.create_access_token(data={"user_id": user_login.id})
    # user_login.access_token = access_token
    
    return {"access_token": access_token, "token_type": "bearer", "user_id": user_login.id, "email": user_login.email, "created_at": user_login.created_at}