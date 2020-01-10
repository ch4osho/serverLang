Vue.component('edit-select', {
    mixins: [Ktu.mixins.popupCtrl],
    template: `  <div class="edit-select" v-if="selectedBox" :style="{left: selectedBoxLeft+'px', top: selectedBoxTop+'px', width: selectedBox.width+'px', height: selectedBox.height+'px'}">
                </div>
            `,
    mixins: [Ktu.mixins.Response],
    data() {
        return {
            navHeight: Ktu.config.nav.height,
            // categoryWidth: Ktu.config.ele.categoryWidth,
            detailWidth: Ktu.config.ele.detailWidth,
        };
    },
    computed: {
        interactive() {
            return this.$store.state.base.interactive;
        },
        isShowEleDetail() {
            return this.$store.state.base.isShowEleDetail;
        },
        selectedBox() {
            return this.$store.state.base.selectedBox;
        },
        selectedBoxLeft() {
            return this.selectedBox.left - this.categoryWidth - (this.isShowEleDetail ? this.detailWidth : 0);
        },
        selectedBoxTop() {
            return this.selectedBox.top - this.navHeight;
        },
    },
    mounted() {
        Ktu.interactive = this.interactive;
    },
    methods: {

    },
});
