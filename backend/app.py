from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Resource(BaseModel):
    id: str
    name: str = Field(..., min_length=1)
    emoji: str
    category: str
    bookedBy: Optional[str] = None


class BookRequest(BaseModel):
    resource_id: str
    user: str = Field(..., min_length=1)


resources_db = [
    Resource(id="microscope", name="Microscope", emoji="🔬", category="Electronics"),
    Resource(id="printer-3d", name="3D Printer", emoji="🖨️", category="Electronics"),
    Resource(id="meeting-room", name="Meeting Room", emoji="🏢", category="Room"),
]

@app.get("/resources", response_model=List[Resource])
def get_resources():
    return resources_db

@app.get("/resources/{resource_id}", response_model=Resource)
def get_resource(resource_id: str):
    for r in resources_db:
        if r.id == resource_id:
            return r
    raise HTTPException(status_code=404, detail="Resource not found")

@app.post("/book", response_model=Resource)
def book_resource(req: BookRequest):
    for idx, r in enumerate(resources_db):
        if r.id == req.resource_id:
            if r.bookedBy:
                raise HTTPException(status_code=400, detail="Resource already booked")
            updated = r.copy(update={"bookedBy": req.user})
            resources_db[idx] = updated
            return updated
    raise HTTPException(status_code=404, detail="Resource not found")
