Vue.component('edit-center', {
    template: `
        <div class="edit-center" :class="{isMoving : isMoving}" id="edit-center" @dragover="dragOver" @drop.stop="drop" @mousewheel="mousewheel" @mouseleave="mouseleave" @dragenter="onDragenter">
            <div class="edit-center-canvas" id="edit-center-canvas">
                <div id="ktuCanvasHolder" :class="{showAssist : showAssistLine}">
                    <div id="edbg" class="editor-bg" ref="edbg" style="opacity: 0"></div>
                    <div class="editor" id="editor">
                        <div id="editorView">
                            <component :is="getComponentName(element.type)" :element="element" v-for="(element,index) in selectedTemplateData" :key="currentPageId+'_'+element.objectId">
                            </component>
                        </div>
                    </div>

                    <edit-box></edit-box>
                    <edit-tip></edit-tip>
                    <border-box></border-box>
                    <align-line></align-line>
                    <assist-line v-if="showAssistLine"></assist-line>
                </div>

                <manipulatetip></manipulatetip>

                <edit-thumb></edit-thumb>

            </div>

            <edit-select></edit-select>

            <edit-clip></edit-clip>
            <edit-text></edit-text>
        </div>`,
    mixins: [Ktu.mixins.textInContainer, Ktu.mixins.artQrCode],
    data() {
        return {
            activeItem: null,
            dragOverObjects: [],
            dragOverIndex: null,
            // 当前作品id ktuAid + ktuId
            currentItemId: 0,
            // 本地可恢复缓存
            localPageData: null,
            // 在画布生成二维码图片的src
            qrCodeNewData: '',
        };
    },
    computed: {
        showAssistLine() {
            return !!this.$store.state.base.edit && this.$store.state.msg.openAssistLine;
        },
        isMoving() {
            return this.$store.state.base.interactive.isMoving || this.$store.state.base.interactive.isSelecting;
        },
        currentPageId() {
            return this.$store.state.data.currentpageId;
        },
        isShowManipulatetip() {
            return !(Ktu.tmpIsHideDrapTip && Ktu.tmpIsHideScrollTip);
        },
        selectedTemplateData() {
            const selTemplateData = this.$store.state.data.selectedTemplateData;
            const { objects } = selTemplateData;
            console.log(objects)
            return objects;
        },
        scale() {
            return this.$store.state.data.scale;
        },
        eleUploadActiveDir() {
            return this.$store.state.base.eleUploadActiveDir;
        },
        enterEditCenter: {
            get() {
                return this.$store.state.base.enterEditCenter;
            },
            set(value) {
                this.$store.state.base.enterEditCenter = value;
            },
        },
        isEditing() {
            return this.$store.state.data.selectedData && this.$store.state.data.selectedData.isEditing;
        },
        // 是否选择工具栏的了样式
        isCreatingEditArt: {
            get() {
                return this.$store.state.base.isCreatingEditArt;
            },
            set(value) {
                this.$store.state.base.isCreatingEditArt = value;
            },
        },
        editQrcodeText: {
            get() {
                return this.$store.state.base.editQrcodeText;
            },
            set(value) {
                this.$store.state.base.editQrcodeText = value;
            },
        },
        editQrCodeOptions: {
            get() {
                return this.$store.state.base.editQrCodeOptions;
            },
            set(value) {
                this.$store.state.base.editQrCodeOptions = value;
            },
        },
        qrCodeData: {
            get() {
                return this.$store.state.base.qrCodeData;
            },
            set(value) {
                this.$store.state.base.qrCodeData = value;
            },
        },
        isToolQrCodeShow: {
            get() {
                return this.$store.state.base.isToolQrCodeShow;
            },
            set(value) {
                this.$store.state.base.isToolQrCodeShow = value;
            },
        },
        historyStyleList: {
            get() {
                return this.$store.state.base.historyStyleList;
            },
            set(value) {
                this.$store.state.base.historyStyleList = value;
            },
        },
        background() {
            return this.qrCodeData.msg.background;
        },
        isCancelChangeStyle: {
            get() {
                return this.$store.state.base.isCancelChangeStyle;
            },
            set(value) {
                this.$store.state.base.isCancelChangeStyle = value;
            },
        },
        saveChangeNum() {
            return this.$store.state.msg.saveChangedNum;
        },
        coverChangeNum() {
            return this.$store.state.data.coverChangeNum;
        },
        hasCoverPage: {
            get() {
                return this.$store.state.data.hasCoverPage;
            },
            set(newValue) {
                Ktu.store.commit('data/changeState', {
                    prop: 'hasCoverPage',
                    value: newValue,
                });
            },
        },
        edbg: {
            get() {
                return this.$store.state.data.edbg;
            },
            set(newValue) {
                this.$store.commit('data/changeState', {
                    prop: 'edbg',
                    value: newValue,
                });
            },
        },
    },
    watch: {
        localPageData(val) {
            val && this.compareLocalPageData();
        },
        isCreatingEditArt(val) {
            if (val && JSON.stringify(this.editQrCodeOptions) !== '{}') {
                this.useArtQrCode(this.editQrCodeOptions);
            }
        },
        saveChangeNum() {
            if (this.hasCoverPage && !this.coverChangeNum) {
                this.deletePageHistoryData(HistoryAction.PAGE_CHANGED);
            }
        },
    },
    mounted() {
        // 初始化时检是否有缓存
        this.checkLocalPageData();
        // 把edbg写入vuex 方便后续取用
        this.edbg = this.$refs.edbg;
        Ktu.tmpIsHideDrapTip = localStorage.getItem('isHideDrapTip');
        Ktu.tmpIsHideScrollTip = localStorage.getItem('isHideScrollTip');
        Ktu.tmpIsHideShapeTip = localStorage.getItem('isHideShapeTip');
        Ktu.tmpIsHideLineTip = localStorage.getItem('isHideLineTip');
        Ktu.tmpIsHideTextTip = localStorage.getItem('isHideTextTip');
    },
    methods: {
        genText() {
            return this.editQrcodeText;
        },
        createBorder(options) {
            const image = new Image();
            image.src = options.data;

            image.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // 获取当前canvas二维码最终大小
                canvas.width = options.qrCodeSize;
                canvas.height = options.qrCodeSize;

                ctx.fillStyle = this.background;
                // 画圆角
                this.drawRoundRect(ctx, 0, 0, canvas.width, canvas.height, options.ratio);
                ctx.fill();

                ctx.drawImage(image, options.x, options.y, image.width, image.height);

                // 给画布上的二维码添加白色边框
                this.newData = canvas.toDataURL();

                if (this.isToolQrCodeShow) return;
                this.updateQrCode();
                this.addQrCodeHistory(options.styleItem);
            };
        },
        // 更新二维码
        updateQrCode() {
            const newImg = new Image();
            newImg.setAttribute('crossorigin', Ktu.utils.getCrossOriginByBrowser());
            newImg.src = this.newData;

            newImg.onload = () => {
                // 更新二维码的资源
                this.qrCodeData.saveState();
                this.qrCodeData._originalElement = newImg;
                this.qrCodeData._element = newImg;
                const { msg } = this.qrCodeData;
                msg.isArtQrCode = this.isArtQrCode;
                msg.selectedStyleIdx = this.selectedStyleIdx;
                msg.artQrCodeOptions = this.artQrCodeOptions;
                this.qrCodeData.msg = msg;
                this.qrCodeData.src = this.newData;
                this.qrCodeData.base64 = this.newData;
                this.qrCodeData.dirty = true;
                this.qrCodeData.modifiedState();

                Ktu.selectedData = this.qrCodeData;
                this.isArtQrCode && this.logFn();
            };
        },
        getComponentName(type) {
            // console.log(type);
            return type === 'group' ? 'ktu-group' : 'ktu-element';
        },
        mousewheel(event) {
            /* const isOverVisible = Ktu.canvas.viewPosition.y < 0 || Ktu.canvas.viewPosition.y + Ktu.canvas.documentHeight * Ktu.canvas.viewZoom > Ktu.canvas.height;
               if (!Ktu.canvas.viewportMode) {
               const {
               x,
               y
               } = Ktu.canvas.viewPosition;
               Ktu.canvas.viewPosition = new fabric.Point(x, y + (event.deltaY > 0 ? -50 : 50));
               Ktu.canvas.fire(EventDefualt.INSIDE_VIEWPORT_CHANGE);
               this.$store.state.base.isHideEditToolbar = true;
               } */
        },

        mouseleave() {
            /* Ktu.canvas.isShowTextTips = false;
               Ktu.canvas.renderAll(); */
        },
        // 使用物品
        useWaterItem(item, position) {
            let type = '';
            const object = {
                id: item.resourceId,
                path: item.filePath,
                // 来源分类
                category: item.category,
                canCollect: item.canCollect,
                isCollect: item.isCollect,
            };
            switch (item.category) {
                case 0:
                case 1:
                    type = 'image';
                    break;
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                    type = 'svg';
                    break;
                case 9:
                    type = 'imageContainer';
                    break;
                case 20:
                    if (item.filePath.split('.').pop() == 'svg') {
                        type = 'svg';
                    } else {
                        type = 'image';
                    }
                    break;
            }
            // 特殊处理，特定Id的形状添加时不添加svg，而是添加此类型的元素
            switch (item.id) {
                case 162:
                    object.drawType = 'fill';
                    type = 'ellipse';
                    break;
                case 163:
                    object.drawType = 'fill';
                    type = 'rect';
                    break;
                case 212:
                    object.drawType = 'stroke';
                    type = 'ellipse';
                    break;
                case 213:
                    object.drawType = 'stroke';
                    type = 'rect';
                    break;
            }
            if (type === 'image' || type == 'imageContainer') {
                object.w = item.width;
                object.h = item.height;
            }
            if (position) {
                object.top = position.top;
                object.left = position.left;
            }
            if (item.category === 5) {
                const _this = this;
                // 获取绘制的svg的大小 目前只在文字容器需求需要
                object.getSvgSize = function (obj) {
                    _this.$store.commit('base/setPathGroup', obj);
                };
            }
            if (this.activeItem) {
                Ktu.simpleLog('addMaterial', this.activeItem.type);
                Ktu.simpleLog('addSysMaterial');
                Ktu.simpleLog(`add${Ktu.utils.firstUpper(this.activeItem.type)}Topic`, this.activeTopicIndex);
            } else {
                Ktu.simpleLog('addSysMaterial');
            }
            Ktu.element.addModule(type, object).then(() => {
                // 需求 拖拽文字容器时默认添加文字
                if (item.category === 5) {
                    const result = this.$store.state.base.pathGroup;
                    result.position = position;
                    this.computedTextSize(result).then(res => {
                        this.addTextToCont(res);
                    });
                }
            });
        },
        useImg(item, position) {
            const object = {
                id: item.i || item.resourceId,
                path: item.p || item.filePath,
                canCollect: true,
                isCollect: item.isCollect,
            };
            if (position) {
                object.top = position.top;
                object.left = position.left;
            }
            if (/\.svg/.test(object.path)) {
                object.tmpSrc = item.sp160p;
                if (/ktrq-/.test(item.n)) {
                    object.w = item.width;
                    object.h = item.height;
                    Ktu.element.addModule('imageContainer', object);
                } else {
                    Ktu.element.addModule('svg', object);
                }
            } else {
                object.tmpSrc = item.p160p || item.sp;
                object.w = item.w;
                object.h = item.h;

                Ktu.element.addModule('image', object);
            }

            // 添加上传素材
            Ktu.log('addUploadMaterial');
            // 上传操作-使用
            Ktu.log('upload', 'use');
        },
        // 使用物品
        searchUseWaterItem(item, position) {
            let type = '';
            switch (item.category) {
                case 0:
                case 1:
                    type = 'image';
                    break;
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                    type = 'svg';
                    break;
                case 9:
                    type = 'imageContainer';
                    break;
            }
            const object = {
                id: item.resourceId,
                path: item.filePath,
                isCollect: item.isCollect || false,
                canCollect: item.canCollect || false,
            };

            if (type === 'image' || type == 'imageContainer') {
                object.w = item.width;
                object.h = item.height;
            }

            if (position) {
                object.top = position.top;
                object.left = position.left;
            }

            // Ktu.log("addMaterial",this.activeItem.type);
            Ktu.log('addSysMaterial');
            // Ktu.log(`add${Ktu.utils.firstUpper(this.activeItem.type)}Topic`,this.activeTopicIndex);
            Ktu.element.addModule(type, object);
        },
        checkTarget(event) {
            const paths = event.path || (event.composedPath && event.composedPath());
            const result = {};
            let sourceData = Ktu.selectedTemplateData;
            /* 先遍历一次，看是不是组合里面
               然后改变sourceData */
            for (const path of paths) {
                if (path.className && path.className.includes && path.className.includes('ele') && path.getAttribute('data-index')) {
                    // 点中未选中的元素（包括组合）
                    const index = path.getAttribute('data-index');
                    const target = sourceData.objects[index];
                    const subindex = path.getAttribute('data-subindex');
                    if (!!subindex) {
                        sourceData = target;
                    }
                }
            }
            for (const path of paths) {
                if (path.getAttribute && path.getAttribute('data-type') == 'containerImage' && path.getAttribute('data-subindex')) {
                    // 点中已选中的元素
                    const parent = $(path)
                        .closest('.ele')
                        .get(0);
                    const index = parent.getAttribute('data-index');
                    const target = sourceData.objects[index];
                    result.parent = target;
                    result.childIndex = path.getAttribute('data-subindex');
                }
            }
            return result;
        },
        drop(event) {
            // 拖拽一张图片时
            if (Ktu.element.dragObject) {
                if (Ktu.element.dragObject.isCollect == 'line') {
                    this.addLineDash(Ktu.element.dragObject);
                } else {
                    this.drawImage(event, Ktu.element.dragObject);
                    Ktu.element.dragObject = null;
                }
            } else if (Ktu.element.dragObjectList) {
                // 批量拖拽图片
                Ktu.element.dragObjectList.forEach(item => {
                    this.drawImage(event, item);
                });
                Ktu.element.dragObjectList = null;
            }
            event.preventDefault();
        },

        addLineDash(item) {
            let options;
            if (item.strokeDashArray) {
                options = {
                    type: 'line',
                    top: 0,
                    left: 0,
                    width: 273,
                    height: 2,
                    strokeWidth: 2,
                    strokeDashArray: item.strokeDashArray,
                    stroke: '#f73',
                    elementName: '线条',
                    scaleX: 1,
                    scaleY: 1,
                    msg: {
                        arrowStyle: 'normal',
                        arrowEndpoint: {
                            left: false,
                            right: true,
                        },
                    },
                };
            } else {
                options = {
                    type: 'line',
                    top: 0,
                    left: 0,
                    width: 273,
                    height: 6,
                    strokeWidth: 6,
                    stroke: '#f73',
                    elementName: '线条',
                    msg: item.msg,
                    scaleX: 1,
                    scaleY: 1,
                };
            }
            Ktu.element.addModule('line', options);
            Ktu.log('quickDraw', 'line');
        },
        drawImage(event, item) {
            const canvasRect = Ktu.edit.getEditareaSize();
            canvasRect.right = canvasRect.left + canvasRect.width;
            canvasRect.bottom = canvasRect.top + canvasRect.height;
            this.dragOverIndex = null;
            this.cleanDragOverImage();
            // 清掉经过的对象
            this.dragOverObjects = [];
            /* 图片拖拽进容器
               Ktu.element.dragObject = null; */
            const target = this.checkTarget(event);
            if (!item) {
                return;
            }
            const filePath = item.filePath || item.p;
            if (!!filePath && (/\.(jpg)|(png)|(jpeg)/.test(filePath)) && !!target && !!target.parent && target.parent.type == 'imageContainer') {
                if (!target.childIndex) {
                    return;
                }
                target.parent.saveState();
                const { childIndex } = target;
                const child = target.parent.objects[childIndex];
                child.image.fileId = item.resourceId || item.i;
                child.image.width = item.width || item.w;
                child.image.height = item.height || item.h;
                child.image.scaleX = 1;
                child.image.scaleY = 1;

                /* child.width = item.width;
                   child.height = item.height;
                   child.scaleX = 1; */
                const src = item.filePath || item.p;

                delete child.image.smallSrc;
                child.setImageSource(src);
                child.setImageCenter();
                target.parent.modifiedState();
                child.autoCrop();
                target.parent.dirty = true;
                target.parent.hasChange = true;
                Ktu.selectedData = target.parent;
                Ktu.simpleLog('imageContainer', 'dragMaterialPic');
                return;
            }
            const { scale } = Ktu.edit;
            const position = {
                /* left: (event.pageX - canvasRect.left - viewport[4]) / scale - item.width / 2,
                   top: (event.pageY - canvasRect.top - viewport[5]) / scale - item.height / 2 */
                left: (event.pageX - canvasRect.left - Ktu.edit.documentPosition.left) / scale,
                top: (event.pageY - canvasRect.top - Ktu.edit.documentPosition.top) / scale,
            };
            if (item.from == 'material') {
                this.useWaterItem(item, position);
            } else if (item.from == 'upload') {
                this.useImg(item, position);
            } else if (item.from == 'search') {
                this.searchUseWaterItem(item, position);
            }
        },
        cleanDragOverImage() {
            this.dragOverObjects.forEach((e, i) => {
                if (!!e.originImage && this.dragOverIndex != i) {
                    e.image.fileId = e.originImage.fileId;
                    e.image.height = e.originImage.height;
                    e.image.left = e.originImage.left;
                    e.image.originalSrc = e.originImage.originalSrc;
                    e.image.scaleX = e.originImage.scaleX;
                    e.image.scaleY = e.originImage.scaleY;
                    e.image.src = e.originImage.src;
                    e.image.top = e.originImage.top;
                    e.image.width = e.originImage.width;
                    e.image.src160 = e.originImage.src160;
                    e.image.src2000 = e.originImage.src2000;
                    e.container.dirty = true;
                    delete e.originImage;
                }
            });
        },
        dragOver(event) {
            console.log('dragoverdragoverdragover')
            const item = Ktu.element.dragObject;
            const target = this.checkTarget(event);
            if (!item) {
                return;
            }
            const filePath = item.filePath || item.p;
            this.cleanDragOverImage();
            if (!!filePath && (/\.(jpg)|(png)|(jpeg)/.test(filePath)) && !!target && !!target.parent && target.parent.type == 'imageContainer') {
                if (!target.childIndex) {
                    return;
                }
                const { childIndex } = target;
                const child = target.parent.objects[childIndex];
                const fileId = item.resourceId || item.i;
                if (child.image.fileId == fileId) {
                    return;
                }
                // 加入经过的对象，后面会清掉信息
                !this.dragOverObjects.some(e => e == child) && this.dragOverObjects.push(child);
                this.dragOverIndex = this.dragOverObjects.indexOf(child);
                child.originImage = _.cloneDeep(child.image);
                child.image.fileId = fileId;
                child.image.width = item.width || item.w;
                child.image.height = item.height || item.h;
                child.image.scaleX = 1;
                child.image.scaleY = 1;
                child.image.src2000 = null;
                /* child.width = item.width;
                   child.height = item.height;
                   child.scaleX = 1; */
                const src = item.filePath || item.p;
                // child.setImageSource(src);
                child.image.src = Ktu.utils.get160Image(src);
                child.setImageCenter(true);
                target.parent.dirty = true;
            } else {
                this.dragOverIndex = null;
            }
            event.preventDefault();
            return false;
        },
        onDragenter(event) {
            this.enterEditCenter = true;
        },
        checkLocalPageData() {
            this.localPageData = Ktu.save.checkLocalPageData();
        },
        compareLocalPageData() {
            const that = this;
            const compareLocalPageData = [];
            const sourceTemplateData = _.cloneDeep(Ktu.templateData);
            sourceTemplateData.forEach(temp => {
                temp.objects = temp.objects.map(item => item.toObject());
            });
            for (let i = 0; i < sourceTemplateData.length; i++) {
                const data = that.localPageData.filter(c => c.pageId === sourceTemplateData[i].id);
                if (data.length > 0 && data[0].localTime > sourceTemplateData[i].updateTime) {
                    compareLocalPageData.push(data[0]);
                }
            }
            if (compareLocalPageData.length > 0) {
                // 提示框
                that.$Modal.confirm({
                    content: '是否恢复因异常退出而未保存的作品？',
                    okText: '恢复',
                    cancelText: '放弃',
                    okBtnType: 'warn',
                    onOk() {
                        that.saveHistoryData(compareLocalPageData);
                        // 覆盖作品
                        Ktu.template.coverTemplate(compareLocalPageData);

                        Ktu.save.changeLocalPageState(true);
                        Ktu.log('reCoverPageData', 'clickRecoverBtn');
                        setTimeout(() => {
                            that.hasCoverPage = true;
                        }, 0);
                    },
                    onCancel() {
                        Ktu.save.deleteLocalPageData(0, Ktu.template.currentpageId);
                        Ktu.save.changeLocalPageState(false);
                        Ktu.log('reCoverPageData', 'clickQuitBtn');
                    },
                });
                Ktu.simpleLog('reCoverPageData', 'alertRecoverTips');
            }
        },
        // 保存用于恢复后前进后退的历史数据
        saveHistoryData(afterData) {
            const beforeData = _.cloneDeep(afterData);
            beforeData.forEach((bd, idx) => {
                const index = Ktu.template.getPageIndex(bd.pageId);
                const tmpFileStr = Ktu.ktuData.tmpContents[index].tmpFilePath.slice(0);
                bd.objects = _.cloneDeep(Ktu.templateData[index].objects).map(item => item.toObject());
                bd.tmpFilePath = tmpFileStr;
            });
            Ktu.template.changeState({ beforeData, afterData });
        },
        // 删除前进后退队列中的pageHistoryData
        deletePageHistoryData(action) {
            // 首先去除多余的页面的步骤
            Ktu.historyManager.splice(Ktu.templateData.length);
            // 再去除存在的pageHistoryData的step
            Ktu.historyManager.forEach((hm, i) => {
                for (let j = 0; j < hm.steps.length; j++) {
                    if (hm.steps[j].action === action) {
                        hm.steps.splice(j, 1);
                        hm.currentStep !== 0 && hm.currentStep--;
                        j -= 1;
                    }
                }
            });
            // 操作完重置状态
            this.hasCoverPage = false;
        },
    },
});
