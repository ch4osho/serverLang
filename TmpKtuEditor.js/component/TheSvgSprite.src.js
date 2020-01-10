Vue.component('svg-sprite', {
    template: `
	<hgroup class="svg-area">
		<svg-gradient></svg-gradient>
		<svg class="svg-sprite" display="none" xmlns="http://www.w3.org/2000/svg" version="1.1">
			<icon-nav></icon-nav>
			<icon-ele></icon-ele>
			<icon-edit></icon-edit>
			<icon-tool></icon-tool>
			<icon-material></icon-material>
			<icon-contextmenu></icon-contextmenu>
            <icon-other></icon-other>
            <icon-utils></icon-utils>
			<g v-html="svgfont"></g>
		</svg>
	</hgroup>`,
    // <icon-font></icon-font>
    data() {
        return {
            svgfont: '',
        };
    },
    created() {
        if (!Ktu.fontSvgPath) {
            return;
        }
        axios.get(Ktu.fontSvgPath).then(res => {
            const tmpData = res.data.replace(/'|’/g, '`')
                .replace(/\\n/g, ' ')
                .replace(/\\t/g, ' ');
            this.svgfont = tmpData.split('`')[1];
        });
    },
    computed: {

    },
});
