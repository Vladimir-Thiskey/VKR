import os
import joblib

from pymongo import MongoClient
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from routers.categories import categories
from routers.autocomplete import autocomplete
from routers.recommendations import recommendations

app = FastAPI()

app.include_router(autocomplete.router)
app.include_router(categories.router)
app.include_router(recommendations.router)

app.mount('/static', StaticFiles(directory='static'), name='static')
templates = Jinja2Templates(directory='templates')


@app.on_event('startup')
async def startup_event():
    mongo_url = os.getenv('MONGODB_URL', 'mongodb://localhost:27017')
    client = MongoClient(mongo_url)
    db = client['recommend']
    app.state.collection = db['movies']

    app.state.cosine_sim = joblib.load('/matrix_models/cosine_sim.joblib')


@app.get('/', response_class=HTMLResponse, include_in_schema=False)
async def get_page(request: Request):
    return templates.TemplateResponse(request=request, name='index.html')
