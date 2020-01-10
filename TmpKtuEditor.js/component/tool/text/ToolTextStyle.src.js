Vue.component('tool-text-style', {
    mixins: [Ktu.mixins.popupCtrl, Ktu.mixins.dataHandler],
    template: `<div class="tool-box tool-text-style">
                    <tool-btn
                        tips="样式"
                        @click="show"
                        :class="{opened: isShow}"
                        ref="openBtn"
                    >文字特效</tool-btn>

                    <transition :name="transitionName">
                        <div v-if="isShow" ref="popup" class="tool-popup tool-text-style-popup" :class="{'reverseX': isNeedReverseX, 'reverseY': isNeedReverseY}" :style="{width: popUpWidth + 'px', height: popUpHeight + 'px'}">
                            <div class="style-header">
                                <div class="choose-style header-item" @click="isShowChooseType = true" :class="{'active':isShowChooseType}">选择特效</div>
                                <div class="edit-style header-item" @click="toThreeTextTab()" :class="{'active':!isShowChooseType, 'disable': isNormalText}">编辑特效</div>
                            </div>
                            <div class="choose-style-container" v-if="isShowChooseType">
                                <switch-tab :show-index="chooseStyleTabIndex" :tab-list="chooseStyleTabList" @changeTab="chooseStyleTab"></switch-tab>
                                <div class="style-container" v-if="isChooseWordart">
                                    <div
                                        class="style-clear style-box"
                                        @click="clearStyle">
                                        <svg class="style-clear-icon">
                                            <use xlink:href="#svg-tool-clear-style"></use>
                                        </svg>
                                        <div>清除特效</div>
                                    </div>
                                    <div v-for="(text, name) in textStyle"
                                        class="style-box"
                                        :class="{checked: isChecked(text.style.name)}"
                                        :style="{backgroundImage: 'url('+getStylePreview(name)+')'}"
                                        @click="changeStyle(text, Object.keys(textStyle).indexOf(name))"
                                    >
                                    </div>
                                </div>
                                <div class="style-container three-style-container" v-if="!isChooseWordart">
                                    <div
                                        class="style-clear style-box"
                                        @click="clearStyle">
                                        <svg class="style-clear-icon">
                                            <use xlink:href="#svg-tool-clear-style"></use>
                                        </svg>
                                        <div>清除特效</div>
                                    </div>
                                    <div v-for="(text, index) in threeTextStyle"
                                        class="style-box three-style-box"
                                        :class="{checked: isCheckThreeText(text.name)}"
                                        :style="{backgroundImage: 'url('+getThreeStylePreview(text.name)+')'}"
                                        @click="changeThreeStyle(text)"
                                    >
                                    </div>
                                </div>
                            </div>
                            <div class="edit-style-container" v-if="!isShowChooseType">
                                <div class="edit-three-style" v-if="canEditThreeText">
                                    <switch-tab :margin-bottom="8" :tab-list="chooseMaterialTabList" @changeTab="changeMaterailType"></switch-tab>
                                    <div class="three-material-container style-container">
                                        <div v-for="(item, index) in currentMaterialList"
                                            class="material-box"
                                            :class="{checked: isCheckMaterial(item.name)}"
                                            :style="{backgroundImage: 'url('+getMaterialPreview(item.thumbPath)+')'}"
                                            @click="changeThreeMaterial(item)"
                                        ></div>
                                    </div>
                                    <tool-slider class="style-intensity" :disabled="!canEditThreeText" :value="depth || 0" title="厚度" @input="changeDepth" @change="stopChangeDepth" :min="minDepth" :max="maxDepth" :step="1"></tool-slider>
                                    <tool-slider class="style-intensity" :disabled="!canEditThreeText" :value="bevelSize || 0" title="描边" @input="changeBevelSize" @change="stopChangeBevelSize" :min="minBevelSize" :max="maxBevelSize" :step="1"></tool-slider>
                                    <tool-slider class="style-intensity" :disabled="!canEditThreeText" :value="bevelThickness || 0" title="粗细" @input="changeBevelThickness" @change="stopChangeBevelThickness" :min="minBevelThickness" :max="maxBevelThickness" :step="1"></tool-slider>
                                </div>
                                <tool-slider v-if="canEditWordart" class="style-intensity" :disabled="intensity === undefined" :value="intensity || 0" title="效果" @input="changeIntensity" @change="stopChangeIntensity" :min="minIntensity" :max="maxIntensity" :step="1"></tool-slider>
                            </div>
                        </div>
                    </transition>
                </div>`,
    data() {
        return {
            popUpWidth: 312,
            popUpHeight: 520,
            textStyle: Ktu.config.textStyle,
            threeTextStyle: Ktu.threeTextConfig.threeTextList,
            minDepth: 0,
            maxDepth: 300,
            minBevelSize: 0,
            maxBevelSize: 140,
            minBevelThickness: 0,
            maxBevelThickness: 140,
            minIntensity: 0,
            maxIntensity: 100,
            intensityPrefix: 'initial',
            isShowChooseType: true,
            isChooseWordart: true,
            tmpDepth: -1,
            tmpBevelSize: -1,
            tmpBevelThickness: -1,
            isSupportThreeText: Ktu.isSupportWebGL,
            materialType: 'basic',
            currentMaterialList: Ktu.threeTextConfig.basicMaterialList,
            chooseStyleTabList: [
                {
                    key: 'wordart',
                    value: '平面特效',
                },
                {
                    key: 'threeText',
                    value: '3D特效',
                },
            ],
            chooseStyleTabIndex: 0,
            chooseMaterialTabList: [
                {
                    key: 'basic',
                    value: '基础',
                },
                {
                    key: 'natural',
                    value: '自然',
                },
                {
                    key: 'metal',
                    value: '金属',
                },
            ],
        };
    },
    created() {
        if (this.selectedData.type == 'threeText') {
            this.isChooseWordart = false;
            this.chooseStyleTabIndex = 1;
        }
    },
    computed: {
        isNormalText() {
            if (this.selectedData.type === 'wordart' || this.selectedData.type === 'threeText') {
                return false;
            }
            return true;
        },
        intensity() {
            return this.selectedData.style && this.selectedData.style.intensity;
        },
        depth() {
            if (this.tmpDepth === -1) {
                this.tmpDepth = this.selectedData.fontDepth;
            }
            return this.tmpDepth;
        },
        bevelSize() {
            if (this.tmpBevelSize === -1) {
                this.tmpBevelSize = this.selectedData.bevelSize;
            }
            return this.tmpBevelSize;
        },
        bevelThickness() {
            if (this.tmpBevelThickness === -1) {
                this.tmpBevelThickness = this.selectedData.bevelThickness;
            }
            return this.tmpBevelThickness;
        },
        canEditThreeText() {
            return this.selectedData.type === 'threeText';
        },
        canEditWordart() {
            return this.selectedData.type === 'wordart';
        },
        isOpenTool: {
            get() {
                return this.$store.state.base.isOpenTool;
            },
            set(value) {
                this.$store.commit('base/changeState', {
                    prop: 'isOpenTool',
                    value,
                });
            },
        },
    },
    watch: {
        isShow(value) {
            if (value) {
                Ktu.log('wordart', 'openStyle');
            }
        },
        isOpenTool(value) {
            if (value.isShow && value.type == 'textStyle') {
                this.$refs.openBtn.click();
                this.isOpenTool = {
                    isShow: false,
                    type: '',
                };
            }
        },
    },
    methods: {
        chooseStyleTab(type) {
            if (type === 'threeText') {
                this.isChooseWordart = false;
            } else {
                this.isChooseWordart = true;
            }
        },
        changeMaterailType(type = 'baisc') {
            this.materialType = type;
            if (type === 'natural') {
                this.currentMaterialList = Ktu.threeTextConfig.naturalMaterialList;
            } else if (type == 'metal') {
                this.currentMaterialList = Ktu.threeTextConfig.metalMaterialList;
            } else {
                this.currentMaterialList = Ktu.threeTextConfig.basicMaterialList;
            }
        },
        toThreeTextTab() {
            if (this.isNormalText) {
                this.$Notice.error('请先选择特效');
                return;
            }
            this.tmpBevelSize = -1;
            this.tmpBevelThickness = -1;
            this.tmpDepth = -1;
            this.isShowChooseType = false;
        },
        getStylePreview(style) {
            return `${Ktu.initialData.resRoot}/image/editor/textStyle/${style}.png`;
        },
        isCheckMaterial(name) {
            return this.selectedData.materialName == name;
        },
        isCheckThreeText(name) {
            return this.selectedData.name == name;
        },
        getThreeStylePreview(name) {
            return `${Ktu.initialData.resRoot}/image/threeText/list/thumb/${name}.png`;
        },
        isChecked(name) {
            return this.selectedData.style && this.selectedData.style.name === name;
        },
        getMaterialPreview(path) {
            return `${Ktu.initialData.resRoot}/${path}`;
        },
        changeStyle(text, index) {
            let newObject = null;
            let beforeData = null;
            if (this.selectedData.type === 'textbox' || this.selectedData.type === 'threeText') {
                newObject = this.selectedData.toObject();
                beforeData = this.selectedData.group ? this.selectedData.group.toObject() : this.selectedData.toObject();
            } else {
                this.selectedData.saveState();
                newObject = this.selectedData;
            }
            // 字体
            const ftFamily = this.selectedData.ftFamilyList[0];
            // 3D 文字的切换屏幕特效，直接把原来的ftFamilyList丢掉
            if (ftFamily && this.selectedData.type !== 'threeText') {
                ftFamily.fontid = text.fontId;
            } else {
                newObject.ftFamilyList[0] = {
                    fontid: text.fontId,
                    fonttype: 0,
                };
            }
            // skew
            newObject.skewX = text.skewX || 0;
            newObject.skewY = text.skewY || 0;
            // style
            newObject.style = _.cloneDeep(text.style);
            if (this.selectedData.type === 'textbox' || this.selectedData.type === 'threeText') {
                /* Ktu.selectedTemplateData.objects.some((object, index, arr) => {
                   if (object === this.selectedData) {
                   this.$set(arr, index, new Wordart(newObject));
                   // arr[index] = new Wordart(newObject);
                   Ktu.selectedData = arr[index];
                   return true;
                   }
                   return false;
                   }); */
                const findObject = objects => {
                    objects.some((object, index, arr) => {
                        if (object === this.selectedData) {
                            const { group } = object;
                            this.$set(arr, index, new Wordart(newObject));
                            // arr[index] = new Wordart(newObject);
                            Ktu.selectedData = arr[index];
                            this.selectedData.textDecoration = '';
                            this.selectedData.textBg = '';
                            this.selectedData.fill = '#345';
                            if (group) {
                                Ktu.selectedData.group = object.group;
                            }
                            return true;
                        } else if (object.type === 'group') {
                            return findObject(object.objects);
                        }
                        return false;
                    });
                };
                findObject(Ktu.selectedTemplateData.objects);
                this.selectedData.changeState({
                    beforeData,
                    afterData: this.selectedData.group ? this.selectedData.group.toObject() : this.selectedData.toObject(),
                });
                Ktu.log('addWordart', 'transform');
            } else {
                // 重新加载贴图和字体
                this.selectedData.loadedPromise = Promise.all([this.selectedData.loadPattern(), this.selectedData.updateFont()]);
                this.selectedData.dirty = true;
                this.selectedData.modifiedState();
                Ktu.log('wordart', 'alterStyle');
            }
            Ktu.simpleLog('wordart_replace', index + 1);
            this.updateGroup();
        },
        changeIntensity(intensity) {
            const loop = object => {
                for (const prop of Object.keys(object)) {
                    if (typeof object[prop] === 'object') {
                        loop(object[prop]);
                    }
                    if (prop.includes(this.intensityPrefix)) {
                        let initensityPropName = prop.match(new RegExp(`${this.intensityPrefix}(.+)`))[1];
                        initensityPropName = initensityPropName[0].toLowerCase() + initensityPropName.slice(1);
                        // 数值平分，计算每一个强度占多少数值。
                        const rate = object[prop] / ((this.maxIntensity - this.minIntensity) / 2);
                        // 根据现在的强度计算新数值
                        object[initensityPropName] = object[prop] + rate * (intensity - (this.maxIntensity - this.minIntensity) / 2);
                    }
                }
            };
            this.selectedData.style.intensity = intensity;
            loop(this.selectedData.style.covers);
            this.selectedData.dirty = true;
        },
        stopChangeIntensity() {
            Ktu.log('wordart', 'alterIntensity');
        },
        changeDepth(value) {
            this.tmpDepth = value;
            if (this.depthTimer) {
                clearTimeout(this.depthTimer);
                this.depthTimer = undefined;
            }
            this.depthTimer = setTimeout(() => {
                this.stopChangeDepth();
            }, 400);
        },
        changeBevelSize(value) {
            this.tmpBevelSize = value;
            if (this.bevelSizeTimer) {
                clearTimeout(this.bevelSizeTimer);
                this.bevelSizeTimer = undefined;
            }
            this.bevelSizeTimer = setTimeout(() => {
                this.stopChangeBevelSize();
            }, 400);
        },
        changeBevelThickness(value) {
            this.tmpBevelThickness = value;
            if (this.bevelThicknessTimer) {
                clearTimeout(this.bevelThicknessTimer);
                this.bevelThicknessTimer = undefined;
            }
            this.bevelThicknessTimer = setTimeout(() => {
                this.stopChangeBevelThickness();
            }, 400);
        },
        stopChangeDepth() {
            if (this.tmpDepth == this.selectedData.fontDepth) {
                return;
            }
            Ktu.log('threeTextEdit', 'changeDepth');
            this.changeDataProps({
                fontDepth: this.tmpDepth,
            });
        },
        stopChangeBevelSize() {
            if (this.tmpBevelSize == this.selectedData.bevelSize) {
                return;
            }
            Ktu.log('threeTextEdit', 'changeBevelSize');
            this.changeDataProps({
                bevelSize: this.tmpBevelSize,
            });
        },
        stopChangeBevelThickness() {
            if (this.tmpBevelThickness == this.selectedData.bevelThickness) {
                return;
            }
            Ktu.log('threeTextEdit', 'changeBevelThickness');
            this.changeDataProps({
                bevelThickness: this.tmpBevelThickness,
            });
        },
        changeThreeStyle(threeText) {
            if (threeText && threeText.name == this.selectedData.name) {
                return;
            }
            if (this.selectedData.group) {
                this.$Notice.error('组合内元素暂不支持3D文字');
                return;
            };
            if (this.selectedData.type !== 'threeText') {
                Ktu.log('threeTextAdd', 'replace');
            }

            if (this.selectedData.type === 'threeText' && !this.selectedData.hasCanvasPainted) {
                return;
            };
            const copyText = _.assignIn({}, threeText);
            // 字体还是要跟原来的元素保持一致
            delete copyText.left;
            delete copyText.top;
            delete copyText.width;
            delete copyText.height;
            delete copyText.text;
            delete copyText.fontSize;
            delete copyText.angle;
            delete copyText.src;
            delete copyText.elementName;

            const tmpObj = this.selectedData.toObject();
            delete tmpObj.fileId;
            tmpObj.fontSize = Math.round(tmpObj.scaleY * tmpObj.fontSize);
            tmpObj.scaleY = 1;
            tmpObj.scaleX = 1;
            tmpObj.lineHeight = 1;
            const newObject = _.assign(tmpObj, copyText);
            // 重新初始化一下对应的canvas
            delete newObject.tmpKey;
            const beforeData = this.selectedData.group ? this.selectedData.group.toObject() : this.selectedData.toObject();
            const findObject = objects => {
                objects.some((object, index, arr) => {
                    if (object === this.selectedData) {
                        const { group } = object;
                        this.$set(arr, index, new ThreeText(newObject));
                        // arr[index] = new Wordart(newObject);
                        Ktu.selectedData = arr[index];
                        Ktu.selectedData.textDecoration = '';
                        if (group) {
                            Ktu.selectedData.group = object.group;
                        }
                        return true;
                    } else if (object.type === 'group') {
                        return findObject(object.objects);
                    }
                    return false;
                });
            };
            findObject(Ktu.selectedTemplateData.objects);
            this.selectedData.changeState({
                beforeData,
                afterData: this.selectedData.group ? this.selectedData.group.toObject() : this.selectedData.toObject(),
            });
        },
        changeThreeMaterial(item) {
            if (this.selectedData.materialName === item.name) {
                return;
            }
            if (this.materialType === 'natural') {
                Ktu.log('threeTextEdit', 'useNaturalMaterial');
            } else if (this.materialType === 'metal') {
                Ktu.log('threeTextEdit', 'useMetalMaterial');
            } else {
                Ktu.log('threeTextEdit', 'useBasicMaterial');
            }
            this.selectedData.saveState();
            this.selectedData.materialName = item.name;
            this.selectedData.frontMaterial = item.frontMaterial;
            this.selectedData.sideMaterial = item.sideMaterial;
            this.selectedData.pointLights = item.pointLights || [];
            this.selectedData.directionLights = item.directionLights || [];
            this.selectedData.spotLights = item.spotLights || [];
            this.selectedData.dirty = true;
            this.selectedData.modifiedState();
        },
        clearStyle() {
            if ((this.isChooseWordart && this.selectedData.type === 'wordart') || (!this.isChooseWordart && this.selectedData.type === 'threeText')) {
                const beforeData = this.selectedData.group ? this.selectedGroup.toObject() : this.selectedData.toObject();
                /* Ktu.selectedTemplateData.objects.some((object, index, arr) => {
                   if (object === this.selectedData) {
                   this.$set(arr, index, new Textbox(this.selectedData.toObject()));
                   Ktu.selectedData = arr[index];
                   return true;
                   }
                   return false;
                   }); */
                if (this.selectedData.type === 'wordart') {
                    Ktu.log('wordart', 'clearStyle');
                }
                if (this.selectedData.type === 'threeText') {
                    Ktu.log('threeTextEdit', 'clearStyle');
                }
                const findObject = objects => {
                    objects.some((object, index, arr) => {
                        if (object === this.selectedData) {
                            const { group } = object;
                            const copyObject = this.selectedData.toObject();
                            if (this.selectedData.type == 'threeText') {
                                if (this.selectedData.ftFamilyList[0]) {
                                    copyObject.fontFamily = this.selectedData.ftFamilyList[0].fontfamily;
                                }
                                copyObject.width *= 1.2;
                                delete copyObject.elementName;
                            }
                            this.$set(arr, index, new Textbox(copyObject));
                            // arr[index] = new Wordart(newObject);
                            Ktu.selectedData = arr[index];
                            if (group) {
                                Ktu.selectedData.group = object.group;
                            }
                            return true;
                        } else if (object.type === 'group') {
                            return findObject(object.objects);
                        }
                        return false;
                    });
                };
                findObject(Ktu.selectedTemplateData.objects);
                this.selectedData.changeState({
                    beforeData,
                    afterData: this.selectedData.group ? this.selectedGroup.toObject() : this.selectedData.toObject(),
                });
            }
        },
    },
});
