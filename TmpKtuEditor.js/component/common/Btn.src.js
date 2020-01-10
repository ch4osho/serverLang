Vue.component('btn', {
    props: {
        type: {
            type: String,
            default: 'common',
        },
        btnClass: String,
        icon: String,
    },
    template: `<div v-touch-ripple class="btn" @click="click" :class="[classType,btnClass]">
                    <svg class="btn-icon" v-if="icon">
                        <use :xlink:href="'#'+icon"></use>
                    </svg>
                    <label class="btn-label" :class="{'btn-label-hasIcon': icon}">
                        <slot></slot>
                    </label>
                </div>`,
    computed: {
        classType() {
            let className = '';
            switch (this.type) {
                case 'compound' :
                    className = 'btn-compound';
                    break;
                case 'cancel' :
                    className = 'btn-cancel';
                    break;
                case 'warn' :
                    className = 'btn-warn';
                    break;
                default :
                    className = 'btn-common';
                    break;
            }
            return className;
        },
    },
    methods: {
        click(event) {
            this.$emit('click', event);
        },
    },
});
