(function () {
    const prefixCls = 'ktu-radio-group';

    let seed = 0;
    const now = Date.now();
    const getUuid = () => `ktuRadioGroup_${now}_${seed++}`;

    Vue.component('radio-group', {
        template: `
        <div :class="classes" :name="name">
            <slot></slot>
        </div>
        `,
        name: 'RadioGroup',
        mixins: [Ktu.mixins.emitter],
        props: {
            value: {
                type: [String, Number],
                default: '',
            },
            size: {
                validator(value) {
                    return Ktu.oneOf(value, ['small', 'large', 'default']);
                },
            },
            type: {
                validator(value) {
                    return Ktu.oneOf(value, ['button']);
                },
            },
            vertical: {
                type: Boolean,
                default: false,
            },
            name: {
                type: String,
                default: getUuid,
            },
        },
        data() {
            return {
                currentValue: this.value,
                childrens: [],
            };
        },
        computed: {
            classes() {
                return [
                    `${prefixCls}`,
                    {
                        [`${prefixCls}-${this.size}`]: !!this.size,
                        [`ktu-radio-${this.size}`]: !!this.size,
                        [`${prefixCls}-${this.type}`]: !!this.type,
                        [`${prefixCls}-vertical`]: this.vertical,
                    },
                ];
            },
        },
        mounted() {
            this.updateValue();
        },
        methods: {
            updateValue() {
                this.childrens = Ktu.findComponentsDownward(this, 'Radio');
                if (this.childrens) {
                    this.childrens.forEach(child => {
                        child.currentValue = (this.currentValue === child.value || this.currentValue === child.label);
                        child.group = true;
                    });
                }
            },
            change(data) {
                this.currentValue = data.value;
                this.updateValue();
                this.$emit('input', data.value);
                this.$emit('on-change', data.value);
                this.dispatch('FormItem', 'on-form-change', data.value);
            },
        },
        watch: {
            value() {
                if (this.currentValue !== this.value) {
                    this.currentValue = this.value;
                    this.updateValue();
                }
            },
        },
    });
}());
