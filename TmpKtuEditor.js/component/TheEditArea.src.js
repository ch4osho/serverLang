Vue.component('edit-area', {
    template: `<section class="edit-area" id="editArea" :style="editAreaPosition" @contextmenu.prevent="contextmenu" @mousedown="onmousedown">

                    <ele-tool></ele-tool>

                    <edit-center :class="{'edit-center-show': hasCompleted}"></edit-center>

                    <edit-draw></edit-draw>

                    <edit-contextmenu :event="contextmenuEvent" @emptyContextmenuEvent="emptyContextmenuEvent"></edit-contextmenu>

                    <edit-scale :class="{'edit-scale-show': hasCompleted}"></edit-scale>

                </section>`,
    mixins: [Ktu.mixins.dataHandler, Ktu.mixins.Response],
    data() {
        return {
            contextmenuEvent: null,
        };
    },
    computed: {
        hasCompleted() {
            return this.$parent.hasLoaded;
        },
        isShowEleDetail() {
            return this.$store.state.base.isShowEleDetail;
        },
        isShowPage() {
            return this.$store.state.base.isShowPage;
        },
        editAreaPosition() {
            const {
                detailWidth,
            } = Ktu.config.ele;
            const pageWidth = Ktu.config.page.width;
            return {
                left: `${this.categoryWidth + (this.isShowEleDetail ? detailWidth : 0)}px`,
                right: `${this.isShowPage ? pageWidth : 0}px`,
            };
        },

        isShowPage() {
            return this.$store.state.base.isShowPage;
        },

        isHideEditToolbar: {
            get() {
                return this.$store.state.base.isHideEditToolbar;
            },

            set(newVal) {
                this.$store.state.base.isHideEditToolbar = newVal;
            },
        },

        isHideEditToolbarMenu: {
            get() {
                return this.$store.state.base.isHideEditToolbarMenu;
            },

            set(newVal) {
                this.$store.state.base.isHideEditToolbarMenu = newVal;
            },
        },

        objectId() {
            if (this.activeObject) {
                return this.activeObject.objectId;
            }
        },

        // 打开属性工具栏
        isOpenTool() {
            return this.$store.state.base.isOpenTool.isShow;
        },
        isShowDropMenu() {
            return Ktu.store.state.msg.isShowDropMenu;
        },
    },
    watch: {
        isShowEleDetail() {
            this.resizeCanvas();
        },
        isShowPage() {
            this.resizeCanvas();
        },
        isHideEditToolbar(newValue) {
            if (newValue) {
                this.emptyContextmenuEvent();

                this.isHideEditToolbar = false;
            }
        },

        isOpenTool(value) {
            if (value) {
                this.emptyContextmenuEvent();
            }
        },
        objectId(newValue, oldValue) {
            // 一开始选中的是一个空值 null 所以要确保是不是真正的切换元素
            if (oldValue) {
                this.emptyContextmenuEvent();
            }
        },
    },
    methods: {
        resizeCanvas() {
            /* this.$nextTick(() => {
               var totalTime = 300;
               var pastTime = 0;
               var interval = 30;
               var resizeTimer = window.setInterval(() => {
               pastTime >= totalTime && window.clearInterval(resizeTimer);
               Ktu.mainCanvas.resizeCanvas();
               // Ktu.mainCanvas.setZoom(Ktu.canvas.viewZoom);
               pastTime += interval;
               }, interval);
               }); */
        },
        contextmenu(event) {
            const isZoomMode = this.activeObject && this.activeObject.isZoomMode;
            if (!isZoomMode && $.contains($('#edit-center')[0], event.target)) {
                Ktu.store.commit('msg/update', {
                    prop: 'isShowDropMenu',
                    value: false,
                });
                this.contextmenuEvent = event;
                this.toolbarEvent = event;

                Ktu.store.commit('msg/update', {
                    prop: 'isShowContextmenu',
                    value: true,
                });
                // 隐藏工具栏二级菜单隐藏工具栏二级菜单
                this.isHideEditToolbarMenu = true;
            }
        },
        onmousedown(e) {
            this.emptyContextmenuEvent(e);
        },
        emptyContextmenuEvent(e) {
            if (!this.isShowDropMenu) {
                this.contextmenuEvent = null;
                this.isHideEditToolbarMenu = false;
                Ktu.store.commit('msg/setDropMenuStyle', {
                    type: 'dropMenuStyle',
                    data: {
                        isShow: false,
                    },
                });
                Ktu.store.commit('msg/update', {
                    prop: 'isShowContextmenu',
                    value: false,
                });
            }
        },
    },
});
