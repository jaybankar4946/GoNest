from fastapi import FastAPI
from app.routes.auth import router as auth_router

from app.db.session import engine
from app.db.base import Base

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth_router, prefix="/auth")

@app.get("/")
def root():
    return {"message": "API running"}
