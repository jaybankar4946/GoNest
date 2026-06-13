from sqlalchemy import Column, Integer, String, Float
from app.db.base import Base

class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    price = Column(Float)
    location = Column(String)
