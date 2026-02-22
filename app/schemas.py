from pydantic import BaseModel, EmailStr, conint
from typing import Annotated

from datetime import datetime

class  Product(BaseModel):
    name: str
    inventory: int
    price: int

class ProductOut(BaseModel):
    id: int
    name: str
    inventory: int
    price: int
    owner_id: int
    owner: UserOut
class User(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime

class Login(BaseModel):
    email: EmailStr
    password: str

class LoginOut(BaseModel): 
    id: int
    email: EmailStr
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: int | None = None

class Like(BaseModel):
    prod_id: int
    dir: Annotated[int, conint(ge=0, le=1)]
class Config:
    orm_mode = True