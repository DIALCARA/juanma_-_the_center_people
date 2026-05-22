from pydantic import BaseModel
from typing import Generic, TypeVar, List, Optional, Any

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    message: Optional[str] = None
    errors: List[str] = []


class PaginatedResponse(BaseModel, Generic[T]):
    success: bool = True
    data: List[T] = []
    total: int = 0
    page: int = 1
    page_size: int = 20
    message: Optional[str] = None
    errors: List[str] = []


def ok(data: Any = None, message: str | None = None) -> dict:
    return {"success": True, "data": data, "message": message, "errors": []}


def err(message: str, errors: list[str] | None = None) -> dict:
    return {"success": False, "data": None, "message": message, "errors": errors or []}
