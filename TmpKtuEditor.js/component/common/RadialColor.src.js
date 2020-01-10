Vue.component('radial-color', {
    template: `
        <transition name="color-fade">
            <div class="radial-color" ref="radialColor">
                <div class="radial-box">
                    <div class="radial-block" v-for="item in radialColorList" :key="item.id" :style="{background: 'radial-gradient(circle, '+ item.from +', '+ item.to +')'}" @click="changeColor(item)"></div>
                </div>

                <gradient-line 
                    :value="radialValue" 
                    :themeColorList="themeColorList"
                    :collectPickerShow="collectPickerShow"
                    colorType="radial"
                    @update="updateColor"
                ></gradient-line>

                <div class="direction">
                    <div class="text">方向</div>
                    <div class="direction-selector" @click="showDirectOptions">
                        <div class="block" :style="{'background': directionGradient}"></div>
                    </div>
                    <transition name="slide-up">
                        <div class="options-menu" v-show="isShowDirectOptions" ref="optionsMenu">
                            <div
                                class="option"
                                :style="{background: item}"
                                v-for="(item, index) in directionOptionList"
                                :key="index"
                                @click="chooseDirection(index)"
                            ></div>
                        </div>
                    </transition>
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
    mixins: [Ktu.mixins.colorCtrl],
    props: {
        value: Object,
        themePickerShow: Boolean,
        themeColorList: Array,
        collectPickerShow: Boolean,
    },
    data() {
        return {
            // 径向渐变色预设值
            radialColorList: [
                {
                    id: 0,
                    from: '#FF9100',
                    to: '#FFD500',
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
                    from: '#DE4313',
                    to: '#FEC163',
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
                    from: '#FF00F7',
                    to: '#003CFF',
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
                    from: '#8FD3F4',
                    to: '#84FAB0',
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
                    from: '#00ECBC',
                    to: '#007ADF',
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
                    from: '#764BA2',
                    to: '#667EEA',
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
                    from: '#FFFFFF',
                    to: '#000000',
                },
            ],
            isShowDirectOptions: false,
        };
    },
    computed: {
        directionOptionList() {
            const list = [];
            for (let i = 0; i < 9; i++) {
                let colorStr = 'radial-gradient(farthest-side ';
                switch (i) {
                    case 0:
                        colorStr += 'at top left,';
                        break;
                    case 1:
                        colorStr += 'at top center,';
                        break;
                    case 2:
                        colorStr += 'at top right,';
                        break;
                    case 3:
                        colorStr += 'at center left,';
                        break;
                    case 4:
                        colorStr += 'at center center,';
                        break;
                    case 5:
                        colorStr += 'at center right,';
                        break;
                    case 6:
                        colorStr += 'at bottom left,';
                        break;
                    case 7:
                        colorStr += 'at bottom center,';
                        break;
                    case 8:
                        colorStr += 'at bottom right,';
                        break;
                }
                this.radialValue.value.forEach((item, index, arr) => {
                    colorStr += item.color;
                    if (index !== arr.length - 1) colorStr += ',';
                });
                colorStr += ')';
                list.push(colorStr);
            }

            return list;
        },
        directionGradient() {
            return this.directionOptionList[this.value.direct.index];
        },
        radialValue() {
            return this.value;
        },
        collectColorListCalc() {
            return this.collectColorList.filter(item => item !== 'colorful');
        },
    },
    watch: {
        isShowDirectOptions(value) {
            if (!value) {
                document.removeEventListener('click', this.closeDirectOptions);
            }
        },
    },
    methods: {
        updateColor(color) {
            this.$emit('update', color);
        },
        changeColor(color) {
            if (typeof color === 'string') {
                this.$emit('change', color);
            } else {
                this.radialValue.value = [
                    {
                        color: color.from,
                        percent: 0,
                    },
                    {
                        color: color.to,
                        percent: 100,
                    },
                ];
                this.$emit('change', this.radialValue);
            }
        },
        showDirectOptions() {
            this.isShowDirectOptions = !this.isShowDirectOptions;

            if (this.isShowDirectOptions) {
                window.setTimeout(() => {
                    document.addEventListener('click', this.closeDirectOptions);
                });
            }
        },
        closeDirectOptions(event) {
            const { target } = event;

            if (this.$refs.optionsMenu) {
                if (target !== this.$refs.optionsMenu && !this.$refs.optionsMenu.contains(target)) {
                    this.isShowDirectOptions = false;
                }
            }
        },
        chooseDirection(index) {
            switch (index) {
                case 0:
                    this.radialValue.direct.cx = 0;
                    this.radialValue.direct.cy = 0;
                    this.radialValue.direct.r = 120;
                    break;
                case 1:
                    this.radialValue.direct.cx = 50;
                    this.radialValue.direct.cy = 0;
                    this.radialValue.direct.r = 100;
                    break;
                case 2:
                    this.radialValue.direct.cx = 100;
                    this.radialValue.direct.cy = 0;
                    this.radialValue.direct.r = 120;
                    break;
                case 3:
                    this.radialValue.direct.cx = 0;
                    this.radialValue.direct.cy = 50;
                    this.radialValue.direct.r = 100;
                    break;
                case 4:
                    this.radialValue.direct.cx = 50;
                    this.radialValue.direct.cy = 50;
                    this.radialValue.direct.r = 50;
                    break;
                case 5:
                    this.radialValue.direct.cx = 100;
                    this.radialValue.direct.cy = 50;
                    this.radialValue.direct.r = 100;
                    break;
                case 6:
                    this.radialValue.direct.cx = 0;
                    this.radialValue.direct.cy = 100;
                    this.radialValue.direct.r = 120;
                    break;
                case 7:
                    this.radialValue.direct.cx = 50;
                    this.radialValue.direct.cy = 100;
                    this.radialValue.direct.r = 100;
                    break;
                case 8:
                    this.radialValue.direct.cx = 100;
                    this.radialValue.direct.cy = 100;
                    this.radialValue.direct.r = 120;
                    break;
            }

            this.radialValue.direct.index = index;
            this.updateColor(this.radialValue);
        },
    },
});

