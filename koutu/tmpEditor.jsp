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
    int id = Parser.parseInt(request.getParameter("id"), 0);
    boolean test = Parser.parseBoolean(request.getParameter("test"), false);

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
    //写入cookie，3为8000447的srcId
    Response.addCookie(response, "ktuToolId", "1");
%>
<!DOCTYPE html>
<html lang="zh-Hans">
    <head>
        <title>凡科快图--智能抠图</title>
        <meta charset="utf-8" />
        <meta content="IE=edge"
            http-equiv="X-UA-Compatible" />
        <meta content="width=device-width, initial-scale=1"
            name="viewport" />
        <link href="<%=KtuResDef.getResPath("tmpKouTuCss")%>"
            rel="stylesheet"
            type="text/css" />
        <script type="text/javascript">
            let Ktu = {};
            Ktu.clipImageInfo = {
                id: Number(<%=id%>),
                secret: "<%=secret%>",
                url: "<%=url%>",
                name: "<%=name%>",
                fileId: "<%=fileId%>"
            }
            Ktu.mixins = {};
            Ktu.directive = {};
            Ktu.storeModule = {};
        </script>
        <%=Web.getToken()%>
    </head>
    <body id="main">
        <%@ include file="/koutu/inc/svgSprite.jsp.inc" %>
        <div class="page" id="ktu">
            <page-loading></page-loading>
            <top-bar></top-bar>
            <div id="AppContent" class="app-content-sized noselect" v-on:keyup="changeAction($event)">
                <div id="AppView" class="canvas-view app-view-sized pan-tool" ref="AppView" 
                v-on:mousedown="mouseStart($event)" 
                v-on:mouseup="mouseUp($event)" 
                v-on:mousemove="mouseMove($event)" 
                v-on:mousewheel="mouseWheel($event)" 
                v-on:mouseout="mouseOut()">
                    <canvas id="origin-canvas" ref="originCanvas" class="origin-canvas" width="658" height="877" >
                    </canvas> 
                    <canvas id="target-canvas" ref="targetCanvas" class="target-canvas" width="658" height="877" style="left: 658px;">
                    </canvas>
                </div>
            </div>
        </div>
        <script src="<%=KtuResDef.getResPath("vue")%>"></script>
        <script src="<%=KtuResDef.getResPath("vuex")%>"></script>
        <script src="<%=KtuResDef.getResPath("axios")%>"></script>
        <script src="<%=KtuResDef.getResPath("polyfill")%>"></script>
        <script src="<%=KtuResDef.getResPath("tmpKouTu")%>"></script>
    </body>
</html>