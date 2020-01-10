(function () {
    const utils = {
        rgbaReg: /rgba|rgb/i,
        RGBToHex(rgb) {
            const hex = [
                rgb.r.toString(16),
                rgb.g.toString(16),
                rgb.b.toString(16),
            ];
            hex.forEach((val, index) => {
                val.length === 1 && (hex[index] = `0${val}`);
            });
            return `#${hex.join('')}`;
        },
        rgbToHex(rgb) {
            if (rgb.charAt(0) == '#') return rgb;
            rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+\.?\d*)[\s+]?,[\s+]?(\d+\.?\d*)[\s+]?,[\s+]?(\d+\.?\d*)[\s+]?/i);
            return (rgb && rgb.length === 4) ? `#${rgb.slice(1, 4).map(value => (`0${parseInt(value, 10).toString(16)}`).slice(-2))
                .join('')}` : '';
        },
        getThemeColor() {
            const colorList = [];
            const colorObject = {};
            const color = {
                add(colorStr) {
                    if (!colorStr) return;
                    if (!utils.rgbaReg.test(colorStr) && colorStr !== 'transparent' && !colorStr.includes('type')) {
                        // 不是rgba颜色的 转成hex格式
                        colorStr = Ktu.color.rgbToHex(colorStr);
                    }
                    if (!colorObject[colorStr]) {
                        colorList.push(colorStr);
                        colorObject[colorStr] = true;
                    }
                },
                textbox() {
                    color.other.call(this);
                    color.add(this.fill);
                    color.add(this.textBg);
                    /* if (this.styles) {
                        const { styles } = this;
                        for (const line in styles) {
                            for (const charIndex in line) {
                                color.add(line[charIndex].fill);
                            }
                        }
                    } */
                },
                'path-group': function () {
                    if (this.isOpenShadow) {
                        color.add(this.shadow.color);
                    }
                    let isAvailable = true;
                    const tmpColorList = [];
                    const colorKeys = Object.keys(this.changedColors);
                    if (!this.changedColors || !colorKeys.length) {
                        isAvailable = false;
                    } else {
                        for (let index = 0; index < colorKeys.length; index++) {
                            const colors = this.changedColors[index];
                            let fill;
                            let stroke;
                            if (!!colors) {
                                const colorArr = colors.split('||');
                                fill = colorArr[0];
                                stroke = colorArr[1];
                                if (!!fill && fill != 'none') {
                                    if (!utils.rgbaReg.test(fill)) {
                                        fill = Ktu.color.rgbToHex(fill);
                                    }
                                    tmpColorList.indexOf(fill) === -1 && tmpColorList.push(fill);
                                }
                                if (!!stroke && stroke != 'none') {
                                    if (!utils.rgbaReg.test(stroke)) {
                                        stroke = Ktu.color.rgbToHex(stroke);
                                    }
                                    tmpColorList.indexOf(stroke) === -1 && tmpColorList.push(stroke);
                                }
                            }
                            if (tmpColorList.length > 10) {
                                isAvailable = false;
                                break;
                            }
                        }
                    }
                    if (isAvailable) {
                        tmpColorList.forEach(color => {
                            if (!colorObject[color]) {
                                colorObject[color] = true;
                                colorList.push(color);
                            }
                        });
                    }
                },
                background() {
                    color.add(this.image ? '' : this.backgroundColor);
                },
                group() {
                    this.objects.forEach(object => {
                        if (object.type) {
                            if (color[object.type]) {
                                color[object.type].call(object);
                            } else {
                                color.other.call(object);
                            }
                        }
                    });
                },
                chart() {
                    color.add(this.msg.color);
                    color.add(this.msg.fontColor);
                    color.other.call(this);
                },
                wordart() {
                    const colorPrefix = 'original';
                    const loop = object => {
                        for (const prop of Object.keys(object)) {
                            if (typeof object[prop] === 'object') {
                                loop(object[prop]);
                            }
                            if (prop.includes(colorPrefix)) {
                                let colorPropName = prop.match(new RegExp(`${colorPrefix}(.+)`))[1];
                                colorPropName = colorPropName[0].toLowerCase() + colorPropName.slice(1);
                                color.add(object[colorPropName]);
                            }
                        }
                    };
                    loop(this.style.covers);
                },
                table() {
                    this.msg.tableData.dataList.forEach(row => {
                        row.forEach(item => {
                            color.add(item.bgColor);
                            color.add(item.borderTopColor);
                            if (item.object) {
                                color.add(item.object.fill);
                            }
                        });
                    });
                },
                other() {
                    if (this.fill) {
                        color.add(this.fill);
                    }
                    if (this.isOpenShadow) {
                        color.add(this.shadow.color);
                    }
                    if (this.strokeWidth) {
                        color.add(this.stroke);
                    }
                },
                threeText() {
                    if (this.frontMaterial && this.frontMaterial.use == 'color') {
                        color.add(this.frontMaterial.color);
                    }
                    if (this.sideMaterial && this.sideMaterial.use == 'color') {
                        color.add(this.sideMaterial.color);
                    }
                },
            };
            /* Ktu.templateData.indexOf(Ktu.selectedTemplateData)
               var objects = Ktu.selectedTemplateData.objects; */
            const objects = [];
            objects.push(Ktu.templateData[Ktu.templateData.indexOf(Ktu.selectedTemplateData)]);
            Ktu.templateData.forEach((item, index) => {
                if (index !== Ktu.templateData.indexOf(Ktu.selectedTemplateData)) {
                    objects.push(item);
                }
            });
            objects.forEach(object => {
                object.objects.forEach(object => {
                    if (object.type) {
                        if (color[object.type]) {
                            color[object.type].call(object);
                        } else {
                            color.other.call(object);
                        }
                    }
                });
            });
            return colorList;
        },
    };
    Vue.component('color-picker', {
        template: `
        <div class="color-picker tool-box" :class="{'hide-control-btn': hideControlBtn}" ref="colorPicker" :style="hideIcon?{background:'none'}:{}">
            <div class="color-btn" v-if="!hideControlBtn" :class="{'color-empty-background': value == 'transparent','big-color' : bigPicker, 'colorful': value === 'colorful', 'has-tips': tips, 'opened': isShow, 'gradient': gradientBtn}" :style="{background: btnValue}" @click="show($event,logType,colorType)" :tips="tips"></div>

            <transition :name="slideDirction">
                <div v-if="alwaysShow || isShow" ref="popup" class="color-panel" :style="[pannelStyle,offsetStyle]" :class="[{'reverseX': isNeedReverseX, 'reverseY': isNeedReverseY},direction]">
                    <div class="color-type-tab" v-if="isGradient">
                        <div :class="['type', {active: item.type===colorTabType}]" v-for="item in colorTab" :key="item.type" @click="colorTypeChange(item.type)">{{item.name}}</div>
                        <div class="tab-underline" :style="{width: tabUnderlineWidth + 'px', transform:'translate(' + tabUnderlinePoi + 'px,0)'}"></div>
                    </div>

                    <div class="color-panel-content" ref="colorPanelHeight" :style="colorPanelHeight">
                        <div class="color-base">
                            <slot></slot>

                            <pure-color
                                v-show="colorTabType===1"
                                :themePickerShow="themePickerShow"
                                :themeColorList="themeColorList"
                                :collectPickerShow="collectPickerShow"
                                :value="normalValue"
                                :defaultBtnShow="defaultBtnShow"
                                :colorAlphaShow="colorAlphaShow"
                                :isGradient="isGradient"
                                @change="changeColor"
                                @update="updateColor"
                            ></pure-color>

                            <linear-color
                                v-show="colorTabType===2"
                                :value="linearValue"
                                :themePickerShow="themePickerShow"
                                :themeColorList="themeColorList"
                                :collectPickerShow="collectPickerShow"
                                @change="changeColor"
                                @update="updateColor"
                                @resize="handleResize"
                            ></linear-color>

                            <radial-color
                                v-show="colorTabType===3"
                                :value="radialValue"
                                :themePickerShow="themePickerShow"
                                :themeColorList="themeColorList"
                                :collectPickerShow="collectPickerShow"
                                @change="changeColor"
                                @update="updateColor"
                                @resize="handleResize"
                            ></radial-color>
                        </div>
                    </div>

                    <transition name="slide-up">
                        <pure-color
                            v-show="gradientNodeIndex !== -1"
                            :class="['panel', {small: isSmallScreen}]"
                            :style="panelStyle"
                            ref="panel"
                            :themePickerShow="themePickerShow"
                            :themeColorList="themeColorList"
                            :collectPickerShow="collectPickerShow"
                            :value="activeNodeColor"
                            @change="updateNode"
                            @update="updateNode"
                            @showMore="handleShowMore"
                        ></pure-color>
                    </transition>
                </div>
            </transition>

        </div>
                    `,
        mixins: [Ktu.mixins.popupCtrl, Ktu.mixins.colorCtrl],
        props: {
            value: {
                type: [String, Object],
                default: '#175ce6',
            },
            bigPicker: false,
            tips: {
                type: String,
                default: '',
            },
            colorPickerShow: {
                type: Boolean,
                default: true,
            },
            colorAlphaShow: {
                type: Boolean,
                default: true,
            },
            themePickerShow: {
                type: Boolean,
                default: true,
            },
            collectPickerShow: {
                type: Boolean,
                default: true,
            },
            showQrCodeTip: {
                type: Boolean,
                default: false,
            },
            artQrCode: {
                type: Boolean,
                default: false,
            },
            direction: {
                type: String,
                default: 'normal',
            },
            // 前景色或是背景色
            colorType: String,
            // log类型
            logType: String,
            defaultBtnShow: {
                type: Boolean,
                default: false,
            },
            hideIcon: {
                type: Boolean,
                default: false,
            },
            // 隐藏控制出现色板的按钮，同时顺便也去掉色板的箭头和border-top
            hideControlBtn: {
                type: Boolean,
                default: false,
            },
            // 需要将它嵌入到某一个选项卡里面，所以只能是常驻的，不被隐藏
            alwaysShow: {
                type: Boolean,
                default: false,
            },
            // 是否支持渐变色，不支持则隐藏色板的选择tab
            isGradient: {
                type: Boolean,
                default: false,
            },
        },
        data() {
            return {
                hasShowMore: false,
                themeColorList: utils.getThemeColor(),
                offsetStyle: null,
                colorEachRow: 10,
                popUpWidth: 488,
                editHeight: Ktu.edit.size.height,
                colorTab: [{
                    type: 1,
                    name: '纯色',
                },
                {
                    type: 2,
                    name: '线性渐变',
                },
                {
                    type: 3,
                    name: '径向渐变',
                },
                ],
                colorTabType: 1,
                // 初始化颜色数据，切换tab时记录纯色值；
                tmpNormalValue: typeof this.value === 'string' && !this.value.includes('type') ? this.value : 'rgb(216, 27, 67)',
                tmpLinearValue: {
                    type: 'linear',
                    value: [{
                        color: '#FFD500',
                        percent: 0,
                    },
                    {
                        color: '#FF9100',
                        percent: 100,
                    },
                    ],
                    angle: {
                        x1: 0,
                        y1: 0,
                        x2: 100,
                        y2: 0,
                        value: 0,
                    },
                },
                tmpRadialValue: {
                    type: 'radial',
                    value: [{
                        color: '#FFD500',
                        percent: 0,
                    },
                    {
                        color: '#FF9100',
                        percent: 100,
                    },
                    ],
                    direct: {
                        cx: '50',
                        cy: '50',
                        r: '50',
                        index: 4,
                    },
                },
                // 小屏判断
                isSmallScreen: false,
                isShowMore: false,
            };
        },
        computed: {
            slideDirction() {
                return this.direction == 'normal' ? 'slide-up' : 'slide-down';
            },
            panelHeight() {
                if (this.hasShowMore) {
                    return this.colorAlphaShow ? 388 : 356;
                }
                return this.$refs.popup.clientHeight;
            },
            pannelStyle() {
                return {
                    height: this.isShowMore ? `${this.panelHeight}px` : 'auto',
                };
            },
            normalValue() {
                return !this.value.includes('type') ? this.value : this.tmpNormalValue;
            },
            linearValue() {
                return this.value.includes('linear') ? JSON.parse(this.value) : this.tmpLinearValue;
            },
            radialValue() {
                return this.value.includes('radial') ? JSON.parse(this.value) : this.tmpRadialValue;
            },
            btnValue() {
                if (this.value === 'colorful') return;
                if (this.value === 'transparent') return;
                if (typeof this.value === 'string' && !this.value.includes('type')) {
                    return this.value;
                };
                const value = JSON.parse(this.value);
                if (value.type === 'linear') {
                    let linear = 'linear-gradient(to right,';
                    value.value.forEach((item, index, arr) => {
                        linear += item.color;
                        if (index !== arr.length - 1) linear += ',';
                    });
                    linear += ')';
                    return linear;
                }
                let radial = 'radial-gradient(circle,';
                value.value.forEach((item, index, arr) => {
                    radial += item.color;
                    if (index !== arr.length - 1) radial += ',';
                });
                radial += ')';
                return radial;
            },
            gradientBtn() {
                if (this.value.includes('type')) {
                    return true;
                }
                return false;
            },
            tabUnderlinePoi() {
                switch (this.colorTabType) {
                    case 1:
                        return 34;
                    case 2:
                        return 114;
                    case 3:
                        return 206;
                }
            },
            tabUnderlineWidth() {
                switch (this.colorTabType) {
                    case 1:
                        return 24;
                    case 2:
                        return 48;
                    case 3:
                        return 48;
                }
            },
            colorPanelHeight() {
                const height = `${this.editSize.height - 395}px`;
                return {
                    maxHeight: height,
                };
            },
            editSize() {
                return this.$store.state.base.edit.size;
            },
            gradientNodeIndex: {
                get() {
                    return this.$store.state.base.gradientNodeIndex;
                },
                set(value) {
                    this.$store.state.base.gradientNodeIndex = value;
                },
            },
            activeNodeColor() {
                if (this.gradientNodeIndex === -1) return '';
                if (this.colorTabType === 3) {
                    return this.radialValue.value[this.gradientNodeIndex].color;
                }
                return this.linearValue.value[this.gradientNodeIndex].color;
            },
            /* colorPanelLeft() {
                return this.$store.state.base.colorPanelLeft;
            }, */
            panelStyle() {
                return {
                    height: this.isShowMore ? '392px' : 'auto',
                    top: this.isGradient ? '182px' : '144px',
                };
            },
        },
        watch: {
            isShow(newValue) {
                if (!newValue) {
                    this.isShowMore = false;
                    this.hasShowMore = false;
                } else {
                    // 对齐编辑区域的边界，避免被裁剪
                    if (this.isNeedAlainTop && this.isNeedReverseY && document.getElementById('toolBar')) {
                        this.offsetStyle = {
                            top: `${106 - this.$refs.colorPicker.getBoundingClientRect().top}px`,
                            left: '32px',
                            transform: 'translate(0, 0)',
                        };
                    }
                    this.themeColorList = utils.getThemeColor();
                }
                this.$emit('show', newValue);
            },
            gradientNodeIndex(value) {
                if (value !== -1) {
                    document.addEventListener('mousedown', this.logMouseCoords);
                    document.addEventListener('click', this.closePanel);
                } else {
                    document.addEventListener('mousedown', this.logMouseCoords);
                    document.removeEventListener('click', this.closePanel);
                }
            },
            value() {
                this.judeColorType();
            },
        },
        mounted() {
            this.judeColorType();

            if (this.value === 'colorful') {
                this.colorTabType = 1;
            }

            window.addEventListener('resize', this.handleResize);
            if (window.innerHeight <= 800) {
                this.isSmallScreen = true;
            }
        },
        destroyed() {
            window.removeEventListener('resize', this.handleResize);
        },
        methods: {
            handleResize() {
                if (window.innerHeight <= 800) {
                    this.isSmallScreen = true;
                } else {
                    this.isSmallScreen = false;
                }
            },
            judeColorType() {
                if (this.value.includes('linear')) {
                    this.colorTabType = 2;
                } else if (this.value.includes('radial')) {
                    this.colorTabType = 3;
                } else {
                    this.colorTabType = 1;
                }
            },
            updateColor(color) {
                this.$emit('input', typeof color === 'string' ? color : JSON.stringify(color));
                this.$emit('change');
            },
            changeColor(color) {
                if (typeof color === 'string') {
                    this.tmpNormalValue = color;
                    this.updateColor(color);
                } else if (color.type === 'linear') {
                    this.tmpLinearValue = color;
                    this.updateColor(color);
                } else {
                    this.tmpRadialValue = color;
                    this.updateColor(color);
                }
            },
            colorTypeChange(type) {
                this.colorTabType = type;
            },
            updateNode(color) {
                if (this.gradientNodeIndex === -1) return;

                let value = null;
                if (this.colorTabType === 2) {
                    value = this.linearValue.value;
                    value[this.gradientNodeIndex].color = color;
                    this.$set(this.linearValue, 'value', value);
                    this.updateColor(this.linearValue);
                } else if (this.colorTabType === 3) {
                    value = this.radialValue.value;
                    value[this.gradientNodeIndex].color = color;
                    this.$set(this.radialValue, 'value', value);
                    this.updateColor(this.radialValue);
                }
            },
            closePanel(event) {
                const {
                    target,
                } = event;

                if (Math.abs(event.clientX - this.mouseCoords.x) < 3 && Math.abs(event.clientY - this.mouseCoords.y) < 3) {
                    if (this.$refs.panel) {
                        if (target !== this.$refs.panel && !this.$refs.panel.$el.contains(target)) {
                            this.gradientNodeIndex = -1;
                        }
                    }
                }
            },
            handleShowMore(value) {
                this.isShowMore = value;
            },
        },
    });
}());
