# -*- coding: utf-8 -*-
from flask import request, Flask, redirect, url_for, render_template, abort
from flask.json import jsonify
from flask_uploads import UploadSet, IMAGES, configure_uploads, ALL, TEXT
import os
import re
import json

app = Flask(__name__, template_folder='templates')
app.config.update(DEBUG=True)

app.config['UPLOADED_DATA_DEST'] = os.path.dirname(os.path.abspath(__file__))
app.config['UPLOADED_DATA_ALLOW'] = TEXT

texts = UploadSet('task')

upload_path = os.path.join(app.config['UPLOADED_DATA_DEST'], 'statics/upload')


def make_task(arr):
    new_task = ""
    for ar in arr:
        ar = re.sub('\s', '', ar)
        task = {"ENTNAME": ar, "ENTTYPE": None, "PRIPID": None}
        new_task += '{}\n'.format(json.dumps(task, ensure_ascii=False))


# configure_uploads(app, texts)
@app.route('/load_task/', methods=['POST', 'GET'])
def upload_task():
    if request.method == 'POST':
        print(request.form)
        file = request.files['task']
        if file.filename == '':
            return jsonify({'status': -1, 'filename': '', 'msg': 'No file part'})

        else:
            file_path = '{}/{}'.format(upload_path, file.filename)
            file.save(file_path)
            with open(file_path, 'r', encoding='utf-8') as f:
                arr = f.readlines()
            make_task(arr)
            return jsonify({'status': 'success', 'filename': file.filename})
    else:
        return render_template('upload.html')


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=3333)
