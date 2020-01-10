Vue.component('tool-chart', {
    template: `
        <div class="tool-chart">
            <color-picker :value="color" @input="selectColor" tips="主题色" @showPopUp="clickColor"></color-picker>
            <div class="tool-split tool-box" style="margin-left: 16px;"></div>

            <div class="tool-box font-color-picker">
                <color-picker :value="fontColor" @input="selectFontColor" ref="picker" @show="showFontColor"></color-picker>
                <tool-btn class="tool-box color-mask" icon="font_color" tips="字体色" @click="chooseFontColor" :style="fontColorStyle" :class="{opened: hasShowedFontColor}"></tool-btn>
            </div>

            <tool-shadow @showPopUp="clickShadow"></tool-shadow>
            <tool-opacity @showPopUp="clickOpacity"></tool-opacity>
            <tool-rotate @showPopUp="clickRotate"></tool-rotate>

            <div class="tool-split tool-box"></div>

            <div @mousedown="show">
                <tool-btn class="tool-box tool-chart-edit" :class="{opened: isShow}">编辑数据</tool-btn>
            </div>

            <slot></slot>
        </div>
    `,
    mixins: [Ktu.mixins.dataHandler],
    data() {
        return {
            hasShowedFontColor: false,
        };
    },
    computed: {
        color() {
            return this.selectedData.msg.color;
        },
        fontColor() {
            return this.selectedData.msg.fontColor;
        },
        fontColorStyle() {
            return {
                fill: this.fontColor,
            };
        },
        isEditChartData: {
            get() {
                return this.$store.state.base.isEditChartData;
            },
            set(value) {
                this.$store.commit('base/changeState', {
                    prop: 'isEditChartData',
                    value,
                });
            },
        },
        isShow() {
            return this.isEditChartData;
        },
    },
    methods: {
        // 选择颜色
        selectColor(value) {
            this.selectedData.saveState();
            this.selectedData.changeColor(value);
            this.selectedData.modifiedState();
            this.selectedData.dirty = true;
            Ktu.save.changeSaveNum();
        },
        // 选择颜色
        selectFontColor(value) {
            this.selectedData.saveState();
            this.selectedData.changeFontColor(value);
            this.selectedData.modifiedState();
            this.selectedData.dirty = true;
            Ktu.save.changeSaveNum();
        },
        chooseFontColor() {
            if (!this.$refs.picker.isShow) {
                Ktu.simpleLog('chartTool', 'fontColor');
            }
            this.$refs.picker.show();
        },

        show() {
            if (!this.isEditChartData) {
                Ktu.log('chartTool', 'editData');
            }
            this.isEditChartData = !this.isEditChartData;
        },

        clickColor() {
            Ktu.log('chartTool', 'color');
        },

        clickShadow() {
            Ktu.log('chartTool', 'shadow');
        },

        clickOpacity() {
            Ktu.log('chartTool', 'opacity');
        },

        clickRotate() {
            Ktu.log('chartTool', 'rotate');
        },
        showFontColor(value) {
            this.hasShowedFontColor = value;
        },
    },
});
