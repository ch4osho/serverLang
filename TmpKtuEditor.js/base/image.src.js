class OriginImage extends TheElement {
    constructor(data) {
        super(data);
        this.src = data.src;
    }

    loadImage() {
        if (!this.src) return;

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.width = this.width === undefined ? img.width : this.width;
                this.height = this.height === undefined ? img.height : this.height;
                const size = this.getSize();
                this.scaleX = this.scaleX === undefined ? size.scaleX : this.scaleX;
                this.scaleY = this.scaleY === undefined ? size.scaleY : this.scaleY;
                this.left = this.left === undefined ? size.left : this.left;
                this.top = this.top === undefined ? size.top : this.top;

                this.dirty = true;
                this.hasLoaded = true;
                img.onload = null;
                resolve();
            };
            if (this.src.indexOf('data') !== 0) {
                img.crossOrigin = Ktu.isSafari() ? null : 'anonymous';
            }

            img.src = this.src;
        });
    }
    toSvg() {
        if (!this.visible) {
            return '';
        }
        const tmpSvg = [];
        // svg 头部 宽高，viewBox
        tmpSvg.push(Ktu.element.SVGHEAD);
        tmpSvg.push(`width="${this.width * this.scaleX}" height="${this.height * this.scaleY}"`);
        tmpSvg.push(`viewBox="0 0 ${this.width * this.scaleX} ${this.height * this.scaleY}"`);
        tmpSvg.push(Ktu.element.SVGHEADTAIL);

        // svg 内容

        tmpSvg.push(`<image imageid="${this.fileId || 'tmp'}" `);
        tmpSvg.push(`xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href=" ${this.src}"`);
        tmpSvg.push(`width=" ${this.width * this.scaleX}" height=" ${this.height * this.scaleY}"></image>`);

        // svg尾部
        tmpSvg.push(Ktu.element.SVGFOOTER);
        return tmpSvg.join('');
    }
    toObject() {
        const elementObj = TheElement.toObject(this);
        return _.assignIn(elementObj, {
            src: this.src,
        });
    }
};
