Vue.component('delete-materialModal-box', {
    template: `
    <Modal class="manageModal delete-modal" :width="416" v-model="showDeleteModal">
        <div class="deleteModalHeader" slot="header"></div>
        <div class="deleteModalContent">
            <div class="delete-dir" >
                <div class="delete-tip">
                    确定删除文件夹<span>“{{deleteMaterialDir.name}}”</span>吗？<br/>未删除的素材将保留至<span>“默认文件夹”</span>
                </div>
                <div class="delete-checkbox">
                    <check-box :value="isChecked" @input="triggerCheck">
                        <p>同时删除文件夹内素材</p>
                    </check-box>
                </div>
            </div>
        </div>
        <div class="deleteModalFooter" slot="footer">
            <div class="btn btn-warn" @click="confirm">确定</div>
            <div class="btn btn-normal" @click="closeModal">取消</div>
        </div>
    </Modal>
    `,
    mixins: [Ktu.mixins.uploadSetting, Ktu.mixins.materialHandler],
    data() {
        return {
            isChecked: false,
        };
    },
    computed: {
        showDeleteModal: {
            get() {
                return this.$store.state.modal.showDeleteMaterialModal;
            },
            set(newValue) {
                this.$store.commit('modal/deleteMaterialModalState', newValue);
            },
        },
    },
    methods: {
        // 关闭弹窗
        closeModal() {
            this.$store.commit('modal/deleteMaterialModalState', false);
        },
        confirm() {
            this.delDir(this.isChecked);
            this.closeModal();
        },
        triggerCheck(value) {
            this.isChecked = value;
        },
    },
});
