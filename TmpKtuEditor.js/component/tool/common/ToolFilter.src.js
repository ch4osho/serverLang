Vue.component('tool-filter', {
    mixins: [Ktu.mixins.popupCtrl, Ktu.mixins.dataHandler],
    template: `<div class="tool-box tool-filter">
                    <tool-btn v-if="showIcon" icon="filter" tips="滤镜" @click="showMethod($event,selectedType,'filter')" :class="{opened: isShow}" ref="filterBtn"></tool-btn>
                    <tool-btn v-else @click="showMethod($event,selectedType,'filter')" :class="{opened: isShow}" ref="filterBtn">滤镜</tool-btn>
                    <transition name="slide-up">
                        <div v-if="isShow" ref="popup" class="tool-popup tool-filter-popup">
                            <div class="tool-filter-select">
                                <ul class="tool-filter-container">
                                    <li v-for="(filter, index) in filterList.slice(typeEachPage*(currentPage-1), typeEachPage*currentPage)" :key="index" class="tool-filter-type" :class="{selected: filter.type === filterType}" @click="selectFilter(filter.type)" :name="filter.name">
                                        <div class="tool-filter-preview" v-html="getPreview(filter.type)"></div>
                                    </li>
                                </ul>
                                <div class="tool-filter-arrrow" :class="{disabled: !isAllowPrev}" @click="previousPage"></div>
                                <div class="tool-filter-arrrow" :class="{disabled: !isAllowNext}" @click="nextPage"></div>
                            </div>

                            <div class="tool-filter-props">
                                <div class="tool-filter-props-visible">
                                    <template v-if="filterType === 'origin'">
                                        <tool-slider title="亮度" :value="filters.brightness | getValue(propsConfig, 'brightness')" @input="changeBrightness" :min="-100" :max="100"></tool-slider>
                                        <tool-slider title="对比度" :value="filters.contrast | getValue(propsConfig, 'contrast')" @input="changeContrast" :min="-100" :max="100"></tool-slider>
                                    </template>
                                    <tool-slider v-else title="强度" :disabled="hasChangedProp" :value="filterIntensity" @input="changeIntensity" :min="0" :max="100"></tool-slider>
                                </div>
                                <transition name="slide-up">
                                    <div class="tool-filter-props-hidden" v-if="isOpenMore">
                                        <template v-if="filterType !== 'origin'">
                                            <tool-slider title="亮度" :value="filters.brightness | getValue(propsConfig, 'brightness')" @input="changeBrightness" :min="-100" :max="100"></tool-slider>
                                            <tool-slider title="对比度" :value="filters.contrast | getValue(propsConfig, 'contrast')" @input="changeContrast" :min="-100" :max="100"></tool-slider>
                                        </template>
                                        <template>
                                            <tool-slider title="饱和度" :value="filters.saturation | getValue(propsConfig, 'saturation')" @input="changeSaturation" :min="-100" :max="100"></tool-slider>
                                            <tool-slider title="色彩" :value="filters.tint | getValue(propsConfig, 'tint')" @input="changeTint" :min="-100" :max="100" class="tool-filter-tint-slider"></tool-slider>
                                            <tool-slider title="模糊" :value="currentBlurValue" @input="changeBlur" :min="-100" :max="100"></tool-slider>
                                            <tool-slider title="X射线" :value="filters.xProcess | getValue(propsConfig, 'xProcess')" @input="changeXProcess" :min="-100" :max="100"></tool-slider>
                                            <tool-slider title="晕影" :value="filters.vignette | getValue(propsConfig, 'vignette')" @input="changeVignette" :min="0" :max="100"></tool-slider>
                                        </template>
                                    </div>
                                </transition>
                            </div>
                            <div class="tool-filter-trigger" @click="trigger" :class="{open: isOpenMore}">{{isOpenMore ? '收起' : '更多属性'}}</div>

                        </div>
                    </transition>
                </div>`,
    props: {
        showIcon: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            typeEachPage: 5,
            currentPage: 1,
            isOpenMore: false,
            filterList: [{
                type: 'origin',
                name: '原图',
                intensity: 0,
            },
            {
                type: 'cali',
                name: '胶片',
                intensity: 50,
                relation: {
                    brightness: 0.44,
                    contrast: -0.92,
                    saturation: 0.76,
                    tint: 0,
                    blur: 0,
                    xProcess: 0.54,
                    vignette: 0,
                },
            },
            {
                type: 'drama',
                name: '戏剧',
                intensity: 50,
                relation: {
                    brightness: -0.2,
                    contrast: -0.42,
                    saturation: -0.68,
                    blur: 0,
                    xProcess: 1.6,
                    vignette: 1,
                },
                fixed: {
                    tint: 60,
                },
            },
            {
                type: 'edge',
                name: '锐化',
                intensity: 50,
                relation: {
                    brightness: 0.2,
                    contrast: -0.48,
                    saturation: 0.52,
                    blur: -1.06,
                    xProcess: 0.58,
                    vignette: 0,
                },
                fixed: {
                    tint: 49,
                },
            },
            {
                type: 'epic',
                name: '史诗',
                intensity: 50,
                relation: {
                    brightness: 0.12,
                    contrast: 0.4,
                    saturation: -0.28,
                    tint: 0,
                    blur: 0.02,
                    xProcess: 1,
                    vignette: 0.78,
                },
            },
            {
                type: 'festive',
                name: '喜庆',
                intensity: 50,
                relation: {
                    brightness: 0.2,
                    contrast: 0.42,
                    saturation: 0.48,
                    tint: 0,
                    blur: -0.14,
                    xProcess: 0.8,
                    vignette: 0,
                },
            },
            {
                type: 'grayscal',
                name: '灰色',
                intensity: 50,
                relation: {
                    brightness: 0.3,
                    contrast: -0.4,
                    saturation: -2,
                    tint: 0,
                    blur: 0,
                    xProcess: 0,
                    vignette: 0,
                },
            },
            {
                type: 'nordic',
                name: '北欧',
                intensity: 50,
                relation: {
                    brightness: 0.3,
                    contrast: -0.32,
                    saturation: -1,
                    tint: 0,
                    blur: 0,
                    xProcess: 0,
                    vignette: 0,
                },
            },
            {
                type: 'retro',
                name: '复古',
                intensity: 50,
                relation: {
                    brightness: 0,
                    contrast: -0.28,
                    saturation: -0.36,
                    blur: 0,
                    xProcess: 1.4,
                    vignette: 0.8,
                },
                fixed: {
                    tint: 14,
                },
            },
            {
                type: 'rosie',
                name: '玫瑰',
                intensity: 50,
                relation: {
                    brightness: 0,
                    contrast: 1.1,
                    saturation: -0.56,
                    blur: -0.28,
                    xProcess: 0.54,
                    vignette: 0,
                },
                fixed: {
                    tint: -73,
                },
            },
            {
                type: 'selfie',
                name: '自拍',
                intensity: 50,
                relation: {
                    brightness: 0.2,
                    contrast: -0.24,
                    saturation: -0.24,
                    blur: 0,
                    xProcess: 1,
                    vignette: 1.12,
                },
                fixed: {
                    tint: -50,
                },
            },
            {
                type: 'street',
                name: '街头',
                intensity: 50,
                relation: {
                    brightness: -0.14,
                    contrast: 0.42,
                    saturation: -1.9,
                    tint: 0,
                    blur: -0.14,
                    xProcess: 0,
                    vignette: 1,
                },
            },
            {
                type: 'summer',
                name: '夏日',
                intensity: 50,
                relation: {
                    brightness: 0.2,
                    contrast: 0.28,
                    saturation: 0.36,
                    blur: 0,
                    xProcess: 0.6,
                    vignette: 0.5,
                },
                fixed: {
                    tint: -46,
                },
            },
            {
                type: 'blue',
                name: '蓝调',
                intensity: 50,
                relation: {
                    brightness: 1.26,
                    contrast: -0.74,
                    saturation: -0.52,
                    tint: 0,
                    blur: -0.28,
                    xProcess: -0.46,
                    vignette: 0,
                },
            },
            {
                type: 'whimsical',
                name: '幻想',
                intensity: 50,
                relation: {
                    brightness: 0.86,
                    contrast: -0.3,
                    saturation: -1.06,
                    blur: -0.38,
                    xProcess: 1.2,
                    vignette: 0.42,
                },
                fixed: {
                    tint: -79,
                },
            },
            ],
            propsConfig: {
                brightness: {
                    ratio: 200,
                    default: 0,
                    min: -100,
                    max: 100,
                },
                contrast: {
                    ratio: 200,
                    default: 0,
                    min: -100,
                    max: 100,
                },
                saturation: {
                    ratio: 100,
                    default: 0,
                    min: -100,
                    max: 100,
                },
                tint: {
                    ratio: 1,
                    default: 0,
                    min: -100,
                    max: 100,
                },
                blur: {
                    ratio: 5,
                    default: 0,
                    min: 0,
                    max: 100,
                },
                sharpen: {
                    ratio: 50,
                    default: 0,
                    min: -100,
                    max: 0,
                },
                xProcess: {
                    ratio: 1,
                    default: 0,
                    min: -100,
                    max: 100,
                },
                vignette: {
                    ratio: 2,
                    default: 0,
                    min: 0,
                    max: 100,
                },
            },
        };
    },
    computed: {
        selectedObj() {
            if (this.selectedData.type === 'imageContainer') {
                return this.selectedData.objects[0];
            }
            return this.selectedData;
        },
        isDevDebug() {
            return this.$store.state.isDevDebug;
        },
        src() {
            return this.selectedObj.image.src;
        },
        objectId() {
            return this.selectedObj.objectId;
        },
        filters() {
            return this.selectedObj.filters;
        },
        filterType: {
            get() {
                return this.selectedObj.filters.type;
            },
            set(value) {
                this.$set(this.selectedObj.filters, 'type', value);
            },
        },
        filterIntensity: {
            get() {
                return this.selectedObj.filters.intensity;
            },
            set(value) {
                this.$set(this.selectedObj.filters, 'intensity', value);
            },
        },
        currentFilterObj() {
            return this.filterList.find(filter => filter.type === this.filterType);
        },
        hasChangedProp() {
            const { filterIntensity } = this;
            const { relation } = this.currentFilterObj;
            const { fixed } = this.currentFilterObj;
            return relation && Object.keys(relation).some(filterType => {
                const ratio = relation[filterType];
                if (filterType === 'blur' && ratio < 0) {
                    filterType = 'sharpen';
                }
                if (filterType === 'blur' && this.filters.sharpen || filterType === 'sharpen' && this.filters.blur) {
                    return true;
                }
                let relevantFilter = this.filters[filterType];
                const propConfig = this.propsConfig[filterType];
                if (!relevantFilter) {
                    relevantFilter = { value: propConfig.default };
                }
                // 小数判断相等
                let value = Math.round(filterIntensity * ratio.toFixed(2));
                value = Math.min(Math.max(propConfig.min, value), propConfig.max);
                return value !== Math.round((propConfig.ratio * relevantFilter.value).toFixed(2));
            }) || fixed && Object.keys(fixed).some(filterType => {
                const value = fixed[filterType];
                if (filterType === 'blur' && value < 0) {
                    filterType = 'sharpen';
                }
                if (filterType === 'blur' && this.filters.sharpen < 0 || filterType === 'sharpen' && this.filters.blur) {
                    return true;
                }
                let relevantFilter = this.filters[filterType];
                if (!relevantFilter) {
                    const propConfig = this.propsConfig[filterType];
                    relevantFilter = { value: propConfig.default };
                }
                return Math.round(value) !== Math.round(relevantFilter.value);
            });
        },
        currentBlurValue() {
            let propConfig = {};
            let blur = 0;
            if (this.filters.blur) {
                propConfig = this.propsConfig.blur;
                blur = this.filters.blur.value * propConfig.ratio;
            } else if (this.filters.sharpen) {
                propConfig = this.propsConfig.sharpen;
                blur = this.filters.sharpen.value * propConfig.ratio;
            }
            return Math.round(blur);
        },
        isAllowPrev() {
            return !(this.currentPage === 1);
        },
        isAllowNext() {
            return !(this.currentPage === Math.ceil(this.filterList.length / this.typeEachPage));
        },
        selectedType() {
            if (Ktu.activeObject.type == 'background') {
                return 'backgroundTool';
            }
            return Ktu.activeObject.type;
        },
        // 其他渠道打开滤镜
        isOpenTool: {
            get() {
                return this.$store.state.base.isOpenTool;
            },
            set(value) {
                this.$store.commit('base/changeState', {
                    prop: 'isOpenTool',
                    value,
                });
            },
        },
        isPng() {
            return this.selectedObj.image && /\.png$/.test(this.selectedObj.image.src);
        },
    },
    watch: {
        objectId() {
            this.currentPage = this.getCurrentPage();
        },

        isOpenTool(value) {
            if (value.isShow && value.type == 'filter') {
                this.$refs.filterBtn.click();
                this.isOpenTool = {
                    isShow: false,
                    type: '',
                };
            }
        },
    },
    filters: {
        getValue(propObj, propsConfig, propName) {
            const propConfig = propsConfig[propName];
            return propObj ? Math.round(propObj.value * propConfig.ratio) : propConfig.default;
        },
    },
    created() {
        // 找出当前选中滤镜效果的页数
        this.currentPage = this.getCurrentPage();
    },
    methods: {
        showMethod($event, dogName, srcName) {
            if (this.selectedObj.isInContainer) {
                Ktu.simpleLog('imageContainer', 'filter');
            }
            this.show($event, dogName, srcName);
        },
        changeValue(propName, value) {
            const propConfig = this.propsConfig[propName];
            value = Math.min(Math.max(propConfig.min, value), propConfig.max);
            value = value / propConfig.ratio;
            if (value === propConfig.default) {
                this.$delete(this.filters, propName);
            } else {
                if (this.filters[propName]) {
                    this.filters[propName].value = value;
                } else {
                    const className = eval(propName.slice(0, 1).toUpperCase() + propName.slice(1));
                    this.$set(this.filters, propName, new className({
                        value,
                    }, {
                        filterId: this.selectedObj.objectId,
                        width: this.selectedObj.shapeWidth,
                        height: this.selectedObj.shapeHeight,
                    }));
                }
            }
            this.applyFilters();
        },
        changeBrightness(value) {
            this.changeValue('brightness', value);
            Ktu.log('filter', 'brightness');
        },
        changeContrast(value) {
            this.changeValue('contrast', value);
            Ktu.log('filter', 'contrast');
        },
        changeSaturation(value) {
            this.changeValue('saturation', value);
            Ktu.log('filter', 'saturation');
        },
        changeTint(value) {
            this.changeValue('tint', value);
            Ktu.log('filter', 'tint');
        },
        changeBlur(value) {
            if (value === 0) {
                this.$delete(this.filters, 'blur');
                this.$delete(this.filters, 'sharpen');
            } else {
                if (value > 0) {
                    this.$delete(this.filters, 'sharpen');
                    this.changeValue('blur', value);
                } else {
                    this.$delete(this.filters, 'blur');
                    this.changeValue('sharpen', value);
                }
            }
            Ktu.log('filter', 'blur');
        },
        changeXProcess(value) {
            this.changeValue('xProcess', value);
            Ktu.log('filter', 'xProcess');
        },
        changeVignette(value) {
            this.changeValue('vignette', value);
            Ktu.log('filter', 'vignette');
        },
        applyFilters() {
            this.selectedObj.dirty = true;
            if (this.selectedObj.isInContainer) {
                this.selectedObj.container.dirty = true;
            }
        },
        getCurrentPage() {
            const index = this.filterList.findIndex(filter => filter.type === this.filterType);
            return Math.ceil((index + 1) / this.typeEachPage);
        },
        // 生成预览图
        getPreview(filterType) {
            const filterConf = this.filterList.find(filter => filter.type === filterType);
            const {
                intensity,
                relation,
                fixed,
            } = filterConf;
            const getFilter = (prop, value) => {
                if (prop === 'blur') {
                    if (value > 0) {
                        prop = 'blur';
                    } else if (value < 0) {
                        prop = 'sharpen';
                    }
                }
                const propConfig = this.propsConfig[prop];
                value = Math.min(Math.max(propConfig.min, value), propConfig.max);
                value = value / propConfig.ratio;
                return {
                    prop,
                    value,
                };
            };
            let filters = {};
            if (relation) {
                Object.keys(relation).forEach(prop => {
                    const value = relation[prop] * intensity;
                    if (value !== 0) {
                        const filter = getFilter(prop, value);
                        filters[filter.prop] = {
                            value: filter.value,
                        };
                    }
                });
            }
            if (fixed) {
                Object.keys(fixed).forEach(prop => {
                    const value = fixed[prop];
                    const filter = getFilter(prop, value);
                    filters[filter.prop] = {
                        value: filter.value,
                    };
                });
            }
            filters = new Filters(filters);
            const getImageWH = () => {
                const base = 60;
                let imageWidth = 0;
                let imageHeight = 0;
                const originalWidth = this.selectedObj.image ? this.selectedObj.image.width : this.selectedObj.width;
                const originalHeight = this.selectedObj.image ? this.selectedObj.image.height : this.selectedObj.height;
                if (originalWidth > originalHeight) {
                    imageHeight = base;
                    imageWidth = originalWidth / originalHeight * base;
                } else {
                    imageWidth = base;
                    imageHeight = originalHeight / originalWidth * base;
                }
                return {
                    w: imageWidth,
                    h: imageHeight,
                };
            };
            const imageWH = getImageWH();
            const defs = filters.getDefs({
                filterId: `${filterType}_${this.selectedObj.objectId}`,
                width: imageWH.w,
                height: imageWH.h,
            });
            return `
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${imageWH.w}" height="${imageWH.h}" style="position: absolute;">
                ${defs}
                <image xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="${this.src}" width="100%" height="100%" ${defs ? `filter="url(#filter_${filterType}_${this.selectedObj.objectId})"` : ''}></image>
            </svg>`;
        },
        changeIntensity(filterIntensity) {
            const filterObj = this.currentFilterObj;
            filterIntensity = filterIntensity === undefined ? filterObj.intensity : filterIntensity;
            const { relation } = filterObj;
            const { fixed } = filterObj;
            if (relation) {
                Object.keys(relation).forEach(prop => {
                    this[`change${prop.slice(0, 1).toUpperCase()}${prop.slice(1)}`](relation[prop] * filterIntensity);
                });
            }
            if (fixed) {
                Object.keys(fixed).forEach(prop => {
                    this[`change${prop.slice(0, 1).toUpperCase()}${prop.slice(1)}`](fixed[prop]);
                });
            }
            this.filterIntensity = filterIntensity;
            this.applyFilters();
        },
        selectFilter(filterType) {
            this.selectedObj.saveState();
            this.filterType = filterType;
            // 清空当前滤镜
            this.selectedObj.filters = new Filters({
                type: this.filterType,
            });
            this.changeIntensity();
            this.selectedObj.modifiedState();
            Ktu.log('filter', filterType);
        },
        previousPage() {
            this.isAllowPrev && (this.currentPage--);
        },
        nextPage() {
            this.isAllowNext && (this.currentPage++);
        },
        trigger() {
            this.isOpenMore = !this.isOpenMore;
        },
        filterCallBack() {
            if (this.isPng) {
                Ktu.simpleLog('levelPNGMenu', 'filter');
            } else {
                Ktu.simpleLog('levelJPGMenu', 'filter');
            }
        },
    },
});
