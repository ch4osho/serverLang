Vue.component('ele-btn', {
    props: {
        icon: String,
        label: {
            type: String,
            default: '我是一个按钮',
        },
    },
    template: `<div v-touch-ripple class="ele-btn" @click="click">
                    <svg class="ele-btn-icon" v-if="icon">
                        <use :xlink:href="'#svg-ele-'+icon"></use>
                    </svg>
                    <label class="ele-btn-label">{{label}}</label>
                </div>`,
    methods: {
        click() {
            this.$emit('click');
        },
    },
});
