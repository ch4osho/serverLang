Vue.component('tool-svgfill', {
    template: `<div class="tool-svgfill">
                    <color-picker v-if="colorList.length===1" v-model="colorList[0].value" @change="changeColor(colorList[0])"></color-picker>
                    <template v-else>
                        <tool-btn icon="svgfill" tips="svg颜色" @click="show" :class="{opened: isShow}"></tool-btn>
                        <transition>
                            <div v-if="isShow" ref="popup" class="child-bar tool-shadow-popup">
                                <color-picker v-for="(color, index) in colorList" :key="index" v-model="color.value" @change="changeColor(color)"></color-picker>
                            </div>
                        </transition>
                    </template>
                </div>`,
    mixins: [Ktu.mixins.dataHandler, Ktu.mixins.popupCtrl],
    props: {
        colorList: {
            type: Array,
        },
    },
    data() {
        return {};
    },
    computed: {},
    methods: {
        changeColor(color) {
            const { value } = color;
            const { prop } = color;
            const { changedColors } = this.selectedData;
            // !Ktu.canvas.isPickingColor && this.selectedData.saveState();
            this.selectedData.saveState();
            color.path.forEach(index => {
                const changedColor = changedColors[index] ? changedColors[index].split('||') : ['', ''];
                changedColor[prop === 'fill' ? 0 : 1] = value;
                changedColors[index] = changedColor.join('||');
                // this.changeDataObject('changedColors', index, changedColor[1] ? changedColor.join('||') : changedColor[0]);
            });
            /* 不这样子vue这边不刷新
               this.selectedData.changedColors=changedColors;
               !Ktu.canvas.isPickingColor && this.selectedData.activeModify(); */
            this.selectedData.modifiedState();
            this.selectedData.dirty = true;
            /* Ktu.canvas.renderAll();
               this.$forceUpdate(); */
            Ktu.log('levelSVGMenu', 'color');
        },
    },
});
