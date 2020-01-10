class QrCode extends OriginImage {
    constructor(obj) {
        super(obj);
        this.src = obj.src;
        this.msg = typeof obj.msg == 'string' ? JSON.parse(obj.msg) : obj.msg;
        this.fileId = obj.fileId || '';
        this.controls = {
            tl: true,
            tr: true,
            br: true,
            bl: true,
            mt: false,
            mr: false,
            mb: false,
            ml: false,
            rotate: true,
        };
        this.base64 = '';
        this.loadedPromise = this.loadImg();
        this.hoverTip = '双击更改二维码信息';
        // this.banFlip = true;
    }

    loadImg() {
        if (!this.src) return;
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.hasLoaded = true;
                img.onload = null;

                this.getBase64(img);

                this.setCoords();
                resolve();
            };
            if (this.src.indexOf('data') !== 0) {
                img.crossOrigin = Ktu.isSafari() ? null : 'anonymous';
            }
            img.src = this.src;
        });
    }

    initCanvas() {
        return new Promise(resolve => {
            if (this.base64) {
                this.drawCanvas().then(() => {
                    resolve(this);
                });
            } else {
                this.loadedPromise.then(() => {
                    this.drawCanvas().then(() => {
                        resolve(this);
                    });
                });
            }
        });
    }

    getBase64(img) {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        this.base64 = canvas.toDataURL();
    }

    toSvg(isAllInfo, useBase64) {
        if (!this.visible) {
            return '';
        }
        const src = useBase64 ? this.base64 : this.src;
        const shaodwStr = this.getShadow();
        const _shadowId = `shadow_${this.objectId}`;
        const flipStr = this.getFlip();
        const gStyle = isAllInfo ? `transform="translate(${this.left} ${this.top}) rotate(${this.angle}) scale(${this.scaleX} ${this.scaleY}) ${flipStr}" opacity="${this.opacity} ${flipStr}"` : `transform="${flipStr}"`;
        const g = `${shaodwStr}
                <g  ${gStyle}>
                	<g ${this.isOpenShadow ? `style="filter:url(#${_shadowId})"` : ''}>
                        <image imageid="${this.fileId || ''}" type="qr-code" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="${src}" width="${this.width}" height="${this.height}"></image>"
                    </g>
                </g>`;
        let svgHtml = '';
        if (!isAllInfo) {
            const dimensions = this.getDimensions();
            svgHtml = `
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                    version="1.1" width="${dimensions.w * this.scaleX}" height="${dimensions.h * this.scaleY}"
                    viewBox="0 0 ${dimensions.w} ${dimensions.h}" xml:space="preserve" style="overflow: visible;">
                    ${g}
                </svg>
            `;
        } else {
            svgHtml = g;
        }
        return svgHtml;
    }

    toObject() {
        const elementObj = TheElement.toObject(this);
        return _.assignIn(elementObj, {
            fileId: this.fileId,
            src: this.src,
            msg: JSON.stringify(this.msg),
            base64: this.base64,
        });
    }

    // 更改二维码的时候使其编辑器显示
    modifyQrCode() {
        Ktu.store.state.base.qrCodeEditor = {
            show: true,
            type: 'update',
        };
    }

    // 双击进入二维码编辑
    onDoubleClick() {
        this.modifyQrCode();
    }
};
