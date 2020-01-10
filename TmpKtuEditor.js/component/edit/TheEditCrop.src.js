Vue.component('edit-clip', {
    mixins: [Ktu.mixins.dataHandler],
    template: `
    <div v-show="isShowBox"  id="clipContainer" class="img-clip" ref="clipContainer"  @wheel.prevent="inputWheel($event)">
        <div class="viewPort" :style="imageShapeBoxStyle" v-if="isShowBox">
            <div class="inner" :style="imageShapeBoxWH" v-html="viewPortHtml"></div>

            <svg v-if="!selectedObj.isInContainer" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="100%" height="100%" class="shape-box-controls box-controls">
                <!--<path v-for="(control, index) in controlsm" v-if="isImageShapeResize" :data-control="control" data-target = "imageShape" class="shape-box-control box-control" :d="getShapeControlPath(control)" :style="{cursor: getCursor(control)}" :class="{pressed: control === imageClip.control && imageClip.target =='imageShape'}" />-->
                <g :transform="getTransform(control)" fill="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" v-for="(control, index) in controlsm" v-if="isImageShapeResize" :data-control="control" data-target = "imageShape" class="shape-box-control box-control" :style="{cursor: getCursor(control)}" :class="{pressed: control === imageClip.control && imageClip.target =='imageShape'}" v-html="getPath(control)">
                </g>
            </svg>

            <svg xmlns="http://www.w3.org/2000/svg"     xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="100%" height="100%" class="shape-box-controls box-controls" style="z-index:999">
                <g class="border-box">
                    <g class="eleBorder" transform="translate(0.5 0.5)">
                        <path class="border-line black" :d="imageShapeLinePath" />
                        <path class="border-line white" :d="imageShapeLinePath" />
                    </g>
                </g>
            </svg>
        </div>
        <div class="imageBox" :style="imageBoxStyleAbs" v-if="isShowBox" >
            <div class="mask"></div>
            <div style="height: 100%;" v-html="imageBoxHtml"></div>
            <svg xmlns="http://www.w3.org/2000/svg"    xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="100%" height="100%" class="shape-box-controls box-controls">
            <path v-for="(control, index) in controls"  :data-control="control" data-target = "image" class="box-control" :d="getControlPath(control,true)" :style="{cursor: getCursor(control)}" :class="{pressed: control === imageClip.control && imageClip.target =='image'}"/>
            <g class="border-box">
                <g class="eleBorder" transform="translate(0.5 0.5)">
                    <path class="border-line black" :d="imageLinePath" />
                    <path class="border-line white" :d="imageLinePath" />
                </g>
            </g>
            </svg>
        </div>
        <div class="containerMask" :style="containerMaskStyle" v-if="isShowBox"></div>
        <div class="crop-bar" :style="barStyleAbs" v-if="isShowBox && !isMoving && imageClip.clipObj.type !='background'">
            <div class="crop-btn sure" @click="sure">
                <svg><use xlink:href="#svg-tool-sure"></use></svg>
            </div>
            <div class="crop-btn cancel" @click="exit">
                <svg><use xlink:href="#svg-tool-exit"></use></svg>
            </div>
        </div>
    </div>`,
    // <img :src="imageSrc" :style="imageBoxStyleRel"/>

    data() {
        return {
            picCrop: null,
            // controls: ['tl', 'tr', 'br', 'bl'],
            controlsm: ['tl', 'tr', 'br', 'bl', 'mt', 'mr', 'mb', 'ml'],
            controlSize: 14,
            imageShapeBoxBasis: {},
            imageBoxBasis: {},
            coordsDistance: {},
        };
    },
    computed: {
        selectedObj() {
            if (this.selectedData) {
                if (this.selectedData.type === 'imageContainer') {
                    return this.selectedData.objects[0];
                }
                return this.selectedData;
            }
        },
        selectedDataObj() {
            return this.selectedData;
        },
        imageClipPath() {
            let _clipPath = '';
            if (this.selectedObj.isInContainer || this.selectedObj.type == 'path-group' || this.selectedObj.type == 'map') {
                _clipPath = this.selectedObj.getClipPath(true);
            }
            return _clipPath;
        },
        imageClipId() {
            let _clipId = '';
            if (this.selectedObj.isInContainer || this.selectedObj.type == 'path-group' || this.selectedObj.type == 'map') {
                _clipId = `url(#clipPath_${this.selectedObj.clipId}_clip)`;
            }
            return _clipId;
        },
        /* imageClipPathStyle(){
           var clipShapeInfo = this.selectedData.clipshapeInfo;
           var scaleX =  (this.selectedData.width*this.selectedData.scaleX)/ clipShapeInfo.w;
           var scaleY =  (this.selectedData.height*this.selectedData.scaleY)/ clipShapeInfo.h;
           return {
           transform:`translate(${-clipShapeInfo.left}px,${-clipShapeInfo.top}px) scale(${scaleX},${scaleY})`
           }
           }, */
        filterAttr() {
            return this.imageFilterDefs ? `url(#filter_crop_${this.selectedObj.objectId})` : 'none';
        },
        flipStr() {
            let flipStr = '';
            if (this.selectedData.flipX) {
                flipStr += `matrix(-1,0,0,1,${this.imageBox.width * this.scale},0)`;
            }
            if (this.selectedData.flipY) {
                flipStr += `matrix(1,0,0,-1,0,${this.imageBox.height * this.scale})`;
            }
            return flipStr;
        },
        flipStr1() {
            let flipStr = '';
            if (this.selectedData.flipX) {
                flipStr += `matrix(-1,0,0,1,0,0)`;
            }
            if (this.selectedData.flipY) {
                flipStr += `matrix(1,0,0,-1,0,0)`;
            }
            return flipStr;
        },
        imageClip() {
            return this.$store.state.base.imageClip;
        },
        imageSrc() {
            return this.imageClip.imageSrc;
        },
        isShowBox() {
            return this.selectedObj && this.selectedObj.isClipMode;
        },
        isImageShapeResize() {
            return this.selectedData.type == 'cimage' || this.selectedData.type == 'map' && !this.selectedData.isInContainer;
        },
        isClipping() {
            return this.imageClip.isClipping;
        },
        isMoving() {
            return this.$store.state.base.interactive.isMoving;
        },
        // 是否初次裁切
        isFirstCrop() {
            return !this.selectedObj.hasCrop && this.selectedObj.cropScaleX == 1 && this.selectedObj.cropScaleY == 1;
        },
        scale() {
            return this.$store.state.data.scale;
        },
        imageShapeBox() {
            return this.imageClip.imageShapeBox;
        },
        imageBox() {
            return this.imageClip.imageBox;
        },
        angle() {
            return this.imageClip.angle;
        },
        ktuEdit() {
            return this.$store.state.base.edit;
        },
        imageShapeBoxCoords() {
            return this.imageClip.imageShapeBoxCoords;
        },
        containerMaskStyle() {
            const editorClientRectTop = this.ktuEdit.documentPosition.viewTop + this.ktuEdit.editBox.top;
            const editorClientRectLeft = this.ktuEdit.documentPosition.viewLeft + this.ktuEdit.editBox.left;
            return {
                left: `${editorClientRectLeft}px`,
                top: `${editorClientRectTop}px`,
                width: `${Ktu.edit.documentSize.viewWidth}px`,
                height: `${Ktu.edit.documentSize.viewHeight}px`,
            };
        },
        imageFilterDefs() {
            const filters = _.cloneDeep(this.selectedObj.filters);
            delete filters.vignette;
            return filters.getDefs({
                filterId: `crop_${this.selectedObj.objectId}`,
                width: this.selectedObj.width,
                height: this.selectedObj.height,
            });
        },
        imageBoxStyleRel() {
            /* 这个是在viewport 内显示的图片，top left 不需要乘角度，反转换回去
               逆变换 */
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
               const originImageLeft = (imageToCenter.x + originImageTop * Math.sin(radian)) / Math.cos(radian) + center.x;
               算出imageShapeBox未旋转之前的坐标 */
            const imageShapeToCenter = {
                x: this.imageShapeBox.left - center.x,
                y: this.imageShapeBox.top - center.y,
            };
            const originImageShapeTop = imageShapeToCenter.x * angleSin + imageShapeToCenter.y * angleCos + center.y;
            const originImageShapeLeft = imageShapeToCenter.x * angleCos - imageShapeToCenter.y * angleSin + center.x;
            _left = originImageLeft - originImageShapeLeft;
            _top = originImageTop - originImageShapeTop;

            _left = this.selectedObj.flipX ? this.imageShapeBox.width - _left - this.imageBox.width : _left;
            _top = this.selectedObj.flipY ? this.imageShapeBox.height - _top - this.imageBox.height : _top;
            // 不等比缩放调整
            const imagescaleX = this.imageClip.scaleX;
            const imagescaleY = this.imageClip.scaleY;
            let isScaleX = false;
            let isScaleY = false;
            if (imagescaleX > imagescaleY) {
                isScaleY = true;
            } else {
                isScaleX = true;
            }
            if ((0.995 <= imagescaleX / imagescaleY && imagescaleX / imagescaleY <= 1.005)) {
                isScaleX = false;
                isScaleY = false;
            }
            return {
                transform: `translate(${_left * this.scale / (isScaleX ? (imagescaleX / imagescaleY) : 1)}px,${_top * this.scale / (isScaleY ? (imagescaleY / imagescaleX) : 1)}px) ${this.flipStr}`,
            };
        },
        controls() {
            let controlsArr = ['tl', 'tr', 'br', 'bl'];

            if (this.selectedData.type !== 'background' && this.selectedData.type !== 'imageContainer') {

                const mtd = this.imageShapeBoxBasis.top - this.imageBoxBasis.top;
                const mld = this.imageShapeBoxBasis.left - this.imageBoxBasis.left;

                const hypotenuse = Math.sqrt(mtd * mtd + mld * mld);
                const intersectAngle = Math.atan(mtd / mld) * 180 / Math.PI - this.angle;

                let _mtd = 0;
                let _mld = 0;
                if (!isNaN(intersectAngle)) {
                    _mtd = Math.abs(hypotenuse * Math.sin(intersectAngle * Math.PI / 180));
                    _mld = Math.abs(hypotenuse * Math.cos(intersectAngle * Math.PI / 180));
                }

                const _mbd = this.imageBoxBasis.height - _mtd - this.imageShapeBoxBasis.height;
                const _mrd = this.imageBoxBasis.width - _mld - this.imageShapeBoxBasis.width;

                this.coordsDistance = {
                    mtdistance: _mtd,
                    mbdistance: _mbd,
                    mldistance: _mld,
                    mrdistance: _mrd,
                };
                if (Math.abs(_mtd) < 25) {
                    if (Math.abs(_mld) < 25) {
                        const index = controlsArr.indexOf('tl');
                        index > -1 && controlsArr.splice(index, 1);
                    }
                    if (Math.abs(_mrd) < 25) {
                        const index = controlsArr.indexOf('tr');
                        index > -1 && controlsArr.splice(index, 1);
                    }
                }
                if (Math.abs(_mbd) < 25) {
                    if (Math.abs(_mld) < 25) {
                        const index = controlsArr.indexOf('bl');
                        index > -1 && controlsArr.splice(index, 1);
                    }
                    if (Math.abs(_mrd) < 25) {
                        const index = controlsArr.indexOf('br');
                        index > -1 && controlsArr.splice(index, 1);
                    }
                }
                return controlsArr;
            }
            return controlsArr;
        },
        barStyleAbs() {
            // const boxHeight = 32;
            const editorClientRectTop = this.ktuEdit.documentPosition.viewTop + this.ktuEdit.editBox.top;
            const editorClientRectLeft = this.ktuEdit.documentPosition.viewLeft + this.ktuEdit.editBox.left;

            const { angle } = this;
            let transformStr;

            if (angle >= 0 && angle <= 90) {
                transformStr = 'translate(0,calc(-100% - 8px))';
            } else if (angle >= 90 && angle <= 180) {
                transformStr = 'translate(10%,calc(-100% - 8px))';
            } else if (angle >= 180 && angle <= 270) {
                transformStr = 'translate(0px, 10%)';
            } else if (angle >= 270 && angle <= 360) {
                transformStr = 'translate(calc(-100% - 8px), 10%)';
            }
            /* const _left = this.selectedData.flipX ? this.imageShapeBox.width - this.imageBox.left - this.imageBox.width : this.imageBox.left;
            const _top = this.selectedData.flipY ? this.imageShapeBox.height - this.imageBox.top - this.imageBox.height : this.imageBox.top;*/
            if (this.selectedDataObj.group) {
                return {
                    position: 'absolute',
                    left: `${editorClientRectLeft + (this.imageShapeBox.left + this.selectedDataObj.group.left) * this.scale}px`,
                    top: `${editorClientRectTop + (this.imageShapeBox.top + this.selectedDataObj.group.top) * this.scale}px`,
                    transform: transformStr,
                };
            } else {
                return {
                    position: 'absolute',
                    left: `${editorClientRectLeft + (this.imageShapeBox.left) * this.scale}px`,
                    top: `${editorClientRectTop + (this.imageShapeBox.top) * this.scale}px`,
                    transform: transformStr,
                };
            }

        },
        imageBoxStyleAbs() {
            const editorClientRectTop = this.ktuEdit.documentPosition.viewTop + this.ktuEdit.editBox.top;
            const editorClientRectLeft = this.ktuEdit.documentPosition.viewLeft + this.ktuEdit.editBox.left;
            const _left = this.selectedObj.flipX ? this.imageShapeBox.width - this.imageBox.left - this.imageBox.width : this.imageBox.left;
            const _top = this.selectedObj.flipY ? this.imageShapeBox.height - this.imageBox.top - this.imageBox.height : this.imageBox.top;
            const _width = this.imageBox.width * this.scale;
            const _height = this.imageBox.height * this.scale;
            if (this.selectedDataObj.group) {
                this.imageBoxBasis = {
                    top: editorClientRectTop + (this.imageShapeBox.top + _top + this.selectedDataObj.group.top) * this.scale ,
                    left: editorClientRectLeft + (this.imageShapeBox.left + _left + this.selectedDataObj.group.left) * this.scale,
                    width: _width,
                    height: _height,
                };
            } else {
                this.imageBoxBasis = {
                    top: editorClientRectTop + (this.imageShapeBox.top + _top) * this.scale,
                    left: editorClientRectLeft + (this.imageShapeBox.left + _left) * this.scale,
                    width: _width,
                    height: _height,
                };
            }
            return {
                position: 'absolute',
                left: `${this.imageBoxBasis.left}px`,
                top: `${this.imageBoxBasis.top}px`,
                width: `${_width}px`,
                height: `${_height}px`,
                transform: `rotate(${this.angle}deg)`,
                transformOrigin: 'left top',
            };
        },
        imageShapeBoxStyle() {
            const { imageShapeBox } = this;

            const editorClientRectTop = this.ktuEdit.documentPosition.viewTop + this.ktuEdit.editBox.top;
            const editorClientRectLeft = this.ktuEdit.documentPosition.viewLeft + this.ktuEdit.editBox.left;
            let top = this.selectedDataObj.group ? (editorClientRectTop + (imageShapeBox.top + this.selectedDataObj.group.top) * this.scale) : (editorClientRectTop + imageShapeBox.top * this.scale);
            let left = this.selectedDataObj.group ? (editorClientRectLeft + (imageShapeBox.left + this.selectedDataObj.group.left) * this.scale) : (editorClientRectLeft + imageShapeBox.left * this.scale);
            const width = imageShapeBox.width * this.scale;
            const height = imageShapeBox.height * this.scale;

            this.imageShapeBoxBasis = {
                top,
                left,
                width,
                height,
            };

            return {
                position: 'absolute',
                top: `${top}px`,
                left: `${left}px`,
                width: `${width}px`,
                height: `${height}px`,
                transform: `rotate(${this.angle}deg)`,
                transformOrigin: 'left top',
            };
        },
        imageShapeBoxWH() {
            const width = this.imageShapeBox.width * this.scale;
            const height = this.imageShapeBox.height * this.scale;
            return {
                width: `${width}px`,
                height: `${height}px`,
            };
        },
        imageShapeLinePath() {
            const w = this.imageShapeBox.width * this.scale;
            const h = this.imageShapeBox.height * this.scale;
            return `M 0 0 h ${w} v ${h} h ${-w} v ${-h}`;
        },
        imageLinePath() {
            const w = this.imageBox.width * this.scale;
            const h = this.imageBox.height * this.scale;
            return `M 0 0 h ${w} v ${h} h ${-w} v ${-h}`;
        },
        viewPortHtml() {
            const styleObj = this.imageBoxStyleRel;
            const imagescaleX = this.imageClip.scaleX;
            const imagescaleY = this.imageClip.scaleY;
            let userScale = 1;
            let isScaleX = false;
            let isScaleY = false;
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
            }
            return `
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%" >
                ${this.imageFilterDefs}
                ${this.imageClipPath}
                <g clip-path="${this.imageClipId}" transform="scale(${isScaleX ? (imagescaleX / imagescaleY) : 1} ${isScaleY ? (imagescaleY / imagescaleX) : 1})">
                    <image  width="${this.imageBox.width / this.imageClip.scaleX * userScale * this.scale}"  ${this.imageFilterDefs ? `filter="url(#filter_crop_${this.selectedObj.objectId})"` : ''} height="${this.imageBox.height / this.imageClip.scaleY * userScale * this.scale}" xlink:href="${this.imageSrc}" style="transform:${styleObj.transform}"/>
                </g>
            </svg>`;
        },
        imageBoxHtml() {
            const imagescaleX = this.imageClip.scaleX;
            const imagescaleY = this.imageClip.scaleY;
            let userScale = 1;
            let isScaleX = false;
            let isScaleY = false;
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
            }
            return `
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%" style="position: static;transform-origin: center;" transform="${this.flipStr1}">
                ${this.imageFilterDefs}
                <g  transform="scale(${isScaleX ? (imagescaleX / imagescaleY) : 1} ${isScaleY ? (imagescaleY / imagescaleX) : 1})">
                    <image xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="${this.imageSrc}" width="${this.imageBox.width / this.imageClip.scaleX * userScale * this.scale}" height="${this.imageBox.height / this.imageClip.scaleY * userScale * this.scale}" ${this.imageFilterDefs ? `filter="url(#filter_crop_${this.selectedObj.objectId})"` : ''}></image>
                </g>
            </svg>`;
        },
    },
    watch: {
        /* isShowBox(nowValue) {
           if(!nowValue) return;
           let imageBox = this.imageBox;
           let imageShapeBox = this.imageShapeBox; */

        /* const radian = this.angle * Math.PI / 180;
           const angleCos = Math.cos(-radian);
           const angleSin = Math.sin(-radian);
           // 未裁切过 初始裁切区域为80%
           if(this.isFirstCrop) {
           imageBox.top -= imageShapeBox.height * .1;
           imageBox.left -= imageShapeBox.width * .1;
           imageShapeBox.top += imageShapeBox.height * .1;
           imageShapeBox.left += imageShapeBox.width * .1;
           imageShapeBox.width *= 0.8;
           imageShapeBox.height *= 0.8;
           }
           } */
    },
    mounted() {
        Ktu.imageClip = this.imageClip;
        Ktu.imageClip.init();
    },
    methods: {
        getCursor(control) {
            const controlAngleMap = {
                mr: 0,
                br: 45,
                mb: 90,
                bl: 135,
                ml: 180,
                tl: 225,
                mt: 270,
                tr: 315,
            };
            const cursorMap = ['e-resize', 'se-resize', 's-resize', 'sw-resize', 'w-resize', 'nw-resize', 'n-resize', 'ne-resize'];
            let totalAngle = this.angle + controlAngleMap[control] + 22.5;
            totalAngle < 0 && (totalAngle += 360);
            totalAngle >= 360 && (totalAngle -= 360);
            !totalAngle && (totalAngle = 0);
            return cursorMap[Math.floor(totalAngle / 45)];
        },
        getTransform(control) {
            if (this.imageShapeBoxBasis.width < 25 || this.imageShapeBoxBasis.height < 25) {
                return this.getTransRule(control, 5);
            }
            return this.getTransRule(control, 25);
        },
        getTransRule(control, length) {
            const w = this.imageShapeBox.width * this.scale;
            const h = this.imageShapeBox.height * this.scale;
            switch (control) {
                case 'tl':
                    return `translate(-2.5, -2.5)`;
                case 'tr':
                    return `translate(${w + 2.5}, ${length - 2.5}) rotate(-180)`;
                case 'br':
                    return `translate(${w + 2.5} ${h + 2.5}) rotate(180)`;
                case 'bl':
                    return `translate(-2.5 ${h - length + 2.5})`;
                case 'mt':
                    return `translate(${(w - length) / 2} 2.5) rotate(-90)`;
                case 'mr':
                    return `translate(${w - 2.5} ${(h - length) / 2})`;
                case 'mb':
                    return `translate(${(w - length) / 2} ${h + 2.5}) rotate(-90)`;
                case 'ml':
                    return `translate(-2.5 ${(h - length) / 2})`;
            }
        },
        getControlPath(control, isImage) {
            const size = this.controlSize;
            const w = (!isImage ? this.imageShapeBox.width : this.imageBox.width) * this.scale;
            const h = (!isImage ? this.imageShapeBox.height : this.imageBox.height) * this.scale;
            switch (control) {
                case 'tl':
                    return `M0 ${size / 2} v${-size / 2} h${size / 2} a${size / 2} ${size / 2} 0 1 0 ${-size / 2} ${size / 2}z`;
                case 'tr':
                    return `M${w - size / 2} 0 h${size / 2} v${size / 2} a${size / 2} ${size / 2} 0 1 0 ${-size / 2} ${-size / 2}z`;
                case 'br':
                    return `M${w} ${h - size / 2} v${size / 2} h${-size / 2} a${size / 2} ${size / 2} 0 1 0 ${size / 2} ${-size / 2}z`;
                case 'bl':
                    return `M${size / 2} ${h} h${-size / 2} v${-size / 2} a${size / 2} ${size / 2} 0 1 0 ${size / 2} ${size / 2}z`;
                case 'mt':
                    return `M${w / 2 - size / 2} 0 h${size} a${size / 2} ${size / 2} 0 0 0 ${-size} 0z`;
                case 'mr':
                    return `M${w} ${h / 2 - size / 2} v${size} a${size / 2} ${size / 2} 0 0 0 0 ${-size}z`;
                case 'mb':
                    return `M${w / 2 + size / 2} ${h} h${-size} a${size / 2} ${size / 2} 0 0 0 ${size} 0z`;
                case 'ml':
                    return `M0 ${h / 2 + size / 2} v${-size} a${size / 2} ${size / 2} 0 0 0 0 ${size}z`;
            }
        },
        sure() {
            this.selectedObj.exitClipMode(true);
            if (this.isObjectInGroup) {
                this.updateGroup();
            }
        },
        exit() {
            this.selectedObj.exitClipMode(false);
        },
        inputWheel(event) {
            // 自身图片不能放大于400%，小不能小于裁剪框
            const relScale = Ktu.imageClip.imageBox.width / Ktu.imageClip.imageShapeBox.width;
            let tmpscale = 1;
            if (relScale <= 5 && event.wheelDelta > 0) {
                tmpscale = 1.05;
            }
            if (relScale >= 1 && event.wheelDelta < 0) {
                tmpscale = 1 - (relScale - 1 / relScale) / 30;
            }
            // this.$el.value = nowValue;
            Ktu.imageClip.setImageZoomAddWheel(tmpscale);
        },
        getPath(control) {

            if (this.imageShapeBoxBasis.width < 25 || this.imageShapeBoxBasis.height < 25) {
                return `
                    <rect width="5" height="5" stroke="none"/>
                    <rect x="0.5" y="0.5" width="4" height="4"/>
                `;
            }
            switch (control) {
                case 'mt':
                case 'mb':
                case 'mr':
                case 'ml':
                    return `<rect width="5" height="25" rx="2.5" stroke="none"/>
                            <rect x="0.5" y="0.5" width="4" height="24" rx="2" fill="transparent"/>`;
                case 'tl':
                    return  `
                        <path d="M 2.5 24.5 C 1.4 24.5 0.5 23.6 0.5 22.5 L 0.5 2.5 L 0.5 0.5 L 2.5 0.5 L 22.5 0.5 C 23.6 0.5 24.5 1.4 24.5 2.5 C 24.5 3.6 23.6 4.5 22.5 4.5 L 5.0 4.5 L 4.5 4.5 L 4.5 5.0 L 4.5 22.5 C 4.5 23.6 3.6 24.5 2.5 24.5 Z" stroke="none"/>
                        <path d="M 2.5 24.0 C 3.3 24.0 4.0 23.3 4.0 22.5 L 4.0 5.0 C 4.0 4.4 4.4 4.0 5.0 4.0 L 22.5 4.0 C 23.3 4.0 24.0 3.3 24.0 2.5 C 24.0 1.6 23.3 1.0 22.5 1.0 L 2.5 1.0 L 1.0 1.0 L 1.0 2.5 L 1.0 22.5 C 1.0 23.3 1.6 24.0 2.5 24.0 M 2.5 25.0 C 1.1 25.0 1.3e-07 23.8 1.3e-07 22.5 L 1.3e-07 2.5 L 1.3e-07 1.3e-07 L 2.5 1.3e-07 L 22.5 1.3e-07 C 23.8 1.3e-07 25.0 1.1 25.0 2.5 C 25.0 3.8 23.8 5.0 22.5 5.0 L 5.0 5.0 L 5.0 22.5 C 5.0 23.8 3.8 25.0 2.5 25.0 Z" fill="#e9e9e9"/><!--stroke="none" -->
                    `;
                case 'tr':
                    return  `
                        <path d="M 22.5 24.5 L 0.5 24.5 L 0.5 22.5 L 0.5 2.5 C 0.5 1.4 1.4 0.5 2.5 0.5 C 3.6 0.5 4.5 1.4 4.5 2.5 L 4.5 20 L 4.5 20.5 L 5.0 20.5 L 22.5 20.5 C 23.6 20.5 24.5 21.4 24.5 22.5 C 24.5 23.6 23.6 24.5 22.5 24.5 Z" stroke="none"/>
                        <path d="M 22.5 24.0 C 23.3 24.0 24.0 23.3 24.0 22.5 C 24.0 21.6 23.3 21 22.5 21 L 5 21 C 4.4 21 4.0 20.5 4.0 20 L 4.0 2.5 C 4.0 1.6 3.3 1.0 2.5 1.0 C 1.6 1.0 1.0 1.6 1.0 2.5 L 1.0 22.5 L 1.0 24.0 L 22.5 24.0 M 22.5 25.0 L 1.3e-07 25.0 L 1.3e-07 22.5 L 1.3e-07 2.5 C 1.3e-07 1.1 1.1 1.3e-07 2.5 1.3e-07 C 3.8 1.3e-07 5.0 1.1 5.0 2.5 L 5.0 20 L 22.5 20 C 23.8 20 25.0 21.1 25.0 22.5 C 25.0 23.8 23.8 25.0 22.5 25.0 Z" fill="#e9e9e9"/>
                    `;
                case 'br':
                    return  `
                        <path d="M 2.5 24.5 C 1.4 24.5 0.5 23.6 0.5 22.5 L 0.5 2.5 L 0.5 0.5 L 2.5 0.5 L 22.5 0.5 C 23.6 0.5 24.5 1.4 24.5 2.5 C 24.5 3.6 23.6 4.5 22.5 4.5 L 5.0 4.5 L 4.5 4.5 L 4.5 5.0 L 4.5 22.5 C 4.5 23.6 3.6 24.55 2.5 24.5 Z" stroke="none"/>
                        <path d="M 2.5 24.0 C 3.3 24.0 4.0 23.3 4.0 22.5 L 4.0 5.0 C 4.0 4.4 4.4 4.0 5.0 4.0 L 22.5 4.0 C 23.3 4.0 24.0 3.3 24.0 2.5 C 24.0 1.6 23.3 1.0 22.5 1.0 L 2.5 1.0 L 1.0 1.0 L 1.0 2.5 L 1.0 22.5 C 1.0 23.3 1.6 24.0 2.5 24.0 M 2.5 25.0 C 1.1 25.0 1.3e-07 23.8 1.3e-07 22.5 L 1.3e-07 2.5 L 1.3e-07 1.3e-07 L 2.5 1.3e-07 L 22.5 1.3e-07 C 23.8 1.3e-07 25.0 1.1 25.0 2.5 C 25.0 3.8 23.8 5.0 22.5 5.0 L 5.0 5.0 L 5.0 22.5 C 5.0 23.8 3.8 25.0 2.5 25.0 Z" fill="#e9e9e9"/>
                    `;
                case 'bl':
                    return `
                        <path d="M 22.5 24.5 L 0.5 24.5 L 0.5 22.5 L 0.5 2.5 C 0.5 1.4 1.4 0.5 2.5 0.5 C 3.6 0.5 4.5 1.4 4.5 2.5 L 4.5 20 L 4.5 20.5 L 5.0 20.5 L 22.5 20.5 C 23.6 20.5 24.5 21.4 24.5 22.5 C 24.5 23.6 23.6 24.5 22.5 24.5 Z" stroke="none"/>
                        <path d="M 22.5 24.0 C 23.3 24.0 24.0 23.3 24.0 22.5 C 24.0 21.6 23.3 21 22.5 21 L 5.0 21 C 4.4 21 4.0 20.5 4.0 20 L 4.0 2.5 C 4.0 1.6 3.3 1.0 2.5 1.0 C 1.6 1.0 1.0 1.6 1.0 2.5 L 1.0 22.5 L 1.0 24.0 L 22.5 24.0 M 22.5 25.0 L 1.3e-07 25.0 L 1.3e-07 22.5 L 1.3e-07 2.5 C 1.3e-07 1.1 1.1 1.3e-07 2.5 1.3e-07 C 3.8 1.3e-07 5.0 1.1 5.0 2.5 L 5.0 20 L 22.5 20 C 23.8 20 25.0 21.1 25.0 22.5 C 25.0 23.8 23.8 25.05 22.5 25.0 Z" fill="#e9e9e9"/>
                    `;
            }
        },
    },
});
