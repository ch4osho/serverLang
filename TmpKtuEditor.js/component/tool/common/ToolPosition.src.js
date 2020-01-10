Vue.component('tool-position', {
    template: `<div class="tool-box tool-position" ref="activeBtn">
                    <tool-btn v-if="showIcon" icon="position" tips="位置" @click="show($event, '', '', isLocked)" :class="{opened: isShow, disabled: isLocked}"></tool-btn>
                    <tool-btn v-else @click="show($event, '', '', isLocked)" :class="{opened: isShow, disabled: isLocked}">位置</tool-btn>
                    <transition :name="transitionName">
                        <div v-if="isShow" ref="popup" :style="[offsetStyle,dropMenuStyle]" class="tool-popup tool-position-popup" :class="{'reverseX': isNeedReverseX, 'reverseY': isNeedReverseY, 'noArrow':styleSetByEditContextMenu.isShow}"
                        @mouseenter="showDropMenu($event,true)"
                        @mouseleave="showDropMenu($event,false)">
                            <div class="position-container">
                                <div class="position-list">
                                    <div class="position-item" v-for="item in list"  @click="selectPosition(item.type)">
                                        <svg class="svg-tool-position">
                                            <use :xlink:href="'#svg-tool-'+ item.icon"></use>
                                        </svg>
                                        <p class="title">{{item.title}}</p>
                                    </div>
                                </div>
                                <div class="position-content">
                                    <div v-for="item in btnList" class="direct has-tips" :class="item.class" @click="selectPosition(item.type)" :tips="item.tips">
                                        <svg class="svg-tool-position">
                                            <use :xlink:href="'#svg-tool-'+ item.icon"></use>
                                        </svg>
                                    </div>
                                </div>
                                <div class="postiton-coord">
                                    <div class="position-coord-title">坐标</div>
                                    <div class="postiton-coord-xy">
                                        <div class="postiton-coord-x">
                                            <label>X</label>
                                            <input type="text" v-model="x"
                                                @input="numberInput($event, 'x')"
                                                @keyup.enter="enterInput('x')"
                                                @focus="focusInput('x')"
                                                @blur="blurInput"
                                                ref="x"/>
                                        </div>
                                        <div class="postiton-coord-y">
                                            <label>Y</label>
                                            <input type="text" v-model="y"
                                                @input="numberInput($event, 'y')"
                                                @keyup.enter="enterInput('y')"
                                                @focus="focusInput('y')"
                                                @blur="blurInput"
                                                ref="y"/>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                type: 'left',
                class: 'left',
                icon: 'edge',
                tips: '贴左边',
            },
            {
                type: 'right',
                class: 'right',
                icon: 'edge',
                tips: '贴右边',
            },
            {
                type: 'top',
                class: 'top',
                icon: 'edge',
                tips: '贴上边',
            },
            {
                type: 'bottom',
                class: 'bottom',
                icon: 'edge',
                tips: '贴下边',
            },
            {
                type: 'center',
                class: 'center',
                icon: 'position',
                tips: '画布中间',
            },
            ],
            list: [{
                type: 'topBottomCenter',
                title: '上下居中',
                icon: 'topBottomCenter',
            }, {
                type: 'leftRightCenter',
                title: '左右居中',
                icon: 'leftRightCenter',
            }],

            popUpWidth: 220,
            popUpHeight: 256,
            offsetStyle: {},
            x: 0,
            y: 0,
            cacheX: 0,
            cacheY: 0,
            isXInput: false,
            isYInput: false,
            dropMenuStyle: {
                width: this.menuWidth,
            },
        };
    },
    computed: {
        fromContextMenu() {
            return this.isFromContextMenu;
        },
        isLocked() {
            return this.activeObject.isLocked;
        },
        ctrlEle() {
            return this.activeObject && (this.activeObject.isInContainer ? this.activeObject.container : this.activeObject);
        },
        computedXCoord() {
            return this.getCoordsXY('left');
        },
        computedYCoord() {
            return this.getCoordsXY('top');
        },

        styleSetByEditContextMenu() {
            return Ktu.store.state.msg.dropMenuStyle;
        },
    },
    watch: {
        fromContextMenu() {
            this.show(this.isLocked);
        },
        isShow(isShow) {
            if (isShow) {
                if (this.isNeedAlainTop && this.isNeedReverseY && document.getElementById('toolBar')) {
                    this.offsetStyle = {
                        top: `${107 - this.$refs.activeBtn.getBoundingClientRect().top}px`,
                        transform: 'translate(0, 0)',
                        left: '40px',
                    };
                    if (this.isNeedReverseX) {
                        this.offsetStyle = {
                            top: `${107 - this.$refs.activeBtn.getBoundingClientRect().top}px`,
                            transform: 'translate(0, 0)',
                            right: '32px',
                        };
                    }
                }
            }
        },
        computedXCoord: {
            handler() {
                this.x = this.computedXCoord;
                this.cacheX = this.x;
            },
            immediate: true,
        },
        computedYCoord: {
            handler() {
                this.y = this.computedYCoord;
                this.cacheY = this.y;
            },
            immediate: true,
        },
        // EditContextMenu控制的dropmenu样式
        styleSetByEditContextMenu(styleSetByEditContextMenu) {
            if (this.icon === 'position') {
                const dropMenuRight = this.$refs.activeBtn.offsetLeft - 168;
                const isNeedMoveLeft = (styleSetByEditContextMenu.left + 218) > Ktu.edit.size.width;
                const isNeedMoveTop = (styleSetByEditContextMenu.top + 303) > Ktu.edit.size.height;
                if (styleSetByEditContextMenu.isShow && styleSetByEditContextMenu.operationName === 'position') {
                    this.dropMenuStyle = {
                        width: this.menuWidth,
                        left: `${-168 - ((Ktu.edit.size.width - styleSetByEditContextMenu.left) - (Ktu.edit.size.width - dropMenuRight)) - (isNeedMoveLeft ? 384 : 0)}px`,
                        top: `${styleSetByEditContextMenu.top - (isNeedMoveTop ? 274 : 0)}px`,
                    };
                    this.isShow = true;
                } else {
                    this.closeDropMenu();
                }
            }
        },
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
        selectPosition(type, customeCoords) {
            this.activeObject.saveState();
            this.activeObject.setPosition(type, this.isObjectInGroup, customeCoords);
            this.activeObject.modifiedState();
            if (this.eventType) {
                Ktu.log(this.eventType, 'position');
            } else {
                if (this.styleSetByEditContextMenu.isShow) {
                    Ktu.log('setAlignment', `${type}_contextmenu`);
                } else {
                    Ktu.log('setAlignment', type);
                }
            }

            Ktu.edit.refreshContextMenu();
        },

        getCoordsXY(coord) {
            let value = this.ctrlEle[coord];
            if (this.ctrlEle.group) {
                value += this.ctrlEle.group[coord];
            }
            return Math.round(value);
        },

        numberInput(e, type) {
            if (`${this[type]}`.indexOf('-') === -1 || `${this[type]}`.indexOf('-') !== 0) {
                this[type] = e.target.value.replace(/[^\d]/g, '');
            } else {
                this[type] = `-${e.target.value.replace(/[^\d]/g, '')}`;
            }
        },
        focusInput(type) {
            if (type === 'x') {
                this.$refs.x.select();
            } else {
                this.$refs.y.select();
            }
        },
        blurInput() {
            if (this.styleSetByEditContextMenu.isShow && (this.x != this.cacheX || this.y != this.cacheY)) {
                Ktu.simpleLog('setAlignment', 'change_coordinate_contextmenu');
            } else if (this.x != this.cacheX || this.y != this.cacheY) {
                Ktu.simpleLog('setAlignment', 'changeCoordinate');
            }
            const parseX = parseInt(this.x, 10);
            const parseY = parseInt(this.y, 10);
            if ((isNaN(parseX) || isNaN(parseY))
                || (parseX < -10000 || parseX > 10000)
                || (parseY < -10000 || parseY > 10000)) {
                this.resizeXY();
                this.$Notice.warning(`请输入-${Ktu.config.edit.maxWidth}~${Ktu.config.edit.maxWidth}的数字`);
                return;
            }
            this.selectPosition('custome', {
                x: this.x,
                y: this.y,
            });
        },
        resizeXY() {
            this.x = this.cacheX;
            this.y = this.cacheY;
        },
        enterInput(type) {
            if (type === 'x') {
                this.$refs.x.blur();
            } else {
                this.$refs.y.blur();
            }
        },
        showDropMenu(e, isShow) {
            if (this.$store.state.msg.dropMenuStyle.operationName === 'position' || !this.$store.state.msg.isShowContextmenu) {
                Ktu.store.commit('msg/update', {
                    prop: 'isShowDropMenu',
                    value: isShow,
                });
            }
        },
    },

});
