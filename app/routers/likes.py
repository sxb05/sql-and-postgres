from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..oauth2 import get_current_user
from .. import models
from ..schemas import Like
router = APIRouter(
    prefix="/like",
    tags=["like"]
)

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_like(like: Like, db: Session = Depends(get_db), get_currentuser: int = Depends(get_current_user)):
    like_query = db.query(models.Like).filter(models.Like.prod_id == like.prod_id, models.Like.user_id == get_currentuser.id)
    found_like = like_query.first()
    if (like.dir == 1):
        if found_like:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"user {get_currentuser.id} has already liked this product")
        new_like = models.Like(prod_id = like.prod_id, user_id = get_currentuser.id)
        db.add(new_like)
        db.commit()
        return {"message": "successfully liked this product"}   
    else:
        if not found_like:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"like does not exist")
        like_query.delete(synchronize_session=False)
        db.commit()
        return {"message": "successfully unliked this product"}

