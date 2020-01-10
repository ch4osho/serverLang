Vue.component('ktu-element', {
    template: `
        <div v-if="isThreeText" class="need-loading">
            <div :style="divStyle" v-html="divHtml" v-show="element.visible && !element.isClipMode" class="ele"
                :data-index="element.group ? element.group.key : element.key"
                :data-subindex="element.group ? element.key : undefined"
                :class="{isTranslating: element.isTranslating,isHover: element.isHover, selected: element.isSelected, locked: element.isLocked,
                    background: element.type === 'background', imageContainer: element.type === 'imageContainer', table: element.type === 'table',
                    qrCode: element.type === 'qr-code'}"
                @dragstart.prevent
                @mouseenter="mouseenter"
                @mouseleave="mouseleave" ref="ktuElement">
            </div>
            <div class="ele-loading" v-if="isLoading" :style="loadingStyle">
                <loading :loading-type="3" :size="34"></loading>
            </div>
        </div>
        <div v-else :style="divStyle" v-html="divHtml" v-show="element.visible && !element.isClipMode" class="ele"
            :data-index="element.group ? element.group.key : element.key"
            :data-subindex="element.group ? element.key : undefined"
            :class="{isTranslating: element.isTranslating,isHover: element.isHover, selected: element.isSelected, locked: element.isLocked,
                background: element.type === 'background', imageContainer: element.type === 'imageContainer', table: element.type === 'table',
                qrCode: element.type === 'qr-code', chaos: true}"
            @dragstart.prevent
            @mouseenter="mouseenter"
            @mouseleave="mouseleave" ref="ktuElement">
        </div>
    `,
    mixins: [Ktu.mixins.dataHandler],
    data() {
        return {
            divHtml: '',
            loadingSize: 34,
            loadingSize: 34,
        };
    },
    props: {
        element: {
            type: Object,
        },
        groupPosition: {
            type: Object,
            default() {
                return {
                    left: 0,
                    top: 0,
                };
            },
        },
    },
    computed: {
        isThreeText() {
            return this.element.type === 'threeText';
        },
        loadingStyle() {
            const style = {
                position: 'absolute',
                zIndex: `${this.element.key + 1}`,
            };
            let left = 0;
            let top = 0;
            const {
                center,
            } = this.element.coords;
            left = center.x - (this.loadingSize) / 2;
            top = center.y - (this.loadingSize) / 2;
            style.left = `${left}px`;
            style.top = `${top}px`;
            let scale = 1 / Ktu.edit.scale;
            scale = Math.floor(scale * 100) / 100;
            style.transform = `scale(${scale}) translateZ(0)`;
            return style;
        },
        isLoading() {
            return this.element.isLoading;
        },
        divStyle() {
            const style = {
                position: 'absolute',
                left: `${this.element.pleft ? this.element.pleft : this.element.left}px`,
                top: `${this.element.ptop ? this.element.ptop : this.element.top}px`,
                /* left: `${this.element.left- this.grouped&&this.group?this.group.left: 0}px`,
                   top: `${this.element.top - this.grouped&&this.group?this.group.top: 0}px`, */
                opacity: this.element.opacity,
                zIndex: this.element.key,
                transformOrigin: `top left`,
                transform: `rotate(${this.element.angle}deg) skew(${this.element.skewX}deg, ${this.element.skewY}deg)`,
            };
            if (this.element.type === 'cimage') {
                const dimensions = this.element.getDimensions();
                style.width = `${dimensions.w * this.element.scaleX}px`;
                style.height = `${dimensions.h * this.element.scaleY}px`;
            } else if (this.element.type === 'wordart') {
                const dimensions = this.element.getDimensions();
                style.transform = `rotate(${this.element.angle}deg) scale(${this.element.scaleX}, ${this.element.scaleY}) translate(${dimensions.w / 2}px, ${dimensions.h / 2}px) skew(${this.element.skewX}deg, ${this.element.skewY}deg) translate(${-dimensions.w / 2}px, ${-dimensions.h / 2}px)`;
            } else if (this.element.type == 'threeText') {
                const dimensions = this.element.getDimensions();
                style.width = `${dimensions.w}px`;
                style.height = `${dimensions.h}px`;
                style.transform = `rotate(${this.element.angle}deg) scale(${this.element.scaleX}, ${this.element.scaleY}) translate(${dimensions.w / 2}px, ${dimensions.h / 2}px) skew(${this.element.skewX}deg, ${this.element.skewY}deg) translate(${-dimensions.w / 2}px, ${-dimensions.h / 2}px)`;
                style.display = `${this.element.isEditing ? 'none' : 'block'}`;
            };

            return style;
        },
        dirty() {
            return this.element.dirty;
        },
        /* flip() {
           let flipStr = "";
           const dimensions = this.element.getDimensions();
           if (this.element.flipX) {
           flipStr += `matrix(-1,0,0,1,${dimensions.w * this.element.scaleX},0)`;
           }
           if (this.element.flipY) {
           flipStr += `matrix(1,0,0,-1,0,${dimensions.h * this.element.scaleY})`;
           }
           return flipStr;
           }, */
        scale() {
            return this.$store.state.data.scale;
        },
        qrCodeLoadingStyle() {
            const coords = this.activeObject.calculateCoords();
            const editBoxWidth = parseInt(Math.sqrt(Math.abs(coords.tr.x - coords.tl.x) ** 2 + Math.abs(coords.tr.y - coords.tl.y) ** 2), 10);

            if (editBoxWidth > 142) {
                return `width:56px;height:56px;`;
            } else if (editBoxWidth <= 142 && editBoxWidth > 40) {
                return `width:26px;height:26px;`;
            }
            return `width:16px;height:16px;`;
        },
        // 是否选择工具栏的了样式
        isCreatingEditArt: {
            get() {
                return this.$store.state.base.isCreatingEditArt;
            },
            set(value) {
                this.$store.state.base.isCreatingEditArt = value;
            },
        },
    },
    watch: {
        dirty: {
            handler(newval, old) {
                if (newval) {
                    switch (this.element.type) {
                        case 'path-group':
                        case 'imageContainer':
                        case 'wordCloud':
                            if (!!this.element.hasLoaded) {
                                this.divHtml = this.element.toSvg();
                            }
                            break;
                        /* case 'textbox':
                           if (this.element.ftFamilyList[0] && this.element.ftFamilyList[0].hasLoaded) {
                           this.divHtml = this.element.toSvg();
                           }
                           break; */
                        default:
                            this.divHtml = this.element.toSvg();
                            if (this.element.elementDone) {
                                this.$nextTick(() => {
                                    const ele = this.$refs.ktuElement;
                                    if (ele) {
                                        this.element.elementDone && this.element.elementDone(ele);
                                    }
                                });
                            }
                            break;
                    }
                    if (this.element.dirty) {
                        this.element.dirty = false;
                    }
                }
            },
            immediate: true,
        },
        isCreatingEditArt(value) {
            switch (this.element.type) {
                case 'qr-code':
                    if (value && this.element.isSelected) {
                        this.divHtml
                            = `${this.element.toSvg()}
                                <div class="qrcode-loading">
                                    <div class="loading-box" style="${this.qrCodeLoadingStyle}">
                                        <svg>
                                            <use xlink:href="#svg-loading-small"></use>
                                        </svg>
                                    </div>
                                </div>`;

                        this.element.controls.tl = false;
                        this.element.controls.tr = false;
                        this.element.controls.br = false;
                        this.element.controls.bl = false;
                    } else {
                        this.divHtml = this.element.toSvg();
                        this.element.controls.tl = true;
                        this.element.controls.tr = true;
                        this.element.controls.br = true;
                        this.element.controls.bl = true;
                    }
                    break;
                default:
                    this.divHtml = this.element.toSvg();
                    break;
            }
        },
    },
    methods: {
        mouseenter() {
            if (!this.$store.state.base.interactive.currentControl && this.element.type !== 'background') {
                // 图片在编辑器拉入图片容器的处理
                if (Ktu.selectedData && Ktu.selectedData.isTranslating) {
                    return;
                }
                this.element.isHover = true;
            }
        },
        mouseleave() {
            this.element.isHover = false;
            if (this.element.type == 'imageContainer') {
                this.element.objects.forEach(e => {
                    e.isHover = true;
                });
            }
        },
    },
});
