Vue.component('invite-edit-modal', {
    template: `
    <Modal class="manageModal invite-edit-modal" :width="699" :maskAnimate="true" class-name="newModalBody" v-model="showInviteEditModal">
        <div class="modal-body">
            <img class="img" :src="inviteEditImg"/>

            <div class="text">
                <p>无从下手？邀请朋友来帮你改图！（此功能正在研发中）</p>
            </div>

            <div class="invite-modal-btn">
                <btn class="btn" @click="closeModal">正是我需要的，请加速研发！</btn>
            </div>
        </div>
    </Modal>
    `,
    name: 'inviteEditModal',
    props: {},
    data() {
        return {

        };
    },
    mounted() {
        Ktu.log('cooperateEdit', 'show');
    },
    computed: {
        showInviteEditModal: {
            get() {
                return this.$store.state.modal.showInviteEditModal;
            },
            set(newValue) {
                this.$store.commit('modal/inviteEditModalState', newValue);
            },
        },
        inviteEditImg() {
            return `${Ktu.initialData.resRoot}/image/editor/invite-edit.png`;
        },
    },
    methods: {
        closeModal() {
            this.showInviteEditModal = false;

            this.$Notice.success('感谢催更~我们会加油的~');
            Ktu.log('cooperateEdit', 'click');
        },
    },
});
