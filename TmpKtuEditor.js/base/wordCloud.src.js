class WordCloud extends TheElement {
    constructor(data) {
        super(data);
        this.type = 'wordCloud';
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
        this.msg = typeof data.msg == 'string' ? JSON.parse(data.msg) : data.msg;
        this.loadedPromise = this.loadSvg();
        this.fontFamilyParam = {};
        this.fontBase64Param = {};
        this.fontIdParam = {};
    }
    loadSmallImg() {
        if (!this.msg.bgSrc) return;
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                img.onload = null;

                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                this.bgBase64 = canvas.toDataURL();
                resolve();
            };
            if (this.msg.bgSrc.indexOf('data') !== 0) {
                img.crossOrigin = 'anonymous';
            }
            const srcSplit = this.msg.bgSrc.split('/');
            if (this.msg.bgSrc.indexOf('!160x160.') === -1) {
                const idPath = `${srcSplit[srcSplit.length - 1].split('.')[0]}!160x160.${srcSplit[srcSplit.length - 1].split('.')[1]}`;
                srcSplit[srcSplit.length - 1] = idPath;
            }
            img.src = srcSplit.join('/');
        });
    }

    initCanvas() {
        return new Promise(resolve => {
            if (this.bgBase64) {
                this.drawCanvas().then(() => {
                    resolve(this);
                });
            } else {
                this.loadSvg().then(() => {
                    this.loadSmallImg().then(() => {
                        this.drawCanvas().then(() => {
                            resolve(this);
                        });
                    });
                });
            }
        });
    }

    getBase64() {
        return new Promise((resolve, reject) => {
            if (!this.msg.bgSrc) {
                resolve();
                return;
            }

            const img = new Image();

            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                // this.bgBase64 = canvas.toDataURL();
                resolve(canvas.toDataURL());
            };

            if (this.msg.bgSrc.indexOf('data') !== 0) {
                img.crossOrigin = 'anonymous';
            }

            img.src = this.msg.bgSrc;
        });
    }
    loadSvg() {
        return new Promise((resolve, reject) => {
            axios.get(this.msg.svgSrc).then(res => {
                const {
                    tableData,
                } = this.msg;
                const promiseList = [];
                if (!!tableData) {
                    tableData.forEach((e, i) => {
                        promiseList.push(new Promise((resolve, reject) => {
                            const fontFamily = `ktu_Font_ID_${e.fontId}_ROW_${i}_RAN_${parseInt(new Date().getTime(), 10)}`;
                            const fontFace = new FontFace(fontFamily, `url(${e.fontPath})`);
                            this.fontIdParam[e.fontFileId] = e.fontId;
                            fontFace.load().then(loadedFace => {
                                document.fonts.add(loadedFace);
                                this.fontFamilyParam[e.fontFileId] = fontFamily;
                                resolve();
                            });
                            axios.get(e.fontPath, {
                                responseType: 'arraybuffer',
                            }).then(response => {
                                this.fontBase64Param[e.fontFileId] = this.transformArrayBufferToBase64(response.data);
                            });
                        }));
                    });
                }
                Promise.all(promiseList).then(() => {
                    const doc = new DOMParser().parseFromString(res.data, 'image/svg+xml');
                    const _svg = doc.getElementsByTagName('svg')[0];

                    const reAllowedSVGTagNames = /^(path|circle|polygon|polyline|ellipse|rect|line|image|text)$/i;
                    const reNotAllowedAncestors = /^(?:pattern|defs|symbol|metadata|clipPath|mask)$/i;
                    const svgNodes = _svg.querySelectorAll(':not(svg)');
                    // 获取显示效果渐变

                    // 获取显示的节点
                    const hasAncestorWithNodeName = function (element, nodeName) {
                        while (element && (element = element.parentNode)) {
                            if (element.nodeName && nodeName.test(element.nodeName.replace('svg:', '')) && !element.getAttribute('instantiated_by_use')) {
                                return true;
                            }
                        }
                        return false;
                    };
                    this.paths = [].filter.call(svgNodes, e => reAllowedSVGTagNames.test(e.nodeName.replace('svg:', '')) && !hasAncestorWithNodeName(e, reNotAllowedAncestors));
                    this.hasLoaded = true;
                    this.dirty = true;
                    this.setCoords();
                    resolve();
                });
            });
        });
    }
    transformArrayBufferToBase64(buffer) {
        if (!buffer) {
            return;
        }
        const bytes = new Uint8Array(buffer);
        const binary = bytes.reduce((currentStr, byte) => `${currentStr}${String.fromCharCode(byte)}`, '');

        return `data:;base64,${window.btoa(binary)}`;
    }
    getFontName(fontId) {
        const font = Ktu.initialData.flyerFontList.find(font => font.id === fontId);
        return font ? font.nodeName : 'Source Han Sans CN Regular';
    }
    getFontStyle() {
        const {
            tableData,
        } = this.msg;
        const result = [];
        if (!!tableData) {
            tableData.forEach((e, i) => {
                const fontFamily = this.fontFamilyParam[e.fontFileId];
                const fontBase64 = this.fontBase64Param[e.fontFileId];
                const oneFont = fontBase64 ? `
                <style type="text/css">
                    @font-face {
                        font-family: ${fontFamily};
                        src: url(${fontBase64});
                    }
                </style>
                ` : '';
                result.push(oneFont);
            });
        }
        return result.join('');
    }
    toSvg(isAllInfo, useBase64) {
        if (!this.visible) {
            return '';
        }
        const contentHtml = [];
        this.paths.forEach((e, i) => {
            const fontFamily = this.fontFamilyParam[e.getAttribute('fontfileid')];
            let fontId = this.fontIdParam[e.getAttribute('fontfileid')];
            if (fontId == -10) {
                fontId = this.msg.importFontId;
            }
            const style = e.getAttribute('style');
            if (!!style) {
                const styleList = style.split(';');
                const styleObj = {};
                styleList.forEach(s => {
                    const kv = s.split(':');
                    styleObj[kv[0]] = kv[1];
                });
                if (!!styleObj.fill) {
                    const fillColor = Ktu.element.getRgb('fill', styleObj.fill).rgb;
                    const { opacity } = Ktu.element.getRgb('fill', styleObj.fill);
                    styleObj.fill = fillColor;
                    if (parseFloat(opacity) < parseFloat(styleObj.opacity)) {
                        styleObj.opacity = opacity;
                    }
                    styleObj['fill-rule'] = 'nonzero';
                    e.setAttribute('style', [...Object.entries(styleObj).map(e => e.join(':'))].join(';'));
                }
            }

            let family = isAllInfo && !useBase64 ? this.getFontName(fontId) : fontFamily;
            // 处理汉字无法使用英文字体的时候使用
            family += ', Source Han Sans CN Regular, Symbola';
            e.setAttribute('font-family', family);
            contentHtml.push(e.outerHTML);
        });
        const {
            msg,
        } = this;
        const bgSrc = useBase64 ? this.bgBase64 : this.msg.bgSrc;
        const flipStr = this.getFlip();
        const gStyle = isAllInfo ? `transform="translate(${this.left} ${this.top}) rotate(${this.angle}) scale(${this.scaleX} ${this.scaleY}) ${flipStr}" opacity="${this.opacity} ${flipStr}"` : `transform="${flipStr}"`;
        const g = `
                ${useBase64 ? this.getFontStyle() : ''}
                <g  ${gStyle}>
                        <image crossOrigin="anonymous" imageid="${msg.bgfileId || ''}"  xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="${bgSrc}" width="${this.width}" height="${this.height}"></image>
                        ${contentHtml.join('')}
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
        const msg = JSON.stringify(this.msg);
        return _.assignIn(elementObj, {
            fileId: this.fileId,
            src: this.src,
            msg,
        });
    }
    // 更改二维码的时候使其编辑器显示
    modifyWordCloud() {
        Ktu.store.state.base.wordArtEditor = {
            show: true,
            type: 'update',
        };
    }

    // 双击进入二维码编辑
    onDoubleClick() {
        this.modifyWordCloud();
    }
};
