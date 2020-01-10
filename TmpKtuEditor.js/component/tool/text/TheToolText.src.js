Vue.component('tool-text', {
    mixins: [Ktu.mixins.dataHandler],
    template: `
        <div class="tool-text" @click="exitEditing" ref="tool">
            <tool-text-style></tool-text-style>     

            <template v-if="isWordart">
                <tool-text-color></tool-text-color>
            </template>

            <template v-else>
                <div class="tool-split tool-box"></div>

                <color-picker :isGradient="true" :value="color" @input="selectColor"></color-picker>

                <tool-text-stroke :isGradient="true"></tool-text-stroke>

                <tool-text-bg from="edit-tool" v-if="!isGroup"></tool-text-bg>
            </template>

            <div class="tool-split tool-box" style="margin-left: 16px"></div>

            <tool-font-family></tool-font-family>

            <div class="tool-split tool-box"></div>

            <tool-font-size></tool-font-size>

            <div class="tool-split tool-box"></div>

            <tool-btn class="tool-box plus-fs-btn" icon="plussize" tips="加大字体"  @mouseout.left="shopPlusFont" @mousedown.left="plusFontSize" @mouseup.left="shopPlusFont"></tool-btn>

            <tool-btn class="tool-box cut-fs-btn" icon="cutsize" tips="缩小字体"  @mouseout.left="shopCutFont" @mousedown.left="cutFontSize" @mouseup.left="shopCutFont"></tool-btn>

            <div class="tool-split tool-box"></div>

            <tool-btn class="tool-box" icon="bold" tips="加粗" @click="setBold" :class="{checked: selectedData.fontWeight === 'bold'}"></tool-btn>

            <tool-btn class="tool-box" icon="italic"  tips="斜体" @click="setItalic" :class="{checked: selectedData.fontStyle === 'italic'}"></tool-btn>

            <tool-btn class="tool-box" v-if="!isWordart" icon="underline" tips="下划线" @click="setUnderline" :class="{checked: selectedData.textDecoration}"></tool-btn>

            <tool-btn class="tool-box conversion-btn" icon="conversion" tips="大小写切换"
            @click="setConversion()" v-if="textLowerReg.test(text)"></tool-btn>

            <drop-menu :value="selectedData.textAlign" :icon="selectedData.textAlign" tips="文本对齐" :options="justifyList" @input="setJustify"></drop-menu>

            <div class="tool-split tool-box"></div>

            <tool-text-margin></tool-text-margin>

            <tool-shadow></tool-shadow>

            <tool-opacity></tool-opacity>

            <tool-rotate></tool-rotate>

            <slot></slot>
        </div>
    `,
    props: {

    },
    data() {
        return {
            justifyList: Ktu.config.tool.options.justifyList,
            minFontSize: 1,
            maxFontSize: 999,
            timer: null,
            lonPressTimer: null,
            textLowerReg: /[a-zA-Z]+/,
        };
    },
    computed: {
        isGroup() {
            return this.activeObject.type === 'group';
        },
        isWordart() {
            return this.selectedData.type === 'wordart';
        },
        zoom() {
            return this.$store.state.data.zoom;
        },
        color() {
            return this.selectedData.fill;
        },
        fontSize() {
            const offsetScale = this.activeObject.group ? this.activeObject.group.scaleX : 1;
            return Math.round(this.activeObject.fontSize * this.activeObject.scaleX * offsetScale);
        },
        text() {
            return this.selectedData.text;
        },
    },
    watch: {
        zoom() {
            this.selectedData.isEditing && this.selectedData.exitEditing();
        },
    },
    mounted() {
    },
    created() {
        // 描边兼容
        this.selectedData.strokeLineJoin = 'round';
    },
    methods: {
        exitEditing() {
            this.selectedData && this.selectedData.isEditing && this.selectedData.exitEditing();
        },
        log(srcName) {
            Ktu.log(this.selectedData.type, srcName);
        },
        selectColor(value) {
            this.changeDataProp('fill', value);
            this.log('color');
        },
        setBold() {
            this.selectedData.setBold();
            this.log('bold');
        },
        setItalic() {
            this.selectedData.setItalic();
            this.log('italic');
        },
        setUnderline() {
            this.selectedData.setUnderline();
            this.log('underline');
        },
        setConversion(isAllCapitalize) {
            this.selectedData.setConversion();
            Ktu.log('textbox', 'conversion');
        },
        setJustify(value) {
            this.selectedData.hasChanged = true;
            this.changeDataProp('textAlign', value);
            this.log('align');
        },
        plusFontSize() {
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
            this.log('plus');
        },
        shopPlusFont() {
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
            this.log('cut');
        },

        shopCutFont() {
            clearInterval(this.timer);
            clearInterval(this.lonPressTimer);
        },
        selectFontSize(value) {
            const { fontSize } = this.selectedData;
            let scale = this.selectedData.scaleX;
            scale = value / fontSize;
            this.changeDataProps({
                scaleX: scale,
                scaleY: scale,
            });
            this.selectedData.setCoords();
            this.updateGroup();
        },
    },
});
