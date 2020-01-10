Vue.component('zoom-tool', {
    template: `<div class="zoom-tool">
                <div v-touch-ripple class="edit-scale-minus edit-scale-box" @click="clickZoom('minus')"  @mouseenter="mouseenter('minus')" @mouseleave="mouseleave('minus')">
                    <svg class="edit-scale-icon">
                        <use xlink:href="#svg-edit-minus"></use>
                    </svg>
                    <div class="tip" v-show="minus">缩小画布</div>
                </div>
                <div v-touch-ripple class="edit-scale-percent edit-scale-box" @click="showPopUp">{{zoom}}
                    <transition name="slide-down">
                        <div v-if="isShow" ref="popup" class="zoom-tool-popup">
                            <div class="zoom-content">
                                <ul class="zoom-option-list">
                                    <li class="zoom-list-option" :class="{selected: option.value === currentZoom}" v-for="(option, index) in zoomOptions" :key="index" @click.stop="selectZoom(option)">{{option.label}}</li>
                                </ul>
                            </div>
                        </div>
                    </transition>
                </div>
                <div v-touch-ripple class="edit-scale-plus edit-scale-box" @click="clickZoom('plus')" @mouseenter="mouseenter('plus')" @mouseleave="mouseleave('plus')">
                    <svg class="edit-scale-icon">
                        <use xlink:href="#svg-edit-plus"></use>
                    </svg>
                    <div class="tip" v-show="plus">放大画布</div>
                </div>
    </div>`,
    mixins: [Ktu.mixins.popupCtrl],
    data() {
        return {
            minus: false,
            plus: false,
            selectedLabel: '',
        };
    },
    computed: {
        zoom() {
            return `${Math.round(this.$store.state.data.scale * 100)}%`;
        },

        fitZoom() {
            return Math.round(Ktu.edit.fitZoom * 100) / 100;
        },

        currentZoom() {
            return Math.round(this.$store.state.data.scale * 100) / 100;
        },

        zoomOptions() {
            return [
                {
                    id: 0,
                    label: '300%',
                    value: 3,
                },
                {
                    id: 1,
                    label: '200%',
                    value: 2,
                },
                {
                    id: 2,
                    label: '150%',
                    value: 1.5,
                },
                {
                    id: 3,
                    label: '100%',
                    value: 1,
                },
                {
                    id: 4,
                    label: '50%',
                    value: 0.5,
                },
                {
                    id: 5,
                    label: '最佳视图',
                    value: this.fitZoom,
                },
            ];
        },
    },
    methods: {
        mouseenter(tipType) {
            this[tipType] = true;
        },

        mouseleave(tipType) {
            this[tipType] = false;
        },

        clickZoom(type) {
            if (type === 'plus') {
                Ktu.edit.zoomIn();
                this.$store.commit('msg/showManipulatetip', 'isShowScrollTip');
                Ktu.log('tool', 'plus');
            } else if (type === 'minus') {
                Ktu.edit.zoomOut();
                this.$store.commit('msg/showManipulatetip', 'isShowScrollTip');
                Ktu.log('tool', 'minus');
            }
            this.selectedLabel = '';
        },

        selectZoom(option) {
            this.selectedLabel = option.label;

            switch (option.id) {
                case 5:
                    Ktu.edit.zoomFit();
                    break;
                default:
                    Ktu.edit.selectZoom(option.value);
                    break;
            }
        },

        showPopUp(event) {
            this.$store.commit('msg/showManipulatetip', 'isShowScrollTip');
            this.show(event);
        },

    },
});
