Vue.component('tool-rotate', {
    template: `
    <div class="tool-box tool-rotate">
        <tool-btn v-if="showIcon" icon="rotate" tips="旋转" @click="show($event,eventType,'rotate')" :class="{opened: isShow}"></tool-btn>
        <tool-btn v-else @click="show($event,eventType,'rotate')" :class="{opened: isShow}">旋转</tool-btn>
        <transition :name="transitionName">
            <div v-if="isShow" ref="popup" class="tool-popup tool-rotate-popup" :class="{'reverseX': isNeedReverseX, 'reverseY': isNeedReverseY}">
                <tool-slider v-if="activeObject.type !== 'background'" :value="angle" title="旋转" @input="rotate" :min="-360" :max="360" :step="1" unit="°" @change="stop" class="tool-rotate-slider"></tool-slider>
                <div class="tool-rotate-btns">
                    <div v-for="item in rotateList" :disable="checkDisable(item)" class="tool-rotate-btn" @click.stop="rotate(item.value)">
                        <svg class="tool-rotate-btn-icon">
                            <use :xlink:href="'#svg-tool-'+item.icon"></use>
                        </svg>
                        <label class="tool-rotate-btn-label">
                            {{item.label}}
                        </label>
                    </div>
                </div>
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
        disableList: {
            type: Array,
            default() {
                return [];
            },
        },
    },
    data() {
        return {
            rotateList: Ktu.config.tool.options.rotateList,
            popUpWidth: 220,
            popUpHeight: 167,
        };
    },
    computed: {
        angle() {
            let angle = this.activeObject.angle || 0;
            // angle = (angle % 360 === 0 && angle !== 0?360:angle % 360);
            if (angle > 360) {
                angle = (angle - 360);
            } else if (angle < -360) {
                angle = (angle + 360);
            }
            return Math.round(angle);
        },
        selectedType() {
            if (Ktu.activeObject.type == 'background') {
                return 'backgroundTool';
            }
            return Ktu.activeObject.type;
        },
    },

    methods: {
        rotate(value) {
            if (this.disableList.includes(value)) {
                return;
            }
            if (this.activeObject.elementName !== '背景') {
                if (value === 'left') {
                    this.activeObject.saveState();
                    this.activeObject.setAngle(this.angle - 90);
                    this.activeObject.modifiedState();
                } else if (value === 'right') {
                    this.activeObject.saveState();
                    this.activeObject.setAngle(this.angle + 90);
                    this.activeObject.modifiedState();
                } else {
                    this.activeObject.setAngle(value);
                }
            } else {
                this.activeObject.setAngle(value);
            }
            // this.activeObject.setAngle(value);
            if (value !== 'horizontal' && value !== 'vertical') {
                this.isObjectInGroup && this.updateGroup();
            }
        },
        checkDisable(item) {
            if (this.disableList.includes(item.value)) {
                return true;
            }
            return false;
        },
        stop() {
            if (this.eventType === 'qr-code' || this.eventType === 'map') return;
            if (this.eventType) {
                Ktu.log(this.eventType, 'rotate');
            } else {
                if (this.activeObject.type === 'cimage' && /gif$/.test(this.activeObject.imageType)) {
                    Ktu.log('gif', 'rotate');
                } else {
                    if (this.activeObject.type === 'threeText') {
                        Ktu.log('threeTextEdit', 'changeAngle');
                    } else {
                        Ktu.log(this.activeObject.type, 'rotate');
                    }
                }
            }
        },
    },
});
