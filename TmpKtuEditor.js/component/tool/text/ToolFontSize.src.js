Vue.component('tool-font-size', {
    mixins: [Ktu.mixins.dataHandler],
    template: ` <drop-menu :value="fontSize"
                    :inputConf="{min: minFontSize, max: maxFontSize, maxLength: maxFontSize.toString().length, openGuide: false}"
                    @input="selectFontSize" :options="fontSizeList" unit="px" menuWidth="70px" menuHeight="338px"
                    style="font-size: 12px;">
                        {{fontSize + 'px'}}
                </drop-menu>
            `,
    data() {
        return {
            fontSizeList: Ktu.config.tool.options.fontSizeList,
            minFontSize: 1,
            maxFontSize: 999,
        };
    },
    props: {
    },
    computed: {
        isGroup() {
            return this.activeObject.type === 'multi' || this.activeObject.type === 'group';
        },
        fontSize() {
            if (this.isGroup) {
                const { objects } = this.activeObject;
                const offsetScale = this.activeObject.type === 'group' ? this.activeObject.scaleX : 1;
                const fontSize = objects[0].fontSize * objects[0].scaleX * offsetScale;
                const isSame = objects.every(object => object.fontSize * object.scaleX * offsetScale === fontSize);
                return isSame ? Math.max(1, Math.round(fontSize)) : '';
            }
            const offsetScale = this.activeObject.group ? this.activeObject.group.scaleX : 1;
            if (this.activeObject.type == 'threeText') {
                if (this.activeObject.realScale) {
                    return Math.max(1, Math.round(this.activeObject.fontSize * offsetScale));
                }
                return Math.max(1, Math.round(this.activeObject.fontSize * this.activeObject.scaleX * offsetScale));
            }
            return Math.max(1, Math.round(this.activeObject.fontSize * this.activeObject.scaleX * offsetScale));
        },
    },
    methods: {
        selectFontSize(value) {
            // 字号处理，改变字号实际改变的是scale值。
            if (this.isGroup) {
                this.activeObject.saveState();
                this.activeObject.objects.forEach(object => {
                    const { fontSize } = object;
                    let scale = object.scaleX;
                    scale = value / fontSize;
                    object.scaleX = scale;
                    object.scaleY = scale;
                    object.dirty = true;
                    object.setCoords();
                });
                this.activeObject.modifiedState();
                this.updateGroup();
                Ktu.save.changeSaveNum();
            } else {
                const { fontSize } = this.selectedData;
                let scale = this.selectedData.scaleX;
                scale = value / fontSize;
                if (this.activeObject.type === 'threeText' && scale == 1) {
                    return;
                }
                this.changeDataProps({
                    scaleX: scale,
                    scaleY: scale,
                });
                this.selectedData.setCoords();
                this.updateGroup();
            }
            if (this.activeObject.type === 'threeText') {
                Ktu.log('threeTextEdit', 'changeFontSize');
            } else {
                Ktu.log(this.activeObject.type, 'fontSize');
            }
        },
    },
});
