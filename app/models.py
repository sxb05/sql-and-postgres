from .database import Base
from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, text



class Products(Base):
    __tablename__ = "Products"    


    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String, nullable=False)
    price = Column(Integer, nullable=False)
    inventory = Column(Integer, nullable=False)
    published_at = Column(TIMESTAMP(timezone=True), nullable = False, server_default = text('now()'))

class User(Base):
    __tablename__ = "users"    


    id = Column(Integer, primary_key=True, nullable=False)
    email = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), nullable = False, server_default = text('now()'))