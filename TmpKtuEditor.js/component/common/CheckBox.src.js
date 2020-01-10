Vue.component('check-box', {
    template: `
    <label class="check-warrper" @click="input" >
        <div class="check-box" :class="{checked: value}">
            <svg v-if="value" class="check-box-icon">
                <use xlink:href="#svg-nav-checkbox"></use>
            </svg>
        </div>
        <span class="check-label" v-if="showSlot">
            <slot>{{ label }}</slot>
        </span>
    </label>
    `,
    props: {
        label: {
            type: [String, Number, Boolean],
        },
        value: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            showSlot: false,
        };
    },
    mounted() {
        this.showSlot = this.$slots.default !== undefined;
    },
    methods: {
        input() {
            this.$emit('input', !this.value);
        },
    },
});
