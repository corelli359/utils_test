const KboxBrUtils = require('/Users/weipeng/Desktop/Python_Work_Space/utils_test/app-base-lib/KBoxBrUtils'),
    cheerio = require('cheerio'),
    uuid = require('uuid'),
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


const
    requests = async function (url, data, method = 'post') {
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
                // path: detail_url + data,
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
                console.log('[insert error]: ' + e.message);
                reject(e);
            });
            if (method === 'post') {
                req.write(data);
            }
            req.end();
        })
    };

/*const main = async () => {
    while (count_page <= total_page) {
        let payload = "gkb=aaa&filter_LIKE_TITLE=&currentPage=" + count_page.toString() + "&pageSize=10";
        let indexs = await requests(index_url, payload);
        let arr = indexs.match(/pageId=331749&exampleId=(\S*)"/g);
        console.log(arr);
        count_page += 1;
        console.log('count_page --> ', count_page)
    }
};*/

// main();

function detail_parse(html) {
    console.log(html);
    let $ = cheerio.load(html);
    console.log($)
}


const new_main = async () => {
    while (count_page <= total_page) {
        let payload = "gkb=aaa&filter_LIKE_TITLE=&currentPage=" + count_page.toString() + "&pageSize=10";
        requests(index_url, payload).then(function (data) {
                let d = data.match(/pageId=331749&exampleId=([0-9A-Za-z].*)"/gi);
                return new Set(d)
            }
        ).then(function (data) {
            console.log(data);
            let arr = [];
            let ds = [...data];
            let exid = ds[0].slice(0, -1);
            let result = requests(host_name + exid, null, 'get').then(
                function (res) {
                    // console.log('res --> ', res)
                    detail_parse(res)
                }
            );
            // console.log('result --> ', result)
            // for (let index of ds[0]) {
            //     let exid = index.slice(0, -1);
            //     console.log(exid)
            // let result = requests(host_name + exid, null, 'get');
            // console.log(result)

            // console.log(exid);
            // }
        });
        count_page += 1;
        console.log('count_page --> ', count_page)
    }
};

// new_main();


var text = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html>\n' +
    ' <head>\n' +
    '  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title>查询详细页</title>\n' +
    '<meta  name="version" content="7.9.10.2"/>\n' +
    '<meta  name="createDate" content="2018-10-18 06:42:23" />\n' +
    '<meta  name="cacheclearDate" content="2018-10-18 05:04:00"/>\n' +
    '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n' +
    '<meta name="keywords"  content="" />\n' +
    '<meta name="description"  content="查询详细页" />\n' +
    '<link rel="stylesheet" type="text/css"  href="/eportal/uiFramework/huilan-jquery-ui/css/huilan-jquery-ui.css" />\n' +
    '<script type="text/javascript" src="/eportal/uiFramework/huilan-jquery-ui/js/huilan-jquery-ui.js?self=true&skin=default"></script>\n' +
    ' <LINK href="/eportal/fileDir/bjfda/resource/cms/bjda.ico" type="image/x-icon" rel=icon>\n' +
    '<LINK href="/eportal/fileDir/bjfda/resource/cms/bjda.ico" type="image/x-icon" rel="shortcut icon">   <link rel="stylesheet" type="text/css" href="/eportal/fileDir/bjfda/template/bjfda.css?timestamp=1512713628000" />\n' +
    '  <script type="text/javascript" src="/eportal/fileDir/bjfda/template/bjfda.js?timestamp=1512713628000"></script>\n' +
    ' </head>\n' +
    ' <body>\n' +
    '  <link rel="stylesheet" type="text/css" href="/eportal/fileDir/bjfda/template/page/sjcx/skin.css?timestamp=1512713628000" /><div style="display:none" easysite="easysiteHiddenDiv">\n' +
    '        <input id="contextPath" value="/eportal" type="hidden"/>\n' +
    '        <input id="isOnlyUseCkeditorSourceMode" value="$isOnlyUseCkeditorSourceMode" type="hidden"/>\n' +
    '        <input id="eprotalCurrentPageId" value="331749" type="hidden"/>\n' +
    '        <input id="eprotalCurrentSiteId" value="132114" type="hidden"/>\n' +
    '        <input id="eprotalCurrentSiteType" value="WEB" type="hidden"/>\n' +
    '        <input id="eprotalCurrentSiteHideMaskLayer" value="no" type="hidden"/>\n' +
    '        <input id="eprotalCurrentArticleKey"  value=""  type="hidden"/>\n' +
    '        <input id="eprotalCurrentColumnId"  value=""  type="hidden"/>\n' +
    '        <input id="isStaticRequest" value="" type="hidden"/>\n' +
    '        <input id="isOpenStaticPageList" value="no" type="hidden"/>\n' +
    '        <input id="defaultPublishPage" value="10" type="hidden"/>\n' +
    '        <input type=\'hidden\' id=\'eportalappPortletId\' value="3">\n' +
    '        <input type=\'hidden\' id=\'epsPortletId\' value="1">\n' +
    '        <input type=\'hidden\' id=\'portaltoolsPortletId\' value="2">\n' +
    '        <script type="text/javascript" src="/eportal/uiFramework/js/counting/chanelCounting.js"></script>\n' +
    '        <input type="hidden" id="currentLoginMemberId"  value="" />\n' +
    '        <input type="hidden" id="currentLoginMemberName"  value="" />\n' +
    '        <input type="hidden" id="behaviourAnalysisSiteId"  value="" /> \n' +
    '                        <input type="hidden" id="portalLastRequestUrl"  value="" />\n' +
    '</div>  <div>\n' +
    '    <script type="text/javascript" src="/eportal/fileDir/bjfda/resource/cms/2015/04/jquery.SuperSlide.2.1.1.js"></script>\n' +
    '<div class="head" style="position: relative;">    \n' +
    '    <div class="ico_bj" style="position:absolute;right:126px;bottom:16px;width: 59px;height: 60px;"> <a href="http://www.beijing.gov.cn/ " target="_blank">\n' +
    '      <img src="/eportal/fileDir/bjfda/resource/cms/2018/10/img_pc_site/2018101613240943050.png" alt="首都之窗"> </a> </div>\n' +
    '   <div style="position:absolute;right:18px;bottom:16px;width:92px;height:60px;">\n' +
    '      <img src="/eportal/fileDir/bjfda/resource/cms/2018/10/img_pc_site/2018101613243138804.jpg" width="100px" height="60px" alt="12345"> \n' +
    '   </div>\n' +
    ' </div>\n' +
    '</div>\n' +
    '<div class="banner_bg">\n' +
    '<div class="nav_all">\n' +
    '    \n' +
    '\n' +
    '      \n' +
    '    \n' +
    '    <div style="width:1200px; margin:0px auto;" >\n' +
    '            <div id="main_menu" class="main_menu">\n' +
    '                        <ul class="">\n' +
    '                                                                                   <li >\n' +
    '                                      <a  href="/bjfda/index/index.html" target="_parent">首页</a>\n' +
    '                                      <div class="twonav"></div>\n' +
    '                                   </li>\n' +
    '                                                           <li >\n' +
    '                                      <a  href="/bjfda/zwgk29/index.html" target="_parent">政务公开</a>\n' +
    '                                      <div class="twonav"><a href="/bjfda/zwgk29/zqxx/428016/index.html" target="_parent" >职权信息</a> <a href="/bjfda/zwgk29/qlqd/xzxk/index.html" target="_parent" >权力清单</a> <a href="/bjfdak29/xwdt/136578/index.html" target="_parent" >新闻动态</a> <a href="/bjfda/zwgk29/zcfg/sjgfxwj10/index.html" target="_parent" >法规文件</a> <a href="/bjfda/zwgk29/zcjd89/zcjd/index.html" target="_parent" >政策解读</a> <a href="9/gzdt14/tzgg/tz/index.html" target="_parent" >其他信息</a> </div>\n' +
    '                                   </li>\n' +
    '                                                           <li >\n' +
    '                                      <a  href="/bjfda/aqxx82/index.html" target="_parent">安全信息</a>\n' +
    '                                      <div class="twonav"><a href="/bjfda/aqxx82/zlgg47/ylqxl/index.html" target="_parent" >质量公告</a> <a href="/bjfda/aqxx82/jcxx/ypjcypj/index.html" target="_parent" >不良反应监测</a> <a hrefqxx82/246019/246131/index.html" target="_parent" >产品召回</a> <a href="/bjfda/aqxx82/pgl/sdaj/index.html" target="_parent" >曝光台</a> <a href="/bjfda/aqxx82/hzpcs/435855/index.html" target="_parent" >提示与科普</a> </div>\n' +
    '                                   </li>\n' +
    '                                                           <li >\n' +
    '                                      <a  href="/bjfda/bsdt64/index.html" target="_parent">办事大厅</a>\n' +
    '                                      <div class="twonav"><a href="/bjfda/bsdt64/fwzn/bsxz/index.html" target="_parent" >服务指南</a> <a href="/bjfda/bsdt64/bszn50/ylqx78/index.html" target="_parent" >办事指南(市级事项）</a> <a/bsdt64/xzxk5/135499/index.html" target="_parent" >办事指南(区级事项）</a> <a href="/bjfda/bsdt64/bgxz/351953/index.html" target="_parent" >表格下载</a> <a href="/bjfda/bsdt64/sfwb/446065/index.html" target="_parent" >示范文本<da/bsdt64/gsgg/_136954/index.html" target="_parent" >公示公告</a> <a href="/bjfda/bsdt64/sdtz/_136958/index.html" target="_parent" >送达通知</a> <a href="/bjfda/bsdt64/qtsx/135527/index.html" target="_parent" >执业药师</a> <a hbsdt64/135535/index.html" target="_parent" >职称评审</a> </div>\n' +
    '                                   </li>\n' +
    '                                                           <li   class="active" >\n' +
    '                                      <a  href="/eportal/ui?pageId=331017" target="_parent">数据查询</a>\n' +
    '                                      <div class="twonav"><a href="/eportal/ui?pageId=331007" target="_parent" >许可信息查询</a> <a href="/bjfda/sjdc/jdjcxxtb/jdjcxx/index.html" target="_parent" >检查信息查询</a> <a href="/epord=331216" target="_parent" >处罚信息查询</a> <a href="/eportal/ui?pageId=331228" target="_parent" >其他信息查询</a> </div>\n' +
    '                                   </li>\n' +
    '                                                           <li >\n' +
    '                                      <a  href="/bjfda/gzhd67/index.html" target="_parent">公众互动</a>\n' +
    '                                      <div class="twonav"><a href="/bjfda/gzhd67/myzj/index.html" target="_parent" >意见征集</a> <a href="/bjfda/gzhd67/ft/index.html" target="_parent" >在线访谈</a> <a href="/eportal/ui?pageId=1arget="_parent" >业务咨询</a> <a href="http://tsjb.bjfda.gov.cn/bjda_web/shouye.jsp" target="_blank" >投诉举报</a> <a href="/eportal/ui?pageId=132953" target="_parent" >纪检监察</a> <a href="/eportal/ui?pageId=132950" target="_箱</a> </div>\n' +
    '                                   </li>\n' +
    '                                                           <li >\n' +
    '                                      <a  href="/bjfda/ztzl75/index.html" target="_parent">专题专栏</a>\n' +
    '                                      <div class="twonav"><a href="/bjfda/ztzl75/xxgcsjdjs/sy/index.html" target="_parent" >学习宣传贯彻十九大精神</a> <a href="/bjfda/ztzl75/cjspaqsfcs37/sy65/index.html" target="_parent" >创建食a href="/bjfda/ztzl75/ygcy/sy74/index.html" target="_parent" >阳光餐饮</a> <a href="/bjfda/ztzl75/llz/sy10/index.html" target="_parent" >食品药品监管基层联络站</a> <a href="/bjfda/ztzl75/spbjspqzhxjxczz/index.html" target="_par和虚假宣传整治</a> <a href="/bjfda/ztzl75/xzzfgszd/419214/index.html" target="_parent" >行政执法公示制试点</a> <a href="/bjfda/ztzl75/348789/357184/index.html" target="_parent" >药品注册服务指南</a> <a href="/bjfda/ztzl75/ylqxzml" target="_parent" >医疗器械监管服务指南</a> <a href="/bjfda/ztzl75/bjspqybzbazl/qybzba/index.html" target="_parent" >保健食品企业标准备案指南</a> <a href="/bjfda/ztzl75/xzxkxzcfsgs/xzxkxzcfsgs23/index.html" target="_parent" 公示”</a> </div>\n' +
    '                                   </li>\n' +
    '                                                </ul>\n' +
    '                </div>\n' +
    '           <div class="container">\n' +
    '            <div id="sub_menu" class="sub_menu">这里是放子菜单的</div>\n' +
    '            \n' +
    '           </div>\n' +
    '</div>\n' +
    '<div style="clear:both;"></div>\n' +
    '</div>\n' +
    '</div>\n' +
    '<script>\n' +
    '$(".banner_bg .nav_all .main_menu ul li:last").css("background","0");\n' +
    '</script>\n' +
    '<script>\n' +
    '\n' +
    '    // 初始化\n' +
    '    $("#main_menu ul li.active").addClass("iactive");\n' +
    '    // 首页欢迎的话,可以写在这里!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n' +
    '    $("#main_menu ul li:first div").html(" 欢迎访问北京市食品药品监督管理局政务网站！");\n' +
    '    $("#sub_menu").html($("#main_menu ul li.iactive").find("div").html());\n' +
    '\n' +
    '    // 鼠标滑过事件\n' +
    '    $("#main_menu ul li").hover(function(){\n' +
    '     \n' +
    '        $("#sub_menu").html($(this).find("div").html());\n' +
    '        $(this).addClass("iactive").siblings().removeClass("iactive");\n' +
    '     \n' +
    '    },function(){\n' +
    '      if(!$(this).hasClass("active")){\n' +
    '        // $(this).removeClass("iactive");\n' +
    '      }\n' +
    '    });\n' +
    '    // 鼠标离开子菜单还原,若不需要可删除下面几行\n' +
    '    //$("#sub_menu,#main_menu ul li:first").mouseleave(function(){\n' +
    '     // $("#main_menu ul li.active").addClass("iactive").siblings().removeClass("iactive");\n' +
    '      //$("#sub_menu").html($("#main_menu ul li.iactive").find("div").html());\n' +
    '    //});\n' +
    '$("#sub_menu").css(\'margin-left\',\'10px\');\n' +
    '        $("#main_menu ul li:first").css(\'margin-left\',\'10px\')\n' +
    '        $("#main_menu ul li:eq(3)").css(\'width\',\'140px\')\n' +
    ' \n' +
    '\n' +
    '  </script>\n' +
    '\n' +
    '<style>\n' +
    '.head{width:100%;height:301px;background:url(/eportal/uiFramework/commonResource/image/2017120511490182728.png) center 0 no-repeat;text-align:center;max-width:19200px;}\n' +
    '.banner_bg{width:100%;background:url(/eportal/fileDir/bjfda/resource/cms/2017/12/navbg.gif) 0 0 repeat-x; }\n' +
    '    *{margin: 0;padding:0;}\n' +
    '    li{list-style: none;}\n' +
    '    a{text-decoration: none;color: #000;}\n' +
    '    .container{ width:1180px; overflow:hidden; margin:4px auto 0;height:38px;}\n' +
    '    .main_menu{height: 38px; width:1200px; background:url(/eportal/fileDir/bjfda/resource/cms/2017/12/main_menu.gif) 0 0 repeat-x; margin:0px auto;padding-top: 5px;}\n' +
    '    .main_menu ul li{width:165px; height:38px; background:url(/eportal/fileDir/bjfda/resource/cms/2017/12/nav_li.gif) right 2px no-repeat; text-align:center; line-height:30px; float:left;/* margin-left:13px;*/ display:inline;}\n' +
    '    .main_menu ul li>a{display: block;text-align: center;line-height: 32px; font-size:16px; color:#fff; font-family:"微软雅黑";}\n' +
    '    .main_menu ul li.iactive a{background:url(/eportal/fileDir/bjfda/resource/cms/2017/12/menuBg.png) center bottom no-repeat; color:#fff;  font-family:"微软雅黑"; line-height:32px;height:38px;}\n' +
    '    .main_menu ul li div{display: none;}\n' +
    '    .sub_menu{width:1180px; float:left; line-height:36px; font-size:14px;overflow: hidden;}\n' +
    '    .sub_menu a{text-align:center; background:url(/eportal/fileDir/bjfda/resource/cms/2015/09/2015092114393471838.jpg) no-repeat right center; float:left; padding:0 6px; font-size:14px; line-height:36px; color:#5f5f5f;}\n' +
    '    .sub_menu1{width:680px; line-height:36px; font-size:14px;overflow: hidden;margin-left:200px;}\n' +
    '\n' +
    '    .nav_all{width:1200px;background:#fff; margin:0 auto; height:auto; overflow:hidden;}\n' +
    '.banner{width:1000px; height:221px;position:relative;}\n' +
    '.banner .ilogo{height: 52px;    left: 38px;    position: absolute;    top: 86px;    width: 476px; z-index:9999; background-color: rgba(255, 255, 255);*background-color: rgb(255, 255, 255);*filter: alpha(opacity=0);}\n' +
    '.banner .sdzc{ position: absolute; right:34px; top:34px; width:68px;height:78px; z-index:9999; background-color: rgba(255, 255, 255);*background-color: rgb(255, 255, 255);*filter: alpha(opacity=0);}\n' +
    '.banner .wbzw{ bottom: 26px;height: 76px; position: absolute;right: 32px;width: 68px;z-index: 9999; background-color: rgba(255, 255, 255);*background-color: rgb(255, 255, 255);*filter: alpha(opacity=0);}\n' +
    '/*导航*/\n' +
    '.nav{width:1000px; height:36px; background:url(/eportal/fileDir/bjfda/resource/cms/2015/04/nav_bg.png) repeat-x; margin:0px auto;}\n' +
    '.nav li{width:110px; height:36px; text-align:center; line-height:36px; float:left; margin-left:13px; display:inline;}\n' +
    '.nav li a{ height:36px; display:block; background:url(/eportal/fileDir/bjfda/resource/cms/2015/04/li_bg.png) right center no-repeat; color:#ffffff; font-family:"微软雅黑"; font-size:16px;}\n' +
    '.nav li .u1{ background:none;}\n' +
    '.nav li a:hover{ background:#ffffff; color:#0056b4; font-family:"微软雅黑";}\n' +
    '.nav li .nav_current{background:#ffffff; color:#0056b4; font-weight:bold; font-family:"微软雅黑";}\n' +
    '\n' +
    '\n' +
    '\n' +
    '  </style>  </div> \n' +
    '  <div class="all" style="background:url(/eportal/fileDir/bjfda/resource/cms/2015/04/2015042707552117642.jpg) repeat-y center center;"> \n' +
    '   <div class="wrapper"> \n' +
    '    <div class="cx_dq">\n' +
    '      您所在位置：<span><a class=\'SkinObject\' href=\'/eportal/ui?pageId=331017\' target=\'_parent\'>数据查询</a> > <a class=\'SkinObject\' href=\'/eportal/ui?pageId=331216\' target=\'_parent\'>处罚信息查询</a> > <a class=\'SkinObject\' hrel/ui?pageId=331216\' target=\'_parent\'>行政处罚信息公开表</a> > <a class=\'SkinObject\' href=\'javascript:void(0)\' target=\'_parent\'>查询详细页</a></span> \n' +
    '    </div> \n' +
    '    <div class="main_1 column" id="zc" name="内容" runat="server">\n' +
    '       <div class="portlet" id="84f8b7f6cfc44b849b61b5c0ed21976a" pagemoduleid="00aa94a5fa5d4e80850d91542b9338b0">\n' +
    ' <div align="left" class="portlet-header"> \n' +
    '  <span id="menu">\n' +
    '        </span> \n' +
    '  <div id="submenu84f8b7f6cfc44b849b61b5c0ed21976a" class="shadow dn"> \n' +
    '   <ul class="float_list_ul">\n' +
    '        </ul> \n' +
    '  </div> \n' +
    ' </div> \n' +
    ' <div>\n' +
    '   \n' +
    '\n' +
    '\n' +
    ' \n' +
    '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">\n' +
    '<html>\n' +
    '  <head>\n' +
    '    \n' +
    '    <title>详细页</title>\n' +
    '    \n' +
    '        <meta http-equiv="pragma" content="no-cache">\n' +
    '        <meta http-equiv="cache-control" content="no-cache">\n' +
    '        <meta http-equiv="expires" content="0">    \n' +
    '        <meta http-equiv="keywords" content="keyword1,keyword2,keyword3">\n' +
    '        <meta http-equiv="description" content="This is my page">\n' +
    '        <link href="/eportalapply/css/detail.css" rel="stylesheet" type="text/css" />   \n' +
    '  </head>\n' +
    '  <body>\n' +
    '      <table class="table_sjcx" border="0" cellpadding="0" cellspacing="0" width="900">\n' +
    '  <tbody>\n' +
    '<tr>\n' +
    '    <th>行政处罚决定书文号:</th>\n' +
    '    <td>（京海）食药监食罚〔2016〕270391号</td>\n' +
    '  </tr>\n' +
    '  <tr>\n' +
    '    <th>案件名称:</th>\n' +
    '    <td>销售使用国家禁止的兽药的食用农产品；经营超限量使用食品添加剂的食品案</td>\n' +
    '  </tr>\n' +
    ' <tr>\n' +
    '    <th>当事人名称:</th>\n' +
    '    <td>北京物美流通技术有限公司海淀店</td>\n' +
    '  </tr>\n' +
    '   <tr>\n' +
    '    <th>组织机构代码或身份证号:</th>\n' +
    '    <td>91110108779510150C</td>\n' +
    '  </tr>\n' +
    '  <tr>\n' +
    '    <th>法定代表人:</th>\n' +
    '    <td>种晓兵</td>\n' +
    '  </tr>\n' +
    '  \n' +
    ' <tr>\n' +
    '    <th>违反法律、法规或规章的主要事实:</th>\n' +
    '    <td>销售使用国家禁止的兽药的食用农产品；经营超限量使用食品添加剂的食品案</td>\n' +
    '  </tr>\n' +
    '  <tr>\n' +
    '    <th>行政处罚种类、依据:</th>\n' +
    '    <td>罚款,没收非法所得。违反了《食用农产品市场销售质量安全监督管理办法》第二十五条第（一）项的规定；依据《中华人民共和国食品安全法》第一百二十三条第一款；《食用农产品市场销售质量安全监督管理办法》第五十条第一款；《中华人民共和国食品安全法》第一百二十四条第一款第（三）项的规定，予以处罚。</td>\n' +
    '  </tr>\n' +
    '  <tr>\n' +
    '    <th>履行方式和期限:</th>\n' +
    '    <td>已履行</td>\n' +
    '  </tr>\n' +
    '  <tr>\n' +
    '    <th>作出处罚的机关和决定日期:</th>\n' +
    '    <td>海淀局--2016-9-27</td>\n' +
    '  </tr>\n' +
    '<tr>\n' +
    '    <th>救济渠道</th>\n' +
    '    <td>如不服区食品药品监督管理部门作出的处罚决定，可以在收到处罚决定书之日起60日内向北京市食品药品监督管理局或所在地区人民政府申请行政复议，也可以在6个月内依法向所在地区人民法院提起行政诉讼。\n' +
    '<br/>如不服北京市食品药品监督管理局作出的处罚决定，可以在收到处罚决定书之日起60日内向国家食品药品监督管理局或北京市人民政府申请行政复议，也可以在6个月内依法向西城区人民法院提起行政诉讼。\n' +
    '</td>\n' +
    '  </tr>\n' +
    '</tbody>\n' +
    '</table>\n' +
    '  <div class="detail_close">【<a href="javascript:window.close()">关闭</a>】</div>\n' +
    '  </body>\n' +
    '</html>\n' +
    ' \n' +
    ' </div> \n' +
    '</div>     </div> \n' +
    '   </div> \n' +
    '   <div style="clear:both;"></div> \n' +
    '  </div> \n' +
    '  <div style="clear:both;"></div> <div class="ygcy_foot_top">\n' +
    '        <div class="ygcy_contain">\n' +
    '                <div class="demo">\n' +
    '               <span class="ygcy_yqljli1"> 友情链接：</span>\n' +
    '                  <a href="http://www.beijing.gov.cn/" class="sdzc" target="_blank">首都之窗</a>\n' +
    '                 <a href="http://samr.saic.gov.cn/" class="sdzc" target="_blank">国家市场监督管理总局 </a>\n' +
    '                 <a href="http://cnda.cfda.gov.cn/WS04/CL2042/" class="sdzc" target="_blank">国家药品监督管理局 </a>\n' +
    '                 <a href="http://www.bjjdzx.org" class="sdzc" target="_blank">北京禁毒在线</a>\n' +
    '           <!--各区网址-->\n' +
    '           <select  class="foot_gq" onchange="if(value!=\'\'){window.open(this.options\n' +
    '[this.selectedIndex].value);}else{return(false);}" name="url">\n' +
    '        <option selected="" value="">各区食品药品监督管理局</option>\n' +
    '        <option value="http://syj.beijing.gov.cn/dongcheng/index.html">东城区局</option>\n' +
    '        <option value="http://syj.beijing.gov.cn/xicheng/index.html">西城区局</option>\n' +
    '        <option value="http://syj.beijing.gov.cn/chaoyang/index.html">朝阳区局</option>\n' +
    '        <option value="http://syj.beijing.gov.cn/haidian/index.html">海淀区局</option>\n' +
    '        <option value="http://syj.beijing.gov.cn/fengtai/index.html">丰台区局</option>\n' +
    '        <option value="http://syj.beijing.gov.cn/shijingshan/index.html">石景山区局</option>\n' +
    '        <option value="http://syj.beijing.gov.cn/mentougou/index.html">门头沟区局</option>\n' +
    '        <option value="http://syj.beijing.gov.cn/fangshan/index.html">房山区局</option>\n' +
    '        <option value="http://syj.beijing.gov.cn/tongzhou/index.html">通州区局</option>\n' +
    '        <option value="http://syj.beijing.gov.cn/shunyi/index.html">顺义区局</option>\n' +
    '        <option value="http://syj.beijing.gov.cn/daxing/index.html">大兴区局</option>\n' +
    '        <option value="http://syj.beijing.gov.cn/changping/index.html">昌平区局</option>\n' +
    '        <option value="http://syj.beijing.gov.cn/pinggu/index.html">平谷区局</option>\n' +
    '        <option value="http://syj.beijing.gov.cn/huairou/index.html">怀柔区局</option>\n' +
    '        <option value="http://syj.beijing.gov.cn/miyun/index.html">密云区局</option>\n' +
    '        <option value="http://syj.beijing.gov.cn/yanqing/index.html">延庆区局</option>\n' +
    '        <option value="http://syj.beijing.gov.cn/kaifaqu/index.html">经济技术开发区分局</option>\n' +
    '        <option value="http://syj.beijing.gov.cn/sazx/index.html">北京市食品安全监控和风险评估中心</option>\n' +
    '</select>\n' +
    '\n' +
    '             <!--各省网站--> \n' +
    '        <select onchange="if(value!=\'\'){window.open(this.options\n' +
    '[this.selectedIndex].value);}else{return(false);}" name="url">\n' +
    '        <option selected="" value="">各省食品药品监督管理局网站</option>\n' +
    '        <option value="http://www.tjmqa.gov.cn/">天津市</option>\n' +
    '        <option value="http://www.hebfda.gov.cn/">河北省</option>\n' +
    '        <option value="http://www.shxda.gov.cn/">山西省</option>\n' +
    '        <option value="http://www.nmfda.gov.cn/">内蒙古自治区</option>\n' +
    '        <option value="http://www.lnfda.gov.cn/CL0001/index.html">辽宁省</option>\n' +
    '        <option value="http://www.jlda.gov.cn/">吉林省</option>\n' +
    '        <option value="http://www.hljda.gov.cn/">黑龙江省</option>\n' +
    '        <option value="http://www.shfda.gov.cn/">上海市</option>\n' +
    '        <option value="http://www.jsfda.gov.cn/">江苏省</option>\n' +
    '        <option value="http://www.zjfda.gov.cn/">浙江省</option>\n' +
    '        <option value="http://www.ada.gov.cn/">安徽省</option>\n' +
    '        <option value="http://www.fjfda.gov.cn/">福建省</option>\n' +
    '        <option value="http://www.jxda.gov.cn/">江西省</option>\n' +
    '        <option value="http://www.sdfda.gov.cn/">山东省</option>\n' +
    '        <option value="http://www.hda.gov.cn/CL0001/">河南省</option>\n' +
    '        <option value="http://www.hubfda.gov.cn/structure/index.htm">湖北省</option>\n' +
    '        <option value="http://www.hn-fda.gov.cn/">湖南省</option>\n' +
    '        <option value="http://www.gdda.gov.cn/">广东省</option>\n' +
    '        <option value="http://www.gxfda.gov.cn/">广西省</option>\n' +
    '        <option value="http://www.hifda.gov.cn/">海南省</option>\n' +
    '        <option value="http://www.cqda.gov.cn/">重庆市</option>\n' +
    '        <option value="http://www.scfda.gov.cn/">四川省</option>\n' +
    '        <option value="http://www.gzhfda.gov.cn/">贵州省</option>\n' +
    '        <option value="http://www.yp.yn.gov.cn/">云南省</option>\n' +
    '        <option value="http://www.xizangfda.gov.cn/">西藏自治区</option>\n' +
    '        <option value="http://www.sxfda.gov.cn/">陕西省</option>\n' +
    '        <option value="http://www.gsda.gov.cn/">甘肃省</option>\n' +
    '        <option value="http://www.sdaqh.gov.cn/">青海省</option>\n' +
    '        <option value="http://www.xjda.gov.cn/">新疆维吾尔自治区</option>\n' +
    '        <option value="http://www.nxfda.gov.cn/">宁夏回族自治区</option>\n' +
    '        </select>\n' +
    '                </div>\n' +
    '                <div class="ygcy_con">\n' +
    '                   <span class="zfjc fl"><script id="_jiucuo_" sitecode=\'1100000169\' src=\'http://pucha.kaipuyun.cn/exposure/jiucuo.js\'></script></span>\n' +
    '                   <div class="ygcy_focon">\n' +
    '                     <p class="ygcy_foconp1"><a href="/bjfda/gywm/index.html">关于我们</a>|<a href="/bjfda/xtbz/wzdt/index.html">网站地图</a>|<a href="/bjfda/lxwm/index.html">联系我们</a></p>\n' +
    '                      <p class="ygcy_foconp1"><span class="ygcy_fotconsp">政府网站标识码：1100000169 </span><span class="ygcy_fotconsp">京公网安备110102000155</span><span class="ygcy_fotconsp1">ICP备案编号：京ICP备14005922号－1</span></p> \n' +
    '                      <p class="ygcy_foconp1"><span class="ygcy_fotconsp">主办单位：北京市食品药品监督管理局</span></p>\n' +
    '                   </div>\n' +
    '                   <span class="dzjg fl">  <script type="text/javascript">document.write(unescape("%3Cspan id=\'_ideConac\' %3E%3C/span%3E%3Cscript src=\'http://dcs.conac.cn/js/01/000/0000/60425248/CA010000000604252480005.js\' type=\'text/javascript\'%3E%3C/script%3E"));</script></span>\n' +
    '                </div>\n' +
    '        </div>\n' +
    '</div>\n' +
    '<style>\n' +
    '        .ygcy_foot_top{background:#0154ad;width:100%;overflow:hidden;color:#fff;}\n' +
    '        .ygcy_contain{width:976px;margin:30px auto;}\n' +
    '        .ygcy_con{width:976px;color:#fff;font-size:16px;overflow:hidden;}\n' +
    '        .zfjc{display:inline-block;float:left;padding-top:12px;}\n' +
    '        .ygcy_focon{float:left;padding:0 8px 0 23px;width:755px;}\n' +
    '        .ygcy_foconp1{text-align:center; padding: 7px 0;}\n' +
    '        .ygcy_foconp1 a{font-size:16px;color:#fff;display: inline-block; padding: 0 10px;}\n' +
    '        .ygcy_fotconsp{font-size:16px;color:#fff;display: inline-block; padding-right:25px;}\n' +
    '        .ygcy_fotconsp1{font-size:16px;color:#fff;display: inline-block; }\n' +
    '        .dzjg{display:inline-block;float:left;} \n' +
    '        .demo{width:976px; height:20px; margin:20px auto; color:#787878;}\n' +
    '        .ygcy_yqljli1{display:inline-block;font-size:14px;color:#fff;padding-right:5px;}\n' +
    '        .sdzc{display:inline-block;font-size:14px;color:#fff;padding-right:5px;}\n' +
    '        .foot_gq{margin-right: 23px;width: 247px;}\n' +
    ' </style><div style="display:none" easysite="easysiteHiddenDiv">\n' +
    '<input type="hidden"  id="currentLoginUserLoginName"/>\n' +
    '<input type="hidden"  id="currentLoginUserLoginId"/>\n' +
    '</div> </body>\n' +
    '</html>\n';


let $ = cheerio.load(text);


function f() {
    return new Promise(function (isok, reject) {
        let arr = {};
        $('.table_sjcx').find('tr').each(function (item) {
            let pic = $(this);
            let thd = pic.find('th').text().replace(/\s+/g, '').replace(':', '');
            let td = pic.find('td').text().replace(/\s+/g, '');

            if (thd === '作出处罚的机关和决定日期') {
                td = td.split('--');
                console.log(td);
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
        arr['DATA_ID'] = uuid.v1();
        isok(arr);
    });
}

console.log(f().then(function (data) {
    console.log(data)
}));




