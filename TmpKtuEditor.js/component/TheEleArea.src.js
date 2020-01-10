Vue.component('ele-area', {
    template: `
                    <aside class="ele-area" :style="{width: categoryWidth + (selectedCategory && isShowEleDetail ? detailWidth : 0) + 'px'}" v-if="isShowEle">
                        <div class="ele-area-switch" @click="switchDetail" :class="{open: selectedCategory && isShowEleDetail}">
                            <svg class="ele-area-switch-iconBg">
                                <use xlink:href="#svg-ele-shrinkBg"></use>
                            </svg>
                            <svg class="ele-area-switch-icon">
                                <use xlink:href="#svg-ele-shrink"></use>
                            </svg>
                        </div>

                        <div class="ele-area-guide">
                            <div class="ele-area-categories">
                                <div v-touch-ripple v-for="(category, index) in categories"
                                :key="index" class="ele-area-category"
                                @click="selectCategory(category.name)"
                                @mousedown="CategoryLog(category.name)"
                                v-if="!hideCategory(category.name)"
                                :class="{'selected': selectedCategory && category.name === selectedCategory && isShowEleDetail}"
                                :style="{width: categoryWidth+'px', height: categoryHeight+'px'}">
                                    <div class="ele-category-icon">
                                        <svg class="ele-category-svg">
                                            <use :class="{selected: category.name === selectedCategory}" :xlink:href="'#svg-ele-'+category.name"></use>
                                        </svg>
                                    </div>
                                    <label :style="isMIniHeight?'font-size:12px':''">{{category.title}}</label>
                                </div>
                                <template v-if="selectedCategory && isShowEleDetail">
                                    <svg class="ele-category-arc" :style="{top: categoryHeight*selectedCategoryIndex-8+'px'}">
                                        <use xlink:href="#svg-ele-arc"></use>
                                    </svg>
                                    <svg class="ele-category-arc" :style="{top: categoryHeight*(selectedCategoryIndex+1)-8+'px'}">
                                        <use xlink:href="#svg-ele-arc"></use>
                                    </svg>
                                    <div class="ele-category-topshadow" :style="{bottom: 'calc(100% - '+categoryHeight*selectedCategoryIndex+'px'}"></div>
                                    <div class="ele-category-bottomshadow" :style="{top: categoryHeight*(selectedCategoryIndex+1)+'px'}"></div>
                                </template>

                            </div>
                        </div>

                        <div class="ele-area-detail">
                            <keep-alive>
                                <component :is="(isType ? 'ele-'+isType : null)" ref="detail"></component>
                            </keep-alive>
                        </div>
                        <ele-keyboard></ele-keyboard>

                    </aside>
                `,
    /* <div v-touch-ripple class="ele-area-category ele-area-appearance" @click="switchAppearance">
       <div class="ele-category-icon">
       <svg class="ele-category-svg">
       <use :xlink:href="'#svg-ele-appearance-'+theme"></use>
       </svg>
       </div>
       </div> */

    mixins: [Ktu.mixins.Response],
    data() {
        return {
            /* categoryWidth: Ktu.config.ele.categoryWidth,
               categoryHeight: Ktu.config.ele.categoryHeight, */
            clientHeight: 0,
            detailWidth: Ktu.config.ele.detailWidth,
            isShowDetail: true,
            /* selectIndex: 0,
               transitionName: "scroll-up" */
        };
    },
    computed: {
        isShowEle() {
            return !location.search.includes('saveLoop');
        },
        isFromThirdDesigner() {
            return Ktu.isFromThirdDesigner;
        },
        // tab 选项
        categories() {
            const arr = Array.prototype.slice.call(Ktu.config.ele.categories);
            const categories = arr;
            categories.splice(0, 1);
            if (this.isFromThirdDesigner || this.pageType == 0) {
                return categories.filter(item => item.name != 'template');
            }
            return categories;
        },
        selectedCategory: {
            get() {
                this.isType = this.$store.state.base.selectedCategory;
                if (this.$store.state.base.selectedCategory == 'search') {
                    return 'material';
                }
                return this.$store.state.base.selectedCategory;
            },
            set(value) {
                this.$store.commit('base/changeState', {
                    prop: 'selectedCategory',
                    value,
                });
            },
        },
        isShowEleDetail: {
            get() {
                return this.$store.state.base.isShowEleDetail;
            },
            set(value) {
                this.$store.commit('base/changeState', {
                    prop: 'isShowEleDetail',
                    value,
                });
            },
        },
        theme() {
            return this.$store.state.base.theme;
        },
        selectedCategoryIndex() {
            let index = 0;
            this.categories.some((categorie, idx) => {
                /* if (categorie.name === 'search') {
                    console.log('a');
                    categorie.name = 'material';
                } */
                if (categorie.name === this.selectedCategory) {
                    index = idx;
                    return true;
                }
                return false;
            });
            return index;
        },
        pageType() {
            return this.$store.state.base.templateType;
        },
    },
    watch: {
        // 监听，页面类型变换时，如果是自定义类型，去掉模板tab
        pageType(newVal) {
            /* this.categories = newVal ? Ktu.config.ele.categories : _.concat(Ktu.config.ele.categories[0], Ktu.config.ele.categories.slice(2));
               let categoryName = this.selectedCategory;
               if (newVal == 0) {
               if (categoryName == 'template') {
               categoryName = 'search';
               }
               } else if (!this.isFromThirdDesigner) {
               categoryName = 'template'
               } */

            // 改为默认文本
            this.selectCategory('text');
        },
    },

    mounted() {
        // 进入编辑后需要将session的isBlankPage重置为false
        sessionStorage.setItem('isBlankPage', false);
    },

    methods: {
        hideCategory(name) {
            if (!Ktu.isDevDebug && name === 'three-config') {
                return true;
            }
            return false;
        },
        selectCategory(value, index) {
            if (!this.isShowEleDetail) {
                this.isShowEleDetail = true;
                Ktu.edit.refreshEdit(true);
            }
            if (value === 'material' && this.selectedCategory === 'material') {
                const child = this.$refs.detail;
                if (child.activeChoose) {
                    child.waterInfoInit();
                }
            }

            this.selectedCategory = value;
            /* if (index >= this.selectIndex) {
               this.transitionName = "scroll-down";
               } else {
               this.transitionName = "scroll-up";
               }
               this.selectIndex = index; */
            this.$children.forEach(item => {
                item.waterInfoInit && item.waterInfoInit();
            });
        },

        CategoryLog(value) {
            Ktu.log('clickEle', value);
        },

        switchAppearance() {
            this.$store.commit('base/changeState', {
                prop: 'theme',
                value: this.theme === 0 ? 1 : 0,
            });
            Ktu.canvas.renderMask();

            const _this = this;
            axios.post('/ajax/ktu_h.jsp?cmd=setUserOther', {
                theme: this.theme,
            }).then(res => {
                const result = (res.data);
                if (result.success) {

                }
            })
                .catch(err => {
                    _this.$Notice.error('服务繁忙，请稍后再试。');
                });
            /* this.$store.state.base.theme && this.$store.state.base.theme === 'light'
            ?
            this.$store.state.base.theme = 'dark' :
            this.$store.state.base.theme = 'light';*/
        },
        switchDetail() {
            this.isShowEleDetail = !this.isShowEleDetail;

            // 需要一个字段记录左边元素栏是否显示，便于计算编辑器的位置
            Ktu.isShowEleDetail = this.isShowEleDetail;

            Ktu.edit.refreshEdit(this.isShowEleDetail);

            Ktu.log('aside', this.isShowEleDetail ? 'openLeft' : 'closeLeft');
        },
    },
});
