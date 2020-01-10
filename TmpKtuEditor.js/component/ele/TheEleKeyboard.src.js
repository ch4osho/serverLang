Vue.component('ele-keyboard', {
    mixins: [Ktu.mixins.popupCtrl, Ktu.mixins.Response],
    template: `<div class="ele-keyboard">
                    <div class="keyboard-btn" @click="show($event,'shortcuts','show')" :style="{width: categoryWidth+'px', height: categoryHeight+'px'}" v-if="isBtnVisible">
                        <div class="">
                            <svg class="keyboard-svg">
                                <use xlink:href="#svg-ele-keyboard"></use>
                            </svg>
                        </div>
                        <label v-if="!isMIniHeight">快捷键</label>
                        <label class="tip" v-else>快捷键</label>
                    </div>
                    <transition name="fade">
                        <div class="keyboard-mask" v-if="isShow && isShowEleDetail" :style="{width:(categoryWidth+detailWidth)+'px'}"></div>
                    </transition>
                    <transition name="slide-left">
                        <div class="keyboard-con" v-if="isShow" ref="popup">
                            <div class="keyboard-head">
                                <div class="keyboard-titleList">
                                    <p class="keyboard-title" :class="{'active': keyboard_title == keyboardType}" v-for="keyboard_title in keyboard_titleList" @click="chooseKeyboardType(keyboard_title)">{{keyboard_title}}</p>
                                </div>
                                <div class="close-btn">
                                    <svg class="svg-icon" width="12.5" height="12.4" @click="keyboardShow">
                                        <use xlink:href="#svg-close-icon"></use>
                                    </svg>
                                </div>
                            </div>
                            <div class="keyboard-base" v-if="keyboardType == '基础'">
                                <div class="keyboard-show" v-for="keyboardCon in keyboard_keyboardCon">
                                    <div class="keyboard-type">{{keyboardCon.title}}</div>
                                    <div class="keyboard-guide">
                                        <div class="keyboard-content" v-for="keyboard in keyboardCon.content">
                                            <div class="keyboard-namecomb">
                                                <div v-show="keyboard.icon" class="keyboard-has-svg">
                                                    <svg class="keyboard-icon-svg">
                                                        <use :xlink:href=keyboard.icon></use>
                                                    </svg>
                                                </div>
                                                <span>{{keyboard.name}}</span>
                                            </div>
                                            <div class="keyboard-comb">
                                                <template v-for="(item,index) in keyboard.key">
                                                    <div  class="keyboard-instruct" :style="[{width:keyboardWidth(keyboard.key[index])},borderStyle(keyboard.key[index])]" v-if="keyboard.key[index]">
                                                        <div v-show="keyboardIcon(keyboard.key[index])" class="keyboard-has-svg">
                                                            <svg class="keyboard-icon-svg">
                                                                <use :xlink:href=keyboardIcon(keyboard.key[index])></use>
                                                            </svg>
                                                        </div>
                                                        <span v-if="isShowMouseKey(keyboard.key[index])" :class="{'keyboard-symbol': ['+','-'].includes(keyboard.key[index])}">{{keyboard.key[index]}}</span>
                                                    </div>
                                                    <span class="keyboard-add" v-if="keyboard.comboMethods[index]">{{keyboard.comboMethods[index]}}</span>
                                                </template>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="keyboard-paint" v-else>
                                <div class="keyboard-show">
                                    <div class="keyboard-type">{{keyboard_keyboardPaint.title}}</div>
                                    <div class="keyboard-guide">
                                        <div class="keyboard-content" v-for="keyboard in keyboard_keyboardPaint.content">
                                            <div v-show="keyboard.icon" class="keyboard-has-svg">
                                                <svg class="keyboard-icon-svg" :class="{'keyboard-icon-svg-special' : keyboard.name === '文本框'}">
                                                     <use :xlink:href=dealIcon(keyboard.icon)></use>
                                                </svg>
                                            </div>
                                            <div class="keyboard-comb">
                                                <div class="keyboard-instruct">
                                                    <span class="key-1">{{keyboard.key[0]}}</span>
                                                </div>
                                                <span class="keyboard-add">+</span>
                                                <div class="keyboard-instruct">
                                                    <div class="key-2">
                                                        <div v-show="keyboardIcon(keyboard.key[1])" class="keyboard-has-svg">
                                                            <svg class="keyboard-icon-svg">
                                                                <use :xlink:href=keyboardIcon(keyboard.key[1])></use>
                                                            </svg>
                                                        </div>
                                                        {{keyboard.key[1]}}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </transition>
                </div>`,
    data() {
        return {
            detailWidth: Ktu.config.ele.detailWidth,
            // categoryWidth: Ktu.config.ele.categoryWidth,
            keyboardType: '基础',
            keyboard_titleList: Ktu.config.keyboard.titleList,
            keyboard_keyboardCon: Ktu.config.keyboard.keyboardCon,
            keyboard_keyboardPaint: Ktu.config.keyboard.keyboardPaint,
            // isShowKeyboard:false
        };
    },
    computed: {
        isShowEleDetail() {
            return this.$store.state.base.isShowEleDetail;
        },
        isShowDrawKeyboard: {
            get() {
                return this.$store.state.base.isShowDrawKeyboard;
            },
            set(value) {
                this.$store.commit('base/changeState', {
                    prop: 'isShowDrawKeyboard',
                    value,
                });
            },
        },
        // 当屏幕高度太小，隐藏该按钮
        isBtnVisible() {
            if (this.browserHeight && this.browserHeight < 520) {
                return false;
            }
            return true;
        },
    },
    watch: {
        isShowDrawKeyboard(value) {
            if (value) {
                this.keyboardType = '绘制';
                this.show();
            }
        },
        isShow(value) {
            if (!this.isShow) {
                this.isShowDrawKeyboard = false;
            }
        },
    },
    methods: {
        isShowMouseKey(name) {
            if (!name) {
                return false;
            }
            if (name === '左键' || name === 'moveLeft' || name === 'moveUp' || name === 'moveDown' || name === 'moveRight') {
                return false;
            }
            return true;
        },
        keyboardBgColor(value) {
            let color;
            if (value == 'Ctrl') {
                color = '#75aafd';
            } else if (value == '空格键') {
                color = '#71d1e9';
            } else if (value == '左键' || value == 'V' || value == 'Y') {
                color = '#ee84f5';
            } else if (value == '滚轮') {
                color = '#f78e72';
            } else if (value == '+' || value == 'C' || value == 'Z') {
                color = '#f7ba72';
            } else if (value == '-' || value == 'S') {
                color = '#73d269';
            } else {
                color = '#ff7a80';
            }
            return color;
        },
        keyboardWidth(value, name) {
            let width;
            if (value == 'Ctrl') {
                width = '32px';
            } else if (value == 'Shift') {
                width = '40px';
            } else if (value == '空格键') {
                width = '47px';
            } else if (value == 'Delete') {
                width = '49px';
            } else if (value == '左键' || value == '+' || value == '-' || value == 'C' || value == 'V' || value == 'S' || value == 'Y' || value == 'Z' || value == ']' || value == '[' || value == 'O' || value == 'A' || value == '/') {
                width = '24px';
            } else if (value == '滚轮') {
                width = '51px';
            } else if (value == 'moveLeft' || value == 'moveUp' || value == 'moveDown' || value == 'moveRight') {
                width = '21.3px';
            }

            if (name === '多选') {
                width = '24px';
            }
            return width;
        },
        borderStyle(value, name) {
            let borderStyle;
            if (value == 'moveUp') {
                borderStyle = { borderRadius: '3px 0 0 3px', marginRight: '-1px' };
            }
            if (value == 'moveLeft' || value == 'moveDown') {
                borderStyle = { borderRadius: '0', marginRight: '-1px' };
            }
            if (value == 'moveRight') {
                borderStyle = { borderRadius: '0 3px 3px 0' };
            }

            return borderStyle;
        },
        keyboardIcon(value) {
            switch (value) {
                case '左键':
                    return '#svg-ele-keyboardLeft';
                case '左键拖拉':
                    return '#svg-ele-keyboardLeft';
                case '滚轮':
                    return '#svg-ele-keyboardScroll';
                case 'moveUp':
                    return '#svg-ele-keyboardMoveUp';
                case 'moveDown':
                    return '#svg-ele-keyboardMoveDown';
                case 'moveLeft':
                    return '#svg-ele-keyboardMoveLeft';
                case 'moveRight':
                    return '#svg-ele-keyboardMoveRight';
                default:
                    return false;
            }
            /* if (value == '左键' || value == '左键拖拉') {
               return "#svg-ele-keyboardLeft"
               } else if (value == '滚轮') {
               return "#svg-ele-keyboardScroll"
               } else if (value == '滚轮') {
               return "#svg-ele-keyboardScroll"
               } else {
               return false
               } */
        },
        keyboardShow() {
            this.isShow = !this.isShow;
        },
        chooseKeyboardType(value) {
            if (value === '绘制') {
                this.$store.commit('msg/hideManipulatetipOnce', 'isShowShapeTip');
            }
            this.keyboardType = value;
            Ktu.log('shortcuts', 'change');
        },
        dealIcon(value) {
            return `#${value}`;
        },
    },
});
