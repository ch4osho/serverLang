Vue.component('stroke-tool-btn', {
    mixins: [Ktu.mixins.popupCtrl, Ktu.mixins.dataHandler],
    props: {
        icon: String,
    },
    template: `<div v-touch-ripple class="stroke-btn" @click="click" :class="{'btn-word': !icon, 'has-tips': icon}">
                    <div class="stroke-btn-out" :class="{'nullLine': !selectedData.strokeWidth || !selectedData.stroke}" :style="{background: selectedData.strokeWidth && selectedData.stroke ? stroke : defaultColor}">
                        <div class="stroke-btn-in"></div>
                    </div>
                </div>`,
    methods: {
        click(event) {
            this.$emit('click', event);
        },
    },
    data() {
        return {
            defaultColor: '#fff',
        };
    },
    computed: {
        stroke() {
            if (this.selectedData && this.selectedData.stroke) {
                let { stroke } = this.selectedData;
                if (stroke.includes('type')) {
                    stroke = JSON.parse(stroke);
                    if (stroke.type === 'linear') {
                        let linear = 'linear-gradient(to right,';
                        stroke.value.forEach((item, index, arr) => {
                            linear += item.color;
                            if (index !== arr.length - 1) linear += ',';
                        });
                        linear += ')';
                        return linear;
                    }
                    let radial = 'radial-gradient(circle,';
                    stroke.value.forEach((item, index, arr) => {
                        radial += item.color;
                        if (index !== arr.length - 1) radial += ',';
                    });
                    radial += ')';
                    return radial;
                }
                return this.selectedData.stroke;
            };
            return this.defaultColor;
        },
    },
    watch: {
    },
});
