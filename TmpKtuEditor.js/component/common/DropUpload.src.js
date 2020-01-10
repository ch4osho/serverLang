Vue.component('dropUpload', {
    template: `
    <div class="drop-upload">
        <div class="drop-upload-bg" ref="drop" v-show="isDroping && isFromOut">
            <div class="drop-upload-container" v-show="!isUpload" :class="{'drop-hover-container':dropHoverArea==true}">
                <div v-if="!dropHoverArea" class="drop-upload-body">
                    <div class="drop-upload-icon">
                        <svg>
                            <use xlink:href="#svg-upload-icon"></use>
                        </svg>
                    </div>
                    <div class="drop-upload-text">拖至此处，上传图片</div>
                    <div class="drop-upload-tip">
                        <svg>
                            <use xlink:href="#svg-upload-tip"></use>
                        </svg>
                        <span>支持PNG、JPG、SVG</span>
                    </div>
                </div>
                <div v-else class="drop-upload-hoverbody">请松开鼠标</div>
            </div>
            <div class="drop-upload-progress" v-show="isUpload">
                <div class="drop-upload-progress-bg" :style="{width : barWidth}">
                    <div class="drop-upload-progress-bar"></div>
                </div>
                <svg class="drop-upload-progress-close" @mouseenter="hover = true;" @mouseleave="hover = false;" @click="stopUpload">
                    <use xlink:href="#svg-upload-close" v-if="!hover"></use>
                    <use xlink:href="#svg-upload-close-hover" v-else></use>
                </svg>
                <div class="drop-upload-progress-text">正在上传...({{nowUploadIndex}}/{{acceptLength}})</div>
            </div>
        </div>
    </div>
    `,
    mixins: [Ktu.mixins.uploadSetting],
    data() {
        return {
            hover: false,
            isUpload: false,
            nowUploadIndex: 0,
            acceptImageType: ['image/jpeg', 'image/png', 'image/svg+xml'],
            maxLength: 10,
            acceptLength: 0,
            filterFiles: [],
            totalLength: 0,
            dropHoverArea: false,
            uploadFn: null,
            uploadOutPut: null,
        };
    },
    created() {
        // this.uploadFn = new Ktu.uploadify(this.getAdvanceSetting()); // 初始化
    },
    computed: {
        isDroping: {
            get() {
                return this.$store.state.base.isDroping;
            },
            set(value) {
                this.$store.state.base.isDroping = value;
            },
        },
        isFromOut: {
            get() {
                return this.$store.state.base.isFromOut;
            },
            set(value) {
                this.$store.state.base.isFromOut = value;
            },
        },
        dropComplete: {
            get() {
                return this.$store.state.base.dropComplete;
            },
            set(value) {
                console.log(value, 'value');
                // this.$store.state.base.dropComplete = value;
                this.$store.commit('base/changeState', {
                    prop: 'dropComplete',
                    value,
                });
            },
        },
        barWidth() {
            if (this.acceptLength == 0) {
                return '0%';
            }
            return `${(this.nowUploadIndex / this.acceptLength) * 100}%`;
        },
    },
    mounted() {
        const options = Object.assign({}, this.getAdvanceSetting(), { uploadType: 'drop' });
        this.uploadFn = new Ktu.uploadify(options);
        this.uploadOutPut = this.uploadFn.outPut();
        this.initDropEvent();
    },
    methods: {
        // 选择文件后
        select(files) {
            const { fileObj } = this.uploadFn;
            if (!this.limit().onSelectLimit(files)) {
                return false;
            }
            this.isUpload = true;
            this.acceptLength = fileObj.fileFilterLength;
            if (this.acceptLength) {
                this.isDroping = true;
            } else {
                this.uploadClear();
                return false;
            }
            return true;
        },
        // 单张上传成功的回调
        uploadSuccess(data, file) {
            const { fileObj } = this.uploadFn;
            if (data.success) {
                this.userImg(data);
            }
            this.nowUploadIndex = this.acceptLength - fileObj.fileFilterLength;
            // this.report(file, this.TYPE_ADVANCE_UPLOAD, data.success);
        },
        uploadAllSuccess(data, file) {
            this.getUploadStorage();
            setTimeout(() => {
                this.uploadClear();
                if (data.success) {
                    this.dropComplete = true;
                }
            }, 600);
        },
        initDropEvent() {
            document.addEventListener('dragstart', event => {
                console.log('dragstart')
                this.isFromOut = false;
            }, false);

            document.addEventListener('dragend', event => {
                console.log('dragend')

                if (!Ktu.element.dragObject) this.isDroping = false;
                this.isFromOut = true;
            }, false);

            document.addEventListener('dragenter', event => {
                console.log('dragenter')

                event.preventDefault();
                /* 防止上传时 重复上传*/

                if (this.isUpload || !!Ktu.element.dragObject) return false;
                this.isDroping = true;
                /* this.isDroping = true;
                   this.acceptLength = 0; */
            }, false);

            document.addEventListener('dragover', event => {
                console.log('dragover')

                this.dropHoverArea = false;
                event.preventDefault();
            }, false);

            document.addEventListener('drop', event => {
                console.log('drop')

                event.preventDefault();
            }, false);

            this.$refs.drop.addEventListener('mouseenter', event => {
                console.log('$refs.drop的mouseenter')
                if (!this.acceptLength) {
                    this.isDroping = false;
                }
            }, false);

            this.$refs.drop.addEventListener('drop', e => {
                console.log('$refs.drop的drop')
                event.preventDefault();
                event.stopPropagation();
                return false;
            });

            this.$refs.drop.firstChild.addEventListener('dragover', event => {
                console.log('$refs.drop.firstChild的dragover')
                console.log('这是文件的event',event)
                console.log('这是上传的文件',window.btoaevent.dataTransfer.files)
                event.preventDefault();
                event.stopPropagation();
                this.dropHoverArea = true;
            }, false);

            this.$refs.drop.firstChild.addEventListener('drop', e => {
                console.log('$refs.drop.firstChild的dragover')
                event.preventDefault();
                event.stopPropagation();

                // 防止上传时 重复上传
                if (this.isUpload) {
                    this.$Notice.warning('正在上传中，请勿重复上传。');
                    return false;
                }
                // 获取文件对象
                const { files } = e.dataTransfer;

                console.log('这是文件的e',e)
                this.uploadFn.funGetFiles(files);
                // 开始上传图片
                this.dropComplete = false;
                return false;
            });
        },
        // 上传列表提交前的操作  进行筛选操作
        uploadPushList(tmpFileArr, tmpDeferArr, file) {
            const createObjectURL = function (blob) {
                return window[window.webkitURL ? 'webkitURL' : 'URL'].createObjectURL(blob);
            };

            const defer = $.Deferred();
            tmpDeferArr.push(defer);

            const newImgData = createObjectURL(file);
            const newImg = new Image();
            newImg.onload = info => {
                const { target } = info;
                const { width } = target;
                const { height } = target;

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

            function svgJudge(file, target, defer) {
                const reader = new FileReader();
                reader.readAsText(file);

                reader.onload = async ev => {
                    const text = ev.target.result;
                    // 读取svg结构 如果带有image 直接返回
                    if (text.match(/<(image)/gim) != null) {
                        this.$Notice.warning(`${file.name}格式异常上传失败。`);
                    } else {
                        // 准备空画布
                        const canvas = document.createElement('canvas');
                        let { width } = target;
                        let { height } = target;
                        const scale = width / height;
                        // 保证缩略图不能过小
                        if (width < 300 && height < 300) {
                            width = 300;
                            height = width / scale;
                        }
                        let pngBase64;
                        if (Ktu.browser.isFirefox) {
                            pngBase64 = await Ktu.utils.svgToPngBase64(newImgData);
                        } else {
                            canvas.width = width;
                            canvas.height = height;
                            // 取得画布的2d绘图上下文
                            const context = canvas.getContext('2d');
                            context.drawImage(newImg, 0, 0, width, height);
                        }
                        pngBase64 = canvas.toDataURL('image/png');
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
        stopUpload() {
            this.uploadOutPut.stop(
                () => {
                    this.dropComplete = true;
                    this.uploadClear();
                }
            );
        },
        uploadClear() {
            this.nowUploadIndex = 0;
            this.acceptLength = 0;
            this.isUpload = false;
            this.isDroping = false;
        },
        userImg(item, position) {
            const object = {
                id: item.id,
                path: item.path,
                canCollect: true,
                isCollect: false,
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
            Ktu.simpleLog('addUploadMaterial');

            // 上传操作-使用
            Ktu.simpleLog('upload', 'use');
        },
    },
});
