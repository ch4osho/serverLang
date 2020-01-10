Vue.component('tool-svg', {
    mixins: [Ktu.mixins.dataHandler],
    template: `
        <div class="tool-svg">
            <template v-if="isClipMode">
                <tool-btn class="tool-box" icon="sure" tips="确认裁切" @click="sureCrop(true)" style="margin-left: 22px;"></tool-btn>
                <tool-btn class="tool-box" icon="exit" tips="退出裁切" @click="exitCrop"></tool-btn>
            </template>
            <template v-else>

                <template v-if="colorList.length && isShowOperation">
                    <div :class="['color-group-wrap', {'color-group-show': colorGroupShow}]">
                        <tool-color-group :colorList="colorList" @change="changeColor"></tool-color-group>
                    </div>
                    <div class="color-single-wrap">
                        <color-picker v-for="(color, index) in colorList" :key="index" v-model="color.value" @change="changeColor(color)"></color-picker>
                    </div>
                    <tool-svg-stroke v-if="isShowStroke"></tool-svg-stroke>
                    <div class="tool-split tool-box" style="margin-left: 16px;"></div>
                </template>

                <tool-radius></tool-radius>

                <tool-shadow></tool-shadow>

                <tool-opacity></tool-opacity>

                <tool-rotate></tool-rotate>

                <tool-change-pic></tool-change-pic>

                <div class="tool-split tool-box"></div>

                <tool-size></tool-size>
            </template>

            <slot></slot>
        </div>
    `,
    data() {
        return {
            // isShowOperation: true,
            isShowStroke: true,
            colorGroupShow: false,
        };
    },
    computed: {
        hasAlphaCorner() {
            return this.selectedData.hasAlphaCorner;
        },
        isClipMode() {
            return this.selectedData.isClipMode;
        },
        isShowOperation() {
            return this.selectedData.changedColors;
        },
        colorList() {
            const { changedColors } = this.selectedData;
            const colorList = [];
            this.isShowStroke = true;
            this.colorGroupShow = false;
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
                /* colorList = paths.reduce(function(colorList, path, index) {
                   // if (path.hasOwnProperty('fill') && typeof path.fill === 'string') {
                   //fill有可能是渐变色对象，此时不显示
                   if (path.fill && typeof path.fill === 'string') {
                   var isColorExist = colorList.some(function(color) {
                   return color.originFill === path.originFill && color.prop === 'fill' ? color.path.push(index) : false;
                   });
                   !isColorExist && colorList.push({
                   value: path.fill,
                   prop: 'fill',
                   originFill: path.originFill,
                   path: [index]
                   });
                   }
                   if (path.stroke && path.strokeWidth && typeof path.stroke === 'string') {
                   var isColorExist = colorList.some(function(color) {
                   return color.originStroke === path.originStroke && color.prop === 'stroke' ? color.path.push(index) : false;
                   });
                   !isColorExist && colorList.push({
                   value: path.stroke,
                   prop: 'stroke',
                   originStroke: path.originStroke,
                   path: [index]
                   });
                   }
                   return colorList;
                   }, []); */
            }
            // 颜色在[5, 10]的处理
            if (colorList.length >= 5 && colorList.length <= 10) {
                this.colorGroupShow = true;
            }
            // 颜色超过10种时修改颜色和描边功能都隐藏，此时svg当做普通图片使用
            if (colorList.length > 10) {
                this.isShowStroke = false;
                return [];
            }
            return colorList;
        },
    },
    methods: {
        changeColor(color) {
            const value = typeof color.value === 'string' ? color.value : JSON.stringify(color.value);;
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
            Ktu.log('path-group', 'color');
        },
        crop() {
            this.selectedData.enterClipMode();
            Ktu.log(this.activeObject.type, 'crop');
        },
        sureCrop() {
            this.selectedData.exitClipMode(true);
        },
        exitCrop() {
            this.selectedData.exitClipMode(false);
        },
    },
});
