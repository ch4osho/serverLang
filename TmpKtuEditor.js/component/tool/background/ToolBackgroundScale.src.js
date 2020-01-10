Vue.component('tool-background-scale', {
    // 注意，此弹窗不引用通用弹窗，而是根据isZoomMode是否开启裁切模式控制弹窗显隐。
    mixins: [Ktu.mixins.dataHandler],
    template: `<div class="tool-box tool-background-scale">
                    <tool-btn v-if="showIcon" icon="scale" tips="缩放" @click="trigger" :class="{opened: activeObject.isClipMode}"></tool-btn>
                    <tool-btn v-else @click="trigger" :class="{opened: activeObject.isClipMode}">缩放</tool-btn>
                    <transition name="slide-up">
                        <div v-if="activeObject.isClipMode" class="tool-popup tool-background-scale-popup" @click.stop>
                            <tool-slider :value="Math.round(scale*100)" title="缩放" @input="changeScale" :min="0" :max="400" :step="1" unit="%" needBtn @ensure="ensureScale" @cancel="cancelScale"></tool-slider>
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

        };
    },
    computed: {
        scale() {
            return this.activeObject.imageZoomAdd;
        },
    },
    beforeDestroy() {
        this.activeObject && this.activeObject.isClipMode && this.activeObject.exitClipMode(false);
    },
    methods: {
        trigger() {
            this.activeObject.isClipMode
                ? this.activeObject.exitClipMode(false)
                : this.activeObject.enterClipMode();
            Ktu.log('backgroundTool', 'scale');
        },
        changeScale(value) {
            this.activeObject.imageZoomAdd = value / 100;
            Ktu.imageClip.setImageZoomAdd(value / 100 + 1);
        },
        ensureScale() {
            this.activeObject.exitClipMode(true);
        },
        cancelScale() {
            this.activeObject.exitClipMode(false);
        },
    },
});
