const KboxBrUtils = require('/Users/weipeng/Desktop/Python_Work_Space/utils_test/app-base-lib/KBoxBrUtils'),
    cheerio = require('cheerio'),
    uuid = require('uuid'),
    fs = require('fs'),
    http = require('http');

const index_headers = {
        'Accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        'Accept-Encoding': "gzip, deflate",
        'Accept-Language': "zh-CN,zh;q=0.9",
        'Content-Length': "52",
        'Content-Type': "application/x-www-form-urlencoded",
        'Host': "syj.beijing.gov.cn",
        'Origin': "http://syj.beijing.gov.cn",
        'Proxy-Connection': "keep-alive",
        'Referer': "http://syj.beijing.gov.cn/eportal/ui?pageId=331216",
        'Upgrade-Insecure-Requests': "1",
        'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36",
    },
    detail_headers = {
        'Accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        'Accept-Encoding': "gzip, deflate",
        'Accept-Language': "zh-CN,zh;q=0.9",
        'Host': "syj.beijing.gov.cn",
        'Origin': "http://syj.beijing.gov.cn",
        'Proxy-Connection': "keep-alive",
        'Referer': "http://syj.beijing.gov.cn/eportal/ui?pageId=331216",
        'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36",
    },
    index_url = 'http://syj.beijing.gov.cn/eportal/ui?pageId=331216',
    detail_url = 'http://syj.beijing.gov.cn/eportal/ui?pageId=331749&exampleId=';
var total_page = 1,
    host_name = 'http://syj.beijing.gov.cn/eportal/ui?',
    count_page = 1,
    linkedCount = 0,
    maxLinkedCount = 50,
    DB_MAP = {
        '行政处罚决定书文号': 'CFSWH',
        '案件名称': 'AJMC',
        '当事人名称': 'DSRMC',
        '组织机构代码或身份证号': 'ZZJGDM',
        '法定代表人': 'FDDBR',
        '违反法律、法规或规章的主要事实': 'WFSS',
        '行政处罚种类、依据': 'CFZL',
        '履行方式和期限': 'LXFS',
        '救济渠道': 'JJQD'
    };


const requests = async function (url, data, type = 'page', method = 'post') {
    console.log('url is -->', url);
    let proxy = await KboxBrUtils.getProxy();
    proxy = JSON.parse(proxy);
    let options;
    if (method === 'post') {
        options = {
            hostname: proxy['ip'],
            method: 'POST',
            gzip: true,
            path: url,
            port: proxy['port'],
            headers: index_headers,
        };
    } else {
        options = {
            hostname: proxy['ip'],
            method: 'GET',
            gzip: true,
            path: url,
            port: proxy['port'],
            headers: detail_headers,
        };
    }
    return new Promise((resolve, reject) => {
        let req = http.request(options, function (res) {
            let result = undefined;
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                result += chunk.toString();
            });
            res.on('end', function () {
                resolve(result);
            })
        });
        req.on('error', function (e) {
            console.log('[request error]: ' + e.message);
            if (type === 'page') {
                console.log('【 --> PAGE_ERROR ! <-- 】');
                reject('PAGE_ERROR:' + data);
            } else {
                console.log('【 --> DETAIL_ERROR ! <-- 】');
                reject('DETAIL_ERROR:' + options.path);
            }
        });
        if (method === 'post') {
            data = "gkb=aaa&filter_LIKE_TITLE=&currentPage=" + data + "&pageSize=10";
            req.write(data);
        }
        req.end();
    })
};


function detail_parse(html, path) {
    let $ = cheerio.load(html);
    let arr = {};
    $('.table_sjcx').find('tr').each(function (item) {
        let pic = $(this);
        let thd = pic.find('th').text().replace(/\s+/g, '').replace(':', '');
        let td = pic.find('td').text().replace(/\s+/g, '');
        if (thd === '作出处罚的机关和决定日期') {
            td = td.split('--');
            arr['CFJG'] = td[0];
            try {
                arr['JDRQ'] = td[1];
            } catch (e) {
                arr['JDRQ'] = null;
            }
        } else {
            arr[DB_MAP[thd]] = td
        }
    });
    if (Object.keys(arr).length < 3) {
        throw new Error('DETAIL_ERROR:' + path)
    }
    arr['DATA_ID'] = uuid.v1();
    return arr
}


const new_main = async () => {
    while (count_page <= total_page) {
        if (total_page === 1) {
            await requests(index_url, count_page.toString()).then(data => {
                if (total_page === 1) {
                    try {
                        total_page = parseInt(data.match(/(?<=总记录数:)\d+/)[0] / 10 + 1);
                        console.log(' >>> page num is -->', total_page);
                        count_page += 1;
                        console.log('count_page --> ', count_page);
                    } catch (e) {
                        throw new Error('TOTAL_PAGE_ERROR')
                    }
                }
            }).catch(err => {
                fs.appendFileSync('spyp_error.txt', err + '\n')
            });
        }
        await requests(index_url, count_page.toString(), 'page').then(data => {
                count_page += 1;
                console.log('count_page --> ', count_page);
                let d = data.match(/pageId=331749&exampleId=([0-9A-Za-z].*)"/gi);
                // let dd = data.match(/(?<=pageId=331749&exampleId=)[0-9A-Za-z].*(?=")/gi);
                return new Set(d)
            }
        ).then(data => {
            for (let ds of data) {
                let exid = ds.slice(0, -1);
                console.log(exid);
                requests(host_name + exid, null, 'detail', 'get').then(
                    function (res) {
                        return detail_parse(res, host_name + exid)
                    }
                ).then(res => {
                    console.log('detail is success ! ');
                    KboxBrUtils.saveToDB('DT_SPYPCF_INFO', res).catch(err => {
                            throw new Error(err);
                        }
                    )
                }).catch(err => {
                    fs.appendFileSync('spyp_error.txt', err + '\n')
                });
            }
        }).catch(err => {
            fs.appendFileSync('spyp_error.txt', err + '\n')
        });
    }

    // await setTimeout(() => {
    // }, Math.random() * 1000)

};

new_main();
var countInterval;

function linkedInterval() {
    if (linkedCount <= maxLinkedCount) {
        linkedCount++;
        console.log('clear linkedCount');
        clearInterval(countInterval)
    } else {
        setTimeout(() => {
        }, 1000)
    }
}

countInterval = setInterval(linkedInterval, 1000);


// function loadListAndALLITEMS(url) {
//
// }
//
//
// var allPageCount = xxxxxx;
// for () {
//     loadListAndALLITEMS();
// }
//
//
//
//
//





