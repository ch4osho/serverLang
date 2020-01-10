Ktu.element = {};
Ktu.element.SVGHEAD = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" xml:space="preserve"';
Ktu.element.SVGHEADTAIL = '>';
Ktu.element.SVGFOOTER = '</svg >';
Ktu.element._fontSizeMult = 1.13;
Ktu.element._fontSizeFraction = 0.25;
Ktu.element.imgCanvas = {};
Ktu.element.groupStateObject = null;
(() => {
    Object.defineProperty(Ktu.element, 'newObjectId', {
        get: function get() {
            return `${new Date().getTime()}-${Math.ceil(Math.random() * 1000000)}`;
        },
    });
    Object.defineProperty(Ktu.element, 'maxKey', {
        get: function get() {
            return Ktu.selectedTemplateData.objects ? Ktu.selectedTemplateData.objects.length : Ktu.templateData[0].objects.length;
        },
    });
    let clipId = 1;
    Object.defineProperty(Ktu.element, 'clipId', {
        get() {
            return clipId++;
        },
    });
})();
class TheElement {
    constructor(data) {
        this.angle = data.angle || 0;
        // this.depth = data.key || Ktu.element.maxKey;
        this.flipX = data.flipX !== undefined ? data.flipX : false;
        this.flipY = data.flipY !== undefined ? data.flipY : false;
        this.width = data.width;
        this.height = data.height;
        this.isOpenShadow = data.isOpenShadow !== undefined ? data.isOpenShadow : false;
        this.shadow = data.shadow || JSON.parse(JSON.stringify(Ktu.config.tool.default.shadow));
        this.scaleX = data.scaleX === undefined ? 1 : data.scaleX;
        this.scaleY = data.scaleY === undefined ? 1 : data.scaleY;
        this.skewX = data.skewX || 0;
        this.skewY = data.skewY || 0;
        this.objectId = data.objectId || Ktu.element.newObjectId;
        // this.groupId = data.groupId || undefined;
        this.group = data.group || null;
        this.isLocked = data.isLocked || false;
        this.isCollect = data.isCollect || false;
        this.canCollect = data.canCollect || false;
        this.category = data.category;
        this.resourceId = data.resourceId;
        this.left = data.left;
        this.top = data.top;
        this.visible = data.visible !== undefined ? data.visible : true;
        this.type = data.type;
        this.opacity = data.opacity === undefined ? 1 : data.opacity;
        this.key = typeof (data.depth) === 'number' ? data.depth : Ktu.element.maxKey;
        this.depth = this.key;
        // 描边
        this.stroke = data.stroke || null;
        this.strokeWidth = data.strokeWidth || 0;
        this.strokeDashArray = data.strokeDashArray || [0, 0];
        this.strokeLineCap = data.strokeLineCap || 'butt';
        this.strokeLineJoin = data.strokeLineJoin || 'miter';
        this.strokeMiterLimit = data.strokeMiterLimit || 10;
        this.dirty = true;
        this.isSelected = false;
        this.canvas = null;
        this.isHover = false;
        this.isTranslating = false;
        this.hasChosen = false;
        this.elementName = this.getElementName(data.elementName);
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
        this.isSizeLock = true;
        !this.loadedPromise && this.setCoords();
    }
    static toObject(data) {
        return {
            angle: data.angle,
            depth: data.depth,
            elementName: data.elementName,
            flipX: data.flipX,
            flipY: data.flipY,
            width: data.width,
            height: data.height,
            isOpenShadow: data.isOpenShadow,
            shadow: _.cloneDeep(data.shadow),
            scaleX: data.scaleX,
            scaleY: data.scaleY,
            skewX: data.skewX,
            skewY: data.skewY,
            stroke: data.stroke,
            strokeWidth: data.strokeWidth,
            strokeDashArray: data.strokeDashArray,
            strokeLineCap: data.strokeLineCap,
            strokeLineJoin: data.strokeLineJoin,
            strokeMiterLimit: data.strokeMiterLimit,
            left: data.left,
            top: data.top,
            visible: data.visible,
            type: data.type,
            opacity: data.opacity,
            objectId: data.objectId,
            isLocked: data.isLocked,
            canCollect: data.canCollect,
            category: data.category,
            resourceId: data.resourceId,
            isSizeLock: data.isSizeLock,
            isCollect: data.isCollect,
            src: data.src,
            layerInfo: data.getBoundingRect(),
        };
    }
    /**
     * 元素的toSvg中定义的svg节点转换为canvas
     * 用于生成页面缩略图
     * 元素的canvas在元素发生变化时才重画，没有变化的元素在生成图片时直接获取canvas中内容来渲染
     */
    getElementName(name) {
        if (name) return name;
        let tmpName = '';
        switch (this.type) {
            case 'textbox':
                tmpName = '';
                break;
            case 'cimage':
                tmpName = '图片';
                break;
            case 'path-group':
                tmpName = '图形';
                break;
            case 'qrcode':
                tmpName = '二维码';
                break;
            case 'ellipse':
                tmpName = '圆形';
                break;
            case 'background':
                tmpName = '背景';
                break;
            case 'rect':
                tmpName = '矩形';
                break;
        }
        return tmpName;
    }
    getShadow() {
        // 未开启阴影
        if (!this.isOpenShadow) {
            return '';
        }
        let offsetX = this.shadow.offsetX / this.scaleX;
        let offsetY = this.shadow.offsetY / this.scaleY;
        if (this.type == 'path-group') {
            offsetX *= this.viewBoxWidth / this.width;
            offsetY *= this.viewBoxHeight / this.height;
        }
        let fBoxX = 40;
        let fBoxY = 40;
        const offset = new Vector(offsetX, offsetY);
        const BLUR_BOX = 20;

        if (this.width && this.height) {
            /* http://www.w3.org/TR/SVG/filters.html#FilterEffectsRegion
               we add some extra space to filter box to contain the blur ( 20 ) */
            fBoxX = (Math.abs(offset.x) + this.shadow.blur) / this.width * 100 + BLUR_BOX;
            fBoxY = (Math.abs(offset.y) + this.shadow.blur) / this.height * 100 + BLUR_BOX;
        }
        if (this.flipX) {
            offset.x *= -1;
        }
        if (this.flipY) {
            offset.y *= -1;
        }
        let showAlpha = null;
        let floodAlpha = '';
        let floodColor = '';
        if (this.shadow.color) {
            // 阴影颜色值：rgba(0,0,0,0.5)
            if (this.shadow.color.indexOf('rgba') != -1)
            // 若有透明度，
            {
                let tempData = this.shadow.color.slice(5, this.shadow.color.length - 1);
                tempData = tempData.split(',');
                showAlpha = tempData[tempData.length - 1];
                floodAlpha = `flood-opacity="${showAlpha}"`;
                //
                tempData.splice(tempData.length - 1, 1);
                floodColor = `rgb(${tempData.join()})`;
            } else if (this.shadow.color == 'transparent') {
                floodAlpha = 'flood-opacity="0"';
                floodColor = '#fff';
            } else {
                floodAlpha = '';
                floodColor = this.shadow.color;
            }
            // console.log("阴影颜色值：" + floodColor + " <<>> 阴影透明度:"+showAlpha);
        }
        return (`<filter id="shadow_${this.objectId}" y="-${fBoxY}%" height="${100 + 2 * fBoxY}%" x="-${fBoxX}%" width="${100 + 2 * fBoxX}%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="${this.shadow.blur ? this.shadow.blur / 2 / (this.scaleX + this.scaleY) : 0}"></feGaussianBlur>
                    <feOffset dx="${offset.x}" dy="${offset.y}" result="oBlur" ></feOffset>
                    <feFlood flood-color="${floodColor}" ${floodAlpha}/>
                        <feComposite in2="oBlur" operator="in" />
                        <feMerge>
                            <feMergeNode></feMergeNode>
                            <feMergeNode in="SourceGraphic"></feMergeNode>
                        </feMerge>
                </filter>`);
    }
    initCanvas() {
        return this.drawCanvas();
    }
    drawCanvas() {
        this.canvas = document.createElement('canvas');
        const {
            canvas,
        } = this;
        const context = canvas.getContext('2d');
        const w = Ktu.ktuData.other.width;
        const h = Ktu.ktuData.other.height;

        const width = Ktu.edit.getTmpImageSize().w;
        const height = Ktu.edit.getTmpImageSize().h;
        const g = this.toSvg(true, true);
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"
                        width="${width}" height="${height}"
                        viewBox="0 0 ${w} ${h}" xml:space="preserve" preserveAspectRatio="none">
                        ${g}
                    </svg>`;
        const DOMURL = window.URL || window.webkitURL || window;
        const svgBlob = new Blob([svg], {
            type: 'image/svg+xml',
        });
        /* $('body').append(`<div class="f_DNSTraffic" style="position:absolute;top:0;left:0;z-index:99;transform: scale(0.5) translate(-50%, -50%);">${svg}</div>`);
           let base64 = 'data:image/svg+xml;charset=utf-8,' + svg; */
        const base64 = DOMURL.createObjectURL(svgBlob);

        const img = new Image();
        img.setAttribute('crossOrigin', 'Anonymous');
        img.src = base64;
        return new Promise((resolve, reject) => {
            img.onload = info => {
                canvas.width = width;
                canvas.height = height;
                context.clearRect(0, 0, width, height);
                context.drawImage(img, 0, 0, width, height);
                resolve(this);
            };

            img.onerror = info => {
                resolve(this);
            };
        });
    }

    // 生成base64
    toDataURL(allInfo = true) {
        const bounding = this.getBoundingRect();
        const width = Math.floor(bounding.width);
        const height = Math.floor(bounding.height);
        const canvas = document.createElement('canvas');
        [canvas.width, canvas.height] = [width, height];
        const image = new Image();

        return new Promise((resolve, reject) => {
            // 对各种类型进行验证：
            const {
                type,
            } = this;
            const promiseList = [];
            if (type == 'group') {
                this.objects.forEach(item => {
                    // 图片类型和含有图片的高级容器做特殊处理
                    getPromiseList(promiseList, item);
                });
            } else {
                getPromiseList(promiseList, this);
            }

            Promise.all(promiseList).then(base64List => {
                // 需要使用原图base64生成图片再替换为就模糊图base64
                let count = 0;
                if (type == 'group') {
                    this.objects.forEach(item => {
                        // 图片类型和含有图片的高级容器做特殊处理
                        addSmallBase64(base64List, item);
                    });
                } else {
                    addSmallBase64(base64List, this);
                }

                //  异步队列执行完替换base64
                function addSmallBase64(base64List, object) {
                    // 图片类型和含有图片的高级容器做特殊处理
                    if (object.type === 'cimage' && object.getBase64) {
                        object.smallBase64 = object.base64;
                        object.base64 = base64List[count];
                        count++;
                    } else if (object.type === 'imageContainer') {
                        object.objects.forEach(prop => {
                            if (prop.type == 'cimage' && prop.getBase64) {
                                prop.smallBase64 = prop.base64;
                                prop.base64 = base64List[count];
                                count++;
                            }
                        });
                    } else if (object.type === 'wordCloud' && object.getBase64) {
                        object.smallBase64 = object.bgBase64;
                        object.bgBase64 = base64List[count];
                        count++;
                    }
                }

                image.onload = async () => {
                    const ctx = canvas.getContext('2d');
                    ctx.translate(this.left - bounding.left, this.top - bounding.top);
                    ctx.rotate(this.angle * Math.PI / 180);
                    const dimensions = this.getDimensions();
                    // 转到中心skew
                    ctx.translate(dimensions.w / 2, dimensions.h / 2);
                    ctx.transform(1, Math.tan(this.skewY * Math.PI / 180), Math.tan(this.skewX * Math.PI / 180), 1, 0, 0);
                    ctx.translate(-dimensions.w / 2, -dimensions.h / 2);
                    // ctx.transform(1, 0, 0, 1, 0, 0);
                    ctx.globalAlpha = this.opacity;
                    ctx.drawImage(image, 0, 0);
                    const src = canvas.toDataURL();
                    if (!allInfo) {
                        /* 需要对素材进行空白位置的裁剪
                           document.body.append(canvas); */
                        const imgData = ctx.getImageData(0, 0, width, height).data;
                        const {
                            top,
                            bottom,
                            left,
                            right,
                        } = Ktu.element.removeBlank(imgData, width, height);

                        const img = new Image();
                        img.onload = () => {
                            document.body.appendChild(img);
                            canvas.width = right - left;
                            canvas.height = bottom - top;
                            ctx.drawImage(img, -left, -top);
                            canvas.toBlob(blob => {
                                resolve(blob);
                            }, 'image/png');
                        };
                        img.src = src;
                    } else {
                        /* canvas.toBlob(function (blob) {
                           resolve(blob)
                           }, "image/png"); */
                        resolve(canvas.toDataURL());
                    }
                };

                image.onerror = e => {
                    reject();
                };

                /* let svg = new Blob([this.toSvg(false, true)], { type: "image/svg+xml;charset=utf-8" });
                   let base64 = URL.createObjectURL(svg);
                   image.src = base64; */

                /* let svg = this.toSvg(false, true);
                   /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/g
                   svg = svg.replace(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/g, (a) => {
                   return Ktu.color.hexToRgb(a);
                   })
                   image.src = 'data:image/svg+xml;charset=utf-8,' + svg; */
                // 图片描边独立一个svg，需要加一个外层svg包裹
                const svg = this.type === 'cimage' && this.strokeWidth ? `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">${this.toSvg(false, true)}</svg>` : this.toSvg(false, true);
                image.src = `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svg)))}`;

                // 处理smallBase64和base64
                if (type == 'group') {
                    this.objects.forEach(item => {
                        deleteSmallBase64(item);
                    });
                } else {
                    deleteSmallBase64(this);
                }
            });

            // 添加异步队列（处理成异步数组）
            function getPromiseList(promiseList, object) {
                // 图片类型和含有图片的高级容器做特殊处理
                if (object.type === 'cimage' && object.getBase64) {
                    promiseList.push(object.getBase64());
                } else if (object.type === 'imageContainer') {
                    object.objects.forEach(prop => {
                        if (prop.type == 'cimage' && prop.getBase64) {
                            promiseList.push(prop.getBase64());
                        }
                    });
                } else if (object.type === 'wordCloud' && object.getBase64) {
                    promiseList.push(object.getBase64());
                } else if (object.type === 'threeText' && object.getBase64) {
                    promiseList.push(object.getBase64());
                }
            }

            //  生成完png后删除smallBase64
            function deleteSmallBase64(object) {
                // 图片类型和含有图片的高级容器做特殊处理
                if (object.type === 'cimage' && object.getBase64) {
                    object.base64 = object.smallBase64;
                    delete object.smallBase64;
                } else if (object.type === 'imageContainer') {
                    object.objects.forEach(prop => {
                        if (prop.type == 'cimage' && prop.getBase64) {
                            prop.base64 = prop.smallBase64;
                            delete prop.smallBase64;
                        }
                    });
                } else if (object.type === 'wordCloud' && object.getBase64) {
                    object.bgBase64 = object.smallBase64;
                    delete object.smallBase64;
                }
            }
        });
    }
    setCoords() {
        this.coords = this.calculateCoords();
    }
    calculateCoords() {
        const dimensions = this.getDimensions();
        const width = dimensions.w * this.scaleX;
        const height = dimensions.h * this.scaleY;
        const radian = this.angle * Math.PI / 180;
        const tl = {
            x: this.left,
            y: this.top,
        };
        const tr = {
            x: tl.x + width * Math.cos(radian),
            y: tl.y + width * Math.sin(radian),
        };
        const br = {
            x: tr.x - height * Math.sin(radian),
            y: tr.y + height * Math.cos(radian),
        };
        const bl = {
            x: tl.x - height * Math.sin(radian),
            y: tl.y + height * Math.cos(radian),
        };
        const mt = {
            x: (tl.x + tr.x) / 2,
            y: (tl.y + tr.y) / 2,
        };
        const mr = {
            x: (tr.x + br.x) / 2,
            y: (tr.y + br.y) / 2,
        };
        const mb = {
            x: (bl.x + br.x) / 2,
            y: (bl.y + br.y) / 2,
        };
        const ml = {
            x: (tl.x + bl.x) / 2,
            y: (tl.y + bl.y) / 2,
        };
        const center = {
            x: (tl.x + br.x) / 2,
            y: (tl.y + br.y) / 2,
        };
        const angleCos = Math.cos(-radian);
        const angleSin = Math.sin(-radian);
        // 得到相对于元素中心点的坐标
        const toCenter = {
            x: this.left - center.x,
            y: this.top - center.y,
        };
        /* 矩阵转换，由点向量乘以旋转代表的矩阵后解方程得出公式。 */
        const originLeft = center.x + toCenter.x * angleCos - toCenter.y * angleSin;
        const originTop = center.y + toCenter.x * angleSin + toCenter.y * angleCos;
        const originTopLeft = {
            y: originTop,
            x: originLeft,
        };
        return {
            tl,
            tr,
            br,
            bl,
            mt,
            mr,
            mb,
            ml,
            center,
            originTopLeft,
        };
    }
    getBoundingRect() {
        const coords = this.calculateCoords();
        // const keys = Object.keys(coords);
        const keys = ['tl', 'tr', 'bl', 'br'];
        const arrX = [];
        const arrY = [];
        keys.forEach(k => {
            arrX.push(coords[k].x);
            arrY.push(coords[k].y);
        });
        const minX = Math.min.call(null, ...arrX);
        const maxX = Math.max.call(null, ...arrX);
        const minY = Math.min.call(null, ...arrY);
        const maxY = Math.max.call(null, ...arrY);
        return {
            left: minX,
            top: minY,
            width: maxX - minX,
            height: maxY - minY,
            right: maxX,
            bottom: maxY,
        };
    }
    getOriginTopLeft(type, grouped) {
        const dimensions = this.getDimensions();
        const radian = Math.PI * this.angle / 180;
        const angle = Math.atan(dimensions.w * this.scaleX / (dimensions.h * this.scaleY));
        // 求边长
        const hypotenuse = Math.sqrt((dimensions.w * this.scaleX) ** 2 + (dimensions.h * this.scaleY) ** 2);
        /* 得到相对于元素中心点的坐标
           const toCenter = {
           x: -hypotenuse / 2 * Math.sin(angle - radian),
           y: -hypotenuse / 2 * Math.cos(angle - radian)
           };
           矩阵转换，由点向量乘以旋转代表的矩阵后解方程得出公式。 */
        const originLeft = this.coords.center.x - hypotenuse / 2 * Math.sin(angle - radian);
        const originTop = this.coords.center.y - hypotenuse / 2 * Math.cos(angle - radian);
        this.top = originTop;
        this.left = originLeft;
        if (grouped) {
            // 如果是组内的元素，则left,top都减去所在组元素的left，top值
            switch (type) {
                case 'left':
                    this.left = this.left - (this.group ? this.group.left : 0);
                    break;
                case 'right':
                    this.left = this.left - (this.group ? this.group.left : 0);
                    break;
                case 'top':
                    this.top = this.top - (this.group ? this.group.top : 0);
                    break;
                case 'bottom':
                    this.top = this.top - (this.group ? this.group.top : 0);
                    break;
                case 'center':
                    this.left = this.left - (this.group ? this.group.left : 0);
                    this.top = this.top - (this.group ? this.group.top : 0);
                    break;
                case 'topBottomCenter':
                    this.top = this.top - (this.group ? this.group.top : 0);
                    break;
                case 'leftRightCenter':
                    this.left = this.left - (this.group ? this.group.left : 0);
                    break;
            }
            // 重新调整组的大小和位置
            this.group.updateSizePosition();
        }
    }
    getSize() {
        const [originalWidth, originalHeight] = [Ktu.ktuData.other.width, Ktu.ktuData.other.height];
        let [newWidth, newHeight] = [this.width, this.height];
        // 获取元素的偏移量
        const pasteOffset = Math.max(10, originalWidth / 30, originalHeight / 30);
        const size = {};
        Ktu.increasePosition = true;
        Ktu.recordAddNum = Ktu.recordAddNum < 10 ? Ktu.recordAddNum : 0;
        let scaleSize = 4;
        const background = Ktu.element.getBackgroundObj();
        if ((this.type === 'textbox' && this.from == 'textBox') || this.type === 'wordart' || this.type === 'threeText') {
            size.scaleX = originalWidth / 720 * this.scaleX;
            size.scaleY = size.scaleX;
            newWidth = this.width * size.scaleX;
            // 文本在实例化前没有高度，需要特殊处理
            newHeight = this.height * size.scaleY;
            /* 计算添加相同图片错位偏移量
               textBox没有id值,通过scale值判断 */
            if (Ktu.lastAddImgScale === this.scaleX) {
                Ktu.recordAddNum += 1;
            } else {
                Ktu.recordAddNum = 0;
            }
            Ktu.lastAddImgScale = this.scaleX;
            if (this.left || this.top) {
                Ktu.lastAddImgScale = -1;
                Ktu.recordAddNum = 0;
            }

            // 获取中心点
            const center = Ktu.edit.getDocumentViewCenter(originalWidth, originalHeight, newWidth, newHeight);
            size.left = this.left === undefined ? center.x + pasteOffset * Ktu.recordAddNum : this.left - newWidth / 2;
            size.top = this.top === undefined ? center.y + pasteOffset * Ktu.recordAddNum : this.top - newHeight / 2;
        } else {
            let {
                fileId,
            } = this;
            if (this.type === 'path-group') { } else if (this.type == 'cimage') {
                fileId = this.image.fileId;
                if (this.uploadType == 'psdUpload' || this.category == undefined) {
                    if (originalWidth < this.width || originalHeight < this.height) {
                        const [documentRatio, objectRatio] = [originalWidth / originalHeight, this.width / this.height];
                        if (documentRatio <= objectRatio) {
                            // [size.width, size.height] = [documentWidth, documentWidth / width * height];
                            [newWidth, newHeight] = [originalWidth, originalWidth / this.width * this.height];
                        } else {
                            [newWidth, newHeight] = [originalHeight / this.height * this.width, originalHeight];
                        }
                    }
                    if (this.type === 'path-group') {
                        if (!Ktu.isUIManage) {
                            if (this.width > this.height) {
                                if (this.width < 300) {
                                    newHeight = 300 / this.width * this.height;
                                    newWidth = 300;
                                    Ktu.increasePosition = false;
                                }
                            } else {
                                if (this.height < 300) {
                                    newWidth = 300 / this.height * this.width;
                                    newHeight = 300;
                                    Ktu.increasePosition = false;
                                }
                            }
                        }
                    } else if (this.type == 'cimage') {
                        fileId = this.image.fileId;
                    }
                    [size.scaleX, size.scaleY] = [newWidth / this.width, newHeight / this.height];
                    if (Ktu.lastAddImgScale === fileId && Ktu.increasePosition) {
                        Ktu.recordAddNum += 1;
                    } else {
                        Ktu.recordAddNum = 0;
                    }
                    Ktu.lastAddImgScale = fileId;
                    if (this.left || this.top) {
                        Ktu.lastAddImgScale = -1;
                        Ktu.recordAddNum = 0;
                    }
                    size.left = this.left === undefined ? (originalWidth - newWidth) / 2 + pasteOffset * Ktu.recordAddNum : this.left - newWidth / 2;
                    size.top = this.top === undefined ? (originalHeight - newHeight) / 2 + pasteOffset * Ktu.recordAddNum : this.top - newHeight / 2;
                    return size;
                }
            }

            if (this.category === 0) {
                scaleSize = 3;
            } else if (this.category) {
                scaleSize = 4;
            } else {
                /* if (this.imageType != 'jpg') {
                    scaleSize = 6;
                } else {
                    scaleSize = 3;
                } */
            }

            if (['table', 'chart', 'qrCode', 'wordCloud', 'map'].indexOf(this.type) > -1) {
                if (originalWidth < this.width || originalHeight < this.height) {
                    const [documentRatio, objectRatio] = [originalWidth / originalHeight, this.width / this.height];
                    if (documentRatio <= objectRatio) {
                        // [size.width, size.height] = [documentWidth, documentWidth / width * height];
                        [newWidth, newHeight] = [originalWidth, originalWidth / this.width * this.height];
                    } else {
                        [newWidth, newHeight] = [originalHeight / this.height * this.width, originalHeight];
                    }
                }
                // let { fileId } = this;
                [size.scaleX, size.scaleY] = [newWidth / this.width, newHeight / this.height];
                if (Ktu.lastAddImgScale === fileId && Ktu.increasePosition) {
                    Ktu.recordAddNum += 1;
                } else {
                    Ktu.recordAddNum = 0;
                }
                Ktu.lastAddImgScale = fileId;
                if (this.left || this.top) {
                    Ktu.lastAddImgScale = -1;
                    Ktu.recordAddNum = 0;
                }
                size.left = this.left === undefined ? (originalWidth - newWidth) / 2 + pasteOffset * Ktu.recordAddNum : this.left - newWidth / 2;
                size.top = this.top === undefined ? (originalHeight - newHeight) / 2 + pasteOffset * Ktu.recordAddNum : this.top - newHeight / 2;
            } else {
                const center = {};

                // 比例
                const sizeCount = Ktu.edit.documentSize.width / Ktu.edit.documentSize.viewWidth;

                let rightBottomY;
                let rightBottomX;

                Ktu.recordAddNum = Ktu.recordAddNum || 0;
                /* rightBottomX,rightBottomY表示的是可操作区右下角的坐标
                添加物件时改变其宽高
                x,y表示中心坐标 */
                if (Ktu.edit.size.width - (Math.abs(Ktu.edit.documentPosition.left) + Ktu.edit.documentSize.viewWidth) >= 0) {
                    center.width = Ktu.edit.documentSize.viewWidth;
                    rightBottomX = Ktu.edit.documentSize.viewWidth;
                    center.x = rightBottomX / 2;
                    // center.height = Ktu.edit.documentSize.viewHeight;
                } else if (Ktu.edit.documentPosition.left > 0) {
                    center.width = Ktu.edit.size.width - Ktu.edit.documentPosition.left;
                    rightBottomX = Ktu.edit.size.width - Ktu.edit.documentPosition.left;
                    center.x = rightBottomX / 2;
                    // center.height = Ktu.edit.size.height - Ktu.edit.documentPosition.top - (Ktu.edit.documentPosition.viewTop - Ktu.edit.documentPosition.top);
                } else if (Ktu.edit.documentPosition.left < 0) {
                    if (Ktu.edit.size.width - Ktu.edit.documentPosition.left < Ktu.edit.documentSize.viewWidth) {
                        center.width = Ktu.edit.size.width;
                        rightBottomX = Ktu.edit.size.width - Ktu.edit.documentPosition.left;
                        center.x = (2 * rightBottomX - Ktu.edit.size.width) / 2;
                    } else {
                        center.width = Ktu.edit.documentSize.viewWidth + Ktu.edit.documentPosition.left;
                        rightBottomX = Ktu.edit.documentSize.viewWidth;
                        center.x = (Math.abs(Ktu.edit.documentPosition.left) + rightBottomX) / 2;
                    }
                }
                if (Ktu.edit.size.height - (Math.abs(Ktu.edit.documentPosition.top) + Ktu.edit.documentSize.viewHeight) >= 0) {
                    center.height = Ktu.edit.documentSize.viewHeight;
                    rightBottomY = Ktu.edit.documentSize.viewHeight;
                    center.y = rightBottomY / 2;
                } else if (Ktu.edit.documentPosition.top > 0) {
                    center.height = Ktu.edit.size.height - Ktu.edit.documentPosition.top;
                    rightBottomY = Ktu.edit.size.height - Ktu.edit.documentPosition.top;
                    center.y = rightBottomY / 2;
                    // center.height = Ktu.edit.size.height - Ktu.edit.documentPosition.top - (Ktu.edit.documentPosition.viewTop - Ktu.edit.documentPosition.top);
                } else if (Ktu.edit.documentPosition.top < 0) {
                    if (Ktu.edit.size.height - Ktu.edit.documentPosition.top < Ktu.edit.documentSize.viewHeight) {
                        center.height = Ktu.edit.size.height;
                        rightBottomY = Ktu.edit.size.height - Ktu.edit.documentPosition.top;
                        center.y = (2 * rightBottomY - Ktu.edit.size.height) / 2;
                    } else {
                        center.height = Ktu.edit.documentSize.viewHeight + Ktu.edit.documentPosition.top;
                        rightBottomY = Ktu.edit.documentSize.viewHeight;
                        center.y = (Math.abs(Ktu.edit.documentPosition.top) + rightBottomY) / 2;
                    }
                }

                // 计算新的宽高
                if (this.width / this.height >= 1 && background.width / background.height >= 1) {
                    newWidth = center.width / scaleSize;
                    newHeight = newWidth * (this.height / this.width);
                } else if (this.width / this.height <= 1 && background.width / background.height >= 1) {
                    newHeight = center.width / scaleSize;
                    newWidth = newHeight * (this.width / this.height);
                } else if (this.width / this.height <= 1 && background.width / background.height < 1) {
                    newWidth = center.width / scaleSize;
                    newHeight = newWidth * (this.height / this.width);
                } else if (this.width / this.height >= 1 && background.width / background.height < 1) {
                    newHeight = center.width / scaleSize;
                    newWidth = newHeight * (this.width / this.height);
                }

                if (this.type === 'rect' || this.type === 'ellipse') {
                    if (background.width / background.height >= 1) {
                        newWidth = center.width / scaleSize;
                        newHeight = newWidth;
                    } else {
                        newHeight = center.height / scaleSize;
                        newWidth = newHeight;
                    }
                }

                newWidth = newWidth * sizeCount > 1 ? newWidth * sizeCount : 1;
                newHeight = newHeight * sizeCount > 1 ? newHeight * sizeCount : 1;

                // 防止宽高没有时下列计算不能进行
                if (!this.width) {
                    this.width = newWidth;
                }

                if (!this.height) {
                    this.height = newHeight;
                }

                if (newWidth > originalWidth || newHeight > originalHeight) {
                    const [documentRatio, objectRatio] = [originalWidth / originalHeight, this.width / this.height];
                    if (documentRatio <= objectRatio) {
                        // [size.width, size.height] = [documentWidth, documentWidth / width * height];
                        [newWidth, newHeight] = [originalWidth, originalWidth / this.width * this.height];
                    } else {
                        [newWidth, newHeight] = [originalHeight / this.height * this.width, originalHeight];
                    }
                }

                [size.scaleX, size.scaleY] = [newWidth / this.width, newHeight / this.height];

                if (this.type === 'rect' || this.type === 'ellipse') {
                    size.width = Math.min(newWidth, newHeight);
                    size.height = size.width;
                    /* if (Ktu.lastAddImgScale === this.fileId && Ktu.increasePosition) {
                        Ktu.recordAddNum += 1;
                    } else {
                        Ktu.recordAddNum = 0;
                    }
                    Ktu.lastAddImgScale = this.fileId;
                    if (this.left || this.top) {
                        Ktu.lastAddImgScale = -1;
                        Ktu.recordAddNum = 0;
                    }
                    if (this.top && this.left) {
                        size.top = this.top - size.height / 2;
                        size.left = this.left - size.width / 2;
                    } else {
                        size.top = (center.x) * sizeCount - (newWidth / 2) + pasteOffset * Ktu.recordAddNum;
                        size.left = (center.y) * sizeCount - (newHeight / 2) + pasteOffset * Ktu.recordAddNum;
                    } */
                }

                // Ktu.lastAddImgScale = this.fileId;

                if (Ktu.lastAddImgScale === fileId && Ktu.increasePosition) {
                    Ktu.recordAddNum += 1;
                } else {
                    Ktu.recordAddNum = 0;
                }
                Ktu.lastAddImgScale = fileId;
                if (this.left || this.top) {
                    Ktu.lastAddImgScale = -1;
                    Ktu.recordAddNum = 0;
                }
                /* size.left = this.left === undefined ? (originalWidth - newWidth) / 2 + pasteOffset * Ktu.recordAddNum : this.left - newWidth / 2;
                size.top = this.top === undefined ? (originalHeight - newHeight) / 2 + pasteOffset * Ktu.recordAddNum : this.top - newHeight / 2;
                console.log(newWidth, newHeight); */
                // eslint-disable-next-line max-len
                size.left = this.left === undefined ? (center.x) * sizeCount - (newWidth / 2) + pasteOffset * Ktu.recordAddNum : this.left - newWidth / 2;
                // eslint-disable-next-line max-len
                size.top = this.top === undefined ? (center.y) * sizeCount - (newHeight / 2) + pasteOffset * Ktu.recordAddNum : this.top - newHeight / 2;
            }
            /* if (this.width / this.height >= 1 && background.width / background.height >= 1) {
                newWidth = background.width / 4;
                newHeight = newWidth * (this.height / this.width);
            } else if (this.width / this.height <= 1 && background.width / background.height >= 1) {
                newHeight = background.width / 4;
                newWidth = newHeight * (this.width / this.height);
            } else if (this.width / this.height <= 1 && background.width / background.height < 1) {
                newWidth = background.width / 4;
                newHeight = newWidth * (this.height / this.width);
            } else if (this.width / this.height >= 1 && background.width / background.height < 1) {
                newHeight = background.width / 4;
                newWidth = newHeight * (this.width / this.height);
            } */

            /* if (newWidth > originalWidth || newHeight > originalHeight) {
                let [documentRatio, objectRatio] = [originalWidth / originalHeight, this.width / this.height];
                if (documentRatio <= objectRatio) {
                    // [size.width, size.height] = [documentWidth, documentWidth / width * height];
                    [newWidth, newHeight] = [originalWidth, originalWidth / this.width * this.height];
                } else {
                    [newWidth, newHeight] = [originalHeight / this.height * this.width, originalHeight];
                }
            }

            [size.scaleX, size.scaleY] = [newWidth / this.width, newHeight / this.height]; */
        }
        return size;
    }
    smallMove(type) {
        if (this.isLocked) {
            return;
        }
        switch (type) {
            case 'left':
                this.left--;
                break;
            case 'up':
                this.top--;
                break;
            case 'right':
                this.left++;
                break;
            case 'down':
                this.top++;
        }
    }
    fastMove(type) {
        if (this.isLocked) {
            return;
        }
        switch (type) {
            case 'left':
                this.left -= 10;
                break;
            case 'up':
                this.top -= 10;
                break;
            case 'right':
                this.left += 10;
                break;
            case 'down':
                this.top += 10;
        }
    }
    lock() {
        if (!!this.group) {
            this.group.lock();
        } else {
            this.saveState();
            this.isLocked = !this.isLocked;
            this.modifiedState();
        }
    }
    collect(item) {
        const _this = item ? Ktu.selectedTemplateData.objects.find(object => object.objectId === item.objectId) : this;
        const url = _this.isCollect ? '../ajax/ktuCollectFodder_h.jsp?cmd=del' : '../ajax/ktuCollectFodder_h.jsp?cmd=add';
        axios.post(url, {
            category: !_this.category && _this.category != 0 ? 20 : _this.category,
            resourceId: _this.fileId || _this.image.fileId,
        }).then(res => {
            const info = res.data;
            if (info.success) {
                if (_this.isCollect) {
                    Ktu.log('collect', 'collection');
                } else {
                    Ktu.log('collect', 'disCollection');
                }
                // this.saveState();
                _this.isCollect = !_this.isCollect;
                // this.modifiedState();
                Ktu.templateData.forEach(({
                    objects,
                }) => {
                    objects.forEach(object => {
                        // eslint-disable-next-line no-nested-ternary
                        object.fileId ? (object.fileId === _this.fileId ? object.isCollect = _this.isCollect : '') : (object.image ? (object.image.fileId == _this.image.fileId ? object.isCollect = _this.isCollect : '') : '');
                    });
                });
                Ktu.store.state.data.shouldRefreshList.includes(_this.fileId || _this.image.fileId) ? '' : Ktu.store.state.data.shouldRefreshList.push(_this.fileId || _this.image.fileId);
                Ktu.store.state.data.shouldRefreshUploadList.includes(_this.fileId || _this.image.fileId) ? '' : Ktu.store.state.data.shouldRefreshUploadList.push(_this.fileId || _this.image.fileId);
            }
        })
            .catch(err => {
                console.log(err);
            })
            .finally(() => { });
    }
    setVisible() {
        this.saveState();
        this.visible = !this.visible;
        this.dirty = true;
        this.modifiedState();
    }
    setAngle(type) {
        const self = this;
        const rotate = {
            getAngle() {
                let angle = type === 'left' ? self.angle - 90 : self.angle + 90;
                angle > 360 && (angle -= 360);
                angle < -360 && (angle += 360);
                return angle;
            },
            setAngle: angle => {
                angle = angle === undefined ? rotate.getAngle() : angle;
                /* // 求边长
                   const hypotenuse = Math.sqrt((Math.pow(self.width * self.scaleX, 2) + Math.pow(self.height * self.scaleY, 2))) / 2;
                   // 得到相对于元素中心点的坐标
                   const radian = Math.PI * angle / 180;
                   let left = self.coords.center.x - hypotenuse * (Math.cos(radian) * (self.width * self.scaleX / hypotenuse / 2) - Math.sin(radian) * (self.height * self.scaleY / hypotenuse / 2));
                   let top = self.coords.center.y - hypotenuse * (Math.sin(radian) * (self.width * self.scaleX / hypotenuse / 2) + Math.cos(radian) * (self.height * self.scaleY / hypotenuse / 2));
                   self.left = left;
                   self.top = top;
                   self.angle = angle;
                   self.setCoords(); */
                const offsetAngle = angle - this.angle;
                const radian = Math.PI * offsetAngle / 180;
                const {
                    center,
                } = this.coords;
                const toOriginPoint = {
                    x: this.left - center.x,
                    y: this.top - center.y,
                };
                const end = {
                    x: Math.cos(radian) * toOriginPoint.x - Math.sin(radian) * toOriginPoint.y,
                    y: Math.sin(radian) * toOriginPoint.x + Math.cos(radian) * toOriginPoint.y,
                };
                this.angle = angle;
                this.left = end.x + center.x;
                this.top = end.y + center.y;
                this.setCoords();
            },
            setMatrix: () => {
                type === 'horizontal' ? self.flipX = !self.flipX : self.flipY = !self.flipY;
                if (this.type === 'group') {
                    const multi = new Multi(this.splitGroup());
                    const group = multi.toGroup();
                    this.left = group.left;
                    this.top = group.top;
                    this.flipX = group.flipX;
                    this.flipY = group.flipY;
                    this.scaleX = group.scaleX;
                    this.scaleY = group.scaleY;
                    this.angle = group.angle;
                    this.objects.forEach((object, index) => {
                        object.left = group.objects[index].left;
                        object.top = group.objects[index].top;
                        object.flipX = group.objects[index].flipX;
                        object.flipY = group.objects[index].flipY;
                        object.scaleX = group.objects[index].scaleX;
                        object.scaleY = group.objects[index].scaleY;
                        object.angle = group.objects[index].angle;
                    });
                    this.setCoords();
                }
                self.dirty = true;
            },
            left() {
                this.setAngle();
            },
            right() {
                this.setAngle();
            },
            horizontal() {
                this.setMatrix();
            },
            vertical() {
                this.setMatrix();
            },
        };
        typeof type !== 'number' && this.saveState();
        typeof type === 'number' ? rotate.setAngle(type) : rotate[type]();
        typeof type !== 'number' && this.modifiedState();
    }
    setPosition(type, grouped, customeCoords = null) {
        // 改变选择框的大小
        const objectBoundingRect = this.getBoundingRect(grouped);
        // 先定点，再改变centerX y的值来确定目标位置，再用getOriginTopLeft来转换位置
        switch (type) {
            case 'left':
                this.coords.center.x = objectBoundingRect.width / 2;
                break;
            case 'right':
                this.coords.center.x = (Ktu.edit.documentSize.width - objectBoundingRect.width / 2);
                break;
            case 'top':
                this.coords.center.y = objectBoundingRect.height / 2;
                break;
            case 'bottom':
                this.coords.center.y = Ktu.edit.documentSize.height - objectBoundingRect.height / 2;
                break;
            case 'center':
                this.coords.center.x = Ktu.edit.documentSize.width / 2;
                this.coords.center.y = Ktu.edit.documentSize.height / 2;
                break;
            case 'topBottomCenter':
                this.coords.center.y = Ktu.edit.documentSize.height / 2;
                break;
            case 'leftRightCenter':
                this.coords.center.x = Ktu.edit.documentSize.width / 2;
                break;
            case 'custome':
                // 自定义坐标
                if (!customeCoords) return;
                this.left = parseInt(customeCoords.x, 10);
                this.top = parseInt(customeCoords.y, 10);
                if (grouped && this.group) {
                    this.left = this.left - this.group.left;
                    this.top = this.top - this.group.top;
                    this.group.updateSizePosition();
                }
                break;
        }!customeCoords && this.getOriginTopLeft(type, grouped);
        this.setCoords();
    }
    // recordHistory用于做不记录历史的滑动层级调整
    changeZIndex(mode, isMultiEle, recordHistory = true) {
        const selKey = this.key;
        const that = this;
        if (!isMultiEle && recordHistory && isNaN(mode)) {
            if (this.group) {
                this.group.saveState();
            } else {
                this.savaZindexState();
            }
        }

        function up() {
            if (that.group) {
                const tmpData = that.group.objects.splice(selKey, 2);
                tmpData.reverse();
                that.group.objects.splice(selKey, 0, ...tmpData);
            } else {
                const tmpData = Ktu.selectedTemplateData.objects.splice(selKey, 2);
                tmpData.reverse();
                Ktu.selectedTemplateData.objects.splice(selKey, 0, ...tmpData);
            }
        }

        function down() {
            if (that.group) {
                const tmpData = that.group.objects.splice(selKey - 1, 2);
                tmpData.reverse();
                that.group.objects.splice(selKey - 1, 0, ...tmpData);
            } else {
                const tmpData = Ktu.selectedTemplateData.objects.splice(selKey - 1, 2);
                tmpData.reverse();
                Ktu.selectedTemplateData.objects.splice(selKey - 1, 0, ...tmpData);
            }
        }

        function top() {
            if (that.group) {
                const tmpData = that.group.objects.splice(selKey, 1)[0];
                that.group.objects.push(tmpData);
            } else {
                const tmpData = Ktu.selectedTemplateData.objects.splice(selKey, 1)[0];
                Ktu.selectedTemplateData.objects.push(tmpData);
            }
        }

        function bottom() {
            if (that.group) {
                const tmpData = that.group.objects.splice(selKey, 1)[0];
                that.group.objects.splice(0, 0, tmpData);
            } else {
                const tmpData = Ktu.selectedTemplateData.objects.splice(selKey, 1)[0];
                Ktu.selectedTemplateData.objects.splice(1, 0, tmpData);
            }
        }

        function setLevel(idx) {
            if (idx < 1) return;
            // 如果选中元素属于组合的的元素时
            if (that.group) {
                const tmpData = that.group.objects.splice(selKey, 1)[0];
                that.group.objects.splice(idx - 1, 0, tmpData);
            } else {
                const tmpData = Ktu.selectedTemplateData.objects.splice(selKey, 1)[0];
                Ktu.selectedTemplateData.objects.splice(idx, 0, tmpData);
            }
        }
        if (!isNaN(mode)) {
            setLevel(mode);
        } else {
            switch (mode) {
                case 'up':
                    up();
                    break;
                case 'down':
                    if (!that.group && selKey != 1 || that.group && selKey != 0) {
                        down();
                    }
                    break;
                case 'top':
                    top();
                    break;
                case 'bottom':
                    bottom();
                    break;
            }
        }
        Ktu.element.refreshElementKey();
        if (!isMultiEle && recordHistory) {
            if (this.group) {
                this.group.modifiedState();
            } else {
                this.zindexState();
            }
        }
    }
    /**
     * 进行删除操作
     * @param Boolean addStep 是否增加删除的历史记录 默认为true
     */
    remove(addStep = true, changePic) {
        if (this.isInContainer) {
            this.container.remove();
            return;
        }
        // 组合内元素超过1个，当成修改组合元素处理
        const selKey = this.key;
        if (this.isLocked && !changePic) {
            return;
        }

        let hasGif = false;
        if (/gif$/.test(this.imageType)) {
            hasGif = true;
        } else if (this.type === 'group') {
            const objectArr = this.objects;
            for (let i = 0; i < objectArr.length; i++) {
                if (objectArr[i].type === 'cimage' && /gif$/.test(objectArr[i].imageType)) {
                    hasGif = true;
                }
            }
        }
        if (this.group) {
            if (this.group.objects.length === 2) {
                if (Ktu.isUIManage || !hasGif) {
                    const beforeData = this.group.toObject();
                    this.group.objects.splice(this.key, 1);
                    this.group.cancelGroup(beforeData);
                } else {
                    Ktu.notice.warning('作品必须含有一张GIF');
                }
            } else {
                if (Ktu.isUIManage || !hasGif) {
                    this.group.saveState();
                    this.group.objects.splice(this.key, 1);
                    this.group.updateSizePosition();
                    this.group.modifiedState();
                    Ktu.selectedGroup = this.group;
                    Ktu.selectedData = null;
                } else {
                    Ktu.notice.warning('作品必须含有一张GIF');
                }
            }
        } else {
            if (Ktu.isUIManage || !hasGif) {
                addStep && this.removeState();
                Ktu.selectedTemplateData.objects.splice(selKey, 1);
                Ktu.interactive.uncheckAll();
            } else {
                Ktu.notice.warning('作品必须含有一张GIF');
            }
        }
        Ktu.element.refreshElementKey();
    }
    setOpacity(value) {
        this.opacity = value;
    }
    setScaleX(value) {
        this.scaleX = value;
    }
    setScaleY(value) {
        this.scaleY = value;
    }
    /**
     * 保存操作前的状态this.originalState，用于前进撤销
     * @param {*} type 操作类型
     */
    saveState(type) {
        if (type == HistoryAction.OBJECT_GROUP) {
            const originalState = [];
            const selData = this.toObject();
            originalState.push(Ktu.element.groupStateObject.toObject());
            originalState.push(selData);
            this.originalState = originalState;
        } else if (type == HistoryAction.OBJECT_ZINDEX) {
            const objects = Ktu.selectedTemplateData.objects || [];
            this.originalState = objects.map(item => item.objectId);
        } else {
            const container = this.container ? this.container : this;
            const object = this.group ? this.group : container;
            object.originalState = object.toObject();
        }
    }
    savaZindexState() {
        this.saveState(HistoryAction.OBJECT_ZINDEX);
    }
    /**
     * 创建一个更改元素属性的相关操作的记录
     */
    modifiedState() {
        const container = this.container ? this.container : this;
        let object = this.group ? this.group : container;
        if (object.group) {
            object = object.group;
        }
        const newHistoryStep = Ktu.historyManager[Ktu.template.currentPageIndex].addStep(HistoryAction.OBJECT_MODIFY);
        newHistoryStep.beforeChange(object.originalState);
        newHistoryStep.afterChange(object.toObject());
        Ktu.save.changeSaveNum();
    }
    /**
     * 创建一个添加元素的相关操作的记录
     */
    addedState() {
        const newHistoryStep = Ktu.historyManager[Ktu.template.currentPageIndex].addStep(HistoryAction.OBJECT_ADD);
        const oldSelection = Ktu.selectedData;
        newHistoryStep.beforeSelectedObject = oldSelection != null ? oldSelection.toObject().objectId : null;
        newHistoryStep.beforeChange(this.toObject());
        newHistoryStep.afterChange(this.toObject());
        Ktu.save.changeSaveNum();
    }
    /**
     * 创建一个更换图片元素的相关操作的记录
     */
    changeState({
        beforeData,
        afterData,
    }) {
        const newHistoryStep = Ktu.historyManager[Ktu.template.currentPageIndex].addStep(HistoryAction.OBJECT_CHANGE);
        newHistoryStep.beforeChange(beforeData);
        newHistoryStep.afterChange(afterData);
        Ktu.save.changeSaveNum();
    }
    /**
     * 创建一个删除元素的相关操作的记录
     */
    removeState() {
        const newHistoryStep = Ktu.historyManager[Ktu.template.currentPageIndex].addStep(HistoryAction.OBJECT_REMOVE);
        newHistoryStep.beforeChange(this.toObject());
        newHistoryStep.afterChange(this.toObject());
        Ktu.save.changeSaveNum();
    }
    /**
     * 创建一个更改元素层级的相关操作的记录
     * 此时的beforeData和afterData为页面元素的objectId列表，id排序即为元素的排序
     */
    zindexState() {
        const objects = Ktu.selectedTemplateData.objects || [];
        const currentState = objects.map(item => item.objectId);
        const newHistoryStep = Ktu.historyManager[Ktu.template.currentPageIndex].addStep(HistoryAction.OBJECT_ZINDEX);
        newHistoryStep.beforeChange(this.originalState);
        newHistoryStep.afterChange(currentState);
        Ktu.save.changeSaveNum();
    }
    /**
     * 创建一个组合操作，该操作是一个元素的某些操作执行后，会影响到其他元素
     * 此时所有被影响到的元素数据都需要保存到操作记录中
     * 例如：图片设置为背景
     */
    groupState(beforeState) {
        beforeState = beforeState || this.originalState;
        const currentState = [];
        currentState.push(Ktu.element.groupStateObject.toObject());
        currentState.push(this.toObject());
        const newHistoryStep = Ktu.historyManager[Ktu.template.currentPageIndex].addStep(HistoryAction.OBJECT_GROUP);
        newHistoryStep.beforeChange(beforeState);
        newHistoryStep.afterChange(currentState);
        Ktu.save.changeSaveNum();
    }
    getSvgStrokeStyle() {
        const strokeColor = Ktu.element.getRgb('stroke', this.stroke).str;
        return `${strokeColor} stroke-width: ${this.strokeWidth};stroke-dasharray: ${this.strokeDashArray};stroke-linecap: ${this.strokeLineCap};stroke-linejoin: ${this.strokeLineJoin};stroke-miterlimit: ${this.strokeMiterLimit};`;
    }
    getDimensions() {
        return {
            w: this.width + this.strokeWidth,
            h: this.height + this.strokeWidth,
        };
    }
    checkHasAlphaCorner() {
        return new Promise((resolve, reject) => {
            if (this.hasAlphaCorner === undefined) {
                let canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const image = new Image();
                image.crossOrigin = 'anonymous';
                image.onload = () => {
                    canvas.width = image.width;
                    canvas.height = image.height;
                    ctx.drawImage(image, 0, 0);
                    const lt = ctx.getImageData(0, 0, 1, 1).data;
                    const rt = ctx.getImageData(canvas.width - 1, 0, 1, 1).data;
                    const rb = ctx.getImageData(canvas.width - 1, canvas.height - 1, 1, 1).data;
                    const lb = ctx.getImageData(0, canvas.height - 1, 1, 1).data;
                    /* canvas.className = 'ktuDebug';
                    $('body').append(canvas); */
                    if (lt[3] === 0 || rt[3] === 0 || rb[3] === 0 || lb[3] === 0) {
                        Vue.set(this, 'hasAlphaCorner', true);
                        this.isSupportRadius = false;
                    } else {
                        Vue.set(this, 'hasAlphaCorner', false);
                    }
                    canvas = null;
                    resolve();
                };
                const imageObj = this.image || this.imageSource;
                const src = this.src || imageObj.src;
                if (!src.includes('.jpg')) {
                    image.src = this.src || imageObj.src;
                } else {
                    Vue.set(this, 'hasAlphaCorner', false);
                }
            }
        });
    }
    getPositionToEditor() {
        const {
            group,
        } = this;
        const {
            center,
        } = group.coords;
        const radian = group.angle * Math.PI / 180;
        // 组合相对于中心点
        const toCenter = {
            x: group.left - center.x,
            y: group.top - center.y,
        };
        /* 计算组合未旋转前的位置
           const originTop = toCenter.y * Math.cos(radian) - toCenter.x * Math.sin(radian);
           const originLeft = (toCenter.x + originTop * Math.sin(radian)) / Math.cos(radian); */
        const originLeft = toCenter.x * Math.cos(-radian) - toCenter.y * Math.sin(-radian);
        const originTop = toCenter.x * Math.sin(-radian) + toCenter.y * Math.cos(-radian);
        let objectPosition = {
            x: this.left,
            y: this.top,
        };
        // 翻转会改变左上角的点
        if (group.flipX) {
            objectPosition = {
                x: this.coords.bl.x,
                y: this.coords.bl.y,
            };
        };
        if (group.flipY) {
            objectPosition = {
                x: this.coords.tr.x,
                y: this.coords.tr.y,
            };
        };
        if (group.flipX && group.flipY) {
            objectPosition = {
                x: this.coords.br.x,
                y: this.coords.br.y,
            };
        }
        // 元素在组合未旋转前的位置
        let objectToCenter = {
            x: originLeft + objectPosition.x * group.scaleX,
            y: originTop + objectPosition.y * group.scaleY,
        };
        // 元素在组合翻转后的位置，翻转矩阵计算，翻转矩阵scale(-1, 1)
        if (group.flipX) {
            objectToCenter = {
                x: -objectToCenter.x,
                y: objectToCenter.y,
            };
        }
        if (group.flipY) {
            objectToCenter = {
                x: objectToCenter.x,
                y: -objectToCenter.y,
            };
        }
        // 元素在组合旋转后的位置，旋转矩阵计算
        objectToCenter = {
            x: objectToCenter.x * Math.cos(radian) - objectToCenter.y * Math.sin(radian),
            y: objectToCenter.x * Math.sin(radian) + objectToCenter.y * Math.cos(radian),
        };
        return {
            left: objectToCenter.x + center.x,
            top: objectToCenter.y + center.y,
        };
    }
    setActive() {
        Ktu.interactive.uncheckAll();
        Ktu.selectedData = this;
    }
    getFlip() {
        let flipStr = '';
        if (this.flipX) {
            flipStr += `matrix(-1,0,0,1,${this.shapeWidth || this.viewBoxWidth || this.width},0)`;
        }
        if (this.flipY) {
            flipStr += `matrix(1,0,0,-1,0,${this.shapeHeight || this.viewBoxHeight || this.height})`;
        }
        return flipStr;
    }
    callbackState(callback) {
        const newHistoryStep = Ktu.historyManager[Ktu.template.currentPageIndex].addStep(HistoryAction.CALLBACK);
        newHistoryStep.beforeChange(this.toObject());
        newHistoryStep.saveCallback(callback);
        Ktu.save.changeSaveNum();
    }
};
Ktu.element.processElement = function (e, isFromCopy) {
    let object;
    if (e instanceof TheElement) {
        return e;
    }
    switch (e.type) {
        case 'group':
            object = new Group(e);
            break;
        case 'background':
            object = new Background(e);
            break;
        case 'cimage':
            object = new Cimage(e);
            break;
        case 'path-group':
        case 'path':
            object = new PathGroup(e);
            break;
        case 'textbox':
            object = new Textbox(e);
            break;
        case 'wordart':
            object = new Wordart(e);
            break;
        case 'rect':
            object = new Rect(e);
            break;
        case 'line':
            object = new Line(e);
            break;
        case 'ellipse':
            object = new Ellipse(e);
            break;
        case 'qr-code':
            object = new QrCode(e);
            break;
        case 'map':
            object = new EleMap(e);
            break;
        case 'imageContainer':
            object = new ImageContainer(e);
            break;
        case 'chart':
            e.msg = typeof e.msg == 'string' ? JSON.parse(e.msg) : e.msg;
            if (e.msg.chartType === 'rectChart') {
                object = new RectChart(e);
            } else if (e.msg.chartType === 'gRectChart') {
                object = new GRectChart(e);
            } else if (e.msg.chartType === 'hRectChart') {
                object = new HRectChart(e);
            } else if (e.msg.chartType === 'hGRectChart') {
                object = new HGRectChart(e);
            } else if (e.msg.chartType === 'lineChart') {
                object = new LineChart(e);
            } else if (e.msg.chartType === 'gLineChart') {
                object = new GLineChart(e);
            } else if (e.msg.chartType === 'pieChart') {
                object = new PieChart(e);
            } else if (e.msg.chartType === 'donutChart') {
                object = new DonutChart(e);
            } else if (e.msg.chartType === 'roseChart') {
                object = new RoseChart(e);
            }
            break;
        case 'table':
            object = new Table(e);
            break;
        case 'wordCloud':
            object = new WordCloud(e);
            break;
        case 'threeText':
            if (isFromCopy) {
                delete e.tmpKey;
            }
            object = new ThreeText(e);
            break;
        default:
            break;
    }
    return object;
};
Ktu.element.refreshElementKey = function () {
    Ktu.selectedTemplateData.objects.forEach((e, i) => {
        // 组合的时候里面的key，层级也需要更新
        if (e.type === 'group') {
            e.objects.forEach((e, i) => {
                e.key = i;
                e.depth = i;
            });
        }
        e.key = i;
        e.depth = i;
    });
};
Ktu.element.copyCount = 0;
Ktu.element.copy = function () {
    let selData = Ktu.activeObject;
    if (!selData) {
        return;
    }
    if (selData.isInContainer) {
        selData = selData.container;
    }
    if (selData.type !== 'background') {
        // 组合内元素需要拿到绝对位置
        if (selData.group) {
            const index = selData.depth;
            let group = selData.group.splitGroup();
            this.copiedObject = group.objects[index];
            group = null;
        } else {
            this.copiedObject = selData.toObject();
        }
        Ktu.checkDataType([this.copiedObject]);
        Ktu.globalObject.hasCopiedObject = true;
    }
    Ktu.element.copyCount = 1;
    if (this.copiedObject) {
        const copyObj = {
            copiedObject: this.copiedObject,
            pageId: Ktu.template.currentpageId,
            ktuId: Ktu.ktuData.id,
        };
        // 如果是第三方设计师模式下(白名单除外) 禁止跨页面复制 所以不能使用 localStorage
        if (Ktu.isFromThirdDesigner && !Ktu.isUIManageForWhite) {
            Ktu.element._tmpCopyObj = copyObj;
        } else {
            window.localStorage.setItem(`_ktuCopyObject_${Ktu.ktuData.ktuAid}`, JSON.stringify(copyObj));
        }
    }
};
Ktu.element.paste = async function () {
    let ktuCopyObject;
    if (Ktu.isFromThirdDesigner && !Ktu.isUIManageForWhite) {
        ktuCopyObject = Ktu.element._tmpCopyObj;
    } else {
        ktuCopyObject = JSON.parse(window.localStorage.getItem(`_ktuCopyObject_${Ktu.ktuData.ktuAid}`));
    }
    if (!ktuCopyObject) {
        return;
    }
    let hasGif = false;
    if (ktuCopyObject.copiedObject.image && /gif$/.test(JSON.parse(ktuCopyObject.copiedObject.image).src)) {
        hasGif = true;
    } else if (['group', 'multi'].indexOf(ktuCopyObject.copiedObject.type) !== -1) {
        const objectArr = ktuCopyObject.copiedObject.objects;
        for (let i = 0; i < objectArr.length; i++) {
            if (objectArr[i].type === 'group') {
                const groupArr = JSON.parse(objectArr[i].objects);
                for (let j = 0; j < groupArr.length; j++) {
                    if (groupArr[j].type === 'cimage' && /\.gif/.test(JSON.parse(groupArr[j].image).src)) {
                        hasGif = true;
                    }
                }
            } else if (objectArr[i].type === 'cimage' && /\.gif/.test(JSON.parse(objectArr[i].image).src)) {
                hasGif = true;
            } else if (objectArr[i].type === 'threeText') {
                delete objectArr[i].tmpKey;
            }
        }
    }
    // 粘贴gif图片给出提示
    if (hasGif) {
        if (Ktu.ktuData.isGif) {
            Ktu.notice.warning('最终作品仅能含一张GIF');
            if (!Ktu.isUIManage) {
                return;
            }
        } else {
            Ktu.notice.warning('GIF不支持跨作品复制');
            return;
        }
    }
    const isCurrentPage = (ktuCopyObject.ktuId === Ktu.ktuData.id && ktuCopyObject.pageId === Ktu.template.currentpageId);
    const count = isCurrentPage ? Ktu.element.copyCount++ : 0;
    const obj = _.cloneDeep(ktuCopyObject.copiedObject);
    obj.visible = true;
    Ktu.interactive.uncheckAll();
    if (obj.type === 'multi') {
        const _objects = [];
        // obj.objects.forEach((item) => {
        for (const item of obj.objects) {
            await this.objectFilter(item);
            const newObject = this.processElement(item);
            newObject.left += 20 * count;
            newObject.top += 20 * count;
            // 进行复制对象属性的过滤处理
            Ktu.selectedTemplateData.objects.push(newObject);
            _objects.push(newObject);
        }
        // });
        Ktu.currentMulti = new Multi({
            objects: _objects,
        });
        Ktu.element.refreshElementKey();
        Ktu.currentMulti.addedState();
    } else {
        await this.objectFilter(obj);
        const newObject = this.processElement(obj, true);
        newObject.left += 20 * count;
        newObject.top += 20 * count;
        // 进行复制对象属性的过滤处理
        Ktu.selectedTemplateData.objects.push(newObject);
        Ktu.element.refreshElementKey();
        Ktu.selectedData = newObject;
        Ktu.selectedData.addedState();
        Ktu.selectedData.setCoords();
    }
};
Ktu.element.addModule = async function (type, options = {}) {
    const selData = Ktu.selectedData;
    const selGroupData = Ktu.selectedGroup;
    Ktu.interactive.beforeSelectedData = selData;
    Ktu.interactive.uncheckAll();
    let obj;
    const fileId = options.id;
    const {
        path,
    } = options;
    if (options.category == 5) {
        options.fromMaterial = true;
    }
    if (type === 'image') {
        obj = {
            type: 'cimage',
            image: {
                left: 0,
                top: 0,
                scaleX: 1,
                scaleY: 1,
                fileId,
                smallSrc: options.smallSrc,
                src: path,
                forbidScale: options.forbid,
                width: options.w ? options.w : undefined,
                height: options.h ? options.h : undefined,
            },
            width: options.w ? options.w : undefined,
            height: options.h ? options.h : undefined,
            left: options.left,
            top: options.top,
            elementName: '图片',
            canCollect: options.canCollect || false,
            isCollect: options.isCollect || false,
            category: options.category,
        };
        if (options.type == 'changePic') {
            obj.width = selData.width;
            obj.height = selData.height;
            obj.cropScaleX = selData.cropScaleX;
            obj.cropScaleY = selData.cropScaleY;
            obj.scaleX = selData.scaleX;
            obj.scaleY = selData.scaleY;
            obj.left = selData.left;
            obj.top = selData.top;
            obj.opacity = selData.opacity;
            obj.isOpenShadow = selData.isOpenShadow;
            obj.angle = selData.angle;
            obj.flipX = selData.flipX;
            obj.flipY = selData.flipY;

            const newSelDataSrc = options.path;
            const newImageType = newSelDataSrc.substr(newSelDataSrc.length - 3, 3);
            if (newImageType === 'png' && ['qr-code', 'ellipse'].indexOf(selData.type) == -1) {
                obj.filters = _.cloneDeep(selData.filters);
                obj.shadow = _.cloneDeep(selData.shadow);
            } else if (newImageType === 'jpg') {
                obj.shadow = _.cloneDeep(selData.shadow);
                obj.radius = _.cloneDeep(selData.radius);
                obj.filters = _.cloneDeep(selData.filters);
                obj.stroke = selData.stroke;
                obj.strokeDashArray = _.cloneDeep(selData.strokeDashArray);
                obj.strokeWidth = selData.strokeWidth;
            }
        } else if (options.type === 'backgroundToImage') {
            // 从背景脱离出来的图片
            obj.top = 0;
            obj.left = 0;
            obj.width = Ktu.ktuData.other.width;
            obj.height = Ktu.ktuData.other.height;
            obj.scaleX = selData.scaleX;
            obj.scaleY = selData.scaleY;
            obj.angle = 0;
            obj.flipX = selData.flipX;
            obj.flipY = selData.flipY;
            obj.opacity = selData.opacity;
            obj.image = _.clone(selData.image);
            obj.filters = _.cloneDeep(selData.filters);
            obj.depth = 1;
            obj.isCollect = selData.isCollect || false;
            obj.canCollect = selData.canCollect || false;
            obj.category = selData.category;
        }
        const object = new Cimage(obj);
        object.uploadType = options.uploadType;
        // PSD上传时图片不缩放
        if (object.image.forbidScale) {
            object.scaleX = 1;
            object.scaleY = 1;
        }
        let beforeData;
        if (options.type == 'changePic') {
            beforeData = selData.group ? selData.group.toObject() : selData.toObject();
            // 新的设置图片居中，匹配大小
            object.setImageCenter(false);
            // 替换图片时不需要缩小为原图的0.8
            object.hasCrop = true;
            object.autoCrop(true);

            if (['qr-code', 'ellipse'].indexOf(selData.type) == -1) {
                if (object.isSupportRadius) {
                    object.radius = _.cloneDeep(selData.radius);
                }
            }
        } else if (options.type === 'backgroundToImage') {
            const bgObject = selData.toObject();
            const imgObject = object.toObject();
            const beforeState = [bgObject, imgObject];
            /* object.setImageCenter();
               清除背景图片不需要进行历史记录 */
            selData.clearBackground(false);
            const background = Ktu.element.getBackgroundObj();
            Ktu.element.groupStateObject = background;
            object.groupState(beforeState);
            Ktu.element.groupStateObject = null;
        } else {
            const size = object.getSize();
            if (options.uploadType == 'psdUpload') {
                object.scaleX = options.psdScale;
                object.scaleY = options.psdScale;
                object.left = options.left * options.psdScale;
                object.top = options.top * options.psdScale;
            } else {
                object.scaleX = size.scaleX;
                object.scaleY = size.scaleY;
                object.left = size.left;
                object.top = size.top;
            }
            object.setCoords();
        }

        // 换图片的话 插入需要不同处理 一个是新增push 一个是插入指定index
        if (options.type != 'changePic' && options.type != 'backgroundToImage') {
            // 画板中有gif素材 再添加gif需给出提示
            const isGif = /gif$/.test(options.path);
            const templateDataArr = Ktu.selectedTemplateData.objects;
            if (isGif && templateDataArr.length > 1) {
                for (let i = 1; i < templateDataArr.length; i++) {
                    if (templateDataArr[i].type != 'cimage') {
                        continue;
                    } else if (templateDataArr[i].imageType !== 'gif') {
                        continue;
                    } else {
                        Ktu.notice.warning('最终作品仅能含一张GIF');
                        break;
                    }
                }
            }
            Ktu.selectedTemplateData.objects.push(object);
            Ktu.element.refreshElementKey();
            object.addedState();
        } else if (options.type == 'changePic') {
            if (selData.group) {
                const groupIndex = selGroupData.depth;
                const imageIndex = selData.depth;
                Ktu.selectedTemplateData.objects[groupIndex].objects.splice(imageIndex, 1, object);
                Ktu.selectedTemplateData.objects[groupIndex].objects[imageIndex].group = Ktu.selectedTemplateData.objects[groupIndex];
                Ktu.selectedGroup = Ktu.selectedTemplateData.objects[groupIndex];
                Ktu.element.refreshElementKey();
                // selData.group.isSelected = true;
                object.changeState({
                    beforeData,
                    afterData: selData.group.toObject(),
                });
            } else {
                const index = selData.depth;
                Ktu.selectedTemplateData.objects.splice(index, 1, object);
                Ktu.element.refreshElementKey();
                object.changeState({
                    beforeData,
                    afterData: object.toObject(),
                });
            }
        } else if (options.type == 'backgroundToImage') {
            Ktu.selectedTemplateData.objects.splice(1, 0, object);
            Ktu.element.refreshElementKey();
            // object.addedState();
        }
        Ktu.selectedData = object;
    } else if (type === 'textbox' || type === 'wordart') {
        obj = {
            type,
            width: options.width,
            scaleX: options.scaleX,
            scaleY: options.scaleY,
            skewX: options.skewX,
            skewY: options.skewY,
            text: options.text,
            left: options.left,
            top: options.top,
            elementName: '',
            ftFamilyList: [{
                fontid: options.fontId ? options.fontId : 58,
                fonttype: 0,
                tmp_fontface_path: 'default',
            }],
            fill: options.fill,
            fontSize: options.fontSize,
            shadow: options.shadow ? _.clone(options.shadow) : undefined,
            style: options.style ? _.clone(options.style) : undefined,
            fontWeight: options.fontWeight,
            ftFamilListChg: 1,
            category: options.category,
            canCollect: options.canCollect || false,
            isCollect: options.isCollect || false,
            from: options.from || null,
        };
        /* const cookies = "&_FSESSIONID=" + $.cookie("_FSESSIONID");
           const ftFamilyList = obj.ftFamilyList[0];
           const textType = ftFamilyList.fonttype;
           const id = ftFamilyList.fontid;
           const fontUrl = "/font.jsp?type=" + textType + "&id=" + id + cookies;
           const font = (await axios.post(fontUrl, {
           substring: encodeURIComponent(JSON.stringify(obj.text))
           }, {
           responseType: 'arraybuffer'
           })).data;
           const fontFamily = "ktu_Font_TYPE_" + textType + "_ID_" + id + "RAN_" + parseInt(new Date().getTime());
           const fontFace = new FontFace(fontFamily, font);
           const loadedFace = await fontFace.load();
           document.fonts.add(loadedFace);
           obj.ftFamilListChg = 1;
           obj.fontFamily = fontFamily;
           obj.ftFamilyList[0] = {
           con: obj.text,
           fontFaceId: "",
           fontid: id,
           fonttype: textType,
           fontfamily: fontFamily,
           tmp_fontface_path: fontUrl,
           hasLoaded: true
           }; */
        // eslint-disable-next-line no-eval
        const className = eval(type.replace(type[0], type[0].toUpperCase()));
        const object = new className(obj);
        object.from = options.from;
        const size = object.getSize();
        if (options.uploadType == 'psdUpload') {
            object.scaleX = options.scaleX * options.psdScale;
            object.scaleY = options.scaleX * options.psdScale;
            object.left = options.left * options.psdScale;
            object.top = options.top * options.psdScale;
        } else {
            object.scaleX = size.scaleX;
            object.scaleY = size.scaleY;
            object.left = size.left;
            object.top = size.top;
        }

        object.setCoords();
        Ktu.selectedTemplateData.objects.push(object);
        // 添加历史记录
        Ktu.selectedData = object;
        Ktu.selectedData.addedState();
    } else if (type === 'svg') {
        obj = {
            type: 'path-group',
            fileId,
            src: path,
            elementName: '图形',
            left: options.left,
            top: options.top,
            category: options.category,
            canCollect: options.canCollect || false,
            isCollect: options.isCollect || false,
        };
        let beforeData;
        if (options.type == 'changePic') {
            obj.width = options.w;
            obj.height = options.h;
            obj.scaleX = selData.width * selData.scaleX / obj.width;
            obj.scaleY = selData.height * selData.scaleY / obj.height;
            obj.left = selData.left;
            obj.top = selData.top;
            obj.opacity = selData.opacity;
            obj.isOpenShadow = selData.isOpenShadow;
            obj.shadow = _.cloneDeep(selData.shadow);
            obj.angle = selData.angle;
            obj.flipX = selData.flipX;
            obj.flipY = selData.flipY;
        }
        const object = new PathGroup(obj);
        if (options.type == 'changePic' && ['qr-code', 'ellipse'].indexOf(selData.type) == -1) {
            /*
            object.checkHasAlphaCorner().then(result => {
                if (object.isSupportRadius && selData) {
                    object.radius = _.cloneDeep(selData.radius);
                }
            });
            */
            if (object.isSupportRadius && selData) {
                object.radius = _.cloneDeep(selData.radius);
            }
        }
        await object.loadedPromise.then(result => {
            if (result && selData) {
                if (options.type === 'changePic') {
                    object.stroke = selData.stroke;
                    object.strokeDashArray = _.cloneDeep(selData.strokeDashArray);
                    if (['path-group', 'qr-code', 'background'].indexOf(selData.type) >= 0 || (selData.type === 'cimage' && selData.imageType === 'png')) {
                        object.strokeWidth = selData.strokeWidth;
                    } else {
                        if (selData.strokeWidth != 0) {
                            const ratio = selData.strokeWidth / Math.floor(Math.min(selData.width * selData.scaleX, selData.height * selData.scaleY) + 1);
                            object.strokeWidth = ratio * 30 < 1 ? 1 : Math.floor(ratio * 30);
                        } else {
                            object.strokeWidth = selData.strokeWidth;
                        }
                    }
                }
            }
        });
        if (options.type == 'changePic') {
            beforeData = selData.group ? selData.group.toObject() : selData.toObject();
        } else {
            const size = object.getSize();
            object.scaleX = size.scaleX;
            object.scaleY = size.scaleY;
            object.left = size.left;
            object.top = size.top;
            object.setCoords();
        }

        // 换图片的话 插入需要不同处理 一个是新增push 一个是插入指定index
        if (options.type != 'changePic') {
            Ktu.selectedTemplateData.objects.push(object);
            Ktu.element.refreshElementKey();
            Ktu.selectedData = object;
            Ktu.selectedData.addedState();
        } else if (options.type == 'changePic') {
            if (selData.group) {
                const groupIndex = selGroupData.depth;
                const imageIndex = selData.depth;
                Ktu.selectedTemplateData.objects[groupIndex].objects.splice(imageIndex, 1, object);
                Ktu.selectedTemplateData.objects[groupIndex].objects[imageIndex].group = Ktu.selectedTemplateData.objects[groupIndex];
                Ktu.element.refreshElementKey();
                object.changeState({
                    beforeData,
                    afterData: selData.group.toObject(),
                });
            } else {
                const index = selData.depth;
                Ktu.selectedTemplateData.objects.splice(index, 1, object);
                Ktu.element.refreshElementKey();

                object.changeState({
                    beforeData,
                    afterData: object.toObject(),
                });
            }
        }
        // 获取svg的大小 文字容器需要
        if (options.getSvgSize) {
            // 执行传过来的函数 设置绘制svg对象的值 存在store中
            options.getSvgSize(object);
        }
    } else if (type === 'rect') {
        obj = {
            type: 'rect',
            elementName: '矩形',
            left: options.left,
            top: options.top,
            fileId: options.id,
            category: options.category,
            canCollect: options.canCollect || false,
            isCollect: options.isCollect || false,
        };
        if (options.drawType === 'fill') {
            obj.fill = '#000';
        } else {
            obj.fill = '';
            obj.stroke = '#000';
        }
        /* const size = this.canvas.getSize(obj, options);
           obj.top = size.top;
           obj.left = size.left;
           obj.width = size.width;
           obj.height = size.height; */
        const object = new Rect(obj);
        const size = object.getSize();
        object.left = size.left;
        object.top = size.top;
        object.width = size.width;
        object.height = size.height;

        // 有描边的也要初始化描边，外面传的是百分比%，不能写死px
        if (options.drawType !== 'fill') {
            object.strokeWidth = options.strokeWidth ? options.strokeWidth * Math.min(object.width, object.height) / 100 : 1;
        }

        // 有圆角的初始化圆角,外面传的是百分比%，不能写死px
        if (options.radius) {
            // （radius.size）做一个px转换
            options.radius.size = options.radius.size * Math.min(object.width, object.height) / 100;
            object.radius = options.radius;
        }

        object.setCoords();
        Ktu.selectedTemplateData.objects.push(object);
        Ktu.selectedData = object;
        Ktu.selectedData.addedState();
    } else if (type === 'ellipse') {
        obj = {
            type: 'ellipse',
            elementName: '圆形',
            left: options.left,
            top: options.top,
            fileId: options.id,
            category: options.category,
            canCollect: options.canCollect || false,
            isCollect: options.isCollect || false,
        };
        if (options.drawType === 'fill') {
            obj.fill = '#000';
        } else {
            obj.fill = '';
            obj.stroke = '#000';
            obj.strokeWidth = options.strokeWidth || 1;
        }
        /* const size = this.canvas.getSize(obj, options);
           obj.top = size.top;
           obj.left = size.left;
           obj.rx = size.width / 2;
           obj.ry = size.height / 2; */
        const object = new Ellipse(obj);
        const size = object.getSize();
        object.left = size.left;
        object.top = size.top;
        object.width = size.width;
        object.height = size.height;

        // 有描边的也要初始化描边，外面传的是百分比%，不能写死px
        if (options.drawType !== 'fill') {
            object.strokeWidth = options.strokeWidth ? options.strokeWidth * Math.min(object.width, object.height) / 100 : 1;
        }

        object.setCoords();
        Ktu.selectedTemplateData.objects.push(object);
        Ktu.selectedData = object;
        Ktu.selectedData.addedState();
    } else if (type === 'imageContainer') {
        obj = {
            type: 'imageContainer',
            elementName: '图片容器',
            left: options.left,
            top: options.top,
            fileId: options.id,
            src: path,
            category: options.category,
            canCollect: options.canCollect || false,
            isCollect: options.isCollect || false,
        };
        const object = new ImageContainer(obj);
        await object.loadedPromise;
        const size = object.getSize();
        object.scaleX = size.scaleX;
        object.scaleY = size.scaleY;
        object.left = size.left;
        object.top = size.top;
        object.setCoords();
        Ktu.selectedTemplateData.objects.push(object);
        Ktu.selectedData = object;
        Ktu.selectedData.addedState();
        Ktu.simpleLog('imageContainer', 'add');
    } else if (type === 'chart') {
        obj = {
            type: 'chart',
            elementName: '图表',
            left: options.left,
            top: options.top,
            width: options.width,
            height: options.height,
            msg: {
                viewWidth: options.width,
                viewHeight: options.height,
                data: options.data,
                color: options.color,
                fontColor: options.fontColor,
                isShowLabel: options.isShowLabel,
                isShowLegend: options.isShowLegend,
            },
        };

        let object = {};

        switch (options.type) {
            case 'rectChart':
                object = new RectChart(obj);
                break;
            case 'gRectChart':
                object = new GRectChart(obj);
                break;
            case 'hRectChart':
                object = new HRectChart(obj);
                break;
            case 'hGRectChart':
                object = new HGRectChart(obj);
                break;
            case 'lineChart':
                object = new LineChart(obj);
                break;
            case 'gLineChart':
                object = new GLineChart(obj);
                break;
            case 'pieChart':
                object = new PieChart(obj);
                break;
            case 'donutChart':
                object = new DonutChart(obj);
                break;
            case 'roseChart':
                object = new RoseChart(obj);
                break;
        }

        const size = object.getSize();
        object.scaleX = size.scaleX;
        object.scaleY = size.scaleY;
        object.left = size.left;
        object.top = size.top;
        object.setCoords();
        Ktu.selectedTemplateData.objects.push(object);
        Ktu.selectedData = object;
        Ktu.selectedData.addedState();
    } else if (type === 'qrCode') {
        obj = {
            type: options.type,
            src: options.src,
            msg: options.msg,
            elementName: options.elementName,
            width: options.width,
            height: options.height,
            canCollect: false,
        };
        const object = new QrCode(obj);
        await object.loadedPromise;
        const size = object.getSize();
        object.scaleX = size.scaleX;
        object.scaleY = size.scaleY;
        object.left = size.left;
        object.top = size.top;
        object.setCoords();
        Ktu.selectedTemplateData.objects.push(object);
        Ktu.selectedData = object;
        Ktu.selectedData.addedState();
    } else if (type === 'map') {
        obj = {
            type: options.type,
            image: {
                left: 0,
                top: 0,
                scaleX: 1,
                scaleY: 1,
                fileId,
                smallSrc: options.src,
                src: options.src,
                originalSrc: options.src,
                forbidScale: options.forbid,
                width: options.width ? options.width : undefined,
                height: options.height ? options.height : undefined,
            },
            msg: options.msg,
            elementName: options.elementName,
            width: options.width,
            height: options.height,
            radius: options.radius,
            src: options.src,
        };
        const object = new EleMap(obj);
        await object.loadedPromise;
        const size = object.getSize();
        object.scaleX = size.scaleX;
        object.scaleY = size.scaleY;
        object.left = size.left;
        object.top = size.top;
        object.setCoords();
        Ktu.selectedTemplateData.objects.push(object);
        Ktu.selectedData = object;
        Ktu.selectedData.addedState();
    } else if (type === 'table') {
        obj = {
            type: options.type,
            elementName: '表格',
            left: options.left,
            top: options.top,
            width: options.width,
            height: options.height,
            strokeWidth: options.strokeWidth,
            stroke: options.stroke,
            msg: {
                tableData: options.tableData,
                viewWidth: options.width,
                viewHeight: options.height,
                type: options.tableType,
                themeColor: options.themeColor,
                borderColor: options.borderColor,
                cellWidth: 0,
                cellHeight: 0,
                scaleX: 1,
                scaleY: 1,
            },
        };
        const object = new Table(obj);
        const size = object.getSize();
        object.scaleX = size.scaleX;
        object.scaleY = size.scaleY;
        object.left = size.left;
        object.top = size.top;
        object.setCoords();
        Ktu.selectedTemplateData.objects.push(object);
        Ktu.selectedData = object;
        Ktu.selectedData.addedState();
    } else if (type === 'wordCloud') {
        obj = {
            type: 'wordCloud',
            msg: options.msg,
            elementName: '词云',
            left: options.left,
            top: options.top,
            width: options.width,
            height: options.height,
        };
        let beforeData;
        if (options.type == 'changeWordCloud') {
            obj.width = options.width;
            obj.height = options.height;
            obj.left = selData.left;
            obj.top = selData.top;
        }
        const object = new WordCloud(obj);
        await object.loadedPromise;
        if (options.type == 'changeWordCloud') {
            beforeData = selData.toObject();
            const size = object.getSize();
            object.scaleX = size.scaleX;
            object.scaleY = size.scaleY;
        } else {
            const size = object.getSize();
            object.left = size.left;
            object.top = size.top;
            object.scaleX = size.scaleX;
            object.scaleY = size.scaleY;
            object.setCoords();
        }

        // 换图片的话 插入需要不同处理 一个是新增push 一个是插入指定index
        if (options.type != 'changeWordCloud') {
            Ktu.selectedTemplateData.objects.push(object);
            Ktu.element.refreshElementKey();
            Ktu.selectedData = object;
            Ktu.selectedData.addedState();
        } else if (options.type == 'changeWordCloud') {
            if (!!selData.group) {
                const groupIndex = selData.group.depth;
                const eleIndex = selData.depth;
                // 如果是在组合内的，需要处理替换组合的元素，而不是页面。
                const groupData = Ktu.selectedTemplateData.objects[groupIndex];
                beforeData = groupData.toObject();
                // 需要保留上一个的scaleX、Y
                object.scaleX = selData.scaleX;
                object.scaleY = selData.scaleY;
                // 替换
                groupData.objects.splice(eleIndex, 1, object);
                Ktu.element.refreshElementKey();
                Ktu.selectedData = object;
                object.group = groupData;
                Ktu.selectedGroup = groupData;
                // 更新选择框
                groupData.updateSizePosition();
                // 加入历史队列
                object.changeState({
                    beforeData,
                    afterData: groupData.toObject(),
                });
            } else {
                const index = selData.depth;
                Ktu.selectedTemplateData.objects.splice(index, 1, object);
                Ktu.element.refreshElementKey();
                Ktu.selectedData = object;
                object.changeState({
                    beforeData,
                    afterData: object.toObject(),
                });
            }
        }
    } else if (type === 'line') {
        obj = {
            type: 'line',
            msg: _.cloneDeep(options.msg),
            elementName: '线条',
            left: options.left,
            top: options.top,
            width: options.width,
            height: options.height,
            strokeWidth: options.strokeWidth,
            strokeDashArray: options.strokeDashArray,
            stroke: options.stroke,
        };
        const object = new Line(obj);
        const size = object.getSize();
        object.left = size.left;
        object.top = size.top;
        object.scaleX = size.scaleX;
        object.scaleY = size.scaleY;
        object.setCoords();
        Ktu.selectedTemplateData.objects.push(object);
        Ktu.element.refreshElementKey();
        Ktu.selectedData = object;
        Ktu.selectedData.addedState();
    } else if (type == 'threeText') {
        obj = _.assignIn(options, {
            type,
            elementName: '',
            strokeWidth: 0,
        });
        const object = new ThreeText(obj, true);
        const size = object.getSize();
        object.width *= size.scaleX;
        object.height *= size.scaleY;
        object.fontSize *= size.scaleX;
        object.left = size.left;
        object.top = size.top;
        object.setCoords();
        Ktu.selectedTemplateData.objects.push(object);
        Ktu.selectedData = object;
        Ktu.selectedData.addedState();
    };
    options.callback && options.callback();
};
Ktu.element.removeFontFaceId = function (data) {
    if (data && data.length) {
        const remove = objects => {
            objects.forEach(object => {
                if (object.type === 'textbox') {
                    if (object.ftFamilyList && object.ftFamilyList.length) {
                        object.ftFamilyList.forEach(ftFamily => {
                            delete ftFamily.fontFaceId;
                            object.ftFamilListChg = 1;
                        });
                    }
                } else if (object.type === 'group') {
                    remove(object.objects);
                }
            });
        };
        data.forEach(page => {
            remove(page.content[0].objects);
        });
    }
    return data;
};
Ktu.element.getBackgroundObj = function () {
    return Ktu.selectedTemplateData.objects[0];
};

Ktu.element.selectedAll = function () {
    let objects = Ktu.selectedTemplateData.objects.slice(1);
    objects = objects.filter(item => {
        if (!item.isLocked && item.visible) {
            return true;
        }
        return false;
    });
    if (objects.length > 0) {
        Ktu.interactive.uncheckAll();
        if (objects.length === 1) {
            Ktu.selectedData = objects[0];
        } else {
            Ktu.currentMulti = new Multi({
                objects,
            });
        }
    }
};
Ktu.element.getObjectsId = function () {
    return Ktu.selectedTemplateData.objects.map(item => item.objectId);
};
Ktu.element.imageToBackground = function (inGroup) {
    const image = Ktu.selectedData.toObject();
    const imageObject = image.image;
    const background = Ktu.element.getBackgroundObj();
    Ktu.element.groupStateObject = background;
    // console.log('图片变背景');
    if (imageObject) {
        Ktu.selectedData.saveState(HistoryAction.OBJECT_GROUP);
        background.filters = _.cloneDeep(Ktu.selectedData.filters);
        imageObject.canCollect = image.canCollect === undefined ? false : image.canCollect;
        imageObject.isCollect = image.isCollect === undefined ? false : image.isCollect;
        imageObject.category = image.category;
        Ktu.deleteObject = Ktu.element.getBackgroundObj();
        Ktu.deleteBack = true;
        background.setBackgroundObject(imageObject);
        if (!inGroup) {
            const selKey = Ktu.selectedData.key;
            Ktu.selectedTemplateData.objects.splice(selKey, 1);
            Ktu.element.refreshElementKey();
        }
        Ktu.selectedData.groupState();
        Ktu.selectedData = background;
    }
    Ktu.element.groupStateObject = null;
    Ktu.edit.refreshPageTmpImage();
};
/**
 * 前进撤销的回调函数
 * @param {*} action 操作类型
 * @param {*} historyData 历史记录中的元素数据，对应afterData或者beforeData
 * @param {*} selectedObject 元素id，有可能为null
 * @param {*} object 对应的元素，有可能为空
 */
Ktu.element.loadObjectHistoryData = function (action, historyData, selectedObject, object) {
    const {
        objects,
    } = Ktu.selectedTemplateData;
    historyData = _.cloneDeep(historyData);
    if (action == HistoryAction.OBJECT_MODIFY) {
        const objId = historyData.objectId;
        // let object = objects.filter((info, idx) => (info.objectId == objId))[0];
        let object = objects.reduce((result, obj) => {
            if (obj.objectId === objId) {
                result = obj;
            } else if (obj.type === 'group' || obj.type === 'imageContainer') {
                obj.objects.forEach(subObject => {
                    if (subObject.objectId === objId) {
                        result = subObject;
                    }
                });
            }
            return result;
        }, null);
        if (!object) {
            new Error(`找不到${objId}对象`);
        }
        const key = object.depth;
        // $.extend(true, object, historyData);
        object = Ktu.element.processElement(historyData);
        Vue.set(objects, key, object);
        Ktu.element.refreshElementKey();
        if (historyData.type === 'background') {
            let fitBackground = false;
            if ((Ktu.ktuData.other.width !== object.width || Ktu.ktuData.other.height !== object.height) && object.angle === 0) {
                object.width = Ktu.ktuData.other.width;
                object.height = Ktu.ktuData.other.height;
                fitBackground = true;
            }
            if (!historyData.image) {
                object.image = null;
            } else {
                const background = Ktu.element.getBackgroundObj();
                fitBackground && background.setBackgroundObject(historyData.image);
            }
        }
        Ktu.interactive.uncheckAll();
        /* if (object.filters && !(object.filters instanceof Filters)) {
             object.filters = new Filters(object.filters);
        }*/
        if (object.type === 'group') {
            // object.objects = historyData.objects;
            object.objects.forEach((obj, index, objs) => {
                obj.group = object;
                Vue.set(objs, index, Ktu.element.processElement(obj));
            });
            Ktu.selectedGroup = object;
        } else if (object.type === 'imageContainer') {
            // object.objects = historyData.objects;
            object.objects.forEach((obj, index, objs) => {
                const {
                    clipshapeInfo,
                } = obj;
                const newe = Ktu.element.processElement(obj);
                newe.clipshapeInfo = clipshapeInfo;
                newe.clipShape = clipshapeInfo.clipShape;
                newe.controls = {};
                newe.isInContainer = true;
                newe.isSupportRadius = false;
                newe.container = object;
                Vue.set(objs, index, newe);
                Ktu.selectedData = object;
            });
        }
        /* else if (object.type === 'qr-code') {
            object.msg = JSON.parse(object.msg);
        }
        else if (object.type === 'wordCloud') {
            object.msg = JSON.parse(object.msg);
        }*/
        /* else if (object.type === 'table') {
           object.msg = JSON.parse(object.msg);
           object.msg.tableData.dataList.forEach((row) => {
           row.forEach((cell) => {
           if (cell.object) {
           cell.object = Ktu.element.processElement(cell.object);
           }
           })
           });
           } */
        else {
            /* if (object.type === 'cimage') {
                object.setImageSource(object.image.src);
            } */
            Ktu.selectedData = object;
        }
        /* if (object instanceof Text) {
            object.hasChanged = true;
            if (object.style && typeof object.style === 'string') {
                object.style = JSON.parse(object.style);
            }
        } */
        // Ktu.selectedData.setCoords();
    } else if (action == HistoryAction.OBJECT_ADD) {
        const {
            depth,
        } = historyData;
        const element = Ktu.element.processElement(historyData);
        element.dirty = true;
        objects.splice(depth, 0, element);
        Ktu.element.refreshElementKey();
        element.setActive();
    } else if (action == HistoryAction.OBJECT_CHANGE) {
        const {
            depth,
        } = historyData;
        const element = Ktu.element.processElement(historyData);
        element.dirty = true;
        objects.splice(depth, 1, element);
        Ktu.element.refreshElementKey();
        Ktu.interactive.uncheckAll();
    } else if (action == HistoryAction.OBJECT_REMOVE) {
        const {
            depth,
        } = historyData;
        objects.splice(depth, 1);
        Ktu.element.refreshElementKey();
        Ktu.interactive.uncheckAll();
    } else if (action == HistoryAction.OBJECT_ZINDEX) {
        const tmpObjects = new Array(objects.length);
        for (let i = historyData.length - 1; i >= 0; i--) {
            const objId = objects[i].objectId;
            const idx = historyData.indexOf(objId);
            tmpObjects[idx] = objects[i];
        }
        Ktu.templateData[Ktu.template.currentPageIndex].objects = tmpObjects;
        Ktu.element.refreshElementKey();
    } else if (action == HistoryAction.OBJECT_GROUP) {
        historyData.forEach(item => {
            if (item.type == 'background') {
                const background = Ktu.element.getBackgroundObj();
                let fitBackground = false;
                if (item.width !== background.width || item.height !== background.height) {
                    item.width = background.width;
                    item.height = background.height;
                    fitBackground = true;
                }
                $.extend(true, background, item);
                if (!item.image) {
                    background.image = null;
                } else {
                    // extend之后，item.image没有cutoutId|recourceFileId，可能会被加上，所以在这里处理一下
                    background.image.cutoutId = item.image.cutoutId;
                    background.image.recourceFileId = item.image.recourceFileId;
                    if (!fitBackground) {
                        background.get160src();
                        background.getBase64();
                        background.loadOriginImg();
                    } else {
                        background.setBackgroundObject(item.image);
                    }
                }
                background.filters = new Filters(background.filters);
                background.dirty = true;
                background.hasChange = true;
            } else if (item.type == 'cimage') {
                const objsId = Ktu.element.getObjectsId();
                const objId = item.objectId;
                const idx = objsId.indexOf(objId);
                if (idx >= 0) {
                    objects.splice(idx, 1);
                } else {
                    const image = Ktu.element.processElement(item);
                    // 来源于脱离背景的图片渲染处理
                    if (item.from && item.from === 'background') {
                        const background = Ktu.element.getBackgroundObj();
                        // 计算缩放值
                        const totalScaleX = background.width / image.width * image.scaleX;
                        const totalScaleY = background.height / image.height * image.scaleY;
                        const totalScale = totalScaleX < totalScaleY ? totalScaleX : totalScaleY;
                        image.scaleX = image.width * image.scaleX * totalScale < 1 ? 1 / image.width : image.scaleX * totalScale;
                        image.scaleY = image.height * image.scaleY * totalScale < 1 ? 1 / image.height : image.scaleY * totalScale;
                        image.left = image.left * totalScale;
                        image.top = image.top * totalScale;
                        image.setCoords();
                        image.setPosition('center', false);
                    }
                    const {
                        depth,
                    } = item;
                    if (depth > 0) {
                        objects.splice(depth, 0, image);
                    }
                }
            } else if (item.type === 'imageContainer') {
                const objId = item.objectId;
                // let object = objects.filter((info, idx) => (info.objectId == objId))[0];
                const imgContainer = objects.reduce((result, obj) => {
                    if (obj.objectId === objId) {
                        result = obj;
                    }
                    return result;
                }, null);
                if (!object) {
                    new Error(`找不到${objId}对象`);
                }
                imgContainer.objects = item.objects;
                imgContainer.objects.forEach((obj, index, objs) => {
                    const {
                        clipshapeInfo,
                    } = obj;
                    const newe = Ktu.element.processElement(obj);
                    newe.clipshapeInfo = clipshapeInfo;
                    newe.clipShape = clipshapeInfo.clipShape;
                    newe.controls = {};
                    newe.isInContainer = true;
                    newe.isSupportRadius = false;
                    newe.container = imgContainer;
                    Vue.set(objs, index, newe);
                });
                imgContainer.dirty = true;
            }
        });
        Ktu.element.refreshElementKey();
        Ktu.interactive.uncheckAll();
    }
    Ktu.save.changeSaveNum();
};
// 退出裁切
Ktu.element.checkAndExitClip = function () {
    if (Ktu.selectedData) {
        if (Ktu.selectedData.type !== 'imageContainer') {
            Ktu.selectedData.isClipMode && Ktu.selectedData.exitClipMode();
        } else {
            Ktu.selectedData.objects[0].isClipMode && Ktu.selectedData.objects[0].exitClipMode();
        }
    }
    // !!(Ktu.selectedData && Ktu.selectedData.isClipMode) && (Ktu.selectedData.exitClipMode());
};
// 生成渐变色标签
Ktu.element.getGradient = function (prop, value, obj) {
    if (!value || !value.includes('type')) return '';

    value = JSON.parse(value);

    let defs = '';
    let stop = '';

    const gradientId = `grad_${prop}_${obj.objectId}`;

    value.value.forEach(item => {
        let opacity = 1;
        if (!item.color.includes('#')) {
            const colorData = item.color
                .replace('rgba(', '')
                .replace(')', '')
                .split(',');

            opacity = Number(colorData[3]);
            item.color = Ktu.color.rgbToHex(`rgb(${colorData[0]}, ${colorData[1]}, ${colorData[2]})`);
        }
        stop += `<stop offset="${item.percent}%" style="stop-color:${item.color};stop-opacity:${opacity}" />`;
    });

    const pattern = `<pattern id="${gradientId}" x="0" y="0" width="${obj.width}" height="${obj.height}" patternUnits="userSpaceOnUse">
                        <rect x="0" y="0" width="${obj.width}" height="${obj.height}" fill="url(#inner_${gradientId})" />
                    </pattern>`;

    if (obj.type === 'textbox') {
        if (value.type === 'linear') {
            defs = `
                    <linearGradient id="inner_${gradientId}" x1="${value.angle.x1}%" y1="${value.angle.y1}%" x2="${value.angle.x2}%" y2="${value.angle.y2}%">${stop}</linearGradient>
                    ${pattern}
                `;
        } else {
            defs = `
                    <radialGradient id="inner_${gradientId}" cx="${value.direct.cx}%" cy="${value.direct.cy}%" r="${value.direct.r}%">${stop}</radialGradient>
                    ${pattern}
                    `;
        }
    } else {
        if (value.type === 'linear') {
            defs = `
                    <linearGradient id="${gradientId}" x1="${value.angle.x1}%" y1="${value.angle.y1}%" x2="${value.angle.x2}%" y2="${value.angle.y2}%">${stop}</linearGradient>
                `;
        } else {
            defs = `
                    <radialGradient id="${gradientId}" cx="${value.direct.cx}%" cy="${value.direct.cy}%" r="${value.direct.r}%">${stop}</radialGradient>
                    `;
        }
    }

    return defs;
};
Ktu.element.getRgb = function (prop, value, obj) {
    if (!value || value == 'none') {
        return {
            str: `${prop}: none; `,
        };
    } else if (value.includes('type')) {
        return {
            str: `${prop}: url(#grad_${prop}_${obj.objectId});`,
            rgb: `url(#grad_${prop}_${obj.objectId})`,
            opacity: 1,
        };
    } else if (value.indexOf('url') >= 0) {
        return {
            str: `${prop}:${value}`,
        };
    }
    const color = new Ktu.Color(value);
    let str = `${prop}: ${color.toRgb()}; `;
    const opacity = color.getAlpha();
    if (opacity !== 1) {
        // change the color in rgb + opacity
        str += `${prop}-opacity: ${opacity.toString()}; `;
    }
    return {
        str,
        rgb: color.toRgb(),
        opacity: opacity.toString(),
    };
};
// 过滤重置某些对象的属性,里面含有异步操作
Ktu.element.objectFilter = function (object) {
    return new Promise(async resolve => {
        object.objectId = Ktu.element.newObjectId;
        if (object.type === 'qr-code') {
            object.fileId = '';
            if (object.src && object.src.indexOf('data:image/jpg;base64,') > -1) {
                resolve();
            } else {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = object.width;
                canvas.height = object.height;
                const img = new Image();
                img.setAttribute('crossOrigin', 'Anonymous');
                img.src = object.src;
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, object.width, object.height);
                    object.src = canvas.toDataURL();
                    resolve();
                };
            }
        } else if (object.type === 'map') {
            object.image = typeof object.image === 'string' ? JSON.parse(object.image) : object.image;
            object.image.fileId = '';
            if (object.src && object.src.indexOf('data:image/jpg;base64,') > -1) {
                resolve();
            } else {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = object.width;
                canvas.height = object.height;
                const img = new Image();
                img.setAttribute('crossOrigin', 'Anonymous');
                img.src = object.image.src;
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, object.width, object.height);
                    object.src = canvas.toDataURL();
                    object.image.src = canvas.toDataURL();
                    resolve();
                };
            }
        } else {
            if (object.type === 'group' || object.type === 'imageContainer') {
                const objects = typeof object.objects == 'string' ? JSON.parse(object.objects) : object.objects;
                object.objects = object.objects != undefined ? objects : [];
                for (const obj of object.objects) {
                    await this.objectFilter(obj);
                }
            } else if (object.type === 'textbox') {
                if (object.ftFamilyList && object.ftFamilyList[0]) {
                    delete object.ftFamilyList[0].fontFaceId;
                    object.ftFamilListChg = 1;
                }
            }
            resolve();
        }
    });
};
// 生成没有背景的缩略图
Ktu.element.createThumbnail = function (imgData) {
    return new Promise(async resolve => {
        imgData = await imgData.toDataURL();
        let width;
        let height;
        const img = new Image();

        img.onload = function () {
            const ratio = img.width / img.height;
            // 图片宽高大于300px，做压缩处理
            if (img.width > 300 && img.height > 300) {
                if (img.width < img.height) {
                    width = 300;
                    height = Math.round(300 / ratio);
                } else {
                    height = 300;
                    width = Math.round(300 * ratio);
                }
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height);
                imgData = canvas.toDataURL();
            }
            resolve(imgData);
        };

        img.src = imgData;
    });
};
// 设计师右键生成文本组合
Ktu.element.createTextGroup = async function () {
    let imgData;
    let base64 = '';
    const {
        id,
    } = Ktu.ktuData;
    const {
        activeObject,
    } = Ktu;
    const textGroupData = _.cloneDeep(activeObject);
    const url = '../ajax/ktuEleAssociation_h.jsp?cmd=eleAssociation';
    // 处理多选而不是组合的情况下需要先将其转换为组合
    if (activeObject.type === 'multi') {
        // 文字组合中将多个元素不是组合的内容组合
        transferGroup(textGroupData);
    } else {
        imgData = await this.createThumbnail(activeObject);
        base64 = await Ktu.element.createTextGroupBase64(imgData);
        createTextGroup(textGroupData);
    }
    // 文字组合中将多个元素不是组合的内容组合
    function transferGroup(textGroupData) {
        Ktu.element.transferGroup(textGroupData).then(async group => {
            imgData = await Ktu.element.createThumbnail(group);
            base64 = await Ktu.element.createTextGroupBase64(imgData);
            createTextGroup(group);
        });
    }
    // 发送请求
    function createTextGroup(object) {
        // 将其depth重置为1
        object.depth = 1;
        object.setPosition('center');
        object = object.toObject();
        const obj = {
            objects: [object],
        };
        const content = JSON.stringify(Ktu.checkDataType([obj]));
        // 注意处理一下changeColor等一些数据，转化为字符串

        axios.post(url, {
            content,
            base64: base64.split(',')[1],
            ktuId: id,
        }).then(res => {
            const info = res.data;
            if (info.success) {
                Ktu.notice.success('生成文本组合成功！');
            }
        })
            .catch(err => {
                console.log(err);
            })
            .finally(() => { });
    }
};

//  多选转换为组合元素
Ktu.element.transferGroup = function (multi) {
    return new Promise(async resolve => {
        let group = {};
        // 取消组合，其实就是取组合内的_objects出来
        function cancelGroup(object) {
            return object.splitGroup().objects;
        }
        const {
            objects,
        } = multi;
        let objectsInGroup = [];
        let newObjects = objects.filter(object => {
            if (object.type === 'group') {
                const objects = cancelGroup(object);
                objectsInGroup = objectsInGroup.concat(objects);
                return false;
            }
            return true;
        });
        newObjects = newObjects.concat(objectsInGroup);
        // 需要将选中元素变为多选后转为组合
        group = new Multi({
            objects: newObjects,
        }).toGroup();
        // loadPromise是异步，需要全部元素的loadPromise执行完才能去生成缩略图；
        const promiseList = [];
        group.objects.forEach(item => {
            // 高级容器这里需要特殊处理
            if (item.type == 'imageContainer') {
                promiseList.push(item.initCanvas());

                item.objects.forEach(obj => {
                    if (obj.loadedPromise) {
                        promiseList.push(obj.loadedPromise);
                    }
                });
            }
            if (item.loadedPromise) {
                const promise = Promise.resolve(item.loadedPromise);
                promiseList.push(promise);
            }
        });
        /* 两种方法都可以
           Promise.all(promiseList).then(async () => {
           imgData = await Ktu.element.createThumbnail(group);
           createTextGroup(group);
           }); */
        await Promise.all(promiseList);
        resolve(group);
    });
};

// 生成一个完整文字组合画布内容
Ktu.element.createTextGroupBase64 = function (imgData) {
    return new Promise(resolve => {
        const image = new Image();
        image.onload = () => {
            const imgWidth = image.width;
            const imgHeight = image.height;
            const {
                width,
                height,
            } = Ktu.edit.documentSize;
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(image, (width - imgWidth) / 2, (height - imgHeight) / 2);
            resolve(canvas.toDataURL());
        };
        image.src = imgData;
    });
};

// 去掉dataUrl空白位置的方法
Ktu.element.removeBlank = function (data, width, height) {
    const pos = ['top', 'bottom', 'left', 'right'];
    let top;
    let bottom;
    let left;
    let right = 0;
    pos.forEach(key => {
        if (key == 'top') {
            for (let i = 0; i < height; i++) {
                for (let j = 0; j < width; j++) {
                    const pos = (i * width + j) * 4;
                    if (data[pos + 3] !== 0) {
                        top = i;
                        return;
                    }
                }
            }
        } else if (key == 'bottom') {
            for (let i = height - 1; i >= 0; i--) {
                for (let j = 0; j < width; j++) {
                    const pos = (i * width + j) * 4;
                    if (data[pos + 3] !== 0) {
                        bottom = i + 1;
                        return;
                    }
                }
            }
        } else if (key == 'left') {
            for (let i = 0; i < width; i++) {
                for (let j = 0; j < height; j++) {
                    const pos = (j * width + i) * 4;
                    if (data[pos + 3] !== 0) {
                        left = i;
                        return;
                    }
                }
            }
        } else {
            for (let i = width - 1; i >= 0; i--) {
                for (let j = 0; j < height; j++) {
                    const pos = (j * width + i) * 4;
                    if (data[pos + 3] !== 0) {
                        right = i + 1;
                        return;
                    }
                }
            }
        }
    });
    return {
        top,
        bottom,
        left,
        right,
    };
};
