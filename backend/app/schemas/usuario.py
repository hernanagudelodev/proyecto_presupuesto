from fastapi_users import schemas

class UserRead(schemas.BaseUser[int]):
    nombre: str

class UserCreate(schemas.BaseUserCreate):
    nombre: str

class UserUpdate(schemas.BaseUserUpdate):
    nombre: str | None = None
