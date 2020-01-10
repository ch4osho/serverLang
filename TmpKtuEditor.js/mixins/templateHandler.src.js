Ktu.mixins.templateHandler = {
    computed: {
        isReplaceAll: {
            get() {
                return this.$store.state.data.isReplaceAll;
            },
            set(newValue) {
                this.$store.commit('data/changeState', {
                    prop: 'isReplaceAll',
                    value: newValue,
                });
            },
        },
        template: {
            get() {
                return this.$store.state.data.template;
            },
            set(newValue) {
                this.$store.commit('data/changeState', {
                    prop: 'template',
                    value: newValue,
                });
            },
        },
        pageIdx: {
            get() {
                return this.$store.state.data.pageIdx;
            },
            set(newValue) {
                this.$store.commit('data/changeState', {
                    prop: 'pageIdx',
                    value: newValue,
                });
            },
        },
        currentPageIndex: {
            get() {
                return this.$store.state.data.pageIdx;
            },
            set(newValue) {
                this.$store.commit('data/changeState', {
                    prop: 'currentPageIndex',
                    value: newValue,
                });
            },
        },
        showPreviewPopup: {
            get() {
                return this.$store.state.modal.showPreviewPopup;
            },
            set(newValue) {
                this.$store.commit('modal/showPreviewPopupState', null);
            },
        },
    },
    methods: {
        replaceTemplate(pageIdx, template, currentPageIndex) {
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
            // 保留模板覆盖前数据，参数：是否单页模板
            const beforeData = this.savePageChangeData();
            // 判断是否空白页面 或者 是新模板内容 没修改过的
            if (isEmpty || Ktu.selectedTemplateData.newTemplate) {
                this.applyTemplate(template, pageIdx);
                // 存模板覆盖前后的数据
                this.saveHistoryData(beforeData);
            } else {
                this.$Modal.confirm({
                    content: '使用模板将覆盖当前页面，是否继续?',
                    onOk: () => {
                        this.applyTemplate(template, pageIdx);
                        // 存模板覆盖前后的数据
                        this.saveHistoryData(beforeData);
                    },
                });
            }
        },

        replaceTemplates(template) {
            this.$Modal.confirm({
                content: '使用整套模板将覆盖所有页面，是否继续?',
                onOk: async () => {
                    for (let i = 0; template.contents && i < template.contents.length; i++) {
                        if (Ktu.templateData[i]) {
                            this.applyTemplate(template, i, i, true, true);
                        } else {
                            try {
                                // 从尾部开始递增页面 同时传递最后一个id参数
                                await Ktu.template.addBlankPage(true, true, Ktu.ktuData.content[Ktu.ktuData.content.length - 1]);
                                this.applyTemplate(template, i, i, true, true);
                            } catch (e) {
                                console.log(e);
                            }
                        }
                    }
                },
            });
        },

        saveHistoryData(beforeData) {
            const afterData = this.savePageChangeData();
            Ktu.template.changeState({
                beforeData,
                afterData,
            });
        },

        savePageChangeData() {
            let changeData = null;
            const pageIdx = Ktu.template.currentPageIndex;
            // 构建类似于模板的数据结构 单页
            changeData = {
                /* contents: [
                    ...new Array(Ktu.templateData.length),
                ].map((occ, idx) => (idx === pageIdx ? ({
                    content: [_.cloneDeep(Ktu.templateData[idx])],
                }) : null)), */
                contents: [{
                    content: [_.cloneDeep(Ktu.templateData[pageIdx])],
                }],
            };
            // 多页
            /* changeData = {
                contents: [
                    ...new Array(Ktu.templateData.length),
                ].map((occ, idx) => ({
                    content: [_.cloneDeep(Ktu.templateData[idx])],
                })),
            }; */
            changeData.contents.forEach(page => {
                // null不需要toObject
                if (page) {
                    page.content[0].objects = page.content[0].objects.map(item => item.toObject());
                }
            });
            return changeData;
        },

        applyTemplate(template, contentsPageIdx, targetPageIdx, save, mutiTemplate) {
            Ktu.template.applyTemplate(template, contentsPageIdx, targetPageIdx, save, mutiTemplate);

            if (template.contents.length === 1) {
                this.$delete(template, 'contents');
            }

            Ktu.log('useTemplate');
            this.bssTemplateLog(template);
        },

        // 模板 使用统计
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
            axios.post(url, data);
        },
    },
};
