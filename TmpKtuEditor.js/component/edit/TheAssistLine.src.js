Vue.component('assist-line', {
    template: `  <div class="assist-line" :style="styleParent" @mousedown="mdown" @mouseup="mup">
                    <div class="assist-line-x" :style="styleX" @mousemove="move($event,'x')" @mouseenter="enter($event,'x')" @mouseleave="leave($event,'x')" @click="click($event,'x')">
                        <div class="unitx-num">
                            <div class="step-num" v-for="unit in unitMark.x" :style="{left: unit * scale + 'px'}">{{unit}}</div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="100%" height="100%">
                            <defs v-html="svgUnitX"></defs>
                            <rect x="0" y="0" width="100%" height="100%" style="stroke:none;" fill="url(#unitx)"></rect>
                        </svg>
                    </div>
                    <div class="assist-line-y" :style="styleY" @mousemove="move($event,'y')" @mouseenter="enter($event,'y')" @mouseleave="leave($event,'y')" @click="click($event,'y')">
                        <div class="unity-num">
                            <div class="step-num" v-for="unit in unitMark.y" :style="{top: unit * scale + 'px'}">{{unit}}</div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" :width="distance * 2" :height="editorHeight">
                            <defs v-html="svgUnitY"></defs>
                            <rect x="0" y="0" width="100%" height="100%" style="stroke:none;" fill="url(#unity)"></rect>
                        </svg>
                    </div>

                    <div v-if="showHoverLine" class="assistLine hoverLine" :class="{'linex' : inH , 'liney' : !inH}" :style="hoverLineStyle">
                        <div class="innerLine" :style="{'border-color' : lineColor}"></div>
                        <div class="tips">{{inH ? hoverStepx : hoverStepy}}</div>
                    </div>

                    <div class="assistLine linex" :class="{inSnap : line.isSnap}" v-for="(line , index) in assistLinesx" :style="{left : (line.x * scale)+'px'}"
                        @mousedown="lineDown($event,'x',index)"
                        @contextmenu="lineMenu($event, 'x', index)">
                        <div class="innerLine" :style="{'border-color' : lineColor}"></div>
                        <div class="tips">{{line.x}}</div>
                    </div>
                    <div class="assistLine liney" :class="{inSnap : line.isSnap}" v-for="(line , index) in assistLinesy" :style="{ top : (line.y * scale)+'px'}"
                        @mousedown="lineDown($event,'y',index)"
                        @contextmenu="lineMenu($event, 'y', index)">
                        <div class="innerLine" :style="{'border-color' : lineColor}"></div>
                        <div class="tips">{{line.y}}</div>
                    </div>

                    <div class="assistLine-contextmenu" v-if="isShowContextmenu" :style="contextmenuStyle" @mousedown.stop>
                        <label class="contextmenu-tip" @click="deleteAssistLine">删除</label>
                    </div>
                </div>
            `,
    mixins: [Ktu.mixins.dataHandler],
    data() {
        return {
            distance: 10,
            unitColor: '#bfbfc0',
            inH: true,
            showHoverLine: false,
            hoverLinex: 0,
            hoverLiney: 0,
            hoverStepx: 0,
            hoverStepy: 0,

            isShowContextmenu: false,
            contextmenuEvent: null,
            currentType: 'x',
            currentKey: -1,
        };
    },
    computed: {
        editOptions() {
            return this.$store.state.base.edit;
        },
        // 视图宽高
        editorWidth() {
            return this.width * this.scale;
        },
        editorHeight() {
            return this.height * this.scale;
        },
        // 实际宽高
        width() {
            return this.editOptions.documentSize.width;
        },
        height() {
            return this.editOptions.documentSize.height;
        },
        // 视图top，left值
        top() {
            return this.editOptions.documentPosition.viewTop;
        },
        left() {
            return this.editOptions.documentPosition.viewLeft;
        },
        scale() {
            return this.$store.state.data.scale;
        },
        // 单位刻度的长度，默认为100，根据计算缩放后的实际长度更改
        unitStep() {
            let step = 100;
            const realStep = step * this.scale;
            if (realStep > 80) {
                step = 50;
            } else if (realStep < 80 && realStep > 40) {
                step = 100;
            } else if (realStep < 40 && realStep > 20) {
                step = 200;
            } else if (realStep < 20 && realStep > 10) {
                step = 300;
            } else if (realStep < 10 && realStep > 5) {
                step = 400;
            } else if (realStep < 5) {
                step = 600;
            }
            return step;
        },
        styleParent() {
            return {
                width: `${this.editorWidth}px`,
                height: `${this.editorHeight}px`,
                top: `${this.top}px`,
                left: `${this.left}px`,
            };
        },
        styleX() {
            return {
                width: `${this.editorWidth}px`,
                height: `${this.distance * 2}px`,
                top: `${0}px`,
                left: `${0}px`,
            };
        },
        styleY() {
            return {
                width: `${this.distance * 2}px`,
                height: `${this.editorHeight}px`,
                top: `${0}px`,
                left: `${0}px`,
            };
        },
        // 刻度数值
        unitMark() {
            const mark = {
                x: [],
                y: [],
            };

            // 这里为什么+1呢，因为200/50 = 4，生成出来的刻度值为0,50,100,150。如果不+1也就少了200这个刻度
            const unitx = Math.ceil(this.width / this.unitStep);
            const unity = Math.ceil(this.height / this.unitStep);

            for (let i = 0; i < unitx; i++) {
                mark.x.push(i * this.unitStep);
            }
            for (let i = 0; i < unity; i++) {
                mark.y.push(i * this.unitStep);
            }

            return mark;
        },
        // 单位刻度的纹理，用于填充刻度线
        svgUnitX() {
            const bigStep = 2 * this.distance;
            const smartStep = 8;
            const width = (this.unitStep * this.scale);
            const height = bigStep;
            const step = width / 10;
            let path = '';

            for (let i = 1; i < 10; i++) {
                const x = (i * step);
                path += `<path d="M ${x} ${bigStep - smartStep} h 1 v ${smartStep} h -1 v -${smartStep}"/>`;
            }

            return `
                <pattern id="unitx" x='0' y='${bigStep}' width='${width}' height='${height}' patternUnits="userSpaceOnUse">
                    <g fill="${this.unitColor}">
                        <path d="M 0 0 h 1 v ${bigStep} h -1 v -${bigStep}"/>
                        ${path}
                    </g>
                </pattern>`;
        },
        svgUnitY() {
            const bigStep = 2 * this.distance;
            const smartStep = 8;
            const width = bigStep;
            const height = (this.unitStep * this.scale);
            const step = height / 10;
            let path = '';

            for (let i = 1; i < 10; i++) {
                const y = (i * step);
                path += `<path d="M ${bigStep - smartStep} ${y} h ${smartStep} v 1 h -${smartStep} v -1"/>`;
            }

            return `
                <pattern id="unity" x='${bigStep}' y='0' width='${width}' height='${height}' patternUnits="userSpaceOnUse">
                    <g fill="${this.unitColor}">
                        <path d="M 0 0 h  ${bigStep} v 1 h -${bigStep} v -1"/>
                        ${path}
                    </g>
                </pattern>`;
        },
        lineColor() {
            return this.$store.state.msg.snapLineColor;
        },
        // 在刻度条上移动时出现的选中线的样式
        hoverLineStyle() {
            let top = -20;
            let left = -20;

            if (this.inH) {
                left = this.hoverLinex;
            } else {
                top = this.hoverLiney;
            }

            return {
                top: `${top}px`,
                left: `${left}px`,
            };
        },

        // 存储刻度线的数值
        assistLinesx: {
            get() {
                console.log('存储刻度线的数值', this.$store.state.msg.assistLinesx)
                return this.$store.state.msg.assistLinesx;
            },
            set(val) {
                this.$store.state.msg.assistLinesx = val;
            },
        },
        assistLinesy: {
            get() {
                return this.$store.state.msg.assistLinesy;
            },
            set(val) {
                this.$store.state.msg.assistLinesy = val;
            },
        },

        contextmenuStyle() {
            if (this.contextmenuEvent) {
                return {
                    left: `${this.contextmenuEvent.pageX - Ktu.edit.size.left - Ktu.edit.documentPosition.left}px`,
                    top: `${this.contextmenuEvent.pageY - Ktu.edit.size.top - Ktu.edit.documentPosition.top}px`,
                };
            }
            return null;
        },
    },
    methods: {
        mdown() {
            console.log(6666666)
            Ktu.edit.inAssistlLint = true;
        },
        mup() {
            Ktu.edit.inAssistlLint = false;
        },
        enter(ev, type) {
            if (type === 'x') {
                this.inH = true;
            } else {
                this.inH = false;
            }

            this.showHoverLine = true;
        },
        move(ev, type) {
            if (type === 'x') {
                this.hoverLinex = ev.pageX - Ktu.edit.size.left - Ktu.edit.documentPosition.left;
                this.hoverStepx = Math.round(this.hoverLinex / this.scale);
            } else if (type === 'y') {
                this.hoverLiney = ev.pageY - Ktu.edit.size.top - Ktu.edit.documentPosition.top;
                this.hoverStepy = Math.round(this.hoverLiney / this.scale);
            }
        },
        leave(ev) {
            this.showHoverLine = false;
            Ktu.edit.inAssistlLint = false;
        },
        click(ev, type) {
            if (type === 'x') {
                this.assistLinesx.push({
                    x: this.hoverStepx,
                    vx: this.hoverLinex,
                    isSnap: false,
                });
            } else if (type === 'y') {
                this.assistLinesy.push({
                    y: this.hoverStepy,
                    vy: this.hoverLiney,
                    isSnap: false,
                });
            }
        },
        // 拖拉辅助线
        lineDown(ev, type, key) {
            console.log('拖拽ing')
            $(ev.currentTarget).addClass('active');
            $(document).on('mousemove.hahahaha', e => {
                this.lineMove(e, type, key);
            });
            $(document).on('mouseup.hahahaha', e => {
                this.lineUp(e, type, key);
            });

            Ktu.edit.inAssistlLint = true;
        },
        lineMove(ev, type, key) {
            console.log('this is lineMove',ev,type,key)
            if (type === 'x') {
                const vx = ev.pageX - Ktu.edit.size.left - Ktu.edit.documentPosition.left;
                const x = parseInt(vx / this.scale, 10);
                this.assistLinesx[key].x = x;
                this.assistLinesx[key].vx = vx;
            } else if (type === 'y') {
                const vy = ev.pageY - Ktu.edit.size.top - Ktu.edit.documentPosition.top;
                const y = parseInt(vy / this.scale, 10);

                this.assistLinesy[key].y = y;
                this.assistLinesy[key].vy = vy;
            }
            this.$forceUpdate();
        },
        lineUp(ev, type, key) {
            console.log('this is lineUp',type.key)
            $('.active').removeClass('active');
            $(document).off('mousemove.hahahaha');
            $(document).off('mouseup.hahahaha');

            if (type === 'x') {
                if (this.assistLinesx[key].x < 0 || this.assistLinesx[key].x > this.width) {
                    this.assistLinesx.splice(key, 1);
                }
            } else if (type === 'y') {
                if (this.assistLinesy[key].y < 0 || this.assistLinesy[key].y > this.height) {
                    this.assistLinesy.splice(key, 1);
                }
            }

            Ktu.edit.inAssistlLint = false;
        },
        lineMenu(ev, type, key) {
            // 清空当前选择的元素
            Ktu.selectedData = null;
            this.isShowContextmenu = true;
            this.currentKey = key;
            this.currentType = type;

            this.contextmenuEvent = ev;

            document.addEventListener('mousedown', this.closeContextMenu);
        },
        closeContextMenu() {
            document.removeEventListener('mousedown', this.closeContextMenu);
            this.isShowContextmenu = false;
            this.currentKey = -1;
        },
        deleteAssistLine() {
            if (this.currentType === 'x') {
                this.assistLinesx.splice(this.currentKey, 1);
            } else {
                this.assistLinesy.splice(this.currentKey, 1);
            }
            this.closeContextMenu();
        },
    },
});
