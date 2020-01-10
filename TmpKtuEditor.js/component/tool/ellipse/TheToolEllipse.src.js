Vue.component('tool-ellipse', {
    mixins: [Ktu.mixins.dataHandler],
    template: `
        <div class="tool-ellipse">
            <color-picker :isGradient="true" :value="color" :isOpen="isOpenColor" @input="selectColor" tips="填充色" @showPopUp="clickFill"></color-picker>
            <tool-stroke :isOpen="isOpenStroke" @showPopUp="clickStroke"></tool-stroke>
            <div class="tool-split tool-box" style="margin-left: 16px;"></div>

            <tool-shadow @showPopUp="clickShadow"></tool-shadow>
            <tool-opacity @showPopUp="clickOpacity"></tool-opacity>
            <tool-rotate @showPopUp="clickRotate"></tool-rotate>

            <div v-if="!isObjectInGroup" class="tool-split tool-box"></div>
            <tool-change-pic v-if="!isObjectInGroup"></tool-change-pic>

            <div class="tool-split tool-box"></div>
            <tool-size></tool-size>

            <slot></slot>
        </div>
    `,
    data() {
        return {
        };
    },
    computed: {
        isOpenColor() {
            const { isOpenColor } = this.selectedData;
            if (isOpenColor) {
                delete this.selectedData.isOpenColor;
            }
            return isOpenColor;
        },
        isOpenStroke() {
            const { isOpenStroke } = this.selectedData;
            if (isOpenStroke) {
                delete this.selectedData.isOpenStroke;
            }
            return isOpenStroke;
        },
        color() {
            return this.selectedData.fill;
        },
    },
    methods: {
        selectColor(value) {
            this.changeDataProp('fill', value);
        },
        clickFill() {
            Ktu.log('quickDrawTool', 'fill');
        },
        clickStroke() {
            Ktu.log('quickDrawTool', 'stroke');
        },
        clickShadow() {
            Ktu.log('quickDrawTool', 'shadow');
        },
        clickOpacity() {
            Ktu.log('quickDrawTool', 'opacity');
        },
        clickRotate() {
            Ktu.log('quickDrawTool', 'rotate');
        },
    },
});
