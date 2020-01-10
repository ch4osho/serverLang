class Background extends OriginImage {
    constructor(data) {
        super(data);
        this.image = data.image;
        this.isPhoto = data.isPhoto;
        this.backgroundColor = data.backgroundColor;
        this.isClipMode = false;
        this.angle = data.angle || 0;
        this.scaleX = data.scaleX || 1;
        this.scaleY = data.scaleY || 1;
        this.imageZoomAdd = data.imageZoomAdd || 0;
        this.cropScaleX = data.cropScaleX || 1;
        this.cropScaleY = data.cropScaleY || 1;
        this.shapeWidth = this.shapeWidth === undefined ? Math.max(1, this.width * Math.abs(this.cropScaleX)) : this.shapeWidth;
        this.shapeHeight = this.shapeHeight === undefined ? Math.max(1, this.height * Math.abs(this.cropScaleY)) : this.shapeHeight;
        const filters = typeof data.filters === 'string' ? JSON.parse(data.filters) : data.filters;
        this.filters = new Filters(!data.filters ? {} : filters);
        this.hasLoaded = false;
        this.loadedPromise = null;
        this.canCollect = false;
        if (this.image && this.image.src) {
            this.get160src();
            this.loadedPromise = this.getBase64();
            if (Ktu.vm && Ktu.vm.hasLoaded) {
                this.loadOriginImg();
            }
        }
    }
    initCanvas() {
        return new Promise(resolve => {
            if (this.image && this.image.src) {
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
            } else {
                this.drawCanvas().then(() => {
                    resolve(this);
                });
            }
        });
    }
    get160src() {
        let {
            src,
        } = this.image;
        if (src.indexOf('base64') === -1) {
            src = src.replace('!160x160', '').replace('!2000x2000', '');
            this.image.originalSrc = src;
            let srcSplit = src.split('/');
            if (!this.image.src160) {
                if (src.indexOf('!160x160.') === -1) {
                    const idPath = `${srcSplit[srcSplit.length - 1].split('.')[0]}!160x160.${srcSplit[srcSplit.length - 1].split('.')[1]}`;
                    srcSplit[srcSplit.length - 1] = idPath;
                }
                this.image.src160 = srcSplit.join('/');

                srcSplit = src.split('/');
            }
            if (src.indexOf('!2000x2000.') === -1) {
                const idPath = `${srcSplit[srcSplit.length - 1].split('.')[0]}!2000x2000.${srcSplit[srcSplit.length - 1].split('.')[1]}`;
                srcSplit[srcSplit.length - 1] = idPath;
            }
            this.image.src2000 = srcSplit.join('/');
            this.image.src = this.image.src160;
        }
    }
    loadOriginImg() {
        if (!this.image.src2000) return;
        const img = new Image();
        img.onload = () => {
            this.image.src = this.image.src2000;
            this.dirty = true;
            this.hasLoaded = true;
        };
        if (this.image.src.indexOf('data') !== 0) {
            img.crossOrigin = 'anonymous';
        }

        img.src = this.image.src2000;
    }
    getBase64() {
        return new Promise((resolve, reject) => {
            if (!this.image.src160) {
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
                this.base64 = canvas.toDataURL();
                resolve();
            };

            if (this.image.src160.indexOf('data') !== 0) {
                img.crossOrigin = 'anonymous';
            }

            img.src = this.image.src160;
        });
    }
    setAngle(type) {
        this.saveState();
        const self = this;
        const rotate = {
            getAngle() {
                let angle = type === 'left' ? self.angle - 90 : self.angle + 90;
                angle > 360 && (angle -= 360);
                angle < 0 && (angle += 360);
                return angle;
            },
            setAngle: angle => {
                angle = angle === undefined ? rotate.getAngle() : angle;
                /* //求边长
                   const hypotenuse = Math.sqrt((Math.pow(self.width * self.scaleX, 2) + Math.pow(self.height * self.scaleY, 2))) / 2;
                   // //得到相对于元素中心点的坐标
                   const radian = Math.PI * angle / 180;
                   let left = self.coords.center.x - hypotenuse * (Math.cos(radian) * (self.width * self.scaleX / hypotenuse / 2) - Math.sin(radian) * (self.height * self.scaleY / hypotenuse / 2));
                   let top = self.coords.center.y - hypotenuse * (Math.sin(radian) * (self.width * self.scaleX / hypotenuse / 2) + Math.cos(radian) * (self.height * self.scaleY / hypotenuse / 2));
                   self.left = left;
                   self.top = top;
                   self.angle = angle;
                   self.setCoords(); */
                /* const offsetAngle = angle - this.angle;
                const radian = Math.PI * offsetAngle / 180;
                const { center } = this.coords;
                const toOriginPoint = {
                    x: this.image.left - center.x,
                    y: this.image.top - center.y,
                };
                const end = {
                    x: Math.cos(radian) * toOriginPoint.x - Math.sin(radian) * toOriginPoint.y,
                    y: Math.sin(radian) * toOriginPoint.x + Math.cos(radian) * toOriginPoint.y,
                }; */
                this.angle = angle;
                /* this.left = end.x + center.x;
                   this.top = end.y + center.y; */
                this.setImageCenter(true);
                this.setCoords();
            },
            setMatrix() {
                type === 'horizontal' ? self.flipX = !self.flipX : self.flipY = !self.flipY;
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

        typeof type === 'number' ? rotate.setAngle(type) : rotate[type]();
        this.dirty = true;
        this.modifiedState();
    }
    setImageCenter(fromrotate) {
        if (!this.image) {
            return;
        }
        // 旋转整体位移
        /* let width; let height; */
        !!fromrotate && ([this.width, this.height] = [this.height, this.width]);
        !!fromrotate && ([this.shapeWidth, this.shapeHeight] = [this.shapeHeight, this.shapeWidth]);
        // [this.image.width, this.image.height] = [this.image.height, this.image.width];
        let s = 1;
        if (this.angle == 90) {
            s = Math.max(Ktu.ktuData.other.width / this.image.height, Ktu.ktuData.other.height / this.image.width);
            this.image.scaleX = s;
            this.image.scaleY = s;
            this.left = this.height * this.scaleY;
            this.top = 0;
        } else if (this.angle == 270) {
            s = Math.max(Ktu.ktuData.other.width / this.image.height, Ktu.ktuData.other.height / this.image.width);
            this.image.scaleX = s;
            this.image.scaleY = s;
            this.left = 0;
            this.top = this.width * this.scaleX;
        } else if (this.angle == 180) {
            s = Math.max(Ktu.ktuData.other.width / this.image.width, Ktu.ktuData.other.height / this.image.height);
            this.image.scaleX = s;
            this.image.scaleY = s;
            this.left = this.width * this.scaleX;
            this.top = this.height * this.scaleY;
        } else {
            s = Math.max(Ktu.ktuData.other.width / this.image.width, Ktu.ktuData.other.height / this.image.height);
            this.image.scaleX = s;
            this.image.scaleY = s;
            this.left = 0;
            this.top = 0;
        }
        this.image.left = -(this.image.width * this.image.scaleY - this.width * this.scaleX) / 2;
        this.image.top = -(this.image.height * this.image.scaleY - this.height * this.scaleY) / 2;
        this.dirty = true;
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
        let flipStr = '';
        if (this.flipX) {
            flipStr += `matrix(-1,0,0,1,${this.width},0) `;
        }
        if (this.flipY) {
            flipStr += `matrix(1,0,0,-1,0,${this.height})`;
        }
        return flipStr;
    }
    toSvg(isAllInfo, useBasePath) {
        let g = '';
        let svgHtml = '';
        const flipStr = this.getFlip();
        const gStyle = isAllInfo ? `transform="translate(${this.left} ${this.top}) rotate(${this.angle}) ${flipStr} scale(${this.scaleX} ${this.scaleY})" opacity="${this.opacity}"` : `transform="${flipStr}"`;

        // 有背景图片时加个白色背景
        const isNeedExchange = this.angle === 90 || this.angle === 270;
        const rectStr = `<rect style="fill: #fff;"  width="${isNeedExchange ? this.height : this.width}" height="${isNeedExchange ? this.width :  this.height}"></rect>`;

        const {
            image,
        } = this;
        const bgStyleStr = Ktu.element.getRgb('fill', this.backgroundColor, this).str;
        const clip = `<rect x="0" y="0" width="${this.width}" height="${this.height}"/>`;
        // svg 内容
        if (!image) {
            g = `<defs>
                    <clipPath id="CLIPID_0">
                        ${clip}
                    </clipPath>
                </defs>
                <defs>${Ktu.element.getGradient('fill', this.backgroundColor, this)}</defs>
                <g type="background">
                    ${rectStr}
                    <g  ${gStyle}>
                        <g clip-path="url(#CLIPID_0)">
                            <rect style="${bgStyleStr}"  width="${this.width}" height="${this.height}"></rect>
                        </g>
                    </g>
                </g> `;
        } else {
            const src = useBasePath ? this.base64 : image.src;
            const imageWidth = image.width * image.scaleX;
            const imageHeight = image.height * image.scaleY;
            const filterStr = this.getFiltersDefs();
            const filterId = `filter_${this.objectId}`;
            g = `
            <defs>
                <clipPath id="CLIPID_0">
                ${clip}
                </clipPath>
            </defs>
            ${filterStr}
            <g type="background">
            ${rectStr}
            <g  ${gStyle}>
                    <g clip-path="url(#CLIPID_0)" ${filterStr ? `filter="url(#${filterId})"` : ''}>
                        <image imageid="${image.fileId}" preserveAspectRatio="none" crossOrigin="anonymous" objectid="${this.objectId}" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="${src}" width="${imageWidth}" height="${imageHeight}" transform="translate(${image.left} ${image.top})"></image>
                    </g>
                </g>
            </g>`;
            // }
        }
        svgHtml = g;
        if (!isAllInfo) {
            svgHtml = `
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"
                    width="${this.width * this.scaleX}" height="${this.height * this.scaleY}"
                    viewBox="0 0 ${this.width} ${this.height}" xml:space="preserve"  preserveAspectRatio="none">
                    ${g}
                </svg>`;
        }
        return svgHtml;
    }
    setBackGround(source, callback) {
        this.saveState();
        if (typeof source == 'string') {
            this.image = null;
            this.backgroundColor = source;
            this.dirty = true;
            callback && callback();
        } else {
            this.setBackgroundObject(source);
        }

        this.modifiedState();
    }
    // 增加一个参数是否进行历史记录保存
    clearBackground(saveHistory = true) {
        saveHistory && this.saveState();
        this.opacity = 1;
        this.image = null;
        this.dirty = true;
        this.left = 0;
        this.top = 0;
        this.angle = 0;
        this.width = Ktu.ktuData.other.width;
        this.height = Ktu.ktuData.other.height;
        saveHistory && this.modifiedState();
    }
    setBackgroundObject(imgObj) {
        if (imgObj) {
            this.opacity = 1;
            this.flipX = false;
            this.flipY = false;
            this.angle = 0;
            this.canCollect = imgObj.canCollect === undefined ? false : imgObj.canCollect;
            this.isCollect = imgObj.isCollect === undefined ? false : imgObj.isCollect;
            this.category = imgObj.category === undefined ? this.category : imgObj.category;
            this.width = Ktu.ktuData.other.width;
            this.height = Ktu.ktuData.other.height;
            this.shapeWidth = Ktu.ktuData.other.width;
            this.shapeHeight = Ktu.ktuData.other.height;
            this.left = 0;
            this.top = 0;
            this.scaleX = 1;
            this.scaleY = 1;
            const s = Math.max(Ktu.ktuData.other.width / imgObj.width, Ktu.ktuData.other.height / imgObj.height);
            imgObj.width = imgObj.width * s;
            imgObj.height = imgObj.height * s;
            imgObj.scaleX = 1;
            imgObj.scaleY = 1;

            // 设置背景图片垂直水平居中
            imgObj.left = -(imgObj.width * imgObj.scaleX - this.width * this.scaleX) / 2;
            imgObj.top = -(imgObj.height * imgObj.scaleY - this.height * this.scaleY) / 2;
            this.image = imgObj;
            this.backgroundColor = '#fff';
            this.get160src();
            this.getBase64();
            this.loadOriginImg();
            this.dirty = true;
        }
    }
    backgroundToImage() {
        const object = {
            type: 'backgroundToImage',
        };
        Ktu.element.addModule('image', object);
        this.hasChange = true;
    }
    // 页面大小更改时重新计算背景图片的大小
    refreshImage() {
        return new Promise((resolve, reject) => {
            if (!this.image || !this.image.src) {
                this.dirty = true;
                resolve();
                return;
            }
            const tmpImg = new Image();
            // tmpImg.setAttribute("crossorigin", Ktu.utils.getCrossOriginByBrowser());
            tmpImg.src = this.image.src;
            tmpImg.onload = event => {
                const {
                    target,
                } = event;
                const imgObj = this.image;
                const s = Math.max(Ktu.ktuData.other.width / target.width, Ktu.ktuData.other.height / target.height);
                imgObj.width = target.width * s;
                imgObj.height = target.height * s;
                imgObj.scaleX = 1;
                imgObj.scaleY = 1;
                // 设置背景图片垂直水平居中
                imgObj.left = -(imgObj.width - this.width) / 2;
                imgObj.top = -(imgObj.height - this.height) / 2;
                this.dirty = true;
                resolve();

                this.setImageCenter();
            };
            tmpImg.onerror = event => {
                reject();
            };
        });
    }
    enterClipMode() {
        Ktu.imageClip.setClipObj(this);
        this.saveState();
    }
    exitClipMode(isSave) {
        Ktu.imageClip.exitClip(isSave);
        if (!!isSave) {
            this.modifiedState();
        }
    }
    toObject() {
        const elementObj = TheElement.toObject(this);

        const image = _.cloneDeep(this.image);
        if (image) {
            image.src = image.originalSrc || image.src;
        }
        return _.assignIn(elementObj, {
            image,
            cropScaleX: this.cropScaleX,
            cropScaleY: this.cropScaleY,
            shapeWidth: this.shapeWidth,
            shapeHeight: this.shapeHeight,
            backgroundColor: this.backgroundColor,
            imageZoomAdd: this.imageZoomAdd,
            filters: this.filters.toObject(),
        });
    }
    onDoubleClick() {
        if (this.image && !this.isClipping) {
            this.enterClipMode();
        }
    }
};
