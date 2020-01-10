Vue.component('tool-opacity', {
    template: `
    <div class="tool-box tool-opacity">
        <tool-btn v-if="showIcon" icon="opacity" tips="透明度" @click="show($event,eventType,'opacity')" :class="{opened: isShow}"></tool-btn>
        <tool-btn v-else @click="show($event,eventType,'opacity')" :class="{opened: isShow}">透明度</tool-btn>
        <transition :name="transitionName">
            <div v-if="isShow" ref="popup" class="tool-popup tool-opacity-popup" :class="{'reverseX': isNeedReverseX, 'reverseY': isNeedReverseY}">
                <tool-slider :value="opacity" title="透明度" @input="changeOpacity" :min="0" :max="100" :step="1" unit="%" @change="stop"></tool-slider>
            </div>
        </transition>
    </div>
    `,
    mixins: [Ktu.mixins.popupCtrl, Ktu.mixins.dataHandler],
    props: {
        eventType: {
            type: [String, Number],
        },
        showIcon: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            popUpWidth: 220,
            popUpHeight: 96,
        };
    },
    computed: {
        opacity() {
            /* let opacity =  this.selectedData.opacity === undefined ? 0 : Math.round(100 - this.selectedData.opacity*100);
               return this.selectedData.group && this.selectedData.group.opacity !== 1 ? Math.round(100 - this.selectedData.group.opacity*100) : opacity; */
            if (this.activeObject.type === 'multi' || this.activeObject.type === 'group') {
                const {
                    objects
                } = this.activeObject;
                const isSameOpacity = objects.every(object => object.opacity === objects[0].opacity);
                return isSameOpacity ? Math.round(100 - objects[0].opacity * 100) : 0;
            }
            return this.activeObject.opacity === undefined ? 0 : Math.round(100 - this.activeObject.opacity * 100);
        },
    },
    methods: {
        changeOpacity(value) {
            /* 组合改变透明度需要把子元素还原为1，只依赖组合透明度共同改变
               var loopChange = function(selectedData){
               selectedData._objects.forEach((object) => {
               object.opacity = 1;
               object.type === 'group' && loopChange(object);
               });
               };
               this.selectedData.type === 'group' && loopChange(this.selectedData);
               this.changeDataProp('opacity', (100 - value)/100, true); */
            this.activeObject.setOpacity((100 - value) / 100);
            // 假如是背景的颜色变化 马赛克需做处理
            if (this.activeObject.type == 'background') {
                this.setEdbgOpacity(value);
            }
        },
        stop() {
            if (this.activeObject.type == 'background') {
                Ktu.log('backgroundTool', 'opacity');
            } else {
                if (this.eventType === 'qr-code' || this.eventType === 'map') return;
                if (this.eventType) {
                    Ktu.log(this.eventType, 'opacity');
                } else {
                    if (this.activeObject.type === 'cimage' && /gif$/.test(this.activeObject.imageType)) {
                        Ktu.log('gif', 'opacity');
                    } else {
                        Ktu.log(this.activeObject.type, 'opacity');
                    }
                }
                if (this.activeObject.type === 'threeText') {
                    Ktu.log('threeTextEdit', 'changeOpactiy');
                }
            }
        },
        // 背景马赛克
        setEdbgOpacity(value) {
            if (!this.edbg) return;
            if (value == 100) {
                this.edbg.style.opacity = value / 100;
            } else {
                this.edbg.style.opacity = 0;
            }
        },
    },
});