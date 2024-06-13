import re
from bson.son import SON
from typing import Any
from pymongo.collection import Collection


def recommend_movies(movies: list[str], collection: Collection, cosine_sim: Any, count: int):
    indices = get_position_from_collection(movies, collection)

    avg_sim = cosine_sim[indices].mean(axis=0)  # Вычислим среднее косинусное сходство
    sim_scores = list(enumerate(avg_sim))  # Отсортируем фильмы по среднему косинусному сходству
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    top_indices = [i[0] for i in sim_scores if i[0] not in indices][:count]  # Получим топ-N похожих фильмов, исключив выбранные фильмы

    result_list = get_movie_data_from_collection(top_indices, collection)
    return result_list


def get_position_from_collection(movies, collection):
    pat = re.compile(r' \(.{,6}\)')
    regex_queries = [{'title': f"{pat.sub('', movie)}"} for movie in movies]
    query = {'$or': regex_queries}
    results = collection.find(query, {'pos': 1, '_id': 0})
    return [list(document.values())[0] for document in results]


def get_movie_data_from_collection(top_indices, collection):
    regex_queries = [{'pos': indic} for indic in top_indices]
    pipeline = [  # Агрегация для сохранения порядка
        {"$match": {"$or": regex_queries}},
        {"$addFields": {"__order": {"$indexOfArray": [top_indices, "$pos"]}}},
        {"$sort": SON([("__order", 1)])},
        {"$project": {
            'title': 1,
            'poster': 1,
            'kinopoisk_url': 1,
            'production_year': 1,
            'kinopoisk_rating': 1,
            '_id': 0
        }}
    ]

    results = collection.aggregate(pipeline)
    return [document for document in results]
