Vue.component('tool-text-margin', {
    template: `<div class="tool-box tool-text-margin">
                    <tool-btn v-if="showIcon" icon="margin" tips="间距" @click="show" :class="{opened: isShow}"></tool-btn>
                    <tool-btn v-else @click="show" :class="{opened: isShow}">间距</tool-btn>

					<transition :name="transitionName">
					    <div v-if="isShow" ref="popup" class="tool-popup tool-text-margin-popup" :class="{'reverseX': isNeedReverseX, 'reverseY': isNeedReverseY}">
							<tool-slider :value="charSpacing" title="字间距" @input="changeCharSpacing" :min="spacingConfig.min" :max="spacingConfig.max" :step="1" @change="stopCharSpacing"></tool-slider>
							<tool-slider :value="lineHeight" title="行间距" @input="changeLineHeight" :min="lineHeightConfig.min" :max="lineHeightConfig.max" :step="1" @change="stopLineHeight"></tool-slider>
						</div>
					</transition>
				</div>`,
    mixins: [Ktu.mixins.popupCtrl, Ktu.mixins.dataHandler],
    props: {
        eventType: {
            type: [String, Number],
        },
        isWordArt: {
            default: false,
            type: [Boolean],
        },
        showIcon: {
            type: Boolean,
            default: false,
        },
        spacingConfig: {
            type: Object,
            default() {
                return {
                    min: -5,
                    max: 100,
                };
            },
        },
        lineHeightConfig: {
            type: Object,
            default() {
                return {
                    min: -5,
                    max: 30,
                };
            },
        },
    },
    data() {
        return {
            popup: 'toolTextMargin',
            popUpWidth: 220,
            popUpHeight: 148,
            isWordArtSpacing: 0,
            isWordArtLineHeight: 0,
        };
    },
    computed: {
        charSpacing() {
            if (!this.isWordArt) {
                return this.selectedData.charSpacing ? this.selectedData.charSpacing / 20 : 0;
            }
            if (this.selectedData.type == 'threeText') {
                return this.selectedData.letterSpacing;
            }
            return this.isWordArtSpacing;
        },
        lineHeight() {
            if (!this.isWordArt) {
                return this.selectedData.lineHeight ? Math.round((this.selectedData.lineHeight - 1) / 0.1) : 1;
            }
            if (this.selectedData.type == 'threeText') {
                return this.selectedData.lineHeight;
            }
            return this.isWordArtLineHeight;
        },
    },
    methods: {
        changeCharSpacing(value) {
            if (!this.isWordArt) {
                this.selectedData.hasChanged = true;
                this.changeDataProp('charSpacing', value * 20, true);
                this.updateGroup();
            } else {
                this.isWordArtSpacing = value;
                this.$emit('changeSpacing', value);
            }
            /* console.log(this.selectedData.charSpacing);
               Ktu.mainCanvas.eleCustom.setStyle('charSpacing', value*100); */
        },
        stopCharSpacing() {
            if (!this.isWordArt) {
                if (this.eventType) {
                    Ktu.log(this.eventType, 'margin');
                } else {
                    Ktu.log(this.selectedData.type, 'margin');
                }
            } else {
                this.$emit('stopChangeSpacing', this.isWordArtSpacing);
            }
        },
        changeLineHeight(value) {
            if (!this.isWordArt) {
                this.selectedData.hasChanged = true;
                this.changeDataProp('lineHeight', 1 + value * 0.1, true);
                this.updateGroup();
            } else {
                this.isWordArtLineHeight = value;
                this.$emit('changeHeight', value);
            }
            /* console.log(this.selectedData.lineHeight);
               Ktu.mainCanvas.eleCustom.setStyle('lineHeight', value); */
        },
        stopLineHeight() {
            if (!this.isWordArt) {
                if (this.eventType) {
                    Ktu.log(this.eventType, 'margin');
                } else {
                    Ktu.log(this.selectedData.type, 'margin');
                }
            } else {
                this.$emit('stopChangeHeight', this.isWordArtLineHeight);
            }
        },
    },
});
