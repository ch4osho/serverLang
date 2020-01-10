Vue.component('pop-up', {
    // 该页面主要用于弹窗类型的页面
    template: `<div class="pop-up">
                    <transition name="fade">

                        <!-- <ele-qrCode v-if="qrCodeEditor.show && (isUiManage || isInternalAcct)"></ele-qrCode>
                        <ele-qrCode-old v-if="qrCodeEditor.show && !isUiManage && !isInternalAcct"></ele-qrCode-old> -->

                        <ele-qrCode v-if="qrCodeEditor.show"></ele-qrCode>
                        <ele-map v-if="mapEditor.show"></ele-map>
                        <ele-wordArt v-if="wordArtEditor.show"></ele-wordArt>
                        <user-guide-modal v-if="showGuide" @closeGuide="closeGuide"></user-guide-modal>
                        <copy-upload v-if="isCopyUpload"></copy-upload>
                        <chart-data-edit v-if="isEditChartData"></chart-data-edit>
                    </transition>
                </div>`,
    data() {
        return {
            showGuide: Ktu._needEditorGuide,
        };
    },
    computed: {
        //  是否显示二维码编辑页
        qrCodeEditor: {
            get() {
                return this.$store.state.base.qrCodeEditor;
            },
            set(value) {
                this.$store.state.base.qrCodeEditor = value;
            },
        },
        //  是否显示词云编辑页
        wordArtEditor: {
            get() {
                return this.$store.state.base.wordArtEditor;
            },
            set(value) {
                this.$store.state.base.wordArtEditor = value;
            },
        },
        // 是否显示地图编辑页
        mapEditor: {
            get() {
                return this.$store.state.base.mapEditor;
            },
            set(value) {
                this.$store.state.base.mapEditor = value;
            },
        },
        //  是否显示复制上传页面
        isCopyUpload() {
            return this.$store.state.base.isCopyUpload;
        },

        // 是否显示图表数据编辑页
        isEditChartData: {
            get() {
                return this.$store.state.base.isEditChartData;
            },
            set(value) {
                this.$store.commit('base/changeState', {
                    prop: 'isEditChartData',
                    value,
                });
            },
        },

        // 判断是否为设计师账号
        isUiManage() {
            return Ktu.isUIManage;
        },

        isThirdDesigner() {
            return Ktu.isThirdDesigner;
        },

        isInternalAcct() {
            return Ktu._isInternalAcct;
        },
    },
    methods: {
        closeGuide() {
            const url = '../ajax/ktuProf_h.jsp?cmd=setGuide';

            axios.post(url).then(res => {
                const info = (res.data);
                if (info.success) {
                    this.showGuide = false;
                }
            })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => {
                    this.showGuide = false;
                });
        },
    },
});
