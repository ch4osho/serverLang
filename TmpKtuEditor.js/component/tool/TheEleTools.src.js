Vue.component('ele-tool', {
    mixins: [Ktu.mixins.dataHandler, Ktu.mixins.popupCtrl],
    template: `
        <div :class="['ele-tool', {background: !!currentTool}]">
            <transition name="slide-up" v-on:enter="editToolEnter" v-on:after-enter="afterEditToolEnter">
                <component :is="currentTool" class="edit-tool" :style="resizeStyle">
                    <tool-public v-if="showPublicTool" :hide-lock="needHideLock" :eventType="eventType"></tool-public>
                </component>
            </transition>
            
            <div class="more" :style="moreBtnStyle" @click="show" ref="more">
                <div :class="['more-btn tool-btn btn-word', {opened: isShow}]" v-touch-ripple>
                    <span class="tool-btn-word" style="width: 40px;">更多</span>
                    <div class="tool-btn-arrow">
                        <svg class="tool-btn-arrow-svg">
                            <use xlink:href="#svg-tool-arrow"></use>
                        </svg>
                    </div>
                </div>

                <transition :name="isAnimate ? 'slide-up' : 'normal'" v-on:enter="handlePanelEnter">
                    <div class="more-panel" v-show="isShow" ref="popup">
                        <component :is="currentTool" :class="['edit-tool', {wrap: isWrap}]">
                            <tool-public v-if="showPublicTool" :hide-lock="needHideLock" :eventType="eventType" :isSmallScreen="true"></tool-public>
                        </component>
                    </div>
                </transition>
            </div>
        </div>
    `,
    data() {
        return {
            limitIndex: -1,
            calcTimer: null,
            resizeTimer: null,
            restTools: null,
            toolBoxes: null,
            moreToolBoxes: null,
            toolBoxesCopy: null,
            isShowMoreBtn: false,
            isCalcPanel: false,
            isShowMore: false,
            isShowTools: false,
            isAnimate: true,
            openEleDetail: false,
            openPage: false,
            pageWidth: Ktu.config.page.width,
            detailWidth: Ktu.config.ele.detailWidth,
            smallToolPublic: false,
            isWrap: false,
            editToolEl: null,
        };
    },
    computed: {
        currentTool() {
            const selectedData = this.activeObject;
            if (selectedData && selectedData.type) {
                console.log('当前选择元素的类型',selectedData.type)
                switch (selectedData.type) {
                    case 'textbox':
                    case 'wordart':
                        return 'tool-text';
                    case 'cimage':
                        return 'tool-image';
                    case 'path-group':
                        return 'tool-svg';
                    case 'background':
                        return 'tool-background';
                    case 'qr-code':
                        return 'tool-qrCode';
                    case 'group':
                    case 'multi':
                        return 'tool-group';
                    default:
                        return `tool-${selectedData.type}`;
                }
            } else {
                return '';
            }
        },
        needHideLock() {
            if (this.currentTool == 'tool-group') {
                const objectArr = this.activeObject.objects;
                for (let i = 0; i < objectArr.length; i++) {
                    const item = objectArr[i];
                    if (item.type === 'threeText') {
                        return true;
                    }
                }
                return false;
            }
            return false;
        },
        editWidth() {
            return Ktu.store.getters['base/editCenterWidth'];
            // return Ktu.store.getters['base/editWidth'];
        },
        isClipMode() {
            return this.selectedData.isClipMode;
        },
        showPublicTool() {
            if (this.activeObject) {
                if (['background'].indexOf(this.activeObject.type) >= 0) {
                    return false;
                }
                if (this.activeObject.isClipMode) {
                    return false;
                }
            }
            return true;
        },
        eventType() {
            if (this.activeObject && this.activeObject.type) {
                switch (this.activeObject.type) {
                    case 'ellipse':
                    case 'line':
                    case 'rect':
                        return 'quickDrawTool';
                    case 'chart':
                        return 'chartTool';
                    default:
                        return;
                }
            }

            return;
        },
        isShowEleDetail() {
            return this.$store.state.base.isShowEleDetail;
        },
        isShowPage() {
            return this.$store.state.base.isShowPage;
        },
        eleAreaWidth() {
            return this.isShowEleDetail ? Ktu.config.ele.detailWidth + 80 : 80;
        },
        resizeStyle() {
            return {
                'max-width': this.toolBoxWidth === -1 ? '100%' : `${this.toolBoxWidth}px`,
                'box-shadow': '0px 5px 8px -5px rgba(0, 0, 0, 0.1)',
            };
        },
        moreBtnStyle() {
            if (this.toolBoxWidth === -1) return;

            let width = '';
            if (this.openEleDetail) {
                width = `calc(100% + ${this.detailWidth}px - ${this.toolBoxWidth}px)`;
            } else if (this.openPage) {
                width = `calc(100% + ${this.pageWidth}px - ${this.toolBoxWidth}px)`;
            } else {
                width = `calc(100% - ${this.toolBoxWidth}px)`;
            }

            return {
                width,
                opacity: '1',
                right: this.isShowMore ? '0px' : `calc(${this.toolBoxWidth}px - 100%)`,
            };
        },
        panelStyle() {
            return {
                'max-width': `${this.editWidth - 20}px`,
            };
        },
        toolBoxWidth: {
            get() {
                return this.$store.state.base.toolBoxWidth;
            },
            set(value) {
                this.$store.state.base.toolBoxWidth = value;
            },
        },
    },
    watch: {
        activeObject(value) {
            if (value) {
                if (this.isShow) {
                    this.isShow = false;
                    this.isAnimate = false;
                    this.$nextTick(() => {
                        this.moreToolBoxes = [...this.$refs.popup.querySelectorAll('.tool-box')];
                    });
                }
            } else {
                this.isAnimate = false;
                // this.isShowMore = false;
                this.toolBoxWidth = -1;
            }
        },
        isShow(value) {
            if (value) {
                this.isAnimate = true;
            }
        },
        isShowEleDetail(value) {
            if (value) this.openEleDetail = true;
            if (this.activeObject) {
                setTimeout(() => {
                    this.initTools();
                }, 310);
            }
        },
        isShowPage(value) {
            if (value) this.openPage = true;
            if (this.activeObject) {
                setTimeout(() => {
                    this.initTools();
                }, 310);
            }
        },
        /* toolBoxWidth(value) {
            console.trace(value);
        }, */
    },
    mounted() {
        this.initTools();
        window.addEventListener('resize', this.resizeTools);
    },
    destroyed() {
        window.removeEventListener('resize', this.resizeTools);
    },
    methods: {
        initTools() {
            if (!this.activeObject || !this.editToolEl) return;
            /* if (this.calcTimer) {
                clearTimeout(this.calcTimer);
                this.calcTimer = null;
            }; */

            // this.calcTimer = setTimeout(() => {
            this.toolBoxes = [...this.editToolEl.querySelectorAll('.tool-box')];

            if (!this.isNeedCalc()) {
                return;
            }

            this.calcToolWidth();
            // }, 350);
        },
        resizeTools() {
            this.isShow = false;

            if (this.resizeTimer) {
                clearTimeout(this.resizeTimer);
                this.resizeTimer = null;
            }
            this.resizeTimer = setTimeout(() => {
                if (!this.isNeedCalc()) {
                    return;
                }

                this.calcToolWidth();
            }, 50);
        },
        calcToolWidth() {
            if (!this.toolBoxes) return;

            for (let i = 0; i < this.toolBoxes.length; i++) {
                const left = this.toolBoxes[i].offsetLeft;
                const width = this.toolBoxes[i].offsetWidth;
                const btnLeft = left + width;

                if (btnLeft >= this.editWidth - 130) {
                    this.toolBoxWidth = btnLeft;
                    this.limitIndex = i;
                    break;
                }
            }

            this.openEleDetail = false;
            this.openPage = false;
            this.isShowTools = true;
            this.isShowMore = true;
            this.isCalcPanel = true;
        },
        isNeedCalc() {
            if (!this.toolBoxes) return;
            const lastBox = this.toolBoxes[this.toolBoxes.length - 1];
            if (lastBox.offsetLeft + lastBox.offsetWidth <= this.editWidth) {
                this.isShowMore = false;
                this.isShowTools = true;
                this.toolBoxWidth = -1;
                return false;
            }
            return true;
        },
        editToolEnter(el) {
            this.editToolEl = el;
            el && this.initTools();
            console.log('进来了editToolEnter')
        },
        afterEditToolEnter() {
            console.log('进来了afterEditToolEnter')
            this.$nextTick(() => {
                if (this.isShow) return;
                this.moreToolBoxes = [...this.$refs.popup.querySelectorAll('.tool-box')];
            });
        },
        handlePanelEnter() {
            if (this.isCalcPanel) {
                this.isCalcPanel = false;
                for (let i = 0; i < this.moreToolBoxes.length; i++) {
                    if (i <= this.limitIndex) {
                        this.moreToolBoxes[i].style.display = 'none';
                    } else {
                        if (this.moreToolBoxes[i].style.display === 'none') {
                            this.moreToolBoxes[i].style.display = 'block';
                        }
                    }
                }
                if (this.$refs.popup.offsetWidth > this.editWidth) {
                    this.$refs.popup.style.width = `${this.editWidth - 20}px`;
                    this.isWrap = true;
                } else {
                    this.$refs.popup.style.width = `auto`;
                    this.isWrap = false;
                }
            }
        },
    },
});
