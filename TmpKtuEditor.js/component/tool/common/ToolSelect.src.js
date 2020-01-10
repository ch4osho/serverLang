Vue.component('tool-select', {
    template: `
    <div class="tool-select">
        <div class="tool-select-title">{{title}}</div>
        <div class="tool-select-desc">
            <selector :value="value" @input="input" :options="options" :type="type" :iconConf="iconConf"></selector>
        </div>
    </div>
    `,
    props: {
        value: {
            type: [String, Number],
        },
        title: {
            type: String,
            default: '数值',
        },
        options: {
            type: Array,
        },
        type: {
            type: String,
            default: 'label',
        },
        iconConf: Object,
    },
    data() {
        return {
            /* options : [{
               value : 1,
               label : 1,
               src : "http://cd.aaadns.com.hjj.dev.cc/image/materialLib/figure/9000014.png"
               },{
               value : 2,
               label : 2,
               src : "http://cd.aaadns.com.hjj.dev.cc/image/materialLib/figure/9000013.png"
               }],
               model1 : 1 */
        };
    },
    computed: {
        inputStyle() {
        },
    },
    methods: {
        input(option) {
            this.$emit('input', option);
        },
    },
});
