Vue.component('file-menu', {
    template: `<div class="file-menu popup-menu" ref="menu">
        <div v-touch-ripple class="nav-btn" :class="{active:isShow}" @click="show($event, 'clickFile')">
            <svg class="nav-icon">
                <use xlink:href="#svg-nav-file" class="nav-icon-use"></use>
            </svg>
            <div class="btn-name">文件</div>
        </div>
        <transition name="slide-up">
            <div v-show="isShow" ref="popup" class="menu-popup file-menu-popup">
                <div class="file-title ellipsis">{{title}}</div>
                <div class="file-size">
                    <span class="file-size-span">{{fileSize}}</span>
                    <svg class="nav-icon" @click="resizeFlie" v-if="!isFromThirdDesigner">
                        <use xlink:href="#svg-nav-resize" class="nav-icon-use"></use>
                    </svg>
                </div>
                <div class="border-line"></div>
                <a class="file-btn file-btn-save" :href="myOpusUrl" target="_blank" @click="myOpus">
                    <svg class="nav-icon">
                        <use xlink:href="#svg-my-opus" class="nav-icon-use"></use>
                    </svg>
                    <div class="file-des">我的作品</div>
                </a>
                <div class="border-line"></div>
                <div class="file-btn file-btn-save" @click="saveFile" :class="{disabled: isDisabledSave}">
                    <svg class="nav-icon">
                        <use xlink:href="#svg-nav-save" class="nav-icon-use"></use>
                    </svg>
                    <div class="file-des">保存</div>
                </div>
                <div class="file-btn file-btn-save" @click="SaveAsFile">
                    <svg class="nav-icon">
                        <use xlink:href="#svg-nav-save-as" class="nav-icon-use"></use>
                    </svg>
                    <div class="file-des">另存为</div>
                </div>
                <div class="border-line"></div>
                <div class="file-btn file-btn-save" @click="downloadFile">
                    <svg class="nav-icon">
                        <use xlink:href="#svg-nav-download" class="nav-icon-use"></use>
                    </svg>
                    <div class="file-des">下载</div>
                </div>
                <div class="file-btn" id="file-upload-btn" @click="uploadClick">
                    <svg class="nav-icon">
                        <use xlink:href="#svg-nav-upload" class="nav-icon-use"></use>
                    </svg>
                    <div class="file-des">上传图片</div>
                </div>
                <div class="file-btn" id="file-psd-btn" @click="psdUploadClick">
                    <svg class="nav-icon">
                        <use xlink:href="#svg-nav-psd" class="nav-icon-use"></use>
                    </svg>
                    <div class="file-des">上传PSD</div>
                </div>
            </div>
        </transition>
    </div>`,
    /* <div class="file-btn file-btn-load" @click="loadFile">导入现有设计</div>
                   <div class="file-btn file-btn-copy" @click="copyFile">复制当前设计</div> */
    mixins: [Ktu.mixins.popupCtrl, Ktu.mixins.dataHandler, Ktu.mixins.uploadSetting],
    data() {
        return {
            isShowMask: true,
            canvasData: Ktu.ktuData.other,
            uploadNum: 0,
            // 提示出现过即加锁
            saveFaileTipsLock: false,
        };
    },
    computed: {
        isDisabledSave() {
            return this.$store.state.msg.saveChangedNum === 0;
        },
        title() {
            return this.$store.state.msg.title;
        },
        fileSize() {
            if (this.canvasData) {
                let unit = '';
                switch (this.canvasData.unit) {
                    case 1:
                        unit = 'px';
                        break;
                    case 2:
                        unit = 'mm';
                        break;
                    case 3:
                        unit = 'cm';
                        break;
                    case 4:
                        unit = 'in';
                        break;
                }

                return `${this.canvasData.originalWidth + unit} x ${this.canvasData.originalHeight}${unit}`;
            }
            return '';
        },
        isFromThirdDesigner() {
            return Ktu.isFromThirdDesigner;
        },
        isModalClose() {
            return this.$store.state.base.modalClose;
        },
        showSaveFailedTips() {
            return this.$store.state.data.showSaveFailedTips;
        },
        myOpusUrl() {
            return `//${Ktu.manageDomain}/manage/ktuManage.jsp#/m/my`;
        },
    },
    watch: {
        isModalClose(value) {
            if (value) {
                this.isShow = false;
            }
        },
        showSaveFailedTips(val) {
            if (val && !this.saveFaileTipsLock) {
                this.saveFaileTips();
                // 加锁
                this.saveFaileTipsLock = true;
            }
        },
    },
    mounted() {
        this.getUploadStorage();
        this.initUpload('#file-upload-btn');
        this.$store.state.base.isUsedPsdUpload = false;
    },
    methods: {
        jumpPage() {
            // 判断是否为第三方设计师
            console.log(Ktu.isThirdDesigner);
        },
        myOpus() {
            sessionStorage.setItem('manageType', 'myWork');
            this.timer && window.clearTimeout(this.timer);
            this.timer = window.setTimeout(() => {
                this.isShow = false;
                this.$store.commit('base/maskState', false);
            });
        },
        saveFile() {
            Ktu.template.saveCurrentPage();
            Ktu.save.changeClickSaveState(true);
            Ktu.log('save');
        },
        SaveAsFile() {
            this.timer && window.clearTimeout(this.timer);
            this.timer = window.setTimeout(() => {
                this.isShow = false;
                this.$store.commit('base/maskState', false);
            });
            Ktu.log('savaAsClick');
            this.$store.commit('modal/saveAsModalState', true);
        },
        downloadFile() {
            // 未保存要先保存 要等保存完毕后才打开弹窗
            Ktu.template.saveCurrentPage(true);
            this.downloadTimer && window.clearTimeout(this.downloadTimer);

            this.downloadTimer = window.setTimeout(() => {
                this.isShow = false;
                this.$store.commit('base/maskState', false);
            }, 400);
            this.$store.commit('modal/downloadModalState', true);
        },
        uploadClick() {
            this.timer && window.clearTimeout(this.timer);
            this.timer = window.setTimeout(() => {
                this.isShow = false;
                this.$store.commit('base/maskState', false);
                // Ktu.log("upload","fileClick");
            });
        },
        psdUploadClick() {
            this.psdTimer && window.clearTimeout(this.psdTimer);
            this.psdTimer = window.setTimeout(() => {
                this.isShow = false;
                this.$store.commit('base/maskState', false);
            }, 400);
            // Ktu.mainCanvas.saveCurrentPage(true);
            this.$store.commit('modal/psdUploadModalState', true);
        },
        loadFile() {
            console.log('加载');
        },
        copyFile() {
            console.log('复制');
        },
        resizeFlie() {
            this.resizeTimer && window.clearTimeout(this.resizeTimer);
            this.resizeTimer = window.setTimeout(() => {
                this.isShow = false;
                this.$store.commit('base/maskState', false);
            }, 400);
            this.$store.commit('modal/resizeFileModalState', {
                isOpen: true,
                props: {
                    fromTo: 1,
                },
            });

            Ktu.log('resizePage', 'mShow');
        },

        uploadPushList(tmpFileArr, tmpDeferArr, file) {
            const createObjectURL = function (blob) {
                return window[window.webkitURL ? 'webkitURL' : 'URL'].createObjectURL(blob);
            };

            const defer = $.Deferred();
            tmpDeferArr.push(defer);

            const newImgData = createObjectURL(file);
            const newImg = new Image();
            newImg.onload = info => {
                const {
                    target,
                } = info;
                const {
                    width,
                } = target;
                const {
                    height,
                } = target;

                if (width > 16380 || height > 16380) {
                    this.$Notice.warning(`${file.name}宽高大于16380，请裁剪后再上传。`);
                    defer.resolve();
                } else {
                    if (/svg/.test(file.type)) {
                        svgJudge.bind(this)(file, target, defer);
                    } else {
                        tmpFileArr.push(file);
                        defer.resolve();
                    }
                }
            };
            newImg.src = newImgData;
            this.$store.commit('base/changeState', {
                prop: 'selectedCategory',
                value: 'upload',
            });

            function svgJudge(file, target, defer) {
                const reader = new FileReader();
                reader.readAsText(file);

                reader.onload = ev => {
                    const text = ev.target.result;
                    // 读取svg结构 如果带有image 直接返回
                    if (text.match(/<(image)/img) != null) {
                        this.$Notice.warning(`${file.name}格式异常上传失败。`);
                    } else {
                        // 准备空画布
                        const canvas = document.createElement('canvas');
                        let {
                            width,
                        } = target;
                        let {
                            height,
                        } = target;
                        const scale = width / height;
                        // 保证缩略图不能过小
                        if (width < 300 && height < 300) {
                            width = 300;
                            height = width / scale;
                        }
                        canvas.width = width;
                        canvas.height = height;

                        // 取得画布的2d绘图上下文
                        const context = canvas.getContext('2d');
                        context.drawImage(newImg, 0, 0, width, height);

                        let pngBase64 = canvas.toDataURL('image/png');
                        pngBase64 = pngBase64.split(',')[1];
                        file.pngStr = pngBase64;

                        tmpFileArr.push(file);
                    }
                    defer.resolve();
                };
                reader.onerror = function () {
                    defer.reject();
                };
            }
        },
        uploadAllSuccess(data, file) {
            /* this.uploadNum++;
            console.log('11111111111111111', data);
            if (this.totalUploadNum <= 3) {
                this.useImg(data);
            }

            if (this.totalUploadNum == this.uploadNum) {
                this.uploadNum = 0;
            }*/
            this.getUploadStorage();
            Ktu.vm.$store.state.base.changePicComplete = true;
        },
        useImg(item, position) {
            const object = {
                id: item.id,
                path: item.path,
            };
            if (position) {
                object.top = position.top;
                object.left = position.left;
            }
            if (/\.svg/.test(object.path)) {
                object.tmpSrc = item.sp160p;
                Ktu.element.addModule('svg', object);
            } else {
                object.tmpSrc = item.pre160ViewPath || item.path;
                object.w = item.width;
                object.h = item.height;

                Ktu.element.addModule('image', object);
            }

            // 添加上传素材
            Ktu.log('addUploadMaterial');
        },
        saveFaileTips() {
            // 提示框
            this.$Modal.warning({
                content: '作品保存失败，可尝试刷新页面或隔一段时间后再保存作品',
                okText: '确认',
                renderClose: true,
            });
            Ktu.log('saveFailed', 'alertRefreshTips');
        },
    },
});
