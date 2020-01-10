Vue.component('tool-svg-stroke', {
    mixins: [Ktu.mixins.popupCtrl, Ktu.mixins.dataHandler],
    props: {
        eventType: {
            type: [String, Number],
        },
    },
    template: `<div class="tool-svg-stroke tool-box">
                    <stroke-tool-btn icon="stroke" tips="描边" @click="showPopup" :class="{opened: isShow}"></stroke-tool-btn>
                    <transition :name="transitionName">
                        <div v-if="isShow" ref="popup" class="tool-popup tool-svg-stroke-popup" :class="{'reverseX': isNeedReverseX, 'reverseY': isNeedReverseY}">
                            <tool-color :value="stroke" @input="changeColor"></tool-color>
                            <tool-slider :value="selectedData.strokeWidth" title="粗细" @input="changeWidth" :min="0" :max="30" :step="1"></tool-slider>
                            <tool-select :value="strokeLine" :options="strokeLineList" type="pic" @input="changeLine" title="线条" :iconConf="{width: 50, height: 16}"></tool-select>
                        </div>
                    </transition>
                </div>`,
    data() {
        return {
            strokeLineList: Ktu.config.tool.options.strokeLineList,
            defaultColor: '#000',

            popUpWidth: 220,
            popUpHeight: 165,
        };
    },
    computed: {
        stroke() {
            return this.selectedData.stroke && this.selectedData.strokeWidth ? this.selectedData.stroke : 'transparent';
        },
        strokeLine() {
            return JSON.stringify(this.selectedData.strokeDashArray);
        },
    },
    methods: {
        showPopup($event) {
            this.show($event, this.activeObject.type, 'stroke');
            if (this.eventType) {
                Ktu.log(this.eventType, 'stroke');
            }
        },
        changeStroke(prop, value, isAvoidSaveState) {
            this.changeDataProp(prop, value, isAvoidSaveState);
        },
        changeWidth(value) {
            if (value !== 0 && (!this.selectedData.stroke || this.selectedData.stroke === 'transparent')) {
                this.changeStroke('stroke', this.defaultColor, true);
            }
            this.changeStroke('strokeWidth', value, true);
            this.selectedData.setCoords();
            this.updateGroup();
        },
        changeLine(option) {
            this.changeStroke('strokeDashArray', JSON.parse(option.value));
        },
        changeColor(value) {
            if (value != 'transparent' && this.selectedData.strokeWidth == 0) {
                this.changeStroke('strokeWidth', 1, true);
            }
            if (value === 'transparent') {
                this.changeStroke('strokeWidth', 0, true);
            }
            this.changeStroke('stroke', value);
        },
    },
});
