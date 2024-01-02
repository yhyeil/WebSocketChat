from fastapi import FastAPI, WebSocket, Request, Depends
from fastapi.responses import HTMLResponse , JSONResponse, FileResponse
from fastapi.templating import Jinja2Templates
from fastapi.logger import logger
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from typing import List

from schemas import MessageRequest, MessageCreate
from crud import get_messages, add_messages
from models import Base, Messages
from database import SessionLocal, engine

Base.metadata.create_all(bind= engine)

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app.mount("/static", StaticFiles(directory ="static", html = True), name ="static")

templates = Jinja2Templates(directory="templates")

#웹소켓 연결을 관리하는 클래스
class ConnectionManager:
    def __init__(self):
        #활성 websocket연결을 저장하는 리스트
        self.active_connections = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    async def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"{data}")
    except Exception as e:
        pass
    finally:
        await manager.disconnect(websocket)


@app.get("/")
async def client(request: Request):
    return templates.TemplateResponse("client.html", {"request": request})

@app.get("/client")
async def client(request: Request):
    return templates.TemplateResponse("client.html", {"request": request})

@app.get("/get_messages")
def get_data( db:Session = Depends(get_db)):
    return get_messages(db)

@app.post("/add_message")
def add_message(request: MessageCreate, db:Session = Depends(get_db)):
    return add_messages(db, request)

def run():
    import uvicorn
    uvicorn.run(app)


if __name__ == "__main__":
    run()

