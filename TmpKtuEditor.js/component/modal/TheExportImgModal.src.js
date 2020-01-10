Vue.component('export-img-modal', {
    template: `<Modal class="manageModal export-img-modal" :width="width" :closable="false" :mask-closable="false" v-model="showExportImgModal" ref="modal">
                    <div class="modal-body">
                        <loading :loadingType="2" :size="105"></loading>
                        <div class="modal-text">素材正在生成中...</div>
                    </div>
                </Modal>`,
    name: 'exportImgModal',
    mixins: [Ktu.mixins.dataHandler],
    data() {
        return {
            width: 440,
        };
    },
    computed: {
        showExportImgModal() {
            return this.$store.state.modal.showExportImgModal;
        },
    },
});
