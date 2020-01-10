class Cimage extends OriginImage {
    constructor(data) {
        super(data);
        this.image = typeof data.image == 'string' ? JSON.parse(data.image) : data.image;
        this.cropScaleX = data.cropScaleX || 1;
        this.cropScaleY = data.cropScaleY || 1;
        this.hasLoaded = false;
        this.canCollect = true;
        this.isClipMode = false;
        this.hoverTip = '双击换图';
        // this.hasAlphaCorner = /\.gif/.test(this.image.src) ? true : data.hasAlphaCorner;
        this.hasAlphaCorner = /\.gif/.test(this.image.src);
        this.radius = data.radius || {
            size: 0,
            rt: true,
            rb: true,
            lb: true,
            lt: true,
        };
        this.isSupportRadius = !this.hasAlphaCorner;
        this.clipId = Ktu.element.clipId;

        this.imageType = this.image.src.includes('base64') ? 'base64' : this.image.src.replace(/.+\./, '').toLowerCase();

        this.setImageSource(this.image.src);
        // this.loadedPromise = this.loadSmallImg();
        this.fill = data.fill || '';
        this.shapeWidth = this.shapeWidth === undefined ? Math.max(1, this.width * Math.abs(this.cropScaleX)) : this.shapeWidth;
        this.shapeHeight = this.shapeHeight === undefined ? Math.max(1, this.height * Math.abs(this.cropScaleY)) : this.shapeHeight;
        const filters = typeof data.filters === 'string' ? JSON.parse(data.filters) : data.filters;
        this.filters = new Filters(!data.filters ? {} : filters);
        this.clipshapeInfo = typeof data.clipshapeInfo === 'string' ? JSON.parse(data.clipshapeInfo) : data.clipshapeInfo;
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

    loadSmallImg() {
        return new Promise((resolve, reject) => {
            if (!this.image.smallSrc) {
                resolve();
                return;
            }

            const img = new Image();

            this.image.base64 = null;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                this.base64 = canvas.toDataURL();
                resolve();
            };

            if (this.image.src.indexOf('data') !== 0) {
                img.crossOrigin = 'anonymous';
            }

            img.src = this.image.smallSrc;
        });
    }

    getBase64() {
        return new Promise((resolve, reject) => {
            if (/\.svg/.test(this.image.src)) {
                axios.get(this.image.originalSrc).then(result => {
                    const base64 = `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(result.data)))}`;
                    resolve(base64);
                })
                    .catch(() => {
                        reject();
                    });
            } else {
                if (!this.image.smallSrc) {
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
                    // this.base64 = canvas.toDataURL();
                    resolve(canvas.toDataURL());
                };

                img.onerror = reject;

                if (this.image.src.indexOf('data') !== 0) {
                    img.crossOrigin = 'anonymous';
                }

                img.src = this.image.originalSrc;
            }
        });
    }

    loadOriginImg() {
        if (!this.image.src2000) return;
        const img = new Image();
        img.onload = () => {
            this.image.src = this.image.src2000;
            this.dirty = true;
            if (this.group || this.isInContainer) {
                const parent = this.group || this.container;
                parent.dirty = true;
            }

            this.hasLoaded = true;
        };
        if (this.image.src.indexOf('data') !== 0) {
            img.crossOrigin = 'anonymous';
        }

        img.src = this.image.src2000;
    }

    // 这个方法只有在图片容器中使用，普通图片换图的方式是删了旧元素添加新的，无需更换src
    setImageSource(src, onlySetData) {
        if (src.indexOf('base64') === -1) {
            src = src.replace('!160x160', '').replace('!2000x2000', '');
            this.image.originalSrc = src;
            let srcSplit = src.split('/');
            if (!this.image.smallSrc || !this.image.smallSrc.includes('!')) {
                if (src.indexOf('!160x160.') === -1) {
                    const idPath = `${srcSplit[srcSplit.length - 1].split('.')[0]}!160x160.${srcSplit[srcSplit.length - 1].split('.')[1]}`;
                    srcSplit[srcSplit.length - 1] = idPath;
                }
                this.image.smallSrc = srcSplit.join('/');
                srcSplit = src.split('/');
            }
            if (src.indexOf('!2000x2000.') === -1) {
                const idPath = `${srcSplit[srcSplit.length - 1].split('.')[0]}!2000x2000.${srcSplit[srcSplit.length - 1].split('.')[1]}`;
                srcSplit[srcSplit.length - 1] = idPath;
            }
            this.image.src2000 = srcSplit.join('/');
        }

        this.image.src = this.image.smallSrc;
        // 抠图的只需要替换数据，不需要加载图片。
        if (Ktu.vm && Ktu.vm.hasLoaded && !onlySetData) {
            this.loadOriginImg();
        }

        // 执行多这个函数式因为，图片路径更改后，需要需要重新生成base64 lyq
        this.loadedPromise = this.loadSmallImg();
    }

    setImageCenter() {
        const s = Math.max(this.shapeWidth / this.image.width, this.shapeHeight / this.image.height);
        this.image.scaleX = s;
        this.image.scaleY = s;
        this.image.left = -(this.image.width * this.image.scaleY - this.shapeWidth) / 2;
        this.image.top = -(this.image.height * this.image.scaleY - this.shapeHeight) / 2;
    }
    /* 不强制选中自己 在addmoule中会设置2次，导致有问题，不会进入裁切，选中自己
       是因为图片容器，在没有选中任何东西的时候，直接拖拽图片更换 */
    autoCrop(noForceSelectThis) {
        // 更换图片判断是否自动进入裁切状态
        const viewPortP = (this.width * this.scaleX) / (this.height * this.scaleY);
        const picP = (this.image.width * this.image.scaleX) / (this.image.height * this.image.scaleY);
        if (picP >= 1.5 * viewPortP || picP <= 0.67 * viewPortP) {
            !noForceSelectThis && (Ktu.selectedData = this.container);
            this.noResizeViewport = true;
            this.enterClipMode();
        }
    }
    getFill() {
        const fillStr = '';
        if (this.fill && this.fill !== 'transparent') {
            const fillId = `fill_${this.objectId}`;
            const rgba = Ktu.Color.sourceFromRgb(Ktu.color.hexToRgb(this.fill));
            return `
            <defs>
                <filter id="${fillId}">
                    <feColorMatrix type="matrix" values="0 0 0 0 ${(rgba[0] / 255) ** 2} 0 0 0 0 ${(rgba[1] / 255) ** 2} 0 0 0 0 ${(rgba[2] / 255) ** 2} 0 0 0 ${rgba[3]} 0"></feColorMatrix>
                </filter>
            </defs>`;
            /* return `
               <filter id="${fillId}">
               <feComponentTransfer>
               <feFuncR type="linear" slope="0" intercept="${Math.pow(rgba[0]/255, 2)}"></feFuncR>
               <feFuncG type="linear" slope="0" intercept="${Math.pow(rgba[1]/255, 2)}"></feFuncG>
               <feFuncB type="linear" slope="0" intercept="${Math.pow(rgba[2]/255, 2)}"></feFuncB>
               <feFuncA type="linear" slope="${rgba[3]}" intercept="0"></feFuncA>
               </feComponentTransfer>
               </filter>`; */
        }
        return fillStr;
    }
    getClipPath(clip) {
        let clipPath = '';
        if (!this.clipShape) {
            const x = 0;
            const y = 0;
            const width = this.shapeWidth;
            const height = this.shapeHeight;
            let path;
            if (this.radius && this.radius.size) {
                let r = this.radius.size;
                r = Math.min(r, Math.floor(Math.min(this.width * this.scaleX, this.height * this.scaleY) / 2 + 1));
                /* const rx = r / this.scaleX * (this.shapeWidth / (this.image.width * this.image.scaleX));
                   const ry = r / this.scaleY * (this.shapeHeight / (this.image.height * this.image.scaleY)); */
                const rx = r / this.scaleX * this.cropScaleX;
                const ry = r / this.scaleY * this.cropScaleY;
                const {
                    lt,
                    rt,
                    rb,
                    lb,
                } = this.radius;
                // 左上   右上    右下    左下
                path = `M${x} ${y + (lt ? ry : 0)}${lt ? `a${rx} ${ry} 0 0 1 ${rx} ${-ry}` : ''}h${width - (lt ? rx : 0) - (rt ? rx : 0)}${rt ? `a${rx} ${ry} 0 0 1 ${rx} ${ry}` : ''}v${height - (rt ? ry : 0) - (rb ? ry : 0)}${rb ? `a${rx} ${ry} 0 0 1 ${-rx} ${ry}` : ''}h${(rb ? rx : 0) + (lb ? rx : 0) - width}${lb ? `a${rx} ${ry} 0 0 1 ${-rx} ${-ry}` : ''}z`;
            } else {
                path = `M${x} ${y}h${width}v${height}h${-width}z`;
            }
            clipPath = `
                <defs>
                    <clipPath id="clipPath_${this.clipId}">
                        <path d="${path}"></path>
                    </clipPath>
                </defs>`;
        } else {
            let clipId = `clipPath_${this.clipId}`;
            let transform = '';
            if (!!clip) {
                let scaleX = 1;
                let scaleY = 1;
                if (this.isInContainer) {
                    const {
                        container,
                    } = this;
                    scaleX = container.width / container.viewBoxWidth;
                    scaleY = container.height / container.viewBoxHeight;
                }
                clipId = `${clipId}_clip`;
                const clipShapeInfo = this.clipshapeInfo;
                scaleX *= this.width * this.scaleX * Ktu.edit.scale / clipShapeInfo.w;
                scaleY *= this.height * this.scaleY * Ktu.edit.scale / clipShapeInfo.h;
                /* 调整  裁切的时候没法用viewPort来缩放，图片不能强制拉伸，这里需要做调整
                   var imagescaleX = Ktu.imageClip.scaleX,
                   imagescaleY = Ktu.imageClip.scaleY,
                   userScale = 1,
                   isScaleX = false,
                   isScaleY = false;
                   if (imagescaleX > imagescaleY) {
                   userScale = imagescaleX;
                   isScaleY = true;
                   } else {
                   userScale = imagescaleY;
                   isScaleX = true;
                   }
                   if ((0.995 <= imagescaleX / imagescaleY && imagescaleX / imagescaleY <= 1.005)) {
                   isScaleX = false;
                   isScaleY = false;
                   } */

                /* var _scaleX = isScaleX?(imagescaleX/imagescaleY):1;
                   var _scaleY = isScaleY?(imagescaleY/imagescaleX):1;
                   scaleX = scaleX/_scaleX;
                   scaleY = scaleY/_scaleY; */
                transform = `translate(${-clipShapeInfo.left * scaleX}px,${-clipShapeInfo.top * scaleY}px) scale(${scaleX},${scaleY})`;
            }
            clipPath = `
                <defs>
                    <clipPath id="${clipId}" style="transform:${transform}">
                        ${this.clipShape}
                    </clipPath>
                </defs>
                `;
        }
        return clipPath;
    }
    getBorderPath() {
        let scaleX = 1;
        let scaleY = 1;
        let transform = '';
        const {
            container,
        } = this;
        if (!container) {
            return '';
        }
        scaleX = container.width / container.viewBoxWidth;
        scaleY = container.height / container.viewBoxHeight;
        const clipShapeInfo = this.clipshapeInfo;
        scaleX *= this.width * this.scaleX * container.scaleX * Ktu.edit.scale / clipShapeInfo.w;
        scaleY *= this.height * this.scaleY * container.scaleY * Ktu.edit.scale / clipShapeInfo.h;
        transform = `scale(${scaleX},${scaleY})`;
        const strokeWidth = 1 / Math.max(scaleX, scaleY);
        const strokeDasharray = 4 / Math.max(scaleX, scaleY);
        return `
                <g  style="transform:${transform};stroke-width:${strokeWidth};stroke-dasharray:${strokeDasharray} ${strokeDasharray}">
                        ${this.clipShape}
                </g>
        `;
    }
    getStrokePath() {
        let strokePath = '';
        if (this.strokeWidth) {
            // strokePath = `M0 0 h ${this.width * this.scaleX} v ${this.height * this.scaleY} h -${this.width * this.scaleX} z`;
            const w = this.width * this.scaleX;
            const h = this.height * this.scaleY;
            const maxR = Math.floor(Math.min(w, h) / 2 + 1);
            const radius = this.radius ? this.radius : {};
            const {
                lt,
                rt,
                rb,
                lb,
            } = radius;
            let r = radius.size ? radius.size : 0;
            r = r > maxR ? maxR : r;
            strokePath = `
                M0 ${lt ? r : 0}
                ${lt ? `a${r} ${r} 0 0 1 ${r} ${-r}` : ''}
                h${w - (lt ? r : 0) - (rt ? r : 0)}
                ${rt ? `a${r} ${r} 0 0 1 ${r} ${r}` : ''}
                v${h - (rt ? r : 0) - (rb ? r : 0)}
                ${rb ? `a${r} ${r} 0 0 1 ${-r} ${r}` : ''}
                h${(rb ? r : 0) + (lb ? r : 0) - w}
                ${lb ? `a${r} ${r} 0 0 1 ${-r} ${-r}` : ''}
                z`;
        }
        return strokePath;
    }
    getJpgStrokeStr(isAllInfo) {
        if (!this.image.src.includes('.jpg') || !this.strokeWidth) {
            return '';
        }
        const strokePath = this.getStrokePath();
        let strokeStr = '';
        if (isAllInfo) {
            strokeStr = `
            <g transform="translate(${this.left} ${this.top}) rotate(${this.angle})">
                <path transform="translate(${this.strokeWidth / 2} ${this.strokeWidth / 2})" d="${strokePath}" style="${this.getSvgStrokeStyle()};fill: none;"></path>
            </g>`;
        } else {
            strokeStr = `
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" xml:space="preserve" width="100%" height="100%" style="position: absolute;left: 0;top: 0;">
                    <path transform="translate(${this.strokeWidth / 2} ${this.strokeWidth / 2})" d="${strokePath}" style="${this.getSvgStrokeStyle()};fill: none;"></path>
                </svg>`;
        }
        return strokeStr;
    }
    getFiltersDefs() {
        if (this.filters) {
            if (!(this.filters instanceof Filters)) {
                this.filters = new Filters(this.filters);
            }
            return this.filters.getDefs({
                filterId: this.objectId,
                left: -this.image.left,
                top: -this.image.top,
                width: this.shapeWidth,
                height: this.shapeHeight,
            });
        }
        return '';
    }
    getFlip() {
        const {
            image,
        } = this;
        let flipStr = '';
        if (this.flipX) {
            flipStr += `matrix(-1,0,0,1,${image.width * image.scaleX},0)`;
        }
        if (this.flipY) {
            flipStr += `matrix(1,0,0,-1,0,${image.height * image.scaleY})`;
        }
        return flipStr;
    }
    strokeContour(ctx, points) {
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i][0], points[i][1]);
        }
        ctx.lineTo(points[0][0], points[0][1]);
        ctx.closePath();
    }
    getContour(imageData, width, start) {
        const defineNonTransparent = (x, y) => (imageData[(y * width + x) * 4 + 3] > 0);
        const getContourStart = () => {
            let x = 0;
            let y = 0;
            /* search for a starting point; begin at origin
               and proceed along outward-expanding diagonals */
            while (true) {
                if (defineNonTransparent(x, y)) {
                    return [x, y];
                }
                if (x === 0) {
                    x = y + 1;
                    y = 0;
                } else {
                    x = x - 1;
                    y = y + 1;
                }
            }
        };
        // starting point
        const s = start || getContourStart();
        // contour polygon
        const c = [];
        // current x position
        let x = s[0];
        // current y position
        let y = s[1];
        // next x direction
        let dx = 0;
        // next y direction
        let dy = 0;
        // previous x direction
        let pdx = undefined;
        // previous y direction
        let pdy = undefined;
        let i = 0;

        // lookup tables for marching directions
        const contourDx = [1, 0, 1, 1, -1, 0, -1, 1, 0, 0, 0, 0, -1, 0, -1, undefined];
        const contourDy = [0, -1, 0, 0, 0, -1, 0, 0, 1, -1, 1, 1, 0, -1, 0, undefined];

        do {
            // determine marching squares index
            i = 0;
            if (defineNonTransparent(x - 1, y - 1)) i += 1;
            if (defineNonTransparent(x, y - 1)) i += 2;
            if (defineNonTransparent(x - 1, y)) i += 4;
            if (defineNonTransparent(x, y)) i += 8;

            // determine next direction
            if (i === 6) {
                dx = pdy === -1 ? -1 : 1;
                dy = 0;
            } else if (i === 9) {
                dx = 0;
                dy = pdx === 1 ? -1 : 1;
            } else {
                dx = contourDx[i];
                dy = contourDy[i];
            }

            // update contour polygon
            if (dx !== pdx && dy !== pdy) {
                c.push([x, y]);
                pdx = dx;
                pdy = dy;
            }

            x += dx;
            y += dy;
        } while (s[0] != x || s[1] != y);
        return c;
    }
    getAllContours() {
        const canvas = document.createElement('canvas');
        const {
            strokeWidth,
            img,
        } = this;
        const width = img.width + strokeWidth;
        const height = img.height + strokeWidth;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, strokeWidth / 2, strokeWidth / 2);
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const contours = [];
        const checkContour = () => {
            imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

            let canStop = false;

            for (let i = 0; i < imageData.length; i += 4) {
                if (imageData[i + 3] > 0) {
                    canStop = true;
                    break;
                }
            }
            if (!canStop) {
                return false;
            }
            const points = this.getContour(imageData, width);
            contours.push(points);

            this.strokeContour(ctx, points);
            ctx.save();
            ctx.clip();
            // ctx.globalCompositeOperation = "destination-out";
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.restore();

            return true;
        };

        while (checkContour()) { }
        return contours;
    }
    setPngBase64AfterStroke() {
        return new Promise((resolve, reject) => {
            if (!this.image.src.includes('.png')) {
                resolve();
            }
            const drawStroke = () => {
                const {
                    width,
                    height,
                } = this.img;
                const {
                    strokeWidth,
                } = this;
                const canvas = document.createElement('canvas');
                canvas.width = width + strokeWidth;
                canvas.height = height + strokeWidth;
                const ctx = canvas.getContext('2d');
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                ctx.save();
                ctx.strokeStyle = this.stroke;
                ctx.lineWidth = strokeWidth;
                const contours = this.getAllContours();
                contours.forEach(points => {
                    this.strokeContour(ctx, points);
                    ctx.stroke();
                });
                ctx.restore();
                ctx.save();
                contours.forEach(points => {
                    this.strokeContour(ctx, points);
                });
                ctx.clip();
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.restore();
                ctx.drawImage(this.img, strokeWidth / 2, strokeWidth / 2);
                this.base64AfterStroke = canvas.toDataURL();
                resolve();
            };
            if (!this.img) {
                const image = new Image();
                image.onload = () => {
                    this.img = image;
                    drawStroke();
                };
                image.crossOrigin = 'anonymous';
                image.src = this.image.src2000;
            } else {
                drawStroke();
            }
        });
    }
    getSrc(useBase64) {
        if (useBase64) {
            return this.base64;
        }
        return this.base64AfterStroke ? this.base64AfterStroke : this.image.src;
    }
    toSvg(isAllInfo, useBase64) {
        if (!this.visible && !this.isClipMode) {
            return '';
        }
        let svgHtml = '';
        const {
            image,
        } = this;
        const imageWidth = image.width * image.scaleX;
        const imageHeight = image.height * image.scaleY;
        const src = this.getSrc(useBase64);
        const clipPath = this.getClipPath();
        const clipId = `clipPath_${this.clipId}`;
        const shaodwStr = this.getShadow();
        const _shadowId = `shadow_${this.objectId}`;
        const fillStr = this.getFill();
        const fillId = `fill_${this.objectId}`;
        const strokeStr = this.getJpgStrokeStr(isAllInfo);
        const flipStr = this.getFlip();
        const filterStr = this.getFiltersDefs();
        const filterId = `filter_${this.objectId}`;
        const imageLeft = this.flipX ? this.shapeWidth - image.left - image.width * image.scaleX : image.left;
        const imageTop = this.flipY ? this.shapeHeight - image.top - image.height * image.scaleY : image.top;
        if (isAllInfo) {
            // 整体缩放值
            const scaleX = this.width * this.scaleX / this.shapeWidth;
            const scaleY = this.height * this.scaleY / this.shapeHeight;
            svgHtml = `
            ${shaodwStr}
            ${fillStr}
            ${filterStr}
			${clipPath}
            <g style="opacity:${this.opacity}">
    			<g  transform="translate(${this.left} ${this.top}) rotate(${this.angle}) translate(${this.strokeWidth / 2} ${this.strokeWidth / 2}) scale(${scaleX} ${scaleY})">
                    ${this.isOpenShadow ? `<g style="filter:url(#${_shadowId})">` : ''}
                    <g clip-path="url(#${clipId})" ${filterStr ? `filter="url(#${filterId})"` : ''}>
                        <image imageid="${image.fileId}" crossOrigin="anonymous"  xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="${src}" width="${imageWidth}" height="${imageHeight}" transform="translate(${imageLeft} ${imageTop})  ${flipStr}" ${fillStr ? `filter="url(#${fillId})"` : ''}></image>
                    </g>
                    ${this.isOpenShadow ? '</g>' : ''}
    			</g>
    			${strokeStr}
            </g>`;
        } else {
            svgHtml = `
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="${this.width * this.scaleX}" height="${this.height * this.scaleY}" viewBox="0 0 ${this.shapeWidth} ${this.shapeHeight}" xml:space="preserve" preserveAspectRatio="none" overflow="visible">
                    <g transform="translate(${this.strokeWidth / 2 / this.scaleX} ${this.strokeWidth / 2 / this.scaleY})">
                    ${shaodwStr}
                    ${fillStr}
                    ${filterStr}
                    ${clipPath}
                    ${this.isOpenShadow ? `<g style="filter:url(#${_shadowId})">` : ''}
                        <g  clip-path="url(#${clipId})" ${filterStr ? `filter="url(#${filterId})"` : ''}>
                            <image imageid="${image.fileId}" crossOrigin="anonymous" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="${src}" width="${imageWidth}" height="${imageHeight}" transform ="translate(${imageLeft} ${imageTop})  ${flipStr}" ${fillStr ? `filter="url(#${fillId})"` : ''}></image>
                        </g>
                        ${this.isOpenShadow ? '</g>' : ''}
                    </g>
				</svg>
				${strokeStr}`;
        }
        this.noShadowSvg = svgHtml.replace(shaodwStr, '');
        return svgHtml;
    }
    // 图片容器用
    toPath(useBasePath) {
        const clipPath = this.getClipPath();
        const clipId = `clipPath_${this.clipId}`;
        const {
            image,
        } = this;
        const imageWidth = image.width * image.scaleX;
        const imageHeight = image.height * image.scaleY;
        const imageSrc = !!image.src2000 ? image.src2000 : image.src;
        const src = useBasePath ? this.base64 : imageSrc;
        const scaleX = this.width * this.scaleX / this.shapeWidth;
        const scaleY = this.height * this.scaleY / this.shapeHeight;
        let imagescaleX = 1;
        let imagescaleY = 1;
        let userScale = 1;
        let isScaleX = false;
        let isScaleY = false;
        if (this.isInContainer) {
            const {
                container,
            } = this;
            // image中的是实际值，需要乘比例才是svg中的值
            imagescaleX = container.width / container.viewBoxWidth;
            imagescaleY = container.height / container.viewBoxHeight;
            if (imagescaleX > imagescaleY) {
                userScale = imagescaleY;
                isScaleX = true;
            } else {
                userScale = imagescaleX;
                isScaleY = true;
            }
            if ((0.995 <= imagescaleX / imagescaleY && imagescaleX / imagescaleY <= 1.005)) {
                isScaleX = false;
                isScaleY = false;
            }
        }
        const filterStr = this.getFiltersDefs();
        const filterId = `filter_${this.objectId}`;
        return `
                ${clipPath}
                ${filterStr}
                <g clip-path="url(#${clipId})" ${filterStr ? `filter="url(#${filterId})"` : ''}>
                    <g transform="translate(${this.left} ${this.top}) scale(${scaleX * (isScaleX ? userScale : 1)} ${scaleY * (isScaleY ? userScale : 1)})">
                    <image  imageid="${image.fileId}"  xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="${src}" width="${imageWidth / userScale}" height="${imageHeight / userScale}" transform="translate(${image.left / userScale} ${image.top / userScale})"></image>
                    </g>
                </g>
                `;
    }
    toObject() {
        const elementObj = TheElement.toObject(this);

        const image = _.cloneDeep(this.image);
        image.src = image.originalSrc || image.src;
        return _.assignIn(elementObj, {
            image,
            cropScaleX: this.cropScaleX,
            cropScaleY: this.cropScaleY,
            shapeWidth: this.shapeWidth,
            shapeHeight: this.shapeHeight,
            clipshapeInfo: this.clipshapeInfo,
            radius: _.cloneDeep(this.radius),
            hasAlphaCorner: this.hasAlphaCorner,
            fill: this.fill,
            filters: this.filters.toObject(),
            msg: JSON.stringify(this.msg),
        });
    }
    containergetPositionToEditor() {
        /* const hypotenuse = Math.sqrt(Math.pow(object.left, 2) + Math.pow(object.top, 2));
           const totalRadian = Math.atan(object.top / object.left);
           const radian = totalRadian - this.angle * Math.PI / 180;
           return {
           left: this.left + Math.abs(hypotenuse * Math.cos(radian)),
           top: this.top + Math.abs(hypotenuse * Math.sin(radian))
           } */
        const {
            container,
        } = this;
        const {
            center,
        } = container.coords;
        const radian = container.angle * Math.PI / 180;
        // 组合相对于中心点
        const toCenter = {
            x: container.left - center.x,
            y: container.top - center.y,
        };
        /* 计算组合未旋转前的位置
           const originTop = toCenter.y * Math.cos(radian) - toCenter.x * Math.sin(radian);
           const originLeft = (toCenter.x + originTop * Math.sin(radian)) / Math.cos(radian); */
        const originLeft = toCenter.x * Math.cos(-radian) - toCenter.y * Math.sin(-radian);
        const originTop = toCenter.x * Math.sin(-radian) + toCenter.y * Math.cos(-radian);
        // 元素在组合未旋转前的位置
        const objectToCenter = {
            x: originLeft + this.left * (container.scaleX * container.width / container.viewBoxWidth),
            y: originTop + this.top * (container.scaleY * container.height / container.viewBoxHeight),
        };
        return {
            // 元素在组合旋转后的位置，注意是相对中心点的，需要加上中心点位置
            left: objectToCenter.x * Math.cos(radian) - objectToCenter.y * Math.sin(radian) + center.x,
            top: objectToCenter.x * Math.sin(radian) + objectToCenter.y * Math.cos(radian) + center.y,
        };
    }
    enterClipMode() {
        this.saveState();
        if (this.isInContainer) {
            const position = this.containergetPositionToEditor();
            const toContainer = {};
            const {
                container,
            } = this;
            toContainer.left = this.left;
            toContainer.top = this.top;
            toContainer.angle = 0;
            toContainer.scaleX = this.scaleX;
            toContainer.scaleY = this.scaleY;
            this.left = position.left;
            this.top = position.top;
            this.angle = container.angle;
            this.scaleX = this.scaleX * container.scaleX;
            this.scaleY = this.scaleY * container.scaleY;
            this.toContainer = toContainer;
        }
        Ktu.imageClip.setClipObj(this);
    }
    exitClipMode(isSave) {
        Ktu.imageClip.exitClip(isSave);
        if (this.isInContainer) {
            this.left = this.toContainer.left;
            this.top = this.toContainer.top;
            this.angle = this.toContainer.angle;
            this.scaleX = this.toContainer.scaleX;
            this.scaleY = this.toContainer.scaleY;
            this.container.dirty = true;
        }
        if (!!isSave) {
            this.hasCrop = true;
            this.modifiedState();
        }
    }
    getDimensions() {
        return {
            w: this.width + this.strokeWidth / this.scaleX,
            h: this.height + this.strokeWidth / this.scaleY,
        };
    }
    onDoubleClick() {
        // if (!!this.group) {
        //     return;
        // }
        if (!this.isClipping) {
            // this.enterClipMode();
            if (this.imageType != 'gif') {
                // 判断是否有记录
                if (!Ktu.store.state.data.historicalRecord.some((item, index) => {
                    const recordId = item.imageData.i || item.imageData.resourceId;
                    if (recordId === this.image.fileId) {
                        Ktu.store.state.data.historicalRecord[index].record = true;
                        Ktu.store.state.data.historicalRecordIndex = index;
                        return true;
                    }
                })) {
                    Ktu.store.state.data.historicalRecordIndex = null;
                }
                /* if (Ktu.store.state.data.historicalRecord.imageData) {
                    const recordId = Ktu.store.state.data.historicalRecord.imageData.i || Ktu.store.state.data.historicalRecord.imageData.resourceId;
                    if (recordId === this.image.fileId) {
                        Ktu.store.state.data.historicalRecord.record = true;
                    }
                } */
                Ktu.vm.$store.commit('modal/imageSourceModalState', {
                    isOpen: true,
                });
                Ktu.log('materialModal', 'doubleClick');
            }
        }
    }
};
