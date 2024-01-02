from pydantic import BaseModel
from typing import Optional

class MessageRequestBase(BaseModel):
    userId: str
    text: str
    time: str
    sender: str

class MessageCreate(MessageRequestBase):
    pass

class MessageRequest(MessageRequestBase):
    index: Optional[int]
    class Config:
        orm_mode = True