#
# import requests
# from bs4 import BeautifulSoup
#
#
# r = requests.get("http://google.com")
# content = r.content
#
# soup = BeautifulSoup(content, "html.parser")
# element = soup.find("title")
# print(element.text.strip())

import pymongo

from models.post import Post

uri = "mongodb://127.0.0.1:27017"
client = pymongo.MongoClient(uri)

database = client['fullstack']
collection = database['students']

student_list = []

students = collection.find({})
for student in students:
    student_list.append(student)
    print(student)


post = Post()
post2 = Post()

print(post.content)
print(post2.content)