<div class="modal" id="save-and-exit-lightbox" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <p class="h3">
                    正在保存...
                </p>
            </div>
            <div class="modal-body">
                <div class="progress progress-striped active">
                    <div class="progress-bar" id="save-and-exit-lightbox-bar" style="width: 35%">
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="app_bttn app_bttn_large app_bttn_dark force_exit" data-dismiss="modal">
                    取消
                </button>
            </div>
        </div>
    </div>
</div>
<div class="modal" id="progress-lightbox" tabindex="-1">
    <div class="loading-box full">
        <div class="loading-circle loading-circle-3"></div>
        <div class="loading-circle loading-circle-2"></div>
        <div class="loading-circle loading-circle-1"></div>
        <div class="loading-icon"></div>
    </div>
</div>
<div class="modal" id="RetryDialog-Dialog" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <p class="h3">
                    网络错误
                </p>
            </div>
            <div class="modal-body">
                <table class="table table-striped table-bordered" id="RetryDialog-Body">
                </table>
                <p>
                    永久性网络问题通常是由错误的浏览器插件、错误配置的代理或限制性过高的防火墙所致。
                </p>
                <p>
                    请检查您的设置或尝试另一个浏览器或计算机。
                </p>
                <p id="RetryDialog-Countdown">
                </p>
            </div>
            <div class="modal-footer">
                <button class="app_bttn app_bttn_large app_bttn_white" id="RetryDialog-RetryNowButton">
                    现在重试
                </button>
                <button class="app_bttn app_bttn_large app_bttn_dark force_exit" data-dismiss-x="modal">
                    退出应用程序
                </button>
            </div>
        </div>
    </div>
</div>
<div class="modal" id="result-dialog" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <button class="close" data-dismiss="modal">
                    ×
                </button>
            </div>
            <div class="modal-body">
                <div class="resultDialog-state" id="resultDialog-Waiting">
                    <div class="progress active">
                        <div class="progress-bar" id="resultDialog-WaitingBar" style="width: 0%">
                        </div>
                    </div>
                    <p>
                        <span id="resultDialog-WaitingMsg">
                        </span>
                        请稍候...
                    </p>
                </div>
                <div class="resultDialog-state" id="resultDialog-Ready">
                    <div class="row">
                        <div class="col-sm-6">
                            <p>
                                您的结果准备好：
                            </p>
                            <p class="c">
                                <a class="app_bttn app_bttn_large app_bttn_dark" id="resultDialog-ReadyDownloadLink" onclick="$('#result-dialog').modal('hide'); " rel="noopener" target="_blank">
                                    <svg viewbox="0 0 6.34 7.99" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5.84,8H.5a.5.5,0,0,1-.5-.5A.5.5,0,0,1,.5,7H5.84a.5.5,0,0,1,.5.5A.5.5,0,0,1,5.84,8Z">
                                        </path>
                                        <path d="M5.53,3.33h0a.36.36,0,0,0-.52,0L3.7,4.63,3.53.37A.38.38,0,0,0,3.15,0h0a.38.38,0,0,0-.38.37L2.66,4.63l-1.3-1.3a.37.37,0,0,0-.53,0h0a.37.37,0,0,0,0,.52L2.78,5.79a.56.56,0,0,0,.81,0L5.53,3.85A.37.37,0,0,0,5.53,3.33Z">
                                        </path>
                                    </svg>
                                    下载结果
                                </a>
                            </p>
                            <p class="c">
                                导出大小：
                                <span class="CmApp-CropApp-output_size_display">
                                    100 x 100px (1:1)
                                </span>
                            </p>
                            <p style="margin-top: 20px;">
                                避免用电子邮件发送大文件：
                            </p>
                            <p class="c">
                                <a id="resultDialog-ReadyShareLink" rel="noopener" target="_blank">
                                    可分享的专用链接
                                    <span class="glyphicon glyphicon-new-window" style="font-size: smaller;">
                                    </span>
                                </a>
                            </p>
                        </div>
                        <div class="col-sm-6">
                            <p>
                                将结果拖动至您的桌面或用滑鼠邮件点击和复制图像：
                            </p>
                            <p class="c">
                                <img alt="剪切结果图像" class="checker-svg" id="resultDialog-ReadyDownloadImage" style="max-width: 100%; max-height: 120px; box-shadow: 0 0 6px 0 #000;"/>
                            </p>
                            <p class="comment">
                                <a href="/support/beta" rel="noopener" target="_blank">
                                    Beta：拖动仅在一些浏览器中工作，复制可能仅对半透明结果有效。
                                    <span class="glyphicon glyphicon-new-window" style="font-size: smaller;">
                                    </span>
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
                <div class="resultDialog-state resultDialog-pushed" id="resultDialog-Pushed">
                    <p>
                        结果已经被推送至您的网店。
                    </p>
                </div>
                <div class="resultDialog-state" id="resultDialog-Error">
                    <p>
                        非常抱歉，但在生成您的结果时出错：
                    </p>
                    <pre id="resultDialog-ErrorMsg"></pre>
                    <p>
                        请重新尝试，如果问题依然存在，请发电子邮件给我们。谢谢！
                    </p>
                </div>
                <hr/>
            </div>
            <div class="modal-footer">
                <button class="app_bttn app_bttn_large app_bttn_white exit_app shop_image_content resultDialog-state resultDialog-pushed" style="display: none;">
                    退出应用程序
                </button>
                <button class="app_bttn app_bttn_large app_bttn_dark" data-dismiss="modal">
                    关闭
                </button>
            </div>
        </div>
    </div>
</div>
<div class="modal fade" id="fatal-error" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <p class="h3" id="fatal-error-label">
                    致命错误 :-(
                </p>
            </div>
            <div class="modal-body">
                <pre id="fatal-error-p"></pre>
            </div>
            <div class="modal-footer">
                <a class="app_bttn app_bttn_large app_bttn_dark force_exit" href="/">
                    关闭
                </a>
            </div>
        </div>
    </div>
</div>

