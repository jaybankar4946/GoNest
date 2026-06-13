from fastapi import APIRouter
from app.services.auth import hash_password

router = APIRouter()

@router.post("/register")
def register():
    return {"message": "register endpoint working"}
