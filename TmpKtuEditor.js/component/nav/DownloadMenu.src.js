
Vue.component('download-menu', {
    template: `
    <div class="download-menu">
        <btn icon="svg-nav-download" @click="showModal" :class="{checked: isShow}" type="compound">下载</btn>
    </div>`,
    mixins: [Ktu.mixins.popupCtrl, Ktu.mixins.dataHandler],
    data() {
        return {
            isShowMask: true,
        };
    },
    methods: {
        showModal() {
            // 未保存要先保存 要等保存完毕后才打开弹窗
            Ktu.template.saveCurrentPage(true).then(() => {
                this.$store.commit('modal/downloadModalState', true);
            });
        },
    },
});
