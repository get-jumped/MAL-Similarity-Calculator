# curl 'https://api.myanimelist.net/v2/users/get_jumped/animelist?fields=listatus&limit=4' 
# -H 'X-MAL-CLIENT-ID:'
# THIS IS THE ENDPOINT

# ADD A FEATURE TO FIND MISLABELED NSFW ANIME

import requests
import os
from dotenv import load_dotenv

# Load the environment variables from the .env file
load_dotenv()

# Access the variables
mal_key = os.getenv("MAL_CLIENT_ID")

user_list = []
anime_list = []

def get_titles(list):
    titles = []
    for entry in list:
        titles.append(entry['node']['title'])
    
    return titles


while True:
    try:
        num_users = int(input("How many users would you like to check (atleast 2): "))
        
        if num_users < 2:
            print("Enter a number 2 or greater for comparison")
        else:
            break
    except ValueError:
        print("ERROR: Please enter an integer")



for i in range(num_users):
    user = input("Enter a username: ")

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

# print()
# print("USERS")
# for j in range(num_users):
#     print(user_list[j])

# print()
# print("LISTS")
# for k in range(num_users):
#     print(f"USER {k}'s list: {anime_list[k]}")

common = set(anime_list[0]) & set(anime_list[1])

for j in range(num_users - 2):
    print("ENTERED")
    common = common & set(anime_list[j + 2])

print(common)
print(len(common))