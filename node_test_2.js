var request = require("request"),
    cheerio = require("cheerio");


function content_parse(text) {
    let is_in = {'申请公布日': undefined, '申请日': undefined};
    text = text.replace(/<a href=.*?<\/a>/g, '');
    var $ = cheerio.load(text);
    var dict_list = new Array();
    $('div[class="cp_linr"]').each(function (i, elem) {
        var dic = {};
        var title = $(this).find('h1').text().replace(/\s/g, '');
        title = title.split(']');
        dic['状态'] = title[0].slice(1);
        dic['发明名称'] = title[1];
        var lis = $(this).find('ul>li');
        lis.each((index, item) => {
            var c = $(item).text();
            c = c.replace(/<div style="display:none;"><ul>/g, '</li><li>');
            c = c.replace('</ul><\/div>', '</ul>');
            if (c === "") {
                return true
            }
            c = c.replace(/\s+/g, "");
            var ts = c.split('：');
            if (ts.length === 1) {
                if (c.match('^[A-Za-z]')) {
                    dic["分类号"] += c;
                }
            } else {
                if (ts[0] in is_in) {
                    ts[1] = ts[1].replace(/\./g, '-');
                    dic[ts[0]] = ts[1];
                } else {
                    dic[ts[0]] = ts[1];
                }
            }
        });
        var abst = $('.cp_jsh', this).text().replace(/\s/g, '');
        abst = abst.split('：');
        dic[abst[0]] = abst.slice(1).join("");
        dict_list.push(dic)
    });
    console.log(dict_list);
    return dict_list
}


var options = {
    method: 'POST',
    url: 'http://epub.sipo.gov.cn/patentoutline.action',
    // timeout: 30000,
    gzip: true,
    headers:
        {
            'Postman-Token': '83f9e28b-308c-4165-af7e-3bf44ce8629c',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
            'Upgrade-Insecure-Requests': '1',
            Referer: 'http://epub.sipo.gov.cn/patentoutline.action',
            Origin: 'http://epub.sipo.gov.cn',
            Host: 'epub.sipo.gov.cn',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': '187',
            Connection: 'keep-alive',
            'Cache-Control': 'no-cache',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Accept-Encoding': 'gzip, deflate',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
        },
    form:
        {
            showType: '1',
            strSources: 'pip',
            strWhere: 'AN=\'20181%\'',
            numSortMethod: '0',
            strLicenseCode: '',
            numIp: '0',
            numIpc: '0',
            numIg: '0',
            numIgc: '',
            numIgd: '',
            numUg: '',
            numUgc: '',
            numUgd: '',
            numDg: '',
            numDgc: '',
            pageSize: '3',
            pageNow: 1
        }
};


// function select_page(num) {
//     options.form.pageNow = num;
//     console.log('===================', options.form.pageNow, '===================');
//     request(options, function (error, response, body) {
//         if (error) throw new Error(error);
//         // patent_detail.
//         // console.log('this is :',body);
//         content_parse(body);
//     });
// }

// function main() {
//     for (var i = 1; i <= 1; i++) {
//         select_page(i)
//     }
// }

// main();
// select_page(1);
request(options, function (error, response, body) {
    if (error) {
        console.log(error)
    } else {
        content_parse(body);
    }
});
