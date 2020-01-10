Vue.component('tool-table-drop-menu', {
    template: `
        <div class="tool-box tool-table-drop-menu">
            <tool-btn :class="{opened: isShow}" tips="tips" @click="show($event)">{{title}}</tool-btn>

            <transition :name="transitionName">
                <div v-if="isShow"
                    :class="[direction, {'reverseX': isNeedReverseX, 'reverseY': isNeedReverseY}]"
                    class="drop-menu-popup"
                    :style="dropMenuStyle">
                    <div class="drop-menu-options" ref="options" :style="dropStyle">
                        <ul class="drop-menu-list">
                            <li class="drop-menu-option" v-for="option in optionList"  @click="selectOption(option)" :class="{'disabled': option.disabled}">
                                <svg v-if="option.icon" class="drop-menu-icon">
                                    <use :xlink:href="'#svg-'+option.icon"></use>
                                </svg>
                                <svg v-if="option.pic" class="drop-menu-pic">
                                    <use :xlink:href="'#svg-'+option.pic"></use>
                                </svg>
                                <label v-else class="drop-menu-label">{{option.label}}</label>
                            </li>
                        </ul>
                    </div>
                </div>
            </transition>
        </div>
    `,
    mixins: [Ktu.mixins.popupCtrl],
    props: {
        tips: String,

        menuWidth: {
            type: String,
            default: '150px',
        },

        menuHeight: {
            type: String,
            default: '114px',
        },

        list: {
            type: Array,
        },

        title: String,

        direction: {
            type: String,
            default: 'left',
        },
    },
    data() {
        return {
            dropStyle: {},
        };
    },
    computed: {
        optionList() {
            return this.list ? this.list : [];
        },

        dropMenuStyle() {
            return {
                width: this.menuWidth,
            };
        },
    },
    methods: {
        selectOption(option) {
            if (!option.disabled) {
                this.$emit('input', option.value);
            }
        },
    },
});
