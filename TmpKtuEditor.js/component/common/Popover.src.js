Vue.component('Popover', {
    template: `
        <div class="PopoverBox">
            <transition name="slide-up">
                <div class="Popover" :style="{width,height,left,top,right,bottom}" v-if="isShowPopover">
                    <div class="popover-container">
                        <div class="popover-title">
                            {{this.config.title}}
                            <i class="popover-close ktu-icon ktu-icon-ios-close-empty" @click.stop ="close"></i>
                        </div>
                        <div class="popover-content">
                            {{this.config.content}}
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    `,
    data() {
        return {
            width: 'auto',
            height: 'auto',
            left: 'auto',
            top: 'auto',
        };
    },
    props: {
        show: {
            type: Boolean,
            default: false,
        },
        config: {
            type: Object,
            default: {},
        },
    },
    computed: {
        isShowPopover() {
            return this.$store.state.data.isShowPopover;
        },
    },
    created() {
        this.setPositon();
    },
    watch: {
        isShowPopover() {
            this.setPositon();
        },
    },
    beforeDestroy() {
        this.$store.commit('data/changeState', { prop: 'isShowPopover', value: false });
    },
    methods: {
        close() {
            this.$store.commit('data/changeState', { prop: 'isShowPopover', value: false });
        },
        setPositon() {
            const { width, height, left, top, bottom, right } = this.config;
            this.width = !width ? 'auto' : `${width}px`;
            this.height = !height ? 'auto' : `${height}px`;
            this.left = !left ? 'auto' : `${left}px`;
            this.top = !top ? 'auto' : `${top}px`;
            this.bottom = !bottom ? 'auto' : `${bottom}px`;
            this.right = !right ? 'auto' : `${right}px`;
        },
    },
});
