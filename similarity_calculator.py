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
import time
import secrets

# Load the environment variables from the .env file
load_dotenv()

# Access the variables
mal_key = os.getenv("MAL_CLIENT_ID")

class KeyGenerator():
    KEY_URL = 'https://myanimelist.net/v1/oauth2/authorize'

    def __init__(self):
        self.code_verifier = self.code_challenge = self.get_new_code_verifier()


    def get_new_code_verifier(self) -> str:
            token = secrets.token_urlsafe(100)
            print(token[:128])
            return token[:128]

    def get_verifier(self):
        return self.code_verifier

    def get_challenge(self):
        return self.code_challenge

    def generate_keys(self):
        params = {
            "response_type": "code",
            "client_id": mal_key,
            "code_challenge": self.code_challenge,
            # "state": "im not sure what this actually does AHHHHHHHHHH"
        }
        
        # response = requests.get(self.KEY_URL, params=params)

        # if response.status_code == 200:
        #     print("SUCCESS")
        # print(response.status_code, "HERE")

        # print(response.request)


app = FastAPI()
keys = KeyGenerator()
keys.generate_keys()

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


class UserStats(BaseModel):
    user: str
    days_watched: float = 0.0
    mean_score: float = 0.0
    watching: int = 0
    completed: int = 0
    on_hold: int = 0
    dropped: int = 0
    plan_to_watch: int = 0
    total_entries: int = 0
    episodes_watched: int = 0
    rewatched: int = 0


# Load the environment variables from the .env file
load_dotenv()

# Access the variables
mal_key = os.getenv("MAL_CLIENT_ID")


@app.post("/calculate")
def calculate(data: UserList):
    user_list = []
    anime_list = {}

    for user in data.users:
        url = f"https://api.myanimelist.net/v2/users/{user}/animelist"

        headers = {
            "X-MAL-CLIENT-ID": mal_key
        }

        params = {
            "fields": "list_status",
            "limit": '500',
            "nsfw": 'true', #???????? needs to be on to get all anime (even not NSFW ones)
        }

        if data.status != "All" and data.status != "Completed/Watching":
            params['status'] = data.status.lower()

        temp_list = {}
        list = None
        while url:
            response = requests.get(url, headers=headers, params=params)

            if response.status_code == 200:
                user_list.append(user)

                list = response.json()
                # print(list['data'])
                temp_list |= get_titles(list['data'])

                url = list.get('paging', {}).get('next')
            else:
                print(response.status_code, "calc")
                raise HTTPException(status_code=400, detail=f"ERROR: The user {user} could not be found.")

        anime_list[user] = temp_list

    calc_stats(anime_list, user_list)

    common = get_common(anime_list, user_list)
    unqiue = get_unique(common, anime_list, user_list)

    return { 
        "common": common,
        "unique": unqiue
    }


def calc_stats(anime_list, user_list):
    stats = {}

    for user in user_list:
        user_stats = UserStats(user=user)

        for anime in anime_list[user]:
            pass
            # print(anime_list[user][anime])


    print("\nTHIS FUNCTION IS NOT WORKING YET. PREVIOUS API IS DEPRECATED. USE MAL API.\n")

    return stats


def get_graphs():
    scores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    pass


######################## Helper functions
def get_titles(list):
    titles = {}
    for entry in list:
        titles[entry['node']['title']] = entry
    
    return titles


def get_common(anime_list, user_list):
    # Gets all the anime from the first user (anime_list[user_list[0]] gets all the anime from a user and the .keys() gets the titles of the anime)
    common_list = anime_list[user_list[0]].keys()

    for i in range(1, len(anime_list)):
        # gets the intersection of the current common_list and the anime from the next user in the list
        common_list = common_list & anime_list[user_list[i]].keys()
    
    common_list = sorted(common_list)

    common_list = make_dict(common_list, user_list[0], anime_list) #user doesn't matter because all users should have these anime

    return common_list


def get_unique(common, anime_list, user_list):
    unqiue_list = {}

    for user in user_list:
        unqiue_list[user] = anime_list[user].keys()
        for other in user_list:
            if user != other:
                unqiue_list[user] = unqiue_list[user] - anime_list[other].keys()
    
    for users in user_list:
        unqiue_list[users] = sorted(unqiue_list[users])
        unqiue_list[users] = make_dict(unqiue_list[users], users, anime_list)
    
    return unqiue_list


def make_dict(list, user, anime_list):
    new_dict = {}
    
    for elem in list:
        new_dict[elem] = anime_list[user][elem]

    return new_dict


def get_scores():
    pass