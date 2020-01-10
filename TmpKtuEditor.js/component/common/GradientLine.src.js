Vue.component('gradient-line', {
    template: `
        <div class="gradient-line">
            <div 
                class="slide" 
                ref="slide"
                :style="{background: lightnessGradient}" 
                @mouseenter="hoverSlide"
                @mouseleave="leaveSlide"
                @mouseout="outSlide"
                @mousedown="downSlide"
                @click="mouseAddNode"
            >
                <div
                    v-for="(item, index) in slidePosition"
                    :key="item"
                    :class="['slide-block', {'has-tips': !isDragging, active: index === draggingIndex, alignLeft: slidePosition[index] <= 16, alignRight: slidePosition[index] >= 208}]"
                    :style="{left: item + 'px', top: draggingIndex === index ? slideBlockTop + 'px' : '-1px', 'background-color': value.value[index].color}"
                    ref="slideBlock"
                    tips="双击修改颜色"
                    @mousedown.stop="change($event, index)"
                    @mouseleave="leaveSlideBlock"
                    @mouseenter="enterSlideBlock"
                    @dblclick.stop="dblClickSlideBlock($event, index)"
                    @click.stop = "clickSlideBlock"
                ></div>
                <svg class="mouse-add" v-show="isShowMouseAdd && !isDragging" :style="{top: mousePoi.top+'px', left: mousePoi.left+'px'}">
                    <use xlink:href="#svg-mouse-add"></use>
                </svg>
                <svg class="mouse-delete" v-show="isShowMouseDel" :style="{top: mousePoi.top+'px', left: mousePoi.left+'px'}">
                    <use xlink:href="#svg-mouse-delete"></use>
                </svg>
            </div>
            <div class="operation-bar">
                <div class="color-collect-btn" @click="collectColor">
                    <svg class="color-icon">
                        <use xlink:href="#svg-color-collect"></use>
                    </svg>
                </div>
                <div class="quantity-btn">
                    <div class="add-btn btn-item" @click="btnAddNode">
                        <svg class="svg-icon">
                            <use xlink:href="#svg-add-node"></use>
                        </svg>
                    </div>
                    <div class="delete-btn btn-item" @click="btnDelNode">
                        <svg :class="['svg-icon', {disabled: disabledDel}]">
                            <use xlink:href="#svg-delete-node"></use>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    `,
    mixins: [Ktu.mixins.colorCtrl],
    props: {
        value: Object,
        colorType: String,
        themePickerShow: Boolean,
        themeColorList: Array,
        collectPickerShow: Boolean,
    },
    data() {
        return {
            slideRadius: 8,
            slideRadiusActive: 10,
            slideLength: 224,
            slideBlockTop: -3,
            isShowMouseAdd: false,
            isShowMouseDel: false,
            mousePoi: {
                top: 0,
                left: 0,
            },
            draggingIndex: -1,
            isDragging: false,
            // 判断有没有拖动过，拖动过的话不触发颜色选择弹窗
            hasDrag: false,

            // 判断节点比例是水平移动还是竖直移动
            isHorizen: true,
        };
    },
    computed: {
        isPickingColor() {
            return this.$store.state.base.isPickingColor;
        },
        lightnessGradient() {
            let color = 'linear-gradient(to right,';
            this.gradientValue.value.forEach((item, index, arr) => {
                color += item.color;
                if (index !== arr.length - 1) color += ',';
            });
            color += ')';
            return color;
        },
        slidePosition() {
            return this.gradientValue.value.map(item => item.percent / 100 * this.slideLength);
        },
        disabledDel() {
            return this.draggingIndex === -1 || this.gradientValue.value.length <= 2;
        },
        colorPanelLeft: {
            get() {
                return this.$store.state.base.colorPanelLeft;
            },
            set(value) {
                this.$store.state.base.colorPanelLeft = value;
            },
        },
        gradientNodeIndex: {
            get() {
                return this.$store.state.base.gradientNodeIndex;
            },
            set(value) {
                this.$store.state.base.gradientNodeIndex = value;
            },
        },
        gradientValue() {
            return this.value;
        },
    },
    destroyed() {
        this.gradientNodeIndex = -1;
    },
    methods: {
        updateColor(color) {
            this.$emit('update', color);
        },

        bindGlobalEvent(moveEvent, upEvent) {
            // const moveTimer = null;
            const move = function (event) {
                // 节流
                /* moveTimer && window.clearTimeout(moveTimer);
                window.setTimeout(() => {
                    moveEvent.call(null, event);
                }, 20); */
                moveEvent.call(null, event);
            };
            const up = function () {
                upEvent.call(null, event);
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
            };
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
        },
        change(event, index) {
            const clientRect = this.$refs.slide.getBoundingClientRect();

            const startX = event.pageX;
            const startY = event.pageY;

            this.draggingIndex = index;
            this.isDragging = false;
            this.hasDrag = false;

            // document.addEventListener('mousemove', this.calcAddIconPosition);

            const getPosition = event => {
                const offsetX = event.pageX - clientRect.left;
                const offsetY = event.pageY - clientRect.top;
                const left = offsetX - this.slideRadiusActive;
                const maxLeft = this.slidePosition[index + 1] !== undefined ? this.slidePosition[index + 1] - this.slideRadius * 2 : this.slideLength;
                const minLeft = this.slidePosition[index - 1] !== undefined ? this.slidePosition[index - 1] + this.slideRadius * 2 : 0;
                let whichLeft;
                if (left >= maxLeft) {
                    whichLeft = maxLeft;
                } else if (left < maxLeft && left > minLeft) {
                    whichLeft = left;
                } else {
                    whichLeft = minLeft;
                }
                const top = offsetY - this.slideRadius;
                return {
                    top,
                    left: whichLeft,
                };
            };

            const getPercent = left => {
                const max = this.slideLength;
                const min = 0;
                return (1 - (max - left) / (max - min)) * 100;
            };

            const mousemoveFn = event => {
                const moveX = event.pageX;
                const moveY = event.pageY;
                const diffX = moveX - startX;
                const diffY = moveY - startY;

                if (diffX === 0 && diffY === 0) return;

                if (!this.isDragging) {
                    if (diffX !== 0 && diffY === 0) {
                        this.isHorizen = true;
                    } else if (diffX === 0 && diffY !== 0) {
                        this.isHorizen = false;
                    }
                }

                this.isDragging = true;
                this.hasDrag = true;
                this.gradientNodeIndex = -1;

                const { left, top } = getPosition(event);

                if (this.isHorizen) {
                    this.gradientValue.value[index].percent = getPercent(left);
                } else {
                    this.slideBlockTop = top;
                }

                if (this.slideBlockTop > 2 * this.slideRadius || this.slideBlockTop < -2 * this.slideRadius - 10) {
                    this.isShowMouseDel = true;
                } else {
                    this.isShowMouseDel = false;
                }
                this.updateColor(this.gradientValue);
            };
            const mouseupFn = event => {
                if (this.slideBlockTop > 2 * this.slideRadius || this.slideBlockTop < -2 * this.slideRadius - 10) {
                    this.delNode(index);
                }

                this.slideBlockTop = -3;
                this.isDragging = false;
                this.isShowMouseDel = false;

                document.removeEventListener('mousemove', mousemoveFn);
                document.removeEventListener('mouseup', mouseupFn);
                // document.removeEventListener('mousemove', this.calcAddIconPosition);
            };

            document.addEventListener('mousemove', mousemoveFn);
            document.addEventListener('mouseup', mouseupFn);
            // this.bindGlobalEvent(mousemoveFn, mouseupFn);
        },
        calcAddIconPosition(event) {
            const { pageX, pageY } = event;

            this.mousePoi.top = pageY + 13;
            this.mousePoi.left = pageX + 13;
        },

        hoverSlide(event) {
            if (this.gradientNodeIndex !== -1) return;
            if (!this.$refs.slide) return;

            const clientRect = this.$refs.slide.getBoundingClientRect();
            const x = event.pageX - clientRect.left;
            const len = this.slidePosition.length;

            if (this.slidePosition[0] > x || this.slidePosition[len - 1] < x) {
                this.isShowMouseAdd = false;
            } else {
                this.isShowMouseAdd = true;
            }
            document.addEventListener('mousemove', this.calcAddIconPosition);
        },

        leaveSlide() {
            this.isShowMouseAdd = false;

            !this.isDragging && document.removeEventListener('mousemove', this.calcAddIconPosition);
        },

        outSlide() {
            this.isShowMouseAdd = false;
        },

        downSlide() {
            this.hasDrag = false;
        },

        enterPanel() {
            this.isShowMouseAdd = false;
        },

        enterSlideBlock(index) {
            this.isShowMouseAdd = false;
        },

        leaveSlideBlock(event, index) {
            if (!this.$refs.slide) return;
            const clientRect = this.$refs.slide.getBoundingClientRect();
            const x = event.pageX - clientRect.left;
            const len = this.slidePosition.length;

            if (this.slidePosition[0] < x && this.slidePosition[len - 1] > x) {
                if (this.gradientNodeIndex !== -1) {
                    this.isShowMouseAdd = false;
                } else if (event.pageY < clientRect.top + clientRect.height && event.pageY > clientRect.top) {
                    this.isShowMouseAdd = true;
                    document.addEventListener('mousemove', this.calcAddIconPosition);
                }
            } else {
                this.isShowMouseAdd = false;
            }
        },

        clickSlideBlock() {
            this.gradientNodeIndex = -1;
        },

        dblClickSlideBlock(event, index) {
            if (this.hasDrag) return;
            if (this.gradientNodeIndex === index) {
                this.gradientNodeIndex = -1;
                return;
            }

            const clientRect = this.$refs.slide.getBoundingClientRect();

            this.gradientNodeIndex = index;

            this.colorPanelLeft = event.pageX - clientRect.left + 12;
        },

        mouseAddNode(event) {
            if (this.gradientNodeIndex !== -1) return;
            if (event.target.className.includes('linear-slide-block') || this.hasDrag) return;

            const clientRect = this.$refs.slide.getBoundingClientRect();
            const x = event.pageX - clientRect.left;

            let c1 = null;
            let c2 = null;

            for (let i = 0; i < this.slidePosition.length; i++) {
                if (this.slidePosition[i] > x) {
                    c1 = this.gradientValue.value[i - 1];
                    c2 = this.gradientValue.value[i];
                    break;
                };
            }

            if (c1 === null || c1 === undefined || c2 === null || c2 === undefined) return;

            this.addNode(c1, c2, x);

            this.updateColor(this.gradientValue);
        },

        btnAddNode() {
            this.addNode(this.gradientValue.value[0], this.gradientValue.value[1]);

            this.updateColor(this.gradientValue);
        },

        btnDelNode() {
            if (this.disabledDel) {
                if (this.draggingIndex !== -1) {
                    this.$Notice.warning('至少需要两个节点');
                } else {
                    this.$Notice.warning('请选择一个节点进行删除');
                }
                return;
            };

            this.delNode(this.draggingIndex);
        },

        addNode(begin, end, step) {
            const { value } = this.gradientValue;
            let nodeColor = '';
            let node = null;
            let nodeIndex = 0;

            if (step) {
                nodeColor = this.calcGradient(begin.color, end.color, step);
                node = {
                    color: nodeColor,
                    percent: Math.round(step / this.slideLength * 100 - this.slideRadius / 2),
                };
            } else {
                nodeColor = this.calcMidColor(begin.color, end.color);
                node = {
                    color: nodeColor,
                    percent: Math.round((begin.percent + end.percent) / 2),
                };
            }

            value.forEach((item, index) => {
                if (item.percent === end.percent) nodeIndex = index;
            });

            value.splice(nodeIndex, 0, node);

            this.$set(this.gradientValue, 'value', value);
        },

        // 计算某一点的过渡色
        calcGradient(c1, c2, end) {
            c1 = this.HexToRGB(c1);
            c2 = this.HexToRGB(c2);

            const step = 100;

            const rStep = (c2.r - c1.r) / step;
            const gStep = (c2.g - c1.g) / step;
            const bStep = (c2.b - c1.b) / step;

            const result = [c1.r, c1.g, c1.b];
            const condition = Math.round(end / this.slideLength * step);

            result[0] += Math.round(rStep * condition);
            result[1] += Math.round(gStep * condition);
            result[2] += Math.round(bStep * condition);

            return this.rgbToHex(`rgb(${result[0]}, ${result[1]}, ${result[2]})`);
        },

        // 计算中间色
        calcMidColor(c1, c2) {
            const color = {
                diff(c1, c2) {
                    return {
                        r: Math.abs(c1.r - c2.r),
                        g: Math.abs(c1.g - c2.g),
                        b: Math.abs(c1.b - c2.b),
                    };
                },
                dividedBy(c, n) {
                    return {
                        r: c.r / n,
                        g: c.g / n,
                        b: c.b / n,
                    };
                },
                approach(c1, c2, diff) {
                    return {
                        r: c1.r > c2.r ? c1.r - diff.r : c1.r + diff.r,
                        g: c1.g > c2.g ? c1.g - diff.g : c1.g + diff.g,
                        b: c1.b > c2.b ? c1.b - diff.b : c1.b + diff.b,
                    };
                },
            };

            c1 = this.HexToRGB(c1);
            c2 = this.HexToRGB(c2);

            const diff = color.diff(c1, c2);
            // 只计算一种中间色，所以除以2，把2换成n可以计算n种中间色
            const divide = color.dividedBy(diff, 2);

            let mid = color.approach(c1, c2, divide);
            mid = this.rgbToHex(`rgb(${mid.r}, ${mid.g}, ${mid.b})`);

            return mid;
        },

        delNode(index) {
            const { value } = this.gradientValue;

            if (value.length <= 2) {
                this.$Notice.warning('至少需要两个节点');
                return;
            }

            this.draggingIndex = -1;
            value.splice(index, 1);

            this.$set(this.gradientValue, 'value', value);

            this.updateColor(this.gradientValue);
        },

        rgbToHex(rgb) {
            if (rgb.charAt(0) == '#') return rgb;
            rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+\.?\d*)[\s+]?,[\s+]?(\d+\.?\d*)[\s+]?,[\s+]?(\d+\.?\d*)[\s+]?/i);
            return (rgb && rgb.length === 4) ? `#${rgb.slice(1, 4).map(value => (`0${parseInt(value, 10).toString(16)}`).slice(-2))
                .join('')}` : '';
        },

        HexToRGB(hex) {
            hex.indexOf('#') > -1 && (hex = hex.slice(1));
            hex = parseInt((hex.length == 6 ? hex : hex.split('').map(value => value + value)
                .join('')), 16);
            return {
                r: hex >> 16,
                g: (hex & 0x00FF00) >> 8,
                b: (hex & 0x0000FF),
            };
        },
    },
});
