from fastapi import Body, FastAPI
from random import randrange
import time
import os
from dotenv import load_dotenv
from . import models
from .database import engine
from .utils import hash_password
from .routers import products, user, auth, likes
from .config import Settings

app = FastAPI()
models.Base.metadata.create_all(bind=engine)


app.include_router(products.router)
app.include_router(user.router)
app.include_router(auth.router)
app.include_router(likes.router)
















                                                                                                                                                                                                                                                                                    # Mount frontend static files (served from app/frontend)
                                                                                                                                                                                                                                                                                    # app.mount("/static", StaticFiles(directory="app/frontend"), name="static")






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














