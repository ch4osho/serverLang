Vue.component('tool-material', {
    template: `<div class="tool-material tool-box">
                    <div class="tool-icon" :class="{'color-empty-background': isTransparent}" @click="show($event,eventType,'material')" :style="getIconStyle">
                    </div>
                    <transition :name="transitionName">
                        <div class="material-panel" v-if="isShow" @click.stop>
                            <div class="panel-header">
                                <div class="head-item" v-for="(item, key) in materailList" :class="{'active': key == currentType}" @click="changeMaterialType(item)">{{item.text}}</div>
                            </div>
                            <div class="panel-container">
                                <color-picker v-if="currentType == materailList.color.key" :value="color" @input="selectedColor" :hide-icon="true" :always-show="true" :hide-control-btn="true"></color-picker>
                                <div v-if="currentType == materailList.texture.key" class="texture-panel">
                                    <div v-for="(item, index) in textureList" class="texture-item" :class="{'active': currentTextureId == item.id}" @click="selectTexture(item)">
                                        <img class="material-img" :src="getPreviewPath(item.thumbPath)" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </transition>
               </div>`,
    props: {
        material: {
            type: Object,
        },
    },
    mixins: [Ktu.mixins.popupCtrl, Ktu.mixins.dataHandler],
    data() {
        return {
            eventType: 'threeTextMaterial',
            materailList: {
                color: {
                    key: 'color',
                    text: '纯色',
                },
                /* gradient: { 暂时先不支持
                    key: 'gradient',
                    text: '线性渐变',
                }, */
                texture: {
                    key: 'texture',
                    text: '纹理',
                },
            },
            currentType: 'color',
            textureList: Ktu.threeTextConfig.textureList,
            rgbaReg: /rgba|rgb/i,
            hasTips: false,
        };
    },
    methods: {
        selectedColor(value) {
            if (!value || (this.material.use == 'color' && this.material.color == value)) {
                return;
            }
            this.$emit('change-material', { type: 'color', value });
        },
        selectTexture(value) {
            if (!value || (this.material.use == 'texture' && this.material.texture.id == value.id)) {
                return;
            }
            this.$emit('change-material', { type: 'texture', value });
        },
        changeMaterialType(item) {
            if (item && item.key) {
                this.currentType = item.key;
            }
        },
        getPreviewPath(path) {
            return `${Ktu.initialData.resRoot}/${path}`;
        },
        getAlpha(color) {
            let alpha = 1;
            if (/rgba|rgb/i.test(color)) {
                const rgb = color.match(/(\d(\.\d+)?)+/g);
                alpha = rgb[3];
                if (alpha === undefined) {
                    alpha = 1;
                }
            }
            return +alpha;
        },
    },
    computed: {
        getIconStyle() {
            if (this.material.use == 'color') {
                return `background-color: ${this.material.color}`;
            } else if (this.material.use == 'texture' && this.material.texture) {
                return `background: url(${Ktu.initialData.resRoot}/${this.material.texture.thumbPath})`;
            }
            return `background-color: ${this.selectedData.fill}`;
        },
        color() {
            return this.material.color;
        },
        currentTextureId() {
            if (this.material.use == 'texture') {
                return this.material.texture.id;
            }
            return -1;
        },
        isTransparent() {
            const { color } = this.material;
            const alpha = this.getAlpha(color);
            if (color == 'transparent' || alpha == 0) {
                return true;
            }
            return false;
        },
    },
});
