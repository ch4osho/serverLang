Ktu.storeModule.base = {
    namespaced: true,
    state: {
        showMask: false,
        maskObj: null,
        theme: Ktu.initialData.theme,
        templateType: Ktu.ktuData.type,
        isLockWH: Ktu.ktuData.type === 0 ? Ktu.ktuData.other.isLockWH : false,
        originalWHRatio: Ktu.ktuData.other.originalWidth / Ktu.ktuData.other.originalHeight,
        // selectedCategory: Ktu.ktuData.type && !Ktu.isFromThirdDesigner ? 'template' : 'text',
        selectedCategory: Ktu.ktuData.type && !Ktu.isFromThirdDesigner && localStorage.getItem('isBlankPage') === 'true' ? 'template' : 'text',
        isShowEleDetail: true,
        isShowPage: Ktu.ktuData.content.length > 1,
        isGifTemplate: Ktu.ktuData.isGif,
        // 添加gif素材到画板提示次数
        promptingTimes: 0,
        // 是否正在拖拽上传
        isDroping: false,
        // 是否拖拽系统外的文件上传
        isFromOut: true,
        // 是否拖拽上传完毕
        dropComplete: false,
        // 当前处于管理状态的是素材 0：素材
        nowEditorObj: null,
        // 更换图片
        changePicComplete: false,
        // 批量素材列表
        checkedItem: [],
        isMovingImage: false,
        isScaling: false,
        popShow: [],
        viewportMode: false,
        isSupportWebp: (function () {
            try {
                // 火狐支持webp
                if (Ktu.browser.isFirefox) return true;
                return (
                    document
                        .createElement('canvas')
                        .toDataURL('image/webp')
                        .indexOf('data:image/webp') == 0
                );
            } catch (err) {
                console.log(err);
                return false;
            }
        }()),
        searchMaterialValue: '',
        searchTemplateValue: '',
        isAutoSave: Ktu.userData.other.isAutoSave,
        // 快速绘制模式
        drawMode: '',
        isShowDrawKeyboard: false,
        // 二维码编辑页的控制，包含修改和新建
        qrCodeEditor: {
            show: false,
            type: 'add',
        },
        // 词云编辑页的控制，包含修改和新建
        wordArtEditor: {
            show: false,
            type: 'add',
        },
        mapEditor: {
            show: false,
            type: 'add',
        },

        mapStyleList: [
            {
                id: 0,
                imgSrc: '/image/editor/map/normal.png',
            },
            {
                id: 1,
                imgSrc: '/image/editor/map/macaron.png',
            },
            {
                id: 2,
                imgSrc: '/image/editor/map/graffiti.png',
            },
            {
                id: 3,
                imgSrc: '/image/editor/map/wine.png',
            },
            {
                id: 4,
                imgSrc: '/image/editor/map/whitesmoke.png',
            },
            {
                id: 5,
                imgSrc: '/image/editor/map/dark.png',
            },
            {
                id: 6,
                imgSrc: '/image/editor/map/fresh.png',
            },
            {
                id: 7,
                imgSrc: '/image/editor/map/darkblue.png',
            },
        ],
        refreshContextMenu: false,

        // 隐藏编辑区域的右键工具栏
        isHideEditToolbar: false,

        // 右键菜单出现时隐藏工具栏的二级菜单
        isHideEditToolbarMenu: false,

        // 保存PSD上传文本转换成图片按钮的状态
        PSDTextToImage: true,

        selectedBox: null,
        interactive: new Interactive({
            editor: 'editor',
            container: 'edit-center',
            element: 'ele',
            box: 'edit-box',
        }),
        imageClip: new ImageClip({
            container: 'clipContainer',
        }),
        edit: null,
        isPickingColor: false,

        // 存储浏览器的高度，宽度便于做自适应
        browserHeight: 0,
        browserWidth: 0,

        // 是否正在复制上传图片中
        isCopyUpload: false,
        isFinishCopyUpload: false,

        // 是否快捷键打开素材库
        isImgsourceByHotkey: false,
        // 字体权限板块数据
        FontAutObj: {},

        // addModule绘制完svg对象返回的值
        pathGroup: null,
        // 双击时的来源分类 用于双击换图时
        dblclickCategory: null,

        // 是否正在编辑图表数据
        isEditChartData: false,

        enterEditCenter: false,
        // 框选
        showSelectBox: false,

        isOpenTool: {
            isShow: false,
            type: '',
        },
        modalClose: null,
        qrIsTop: true,
        // 图像二维码样式列表
        historyStyleList: null,
        editStyleList: null,
        eleStyleList: [],
        // 卸载qrcodetool时保存这个idx
        selectedStyleIdx: null,
        // 保存工具栏选择的二维码样式
        selectedArtOnTool: null,
        // 是否正在生成编辑器的二维码样式
        isCreatingEditArt: false,
        // 编辑器二维码生成的text
        editQrCodeText: '',
        // 编辑器生成二维码的参数
        editQrCodeOptions: {},
        // 保存编辑器二维码的selectData
        qrCodeData: null,
        isToolQrCodeShow: false,
        artQrCodeOptions: null,
        isCancelChangeStyle: false,
        totalStyleNum: 0,
        // 改变页面尺寸是否同时调整素材大小
        isAdjustMaterial: true,
        isOpenUtilModal: false,

        gradientNodeIndex: -1,
        colorPanelLeft: 0,

        // 小屏工具栏宽度
        toolBoxWidth: -1,

        tmpFestival: [],
    },
    getters: {
        editWidth(state) {
            const { edit } = state;

            if (!edit) {
                return 0;
            }
            const { editBox } = edit;

            const width = editBox ? editBox.width : 0;

            return width;
        },
        editCenterWidth(state) {
            const { edit } = state;

            if (!edit) {
                return 0;
            }
            const { size } = edit;

            const width = size ? size.width : 0;

            return width;
        },
    },
    mutations: {
        changeState(state, obj) {
            state[obj.prop] = obj.value;
        },
        maskState(state, value) {
            if (!state.showMask && value) {
                const instance = new Vue({
                    render(h) {
                        return h('ktuMask', {
                            // props: _props
                        });
                    },
                    store: Ktu.store,
                });

                state.maskObj = instance.$mount();
                document.body.appendChild(state.maskObj.$el);
            } else if (!value) {
                state.maskObj && state.maskObj.$destroy();
                state.maskObj && document.body.removeChild(state.maskObj.$el);
                state.maskObj = null;
            }

            Vue.nextTick(() => {
                state.showMask = value;
            });
        },
        setModelClose(state, value) {
            state.modalClose = value;
        },
        setPathGroup(state, obj) {
            state.pathGroup = obj;
        },
        updateDblclickCategory(state, value) {
            state.dblclickCategory = value;
        },
    },
};
