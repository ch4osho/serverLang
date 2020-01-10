Vue.component('font-authorization-modal', {
    template: `
        <Modal class="font-modal download-modal" :footerHide="true" :width="width" :closable="false" class-name="newModalBody" v-model="showFontAuthorizationModal">
            <div class="modal-body query-content" >
                <div class="query-top">
                    <p class="text">当前作品使用了以下版权风险字体：</p>
                    <p class="text" v-if="FontAutObj.needAut.length"><span class="grey">需授权字体：</span><span class="red">{{FontAutObj.needAut.join('、')}}</span></p>
                    <p class="text" v-if="FontAutObj.lmtUse.length"><span class="grey">有限商用字体：</span><span class="origin">{{FontAutObj.lmtUse.join('、')}}</span></p>
                </div>
                <div class="query-bottom">
                    <p class="text"><span class="red">含有需授权字体，</span><span class="grey">作品若用于商业用途,须向字体厂商购买授权。 </span></p>
                    <p class="text"><span class="origin">含有有限商用字体，</span><span class="grey">作品可在凡科网平台内商用,外部商用须向字体厂商购。</span></p>
                </div>
            </div>
            <div class="modal-btn">
                <btn class="btn query-btn" @click="backDownload">返回下载</btn>
            </div>
        </Modal>
    `,
    name: 'downloadModal',
    mixins: [Ktu.mixins.dataHandler],
    data() {
        return {
            width: 506,
            lmtUseArr: [],
            needAutArr: [],
        };
    },
    computed: {
        showFontAuthorizationModal: {
            get() {
                return this.$store.state.modal.showFontAuthorizationModal;
            },
            set(newValue) {
                this.$store.commit('modal/fontAuthorizationModalState', newValue);
            },
        },
        FontAutObj() {
            return this.$store.state.base.FontAutObj;
        },
    },
    watch: {
    },
    methods: {
        backDownload() {
            this.$store.commit('modal/fontAuthorizationModalState', false);
        },
    },
});
