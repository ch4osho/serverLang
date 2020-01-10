// 用于监听浏览器高度宽度变化，以作自适应处理
Ktu.mixins.Response = {
    computed: {
        // 浏览器高度
        browserHeight() {
            return this.$store.state.base.browserHeight;
        },
        // 浏览器宽度
        browserWidth() {
            return this.$store.state.base.browserWidth;
        },
        categoryHeight() {
            if (this.browserHeight && this.browserHeight < 710) {
                return 70;
            }
            return 80;
        },
        categoryWidth() {
            if (this.browserHeight && this.browserHeight < 710) {
                return 70;
            }
            return 80;
        },
        isMIniHeight() {
            if (this.browserHeight && this.browserHeight < 710) {
                return true;
            }
            return false;
        },
    },
};
