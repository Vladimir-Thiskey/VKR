from pydantic import BaseModel


class MovieRequest(BaseModel):
    movies: list[str]
    count: int = 8
