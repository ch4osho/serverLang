
Vue.component('tool-wordcloud-rotate', {
    template: `
    <div>
        <tool-btn class="item-rotate-angle" @click="show($event,eventType,'rotate')">
            <span class="item-angle-text">
                {{currentValue}}
            </span>
            <svg class="tool-btn-arrow-svg">
                <use xlink:href="#svg-tool-arrow"></use>
            </svg>
        </tool-btn>
        <transition :name="transitionName">
            <div class="rotate-container" v-if="isShow" ref="popup">
                <tool-slider :value="currentValue" :isWordArt="isWordArt" title="角度" :min="0" :max="360" :step="1" unit="°" @input="input" class="tool-rotate-slider"></tool-slider>
                <div class="rorate-container-center">
                    <span class="rorate-container-center-text" :style="'transform: rotate(' + currentValue + 'deg)'">{{title}}</span>
                </div>
                <div class="rotate-container-bottom">
                    <span class="rotate-angle-back" @click="angleBack">恢复默认</span>
                </div>
            </div>
        </transition>
    </div>
    `,
    mixins: [Ktu.mixins.popupCtrl, Ktu.mixins.dataHandler],
    props: {
        eventType: {
            type: [String, Number],
        },
        angle: {
            type: Number,
            default: 0,
        },
        title: {
            type: String,
            default: '凡科',
        },
        isWordArt: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            currentValue: this.angle,
        };
    },
    watch: {
        angle(newVal) {
            this.currentValue = newVal;
        },
    },
    computed: {
    },
    methods: {
        input(value, param) {
            this.$emit('input', value, param);
        },
        angleBack() {
            this.$emit('angleBack');
        },
    },
});
