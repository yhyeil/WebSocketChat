from sqlalchemy import Column, Integer, String, Boolean

from database import Base

class Messages(Base):
    __tablename__ = "messages"

    index = Column(Integer, primary_key = True)
    userId = Column(String)
    text = Column(String)
    time = Column(String)
    sender = Column(String)