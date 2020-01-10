Vue.component('audit-modal', {
    template: `
    <modal class="manageModal aduit-modal" :width="600"  v-model="showAuditModal">
        <iframe :src="src"></iframe>
    </modal>
    `,
    name: 'auditModal',
    props: {
    },
    data() {
        // Ktu.portalHost
        return {
            src: `//${Ktu.desHost}/designer/designFromKt.jsp?ktuId=${Ktu.ktuId}`,
        };
    },
    computed: {
        showAuditModal: {
            get() {
                return this.$store.state.modal.showAuditModal;
            },
            set(newValue) {
                this.$store.commit('modal/auditModalState', newValue);
            },
        },
    },
    mounted() {
    },
    methods: {
    },
});

