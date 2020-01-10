Vue.component('drop-menu', {
    mixins: [Ktu.mixins.popupCtrl],
    props: {
        type: {
            type: [String],
            default: 'word',
        },
        value: {
            type: [String, Number],
        },
        isNeedCloseInside: {
            type: Boolean,
            default: true,
        },
        icon: String,
        tips: String,
        options: {
            type: Array,
        },
        inputConf: Object,
        menuWidth: {
            type: String,
            default: '150px',
        },
        menuHeight: {
            type: String,
            default: '114px',
        },
        btnWidth: {
            type: String,
            default: '50px',
        },
        unit: {
            type: String,
            default: '',
        },
        toolType: {
            type: String,
            default: '',
        },
        /* valueName: {
           type: String,
           default: 'value'
           },
           labelName: {
           type: String,
           default: 'label'
           }, */
        direction: {
            type: String,
            default: 'left',
        },
        wheelFn: Function,
        scroll: {
            type: Boolean,
            default: false,
        },
    },
    template: `<div class="tool-box drop-menu" ref="dropMenu" >
                    <div class="tool-btn" :class="{'btn-word': !icon, 'has-tips': icon, opened: isShow}" :tips="tips" v-touch-ripple @mousewheel="handleMouseWheel">
                        <svg v-if="icon" class="tool-btn-svg" @click="show" >
                            <use :xlink:href="'#svg-tool-'+icon" class="tool-btn-svg-use"></use>
                        </svg>

                        <template v-else>
                            <template v-if="inputConf && inputConf.openGuide">
                                <validate-input class="tool-btn-input" :style="{width: btnWidth}" :inputVal="value" :unit="unit" valType="number" @input="selectOption"  @click="show" :min="inputConf.min" :max="inputConf.max" :maxLength="inputConf.maxLength"></validate-input>
                                <div class="tool-btn-guide">
                                    <div class="tool-btn-guide-increase" @click="increase">
                                        <svg class="tool-btn-guide-icon">
                                            <use xlink:href="#svg-tool-arrow"></use>
                                        </svg>
                                    </div>
                                    <div class="tool-btn-guide-decrease" @click="decrease">
                                        <svg class="tool-btn-guide-icon">
                                            <use xlink:href="#svg-tool-arrow"></use>
                                        </svg>
                                    </div>
                                </div>
                            </template>

                            <template v-else>
                                <validate-input v-if="inputConf" class="tool-btn-input" :style="{width: btnWidth}" :inputVal="value" :unit="unit" valType="number" @input="selectOption"  @click="show" :min="inputConf.min" :max="inputConf.max" :maxLength="inputConf.maxLength"></validate-input>
                                <span v-else-if="type === 'pic'" class="tool-btn-pic" :style="{width: btnWidth}" @click="show">
                                    <svg class="tool-btn-pic-svg">
                                        <use :xlink:href="'#svg-'+selectedOption.pic"></use>
                                    </svg>
                                </span>
                                <span v-else class="tool-btn-word" :style="{width: btnWidth}" @click="show">
                                    <slot></slot>
                                </span>

                                <div class="tool-btn-arrow" @click="show">
                                    <svg class="tool-btn-arrow-svg">
                                        <use xlink:href="#svg-tool-arrow"></use>
                                    </svg>
                                </div>
                            </template>
                        </template>
                    </div>
                    <div ref="dropMenuPopup">
                    <transition :name="transitionName">
                         <div v-if="isShow"
                            :class="[direction, {scroll: scroll, 'reverseX': isNeedReverseX, 'reverseY': isNeedReverseY,noArrow:styleSetByEditContextMenu.isShow}]"
                            class="drop-menu-popup"
                            :style="[dropMenuStyle]"
                            :ref="isNeedCloseInside ? '': 'popup'">
                            <div class="drop-menu-options" ref="options" :style="dropStyle">
                                <ul class="drop-menu-category" v-for="category in tmpOptions">
                                    <li class="drop-menu-option" v-for="option in category" :class="{selected: option.value === value}" :ref="option.value === value ? 'selectedOption': ''" @click="selectOption(option.value, option.label, $event)">
                                        <svg v-if="option.icon" class="drop-menu-icon">
                                            <use :xlink:href="'#svg-'+option.icon"></use>
                                        </svg>
                                        <svg v-if="option.pic" class="drop-menu-pic">
                                            <use :xlink:href="'#svg-'+option.pic"></use>
                                        </svg>
                                        <label v-else class="drop-menu-label">{{option.label+unit}}</label>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </transition>
                    </div>

                </div>`,
    data() {
        return {
            // tmpOptions: []
            popUpWidth: parseInt(this.menuWidth, 10),
            popUpHeight: parseInt(this.menuHeight, 10),
            dropMenuStyle: {
                width: this.menuWidth,
            },
            dropStyle: {},
        };
    },
    computed: {
        tmpOptions() {
            return Array.isArray(this.options[0]) ? this.options : [this.options];
        },
        selectedOption() {
            for (let index = 0; index < this.tmpOptions.length; index++) {
                const group = this.tmpOptions[index];
                const selectedOption = _.find(group, option => {
                    const currentValue = typeof option.value === 'object' ? JSON.stringify(option.value) : option.value;
                    return this.value === currentValue;
                });
                if (selectedOption) {
                    return selectedOption;
                }
            }
        },
        styleSetByEditContextMenu() {
            return Ktu.store.state.msg.dropMenuStyle;
        },
    },
    watch: {
        isShow(isShow) {
            if (isShow) {
                if (this.isNeedReverseY && this.isNeedAlainTop && document.getElementById('toolBar')) {
                    this.isNeedReverseY = false;
                    this.dropStyle = {
                        height: `${this.clientHeight - this.$refs.dropMenu.getBoundingClientRect().top - 58}px`,
                        overflow: 'auto',
                    };
                }
                this.scrollIntoView();
            }
        },
        // EditContextMenu控制的dropmenu样式
        styleSetByEditContextMenu(newValue) {
            if (this.icon === 'horizontal_left') {
                const dropMenuLeft = this.$refs.dropMenu.offsetLeft;
                const isNeedMoveLeft = (newValue.left + 150) > Ktu.edit.size.width;
                const isNeedMoveTop = (newValue.top + 272) > Ktu.edit.size.height;
                if (newValue.isShow && newValue.operationName === 'horizontal_left') {
                    this.dropMenuStyle = {
                        width: this.menuWidth,
                        left: `${newValue.left - dropMenuLeft - (isNeedMoveLeft ? 316 : 0)}px`,
                        top: `${newValue.top - (isNeedMoveTop ? 240 : 0)}px`,
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
                left: `${0}px`,
                top: `${36}px`,
            };
        },
        handleMouseWheel(event) {
            // this.wheelFn && this.wheelFn(event);
            this.$emit('on-mouse-wheel', event);
        },
        selectOption(value, label, event) {
            this.$emit('input', value, label);
            if (this.styleSetByEditContextMenu.isShow) {
                Ktu.log('contextmenuAlain', value);
            }
            const popupContainer = this.$refs.popup;
            if (!(event && popupContainer && $.contains(popupContainer, event.target))) {
                Ktu.store.commit('msg/setDropMenuStyle', {
                    type: 'dropMenuStyle',
                    data: {
                        isShow: false,
                    },
                });
            }
        },

        increase() {
            if (this.value < this.inputConf.max) {
                this.$emit('input', this.value + 1);
            }
        },
        decrease() {
            if (this.value > this.inputConf.min) {
                this.$emit('input', this.value - 1);
            }
        },
        scrollIntoView() {
            // 搜狗浏览器 scrollIntoView 有bug
            this.$nextTick(() => {
                if (this.$refs.selectedOption && this.$refs.selectedOption.length) {
                    const { offsetTop } = this.$refs.selectedOption[0];
                    Ktu.utils.scrollTop(this.$refs.options, this.$refs.options.scrollTop || 0, offsetTop);
                }
            });
        },
    },
});
