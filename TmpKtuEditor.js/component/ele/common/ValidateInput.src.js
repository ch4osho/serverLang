Vue.component('validate-input', {
    template: `
    <input :class="[{active:isActive}]" spellcheck="false" type="text"
        @focus="inputFocus($event)" @blur="inputBlur($event)"
        @keyup.enter="$el.blur()" @wheel.prevent="inputWheel($event)"
        @input="onInput"
        :value="inputUnitVal" :maxlength="maxLength" :style="{ width: inputWidth}"
        ref="input" @click="click" :disabled="disabled"
    />
    `,
    props: {
        inputVal: [String, Number],
        valType: {
            type: String,
            default: '',
        },
        maxLength: {
            type: Number,
            default: 100,
        },
        unit: {
            type: String,
            default: '',
        },
        size: {
            type: Number,
            default: 10,
        },
        max: {
            type: Number,
            default: 100,
        },
        min: {
            type: Number,
            default: 0,
        },
        step: {
            type: Number,
            default: 1,
        },
        autoWidth: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        blurCallBack: Function,
        valErrorCallBack: Function,
        valChangeCallBack: Function,
    },
    data() {
        return {
            isActive: false,
            lastVal: '',
        };
    },
    computed: {
        inputUnitVal() {
            let val = this.inputVal;
            if (!this.isActive) {
                val += this.unit;
            }
            return val;
        },
        valReg() {
            let reg = '';
            switch (this.valType) {
                case 'color':
                    reg = /^#?([0-9a-fA-F]{6}|[0-9a-fA-F]{3}|transparent|TRANSPARENT)$/i;
                    break;
                case 'number':
                    reg = /^[-|0-9][0-9]*/;
                    break;
            }
            return reg;
        },
        /* inputSize : function() {
           var tmp = this.size;
           if(this.autoWidth) {
           if(this.isActive || !(this.unit)) {
           tmp = Math.round(this.max).toString().length;
           } else{
           tmp = (Math.round(this.max) + this.unit).length; */

        /* }
           }
           return tmp;
           }, */
        inputWidth() {
            let tmp = this.size;
            if (this.autoWidth) {
                if (this.isActive || !(this.unit)) {
                    tmp = Math.round(this.max).toString().length;
                } else {
                    tmp = (Math.round(this.max) + this.unit).length;
                }
            }
            if (this.inputVal == 'TRANSPARENT') {
                tmp = `${tmp * 9}px`;
            } else {
                tmp = `${tmp * 18}px`;
            }
            return tmp;
        },
    },
    methods: {
        onInput(event) {
            this.$emit('onInput', event);
        },
        /* param event 事件对象
           返回事件对象  可在使用组件时，监听focus方法，返回event对象
            */
        inputFocus(event) {
            const self = this;
            this.isActive = true;
            this.$emit('focus', event);

            this.$nextTick(() => {
                self.$el.select();
                self.getLastVal();
            });
        },
        /* param event 事件对象
           返回事件对象  可在使用组件时，监听blur方法，返回event对象
            */
        inputBlur(event) {
            this.isActive = false;
            this.$emit('blur', event);
            this.$el.blur();
            this.valChange();
        },
        inputWheel(event) {
            if (this.isActive && this.valType == 'number' && this.$el.value) {
                let nowValue = parseInt(this.$el.value, 10);
                const {
                    step,
                } = this;

                if (nowValue < this.max && event.wheelDelta > 0) {
                    nowValue += step;
                }
                if (nowValue > this.min && event.wheelDelta < 0) {
                    nowValue -= step;
                }

                // this.$el.value = nowValue;
                this.$emit('input', nowValue);
            }
        },
        getLastVal() {
            this.lastVal = this.$el.value;
        },
        // 校验数据
        validate() {
            let success = true;
            let {
                lastVal,
            } = this;
            let nowValue = this.$el.value;
            // 如果是 number类型 要先转化
            if (this.valType == 'number') {
                lastVal = parseInt(lastVal, 10);
                nowValue = parseInt(nowValue, 10);
                if (this.max != undefined && nowValue > this.max) {
                    nowValue = this.max;
                }
                if (this.min != undefined && nowValue < this.min) {
                    nowValue = this.min;
                }
            } else if (this.valType == 'color') {
                lastVal = lastVal.toLowerCase();
            }

            // 验证失败  改回原值
            if (nowValue === undefined || this.valReg && !this.valReg.test(nowValue)) {
                success = false;
            }

            return {
                success,
                lastVal,
                nowValue,
            };
        },
        valChange() {
            let {
                success,
                lastVal,
                nowValue,
            } = this.validate();

            if (success) {
                if (typeof nowValue != 'number' && this.valType === 'color') {
                    nowValue = nowValue.toLowerCase();
                }
                this.$emit('input', nowValue);
                this.valChangeCallBack && this.valChangeCallBack(nowValue);
            } else {
                this.valReg.test(lastVal) && this.$emit('input', lastVal);
                this.valErrorCallBack && this.valErrorCallBack();
                this.$Notice.warning(nowValue ? '格式不正确，请检查' : '请输入内容');
            }
            this.blurCallBack && this.blurCallBack();
        },
        click(event) {
            this.$emit('click', event);
        },
    },
});
