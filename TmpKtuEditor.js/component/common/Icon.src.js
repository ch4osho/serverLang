;(function () {
    const prefixCls = 'ktu-icon';

    Vue.component('Icon', {
        template: `<i :class="classes" :style="styles" @click="click"></i>`,
        name: 'Icon',
        props: {
            type: String,
            size: [Number, String],
            color: String,
        },
        computed: {
            classes() {
                return `${prefixCls} ${prefixCls}-${this.type}`;
            },
            styles() {
                const style = {};

                if (this.size) {
                    style['font-size'] = `${this.size}px`;
                }

                if (this.color) {
                    style.color = this.color;
                }

                return style;
            },
        },
        methods: {
            click(event) {
                this.$emit('click', event);
            },
        },
    });
}());
