# -*- coding: utf-8 -*-
from flask import Flask, request
import time
import redis
from uuid import uuid1
import json

ENT_NAME_QUEUE = 'ent_name_queue'

app = Flask(__name__)
db = redis.StrictRedis(host="localhost", port=6379, db=0)
app.config.update(DEBUG=False)

COUNT = 0


@app.route('/send_name.html', methods=['GET'])
def get_url():
    global COUNT
    response = 'GET_ERROR'
    if request.method == 'GET':
        task = request.args.get("name")
        k = str(uuid1())
        good = {'id': k, 'ENTNAME': task, 'infoUrl': None}
        db.rpush(ENT_NAME_QUEUE, json.dumps(good))
        while 1:
            answer = db.get(k)
            print(answer)
            if answer:
                print(answer)
                print(type(answer))
                if isinstance(answer, dict):
                    pass
                else:
                    answer = json.loads(answer.decode('utf-8'))
                db.delete(k)
                time.sleep(0.01)
                return answer

    return response


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5930)
