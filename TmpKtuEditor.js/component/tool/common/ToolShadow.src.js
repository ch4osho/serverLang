Vue.component('tool-shadow', {
    template: `<div class="tool-box tool-shadow" ref="activeBtn">
                    <tool-btn v-if="showIcon" icon="shadow" tips="阴影" @click="show($event,eventType,'shadow')" :class="{opened: isShow}"></tool-btn>
                    <tool-btn v-else @click="show($event,eventType,'shadow')" :class="{opened: isShow}">阴影</tool-btn>
                    <transition name="slide-up">
						<div v-if="isShow" ref="popup" :style="offsetStyle" class="tool-popup tool-shadow-popup" :class="{'reverseX': isNeedReverseX, 'reverseY': isNeedReverseY, 'transferY': isOpenShadow}">
							<tool-switch title="开启阴影" @input="switchShadow" :value="isOpenShadow"></tool-switch>
							<template v-if="isOpenShadow">
								<tool-color :value="color" @input="changeColor"></tool-color>
								<tool-slider :value="blur" title="模糊" @input="changeBlur" :min="0" :max="100" :step="1" @change="stop"></tool-slider>
								<tool-slider :value="offsetX" title="水平距离" @input="changeOffsetX" :min="-100" :max="100" :step="1" unit="px" @change="stop"></tool-slider>
								<tool-slider :value="offsetY" title="垂直距离" @input="changeOffsetY" :min="-100" :max="100" :step="1" unit="px" @change="stop"></tool-slider>
							</template>
						</div>
					</transition>
				</div>`,
    mixins: [Ktu.mixins.dataHandler, Ktu.mixins.popupCtrl],
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
            defaultShadow: Ktu.config.tool.default.shadow,
            popUpWidth: 220,
            popUpHeight: 276,
            offsetStyle: {},
        };
    },
    watch: {
        isShow(isShow) {
            if (isShow) {
                if (this.isOpenShadow) {
                    if (this.isNeedAlainTop && this.isNeedReverseY && document.getElementById('toolBar')) {
                        this.offsetStyle = {
                            top: `${107 - this.$refs.activeBtn.getBoundingClientRect().top}px`,
                            left: '40px',
                        };
                    }
                } else {
                    this.offsetStyle = {};
                }
            }
        },
        isOpenShadow(isOpenShadow) {
            if (isOpenShadow) {
                if (this.isNeedAlainTop && this.isNeedReverseY && document.getElementById('toolBar')) {
                    this.offsetStyle = {
                        top: `${107 - this.$refs.activeBtn.getBoundingClientRect().top}px`,
                        left: '40px',
                    };
                }
            } else {
                this.offsetStyle = {};
            }
        },
    },
    computed: {
        isOpenShadow() {
            if (this.activeObject.type === 'group' || this.activeObject.type === 'multi') {
                const judge = object => {
                    if (object.type === 'group') {
                        return object.objects.every(judge);
                    }
                    return object.isOpenShadow;
                };
                const isOpenAll = this.activeObject.objects.every(judge);
                return isOpenAll;
            }
            return this.activeObject.isOpenShadow;
        },
        color() {
            return this.getShadowProp('color');
        },
        blur() {
            return this.getShadowProp('blur');
        },
        offsetX() {
            return this.getShadowProp('offsetX');
        },
        offsetY() {
            return this.getShadowProp('offsetY');
        },
    },
    methods: {
        getShadowProp(prop) {
            if (this.activeObject.type === 'group' || this.activeObject.type === 'multi') {
                const { objects } = this.activeObject;
                const referValue = objects[0].type === 'group' ? objects[0].objects[0].shadow[prop] : objects[0].shadow[prop];
                const judge = object => {
                    if (object.type === 'group') {
                        return object.objects.every(judge);
                    }
                    return object.shadow[prop] === referValue;
                };
                const isSame = objects.every(judge);
                return isSame ? referValue : this.defaultShadow[prop];
            }
            return this.activeObject.shadow[prop];
        },
        switchShadow(shadow) {
            this.changeDataProp('isOpenShadow', shadow);
            if (this.eventType === 'qr-code' || this.eventType === 'map') return;
            if (this.eventType) {
                Ktu.log(this.eventType, 'shadow');
            } else {
                if (this.activeObject.type === 'cimage' && /gif$/.test(this.activeObject.imageType)) {
                    Ktu.log('gif', 'shadow');
                } else {
                    Ktu.log(this.activeObject.type, 'shadow');
                }
            }
        },
        changeShadow(prop, value, isAvoidSaveState) {
            const shadow = {
                color: this.color,
                blur: this.blur,
                offsetX: this.offsetX,
                offsetY: this.offsetY,
            };
            shadow[prop] = value;
            this.changeDataProp('shadow', shadow, isAvoidSaveState);
        },
        changeColor(value) {
            this.changeShadow('color', value);
            if (this.eventType === 'qr-code' || this.eventType === 'map') return;
            if (this.eventType) {
                Ktu.log(this.eventType, 'shadow');
            } else {
                Ktu.log(this.activeObject.type, 'shadow');
            }
        },
        changeBlur(value) {
            this.changeShadow('blur', value, true);
        },
        changeOffsetX(value) {
            this.changeShadow('offsetX', value, true);
        },
        changeOffsetY(value) {
            this.changeShadow('offsetY', value, true);
        },
        stop() {
            if (this.eventType === 'qr-code' || this.eventType === 'map') return;
            if (this.eventType) {
                Ktu.log(this.eventType, 'shadow');
            } else {
                if (this.activeObject.type === 'cimage' && /gif$/.test(this.activeObject.imageType)) {
                    Ktu.log('gif', 'shadow');
                } else {
                    Ktu.log(this.activeObject.type, 'shadow');
                }
            }
        },
    },
});
