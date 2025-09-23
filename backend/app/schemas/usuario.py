from fastapi_users import schemas
from pydantic import BaseModel

class UserRead(schemas.BaseUser[int]):
    nombre: str

class UserCreate(schemas.BaseUserCreate):
    nombre: str

class UserUpdate(schemas.BaseUserUpdate):
    nombre: str | None = None
