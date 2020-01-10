Vue.component('tool-qrcode-style', {
    template: `
        <div class="tool-box qrCode-style">
            <tool-btn
                :active="isShow"
                @click="show($event, 'qr-code', 'style');"
            >二维码样式</tool-btn>
            <transition :name="transitionName">
                <div v-show="isShow" :style="{'opacity':styleModalOpacity}" class="tool-popup tool-qrCode-style-popup" ref="popup" >
                    <div class="style-container" @scroll="styleScrollLoad" ref="styleContainer">
                        <div class="history" v-if="historyStyleList">
                            <div class="title">历史使用</div>
                            <div class="history-style">
                                <div
                                    :class="['style', {'hover': !isCreatingEditArt, 'selected': selectedStyleIdx===item.id}]"
                                    v-for="item in historyStyleList"
                                    key="item.id"
                                    :data-key="item.id"
                                    ref="qrCodeStyle"
                                    @click="changeCanvasQrCodeStyle(item, $event)"
                                >
                                    <img class="style-img" :src="item.coverSrc">
                                    <div class="creating" v-show="isCreatingEditArt && selectedArtId===item.id">
                                        <div class="loading-box">
                                            <svg>
                                                <use xlink:href="#svg-loading-small"></use>
                                            </svg>
                                        </div>
                                        <div class="cancel-creating" @click.stop="cancelGenArtQrCode">取消生成</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="library">
                            <div class="title">样式库</div>
                            <div class="library-style">
                                <div :class="['style','default',{'selected':!isArtQrCode}]" @click="createQrCodeFn">默认</div>
                                <div
                                    :class="['style', {'hover': !isCreatingEditArt, 'selected': selectedStyleIdx===item.id}]"
                                    v-for="item in editStyleList"
                                    key="item.id"
                                    :data-key="item.id"
                                    ref="qrCodeStyle"
                                    @click="changeCanvasQrCodeStyle(item, $event)"
                                >
                                    <img class="style-img" :src="item.coverSrc">
                                    <div class="creating" v-show="isCreatingEditArt && selectedArtId===item.id">
                                        <div class="loading-box">
                                            <svg>
                                                <use xlink:href="#svg-loading-small"></use>
                                            </svg>
                                        </div>
                                        <div class="cancel-creating" @click.stop="cancelGenArtQrCode">取消生成</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    `,
    mixins: [Ktu.mixins.popupCtrl, Ktu.mixins.dataHandler, Ktu.mixins.artQrCode],
    props: {},
    data() {
        return {
            // 使用一个变量是为了避免高手速去色导致的Bug
            foreground: '#000',
            background: '#fff',
            newData: '',
            // 区分是给样式列表的二维码添加边框还是给画布的二维码添加边框
            styleModalOpacity: 1,
            styleModalCloseTimer: null,
            isSelectHistory: false,
            qrCodeSize: 800,
            ratio: 3.85,
            tmpStyleItem: null,
            styleLoadIndex: 0,
        };
    },
    computed: {
        qrCodeEditor() {
            return this.$store.state.base.qrCodeEditor;
        },
        selectedData() {
            if (Ktu.store.state.data.selectedData) {
                return Ktu.store.state.data.selectedData;
            }
            return {};
        },
        qrCode: {
            get() {
                if (Ktu.store.state.data.selectedData) {
                    return Ktu.store.state.data.selectedData.msg;
                }
                return {};
            },
            set(value) {
                Ktu.store.state.data.selectedData.msg = value;
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
        // 是否选择了样式
        isCreatingEditArt: {
            get() {
                return this.$store.state.base.isCreatingEditArt;
            },
            set(value) {
                this.$store.state.base.isCreatingEditArt = value;
            },
        },
        editStyleList: {
            get() {
                return this.$store.state.base.editStyleList;
            },
            set(value) {
                this.$store.state.base.editStyleList = value;
            },
        },
        isCancelChangeStyle: {
            get() {
                return this.$store.state.base.isCancelChangeStyle;
            },
            set(value) {
                this.$store.state.base.isCancelChangeStyle = value;
            },
        },
        totalStyleNum: {
            get() {
                return this.$store.state.base.totalStyleNum;
            },
            set(value) {
                this.$store.state.base.totalStyleNum = value;
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
        type() {
            return this.qrCode.type;
        },
    },
    watch: {
        qrCode: {
            handler() {
                if (this.qrCodeEditor.show) return;
                this.background = this.qrCode.background;
                this.foreground = this.qrCode.foreground;
                this.selectedStyleIdx = this.qrCode.selectedStyleIdx;
                this.isArtQrCode = this.qrCode.isArtQrCode;
            },
            immediate: true,
            deep: true,
        },
    },
    mounted() {
        // 获取二维码样式历史
        if (!this.historyStyleList) {
            this.historyStyleList = [];
            this.getQrCodeHistory();
        }

        if (!this.editStyleList) {
            this.editStyleList = [];
            this.getStyleList();
        }
    },
    methods: {
        // 生成二维码（虚拟dom来生成）
        createQrCode() {
            if (this.isArtQrCode) {
                this.isCreatingEditArt = true;
                this.artQrCodeOptions = Object.assign(this.qrCode.artQrCodeOptions, {
                    width: 372,
                    height: 372,
                    x: 30.8,
                    y: 30.8,
                    ratio: 15.4,
                    dom: document.createElement('div'),
                });
                this.useArtQrCode(this.artQrCodeOptions);
            } else {
                this.createQrCodeFn();
            }
        },
        // 生成二维码（虚拟dom来生成）
        createQrCodeFn() {
            this.$nextTick(() => {
                this.createQrCodeImg();
            });
        },
        createQrCodeImg() {
            this.isArtQrCode = false;
            this.selectedStyleIdx = null;

            this.genQrCode();
        },
        genText() {
            let text = '';

            if (this.type === 1) {
                let url;
                if (this.qrCode.flyer && JSON.stringify(this.qrCode.flyer) !== '{}') {
                    url = this.qrCode.flyer.url;
                } else if (this.qrCode.game && JSON.stringify(this.qrCode.game) !== '{}') {
                    url = this.qrCode.game.url;
                } else {
                    url = this.qrCode.url;
                }
                if (url.indexOf('payapp.weixin.qq.com/aa/') > -1) {
                    text = '';
                } else {
                    if (url.indexOf('http://') < 0 && url.indexOf('https://') < 0) {
                        url = `http://${url}`;
                    }
                }
                text = url;
            } else if (this.type === 2) {
                text
                    = `BEGIN:VCARD \r\nFN:${
                        this.qrCode.name
                    }\r\nTITLE:${
                        this.qrCode.job
                    } \r\nTEL;WORK,VOICE:${
                        this.qrCode.telephone
                    }\r\nTEL;CELL,VOICE:${
                        this.qrCode.cellphone
                    }\r\nORG:${
                        this.qrCode.company
                    }\r\nEND:VCARD`;
            } else if (this.type === 3) {
                text = this.qrCode.localUrl;
            } else {
                return;
            }

            this.editQrcodeText = text;
            return text;
        },

        genQrCode() {
            // 创建dom节点保存二维码信息
            const qr = $('<div></div>');

            const callback = () => {
                const canvas = qr.find('canvas').get(0);
                const options = {
                    data: canvas.toDataURL(),
                    width: this.qrCodeSize,
                    height: this.qrCodeSize,
                    dom: qr,
                    x: 8 * this.ratio,
                    y: 8 * this.ratio,
                    ratio: 4 * this.ratio,
                    styleItem: {},
                };
                canvas && this.createBorder(options);
            };

            const text = this.genText();

            if (text === undefined) {
                return;
            }

            qr.qrcode(
                {
                    render: 'canvas',
                    text,
                    // 二维码的宽度
                    width: this.qrCodeSize - 16 * this.ratio,
                    // 二维码的高度
                    height: this.qrCodeSize - 16 * this.ratio,
                    // 二维码中间的图片
                    src: this.qrCode.logo,
                    imgWidth: 58 * this.ratio,
                    imgHeight: 58 * this.ratio,
                    // 二维码的后景色
                    background: this.background,
                    // 二维码的前景色
                    foreground: this.foreground,
                },
                callback,
            );

            // 这里存在当有logo的时候存在异步回调
            if (!this.qrCode.logo) {
                callback();
            }
        },
        styleScrollLoad() {
            this.styleScrollTimer && window.clearTimeout(this.styleScrollTimer);
            this.styleScrollTimer = window.setTimeout(() => {
                // 加载完毕 返回
                if (this.totalStyleNum === this.editStyleList.length) return false;

                const container = this.$refs.styleContainer;
                if (!this.styleLoading && container.scrollTop + container.clientHeight >= container.scrollHeight) {
                    this.styleLoadIndex = Math.floor(this.editStyleList.length / 19);
                    this.getStyleList();
                }
            }, 50);
        },
        changeCanvasQrCodeStyle(item, event) {
            if (this.selectedStyleIdx === item.id || this.isCreatingEditArt) {
                return;
            }

            const dataKey = this.dataKeyFilter(event);

            // 参考上面的createQrCodeImg方法
            const options = {
                text: this.genText(),
                dom: document.createElement('div'),
                // 插件把高宽放大了两倍左右
                width: 370,
                height: 370,
                qrCodeSize: this.qrCodeSize,
                x: 8 * this.ratio,
                y: 8 * this.ratio,
                styleItem: item,
                ratio: 4 * this.ratio,
            };
            this.artQrCodeOptions = options;
            this.editQrCodeOptions = options;
            this.qrCodeData = this.selectedData;
            this.isCancelChangeStyle = false;
            this.isCancel = false;

            this.isCreatingEditArt = true;
            // 关闭加载动画
            const callback = () => {
                this.isCreatingEditArt = false;
                this.selectedStyleIdx = dataKey;
                this.tmpStyleItem = item;
            };
            this.useArtQrCode(options, callback, event);
        },
        cancelGenArtQrCode() {
            if (this.isCreatingEditArt) {
                if (!this.selectedStyleIdx) this.isArtQrCode = false;
                this.isCreatingEditArt = false;
                this.isCancel = true;
                this.isCancelChangeStyle = true;
                this.editQrCodeOptions.styleItem = this.tmpStyleItem;
                this.artQrCodeOptions.styleItem = this.tmpStyleItem;
                clearTimeout(this.qrCodeTimer);
                this.qrCodeTimer = null;
            };
        },
        getStyleList() {
            this.styleLoading = true;

            const url = '../ajax/artQrcode/getList_h.do?cmd=getList';

            axios
                .post(url, {
                    limit: 19,
                    scrollIndex: this.styleLoadIndex,
                    // 目前类型只有图像二维码，不传的话默认就是 1，除了 1 传其他就啥都没了
                    type: '1',
                })
                .then(res => {
                    this.editStyleList = this.editStyleList.concat(res.data.data.list);
                    this.totalStyleNum = res.data.data.totalSize;
                })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => {
                    this.styleLoading = false;
                });
        },
        createBorder(options) {
            // 给画布上的二维码添加白色边框
            const image = new Image();
            image.src = options.data;

            image.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // 获取当前canvas二维码最终大小
                canvas.width = this.qrCodeSize;
                canvas.height = this.qrCodeSize;

                ctx.fillStyle = this.background;
                // 画圆角
                this.drawRoundRect(ctx, 0, 0, canvas.width, canvas.height, 4 * this.ratio);
                ctx.fill();

                ctx.drawImage(image, options.x, options.y, image.width, image.height);

                this.newData = canvas.toDataURL();
                this.updateQrCode();

                this.isArtQrCode && this.logFn();
                this.isArtQrCode && this.addQrCodeHistory(options.styleItem);
            };
        },
        // 更新二维码
        updateQrCode() {
            const newImg = new Image();
            newImg.setAttribute('crossorigin', Ktu.utils.getCrossOriginByBrowser());
            newImg.src = this.newData;

            newImg.onload = () => {
                if (this.isCreatingEditArt) this.isCreatingEditArt = false;
                if (!this.selectedData.type) return;
                // 更新二维码的资源
                this.selectedData.saveState();
                this.selectedData._originalElement = newImg;
                this.selectedData._element = newImg;

                this.selectedData.src = this.newData;
                this.selectedData.base64 = this.newData;
                const msg = this.qrCode;
                msg.isArtQrCode = this.isArtQrCode;
                msg.selectedStyleIdx = this.selectedStyleIdx;

                if (this.artQrCodeOptions) {
                    msg.artQrCodeOptions = Object.assign({}, {
                        text: this.artQrCodeOptions.text,
                        styleItem: this.artQrCodeOptions.styleItem,
                    });
                }

                msg.background = this.background;
                msg.foreground = this.foreground;
                this.selectedData.msg = msg;
                this.selectedData.dirty = true;
                this.selectedData.modifiedState();
            };
        },
    },
});
