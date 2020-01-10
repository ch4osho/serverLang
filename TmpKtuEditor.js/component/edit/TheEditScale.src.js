Vue.component('edit-scale', {
    template: `<div class="edit-scale" v-show="!viewportMode">
                    <div v-touch-ripple class="edit-scale-origin edit-scale-box" @click="origin" @mouseenter="mouseenter('showFirTip')" @mouseleave="mouseleave('showFirTip')">
                        <span>1:1</span>
                        <div class="tip" v-show="showFirTip">1:1视图</div>
                    </div>
                    <div class="edit-scale-split"></div>
                    <div v-touch-ripple class="edit-scale-fit edit-scale-box" @click="fit" @mouseenter="mouseenter('showBestViewTip')" @mouseleave="mouseleave('showBestViewTip')">
                        <svg class="edit-scale-icon">
                            <use xlink:href="#svg-edit-origin"></use>
                        </svg>
                        <div class="tip" v-show="showBestViewTip">最佳视图</div>
                    </div>

                    <div class="edit-scale-split"></div>
                    <assist-tool></assist-tool>
                    <div class="edit-scale-split"></div>

                    <div v-touch-ripple class="edit-scale-resz edit-scale-box" :class="{active:isShow}" @click="showResizePanel($event);" v-if="!isFromThirdDesigner">
                        <span>调整尺寸</span>

                        <transition name="slide-down">
                            <div v-if="isShow" ref="popup" class="menu-popup file-menu-popup">
                                <div class="file-title ellipsis">
                                    <p>调整画布尺寸</p>
                                    <p class="size-show">
                                        当前尺寸：{{fileSize}}
                                        <span @click.stop="selectFile(fileOptions[0])">
                                            <svg class="nav-icon">
                                                <use xlink:href="#svg-nav-resize"></use>
                                            </svg>
                                        </span>
                                    </p>
                                </div>

                                <div class="file-content">
                                    <ul class="file-option-list">
                                        <li class="file-list-option" :class="{selected: option.id === pageType}" v-for="(option, index) in fileOptions" :key="index" @click.stop="selectFile(option)">{{option.label}}</li>
                                    </ul>
                                </div>
                            </div>
                        </transition>
                    </div>
                    <div class="edit-scale-split"></div>
                    <zoom-tool></zoom-tool>
                </div>`,

    mixins: [Ktu.mixins.popupCtrl, Ktu.mixins.dataHandler],
    data() {
        return {
            showFirTip: false,
            showBestViewTip: false,
        };
    },
    computed: {
        isDevDebug() {
            return this.$store.state.isDevDebug;
        },
        templateData() {
            return Ktu.ktuData.other;
        },
        viewportMode() {
            return this.$store.state.base.viewportMode;
        },
        fileOptions() {
            return Ktu.config.fileOptions;
        },
        pageType() {
            return this.$store.state.base.templateType;
        },
        isGifTemplate() {
            return this.$store.state.base.isGifTemplate;
        },
        isFromThirdDesigner() {
            return Ktu.isFromThirdDesigner && !Ktu.isFromCustomization;
        },
        fileSize() {
            let unit = '';
            switch (this.templateData.unit) {
                case 1:
                    unit = 'px';
                    break;
                case 2:
                    unit = 'mm';
                    break;
                case 3:
                    unit = 'cm';
                    break;
                case 4:
                    unit = 'in';
                    break;
            }
            return `${this.templateData.originalWidth + unit} x ${this.templateData.originalHeight}${unit}`;
        },
    },
    mounted() {
        // console.log('storage:',localStorage.getItem('reSizePageFromExtension'));
        if(localStorage.getItem('reSizePageFromExtension') && localStorage.getItem('reSizePageFromExtension') != 0) {
            const pageObj = JSON.parse(localStorage.getItem('reSizePageFromExtension'));
            // console.log('pageObj:',pageObj);
            localStorage.setItem('reSizePageFromExtension',0);
            setTimeout(function() {
                console.log('resizePage:',Ktu.template);
                Ktu.template.resizePage(pageObj, false, true);
            },200)
        }
    },
    methods: {
        toggleShow(tipType, status) {
            switch (tipType) {
                case 'showFirTip':
                    this.showFirTip = status;
                    break;
                case 'showBestViewTip':
                    this.showBestViewTip = status;
                    break;
            }
        },
        mouseenter(tipType) {
            this.toggleShow(tipType, true);
        },
        mouseleave(tipType) {
            this.toggleShow(tipType, false);
        },
        origin() {
            this.showFirTip = false;
            Ktu.edit.zoomNoScale();
            this.$store.commit('msg/showManipulatetip', 'isShowScrollTip');
            Ktu.log('tool', 'origin');
        },
        fit() {
            this.showBestViewTip = false;
            Ktu.edit.zoomFit();
            this.$store.commit('msg/showManipulatetip', 'isShowScrollTip');
            Ktu.log('tool', 'fit');
        },

        showResizePanel(ev) {
            if (this.isGifTemplate) {
                this.selectFile(this.fileOptions[0]);
            } else {
                this.show(ev, 'clickResizeFile');
            }
            Ktu.log('resizePage', 'fshow');
        },

        selectFile(obj) {
            const that = this;
            const pageObj = _.cloneDeep(obj);
            if (obj.id == 0) {
                that.$store.commit('modal/resizeFileModalState', {
                    isOpen: true,
                    props: {
                        isShowMask: true,
                    },
                });
            } else {
                let unit = 'px';
                if (obj.unitId == 2) {
                    unit = 'mm';
                } else if (obj.unitId == 3) {
                    unit = 'cm';
                } else if (obj.unitId == 4) {
                    unit = 'in';
                }

                const tipText = `<div class="confirmTitle">即将修改画布尺寸为：${obj.width}${unit}×${obj.height}${unit}</div><div class="confirmTip">修改画布将改变所有页面尺寸</div>`;

                console.log('pageObj:',pageObj)
                this.$Modal.confirm({
                    content: tipText,
                    onOk() {
                        Ktu.log('resizePage', 'fCreate');
                        pageObj.originalWidth = pageObj.width;
                        pageObj.originalHeight = pageObj.height;
                        Ktu.template.resizePage(pageObj, false, true);
                    },
                });
            }
        },

    },
});
