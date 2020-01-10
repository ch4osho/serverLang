<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" session="false"%>
<%@ page import="fai.comm.util.*"%>
<%@ page import="fai.web.*"%>
<%@ page import="fai.web.inf.*"%>
<%@ page import="java.util.*"%>
<%@ page import="fai.app.*"%>
<%@ page import="fai.cli.*"%>
<%@ page import="fai.webktu.*"%>
<%@ page import="fai.webktu.app.*"%>


<%if (!WebKtu.checkKtuAuthRedirectJs(response)){
        boolean isOem = WebKtu.isOem();
        String portalDomain= isOem ? Web.getOemPortalDomain() : Web.getPortalDomain();
        String ktuManageDomain = Web.getKtuManageDomain();
        int ktuId = Parser.parseInt(request.getParameter("id"), 0);
        int aid = Parser.parseInt(request.getParameter("_aid"), 0);
        String url = (Web.getDebug() ? "http://" : "https://")+ktuManageDomain+"/editor.jsp?id="+ ktuId + "&_aid=" + aid;
        //重新登录后跳转回此页面
        Response.addCookie(response, "callBackUrl", url, 3600, portalDomain, true);
        return;
}

%>

<%
    Boolean isDev = Web.getDebug();
    // 来自 上传后直接生成的快图
    boolean isFromUploadToCreate = Parser.parseBoolean(request.getParameter("fromUpload"), false);

    int ktuId = Parser.parseInt(request.getParameter("id"), 0);
    int istest = Parser.parseInt(request.getParameter("istest"), 0);
    int ktuAid = Parser.parseInt(request.getParameter("ktuAid"), 0);
    int faiscoAid = WebKtu.getAid();
    if(ktuAid == 0){
        ktuAid = WebKtu.getKtuAid();
    }
    KtuModule ktuModule = (KtuModule)WebKtu.getKtuKit(ktuAid, Kid.KTU_MODULE);

    SysKtuProf ktuProf = (SysKtuProf)Core.getSysKit(Kid.SYS_KTU_PROF);
    Param ktuProfInfo = ktuProf.getProf();
    Param ktuProfOther = Param.parseParam(ktuProfInfo.getString(KtuProfDef.Info.OTHER), new Param());
    ktuProfInfo.setParam(KtuProfDef.Info.OTHER, ktuProfOther);

    Ktu ktu = (Ktu)WebKtu.getKtuKit(ktuAid, Kid.KTU);

    if(ktuId == 0){
        out.print("<script>location.href = '/manage/ktuManage.jsp' </script>");
        return;
    }
    Log.logDbg("wbhwbhtest %s",ktuAid);

    //获取快图信息
    Param ktuInfo = ktu.getKtuInfo(ktuAid, ktuId, true);
    //  是否gif
    boolean isGif = Misc.checkBit(ktuInfo.getInt(KtuDef.Info.FLAG, 0), KtuDef.Flag.IS_GIF);
    ktuInfo.setBoolean("isGif", isGif);
    FaiList<Param> modules = ktuInfo.getList("tmpContents");
    //初始化系统素材收藏信息   start
    try{
        long collectStart = System.currentTimeMillis();
        KtuCollectFodder ktuCollectFodder = Core.getBsKit(ktuAid,KtuCollectFodder.class);
        FaiList<Param> contentList = null;
        FaiList<Param> objects = null;
        Param idInfo = null;
        for(Param content : modules){
            contentList = content.getList("content");
            for(Param objectParam : contentList){
                objects = objectParam.getList("objects",new FaiList<Param>());
                Param imageParam = null;
                String fileId = null;
                int app = 0;
                Param collectInfo = null;
                Boolean operator = false;
                for(Param object : objects){
                    operator = false;
                    String type = object.getString("type", "");
                    if(type == "" || "qr-code".equals(type) || "map".equals(type)){
                        operator = false;
                    } else {
                        fileId = object.getString("fileId", "");
                        imageParam = object.getParam("image", new Param());
                        if(fileId != null && !fileId.equals("")){
                            operator = true;
                        }else if(imageParam != null && !imageParam.isEmpty()){
                            fileId = imageParam.getString("fileId", "");
                            if(fileId != null && !fileId.equals("")){
                                operator = true;
                            }
                        }else{
                            operator = false;
                        }
                    }

                    if(operator){
                        idInfo = FileStgDef.parseFileId(fileId);
                        app = idInfo.getInt("app", 0);
                        //用isSystem是之前只能收藏系统素材，现在开放用户素材，就表意不明确了
                        if(app == 140 || app == 90 || app == 91){
                            object.setBoolean("canCollect", true);
                            collectInfo = ktuCollectFodder.getKtuCollectFodderInfo(ktuAid, fileId);
                            if(collectInfo != null && !collectInfo.isEmpty()){
                                object.setBoolean("isCollect", true);
                            }else{
                                object.setBoolean("isCollect", false);
                            }
                        }else{
                            object.setBoolean("canCollect", false);
                            continue;
                        }
                    }else{
                        object.setBoolean("canCollect", false);
                    }
                }
            }
        }
        long collectEnd = System.currentTimeMillis();
        Log.logStd("llddbb888 collect info time=%d",collectEnd - collectStart);
    } catch (Exception e){
        Log.logStd("init collectFodder info err;" + e);
        e.printStackTrace();
    }
    //初始化系统素材收藏信息   end
    int ktuFlag = ktuInfo.getInt(KtuDef.Info.FLAG,0);
    Param otherData = ktuInfo.getParam(KtuDef.Info.OTHER);
    String ktuTitle = Encoder.encodeHtml(otherData.getString(KtuDef.Other.TITLE));
    //快图是否被删除到回收站(逻辑删除)
    boolean isDelToRecyCle = Misc.checkBit( ktuFlag, KtuDef.Flag.DEL_TO_RECYCLE );

    if(isDelToRecyCle) {
        out.print("<script>location.href = '/manage/ktuManage.jsp' </script>");
        return;
    }


    FaiList<Integer> ktuModuleIds = ktuInfo.getList(KtuDef.Info.CONTENT, new FaiList<Integer>());

    if(ktuModuleIds.size() == 0){
        out.print("<script>location.href = '/manage/ktuManage.jsp' </script>");
        return;
    }

    boolean isFaier = WebKtu.isFaier();
    //来自第三方设计师
    Boolean isFromThirdDesigner = false;
    // 第三方设计师我的定制进来的
    boolean isFromCustomization = false;
    //看当前快图是否为第三方模版的快图
    int moduleType = ktuInfo.getInt(KtuDef.Info.MODULE, KtuDef.Module.THIRD_MODULE);
    if(!isFaier) {
        if(moduleType == KtuDef.Module.THIRD_MODULE) {
            isFromThirdDesigner = true;
            //KtuThirdCase ktuThirdCase = Core.getBsKit(Kit.Type.BS, KtuThirdCase.class);
            KtuThirdCase ktuThirdCase = (KtuThirdCase)WebKtu.getKtuKit(Kid.KTU_THIRD_CASE);
            //讲道理如果是第三方设计师模板审核通过或者是审核中的，此处get出来肯定有内容的
            Param ktuThirdCaseInfo = ktuThirdCase.getKtuThirdCaseInfo(ktuId);
            if(ktuThirdCaseInfo != null && !ktuThirdCaseInfo.isEmpty()) {
                int ktuCheckStatus = ktuThirdCaseInfo.getInt(FlyerThirdCaseDef.Info.CHECK_STATUS,0);
                int ktuFirstCheck = ktuThirdCaseInfo.getInt(FlyerThirdCaseDef.Info.FIRST_CHECK,0);
                if( ktuFirstCheck == FlyerThirdCaseDef.CheckStatus.CHECK_IN || (ktuFirstCheck == FlyerThirdCaseDef.CheckStatus.PASS && (ktuCheckStatus == FlyerThirdCaseDef.CheckStatus.PASS || ktuCheckStatus == FlyerThirdCaseDef.CheckStatus.CHECK_IN)) ) {
                    out.print("<script>location.href = '/manage/ktuManage.jsp' </script>");
                    return;
                }
            }
        } else if(moduleType == KtuDef.Module.THIRD_CUSTOM) {
            // 当前快图是否为第三方定制作品
            isFromThirdDesigner = true;
            isFromCustomization = true;
        }
    }

    boolean isUIManage = KtuVerAuth.isUIManage(ktuAid);
    boolean isUIManageForWhite = KtuVerAuth.isUIManageForWhite(ktuAid);
    boolean isOem = WebKtu.isOem();
    String portalHost = isOem ? Web.getOemPortalHost() : Web.getPortalHost();

    //前端兼容性组件的js文件路径
    String browserCkeckScript = FrontEndDef.getBrowserCheckScript("browserChecked_1_0");

    //int theme = ktuProfOther.getInt(KtuProfDef.Other.THEME, 1);
    int theme = 1;

    //重新生成svgData逻辑处理
    // //首次加载进来进行svgData的存储。为旧用户创建的快图服务端下载pdf做兼容
    //使用时间保存有个遗漏的点：如果是临时上线，并且用户没刷新页面呢？
    //KtuDef.Info.COMPATIBLE_TIME  兼容时间，为了解决svgData首次保存的兼容（即生成pdf兼容）
    boolean saveSvgData = false;
    //if(ktuAid == 34 || ktuAid == 64 || isUIManage || Web.getDebug()){
        Calendar compareCalendar = Calendar.getInstance();
        compareCalendar.set(2018, 7, 29, 15, 50, 0); // 2018 08 29 15 50 0
        Calendar updateTime = ktuInfo.getCalendar(KtuDef.Info.COMPATIBLE_TIME, compareCalendar);
        long compareTimestamp = compareCalendar.getTimeInMillis();

        if ((updateTime.getTimeInMillis() <= compareTimestamp)) {
            saveSvgData = true;
        }
    //}
    boolean debugUser = true;
    //if(ktuAid == 34 || ktuAid == 64 || isUIManage || Web.getDebug()){
    //    debugUser = true;
    //}

    FaiList<Param> templateUseList = KtuTemplateDef.getTemplateUSE();

    ktuInfo.setString("identifier", Integer.toString(ktuAid, 32) + "Z" + Integer.toString(ktuId, 32));
    ktuInfo.setInt("faiscoAid", faiscoAid);

    //是否需要管理态新手引导
    boolean needEditorGuide = false;
    {
        int flyerProfFlag = ktuProfInfo.getInt(KtuProfDef.Info.FLAG, 0);
        Calendar creatTime = ktuProfInfo.getCalendar(KtuProfDef.Info.CREATE_TIME,Calendar.getInstance());
        boolean isDoneEditorGuide = Misc.checkBit(flyerProfFlag, KtuProfDef.Flag.IS_DONE_EDITOR_GUIDE);
        if(Web.getDebug()){//2018-11-06 --> 1541462400
            needEditorGuide = creatTime.getTimeInMillis()/1000 > 1541462400  && !isDoneEditorGuide && !isFaier;
        }else{//2018-11-12 --> 1541980800
            needEditorGuide = creatTime.getTimeInMillis()/1000 > 1541980800  && !isDoneEditorGuide && !isFaier;
        }
    }

    // 是否是内部账号
    Param acctInfo = WebKtu.getAcctInfo(faiscoAid);
    if(Str.isEmpty(acctInfo)){
        acctInfo = new Param();
    }
    int acctFlag = acctInfo.getInt(AcctDef.Info.FLAG, 0);
    boolean isInternalAcct = Misc.checkBit(acctFlag, AcctDef.Flag.Corp.INTERNAL);
    // 是否是第三方设计师账号
    boolean isThirdDesigner = WebKtu.isThirdDesignerAcct(faiscoAid);
    //判断第三方设计师帐号的状态，具体看方法内定义
    int isThirdStatus = WebKtu.thirdDesignerAcctCheck();

    //是否是第三方搭建设计师
    boolean isBuildThirdDesigner = WebKtu.isBuildThirdDesigner();

    Param tmpKtuParam = new Param();
    if(isFaier){
        int ktuProfFlag = ktuProfInfo.getInt(KtuProfDef.Info.FLAG,0);

        boolean closeKtu = Misc.checkBit(ktuProfFlag,KtuProfDef.Flag.KTU_CLOSE);

        boolean stopStatus = Misc.checkBit(ktuFlag,KtuDef.Flag.PUBLISH_STATUS);

        Param other = ktuInfo.getParam(KtuDef.Info.OTHER);

        tmpKtuParam.setBoolean("closeKtu",closeKtu);
        tmpKtuParam.setBoolean("stopStatus",stopStatus);
        tmpKtuParam.setParam("other",other);
    }

    // 开通快图
    {
        // 开通来源
        int refer = Parser.parseInt(request.getParameter("refer"), 0);
        int openFrom = Parser.parseInt(request.getParameter("openFrom"), 0);
        int ktuProfFlag = ktuProfInfo.getInt(KtuProfDef.Info.FLAG,0);
        boolean ktuOpening = Misc.checkBit(ktuProfFlag, KtuProfDef.Flag.KTU_OPPENING);
        if (!ktuOpening) {
            // 把ktuProf 的 开通flag置起来
            Param info = new Param();
            ParamUpdater ktuProfUpdater = new ParamUpdater(info);
            int flagOr = 0;
            flagOr |= KtuProfDef.Flag.KTU_OPPENING;
            if (flagOr != 0) {
                ktuProfUpdater.add(KtuProfDef.Info.FLAG, ParamUpdater.LOR, flagOr);
            }
            info.setCalendar(KtuProfDef.Info.CREATE_TIME, Calendar.getInstance());
            //生成flyerAid，要重新获取flyerProf数据
            int rt = ktuProf.setProf(ktuProfUpdater);
            Param ktuProfParam = ktuProf.getProf(faiscoAid);
            ktuAid = ktuProfParam.getInt(KtuProfDef.Info.KTU_AID, 0);


            Param openKtu = new Param();
            //开通微传单时间
            Calendar openKtuCal = Calendar.getInstance();
            int openKtuTime = (int) (openKtuCal.getTimeInMillis() / 1000); // 获取秒
            openKtu.setInt("openType",5);//开通类型5代表开通快图
            openKtu.setInt("openTime",openKtuTime);
            openKtu.setInt("openFrom", openFrom);
            openKtu.setInt("openClient", 2);  // 小程序开通终端， 默认2是PC，1是小程序
            Oss.logBss(0, Oss.Bss.OPEM_PRODUCT,faiscoAid, openKtu.toJson());
            ktuOpening = true;

            App.logDog(8000200, 0);
            App.logDog(8000199, 0);
            App.logDog(8000175, refer);
        }

    }

    boolean isMiddleAcct = KtuVerAuth.middleAcct(ktuAid);
    out.clear();

    String resourceId = isDev ? "AIwBCAAQAhgAIOvN-OsFKKuB-8IBMOgHOPQD" : "AIwBCAAQAhgAILmCoewFKML8lcEDMOgHOPQD";
    String fodderPath = FileStg.getFodderFileUrl(1, 0, resourceId);

	SysKtuCms sysKtuCms = (SysKtuCms)Core.getSysKit(Kid.SYS_KTU_CMS);
	FaiList<Param> allTemplateInfoList = sysKtuCms.getKtuAllTemplateDefInfo(new Param());

    //是否商务合作帐号
    Boolean isPartner = WebKtu.isPartner(faiscoAid);
%>
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="renderer" content="webkit" />
    <meta content="always" name="referrer">
    <%if(Web.getDevDebug()){%>
        <script src="//fe.aaadns.com/browserChecked_1_0/js/browserCheck.src.js?v=20180110"></script>
    <%} else{%>
            <%=browserCkeckScript%>
    <%}%>
    <script>

        var browserInfo = BrowserChecked({
            supportList: [{
                name: "chrome",
                // version: "35"
                version: "50"
            },{
                name: "opera",
                version: "50"
            },{
                name: "firefox",
                version: "60"
            },{
                name: "safari"
            }]
        });
        if (!browserInfo.isSupport) {
            window.location.href = "/lvBrowser.jsp?url=" + encodeURIComponent(location.pathname + location.search);
        }
    </script>
    <%=FrontEndDef.getJSsdkComponentScript(6007, faiscoAid, ktuAid,ktuId, 0)%>
    <%=Web.getToken()%>
    <%
    //设计师样板模板
    String __tmpfaiscoAidString = "";
    if(Session.getAid() == 1){
        __tmpfaiscoAidString="<meta id=\"__tmpfaiscoAid\" value=\""+faiscoAid+"\" />";
    }
    %>
    <%=__tmpfaiscoAidString%>

    <title><%=ktuTitle+"-凡科快图"%></title>
    <link href="<%=KtuResDef.getResPath("tmpeditor-"+theme)%>" rel="stylesheet" id="initialStyle"/>

</head>
<body>
	<div id="web-loading" class="ktu-loading f_DNSTraffic">
	    <div class="loading-box full">
            <div class="loading-circle loading-circle-3"></div>
            <div class="loading-circle loading-circle-2"></div>
            <div class="loading-circle loading-circle-1"></div>
            <div class="loading-icon"></div>
	    </div>
	</div>

	<div id="ktu" class="ktu f_DNSTraffic">
	    <%-- <link-theme></link-theme> --%>
	    <svg-sprite></svg-sprite>

	    <transition name="nav-area">
	        <nav-area v-if="hasLoaded"></nav-area>
	    </transition>

	    <transition name="ele-area">
	        <ele-area v-if="hasLoaded"></ele-area>
	    </transition>

	    <!-- <transition name="edit-area" appear> -->
	    <edit-area></edit-area>
	    <!-- </transition> -->
        <%if(isFaier && !isMiddleAcct && !isUIManage){%>
        <div style="z-index:1;margin:10px auto;height:30px;">
            <div style="display:inline-block;"><input id="ossCloseKtu" type="button" onfocus='this.select()' onclick="ossCloseKtu()" value="" style="width:140px;padding:4px 30px;cursor:pointer;background: white"></div>
            <div style="display:inline-block;"><input id="ossSetStatus" type="button" onfocus='this.select()' onclick="ossSetStatus()" value="" style="width:140px;padding:4px 30px;cursor:pointer;background: white"></div>

        </div>
        <%}%>
	    <transition name="page-area">
	        <page-area v-if="hasLoaded"></page-area>
	    </transition>

	    <drop-upload></drop-upload>

	    <!-- 主要用于放置弹窗类的页面 -->
	    <pop-up></pop-up>

	    <!-- <transition name="fade">
	        <div v-show="showMask" class="mask" v-cloak></div>
	    </transition> -->
	</div>


    <script>
        document.domain = "<%=Web.getPortalDomain()%>";
        var Ktu = {};
        Ktu.mixins = {};
        Ktu.directive = {};
        Ktu.storeModule = {};

        Ktu.initialData = {};
        Ktu.initialData.resRoot = '<%=FileStg.getKtuResRoot()%>';
        Ktu.initialData.token = document.getElementById("_TOKEN").getAttribute("value");
        Ktu.initialData.flyerFontList = <%=KtuFontDef.getFontDefList().toJson()%>;
        Ktu.initialData.themeConfig = {
            '0': {
                name: 'dark',
                editCenterBg: 'rgba(29, 29, 30, 0.95)',
                path: '<%=KtuResDef.getResPath("editor-0")%>'
            },
            '1': {
                name: 'light',
                editCenterBg: 'rgba(220, 220, 220,.9)',
                path: '<%=KtuResDef.getResPath("editor-1")%>'
            }
        };
        Ktu.initialData.theme = <%=theme%>;
        Ktu.initialData.fodderPath = "<%=fodderPath%>";
        Ktu.userData = <%=ktuProfInfo%>;
        Ktu.ktuData = <%=ktuInfo%>;
        Ktu.fontSvgPath = "<%=KtuResDef.getResPath("ktuFontSvg")%>";

        Ktu.ktuId = <%=ktuId%>;
        Ktu.ktuAid = <%=ktuAid%>;
        Ktu.portalHost = "<%=portalHost%>";
        Ktu.domain = "<%=Web.getPortalDomain()%>";
        Ktu.desHost = "<%=Web.getDesHost()%>";
        Ktu.isUIManage = <%=isUIManage%>;
        Ktu.isUIManageForWhite = <%=isUIManageForWhite%>;
        Ktu.isFaier = <%=isFaier%>;
        Ktu.isFromThirdDesigner = <%=isFromThirdDesigner%>;
        Ktu.isThirdDesigner = <%=isThirdDesigner%>;
        Ktu.isThirdStatus = <%=isThirdStatus%>;
        Ktu.isBuildThirdDesigner = <%=isBuildThirdDesigner%>
        Ktu.isPartner = <%=isPartner%>;
		Ktu.allTemplateInfoList = <%=allTemplateInfoList%>;

        Ktu._ktuParamDef = <%=KtuModuleDef.getParamDef()%>;
        Ktu._saveSvgData = <%=saveSvgData%>;
        Ktu._debugUser = <%=debugUser%>;

        Ktu.templateList = <%=templateUseList%>;
        Ktu._needEditorGuide = <%=needEditorGuide%>;

        Ktu._isInternalAcct = <%=isInternalAcct%>;

        Ktu.isDevDebug = <%=Web.getDevDebug()%>;

        Ktu.lazyJSPath = {
            "psd": "<%=FileStg.getKtuResRoot()%>/js/comm/psd.min.js?v=201811121650",
            "newpsd": "<%=KtuResDef.getResPath("newpsd")%>",
            "jqueryQrcode": "<%=KtuResDef.getResPath("jqueryQrcode")%>",
            "artQrcode": "<%=KtuResDef.getResPath("artQrcode")%>",
            "ktWordCloud": "<%=KtuResDef.getResPath("ktWordCloud")%>",
            "mapapi": "https://webapi.amap.com/maps?v=1.4.15&key=db9431983fa318e182fed973b3a42d85&plugin=AMap.Geocoder",
        };

        Ktu.manageDomain = "<%=Web.getKtuManageDomain()%>";

        Ktu.webWorkerPath = {
            threeText: '//<%=Web.getKtuManageDomain()%>/webWorker/ThreeText/ThreeTextWorker.js?v=201912041701',
        };

        /* if (Ktu.initialData.token == '0fadaaa81f6d0e08851ba7015806ffc8') {
            Ktu.webWorkerPath.threeText = '//<%=Web.getKtuManageDomain()%>/webWorker/ThreeText/worker.src.js';
        } */
        Ktu.isFromUploadToCreate = <%=isFromUploadToCreate%>;
        Ktu.isFromCustomization = <%=isFromCustomization%>;

        Ktu._isUserB = <%=faiscoAid%2==1%>;
        Ktu.isDev = <%=isDev%>;
    </script>
    <script src="<%=KtuResDef.getResPath("js_editor_common")%>"></script>
    <script src="<%=KtuResDef.getResPath("three")%>"></script>

	<%-- <script src="<%=KtuResDef.getResPath("vue")%>"></script> --%>
	<%-- <script src="<%=KtuResDef.getResPath("vuex")%>"></script> --%>
    <%-- <script src="<%=KtuResDef.getResPath("vue-resource")%>"></script> --%>
    <%-- <script src="<%=KtuResDef.getResPath("qs")%>"></script> --%>
    <%-- <script src="<%=KtuResDef.getResPath("axios")%>"></script> --%>
    <%-- <script src="<%=KtuResDef.getResPath("vue-waterfall")%>"></script> --%>
    <%-- <script src="<%=KtuResDef.getResPath("vue-ripple")%>" defer></script> --%>
    <%-- <script src="<%=KtuResDef.getResPath("vue-draggable")%>"></script> --%>
	<%-- <script src="<%=KtuResDef.getResPath("polyfill")%>"></script> --%>
	<%-- <script src="<%=KtuResDef.getResPath("iviewjs")%>" defer></script>
	<script src="<%=KtuResDef.getResPath("fabricjs")%>"></script> --%>
    <%-- <script src="<%=KtuResDef.getResPath("jquery")%>"></script> --%>
	<%-- <script src="<%=KtuResDef.getResPath("uploadify")%>"></script> --%>

    <%-- <script  src="https://webapi.amap.com/maps?v=1.4.15&key=db9431983fa318e182fed973b3a42d85&plugin=AMap.Geocoder"></script> --%>

    <% if(isFaier){ %>

    <script type="text/javascript">
        var tmp_isFromOss = <%=isFaier%>;
        var ktu_oss_tmpKtuParam = <%=tmpKtuParam.toJson()%>;
        var ktu_oss_faiscoaid = <%=faiscoAid%>;
        var ktu_oss_ktuAid = <%=ktuAid%>;
        var ktu_oss_ktuId = <%=ktuId%>;

        $(function(){
            if(tmp_isFromOss) {
                isOpenKtu(ktu_oss_tmpKtuParam.closeKtu);
                isSetStatus(ktu_oss_tmpKtuParam.stopStatus);
            }
        });

        function isSetStatus(ktuClose) {
            if(ktuClose) {
                $('#ossSetStatus').val('解封快图');
            } else {
                $('#ossSetStatus').val('封禁快图');
            }
        }

        function isOpenKtu(ktuClose) {
            if(ktuClose) {
                $('#ossCloseKtu').val('开启账号');
            } else {
                $('#ossCloseKtu').val('关闭账号');
            }
        }

        function ossSetStatus() {
            function getWillSetStatus(stopStatus){
                if(stopStatus){
                    $('#ossSetStatus').val('封禁快图');
                    return "恢复上线";
                }else{
                    $('#ossSetStatus').val('解封快图');
                    return "强制下线";
                }
            }
            if (!confirm("确定设置为"+getWillSetStatus( ktu_oss_tmpKtuParam.stopStatus )+"？")){
                return;
            }
            var updateStopStatus = false;
            updateStopStatus = !ktu_oss_tmpKtuParam.stopStatus;
            var other = ktu_oss_tmpKtuParam.other;
            if(other.closeReasonId != undefined){
                other.closeReasonId = 1;
            }

            if(updateStopStatus){
                other.closeReasonId = 1;
            }else{
                other.closeReasonId = 0;
            }

            $.ajax({
                type: "post",
                url: '/ajax/ktuOss_h.jsp',
                data: 'cmd=setStatus'+'&ktuAid='+Ktu.encodeUrl(ktu_oss_ktuAid)+'&ktuId='+Ktu.encodeUrl(ktu_oss_ktuId)+'&updateStopStatus='+Ktu.encodeUrl(updateStopStatus)+'&other='+encodeURIComponent(($.toJSON(other))),
                error: function(){alert("服务繁忙，请稍候重试");},
                success: function(result){
                    result = jQuery.parseJSON(result);
                    alert(result.msg);
                    if (result.success) {
                        //flyerList[index].publishStatus = other.publishStatus;
                        ktu_oss_tmpKtuParam.stopStatus = updateStopStatus;
                    }
                }
            });
        }

        //oss管理员关闭账号
        function ossCloseKtu() {
            var tmpKtuClose = false;
            if(!ktu_oss_tmpKtuParam.closeKtu) {
                if (!confirm("关闭该账号？")){
                        return;
                    }
                ktu_oss_tmpKtuParam.closeKtu = true;
            } else {
                if (!confirm("开启该账号？")){
                    return;
                }
                ktu_oss_tmpKtuParam.closeKtu = false;
                tmpKtuClose = true;
            }
            $.ajax({
                type: "post",
                url: '/ajax/ktuOss_h.jsp',
                data: 'cmd=setCloseKtu'+'&aid='+Ktu.encodeUrl(ktu_oss_faiscoaid)+'&ktuClose='+Ktu.encodeUrl(ktu_oss_tmpKtuParam.closeKtu),
                error: function(){alert("服务繁忙，请稍候重试");},
                success: function(result){
                    result = jQuery.parseJSON(result);
                    alert(result.msg);
                    if (result.success) {
                        if(tmpKtuClose) {
                            $('#ossCloseKtu').val('关闭账号');
                        } else {
                            $('#ossCloseKtu').val('开启账号');
                        }
                    }
                }
            });
        }
    </script>

    <%}%>
	<%-- <script src="<%=KtuResDef.getResPath("newUploadify")%>"></script> --%>
	<%-- <script src="<%=KtuResDef.getResPath("mousewheel")%>"></script> --%>
    <%-- <script src="<%=KtuResDef.getResPath("loadimage")%>"></script> --%>
	<%-- <script src="<%=KtuResDef.getResPath("opentype")%>"></script> --%>
    <%-- <script src="<%=KtuResDef.getResPath("mousetrap")%>"></script> --%>
    <%-- <script src="<%=KtuResDef.getResPath("filesaver")%>"></script> --%>
    <%-- <script src="<%=KtuResDef.getResPath("popper")%>" defer></script> --%>
    <script src="<%=KtuResDef.getResPath("manage")%>"></script>
    <%-- <script src="<%=KtuResDef.getResPath("masonry")%>" defer></script> --%>
    <%-- <script src="<%=KtuResDef.getResPath("lodash")%>"></script> --%>
    <script src="<%=KtuResDef.getResPath("tmpktuEditor")%>" crossorigin="anonymous"></script>
    <%-- <script src="<%=KtuResDef.getResPath("jqueryQrcode")%>"></script> --%>
    <%-- <script src="<%=KtuResDef.getResPath("artQrcode")%>"></script> --%>
    <%-- <script src="<%=KtuResDef.getResPath("ktWordCloud")%>"></script> --%>
</body>
</html>

<%
    //这个iframe是为了做svgData数据兼容而做的
    if(saveSvgData){
%>
<iframe class="f_DNSTraffic" src="compatiblePage.jsp?id=<%=ktuId%>&111" style="position: absolute;z-index: -99999;top:100%;"></iframe>
<%
    }
%>