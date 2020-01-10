Vue.component('tool-level', {
    template: `<div class="tool-box tool-level" ref="levelDropMenu">
                    <tool-btn v-if="isToolBar" icon="level" tips="层级" @click="show($event, 'levelManage', 'click_tool')" :class="{opened: isShow}"></tool-btn>
                    <svg class="comp-icon" v-else @click="show($event, 'levelManage', 'click_page')">
                        <use xlink:href="#svg-compOpt-level"></use>
                    </svg>

                    <transition :name="transition">
                        <div v-if="isShow" ref="popup" class="tool-popup tool-level-popup" :class="{'noArrow':styleSetByEditContextMenu.isShow}" :style="[dropMenuStyle]"
                        @mouseenter="showDropMenu($event,true)"
                        @mouseleave="showDropMenu($event,false)">
                            <div class="level-container">
                                <div class="level-bar">
                                    <div v-for="item in btnList" class="level-tab" @click="selectLevel(item.type, true)">
                                        <svg class="svg-tool-level">
                                            <use :xlink:href="'#svg-'+ item.icon"></use>
                                        </svg>
                                        <label class="name">{{item.name}}</label>
                                    </div>
                                </div>
                                <div class="level-slider">

                                    <div class="slider-container">
                                        <div class="slider-nav">
                                            <label class="tip">顶层</label>
                                            <label class="tip">底层</label>
                                        </div>
                                        <!--
                                        <ul class="slider-rule">
                                            <li class="rule-item" v-for="item in ruleList" :class="{'long': item === 1}"></li>
                                        </ul>
                                        -->
                                        <div class="slider-icon">
                                            <svg class="svg-tool-rule" v-if="isMultiSelect || disabled">
                                                <path :d="d" style="fill: #E1E1E1"/>
                                            </svg>
                                            <svg class="svg-tool-rule" v-else>
                                                <path :d="d1" style="fill: #E1E1E1"/>
                                                <path :d="d2" style="fill: #AAAAAA"/>
                                            </svg>
                                            <span class="rule-btn" ref="ruleBtn" :class="{'grabbing': dragging, 'disabled': isMultiSelect || disabled}"
                                            @mousedown="onButtonDown" @touchstart="onButtonDown" :style="{'bottom': bottom + 'px'}"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </transition>
                </div>`,
    mixins: [Ktu.mixins.dataHandler, Ktu.mixins.popupCtrl],
    props: {
        isToolBar: {
            type: Boolean,
            default: true,
        },
        icon: String,
        menuWidth: {
            type: String,
            default: '218px',
        },
    },
    data() {
        return {
            isShow: false,
            btnList: [{
                name: '上移',
                type: 'up',
                icon: 'tool-up',
            },
            {
                name: '下移',
                type: 'down',
                icon: 'tool-down',
            },
            {
                name: '置顶',
                type: 'top',
                icon: 'tool-top',
            },
            {
                name: '置底',
                type: 'bottom',
                icon: 'tool-bottom',
            },
            ],
            ruleList: [1, 0, 0, 0, 1, 0, 0, 0, 1],

            disabled: false,
            dragging: false,
            startY: 0,
            newY: null,
            bottom: this.sliderHeight - 7,

            newPos: null,
            sliderHeight: 128,
            nowDepth: 0,

            startDepth: 0,
            dropMenuStyle: {
                width: this.menuWidth,
            },
        };
    },
    computed: {
        // 计算一共有多少层
        depth() {
            if (this.isObjectInGroup) {
                return this.selectedData.group.objects.length;
            }
            // 要减去最底层的背景层
            return this.selectedObjects.length - 1;
        },
        oldDepth() {
            return this.checkPropLevel();
        },
        interval() {
            return this.sliderHeight / (this.depth - 1) || 0;
        },
        isDrag() {
            return this.depth <= 1;
        },
        selectedObjects() {
            return this.$store.state.data.selectedTemplateData.objects;
        },
        selectedObjectsInGroup() {
            return this.activeObject.group.objects;
        },
        selectedObjectId() {
            return this.activeObject.objectId;
        },
        isMultiSelect() {
            return this.activeObject.type === 'multi';
        },
        // 计算svg的滑条x,y值,这个x,y值的比例是进行相似三角形计算出来的
        x1() {
            return this.y / 32;
        },
        x2() {
            return 8 - this.x1;
        },
        y() {
            return this.sliderHeight - this.bottom - 7;
        },
        d() {
            return `M0 0 L8 0 L4 ${this.sliderHeight} Z`;
        },
        d1() {
            return `${'M0 0 L8 0' + ' L'}${this.x2} ${this.y} L${this.x1} ${this.y} Z`;
        },
        d2() {
            return `M${this.x2} ${this.y} L${this.x1} ${this.y} L4 ${this.sliderHeight} Z`;
        },
        transition() {
            if (!this.isToolBar) {
                return 'slide-down';
            }
            return 'slide-up';
        },
        styleSetByEditContextMenu() {
            return Ktu.store.state.msg.dropMenuStyle;
        },
    },
    watch: {
        /* 以下情况都需要对滑动条进行更新
           选择元素更改 */
        selectedObjectId() {
            this.initPropLevel();
        },
        // 元素层级改变
        oldDepth() {
            this.initPropLevel();
        },
        // 多选元素
        isMultiSelect() {
            // this.initPropLevel();
        },
        isShow() {
            this.$emit('isShow', this.isShow);
        },

        depth() {
            if (this.isObjectInGroup) {
                this.disabled = false;
            } else {
                if (this.selectedObjects.length <= 2) {
                    this.disabled = true;
                } else {
                    this.disabled = false;
                }
            }
        },
        // EditContextMenu控制的dropmenu样式
        styleSetByEditContextMenu(styleSetByEditContextMenu) {
            if (this.icon === 'level') {
                const dropMenuLeft = this.$refs.levelDropMenu.offsetLeft + 28 - 218;
                const isNeedMoveLeft = (styleSetByEditContextMenu.left + 218) > Ktu.edit.size.width;
                const isNeedMoveTop = (styleSetByEditContextMenu.top + 170) > Ktu.edit.size.height;
                if (styleSetByEditContextMenu.isShow && styleSetByEditContextMenu.operationName === 'level') {
                    this.dropMenuStyle = {
                        width: this.menuWidth,
                        right: `${((Ktu.edit.size.width - styleSetByEditContextMenu.left) - (Ktu.edit.size.width - dropMenuLeft)) + (isNeedMoveLeft ? 384 : 0)}px`,
                        top: `${styleSetByEditContextMenu.top - (isNeedMoveTop ? 138 : 0)}px`,
                    };
                    // this.show();
                    this.isShow = true;
                } else {
                    this.closeDropMenu();
                }
            }
        },
    },
    mounted() {
        this.initPropLevel();
    },
    methods: {
        closeDropMenu() {
            this.isShow = false;
            this.dropMenuStyle = {
                width: this.menuWidth,
                right: `${0}px`,
                top: `${36}px`,
            };
        },
        // 返回当前选中元素的层级
        checkPropLevel() {
            // 分两种情况，组合内单选元素,这个不存在背景，需要加
            let idx = 0;
            if (this.isObjectInGroup) {
                this.selectedObjectsInGroup.some((item, index) => {
                    if (item.objectId === this.activeObject.objectId) {
                        idx = index;
                        return true;
                    }
                    return false;
                });
                return parseInt(idx, 10) + 1;
            }
            this.selectedObjects.some((item, index) => {
                if (item.objectId === this.activeObject.objectId) {
                    idx = index;
                    return true;
                }
                return false;
            });
            return idx;
        },
        // 初始化获取元素的层级
        initPropLevel() {
            // 主要按钮是绝对布局，14px，减去7px才是中心点
            this.nowDepth = this.oldDepth;
            // 当按钮不能拉动的时候按钮默认置顶
            if (this.disabled && this.nowDepth == 1 || this.isMultiSelect) {
                this.bottom = this.sliderHeight - 7;
            } else {
                this.bottom = this.interval * (this.nowDepth - 1) - 7 || this.sliderHeight - 7;
            }
        },
        // 选择的层级
        selectLevel(type, recordHistory = true) {
            this.$emit('selectLevel', type, recordHistory);
        },

        // 鼠标按下滑动条
        onButtonDown(event) {
            if (this.isMultiSelect || this.disabled) return;
            event.preventDefault();
            this.onDragStart(event);

            window.addEventListener('mousemove', this.onDragging);
            window.addEventListener('mouseup', this.onDragEnd);
            window.addEventListener('touchmove', this.onDragging);
            window.addEventListener('touchend', this.onDragEnd);
        },
        onDragStart(event) {
            if (this.isDrag) return;

            this.dragging = true;
            this.startY = event.clientY;
            // 需要记录拉动前的记录
            if (this.isObjectInGroup) {
                this.activeObject.saveState();
            } else {
                this.activeObject.saveState(HistoryAction.OBJECT_ZINDEX);
            }

            this.startDepth = this.activeObject.depth;
            if (this.styleSetByEditContextMenu.isShow) {
                Ktu.log('levelManage', 'slide_contextmenu');
            } else {
                Ktu.log('levelManage', 'slide_tool');
            }
        },
        onDragging(event) {
            if (this.dragging) {
                const deltaY = event.clientY - this.startY;

                // 这个注意deltaY的值是否足以改变newY；
                const count = Math.round(deltaY / this.interval);
                if (count !== 0) {
                    if (count > 0) {
                        this.nowDepth--;
                    } else if (count < 0) {
                        this.nowDepth++;
                    }
                    // 边界值处理：
                    this.nowDepth = this.nowDepth < 1 ? 1 : this.nowDepth;
                    this.nowDepth = this.nowDepth > this.depth ? this.depth : this.nowDepth;

                    this.startY = event.clientY;
                    this.bottom = this.interval * (this.nowDepth - 1) - 7;
                    this.selectLevel(this.nowDepth, false);
                }
            }
        },
        onDragEnd() {
            if (this.dragging) {
                // 如果拉动没变化就不需要再调整位置了
                if (this.nowDepth != this.startDepth) {
                    this.selectLevel(this.nowDepth, true);
                }
                this.dragging = false;
            }
            window.addEventListener('mousemove', this.onDragging);
            window.addEventListener('mouseup', this.onDragEnd);
            window.addEventListener('touchmove', this.onDragging);
            window.addEventListener('touchend', this.onDragEnd);
        },
        showDropMenu(e, isShow) {
            if (this.$store.state.msg.dropMenuStyle.operationName === 'level' || !this.$store.state.msg.isShowContextmenu) {
                Ktu.store.commit('msg/update', {
                    prop: 'isShowDropMenu',
                    value: isShow,
                });
            }
        },
    },
});
