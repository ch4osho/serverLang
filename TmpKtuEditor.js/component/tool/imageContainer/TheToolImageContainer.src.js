Vue.component('tool-imageContainer', {
    mixins: [Ktu.mixins.dataHandler],
    template: `
        <div class="tool-imageContainer">
            <template v-if="isClipMode">
                <tool-btn class="tool-box" icon="sure" tips="确认裁切" @click="sureCrop(true)" style="margin-left: 22px;"></tool-btn>
                <tool-btn class="tool-box" icon="exit" tips="退出裁切" @click="exitCrop"></tool-btn>
            </template>
            <template v-else>
                <template v-if="colorList.length && isShowOperation">
                    <color-picker v-for="(color, index) in colorList" :key="index" v-model="color.value" @change="changeColor(color)"></color-picker>
                    <tool-svg-stroke eventType="imageContainer" v-if="isShowStroke"></tool-svg-stroke>
                    <div class="tool-split tool-box" style="margin-left: 16px;"></div>
                </template>
                <template v-if="!isObjectInGroup">
                    <tool-btn class="tool-box" @click="crop">裁切</tool-btn>
                    <tool-filter></tool-filter>
                    <div class="tool-box tool-split" style="margin-left: 16px;"></div>
                </template>
                <tool-change-pic></tool-change-pic>
                <tool-size></tool-size>
                <div class="tool-split tool-box"></div>
                <tool-shadow></tool-shadow>
                <tool-opacity></tool-opacity>
                <tool-rotate></tool-rotate>

                <slot></slot>
            </template>
        </div>
    `,
    data() {
        return {};
    },
    computed: {
        isClipMode() {
            return this.selectedData.objects[0].isClipMode;
        },
        isShowOperation() {
            return this.selectedData.changedColors;
        },
        colorList() {
            const { changedColors } = this.selectedData;

            const colorList = [];
            this.isShowStroke = true;

            const colorKeys = Object.keys(changedColors);

            if (this.isShowOperation && colorKeys && colorKeys.length) {
                for (let index = 0; index < colorKeys.length; index++) {
                    const colors = changedColors[colorKeys[index]];
                    let fill;
                    let stroke;
                    if (!!colors) {
                        const colorArr = colors.split('||');
                        fill = colorArr[0];
                        stroke = colorArr[1];
                        if (!!fill && fill != 'none') {
                            const originFill = this.selectedData.originalColors[colorKeys[index]].split('||')[0];
                            const isColorExist = colorList.some(color => (color.originFill === originFill && color.prop === 'fill' ? color.path.push(index) : false));
                            !isColorExist && colorList.push({
                                value: fill,
                                prop: 'fill',
                                path: [index],
                                originFill,
                            });
                        }
                        if (!!stroke && stroke != 'none') {
                            const originStroke = this.selectedData.originalColors[colorKeys[index]].split('||')[0];
                            const isColorExist = colorList.some(color => (color.originStroke === originStroke && color.prop === 'stroke' ? color.path.push(index) : false));
                            !isColorExist && colorList.push({
                                value: stroke,
                                prop: 'stroke',
                                path: [index],
                                originStroke,
                            });
                            this.isShowStroke = false;
                        }
                    }
                }
            }
            if (colorList.length > 10) {
                // 颜色超过10种时修改颜色和描边功能都隐藏，此时svg当做普通图片使用
                this.isShowStroke = false;
                return [];
            }

            return colorList;
        },
    },
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

            Ktu.simpleLog('imageContainer', 'color');
            /* 不这样子vue这边不刷新
               this.selectedData.changedColors=changedColors;
               !Ktu.canvas.isPickingColor && this.selectedData.activeModify(); */
            this.selectedData.modifiedState();
            this.selectedData.dirty = true;
            /* Ktu.canvas.renderAll();
               this.$forceUpdate(); */
        },
        crop() {
            const imgInContainer = this.selectedData.objects[0];
            imgInContainer.enterClipMode();
            Ktu.simpleLog('imageContainer', 'crop');
            Ktu.log('cimage', 'crop');
        },
        sureCrop() {
            this.selectedData.objects[0].exitClipMode(true);
        },
        exitCrop() {
            this.selectedData.objects[0].exitClipMode(false);
        },
    },
});
