from fastapi import FastAPI, HTTPException, Response
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


class ResourceUpdate(BaseModel):
    name: Optional[str] = None
    emoji: Optional[str] = None
    category: Optional[str] = None
    bookedBy: Optional[str] = None


class ResourceCreate(BaseModel):
    id: str
    name: str = Field(..., min_length=1)
    emoji: str
    category: str
    bookedBy: Optional[str] = None


resources_db = [
    Resource(id="microscope", name="Microscope", emoji="🔬", category="Electronics"),
    Resource(id="printer-3d", name="3D Printer", emoji="🖨️", category="Electronics"),
    Resource(id="meeting-room", name="Meeting Room", emoji="🏢", category="Room"),
]

@app.get("/resources", response_model=List[Resource])
def get_resources(category: Optional[str] = None, available: Optional[int] = None):
    """Return list of resources, optionally filtered by category and availability.

    Query params:
    - category: exact category match (e.g. Electronics)
    - available: 1 => only resources with bookedBy == None
    """
    results = resources_db
    if category:
        results = [r for r in results if r.category == category]
    if available is not None:
        # treat any non-zero integer as truthy (but frontend will send 1)
        if available:
            results = [r for r in results if r.bookedBy is None]
    return results

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


@app.put("/resources/{resource_id}", response_model=Resource)
def update_resource(resource_id: str, upd: ResourceUpdate):
    """Modify an existing resource. Only fields provided in the body are changed."""
    for idx, r in enumerate(resources_db):
        if r.id == resource_id:
            updated = r.copy(update=upd.dict(exclude_unset=True))
            resources_db[idx] = updated
            return updated
    raise HTTPException(status_code=404, detail="Resource not found")


@app.delete("/resources/{resource_id}", status_code=204)
def delete_resource(resource_id: str):
    """Delete a resource by id. Returns 204 on success."""
    for idx, r in enumerate(resources_db):
        if r.id == resource_id:
            resources_db.pop(idx)
            return Response(status_code=204)
    raise HTTPException(status_code=404, detail="Resource not found")


@app.post("/resources", response_model=Resource, status_code=201)
def create_resource(item: ResourceCreate):
    """Create a new resource. `id` must be unique."""
    # check uniqueness
    for r in resources_db:
        if r.id == item.id:
            raise HTTPException(status_code=400, detail="Resource with this id already exists")
    new = Resource(**item.dict())
    resources_db.append(new)
    return new
