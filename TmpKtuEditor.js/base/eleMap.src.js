class EleMap extends Cimage {
    constructor(obj) {
        super(obj);
        this.image = obj.image;
        this.src = obj.src;
        this.base64 = obj.src;
        // this.fileId = obj.image.fileId || '';
        this.msg = typeof obj.msg == 'string' ? JSON.parse(obj.msg) : obj.msg;
        this.canCollect = false;
        this.controls = {
            tl: true,
            tr: true,
            br: true,
            bl: true,
            mt: true,
            mr: true,
            mb: true,
            ml: true,
            rotate: true,
        };
        this.radius = obj.radius;
        this.loadedPromise = this.loadImg();
        this.hoverTip = '双击更改地图信息';
        // this.banFlip = true;
    }
    setImageSource() {

    }
    loadImg() {
        if (!this.image.src) return;
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.hasLoaded = true;
                img.onload = null;

                this.getBase64(img);

                this.setCoords();
                resolve();
            };
            if (this.image.src.indexOf('data') !== 0) {
                img.crossOrigin = Ktu.isSafari() ? null : 'anonymous';
            }
            img.src = this.image.src;
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

    toObject() {
        const image = _.cloneDeep(this.image);
        const elementObj = TheElement.toObject(this);
        return _.assignIn(elementObj, {
            image,
            radius: this.radius,
            src: this.src,
            msg: JSON.stringify(this.msg),
            cropScaleX: this.cropScaleX,
            cropScaleY: this.cropScaleY,
        });
    }

    toSvg(isAllInfo, useBase64) {
        if (!this.visible && !this.isClipMode) {
            return '';
        }
        let svgHtml = '';
        const { image } = this;
        const imageWidth = image.width * image.scaleX;
        const imageHeight = image.height * image.scaleY;
        const src = useBase64 ? this.base64 : image.src;
        const clipPath = this.getClipPath();
        const clipId = `clipPath_${this.clipId}`;
        const shaodwStr = this.getShadow();
        const _shadowId = `shadow_${this.objectId}`;
        const fillStr = this.getFill();
        const fillId = `fill_${this.objectId}`;
        const strokePath = this.getStrokePath();
        let strokeStr = '';
        const flipStr = this.getFlip();
        const filterStr = this.getFiltersDefs();
        const filterId = `filter_${this.objectId}`;
        const imageLeft = this.flipX ? this.shapeWidth - image.left - image.width * image.scaleX : image.left;
        const imageTop = this.flipY ? this.shapeHeight - image.top - image.height * image.scaleY : image.top;
        /* 暂时Png图去掉滤镜
           if (image.src.indexOf(".png") > 0) {
           filterStr = "";
           filterId = "";
           } */
        if (isAllInfo) {
            // 整体缩放值
            const scaleX = this.width * this.scaleX / this.shapeWidth;
            const scaleY = this.height * this.scaleY / this.shapeHeight;
            if (this.strokeWidth) {
                strokeStr = `
                <g transform="translate(${this.left} ${this.top}) rotate(${this.angle})">
                    <path transform="translate(${this.strokeWidth / 2} ${this.strokeWidth / 2})" d="${strokePath}" style="${this.getSvgStrokeStyle()};fill: none;"></path>
                </g>`;
            }
            svgHtml = `
            ${shaodwStr}
            ${fillStr}
            ${filterStr}
			${clipPath}
            <g style="opacity:${this.opacity}">
    			<g  transform="translate(${this.left} ${this.top}) rotate(${this.angle}) translate(${this.strokeWidth / 2} ${this.strokeWidth / 2}) scale(${scaleX} ${scaleY})">
                    ${this.isOpenShadow ? `<g style="filter:url(#${_shadowId})">` : ''}
                    <g clip-path="url(#${clipId})" ${filterStr ? `filter="url(#${filterId})"` : ''}>
                        <image imageid="${this.image.fileId || ''}" type="map" crossOrigin="anonymous"  xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="${src}" width="${imageWidth}" height="${imageHeight}" transform="translate(${imageLeft} ${imageTop})  ${flipStr}" ${fillStr ? `filter="url(#${fillId})"` : ''}></image>
                    </g>
                    ${this.isOpenShadow ? '</g>' : ''}
    			</g>
    			${strokeStr}
            </g>`;
        } else {
            if (this.strokeWidth) {
                strokeStr = `
				<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" xml:space="preserve" width="100%" height="100%" style="position: absolute;left: 0;top: 0;">
					<path transform="translate(${this.strokeWidth / 2} ${this.strokeWidth / 2})" d="${strokePath}" style="${this.getSvgStrokeStyle()};fill: none;"></path>
				</svg>`;
            }
            svgHtml = `
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="${this.width * this.scaleX}" height="${this.height * this.scaleY}" viewBox="0 0 ${this.shapeWidth} ${this.shapeHeight}" xml:space="preserve" preserveAspectRatio="none" transform="translate(${this.strokeWidth / 2} ${this.strokeWidth / 2})" overflow="visible">
                    ${shaodwStr}
                    ${fillStr}
                    ${filterStr}
                    ${clipPath}
                    ${this.isOpenShadow ? `<g style="filter:url(#${_shadowId})">` : ''}
                    <g clip-path="url(#${clipId})" ${filterStr ? `filter="url(#${filterId})"` : ''}>
                        <image imageid="${this.image.fileId || ''}" type="map" crossOrigin="anonymous" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="${src}" width="${imageWidth}" height="${imageHeight}" transform ="translate(${imageLeft} ${imageTop})  ${flipStr}" ${fillStr ? `filter="url(#${fillId})"` : ''}></image>
                    </g>
                    ${this.isOpenShadow ? '</g>' : ''}
				</svg>
                ${strokeStr}
            `;
        }
        this.noShadowSvg = svgHtml.replace(shaodwStr, '');
        return svgHtml;
    }

    // 更改二维码的时候使其编辑器显示
    modifyMap() {
        Ktu.store.state.base.mapEditor = {
            show: true,
            type: 'update',
        };
    }

    // 双击进入二维码编辑
    onDoubleClick() {
        this.modifyMap();
    }
};
