Vue.component('tool-table-border', {
    mixins: [Ktu.mixins.popupCtrl, Ktu.mixins.dataHandler],
    template: `<div class="tool-box tool-table-border">
                    <tool-btn icon="table_border" tips="边框" @click="show($event, 'tableTool', 'clickBorder')" :class="{opened: isShow}"></tool-btn>

                    <transition name="slide-up">
                        <div v-if="isShow" ref="popup" class="tool-popup tool-border-popup" :class="{'reverseX': isNeedReverseX, 'reverseY': isNeedReverseY}">
                            <tool-color :value="stroke" @input="changeColor" title="边框颜色"></tool-color>
                            <tool-slider :value="strokeWidth" title="粗细" @input="changeWidth" :max="max" :min="min" :step="1"></tool-slider>
                            <tool-select :value="strokeLine" :options="strokeLineList" type="pic" @input="changeLine" title="线条" :iconConf="{width: 50, height: 16}"></tool-select>
                            <!--
                            <tool-color :value="fill" @input="changeFill" title="框底颜色"></tool-color>
                            -->
                        </div>
                    </transition>
                </div>`,
    props: {
        stroke: {
            type: String,
            default: '#F1FAFF',
        },
    },
    data() {
        return {
            strokeLineList: Ktu.config.tool.options.strokeLineList,
            defaultColor: '#000',
            max: 20,
            min: 0,
            popUpWidth: 220,
            popUpHeight: 225,
        };
    },
    computed: {
        strokeLine() {
            return JSON.stringify(this.selectedData.strokeDashArray);
        },
        strokeWidth() {
            return Math.round(this.selectedData.strokeWidth) || 0;
        },
        /* max() {
           let dimesion = this.selectedData._getTransformedDimensions(true);
           return Math.floor(Math.min(dimesion.x, dimesion.y) / 2 + 1);
           return Math.floor(Math.min(this.selectedData.width * this.selectedData.scaleX, this.selectedData.height * this.selectedData.scaleY) + 1);
           return 10;
           }, */
        fill() {
            return this.selectedData.fill ? this.selectedData.fill : 'transparent';
        },
    },
    methods: {
        changeStroke(prop, value, isAvoidSaveState) {
            /* this.selectedData[prop] = value;
               !this.selectedData.stroke && (this.selectedData.stroke = '#000'); */
            this.changeDataProp(prop, value, isAvoidSaveState);
        },

        changeWidth(value) {
            if (value !== 0 && (!this.selectedData.stroke || this.selectedData.stroke === 'transparent')) {
                this.changeStroke('stroke', this.defaultColor, true);
            }
            this.changeStroke('strokeWidth', value);
            this.selectedData.setCoords();
            this.updateGroup();
        },

        changeLine(option) {
            this.changeStroke('strokeDashArray', JSON.parse(option.value));
            Ktu.log('tableTool', 'borderLine');
        },

        changeColor(value) {
            this.$emit('input', value);
        },

        changeFill(value) {
            this.changeStroke('fill', value);
        },
    },
});
