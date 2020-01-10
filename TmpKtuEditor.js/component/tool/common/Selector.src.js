Vue.component('selector', {
    template: `
    <div class="selector">
        <div class="selector-btn" :class="{opened: isShow}" @click="show">
            <div class="selector-value selector-value-label" v-if="type === 'label'">{{currentSelected}}</div>

            <div class="selector-value selector-value-icon" v-if="type === 'pic'">
                <svg class="selector-value-icon-svg" :style="{width: iconConf.width, height: iconConf.height}">
                    <use :xlink:href="'#svg-'+currentSelected"></use>
                </svg>
            </div>

            <div class="selector-btn-arrow">
                <svg class="selector-btn-arrow-svg">
                    <use xlink:href="#svg-tool-arrow"></use>
                </svg>
            </div>
        </div>

        <transition :name="transitionName">
            <ul v-if="isShow" class="selector-option-list" :class="{'reverseX': isNeedReverseX, 'reverseY': isNeedReverseY}">
                <template v-if="type === 'label'">
                    <li class="selector-option" :class="{selected: option.value === value}" v-for="(option, index) in options" :key="index" @click="select(option)">{{option.label}}</li>
                </template>
                <template v-if="type === 'pic'">
                    <li class="selector-option" :class="{selected: option.value === value}" v-for="(option,index) in options" :key="index" @click="select(option)">
                        <svg class="selector-option-icon" :style="{width: iconConf.width, height: iconConf.height}">
                            <use :xlink:href="'#svg-'+option.pic"></use>
                        </svg>
                    </li>
                </template>
            </ul>
        </transition>

    </div>
    `,
    mixins: [Ktu.mixins.popupCtrl],
    props: {
        options: Array,
        value: [String, Number],
        type: String,
        iconConf: {
            type: Object,
            default: {},
        },
    },
    data() {
        return {
            popUpWidth: 66,
            popUpHeight: 240,
        };
    },
    computed: {
        currentSelected() {
            let currentSelected = '';
            this.options.some(option => {
                if (option.value === this.value) {
                    currentSelected = option[this.type];
                    return true;
                }
                return false;
            });
            return currentSelected;
        },
    },
    methods: {
        select(option) {
            this.$emit('input', option);
        },
    },
});
