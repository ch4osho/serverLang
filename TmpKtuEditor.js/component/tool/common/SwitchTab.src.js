Vue.component('switch-tab', {
    template: `<div class="switch-tab-container" :style="getStyle">
                <div class="animate-tab tab-item" :style="getAnimateTabStyle"></div>
                <div class="tab-item" :class="{'active': index == activeIndex}" v-for="(item, index) in tabList" @click="clickEvent(item.key, index)">
                    {{item.value}}
                </div>
               </div>`,
    props: {
        tabList: {
            type: Array,
            default: [
                {
                    key: 'index1',
                    value: '1',
                },
                {
                    key: 'index2',
                    value: '2',
                },
            ],
        },
        width: {
            type: Number,
            default: 280,
        },
        height: {
            type: Number,
            default: 32,
        },
        fontSize: {
            type: Number,
            default: 12,
        },
        showIndex: {
            type: Number,
            default: 0,
        },
        marginTop: {
            type: Number,
            default: 16,
        },
        marginBottom: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
            activeIndex: 0,
        };
    },
    created() {
        this.activeIndex = this.showIndex;
    },
    computed: {
        getStyle() {
            const options = {
                fontSize: `${this.fontSize}px`,
                width: `${this.width}px`,
                height: `${this.height}px`,
                marginTop: `${this.marginTop}px`,
                marginBottom: `${this.marginBottom}px`,
            };
            return options;
        },
        getAnimateTabStyle() {
            const { tabList: { length }, width } = this;
            const animateTabWidth = (width - 4 * length) / length;
            const options = {
                width: `${animateTabWidth}px`,
            };
            const left = this.activeIndex * (width / length) + 2;
            options.left = `${left}px`;
            return options;
        },
    },
    methods: {
        clickEvent(key, index) {
            this.activeIndex = index;
            this.$emit('changeTab', key);
        },
    },
});
