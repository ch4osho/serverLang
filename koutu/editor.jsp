<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" session="false"%>
<%@ page import="fai.comm.util.*"%>
<%@ page import="fai.web.*"%>
<%@ page import="fai.web.inf.*"%>
<%@ page import="java.util.*"%>
<%@ page import="java.net.*"%>
<%@ page import="java.io.*"%>
<%@ page import="java.text.SimpleDateFormat"%>
<%@ page import="fai.app.*"%>
<%@ page import="fai.cli.*"%>
<%@ page import="java.nio.*"%>
<%@ page import="fai.web.KtuFileTool"%>
<%@ page import="fai.webktu.*"%>
<%@ page import="fai.webktu.app.*"%>

<%if (!WebKtu.checkKtuAuthRedirectJs(response)) return;%>
<%
    String secret = Parser.parseString(request.getParameter("secret"),null);
    String fileId = Parser.parseString(request.getParameter("fileId"),null);
    String cutouId = Parser.parseString(request.getParameter("cutouId"),"");
    int id = Parser.parseInt(request.getParameter("id"), 0);
    boolean test = Parser.parseBoolean(request.getParameter("test"), false);
    boolean fromModal = Parser.parseBoolean(request.getParameter("fromModal"), false);
    
    int ktuAid = WebKtu.getKtuAid();
    //通过fileId获取资源链接
    String url = FileStg.getKtuCutoutFileUrl(ktuAid, fileId);
    KtuCutoutImg ktuCutoutImg = (KtuCutoutImg)WebKtu.getKtuKit(Kid.KTU_CUTOUT_IMG);
    Param cutoutImgInfo = ktuCutoutImg.getImgInfo(fileId);
    if(cutoutImgInfo == null) {
        cutoutImgInfo = new Param();
    }
    String name = cutoutImgInfo.getString(KtuCutoutImgDef.Info.NAME, "");
    Log.logDbg("dmsdmstest ktuAid=%s;fileId=%s;url=%s;name=%s;cutoutImgInfo=%s",ktuAid,fileId,url,name,cutoutImgInfo.toJson());

    int faiscoAid = WebKtu.getAid();

    int userNameId = Parser.parseInt(request.getParameter("userNameId"), 0);
%>



<!DOCTYPE html>
<html lang="en">
    <head>
        <title>智能抠图-凡科快图</title>
        <%=Web.getToken()%>
    </head>

    <body>
        <div id="app"></div>
        <script src="<%=KtuResDef.getResPath("jquery")%>"></script>
        <script>
            if (typeof module === 'object') {
                window.jQuery = window.$ = module.exports
            }
        </script>
        <script src="<%=KtuResDef.getResPath("clippingMagic")%>"></script>

        <%=FrontEndDef.getJSsdkComponentScript(6015, faiscoAid, ktuAid,0, 0)%>
        <script type="text/javascript">


            const id = Number(<%=id%>)
            const secret = "<%=secret%>";
            const url = "<%=url%>";
            const name = "<%=name%>";
            const fileId = "<%=fileId%>";
            const fromModal = <%=fromModal%>;
            const cutouId = "<%=cutouId%>";




            var globalIsSend = false;
            let apiId = <%=userNameId%>;
            const errorsArray = ClippingMagic.initialize({
                apiId: apiId
            });
            $.ajax({type: "POST",
                    url: "/ajax/ktuCutoutImg_h.jsp?cmd=getClippingCheck&userNameId="+ apiId
                }).then(res=>{
                    let result = JSON.parse(res);
                    if(result.success){
                        globalIsSend = result.isSend;
                    }
                })
            if (errorsArray.length > 0)
                alert(
                    '对不起，您的浏览器缺少一些要求的功能: \n\n ' +
                        errorsArray.join('\n ')
                )
                
            $(document).ready(function() {
                function getQueryString(name) {
                    const reg = new RegExp(
                        '(^|&)' + name + '=([^&]*)(&|$)',
                        'i'
                    )
                    const r = window.location.search.substr(1).match(reg)
                    if (r != null) return unescape(r[2])
                    return null
                }
                const id = Number(<%=id%>)
                const secret = "<%=secret%>";
                const url = "<%=url%>";
                const name = "<%=name%>";
                const fileId = "<%=fileId%>";
                const test = getQueryString('test') || true;
                const fromModal = <%=fromModal%>;
                const cutouId = "<%=cutouId%>";

                console.log(secret)
                console.log(url)
                console.log(name)
                console.log(fileId)
                console.log(test)





                ClippingMagic.edit(
                    {
                        image: {
                            id: id,
                            secret: secret,
                            test: test,
                            url:url,
                            fromModal:fromModal,
                            cutouId: cutouId,
                            fileId,
                            name,
                            globalIsSend,
                            apiId,
                        },
                        locale: 'zh-Hans-CN'
                    },
                    callback
                )

                function callback(res) {
                    if (res.event === 'error') {
                        alert(res.error.message)
                    } else if (res.event === 'result-generated'||res.event === 'GenerateResult') {
                        const data = res.image
                        if(globalIsSend){
                            $.ajax({
                                type: "POST",
                                url: "/ajax/ktuCutoutImg_h.jsp?cmd=clippingDownload&id="+ id+"&userNameId="+apiId
                            })
                        }
                    } else if (res.event === 'editor-exit') {
                        alert('您退出了编辑器')
                        location.href = window.location.origin + '/manage/ktuManage.jsp#/matting/index';
                    }
                }

                function getProxyPath(domain) {
                    let proxyPath = ''

                    if (domain === 'default') {
                        proxyPath = '/downloads/'
                    } else if (domain.indexOf('unsplash.com') > -1) {
                        proxyPath = '/unsplashdownloads/'
                    } else if (domain.indexOf('pixabay.com') > -1) {
                        proxyPath = '/pixabaydownloads/'
                    }

                    return proxyPath
                }

                function downloadImage(url, fn, extension, options = {}) {
                    let alink = document.createElement('a')

                    document.body.appendChild(alink)

                    alink.style.display = 'none'

                    let extensionName = ''
                    let extensionRegExp = new RegExp('^[A-Za-z]+$')
                    let extensionString = extension
                        ? extension
                        : url.replace(/.+\./, '')

                    if (extensionRegExp.test(extensionString)) {
                        extensionName = '.' + extensionString
                    } else {
                        extensionName = ''
                    }

                    let downloadName =
                        options.downloadName ||
                        'BSL' + new Date().getTime() + extensionName

                    let domainRegExp = new RegExp(
                        '^((http://)|(https://))?([a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,6}(/)'
                    )

                    let domainMatch = url.match(domainRegExp)

                    let proxyPath = getProxyPath('default')
                    alink.href = url.replace(domainMatch[0], proxyPath)
                    simulateDownload(alink, fn, downloadName, {
                        extensionName: extensionName
                    })
                }

                function simulateDownload(
                    alink,
                    callback,
                    downloadName,
                    options = {}
                ) {
                    if (window.browser && window.browser.firefox > 0) {
                        alink.download = downloadName
                        let clickEvent = new MouseEvent('click')
                        alink.dispatchEvent(clickEvent)
                    } else if (window.browser && window.browser.safari > 0) {
                        alink.target = '_blank'
                        alink.addEventListener('click', (event) => {}, false)
                        let clickEvent = new MouseEvent('click', {
                            altKey: true
                        })

                        alink.dispatchEvent(clickEvent)
                    } else {
                        alink.download = downloadName

                        if (window.desktop && window.desktop.electron > 0) {
                            alink.download += options.extensionName || ''
                        }

                        alink.target = '_blank'
                        alink.addEventListener('click', (event) => {}, false)
                        let clickEvent = new MouseEvent('click', {
                            altKey: true
                        })

                        alink.dispatchEvent(clickEvent)
                    }

                    callback && callback()
                }
            })
        </script>
    </body>
</html>
