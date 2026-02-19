from fastapi import Body, FastAPI,HTTPException,status, Depends
from fastapi.params import Body
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from random import randrange
import psycopg
from psycopg.rows import dict_row
import time
import os
from dotenv import load_dotenv
from . import models
from .database import Base, engine, SessionLocal, get_db
from sqlalchemy.orm import Session
from .schemas import Product, ProductOut, User, UserOut

from typing import List

app = FastAPI()
models.Base.metadata.create_all(bind=engine)

# Mount frontend static files (served from app/frontend)
app.mount("/static", StaticFiles(directory="app/frontend"), name="static")




while True:
    try:
        conn = psycopg.connect("dbname=fastapi user=postgres password=12345678" , row_factory=dict_row)
        cur = conn.cursor()
        break
    except Exception as error:
        print("Error") 
        time.sleep(20)    

    
# @app.get("/", response_class=FileResponse)
# async def root():
#     """Serve the frontend single-page application index file."""
#     return FileResponse("app/frontend/index.html")

###############Sends SQL queries to the db while aqlalchemy is an orm will take the python code and talk to the db by converting it to SQL
##############in this method manual creation of tables inpostgres was done while using SQLAlchemy we can build or define a schema for the table using the python code (NoSQL) 




# @app.get("/products")
# def welcome():
#     x = cur.execute("""SELECT * FROM products""").fetchall()
#     return {"data": x}



# @app.post("/products", status_code=status.HTTP_201_CREATED)
# def create_posts(product: Product):
     
#     cur.execute("""INSERT INTO products (name , price, inventory) VALUES (%s, %s, %s) RETURNING id""", (product.name, product.price, product.inventory))
#     new_product = cur.fetchone()
#     conn.commit()
#     return {"data": new_product}





# @app.get("/products/{id}", status_code=status.HTTP_200_OK)
# def get_post(id: int):
#     cur.execute("""SELECT * FROM products WHERE id = %s""",(id,))
#     fet_prod = cur.fetchone()
#     if not fet_prod:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"post with id {id} not found")
#     return {"data": fet_prod}



# @app.delete("/products/{id}",status_code=status.HTTP_204_NO_CONTENT)
# def del_post(id: int):
#     cur.execute("""DELETE FROM products WHERE id = %s returning *""", (id,) )
#     deleted_prod = cur.fetchone()
#     if not deleted_prod: 
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"product with id {id} not found")
#     conn.commit()
    
#     return {"data": f"product with {id} deleted successfully"}

# @app.put("/products/{id}", response_model=Product)
# def update_post(id: int, product: Product):
#     cur.execute("""UPDATE products SET name = %s, price=%s, inventory=%s WHERE id = %s returning id""", (product.name, product.price, product.inventory,id) )
#     updated_prod = cur.fetchone()
#     conn.commit()
#     if not updated_prod:
#          raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"post with id {id} not found")
#     else:
#         return {"data" : "updated sucessfully"}    


######################################### Using SQLAlchemy ################################
## It can be used with any pyhton development env its not only limited to FastAPI###################




@app.get("/products", response_model=List[ProductOut])
def get_products(db: Session = Depends(get_db)):
    product = db.query(models.Products).all()
    return {"data": product}


@app.post("/products", status_code=status.HTTP_201_CREATED, response_model= ProductOut)
def create_products(product: Product, db: Session = Depends(get_db)):
    # new_product = models.Products(name=product.name, price=product.price, inventory=product.inventory)
    new_product = models.Products(**product.dict())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product 

@app.get("/products{id}", response_model=List[ProductOut])
def get_product(id: int, db: Session = Depends(get_db)):
    product = db.query(models.Products).filter(models.Products.id == id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"product with id {id} not found")
    return product




@app.delete("/products/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(id: int, db: Session = Depends(get_db)):
    product = db.query(models.Products).filter(models.Products.id == id)
    if not product.first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"product with id {id} not found")
    product.delete(synchronize_session=False)
    db.commit()
    return { f"product with id {id} deleted successfully"}   


@app.put("/products/{id}", response_model=ProductOut)
def update_product(id: int, product: Product, db: Session = Depends(get_db)):
    product_query = db.query(models.Products).filter(models.Products.id == id)
    if not product_query.first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"product with id {id} not found")
    product_query.update(product.dict(), synchronize_session=False)
    db.commit()
    return { "updated successfully"}



@app.post("/Users", status_code=status.HTTP_201_CREATED, response_model=UserOut)
def create_products(user: User, db: Session = Depends(get_db)):
    # new_product = models.Products(name=product.name, price=product.price, inventory=product.inventory)
    new_user = models.User(**user.dict())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user 














