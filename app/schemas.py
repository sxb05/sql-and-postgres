from pydantic import BaseModel, EmailStr
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

    
class Config:
    orm_mode = True