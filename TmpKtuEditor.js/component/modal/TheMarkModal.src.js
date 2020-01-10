Vue.component('mark-modal', {
    template: `
    <modal class="manageModal mark-modal" width="100%" :closable="closable" :mask-closable="showLoading || maskClosable" class-name="mark-modal-body" v-model="showMarkModal">
        <div class="mark-loading ktu-loading" v-if="showLoading">
            <div class="loading-box full">
                <div class="loading-circle loading-circle-3"></div>
                <div class="loading-circle loading-circle-2"></div>
                <div class="loading-circle loading-circle-1"></div>
                <div class="loading-icon"></div>
            </div>
        </div>
        <div class="iframe-container">
            <iframe :src="iframeSrc" >
            </iframe>
        </div>
    </modal>
    `,
    name: 'markModal',
    props: {},
    data() {
        return {
            closable: false,
            debounceTimer: null,
            showLoading: true,
            isFinished: true,
            maskClosable: false,
        };
    },
    methods: {
        closeLoading() {
            this.showLoading = false;
        },
        showFishing() {
            this.isFinished = false;
        },
        cancel() {
            this.showMarkModal = false;
        },
        finish(data) {
            Ktu.store.commit('data/changeState', {
                prop: 'markSvg',
                value: data.markSvg,
            });
            Ktu.store.commit('data/changeState', {
                prop: 'markData',
                value: data.markData,
            });
            Ktu.log('saveSuccessGroup');
            Ktu.ktuData.content.forEach((pageId, index) => {
                Ktu.save.savePage(false, index);
            });
            this.maskClosable = true;
            this.showMarkModal = false;
            this.isFinished = true;
        },
        debounce(method, time = 30) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                method.call(this);
            }, time);
        },
        messageHandler(event) {
            if (event && event.data) {
                const res = event.data;
                this[`${res.key}`] && this[`${res.key}`](res.data);
            }
        },
        pageStart() {
            window.addEventListener('message', this.messageHandler, true);
        },
        pageEnd() {
            window.removeEventListener('message', this.messageHandler, true);
        },
    },
    computed: {
        isMarkSelected() {
            return JSON.stringify(this.markData) != '{}';
        },
        markData() {
            return this.$store.state.data.markData;
        },
        showMarkModal: {
            get() {
                return this.$store.state.modal.showMarkModal;
            },
            set(newValue) {
                this.$store.commit('modal/showMarkModalState', newValue);
            },
        },
    },
    created() {
        this.pageStart();
        const ktuData = {};
        ktuData.ktuAid = Ktu.ktuAid;
        ktuData.ktuId = Ktu.ktuId;
        ktuData.content = Ktu.ktuData.content;
        ktuData.width = Ktu.ktuData.other.width;
        ktuData.height = Ktu.ktuData.other.height;
        this.iframeSrc = `//${Ktu.manageDomain}/kutil/imark/index.jsp?isFromModal=true&isMarkSelected=${this.isMarkSelected}&ktuData=${encodeURI(JSON.stringify(ktuData))}`;
    },
    destroyed() {
        this.pageEnd();
    },

});
