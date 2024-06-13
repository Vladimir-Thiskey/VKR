from fastapi import APIRouter
from .methods import recommend_movies
from fastapi import Request
from models.movie_model import MovieRequest

router = APIRouter()


@router.post('/recommendations/')
async def get_recommendations(request: Request, movie_data: MovieRequest):
    return recommend_movies(
        movie_data.movies,
        request.app.state.collection,
        request.app.state.cosine_sim,
        movie_data.count
    )
