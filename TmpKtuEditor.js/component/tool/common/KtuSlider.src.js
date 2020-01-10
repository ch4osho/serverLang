;
(function () {
    const isServer = Vue.prototype.$isServer;

    const on = (function () {
        if (!isServer && document.addEventListener) {
            return function (element, event, handler) {
                if (element && event && handler) {
                    element.addEventListener(event, handler, false);
                }
            };
        }
        return function (element, event, handler) {
            if (element && event && handler) {
                element.attachEvent(`on${event}`, handler);
            }
        };
    }());

    const off = (function () {
        if (!isServer && document.removeEventListener) {
            return function (element, event, handler) {
                if (element && event) {
                    element.removeEventListener(event, handler, false);
                }
            };
        }
        return function (element, event, handler) {
            if (element && event) {
                element.detachEvent(`on${event}`, handler);
            }
        };
    }());

    const SPECIAL_CHARS_REGEXP = /([:\-_]+(.))/g;
    const MOZ_HACK_REGEXP = /^moz([A-Z])/;

    function getStyle(element, styleName) {
        if (!element || !styleName) return null;
        styleName = camelCase(styleName);
        if (styleName === 'float') {
            styleName = 'cssFloat';
        }
        try {
            const computed = document.defaultView.getComputedStyle(element, '');
            return element.style[styleName] || computed ? computed[styleName] : null;
        } catch (e) {
            console.log(e);
            return element.style[styleName];
        }
    }

    function camelCase(name) {
        return name.replace(SPECIAL_CHARS_REGEXP, (_, separator, letter, offset) => (offset ? letter.toUpperCase() : letter)).replace(MOZ_HACK_REGEXP, 'Moz$1');
    }

    Vue.component('ktu-slider', {
        template: `
    <div :class="classes">
        <div :class="[prefixCls + '-wrap']" ref="slider" @click.self="sliderClick" @mousewheel.prevent="sliderMousewheel">
            <input type="hidden" :name="name" :value="currentValue">
            <template>
                <div :class="[prefixCls + '-barBg']" @click.self="sliderClick"></div>
            </template>
            <template v-if="showStops">
                <div :class="[prefixCls + '-stop']" v-for="item in stops" :style="{ 'left': item + '%' }" @click.self="sliderClick"></div>
            </template>
            <template v-if="min >=0">
                <div :class="[prefixCls + '-bar']" :style="barStyle" @click.self="sliderClick"></div>
            </template>
            <template v-else>
                <div :class="[prefixCls + '-zero']" :style="zeroStyle"></div>
                <div :class="[prefixCls + '-allBar']">
                    <div :class="[prefixCls + '-bar']" :style="barStyle" @click.self="sliderClick"></div>
                </div>
            </template>
            <template v-if="range">
                <div
                    :class="[prefixCls + '-button-wrap']"
                    :style="{left: firstPosition + '%'}"
                    @mousedown="onFirstButtonDown" @touchstart="onSecondButtonDown">
                    <ktu-toolTip :controlled="firstDragging" placement="top" :content="tipFormat(currentValue[0])" :disabled="tipDisabled" :always="showTip === 'always'" ref="tooltip">
                        <div :class="button1Classes"></div>
                    </ktu-toolTip>
                </div>
                <div
                    :class="[prefixCls + '-button-wrap']"
                    :style="{left: secondPosition + '%'}"
                    @mousedown="onSecondButtonDown" @touchstart="onSecondButtonDown">
                    <ktu-toolTip :controlled="secondDragging" placement="top" :content="tipFormat(currentValue[1])" :disabled="tipDisabled" :always="showTip === 'always'" ref="tooltip2">
                        <div :class="button2Classes"></div>
                    </ktu-toolTip>
                </div>
            </template>
            <template v-else>
                <div
                    :class="[prefixCls + '-button-wrap']"
                    :style="{left: singlePosition + '%'}"
                    @mousedown="onSingleButtonDown" @touchstart="onSingleButtonDown" >
                    <ktu-toolTip :controlled="dragging" placement="top" :content="tipFormat(currentValue)" :disabled="tipDisabled" :always="showTip === 'always'" ref="tooltip">
                        <div :class="buttonClasses"></div>
                    </ktu-toolTip>
                </div>
            </template>
        </div>
    </div>
    `,
        name: 'ktuSlide',
        mixins: [Ktu.mixins.emitter],
        props: {
            min: {
                type: Number,
                default: 0,
            },
            max: {
                type: Number,
                default: 100,
            },
            step: {
                type: Number,
                default: 1,
            },
            range: {
                type: Boolean,
                default: false,
            },
            value: {
                type: [Number, Array],
                default: 0,
            },
            disabled: {
                type: Boolean,
                default: false,
            },
            showInput: {
                type: Boolean,
                default: false,
            },
            showStops: {
                type: Boolean,
                default: false,
            },
            tipFormat: {
                type: Function,
                default(val) {
                    return val;
                },
            },
            showTip: {
                type: String,
                default: 'never',
                validator(value) {
                    return Ktu.oneOf(value, ['hover', 'always', 'never']);
                },
            },
            name: {
                type: String,
            },
        },
        data() {
            return {
                prefixCls: 'ktu-slider',
                currentValue: this.value,
                dragging: false,
                firstDragging: false,
                secondDragging: false,
                startX: 0,
                currentX: 0,
                startPos: 0,
                newPos: null,
                oldSingleValue: this.value,
                oldFirstValue: this.value[0],
                oldSecondValue: this.value[1],
                sizePosition: 0,
                singlePosition: (this.value - this.min) / (this.max - this.min) * 100,
                firstPosition: (this.value[0] - this.min) / (this.max - this.min) * 100,
                secondPosition: (this.value[1] - this.min) / (this.max - this.min) * 100,
            };
        },
        watch: {
            max(max) {
                this.setSinglePosition(this.currentValue > max ? max : this.currentValue);
            },
            value: function value(val) {
                this.currentValue = val;
            },
            currentValue: function currentValue(val) {
                const _this = this;

                this.$nextTick(() => {
                    // _this.$refs.tooltip.updatePopper();
                    if (_this.range) {
                        // _this.$refs.tooltip2.updatePopper();
                    }
                });
                this.updateValue(val);
                /* this.$emit('input', val);
                   this.$emit('on-input', val); */
            },
        },
        computed: {
            selectedData() {
                return this.$store.state.data.selectedData;
            },
            classes() {
                const { prefixCls } = this;
                const obj = {};
                obj[`${prefixCls}-input`] = this.showInput && !this.range;
                obj[`${prefixCls}-range`] = this.range;
                obj[`${prefixCls}-disabled`] = this.disabled;

                return [prefixCls, obj];
            },
            buttonClasses() {
                const { prefixCls } = this;
                const obj = {};
                obj[`${prefixCls}-button-dragging`] = this.dragging;
                return [`${prefixCls}-button`, obj];
            },
            button1Classes() {
                const { prefixCls } = this;
                const obj = {};
                obj[`${prefixCls}-button-dragging`] = this.firstDragging;

                return [`${prefixCls}-button`, obj];
            },
            button2Classes() {
                const { prefixCls } = this;
                const obj = {};
                obj[`${prefixCls}-button-dragging`] = this.secondDragging;

                return [`${prefixCls}-button`, obj];
            },
            barStyle() {
                let style = void 0;

                if (this.range) {
                    style = {
                        width: `${(this.currentValue[1] - this.currentValue[0]) / (this.max - this.min) * 100}%`,
                        left: `${(this.currentValue[0] - this.min) / (this.max - this.min) * 100}%`,
                    };
                } else {
                    if (this.min >= 0) {
                        style = {
                            width: `${((this.currentValue > this.max ? this.max : this.currentValue) - this.min) / (this.max - this.min) * 100}%`,
                        };
                    } else {
                        const allSize = this.max - this.min;
                        // 正值
                        const rightStyle = {
                            left: `${this.sizePosition}%`,
                            width: `${(this.currentValue) / allSize * 100}%`,
                        };
                        // 负值
                        const leftStyle = {
                            right: `${100 - this.sizePosition}%`,
                            width: `${(-this.currentValue) / allSize * 100}%`,
                        };
                        style = this.currentValue >= 0 ? rightStyle : leftStyle;
                    }
                }

                return style;
            },
            zeroStyle() {
                this.sizePosition = -this.min / (this.max - this.min) * 100;
                return {
                    left: `${this.sizePosition}%`,
                };
            },
            stops() {
                const stopCount = (this.max - this.min) / this.step;
                const result = [];
                const stepWidth = 100 * this.step / (this.max - this.min);
                for (let i = 1; i < stopCount; i++) {
                    result.push(i * stepWidth);
                }
                return result;
            },
            sliderWidth() {
                return parseInt((0, getStyle)(this.$refs.slider, 'width'), 10);
            },
            tipDisabled() {
                return this.tipFormat(this.currentValue[0]) === null || this.showTip === 'never';
            },
        },
        methods: {
            updateValue: function updateValue(val, ...args) {
                const init = args.length > 0 && args[0] !== undefined ? args[0] : false;

                if (this.range) {
                    let value = [].concat((0, _toConsumableArray3.default)(val));
                    if (init) {
                        if (value[0] > value[1]) {
                            value = [this.min, this.max];
                        }
                    } else {
                        if (value[0] > value[1]) {
                            value[0] = value[1];
                        }
                    }
                    if (value[0] < this.min) {
                        value[0] = this.min;
                    }
                    if (value[0] > this.max) {
                        value[0] = this.max;
                    }
                    if (value[1] < this.min) {
                        value[1] = this.min;
                    }
                    if (value[1] > this.max) {
                        value[1] = this.max;
                    }
                    if (this.value[0] === value[0] && this.value[1] === value[1]) {
                        this.setFirstPosition(this.currentValue[0]);
                        this.setSecondPosition(this.currentValue[1]);
                        return;
                    }

                    this.currentValue = value;
                    this.setFirstPosition(this.currentValue[0]);
                    this.setSecondPosition(this.currentValue[1]);
                } else {
                    if (val < this.min) {
                        this.currentValue = this.min;
                    }
                    /* if (val > this.max) {
                       this.currentValue = this.max;
                       } */

                    this.setSinglePosition(val > this.max ? this.max : val);
                }
            },
            sliderClick: function sliderClick(event) {
                this.$emit('start');
                if (this.disabled) return;
                const currentX = event.clientX;
                const sliderOffsetLeft = this.$refs.slider.getBoundingClientRect().left;
                const newPos = (currentX - sliderOffsetLeft) / this.sliderWidth * 100;

                if (this.range) {
                    let type = '';
                    if (newPos <= this.firstPosition) {
                        type = 'First';
                    } else if (newPos >= this.secondPosition) {
                        type = 'Second';
                    } else {
                        if (newPos - this.firstPosition <= this.secondPosition - newPos) {
                            type = 'First';
                        } else {
                            type = 'Second';
                        }
                    }
                    this[`change${type}Position`](newPos);
                } else {
                    this.changeSinglePosition(newPos);
                }
                // this.$emit('change', this.currentValue);
            },
            // 拉条滑轮事件
            sliderMousewheel(e) {
                Ktu.save.changeSaveNum();
                if (this.disabled) return;
                if (e.deltaY < 0) {
                    this.currentValue++;
                } else {
                    this.currentValue--;
                }
                const maxValue = this.currentValue > this.max ? this.max : this.currentValue;
                this.currentValue = this.currentValue < this.min ? this.min : maxValue;
                this.$emit('input', this.currentValue);
            },
            onSingleButtonDown: function onSingleButtonDown(event) {
                if (this.disabled) return;
                event.preventDefault();
                this.onSingleDragStart(event);

                (0, on)(window, 'mousemove', this.onSingleDragging);
                (0, on)(window, 'mouseup', this.onSingleDragEnd);

                (0, on)(window, 'touchmove', this.onSingleDragging);
                (0, on)(window, 'touchend', this.onSingleDragEnd);
            },
            onSingleDragStart: function onSingleDragStart(event) {
                this.$emit('start');
                this.dragging = false;
                // 移动触摸的兼容
                const clientX = event.clientX || (event.type.indexOf('touch') > -1 ? event.touches[0].clientX : 0);
                this.startX = clientX;
                this.startPos = parseInt(this.singlePosition, 10);
            },
            onSingleDragging: function onSingleDragging(event) {
                this.dragging = true;
                if (this.dragging) {
                    // this.$refs.tooltip.visible = true;
                    const clientX = event.clientX || (event.type.indexOf('touch') > -1 ? event.touches[0].clientX : 0);
                    this.currentX = clientX;
                    const diff = (this.currentX - this.startX) / this.sliderWidth * 100;
                    this.newPos = this.startPos + diff;
                    this.changeSinglePosition(this.newPos);
                }
            },
            onSingleDragEnd: function onSingleDragEnd() {
                if (this.dragging) {
                    this.dragging = false;
                    // this.$refs.tooltip.visible = false;
                    this.changeSinglePosition(this.newPos);
                }
                // this.$emit('change', this.currentValue);
                (0, off)(window, 'mousemove', this.onSingleDragging);
                (0, off)(window, 'mouseup', this.onSingleDragEnd);
                (0, off)(window, 'touchmove', this.onSingleDragging);
                (0, off)(window, 'touchend', this.onSingleDragEnd);
            },
            changeSinglePosition: function changeSinglePosition(newPos) {
                if (newPos < 0) {
                    newPos = 0;
                } else if (newPos > 100) {
                    newPos = 100;
                }
                const lengthPerStep = 100 / ((this.max - this.min) / this.step);
                const steps = Math.round(newPos / lengthPerStep);

                this.currentValue = Math.round(steps * lengthPerStep * (this.max - this.min) * 0.01 + this.min);
                this.setSinglePosition(this.currentValue);
                this.$emit('input', this.currentValue);
                if (!this.dragging) {
                    if (this.currentValue !== this.oldSingleValue) {
                        // this.$emit('on-change', this.currentValue);
                        this.$emit('change', this.currentValue);
                        this.dispatch('FormItem', 'on-form-change', this.currentValue);
                        this.oldSingleValue = this.currentValue;
                    }
                }
            },
            setSinglePosition: function setSinglePosition(val) {
                this.singlePosition = (val - this.min) / (this.max - this.min) * 100;
            },
            handleInputChange: function handleInputChange(val) {
                this.currentValue = val;
                this.setSinglePosition(val);
                // this.$emit('on-change', this.currentValue);
                this.$emit('change', this.currentValue);
                this.dispatch('FormItem', 'on-form-change', this.currentValue);
            },
            onFirstButtonDown: function onFirstButtonDown(event) {
                if (this.disabled) return;
                event.preventDefault();
                this.onFirstDragStart(event);

                (0, on)(window, 'mousemove', this.onFirstDragging);
                (0, on)(window, 'mouseup', this.onFirstDragEnd);
                (0, on)(window, 'touchmove', this.onFirstDragging);
                (0, on)(window, 'touchend', this.onFirstDragEnd);
            },
            onFirstDragStart: function onFirstDragStart(event) {
                this.$emit('start');
                this.firstDragging = false;
                const clientX = event.clientX || (event.type.indexOf('touch') > -1 ? event.touches[0].clientX : 0);
                this.startX = clientX;
                this.startPos = parseInt(this.firstPosition, 10);
            },
            onFirstDragging: function onFirstDragging(event) {
                this.firstDragging = true;
                if (this.firstDragging) {
                    // this.$refs.tooltip.visible = true;
                    const clientX = event.clientX || (event.type.indexOf('touch') > -1 ? event.touches[0].clientX : 0);

                    this.currentX = clientX;
                    const diff = (this.currentX - this.startX) / this.sliderWidth * 100;
                    this.newPos = this.startPos + diff;
                    this.changeFirstPosition(this.newPos);
                }
            },
            onFirstDragEnd: function onFirstDragEnd() {
                if (this.firstDragging) {
                    this.firstDragging = false;
                    // this.$refs.tooltip.visible = false;
                    this.changeFirstPosition(this.newPos);
                }
                (0, off)(window, 'mousemove', this.onFirstDragging);
                (0, off)(window, 'mouseup', this.onFirstDragEnd);
                (0, off)(window, 'touchmove', this.onFirstDragging);
                (0, off)(window, 'touchend', this.onFirstDragEnd);
            },
            changeFirstPosition: function changeFirstPosition(newPos) {
                if (newPos < 0) {
                    newPos = 0;
                } else if (newPos > this.secondPosition) {
                    newPos = this.secondPosition;
                }
                const lengthPerStep = 100 / ((this.max - this.min) / this.step);
                const steps = Math.round(newPos / lengthPerStep);

                this.currentValue = [Math.round(steps * lengthPerStep * (this.max - this.min) * 0.01 + this.min), this.currentValue[1]];
                this.setFirstPosition(this.currentValue[0]);
                if (!this.firstDragging) {
                    if (this.currentValue[0] !== this.oldFirstValue) {
                        /* this.$emit('on-change', this.currentValue);
                           this.$emit('input', val); */
                        this.$emit('change', this.currentValue);
                        // this.updateValue(val);
                        this.dispatch('FormItem', 'on-form-change', this.currentValue);
                        this.oldFirstValue = this.currentValue[0];
                    }
                }
            },
            setFirstPosition: function setFirstPosition(val) {
                this.firstPosition = (val - this.min) / (this.max - this.min) * 100;
            },
            onSecondButtonDown: function onSecondButtonDown(event) {
                if (this.disabled) return;
                event.preventDefault();
                this.onSecondDragStart(event);

                (0, on)(window, 'mousemove', this.onSecondDragging);
                (0, on)(window, 'mouseup', this.onSecondDragEnd);
                (0, on)(window, 'touchmove', this.onSecondDragging);
                (0, on)(window, 'touchend', this.onSecondDragEnd);
            },
            onSecondDragStart: function onSecondDragStart(event) {
                this.secondDragging = false;
                const clientX = event.clientX || (event.type.indexOf('touch') > -1 ? event.touches[0].clientX : 0);
                this.startX = clientX;
                this.startPos = parseInt(this.secondPosition, 10);
            },
            onSecondDragging: function onSecondDragging(event) {
                this.secondDragging = true;
                if (this.secondDragging) {
                    // this.$refs.tooltip2.visible = true;
                    const clientX = event.clientX || (event.type.indexOf('touch') > -1 ? event.touches[0].clientX : 0);
                    this.currentX = clientX;
                    const diff = (this.currentX - this.startX) / this.sliderWidth * 100;
                    this.newPos = this.startPos + diff;
                    this.changeSecondPosition(this.newPos);
                }
            },
            onSecondDragEnd: function onSecondDragEnd() {
                if (this.secondDragging) {
                    this.secondDragging = false;
                    // this.$refs.tooltip2.visible = false;
                    this.changeSecondPosition(this.newPos);
                }
                (0, off)(window, 'mousemove', this.onSecondDragging);
                (0, off)(window, 'mouseup', this.onSecondDragEnd);
                (0, off)(window, 'touchmove', this.onSecondDragging);
                (0, off)(window, 'touchend', this.onSecondDragEnd);
            },
            changeSecondPosition: function changeSecondPosition(newPos) {
                if (newPos > 100) {
                    newPos = 100;
                } else if (newPos < this.firstPosition) {
                    newPos = this.firstPosition;
                }
                const lengthPerStep = 100 / ((this.max - this.min) / this.step);
                const steps = Math.round(newPos / lengthPerStep);

                this.currentValue = [this.currentValue[0], Math.round(steps * lengthPerStep * (this.max - this.min) * 0.01 + this.min)];
                this.setSecondPosition(this.currentValue[1]);
                if (!this.secondDragging) {
                    if (this.currentValue[1] !== this.oldSecondValue) {
                        // this.$emit('on-change', this.currentValue);
                        this.$emit('change', this.currentValue);
                        this.dispatch('FormItem', 'on-form-change', this.currentValue);
                        this.oldSecondValue = this.currentValue[1];
                    }
                }
            },
            setSecondPosition: function setSecondPosition(val) {
                this.secondPosition = (val - this.min) / (this.max - this.min) * 100;
            },
        },
        mounted() {
            if (this.range) {
                const isArray = Array.isArray(this.currentValue);
                if (!isArray || isArray && this.currentValue.length != 2 || isArray && (isNaN(this.currentValue[0]) || isNaN(this.currentValue[1]))) {
                    this.currentValue = [this.min, this.max];
                } else {
                    this.updateValue(this.currentValue, true);
                }
            } else {
                if (typeof this.currentValue !== 'number') {
                    this.currentValue = this.min;
                }
                this.updateValue(this.currentValue);
            }
        },
    });
}());
