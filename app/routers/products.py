from ..schemas import  User, UserOut
from fastapi import Body, FastAPI,HTTPException,status, Depends, APIRouter
from sqlalchemy.orm import Session
from ..database import Base, engine, SessionLocal, get_db
from typing import List
from ..schemas import Product, ProductOut
from .. import models
from ..oauth2 import get_current_user
router = APIRouter(

    prefix="/products",
    tags=["products"]
)












#@router = FastAPI()
# models.Base.metadata.create_all(bind=engine)

# # Mount frontend static files (served from@router/frontend)
# #@router.mount("/static", StaticFiles(directory=@router/frontend"), name="static")




# while True:
#     try:
#         conn = psycopg.connect("dbname=fastapi user=postgres password=12345678" , row_factory=dict_row)
#         cur = conn.cursor()
#         break
#     except Exception as error:
#         print("Error") 
#         time.sleep(20)    

@router.get("/", response_model=List[ProductOut])
def get_products(db: Session = Depends(get_db)):
    all_product = db.query(models.Products).all()
    return  all_product


@router.post("/", status_code=status.HTTP_201_CREATED, response_model= ProductOut)
def create_products(product: Product, db: Session = Depends(get_db), get_current_user: int = Depends(get_current_user)):
    # new_product = models.Products(name=product.name, price=product.price, inventory=product.inventory)
    new_product = models.Products(**product.dict())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product 

@router.get("/{id}", response_model=List[ProductOut])
def get_product(id: int, db: Session = Depends(get_db)):
    product = db.query(models.Products).filter(models.Products.id == id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"product with id {id} not found")
    return product




@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(id: int, db: Session = Depends(get_db)):
    product = db.query(models.Products).filter(models.Products.id == id)
    if not product.first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"product with id {id} not found")
    product.delete(synchronize_session=False)
    db.commit()
    return { f"product with id {id} deleted successfully"}   


@router.put("/{id}", response_model=ProductOut)
def update_product(id: int, product: Product, db: Session = Depends(get_db)):
    product_query = db.query(models.Products).filter(models.Products.id == id)
    if not product_query.first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"product with id {id} not found")
    product_query.update(product.dict(), synchronize_session=False)
    db.commit()
    return { "updated successfully"}