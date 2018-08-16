import requests
from lxml import etree
import re
import uuid

url = 'http://epub.sipo.gov.cn/patentoutline.action'
headers = {
    'Accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    'Accept-Encoding': "gzip, deflate",
    'Accept-Language': "zh-CN,zh;q=0.9",
    'Cache-Control': "max-age=0",
    'Connection': "keep-alive",
    'Content-Length': "187",
    'Content-Type': "application/x-www-form-urlencoded",
    'Host': "epub.sipo.gov.cn",
    'Origin': "http://epub.sipo.gov.cn",
    'Referer': "http://epub.sipo.gov.cn/patentoutline.action",
    'Upgrade-Insecure-Requests': "1",
    'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36",
}

payload = "showType=1&strSources=pip&strWhere=AN%3D'20181%25'&numSortMethod=0&strLicenseCode=&numIp=0&numIpc=0&numIg=0&numIgc=&numIgd=&numUg=&numUgc=&numUgd=&numDg=&numDgc=&pageSize=20&pageNow=1"

text_dict = ['申请公布号', '申请公布日', '申请号', '申请日', '申请人', '发明人', '地址', '分类号', '专利代理机构', '代理人', '摘要']


def content_parse(text):
    text = re.sub('<a href=.*?</a>', '', text)
    text = re.sub('<div style="display:none;"><ul>', '</li><li>', text)
    html = etree.HTML(text)
    divs = html.xpath('//div[@class="cp_linr"]')
    arr = []
    # print(len(divs))
    for div in divs:
        dic = {}
        h1 = re.sub(
            '\s', '', div.xpath('./h1/text()')[0]
        ).split(']')
        dic.update({'状态': h1[0][1:]})
        dic.update({'发明名称': h1[1]})
        lis = div.xpath('./ul/li')
        for li in lis:
            try:
                t = re.sub('\s', '', li.xpath('string()'))
                if t == "":
                    continue
                ts = t.split('：')

                if len(ts) == 1:
                    if re.findall('^[A-Za-z]', t)[0]:
                        dic['分类号'] += t
                        continue
                if ts[0] in ['申请公布日', '申请日']:
                    dic.update({ts[0]: re.sub('\.', '-', ts[1])})
                else:
                    dic.update({ts[0]: ts[1]})
            except:
                continue
        try:
            abst = div.xpath('./div[@class="cp_jsh"]')
            if len(abst) != 1:
                abst = div.xpath('../div[@class="cp_jsh"]')
            ab = re.sub('\s', '', abst[0].xpath('string(.)'))
            ab = ab.split('：')
            dic.update({ab[0]: ''.join(ab[1:])})
            dic.update({'DATA_ID': str(uuid.uuid1())})
        except:
            pass
        print(dic)
        arr.append(dic)
        # print(len(dic))


res = requests.post(url, headers=headers, data=payload)
rest = res.text
print(rest)
content_parse(rest)

