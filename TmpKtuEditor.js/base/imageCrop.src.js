class ImageClip {
    constructor(obj) {
        this.cw = obj.cw || 500;
        this.ch = obj.ch || 500;
        this.container = obj.container;
        this.imageShapeBox = {
            left: 0,
            top: 0,
            width: 0,
            height: 0,
        };
        this.imageSrc = '';
        this.angle = 0;
        this.clipObj = {};
        this.el = null;
        this.isClipping = false;
        this.hasInit = false;
        this.imageBox = {
            left: 50,
            top: 50,
            width: 50,
            height: 50,
        };
        this.img = new Image();
        this.acrossMap = {
            tl: 'br',
            tr: 'bl',
            br: 'tl',
            bl: 'tr',
            mt: 'mb',
            mr: 'ml',
            mb: 'mt',
            ml: 'mr',
        };
        this.taregt = '';
        this.control = '';
        this.minWidth = 10;
        this.minHeight = 10;
        this.scaleX = 1;
        this.scaleY = 1;
    }

    init() {
        this.el = document.getElementById(this.container);
        this.el.addEventListener('mousedown', this.mousedown.bind(this));
        window.addEventListener('mousemove', this.mousemove.bind(this));
        window.addEventListener('mouseup', this.mouseup.bind(this));
        this.hasInit = true;
    }
    // 快速裁切比例
    setCropScale(percent) {
        const w = this._startImageShapeBox.width;
        const h = this._startImageShapeBox.height;

        // 算出imageShape未旋转之前的坐标
        const { center } = this.imageShapeBoxCoords;
        const radian = this.angle * Math.PI / 180;
        const angleCos = Math.cos(-radian);
        const angleSin = Math.sin(-radian);
        const imageShapeToCenter = {
            x: this._startImageShapeBox.left - center.x,
            y: this._startImageShapeBox.top - center.y,
        };

        let originImageShapeLeft = imageShapeToCenter.x * angleCos - imageShapeToCenter.y * angleSin;
        let originImageShapeTop = imageShapeToCenter.x * angleSin + imageShapeToCenter.y * angleCos;

        originImageShapeLeft += ((1 - percent) * w) / 2;
        originImageShapeTop += ((1 - percent) * h) / 2;

        const _left = originImageShapeLeft * Math.cos(radian) - originImageShapeTop * Math.sin(radian) + center.x;
        const _top = originImageShapeLeft * Math.sin(radian) + originImageShapeTop * Math.cos(radian) + center.y;
        this.imageShapeBox.left = _left;
        this.imageShapeBox.top = _top;
        this.imageShapeBox.width = percent * w;
        this.imageShapeBox.height = percent * h;

        let {
            left,
            top,
        } = this.getImageTl();
        // translate

        left -= ((1 - percent) * w) / 2;
        top -= ((1 - percent) * h) / 2;
        this.setImageAngleTl({
            left,
            top,
        });
    }
    setClipObj(obj) {
        this.isClipping = true;
        /* if(!this.hasInit){
           this.init();
           } */
        this.clipObj = obj;
        this.clipObj.isClipMode = true;
        this.imageSrc = obj.image.originalSrc;
        this.angle = obj.angle || obj.imageAngle || 0;
        this.strokeLeftTop();
        // initImageShapeBox
        this.initImageShapeBox();
        // initImageBox
        this.setImageShapeBoxCoords();
        //
        this.initImageBox();
        //
        this.setImageBoxCoords();

        // 首次进入裁切，快速裁切至0.8比例
        if (!this.clipObj.noResizeViewport && !this.clipObj.hasCrop && this.clipObj.cropScaleX == 1 && this.clipObj.cropScaleY == 1 && (this.clipObj.type == 'cimage' || this.clipObj.type == 'map') && !this.clipObj.isInContainer) {
            this.setCropScale(1);
        }
        //
        this.clipObj.imageZoomAdd = Math.min(this.imageBox.width / this.imageShapeBox.width, this.imageBox.height / this.imageShapeBox.height) - 1;
        this.clipObj.imageZoomAdd = this.clipObj.imageZoomAdd < 0 ? 0 : this.clipObj.imageZoomAdd;
    }
    // 描边时top，left值实际是描边区域的top,left值，不是实际图片的位置，所以需要处理top ,left值
    strokeLeftTop() {
        const { center } = this.clipObj.coords;

        const toCenter = {
            x: this.clipObj.left - center.x,
            y: this.clipObj.top - center.y,
        };
        const radian = this.angle * Math.PI / 180;
        const angleCos = Math.cos(-radian);
        const angleSin = Math.sin(-radian);

        const originLeft = toCenter.x * angleCos - toCenter.y * angleSin;
        const originTop = toCenter.x * angleSin + toCenter.y * angleCos;

        const originstrokeTop = originTop + this.clipObj.strokeWidth / 2;
        const originstrokeLeft = originLeft + this.clipObj.strokeWidth / 2;
        this.strokeLeft = originstrokeLeft * Math.cos(radian) - originstrokeTop * Math.sin(radian) + center.x - this.clipObj.left,
        this.strokeTop = originstrokeLeft * Math.sin(radian) + originstrokeTop * Math.cos(radian) + center.y - this.clipObj.top;
    }
    initImageShapeBox() {
        this.imageShapeBox.left = this.strokeLeft + this.clipObj.left;
        this.imageShapeBox.top = this.strokeTop + this.clipObj.top;
        this.imageShapeBox.width = this.clipObj.width * this.clipObj.scaleX;
        this.imageShapeBox.height = this.clipObj.height * this.clipObj.scaleY;
        /* 整个元素缩放值 将shapeW 显示在imageBox.w这个大小上 旧shapeWidth!=this.clipObj.width   新 this.clipObj.shapeWidth = this.imageShapeBox.width
           this.clipObj.scale */
        if (this.clipObj.type == 'cimage' || this.clipObj.type === 'map') {
            this.scaleX = this.imageShapeBox.width / this.clipObj.shapeWidth;
            this.scaleY = this.imageShapeBox.height / this.clipObj.shapeHeight;
        } else if (this.clipObj.type == 'path-group') {
            this.scaleX = this.clipObj.scaleX;
            this.scaleY = this.clipObj.scaleY;
        } else {
            this.scaleX = 1;
            this.scaleY = 1;
        }
        this._startImageShapeBox = _.clone(this.imageShapeBox);
    }
    // 初始化image 将image的top left 转成乘角度之后的top left
    initImageBox() {
        const radian = this.angle * Math.PI / 180;
        /* const angleCos = Math.cos(radian);
           const angleSin = Math.sin(radian);
           const _left = this.clipObj.image.left * angleCos - this.clipObj.image.top * angleSin;
           const _top = this.clipObj.image.left * angleSin + this.clipObj.image.top * angleCos;
           const line = Math.sqrt(Math.pow((this.clipObj.image.left * this.scaleX), 2) + Math.pow((this.clipObj.image.top * this.scaleY), 2));
           const includedAngle1 = Math.atan((this.clipObj.image.top * this.scaleY) / (this.clipObj.image.left * this.scaleX)) || 0;
           const angleOffset1 = includedAngle1 + radian;
           const angleCos = Math.cos(angleOffset1);
           const angleSin = Math.sin(angleOffset1); */
        let _top = 0;
        let _left = 0;

        // 先算出imageShapeBox 未旋转之前的坐标
        const { center } = this.imageShapeBoxCoords;

        const toCenter = {
            x: this.imageShapeBox.left - center.x,
            y: this.imageShapeBox.top - center.y,
        };

        /* const originTop = toCenter.y * Math.cos(radian) - toCenter.x * Math.sin(radian);
           const originLeft = (toCenter.x + originTop * Math.sin(radian)) / Math.cos(radian); */
        const angleCos = Math.cos(-radian);
        const angleSin = Math.sin(-radian);

        const originLeft = toCenter.x * angleCos - toCenter.y * angleSin;
        const originTop = toCenter.x * angleSin + toCenter.y * angleCos;

        // 算出imageBox未旋转之前的坐标
        const originImageTop = originTop + this.clipObj.image.top * this.scaleY;
        const originImageLeft = originLeft + this.clipObj.image.left * this.scaleX;

        _left = originImageLeft * Math.cos(radian) - originImageTop * Math.sin(radian) + center.x,
        _top = originImageLeft * Math.sin(radian) + originImageTop * Math.cos(radian) + center.y;

        _left -= this.imageShapeBox.left;
        _top -= this.imageShapeBox.top;

        this.imageBox.left = _left;
        this.imageBox.top = _top;
        this.imageBox.width = this.clipObj.image.width * this.clipObj.image.scaleX * this.scaleX;
        this.imageBox.height = this.clipObj.image.height * this.clipObj.image.scaleY * this.scaleY;
        this._startImageBox = _.clone(this.imageBox);
    }
    setImageBoxCoords() {
        const top = this.imageBox.top + this.imageShapeBox.top;
        const left = this.imageBox.left + this.imageShapeBox.left;
        const { width } = this.imageBox;
        const { height } = this.imageBox;
        const radian = this.angle * Math.PI / 180;
        const tl = {
            x: left,
            y: top,
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
        const center = {
            x: (tl.x + br.x) / 2,
            y: (tl.y + br.y) / 2,
        };
        this.imageBoxCoords = {
            tl,
            tr,
            bl,
            br,
            center,
        };
        const keys = Object.keys(this.imageBoxCoords);
        const arrX = [];
        keys.forEach(k => {
            arrX.push(this.imageBoxCoords[k].x);
        });
        const minX = Math.min(...arrX);
        const maxX = Math.max(...arrX);
        this.imageBoxCoords.limitX = [minX, maxX];
    }
    setImageShapeBoxCoords() {
        const { top } = this.imageShapeBox;
        const { left } = this.imageShapeBox;
        const { width } = this.imageShapeBox;
        const { height } = this.imageShapeBox;
        const radian = this.angle * Math.PI / 180;
        const tl = {
            x: left,
            y: top,
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
        const center = {
            x: (tl.x + br.x) / 2,
            y: (tl.y + br.y) / 2,
        };
        this.imageShapeBoxCoords = {
            tl,
            tr,
            bl,
            br,
            center,
        };
        const keys = Object.keys(this.imageShapeBoxCoords);
        const arrX = [];
        keys.forEach(k => {
            arrX.push(this.imageShapeBoxCoords[k].x);
        });
        const minX = Math.min(...arrX);
        const maxX = Math.max(...arrX);
        this.imageShapeBoxCoords.limitX = [minX, maxX];
    }
    // 计算边界时，用没旋转的topleft 算，然后再转成旋转的top left
    setImageAngleTl(param) {
        const radian = this.angle * Math.PI / 180;
        let _top = 0;
        let _left = 0;

        // 先算出imageShapeBox 未旋转之前的坐标
        const { center } = this.imageShapeBoxCoords;
        const toCenter = {
            x: this.imageShapeBox.left - center.x,
            y: this.imageShapeBox.top - center.y,
        };

        /* const originTop = toCenter.y * Math.cos(radian) - toCenter.x * Math.sin(radian);
           const originLeft = (toCenter.x + originTop * Math.sin(radian)) / Math.cos(radian); */

        const angleCos = Math.cos(-radian);
        const angleSin = Math.sin(-radian);

        const originLeft = toCenter.x * angleCos - toCenter.y * angleSin;
        const originTop = toCenter.x * angleSin + toCenter.y * angleCos;
        // 算出imageBox未旋转之前的坐标
        const originImageTop = originTop + param.top;
        const originImageLeft = originLeft + param.left;

        _left = originImageLeft * Math.cos(radian) - originImageTop * Math.sin(radian) + center.x,
        _top = originImageLeft * Math.sin(radian) + originImageTop * Math.cos(radian) + center.y;

        _left -= this.imageShapeBox.left;
        _top -= this.imageShapeBox.top;

        this.imageBox.left = _left;
        this.imageBox.top = _top;
    }
    findCorner(event) {
        const paths = event.path || (event.composedPath && event.composedPath());
        for (const path of paths) {
            // 选中resize点
            if (path.getAttribute && path.getAttribute('data-control')) {
                this.target = path.getAttribute('data-target');
                this.control = path.getAttribute('data-control');
                return {
                    control: path.getAttribute('data-control'),
                    target: path.getAttribute('data-target'),
                };
            }
        }
    }
    mousedown(event) {
        this.start = {
            x: event.clientX,
            y: event.clientY,
        };
        this.findCorner(event);
        if (this.control) {
            this.canResize = true;
        } else {
            this.canMove = true;
            this.start.left = this.imageBox.left;
            this.start.top = this.imageBox.top;
        }
        // 左键mousedown
        const isLeftDown = 'which' in event ? event.which === 1 : event.button === 0;
        // 双击退出裁切
        const isDoubleClick = Date.now() - this.lastMouseDownTime < 350;
        isDoubleClick && isLeftDown && this.clipObj.exitClipMode(true);
        this.lastMouseDownTime = Date.now();
    }
    mousemove(event) {
        if (this.start) {
            if (this.canMove) {
                this.isMoving = true;
                this.translate(event);
            } else if (this.canResize) {
                this.isResizing = true;
                this.resize(event);
            }
        }
    }
    mouseup(event) {
        this.resetAll();
    }
    resize(event) {
        const { target } = this;
        if (target == 'imageShape') {
            this._resize(event, this.imageShapeBox);
            this.resizeImageShapeBorderLimit();
            this.setImageShapeBoxCoords();
        } else if (target == 'image') {
            this._resize(event, this.imageBox);
            this.resizeImageBorderLimit();
            this.setImageBoxCoords();
        }
    }
    _resize(event, target) {
        let currentControl = this.control;
        const includedAngle = Math.atan(target.height / target.width) * 180 / Math.PI;
        const controlAngleMap = {
            mr: 0,
            br: includedAngle,
            mb: 90,
            bl: 180 - includedAngle,
            ml: 180,
            tl: 180 + includedAngle,
            mt: 270,
            tr: 360 - includedAngle,
        };
        const { acrossMap } = this;
        const radian = this.angle * Math.PI / 180;
        const angleCos = Math.cos(radian);
        const angleSin = Math.sin(radian);
        let offsetX = (event.clientX - this.start.x) / Ktu.edit.scale;
        let offsetY = (event.clientY - this.start.y) / Ktu.edit.scale;
        const cornerList = currentControl.includes('m') ? ['mr', 'mb', 'ml', 'mt'] : ['br', 'bl', 'tl', 'tr'];
        let totalAngle = this.angle + controlAngleMap[currentControl];
        totalAngle < 0 && (totalAngle += 360);
        totalAngle >= 360 && (totalAngle -= 360);
        !totalAngle && (totalAngle = 0);
        const plusPosition = cornerList[Math.floor(totalAngle / 90)];
        const xSign = plusPosition.includes('r') ? 1 : -1;
        const ySign = plusPosition.includes('b') ? 1 : -1;
        offsetX *= xSign;
        offsetY *= ySign;

        /* 翻转修正
           offsetX = this.clipObj.flipX ? (-1 * offsetX) : offsetX;
           offsetY = this.clipObj.flipY ? (-1 * offsetY) : offsetY; */
        if (this.clipObj.flipY) {
            currentControl = currentControl.replace(/[tb]/, (s, s1) => {
                if (s == 'b') {
                    return 't';
                }
                return 'b';
            });
        }
        if (this.clipObj.flipX) {
            currentControl = currentControl.replace(/[lr]/, (s, s1) => {
                if (s == 'l') {
                    return 'r';
                }
                return 'l';
            });
        }
        /* if (Math.abs(offsetX) > 20) {
           offsetX = offsetX > 0 ? 20 : -20;
           }
           if (Math.abs(offsetY) > 20) {
           offsetY = offsetY > 0 ? 20 : -20;
           }
           如果是里面的框，缩放，计topleft值的时候，也需要改变imageBox的top left
           不等比例缩放 */
        if (currentControl.includes('m')) {
            if (acrossMap[currentControl] !== plusPosition && currentControl !== plusPosition) {
                [offsetX, offsetY] = [offsetY, offsetX];
            }
            const tmpOffsetX = offsetX < 0 ? -10 : 0;
            const tmpOffsetY = offsetY < 0 ? -10 : 0;
            if (currentControl === 'mr' || currentControl === 'ml') {
                if (currentControl === 'ml') {
                    if (this.target == 'imageShape') {
                        // 拿到点击缩放的这个点跟center去比较
                        const tmpLeft = target.left - offsetX * angleCos - target.height * angleSin / 2;
                        const tmpTop = target.top - offsetX * angleSin + target.height * angleCos / 2;
                        const line = Math.sqrt((tmpLeft - this.imageBoxCoords.center.x) ** 2 + (tmpTop - this.imageBoxCoords.center.y) ** 2);
                        const includedAngle1 = Math.atan((tmpTop - this.imageBoxCoords.center.y) / (tmpLeft - this.imageBoxCoords.center.x));
                        const angleOffset1 = includedAngle1 - radian;
                        const _x = Math.abs(line * Math.cos(angleOffset1)).roundToFixed(6);
                        const _y = Math.abs(line * Math.sin(angleOffset1)).roundToFixed(6);
                        const imageBoxWidth = this.imageBox.width.roundToFixed(6);
                        const imageBoxHeight = this.imageBox.height.roundToFixed(6);
                        if ((_x + tmpOffsetX <= imageBoxWidth / 2) && (_y + tmpOffsetY <= imageBoxHeight / 2) && (target.width + offsetX + tmpOffsetX > this.minWidth)) {
                            target.width += offsetX;
                            target.left -= offsetX * angleCos;
                            target.top -= offsetX * angleSin;
                            this.imageBox.left += offsetX * angleCos;
                            this.imageBox.top += offsetX * angleSin;
                        }
                    }
                } else {
                    const tmpLeft = target.left + target.width * angleCos + offsetX * angleCos - target.height * angleSin / 2;
                    const tmpTop = target.top + target.width * angleSin + offsetX * angleSin + target.height * angleCos / 2;
                    const line = Math.sqrt((tmpLeft - this.imageBoxCoords.center.x) ** 2 + (tmpTop - this.imageBoxCoords.center.y) ** 2);
                    const includedAngle1 = Math.atan((tmpTop - this.imageBoxCoords.center.y) / (tmpLeft - this.imageBoxCoords.center.x));
                    const angleOffset1 = includedAngle1 - radian;
                    const _x = Math.abs(line * Math.cos(angleOffset1)).roundToFixed(6);
                    const _y = Math.abs(line * Math.sin(angleOffset1)).roundToFixed(6);
                    const imageBoxWidth = this.imageBox.width.roundToFixed(6);
                    const imageBoxHeight = this.imageBox.height.roundToFixed(6);
                    if ((_x + tmpOffsetX <= imageBoxWidth / 2) && (_y + tmpOffsetY <= imageBoxHeight / 2) && (target.width + offsetX + tmpOffsetX > this.minWidth)) {
                        target.width += offsetX;
                    }
                }
            } else if (currentControl === 'mb' || currentControl === 'mt') {
                if (currentControl === 'mt') {
                    if (this.target == 'imageShape') {
                        const tmpLeft = target.left + target.width * angleCos + offsetY * angleSin;
                        const tmpTop = target.top + target.width * angleSin - offsetY * angleCos;
                        const line = Math.sqrt((tmpLeft - this.imageBoxCoords.center.x) ** 2 + (tmpTop - this.imageBoxCoords.center.y) ** 2);
                        const includedAngle1 = Math.atan((tmpTop - this.imageBoxCoords.center.y) / (tmpLeft - this.imageBoxCoords.center.x));
                        const angleOffset1 = includedAngle1 - radian;
                        const _x = Math.abs(line * Math.cos(angleOffset1)).roundToFixed(6);
                        const _y = Math.abs(line * Math.sin(angleOffset1)).roundToFixed(6);
                        const imageBoxWidth = this.imageBox.width.roundToFixed(6);
                        const imageBoxHeight = this.imageBox.height.roundToFixed(6);
                        if ((_x + tmpOffsetX <= imageBoxWidth / 2) && (_y + tmpOffsetY <= imageBoxHeight / 2) && (target.height + offsetY + tmpOffsetY > this.minHeight)) {
                            target.height += offsetY;
                            target.left += offsetY * angleSin;
                            target.top -= offsetY * angleCos;
                            this.imageBox.left += -offsetY * angleSin;
                            this.imageBox.top += offsetY * angleCos;
                        }
                    }
                } else {
                    const tmpLeft = target.left - target.height * angleSin + target.width * angleCos - offsetY * angleSin;
                    const tmpTop = target.top + target.height * angleCos + target.width * angleSin + offsetY * angleCos;
                    const line = Math.sqrt((tmpLeft - this.imageBoxCoords.center.x) ** 2 + (tmpTop - this.imageBoxCoords.center.y) ** 2);
                    const includedAngle1 = Math.atan((tmpTop - this.imageBoxCoords.center.y) / (tmpLeft - this.imageBoxCoords.center.x));
                    const angleOffset1 = includedAngle1 - radian;
                    const _x = Math.abs(line * Math.cos(angleOffset1)).roundToFixed(6);
                    const _y = Math.abs(line * Math.sin(angleOffset1)).roundToFixed(6);
                    const imageBoxWidth = this.imageBox.width.roundToFixed(6);
                    const imageBoxHeight = this.imageBox.height.roundToFixed(6);
                    if ((_x + tmpOffsetX <= imageBoxWidth / 2) && (_y + tmpOffsetY <= imageBoxHeight / 2) && (target.height + offsetY + tmpOffsetY > this.minHeight)) {
                        target.height += offsetY;
                    }
                }
            }
            // 等比例缩放
        } else {
            const originWHRatio = target.width / target.height;
            // 取偏移总和按比例均分
            offsetY = (offsetX + offsetY) / (1 + originWHRatio);
            offsetX = offsetY * originWHRatio;
            if (offsetX && offsetY) {
                if (currentControl === 'br') {
                    if (this.target == 'imageShape') {
                        // 当前top left 值到图片中心点的距离来判断是否在可以缩放的范围内
                        const tmpOffsetX = offsetX < 0 ? -1 : 0;
                        const tmpOffsetY = offsetY < 0 ? -1 : 0;
                        const tmpLeft = target.left + target.width * angleCos - target.height * angleSin + offsetX;
                        const tmpTop = target.top + target.width * angleSin + target.height * angleCos + offsetY;
                        const line = Math.sqrt((tmpLeft - this.imageBoxCoords.center.x) ** 2 + (tmpTop - this.imageBoxCoords.center.y) ** 2);
                        const includedAngle1 = Math.atan((tmpTop - this.imageBoxCoords.center.y) / (tmpLeft - this.imageBoxCoords.center.x));
                        const angleOffset1 = includedAngle1 - radian;
                        const _x = Math.abs(line * Math.cos(angleOffset1));
                        const _y = Math.abs(line * Math.sin(angleOffset1));
                        // 边界判定
                        const isOverMinWidth = target.width + offsetX + tmpOffsetX > this.minWidth;
                        const isOverMinHeight = target.height + offsetY + tmpOffsetY > this.minHeight;
                        if ((_x + tmpOffsetX < this.imageBox.width / 2) && (_y + tmpOffsetY < this.imageBox.height / 2) && isOverMinWidth && isOverMinHeight) {
                            target.width += offsetX;
                            target.height += offsetY;
                        }
                    } else {
                        const tmpOffsetX = offsetX > 0 ? 10 : 0;
                        const tmpOffsetY = offsetY > 0 ? 10 : 0;
                        //
                        const tmpLeft = this.imageShapeBox.left + target.left + target.width * angleCos - target.height * angleSin + offsetX;
                        const tmpTop = this.imageShapeBox.top + target.top + target.width * angleSin + target.height * angleCos + offsetY;
                        const line = Math.sqrt((tmpLeft - this.imageShapeBoxCoords.center.x) ** 2 + (tmpTop - this.imageShapeBoxCoords.center.y) ** 2);
                        const includedAngle1 = Math.atan((tmpTop - this.imageShapeBoxCoords.center.y) / (tmpLeft - this.imageShapeBoxCoords.center.x));
                        const angleOffset1 = includedAngle1 - radian;
                        const _x = Math.abs(line * Math.cos(angleOffset1));
                        const _y = Math.abs(line * Math.sin(angleOffset1));
                        // 边界判定
                        if ((_x + tmpOffsetX > this.imageShapeBox.width / 2) && (_y + tmpOffsetY > this.imageShapeBox.height / 2)) {
                            target.width += offsetX;
                            target.height += offsetY;
                        }
                    }
                } else if (currentControl === 'tl') {
                    const sideLength = Math.sqrt(offsetX ** 2 + offsetY ** 2);
                    const includedAngle = Math.atan(originWHRatio);
                    const angleOffset = includedAngle - radian;
                    const sign = offsetX < 0 ? -1 : 1;
                    if (this.target == 'imageShape') {
                        // 当前top left 值到图片中心点的距离来判断是否在可以缩放的范围内
                        const tmpOffsetX = offsetX < 0 ? -1 : 0;
                        const tmpOffsetY = offsetY < 0 ? -1 : 0;
                        const tmpLeft = target.left - sideLength * Math.sin(angleOffset) * sign;
                        const tmpTop = target.top - sideLength * Math.cos(angleOffset) * sign;
                        const line = Math.sqrt((tmpLeft - this.imageBoxCoords.center.x) ** 2 + (tmpTop - this.imageBoxCoords.center.y) ** 2);
                        const includedAngle1 = Math.atan((tmpTop - this.imageBoxCoords.center.y) / (tmpLeft - this.imageBoxCoords.center.x));
                        const angleOffset1 = includedAngle1 - radian;
                        const _x = Math.abs(line * Math.cos(angleOffset1));
                        const _y = Math.abs(line * Math.sin(angleOffset1));
                        // 边界判定
                        const isOverMinWidth = target.width + offsetX + tmpOffsetX > this.minWidth;
                        const isOverMinHeight = target.height + offsetY + tmpOffsetY > this.minHeight;
                        if ((_x + tmpOffsetX < this.imageBox.width / 2) && (_y + tmpOffsetY < this.imageBox.height / 2) && isOverMinWidth && isOverMinHeight) {
                            target.width += offsetX;
                            target.height += offsetY;
                            target.left -= sideLength * Math.sin(angleOffset) * sign;
                            target.top -= sideLength * Math.cos(angleOffset) * sign;
                        }
                    } else {
                        const tmpOffsetX = offsetX > 0 ? 10 : 0;
                        const tmpOffsetY = offsetY > 0 ? 10 : 0;
                        // 边界判定
                        const tmpLeft = this.imageShapeBox.left + target.left - sideLength * Math.sin(angleOffset) * sign;
                        const tmpTop = this.imageShapeBox.top + target.top - sideLength * Math.cos(angleOffset) * sign;
                        const line = Math.sqrt((tmpLeft - this.imageShapeBoxCoords.center.x) ** 2 + (tmpTop - this.imageShapeBoxCoords.center.y) ** 2);
                        const includedAngle1 = Math.atan((tmpTop - this.imageShapeBoxCoords.center.y) / (tmpLeft - this.imageShapeBoxCoords.center.x));
                        const angleOffset1 = includedAngle1 - radian;
                        const _x = Math.abs(line * Math.cos(angleOffset1));
                        const _y = Math.abs(line * Math.sin(angleOffset1));
                        // 边界判定
                        if ((_x + tmpOffsetX > this.imageShapeBox.width / 2) && (_y + tmpOffsetY > this.imageShapeBox.height / 2)) {
                            target.width += offsetX;
                            target.height += offsetY;
                            target.left -= sideLength * Math.sin(angleOffset) * sign;
                            target.top -= sideLength * Math.cos(angleOffset) * sign;
                        }
                    }
                } else if (currentControl === 'tr') {
                    if (this.target == 'imageShape') {
                        const tmpOffsetX = offsetX < 0 ? -1 : 0;
                        const tmpOffsetY = offsetY < 0 ? -1 : 0;
                        // 边界判定
                        const tmpLeft = target.left + offsetY * angleSin + target.width * angleCos;
                        const tmpTop = target.top - offsetY * angleCos + target.width * angleSin;
                        const line = Math.sqrt((tmpLeft - this.imageBoxCoords.center.x) ** 2 + (tmpTop - this.imageBoxCoords.center.y) ** 2);
                        const includedAngle1 = Math.atan((tmpTop - this.imageBoxCoords.center.y) / (tmpLeft - this.imageBoxCoords.center.x));
                        const angleOffset1 = includedAngle1 - radian;
                        const _x = Math.abs(line * Math.cos(angleOffset1));
                        const _y = Math.abs(line * Math.sin(angleOffset1));
                        // 边界判定
                        const isOverMinWidth = target.width + offsetX + tmpOffsetX > this.minWidth;
                        const isOverMinHeight = target.height + offsetY + tmpOffsetY > this.minHeight;
                        if ((_x + tmpOffsetX < this.imageBox.width / 2) && (_y + tmpOffsetY < this.imageBox.height / 2) && isOverMinWidth && isOverMinHeight) {
                            target.width += offsetX;
                            target.height += offsetY;
                            target.left -= -offsetY * angleSin;
                            target.top -= offsetY * angleCos;
                            this.imageBox.left += -offsetY * angleSin;
                            this.imageBox.top += offsetY * angleCos;
                        }
                    } else {
                        const tmpOffsetX = offsetX > 0 ? 10 : 0;
                        const tmpOffsetY = offsetY > 0 ? 10 : 0;
                        // 边界判定
                        const tmpLeft = this.imageShapeBox.left + target.left + offsetY * angleSin + target.width * angleCos;
                        const tmpTop = this.imageShapeBox.top + target.top - offsetY * angleCos + target.width * angleSin;
                        const line = Math.sqrt((tmpLeft - this.imageShapeBoxCoords.center.x) ** 2 + (tmpTop - this.imageShapeBoxCoords.center.y) ** 2);
                        const includedAngle1 = Math.atan((tmpTop - this.imageShapeBoxCoords.center.y) / (tmpLeft - this.imageShapeBoxCoords.center.x));
                        const angleOffset1 = includedAngle1 - radian;
                        const _x = Math.abs(line * Math.cos(angleOffset1));
                        const _y = Math.abs(line * Math.sin(angleOffset1));
                        // 边界判定
                        if ((_x + tmpOffsetX > this.imageShapeBox.width / 2) && (_y + tmpOffsetY > this.imageShapeBox.height / 2)) {
                            target.width += offsetX;
                            target.height += offsetY;
                            target.left -= -offsetY * angleSin;
                            target.top -= offsetY * angleCos;
                        }
                    }
                } else if (currentControl === 'bl') {
                    if (this.target == 'imageShape') {
                        const tmpOffsetX = offsetX < 0 ? -1 : 0;
                        const tmpOffsetY = offsetY < 0 ? -1 : 0;
                        // 边界判定
                        const tmpLeft = target.left - offsetX * angleCos - target.height * angleSin;
                        const tmpTop = target.top - offsetX * angleSin + target.height * angleCos;
                        const line = Math.sqrt((tmpLeft - this.imageBoxCoords.center.x) ** 2 + (tmpTop - this.imageBoxCoords.center.y) ** 2);
                        const includedAngle1 = Math.atan((tmpTop - this.imageBoxCoords.center.y) / (tmpLeft - this.imageBoxCoords.center.x));
                        const angleOffset1 = includedAngle1 - radian;
                        const _x = Math.abs(line * Math.cos(angleOffset1));
                        const _y = Math.abs(line * Math.sin(angleOffset1));
                        // 边界判定
                        const isOverMinWidth = target.width + offsetX + tmpOffsetX > this.minWidth;
                        const isOverMinHeight = target.height + offsetY + tmpOffsetY > this.minHeight;
                        if ((_x + tmpOffsetX < this.imageBox.width / 2) && (_y + tmpOffsetY < this.imageBox.height / 2) && isOverMinWidth && isOverMinHeight) {
                            target.width += offsetX;
                            target.height += offsetY;
                            target.left -= offsetX * angleCos;
                            target.top -= offsetX * angleSin;
                        }
                    } else {
                        const tmpOffsetX = offsetX > 0 ? 10 : 0;
                        const tmpOffsetY = offsetY > 0 ? 10 : 0;
                        // 边界判定
                        const tmpLeft = this.imageShapeBox.left + target.left - offsetX * angleCos - target.height * angleSin;
                        const tmpTop = this.imageShapeBox.top + target.top - offsetX * angleSin + target.height * angleCos;
                        const line = Math.sqrt((tmpLeft - this.imageShapeBoxCoords.center.x) ** 2 + (tmpTop - this.imageShapeBoxCoords.center.y) ** 2);
                        const includedAngle1 = Math.atan((tmpTop - this.imageShapeBoxCoords.center.y) / (tmpLeft - this.imageShapeBoxCoords.center.x));
                        const angleOffset1 = includedAngle1 - radian;
                        const _x = Math.abs(line * Math.cos(angleOffset1));
                        const _y = Math.abs(line * Math.sin(angleOffset1));
                        // 边界判定
                        if ((_x + tmpOffsetX > this.imageShapeBox.width / 2) && (_y + tmpOffsetY > this.imageShapeBox.height / 2)) {
                            target.top -= offsetX * angleSin;
                            target.left -= offsetX * angleCos;
                            target.width += offsetX;
                            target.height += offsetY;
                        }
                    }
                }
            }
        }
        this.start = {
            x: event.clientX,
            y: event.clientY,
        };
    }
    bglimit() {
        if (this.imageBox.width / this.imageShapeBox.width < this.imageBox.height / this.imageShapeBox.height) {
            if (this.imageBox.width > this.imageShapeBox.width * 5) {
                this.imageBox.width = this.imageShapeBox.width * 5;
                this.imageBox.height = this.imageBox.width / (this.clipObj.image.width / this.clipObj.image.height);
            }
        } else {
            if (this.imageBox.height > this.imageShapeBox.height * 5) {
                this.imageBox.height = this.imageShapeBox.height * 5;
                this.imageBox.width = this.imageBox.height * (this.clipObj.image.width / this.clipObj.image.height);
            }
        }
        if (this.imageBox.width < this.imageShapeBox.width) {
            this.imageBox.width = this.imageShapeBox.width;
            this.imageBox.height = this.imageBox.width / (this.clipObj.image.width / this.clipObj.image.height);
        } else if (this.imageBox.height < this.imageShapeBox.height) {
            this.imageBox.height = this.imageShapeBox.height;
            this.imageBox.width = this.imageBox.height * (this.clipObj.image.width / this.clipObj.image.height);
        }
        this.setImageAngleTl({
            left: -(this.imageBox.width - this.imageShapeBox.width) / 2,
            top: -(this.imageBox.height - this.imageShapeBox.height) / 2,
        });
    }
    setImageZoomAdd(value) {
        if (this.imageBox.width / this.imageShapeBox.width < this.imageBox.height / this.imageShapeBox.height) {
            this.imageBox.width = this.imageShapeBox.width * value;
            this.imageBox.height = this.imageBox.width / (this.clipObj.image.width / this.clipObj.image.height);
        } else {
            this.imageBox.height = this.imageShapeBox.height * value;
            this.imageBox.width = this.imageBox.height * (this.clipObj.image.width / this.clipObj.image.height);
        }

        this.bglimit();

        this.setImageBoxCoords();
    }
    setImageZoomAddWheel(value) {
        this.imageBox.width *= value;
        this.imageBox.height *= value;
        // 以最小边判断
        this.bglimit();
        this.clipObj.imageZoomAdd = Math.min(this.imageBox.width / this.imageShapeBox.width, this.imageBox.height / this.imageShapeBox.height) - 1;

        this.setImageBoxCoords();
    }
    resizeImageShapeBorderLimit() {
        // 四条直线方程，确定x之后有2个y值，就是边界
        this.imageShapeBox.left = Math.max(this.imageBoxCoords.limitX[0], this.imageShapeBox.left);
        this.imageShapeBox.left = Math.min(this.imageBoxCoords.limitX[1], this.imageShapeBox.left);
        const limitY = [];
        /* (y2-y1)x+(x1-x2)y+x2y1-x1y2=0
           y=(x1y2-x2y1-(y2-y1)x)/(x1-x2);
           tltr 直线 */
        const {
            tl,
            tr,
            bl,
            br,
        } = this.imageBoxCoords;
        const tltrLimitX = [tl.x, tr.x];
        if (tl.x != tr.x) {
            const tltrLimitY = (tl.x * tr.y - tr.x * tl.y - (tr.y - tl.y) * this.imageShapeBox.left) / (tl.x - tr.x);
            tltrLimitX.push(this.imageShapeBox.left);
            if (tltrLimitX.sort((a, b) => a - b)[1] == this.imageShapeBox.left && Math.abs(tltrLimitY) != Infinity) {
                limitY.push(tltrLimitY);
            }
        }
        // tlbl 直线
        const tlblLimitX = [tl.x, bl.x];
        if (tl.x != bl.x) {
            const tlblLimitY = (tl.x * bl.y - bl.x * tl.y - (bl.y - tl.y) * this.imageShapeBox.left) / (tl.x - bl.x);
            tlblLimitX.push(this.imageShapeBox.left);
            if (tlblLimitX.sort((a, b) => a - b)[1] == this.imageShapeBox.left && Math.abs(tlblLimitY) != Infinity) {
                limitY.push(tlblLimitY);
            }
        }
        // brbl 直线
        const brblLimitX = [br.x, bl.x];
        if (br.x != bl.x) {
            const brblLimitY = (br.x * bl.y - bl.x * br.y - (bl.y - br.y) * this.imageShapeBox.left) / (br.x - bl.x);
            brblLimitX.push(this.imageShapeBox.left);
            if (brblLimitX.sort((a, b) => a - b)[1] == this.imageShapeBox.left && Math.abs(brblLimitY) != Infinity) {
                limitY.push(brblLimitY);
            }
        }
        // brtr 直线
        const brtrLimitX = [br.x, tr.x];
        if (br.x != tr.x) {
            const brtrLimitY = (br.x * tr.y - tr.x * br.y - (tr.y - br.y) * this.imageShapeBox.left) / (br.x - tr.x);
            brtrLimitX.push(this.imageShapeBox.left);
            if (brtrLimitX.sort((a, b) => a - b)[1] == this.imageShapeBox.left && Math.abs(brtrLimitY) != Infinity) {
                limitY.push(brtrLimitY);
            }
        }
        limitY.sort((a, b) => a - b);
        this.imageShapeBox.top = Math.max(limitY[0], this.imageShapeBox.top);
        this.imageShapeBox.top = Math.min(limitY[1], this.imageShapeBox.top);
        /* left = Math.min(0, left);
           top = Math.min(0, top);
           left = Math.max(-this.imageBox.width, left);
           top = Math.max(-this.imageBox.height, top);
           var nowImageLeft = this.imageBox.left;
           var nowImageTop = this.imageBox.top; */
        this.imageBox.left = this.imageBoxCoords.tl.x - this.imageShapeBox.left;
        this.imageBox.top = this.imageBoxCoords.tl.y - this.imageShapeBox.top;
        const {
            left,
            top,
        } = this.getImageTl();
        // 宽高不能超过图片宽高
        this.imageShapeBox.height = Math.min(this.imageShapeBox.height, this.imageBox.height + top);
        this.imageShapeBox.width = Math.min(this.imageShapeBox.width, this.imageBox.width + left);
    }
    resizeImageBorderLimit() {
        let {
            left,
            top,
        } = this.getImageTl();

        /* //imageBox
           var _top = 0;
           var _left = 0;
           const radian = this.angle * Math.PI / 180;
           // 先算出imageShapeBox 未旋转之前的坐标
           const center = this.imageShapeBoxCoords.center; */

        /* const toCenter = {
           x: this.imageShapeBox.left - center.x,
           y: this.imageShapeBox.top - center.y
           };
           const originTop = toCenter.y * Math.cos(radian) - toCenter.x * Math.sin(radian);
           const originLeft = (toCenter.x + originTop * Math.sin(radian)) / Math.cos(radian); */

        // console.log(left,originLeft)
        left = Math.min(left, 0);
        top = Math.min(top, 0);

        // 宽高不能超过图片宽高
        if ((this.imageShapeBox.height - top).roundToFixed(6) > this.imageBox.height.roundToFixed(6)) {
            this.imageBox.height = this.imageShapeBox.height - top;
            this.imageBox.width = this.imageBox.height * (this.clipObj.image.width / this.clipObj.image.height);
        } else if ((this.imageShapeBox.width - left).roundToFixed(6) > this.imageBox.width.roundToFixed(6)) {
            this.imageBox.width = this.imageShapeBox.width - left;
            this.imageBox.height = this.imageBox.width / (this.clipObj.image.width / this.clipObj.image.height);
        }
        /* this.imageBox.height = Math.max(this.imageShapeBox.height - top, this.imageBox.height);
           // console.log(this.imageBox.height)
           this.imageBox.width = Math.max(this.imageShapeBox.width - left ,this.imageBox.width); */
    }
    translate(event) {
        let offsetX = (event.clientX - this.start.x) / Ktu.edit.scale;
        let offsetY = (event.clientY - this.start.y) / Ktu.edit.scale;
        //  翻转修正
        offsetX = this.clipObj.flipX ? (-1 * offsetX) : offsetX;
        offsetY = this.clipObj.flipY ? (-1 * offsetY) : offsetY;

        this.imageBox.left = this.start.left + offsetX;
        this.imageBox.top = this.start.top + offsetY;
        this.translateBorderLimit();
        this.setImageBoxCoords();
    }
    translateBorderLimit() {
        // 计算边界时，用没旋转的topleft 算，然后再转成旋转的top left
        let {
            left,
            top,
        } = this.getImageTl();
        // translate
        left = Math.min(0, left);
        top = Math.min(0, top);

        left = Math.max(this.imageShapeBox.width - this.imageBox.width, left);
        top = Math.max(this.imageShapeBox.height - this.imageBox.height, top);

        this.setImageAngleTl({
            left,
            top,
        });
    }
    getImageTl() {
        // 逆变换
        const radian = this.angle * Math.PI / 180;

        let _top = 0;
        let _left = 0;

        // 先算出imageBox 的坐标
        _left = this.imageBox.left + this.imageShapeBox.left;
        _top = this.imageBox.top + this.imageShapeBox.top;

        // 算出imageBox相对于中心点坐标
        const { center } = this.imageShapeBoxCoords;
        const imageToCenter = {
            x: _left - center.x,
            y: _top - center.y,
        };
        const angleCos = Math.cos(-radian);
        const angleSin = Math.sin(-radian);

        const originImageLeft = imageToCenter.x * angleCos - imageToCenter.y * angleSin + center.x;
        const originImageTop = imageToCenter.x * angleSin + imageToCenter.y * angleCos + center.y;

        /* 算出imageBox未旋转之前的坐标
           const originImageTop = imageToCenter.y * Math.cos(radian) - imageToCenter.x * Math.sin(radian) + center.y;
           const originImageLeft = (imageToCenter.x + originImageTop * Math.sin(radian)) / Math.cos(radian) + center.x; */

        // 算出imageShapeBox未旋转之前的坐标

        const imageShapeToCenter = {
            x: this.imageShapeBox.left - center.x,
            y: this.imageShapeBox.top - center.y,
        };

        const originImageShapeLeft = imageShapeToCenter.x * angleCos - imageShapeToCenter.y * angleSin + center.x;
        const originImageShapeTop = imageShapeToCenter.x * angleSin + imageShapeToCenter.y * angleCos + center.y;

        /* const originImageShapeTop = imageShapeToCenter.y * Math.cos(radian) - imageShapeToCenter.x * Math.sin(radian) + center.y;
           const originImageShapeLeft = (imageShapeToCenter.x + originImageShapeTop * Math.sin(radian)) / Math.cos(radian) + center.x; */

        _left = originImageLeft - originImageShapeLeft;
        _top = originImageTop - originImageShapeTop;
        return {
            left: _left,
            top: _top,
        };
    }
    resetAll() {
        this.canMove = false;
        this.isMoving = false;
        this.canResize = false;
        this.isResizing = false;
        this.control = '';
        this.taregt = '';
        this.start = null;
        this.end = null;
    }
    saveClip() {
        const imgaeTL = this.getImageTl();
        const imageX = imgaeTL.left / this.scaleX;
        const imageY = imgaeTL.top / this.scaleY;
        this.clipObj.image.left = imageX;
        this.clipObj.image.top = imageY;
        const imageScaleX = this.imageBox.width / this._startImageBox.width;
        const imageScaleY = this.imageBox.height / this._startImageBox.height;
        this.clipObj.image.scaleX *= imageScaleX;
        this.clipObj.image.scaleY *= imageScaleY;
        const imageShapeScaleX = this.imageShapeBox.width / this._startImageShapeBox.width;
        const imageShapeScaleY = this.imageShapeBox.height / this._startImageShapeBox.height;
        this.clipObj.left = this.imageShapeBox.left - this.strokeLeft;
        this.clipObj.top = this.imageShapeBox.top - this.strokeTop;
        this.clipObj.scaleX *= imageShapeScaleX;
        this.clipObj.scaleY *= imageShapeScaleY;
        this.clipObj.cropScaleX *= imageShapeScaleX;
        this.clipObj.cropScaleY *= imageShapeScaleY;
        this.clipObj.shapeWidth *= imageShapeScaleX;
        this.clipObj.shapeHeight *= imageShapeScaleY;
        this.clipObj.dirty = true;
        this.clipObj.setCoords();
    }
    // 退出裁切时清空
    exitClip(isSave) {
        this.resetAll();

        if (!!isSave) {
            this.saveClip();
        }

        this.clipObj.isClipMode = false;
        this.clipObj.noResizeViewport = false;
        this.isClipping = false;
    }
};
