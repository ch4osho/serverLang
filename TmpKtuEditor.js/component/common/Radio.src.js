(function () {
    const prefixCls = 'ktu-radio';

    Vue.component('radio', {
        template: `
        <label :class="wrapClasses">
            <span :class="radioClasses">
                <span :class="innerClasses"></span>
                <input
                    type="radio"
                    :class="inputClasses"
                    :disabled="disabled"
                    :checked="currentValue"
                    :name="groupName"
                    @change="change">
            </span>
            <span class="ktu-radio-label">
                <slot>{{ label }}</slot>
            </span>
        </label>
        `,
        name: 'Radio',
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
            label: {
                type: [String, Number],
            },
            disabled: {
                type: Boolean,
                default: false,
            },
            size: {
                validator(value) {
                    return Ktu.oneOf(value, ['small', 'large', 'default']);
                },
            },
            name: {
                type: String,
            },
        },
        data() {
            return {
                currentValue: this.value,
                group: false,
                groupName: this.name,
                parent: Ktu.findComponentUpward(this, 'RadioGroup'),
                focusWrapper: false,
                focusInner: false,
            };
        },
        computed: {
            wrapClasses() {
                return [
                    `${prefixCls}-wrapper`,
                    {
                        [`${prefixCls}-group-item`]: this.group,
                        [`${prefixCls}-wrapper-checked`]: this.currentValue,
                        [`${prefixCls}-wrapper-disabled`]: this.disabled,
                        [`${prefixCls}-${this.size}`]: !!this.size,
                        [`${prefixCls}-focus`]: this.focusWrapper,
                    },
                ];
            },
            radioClasses() {
                return [
                    `${prefixCls}`,
                    {
                        [`${prefixCls}-checked`]: this.currentValue,
                        [`${prefixCls}-disabled`]: this.disabled,
                    },
                ];
            },
            innerClasses() {
                return [
                    `${prefixCls}-inner`,
                    {
                        [`${prefixCls}-focus`]: this.focusInner,
                    },
                ];
            },
            inputClasses() {
                return `${prefixCls}-input`;
            },
        },
        mounted() {
            if (this.parent) {
                this.group = true;
                if (this.name && this.name !== this.parent.name) {
                    /* eslint-disable no-console */
                    if (console.warn) {
                        console.warn('[iview] Name does not match Radio Group name.');
                    }
                    /* eslint-enable no-console */
                } else {
                    this.groupName = this.parent.name;
                }
            }

            if (this.group) {
                this.parent.updateValue();
            } else {
                this.updateValue();
            }
        },
        methods: {
            change(event) {
                if (this.disabled) {
                    return false;
                }

                const { checked } = event.target;
                this.currentValue = checked;

                const value = checked ? this.trueValue : this.falseValue;
                this.$emit('input', value);

                if (this.group) {
                    this.parent.change({
                        value: this.value || this.label,
                        checked: value,
                    });
                } else {
                    this.$emit('on-change', value);
                    this.dispatch('FormItem', 'on-form-change', value);
                }
            },
            updateValue() {
                this.currentValue = this.value === this.trueValue;
            },
        },
        watch: {
            value(val) {
                if (val === this.trueValue || val === this.falseValue) {
                    this.updateValue();
                } else {
                    throw 'Value should be trueValue or falseValue.';
                }
            },
        },
    });
}());
