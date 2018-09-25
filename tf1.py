import collections
import re
import tensorflow as tf
from six.moves import cPickle
import numpy as np
import codecs
import base64

"""
y = 13x+9
x -> base64(x)
"""


def preprocess(input_file):
    with codecs.open(input_file, "r", encoding='utf-8') as f:
        data = f.read()
    # 使用Counter函数对输入数据进行统计。counter保存data中每个字符出现的次数
    counter = collections.Counter(data)
    # 对counter进行排序，出现次数最多的排在前面
    count_pairs = sorted(counter.items(), key=lambda x: -x[1])
    # 将data中出现的所有字符保存，这里有65个，所以voacb_size=65
    chars, _ = zip(*count_pairs)
    vocab_size = len(chars)
    # 按照字符出现次数多少顺序将chars保存，vocab中存储的是char和顺序，这样方便将data转化为索引
    vocab = dict(zip(chars, range(len(chars))))
    print(vocab)
    # # 将data中每个字符转化为索引下标。
    print(list(map(vocab.get, data)))
    tensor = np.array(list(map(vocab.get, data)))
    print(tensor)


def make_bs64_dict():
    with open('bs64.txt', 'r') as f:
        arr = f.readlines()
    l = len(arr)
    dic = {}
    for i in range(0, l, 2):
        a2 = int(re.sub('\s', '', arr[i]))
        a1 = re.sub('\s', '', arr[i + 1])
        dic.update({a1: a2})
    print(dic)
    print(len(dic))


def make_real():
    data_amount = 1
    x_vals = np.linspace(1, 500, data_amount)
    fake_x = np.array([make_fake(_) for _ in x_vals])
    fake_x = np.reshape(fake_x, [1, 1, 100])
    print(fake_x.shape)
    y_vals = np.add(np.multiply(x_vals, 5), 3)
    y_vals = np.add(y_vals, np.random.normal(0, 5, data_amount))
    # y_vals = np.reshape(y_vals, [1, 1, 1])
    print(y_vals.shape)
    return fake_x, y_vals


def make_fake(x):
    fake_x = base64.b64encode(str(x).encode('utf-8')).decode()
    sz = np.array(list(map(bs64_dic.get, fake_x)))
    sz = np.hstack((sz, np.array([-1 for _ in range(100 - len(sz))])))
    z = np.zeros(100)
    return np.add(z, sz)


def add_layer(inputs, in_size, out_size, activation_function=None):
    weights = tf.Variable(tf.random_normal([1, in_size, out_size]))
    biases = tf.Variable(tf.zeros([out_size]) + 0.1)
    wx_plus_b = tf.matmul(inputs, weights) + biases
    if activation_function is None:
        outputs = wx_plus_b
    else:
        outputs = activation_function(wx_plus_b)
    return outputs


def tf_base():
    w_1 = tf.Variable(tf.random_normal([1, 100, 256]))
    b_1 = tf.Variable(tf.zeros([256]) + 0.1)
    wx_plus_b = tf.matmul(x_input, w_1) + b_1
    wx_plus_b = tf.nn.relu(wx_plus_b)
    w_2 = tf.Variable(tf.random_normal([1, 256, 1]))
    b_2 = tf.Variable(tf.zeros([1]) + 0.1)
    pre_layer = tf.matmul(wx_plus_b, w_2) + b_2
    return pre_layer
    # layer_1 = add_layer(x_input, 100, 256, activation_function=tf.nn.relu)
    # pre_layer = add_layer(layer_1, 256, 100, None)
    # return pre_layer


if __name__ == '__main__':
    # make_bs64_dict()
    bs64_dic = {'A': 0, 'R': 17, 'i': 34, 'z': 51, 'B': 1, 'S': 18, 'j': 35, '0': 52, 'C': 2, 'T': 19, 'k': 36, '1': 53,
                'D': 3, 'U': 20, 'l': 37, '2': 54, 'E': 4, 'V': 21, 'm': 38, '3': 55, 'F': 5, 'W': 22, 'n': 39, '4': 56,
                'G': 6, 'X': 23, 'o': 40, '5': 57, 'H': 7, 'Y': 24, 'p': 41, '6': 58, 'I': 8, 'Z': 25, 'q': 42, '7': 59,
                'J': 9, 'a': 26, 'r': 43, '8': 60, 'K': 10, 'b': 27, 's': 44, '9': 61, 'L': 11, 'c': 28, 't': 45,
                '+': 62, 'M': 12, 'd': 29, 'u': 46, '/': 63, 'N': 13, 'e': 30, 'v': 47, 'O': 14, 'f': 31, 'w': 48,
                'P': 15, 'g': 32, 'x': 49, 'Q': 16, 'h': 33, 'y': 50, '=': 64}

    x_input = tf.placeholder(shape=[1, 1, 100], dtype=tf.float32)
    y_real = tf.placeholder(shape=[1], dtype=tf.float32)
    prediction = tf_base()
    print(prediction.shape)
    print(y_real.shape)
    prediction = tf.reshape(prediction, shape=[1])
    square = tf.square(y_real - prediction)
    loss = tf.reduce_mean(tf.reduce_sum(square))
    train_step = tf.train.GradientDescentOptimizer(0.1).minimize(loss)
    sess = tf.Session()
    init = tf.global_variables_initializer()
    sess.run(init)
    step = 1000

    while step > 0:
        print('step is --> ', step)
        x, y = make_real()
        print(y.shape)
        sess.run(train_step, feed_dict={x_input: x, y_real: y})
        if step % 50 == 0:
            x, y = make_real()
            prediction_value = sess.run(prediction, feed_dict={x_input: x, y_real: y})
            print('prediction_value --> ', prediction_value)
            print(prediction_value.shape == y.shape)
            los = sess.run(loss)
            print('loss --> ', los)
        step -= 1
