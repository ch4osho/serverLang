function Template() {
    let currentpageId = null;
    Object.defineProperty(this, 'currentpageId', {
        get() {
            return currentpageId;
        },
        set(value) {
            this.choosePage(value);
            currentpageId = value;
        },
    });
    /* // 判断这个页面有没有进行过操作
       Object.defineProperty(this, "newTemplate", {
       get: function () {
       return Ktu.historyManager[this.currentPageIndex].steps.length > 1 ? false : true;
       },
       }); */

    Ktu.defaultPageTmpImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAALSURBVBhXY/gPBAAJ+wP9K9UIRQAAAABJRU5ErkJggg==';
    Ktu.initKtuBackground = {
        type: 'background',
        width: parseInt(Ktu.ktuData.other.width, 10),
        height: parseInt(Ktu.ktuData.other.height, 10),
        top: 0,
        left: 0,
        clipTo: null,
        backgroundColor: 'rgba(255,255,255,1)',
        elementName: '背景',
        isLocked: true,
        fileId: '',
        isPhoto: false,
        useOwn: false,
        key: 0,
        depth: 0,
    };
    Ktu.initKtuContent = [{
        objects: [new Background(Ktu.initKtuBackground)],
    }];

    this.processTemplateList(Ktu.ktuData);

    /* toSaveCurrentPage 当我们改变currentPageId的时候，相当于切换页面，切换页面时候我们会保存当前页面
       但是有些时候改变currentPageId不一定是切换页面，也就无需保存当前页面，所以需要定义多一个变量来控制页面是否需要保存 */
    this.toSaveCurrentPage = true;

    // 是否处于添加状态中，避免快速点击或者网速慢的时候，连续添加多页页面
    this.inAddNewProcess = false;

    // 是否处于添加状态中，避免快速点击或者网速慢的时候，连续添加多页页面
    this.inCopyProcess = false;

    // 是否处于更换模板触发的choosePage
    this.inApplyTemplate = false;
};
/**
 * Template 对象用于处理页面级别的操作。包含新增，复制，删除，模板使用，页面位置交替等
 * 目前前进撤销功能还没提供，新增、复制、删除等的前进撤销队列还没增加
 * -变量 currentpageId 页面id
 */
Template.prototype = {
    /* 添加历史记录*/
    initHistory(index) {
        if (!Ktu.historyManager[index]) {
            Ktu.historyManager.splice(index, 0, new Ktu.KtuHistory());
            Ktu.historyManager[index].addStep(HistoryAction.CANVAS_INIT);
            Ktu.historyManager[index].isInit = true;
        } else if (!Ktu.historyManager[index].isInit) {
            Ktu.historyManager[index].addStep(HistoryAction.CANVAS_INIT);
            Ktu.historyManager[index].isInit = true;
        }
    },
    addHistory(index) {
        Ktu.historyManager.splice(index, 0, new Ktu.KtuHistory());
        Ktu.historyManager[index].addStep(HistoryAction.CANVAS_INIT);
        Ktu.historyManager[index].isInit = true;
    },

    /**
     * 解析所有页面出数据，将数据解析成适合svg渲染的数据
     * 初始化时调用
     */
    processTemplateList() {
        if (!Ktu.ktuData) {
            return;
        }
        Ktu.ktuData.tmpContents.forEach(c => {
            // 龙哥的PSD批量导入会带有一些空对象，这里先过滤掉
            const objects = c.content[0].objects.filter(item => !!item.type);

            const content = {};
            content.id = c.id;
            content.newTemplate = false;
            content.objects = _.cloneDeep(objects);
            // 新增更新时间到字段
            content.updateTime = c.updateTime;
            Ktu.templateData.push(content);

            // 上线的时候改这个时间
            Ktu.compat.process(content);

            if (content.objects.length == 0 || content.objects[0].type !== 'background') {
                content.objects.unshift(new Background(Ktu.initKtuBackground));
            }

            this.processTemplate(content);

            content.objects.forEach((e, i) => {
                // 组合的时候里面的key，层级也需要更新
                if (e.type === 'group') {
                    e.objects.forEach((e, i) => {
                        e.key = i;
                        e.depth = i;
                    });
                }
                e.key = i;
                e.depth = i;
            });
        });

        this.currentpageId = Ktu.ktuData.content[0];
    },
    /**
     * 解析单页
     */
    processTemplate(contentJson, isFromCopy) {
        // 如果没有背景就加一个初始化背景
        if (contentJson.objects.length == 0) {
            contentJson.objects.push(new Background(Ktu.initKtuBackground));
        }
        contentJson.objects.forEach((e, i) => {
            e.key = i;
            if (isFromCopy && e.type == 'threeText') {
                delete e.tmpKey;
            }
            contentJson.objects[i] = Ktu.element.processElement(e);
        });
    },

    /**
     * 选中某一页，在改方法中处理页面跳转后的一些回调，如缩略图图片刷新，选中元素的更改等等
     * 因为连同 currentpageId 一起更改，所以直接在currentpageId的set中调用。
     * 一般不在template对象外调用，如果需要跳转页面直接更改this.currentpageId即可
     */
    choosePage(id) {
        if (this.currentpageId === id) {
            // return;
        }
        if (Ktu.store.state.msg.isSaving) {
            Ktu.notice.warning('正在保存当前页面，请稍后！');
            return;
        }
        Ktu.activeObject && Ktu.interactive.uncheckAll();
        // 检查切换的页面是否需要开启可保存状态，使用数据恢复时
        this.checkCoverChangeNum(id);
        // 跳转页面的保存必须同步，不然影响下面的refreshPage
        this.saveCurrentPage(true);

        const index = this.getPageIndex(id);
        Ktu.selectedTemplateData = Ktu.templateData[index];
        Ktu.selectedTemplateData.objects.forEach(item => {
            if (item.type === 'threeText') {
                item.isFromtInit = true;
            }
            item.dirty = true;
        });
        // 添加元素的记录清0
        Ktu.recordAddNum = 0;
        Ktu.edit.editorImagePath = Ktu.ktuData.tmpContents[index].tmpFilePath;

        this.currentPageIndex = index;
        Ktu.store.commit('data/changeState', {
            prop: 'currentpageId',
            value: id,
        });

        Ktu.store.commit('data/changeSelectedData', null);

        this.initHistory(index);

        Ktu.store.commit('data/changeState', {
            prop: 'needCheckStep',
            value: true,
        });

        Ktu.thumb.drawImage();
    },

    /**
     * 保存当前页面
     */
    saveCurrentPage(sync, isPassive) {
        Ktu.element.checkAndExitClip();
        if (Ktu.selectedData && Ktu.selectedData.isEditing) {
            Ktu.selectedData.exitEditing();
        }
        const promise = Promise.resolve();

        if (!this.toSaveCurrentPage) {
            this.toSaveCurrentPage = true;

            return promise;
        }
        if (!isPassive && (Ktu.store.state.msg.isSaving || !Ktu.store.state.msg.hasSaveCompleted)) {
            return promise;
        }

        if (!Ktu.save.checkSave()) {
            Ktu.store.state.msg.isSaving = false;

            return promise;
        }

        if (!sync && !isPassive) {
            Ktu.store.state.msg.isSaving = true;
        }

        const pageIdx = Ktu.template.currentPageIndex;
        const id = Ktu.ktuData.content[pageIdx];
        if (id == null) {
            return promise;
        }
        const currentPageInfo = Ktu.ktuData.tmpContents[pageIdx];
        const currentPageData = Ktu.templateData[pageIdx];

        if (id !== currentPageInfo.id) {
            return promise;
        }

        return new Promise((resolve, reject) => {
            // 如果页面缩略图还没来得及刷新就保存，则需要重新生成缩略图再保存

            const saveTimer = window.setTimeout(() => {
                resolve();
                clearTimeout(saveTimer);
            }, 10000);

            if (!Ktu.edit.inrefreshTimer) {
                resolve();
            } else {
                clearTimeout(Ktu.edit.inrefreshTimer);
                Ktu.edit.getPageTmpPath(0).then(dataUrl => {
                    currentPageInfo.tmpFilePath = dataUrl;
                    resolve();
                    clearTimeout(saveTimer);
                });
            }
        }).then(() => {
            const promiseList = [];
            currentPageData.objects.forEach(item => {
                const tmpPromise = item.uploadImagePromise && item.uploadImagePromise();
                if (item.type == 'threeText' && tmpPromise) {
                    promiseList.push(tmpPromise);
                }
            });
            return Promise.all(promiseList);
        }).
            then(() => {
                // 需要在页面稳定时才生成svgData，避免图片，svg path没加载成功导致to出的svg缺失某部分
                currentPageInfo.content[0].svgData = Ktu.template.toSvg(false, pageIdx);
                return Ktu.save.savePage(sync, pageIdx);
            })
            .catch(error => {
                console.error(error);
            });
    },

    /**
     * 添加空白页面
     * 暂时没处理前进撤销
     */
    addBlankPage(isSelected = false, isApplyTemplate = false, id) {
        if (this.inAddNewProcess) {
            return Promise.resolve();
        }
        const ktuDataLen = Ktu.ktuData.content.length;
        if (ktuDataLen > 19) {
            Ktu.notice.warning('超过最大页面添加数');
            return Promise.resolve();
        }

        this.inAddNewProcess = true;

        const {
            currentPageIndex,
        } = this;

        const initKtuContent = [];

        $.extend(true, initKtuContent, Ktu.initKtuContent);

        const that = this;

        this.saveCurrentPage(false, true);

        const promise = new Promise((resolve, reject) => {
            this.addNewModule(initKtuContent, id).then(result => {
                const idList = Ktu.ktuData.content;
                // 普通新增页面在选中页面的下方 模板覆盖新增在页面的最底端
                const newIndex = !isApplyTemplate ? currentPageIndex + 1 : ktuDataLen;
                idList.splice(newIndex, 0, result.id);

                const newPageObj = {};
                newPageObj.content = initKtuContent;

                newPageObj.id = result.id;
                newPageObj.fileId = result.fileId;
                newPageObj.tmpFilePath = Ktu.defaultPageTmpImage;
                Ktu.ktuData.tmpContents.splice(newIndex, 0, newPageObj);

                const content = _.cloneDeep(newPageObj.content[0]);
                content.id = newPageObj.id;
                Ktu.templateData.splice(newIndex, 0, content);

                newPageObj.content[0].svgData = Ktu.template.toSvg(false, newIndex);

                that.toSaveCurrentPage = false;

                // that.currentpageId = result.id;

                // 需要添加一个页面历史
                that.addHistory(newIndex);
                if (!isSelected) {
                    that.currentpageId = result.id;
                }
                that.inAddNewProcess = false;
                Ktu.save.savePage(false, newIndex);

                resolve();
            });
        });

        return promise;
    },

    /**
     * 复制页面
     * 暂时没处理前进撤销
     */
    async copyPage(id) {
        if (Ktu.ktuData.content.length > 19) {
            Ktu.notice.warning('超过最大页面添加数');
            return;
        }

        const index = this.getPageIndex(id);

        this.saveCurrentPage(false, true);

        const thePageData = {};

        thePageData.id = Ktu.templateData[index].id;
        thePageData.objects = Ktu.templateData[index].objects.map(item => item.toObject());

        // 复制页面时需要做一些属性过滤处理
        for (const obj of thePageData.objects) {
            await Ktu.element.objectFilter(obj);
        }

        const copyPageData = [thePageData];

        const {
            tmpFilePath,
        } = Ktu.ktuData.tmpContents[index];

        const that = this;

        this.addNewModule(copyPageData, id).then(result => {
            const newIndex = index + 1;

            const idList = Ktu.ktuData.content;

            idList.splice(newIndex, 0, result.id);

            const newPageObj = {};
            newPageObj.content = copyPageData;
            newPageObj.id = result.id;
            newPageObj.fileId = result.fileId;
            newPageObj.tmpFilePath = tmpFilePath;

            Ktu.ktuData.tmpContents.splice(newIndex, 0, newPageObj);

            const content = _.cloneDeep(newPageObj.content[0]);
            this.processTemplate(content, true);
            Ktu.templateData.splice(newIndex, 0, content);

            Ktu.historyManager.splice(newIndex, 0, new Ktu.KtuHistory());

            that.currentpageId = result.id;

            // 复制页面后二维码需要保存获取资源路径，所以保存一下复制页面
            Ktu.save.changeSaveNum();
            this.saveCurrentPage(false, true);
        });
    },

    /**
     * 删除页面
     * 暂时没处理前进撤销
     */
    deletePage(id) {
        if (!id) {
            Ktu.notice.error('删除无效');
            return;
        }
        const idList = Ktu.ktuData.content;

        if (idList.length < 2) {
            Ktu.notice.warning('最后一页不能删除哟！');
            return;
        }

        const index = this.getPageIndex(id);

        const {
            fileId,
        } = Ktu.ktuData.tmpContents[index];

        for (let i = index; i <= idList.length; i++) {
            if (idList[i] === id) {
                idList.splice(i, 1);
                Ktu.ktuData.tmpContents.splice(i, 1);
                Ktu.templateData.splice(i, 1);
                break;
            }
        }

        /* var params = [];
           params.push("&id=" + id);
           params.push("&isNewEditor=true"); */

        /* if(Ktu.ktuData.tmpContents[0].shareFile && Ktu.ktuData.tmpContents[0].shareFile[0].fileId){
           fileId = Ktu.ktuData.tmpContents[0].shareFile[0].fileId;
           } */

        const that = this;

        const url = `../ajax/ktu_h.jsp?cmd=deleteKtuModule`;
        axios.post(url, {
            id,
            fileId,
            ktuId: Ktu.ktuId,
            idList: $.toJSON(idList),
            isNewEditor: true,
        }).then(res => {
            const result = res.data;

            if (result.success) {
                // 如果删当前页
                if (id === that.currentpageId) {
                    Ktu.save.resetSaveNum();
                    that.currentpageId = Ktu.ktuData.content[0];
                }

                that.currentPageIndex = that.getPageIndex(that.currentpageId);

                Ktu.historyManager.splice(index, 1);
                Ktu.notice.success('删除成功！');
            } else {
                Ktu.notice.error('服务繁忙，请稍后再试！');
            }
        })
            .catch(() => {
                Ktu.notice.error('服务繁忙，请稍后再试！');
            });
    },

    /**
     * 新增和复制页面时保存保存数据的方法
     */
    addNewModule(moduelData, id) {
        const idList = Ktu.ktuData.content;

        const currentPage = _.cloneDeep(moduelData);;

        const index = this.getPageIndex(id);
        Ktu.checkDataType(currentPage);

        /* var params = [];
           params.push("&content=" + Ktu.encodeUrl($.toJSON(currentPage)));
           params.push("&index=" + index); */

        const promise = new Promise((resolve, reject) => {
            const url = `/ajax/ktu_h.jsp?cmd=addKtuModule`;
            axios
                .post(url, {
                    index,
                    ktuId: Ktu.ktuId,
                    idList: JSON.stringify(idList),
                    content: JSON.stringify(currentPage),
                }).then(res => {
                    const result = res.data;
                    if (result.success) {
                        resolve(result);
                    } else {
                        Ktu.notice.error(result.msg);
                        reject();
                    }
                })
                .catch(() => {
                    Ktu.notice.error('服务繁忙，请稍后再试。');
                    reject();
                });
        });

        return promise;
    },

    /**
     * 页面拖拉
     */
    dragEnd(data) {
        const {
            oldIndex,
        } = data;
        const {
            newIndex,
        } = data;
        if (oldIndex !== newIndex) {
            const that = this;

            this.saveCurrentPage(true, true);

            const content = _.cloneDeep(Ktu.ktuData.content);

            const id = content.splice(oldIndex, 1)[0];
            content.splice(newIndex, 0, id);

            let {
                fileId,
            } = Ktu.ktuData.tmpContents[0];
            /* if(Ktu.ktuData.tmpContents[0].shareFile && Ktu.ktuData.tmpContents[0].shareFile[0].fileId){
               fileId = Ktu.ktuData.tmpContents[0].shareFile[0].fileId;
               }
               if (newIndex === 0) {
               if(Ktu.ktuData.tmpContents[oldIndex].shareFile && Ktu.ktuData.tmpContents[oldIndex].shareFile[0].fileId){
               fileId = Ktu.ktuData.tmpContents[oldIndex].shareFile[0].fileId;
               }else{
               fileId = Ktu.ktuData.tmpContents[oldIndex].fileId;
               }
               }
               if (oldIndex === 0) {
               if(Ktu.ktuData.tmpContents[1].shareFile && Ktu.ktuData.tmpContents[1].shareFile[0].fileId){
               fileId = Ktu.ktuData.tmpContents[1].shareFile[0].fileId;
               }else{
               fileId = Ktu.ktuData.tmpContents[1].fileId;
               }
               } */
            if (newIndex === 0) {
                fileId = Ktu.ktuData.tmpContents[oldIndex].fileId;
            }
            if (oldIndex === 0) {
                fileId = Ktu.ktuData.tmpContents[1].fileId;
            }

            /* 设置排序
               let params = [];
               params.push("&idList=" + encodeURIComponent($.toJSON(content)));
               params.push("&ktuId=" + (Ktu.ktuId));
               params.push("&fileId=" + encodeURIComponent(fileId));
               params.push("&isNewEditor=true"); */

            axios.post('/ajax/ktu_h.jsp?cmd=setKtuOrder', {
                isNewEditor: true,
                ktuId: Ktu.ktuId,
                fileId,
                idList: JSON.stringify(content),
            }).then(res => {
                const result = (res.data);
                if (result.success) {
                    ['content', 'tmpContents'].forEach(item => {
                        const content = Ktu.ktuData[item].splice(oldIndex, 1)[0];
                        Ktu.ktuData[item].splice(newIndex, 0, content);
                    });

                    const pageData = Ktu.templateData.splice(oldIndex, 1)[0];
                    Ktu.templateData.splice(newIndex, 0, pageData);

                    const historyInfo = Ktu.historyManager.splice(oldIndex, 1)[0];
                    Ktu.historyManager.splice(newIndex, 0, historyInfo);

                    Ktu.ktuData.fileId = fileId;

                    const pageId = Ktu.ktuData.content[newIndex];
                    that.currentPageIndex = that.getPageIndex(pageId);
                    that.currentpageId = pageId;
                } else {
                    Ktu.notice.error('服务繁忙，请稍后再试。');
                }
            })
                .catch(() => {
                    Ktu.notice.error('服务繁忙，请稍后再试。');
                });
        }
    },

    getPageIndex(id) {
        return Ktu.ktuData.content.indexOf(id ? id : this.currentpageId);
    },

    /**
     * 使用模板
     */
    applyTemplate(template, contentsPageIdx, targetPageIdx = Ktu.template.currentPageIndex, save = false, mutiTemplate = false) {
        const currentPage = Ktu.ktuData.tmpContents[targetPageIdx];
        const templatePage = template.contents[contentsPageIdx];
        const templatePageData = _.cloneDeep(templatePage.content[0]);
        // 把id也保存下来
        templatePageData.id = currentPage.id;
        currentPage.content[0] = templatePage.content[0];
        Ktu.templateData[targetPageIdx] = templatePageData;
        Ktu.compat.process(templatePageData);
        this.processTemplate(templatePageData);

        // 需放在currentpageId更改之前，变更位置时需注意
        this.inApplyTemplate = true;

        // 是否应用到当前页面 同时 渲染
        if (Ktu.template.currentPageIndex == targetPageIdx) {
            // 重新选中当前页面，在页面中更换vux的selectedTemplateData和缩略图
            this.toSaveCurrentPage = false;
            Ktu.template.currentpageId = Ktu.ktuData.content[targetPageIdx];
            Ktu.store.commit('data/changeSelectedData', null);
        }
        /* const {
            steps,
        } = Ktu.historyManager[targetPageIdx];

        Ktu.historyManager[targetPageIdx].steps = steps.slice(0, 1);
        Ktu.historyManager[targetPageIdx].currentStep = 0; */

        if (save) {
            Ktu.templateData[targetPageIdx].newTemplate = true;
        }

        // 多页模板中暂时还不支持前进后退
        if (mutiTemplate) {
            const {
                steps,
            } = Ktu.historyManager[targetPageIdx];

            Ktu.historyManager[targetPageIdx].steps = steps.slice(0, 1);
            Ktu.historyManager[targetPageIdx].currentStep = 0;
        }

        Ktu.edit.getPageTmpPath(0, targetPageIdx).then(dataUrl => {
            currentPage.tmpFilePath = dataUrl;
            if (save) {
                Ktu.save.savePage(false, targetPageIdx);
            } else {
                Ktu.save.changeSaveNum();
                Ktu.templateData[targetPageIdx].newTemplate = true;
            }
        });

        this.checkIsCollect(Ktu.templateData[targetPageIdx]);
    },
    checkIsCollect(data) {
        const fileIdList = [];
        const addToList = objects => {
            objects.forEach(object => {
                if (object.fileId) {
                    fileIdList.push(object.fileId);
                } else if (object.image && object.image.fileId) {
                    fileIdList.push(object.image.fileId);
                } else if (object.type === 'group') {
                    addToList(object.objects);
                }
            });
        };
        addToList(data.objects);
        const url = '/ajax/ktuCollectFodder_h.jsp?cmd=checkCollect';
        if (fileIdList.length) {
            axios.post(url, {
                idList: JSON.stringify(fileIdList),
            }).then(res => {
                const {
                    data,
                } = res.data;
                Ktu.templateData.forEach(({
                    objects,
                }) => {
                    data.forEach(item => {
                        let target = null;
                        const checkIsMatch = objects => objects.some(object => {
                            if (object.fileId && object.fileId === item.resourceId || object.image && object.image.fileId == item.resourceId) {
                                target = object;
                                return true;
                            }
                            if (object.type === 'group') {
                                return checkIsMatch(object.objects);
                            }
                            return false;
                        });
                        checkIsMatch(objects);
                        if (target) {
                            target.isCollect = item.isCollect;
                            target.canCollect = item.canCollect;
                        }
                    });
                    /* objects.forEach(object => {
                       data.forEach(item => {
                       if (object.fileId && object.fileId === item.resourceId) {
                       object.isCollect = item.isCollect;
                       object.canCollect = item.canCollect;
                       } else if (object.image && object.image.fileId == item.resourceId) {
                       object.isCollect = item.isCollect;
                       object.canCollect = item.canCollect;
                       }
                       });
                       }); */
                });
            });
        }
    },

    toSvg(isTest, pageIndex = this.currentPageIndex) {
        const {
            width,
        } = Ktu.edit.documentSize;
        const {
            height,
        } = Ktu.edit.documentSize;

        let contentSvg = '';
        // svg 头部 宽高，viewBox

        Ktu.templateData[pageIndex].objects.forEach(item => {
            contentSvg += `${item.toSvg(true)}\n`;
        });
        const svgHtml = `
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                version="1.1" width="${width}" height="${height}"
                viewBox="0 0 ${width} ${height}" xml:space="preserve" style="overflow: visible;">
                ${contentSvg}
            </svg>
        `;

        if (isTest) {
            $('.toSvgTest').remove();
            const wrapHtml = `<div class="f_DNSTraffic" class="toSvgTest" style="position:absolute;top:0;left:0;z-index:99;transform: scale(0.5) translate(-50%, -50%);">${svgHtml}</div>`;
            $('body').append(wrapHtml);
        }

        return svgHtml;
    },

    /**
     *
     * @param {*} data  画布的大小数据
     * @param {*} isFromUndo  是否撤销操作
     * @param {*} isAdjust  是否属于画布自定义缩放
     */
    resizePage(data, isFromUndo = false, isAdjust = false) {
        // 更改画布尺寸之前需要先进行背景脱离
        if (!isFromUndo && isAdjust) {
            Ktu.template.backgroundToImage();
        }

        // 更改画布尺寸后，清除水印信息
        this.clearMarkData();

        // 获取画布的相关单位和尺寸，带单位（cm，mm,in)
        let originalWidth = parseInt(data.originalWidth, 10);
        let originalHeight = parseInt(data.originalHeight, 10);
        const pageType = parseInt(data.id, 10);
        const unit = data.unitId || Ktu.ktuData.other.unit;

        let width = originalWidth;
        let height = originalHeight;
        const DPI = 96;
        const {
            bloodWidth,
        } = data;
        const isLockWH = pageType === 0 ? Ktu.store.state.base.isLockWH : false;

        // 计算画布的实际尺寸，不带单位（cm，mm,in)
        if (bloodWidth) {
            originalWidth += bloodWidth * 2;
            originalHeight += bloodWidth * 2;
        }

        Ktu.template.saveState();

        Ktu.ktuData.other.originalWidth = originalWidth;
        Ktu.ktuData.other.originalHeight = originalHeight;
        Ktu.ktuData.other.unit = unit;
        Ktu.ktuData.other.isLockWH = isLockWH;
        Ktu.ktuData.type = pageType;
        Ktu.store.state.base.templateType = pageType;

        if (unit == 2) {
            width = parseInt((originalWidth * DPI) / 25.4, 10);
            height = parseInt((originalHeight * DPI) / 25.4, 10);
        } else if (unit == 3) {
            width = parseInt((originalWidth * DPI) / 25.4 * 10, 10);
            height = parseInt((originalHeight * DPI) / 25.4 * 10, 10);
        } else if (unit == 4) {
            width = parseInt(originalWidth * DPI, 10);
            height = parseInt(originalHeight * DPI, 10);
        }

        Ktu.ktuData.other.width = width;
        Ktu.ktuData.other.height = height;

        Ktu.initKtuContent[0].objects[0].width = width;
        Ktu.initKtuContent[0].objects[0].height = height;

        return new Promise((resolve, reject) => {
            // 先保存other
            axios.post('/ajax/ktu_h.jsp?cmd=setKtuSize', {
                originalHeight,
                originalWidth,
                width,
                height,
                pageType,
                unit,
                ktuId: Ktu.ktuId,
                isLockWH,
            }).then(res => {
                const result = (res.data);

                if (result.success) {
                    Ktu.edit.initEdit();

                    Ktu.thumb.initThumb();

                    Ktu.store.commit('base/changeState', {
                        prop: 'isLockWH',
                        value: isLockWH,
                    });
                    // 更新元素
                    Ktu.template.resizeObjects(data, width, height, isFromUndo, isAdjust).then(() => {
                        Ktu.template.activeModify(isFromUndo);
                    });
                } else {
                    Ktu.notice.error(result.msg);
                }

                resolve();
            })
                .catch(err => {
                    console.error(err);
                });
        });
    },

    saveState() {
        // 需要对object进行处理再进行保存
        const tmpContents = _.cloneDeep(Ktu.templateData);
        tmpContents.forEach(page => {
            page.objects = page.objects.map(item => item.toObject());
        });
        this.originalState = _.cloneDeep(Ktu.ktuData.other);
        this.originalState.tmpContents = tmpContents;
        this.originalState.width = this.originalState.originalWidth;
        this.originalState.height = this.originalState.originalHeight;
        this.originalState.id = Ktu.ktuData.type;
        this.originalState.unitId = this.originalState.unit;
    },

    activeModify(fromTo) {
        // 需要对object进行处理再进行保存
        const tmpContents = _.cloneDeep(Ktu.templateData);
        tmpContents.forEach(page => {
            page.objects = page.objects.map(item => item.toObject());
        });
        this.currentState = _.cloneDeep(Ktu.ktuData.other);
        this.currentState.tmpContents = tmpContents;
        this.currentState.id = Ktu.ktuData.type;
        this.currentState.unitId = this.currentState.unit;

        if (!fromTo) {
            const pageHistoryStep = Ktu.historyManager[Ktu.template.currentPageIndex].addStep(HistoryAction.PAGESIZE_CHANGED);
            pageHistoryStep.beforeChange(this.originalState);
            pageHistoryStep.afterChange(this.currentState);
        }
    },
    hasLoaded() {
        // onload后再去load图片原图
        const loadOriginImg = objects => {
            objects.forEach(object => {
                if ((object.type === 'cimage') && !object.hasLoaded) {
                    object.loadOriginImg();
                }
                if ((object.type === 'background') && object.image && object.image.src) {
                    object.loadOriginImg();
                }
                if (object.type === 'group') {
                    loadOriginImg(object.objects);
                }
            });
        };
        Ktu.templateData.forEach(template => {
            loadOriginImg(template.objects);
        });

        // 加载默认字体文件
        /*
        const fontFace = new FontFace('Source Han Sans CN Regular', `url(${Ktu.initialData.resRoot}/css/fonts/SourceHanSansCN-Regular.woff2)`);
        fontFace.load().then(loadedFace => {
            document.fonts.add(loadedFace);
        });
        */
        Ktu.indexedDB.openPromise.then(res => {
            if (!Ktu.indexedDB.isOpened) {
                return;
            }
            // 默认字体id为58
            const fontIdList = [58, -3];
            const promiseList = fontIdList.reduce((currentArr, fontId) => {
                if (!Ktu.indexedDB.hasFont(fontId)) {
                    const promise = new Promise((resolve, reject) => {
                        Ktu.indexedDB.get('fonts', fontId).then(res => {
                            if (res) {
                                // 加载缓存完整字体
                                Ktu.indexedDB.blobToArrayBuffer(res.file, fontId).then(file => {
                                    const fontFace = new FontFace(res.fontName, file);
                                    fontFace.load().then(loadedFace => {
                                        // console.log('字体加载成功');
                                        document.fonts.add(loadedFace);
                                        // 插入字体列表
                                        Ktu.indexedDB.addFont(res);
                                        resolve();
                                    });
                                })
                                    .catch(err => {
                                        console.log(err);
                                    });
                            } else {
                                // 下载完整字体文件
                                Ktu.indexedDB.downloadFont(fontId).then(() => {
                                    resolve();
                                });
                                // console.log('正在下载默认字体字体!');
                            }
                        });
                    });
                    currentArr.push(promise);
                }
                return currentArr;
            }, []);
            // 默认字体加入document.fonts后重新计算字体位置。
            Promise.all(promiseList).then(() => {
                const recalculationText = objects => {
                    objects.forEach(object => {
                        if (object instanceof Text) {
                            object.hasChanged = true;
                            object.dirty = true;
                        } else if (object.type === 'group') {
                            recalculationText(object.objects);
                        }
                    });
                };
                recalculationText(Ktu.selectedTemplateData.objects);
            });
        });

        // 加载延迟js
        const lazyJsNames = Object.keys(Ktu.lazyJSPath);
        lazyJsNames.forEach(n => {
            $('body').append(`<script src=${Ktu.lazyJSPath[n]}></script>`);
        });
        // 进入编辑后需要将localStorage的isBlankPage重置为false
        localStorage.setItem('isBlankPage', false);
    },
    checkCoverChangeNum(id) {
        if (Ktu.save.hasLocalPageData
            && Ktu.save.coverPageIdArr.indexOf(id) !== -1) {
            setTimeout(() => {
                Ktu.save.changeSaveNum();
                !this.inApplyTemplate && this.changeCoverNum(true);
                this.inApplyTemplate = false;
            }, 0);
        } else {
            this.inApplyTemplate = false;
        }
    },
    coverTemplate(localPageData) {
        const ktuDataContents = Ktu.ktuData.tmpContents;
        localPageData.forEach((ld, idx) => {
            for (const kd of ktuDataContents) {
                if (ld.pageId === kd.id) {
                    // 替换源数据里的objects
                    kd.content[0].objects = ld.objects;
                    // 缩略图也保存 恢复初始化时加载
                    kd.tmpFilePath = ld.tmpFilePath;
                    // 添加开启可保存识别pageId
                    Ktu.save.addCoverPageId(ld.pageId);
                    break;
                }
            }
        });

        // 置空当前template的数据
        Ktu.templateData = [];
        // 重新初始化
        this.processTemplateList();
        // 检查是否开启可保存
        this.checkCoverChangeNum(this.currentpageId);
        Ktu.log('reCoverPageData', 'reCoverFinish');
    },

    // 更改画布尺寸后画布内容自适应
    resizeObjects(data, width, height, isFromUndo, isAdjust = false) {
        // 取消元素的选中，避免一些框选错误
        Ktu.interactive.uncheckAll();
        return new Promise((resolve, reject) => {
            const promiseList = [];
            Ktu.templateData.forEach((object, index) => {
                object.newTemplate = false;
                const promise = setObjectSize(object, index, isFromUndo, isAdjust, data);
                promiseList.push(promise);

                object.objects.forEach(item => {
                    delete item.canvas;
                });
            });

            Promise.all(promiseList).then(() => {
                resolve();
            })
                .catch(error => {
                    reject();
                    console.log(error);
                });
        });

        // 设置背景尺寸
        function setObjectSize(object, index, isFromUndo, isAdjust, data) {
            const bgObj = object.objects[0];
            return new Promise((resolve, reject) => {
                if (isFromUndo) {
                    // 前进撤销需要对object进行processElement操作
                    if (data.tmpContents[index]) {
                        object.objects = data.tmpContents[index].objects.map(item => Ktu.element.processElement(item));
                    } else {
                        bgObj.width = width;
                        bgObj.height = height;
                        object.objects = Ktu.templateData[index].objects.map(item => Ktu.element.processElement(item));
                    }

                    bgObj.dirty = true;
                    bgObj.setCoords();

                    Ktu.edit.getPageTmpPath(0, index).then(dataUrl => {
                        const promiseList = [];
                        if (index == Ktu.template.currentPageIndex) {
                            Ktu.edit.editorImagePath = dataUrl;
                            Ktu.thumb.drawImage();
                            object.objects.forEach(item => {
                                const tmpPromise = item.uploadImagePromise && item.uploadImagePromise();
                                if (item.type == 'threeText' && tmpPromise) {
                                    promiseList.push(tmpPromise);
                                }
                            });
                        }
                        if (promiseList.length > 0) {
                            Promise.all(promiseList).then(() => {
                                Ktu.ktuData.tmpContents[index].tmpFilePath = dataUrl;
                                Ktu.ktuData.tmpContents[index].content[0].svgData = Ktu.template.toSvg(false, index);
                                Ktu.save.savePage(false, index);
                            });
                        } else {
                            Ktu.ktuData.tmpContents[index].tmpFilePath = dataUrl;
                            Ktu.ktuData.tmpContents[index].content[0].svgData = Ktu.template.toSvg(false, index);
                            Ktu.save.savePage(false, index);
                        }
                    });
                    resolve();
                } else {
                    bgObj.width = width;
                    bgObj.height = height;

                    if (!isAdjust) {
                        if (bgObj.angle === 90 || bgObj.angle === 270) {
                            [bgObj.width, bgObj.height] = [bgObj.height, bgObj.width];
                        }

                        bgObj.setCoords();
                        bgObj.dirty = true;
                    } else {
                        // 更新层级（预防元素的增减）
                        refreshElementKey(object);

                        // 背景旋转后处理
                        if (bgObj.angle !== 0) {
                            bgObj.angle = 0;
                            bgObj.top = 0;
                            bgObj.left = 0;
                        };

                        bgObj.setCoords();
                        bgObj.dirty = true;

                        // 保证除了背景还有其他元素
                        if (object.objects.length > 1) {
                            resizeMulti(object, index);
                        }
                    }

                    bgObj.refreshImage().then(() => {
                        Ktu.edit.getPageTmpPath(0, index).then(dataUrl => {
                            const promiseList = [];
                            if (index == Ktu.template.currentPageIndex) {
                                Ktu.edit.editorImagePath = dataUrl;
                                Ktu.thumb.drawImage();
                                object.objects.forEach(item => {
                                    const tmpPromise = item.uploadImagePromise && item.uploadImagePromise();
                                    if (item.type == 'threeText' && tmpPromise) {
                                        promiseList.push(tmpPromise);
                                    }
                                });
                            }
                            if (promiseList.length > 0) {
                                Promise.all(promiseList).then(() => {
                                    Ktu.ktuData.tmpContents[index].tmpFilePath = dataUrl;
                                    Ktu.ktuData.tmpContents[index].content[0].svgData = Ktu.template.toSvg(false, index);
                                    Ktu.save.savePage(false, index);
                                });
                            } else {
                                Ktu.ktuData.tmpContents[index].tmpFilePath = dataUrl;
                                Ktu.ktuData.tmpContents[index].content[0].svgData = Ktu.template.toSvg(false, index);
                                Ktu.save.savePage(false, index);
                            }
                        });

                        bgObj.setCoords();
                        resolve();
                    });
                }
            });
        };

        // 更新层级顺带解锁
        function refreshElementKey(object) {
            object.objects.forEach((e, i) => {
                // 组合的时候里面的key，层级也需要更新
                if (e.type === 'group') {
                    e.objects.forEach((e, i) => {
                        e.key = i;
                        e.depth = i;
                        e.isLocked = false;
                        e.isSelected = false;
                    });
                }
                e.key = i;
                e.depth = i;

                // 除背景之外全部元素解锁,取消选择
                if (e.type !== 'background') {
                    e.isLocked = false;
                    e.isSelected = false;
                }
            });
        };

        // 转换成多选并且计算缩放值
        function resizeMulti(object, index) {
            const objects = object.objects.slice(1);

            const multi = new Multi({
                objects,
            });

            // 整体缩放值，所有元素包括多选都是应用这个缩放值
            const totalScaleX = width / multi.width * multi.scaleX;
            const totalScaleY = height / multi.height * multi.scaleY;
            const totalScale = totalScaleX < totalScaleY ? totalScaleX : totalScaleY;

            // 注意某些元素要特殊处理（例如line）
            const turn = (object, index) => {
                if (object.type === 'line') {
                    object.width = object.width * totalScale < 1 ? 1 : object.width * totalScale;
                    object.strokeWidth = object.strokeWidth * object.scaleY * totalScale < 1 ? 1 / object.scaleY : Math.round(object.strokeWidth * totalScale);
                    // object.height = object.height * totalScale;
                } else if (object.type === 'textbox' || object.type === 'wordart' || object.type === 'threeText') {
                    object.scaleX = object.fontSize * object.scaleX * totalScale < 1 ? 1 / object.fontSize : object.scaleX * totalScale;
                    object.scaleY = object.scaleX;
                    if (object.type === 'threeText') {
                        object.isFromtInit = true;
                        object.width *= object.scaleX;
                        object.height *= object.scaleY;
                        object.fontSize *= object.scaleX;
                        object.scaleX = 1;
                        object.scaleY = 1;
                    }
                } else {
                    // 有描边的也要处理
                    if (object.strokeWidth) {
                        if (object.type === 'table') {
                            object.strokeWidth = Math.round(object.strokeWidth * totalScale) > 20 ? 20 : Math.round(object.strokeWidth * totalScale);
                        } else {
                            object.strokeWidth = Math.round(object.strokeWidth * totalScale);
                        }
                    }
                    object.scaleX = object.width * object.scaleX * totalScale < 1 ? 1 / object.width : object.scaleX * totalScale;
                    object.scaleY = object.height * object.scaleY * totalScale < 1 ? 1 / object.height : object.scaleY * totalScale;
                }

                object.left = object.left * totalScale;
                object.top = object.top * totalScale;
                object.isSelected = false;

                if (object.type === 'group') {
                    object.objects.forEach(obj => {
                        if (obj.type === 'line') {
                            obj.width = obj.width * object.scaleX < 1 ? 1 / object.scaleX : obj.width;
                            obj.strokeWidth = obj.strokeWidth * obj.scaleY * object.scaleY < 1 ? 1 / obj.scaleY / object.scaleY : obj.strokeWidth;
                        } else if (obj.type === 'textbox' || obj.type === 'wordart') {
                            obj.scaleX = obj.fontSize * obj.scaleX * object.scaleX < 1 ? 1 / obj.fontSize / object.scaleX : obj.scaleX;
                            obj.scaleY = obj.scaleX;
                        } else {
                            // 有描边的也要处理
                            if (obj.strokeWidth) {
                                if (obj.type === 'table') {
                                    obj.strokeWidth = Math.round(obj.strokeWidth / object.scaleY * totalScale) > 20 ? 20 : Math.round(obj.strokeWidth / object.scaleY * totalScale);
                                } else {
                                    obj.strokeWidth = Math.round(obj.strokeWidth / object.scaleY * totalScale);
                                }
                            }
                            obj.scaleX = obj.width * obj.scaleX * object.scaleX < 1 ? 1 / obj.width / object.scaleX : obj.scaleX;
                            obj.scaleY = obj.height * obj.scaleY * object.scaleY < 1 ? 1 / obj.height / object.scaleY : obj.scaleY;
                        }
                    });
                    object.updateSizePosition();
                }

                object.setCoords();
            };
            multi.objects.forEach(turn);
            turn(multi);

            multi.setCoords();
            multi.setPosition('center', false);
            multi.dirty = true;

            // 取消元素的选中，避免一些框选错误
            Ktu.interactive.uncheckAll();
        };
    },

    // 背景脱离画布
    backgroundToImage() {
        Ktu.templateData.forEach((object, index) => {
            const bgObj = object.objects[0];

            // 保存脱离背景时的历史记录
            let beforeData = null;
            let imgObj = null;

            // 有背景有图片将背景转换成图片
            if (bgObj.image) {
                const obj = {};
                obj.type = 'cimage';
                obj.top = bgObj.top;
                obj.left = bgObj.left;
                obj.width = bgObj.width;
                obj.height = bgObj.height;
                obj.scaleX = bgObj.scaleX;
                obj.scaleY = bgObj.scaleY;
                obj.angle = bgObj.angle;
                obj.flipX = bgObj.flipX;
                obj.flipY = bgObj.flipY;
                obj.opacity = bgObj.opacity;
                obj.image = _.clone(bgObj.image);
                obj.filters = _.cloneDeep(bgObj.filters);
                obj.depth = 1;

                const imgObject = new Cimage(obj);

                object.objects.splice(1, 0, imgObject);

                // 处理作历史记录存储
                imgObj = imgObject.toObject();
                imgObj.from = 'background';
                beforeData = [bgObj.toObject(), imgObj];
            }

            // 清空背景
            bgObj.image = null;
            bgObj.dirty = true;
            bgObj.setCoords();

            // 保存历史
            if (beforeData && imgObj) {
                const afterData = [bgObj.toObject(), imgObj];
                saveHistory(beforeData, afterData, index);
            }

            // 更改画布保存脱离背景前的历史操作
            function saveHistory(beforeData, afterData, index) {
                const newHistoryStep = Ktu.historyManager[index].addStep(HistoryAction.OBJECT_GROUP);
                newHistoryStep.beforeChange(beforeData);
                newHistoryStep.afterChange(afterData);
            }
        });
    },

    changeCoverNum(newValue) {
        Ktu.store.commit('data/changeState', {
            prop: 'coverChangeNum',
            value: newValue,
        });
    },
    changeState({
        beforeData,
        afterData,
    }) {
        const newHistoryStep = Ktu.historyManager[this.currentPageIndex].addStep(HistoryAction.PAGE_CHANGED);
        newHistoryStep.beforeChange(beforeData);
        newHistoryStep.afterChange(afterData);
        // Ktu.save.changeSaveNum();
    },
    loadPageHistoryData(action, data) {
        if (action === HistoryAction.PAGE_CHANGED) {
            // 模板的覆盖
            if (data.contents) {
                this.applyTemplate(data, 0);
            } else {
                this.coverTemplate(data);
            }
        }
    },
    clearMarkData() {
        // 清除水印信息
        Ktu.store.commit('data/changeState', {
            prop: 'markSvg',
            value: '',
        });
        Ktu.store.commit('data/changeState', {
            prop: 'markData',
            value: {},
        });
    },
};
