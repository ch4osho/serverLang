Vue.component('tool-wordCloud', {
    mixins: [Ktu.mixins.dataHandler],
    template: `<div class="tool-wordCloud">
                    <tool-btn class="tool-box" tips="编辑样式" @click="modifyWordCloud">编辑样式</tool-btn>
                    <tool-opacity></tool-opacity>
                    <tool-rotate></tool-rotate>
                    <slot></slot>
                </div>`,
    data() {
        return {};
    },
    computed: {

    },
    methods: {
        // 修改二维码
        modifyWordCloud() {
            if (this.selectedData && this.selectedData.type === 'wordCloud') {
                this.selectedData.modifyWordCloud();
                Ktu.log('wordCloud', 'edit');
            }
        },
    },
});
