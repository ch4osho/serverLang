Vue.component('tool-background', {
    mixins: [Ktu.mixins.dataHandler],
    template: `
        <div class="tool-background">
            <label class="tool-box tool-background-label">背景</label>

            <template v-if="isImage">
                <tool-btn class="tool-box" @click="openKouTuModal">抠图</tool-btn>

                <tool-background-scale></tool-background-scale>

                <template v-if="!selectedData.isClipMode">
                    <tool-filter></tool-filter>
                    <tool-opacity></tool-opacity>
                    <tool-rotate></tool-rotate>
                    <div class="tool-split tool-box"></div>
                    <tool-change-pic isBackground type="image/jpg,image/jpeg,image/png"></tool-change-pic>
                    <tool-btn class="tool-box" @click="backgroundToImage">从背景脱离</tool-btn>
                    <tool-btn class="tool-box" @click="removeImg">删除图片</tool-btn>
                </template>

            </template>

            <template v-else>
                <color-picker :isGradient="true" :value="color" @input="changeColor"></color-picker>
                <tool-opacity></tool-opacity>
            </template>

            <slot></slot>
        </div>
    `,
    data() {
        return {
            // rotateList: Ktu.config.tool.options.rotateList,
        };
    },
    computed: {
        color() {
            return this.selectedData.backgroundColor;
        },
        isImage() {
            return this.selectedData.image;
        },
    },
    methods: {
        changeColor(value) {
            this.selectedData.setBackGround(value);
        },
        removeImg() {
            this.selectedData.clearBackground();
            Ktu.log('backgroundTool', 'remove');
        },
        backgroundToImage() {
            this.selectedData.backgroundToImage();
            // 统计图片从背景脱离
            Ktu.log('backgroundTool', 'detachbackground');
        },
        openKouTuModal() {
            Ktu.log('openKouTu', 'toolImage');
            Ktu.store.commit('modal/showKouTuModalState', true);
        },
    },
});
