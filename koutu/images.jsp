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
<!DOCTYPE html>
<html lang="zh-Hans">

<head>
    <meta charset="utf-8" />
    <meta content="IE=edge"
        http-equiv="X-UA-Compatible" />
    <meta content="width=device-width, initial-scale=1"
        name="viewport" />
    <meta content="yes"
        name="apple-mobile-web-app-capable" />
    <meta content="yes"
        name="mobile-web-app-capable" />
    <meta content="default"
        name="apple-mobile-web-app-status-bar-style" />
    <meta content="Clipping Magic"
        name="apple-mobile-web-app-title" />
    <link href=""
        rel="apple-touch-icon" />
    <link href=""
        rel="shortcut icon"
        type="image/vnd.microsoft.icon" />
    <link href="<%=KtuResDef.getResPath("ktkoutu")%>"
        rel="stylesheet"
        type="text/css" />
    <script type="text/javascript">
        var Globals = {
            s3_url: 'https:\/\/dyl80ryjxr1ke.cloudfront.net\/',
            BackgroundColors: [
                'rgba(255,255,255,0.000000)',
                'rgba(255,255,255,1.000000)',
                'rgba(128,128,128,1.000000)',
                'rgba(0,0,0,1.000000)',
                'rgba(166,85,55,1.000000)',
                'rgba(166,137,55,1.000000)',
                'rgba(63,149,49,1.000000)',
                'rgba(137,174,200,1.000000)'
            ],
            BackgroundColor: 'rgba(255,255,255,0.000000)',
            UseHair: true,
            Bulk: {
                isUpload: false,
                isApi: false,
                isApiSingle: false,
                isClip: false,
                isIframe: false,
                ClipImages: [],
                MinId: 0
            },
            targetOrigin: '*',
            webWorkers: {
                perspectiveshadow_js:
                    '\/\/dyl80ryjxr1ke.cloudfront.net\/p\/assets\/m\/PerspectiveShadow.min_717f35e0da6fc6eef1601f504adab83b.js'
            },
            isDev: false,
            NumPuntsWhenWorkersBusy: 2
        };
        let Ktu = {};
        Ktu.resRoot = '<%=FileStg.getKtuResRoot()%>';
    </script>
    <%=Web.getToken()%>
    <script src="<%=KtuResDef.getResPath("ktukoutu")%>"
        crossorigin = "anonymous" ></script>
    </script>
    <!-- <link rel="stylesheet" href="https://use.typekit.net/voi2vua.css" />
    <meta name="p:domain_verify" content="cc652cf49ce1943550001c7b7cfe2652" /> -->
    <!--[if lt IE 9]>
            <script
                src="//oss.maxcdn.com/libs/html5shiv/3.7.3/html5shiv.js"
                type="text/javascript"
            ></script>
            <script
                src="//oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"
                type="text/javascript"
            ></script>
        <![endif]-->
    <script type="text/javascript">
            var GlobalsEx = {
            stickySettings: '',
            hasCreditsLeft: false,
            Bulk_isAllowed: false,
            showTutorial: true,
            showGuides: true,
            hasSavedMask: false
        }
        var I18nPhrases = {
            Enable: '启用',
            'Failed to send message to worker.':
                '未能将讯息发送给工作人员。',
            '{0} object': '{0}对象',
            'Unable to connect to the worker. Is your firewall or proxy blocking WebSockets?':
                '无法与工作人员连接。您的防火墙或网络代理在阻止 WebSockets 吗？',
            Bottom: '底部',
            'Terribly sorry, but your browser appears to be missing key feature(s) required to use this website:':
                '非常抱歉，似乎您的浏览器缺少使用本网站要求的重要功能：',
            On: '打开',
            Lossy: '有损',
            'levels adjusted': '已调整的水平',
            "Pasted something that wasn't an image or URL?":
                '粘贴了并非图像或 URL 的内容？',
            'opaque background': '不透明背景',
            'Unsupported Browser': '不受支持的浏览器',
            'Failed to parse JSON response.': '解析 JSON 回应失败。',
            'locked aspect ratio: {0}': '锁定纵横比：{0}',
            'Dropped a non-file input': '已删除一个非文件输入',
            'Unknown image - it may have been deleted, or you may not have the necessary credentials to access it':
                '未知图像 — 该图像可能已经被删除，或者您没有存取该图像的必要资格',
            Disable: '禁用',
            'quality level {0}': '质量水平 {0}',
            'Please log in to copy\/paste masks.':
                '请登录以复制\/粘贴蒙板。',
            'fit to result': '按照结果调整',
            'Already queued, ignored': '已经排队，已忽略',
            Pixels: '像素',
            'Rename image to:': '将图像重新命名为：',
            Small: '小',
            Error: '错误',
            '{0} margin': '{0} 边距',
            'Please try again, or try another image.':
                '请重新尝试，或尝试另一个图像。',
            "Couldn't read the file": '无法读取文件',
            Large: '大',
            'Uploading...': '正在上载...',
            Off: '关闭',
            Enabled: '已启用',
            'white balance': '白平衡',
            'Failed to read image file with name: "{0}", and type: "{1}".':
                '读取带有“{0}”名称和“{1}”类型的图像文件失败。',
            enabled: '已启用',
            'Retrying in {0} seconds...': '过 {0} 秒重试...',
            'fixed size: {0}': '固定大小：{0}',
            'Internal server error': '内部服务器错误',
            Ignore: '忽略',
            'default color space': '默认颜色空间',
            Retry: '重试',
            Top: '顶部',
            'Uploading... {0}': '正在上载...{0}',
            '{0} ({1})': '{0}（{1}）',
            Unchanged: '未改动',
            'Paste should work in at least Chrome, Firefox, and Microsoft Edge.':
                '应当至少可以在 Chrome、Firefox 和 Microsoft Edge 中粘贴。',
            'There are unsaved changes.': '有未保存的改动。',
            'lossy optimization': '有损优化',
            'Unexpected worker disconnection.': '意外工作人员断开。',
            'Failed to fetch "{0}"': '提取“{0}”失败',
            'levels not adjusted': '未调整的水平',
            Unconstrained: '不限制',
            'color cast removal': '色偏删除',
            'color space': '颜色空间',
            'rotated {0}&deg;': '已旋转 {0}&deg;',
            'Please subscribe to a Bulk Clipping plan first, thanks!':
                '请首先用订阅一项批量剪切计划，谢谢！',
            'Original + Marks': '原图',
            'Aspect Ratio': '纵横比',
            'Download server closed connection prematurely.':
                '下载服务器永久性地关闭连接。',
            '{0} enabled': '已启用{0}',
            '{0} disabled': '已禁用{0}',
            'Server gave an empty response.': '服务器给出空响应。',
            Ok: '确定',
            'no oval shadows': '无椭圆阴影',
            Medium: '中',
            'Workers overloaded. Additional workers are being spawned - they should be online in a couple of minutes.':
                '工作人员超负荷。正在增加额外的工作人员 — 他们应当在几分钟内会在线。',
            'Terribly sorry, but the request failed.':
                '非常抱歉，请求失败。',
            '{0} blur radius': '{0} 模糊半径',
            "Terribly sorry, it seems like your browser doesn't fully support pasting of images yet?":
                '非常抱歉，好像您的浏览器尚不能全面支持图像粘贴？',
            '{0} height': '{0} 高度',
            'Uploading original image': '正在上载原始图像',
            'Please try the latest version of one of these browsers instead: <b>{0}, {1}, {2}<\/b>.':
                '请尝试使用以下一种最新版本浏览器：<b>{0}、{1}、{2}<\/b>。',
            'Unsupported file type: {0}': '不受支持的文件类型：{0}',
            '{0} opacity': '{0} 不透明度',
            'Terribly sorry, but an unrecoverable server error has occurred:':
                '非常遗憾，但出现无法恢复的服务器错误：',
            'Retrying now...': '正在重试...',
            Tight: '紧',
            unconstrained: '不限制',
            '{0} opacity scale': '{0} 不透明比例',
            Smart: '智能',
            'Uploading thumbnail': '正在上载缩略图',
            'Connect to worker': '与工作人员连接',
            'manual crop': '手工剪裁',
            'Storing Copied Mask': '正在储存已复制的蒙板',
            'Pending...': '待定...',
            'Sorry, failed to save your sticky settings:':
                '对不起，保存您的易贴设置失败：',
            '{0} {0,plural,one{megapixel}other{megapixels}}':
                '{0}{0,plural,other{百万像素}}',
            None: '无',
            'Target Size': '目标尺寸',
            'not web optimized': '未网络优化',
            disabled: '已禁用',
            Lossless: '无损',
            'transparent background': '透明背景',
            'Saving edits': '正在保存编辑内容',
            'default DPI': '默认 DPI',
            Pad: '拍打',
            '1 oval shadow': '1 个椭圆阴影',
            Fixed: '固定',
            'oval shadows': '椭圆阴影',
            Result: '效果图',
            'Timeout or worker termination': '超时或工作人员终止',
            'Please verify your network connection.':
                '请验证您的网络连接。',
            Custom: '定制',
            '{0} shadows': '{0}阴影',
            'lossless optimization': '无损优化',
            '{0} alignment': '{0}对齐',
            'Failed to connect to the server.': '与服务器连接失败。',
            Task: '任务',
            '{0} blur scale': '{0} 模糊比例',
            Middle: '中部',
            Percent: '百分比',
            'Please try again and let us know if the error persists!':
                '请重新尝试，如果仍然出错，请通知我们！',
            Duplicate: '复制',
            'web optimized': '已网络优化',
            Original: '原始'
        }
    </script>
    <title>
        立即删除在线图像背景 - Clipping Magic
    </title>
    <script type="text/javascript">
        var GlobalsShared = {
            locale: 'zh-Hans-CN',
            localeQueryParameter: 'lc'
        }
    </script>

</head>

<body id="main">
    <div class="top-section">
        <div class="container">
            <div class="row">
                <div class="col-md-12">
                    <div class="alert alert-danger"
                        id="modernizr-alert"
                        style="display:none;">
                    </div>
                </div>
            </div>
        </div>
    </div>
    <%@ include file="/koutu/inc/svgSprite.jsp.inc" %>
    <div class="container">
        <script type="text/javascript">
            Globals.Bulk.isApi = true
            Globals.Bulk.isApiSingle = true
            Globals.Bulk.isIframe = true
            GlobalsEx.showTutorial = false
        </script>
        <div class="CmApp-Cat-cantLogoMode CmApp-Cat-isPhotoMode"
            id="AppOuterWrapper">
            <div class="noselect"
                id="AppWrapper"
                style="display: none; background: #fff;">
                <div class="app-sized app-mode"
                    id="app">

                    <%@ include file="/koutu/inc/appContent.jsp.inc" %>
                    <%@ include file="/koutu/inc/topBar.jsp.inc" %>
                    <div class="CmApp-Bar-container CmApp-Bar-bottom_bar noselect">
                    </div>
                </div>
            </div>
            <%@ include file="/koutu/inc/modal.jsp.inc" %>

            <div id="PreCrop-App">
                <button class="close PreCrop-Sidebar-cancel_button"
                    id="PreCrop-TopCloseButton">
                    ×
                </button>
                <div class="noselect"
                    id="PreCrop-ViewContainer">
                </div>
                <div class="noselect subapp_sidebar"
                    id="PreCrop-Sidebar-Container">
                    <div class="CmApp-SubApps-primary_sec">
                        <div class="CmApp-SubApps-sec_header">
                            <p class="h3">
                                预剪裁
                            </p>
                        </div>
                        <hr style="margin: 0;" />
                        <div class="CmApp-SubApps-sec_body">
                            <p class="comment"
                                style="margin-top: 4px;">
                                您的图像超过您的现用尺寸限制。
                                为了获得最佳结果，请将图像剪裁至您希望剪切的部分。
                            </p>
                        </div>
                        <table class="table table-condensed CmApp-SubApps-table">
                            <tbody>
                                <tr>
                                    <td colspan="2">
                                        锁定纵横比
                                    </td>
                                    <td>
                                        <label class="CmApp-SubApps-checkbox"
                                            style="margin: 0 0 0 6px;">
                                            <input class="PreCrop-Sidebar-lock_aspect_ratio_button"
                                                type="checkbox" />
                                            <span style="color: rgba(0,0,0,0);">
                                                Lock
                                            </span>
                                        </label>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        尺寸限制
                                    </td>
                                    <td>
                                        <span class="PreCrop-Sidebar-MaxNumMegapixels-display">
                                        </span>
                                    </td>
                                    <td>
                                        <div class="app_bttn_group">
                                            <button alt="Smaller"
                                                class="app_bttn app_bttn_dark PreCrop-Sidebar-MaxNumMegapixels-decrease"
                                                id="PreCrop-Sidebar-MaxNumMegapixels-decrease"
                                                title="Smaller">
                                                -
                                            </button>
                                            <button alt="Larger"
                                                class="app_bttn app_bttn_dark PreCrop-Sidebar-MaxNumMegapixels-increase"
                                                id="PreCrop-Sidebar-MaxNumMegapixels-increase"
                                                title="Larger">
                                                +
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <hr />
                    <div class="CmApp-SubApps-primary_sec">
                        <div class="CmApp-SubApps-sec_header">
                            <p class="h4">
                                原始图像
                            </p>
                        </div>
                        <table class="table table-condensed CmApp-SubApps-table">
                            <tr>
                                <td>
                                    尺寸：
                                </td>
                                <td class="PreCrop-Sidebar-input_image_size_display">
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    纵横比：
                                </td>
                                <td class="PreCrop-Sidebar-input_image_aspect_ratio_display">
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    百万像素：
                                </td>
                                <td class="PreCrop-Sidebar-input_image_megapixels_display">
                                </td>
                            </tr>
                        </table>
                    </div>
                    <hr />
                    <div class="CmApp-SubApps-primary_sec">
                        <div class="CmApp-SubApps-sec_header">
                            <p class="h4">
                                已剪裁的图像
                            </p>
                        </div>
                        <table class="table table-condensed CmApp-SubApps-table">
                            <tr>
                                <td>
                                    尺寸：
                                </td>
                                <td class="PreCrop-Sidebar-cropped_image_size_display">
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    纵横比：
                                </td>
                                <td class="PreCrop-Sidebar-cropped_image_aspect_ratio_display">
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    百万像素：
                                </td>
                                <td class="PreCrop-Sidebar-cropped_image_megapixels_display">
                                </td>
                            </tr>
                        </table>
                    </div>
                    <div class="CmApp-SubApps-sec_body"
                        style="margin-top: 20px;">
                        <div class="PreCrop-Sidebar-cropped_image_warning alert alert-warning">
                            <p>
                                已剪裁的图像超过尺寸限制，将会按照尺寸限制缩放。
                            </p>
                        </div>
                        <div class="PreCrop-Sidebar-cropped_image_success alert alert-success">
                            <p>
                                达到尺寸限制，保留全分辨率。
                            </p>
                        </div>
                    </div>
                    <div id="PreCrop-Sidebar-ButtonBar">
                        <div class="app_bttn_group">
                            <button class="PreCrop-Sidebar-cancel_button app_bttn app_bttn_large app_bttn_white">
                                取消
                            </button>
                        </div>
                        <div class="btn-group">
                            <button class="PreCrop-Sidebar-crop_button app_bttn app_bttn_large app_bttn_dark"
                                style="min-width: 60px;">
                                确定
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <input id="FileInput-PasteTarget" />
        </div>
        <!-- <div class="btn btn-compound has-tips" tips="上传原图" id="uploadOriginal">
                <svg class="btn-icon">
                    <use class="nav-icon-use" xlink:href="#svg-nav-upload">
                    </use>
                </svg>
                <label class="btn-label btn-label-hasIcon" for="addPic">上传</label>
                <input  id="addPic" type="file" accept="image/jpg,image/jpeg,image/png" style="display:none;">
            </div> -->
    </div>
    <script type="text/javascript">
        let _json = decodeURIComponent(window.location.search).replace(
            '?json=',
            ''
        )
        let imageObj = JSON.parse(_json)
        window.ResumeImage = {
            id: imageObj.image.id,
            secret: imageObj.image.secret,
            url: imageObj.image.url,
            fileId: imageObj.image.fileId,
            name: imageObj.image.name,
            cutoutId: imageObj.image.fileId,
        }
        $('#reload,#ktlogo').click(function () {
            parent.location.href = window.location.origin + '/manage/ktuManage.jsp#/matting/index'
        })
        $(".nav-area").click(() => {
            $("#ktDownloadBody").toggle(false);
        })
        $("#ktDownload").click(function (e) {
            e.stopPropagation();
            $("#ktDownloadBody").toggle();
        })
        $("#AppContent").on("mousedown", function () {
            $("#ktDownloadBody").toggle(false);
        })
        $(".download-modal").on("click",'.ktu-modal-mask,.ktu-modal-close,.closeBtn',function(){
            $("#saveFileLoading-Outer").hide();
        });

        $("#help-btn").on("click",function(){
            Ktu.showHelpTipsModal.show();
        });

        $("#more-tool").on('click',function(){
            this.classList.toggle('active');
        });
        $(function() {
            if (imageObj.image && imageObj.image.fromModal){
                Ktu.hasDrawLine = true;
                let topWindow = window.parent && window.parent.parent;
                let $parent = $('.nav-right').parent();
                var isGenerateNow = false;
                function postMsg(obj) {
                    $('#startDownfile-Outer').hide();
                    isGenerateNow = false;
                    topWindow.postMessage(obj,'*');
                }
                Ktu.closeLoading = function(){
                    let obj = {
                        key: 'closeLoading',
                        value: ''
                    };
                    postMsg(obj);
                }
                $('#ktlogo').remove();
                $('.nav-right').remove();
                $('#CmApp-Tools-undo').css({
                    'margin-left':'20px',
                    'width':'auto',
                    'padding-right':'5px'
                });
                $parent.append(`
                    <div class="modal-nav-right nav-right">
                        <div class="cancel-btn">取消</div>
                        <div class="save-btn" id="save-btn">完成</div>
                    </div>
                `);
                $('.modal-nav-right').on('click', '.cancel-btn', function(){
                    let obj = {
                        key: 'cancel',
                        value: '',
                    };
                    postMsg(obj);
                    Ktu.log('kouTuModal','cancel');
                }).on('click', '.save-btn', function(){
                    if ($('#StartupLightbox-Outer').is(":visible")){
                        let obj = {
                            key: 'error',
                            value: '正在初始化~',
                        };
                        postMsg(obj);
                        return;
                    }
                    Ktu.log('kouTuModal','save');
                    if (!Ktu.hasDrawLine) {
                        let obj = {
                            key: 'cancel',
                            value: '',
                        };
                        postMsg(obj);
                        return;
                    }
                    if (isGenerateNow) {
                        return;
                    }
                    isGenerateNow = true;
                    $('#startDownfile-Outer').show();
                    Ktu.getKouTuImageObj().then((imageBlob) => {
                        var commandsJson = Ktu.getDrawCommands();
                        let fd = new FormData(); //创建form对象
                        fd.append('filedata', imageBlob);
                        fd.append("totalSize", imageBlob.size);
                        fd.append("locus",JSON.stringify(commandsJson));
                        fd.append("cutoutId",window.ResumeImage.cutoutId);
                        // 保存图片还有抠图路径到后端。
                        $.ajax({
                            url:"/ajax/ktuCutoutImg/saveToEditor.do",
                            type: "POST",
                            processData: false,
                            contentType: false,
                            data: fd
                        }).done((res) => {
                            if (res) {
                                var data = JSON.parse(res);
                                if (data.success){
                                    var tmpValue = data.data;
                                    tmpValue.cutoutId = window.ResumeImage.cutoutId;
                                    data.data.localBlob = imageBlob;
                                    let obj = {
                                        key: 'success',
                                        value: data.data,
                                    };
                                    postMsg(obj);
                                    return;
                                } else if (data.sizeOut) {
                                    // 到达容量上限，需要区别对待，不能按照普通的异常那样处理
                                    var tmpRes = {
                                        cutoutId: window.ResumeImage.cutoutId
                                    }
                                    let obj = {
                                        key: 'sizeOut',
                                        value: tmpRes,
                                    };
                                    postMsg(obj);
                                    return;
                                }
                            }

                            let obj = {
                                key: 'error',
                                value: '服务器异常，请刷新后重试~',
                            };
                            postMsg(obj);
                        }).fail((e) => {
                            let obj = {
                                key: 'error',
                                value: '图片加载失败，请刷新后重试~',
                            };
                            postMsg(obj);
                        });
                    }).catch((e) => {
                        let obj = {
                            key: 'error',
                            value: '图片加载失败，请刷新后重试~',
                        };
                        postMsg(obj);
                    });
                });
            }
        });
    </script>
</body>

</html>