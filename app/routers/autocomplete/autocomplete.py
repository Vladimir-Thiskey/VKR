from fastapi import APIRouter
from fastapi import Request

router = APIRouter()


@router.get('/autocomplete/')
async def autocomplete(request: Request, query: str):
    results = request.app.state.collection.find(
        {'title': {'$regex': query, '$options': 'i'}},
        {'title': 1, 'production_year': 1, '_id': 0}
    ).limit(10)

    return [
        f'{row["title"]}'
        + (f' ({row["production_year"]})' if row["production_year"] else '')
        for row in results
    ]
