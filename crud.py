from sqlalchemy.orm import Session

from models import Messages
from schemas import MessageRequest

def get_messages(db: Session):
    return db.query(Messages).all()

def add_messages(db: Session, item: MessageRequest):
    db_item = Messages(userId=item.userId, text=item.text, time=item.time, sender= item.sender)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db.query(Messages).all()