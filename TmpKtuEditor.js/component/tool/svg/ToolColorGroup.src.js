Vue.component('tool-color-group', {
    template: `<div class="tool-color-group">
                    <tool-btn icon="gcolor" tips="更多颜色" @click="show" :class="{opened: isShow}"></tool-btn>
                    <transition :name="transitionName">
                        <div v-if="isShow" ref="popup" class="tool-popup tool-color-group-popup" :class="{'reverseX': isNeedReverseX, 'reverseY': isNeedReverseY }">
                            <color-picker v-for="(color, index) in colorList" :key="index" v-model="color.value" @change="changeColor(color)"></color-picker>
                        </div>
                    </transition>
                </div>`,
    mixins: [Ktu.mixins.popupCtrl],
    props: {
        colorList: Array,
    },
    data() {
        return {
        };
    },
    watch: {
    },
    computed: {
    },
    methods: {
        changeColor(color) {
            this.$emit('change', color);
        },
    },
});
