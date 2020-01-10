;
Ktu.mixins.popupCtrl = {
    props: {
        isOpen: {
            type: Boolean,
            default: false,
        },
        // 是否由右键弹出的toolBar弹出
        isFromToolBar: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            isShow: this.isOpen,
            isShowMask: false,
            isPreventHide: false,
            mouseCoords: {},

            // 刚好工具栏按钮是26px，需要阈值误差
            deltaX: 28,
            deltaY: 28,
            isNeedReverseX: false,
            isNeedReverseY: false,
            popUpHeight: 0,
            popUpWidth: 0,

            // 提示只显示一次
            showQrCodeTipStatus: true,

            // 是否需要对齐编辑区域的边界，避免被裁剪
            isNeedAlainLeft: false,
            isNeedAlainTop: false,

            // 是否自身左偏100%，（类似颜色面板,默认在左边弹出）
            isTranslateX: false,
        };
    },
    computed: {
        clientWidth() {
            return document.body.clientWidth;
        },
        clientHeight() {
            return document.body.clientHeight;
        },
        // 看情况使用，有些组件动画不适用的
        transitionName() {
            if (this.isNeedReverseY) {
                return 'slide-down';
            }
            return 'slide-up';
        },
        // 获取右边页面与层级是否显示了
        isShowPage() {
            return this.$store.state.base.isShowPage;
        },
        // 左边的ele是否弹出来，用于计算popup位置
        isShowEleDetail() {
            return this.$store.state.base.isShowEleDetail;
        },
        // 工具栏二级菜单显示与否
        isHideEditToolbarMenu() {
            return this.$store.state.base.isHideEditToolbarMenu;
        },
    },
    watch: {
        isShow(isShow) {
            if (!isShow) {
                this.removeGlobalPopupEvent();
            }
        },
        isHideEditToolbarMenu(isHideEditToolbarMenu) {
            if (isHideEditToolbarMenu) {
                this.isShow = false;
            }
        },
    },
    created() {
        if (this.isShow) {
            window.setTimeout(() => {
                document.addEventListener('mousedown', this.logMouseCoords);
                document.addEventListener('click', this.closePopup);
            });
        }
    },
    methods: {
        // 检查popup工具是否对齐编辑区域的边界，避免被裁剪
        checkNeedAlain(e) {
            if (e.clientX - this.deltaX - Ktu.edit.size.left < (this.isTranslateX ? this.popUpWidth : 0)) {
                this.isNeedAlainLeft = true;
            }
            if (e.clientY - this.deltaY - 106 < this.popUpHeight) {
                this.isNeedAlainTop = true;
            }
        },
        // 检查popup工具是否需要进行位置反转调整：
        checkNeedReverse(e) {
            let rightPageWidth = 0;
            if (this.isShowPage) {
                rightPageWidth = 180;
            }
            if (e.clientY + this.popUpHeight + this.deltaY > this.clientHeight) {
                this.isNeedReverseY = true;
            }
            if (e.clientX + this.popUpWidth + this.deltaX + rightPageWidth > this.clientWidth) {
                this.isNeedReverseX = true;
            }
        },
        show($event, dogName, srcName, isLocked = false, callback) {
            // 这个为了当canvas锁定的时候，不让popup弹出框出现，默认false
            if (isLocked) return;
            if (!this.isShow) {
                // 进行工具位置反转检查
                if ($event) {
                    this.checkNeedReverse($event);
                    this.checkNeedAlain($event);
                }

                // 当二维码选择颜色的时候弹出提示
                if (this.showQrCodeTip && this.showQrCodeTipStatus && !this.artQrCode) {
                    this.showQrCodeTipStatus = false;
                    this.$Notice.warning('二维码前景色比背景色深才能识别', 1000);
                }
                const colorType = this.colorType === 'foregroundColor' || this.colorType === 'foreground' ? '前景色' : '背景色';
                if (this.artQrCode) {
                    this.$Notice.warning(`图像二维码不能更换${colorType}`, 1000);
                    return;
                };
                Ktu.log(dogName, srcName);
                this.isShow = true;
                this.$store.commit('base/setModelClose', false);

                if (this.isShowMask) {
                    this.$store.commit('base/maskState', true);
                }

                window.setTimeout(() => {
                    document.addEventListener('mousedown', this.logMouseCoords);
                    document.addEventListener('click', this.closePopup);
                });
                this.$emit('showPopUp');
                callback && callback();
            }
        },
        closePopup(event) {
            if (Math.abs(event.clientX - this.mouseCoords.x) < 3 && Math.abs(event.clientY - this.mouseCoords.y) < 3) {
                const popupMenu = this.$refs.menu;
                const popupContainer = this.$refs.popup;
                const { target } = event;
                const paths = event.path || (event.composedPath && event.composedPath());
                if (popupContainer) {
                    if (popupContainer !== target && !$.contains(popupContainer, target)) {
                        this.isShow = false;
                        if (this.isShowMask) {
                            const clickMenu = paths.some(item => /popup-menu/.test(item.className));
                            if (!clickMenu || (popupMenu && $.contains(popupMenu, target))) {
                                this.$store.commit('base/maskState', false);
                            }
                        }
                    }
                } else {
                    this.isShow = false;

                    if (this.isShowMask) {
                        this.$store.commit('base/maskState', false);
                    }
                }
            }
        },
        logMouseCoords(event) {
            this.mouseCoords = {
                x: event.clientX,
                y: event.clientY,
            };
        },
        removeGlobalPopupEvent() {
            document.removeEventListener('mousedown', this.logMouseCoords);
            document.removeEventListener('click', this.closePopup);
        },
        addPop(newpop) {
            const nowPop = this.$store.state.base.popShow;
            nowPop.push(newpop);
            this.$store.commit('base/changeState', {
                prop: 'popShow',
                value: nowPop,
            });
        },
        delPop() {
            const nowPop = this.$store.state.base.popShow;
            nowPop.pop();
            this.$store.commit('base/changeState', {
                prop: 'popShow',
                value: nowPop,
            });
        },
        delPopAll() {
            this.$store.commit('base/changeState', {
                prop: 'popShow',
                value: [],
            });
        },
    },
};
