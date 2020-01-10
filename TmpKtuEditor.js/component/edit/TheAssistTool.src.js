Vue.component('assist-tool', {
    mixins: [Ktu.mixins.popupCtrl],
    template: `  <div class="assist-tool">
                    <div v-touch-ripple class="assist-tool-btn edit-scale-box" @click="showAssist" :class="{opened: isShow}"  @mouseenter="mouseenter" @mouseleave="mouseleave">
                        <svg class="edit-scale-icon">
                            <use xlink:href="#svg-edit-tool"></use>
                        </svg>
                        <div class="tip" v-show="showTip">辅助工具</div>
                    </div>
                    <transition name="slide-down">
                        <div v-if="isShow" ref="popup" class="assist-tool-popup">
                            <div class="assist-tool-line clearfix">
                                <div class="tool-switch-title">标尺</div>
                                <ktu-switch v-model="openAssistLine" class="tool-switch-ctrl" @input="changeOpen"></ktu-switch>
                            </div>

                            <div class="assist-tool-line clearfix">
                                <div class="tool-switch-title">智能吸附</div>
                                <ktu-switch v-model="isAutoSnap" class="tool-switch-ctrl" @input="changeSnap"></ktu-switch>
                            </div>

                            <tool-color :title="'辅助线颜色'" class="assist-tool-color" :value="snapLineColor" @input="changeColor" :direction="'up'" @showPopUp="clickColor" v-show="showTool"></tool-color>
                            <div class="asist-tool-clear" @click="clearLine">清除参考线</div>
                        </div>
                    </transition>
                </div>
            `,
    data() {
        return {
            showTip: false,
        };
    },
    mounted() {
        // 先从localStorage获取辅助工具相关的数据，以后如果这部分存入数据库，就不需要这一步
        this.openAssistLine = !localStorage.getItem('openAssistLine') ? false : localStorage.getItem('openAssistLine') == 'true';
        this.isAutoSnap = !localStorage.getItem('isAutoSnap') ? true : localStorage.getItem('isAutoSnap') == 'true';
        this.snapLineColor = localStorage.getItem('snapLineColor') || '#fd753d';
    },
    computed: {
        showTool() {
            return !!this.$store.state.base.edit && this.$store.state.msg.openAssistLine;
        },
        openAssistLine: {
            get() {
                return this.$store.state.msg.openAssistLine;
            },
            set(val) {
                Ktu.store.commit('msg/setAssistLineOptions', {
                    prop: 'openAssistLine',
                    value: val,
                });
            },
        },
        isAutoSnap: {
            get() {
                return this.$store.state.msg.isAutoSnap;
            },
            set(val) {
                Ktu.store.commit('msg/setAssistLineOptions', {
                    prop: 'isAutoSnap',
                    value: val,
                });
            },
        },
        snapLineColor: {
            get() {
                return this.$store.state.msg.snapLineColor;
            },
            set(val) {
                Ktu.store.commit('msg/setAssistLineOptions', {
                    prop: 'snapLineColor',
                    value: val,
                });
            },
        },
        templateType() {
            return this.$store.state.base.templateType;
        },
    },
    watch: {
        templateType() {
            this.clearLine();
        },
    },
    methods: {
        mouseenter() {
            this.showTip = true;
        },
        mouseleave() {
            this.showTip = false;
        },
        showAssist() {
            this.showTip = false;
            this.show();
            Ktu.log('tool', 'assist');
        },
        changeOpen(val) {
            if (val) {
                Ktu.log('assist-tool', 'open');
            } else {
                Ktu.log('assist-tool', 'close');
            }
        },
        changeSnap() {
            Ktu.log('assist-tool', 'snap');
        },
        changeColor(color) {
            this.snapLineColor = color;
        },
        clearLine() {
            Ktu.store.commit('msg/update', {
                prop: 'assistLinesx',
                value: [],
            });
            Ktu.store.commit('msg/update', {
                prop: 'assistLinesy',
                value: [],
            });
        },
        clickColor() {
            Ktu.log('assist-tool', 'color');
        },
    },
});
