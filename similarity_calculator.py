# curl 'https://api.myanimelist.net/v2/users/get_jumped/animelist?fields=listatus&limit=4' 
# -H 'X-MAL-CLIENT-ID:'
# THIS IS THE ENDPOINT

# ADD A FEATURE TO FIND MISLABELED NSFW ANIME
# uvicorn similarity_calculator:app --reload

import requests
import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, specify your exact JS domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserList(BaseModel):
    users: list[str]
    status: str

# Load the environment variables from the .env file
load_dotenv()

# Access the variables
mal_key = os.getenv("MAL_CLIENT_ID")

user_list = []
#should probably make a dict
anime_list = {}


@app.post("/calculate")
def calculate(data: UserList):
    global user_list
    global anime_list

    user_list = []
    anime_list = {}

    for user in data.users:
        url = f"https://api.myanimelist.net/v2/users/{user}/animelist"

        headers = {
            "X-MAL-CLIENT-ID": mal_key
        }

        params = {
            #"fields": "list_status",
            "limit": '500',
            "nsfw": 'true', #???????? needs to be on to get all anime (even not NSFW ones)
        }

        if data.status != "All" and data.status != "Completed/Watching":
            params['status'] = data.status.lower()

        temp_list = []
        list = None
        while url:
            response = requests.get(url, headers=headers, params=params)

            if response.status_code == 200:
                user_list.append(user)

                list = response.json()
                temp_list.extend(get_titles(list['data']))

                url = list.get('paging', {}).get('next')
            else:
                print(response.status_code)
                raise HTTPException(status_code=400, detail=f"ERROR: The user {user} could not be found.")

        temp_list.sort()
        anime_list[user] = temp_list

    common = sorted(get_common())
    unqiue = get_unique(common)

    return { 
        "common": common,
        "unique": unqiue
    }


def get_titles(list):
    titles = []
    for entry in list:
        titles.append(entry['node']['title'])
    
    return titles

def get_common():
    common_list = set(anime_list[user_list[0]])

    for i in range(1, len(anime_list)):
        common_list = common_list & set(anime_list[user_list[i]])
    
    return common_list


def get_unique(common):
    unqiue_list = {}

    for user in user_list:
        unqiue_list[user] = anime_list[user]
        for other in user_list:
            if user != other:
                unqiue_list[user] = sorted(set(unqiue_list[user]) - set(anime_list[other]))
    
    return unqiue_list