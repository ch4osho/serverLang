Vue.component('tool-switch', {
    props: {
        value: {
            required: true,
        },
        title: String,
        size: String,
    },
    template: `<div class="tool-switch clearfix">
					<div class="tool-switch-title">{{title}}</div>
					<ktu-switch :value="value" @input="input" class="tool-switch-ctrl" :size="size"></ktu-switch>
				</div>`,
    data() {
        return {

        };
    },
    computed: {

    },
    methods: {
        input(value) {
            this.$emit('input', value);
        },
    },
});
