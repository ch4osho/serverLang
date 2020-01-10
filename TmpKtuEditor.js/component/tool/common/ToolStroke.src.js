Vue.component('tool-stroke', {
    mixins: [Ktu.mixins.popupCtrl, Ktu.mixins.dataHandler],
    template: `<div class="tool-box tool-stroke">
                    <stroke-tool-btn icon="stroke" tips="描边" @click="show" :class="{opened: isShow}"></stroke-tool-btn>
                    <transition name="slide-up">
                        <div v-if="isShow" ref="popup" class="tool-popup tool-stroke-popup " :class="{'reverseX': isNeedReverseX, 'reverseY': isNeedReverseY}">
                            <tool-color :value="stroke" @input="changeColor"></tool-color>
                            <tool-slider :value="strokeWidth" title="粗细" @input="changeWidth" :min="0" :max="max" :step="1"></tool-slider>
                            <tool-select :value="strokeLine" :options="strokeLineList" type="pic" @input="changeLine" title="线条" :iconConf="{width: 50, height: 16}"></tool-select>
                        </div>
                    </transition>
                </div>`,
    data() {
        return {
            strokeLineList: Ktu.config.tool.options.strokeLineList,
            defaultColor: '#000',
        };
    },
    computed: {
        stroke() {
            return this.selectedData.stroke && this.strokeWidth ? this.selectedData.stroke : 'transparent';
        },
        strokeLine() {
            return JSON.stringify(this.selectedData.strokeDashArray);
        },
        strokeWidth() {
            return this.selectedData.strokeWidth ? Math.max(1, Math.round(this.selectedData.strokeWidth * this.selectedData.scaleX)) : 0;
        },
        max() {
            /* let dimesion = this.selectedData._getTransformedDimensions(true);
               return Math.floor(Math.min(dimesion.x, dimesion.y) / 2 + 1); */
            return Math.floor(Math.min(this.selectedData.width * this.selectedData.scaleX, this.selectedData.height * this.selectedData.scaleY) + 1);
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
            this.changeStroke('strokeWidth', Math.round(value / this.selectedData.scaleX));
            this.selectedData.setCoords();
            this.updateGroup();
        },
        changeLine(option) {
            this.changeStroke('strokeDashArray', JSON.parse(option.value));
        },
        changeColor(value) {
            if (value != 'transparent' && this.selectedData.strokeWidth == 0) {
                this.changeStroke('strokeWidth', Math.ceil(1 / this.selectedData.scaleX), true);
            }
            if (value === 'transparent') {
                this.changeStroke('strokeWidth', 0, true);
            }
            this.changeStroke('stroke', value);
        },
    },
});
