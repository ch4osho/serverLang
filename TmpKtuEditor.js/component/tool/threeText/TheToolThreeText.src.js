Vue.component('tool-threeText', {
    mixins: [Ktu.mixins.dataHandler],
    template: `<div class="tool-threeText">
                    <tool-text-style></tool-text-style>
                    <tool-material v-if="frontMaterial" @change-material="debounceUpdateFront" :material="frontMaterial"></tool-material>
                    <tool-material v-if="sideMaterial" @change-material="debounceUpdateSide" :material="sideMaterial"></tool-material>
                    <div class="tool-box tool-split" style="margin-left: 16px"></div>

                    <tool-font-family></tool-font-family>

                    <tool-font-size></tool-font-size>
                    <div class="tool-split tool-box"></div>
                    <tool-btn class="tool-box plus-fs-btn" icon="plussize" tips="加大字体"  @mouseout.left="shopPlusFont" @mousedown.left="plusFontSize" @mouseup.left="shopPlusFont"></tool-btn>
                    <tool-btn class="tool-box cut-fs-btn" icon="cutsize" tips="缩小字体"  @mouseout.left="shopCutFont" @mousedown.left="cutFontSize" @mouseup.left="shopCutFont"></tool-btn>                    
                    <div class="tool-box tool-split"></div>

                    <tool-text-margin :line-height-config="lineHeightConfig" :is-word-art="true" @changeSpacing="changeLetterSpacing" @changeHeight="changeLineHeight" @stopChangeHeight="updateLineHeight" @stopChangeSpacing="updateLetterSpacing"></tool-text-margin>
                    <tool-opacity></tool-opacity>
                    <tool-rotate :disable-list="disableRotateList"></tool-rotate>
                    <tool-public></tool-public>
                </div>`,
    data() {
        return {
            maxFontSize: 999,
            minFontSize: 1,
            disableRotateList: ['vertical', 'horizontal'],
            lineHeightConfig: {
                min: -5,
                max: 5,
            },
        };
    },
    computed: {
        fontSize() {
            return this.activeObject.fontSize;
        },
        frontMaterial() {
            return this.activeObject.frontMaterial;
        },
        sideMaterial() {
            return this.activeObject.sideMaterial;
        },
        letterSpacing() {
            if (!this.activeObject) {
                return 0;
            }
            return this.activeObject.letterSpacing;
        },
        lineHeight() {
            if (!this.activeObject) {
                return 0;
            }
            return this.activeObject.lineHeight;
        },
    },
    created() {
        this.debounceUpdateFront = this.debounce(this.updateFrontMaterail, 100);
        this.debounceUpdateSide = this.debounce(this.updateSideMaterail, 100);
    },
    methods: {
        changeLetterSpacing(value) {
            if (this.letterSpacingTimer) {
                clearTimeout(this.letterSpacingTimer);
                this.letterSpacingTimer = undefined;
            }
            this.letterSpacingTimer = setTimeout(() => {
                this.updateLetterSpacing(value);
            }, 400);
        },
        changeLineHeight(value) {
            if (this.lineHeightTimer) {
                clearTimeout(this.lineHeightTimer);
                this.lineHeightTimer = undefined;
            }
            this.lineHeightTimer = setTimeout(() => {
                this.updateLineHeight(value);
            }, 400);
        },
        updateLineHeight(value) {
            if (this.lineHeight == value) {
                return;
            }
            Ktu.log('threeTextEdit', 'changeSpacing');
            if (!this.activeObject) {
                return;
            }
            this.changeDataProps({
                lineHeight: value,
            });
        },
        updateLetterSpacing(value) {
            if (this.letterSpacing == value) {
                return;
            }
            Ktu.log('threeTextEdit', 'changeSpacing');
            if (!this.activeObject) {
                return;
            }
            this.changeDataProps({
                letterSpacing: value,
            });
        },
        shopPlusFont() {
            if (this.selectedData.type === 'threeText' && this.hasFontSizeChange) {
                Ktu.log('threeTextEdit', 'plusFontSize');
                this.hasFontSizeChange = false;
            }
            clearInterval(this.timer);
            clearInterval(this.lonPressTimer);
        },
        shopCutFont() {
            if (this.selectedData.type === 'threeText' && this.hasFontSizeChange) {
                Ktu.log('threeTextEdit', 'cutFontSize');
                this.hasFontSizeChange = false;
            }
            clearInterval(this.timer);
            clearInterval(this.lonPressTimer);
        },
        cutFontSize() {
            if (this.fontSize - 2 > this.minFontSize) {
                this.selectFontSize(this.fontSize - 2);
            } else {
                this.selectFontSize(this.minFontSize);
            }
            this.lonPressTimer = setTimeout(() => {
                this.timer = setInterval(() => {
                    if (this.fontSize - 2 > this.minFontSize) {
                        this.selectFontSize(this.fontSize - 2);
                    } else {
                        this.selectFontSize(this.minFontSize);
                        clearInterval(this.timer);
                    }
                }, 50);
            }, 500);
        },
        plusFontSize() {
            this.hasFontSizeChange = true;
            if (this.fontSize + 2 < this.maxFontSize) {
                this.selectFontSize(this.fontSize + 2);
            } else {
                this.selectFontSize(this.maxFontSize);
            }
            this.lonPressTimer = setTimeout(() => {
                this.timer = setInterval(() => {
                    if (this.fontSize + 2 < this.maxFontSize) {
                        this.selectFontSize(this.fontSize + 2);
                    } else {
                        this.selectFontSize(this.maxFontSize);
                        clearInterval(this.timer);
                    }
                }, 50);
            }, 500);
        },
        selectFontSize(value) {
            this.hasFontSizeChange = true;
            const { fontSize } = this.selectedData;
            let scale = this.selectedData.scaleX;
            scale = value / fontSize;
            this.changeDataProps({
                scaleX: scale,
                scaleY: scale,
            });
            this.selectedData.setCoords();
        },
        debounce(fn, delay) {
            let timer = undefined;
            let args = [];
            return function (...rest) {
                args = rest;
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(() => {
                    fn.apply(this, args);
                }, delay);
            };
        },
        updateFrontMaterail(item) {
            if (item.type === 'color') {
                Ktu.log('threeTextEdit', 'changeFrontColor');
            } else {
                Ktu.log('threeTextEdit', 'changeFrontTexture');
            }
            this.activeObject.saveState();
            this.activeObject.frontMaterial.use = item.type;
            this.activeObject.frontMaterial[item.type] = item.value;
            this.activeObject.dirty = true;
            this.activeObject.modifiedState();
        },
        updateSideMaterail(item) {
            if (item.type === 'color') {
                Ktu.log('threeTextEdit', 'changeSideColor');
            } else {
                Ktu.log('threeTextEdit', 'changeSideTexture');
            }
            this.activeObject.saveState();
            this.activeObject.sideMaterial.use = item.type;
            this.activeObject.sideMaterial[item.type] = item.value;
            this.activeObject.dirty = true;
            this.activeObject.modifiedState();
        },
    },
});
