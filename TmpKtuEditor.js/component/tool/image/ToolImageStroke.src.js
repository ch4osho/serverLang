Vue.component('tool-image-stroke', {
    mixins: [Ktu.mixins.popupCtrl, Ktu.mixins.dataHandler],
    props: {
        eventType: {
            type: [String, Number],
        },
    },
    template: `<div class="tool-box tool-image-stroke">
                    <stroke-tool-btn icon="stroke" tips="描边" @click="show" :class="{opened: isShow}"></stroke-tool-btn>
                    <transition :name="transitionName">
                        <div v-if="isShow" ref="popup" class="tool-popup tool-image-stroke-popup" :class="{'reverseX': isNeedReverseX, 'reverseY': isNeedReverseY}">
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

            popUpWidth: 220,
            popUpHeight: 165,
        };
    },
    computed: {
        stroke() {
            return this.selectedData.stroke && this.selectedData.strokeWidth ? this.selectedData.stroke : 'transparent';
        },
        strokeWidth() {
            return this.selectedData.stroke ? Math.round(this.selectedData.strokeWidth) : 0;
        },
        strokeLine() {
            return JSON.stringify(this.selectedData.strokeDashArray);
        },
        max() {
            /* let dimesion = this.selectedData._getTransformedDimensions(true);
               return Math.floor(Math.min(dimesion.x, dimesion.y) / 2 + 1); */
            return Math.floor(Math.min(this.selectedData.width * this.selectedData.scaleX, this.selectedData.height * this.selectedData.scaleY) + 1);
        },
    },
    methods: {
        changeStroke(prop, value, isAvoidSaveState) {
            this.changeDataProp(prop, value, isAvoidSaveState);
            if (this.eventType) {
                Ktu.log(this.eventType, 'stroke');
            } else {
                Ktu.log(this.activeObject.type, 'stroke');
            }
        },
        changeWidth(value) {
            if (value !== 0 && (this.selectedData.stroke == 'transparent' || !this.selectedData.stroke)) {
                this.changeStroke('stroke', this.defaultColor, true);
            }
            this.changeStroke('strokeWidth', value, true);
            this.selectedData.setCoords();
            this.updateGroup();
            if (this.eventType) {
                Ktu.log(this.eventType, 'stroke');
            } else {
                Ktu.log('cimage', 'stroke');
            }
        },
        changeLine(option) {
            this.changeStroke('strokeDashArray', JSON.parse(option.value));
            if (this.eventType) {
                Ktu.log(this.eventType, 'stroke');
            } else {
                Ktu.log('cimage', 'stroke');
            }
        },
        changeColor(value) {
            if (value != 'transparent' && this.selectedData.strokeWidth == 0) {
                this.changeStroke('strokeWidth', 1, true);
            }
            if (value == 'transparent') {
                this.changeStroke('strokeWidth', 0, true);
            }
            this.changeStroke('stroke', value);
            if (this.eventType) {
                Ktu.log(this.eventType, 'stroke');
            } else {
                Ktu.log('cimage', 'stroke');
            }
        },
    },
});
