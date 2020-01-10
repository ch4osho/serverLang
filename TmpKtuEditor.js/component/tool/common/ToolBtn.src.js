Vue.component('tool-btn', {
    props: {
        icon: String,
        active: Boolean,
    },
    template: `<div v-touch-ripple class="tool-btn" @click="click" @mouseout="mouseout" @mousedown="mousedown" @mouseup="mouseup" :class="{'btn-word': !icon, 'has-tips': icon,'active':active}">
                    <svg v-if="icon" class="tool-btn-svg">
                        <use :xlink:href="'#svg-tool-'+icon" class="tool-btn-svg-use"></use>
                    </svg>
                    <span class="tool-btn-word" v-else>
                        <slot></slot>
                    </span>
                </div>`,
    methods: {
        click(event) {
            this.$emit('click', event);
        },
        mousedown(event) {
            this.$emit('mousedown', event);
        },
        mouseup(event) {
            this.$emit('mouseup', event);
        },
        mouseout(event) {
            this.$emit('mouseout', event);
        },
    },
});
