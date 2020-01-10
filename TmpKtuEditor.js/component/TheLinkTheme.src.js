Vue.component('link-theme', {
    template: '<address class="theme-area">'
                    + '<link rel="prefetch" as="style" v-for="(theme, index) in themeObj" :key="index" :href="theme.path"/>'
                    + '<link rel="stylesheet" :href="themeObj[theme].path" v-if="theme !== initialTheme"/>'
                + '</address>',
    data() {
        return {
            themeObj: Ktu.initialData.themeConfig,
            initialTheme: Ktu.userData.other.theme,
        };
    },
    computed: {
        theme() {
            return this.$store.state.base.theme;
        },
    },
});
