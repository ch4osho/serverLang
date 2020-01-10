(function () {
    const utils = {
        radius: 120,
        rectSize: {
            w: 240,
            h: 220,
        },
        slideRadius: 8,
        boardClientRect: null,
        rgbaReg: /rgba|rgb/i,
        hslReg: /^hsl/i,
        HSBToRGB(hsb) {
            const rgb = {};
            let h = Math.round(hsb.h);
            const s = Math.round(hsb.s * 255 / 100);
            const v = Math.round(hsb.b * 255 / 100);
            if (s == 0) {
                rgb.b = v;
                rgb.g = rgb.b;
                rgb.r = rgb.g;
            } else {
                const t1 = v;
                const t2 = (255 - s) * v / 255;
                const t3 = (t1 - t2) * (h % 60) / 60;
                if (h == 360) h = 0;
                if (h < 60) {
                    rgb.r = t1;
                    rgb.b = t2;
                    rgb.g = t2 + t3;
                } else if (h < 120) {
                    rgb.g = t1;
                    rgb.b = t2;
                    rgb.r = t1 - t3;
                } else if (h < 180) {
                    rgb.g = t1;
                    rgb.r = t2;
                    rgb.b = t2 + t3;
                } else if (h < 240) {
                    rgb.b = t1;
                    rgb.r = t2;
                    rgb.g = t1 - t3;
                } else if (h < 300) {
                    rgb.b = t1;
                    rgb.g = t2;
                    rgb.r = t2 + t3;
                } else if (h < 360) {
                    rgb.r = t1;
                    rgb.g = t2;
                    rgb.b = t1 - t3;
                } else {
                    rgb.r = 0;
                    rgb.g = 0;
                    rgb.b = 0;
                }
            }
            return {
                r: Math.round(rgb.r),
                g: Math.round(rgb.g),
                b: Math.round(rgb.b),
            };
        },
        HSBToHex(hsb) {
            return this.RGBToHex(this.HSBToRGB(hsb));
        },
        RGBToHSB(rgb) {
            const hsb = {
                h: 0,
                s: 0,
                b: 0,
            };
            const min = Math.min(rgb.r, rgb.g, rgb.b);
            const max = Math.max(rgb.r, rgb.g, rgb.b);
            const delta = max - min;
            hsb.b = max;
            if (max != 0) { }
            hsb.s = max != 0 ? 255 * delta / max : 0;
            if (hsb.s != 0) {
                if (rgb.r == max) {
                    hsb.h = (rgb.g - rgb.b) / delta;
                } else if (rgb.g == max) {
                    hsb.h = 2 + (rgb.b - rgb.r) / delta;
                } else {
                    hsb.h = 4 + (rgb.r - rgb.g) / delta;
                }
            } else {
                hsb.h = -1;
            }
            hsb.h *= 60;
            if (hsb.h < 0) {
                hsb.h += 360;
            }
            hsb.s *= 100 / 255;
            hsb.b *= 100 / 255;
            return hsb;
        },
        /**
         * hsl 转换 rgb 格式
         * h, s, 和 l 需要在 [0, 1] 之间
         * 返回的 r, g, 和 b 在 [0, 255] 范围内
         */
        HSLToRGB(hsl) {
            const {
                h,
                s,
                l,
            } = hsl;
            let r;
            let g;
            let b;
            if (s == 0) {
                // achromatic
                b = l;
                g = b;
                r = g;
            } else {
                const hue2rgb = function hue2rgb(p, q, t) {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1 / 6) return p + (q - p) * 6 * t;
                    if (t < 1 / 2) return q;
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                };
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }
            return {
                r: Math.round(r * 255),
                g: Math.round(g * 255),
                b: Math.round(b * 255),
            };
        },
        HSLToHex(hsl) {
            return this.RGBToHex(this.HSLToRGB(hsl));
        },
        /**
         * rgb 转换 hsl 格式
         * r, g, 和 b 需要在 [0, 255] 范围内
         * 返回的 h, s, 和 l 在 [0, 1] 之间
         */
        RGBToHSL(rgb) {
            let {
                r,
                g,
                b,
            } = rgb;
            r /= 255, g /= 255, b /= 255;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h;
            let s;
            const l = (max + min) / 2;
            if (max == min) {
                // achromatic
                s = 0;
                h = s;
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r:
                        h = (g - b) / d + (g < b ? 6 : 0);
                        break;
                    case g:
                        h = (b - r) / d + 2;
                        break;
                    case b:
                        h = (r - g) / d + 4;
                        break;
                }
                h /= 6;
            }
            return {
                h,
                s,
                l,
            };
        },
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
        HexToHSB(hex) {
            return this.RGBToHSB(this.HexToRGB(hex));
        },
        HexToHSL(hex) {
            if (hex === 'colorful') hex = 'transparent';
            return this.RGBToHSL(this.HexToRGB(hex));
        },
        fixHSB(hsb) {
            return {
                h: Math.min(360, Math.max(0, hsb.h)),
                s: Math.min(100, Math.max(0, hsb.s)),
                b: Math.min(100, Math.max(0, hsb.b)),
            };
        },
        fixHSL(hsl) {
            return {
                h: Math.min(1, Math.max(0, hsl.h)),
                s: Math.min(1, Math.max(0, hsl.s)),
                l: Math.min(1, Math.max(0, hsl.l)),
            };
        },
        getXY(pageXY) {
            const clientRect = this.boardClientRect;
            return {
                /* x: pageXY.x - clientRect.left - this.radius,
                   y: pageXY.y - clientRect.top - this.radius */
                x: pageXY.x - clientRect.left,
                y: pageXY.y - clientRect.top,
            };
        },
        getSatInCircle(pageXY) {
            const XY = this.getXY(pageXY);
            const {
                x,
            } = XY;
            const {
                y,
            } = XY;
            return Math.sqrt(x * x + y * y);
        },
        getHueInCircle(pageXY) {
            const XY = this.getXY(pageXY);
            const {
                x,
            } = XY;
            const {
                y,
            } = XY;
            let arc = Math.round(Math.atan2(y, x) * 180 / Math.PI);
            y < 0 && (arc += 360);
            return arc;
        },
        getSatInRect(y) {
            return 1 - y / this.rectSize.h;
        },
        getHueInRect(x) {
            return x / this.rectSize.w;
        },
        getHSB(pageXY, brightness) {
            return this.fixHSB({
                h: parseInt(this.getHueInCircle(pageXY), 10),
                s: parseInt(100 * this.getSatInCircle(pageXY) / this.radius, 10),
                b: brightness,
            });
        },
        getHSL(pageXY, lightness) {
            return this.fixHSL({
                h: this.getHueInRect(pageXY.x),
                s: this.getSatInRect(pageXY.y),
                l: lightness,
            });
        },
        hsbToPosition(hsb) {
            const arc = (2 * Math.PI / 360) * hsb.h;
            const r = hsb.s;
            // r > 83 && (r = 83);
            const y = Math.sin(arc) * r + this.radius;
            const x = Math.cos(arc) * r + this.radius;
            return {
                left: x,
                top: y,
            };
        },
        hslToPosition(hsl) {
            const x = hsl.h * this.rectSize.w;
            const y = this.rectSize.h * (1 - hsl.s);
            return {
                left: x,
                top: y,
            };
        },
        getAlpha(color) {
            if (typeof color !== 'string') return;
            let alpha = 1;
            if (this.rgbaReg.test(color)) {
                const rgb = color.match(/(\d(\.\d+)?)+/g);
                alpha = rgb[3];
                if (alpha === undefined) {
                    alpha = 1;
                }
            }
            return +alpha;
        },
    };
    Vue.component('pure-color', {
        template: `
            <transition name="color-fade">
                <div class="normal-color">
                    <div class="color-base" v-show="isShowBase">
                        <div class="color-default">
                            <div class="color-default-column" v-for="(colorCol, index) in defaultColorList" :key="index">
                                <div class="color-box" v-for="(color, index) in colorCol" :style="{backgroundColor: color}" :key="index" :class="color === 'transparent' || color === 'colorful' ? color : ''" @click.stop="changeColor(color)"></div>
                            </div>
                        </div>
                        <div class="color-setting">
                            <div class="color-setting-container">
                                <div class="color-setting-value">
                                    <div class="color-setting-bg" :class="alpha==0 || value == 'transparent'|| value == 'colorful' || value == 'default' ? 'color-empty-background' : ''" :style="{backgroundColor: value}"></div>
                                </div>
                                <div :class="['color-collect-btn', {colorful: value === 'colorful'}]" @click="collectColor">
                                    <svg class="color-icon">
                                        <use xlink:href="#svg-color-collect"></use>
                                    </svg>
                                </div>
                            </div>
                        
                            <span class="color-setting-label">#</span>
                            <validate-input :maxLength="6" valType="color" class="color-input" :size="inputSize" :inputVal="baseColor | colorFormat" @input="changeColor"></validate-input>
                            <div class="color-setting-picker" ref="picker" @click="pickColor" @mousedown.stop :class="{checked: isPickingColor}" title="取色器" v-if="pickerShow">
                                <svg class="color-icon">
                                    <use xlink:href="#svg-color-picker"></use>
                                </svg>
                            </div>
                        </div>
                        <div class="color-slide color-base-slide" ref="lightness" :style="{backgroundColor: baseValue,backgroundImage:lightnessGradient}" @mousedown="lightnessDown" @mousewheel.prevent="lightnessWheel">
                            <div class="color-slide-indicate" :style="{left: lightnessLeft+'px'}"></div>
                        </div>
                        <div v-if="alphaShow" class="color-slide color-alpha-slide color-base-slide" ref="alpha" @mousedown="alphaDown" @mousewheel.prevent="alphaWheel">
                            <div class="color-alpha-bg" :style="{backgroundImage:alphaGradient}"></div>
                            <ktu-toolTip class="alpha-tip" :content="parseInt(alpha*100) + '%'" placement="top" :style="{left:alphaIndicateStyle.left}">
                                <div class="color-slide-indicate" :style="{'background-color':alphaIndicateStyle.backgroundColor}"></div>
                            </ktu-toolTip>
                        </div>
                        <div class="color-theme" v-if="themePickerShow && pureThemeColorList.length > 0">
                            <div class="color-label">主题色</div>
                            <div class="color-theme-value">
                                <div class="color-theme-container" v-for="(color, index) in pureThemeColorList" :key="index" @click="chooseListColor(color)" :class="getRadiusClass(index, pureThemeColorList, 10, false)">
                                    <div class="color-box" :style="{background: colorListFilter(color)}"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="color-collect" v-if="pickerShow && collectColorListCalc.length">
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
                        <div class="color-default-btn" v-if="defaultBtnShow">
                            <div class="color-default-btn-line"></div>
                            <div class="color-default-btn-title" @click="changeColor('transparent')">恢复默认</div>
                        </div>
                    </div>

                    <transition name="color-fade-delay">
                        <div class="color-more" v-if="isShowMore">
                            <div class="color-more-header">
                                <svg class="goback" @click="backToBaseColor">
                                    <use xlink:href="#svg-color-back"></use>
                                </svg>
                                <div class="text">自定义颜色</div>
                            </div>
                            <div class="color-more-board" @mousedown="boardDown">
                                <div class="color-more-circle" ref="board">
                                    <div class="color-more-circle-indicate" :style="{left: hsPosition.left+'px', top: hsPosition.top+'px'}"></div>
                                </div>
                            </div>
                            <div class="color-slide" ref="lightnessMore" :style="{backgroundColor: baseValue,backgroundImage:lightnessGradient}" @mousedown="lightnessDown" @mousewheel.prevent="lightnessWheel">
                                <div class="color-slide-indicate" :style="{left: lightnessLeft+'px'}"></div>
                            </div>
                            <div class="color-slide color-alpha-slide" v-if="colorAlphaShow" ref="alphaMore" @mousedown="alphaDown" @mousewheel.prevent="alphaWheel">
                                <div class="color-alpha-bg" :style="{backgroundImage:alphaGradient}" ></div>
                                <ktu-toolTip class="alpha-tip" :content="parseInt(alpha*100) + '%'" placement="top" :style="{left:alphaIndicateStyle.left}">
                                    <div class="color-slide-indicate" :style="{'background-color':alphaIndicateStyle.backgroundColor}"></div>
                                </ktu-toolTip>
                            </div>

                            <div class="color-more-setting">
                                <div class="setting-left">
                                    <div class="color-more-setting-tips">色值#</div>
                                    <validate-input :maxLength="6" valType="color" class="color-input" :size="inputSize" :inputVal="baseColor | colorFormat" @input="changeColor"></validate-input>
                                    <div class="color-collect-btn" @click="collectColor">
                                        <svg class="color-icon">
                                            <use xlink:href="#svg-color-collect"></use>
                                        </svg>
                                    </div>
                                </div>
                                <div class="setting-right color-setting-picker" ref="picker" @click="pickColor" @mousedown.stop :class="{checked: isPickingColor}" title="取色器" v-if="colorPickerShow">
                                    <svg class="color-icon">
                                        <use xlink:href="#svg-color-picker"></use>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </transition>
                </div>
            </transition>
        `,
        mixins: [Ktu.mixins.colorCtrl],
        props: {
            themePickerShow: Boolean,
            themeColorList: Array,
            value: String,
            pickerShow: {
                type: Boolean,
                default: true,
            },
            alphaShow: {
                type: Boolean,
                default: true,
            },
            defaultBtnShow: {
                type: Boolean,
                default: false,
            },
            colorPickerShow: {
                type: Boolean,
                default: true,
            },
            colorAlphaShow: {
                type: Boolean,
                default: true,
            },
            isGradient: {
                type: Boolean,
                default: false,
            },
        },
        data() {
            return {
                defaultColorList: [
                    ['#d81b43', '#e91e4e', '#ec4064', '#f0627d', '#f48fa0', 'transparent'],
                    ['#8e24aa', '#9c27b0', '#ab47bc', '#ba68c8', '#ce93d8', '#ffffff'],
                    ['#512da8', '#5e35b1', '#673ab7', '#7e57c2', '#9575cd', '#b5b6b6'],
                    ['#303f9f', '#3949ab', '#5c6bc0', '#7986cb', '#9fa8da', '#898989'],
                    ['#1e88e5', '#2196f3', '#42a5f5', '#64b5f6', '#90caf9', '#5a5a5a'],
                    ['#00897b', '#009688', '#26a69a', '#80cbc4', '#b2dfdb', '#373737'],
                    ['#43a047', '#4caf50', '#81c784', '#a5d6a7', '#c8e6c9', '#232323'],
                    ['#fbc02d', '#fdd835', '#ffeb3b', '#fff176', '#fff59d', '#161616'],
                    ['#f57c00', '#fb8c00', '#ffa726', '#ffb74d', '#ffcc80', '#000000'],
                    ['#e64a19', '#f4511e', '#ff5722', '#ff8a65', '#ffab91', 'colorful'],
                ],
                isShowMore: false,
                inputSize: 3,
                hsl: utils.rgbaReg.test(this.value) ? utils.HexToHSL(utils.rgbToHex(this.value)) : utils.HexToHSL(this.value),
                isShowBase: true,
                alpha: utils.getAlpha(this.value),
                pageXY: null,
                lightnessRef: null,
                boardRef: null,
                alphaRef: null,
                pickerRef: null,
            };
        },
        computed: {
            // 根据 value 反应出的 十六进制颜色
            baseColor() {
                if (typeof this.value === 'string') {
                    if (this.value.toUpperCase() == 'TRANSPARENT' || this.value.toUpperCase() == 'COLORFUL') {
                        this.inputSize = 11;
                    } else {
                        this.inputSize = 3;
                    }
                    if (utils.rgbaReg.test(this.value)) {
                        return utils.rgbToHex(this.value);
                    }
                    return this.value;
                }
                return this.tmpNormalValue;
            },
            // 根据 hsl 反应出的基础色系 主要用在slide上
            baseValue() {
                /* var hsb = JSON.parse(JSON.stringify(this.hsb));
                hsb.b = 100; */

                const hsl = JSON.parse(JSON.stringify(this.hsl));
                // hsl.l = 0.5;
                return utils.HSLToHex(hsl);
            },
            emptyBackground() {
                if (this.alpha == 0) {
                    return 'color-empty-background';
                }
            },
            hsPosition() {
                // return utils.hsbToPosition(this.hsb);
                if (this.pageXY) {
                    return {
                        left: this.pageXY.x,
                        top: this.pageXY.y,
                    };
                }
                return utils.hslToPosition(this.hsl);
            },
            lightnessGradient() {
                return `linear-gradient(to right, #fff,${this.baseValue},#000)`;
            },
            lightnessLeft() {
                const maxLeft = utils.radius * 2 - utils.slideRadius * 2;
                const maxL = 100;
                const radio = maxLeft / maxL;
                return maxLeft - (this.hsl.l * radio * 100);
            },
            alphaGradient() {
                return `linear-gradient(to right, rgba(255,255,255,0),${this.baseValue})`;
            },
            alphaLeft() {
                const maxLeft = utils.radius * 2 - utils.slideRadius * 2;
                const maxL = 100;
                const radio = maxLeft / maxL;
                return maxLeft - ((1 - this.alpha) * radio * 100);
            },
            alphaIndicateStyle() {
                const maxLeft = utils.radius * 2 - utils.slideRadius * 2;
                const maxL = 100;
                const radio = maxLeft / maxL;
                return {
                    left: `${maxLeft - ((1 - this.alpha) * radio * 100)}px`,
                    backgroundColor: this.alpha === 1 ? 'transparent' : `rgba(255,255,255,${1 - this.alpha})`,
                };
            },
            isPickingColor: {
                get() {
                    return this.$store.state.base.isPickingColor;
                },
                set(value) {
                    this.$store.state.base.isPickingColor = value;
                },
            },
            pureThemeColorList() {
                return this.isGradient ? this.themeColorList : this.themeColorList.filter(item => !item.includes('type'));
            },
            collectColorListCalc() {
                if (this.isGradient) {
                    return this.collectColorList.filter(item => item !== 'colorful');
                }
                return this.collectColorList.filter(item => !item.includes('type') && item !== 'colorful');
            },
        },
        watch: {
            value(newValue) {
                if (utils.rgbaReg.test(newValue)) {
                    const rgba = newValue.match(/\(.+\)/g)[0].replace(/\(|\)/g, '');
                    this.alpha = +rgba.split(',')[3];
                    const hex = utils.rgbToHex(this.value);
                    if (hex === '#fff' || hex === '#ffffff') {
                        this.hsl.l = 1;
                    } else if (hex === '#000' || hex === '#000000') {
                        this.hsl.l = 0;
                    } else {
                        // this.hsl.l = utils.HexToHSL(utils.rgbToHex(this.value)).l;

                        this.hsl = utils.HexToHSL(utils.rgbToHex(this.value));
                    }
                }  else {
                    this.alpha = 1;
                    if (this.value === '#fff' || this.value === '#ffffff') {
                        this.hsl.l = 1;
                    } else if (this.value === '#000' || this.value === '#000000') {
                        this.hsl.l = 0;
                    } else {
                        // this.hsl.l = utils.HexToHSL(this.value).l;
                        this.hsl = utils.HexToHSL(this.value);
                    }
                }
            },
            isShowMore(value) {
                if (value) {
                    this.$nextTick(() => {
                        this.lightnessRef = this.$refs.lightnessMore;
                        this.alphaRef = this.$refs.alphaMore;
                    })
                } else {
                    this.$nextTick(() => {
                        this.lightnessRef = this.$refs.lightness;
                        this.alphaRef = this.$refs.alpha;
                    })
                }
            }
        },
        filters: {
            colorFormat(value) {
                let color = '';
                if (value.toUpperCase() == 'TRANSPARENT' || value.toUpperCase() == 'COLORFUL') {
                    color = 'TRANSPARENT';
                } else {
                    color = utils.rgbToHex(value).replace('#', '')
                        .toUpperCase();
                }
                return color;
            },
        },
        mounted() {
            this.$nextTick(() => {
                this.lightnessRef = this.$refs.lightness;
                this.alphaRef = this.$refs.alpha;
                this.pickerRef = this.$refs.picker;
            });
        },
        methods: {
            updateColor(color) {
                this.$emit('update', color);
            },
            changeColor(color) {
                if (color === 'colorful') {
                    this.isShowBase = false;
                    this.isShowMore = true;
                    this.$emit('showMore', true);
                    window.setTimeout(() => {
                        this.hasShowMore = true;
                    });
                } else {
                    let hex = color;
                    if (utils.rgbaReg.test(color)) {
                        hex = utils.rgbToHex(color);
                    } else {
                        if (color !== 'transparent' && color !== 'default') {
                            color[0] !== '#' && (color = `#${color}`);
                            if (this.alpha != 1) {
                                const rgb = utils.HexToRGB(color);
                                color = `rgba(${rgb.r},${rgb.g},${rgb.b},${this.alpha ? this.alpha : 1})`;
                            }
                        }
                    }
                    this.hsl = utils.HexToHSL(hex);
                    this.$emit('change', color);
                }
            },
            backToBaseColor() {
                this.isShowBase = true;
                this.isShowMore = false;
                this.hasShowMore = false;
                this.isPickingColor = false;

                this.$emit('showMore', false);
            },
            pickColor() {
                Ktu.log('colorPicker', 'pick');
                if (this.isPickingColor) {
                    return;
                }
                this.isPickingColor = true;
                const previousColor = this.value;
                const vm = this;
                Ktu.utils.pickColor(this.pickerRef, (color, addHistory, rgb, rgba) => {
                    if (!!rgb) {
                        const hex = utils.rgbToHex(rgb);
                        vm.hsl = utils.HexToHSL(hex);
                    }
                    vm.updateColor(color);
                }, () => {
                    previousColor !== vm.value && vm.updateColor(previousColor);
                    vm.isPickingColor = false;
                });
            },
            bindGlobalEvent(updateFn, fixPageXY) {
                // const _this = this;
                const moveTimer = null;
                const moveEvent = function (event) {
                    // 节流
                    moveTimer && window.clearTimeout(moveTimer);
                    window.setTimeout(() => {
                        updateFn.call(null, event);
                    }, fixPageXY ? 100 : 20);
                };
                const upEvent = function () {
                    updateFn.call(null, event);
                    fixPageXY && (this.pageXY = null);
                    document.removeEventListener('mousemove', moveEvent);
                    document.removeEventListener('mouseup', upEvent);
                };
                document.addEventListener('mousemove', moveEvent);
                document.addEventListener('mouseup', upEvent);
            },
            boardDown(event) {
                utils.boardClientRect = this.$refs.board.getBoundingClientRect();
                const maxLeft = utils.rectSize.w;
                const maxTop = utils.rectSize.h;
                const updateHSL = function (event) {
                    // 约束坐标
                    this.pageXY = utils.getXY({
                        x: event.pageX,
                        y: event.pageY,
                    });
                    const pageXYLeftValue = this.pageXY.x > maxLeft ? maxLeft : this.pageXY.x;
                    const pageXYTopValue = this.pageXY.y > maxTop ? maxTop : this.pageXY.y;
                    this.pageXY.x = this.pageXY.x < 0 ? 0 : pageXYLeftValue;
                    this.pageXY.y = this.pageXY.y < 0 ? 0 : pageXYTopValue;
                    this.hsl = utils.getHSL(this.pageXY, this.hsl.l);
                    this.hsl.l = 0.5;
                    let color = utils.HSLToHex(this.hsl);
                    // 保留透明度的值
                    if (this.alpha != 1) {
                        const rgb = utils.HexToRGB(color);
                        color = `rgba(${rgb.r},${rgb.g},${rgb.b},${this.alpha})`;
                    }
                    this.updateColor(color);
                }.bind(this);
                this.bindGlobalEvent(updateHSL, true);
            },
            lightnessDown(event) {
                const clientRect = this.lightnessRef.getBoundingClientRect();
                const getLeft = function (event) {
                    const offsetX = event.pageX - clientRect.left;
                    const left = offsetX - utils.slideRadius;
                    const maxLeft = utils.radius * 2 - utils.slideRadius * 2;
                    const whichLeft = left > maxLeft ? maxLeft : left;
                    return left < 0 ? 0 : whichLeft;
                };
                const getLightness = function (left) {
                    const maxLeft = utils.radius * 2 - utils.slideRadius * 2;
                    const maxB = 100;
                    const radio = maxLeft / maxB;
                    return (maxLeft - left) / radio / 100;
                };
                const updateHSL = function (event) {
                    this.hsl.l = getLightness(getLeft(event));
                    if (typeof this.value !== 'string') return;
                    let color = utils.HSLToHex(this.hsl);
                    // 保留透明度的值
                    if (this.alpha != 1) {
                        const rgb = utils.HexToRGB(color);
                        color = `rgba(${rgb.r},${rgb.g},${rgb.b},${this.alpha})`;
                    }
                    this.updateColor(color);
                }.bind(this);
                this.bindGlobalEvent(updateHSL);
            },
            alphaDown(event) {
                // 已经是全透明 阻止移动
                if (this.value.toUpperCase() == 'TRANSPARENT') {
                    this.$Notice.error('完全透明无法调整透明度');
                    return;
                }
                const clientRect = this.alphaRef.getBoundingClientRect();
                const getLeft = function (event) {
                    const offsetX = event.pageX - clientRect.left;
                    const left = offsetX - utils.slideRadius;
                    const maxLeft = utils.radius * 2 - utils.slideRadius * 2;
                    const leftValue = left > maxLeft ? maxLeft : left;
                    return left < 0 ? 0 : leftValue;
                };
                const getAlpha = function (left) {
                    const maxLeft = utils.radius * 2 - utils.slideRadius * 2;
                    const maxB = 100;
                    const radio = maxLeft / maxB;
                    return left / radio / 100;
                };
                const updateAlpha = function (event) {
                    let alpha = +getAlpha(getLeft(event));
                    let color = this.baseColor;
                    if (alpha != 1) {
                        alpha = alpha.toFixed(2);
                        const rgb = utils.HexToRGB(color);
                        color = `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
                        this.alpha = +alpha;
                    }
                    this.updateColor(color);
                }.bind(this);
                this.bindGlobalEvent(updateAlpha);
            },

            // 颜色亮度的滑轮调整
            lightnessWheel(event) {
                const updateHSL = function (event) {
                    if (event.deltaY > 0) {
                        this.hsl.l += 0.02;
                    } else {
                        this.hsl.l -= 0.02;
                    }
                    const hsllValue = this.hsl.l > 1 ? 1 : this.hsl.l;
                    this.hsl.l = this.hsl.l < 0 ? 0 : hsllValue;
                    let color = utils.HSLToHex(this.hsl);
                    // 保留透明度的值
                    if (this.alpha != 1) {
                        const rgb = utils.HexToRGB(color);
                        color = `rgba(${rgb.r},${rgb.g},${rgb.b},${this.alpha})`;
                    }
                    this.updateColor(color);
                }.bind(this);
                updateHSL(event);
            },
            // 颜色透明底的滑轮改变
            alphaWheel(event) {
                const updateAlpha = function (event) {
                    if (event.deltaY < 0) {
                        this.alpha += 0.02;
                    } else {
                        this.alpha -= 0.02;
                    }
                    const alphaValue = this.alpha > 1 ? 1 : this.alpha;
                    this.alpha = this.alpha < 0 ? 0 : alphaValue;
                    let color = this.baseColor;
                    if (this.alpha != 1) {
                        const rgb = utils.HexToRGB(color);
                        color = `rgba(${rgb.r},${rgb.g},${rgb.b},${this.alpha})`;
                    }
                    this.updateColor(color);
                }.bind(this);
                updateAlpha(event);
            },
            updateHSL(color) {
                this.hsl = utils.HexToHSL(color);
                this.hsl.l = 0.5;
            },
        },
    });
}());

