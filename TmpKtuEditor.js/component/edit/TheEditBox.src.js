Vue.component('edit-box', {
    mixins: [Ktu.mixins.popupCtrl, Ktu.mixins.dataHandler, Ktu.mixins.Response],
    template: ` <div v-if="isShowBox && !isClipping" v-show="!isTranslating" class="edit-box" id="edit-box" :style="boxStyle" style="overflow: visible;" :class="{move: !isLocked,locked: isLocked}"><!--,isOpacity:isOpacity-->
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="100%" height="100%" class="edit-box-controls" :style="offsetStyle">
                        <g :class="{hidden: !isShowControl('rotate')}">
                            <line :x1="width/2" :y1="height" :x2="width/2" :y2="height + rotateLine" class="edit-box-rotate-line"/>
                            <g class="edit-box-rotate" data-control="rotate" :class="{pressed: 'rotate' === interactive.currentControl}">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" width="26" height="26" :x="width/2 - rotateIcon.width/2" :y="height + rotateLine - rotateIcon.height/2">
                                    <filter id="rotate-shadow" y="-43.0769%" height="186.1538%" x="-43.0769%" width="186.1538%">
                                        <feGaussianBlur in="SourceAlpha" stdDeviation="3"></feGaussianBlur>
                                        <feOffset dx="0" dy="0" result="oBlur"></feOffset>
                                        <feFlood flood-color="rgba(90, 90, 90, .5)"></feFlood>
                                        <feComposite in2="oBlur" operator="in"></feComposite>
                                        <feMerge>
                                            <feMergeNode></feMergeNode>
                                            <feMergeNode in="SourceGraphic"></feMergeNode>
                                        </feMerge>
                                    </filter>
                                    <g style="filter: url(#rotate-shadow);">
                                        <path d="M21.76,13.15a2,2,0,0,0-1.36-1.08A7.5,7.5,0,0,0,9.37,7,2.4,2.4,0,0,0,8.25,8.4L8,8.37H8a2.08,2.08,0,0,0-1.64.82l-2,2.65a2,2,0,0,0-.18,2.07A1.92,1.92,0,0,0,5.69,15a7.49,7.49,0,0,0,11,5.06,2.4,2.4,0,0,0,1.12-1.43l.2,0h0a2.08,2.08,0,0,0,1.65-.82l1.88-2.51A2,2,0,0,0,21.76,13.15Z" fill="#fff" />
                                        <path d="M15,17a4,4,0,0,1-1.91.49,4,4,0,0,1-4-4h1.05a.47.47,0,0,0,.38-.76l-2-2.66a.55.55,0,0,0-.88,0l-2,2.66a.48.48,0,0,0,.38.76H7A6,6,0,0,0,16,18.74a1,1,0,0,0,.24-1.51A1,1,0,0,0,15,17Z" class="edit-box-rotate-icon"/>
                                        <path d="M19.92,13.51H16.17a.55.55,0,0,0-.45.89l1.87,2.51a.56.56,0,0,0,.9,0l1.88-2.51A.56.56,0,0,0,19.92,13.51Z" class="edit-box-rotate-icon"/>
                                        <path d="M11.14,10A3.91,3.91,0,0,1,13,9.51a4,4,0,0,1,4,4h2a6,6,0,0,0-8.93-5.24,1,1,0,0,0-.24,1.51A1,1,0,0,0,11.14,10Z" class="edit-box-rotate-icon"/>
                                    </g>
                                </svg>
                                <circle :cx="width/2" :cy="height +rotateLine + rotateIcon.height/2" r="15" class="edit-box-rotate-circle"/>
                            </g>
                        </g>

                        <g :class="{hidden: !isShowControl('threeRotate')}">
                            <line :x1="width/2" :y1="0" :x2="width/2" :y2="-rotateLine" class="edit-box-rotate-line"/>
                            <g class="edit-box-rotate" data-control="threeRotate">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 18" width="16" height="18" :x="width/2 - threeRotateIcon.width/2" :y="-(rotateLine + threeRotateIcon.height/2)">
                                    <path fill="#ffffff" d="M0,13.1V5c0-0.4,0.2-0.7,0.5-0.9l7-4c0.3-0.2,0.7-0.2,1,0l7,4C15.8,4.4,16,4.7,16,5v8.1  c0,0.4-0.2,0.7-0.5,0.9l-7,4c-0.3,0.2-0.7,0.2-1,0l-7-4C0.2,13.8,0,13.5,0,13.1z"/>
                                    <path class="icon-path" d="M7.8,1.1L1.3,4.9C1.1,5,1,5.2,1,5.3v7.5c0,0.2,0.1,0.3,0.3,0.4L7.8,17c0.2,0.1,0.3,0.1,0.5,0  l6.5-3.8c0.2-0.1,0.3-0.3,0.3-0.4V5.3c0-0.2-0.1-0.3-0.3-0.4L8.3,1.1C8.1,1.1,7.9,1.1,7.8,1.1z M12.3,5.8L8,8L3.7,5.8L8,3.3  L12.3,5.8z M3,7.7l4,2v4.6L3,12V7.7z M9,14.3V9.7l4-2V12L9,14.3z"/>
                                </svg>
                            </g>
                        </g>

                        <g v-for="(control, index) in controls" :data-control="control" class="edit-box-control-line" :class="[{hidden: !isShowControl(control)}, 'edit-box-control-line-' + control]" :style="{cursor: getCursor(control)}">
                            <line v-if="hasControlLine.includes(control)" :x1="getControlLine(control).x1" :y1="getControlLine(control).y1" :x2="getControlLine(control).x2" :y2="getControlLine(control).y2" style="stroke: transparent" :stroke-width="controlSize/2"/>
                        </g>

                        <g class="edit-box-radius" v-if="target && target.isSupportRadius" :class="{hidden: !isShowControl('radius')}">
                            <g data-control="radius_size" class="radius-size" :class="{pressed: 'radius_size' === interactive.currentControl}" :style="{cursor: getCursor('radius')}">
                                <line :x1="radiusSize" y1="0" :x2="radiusSize" y2="-10" class="radius-size-line"></line>
                                <line :x1="radiusSize" y1="0" :x2="radiusSize" y2="-10" class="radius-size-line"></line>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" :x="radiusSize-6" y="-22">
                                    <path d="M6,9.59a1.59,1.59,0,0,1-1.29-.67L1.37,4.23a1.6,1.6,0,0,1,1.3-2.52H9.36a1.61,1.61,0,0,1,1.42.87,1.58,1.58,0,0,1-.12,1.65L7.31,8.92A1.59,1.59,0,0,1,6,9.59Z" class="radius-size-triangle"/>
                                    <path fill="#fff" d="M9.36,2.71a.59.59,0,0,1,.48.94L6.5,8.34a.6.6,0,0,1-1,0L2.18,3.65a.6.6,0,0,1,.49-.94H9.36m0-2H2.67A2.59,2.59,0,0,0,.36,2.12a2.56,2.56,0,0,0,.2,2.69L3.9,9.5A2.62,2.62,0,0,0,6,10.59,2.59,2.59,0,0,0,8.12,9.5l3.35-4.69A2.59,2.59,0,0,0,9.36.71Z" />
                                </svg>
                                <line :x1="radiusSize" y1="0" :x2="radiusSize" y2="-22" class="radius-size-area"></line>
                            </g>
                            <g class="radius-tips" v-if="'radius_size' === interactive.currentControl"  :transform="'translate('+radiusSize+' -42) rotate('+-target.angle+')'">
                                <rect :x="-radiusTipsWidth/2" y="0" :width="radiusTipsWidth" height="20" rx="3" ry="3" fill="rgba(0, 0, 0, .8)"></rect>
                                <text :x="0" y="14" fill="#fff" style="font-size: 12px;text-anchor: middle;">{{radiusTips}}</text>
                            </g>
                            <template v-if="isShowRadiusPosition">
                                <svg class="radius-position" :data-control="'radius_position_'+position" v-for="(position, index) in ['lb', 'lt', 'rb', 'rt']" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" width="14" height="14" :x="radiusPosition(position).x" :y="radiusPosition(position).y">
                                    <template v-if="radius[position]">
                                        <circle cx="7" cy="7" r="6" />
                                        <path fill="#fff" d="M7,2A5,5,0,1,1,2,7,5,5,0,0,1,7,2M7,0a7,7,0,1,0,7,7A7,7,0,0,0,7,0Z" />
                                        <circle fill="#fff" cx="7" cy="7" r="2" />
                                    </template>
                                    <template v-else>
                                        <rect x="1.05" y="1" width="12" height="12" rx="3" ry="3" />
                                        <path fill="#fff" d="M10.05,2a2,2,0,0,1,2,2v6a2,2,0,0,1-2,2h-6a2,2,0,0,1-2-2V4a2,2,0,0,1,2-2h6m0-2h-6a4,4,0,0,0-4,4v6a4,4,0,0,0,4,4h6a4,4,0,0,0,4-4V4a4,4,0,0,0-4-4Z" />
                                    </template>
                                </svg>
                            </template>
                        </g>

                        <path v-for="(control, index) in controls" :data-control="control" class="edit-box-control" :class="[{pressed: control === interactive.currentControl, hidden: !isShowControl(control)}, 'edit-box-control-' + control]" :style="{cursor: getCursor(control)}" :d="getControlPath(control)"/>

                        <g v-if="!!this.currentMulti">
                            <path class="edit-box-line black" :d="linePath()" transform="translate(0.5 0.5)"/>
                            <path class="edit-box-line white" :d="linePath()" transform="translate(0.5 0.5)"/>
                        </g>
                        <g class="edit-box-locked" v-if="isLocked">
                            <circle :cx="width" :cy="height" r="11" class="edit-box-locked-circle" data-control="unlock"/>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" width="12" height="12" :x="width-6" :y="height-6" class="edit-box-locked-icons">
                                <path d="M10.43,5.14H3.62v-2A2.06,2.06,0,0,1,5.83,1.26,2.06,2.06,0,0,1,8,3.11H9.3A3.31,3.31,0,0,0,5.83,0,3.31,3.31,0,0,0,2.35,3.11v2H.14V12H11.57V5.14Z" class="edit-box-locked-icon"/>
                                <path d="M10.43,5.14H9.3v-2A3.31,3.31,0,0,0,5.83,0,3.31,3.31,0,0,0,2.35,3.12v2H.14V12H11.57V5.14Zm-6.81-2A2.06,2.06,0,0,1,5.83,1.27,2.06,2.06,0,0,1,8,3.12v2H3.62Z" class="edit-box-locked-icon" />
                            </svg>
                        </g>
                    </svg>

                    <edit-table-box  v-if="isTable"></edit-table-box>
                </div>
            `,
    data() {
        return {
            navHeight: Ktu.config.nav.height,
            // categoryWidth: Ktu.config.ele.categoryWidth,
            detailWidth: Ktu.config.ele.detailWidth,
            controls: ['tl', 'tr', 'br', 'bl', 'mt', 'mb', 'mr', 'ml'],
            controlSize: 14,
            rotateLine: 20,
            rotateIcon: {
                width: 26,
                height: 16,
            },
            hasControlLine: ['mt', 'mr', 'mb', 'ml'],
            qrCodeLoadingScale: null,
            threeRotateIcon: {
                width: 16,
                height: 18,
            },
        };
    },
    computed: {
        isSelectedInGroup() {
            return (!!this.selectedGroup || !!this.currentMulti) && !!this.selectedData;
        },
        isClipping() {
            return this.$store.state.base.imageClip.isClipping;
        },
        isShowBox() {
            return this.target && this.target.type !== 'background' && !this.target.isEditing;
        },
        /* isOpacity() {
            return this.selectedData && this.selectedData.type == 'cimage' && this.selectedData.isInContainer && this.selectedData.isSelected;
        },*/
        isLocked() {
            return this.target && this.target.isLocked;
        },
        interactive() {
            return this.$store.state.base.interactive;
        },
        editBox() {
            return this.$store.state.base.editBox;
        },
        isShowEleDetail() {
            return this.$store.state.base.isShowEleDetail;
        },
        currentMulti() {
            return this.$store.state.data.currentMulti;
        },
        selectedGroup() {
            return this.$store.state.data.selectedGroup;
        },
        selectedData() {
            return this.$store.state.data.selectedData;
        },
        target() {
            return this.activeObject && (this.activeObject.isInContainer ? this.activeObject.container : this.activeObject);
        },
        scale() {
            return this.$store.state.data.scale;
        },
        radius() {
            return this.target.radius;
        },
        radiusSize() {
            const radius = Math.min(Math.max(0, this.radius.size), Math.floor(Math.min(this.target.width * this.target.scaleX, this.target.height * this.target.scaleY) / 2 + 1));
            return radius * this.scale;
        },
        boxSizePosition() {
            const dimensions = this.target.getDimensions();
            let width = dimensions.w * this.target.scaleX * this.scale;
            let height = dimensions.h * this.target.scaleY * this.scale;

            if (this.target.group) {
                width = dimensions.w * this.target.scaleX * this.scale * this.target.group.scaleX;
                height = dimensions.h * this.target.scaleY * this.scale * this.target.group.scaleY;
            }
            let offsetX = 0;
            let offsetY = 0;
            if (width < 10) {
                offsetX = (10 - width) / 2;
                width = 10;
            }
            if (height < 10) {
                offsetY = (10 - height) / 2;
                height = 10;
            }
            const editorClientRectTop = Ktu.edit.documentPosition.viewTop;
            const editorClientRectLeft = Ktu.edit.documentPosition.viewLeft;
            // 获取元素未旋转前的top left值
            const radian = this.target.angle * Math.PI / 180;
            const angleCos = Math.cos(-radian);
            const angleSin = Math.sin(-radian);
            // 得到相对于元素中心点的坐标
            const toCenter = {
                x: this.target.left - this.target.coords.center.x,
                y: this.target.top - this.target.coords.center.y,
            };
            /* 矩阵转换，由点向量乘以旋转代表的矩阵后解方程得出公式。 */
            const originLeft = this.target.coords.center.x + toCenter.x * angleCos - toCenter.y * angleSin;
            const originTop = this.target.coords.center.y + toCenter.x * angleSin + toCenter.y * angleCos;
            let left;
            let top;
            if (this.target.group) {
                left = editorClientRectLeft + (originLeft * this.target.group.scaleX + this.target.group.left) * this.scale - offsetX;
                top = editorClientRectTop + (originTop * this.target.group.scaleX + this.target.group.top) * this.scale - offsetY;
            } else {
                left = editorClientRectLeft + originLeft * this.scale - offsetX;
                top = editorClientRectTop + originTop * this.scale - offsetY;
            }
            return {
                left,
                top,
                width,
                height,
                offsetY,
            };
        },
        width() {
            return this.boxSizePosition.width;
        },
        height() {
            return this.boxSizePosition.height;
        },
        left() {
            return this.boxSizePosition.left;
        },
        top() {
            return this.boxSizePosition.top;
        },
        offsetStyle() {
            return `transform:translateY(-${this.boxSizePosition.offsetY}px)`;
        },
        boxStyle() {
            return {
                left: `${this.left}px`,
                top: `${this.top}px`,
                width: `${this.width}px`,
                height: `${this.height}px`,
                transform: `rotate(${this.target.angle}deg)`,
                pointerEvents: this.target.type === 'multi' && !this.target.isPass ? 'auto' : 'none',
            };
        },
        isShowRadiusPosition() {
            return this.radiusSize && this.width > 100 && this.height > 100;
        },
        radiusTips() {
            const {
                size,
            } = this.radius;
            if (size >= Math.floor(Math.min(this.target.width * this.target.scaleX, this.target.height * this.target.scaleY) / 2 + 1)) {
                return '最大';
            }
            return Math.round(size);
        },
        radiusTipsWidth() {
            const {
                radiusTips,
            } = this;
            return radiusTips === '最大' ? 38 : 16 + 6 * radiusTips.toString().length;
        },
        isTranslating() {
            return this.$store.state.base.interactive.isTranslating;
        },
        isCreatingEditArt: {
            get() {
                return this.$store.state.base.isCreatingEditArt;
            },
            set(value) {
                this.$store.state.base.isCreatingEditArt = value;
            },
        },
        //  是否显示二维码编辑页
        qrCodeEditor: {
            get() {
                return this.$store.state.base.qrCodeEditor;
            },
            set(value) {
                this.$store.state.base.qrCodeEditor = value;
            },
        },

        isTable() {
            return this.target.type === 'table';
        },
    },
    methods: {
        childEleIsActive(ele) {
            return ele.objectId == this.activeObject.objectId;
        },
        linePath(ele = this.target) {
            const dimensions = ele.getDimensions();
            const w = dimensions.w * (ele.group ? ele.group.scaleX : 1) * ele.scaleX * this.scale;
            const h = dimensions.h * (ele.group ? ele.group.scaleY : 1) * ele.scaleY * this.scale;
            return `M 0 0 h ${w} v ${h} h ${-w} v ${-h}`;
        },
        childLinePath(ele) {
            const dimensions = ele.getDimensions();
            const w = dimensions.w * (ele.group ? ele.group.scaleX : 1) * ele.scaleX * this.scale;
            const h = dimensions.h * (ele.group ? ele.group.scaleY : 1) * ele.scaleY * this.scale;

            let l;
            let t;
            if (ele.group) {
                l = ele.left * ele.group.scaleX * this.scale;
                t = ele.top * ele.group.scaleY * this.scale;
            } else {
                l = (ele.left - this.target.left) * this.scale;
                t = (ele.top - this.target.top) * this.scale;
            }
            return `M ${l} ${t} h ${w} v ${h} h ${-w} v ${-h}`;
        },

        isShowControl(control) {
            const {
                acrossMap,
            } = Ktu.interactive;
            return !this.isLocked && (this.target.controls[control] || control === 'radius') && (!this.interactive.isResizing || control === this.interactive.currentControl || control === acrossMap[this.interactive.currentControl]);
        },
        getCursor(control) {
            const controlAngleMap = {
                mr: 0,
                radius: 0,
                br: 45,
                mb: 90,
                bl: 135,
                ml: 180,
                tl: 225,
                mt: 270,
                tr: 315,
            };
            const cursorMap = ['e-resize', 'se-resize', 's-resize', 'sw-resize', 'w-resize', 'nw-resize', 'n-resize', 'ne-resize'];
            let totalAngle = this.target.angle + controlAngleMap[control] + 22.5;
            totalAngle < 0 && (totalAngle += 360);
            totalAngle >= 360 && (totalAngle -= 360);
            !totalAngle && (totalAngle = 0);
            return cursorMap[Math.floor(totalAngle / 45)];
        },
        // 获取控制线的点
        getControlPath(control) {
            const size = this.controlSize;
            const w = this.width;
            const h = this.height;
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
        // 获取控制线的位置
        getControlLine(control) {
            const size = this.controlSize;
            const w = this.width;
            const h = this.height;
            switch (control) {
                case 'tl':
                    return {};
                case 'tr':
                    return {};
                case 'br':
                    return {};
                case 'bl':
                    return {};
                case 'mt':
                    return {
                        x1: 8,
                        y1: -size / 4,
                        x2: w - 8,
                        y2: -size / 4,
                    };
                case 'mr':
                    return {
                        x1: w + size / 4,
                        y1: 8,
                        x2: w + size / 4,
                        y2: h - 8,
                    };
                case 'mb':
                    return {
                        x1: 8,
                        y1: h + size / 4,
                        x2: w - 8,
                        y2: h + size / 4,
                    };
                case 'ml':
                    return {
                        x1: -size / 4,
                        y1: 8,
                        x2: -size / 4,
                        y2: h - 8,
                    };
            }
        },
        radiusPosition(position) {
            const iconSize = 14;
            let length = this.radiusSize / 2;
            length < 25 && (length = 25);
            const style = {};
            const dimensions = this.target.getDimensions();
            switch (position) {
                case 'lt':
                    style.x = length - iconSize / 2;
                    style.y = length - iconSize / 2;
                    break;
                case 'rt':
                    style.x = dimensions.w * this.target.scaleX * this.scale - length - iconSize / 2;
                    style.y = length - iconSize / 2;
                    break;
                case 'rb':
                    style.x = dimensions.w * this.target.scaleX * this.scale - length - iconSize / 2;
                    style.y = dimensions.h * this.target.scaleY * this.scale - length - iconSize / 2;
                    break;
                case 'lb':
                    style.x = length - iconSize / 2;
                    style.y = dimensions.h * this.target.scaleY * this.scale - length - iconSize / 2;
                    break;
            }
            return style;
        },
    },
});
