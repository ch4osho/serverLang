Vue.component('consult-menu', {
    template: `
    <div class="popup-menu" style="position:relative;" ref="menu">
        <btn icon="svg-nav-more" class="nav-btn-more" @click="show($event,'navMoreClick')" ref="menu">更多</btn>
        <!--
        <div v-touch-ripple class="consult-menu" :class="{active:isShow}" @click="show($event)" ref="menu">
            <svg class="nav-icon menu-icon">
                <use xlink:href="#svg-consult-icon" class="nav-icon-use"></use>
            </svg>
            <div class="consult-text">咨询</div>
        </div>
        -->
        <transition name="slide-up">
            <div v-if="isShow" ref="popup" class="menu-popup consult-menu-popup">
                <div class="line" @click="showDownloadModal" v-if="isFromThirdDesigner&&!(isFromThirdDesigner&&!isFromCustomization&&isUIManageForWhite)">
                    <svg class="nav-icon">
                        <use class="nav-icon-use" xlink:href="#svg-nav-download"></use>
                    </svg>
                    <div class="line-des">下载</div>
                </div>
                <div class="line" @click="share" v-if="!isFromThirdDesigner">
                    <svg class="nav-icon">
                        <use class="nav-icon-use" xlink:href="#svg-nav-share"></use>
                    </svg>
                    <div class="line-des">{{isUserB?'转发':'分享'}}</div>
                </div>
                <div class="grayLine" v-if="!isFromThirdDesigner||(isFromThirdDesigner&&!(isFromThirdDesigner&&!isFromCustomization&&isUIManageForWhite))"></div>
                <div class="line" @click="consult">
                    <svg class="nav-icon">
                        <use class="nav-icon-use" xlink:href="#svg-online-icon"></use>
                    </svg>
                    <div class="line-des">在线咨询</div>
                </div>
                <a href="http://www.fkw.com/feedback/feedback.html?t=1&p=7" target="_blank" class="line">
                    <svg class="nav-icon">
                        <use class="nav-icon-use" xlink:href="#svg-feature-icon"></use>
                    </svg>
                    <div class="line-des">功能建议</div>
                </a>
                <a href="https://kt.fkw.com/news~901.html" @click="functionUpdateLog" v-if="!(isFromThirdDesigner&&isFromCustomization)" target="_blank" class="line">
                    <svg class="nav-icon">
                        <use class="nav-icon-use" xlink:href="#svg-nav-update"></use>
                    </svg>
                    <div class="line-des">功能更新</div>
                </a>
                <a href="https://kt.fkw.com/news/18035" target="_blank" class="line">
                    <svg class="nav-icon">
                        <use class="nav-icon-use" xlink:href="#svg-copyright-icon"></use>
                    </svg>
                    <div class="line-des">版权答疑</div>
                </a>
                <div v-if="isFromDesignService">
                    <div class="split"></div>
                    <div class="line" @click="quit" >
                        <svg class="nav-icon">
                            <use class="nav-icon-use" xlink:href="#svg-nav-close"></use>
                        </svg>
                        <div class="line-des">关闭</div>
                    </div>
                </div>
            </div>
        </transition>
    </div>`,
    mixins: [Ktu.mixins.popupCtrl, Ktu.mixins.dataHandler],
    props: {
        isFromDesignService: Boolean,
    },
    data() {
        return {
            isShowMask: true,
        };
    },
    computed: {
        isModalClose() {
            return this.$store.state.base.modalClose;
        },
        isFromThirdDesigner() {
            return Ktu.isFromThirdDesigner;
        },
        isFromCustomization() {
            return Ktu.isFromCustomization;
        },
        isThirdDesigner() {
            return Ktu.isThirdDesigner;
        },
        isUserB() {
            return Ktu._isUserB;
        },
        isUIManageForWhite() {
            return Ktu.isUIManageForWhite;
        },
    },
    watch: {
        isModalClose(value) {
            if (value) {
                this.isShow = false;
            }
        },
    },
    methods: {
        share() {
            this.isShow = false;
            this.$store.commit('base/maskState', false);
            this.$emit('share');
        },
        quit() {
            this.$emit('quit');
        },
        consult() {
            Ktu.log('consult', 'online');
            this.consultTimer && window.clearTimeout(this.consultTimer);
            this.consultTimer = window.setTimeout(() => {
                this.isShow = false;
                this.$store.commit('base/maskState', false);
            }, 400);
            this.$store.commit('modal/consultModalState', true);
        },
        functionUpdateLog() {
            Ktu.log('functionUpdate');
        },
        feature() {
            Ktu.log('consult', 'feature');
            window.open('http://www.fkw.com/feedback/feedback.html?t=1&p=7');
        },
        showDownloadModal() {
            this.isShow = false;
            this.$store.commit('base/maskState', false);
            // 未保存要先保存 要等保存完毕后才打开弹窗
            Ktu.template.saveCurrentPage(true).then(() => {
                this.$store.commit('modal/downloadModalState', true);
            });
        },
    },
});
