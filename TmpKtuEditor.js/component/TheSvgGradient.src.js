Vue.component('svg-gradient', {
    template: `
    <svg class="svg-gradient">
        <linearGradient id="svg_logo" gradientUnits="userSpaceOnUse" x1="15.7643" y1="8.3159" x2="35.2085" y2="41.9943">
            <stop offset="0.1" style="stop-color:#F4D039"/>
            <stop offset="1" style="stop-color:#FD7255"/>
        </linearGradient>
        <linearGradient id="svg_ele_dir_close" x1="17" y1="41" x2="63" y2="41" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#fcc12d"/>
            <stop offset="1" stop-color="#fb9131"/>
        </linearGradient>
        <linearGradient id="svg_ele_dir_open" x1="17" y1="41" x2="63" y2="41" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#fcc12d"/>
            <stop offset="1" stop-color="#fb9131"/>
        </linearGradient>
        <material-gradient></material-gradient>
    </svg>`,
    data() {
        return {

        };
    },
    computed: {

    },
});
