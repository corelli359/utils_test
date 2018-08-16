"use strict";
var http = require("http"); //http 请求
var querystring = require("querystring");
var cheerio = require("cheerio");

var url = 'http://epub.sipo.gov.cn/patentoutline.action';

var contents = {
    "showType": "1",
    "strSources": "",
    "strWhere": "AN='20181%'",
    "numSortMethod": "",
    "strLicenseCode": "",
    "numIp": "",
    "numIpc": "",
    "numIg": "",
    "numIgc": "",
    "numIgd": "",
    "numUg": "",
    "numUgc": "",
    "numUgd": "",
    "numDg": "",
    "numDgc": "",
    "pageSize": 20,
    "pageNow": 1
};


var options = {
    url: url,
    host: 'epub.sipo.gov.cn',
    path: '/patentoutline.action',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': '47',
        'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36",
        'Origin': "http://epub.sipo.gov.cn",
        'Referer': "http://epub.sipo.gov.cn/patentoutline.action",
        'Upgrade-Insecure-Requests': "1",
    }
};

var text_dict = ['申请公布号', '申请公布日', '申请号', '申请日', '申请人', '发明人', '地址', '分类号', '专利代理机构', '代理人', '摘要'];


function content_parse(text) {
    var $ = cheerio.load(text);
    var divs = $('div[class="cp_linr"]');
    divs.each(function () {
        var dic = {};
        var lis = $('ul>li');
        lis.each(function () {
            var c = $('li').text();
            if (c === "") {
                return true
            }
            var ts = c.split('：');
            // console.log(ts);
            if (ts.length === 1) {
                if (c.match('^[A-Za-z]')) {
                    dic["分类号"] += c;
                    console.log(dic)
                }
            }
            else {
                if (ts[0] in ['申请公布日', '申请日']) {
                    dic.update(ts[0], ts[1])
                }
            }
        });
        console.log(dic)
    })

}


async function async_get_content(options, contents) {
    let get_content = http.request(options, function (res) {
        let texts = undefined;

        res.on('data', function (data) {
            res.setEncoding('utf8');
            texts += data.toString();
        });
        res.on('end', function () {
            content_parse(texts)
        });
    });
    await get_content.write(querystring.stringify(contents));
    await get_content.end();

}


async function catch_start(num) {
    contents.pageNow = num;
    console.log('==========================  ' + num + '  ==========================');
    await async_get_content(options, contents)

}

async function main() {
    console.log('coming!');
    for (var i = 1; i < 3; i++) {
        await catch_start(i)
    }
}

main();

