Vue.component('collectnps-modal-box', {
    template: `
    <Modal class="manageModal collectnps-modal" :width="width" :closable="false" :mask-closable="false" class-name="collectNPSModalBody" v-model="showCollectNPSModal">
        <div class="collectnps-modal-window">
            <div v-if="modalState === 'normal'">
                <svg class="svg-icon" @click="close($event,false)">
                    <use xlink:href="#collect-modal-close"></use>
                </svg>
                <div class="collect-body">
                    <p class="title">您愿意向朋友们推荐凡科快图吗？</p>
                    <ul class="scoreList">
                        <li class="scoreItem" v-for="count in scoreList" :key="count">
                            <div class="scoreImg"  :style="getStyle(count)" @click="chooseItem(count)" @mouseenter="hoverItem(count)" @mouseleave="leaveItem"></div>
                            <span>{{count}}</span>
                            <p v-if="count === 0">非常不愿意</p>
                            <p v-else-if="count === 10">非常愿意</p>
                        </li>
                    </ul>
                    <span @click="close($event,true)" ref="prompt">不再提示</span>
                    <div :style="{height:modalBodyHeight + 'px'}">
                        <div class="advancedSetting" v-show="selectedItem >= 0">
                            <textarea maxlength="900" v-model="suggestion" placeholder="[选填]感谢您的评分，您觉得我们哪里还需要改善呢？"></textarea>
                            <input class="" type="text" v-model="contact" maxlength="100" placeholder="[选填]希望您能留下联系方式（QQ/微信/手机号）" />
                            <div class="commit" @click="commit">提交评价</div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else>
                <img class="commitSuccessImg" src="data:image/png;base64,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"></img>
                <p class="commitSuccText">提交成功</p>
                <p class="thankText">感谢您的评价与反馈</p>
            </div>
        </div>
    </Modal>
    `,
    name: 'collectNPSModal',
    data() {
        return {
            scoreList: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            selectedItem: -1,
            currentHoverItem: null,
            resRoot: Ktu.initialData.resRoot,
            modalBodyHeight: 0,
            contact: '',
            suggestion: '',
            modalState: 'normal',
            width: 608,
        };
    },
    computed: {
        showCollectNPSModal: {
            get() {
                return this.$store.state.modal.showCollectNPSModal;
            },
            set(newValue) {
                this.$store.commit('modal/collectNPSModalState', newValue);
            },
        },
    },
    mounted() {
        Ktu.log('collectNPSModalShow');
    },
    methods: {
        getStyle(count) {
            let xPosition = `${count * -46}px`;
            let yPosition = 0;
            if (count === this.selectedItem) {
                yPosition = '42px';
            } else if (count === this.currentHoverItem) {
                yPosition = '90px';
            }
            return `backgroundImage: url(${this.resRoot}/image/editor/nps.png);backgroundPosition:${xPosition} ${yPosition}`;
        },
        chooseItem(count) {
            this.selectedItem = count;
            this.modalBodyHeight = 256;
            this.$refs.prompt.style.display = 'none';
        },
        hoverItem(count) {
            this.currentHoverItem = count;
        },
        leaveItem() {
            this.currentHoverItem = null;
        },
        close(e, isClickPrompt) {
            if (isClickPrompt) {
                Ktu.simpleLog('npsOperator', 'clickPrompt');
                $.cookie('isNotShowNPSModal', true, {
                    expires: 365,
                    path: '/',
                });
            } else {
                $.cookie('isNotShowNPSModal', true, {
                    expiresOnZero: 1,
                    path: '/',
                });
            }
            this.showCollectNPSModal = false;
        },
        commit() {
            Ktu.simpleLog('npsOperator', 'commit');
            const src = '/ajax/ktuSurvey_h.jsp?cmd=addSurvey';
            axios.post(src, {
                score: this.selectedItem,
                content: this.suggestion,
                contact: this.contact,
            }).then(res => {
                const result = res.data;
                if (result.success) {
                    this.modalState = 'success';
                    this.width = 420;
                }
            })
                .catch(err => {
                    console.log(err);
                });
            setTimeout(() => {
                this.close();
            }, 1500);
        },
    },
});

