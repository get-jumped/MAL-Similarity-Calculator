# curl 'https://api.myanimelist.net/v2/users/get_jumped/animelist?fields=listatus&limit=4' 
# -H 'X-MAL-CLIENT-ID:'
# THIS IS THE ENDPOINT

# ADD A FEATURE TO FIND MISLABELED NSFW ANIME
# uvicorn similarity_calculator:app --reload

import requests
import os
from dotenv import load_dotenv
from fastapi import FastAPI
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

# Load the environment variables from the .env file
load_dotenv()

# Access the variables
mal_key = os.getenv("MAL_CLIENT_ID")

user_list = []
#should probably make a dict
anime_list = []

def get_titles(list):
    titles = []
    for entry in list:
        titles.append(entry['node']['title'])
    
    return titles

@app.post("/calculate")
def calculate(data : UserList):
    user_list = []
    anime_list = []

    for user in data.users:
        url = f"https://api.myanimelist.net/v2/users/{user}/animelist"

        headers = {
            "X-MAL-CLIENT-ID": mal_key
        }

        params = {
            #"fields": "list_status",
            "limit": '500',
            "nsfw": 'true' #???????? needs to be on to get all anime (even not NSFW ones)
        }

        temp_list = []
        while url:
            response = requests.get(url, headers=headers, params=params)

            if response.status_code == 200:
                user_list.append(user)

                list = response.json()
                temp_list.extend(get_titles(list['data']))

            url = list.get('paging', {}).get('next')

        anime_list.append(temp_list)

    common = set(anime_list[0]) & set(anime_list[1])

    return {"common": common}


# while True:
#     try:
#         num_users = int(input("How many users would you like to check (atleast 2): "))
        
#         if num_users < 2:
#             print("Enter a number 2 or greater for comparison")
#         else:
#             break
#     except ValueError:
#         print("ERROR: Please enter an integer")



# for i in range(num_users):
#     user = input("Enter a username: ")

#     url = f"https://api.myanimelist.net/v2/users/{user}/animelist"

#     headers = {
#         "X-MAL-CLIENT-ID": mal_key
#     }

#     params = {
#         #"fields": "list_status",
#         "limit": '500',
#         "nsfw": 'true' #???????? needs to be on to get all anime (even not NSFW ones)
#     }

#     temp_list = []
#     while url:
#         response = requests.get(url, headers=headers, params=params)

#         if response.status_code == 200:
#             user_list.append(user)

#             list = response.json()
#             temp_list.extend(get_titles(list['data']))
        
#         url = list.get('paging', {}).get('next')
    
#     anime_list.append(temp_list)


# common = set(anime_list[0]) & set(anime_list[1])
# unique = set(anime_list[0]) ^ set(anime_list[1])

# for j in range(num_users - 2):
#     print("ENTERED", j)
#     common = common & set(anime_list[j + 2])

# print("Common: ", len(common))
# print("Unique: ", len(unique))

# show = input("Would you like to see all the anime in common (Y/N): ")

# if show == 'Y' or show == 'y':
#     print(common)

# show_u = input("Would you like to see all the unique anime (Y/N): ")

# if show_u == 'Y' or show_u == 'y':
#     for index, elem in enumerate(user_list):
#         print(f"The user {elem} has these unqie anime, {len(anime_list[index])}, {index}")
#         print(set(anime_list[index]) - common)
#         print()
