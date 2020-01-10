Vue.component('nav-btn', {
    template: `
    <div class="nav-btn" @click="click">
        <svg class="nav-icon">
            <use :xlink:href="'#svg-nav-'+icon" class="nav-icon-use"></use>
        </svg>
        <div class="btn-name">{{btnName}}</div>
    </div>`,
    props: {
        icon: String,
        btnName: String,
    },
    methods: {
        click(event) {
            this.$emit('click', event);
        },
    },
});
