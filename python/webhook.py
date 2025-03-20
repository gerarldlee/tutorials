from flask import Flask, request, Response

app = Flask(__name__)

@app.route('/webhook', methods=['GET','POST'])
def respond():
    # print(request.json);
    data = request.data
    print(data)
    return Response(status=200)