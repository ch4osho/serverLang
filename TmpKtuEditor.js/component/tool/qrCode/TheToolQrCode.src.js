Vue.component('tool-qrCode', {
    template: `<div class="tool-qrCode">
                    <tool-btn class="tool-box qrCode-tip" @click="modifyQrCode">编辑内容</tool-btn>
                    <div class="tool-split tool-box"></div>

                    <tool-qrcode-style></tool-qrcode-style>

                    <color-picker
                        v-if="!isArtQrCode"
                        :value="foreground"
                        @input="selectForeground"
                        tips="前景色"
                        :showQrCodeTip="true"
                        colorType="foreground"
                        logType="qr-code"
                        :artQrCode="isArtQrCode"
                    ></color-picker>
                    <color-picker
                        :value="qrCode.background"
                        @input="selectBackground"
                        tips="背景色"
                        :showQrCodeTip="true"
                        colorType="background"
                        logType="qr-code"
                    ></color-picker>

                    <div class="tool-split tool-box"></div>

                    <tool-shadow eventType="qr-code"></tool-shadow>

                    <tool-opacity eventType="qr-code"></tool-opacity>

                    <tool-rotate eventType="qr-code"></tool-rotate>

                    <template v-if="!isObjectInGroup">
                        <div class="tool-split tool-box"></div>
                    </template>

                    <tool-change-pic></tool-change-pic>

                    <div class="tool-split tool-box"></div>

                    <tool-size></tool-size>

                    <slot></slot>
                </div>`,
    mixins: [Ktu.mixins.popupCtrl, Ktu.mixins.dataHandler, Ktu.mixins.artQrCode],
    data() {
        return {
            // 使用一个变量是为了避免高手速取色导致的Bug
            foreground: '#000',
            // background: '#fff',
            newData: '',
            backgroundTimer: null,
            foregroundTimer: null,
            qrCodeSize: 800,
            ratio: 3.85,
        };
    },
    computed: {
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
        type() {
            return this.qrCode.type;
        },

        isInternalAcct() {
            return Ktu._isInternalAcct;
        },
        qrCodeEditor() {
            return this.$store.state.base.qrCodeEditor;
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
        editQrcodeText: {
            get() {
                return this.$store.state.base.editQrcodeText;
            },
            set(value) {
                this.$store.state.base.editQrcodeText = value;
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
        this.isToolQrCodeShow = true;
    },
    destroyed() {
        this.isToolQrCodeShow = false;
    },
    methods: {
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
        // 选择前景色
        selectForeground(value) {
            this.foreground = value;
            this.foregroundTimer && clearTimeout(this.foregroundTimer);
            this.foregroundTimer = setTimeout(this.createQrCode, 20);
        },
        // 选择背景色
        selectBackground(value) {
            this.isCancel = false;
            this.background = value;
            this.backgroundTimer && clearTimeout(this.backgroundTimer);
            if (this.isArtQrCode) {
                this.backgroundTimer = setTimeout(() => {
                    this.createBorder(this.artQrCodeOptions);
                }, 20);
            } else {
                this.backgroundTimer = setTimeout(this.createQrCode, 20);
            }
        },
        // 生成二维码（虚拟dom来生成）
        createQrCodeFn() {
            this.$nextTick(() => {
                this.createQrCodeImg();
            });
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

        createQrCodeImg() {
            this.isArtQrCode = false;
            this.selectedStyleIdx = null;

            this.genQrCode();
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
        // 修改二维码
        modifyQrCode() {
            if (this.selectedData && this.selectedData.type === 'qr-code') {
                this.selectedData.modifyQrCode();
                Ktu.log('qr-code', 'changeMsg');
            }
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
            };
        },
    },
});
