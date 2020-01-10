Vue.component('tool-image', {
    mixins: [Ktu.mixins.dataHandler],
    template: `
        <div class="tool-image">
            <template v-if="isClipMode">
                <tool-btn class="tool-box" icon="sure" tips="确认裁切" @click="sureCrop(true)" style="margin-left: 22px;"></tool-btn>
                <tool-btn class="tool-box" icon="exit" tips="退出裁切" @click="exitCrop"></tool-btn>
            </template>
            <template v-else>
                <template v-if="!isInContainer" >
                    <color-picker v-if="isPng" :value="fill" @input="selectFill" tips="填充色"></color-picker>
                    <tool-image-stroke v-if="!isPng&&!isGif"></tool-image-stroke>
                    <div class="tool-split tool-box" style="margin-left:16px" v-if="!isGif"></div>
                </template>

                <tool-btn class="tool-box" @click="crop" v-if="!isGif && !isObjectInGroup">裁切</tool-btn>
                <tool-btn class="tool-box" @click="openKouTuModal" v-if="!isGif && !isInContainer">抠图</tool-btn>

                <tool-filter v-if="!isGif"></tool-filter>

                <div class="tool-split tool-box" v-if="!isGif"></div>

                <tool-radius v-if="!isGif && !isInContainer"></tool-radius>
                <tool-shadow v-if="!isGif && !isInContainer"></tool-shadow>

                <tool-opacity v-if="!isInContainer"></tool-opacity>
                <tool-rotate v-if="!isInContainer"></tool-rotate>

                <div class="tool-split tool-box" v-if="!isInContainer"></div>

                <tool-change-pic v-if="!isGif"></tool-change-pic>
                <tool-btn class="tool-box" @click="setBackground" v-if="!isGif && !isInContainer">设为背景</tool-btn>
                <tool-btn class="tool-box" @click="selectFill('transparent')" v-if="fill !== 'transparent'&&!isInContainer">清除填充色</tool-btn>

                <div class="tool-split tool-box" v-if="!isGif &&!isInContainer"></div>
                <tool-size v-if="!isInContainer"></tool-size>
            </template>

            <slot></slot>
        </div>
    `,
    data() {
        return {};
    },
    computed: {
        isPng() {
            // 抠图完成的图片是blob的URL，所以没有触发png的匹配，加上blob开头的
            return this.selectedData.image && /(^blob|\.png$)/.test(this.selectedData.image.src);
        },
        isGif() {
            return this.selectedData.imageType === 'gif';
        },
        fill() {
            return this.selectedData.fill ? this.selectedData.fill : 'transparent';
        },
        isClipMode() {
            return this.selectedData.isClipMode;
        },
        isInContainer() {
            return this.selectedData.isInContainer;
        },
    },
    methods: {
        selectFill(value) {
            this.changeDataProp('fill', value);
            Ktu.log('png', 'fill');
        },
        closeLoading() {

        },
        crop() {
            this.selectedData.enterClipMode();
            Ktu.log(this.activeObject.type, 'crop');
        },
        sureCrop() {
            this.selectedData.exitClipMode(true);
        },
        exitCrop() {
            this.selectedData.exitClipMode(false);
        },
        setBackground() {
            Ktu.log(this.activeObject.type, 'setBackground');
            Ktu.element.imageToBackground(this.isObjectInGroup);
        },
        openKouTuModal() {
            Ktu.log('openKouTu', 'toolImage');
            Ktu.store.commit('modal/showKouTuModalState', true);
        },
    },
});
