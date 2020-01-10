Vue.component('normal-modal', {
    template: `
    <Modal class="manageModal normal-modal" :width="424" class-name="newModalBody" v-model="showNormalModal">
        <img class="modal-img" :src="modalImgSrc">
        <div class="modal-text">{{modalText}}</div>
        <btn class="modal-btn" @click="close">{{btnText}}</btn>
    </Modal>
    `,
    name: 'normalModal',
    props: {
        modalImgSrc: String,
        modalText: String,
        btnText: {
            type: String,
            default: '我知道了',
        },
        okFn: Function,
    },
    data() {
        return {
        };
    },
    computed: {
        showNormalModal: {
            get() {
                return this.$store.state.modal.showNormalModal;
            },
            set(newValue) {
                this.$store.commit('modal/normalModalState', {
                    isOpen: newValue,
                });
            },
        },
    },
    methods: {
        close() {
            this.showNormalModal = false;
            this.okFn && this.okFn();
        },
    },
});

