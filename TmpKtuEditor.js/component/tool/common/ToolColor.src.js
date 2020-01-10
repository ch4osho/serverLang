Vue.component('tool-color', {
    props: {
        value: {
            type: [String, Object],
            required: true,
        },
        title: {
            type: String,
            default: '颜色',
        },
        direction: {
            type: String,
            default: 'normal',
        },
        param: null,
        hideIcon: {
            type: Boolean,
            default: false,
        },
        tips: {
            type: String,
            default: '',
        },
        isGradient: {
            type: Boolean,
            default: false,
        },
    },
    template: `<div class="tool-color clearfix">
					<div class="tool-color-title" >{{title}}</div>
					<color-picker :value="value" :isGradient="isGradient" :tips="tips" :hideIcon="hideIcon" @input="input" style="float: right;" :direction="direction" @showPopUp="showPopUp"></color-picker>
				</div>`,
    data() {
        return {

        };
    },
    computed: {

    },
    methods: {
        input(value) {
            this.$emit('input', value, this.param);
        },
        showPopUp() {
            this.$emit('showPopUp');
        },
    },
});
