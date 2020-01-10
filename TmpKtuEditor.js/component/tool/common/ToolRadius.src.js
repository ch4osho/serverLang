Vue.component('tool-radius', {
    mixins: [Ktu.mixins.dataHandler, Ktu.mixins.popupCtrl],
    props: {
        eventType: {
            type: [String, Number],
        },
        showIcon: {
            type: Boolean,
            default: false,
        },
    },
    template: `
    <div class="tool-box tool-radius">
        <tool-btn v-if="showIcon" icon="radius" tips="圆角" @click="show($event,eventType,'radius')" :class="{opened: isShow}"></tool-btn>
        <tool-btn v-else @click="show($event,eventType,'radius')" :class="{opened: isShow}">圆角</tool-btn>

        <transition :name="transitionName">
            <div v-if="isShow" ref="popup" class="tool-popup tool-radius-popup" :class="{'reverseX': isNeedReverseX, 'reverseY': isNeedReverseY}">
                <tool-slider :value="radius" title="圆角" @input="changeRadius" :min="0" :max="R" :step="1" unit="px" ></tool-slider>
                <div class="tool-radius-btns-container">
                    <button ref="to0" class="tool-radius-btns" @click="topercent(0)">&nbsp;0%</button>
                    <button ref="to25" class="tool-radius-btns" @click="topercent(0.25)">25%</button>
                    <button ref="to50" class="tool-radius-btns" @click="topercent(0.50)">50%</button>
                </div>

                <div class="tool-radius-option-contain">
                    <div :class="btnSet" @click="openRadiusSetting">
                        <div :class="icon"></div>
                        <div id="svg-tool-arrow" >
                            <svg viewBox="0 0 6 3" :class="svgclass">
                                <desc>下拉箭头</desc>
                                <polygon points="5.5,0 5,0 4.5,0 4,0 1,0 0,0 0,1 1,1 1,2 2,2 2,3 3,3 4,3 4,2 4.5,2 5,2 5,1 5.5,1 6,1 6,0"/>
                            </svg>
                        </div>
                    </div>
                    <transition name="slide-up">
                        <div class="tool-radius-angle-setting" v-show="isSetting" @click.stop>
                            <div class="tool-radius-angle-setting-top">
                                <div class="tool-radius-angle-lt" :class="{'selected': radiusObj.lt}" @click="change('lt')"></div>
                                <div class="tool-radius-angle-rt" :class="{'selected': radiusObj.rt}" @click="change('rt')"></div>
                            </div>
                            <div class="tool-radius-angle-setting-bottom">
                                <div class="tool-radius-angle-lb" :class="{'selected': radiusObj.lb}" @click="change('lb')"></div>
                                <div class="tool-radius-angle-rb" :class="{'selected': radiusObj.rb}" @click="change('rb')"></div>
                            </div>
                            <div :class="midclass"></div>
                        </div>
                    </transition>
                </div>
            </div>

        </transition>

    </div>`,
    data() {
        return {
            isSetting: false,

            popUpWidth: 240,
            popUpHeight: 210,
        };
    },
    computed: {
        radiusObj() {
            return this.selectedData.radius;
        },
        radius() {
            return Math.round(this.radiusObj.size);
        },
        scaleX() {
            return this.selectedData.scaleX;
        },
        // 控制下拉框按钮类
        icon() {
            return this.isSetting ? 'tool-radius-angle-btn-icon-setting' : 'tool-radius-angle-btn-icon';
        },
        triangle() {
            return this.isSetting ? 'tool-radius-angle-btn-triangle-setting' : 'tool-radius-angle-btn-triangle';
        },
        btnSet() {
            return this.isSetting ? 'tool-radius-angle-btn-setting' : 'tool-radius-angle-btn';
        },
        svgclass() {
            return this.isSetting ? 'tool-radius-option-contain-svg-setting' : 'tool-radius-option-contain-svg';
        },
        midclass() {
            let classString = 'tool-radius-angle-setting-middle';
            classString += this.radiusObj.lt ? ' tool-radius-angle-setting-middle-lt' : '';
            classString += this.radiusObj.lb ? ' tool-radius-angle-setting-middle-lb' : '';
            classString += this.radiusObj.rb ? ' tool-radius-angle-setting-middle-rb' : '';
            classString += this.radiusObj.rt ? ' tool-radius-angle-setting-middle-rt' : '';
            return classString;
        },
        // 滚动条最大值
        R: {
            get() {
                return Math.floor(Math.min(this.selectedData.width * this.selectedData.scaleX, this.selectedData.height * this.selectedData.scaleY) / 2 + 1);
            },
            set() { },
        },
    },
    created() {
    },
    mounted() {
    },
    methods: {
        changeRadius(value) {
            this.changeDataProp('radius', {
                size: value,
                lt: this.radiusObj.lt,
                rt: this.radiusObj.rt,
                lb: this.radiusObj.lb,
                rb: this.radiusObj.rb,
            }, true);

            if (this.eventType === 'qr-code' || this.eventType === 'map') return;
            if (this.eventType) {
                Ktu.log(this.eventType, 'radius');
            } else {
                Ktu.log(this.selectedData.type, 'radius');
            }
        },
        change(angle) {
            const radiusObj = JSON.parse(JSON.stringify(this.radiusObj));
            radiusObj[angle] = !radiusObj[angle];
            this.changeDataProp('radius', radiusObj);
        },
        topercent(percent) {
            this.changeRadius((+percent) * this.R * 2);
        },
        openRadiusSetting() {
            if (!this.isSetting) {
                this.isSetting = true;
                const close = () => {
                    this.isSetting = false;
                    document.removeEventListener('click', close);
                };
                window.setTimeout(() => {
                    document.addEventListener('click', close);
                });
            }
        },
    },
});
