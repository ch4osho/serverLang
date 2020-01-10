Vue.component('tool-text-bg', {
    mixins: [Ktu.mixins.popupCtrl, Ktu.mixins.dataHandler],
    props: {
        from: {
            type: String,
            default: '',
        },
    },
    template: `<div class="tool-box tool-text-bg" @click="chooseColor">
                    <svg class="text-bg-icon">
                       <use xlink:href="#svg-tool-text-bg-icon"></use>
                    </svg>
                    <svg class="color-tips"  v-if="textBg == 'transparent'">
                       <use xlink:href="#svg-tool-text-without-bg"></use>
                    </svg>
                    <div class="color-tips multiColor" v-if="isMultiColor"></div>
                    <div v-else class="color-tips" :class="{'width-border':textBg != 'transparent'}" :style="{backgroundColor:textBg}">
                    </div>
                    <div class="color-picker-wraper">
                       <tool-color :value="textBg" title="" tips='文字背景色' :hideIcon="true" @input="changeColor"></tool-color>
                    </div>
                </div>`,
    data() {
        return {
            isOpend: false,
            isMultiColor: false,
        };
    },
    computed: {
        textBg() {
            this.isMultiColor = false;
            if (this.selectedData) {
                return this.selectedData.textBg;
            } else if (this.currentMulti) {
                const { textBg } = this.currentMulti.objects[0];
                this.currentMulti.objects.forEach(text => {
                    if (textBg != text.textBg) {
                        this.isMultiColor = true;
                    }
                });
                return !this.isMultiColor ? textBg : 'colorful';
            } else if (this.selectedGroup) {
                /* 暂时不用支持组合
                   const { textBg } = this.selectedGroup.objects[0];
                   this.selectedGroup.objects.forEach(text => {
                   if (textBg != text.textBg) {
                   this.isMultiColor = true;
                   }
                   });
                   return !this.isMultiColor ? textBg : 'transparent'; */
            }
        },
    },
    methods: {
        changeColor(value) {
            this.changeDataProp('textBg', value);
        },
        chooseColor() {
            if (this.from === 'edit-tool') Ktu.log('textBgFromEditTool', 'clickIcon');
            if (this.from === 'tool-bar') Ktu.log('textBgFromToolBar', 'clickIcon');
        },
    },
    mounted() { },
});
