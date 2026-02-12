from database import Base
from sqlalchemy import Coloumn, Integer, String, Boolean



class Products(Base):
    __tablename__ = "Products"    


    id = Coloumn(Integer, primary_key=True, nullable=False)
    name = Coloumn(String, nullable=False)
    price = Coloumn(Integer, nullable=False)
    inventory = Coloumn(Integer, nullable=False)
    published_at = Coloumn(Boolean, default=True)