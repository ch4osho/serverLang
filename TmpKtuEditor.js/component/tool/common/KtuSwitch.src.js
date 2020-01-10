Vue.component('ktu-switch', {
    template: `
        <span :class="wrapClasses" @click="toggle">
            <input type="hidden" :name="name" :value="currentValue">
            <span :class="innerClasses">
                <slot name="open" v-if="currentValue === trueValue"></slot>
                <slot name="close" v-if="currentValue === falseValue"></slot>
            </span>
        </span>
        `,
    name: 'ktuSwitch',
    mixins: [Ktu.mixins.emitter],
    props: {
        value: {
            type: [String, Number, Boolean],
            default: false,
        },
        trueValue: {
            type: [String, Number, Boolean],
            default: true,
        },
        falseValue: {
            type: [String, Number, Boolean],
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        size: {
            validator(value) {
                return Ktu.oneOf(value, ['large', 'medium', 'small', 'default']);
            },
        },
        name: {
            type: String,
        },
        logName: String,
        srcName: String,
    },
    data() {
        return {
            currentValue: this.value,
            prefixCls: 'ktu-switch',
        };
    },
    watch: {
        value(val) {
            if (val !== this.trueValue && val !== this.falseValue) {
                throw 'Value should be trueValue or falseValue.';
            }
            this.currentValue = val;
        },
    },
    computed: {
        wrapClasses() {
            const { prefixCls } = this;
            const obj = {};
            obj[`${prefixCls}-checked`] = this.currentValue === this.trueValue;
            obj[`${prefixCls}-disabled`] = this.disabled;
            obj[`${prefixCls}-${this.size}`] = !!this.size;

            return [prefixCls, obj];
        },
        innerClasses() {
            const { prefixCls } = this;
            return [`${prefixCls}-inner`];
        },
    },
    methods: {
        toggle() {
            if (this.disabled) {
                return false;
            }

            const checked = this.currentValue === this.trueValue ? this.falseValue : this.trueValue;

            this.currentValue = checked;
            this.$emit('input', checked);
            this.$emit('on-change', checked);
            this.dispatch('FormItem', 'on-form-change', checked);
            // console.log(this.logName);
        },
    },
});
