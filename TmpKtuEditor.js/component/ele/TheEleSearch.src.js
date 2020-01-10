Vue.component('ele-search', {
    template: `
    <div class="ele-search page">
        <div class="search-input-box">
            <div class="search-input-class">
                {{searchOption==1?'搜素材':'搜模板'}}
                <div class="search-input-triangle" v-show="templateType!=0" :class="showSearchOption?'active':''"></div>
            </div>
            <div class="optionBox" @mouseover="showOption" @mouseout="hiddenOption" v-if="!isFromThirdDesigner&&templateType!=0">
                <div class="search-input-options" :class="showSearchOption?'':'hidden'">
                    <div class="option" @click="changeSearchOption(1)">搜素材</div>
                    <div class="option" @click="changeSearchOption(2)">搜模板</div>
                </div>
            </div>
            <validate-input
                :placeholder="searchOption==1?'输入关键词搜索素材':'输入关键词搜索模板'"
                class="search-input-info nav-title-input"
                @keyup.enter.native="search"
                @focus="focusInput"
                v-model="searchVal"
                @onInput="changeData"
                :inputVal="searchVal">
            </validate-input>
            <svg class="search-input-icon" v-if="(showItemList||showTemplate) && searchVal == lastSearchVal" @click="clear">
                <use xlink:href="#svg-ele-search-clear"></use>
            </svg>
            <svg v-else class="search-input-icon" @click="search">
                <use xlink:href="#svg-ele-search-input"></use>
            </svg>
        </div>
        <div class="search-type-box" :class="{'shadow' : scrollTop > 14}" v-show="searchOption==1&&showItemList">
            <div class="search-type-item" :class="{active:searchType == item.type}" @click="changeSearchType(item.type)" v-for="(item,index) in typeArr">
                <span class="search-type-item-title">{{item.name}}</span>
            </div>
        </div>

        <div class="container" @scroll="scrollLoad" ref="container">
            <div class="search-lastest" v-if="searchOption==1&&!showItemList&& lastestSearchs.length > 0">
                <div class="search-lastest-title">历史搜索
                    <div class="search-lastest-clear" @click="clearLastest">清空记录</div>
                </div>
                <div class="search-lastest-item-box clearfix">
                    <div class="search-lastest-item" v-for="(item,index) in lastestSearchs" @click="lastestSearch(item)">{{item}}</div>
                </div>
            </div>
            <div class="search-lastest" v-if="searchOption==2&&!showTemplate&& lastestSearchsModal.length > 0">
                <div class="search-lastest-title">历史搜索
                    <div class="search-lastest-clear" @click="clearLastest">清空记录</div>
                </div>
                <div class="search-lastest-item-box clearfix">
                    <div class="search-lastest-item" v-for="(item,index) in lastestSearchsModal" @click="lastestSearchModal(item)">{{item}}</div>
                </div>
            </div>

            <transition name="slide-up" v-if="showItemList">
                <div v-if="showItemList" class="search-group-box" ref="slide">
                    <transition-group tag="div" name="material-show" class="search-item-box" :style="{height:waterFallHeight + 'px'}">
                        <div class="search-item" :class="searchClass(item.sourceData)" v-for="(item,index) in showData" :key="index+1" :index="index" @click="useWaterItem(item.sourceData)" :style="item.style" draggable="true" @dragstart="dragStart($event, item.sourceData)">
                            <div class="search-item-copyright-icon" :class="{'other':copyrightArr.indexOf(item.sourceData.comeFrom) > 0,'nocopyright' : copyrightArr.indexOf(item.sourceData.comeFrom) < 0,'active' : item.sourceData.showCopyright}" @click.stop="showCopyrightInfo($event,item.sourceData)">
                            <svg class="svg-copyright nocopyright" v-if="copyrightArr.indexOf(item.sourceData.comeFrom) < 0">
                                        <use xlink:href="#svg-ele-cautious"></use>
                                    </svg>
                                    <svg class="svg-copyright other" v-else-if="copyrightArr.indexOf(item.sourceData.comeFrom) > 0">
                                        <use xlink:href="#svg-ele-finite"></use>
                                    </svg>
                                    <svg class="svg-copyright active" v-else>
                                        <use xlink:href="#svg-ele-free"></use>
                                    </svg>
                            </div>
                            <div class="search-item-inner">
                                <img class="search-item-img" :src="waterItemImg(item)">
                                <div class="search-item-collection"  @click.stop="changeCollectionState(item)">
                                    <svg class="svg-collection-have" v-if="item.sourceData.isCollect">
                                        <use xlink:href="#svg-collection-have"></use>
                                    </svg>
                                    <svg class="svg-collection-nohave" v-else>
                                        <use xlink:href="#svg-collection-have"></use>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </transition-group>
                    <div class="search-no-tip" v-show="noResult">
                        <div class="search-no-tip-img"></div>
                        <div class="search-no-tip-text">抱歉，没有找到<span class="search-no-tip-value">"{{lastSearchVal}}"</span>相关{{searchOption==1?'素材':'模板'}}，</div>
                        <div class="search-no-tip-text">我们已积累你的需求，换一个关键词试试？</div>
                        <btn class="search-no-tip-button" v-show="searchOption==1" @click="jumpMaterial" type="compound">按分类查找</btn>
                    </div>
                    <loading v-show="isLoading"></loading>
                    <!-- 分页 -->
                    <pagination v-show="showPagination && !noResult" :nowPage="nowIndex" :totalSize="searchTotal" :itemLimit="materialGetLimit" :scrollLimit="scrollIndexLimit" @on-change="selectPageChange"></pagination>

                    <div v-show="hasLoadedAll && !showPagination && !noResult" class="water-tip">
                        <span class="water-tip-text">这是我的底线</span>
                    </div>
                </div>
            </transition>

            <transition name="slide-up" v-if="showTemplate">
                <div v-if="showTemplate" class="search-group-box" ref="slide">
                    <div class="ele-template-slide" :class="{'single-slide' : singleArr.indexOf(templateType) > -1}" ref="slide">
                    <div v-if="singleArr.indexOf(templateType) > -1" class="template-box clearfix" :class="{active : activeChoose}">
                        <div  v-for="(template, indexParent) in templateList" :key="indexParent" ref="template" class="template-block"  :class="{'normal-template-expand' : activeChoose && indexParent == activeIndex}">
                            <div class="ele-template-single">
                                <div class="normal-template" @click="clickTemplate(template,0,true,indexParent)" :style="{height : templateHight[templateType] + 'px',backgroundColor: template.themeColor}" :class="{'normal-template-active' : activeChoose && indexParent == activeIndex}">
                                    <img :src="templateImg(template.coverPath)" class="ele-template-img" style="display:none;" @load="imgLoad"/>
                                    <div class="ele-template-copyright-icon" :class="{'original': template.source == 0,'thirdParty' : template.source == 1,'other' : template.source == 2, 'active' : activeMaterial == template}" @click.stop="showCopyrightInfo($event, template)"></div>
                                </div>
                            </div>
                            <transition name="slide-up">
                                <div v-if="activeChoose && activeIndex === indexParent" class="template-content">
                                    <div class="border-line" :class="activePosition"></div>
                                    <div class="ele-template-pages" :class="{'single-slide' : singleArr.indexOf(templateType) > -1}">
                                        <div class="template-box clearfix">
                                            <div class="ele-template-page" v-for="(page, pageIdx) in nowTemplate.contents" :key="pageIdx" :style="{height : singleTempContHeight + 'px',backgroundColor: page.themeColor}" @click="clickTemplate(nowTemplate, pageIdx)" :data-text=" pageIdx == 0 ? '正面' : '反面' ">
                                                <img :src="useClearTemplateImg(page)" class="ele-template-page-img"/>
                                                <div class="ele-template-copyright-icon" :class="{'original': nowTemplate.source == 0,'thirdParty' : nowTemplate.source == 1,'other' : nowTemplate.source == 2, 'active' : activeMaterial == page}" @click.stop="showCopyrightInfo($event, page)"></div>
                                            </div>
                                        </div>
                                        <btn class="ele-template-btn" @click="useCompleteTemplate(nowTemplate)">使用这套模板</btn>
                                    </div>
                                </div>
                            </transition>
                        </div>
                    </div>

                    <div v-else class="template-box clearfix" :class="{active : activeChoose}">
                        <div v-for="(template, indexParent) in doubleTemplateList" :key="indexParent" class="template-line">
                            <div v-for="(templateArr, indexSelf) in template" class="ele-template-single" ref="template" :style="{height : templateHight[templateType] + 'px',backgroundColor: templateArr.themeColor}">
                                <div class="special-template" v-if="isSpecialTemplate" @click="clickTemplate(templateArr,0,true,indexParent)" :style="{height : templateHight[templateType] + 'px',backgroundColor: templateArr.themeColor}">
                                    <img :src="templateImg(templateArr.coverPath)" class="ele-template-img" :style="{'transform': 'translateY(' + templateArr.translateY + 'px)'}" style="display:none;" @load="imgLoad"/>
                                    <div class="ele-template-copyright-icon" :class="{'original': templateArr.source == 0,'thirdParty' : templateArr.source == 1,'other' : templateArr.source == 2, 'active' : activeMaterial == templateArr}" @click.stop="showCopyrightInfo($event, templateArr)"></div>
                                    <div class="template-up" @mouseenter="translateTop(template, indexSelf)" @mouseout="destroyTranslateTop"></div>
                                    <div class="template-down" @mouseenter="translateBottom(template, indexSelf)" @mouseout="destroyTranslateBottom"></div>
                                </div>
                                <div class="normal-template" v-else @click="clickTemplate(templateArr,0,true,indexParent,indexSelf)" :class="{'normal-template-active' : activeChoose && indexSelf == activeLineIndex && indexParent == activeIndex}">
                                    <img :src="templateImg(templateArr.coverPath)" class="ele-template-img" style="display:none;" @load="imgLoad"/>
                                    <div class="ele-template-copyright-icon" :class="{'original': templateArr.source == 0,'thirdParty' : templateArr.source == 1,'other' : templateArr.source == 2, 'active' : activeMaterial == templateArr}" @click.stop="showCopyrightInfo($event, templateArr)"></div>
                                </div>
                            </div>
                            <transition name="slide-up">
                                <div v-if="activeChoose && activeIndex === indexParent" class="template-content">
                                    <div class="border-line" :class="activePosition"></div>
                                    <div class="ele-template-pages" :class="{'single-slide' : singleArr.indexOf(templateType) > -1}">
                                        <div class="template-box clearfix">
                                            <div class="ele-template-page" v-for="(page, pageIdx) in nowTemplate.contents" :key="pageIdx" :style="{height : templateHight[templateType] + 'px',backgroundColor: page.themeColor}" @click="clickTemplate(nowTemplate, pageIdx)" :data-text=" pageIdx == 0 ? '正面' : '反面' ">
                                                <img :src="useClearTemplateImg(page)" class="ele-template-page-img"/>
                                                <div class="ele-template-copyright-icon" :class="{'original': nowTemplate.source == 0,'thirdParty' : nowTemplate.source == 1,'other' : nowTemplate.source == 2, 'active' : activeMaterial == page}" @click.stop="showCopyrightInfo($event, page)"></div>
                                            </div>
                                        </div>
                                        <btn class="ele-template-btn" @click="useCompleteTemplate(nowTemplate)">使用这套模板</btn>
                                    </div>
                                </div>
                            </transition>
                        </div>
                    </div>

                    <loading v-show="isLoading"></loading>
                    <div v-if="hasLoadedAll&&!noTemplate&&!isLoading" class="ele-template-tips">
                        <span class="ele-template-tips-text">这是我的底线</span>
                    </div>
                </div>
                    <div class="search-no-tip" v-show="noTemplate">
                        <div class="search-no-tip-img"></div>
                        <div class="search-no-tip-text">抱歉，没有找到<span class="search-no-tip-value">"{{lastSearchVal}}"</span>相关{{searchOption==1?'素材':'模板'}}，</div>
                        <div class="search-no-tip-text">我们已积累你的需求，换一个关键词试试？</div>
                        </div>
                </div>
            </transition>
        </div>

        <copyright v-if="showCopyright && searchOption==1" :item="activeMaterial" :position="copyrightPosition" @close="closeCopyrightInfo"></copyright>
        <template-copyright v-if="showCopyright && searchOption!=1" :item="activeMaterial" :nowTemplate="nowTemplate" :position="copyrightPosition" @close="closeCopyrightInfo"></template-copyright>
    </div>
    `,
    mixins: [Ktu.mixins.waterFall, Ktu.mixins.copyright, Ktu.mixins.TemplateAnimation],
    data() {
        return {
            typeArr: Ktu.config.search.typeArr,
            searchType: -1,

            isLoading: false,
            noResult: false,
            hasLoadedAll: false,
            showItemList: false,
            showTemplate: false,
            showPagination: false,

            // searchVal : "",
            lastestSearchs: [],
            lastestSearchsModal: [],
            lastSearchVal: '',
            materialItem: [],
            searchTotal: 0,
            specialTopic: [23, 80, 81],

            scrollTop: 0,
            nowIndex: 0,
            // 分页 每页获取数量
            materialGetLimit: 30,
            // 滚动加载 最多数量
            materialScrollLimit: 120,
            // 显示搜索类别
            showSearchOption: false,
            // 搜索类别，默认素材1，2模板
            searchOption: 1,
            // 单列显示的模板
            singleArr: [108, 201, 204, 206, 301, 307, 308, 310, 311, 406, 408],
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
            activeChoose: false,
            templateList: [],
            activeIndex: 0,
            nowTemplate: null,
            doubleTemplateList: [],
            noTemplate: false,
        };
    },
    activated() {
        this.getLaestSearch();
        if (this.searchVal && this.searchVal != this.lastSearchVal) {
            this.search();
        }
    },
    deactivated() {
        this.searchOption = 1;
        this.clear();
        /* if((this.searchOption==1&&this.materialItem.length == 0)||(this.searchOption==2&&this.templateList.length == 0)) {

        }*/
    },
    computed: {
        searchVal: {
            get() {
                return this.$store.state.base.searchMaterialValue;
            },
            set(value) {
                this.$store.state.base.searchMaterialValue = value;
            },
        },
        // 滚动加载 的 次数限制
        scrollIndexLimit() {
            return this.materialScrollLimit / this.materialGetLimit;
        },
        templateType() {
            return this.$store.state.base.templateType;
        },
        // 判断是否为需要长图动画的模板
        isSpecialTemplate() {
            return this.specialTemplates.includes(this.templateType);
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
        isFromThirdDesigner() {
            return Ktu.isFromThirdDesigner;
        },
        // 刷新素材里我的收藏列表
        shouldRefreshList: {
            get() {
                return this.$store.state.data.shouldRefreshList;
            },
            set(newValue) {
                this.$store.commit('data/changeState', {
                    prop: 'shouldRefreshList',
                    value: newValue,
                });
            },
        },
        selectedCategory: {
            get() {
                return this.$store.state.base.selectedCategory;
            },
            set(value) {
                this.$store.commit('base/changeState', {
                    prop: 'selectedCategory',
                    value,
                });
            },
        },
    },
    watch: {
        searchOption(newValue, oldValue) {
            this.nowIndex = 0;
            this.materialItem = [];
            this.templateList = [];
            this.doubleTemplateList = [];
            this.showTemplate = false;
            this.showItemList = false;
            this.searchVal = '';
            this.clear();
            if (newValue == 2) {
                this.getLaestSearchModal();
            }
        },
        templateType(val) {
            this.searchOption = 1;
            this.clear();
        },
        searchVal(val, oldVal) {
            if (val == '') {
                this.clear();
            }
        },
        shouldRefreshList(newQuestion, oldQuestion) {
            if (this.selectedCategory == 'search' && newQuestion.length > 0) {
                if (newQuestion && this.searchOption == 1 && this.searchVal) {
                    newQuestion.forEach(item => {
                        this.materialItem.forEach((info, index) => {
                            if (info.resourceId == item) {
                                // if (info.resourceId == item.resourceId) {
                                this.materialItem[index].isCollect = !this.materialItem[index].isCollect;
                            };
                        });
                    });
                }
                this.shouldRefreshList = [];
            }
        },
    },
    methods: {
        // input的值修改触发
        changeData(e) {
            this.searchVal = e.target.value;
        },
        focusInput(e) {
            e.target.value = e.target.value.replace(/[^\d]/g, '') || '';
        },
        changeSearchType(type) {
            this.searchType = type;
            if (this.searchVal) {
                this.search();
            } else {
                this.clear();
                this.searchType = type;
            }
        },
        getLaestSearch() {
            const url = '../ajax/ktuSearchRecord_h.jsp?cmd=get';

            axios.post(url, {
                type: 0,
            }).then(res => {
                const info = (res.data);
                if (info.success && info.recordList.searchList) {
                    this.lastestSearchs = JSON.parse(info.recordList.searchList).reverse();
                }
            })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => {
                    // this.isLoading = false;
                });
        },
        getLaestSearchModal() {
            const url = '../ajax/ktuSearchRecord_h.jsp?cmd=get';

            axios.post(url, {
                type: 1,
            }).then(res => {
                const info = (res.data);
                if (info.success && info.recordList.searchList) {
                    this.lastestSearchsModal = JSON.parse(info.recordList.searchList).reverse();
                }
            })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => {
                    // this.isLoading = false;
                });
        },
        lastestSearch(val) {
            this.searchVal = val;
            this.search();
            Ktu.log('searchLastValueMaterial');
        },
        lastestSearchModal(val) {
            this.searchVal = val;
            this.search();
            // Ktu.log('searchLastValueMaterial');
        },
        search() {
            this.searchVal = this.searchVal.replace(' ', '');
            if (this.searchVal == '') {
                this.$Notice.warning('请输入关键词');
                return false;
            }
            if (this.searchVal.length > 10) {
                this.$Notice.warning('关键词超过10个字符。');
                return false;
            }
            if (this.searchVal.length <= 1 && this.searchOption == 2) {
                this.$Notice.warning('关键词需大于1个字符。');
                return false;
            }
            this.nowIndex = 0;
            this.materialItem = [];
            this.templateList = [];
            this.doubleTemplateList = [];
            this.lastSearchVal = this.searchVal;
            this.showTemplate = false;
            this.showItemList = false;
            if (this.searchOption == 1) {
                this.showItemList = true;
                this.noResult = false;
                this.showPagination = false;
                this.getMaterialItem();
                if (this.lastestSearchs.indexOf(this.searchVal) < 0) {
                    this.lastestSearchs.unshift(this.searchVal);
                }
                if (this.lastestSearchs.length > 20) {
                    this.lastestSearchs.splice(20);
                }
                Ktu.log('search');
            }
            else if (this.searchOption == 2) {
                this.showTemplate = true;
                this.lastSearchVal = this.searchVal;
                this.templateList = [];
                this.doubleTemplateList = [];
                this.noTemplate = false;
                this.showPagination = false;
                this.searchTemplate();
                if (this.lastestSearchsModal.indexOf(this.searchVal) < 0) {
                    this.lastestSearchsModal.unshift(this.searchVal);
                }
                if (this.lastestSearchsModal.length > 20) {
                    this.lastestSearchsModal.splice(20);
                }
            }
        },
        clear() {
            this.activeIndex = 0;
            this.activeChoose = false;
            this.showItemList = false;
            this.showTemplate = false;
            this.searchVal = '';
            this.lastSearchVal = '';
            this.searchType = -1;
            this.materialItem = [];
            this.templateList = [];
            this.doubleTemplateList = [];
            this.nowIndex = 0;
            this.scrollTop = 0;
            this.isLoading = false;
            this.noResult = false;
            this.noTemplate = false;
            this.hasLoadedAll = false;
            this.showPagination = false;
            this.closeCopyrightInfo();
        },
        // 获取素材
        getMaterialItem() {
            const url = '../ajax/fodder_h.jsp?cmd=getFodderWithKeyWord';
            const thisSearchType = this.searchType;

            this.isLoading = true;
            this.hasLoadedAll = false;
            axios.post(url, {
                type: this.searchType,
                keyword: this.searchVal,
                getLimit: this.materialGetLimit,
                currentPage: this.nowIndex,
            }).then(res => {
                const info = (res.data);
                if (info.success) {
                    const { data } = info;
                    const tmpArr = data.hits;

                    /*
                    如果搜索慢时 还没出结果就切换 会把新数据导入新的搜索中
                    这里防止这种情况
                    */
                    if (thisSearchType != this.searchType) {
                        return false;
                    }

                    this.searchTotal = data.total_size;
                    this.materialItem.push(...tmpArr);

                    // 找不到相关关键词内容
                    if (this.searchTotal == 0) {
                        this.noResult = true;
                        Ktu.log('searchResult', 'none');
                    } else {
                        (this.nowIndex == 0) && Ktu.log('searchResult', 'have');
                        this.noResult = false;
                        // 手动调用一次滚动，防止没铺满，产生不了滚动加载
                        this.scrollLoad();
                    }

                    if ((tmpArr.length < this.materialGetLimit) || (this.searchTotal == (this.nowIndex + 1) * this.materialGetLimit)) {
                        this.hasLoadedAll = true;
                        // 虽然加载完毕 但如果不在第一页 要出现分页选择其他页
                        if (this.nowIndex >= this.scrollIndexLimit) {
                            this.showPagination = true;
                        }
                    }
                }
            })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        scrollLoad() {
            const { container } = this.$refs;
            const { slide } = this.$refs;

            this.closeCopyrightInfo();
            this.scrollTimer && window.clearTimeout(this.scrollTimer);
            this.scrollTop = container.scrollTop;
            this.scrollTimer = window.setTimeout(() => {
                // 加载完毕 返回
                if (this.hasLoadedAll) return false;
                // 滚动加载限制 数量大于等于最大加载数量 并且 少于总数量 才出现 分页选择
                if (this.materialItem.length >= this.materialScrollLimit && this.materialItem.length < this.searchTotal) {
                    this.showPagination = true;
                    return false;
                }
                if (this.showItemList && !this.isLoading && container.scrollTop + container.clientHeight >= slide.clientHeight) {
                    this.isLoading = true;
                    this.nowIndex++;
                    this.getMaterialItem();
                }
                else if (this.showTemplate && !this.isLoading && container.scrollTop + container.clientHeight >= slide.clientHeight) {
                    this.nowIndex++;
                    this.searchTemplate();
                }
            }, 50);
        },
        selectPageChange(nowPage) {
            $('.container').scrollTop(0);
            this.nowIndex = (nowPage - 1) * this.scrollIndexLimit;
            /* this.showData = [];
               this.colHeights = [0,0,0]; */
            this.materialItem = [];
            this.hasLoadedAll = false;
            this.showPagination = false;
            this.getMaterialItem();
        },
        waterItemImg(item) {
            let imgPath = item.sourceData.svgPrePath || item.sourceData.pre160ViewPath || item.sourceData.filePath;
            if (this.$store.state.base.isSupportWebp) {
                imgPath = Ktu.getWebpOrOtherImg(imgPath);
            }
            return imgPath;
        },
        searchClass(item) {
            const itemTopic = JSON.parse(item.topic);
            let specialTopic = false;
            let itemAutoHeight = false;

            itemTopic.some(topic => {
                if (this.specialTopic.indexOf(topic) >= 0) {
                    specialTopic = true;
                    return true;
                }
                return false;
            });

            if (item.category == 4) {
                itemAutoHeight = true;
            }

            return {
                'search-item-special': specialTopic,
                'search-item-auto-height': itemAutoHeight,
            };
        },
        jumpMaterial() {
            this.$store.commit('base/changeState', {
                prop: 'selectedCategory',
                value: 'material',
            });
        },
        // 使用物品
        useWaterItem(item, position) {
            debugger;
            let type = '';

            switch (item.category) {
                case 0:
                case 1:
                    type = 'image';
                    break;
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                    type = 'svg';
                    break;
                case 9:
                    type = 'imageContainer';
                    break;
            }

            const object = {
                id: item.resourceId,
                path: item.filePath,
                canCollect: true,
                isCollect: item.isCollect || false,
            };

            if (type === 'image' || type == 'imageContainer') {
                object.w = item.width;
                object.h = item.height;
            }

            if (position) {
                object.top = position.top;
                object.left = position.left;
            }

            // Ktu.log("addMaterial",this.activeItem.type);
            Ktu.log('addSysMaterial');
            // Ktu.log(`add${Ktu.utils.firstUpper(this.activeItem.type)}Topic`,this.activeTopicIndex);
            Ktu.element.addModule(type, object);
        },
        dragStart(event, img) {
            // 拖拽的时候存储拖拽值
            img.from = 'search';
            img.canCollect = true;
            Ktu.element.dragObject = img;
        },
        dragEnd(event, img) {
            const canvasRect = Ktu.edit.getEditareaSize();
            canvasRect.right = canvasRect.left + canvasRect.width;
            canvasRect.bottom = canvasRect.top + canvasRect.height;
            Ktu.element.dragObject = null;
            // 判断是否拖进编辑器内
            if (event.pageX > canvasRect.left && event.pageX < canvasRect.right && event.pageY > canvasRect.top && event.pageY < canvasRect.bottom) {
                // var viewport  = Ktu.canvas.documentArea;
                const { scale } = Ktu.edit;
                const position = {
                    /* left: (event.pageX - canvasRect.left - viewport[4]) / scale - img.w / 2,
                       top: (event.pageY - canvasRect.top - viewport[5]) / scale - img.h / 2
                       这边先不减去图片本身尺寸，需要到addModule重新计算完实际尺寸再减 */
                    left: (event.pageX - canvasRect.left - Ktu.edit.documentPosition.left) / scale,
                    top: (event.pageY - canvasRect.top - Ktu.edit.documentPosition.top) / scale,
                };
                this.useWaterItem(img, position);
            }
        },
        showOption() {
            this.showSearchOption = true;
        },
        hiddenOption() {
            this.showSearchOption = false;
        },
        // 改变搜索类别
        changeSearchOption(value) {
            this.searchOption = value;
            this.showSearchOption = false;
        },
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

                let w = 0; let h = 0;
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
        useCompleteTemplate(template) {
            this.$Modal.confirm({
                content: '使用整套模板将覆盖所有页面，是否继续?',
                onOk: () => {
                    for (let i = 0; i < template.contents.length; i++) {
                        if (Ktu.templateData[i]) {
                            this.applyTemplate(template, i, i, true);
                        }
                    }
                },
            });
        },
        searchTemplate() {
            this.isLoading = true;
            (this.nowIndex == 0) && Ktu.simpleLog('searchModal');
            if (this.templateType !== 0) {
                this.lastSearchVal = this.searchVal;
                const newArr = [];
                this.activeChoose = false;
                this.hasLoadedAll = false;
                const url = '/ajax/ktuTemplate_h.jsp';
                axios.post(url, {
                    cmd: 'searchTemplate',
                    linkType: 'keywords',
                    type: this.templateType,
                    value: this.searchVal,
                    scrollIndex: this.nowIndex,
                    limit: this.materialGetLimit,
                }).then(res => {
                    const result = (res.data);
                    if (result.success) {
                        if (result.templateList.length > 0) {
                            const { templateList } = result;
                            this.templateList = this.templateList.concat(templateList);
                            (this.nowIndex == 0) && Ktu.simpleLog('searchModalResult', 'hasData');
                            this.scrollLoad();
                        } else {
                            this.hasLoadedAll = true;
                            (this.nowIndex == 0) && Ktu.simpleLog('searchModalResult', 'noData');
                            if (this.templateList.length == 0) {
                                this.noTemplate = true;
                            }
                        }
                        if (this.singleArr.indexOf(this.templateType) <= -1) {
                            for (let i = 0, len = this.templateList.length; i < len; i += 2) {
                                newArr.push(this.templateList.slice(i, i + 2));
                            }
                        }
                        this.doubleTemplateList = newArr;
                    }
                    this.noTemplate = !(this.templateList.length > 0);
                    this.isLoading = false;
                    /* this.$nextTick(() => {
                        this.templateShowLog();
                    });*/
                })
                    .catch(function (response) {
                        this.isLoading = false;
                    });
            } else {
                this.templateList = [];
                this.doubleTemplateList = [];
                this.isLoading = false;
                this.hasLoadedAll = true;
                this.noTemplate = true;
            }
        },
        clickTemplate(template, pageIdx, isMoreContent, indexParent, indexSelf) {
            console.log('ssssss');
            const { clickTime } = this;
            this.clickTime = new Date().getTime();
            if (new Date().getTime() - clickTime < 300) {
                return;
            }
            this.nowTemplate = template;
            // console.log(template)
            const { currentPageIndex } = Ktu.template;

            if (this.activeChoose && !template.contents) {
                /* if(template.contents.length > 1){
                   this.activeChoose = true;
                   }else{ */
                this.activeChoose = false;
                // }
            } else {
                if (indexSelf >= 0) this.activeLineIndex = indexSelf;
                if (indexParent >= 0) this.activeIndex = indexParent;
                // this.activeChoose = false;

                if (!template.contents) {
                    $.getCacheScript(template.ktuFilePath, async () => {
                        /* this.$set(template, 'contents', Ktu.element.removeFontFaceId(Ktu._jsData.tmpContents));
                           使用模板需要过滤一些属性 */
                        if (Ktu._jsData.tmpContents[0].content[0].objects) {
                            for (const obj of Ktu._jsData.tmpContents[0].content[0].objects) {
                                await Ktu.element.objectFilter(obj);
                            }

                            this.$set(template, 'contents', Ktu._jsData.tmpContents);

                            if (template.contents.length > 1) {
                                this.isShowPage = true;
                                this.activeChoose = !this.activeChoose;
                            } else {
                                judgeShowModal.call(this);
                            }
                        }
                    });
                } else {
                    if (isMoreContent && template.contents.length > 1) {
                        this.isShowPage = true;
                        this.activeChoose = !this.activeChoose;
                    } else {
                        judgeShowModal.call(this);
                    }
                }

                function judgeShowModal() {
                    const nowPageData = Ktu.templateData[currentPageIndex].objects;
                    const initData = Ktu.initKtuContent[0].objects;

                    let isEmpty = false;

                    // 判断是否只有一个元素（背景）
                    if (nowPageData.length == 1) {
                        const nowPageBg = nowPageData[0];
                        const initPageBg = initData[0];
                        // 再判断三个值 颜色 透明度 是否有图片 是否初始值
                        if (nowPageBg.opacity == initPageBg.opacity && nowPageBg.backgroundColor == initPageBg.backgroundColor && nowPageBg.image == null) {
                            isEmpty = true;
                        }
                    }

                    // 判断是否空白页面 或者 是新模板内容 没修改过的
                    if (isEmpty || Ktu.selectedTemplateData.newTemplate) {
                        this.applyTemplate(template, pageIdx);
                    } else {
                        this.$Modal.confirm({
                            content: '使用模板将覆盖当前页面，是否继续?',
                            okBtnType: 'warn',
                            onOk: () => {
                                this.applyTemplate(template, pageIdx);
                            },
                        });
                    }
                }
            }
        },
        applyTemplate(template, contentsPageIdx, targetPageIdx, save) {
            Ktu.template.applyTemplate(template, contentsPageIdx, targetPageIdx, save);

            if (template.contents.length === 1) {
                this.$delete(template, 'contents');
            }

            Ktu.log('useTemplate');
            this.bssTemplateLog(template);
        },
        bssTemplateLog(template) {
            const templateId = template.id;
            const classification = Ktu.ktuData.type;
            const url = '/ajax/logBss_h.jsp';
            const data = {
                ktuId: Ktu.ktuId,
                templateId,
                classification,
                cmd: 'templateCopy',
            };
            axios.get(url, data);
        },
        clearLastest() {
            const url = '../ajax/ktuSearchRecord_h.jsp?cmd=del';
            const data = this.searchOption === 1 ? { type: 0 } : { type: 1 };
            axios.post(url, data).then(res => {
                const result = (res.data);
                if (result.success) {
                    if (this.searchOption === 1) {
                        this.lastestSearchs = [];
                    } else {
                        this.lastestSearchsModal = [];
                    }
                }
            })
                .catch(e => {
                    console.log(e);
                });
        },
        changeCollectionState(info) {
            const url = info.sourceData.isCollect ? '../ajax/ktuCollectFodder_h.jsp?cmd=del' : '../ajax/ktuCollectFodder_h.jsp?cmd=add';
            axios.post(url, {
                category: info.sourceData.category,
                resourceId: info.sourceData.resourceId,
            }).then(res => {
                const { data } = res;
                if (data.success) {
                    if (info.sourceData.isCollect) {
                        Ktu.log('collect', 'collection');
                    } else {
                        Ktu.log('collect', 'disCollection');
                    }
                    Ktu.templateData.forEach(({ objects }) => {
                        objects.forEach(item => {
                            if (item.fileId) {
                                item.fileId === info.sourceData.resourceId ? item.isCollect = !item.isCollect : '';
                            } else if (item.image) {
                                item.image.fileId == info.sourceData.resourceId ? item.isCollect = !item.isCollect : '';
                            }
                            // item.fileId ? (item.fileId === info.sourceData.resourceId ? item.isCollect = !item.isCollect : '') : (item.image ? (item.image.fileId == info.sourceData.resourceId ? item.isCollect = !item.isCollect : '') : '');
                        });
                    });
                    this.materialItem = this.materialItem.filter(item => {
                        if (item.resourceId == info.sourceData.resourceId) {
                            item.isCollect = !item.isCollect;
                        }
                        return true;
                    });
                }
            })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => {
                });
        },
    },
});
