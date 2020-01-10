Vue.component('copyUpload', {
    template: `
        <div class="copy-upload">
            <div class="drop-upload-progress">
                <div class="copy-upload-progress-bg" :style="{width : barWidth}">
                    <div class="copy-upload-progress-bar"></div>
                </div>
                <svg class="copy-upload-progress-close" @mouseenter="hover = true;" @mouseleave="hover = false;" @click="stopUpload">
                    <use xlink:href="#svg-upload-close" v-if="!hover"></use>
                    <use xlink:href="#svg-upload-close-hover" v-else></use>
                </svg>
                <div class="copy-upload-progress-text">正在上传...({{nowUploadIndex}}/{{acceptLength}})</div>
            </div>
        </div>
    `,
    data() {
        return {
            hover: false,
            nowUploadIndex: 0,
            acceptLength: 1,
        };
    },
    computed: {
        barWidth() {
            if (this.acceptLength == 0) {
                return '0%';
            }
            return `${(this.nowUploadIndex / this.acceptLength) * 100}%`;
        },
        isFinishCopyUpload: {
            get() {
                return this.$store.state.base.isFinishCopyUpload;
            },
            set(value) {
                this.$store.state.base.isFinishCopyUpload = value;
            },
        },
    },
    watch: {
        isFinishCopyUpload: {
            handler(value) {
                if (value) {
                    this.nowUploadIndex = this.acceptLength;
                }
            },
            immediate: true,
        },
    },
    methods: {
        // 关闭复制上传页面
        stopUpload() {
            this.$store.commit('base/changeState', {
                prop: 'isCopyUpload',
                value: false,
            });
        },
    },
});
