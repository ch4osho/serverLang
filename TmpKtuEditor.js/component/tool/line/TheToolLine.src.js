Vue.component('tool-line', {
    mixins: [Ktu.mixins.dataHandler],
    template: `
        <div class="tool-line">
            <color-picker :isOpen="isOpenColor" :colorAlphaShow="colorAlphaShow" :value="color" @input="selectColor" tips="颜色" @showPopUp="clickFill"></color-picker>

            <div class="tool-split tool-box" style="margin-left: 16px;"></div>

            <drop-menu :value="lineDash" @input="selectLineDash" :options="strokeLineList" btnWidth="62px" menuWidth="82px" class="tool-line-dash" type="pic" @showPopUp="clickLineDash"></drop-menu>

            <drop-menu :value="strokeWidth"
                :inputConf="{min: minStrokeWidth, max: maxStrokeWidth, maxLength: maxStrokeWidth.toString().length, openGuide: false}"
                @input="selectStrokeWidth" :options="strokeWidthList" unit="px" menuWidth="70px" style="font-size: 12px;" @showPopUp="clickStrokeWidth">
                    {{strokeWidth + 'px'}}
            </drop-menu>

            <drop-arrow-menu @selectArrow="selectArrow" @showPopUp="clickArrow"></drop-arrow-menu>

            <div class="tool-split tool-box"></div>

            <tool-opacity @showPopUp="clickOpacity"></tool-opacity>

            <tool-rotate @showPopUp="clickRotate"></tool-rotate>

            <div class="tool-split tool-box"></div>

            <tool-size></tool-size>

            <slot></slot>
        </div>
    `,
    data() {
        return {
            minStrokeWidth: 1,
            maxStrokeWidth: 999,
            strokeLineList: Ktu.config.tool.options.strokeLineList,
            strokeWidthList: Ktu.config.tool.options.strokeWidthList,
        };
    },
    computed: {
        color() {
            return this.selectedData.stroke;
        },
        colorAlphaShow() {
            return this.selectedData.msg.arrowStyle == 'normal';
        },
        lineDash() {
            return JSON.stringify(this.selectedData.strokeDashArray);
        },
        strokeWidth() {
            return Math.max(Math.round(this.selectedData.strokeWidth * this.selectedData.scaleY), 1);
        },
        isOpenColor() {
            const { isOpenColor } = this.selectedData;
            if (isOpenColor) {
                delete this.selectedData.isOpenColor;
            }
            return isOpenColor;
        },
    },
    methods: {
        selectColor(value) {
            this.changeDataProp('stroke', value);
        },
        selectLineDash(value) {
            this.changeDataProp('strokeDashArray', JSON.parse(value));
        },
        selectStrokeWidth(value) {
            this.changeDataProp('strokeWidth', value / this.selectedData.scaleY);
            !this.selectedData.group && this.selectedData.setCoords();
            this.updateGroup();
        },
        selectArrow(value) {
            this.changeDataProp('msg', value);
            this.updateGroup();
        },
        clickArrow(value) {
            Ktu.log('quickDrawTool', 'arrow');
        },
        clickFill() {
            Ktu.log('quickDrawTool', 'fill');
        },
        clickLineDash() {
            Ktu.log('quickDrawTool', 'lineType');
        },
        clickStrokeWidth() {
            Ktu.log('quickDrawTool', 'lineWidth');
        },
        clickOpacity() {
            Ktu.log('quickDrawTool', 'opacity');
        },
        clickRotate() {
            Ktu.log('quickDrawTool', 'rotate');
        },
    },
});
