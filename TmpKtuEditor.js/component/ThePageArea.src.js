Vue.component('page-area', {
    template: `<aside class="page-area" :class="{open: isShowPage}" :style="{width: pageWidth+'px'}">
                    <div class="page-area-switch" @click="switchPage">
                        <svg class="ele-area-switch-iconBg">
                            <use xlink:href="#svg-ele-shrinkBg"></use>
                        </svg>
                        <svg class="ele-area-switch-icon">
                            <use xlink:href="#svg-ele-shrink"></use>
                        </svg>
                    </div>

                    <div class="page-tab-list">
                        <div class="page-area-label" :class="{active : pageAreaType==0}" @click="switchList(0)">
                            <span>页面</span>
                        </div>
                        <div class="page-area-label" :class="{active : pageAreaType==1}" @click="switchList(1)">
                            <span>图层</span>
                        </div>
                    </div>

                    <div v-if="pageAreaType==0" class="page-area-container">

                        <div class="pages" ref="pages">
                            <draggable class="ele-pages-slide" :options="{animation: 200}"  @end="dragEnd">
                                <transition-group :name="pageTransitionName" tag="div">
                                    <div class="page-area-single" @click="jumptoPage(page.id, index)"  v-for="(page,index) in pageList" :key="page.id" :class="{selected: currentpageId === page.id}">
                                        <div class="page-area-card" :style="{'background-color' : page.themeColor}">
                                            <div class="page-area-special" v-if="isSpecialTemplate">
                                                <img class="page-area-image" :src="page.tmpFilePath" :style="{width: picWH.width, height: picWH.height, transform: 'translateY(' + page.translateY + 'px)'}">
                                                <div class="page-area-up" @mouseenter="translateTop(pageList, index)" @mouseout="destroyTranslateTop"></div>
                                                <div class="page-area-down" @mouseenter="translateBottom(pageList, index)" @mouseout="destroyTranslateBottom"></div>
                                            </div>
                                            <div class="page-area-normal" v-else>
                                                <img class="page-area-image" :src="page.tmpFilePath" :style="{width: picWH.width, height: picWH.height}">
                                            </div>

                                            <div class="page-area-index" v-if="!isGifTemplate">
                                                <svg class="page-area-index-bg">
                                                    <use xlink:href="#svg-page-bg"></use>
                                                </svg>
                                                <svg class="page-area-index-icon">
                                                    <use xlink:href="#svg-page-arc"></use>
                                                </svg>
                                                <div class="page-area-index-num">{{index+1}}</div>
                                            </div>
                                            <template v-if="!isGifTemplate">
                                                <div class="page-area-remove page-area-operate" @click.stop="removePage(page.id, index,pageList)" title="删除">
                                                    <svg class="page-area-operate-svg">
                                                        <use xlink:href="#svg-ele-remove"></use>
                                                    </svg>
                                                </div>
                                                <div class="page-area-copy page-area-operate" @click.stop="copyPage(page.id)" title="复制">
                                                    <svg class="page-area-operate-svg">
                                                        <use xlink:href="#svg-contextmenu-copy"></use>
                                                    </svg>
                                                </div>
                                            </template>
                                        </div>
                                    </div>

                                </transition-group>
                            </draggable>
                        </div>

                        <div class="page-area-add" @click="addNewPage" v-if="!isGifTemplate">
                            <svg class="page-area-add-icon">
                                <use xlink:href="#svg-ele-add"></use>
                            </svg>
                        </div>
                    </div>

                    <ele-component v-if="pageAreaType==1"></ele-component>
                </aside>`,

    mixins: [Ktu.mixins.TemplateAnimation],
    data() {
        return {
            pageWidth: Ktu.config.page.width,
            picWH: {},
            pageList: Ktu.ktuData.tmpContents,
            pageTransitionName: '',
            pageAreaType: 0,
            isHideOperation: false,
        };
    },
    computed: {
        isShowPage: {
            get() {
                return this.$store.state.base.isShowPage;
            },
            set(value) {
                this.$store.commit('base/changeState', {
                    prop: 'isShowPage',
                    value,
                });
            },
        },
        currentpageId() {
            return this.$store.state.data.currentpageId;
        },
        thumbWidth() {
            return Ktu.ktuData.other.width;
        },

        thumbHeight() {
            return Ktu.ktuData.other.height;
        },

        pageType() {
            return this.$store.state.base.templateType;
        },

        isGifTemplate() {
            return this.$store.state.base.isGifTemplate;
        },

        isSpecialTemplate() {
            if ([0, 112, 205].indexOf(this.pageType) >= 0) {
                // this.pageType === 0
                return this.thumbWidth / this.thumbHeight < 0.4;
            }
            return this.specialTemplates.includes(this.pageType);
        },
        maxTranslateY() {
            return 300 - parseFloat(this.picWH.height);
        },
    },
    watch: {

        thumbWidth() {
            this.calcPageSize();
        },

        thumbHeight() {
            this.calcPageSize();
        },

        pageList() {
            // 做动画数据处理
            this.initTranslateY();
        },

        pageType() {
            // 做动画数据处理
            this.initTranslateY();

            this.isHideOperation = this.getIsHideOperation();
        },
    },

    mounted() {
        this.calcPageSize();

        this.pageAreaType = Ktu.ktuData.content.length == 1 ? 1 : 0;

        // 做动画数据处理
        this.initTranslateY();

        this.isHideOperation = this.getIsHideOperation();
    },
    methods: {
        getIsHideOperation() {
            return !!(Ktu.ktuData.type && /^3[0-9]{2}/.test(Ktu.ktuData.type) && Ktu.ktuData.other.page > 1);
        },
        switchPage() {
            this.isShowPage = !this.isShowPage;

            Ktu.edit.refreshEdit(this.isShowPage);

            Ktu.log('aside', this.isShowPage ? 'openRight' : 'closeRight');
        },
        dragEnd(data) {
            Ktu.template.dragEnd(data);
        },
        addNewPage() {
            this.pageTransitionName = 'page-add';
            Ktu.template.addBlankPage();
            Ktu.log('page', 'add');
        },
        jumptoPage(id) {
            if (Ktu.template.currentpageId != id) {
                Ktu.template.currentpageId = id;
            }
        },
        copyPage(id) {
            this.pageTransitionName = 'page-add';
            Ktu.template.copyPage(id);
            Ktu.log('page', 'copy');
        },
        removePage(id) {
            this.pageTransitionName = 'page-remove';
            if (Ktu.ktuData.content.length > 1) {
                this.$Modal.confirm({
                    content: '将删除该页面所有内容，是否继续？',
                    okBtnType: 'warn',
                    onOk() {
                        Ktu.template.deletePage(id);
                        Ktu.log('page', 'remove');
                    },
                });
            } else {
                this.$Notice.warning('最后一页不能删除哟！');
            }
        },
        calcPageSize() {
            if (this.pageAreaType == 0) {
                // const maxWidth = Math.round(this.$refs.pages.offsetWidth); 这个莫名计算错误成145，可能是calc的问题，所以直接固定为148px
                const maxWidth = 148;
                const radio = maxWidth / Ktu.ktuData.other.width;
                const height = Math.round(Ktu.ktuData.other.height * radio);

                this.picWH = {
                    width: `${maxWidth}px`,
                    height: `${height}px`,
                };
            }
        },

        switchList(type) {
            this.pageAreaType = type;
            Ktu.log('pageArea', type === 0 ? 'page' : 'level');
            setTimeout(() => {
                this.calcPageSize();
            }, 100);
        },

        // 初始化特殊模板的右侧动画
        initTranslateY() {
            if (this.isSpecialTemplate) {
                this.pageList.forEach(item => {
                    if (!item.translateY) {
                        Vue.set(item, 'translateY', 0);
                    }
                });
            }
        },
    },
});
