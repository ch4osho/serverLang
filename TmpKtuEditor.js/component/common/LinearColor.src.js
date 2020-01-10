Vue.component('linear-color', {
    template: `
        <transition name="color-fade">
            <div class="linear-color">
                <div class="linear-box">
                    <div class="linear-block" v-for="item in linearColorList" :key="item.id" :style="{background: 'linear-gradient(to right, '+ item.from +', '+ item.to +')'}" @click="changeColor(item,'linear')"></div>
                </div>

                <gradient-line 
                    :value="linearValue" 
                    :themeColorList="themeColorList"
                    :collectPickerShow="collectPickerShow"
                    colorType="linear"
                    @update="updateColor"
                ></gradient-line>

                <div class="deg-slide">
                    <tool-slider 
                        :value="angle"
                        title="角度"
                        :min="-360"
                        :max="360"
                        :step="1"
                        unit="°"
                        class="tool-rotate-slider"
                        @input="rotate"
                    ></tool-slider>
                    <div class="tool-rotate-btns">
                        <div v-for="item in rotateList" class="tool-rotate-btn has-tips" :tips="item.label" @click.stop="rotate(item.value)">
                            <svg class="tool-rotate-btn-icon">
                                <use :xlink:href="'#svg-tool-'+item.icon"></use>
                            </svg>
                        </div>
                    </div>
                </div>
                <div class="color-theme" v-if="themePickerShow && themeColorList.length > 0">
                    <div class="color-label">主题色</div>
                    <div class="color-theme-value">
                        <div class="color-theme-container" v-for="(color, index) in themeColorList" :key="index" :class="getRadiusClass(index, themeColorList, 10, false)" @click="chooseListColor(color)">
                            <div class="color-box" :style="{background: colorListFilter(color)}"></div>
                        </div>
                    </div>
                </div>
                <div class="color-collect" v-if="collectPickerShow && collectColorListCalc.length">
                    <div class="color-label">收藏</div>
                    <div class="color-collect-value">
                        <div class="color-collect-container" v-for="(color, index) in collectColorListCalc" :key="index" :class="getRadiusClass(index, collectColorListCalc, 10, true)">
                            <div class="color-box"  :style="{background: colorListFilter(color)}" @click="chooseListColor(color)"></div>
                            <div class="color-collect-cancel-mask" v-if="isCancelingCollect" @click.stop="cancelCollect(color)">
                                <svg class="color-icon">
                                    <use xlink:href="#svg-ele-reduce"></use>
                                </svg>
                            </div>
                        </div>
                        <div class="color-collect-cancel" @click="isCancelingCollect = !isCancelingCollect" :class="delBtnClass">
                            <svg class="color-icon">
                                <use xlink:href="#svg-color-removecollect"></use>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    `,
    mixins: [Ktu.mixins.colorCtrl, Ktu.mixins.dataHandler],
    props: {
        value: Object,
        themePickerShow: Boolean,
        themeColorList: Array,
        collectPickerShow: Boolean,
    },
    data() {
        return {
            // 线性渐变色与预设值
            linearColorList: [
                {
                    id: 0,
                    from: '#FFD500',
                    to: '#FF9100',
                },
                {
                    id: 1,
                    from: '#FFF6B7',
                    to: '#EA5455',
                },
                {
                    id: 2,
                    from: '#5EFCE8',
                    to: '#736EFE',
                },
                {
                    id: 3,
                    from: '#68D1FF',
                    to: '#008FEE',
                },
                {
                    id: 4,
                    from: '#FEC163',
                    to: '#DE4313',
                },
                {
                    id: 5,
                    from: '#FD6585',
                    to: '#0D25B9',
                },
                {
                    id: 6,
                    from: '#FAB2FF',
                    to: '#1904E5',
                },
                {
                    id: 7,
                    from: '#B465D9',
                    to: '#EE609C',
                },
                {
                    id: 8,
                    from: '#003CFF',
                    to: '#FF00F7',
                },
                {
                    id: 9,
                    from: '#65FDF0',
                    to: '#1D6FA3',
                },
                {
                    id: 10,
                    from: '#FF9F9F',
                    to: '#FF3D3D',
                },
                {
                    id: 11,
                    from: '#FF9A9E',
                    to: '#FAD0C4',
                },
                {
                    id: 12,
                    from: '#84FAB0',
                    to: '#8FD3F4',
                },
                {
                    id: 13,
                    from: '#FA709A',
                    to: '#FEE140',
                },
                {
                    id: 14,
                    from: '#B721FF',
                    to: '#21D4FD',
                },
                {
                    id: 15,
                    from: '#3D42C4',
                    to: '#FCC6A9',
                },
                {
                    id: 16,
                    from: '#007ADF',
                    to: '#00ECBC',
                },
                {
                    id: 17,
                    from: '#FAD0C4',
                    to: '#EBA0FE',
                },
                {
                    id: 18,
                    from: '#FAD0C4',
                    to: '#FFD1FF',
                },
                {
                    id: 19,
                    from: '#43E97B',
                    to: '#38F9D7',
                },
                {
                    id: 20,
                    from: '#667EEA',
                    to: '#764BA2',
                },
                {
                    id: 21,
                    from: '#0BA360',
                    to: '#3CBA92',
                },
                {
                    id: 22,
                    from: '#00C6FB',
                    to: '#005BEA',
                },
                {
                    id: 23,
                    from: '#000000',
                    to: '#FFFFFF',
                },
            ],
            // 旋转角度
            angle: 0,
            // 旋转按钮列表
            rotateList: Ktu.config.tool.options.rotateList,
        };
    },
    computed: {
        linearValue() {
            return this.value;
        },
        collectColorListCalc() {
            return this.collectColorList.filter(item => item !== 'colorful');
        },
    },
    mounted() {
        this.angle = this.linearValue.angle.value || 0;
    },
    watch: {
        angle(value) {
            this.linearValue.angle.value = value;
        },
        linearValue(value) {
            this.angle = value.angle.value;
        },
    },
    methods: {
        rotate(value) {
            const self = this;

            const rotate = {
                increaseJudge(target, offset) {
                    if (target + offset >= 100) {
                        return 100;
                    } else if (target + offset <= 0) {
                        return 0;
                    }
                    return target + offset;
                },

                decreaseJudge(target, offset) {
                    if (target - offset >= 100) {
                        return 100;
                    } else if (target - offset <= 0) {
                        return 0;
                    }
                    return target - offset;
                },

                setAngle() {
                    const { increaseJudge, decreaseJudge } = rotate;

                    let angle = value;

                    angle > 360 && (angle -= 360) && (self.angle = 0);
                    angle < -360 && (angle += 360) && (self.angle = 0);

                    const step = 100 / 45;
                    const offsetAngle = angle - self.angle;
                    const offset = step * offsetAngle;

                    if ((angle >= 0 && angle <= 45) || (angle < -315 && angle >= -360)) {
                        self.linearValue.angle.x1 = 0;
                        self.linearValue.angle.y1 = 0;
                        self.linearValue.angle.x2 = 100;
                        self.linearValue.angle.y2 = increaseJudge(self.linearValue.angle.y2, offset);
                    } else if ((angle > 45 && angle <= 90) || (angle < -270 && angle >= -315)) {
                        self.linearValue.angle.x1 = 0;
                        self.linearValue.angle.y1 = 0;
                        self.linearValue.angle.x2 = decreaseJudge(self.linearValue.angle.x2, offset);
                        self.linearValue.angle.y2 = 100;
                    } else if ((angle > 90 && angle <= 135) || (angle < -225 && angle >= -270)) {
                        self.linearValue.angle.x1 = increaseJudge(self.linearValue.angle.x1, offset);
                        self.linearValue.angle.y1 = 0;
                        self.linearValue.angle.x2 = 0;
                        self.linearValue.angle.y2 = 100;
                    } else if ((angle > 135 && angle <= 180) || (angle < -180 && angle >= -225)) {
                        self.linearValue.angle.x1 = 100;
                        self.linearValue.angle.y1 = 0;
                        self.linearValue.angle.x2 = 0;
                        self.linearValue.angle.y2 = decreaseJudge(self.linearValue.angle.y2, offset);
                    } else if ((angle > 180 && angle <= 225) || (angle < -135 && angle >= -180)) {
                        self.linearValue.angle.x1 = 100;
                        self.linearValue.angle.y1 = increaseJudge(self.linearValue.angle.y1, offset);
                        self.linearValue.angle.x2 = 0;
                        self.linearValue.angle.y2 = 0;
                    } else if ((angle > 225 && angle <= 270) || (angle < -90 && angle >= -135)) {
                        self.linearValue.angle.x1 = decreaseJudge(self.linearValue.angle.x1, offset);
                        self.linearValue.angle.y1 = 100;
                        self.linearValue.angle.x2 = 0;
                        self.linearValue.angle.y2 = 0;
                    } else if ((angle > 270 && angle <= 315) || (angle < -45 && angle >= -90)) {
                        self.linearValue.angle.x1 = 0;
                        self.linearValue.angle.y1 = 100;
                        self.linearValue.angle.x2 = increaseJudge(self.linearValue.angle.x2, offset);
                        self.linearValue.angle.y2 = 0;
                    } else if ((angle > 315 && angle <= 360) || (angle < 0 && angle >= -45)) {
                        self.linearValue.angle.x1 = 0;
                        self.linearValue.angle.y1 = decreaseJudge(self.linearValue.angle.y1, offset);
                        self.linearValue.angle.x2 = 100;
                        self.linearValue.angle.y2 = 0;
                    } else if (angle > 360 || angle < -360) {
                        self.linearValue.angle.x1 = 0;
                        self.linearValue.angle.y1 = 0;
                        self.linearValue.angle.x2 = 100;
                        self.linearValue.angle.y2 = 0;
                    }

                    self.angle = angle;
                },

                right() {
                    let angle = self.angle >= 360 ? self.angle - 360 : self.angle;
                    const angleCopy = angle;

                    if (angle < 0) {
                        angle = angle + 360;
                    }
                    if (angle >= 0 && angle < 45) {
                        self.linearValue.angle.x1 = self.linearValue.angle.y2;
                        self.linearValue.angle.x2 = 0;
                        self.linearValue.angle.y2 = 100;
                    } else if (angle >= 45 && angle < 90) {
                        self.linearValue.angle.y2 = self.linearValue.angle.x2;
                        self.linearValue.angle.x1 = 100;
                        self.linearValue.angle.x2 = 0;
                    } else if (angle >= 90 && angle < 135) {
                        self.linearValue.angle.y1 = self.linearValue.angle.x1;
                        self.linearValue.angle.x1 = 100;
                        self.linearValue.angle.y2 = 0;
                    } else if (angle >= 135 && angle < 180) {
                        self.linearValue.angle.x1 = self.linearValue.angle.y2;
                        self.linearValue.angle.y1 = 100;
                        self.linearValue.angle.y2 = 0;
                    } else if (angle >= 180 && angle < 225) {
                        self.linearValue.angle.x2 = self.linearValue.angle.y1;
                        self.linearValue.angle.x1 = 0;
                        self.linearValue.angle.y1 = 100;
                    } else if (angle >= 225 && angle < 270) {
                        self.linearValue.angle.y1 = self.linearValue.angle.x1;
                        self.linearValue.angle.x1 = 0;
                        self.linearValue.angle.x2 = 100;
                    } else if (angle >= 270 && angle < 315) {
                        self.linearValue.angle.y2 = self.linearValue.angle.x2;
                        self.linearValue.angle.x2 = 100;
                        self.linearValue.angle.y1 = 0;
                    } else if (angle >= 315 && angle < 360) {
                        self.linearValue.angle.x2 = self.linearValue.angle.y1;
                        self.linearValue.angle.y1 = 0;
                        self.linearValue.angle.y2 = 100;
                    }

                    self.angle = angleCopy + 90 > 360 ? angleCopy - 270 : angleCopy + 90;
                },

                left() {
                    let angle = self.angle <= -360 ? self.angle + 360 : self.angle;
                    const angleCopy = angle;

                    if (angle > 0) {
                        angle = angle - 360;
                    }
                    if (angle <= 0 && angle > -45) {
                        self.linearValue.angle.x1 = self.linearValue.angle.y1;
                        self.linearValue.angle.x2 = 0;
                        self.linearValue.angle.y1 = 100;
                    } else if (angle <= -45 && angle > -90) {
                        self.linearValue.angle.y1 = self.linearValue.angle.x2;
                        self.linearValue.angle.x1 = 100;
                        self.linearValue.angle.x2 = 0;
                    } else if (angle <= -90 && angle > -135) {
                        self.linearValue.angle.y2 = self.linearValue.angle.x1;
                        self.linearValue.angle.x1 = 100;
                        self.linearValue.angle.y1 = 0;
                    } else if (angle <= -135 && angle > -180) {
                        self.linearValue.angle.x1 = self.linearValue.angle.y1;
                        self.linearValue.angle.y1 = 0;
                        self.linearValue.angle.y2 = 100;
                    } else if (angle <= -180 && angle > -225) {
                        self.linearValue.angle.x2 = self.linearValue.angle.y2;
                        self.linearValue.angle.x1 = 0;
                        self.linearValue.angle.y2 = 100;
                    } else if (angle <= -225 && angle > -270) {
                        self.linearValue.angle.y2 = self.linearValue.angle.x1;
                        self.linearValue.angle.x1 = 0;
                        self.linearValue.angle.x2 = 100;
                    } else if (angle <= -270 && angle > -315) {
                        self.linearValue.angle.y1 = self.linearValue.angle.x2;
                        self.linearValue.angle.x2 = 100;
                        self.linearValue.angle.y2 = 0;
                    } else if (angle <= -315 && angle > -360) {
                        self.linearValue.angle.x2 = self.linearValue.angle.y2;
                        self.linearValue.angle.y1 = 100;
                        self.linearValue.angle.y2 = 0;
                    }

                    self.angle = angleCopy - 90 < -360 ? angleCopy + 270 : angleCopy - 90;
                },

                horizontal() {
                    let calcAngle = 0;
                    let { angle } = self;
                    const angleCopy = angle;

                    if (angle === 90 || angle === 270 || angle === -90 || angle === -270) return;

                    // 计算翻转时的度数差，先以当前角度是否为正做区分，再以当前角度与180度比较作区分
                    if (angle >= 0) {
                        calcAngle = angle <= 180 ? angle : angle - 180;
                    } else {
                        calcAngle = angle >= -180 ? -angle : -angle - 180;
                        angle = angle + 360;
                    }

                    const offsetAngle = (90 - calcAngle) * 2;

                    if ((angle >= 0 && angle <= 45) || (angle > 315 && angle <= 360)) {
                        self.linearValue.angle.x1 = 100;
                        self.linearValue.angle.x2 = 0;
                    } else if ((angle > 45 && angle < 90) || (angle > 270 && angle <= 315)) {
                        self.linearValue.angle.x1 = 100;
                        self.linearValue.angle.x2 = 100 - self.linearValue.angle.x2;
                    } else if ((angle > 90 && angle <= 135) || (angle > 225 && angle < 270)) {
                        self.linearValue.angle.x1 = 0;
                        self.linearValue.angle.x2 = 100 - self.linearValue.angle.x2;
                    } else if (angle > 135 && angle <= 225) {
                        self.linearValue.angle.x1 = 0;
                        self.linearValue.angle.x2 = 100;
                    }

                    self.angle = angleCopy >= 0 ? angleCopy + offsetAngle : angleCopy - offsetAngle;
                },

                vertical() {
                    let offsetAngle = 0;
                    let { angle } = self;
                    const angleCopy = angle;

                    if (angle === 0 || angle === 180 || angle === 360 || angle === -180 || angle === -360) return;

                    // 计算翻转时的度数差，先以当前角度是否为正做区分，再以当前角度与180度比较作区分
                    if (angle >= 0) {
                        offsetAngle = (180 - angle) * 2;
                    } else {
                        offsetAngle = (180 + angle) * 2;
                        angle = angle + 360;
                    }

                    if (angle >= 0 && angle <= 45) {
                        self.linearValue.angle.y1 = 100;
                        self.linearValue.angle.y2 = 100 - self.linearValue.angle.y2;
                    } else if (angle > 45 && angle <= 135) {
                        self.linearValue.angle.y1 = 100;
                        self.linearValue.angle.y2 = 0;
                    } else if (angle > 135 && angle < 180) {
                        self.linearValue.angle.y1 = 100;
                        self.linearValue.angle.y2 = 100 - self.linearValue.angle.y2;
                    } else if (angle > 180 && angle <= 225) {
                        self.linearValue.angle.y1 = 0;
                        self.linearValue.angle.y2 = 100 - self.linearValue.angle.y2;
                    } else if (angle > 225 && angle <= 315) {
                        self.linearValue.angle.y1 = 0;
                        self.linearValue.angle.y2 = 100;
                    } else if (angle > 315 && angle <= 360) {
                        self.linearValue.angle.y1 = 100 - self.linearValue.angle.y1;
                        self.linearValue.angle.y2 = 100;
                    }

                    self.angle = angleCopy >= 0 ? angleCopy + offsetAngle : angleCopy - offsetAngle;
                },
            };

            typeof value === 'number' ? rotate.setAngle() : rotate[value]();
            this.updateColor(this.linearValue);
        },

        delBtnClass() {
            const {
                length,
            } = this.collectColorListCalc;
            const row = Math.ceil(length / this.colorEachRow);
            const remain = length % this.colorEachRow;
            const rowStr = row === 1 ? 'top-right-radius' : '';
            return remain === 0 ? 'bottom-left-radius' : rowStr;
        },
        updateColor(color) {
            this.$emit('update', color);
        },
        changeColor(color) {
            if (typeof color === 'string') {
                this.$emit('change', color);
            } else {
                this.linearValue.value = [
                    {
                        color: color.from,
                        percent: 0,
                    },
                    {
                        color: color.to,
                        percent: 100,
                    },
                ];
                this.$emit('change', this.linearValue);
            }
        },
    },
});
