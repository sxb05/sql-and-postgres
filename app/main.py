from fastapi import Body, FastAPI,HTTPException,status
from fastapi.params import Body
from pydantic import BaseModel
from random import randrange
import psycopg
from psycopg.rows import dict_row
import time
import os
from dotenv import load_dotenv


app = FastAPI()

class  Post(BaseModel):
    name: str
    inventory: int
    price: int

while True:
    try:
        conn = psycopg.connect("dbname=fastapi user=postgres password=12345678" , row_factory=dict_row)
        cur = conn.cursor()
        break
    except Exception as error:
        print("Error") 
        time.sleep(20)    

    
@app.get("/")
async def root():                        #async keyword is used to perform task asyncronously
    return "hi++"                        #pydantic has nothing to do with fastapi it is usally used to define a shcemea



@app.get("/products")
def welcome():
    x = cur.execute("""SELECT * FROM products""").fetchall()
    return {"data": x}




@app.post("/products", status_code=status.HTTP_201_CREATED)
def create_posts(product: Post):
     
    cur.execute("""INSERT INTO products (name , price, inventory) VALUES (%s, %s, %s) RETURNING id""", (product.name, product.price, product.inventory))
    new_product = cur.fetchone()
    conn.commit()
    return {"data": new_product}





@app.get("/posts/{id}", status_code=status.HTTP_200_OK)
def get_post(id: int):
    cur.execute("""SELECT * FROM products WHERE id = %s""",(id,))
    fet_prod = cur.fetchone()
    if not fet_prod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"post with id {id} not found")
    return {"data": fet_prod}



@app.delete("/posts/{id}",status_code=status.HTTP_204_NO_CONTENT)
def del_post(id: int):
    cur.execute("""DELETE FROM products WHERE id = %s returning *""", (id,) )
    deleted_prod = cur.fetchone()
    if not deleted_prod: 
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"product with id {id} not found")
    conn.commit()
    
    return {"data": f"product with {id} deleted successfully"}

@app.put("/posts/{id}")
def update_post(id: int, product: Post):
    cur.execute("""UPDATE products SET name = %s, price=%s, inventory=%s WHERE id = %s returning id""", (product.name, product.price, product.inventory,id) )
    updated_prod = cur.fetchone()
    conn.commit()
    if not updated_prod:
         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"post with id {id} not found")
    else:
        return {"data" : "updated sucessfully"}    






