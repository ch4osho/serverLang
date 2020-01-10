Vue.component('user-guide-modal', {
    template: `<div class="user-guide-modal">
                    <div class="user-guide-mask"></div>
                    <div class="user-guide-container">
                        <div class="user-guide-page step1" v-show="step === 1">
                            <div class="content-modal">
                                <img :src="useImage('material')" draggable="false"/>
                            </div>
                            <div class="tip-modal">
                                <div class="tip-wrapper">
                                    <div class="closeBtn" @click="closeModal">
                                        <slot name="close">
                                            <icon type="ios-close-empty" class="ktu-icon-ios-close-empty"></icon>
                                        </slot>
                                    </div>
                                    <div class="tip-icon">
                                        <img :src="useImage('addMaterial')" draggable="false"/>
                                    </div>
                                    <div class="tip-tittle">
                                        <p>从这里添加素材</p>
                                    </div>
                                    <ul class="tip-point">
                                        <li class="point-item" v-for="item in pointList">
                                            <span :class="{'active': item === step}"></span>
                                        </li>
                                    </ul>
                                    <div class="btn-wrapper">
                                        <div v-touch-ripple class="nextStep stepBtn" @click="nextStep">下一步</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="user-guide-page step2" v-show="step === 2">
                            <div class="content-modal" :class="{'isMultiPage': isMultiPage}">
                                <img v-if="isMultiPage" :src="useImage('canvas_multiPage')" draggable="false"/>
                                <img v-else :src="useImage('canvas')" draggable="false"/>
                            </div>
                            <div class="tip-modal">
                                <div class="tip-wrapper">
                                    <div class="closeBtn" @click="closeModal">
                                        <slot name="close">
                                            <icon type="ios-close-empty" class="ktu-icon-ios-close-empty"></icon>
                                        </slot>
                                    </div>
                                    <div class="tip-icon">
                                        <img :src="useImage('canvasEdit')" draggable="false"/>
                                    </div>
                                    <div class="tip-tittle">
                                        <p>在画布上编辑您的素材</p>
                                    </div>
                                    <ul class="tip-point">
                                        <li class="point-item" v-for="item in pointList">
                                            <span :class="{'active': item === step}"></span>
                                        </li>
                                    </ul>
                                    <div class="btn-wrapper">
                                        <div v-touch-ripple class="lastStep stepBtn" @click="lastStep">上一步</div>
                                        <div v-touch-ripple class="nextStep stepBtn" @click="nextStep">下一步</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <transition name="slide-left">
                            <div class="user-guide-page step3" v-if="step === 3">
                                <div class="content-modal">
                                    <img :src="useImage('keyBoard')" draggable="false"/>
                                </div>
                                <div class="tip-modal" v-if="showModal">
                                    <div class="tip-wrapper">
                                        <div class="closeBtn" @click="closeModal">
                                            <slot name="close">
                                                <icon type="ios-close-empty" class="ktu-icon-ios-close-empty"></icon>
                                            </slot>
                                        </div>
                                        <div class="tip-icon">
                                            <img :src="useImage('keyBoardIcon')" draggable="false"/>
                                        </div>
                                        <div class="tip-tittle">
                                            <p>快捷键能帮您更快完成设计</p>
                                        </div>
                                        <ul class="tip-point">
                                            <li class="point-item" v-for="item in pointList">
                                                <span :class="{'active': item === step}"></span>
                                            </li>
                                        </ul>
                                        <div class="btn-wrapper">
                                            <div v-touch-ripple class="lastStep stepBtn" @click="lastStep">上一步</div>
                                            <div v-touch-ripple class="nextStep stepBtn" @click="nextStep">下一步</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </transition>
                        <div class="user-guide-page step4" v-if="step === 4">
                            <div class="content-modal" :class="{'isMultiPage': isMultiPage}">
                                <img v-if="isMultiPage" :src="useImage('page_multiPage')" draggable="false"/>
                                <img v-else :src="useImage('page')" draggable="false"/>
                            </div>
                            <div class="tip-modal" :class="{'isMultiPage': isMultiPage}">
                                <div class="tip-wrapper">
                                    <div class="closeBtn" @click="closeModal">
                                        <slot name="close">
                                            <icon type="ios-close-empty" class="ktu-icon-ios-close-empty"></icon>
                                        </slot>
                                    </div>
                                    <div class="tip-icon">
                                        <img :src="useImage('pageBtn')" draggable="false"/>
                                    </div>
                                    <div class="tip-tittle">
                                        <p v-if="isMultiPage">管理页面和图层</p>
                                        <p v-else>点击展开管理页和图层</p>
                                    </div>
                                    <ul class="tip-point">
                                        <li class="point-item" v-for="item in pointList">
                                            <span :class="{'active': item === step}"></span>
                                        </li>
                                    </ul>
                                    <div class="btn-wrapper">
                                        <div v-touch-ripple class="lastStep stepBtn" @click="lastStep">上一步</div>
                                        <div v-touch-ripple class="nextStep stepBtn" @click="nextStep">下一步</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="user-guide-page step5" :class="{'leftMove': !isFromThirdDesigner}" v-if="step === 5">
                            <div class="content-modal">
                                <img :src="useImage('download')" draggable="false"/>
                            </div>
                            <div class="tip-modal">
                                <div class="tip-wrapper">
                                    <div class="closeBtn" @click="closeModal">
                                        <slot name="close">
                                            <icon type="ios-close-empty" class="ktu-icon-ios-close-empty"></icon>
                                        </slot>
                                    </div>
                                    <div class="tip-icon">
                                        <img :src="useImage('downloadIcon')" draggable="false"/>
                                    </div>
                                    <div class="tip-tittle">
                                        <p>点击下载图片到本地</p>
                                    </div>
                                    <ul class="tip-point">
                                        <li class="point-item" v-for="item in pointList">
                                            <span :class="{'active': item === step}"></span>
                                        </li>
                                    </ul>
                                    <div class="btn-wrapper">
                                        <div v-touch-ripple class="lastStep stepBtn" @click="lastStep">上一步</div>
                                        <div v-touch-ripple class="nextStep stepBtn" @click="starDesign">开始设计</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`,
    data() {
        return {
            step: 1,
            // noFlyerImg: Ktu.initialData.resRoot + '/image/editor/qrCode/noFlyer.jpg',
            resRoot: Ktu.initialData.resRoot,
            pointList: [1, 2, 3, 4, 5],
            showModal: false,
        };
    },
    computed: {
        isMultiPage() {
            if (Ktu.ktuData.tmpContents.length > 1) {
                return true;
            }
            return false;
        },
        isFromThirdDesigner() {
            return Ktu.isFromThirdDesigner;
        },
    },
    methods: {
        useImage(src) {
            return `${this.resRoot}/image/editor/userGuide/${src}.png`;
        },
        closeModal() {
            this.$emit('closeGuide');
        },
        lastStep() {
            this.step--;
            if (this.step === 3) {
                setTimeout(() => {
                    this.showModal = true;
                }, 300);
            } else {
                this.showModal = false;
            }
        },
        nextStep() {
            this.step++;
            if (this.step === 3) {
                setTimeout(() => {
                    this.showModal = true;
                }, 300);
            } else {
                this.showModal = false;
            }
        },
        starDesign() {
            this.closeModal();
        },
    },

});
