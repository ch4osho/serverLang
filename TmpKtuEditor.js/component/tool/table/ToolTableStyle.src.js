Vue.component('tool-table-style', {
    template: `<div class="tool-box tool-table-style">
                    <div class="theme-color-picker">
                        <color-picker :value="themeColor" @input="selectThemeColor" ref="themeColorPicker"  @show="showThemeColor">
                            <ul class="style-list">
                                <li class="style-item" v-for="item in styleList" :class="{'active': type === item.type}"
                                @click="chooseTableType(item.type)">
                                    <img :src="useImage(item.src)">
                                </li>
                            </ul>
                            <div class="split-line"></div>
                        </color-picker>
                        <tool-btn class="color-mask" @click="chooseThemeColor" :class="{opened: hasShowedThemeColor}">模板样式</tool-btn>
                    </div>
                </div>`,
    mixins: [Ktu.mixins.dataHandler],
    data() {
        return {
            hasShowedThemeColor: false,

            styleList: [{
                type: 0,
                src: '/image/editor/tool/table/0.png',
            }, {
                type: 1,
                src: '/image/editor/tool/table/1.png',
            }, {
                type: 2,
                src: '/image/editor/tool/table/2.png',
            }, {
                type: 3,
                src: '/image/editor/tool/table/3.png',
            }, {
                type: 4,
                src: '/image/editor/tool/table/4.png',
            }, {
                type: 5,
                src: '/image/editor/tool/table/5.png',
            }, {
                type: 6,
                src: '/image/editor/tool/table/6.png',
            }, {
                type: 7,
                src: '/image/editor/tool/table/7.png',
            },
            {
                type: 8,
                src: '/image/editor/tool/table/8.png',
            },
            ],
        };
    },
    computed: {
        themeColor() {
            return this.selectedData.msg.themeColor;
        },

        resRoot() {
            return Ktu.initialData.resRoot;
        },

        type() {
            return this.selectedData.msg.type;
        },
    },
    methods: {
        useImage(src) {
            return this.resRoot + src;
        },

        selectThemeColor(value) {
            this.selectedData.saveState();
            this.selectedData.setMsg('themeColor', value);
            this.selectedData.initTableStyle(this.type, value, true);
            this.selectedData.modifiedState();
            this.selectedData.dirty = true;
            Ktu.log('tableTool', 'themeColor');
        },

        chooseThemeColor() {
            this.$refs.themeColorPicker.show();
        },

        showThemeColor(value) {
            this.hasShowedThemeColor = value;
        },

        chooseTableType(value) {
            this.selectedData.saveState();
            this.selectedData.setMsg('type', value);
            this.selectedData.initTableStyle(value, this.themeColor, true);
            this.selectedData.modifiedState();
            this.selectedData.dirty = true;
            Ktu.log('tableTool', 'themeStyle');
        },
    },
});
