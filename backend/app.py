from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional

app = FastAPI()

class Resource(BaseModel):
    id: int
    name: str = Field(..., min_length=1)
    category: str
    status: str
    booked_by: Optional[str] = None

class BookRequest(BaseModel):
    resource_id: int
    user: str = Field(..., min_length=1)

resources_db = [
    Resource(id=1, name="3D Printer", category="Electronics", status="Available"),
    Resource(id=2, name="Conference Room", category="Room", status="Available"),
    Resource(id=3, name="Laptop", category="Electronics", status="Available"),
]

@app.get("/resources", response_model=List[Resource])
def get_resources():
    return resources_db

@app.get("/resources/{resource_id}", response_model=Resource)
def get_resource(resource_id: int):
    for r in resources_db:
        if r.id == resource_id:
            return r
    raise HTTPException(status_code=404, detail="Resource not found")

@app.post("/book", response_model=Resource)
def book_resource(req: BookRequest):
    for r in resources_db:
        if r.id == req.resource_id:
            if r.status == "Unavailable":
                raise HTTPException(status_code=400, detail="Resource already booked")
            r.status = "Unavailable"
            r.booked_by = req.user
            return r
    raise HTTPException(status_code=404, detail="Resource not found")
