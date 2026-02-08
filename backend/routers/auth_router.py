from fastapi import APIRouter, HTTPException
from datetime import datetime
from config.database import get_db
from schemas.user import UserCreate
from services.auth_service import create_token
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
async def register(user: UserCreate):
    db = get_db()
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    await db.users.insert_one({
        "_id": user_id, "email": user.email, "name": user.name,
        "created_at": datetime.utcnow(), "updated_at": datetime.utcnow(),
    })
    token = create_token(user_id)
    return {"token": token, "user_id": user_id, "name": user.name}


@router.post("/login")
async def login(email: str):
    db = get_db()
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    token = create_token(str(user["_id"]))
    return {"token": token, "user_id": str(user["_id"]), "name": user["name"]}
