Vue.component('tool-slider', {
    mixins: [Ktu.mixins.dataHandler],
    template: `
    <div class="tool-slider" :class="{disabled: disabled}">
        <div class="tool-slider-desc">
            <div class="tool-slider-title">{{title}}</div>
            <validate-input
                class="tool-slider-value" :inputVal="currentValue"
                :unit="unit" :min="min" :max="max"
                valType="number" :autoWidth="true"
                @input="exitInput" :disabled="disabled">
            </validate-input>
        </div>

        <div class="tool-slider-container" :class="{zero: min<0}">
            <ktu-slider :value="currentValue" :min="min" :max="max" :step="step" @input="input" @start="start" @change="change" :disabled="disabled"></ktu-slider>
        </div>

        <div class="tool-slider-btn-group" v-if="needBtn !== undefined">
            <btn class="tool-slider-btn" @click="ensure">确认</btn>
            <btn class="tool-slider-btn" @click="cancel" type="cancel">取消</btn>
        </div>
    </div>
    `,
    props: {
        value: {
            type: Number,
            required: true,
        },
        title: {
            type: String,
            default: '数值',
        },
        unit: {
            type: String,
            default: '',
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        min: Number,
        max: Number,
        step: Number,
        param: null,
        needBtn: String,
        isWordArt: {
            default: false,
            type: Boolean,
        },
    },
    data() {
        return {
            currentValue: this.value,
        };
    },
    computed: {},
    watch: {
        value(newVal) {
            this.currentValue = newVal;
        },
    },
    methods: {
        exitInput(value) {
            if (!this.isWordArt) {
                const { activeObject } = this;
                activeObject.saveState();
                this.currentValue = value;
                this.$emit('input', value, this.param);
                this.$emit('change', value, this.param);
                Vue.nextTick(() => {
                    // this.isOriginGroup ? this.selectedData.activeChange() : this.selectedData.activeModify();
                    activeObject.modifiedState();
                });
            } else {
                this.currentValue = value;
                this.$emit('input', value, this.param);
            }
        },
        input(value) {
            if (this.isWordArt) {
                this.currentValue = value;
            }
            this.$emit('input', value, this.param);
        },
        ensure() {
            this.$emit('ensure');
        },
        cancel() {
            this.$emit('cancel');
        },
        start() {
            if (!this.isWordArt) {
                this.activeObject.saveState();
            }
        },
        change(value) {
            this.$emit('change', value, this.param);
            // this.isOriginGroup ? this.selectedData.activeChange() : this.selectedData.activeModify();
            if (!this.isWordArt) {
                this.activeObject.modifiedState();
            }
        },
    },
});
