<div class="app-content-sized noselect"
    id="AppContent">
    <div class="canvas-view app-view-sized"
        id="AppView">
    </div>
    <div class="app-lightbox app-view-sized right-half"
        id="StartupLightbox-Outer"
        style="display: none;">
        <div class="modal notice-modal"
            id="StartupLightbox-Id"
            style="overflow: hidden;"
            tabindex="-1">
            <div class="modal-dialog StartupLightbox-content">
                <div class="modal-content">
                    <div class="modal-body"
                        style="
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        padding: 28px;
                    ">
                        <div class="c">
                            <svg>
                                <use xlink:href="#svg-right-loading">
                                </use>
                            </svg>
                        </div>
                        <p class="comment"
                            style="text-align: center;    margin-top: 16px;
                        margin-bottom: 0;color:#333;
                        font-style: normal;">
                            正在处理...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>



    <div class="ImageMutationNotification alert alert-warning alert-dismissible"
        id="ImageResizeNotification"
        style="display: none;">
        <div class="close"
            data-dismiss="alert">
            <span>
                ×
            </span>
        </div>
        <strong>
            图像被缩小
        </strong>
        <p>
            您上载的图像尺寸超过您的现用尺寸限制，因此我们必须将图像缩小到
            <span class="MaxNumMegapixels-display">
                400 万像素
            </span>
            。 You may configure your image size
            limit
            or enable Pre-Crop in the
            <a class="PreferencesDialog-openImportOptions alert-link"
                href="#">
                Input Options
            </a>
            dialog.
        </p>
    </div>
    <div class="inverted app-lightbox"
        id="TutorialLightboxOuter"
        style="display: none;">
        <div class="popover fade bottom in"
            id="CmApp-Help-Popover"
            style="z-index: 1039; position: fixed; top: 35px; right: 0; bottom: 50px; left: auto; width: 360px; max-width: none; display: none;">
            <div style="height: 100%; width: 100%; position: relative;">
                <div class="app-tutorial allowSelect"
                    id="tab-tutorial">
                    <table class="table Table-settings Table-settings_no_indent table-condensed">
                        <thead>
                            <th colspan="3">
                                <p class="h4">
                                    <a href="/tutorials/basics"
                                        target="tutorial">
                                        说明
                                        <span class="glyphicon glyphicon-new-window"
                                            style="font-size: smaller;">
                                        </span>
                                    </a>
                                </p>
                            </th>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="3">
                                    <div class="clearfix"
                                        style="text-align: center;">
                                        <div class="clearfix">
                                            <div
                                                style="border: 1px solid #ddd; display: inline-block; white-space: nowrap;">
                                                <div class="yo-data-uri instructions-with-red-and-green-small-svg"
                                                    style="box-sizing: content-box; border-right: 2px solid #000;">
                                                </div>
                                                <div class="yo-data-uri checker-svg"
                                                    style="background-repeat: repeat; width: 150px; height: 100px; background-size: auto;">
                                                    <div class="yo-data-uri instructions-object-only-small-svg">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr class="fg">
                                <td class="fg r">
                                    绿色
                                </td>
                                <td class="c">
                                    =
                                </td>
                                <td>
                                    <b>
                                        保持
                                    </b>
                                </td>
                            </tr>
                            <tr class="bg">
                                <td class="bg r">
                                    红色
                                </td>
                                <td class="c">
                                    =
                                </td>
                                <td>
                                    <b>
                                        删除
                                    </b>
                                </td>
                            </tr>
                            <tr class="eraser">
                                <td class="eraser r">
                                    未标记
                                </td>
                                <td class="c">
                                    =
                                </td>
                                <td>
                                    <b>
                                        算法决定
                                    </b>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="table Table-settings table-hover table-condensed"
                        style="white-space: nowrap;">
                        <thead>
                            <tr>
                                <th>
                                </th>
                                <th colspan="3">
                                    <p class="h4">
                                        捷径
                                    </p>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                </td>
                                <td>
                                    <span class="yo-data-uri red-tool-icon-svg">
                                    </span>
                                    <span class="yo-data-uri green-tool-icon-svg">
                                    </span>
                                </td>
                                <td style="white-space: normal; word-wrap: break-word;">
                                    红色 / 绿色
                                </td>
                                <td>
                                    <span class="keys-key keys-light"
                                        style="font-size: 12px;">
                                        空格键
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                </td>
                                <td>
                                    <span class="yo-data-uri zoom-in-icon-svg">
                                    </span>
                                    <span class="yo-data-uri zoom-out-icon-svg">
                                    </span>
                                </td>
                                <td style="white-space: normal; word-wrap: break-word;">
                                    缩放
                                </td>
                                <td>
                                    鼠标滚轮
                                </td>
                            </tr>
                            <tr>
                                <td>
                                </td>
                                <td>
                                    <span class="yo-data-uri grab-open-tool-icon-svg">
                                    </span>
                                </td>
                                <td style="white-space: normal; word-wrap: break-word;">
                                    快速平移
                                </td>
                                <td>
                                    <span class="keys-key keys-light"
                                        style="font-size: 12px;">
                                        Shift
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                </td>
                                <td>
                                    <span class="yo-data-uri erase-tool-icon-svg">
                                    </span>
                                    <span class="yo-data-uri grab-open-tool-icon-svg">
                                    </span>
                                </td>
                                <td style="white-space: normal; word-wrap: break-word;">
                                    擦除 / 平移
                                </td>
                                <td>
                                    <span class="keys-key keys-light"
                                        style="font-size: 12px;">
                                        X
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                </td>
                                <td>
                                    <span class="yo-data-uri sword-tool-icon-svg">
                                    </span>
                                </td>
                                <td style="white-space: normal; word-wrap: break-word;">
                                    <a href="/tutorials/scalpel"
                                        target="tutorial">
                                        小刀
                                        <span class="glyphicon glyphicon-new-window"
                                            style="font-size: smaller;">
                                        </span>
                                    </a>
                                </td>
                                <td>
                                    <span class="keys-key keys-light"
                                        style="font-size: 12px;">
                                        S
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                </td>
                                <td>
                                    <span class="yo-data-uri undo-icon-svg">
                                    </span>
                                    <span class="yo-data-uri redo-icon-svg">
                                    </span>
                                </td>
                                <td style="white-space: normal; word-wrap: break-word;">
                                    撤销 / 重做
                                </td>
                                <td>
                                    <span class="keys-key keys-light"
                                        style="font-size: 12px;">
                                        Z
                                    </span>
                                    /
                                    <span class="keys-key keys-light"
                                        style="font-size: 12px;">
                                        Y
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                </td>
                                <td>
                                </td>
                                <td style="white-space: normal; word-wrap: break-word;">
                                    较小 / 较大刷子
                                </td>
                                <td>
                                    <span class="keys-key keys-light"
                                        style="font-size: 12px;">
                                        [
                                    </span>
                                    /
                                    <span class="keys-key keys-light"
                                        style="font-size: 12px;">
                                        ]
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                </td>
                                <td>
                                    <span class="yo-data-uri hair-brush-1-icon-svg">
                                    </span>
                                    -
                                    <span class="yo-data-uri hair-brush-4-icon-svg">
                                    </span>
                                </td>
                                <td style="white-space: normal; word-wrap: break-word;">
                                    循环使用毛刷
                                </td>
                                <td>
                                    <span class="keys-key keys-light"
                                        style="font-size: 12px;">
                                        V
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                </td>
                                <td>
                                    <span class="yo-data-uri hair-erase-tool-icon-svg">
                                    </span>
                                    <span class="yo-data-uri grab-open-tool-icon-svg">
                                    </span>
                                </td>
                                <td style="white-space: normal; word-wrap: break-word;">
                                    擦除头发 / 平移
                                </td>
                                <td>
                                    <span class="keys-key keys-light"
                                        style="font-size: 12px;">
                                        C
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                </td>
                                <td>
                                    <span class="yo-data-uri eyedropper-fg-tool-icon-svg">
                                    </span>
                                    <span class="yo-data-uri eyedropper-bg-tool-icon-svg">
                                    </span>
                                </td>
                                <td style="white-space: normal; word-wrap: break-word;">
                                    取色器
                                </td>
                                <td>
                                    <span class="keys-key keys-light"
                                        style="font-size: 12px;">
                                        E
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                </td>
                                <td>
                                    <span class="yo-data-uri checker-svg"
                                        style="border: 1px solid #ddd; box-sizing: content-box;">
                                    </span>
                                    …
                                </td>
                                <td style="white-space: normal; word-wrap: break-word;">
                                    循环使用背景颜色
                                </td>
                                <td>
                                    <span class="keys-key keys-light"
                                        style="font-size: 12px;">
                                        B
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                </td>
                                <td>
                                    <span class="yo-data-uri rotate-counterclockwise-icon-svg">
                                    </span>
                                    <span class="yo-data-uri rotate-clockwise-icon-svg">
                                    </span>
                                </td>
                                <td style="white-space: normal; word-wrap: break-word;">
                                    向左 / 向右旋转
                                </td>
                                <td>
                                    <span class="keys-key keys-light"
                                        style="font-size: 12px;">
                                        R
                                    </span>
                                    /
                                    <span class="keys-key keys-light"
                                        style="font-size: 12px;">
                                        T
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                </td>
                                <td>
                                    <span class="yo-data-uri straighten-counterclockwise-icon-svg">
                                    </span>
                                    <span class="yo-data-uri straighten-clockwise-icon-svg">
                                    </span>
                                </td>
                                <td style="white-space: normal; word-wrap: break-word;">
                                    向左 / 向右拉直
                                </td>
                                <td>
                                    <span class="keys-key keys-light"
                                        style="font-size: 12px;">
                                        Shift
                                    </span>
                                    +
                                    <span class="keys-key keys-light"
                                        style="font-size: 12px;">
                                        R
                                    </span>
                                    /
                                    <span class="keys-key keys-light"
                                        style="font-size: 12px;">
                                        T
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                </td>
                                <td>
                                    <span class="yo-data-uri grab-open-tool-icon-svg">
                                    </span>
                                </td>
                                <td style="white-space: normal; word-wrap: break-word;">
                                    平移
                                </td>
                                <td>
                                    <span class="keys-key keys-light"
                                        style="font-size: 12px;">
                                        ←
                                    </span>
                                    <span class="keys-key keys-light"
                                        style="font-size: 12px;">
                                        ↑
                                    </span>
                                    <span class="keys-key keys-light"
                                        style="font-size: 12px;">
                                        ↓
                                    </span>
                                    <span class="keys-key keys-light"
                                        style="font-size: 12px;">
                                        →
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                </td>
                                <td>
                                    <span class="yo-data-uri zoom-in-icon-svg">
                                    </span>
                                    <span class="yo-data-uri zoom-out-icon-svg">
                                    </span>
                                </td>
                                <td style="white-space: normal; word-wrap: break-word;">
                                    缩放
                                </td>
                                <td>
                                    <span class="keys-key keys-light"
                                        style="font-size: 12px;">
                                        PgUp
                                    </span>
                                    <span class="keys-key keys-light"
                                        style="font-size: 12px;">
                                        PgDn
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                </td>
                                <td>
                                    <span class="glyphicon glyphicon-chevron-left">
                                    </span>
                                    <span class="glyphicon glyphicon-chevron-right">
                                    </span>
                                </td>
                                <td style="white-space: normal; word-wrap: break-word;">
                                    审查轮廓
                                </td>
                                <td>
                                    <span class="keys-key keys-light"
                                        style="font-size: 12px;">
                                        D
                                    </span>
                                    /
                                    <span class="keys-key keys-light"
                                        style="font-size: 12px;">
                                        F
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                </td>
                                <td>
                                    <span class="yo-data-uri view-panes-marks-svg">
                                    </span>
                                    <span class="yo-data-uri view-panes-both-svg">
                                    </span>
                                </td>
                                <td style="white-space: normal; word-wrap: break-word;">
                                    查看窗格
                                </td>
                                <td>
                                    <span class="keys-key keys-light"
                                        style="font-size: 12px;">
                                        1
                                    </span>
                                    /
                                    <span class="keys-key keys-light"
                                        style="font-size: 12px;">
                                        2
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                </td>
                                <td>
                                </td>
                                <td style="white-space: normal; word-wrap: break-word;">
                                    显示预览
                                </td>
                                <td>
                                    <span class="keys-key keys-light"
                                        style="font-size: 12px;">
                                        W
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="indentme">
                        <p class="commentX">
                            <span class="yo-data-uri grab-open-tool-icon-svg">
                            </span>
                            在预览上自动平移
                        </p>
                    </div>
                    <div class="indentme">
                        <p class="commentX">
                            <span class="yo-data-uri grab-open-tool-icon-svg">
                            </span>
                            中间鼠标按钮始终平移。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="ViewPanes-preview noselect">
        预览
    </div>
</div>


<div class="app-lightbox app-view-sized"
    id="startUpfile-Outer"
    style="display:none;z-index:1051">
    <div class="modal notice-modal"
        id="startUpfile-Id"
        style="overflow: hidden;"
        tabindex="-1">
        <div class="modal-dialog startUpfile-content">
            <div class="modal-content">
                <div class="modal-body"
                    style="
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    padding: 28px;">
                    <div class="c">
                        <svg>
                            <use xlink:href="#svg-right-loading">
                            </use>
                        </svg>
                    </div>
                    <p class="comment"
                        style="text-align: center;    margin-top: 16px;
                    margin-bottom: 0;color:#333;
                    font-style: normal;">
                        正在上传
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>
<div class="app-lightbox app-view-sized"
    id="startDownfile-Outer"
    style="display:none;z-index:1051">
    <div class="modal notice-modal"
        id="startDownfile-Id"
        style="overflow: hidden;"
        tabindex="-1">
        <div class="modal-dialog startUpfile-content">
            <div class="modal-content">
                <div class="modal-body"
                    style="
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    padding: 28px;">
                    <div class="c">
                        <svg>
                            <use xlink:href="#svg-right-loading">
                            </use>
                        </svg>
                    </div>
                    <p class="comment"
                        style="text-align: center;    margin-top: 16px;
                    margin-bottom: 0;color:#333;
                    font-style: normal;">
                        正在处理
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>