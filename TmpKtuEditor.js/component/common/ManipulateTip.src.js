Vue.component('manipulatetip', {
    template: `
        <transition :name="isShowShapeTip || isShowLineTip || isShowTextTip?'move-left':'move-right'">
            <div v-if="isShowDrapTip || isShowScrollTip || isShowShapeTip || isShowLineTip || isShowTextTip " id="manipulateTip" :class="['manipulate-tip',isShowShapeTip || isShowLineTip || isShowTextTip?'manipulate-tip-left':'']">
                <div v-if="isShowDrapTip" class="manipulate-info manipulate-info-drap">
                    <div class="left">
                        <div class="tip-image">
                            <span class="keyEnter"></span>
                            <span class="add"></span>
                            <span class="mouseLeft"></span>
                        </div>
                        <div class="tip-text"><div class="tip-text-box">使用<span class="highlight">空格键</span>和<span class="highlight">鼠标左键</span>拖拽画布</div></div>
                    </div>
                    <div class="right">
                        <div class="rightBtn iknow-btn" @click="closeDrap">好的</div>
                    </div>
                </div>
                <div v-if="isShowScrollTip" class="manipulate-info manipulate-info-scroll">
                    <div class="left">
                        <div class="tip-image">
                            <span class="keyEnter"></span>
                            <span class="add"></span>
                            <span class="mouseCenter"></span>
                        </div>
                        <div class="tip-text"><div class="tip-text-box">使用<span class="highlight">空格键</span>和<span class="highlight">鼠标滚轮</span>调整画布大小</div></div>
                    </div>
                    <div class="right">
                        <div class="rightBtn iknow-btn" @click="closeScroll">好的</div>
                    </div>
                </div>
                <div v-if="isShowShapeTip" class="manipulate-info manipulate-info-shape">
                    <div class="left">
                        <div class="tip-image">
                            <span class="keyBoard"></span>
                            <span class="add"></span>
                            <span class="mouse"></span>
                        </div>
                        <div class="tip-text"><div class="tip-text-box">可使用<span class="highlight">快捷键组合</span>快速绘制图形</div></div>
                    </div>
                    <div class="right">
                        <div class="rightBtn double-btn" @click="showShapeModal">查看</div>
                        <div class="rightBtn double-btn" @click="closeShape">好的</div>
                    </div>
                </div>

                <div v-if="isShowLineTip" class="manipulate-info manipulate-info-line">
                    <div class="left">
                        <div class="tip-image">
                            <span class="keyL"></span>
                            <span class="add"></span>
                            <span class="mouseLeft"></span>
                        </div>
                        <div class="tip-text"><div class="tip-text-box">可按<span class="highlight">L键</span>与<span class="highlight">鼠标左键</span>拖拉出线条</div></div>
                    </div>
                    <div class="right">
                        <div class="rightBtn iknow-btn" @click="closeLine">好的</div>
                    </div>
                </div>


                <div v-if="isShowTextTip" class="manipulate-info manipulate-info-text">
                    <div class="left">
                        <div class="tip-image">
                            <span class="keyT"></span>
                            <span class="add"></span>
                            <span class="mouseLeft"></span>
                        </div>
                        <div class="tip-text"><div class="tip-text-box">可按<span class="highlight">T键</span>与<span class="highlight">鼠标左键</span>拖拉出文本框</div></div>
                    </div>
                    <div class="right">
                        <div class="rightBtn iknow-btn" @click="closeText">好的</div>
                    </div>
                </div>
            </div>
        </transition>
    `,
    name: 'manipulate-tip',
    props: {
        value: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {

        };
    },
    computed: {
        // 获取显示拖动的提示
        isShowDrapTip() {
            return this.$store.state.msg.isShowDrapTip ;
        },
        // 获取显示缩放的提示
        isShowScrollTip() {
            return this.$store.state.msg.isShowScrollTip;
        },
        // 获取显示形状的提示
        isShowShapeTip() {
            return this.$store.state.msg.isShowShapeTip;
        },
        // 获取显示线条的提示
        isShowLineTip() {
            return this.$store.state.msg.isShowLineTip;
        },
        // 获取显示文本的提示
        isShowTextTip() {
            return this.$store.state.msg.isShowTextTip;
        },
    },
    methods: {
        closeDrap() {
            this.$store.commit('msg/hideManipulatetip', 'isShowDrapTip');
        },

        closeScroll() {
            this.$store.commit('msg/hideManipulatetip', 'isShowScrollTip');
        },
        // 关闭形状提示
        closeShape() {
            this.$store.commit('msg/hideManipulatetip', 'isShowShapeTip');
        },
        // 显示查看
        showShapeModal() {
            this.$store.commit('msg/hideManipulatetip', 'isShowShapeTip');
            this.$store.commit('base/changeState', {
                prop: 'isShowDrawKeyboard',
                value: true,
            });
        },
        // 关闭线条提示
        closeLine() {
            this.$store.commit('msg/hideManipulatetip', 'isShowLineTip');
        },
        // 关闭文本提示
        closeText() {
            this.$store.commit('msg/hideManipulatetip', 'isShowTextTip');
        },

    },
});
