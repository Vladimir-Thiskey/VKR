from fastapi import APIRouter
from fastapi import Request

router = APIRouter()


@router.get('/categories/{cat}')
async def get_categories(request: Request, cat: str):
    keys = {'title': 1, 'poster': 1, 'kinopoisk_url': 1, 'production_year': 1, 'kinopoisk_rating': 1, '_id': 0}
    if cat.lower() == 'best':
        results = request.app.state.collection.find({'genres': {'$not': {'$regex': 'мультфильм'}}}, keys)
    else:
        results = request.app.state.collection.find({'genres': {'$regex': cat, '$not': {'$regex': 'мультфильм'}}}, keys)

    result_list = [document for document in results.sort({'kinopoisk_rating': -1}).limit(8)]
    return result_list
