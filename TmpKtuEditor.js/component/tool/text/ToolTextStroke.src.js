Vue.component('tool-text-stroke', {
    mixins: [Ktu.mixins.popupCtrl, Ktu.mixins.dataHandler],
    props: {
        eventType: {
            type: [String, Number],
        },
        isGradient: {
            type: Boolean,
            defalut: false,
        },
    },
    template: `<div class="tool-box tool-stroke">
                    <stroke-tool-btn icon="stroke" tips="描边" @click="show($event,textboxType,'stroke')" :class="{opened: isShow}"></stroke-tool-btn>
                    <transition :name="transitionName">
                        <div v-if="isShow" ref="popup" class="tool-popup tool-stroke-popup" :class="{'reverseX': isNeedReverseX, 'reverseY': isNeedReverseY}">
                            <tool-color :isGradient="isGradient" :value="stroke" @input="changeColor"></tool-color>
                            <tool-slider :value="strokeWidth" title="粗细" @input="changeWidth" :min="0" :max="maxWidth" :step="1"></tool-slider>
                            <tool-select :value="strokeLine" :options="strokeLineList" type="pic" @input="changeLine" title="线条" :iconConf="{width: '50px', height: '16px'}"></tool-select>
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
            return this.selectedData.stroke && this.strokeWidth ? this.selectedData.stroke : 'transparent';
        },
        strokeLine() {
            return JSON.stringify(this.selectedData.strokeDashArray);
        },
        strokeWidth() {
            return this.selectedData.stroke ? Math.round(this.selectedData.strokeWidth) : 0;
        },
        maxWidth() {
            return this.selectedData.fontSize * this.selectedData.scaleX;
        },
        textboxType() {
            if (this.eventType) {
                return this.eventType;
            }
            return 'textbox';
        },
        /* max: function() {
           return Math.floor(Math.min(this.selectedData.width*this.selectedData.scaleX, this.selectedData.height*this.selectedData.scaleY) + 1);
           } */
    },
    methods: {
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
            // Ktu.log("textbox", "stroke");
        },
        changeLine(option) {
            this.changeStroke('strokeDashArray', JSON.parse(option.value));
            // Ktu.log("textbox", "stroke");
        },
        changeColor(value) {
            if (value != 'transparent' && this.selectedData.strokeWidth == 0) {
                this.changeStroke('strokeWidth', 1, true);
            }
            if (value === 'transparent') {
                this.changeStroke('strokeWidth', 0, true);
            }
            this.changeStroke('stroke', value);
            // Ktu.log("textbox", "stroke");
        },
    },
});
