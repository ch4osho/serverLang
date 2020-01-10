Vue.component('consult-modal-box', {
    template: `
    <modal class="manageModal consult-modal" :width="386" class-name="newModalBody" v-model="showConsultModal">
        <div class="modal-img"></div>
        <div class="modal-text">凡科快图BETA交流群</div>
        <div class="modal-tip">暗号：fkw.com</div>
        <div class="modal-qq">
            <div class="icon"></div>
            <span>774242075</span>
        </div>
        <a href="//shang.qq.com/wpa/qunwpa?idkey=575b06daac2e94011b28e3dd2305d1a0386d3cae4d127b6e8109a4681769c76d" target="_blank" class="modal-btn">进群咨询</a>
    </modal>
    `,
    name: 'consultModal',
    props: {},
    data() {
        return {};
    },
    computed: {
        showConsultModal: {
            get() {
                return this.$store.state.modal.showConsultModal;
            },
            set(newValue) {
                this.$store.commit('modal/consultModalState', newValue);
            },
        },
    },
    methods: {},
});
