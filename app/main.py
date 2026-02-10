from fastapi import Body, FastAPI,HTTPException,status
from fastapi.params import Body
from pydantic import BaseModel
from random import randrange
app = FastAPI()

class  Post(BaseModel):
    name: str
    description: str
    price: int

my_data = [
    {
    "name": "laptop",
    "id": 1,
    "description": "this is a laptop",
    "price": 50000
   } ,{
        "id": 2,
    "name": "subash",
    "description": "person",
    "price": 1500
  }
]

@app.get("/")
async def root():                     #async keyword is used to perform task asyncronously
    return "hi++"                     #pydantic has nothing to do with fastapi it is usally used to define a shcemea



@app.get("/posts")
def welcome():
    return {"data": my_data}




@app.post("/posts", status_code=status.HTTP_201_CREATED)
def create_posts(payload: Post):
     
     data_dict = payload.dict()
     data_dict["id"] = randrange(0, 100000000)
     my_data.append(data_dict)

     return {"data": data_dict}





@app.get("/posts/{id}")
def get_post(id: int):
    print(id)
    return {id}



@app.delete("/posts{id}",status_code = status.HTTP_204_NO_CONTENT)
def del_post(id: int):
    for i, p in enumerate(my_data):
        if p["id"] == id:
            del my_data[i]
            break
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"post with id {id} not found")
    return my_data

@app.put("/posts/{id}")
def update_post(id: int, payload: Post):
    for i, p in enumerate(my_data):
        if p["id"] == id:
            posts_dict = payload.dict()
            posts_dict["id"] = id
            my_data[i] = posts_dict
            return my_data[i]
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"post with id {id} not found")
                






