Vue.component('ele-template', {
    template: `<div class="ele-template page">
                    <div class="ele-template-container">
                        <div class="ele-template-header">
                            <div class="search-input-box">
                                <button class="input-box-back" :class="!isFirstSearch ? 'is-transform-left' : ''" @click="hideBack(true)">
                                    <span class="left-arrow">
                                        <svg class="svg-icon">
                                            <use xlink:href="#svg-left-arrow"></use>
                                        </svg>
                                    </span>
                                    <span class="input-box-text">
                                        返回
                                    </span>
                                </button>
                                <validate-input
                                    placeholder="输入关键词搜索模板"
                                    class="search-input nav-title-input"
                                    @keyup.enter.native="searchHandle(false)"
                                    @focus="focusInput"
                                    @blur="blurInput"
                                    v-model="searchVal"
                                    :inputVal="searchVal"
                                    @onInput="changeData"
                                    style="width:272px"
                                    ref="searchInput"
                                    :class="!isFirstSearch ? 'is-search-after': ''"
                                >
                                </validate-input>
                                <svg v-if="isFirstSearch || ifFocusOfInput" class="search-input-icon" @click="searchHandle(true)">
                                    <use xlink:href="#svg-ele-search-input"></use>
                                </svg>
                                <svg v-else class="search-input-icon" @click="clearHandle()">
                                    <use xlink:href="#svg-ele-search-clear"></use>
                                </svg>

                                <transition name="template-slide-up">
                                    <div class="template-history" v-show="historyList.length > 0 && ifFocusOfInput" tabindex="-1" @focus="showHistory" @blur="hideHistory">
                                        <div class="template-history-header">
                                            <span class="search-history">历史搜索</span>
                                            <span class="empty-history" @click="clearSearchHistory">清空记录</span>
                                        </div>
                                        <div class="template-history-content">
                                            <div class="history-item" v-for="(item, index) of historyList" @click="changeSearchVal(item)">
                                                {{item}}
                                            </div>
                                        </div>
                                    </div>
                                </transition>
                            </div>

                            <div class="ele-template-nav" v-if="isFirstSearch" ref="templateNav">
                                <div class="template-nav-item" :class="{'template-nav-active': activeItem === item.key}" @click="changeActiveItem(item.key)" v-for="item in tabList">{{item.type}}</div>
                                <div class="back-color" :style="{width: tabWidth + 'px', left: tabLeft + 'px'}"></div>
                            </div>

                            <!--
                                <div class="search-template-nav" v-if="!isFirstSearch">
                                    <div class="search-nav-item" :class="{'search-nav-active': searchActiveItem === item.key}" @click="changeSearchItem(item.key)" v-for="item in searchList">{{item.type}}</div>
                                </div>
                            -->
                        </div>

                        <!-- 模板列表 -->
                        <div class="ele-template-content"  @scroll="scroll" ref="container">
                            <div class="ele-template-slide" :class="{'single-slide' : singleArr.indexOf(templateType) > -1}" ref="slide">
                                <div v-if="singleArr.indexOf(templateType) > -1" class="template-box clearfix" :class="{active : activeChoose}">
                                    <div  v-for="(template, indexParent) in templateList" :key="indexParent" ref="template" class="template-block"  :class="{'normal-template-expand' : activeChoose && indexParent == activeIndex,'translateY':activeIndex < indexParent&&activeChoose}" :style="activeIndex < indexParent&&activeChoose?translateY:''">
                                        <div class="ele-template-single" :ref="'template'+template.id">
                                            <div class="normal-template" @click="clickTemplate(template,0,true,indexParent)" :style="{height : templateHight[templateType] + 'px',backgroundColor: template.themeColor}" :class="{'normal-template-active' : activeChoose && indexParent == activeIndex, 'is-long-pic':template.typeId == '206'}">
                                                <img :src="templateImg(template.coverPath)" class="ele-template-img" style="display:none;" @load="imgLoad"/>
                                                <div class="ele-template-copyright-icon"
                                                    :class="[template.source == 0 ? 'original' : template.source == 2 ? 'other' : 'thirdParty', {'active' : activeMaterial == template}]"
                                                    @click.stop
                                                    @mouseenter="hoverCopyrightBtn($event, template)"
                                                    @mouseleave="wantToCloseInfo"
                                                    v-if="activeItem != 2">
                                                        <svg class="svg-icon">
                                                            <use xlink:href="#template-version"></use>
                                                        </svg>
                                                </div>
                                                <div class="ele-template-collection-icon" @click.stop="collectItem(template)" v-if="activeItem !== 2">
                                                    <svg class="svg-icon svg-collection-have" v-if="template.isCollected">
                                                        <use xlink:href="#template-collection"></use>
                                                    </svg>
                                                    <svg class="svg-icon svg-collection-no-have" v-else>
                                                        <use xlink:href="#template-collection"></use>
                                                    </svg>
                                                </div>
                                                <div class="water-item-custom-type" v-if="activeItem === 2">定制设计</div>
                                            </div>
                                        </div>
                                        <transition name="template-slide-up">
                                            <div v-if="activeChoose && activeIndex === indexParent" class="template-content">
                                                <div class="border-line" :class="activePosition"></div>
                                                <div class="ele-template-pages" :class="{'single-slide' : singleArr.indexOf(templateType) > -1}">
                                                    <div class="template-box clearfix">
                                                        <div class="ele-template-page" v-for="(page, pageIdx) in nowTemplate.contents" :key="pageIdx" :style="{height : singleTempContHeight + 'px',backgroundColor: page.themeColor}" @click="clickTemplate(nowTemplate, pageIdx)" :data-text=" pageIdx == 0 ? '正面' : '反面' ">
                                                            <img :src="useClearTemplateImg(page)" class="ele-template-page-img"/>
                                                            <div class="ele-template-copyright-icon"
                                                                :class="[nowTemplate.source == 0 ? 'original' : nowTemplate.source == 2 ? 'other' : 'thirdParty', {'active' : activeMaterial == page}]"
                                                                @click.stop
                                                                @mouseenter="hoverCopyrightBtn($event, page)"
                                                                @mouseleave="wantToCloseInfo"
                                                                v-if="activeItem !== 2">
                                                                    <svg class="svg-icon">
                                                                        <use xlink:href="#template-version"></use>
                                                                    </svg>
                                                            </div>
                                                            <div class="ele-template-collection-icon" @click.stop="collectItem(nowTemplate)" v-if="activeItem !== 2">
                                                                <svg class="svg-icon svg-collection-have" v-if="nowTemplate.isCollected">
                                                                    <use xlink:href="#template-collection"></use>
                                                                </svg>
                                                                <svg class="svg-icon svg-collection-no-have" v-else>
                                                                    <use xlink:href="#template-collection"></use>
                                                                </svg>
                                                            </div>
                                                            <div class="water-item-custom-type" v-if="activeItem === 2">定制设计</div>
                                                        </div>
                                                    </div>
                                                    <btn class="ele-template-btn" @click="useCompleteTemplate(nowTemplate)">使用这套模板</btn>
                                                </div>
                                            </div>
                                        </transition>
                                    </div>
                                </div>

                                <div v-else class="template-box clearfix" :class="{active : activeChoose || templateSlideUpSpecial}">
                                    <div v-for="(template, indexParent) in doubleTemplateList"
                                        :key="indexParent" class="template-line"
                                        :class="{'translateY':activeIndex < indexParent&&(templateSlideUpSpecial ||activeChoose) }"
                                        :style=" activeIndex < indexParent&&(templateSlideUpSpecial ||activeChoose)?translateY:''"
                                    >
                                        <div v-for="(templateArr, indexSelf) in template"
                                            class="ele-template-single" ref="template"
                                            :style="{height : templateHight[templateType] + 'px',backgroundColor: templateArr.themeColor}"
                                        >
                                            <div class="special-template" v-if="isSpecialTemplate" :ref="'template'+templateArr.id" @click="clickTemplate(templateArr,0,true,indexParent)" :style="{height : templateHight[templateType] + 'px',backgroundColor: templateArr.themeColor}">
                                                <img :src="templateImg(templateArr.coverPath)" class="ele-template-img" :style="{'transform': 'translateY(' + templateArr.translateY + 'px)'}" style="display:none;" @load="imgLoad"/>
                                                <div class="ele-template-copyright-icon"
                                                    :class="[templateArr.source == 0 ? 'original' : templateArr.source == 2 ? 'other' : 'thirdParty', {'active' : activeMaterial == templateArr}]"
                                                    @click.stop
                                                    @mouseenter="hoverCopyrightBtn($event, templateArr)"
                                                    @mouseleave="wantToCloseInfo"
                                                    v-if="activeItem != 2">
                                                    <svg class="svg-icon">
                                                        <use xlink:href="#template-version"></use>
                                                    </svg>
                                                </div>
                                                <div class="ele-template-collection-icon" @click.stop="collectItem(templateArr)" v-if="activeItem !== 2">
                                                    <svg class="svg-icon svg-collection-have" v-if="templateArr.isCollected">
                                                        <use xlink:href="#template-collection"></use>
                                                    </svg>
                                                    <svg class="svg-icon svg-collection-no-have" v-else>
                                                        <use xlink:href="#template-collection"></use>
                                                    </svg>
                                                </div>
                                                <div class="water-item-custom-type" v-if="activeItem == 2">定制设计</div>
                                                <div class="template-up" @mouseenter="translateTop(template, indexSelf)" @mouseout="destroyTranslateTop"></div>
                                                <div class="template-down" @mouseenter="translateBottom(template, indexSelf)" @mouseout="destroyTranslateBottom"></div>
                                            </div>
                                            <div class="normal-template" :ref="'template'+templateArr.id" v-else @click="clickTemplate(templateArr,0,true,indexParent,indexSelf)" :class="{'normal-template-active' : activeChoose && indexSelf == activeLineIndex && indexParent == activeIndex}">
                                                <svg class="corner-mark" v-if="templateArr.isGif && activeMaterial != templateArr">
                                                    <use xlink:href="#svg-corner-mark"></use>
                                                </svg>
                                                <img :src="templateImg(templateArr.coverPath)" class="ele-template-img" style="display:none;" @load="imgLoad"/>
                                                <div class="ele-template-copyright-icon"
                                                    :class="[templateArr.source == 0 ? 'original' : templateArr.source == 2 ? 'other' : 'thirdParty', {'active' : activeMaterial == templateArr}]"
                                                    @click.stop
                                                    @mouseenter="hoverCopyrightBtn($event, templateArr)"
                                                    @mouseleave="wantToCloseInfo"
                                                    v-if="activeItem != 2">
                                                    <svg class="svg-icon">
                                                        <use xlink:href="#template-version"></use>
                                                    </svg>
                                                </div>
                                                <div class="ele-template-collection-icon" @click.stop="collectItem(templateArr)" v-if="activeItem !== 2">
                                                    <svg class="svg-icon svg-collection-have" v-if="templateArr.isCollected">
                                                        <use xlink:href="#template-collection"></use>
                                                    </svg>
                                                    <svg class="svg-icon svg-collection-no-have" v-else>
                                                        <use xlink:href="#template-collection"></use>
                                                    </svg>
                                                </div>
                                                <div class="water-item-custom-type" v-if="activeItem == 2">定制设计</div>
                                            </div>
                                        </div>
                                        <transition name="template-slide-up">
                                            <div v-if="activeChoose && activeIndex === indexParent" class="template-content">
                                                <div class="border-line" :class="activePosition"></div>
                                                <div class="ele-template-pages" :class="{'single-slide' : singleArr.indexOf(templateType) > -1}">
                                                    <div class="template-box clearfix">
                                                        <div class="ele-template-page" v-for="(page, pageIdx) in nowTemplate.contents" :key="pageIdx" :style="{height : templateHight[templateType] + 'px',backgroundColor: page.themeColor}" @click="clickTemplate(nowTemplate, pageIdx)" :data-text=" pageIdx == 0 ? '正面' : '反面' ">
                                                            <img :src="useClearTemplateImg(page)" class="ele-template-page-img"/>
                                                            <div class="ele-template-copyright-icon"
                                                                :class="[nowTemplate.source == 0 ? 'original' : nowTemplate.source == 2 ? 'other' : 'thirdParty', {'active' : activeMaterial == page}]"
                                                                @click.stop
                                                                @mouseenter="hoverCopyrightBtn($event, page)"
                                                                @mouseleave="wantToCloseInfo"
                                                                v-if="activeItem != 2">
                                                                <svg class="svg-icon">
                                                                    <use xlink:href="#template-version"></use>
                                                                </svg>
                                                            </div>
                                                            <div class="ele-template-collection-icon" @click.stop="collectItem(nowTemplate)" v-if="activeItem != 2">
                                                                <svg class="svg-icon svg-collection-have" v-if="nowTemplate.isCollected">
                                                                    <use xlink:href="#template-collection"></use>
                                                                </svg>
                                                                <svg class="svg-icon svg-collection-no-have" v-else>
                                                                    <use xlink:href="#template-collection"></use>
                                                                </svg>
                                                            </div>
                                                            <div class="water-item-custom-type" v-if="activeItem === 2">定制设计</div>
                                                        </div>
                                                    </div>
                                                    <btn class="ele-template-btn" @click="useCompleteTemplate(nowTemplate)">使用这套模板</btn>
                                                </div>
                                            </div>
                                        </transition>
                                    </div>
                                </div>

                                <div class="template-no-result" v-if="!isLoading && (templateList.length === 0) && isFirstSearch && (activeItem !== 0)">
                                    <div class="no-result-img" :class="getClassName(activeItem)"></div>
                                    <div class="no-result-content">
                                        <div class="no-result-title">{{tabList[activeItem].title}}</div>
                                        <div>
                                            {{tabList[activeItem].textPre}}
                                            <span class="text-color">【{{tabList[activeItem].textContent}}】</span>
                                            {{tabList[activeItem].textAfter}}
                                        </div>
                                        <a target="_blank" href="https://i.fkw.com/designer/index.jsp?flag=KtCtmz" class="todesignBtn" v-if="activeItem === 2">前往了解</a>
                                    </div>
                                </div>

                                <loading v-show="isLoading"></loading>
                                <div v-if="(hasLoadedAll || noTemplate) && !isLoading && !isBusy" class="ele-template-tips" :style="activeChoose || templateSlideUpSpecial?translateY:''">
                                    <div v-if="noTemplate && !isLoading && (activeItem === 0)" class="no-search-template">
                                        <div class="no-result-image">
                                        </div>
                                        <div class="no-result-tips">
                                            抱歉，没找到您想要的模板请修改关键词后再试
                                        </div>
                                        <button class="no-result-back" @click="hideBack(false)">返回全部模板</button>
                                    </div>
                                    <span v-if="!(templateList.length === 0)" class="ele-template-tips-text">{{'这是我的底线'}}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div title="返回顶部" v-show="returnTopShow" class="returnTop" @click="returnTop">
                        <svg class="ele-material-toTop">
                            <use xlink:href="#new-back-top"></use>
                        </svg>
                    </div>

                    <template-copyright v-if="showCopyright"
                        @close="closeCopyrightInfo" :item="activeMaterial"
                        @enter="enterCopyrightInfo"
                        :nowTemplate="nowTemplate"
                        :position="copyrightPosition">
                    </template-copyright>
                </div>`,

    mixins: [Ktu.mixins.copyright, Ktu.mixins.TemplateAnimation, Ktu.mixins.templateHandler, Ktu.mixins.countTemplateExposure],
    data() {
        return {
            templateList: [],
            isLoading: false,
            scrollIndex: 0,
            hasLoadedAll: false,
            noTemplate: false,

            isShowPage: false,
            nowTemplate: null,
            // 支持gif模板的模板类型
            supportGifTemplate: [103, 104, 113],
            // 单列显示的模板
            singleArr: [108, 201, 204, 206, 301, 307, 308, 310, 311, 406, 408],
            // singleArr: [],
            templateHight: {
                101: 72,
                102: 128,
                103: 128,
                104: 228,
                105: 228,
                106: 118,
                107: 128,
                108: 88,
                109: 128,
                110: 60,
                111: 54,
                112: 320,
                201: 85,
                202: 62,
                203: 128,
                204: 34,
                205: 300,
                206: 22,
                301: 162,
                302: 174,
                303: 174,
                304: 194,
                305: 170,
                306: 200,
                307: 82,
                308: 108,
                309: 213,
                310: 200,
                311: 200,
                312: 320,
                313: 288,
                401: 181,
                402: 181,
                403: 181,
                404: 181,
                405: 181,
                406: 192,
                407: 181,
                408: 192,
            },

            clickTime: 0,
            isContentShow: false,
            activeIndex: 0,
            activeLineIndex: 0,
            activeChoose: false,
            doubleTemplateList: [],
            lastSearchVal: '',
            showItemList: false,
            translateY: {},
            templateSlideUpSpecial: false,
            historyList: [],
            ifFocusOfInput: false,
            isTimeOut: '',
            isFirstSearch: true,
            isComponentActive: false,
            activeItem: 0,
            searchActiveItem: 0,
            returnTopShow: false,
            getLimit: 10,
            isBusy: false,
            collectionScrollIndex: 0,
            isChangeState: false,
            isIntoFirst: false,
            tabList: [{
                type: '推荐模板',
                key: 0,
                title: '当前类型还没有推荐的模板',
                src: '',
                textPre: '',
                textContent: '',
                textAfter: '',
            }, {
                type: '收藏模板',
                key: 1,
                title: '当前类型还没有收藏的模板',
                src: '',
                textPre: '点击模板右上角',
                textContent: '星星',
                textAfter: '按钮即可收藏',
            }, {
                type: '定制设计',
                key: 2,
                // title: '当前类型还没有定制的模板',
                src: '',
                textPre: '找设计师定制',
                textContent: '100%保证满意',
                textAfter: '不满意退全款',
            }],
            tabWidth: 0,
            searchList: [{
                type: '全部',
                key: '0',
            }, {
                type: '高清大图',
                key: '1',
            }, {
                type: '免抠PNG',
                key: '2',
            }, {
                type: '矢量素材',
                key: '3',
            }],
            hasRequestHistory: false,
        };
    },
    computed: {
        templateType() {
            return this.$store.state.base.templateType;
        },

        // 判断是否为需要长图动画的模板
        isSpecialTemplate() {
            return this.specialTemplates.includes(this.templateType);
        },

        // 最大translateY值
        maxTranslateY() {
            return 300 - 128 * 5000 / 790;
        },
        activePosition() {
            let str = '';
            if (this.activeChoose) {
                if (this.singleArr.indexOf(this.templateType) > -1) {
                    str = 'third';
                } else {
                    switch (this.activeLineIndex % 2) {
                        case 0:
                            str = 'first';
                            break;
                        case 1:
                            str = 'second';
                            break;
                    }
                }
            }

            return str;
        },
        singleTempContHeight() {
            return this.templateHight[this.templateType] * 128 / 272;
        },
        searchVal: {
            get() {
                return this.$store.state.base.searchTemplateValue;
            },
            set(value) {
                this.$store.state.base.searchTemplateValue = value;
            },
        },

        showModalChangeId: {
            get() {
                return this.$store.state.modal.showModalChangeId;
            },
            set(value) {
                this.$store.state.modal.showModalChangeId = value;
            },
        },
        showModalState: {
            get() {
                return this.$store.state.modal.showModalState;
            },
            set(value) {
                this.$store.state.modal.showModalState = value;
            },
        },
        tabLeft() {
            return this.tabWidth * this.activeItem + 2;
        },

    },
    activated() {
        if (!this.isLoading) {
            this.scroll();
        }
        this.activeItem = 0;
        if (this.isIntoFirst) {
            Ktu.simpleLog('openTemplateType', 'recommendTemplate');
            this.goBack();
        }
        this.isIntoFirst = true;
        this.isComponentActive = true;
    },
    deactivated() {
        this.isShowPage = false;
        this.templateList.forEach(item => {
            item.showLog = false;
        });
        this.activeChoose = false;
        this.isComponentActive = false;
        /* if (this.templateList.length == 0) {
            this.clear();
        } */
    },
    created() {
        // this.templateShowLog();
        this.activeItem = 0;
        // this.clear();
        if (!this.searchVal) {
            Ktu.simpleLog('openTemplateType', 'recommendTemplate');
            this.loadTemplate();
        } else {
            this.search();
        }
        // this.getSearchHistoryList();
    },
    mounted() {
        const {
            offsetWidth = 272,
        } = this.$refs.templateNav;
        this.tabWidth = (offsetWidth - 4) / this.tabList.length;
    },
    watch: {
        showModalState(value) {
            if (this.activeItem == 0) {
                for (let i = 0; i < this.templateList.length; i++) {
                    if (this.templateList[i].id == value.id) {
                        this.$set(this.templateList[i], 'isCollected', value.value);
                    }
                }
                for (let i = 0; i < this.doubleTemplateList.length; i++) {
                    for (let j = 0; j < this.doubleTemplateList[i].length; j++) {
                        if (this.doubleTemplateList[i][j].id == value.id) {
                            this.$set(this.doubleTemplateList[i][j], 'isCollected', value.value);
                        }
                    }
                }
            } else {
                this.templateList = [];
                this.doubleTemplateList = [];
                this.scrollIndex = 0;
                this.collectionScrollIndex = 0;
                this.hasLoadedAll = false;
                this.activeChoose = false;
                this.getCollectionList();
            }
        },
        searchVal(val) {
            if (val == '') {
                this.activeItem = 0;
                this.goBack();
            }
        },
        activeChoose(val) {
            if (val) {
                if (this.singleArr.indexOf(this.templateType) > -1) {
                    this.$nextTick(() => {
                        this.translateY = `transform: translateY(${document.querySelector('.normal-template-expand .template-content').offsetHeight}px)`;
                    });
                } else {
                    this.$nextTick(() => {
                        this.translateY = `transform: translateY(${document.querySelector('.template-content').offsetHeight + 16}px)`;
                    });
                }
            } else {
                if (this.templateSlideUpSpecial) {
                    this.translateY = `transform: translateY(${document.querySelector('.template-content').offsetHeight + 16}px)`;
                }
            }
        },
        templateType() {
            this.activeItem = 0;
            this.searchVal = '';
            this.clear();
            this.loadTemplate();
            this.isFirstSearch = true;
        },
    },

    methods: {
        getTemplatePosArr() {
            const templateList = [...this.templateList, ...this.doubleTemplateList];
            if (!$('.ele-template-slide') || !templateList) return;
            const height = $('.ele-template').height();
            this.templatePosArr.push(...this.newPosArr);
            this.newPosArr = [];
            this.$nextTick(() => {
                this.templateList.forEach(item => {
                    const tmpDom = this.$refs[`template${item.id}`][0];
                    if (!tmpDom) return false;
                    const {
                        top,
                    } = tmpDom.getBoundingClientRect();
                    const {
                        offsetHeight,
                    } = tmpDom;
                    if (!this.templatePosArr.includes(item.id) && top > 69 && (top + offsetHeight - 69) < height) {
                        this.newPosArr.push(item.id);
                    }
                });
                this.countExposureTimes(this.newPosArr);
            });
        },
        // 收藏模板
        collectItem(item) {
            if (this.isBusy) {
                this.$Notice.warning('正在操作中，请稍候。');
                return;
            }

            this.isBusy = true;
            if (item.isCollected) {
                this.activeChoose = false;
                this.cancelCollectItem(item);
                return;
            }

            const url = '/ajax/ktuCollectTemplate_h.jsp?cmd=add';

            axios
                .post(url, {
                    fromCaseId: item.id,
                    fromKtuAid: item.ktuAid,
                    fromKtuId: item.ktuId,
                    isFromPreview: false,
                }).then(res => {
                    const info = (res.data);

                    if (info.success) {
                        item.isCollected = true;
                        this.$Notice.success(info.msg);
                    } else {
                        this.$Notice.warning(info.msg);
                    }
                })
                .catch(err => {
                    this.$Notice.warning('收藏失败');
                })
                .finally(() => {
                    this.isBusy = false;
                });
        },

        cancelCollectItem(item) {
            // 按钮阻止冒泡 但又要收起全局菜单 所以模拟点击
            const url = '/ajax/ktuCollectTemplate_h.jsp?cmd=del';

            axios
                .post(url, {
                    fromCaseId: item.id,
                }).then(res => {
                    const info = (res.data);
                    if (info.success) {
                        item.isCollected = false;
                        this.$Notice.success(info.msg);
                        if (this.activeItem === 1) {
                            this.isBusy = false;
                            this.collectionScrollIndex = 0;
                            this.doubleTemplateList = [];
                            this.templateList = [];
                            this.hasLoadedAll = false;
                            this.getCollectionList();
                        }
                    } else {
                        this.$Notice.warning(info.msg);
                    }
                })
                .catch(err => {
                    this.$Notice.warning('取消收藏失败');
                })
                .finally(() => {
                    this.isBusy = false;
                });
        },

        getClassName(index) {
            if (index === 1) {
                return 'class-collection-template';
            }
            return 'class-design-template';
        },

        // 获取收藏列表
        getCollectionList() {
            if (this.isBusy) {
                return;
            }
            this.isLoading = true;
            const newArr = [];
            this.isBusy = true;
            // this.isLoading = true;
            const url = '../ajax/getCollectTemplateList_h.do?cmd=getList';

            // 关系映射 99 --> 0(降) 100 --> 1(升)
            axios
                .post(url, {
                    use: Ktu.ktuData.type,
                    getLimit: this.getLimit,
                    createTimeDesc: 1,
                    scrollIndex: this.collectionScrollIndex++,
                    isEditor: true,
                    isGif: Ktu.ktuData.isGif,
                }).then(res => {
                    const info = (res.data);
                    if (info.success && this.activeItem === 1) {
                        this.isBusy = false;
                        // this.templateList = info.data;
                        const result = (info.data);
                        if (result.length > 0) {
                            this.templateList = this.templateList.concat(result);
                            this.scroll();
                            this.hasLoadedAll = false;
                        } else {
                            this.hasLoadedAll = true;
                        }
                        if (this.singleArr.indexOf(this.templateType) <= -1) {
                            for (let i = 0, len = this.templateList.length; i < len; i += 2) {
                                newArr.push(this.templateList.slice(i, i + 2));
                            }
                        }
                        this.doubleTemplateList = newArr;
                        this.noTemplate = !this.templateList.length;
                    }
                })
                .catch(err => {
                    this.isBusy = false;
                    console.log(err);
                })
                .finally(() => {
                    this.isBusy = false;
                    this.isLoading = false;
                });
        },

        // 获取定制模板的类型
        getCuChangeList() {
            if (this.isBusy) {
                return;
            }
            this.isBusy = true;
            this.isLoading = true;
            const newArr = [];
            const url = '/ajax/ktuTemplate_h.jsp?cmd=getMyCustomList';
            // 关系映射 99 --> 0(降) 100 --> 1(升)
            const params = {
                limit: this.getLimit,
                scrollIndex: this.collectionScrollIndex++,
                use: Ktu.ktuData.type,
                createTimeDesc: true,
            };

            axios
                .post(url, params).then(res => {
                    const info = (res.data);
                    if (info.success && this.activeItem === 2) {
                        this.isBusy = false;
                        // this.templateList = info.data;
                        const result = (info.list);
                        if (result.length > 0) {
                            this.templateList = this.templateList.concat(result);
                            this.scroll();
                            this.hasLoadedAll = false;
                        } else {
                            this.hasLoadedAll = true;
                        }
                        if (this.singleArr.indexOf(this.templateType) <= -1) {
                            for (let i = 0, len = this.templateList.length; i < len; i += 2) {
                                newArr.push(this.templateList.slice(i, i + 2));
                            }
                        }
                        this.doubleTemplateList = newArr;
                        this.noTemplate = !this.templateList.length;
                    }
                })
                .catch(err => {
                    this.isBusy = false;
                    console.log(err);
                })
                .finally(() => {
                    this.isBusy = false;
                    this.isLoading = false;
                });
        },

        // 获取兑换模板的类型
        getExChangeList() {
            if (this.isBusy) {
                return;
            }
            const newArr = [];
            this.isBusy = true;
            this.isLoading = true;
            const url = '/ajax/ktuPayTemplate_h.jsp?cmd=getList';
            // 关系映射 99 --> 0(降) 100 --> 1(升)
            const params = {
                limit: this.getLimit,
                scrollIndex: this.collectionScrollIndex++,
                type: Ktu.ktuData.type,
                createTimeDesc: true,
            };

            axios
                .post(url, params).then(res => {
                    const info = (res.data);
                    if (info.success) {
                        this.isBusy = false;
                        // this.templateList = info.data;
                        const result = (info.list);
                        if (result.length > 0) {
                            this.templateList = this.templateList.concat(result);
                            this.scroll();
                        } else {
                            this.hasLoadedAll = true;
                        }
                        if (this.singleArr.indexOf(this.templateType) <= -1) {
                            for (let i = 0, len = this.templateList.length; i < len; i += 2) {
                                newArr.push(this.templateList.slice(i, i + 2));
                            }
                        }
                        this.doubleTemplateList = newArr;
                    }
                })
                .catch(err => {
                    this.isBusy = false;
                    console.log(err);
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },

        returnTop() {
            // this.isFirstSearch = true;
            this.$refs.container.scrollTop = 0;
        },

        changeActiveItem(index) {
            if (this.activeItem === index) {
                return;
            }
            this.activeItem = index;
            this.templateList = [];
            this.doubleTemplateList = [];
            this.scrollIndex = 0;
            this.collectionScrollIndex = 0;
            this.hasLoadedAll = false;
            this.activeIndex = 0;
            this.activeChoose = false;
            if (index == 0) {
                Ktu.simpleLog('openTemplateType', 'recommendTemplate');
                this.loadTemplate();
            } else if (index == 1) {
                Ktu.simpleLog('openTemplateType', 'collectionTemplate');
                this.getCollectionList();
            } else {
                Ktu.simpleLog('openTemplateType', 'designTemplate');
                this.getCuChangeList();
            }
        },
        goBack() {
            this.clear();
            this.loadTemplate();
            this.isFirstSearch = true;
        },
        changeSearchVal(value) {
            this.searchVal = value;
            this.searchHandle(true);
        },
        hideBack(isSearchBtn) {
            if (this.searchVal === '') {
                this.goBack();
            } else {
                this.searchVal = '';
            }
            this.isFirstSearch = true;
            Ktu.simpleLog('openTemplateType', 'recommendTemplate');
            if (isSearchBtn) {
                Ktu.simpleLog('searchOptions', 'clickBackBtn');
            } else {
                Ktu.simpleLog('searchOptions', 'clickNoResultBtn');
            }
        },
        hideHistory() {
            this.ifFocusOfInput = false;
        },
        showHistory() {
            ;
            this.ifFocusOfInput = true;
            clearTimeout(this.isTimeOut);
        },
        // 文本框失焦
        blurInput() {
            this.isTimeOut = setTimeout(() => {
                this.ifFocusOfInput = false;
            }, 200);
        },
        // 清除历史记录
        cleanHistory() {
            this.historyList = [];
        },
        changeData(e) {
            this.searchVal = e.target.value;
        },
        focusInput(e) {
            this.ifFocusOfInput = true;
            e.target.value = e.target.value.replace(/[^\d]/g, '') || '';
        },
        // 使用高清的图片
        useClearTemplateImg(item) {
            let path;
            if (item.shareFile && item.shareFile[0] && item.shareFile[0].path) {
                path = item.shareFile[0].path;
            } else {
                path = item.tmpFilePath;
            }
            return this.templateImg(path);
        },

        loadTemplate() {
            this.isLoading = true;
            const newArr = [];
            this.hasLoadedAll = false;
            const currentTemplateType = this.templateType;
            axios
                .post('/ajax/ktuTemplate_h.jsp', {
                    cmd: 'getList',
                    scrollIndex: this.scrollIndex,
                    type: this.templateType,
                    isEditor: true,
                    isGif: Ktu.ktuData.isGif,
                }).then(response => {
                    if (!this.hasRequestHistory) {
                        this.getSearchHistoryList();
                        this.hasRequestHistory = true;
                    }
                    const result = (response.data);
                    if (result.success && this.activeItem === 0) {
                        if (result.templateList.length > 0) {
                            const {
                                templateList,
                            } = result;
                            if (currentTemplateType === this.templateType) {
                                this.templateList = this.templateList.concat(templateList);
                            }
                            if (this.isSpecialTemplate) {
                                this.templateList.forEach(item => {
                                    if (!item.translateY) {
                                        Vue.set(item, 'translateY', 0);
                                    }
                                });
                            }
                            this.scroll();
                            this.hasLoadedAll = false;
                        } else {
                            this.hasLoadedAll = true;
                        }
                        if (this.singleArr.indexOf(this.templateType) <= -1) {
                            for (let i = 0, len = this.templateList.length; i < len; i += 2) {
                                newArr.push(this.templateList.slice(i, i + 2));
                            }
                        }
                        this.doubleTemplateList = newArr;
                        this.noTemplate = !this.templateList.length;
                    }
                    this.isLoading = false;
                })
                .catch(response => {
                    this.isLoading = false;
                });
        },
        backTemplate() {
            // 关闭版权标识模态框
            this.closeCopyrightInfo();
            this.$delete(this.nowTemplate, 'contents');
            this.isShowPage = false;
            this.nowTemplate = null;
        },
        clickTemplate(template, pageIdx, isMoreContent, indexParent, indexSelf) {
            Ktu.store.state.data.currentTemplateList = this.templateList;
            const {
                clickTime,
            } = this;
            // 当前页面idx
            this.clickTime = new Date().getTime();
            if (new Date().getTime() - clickTime < 300) {
                return;
            }
            this.nowTemplate = template;
            const {
                currentPageIndex,
            } = Ktu.template;
            if (this.activeChoose && this.activeIndex === indexParent) {
                this.activeChoose = false;
                // 点击同一行的另一个模板，收起原模版再展示另一模板
                if (this.indexSelf != indexSelf) {
                    this.indexSelf = indexSelf;
                    this.templateSlideUpSpecial = true;
                    setTimeout(() => {
                        this.clickTemplate(template, pageIdx, isMoreContent, indexParent, indexSelf);
                    }, 300);
                } else {
                    this.indexSelf = indexSelf;
                    this.templateSlideUpSpecial = false;
                }
            } else {
                this.indexSelf = indexSelf;
                // 点击不是同行中也应该收起再展示
                this.activeChoose = false;
                this.templateSlideUpSpecial = false;
                if (indexSelf >= 0) this.activeLineIndex = indexSelf;
                if (indexParent >= 0) this.activeIndex = indexParent;
                if (!template.contents) {
                    $.getCacheScript(template.ktuFilePath, () => {
                        this.asyncCallBack(pageIdx, template, currentPageIndex);
                    });
                } else {
                    if (isMoreContent && template.contents.length > 1) {
                        this.isShowPage = true;
                        this.activeChoose = true;
                    } else {
                        // this.judgeShowModal(pageIdx, template, currentPageIndex);
                        this.replaceTemplate(pageIdx, template, currentPageIndex);
                    }
                }
            }
        },
        async asyncCallBack(pageIdx, template, currentPageIndex) {
            // 使用模板需要过滤一些属性
            if (Ktu._jsData.tmpContents[0].content[0].objects) {
                for (const obj of Ktu._jsData.tmpContents[0].content[0].objects) {
                    await Ktu.element.objectFilter(obj);
                }
                this.$set(template, 'contents', Ktu._jsData.tmpContents);
                if (template.contents.length > 1) {
                    this.isShowPage = true;
                    this.activeChoose = true;
                } else {
                    // this.judgeShowModal(pageIdx, template, currentPageIndex);
                    this.replaceTemplate(pageIdx, template, currentPageIndex);
                }
            }
        },
        judgeShowModal(pageIdx, template, currentPageIndex) {
            // 发送请求确认是否需要打开预览窗兑换模板
            const url = '../ajax/ktuTemplate_h.jsp?cmd=isShowPreview';
            const param = {
                caseId: template.id,
            };

            axios
                .post(url, param).then(res => {
                    const {
                        data,
                    } = res;
                    if (data.success) {
                        if (data.isShowPreview) {
                            this.openPreviewModal(false, template, pageIdx, currentPageIndex);
                        } else {
                            this.replaceTemplate(pageIdx, template, currentPageIndex);
                        }
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        },
        useCompleteTemplate(template) {
            this.replaceTemplates(template);

            /*
            // 发送请求确认是否需要打开预览窗兑换模板
            const url = '../ajax/ktuTemplate_h.jsp?cmd=isShowPreview';
            const param = {
                caseId: template.id,
            };

            axios.post(url, param).then(res => {
                const {
                    data,
                } = res;
                if (data.success) {
                    if (data.isShowPreview) {
                        // 打开预览弹窗
                        this.openPreviewModal(true, template);
                    } else {
                        this.replaceTemplates(template);
                    }
                }
            })
                .catch(err => {
                    console.log(err);
                });
                */
        },
        scroll() {
            // 关闭版权标识模态框
            this.closeCopyrightInfo();
            this.scrollTimer && window.clearTimeout(this.scrollTimer);
            if ($(this.$el).find('.template-box').length && $(this.$el).find('.template-box')
                .offset().top < 146) {
                this.returnTopShow = true;
            } else {
                this.returnTopShow = false;
            }
            this.scrollTimer = window.setTimeout(() => {
                const {
                    container,
                } = this.$refs;
                const {
                    slide,
                } = this.$refs;
                if (!this.isLoading && !this.hasLoadedAll && container.scrollTop + container.clientHeight >= slide.clientHeight && this.isComponentActive) {
                    if (this.activeItem == 0) {
                        this.scrollIndex++;
                        if (!this.isFirstSearch && this.searchVal !== '') {
                            this.search();
                        } else {
                            this.loadTemplate();
                        }
                    } else if (this.activeItem == 1) {
                        this.getCollectionList();
                    } else {
                        this.getCuChangeList();
                    }
                }
                // this.templateShowLog();
            }, 50);
            this.throttle(this.getTemplatePosArr, 300);
        },
        // 模板 曝光统计
        /* templateShowLog() {
            if (this.templateList.length < 1) return;
            const templateList = this.$refs.template;
            const {
                container,
            } = this.$refs;

            templateList.forEach((item, index) => {
                const itemTop = $(item).offset().top;
                const itemData = this.templateList[index];

                if (container.scrollTop + container.clientHeight > itemTop && !itemData.showLog) {
                    itemData.showLog = true;

                    const templateId = itemData.id;
                    const classification = Ktu.ktuData.type;
                    const url = '/ajax/logBss_h.jsp';
                    const data = {
                        ktuId: Ktu.ktuId,
                        templateId,
                        classification,
                        cmd: 'templateExposure',
                    };
                    axios.post(url, data);
                }
            });
        }, */

        templateImg(itemPath) {
            if (this.$store.state.base.isSupportWebp) {
                itemPath = Ktu.getWebpOrOtherImg(itemPath);
            }

            // itemPath = 'http://115.s90i.aaadns.com.hausenlee.dev.cc/4/147/AFwIcxAEGAAgv_OO4wUo36H0kmQYwhAc4-wI.png.webp?_tm=3&v=1550822302000';

            return itemPath;
        },
        imgLoad(ev) {
            if (ev.target.naturalWidth === 248 && ev.target.naturalHeight === 248) {
                const parent = $(ev.target).parents('.ele-template-single');

                let w = 0;
                let h = 0;
                if (parent.width() > parent.height()) {
                    w = 'auto';
                    h = '100%';
                } else {
                    h = 'auto';
                    w = '100%';
                }

                $(ev.target).css({
                    position: 'relative',
                    width: w,
                    height: h,
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50% ,-50%)',
                });

                parent.css({
                    'background-color': '#ececec',
                });

                parent.find('.top , .bottom').hide();
            }

            $(ev.target).show();
        },
        // 关键词搜索
        search() {
            (this.scrollIndex == 0) && Ktu.simpleLog('searchModal');
            this.searchVal = this.searchVal.replace(' ', '');
            if (this.searchVal == '') {
                this.$Notice.warning('请输入关键词');
                return;
            }
            if (this.searchVal.length > 10) {
                this.$Notice.warning('关键词超过10个字符。');
                return;
            }
            if (this.searchVal.length <= 1) {
                this.$Notice.warning('关键词需大于1个字符。');
                return;
            }
            this.isLoading = true;
            this.showItemList = true;
            this.activeChoose = false;
            this.hasLoadedAll = false;
            const newArr = [];
            this.lastSearchVal = this.searchVal;
            const url = '/ajax/ktuTemplate_h.jsp';
            axios
                .post(url, {
                    cmd: 'searchTemplate',
                    linkType: 'keywords',
                    type: this.templateType,
                    value: this.searchVal,
                    scrollIndex: this.scrollIndex,
                    limit: this.limit,
                    isEditTemplateSearch: true,
                    isEditor: true,
                    isGif: Ktu.ktuData.isGif,
                }).then(res => {
                    const result = (res.data);
                    if (result.success) {
                        if (result.templateList.length > 0) {
                            const {
                                templateList,
                            } = result;
                            this.templateList = this.templateList.concat(templateList);
                            (this.scrollIndex == 0) && Ktu.simpleLog('searchModalResult', 'hasData');
                            this.scroll();
                        } else {
                            this.hasLoadedAll = true;
                            (this.scrollIndex == 0) && Ktu.simpleLog('searchModalResult', 'noData');
                        }
                        if (this.singleArr.indexOf(this.templateType) <= -1) {
                            for (let i = 0, len = this.templateList.length; i < len; i += 2) {
                                newArr.push(this.templateList.slice(i, i + 2));
                            }
                        }
                        this.doubleTemplateList = newArr;
                    }
                    this.noTemplate = !this.templateList.length;

                    this.isLoading = false;
                    this.getSearchHistoryList();
                    this.ifFocusOfInput = false;
                })
                .catch(function (response) {
                    this.isLoading = false;
                });
        },
        searchHandle(isClick = false) {
            if (this.searchVal == '') {
                this.$Notice.warning('请输入关键词');
                return;
            }
            if (this.searchVal.length > 10) {
                this.$Notice.warning('关键词超过10个字符。');
                return;
            }
            if (this.searchVal.length <= 1) {
                this.$Notice.warning('关键词需大于1个字符。');
                return;
            }
            this.activeItem = 0;
            this.searchVal = this.searchVal.replace(' ', '');
            if (this.searchVal == '' || this.searchVal.length > 10 || this.searchVal.length <= 1) {

            } else {
                this.templateList = [];
                this.doubleTemplateList = [];
                this.scrollIndex = 0;
                this.isFirstSearch = false;
            }
            if (isClick) {
                Ktu.simpleLog('searchOptions', 'searchByClick');
            } else {
                Ktu.simpleLog('searchOptions', 'searchByInput');
            }
            this.search();
        },
        clear() {
            this.activeChoose = false;
            this.noTemplate = false;
            this.templateList = [];
            this.doubleTemplateList = [];
            // this.searchVal = '';
            this.lastSearchVal = '';
            this.scrollIndex = 0;
            this.activeIndex = 0;
            this.isLoading = false;
            this.isBusy = false;
            this.hasLoadedAll = false;
            this.showItemList = false;
        },
        clearHandle() {
            this.searchVal = '';
        },
        getSearchHistoryList() {
            const url = '../ajax/ktuSearchRecord_h.jsp?cmd=get';

            axios
                .post(url, {
                    type: 1,
                }).then(res => {
                    const info = (res.data);
                    if (info.success && info.recordList.searchList) {
                        this.historyList = JSON.parse(info.recordList.searchList).reverse();
                    }
                })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => {
                    // this.isLoading = false;
                });
        },
        // 清空历史记录
        clearSearchHistory() {
            const url = '../ajax/ktuSearchRecord_h.jsp?cmd=del';
            const data = {
                type: 1,
            };
            axios
                .post(url, data).then(res => {
                    // console.log(res);
                    const result = (res.data);
                    if (result.success) {
                        Ktu.simpleLog('searchOptions', 'clearSearchHistory');
                        this.historyList = [];
                    }
                })
                .catch(e => {
                    console.log(e);
                });
        },

        // 打开模板预览窗
        openPreviewModal(isReplaceAll, template, pageIdx, currentPageIndex) {
            this.template = template;
            this.isReplaceAll = isReplaceAll;
            if (isReplaceAll) {
                this.pageIdx = 0;
                this.currentPageIndex = 0;
            } else {
                this.pageIdx = pageIdx;
                this.currentPageIndex = currentPageIndex;
            }
            Ktu.store.commit('modal/showPreviewPopupState', true);
        },
    },
});
