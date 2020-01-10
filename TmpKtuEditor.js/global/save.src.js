(function () {
    class SaveAnimation {
        constructor() {
            this.config = {
                width: 100,
                height: 60,
                icon: {
                    width: 26,
                    height: 26,
                    enabled: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNiAyNiIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgZmlsbD0iI2ZmNzczMyI+DQoJPHBhdGggZD0iTTE4LDZIOEM2LjksNiw2LDYuOSw2LDh2MTBjMCwxLjEsMC45LDIsMiwyaDJoNmgyYzEuMSwwLDItMC45LDItMnYtMnYtNFY5VjhDMjAsNi45LDE5LjEsNiwxOCw2eiBNMTUsMTBoLTRWOGg0VjEwek0xOCwxOEg4VjhoMXY0aDFoMWg0aDFoMVY4aDFWMTh6Ii8+DQoJPHJlY3QgeD0iMTUiIHk9IjE1IiB3aWR0aD0iMiIgaGVpZ2h0PSIyIi8+DQo8L3N2Zz4NCg==',
                    disabled: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNiAyNiIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgZmlsbD0iI2JlYzFjNyI+DQoJPHBhdGggZD0iTTE4LDZIOEM2LjksNiw2LDYuOSw2LDh2MTBjMCwxLjEsMC45LDIsMiwyaDJoNmgyYzEuMSwwLDItMC45LDItMnYtMnYtNFY5VjhDMjAsNi45LDE5LjEsNiwxOCw2eiBNMTUsMTBoLTRWOGg0VjEwek0xOCwxOEg4VjhoMXY0aDFoMWg0aDFoMVY4aDFWMTh6Ii8+DQoJPHJlY3QgeD0iMTUiIHk9IjE1IiB3aWR0aD0iMiIgaGVpZ2h0PSIyIi8+DQo8L3N2Zz4NCg==',
                },
                color: {
                    enabled: {
                        border: '#ff884d',
                        content: '#ff884d',
                        background: '#feefe4',
                    },
                    disabled: {
                        border: '#dddee1',
                        content: '#bec1c7',
                        background: '#f7f7f7',
                    },
                },
            };
            this.ctx = null;
            this.state = 'enabled';
            this.duration = 200;
        }
        loadImage() {
            const imagesName = ['enabled', 'disabled'];
            let hasLoadedNum = 0;
            const hasLoaded = () => {
                hasLoadedNum++ === imagesName.length && this.initFirstFrame();
            };
            imagesName.forEach(name => {
                const image = new Image();
                image.onload = () => {
                    hasLoaded();
                };
                image.src = this.config.icon[name];
                this[`${name}Image`] = image;
            });
        }
        clear() {
            const {
                width,
                height,
            } = this.config;
            this.ctx.clearRect(-width / 2, -height / 2, width, height);
            this.ctx.fillStyle = '#fff';
            this.ctx.clearRect(-width / 2, -height / 2, width, height);
            this.ctx.fillRect(-width / 2, -height / 2, width, height);
        }
        shrink(shrinkData) {
            this.clear();
            const { ctx } = this;
            ctx.save();
            const {
                width,
                height,
            } = this.config;
            const radius = height / 3 - 1;
            const {
                content,
                background,
            } = this.config.color[this.state];

            ctx.globalAlpha = shrinkData.opacity;
            ctx.beginPath();
            ctx.arc(-shrinkData.btnRadius, 0, radius, Math.PI / 2, Math.PI * 3 / 2);
            ctx.lineTo(shrinkData.btnRadius, -radius);
            ctx.arc(shrinkData.btnRadius, 0, radius, Math.PI * 3 / 2, Math.PI / 2);
            ctx.closePath();
            ctx.fillStyle = background;
            ctx.fill();

            const iconWidth = this.config.icon.width;
            const iconHeight = this.config.icon.height;
            ctx.drawImage(this[`${this.state}Image`], -(width / 2 - radius) - 1, -iconHeight / 2, iconWidth, iconHeight);

            ctx.fillStyle = content;
            ctx.font = '14px Microsoft YaHei';
            // ctx.textAlign = "center";
            ctx.textBaseline = 'middle';
            ctx.fillText('保存', -4, 0);

            ctx.globalAlpha = 1;
            ctx.strokeStyle = shrinkData.borderColor;
            ctx.stroke();

            ctx.restore();
        }
        ring(ringData) {
            this.clear();
            const {
                height,
            } = this.config;
            const radius = height / 4;
            const { ctx } = this;
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.strokeStyle = this.config.color.disabled.border;
            ctx.stroke();
            /* ctx.restore();
               ctx.save(); */
            ctx.beginPath();
            ctx.arc(0, 0, radius - 1, ringData.startAngle, ringData.startAngle + Math.PI / 2);
            ctx.lineWidth = 2;
            ctx.strokeStyle = this.config.color.enabled.border;
            ctx.stroke();
            ctx.restore();
        }
        tick(tickData) {
            this.clear();
            const {
                height,
            } = this.config;
            const radius = height / 4;
            const { ctx } = this;
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.strokeStyle = this.config.color.disabled.border;
            ctx.stroke();
            ctx.beginPath();
            ctx.globalAlpha = tickData.opacity;
            ctx.moveTo(tickData.point[0][0], tickData.point[0][1]);
            if (tickData.point[1]) {
                ctx.lineTo(tickData.point[1][0], tickData.point[1][1]);
            }
            if (tickData.point[2]) {
                ctx.lineTo(tickData.point[2][0], tickData.point[2][1]);
            }
            ctx.lineWidth = 2;
            ctx.strokeStyle = this.config.color.enabled.border;
            ctx.stroke();
            ctx.restore();
        }
        start() {
            this.ctx.canvas.style.display = 'inline';
            this.startTime = Date.now();
            const {
                width,
                height,
            } = this.config;
            const radius = height / 4;
            const shrinkData = {
                opacity: 1,
                btnRadius: width / 2 - radius,
                btnRadiusMin: 0,
                borderColor: this.config.color.enabled.border,
            };
            let timer;
            const step = this.duration / 16.5;

            // let shrinkData = JSON.parse(JSON.stringify(shrinkData));
            const btnRadiusOffset = (shrinkData.btnRadius - shrinkData.btnRadiusMin) / step;
            const opacityOffset = 1 / step * 2;
            const shrink = () => {
                timer = window.requestAnimationFrame(shrink);
                if (shrinkData.btnRadius > shrinkData.btnRadiusMin) {
                    this.shrink(shrinkData);
                    shrinkData.opacity -= opacityOffset;
                    shrinkData.opacity < 0 && (shrinkData.opacity = 0);
                    shrinkData.btnRadius -= btnRadiusOffset;
                    console.log(shrinkData);

                    shrinkData.btnRadius < shrinkData.btnRadiusMin && (shrinkData.btnRadius = shrinkData.btnRadiusMin);
                } else {
                    shrinkData.borderColor = this.config.color.disabled.border;
                    this.shrink(shrinkData);
                    window.cancelAnimationFrame(timer);
                    ring();
                }
            };

            const ringData = {
                startAngle: 3 * Math.PI / 2,
            };
            const ring = () => {
                this.ringTimer = window.requestAnimationFrame(ring);
                this.ring(ringData);
                ringData.startAngle += Math.PI / 18;
            };

            shrink();
        }
        stop() {
            const stop = () => {
                window.cancelAnimationFrame(this.ringTimer);
                this.clear();
                const completedPoint = [
                    [-8, 0],
                    [-2, 5],
                    [7, -5],
                ];

                const tickData = {
                    opacity: 1,
                    point: [
                        [-8, 0],
                    ],
                };

                let step = this.duration / 16.5 / 2;
                const firstOffsetX = (completedPoint[0][0] - completedPoint[1][0]) / step;
                const firstOffsetY = (completedPoint[0][1] - completedPoint[1][1]) / step;

                const secontOffsetX = (completedPoint[1][0] - completedPoint[2][0]) / step;
                const secontOffsetY = (completedPoint[1][1] - completedPoint[2][1]) / step;

                let timer;
                let stopTime = 0;
                const tick = () => {
                    timer = window.requestAnimationFrame(tick);
                    this.tick(tickData);
                    if (!tickData.firstLineCompleted) {
                        !tickData.point[1] && (tickData.point[1] = JSON.parse(JSON.stringify(tickData.point[0])));
                        tickData.point[1][0] -= firstOffsetX;
                        tickData.point[1][1] -= firstOffsetY;
                        if (tickData.point[1][0] > completedPoint[1][0] || tickData.point[1][1] > completedPoint[1][1]) {
                            tickData.point[1][0] = completedPoint[1][0];
                            tickData.point[1][1] = completedPoint[1][1];
                            tickData.firstLineCompleted = true;
                        }
                    } else if (!tickData.secondLineCompleted) {
                        !tickData.point[2] && (tickData.point[2] = JSON.parse(JSON.stringify(tickData.point[1])));
                        tickData.point[2][0] -= secontOffsetX;
                        tickData.point[2][1] -= secontOffsetY;
                        if (tickData.point[2][0] > completedPoint[2][0] || tickData.point[2][1] < completedPoint[2][1]) {
                            tickData.point[2][0] = completedPoint[2][0];
                            tickData.point[2][1] = completedPoint[2][1];
                            stopTime++;
                            stopTime * 16.5 > 300 && (tickData.secondLineCompleted = true);
                        }
                    } else if (!tickData.disapearCompleted) {
                        tickData.opacity -= .08;
                        if (tickData.opacity < 0) {
                            tickData.opacity = 0;
                            tickData.disapearCompleted = true;
                        }
                    } else {
                        window.cancelAnimationFrame(timer);
                        shrink();
                    }
                };
                tick();

                this.state = 'disabled';
                const {
                    width,
                    height,
                } = this.config;
                const radius = height / 4;
                const shrinkData = {
                    opacity: 0,
                    btnRadius: 0,
                    btnRadiusMax: width / 2 - radius,
                    borderColor: this.config.color.disabled.border,
                };
                step = this.duration / 16.5;

                // let tmpShrinkData = JSON.parse(JSON.stringify(shrinkData));
                const btnRadiusOffset = (shrinkData.btnRadius - shrinkData.btnRadiusMax) / step;
                const opacityOffset = 1 / step / 2;
                const shrink = () => {
                    timer = window.requestAnimationFrame(shrink);
                    if (shrinkData.btnRadius < shrinkData.btnRadiusMax) {
                        this.shrink(shrinkData);
                        shrinkData.opacity += opacityOffset;
                        shrinkData.opacity > 1 && (shrinkData.opacity = 1);
                        shrinkData.btnRadius -= btnRadiusOffset;
                        shrinkData.btnRadius > shrinkData.btnRadiusMax && (shrinkData.btnRadius = shrinkData.btnRadiusMax);
                    } else {
                        shrinkData.borderColor = this.config.color.disabled.border;
                        this.shrink(shrinkData);
                        window.cancelAnimationFrame(timer);
                        this.state = 'enabled';
                        this.ctx.canvas.style.display = 'none';
                        Ktu.store.state.msg.hasSaveCompleted = true;
                    }
                };
            };

            const timeOffset = Date.now() - this.startTime;
            if (timeOffset < this.duration * 6) {
                window.setTimeout(() => {
                    stop();
                }, this.duration * 6 - timeOffset);
            } else {
                stop();
            }
        }
        init() {
            const canvas = document.getElementById('saveAnimation');
            this.ctx = canvas.getContext('2d');
            const {
                width,
                height,
            } = this.config;
            const radius = height / 4;
            // 画笔起始点移到中心
            this.ctx.translate(width / 2, height / 2);
            this.loadImage();
            this.shrink(1, width / 2 - radius);
        }
    }

    class Save extends SaveAnimation {
        constructor() {
            super();
            // 用于处理自动保存的定时器
            this.autoSaveTimer1 = null;
            this.autoSaveTimer2 = null;
            // 响应式支持
            let saveChangedNum = 0;
            Object.defineProperty(this, 'saveChangedNum', {
                get() {
                    return saveChangedNum;
                },
                set(newValue) {
                    saveChangedNum = newValue;
                    Ktu.store.commit('msg/update', {
                        prop: 'saveChangedNum',
                        value: newValue,
                    });
                },
            });
            // 本地是否存在当前页面缓存
            this.hasLocalPageData = false;
            // 记录是否失败后的手动点击保存
            this.saveFailedState = 0;
            let showSaveFailedTips = false;
            Object.defineProperty(this, 'showSaveFailedTips', {
                get() {
                    return showSaveFailedTips;
                },
                set(newValue) {
                    showSaveFailedTips = newValue;
                    Ktu.store.commit('data/changeState', {
                        prop: 'showSaveFailedTips',
                        value: newValue,
                    });
                },
            });
            this.coverPageIdArr = [];
            // 当前点击是否是手动触发
            this.isClickSave = false;
        }

        isAutoSave() {
            return Ktu.userData.other.isAutoSave;
        }
        hasCoverPage() {
            return Ktu.store.state.data.hasCoverPage;
        }
        isFaier() {
            return Ktu.isFaier;
        }
        changeSaveNum() {
            this.saveChangedNum++;
            Ktu.selectedTemplateData.newTemplate = false;
            this.hasCoverPage() && Ktu.template.changeCoverNum(false);
            Ktu.edit.refreshPageTmpImage(Ktu.template.currentPageIndex);
            this.currentChangePageIndex = Ktu.template.currentPageIndex;
        }
        changeLocalPageState(value) {
            this.hasLocalPageData = value;
        }
        changeClickSaveState(value) {
            this.isClickSave = value;
        }
        addCoverPageId(pageId) {
            this.coverPageIdArr.push(pageId);
        }
        romoveCoverPageId(pageId) {
            const idx = this.coverPageIdArr.indexOf(pageId);
            if (idx !== -1) {
                this.coverPageIdArr.splice(idx, 1);
            }
        }
        resetSaveNum() {
            this.saveChangedNum = 0;
        }
        checkSave() {
            if (!this.saveChangedNum) {
                return false;
            }
            return true;
        }
        // 本地页面缓存管理 获取localPageData以及一些id数据
        getLocalPageData(pageId) {
            const localPageData = JSON.parse(localStorage.getItem('localPageData')) || [];
            // 缓存作品标识
            const localItemId = parseInt(`${Ktu.ktuAid}${Ktu.ktuId}`, 10);
            // 缓存作品内单个页面标识 唯一标识 作品标识 + pageId
            const localObjId = parseInt(`${localItemId}${pageId}`, 10);
            // 返回对象解构
            return {
                localPageData,
                localItemId,
                localObjId,
            };
        }
        setLocalData(key, data, saveFailedSet = false) {
            localStorage.setItem(key, JSON.stringify(data));
            if (saveFailedSet) {
                Ktu.simpleLog('saveFailed', 'bulidLocalPageData');
                Ktu.simpleLog('saveFailedGroup');
            }
        }
        autoSave() {
            this.autoSaveTimer1 && window.clearInterval(this.autoSaveTimer1);
            this.autoSaveTimer2 && window.clearInterval(this.autoSaveTimer2);
            if (this.isAutoSave() && !this.isFaier()) {
                this.autoSaveTimer1 = window.setInterval(() => {
                    // 当选择元素被编辑中不自动保存
                    if (Ktu.activeObject && !Ktu.activeObject.isEditing && !Ktu.activeObject.isClipMode) {
                        Ktu.template.saveCurrentPage();
                    }
                }, 20000);

                this.autoSaveTimer2 = window.setInterval(() => {
                    !Ktu.activeObject && Ktu.template.saveCurrentPage();
                }, 5000);
            }
        }
        hasOverSize(str) {
            const buf = new ArrayBuffer(str.length * 2);
            const bufView = new Uint8Array(buf);
            for (let i = 0, strlen = str.length; i < strlen; i++) {
                bufView[i] = str.charCodeAt(i);
            }
            return bufView.byteLength > 6291456;
        }
        saveAsPage(groupId, title, pageIdx = Ktu.template.currentPageIndex) {
            return new Promise((resolve, reject) => {
                const currentPageData = Ktu.templateData[pageIdx];
                const currentPageInfo = Ktu.ktuData.tmpContents[pageIdx];
                const svgData = Ktu.template.toSvg(false, pageIdx);
                let _objects = [];

                _objects = currentPageData.objects.map(item => item.toObject());
                currentPageInfo.content[0].objects = _objects;

                const cloneCurrentPage = _.cloneDeep(currentPageInfo);
                Ktu.checkDataType(cloneCurrentPage.content);

                const contents = [];
                contents.push(cloneCurrentPage);
                contents[0].content[0].svgData = svgData;
                const saveStr = (JSON.stringify(contents));

                const base64 = cloneCurrentPage.tmpFilePath;
                cloneCurrentPage.tmpFilePath = '';
                // eslint-disable-next-line no-unused-vars
                const arr = base64.split(',');
                // const contentBase64 = (arr[1]);
                const fromAid = Ktu.ktuData.ktuAid;
                const fromId = Ktu.ktuData.id;
                const { faiscoAid } = Ktu.ktuData;
                axios.post('/ajax/ktu_h.jsp?cmd=saveKtuOther', {
                    isNeedReplaceFileId: false,
                    saveSvgData: svgData,
                    // base64: contentBase64,
                    content: saveStr,
                    title,
                    groupId,
                    fromId,
                    fromAid,
                }).then(res => {
                    const { data } = res;
                    if (data.success) {
                        const openLink = `/${Ktu.config.editorPath}?id=${data.ktuId}&_aid=${faiscoAid}`;
                        window.location.replace(openLink);
                        resolve();
                    } else {
                        Ktu.notice.error('网络繁忙，请稍后再试');
                        reject();
                    }
                })
                    .catch(err => {
                        reject(err);
                    });
            });
        }
        async saveColorData(info) {
            if (!Ktu.isThirdDesigner && !Ktu.isUIManage) return;

            const url = '/wyq/ajax/ktu_h.jsp?cmd=setKtuColorSearchData';

            axios.post(url, {
                ktuId: info.ktuId,
                ktuAid: info.ktuAid,
                themeColor: info.themeColor,
                _TOKEN: Ktu._Token,
                themeColorList: info.themeColorList,
            });
        }
        async savePage(sync, pageIdx = Ktu.template.currentPageIndex) {
            const currentPageId = Ktu.ktuData.content[pageIdx];
            const currentPageData = Ktu.templateData[pageIdx];
            const currentPageInfo = Ktu.ktuData.tmpContents[pageIdx];
            let _objects = [];
            let textGroupObjects = [];
            let textGroupBase64 = '';
            /* let textGroupSvg = "";
               需要对当前类型是文字组合(module=2)时需要对背景进行处理 */
            if (Ktu.ktuData.module == 2) {
                const result = await this.saveTextGroup();
                if (result) {
                    // 文本组合需要将其层级置为1；
                    result.obj.depth = 1;
                    textGroupObjects = [result.obj];
                    textGroupBase64 = result.base64;
                    // textGroupSvg = result.svgData;

                    currentPageInfo.content[0].objects = textGroupObjects;
                    currentPageInfo.tmpFilePath = textGroupBase64;
                    // currentPageInfo.content[0].svgData = textGroupSvg;
                } else {
                    Ktu.notice.error('网络繁忙，请稍后再试');
                    return;
                }
            } else {
                _objects = currentPageData.objects.map(item => item.toObject());
                currentPageInfo.content[0].objects = _objects;
            }

            const cloneCurrentPage = _.cloneDeep(currentPageInfo);

            Ktu.checkDataType(cloneCurrentPage.content);

            const contents = [];
            contents.push(cloneCurrentPage);

            const base64 = cloneCurrentPage.tmpFilePath.split(',')[1];
            cloneCurrentPage.tmpFilePath = '';
            /* let contentBase64 = encodeURIComponent(arr[1]);
            const saveStr = encodeURIComponent(JSON.stringify(contents)); */
            // &在后端低概率被截断，前端先转一下
            const saveStr = JSON.stringify(contents).replace(/&/g, '*faisco^');
            if (this.hasOverSize(saveStr)) {
                Ktu.store.state.msg.isSaving = false;
                Ktu.save.saveFailed(currentPageInfo, currentPageId);
                !this.showSaveFailedTips && Ktu.notice.warning('Sorry，保存内容过大，建议减少画布内容');

                Ktu.simpleLog('error', 'over_size');
                Ktu.save.autoSave();
                return;
            }

            // 兼容创建两页快图时两个页面fileId相同的bug
            let isNeedReplaceFileId = false;
            if (Ktu.ktuData.content.length === 2
                && Ktu.ktuData.content.indexOf(currentPageId) === 1
                && Ktu.ktuData.tmpContents[0].fileId === Ktu.ktuData.tmpContents[1].fileId) {
                isNeedReplaceFileId = true;
            }
            return new Promise((resolve, reject) => {
                const beforeDate = Date.now();

                const saveTimer = window.setTimeout(() => {
                    Ktu.store.state.msg.isSaving = false;
                    clearTimeout(saveTimer);
                }, 10000);

                axios.post('/ajax/ktu_h.jsp?cmd=set', {
                    isNeedReplaceFileId,
                    isNewEditor: true,
                    isFirst: pageIdx == 0,
                    base64,
                    ktuId: Ktu.ktuData.id,
                    content: saveStr,
                }).then(res => {
                    const result = res.data;
                    resolve(result);
                    if (result.success) {
                        Ktu.save.saveColorData(contents[0]);

                        const nowDate = Date.now();
                        const saveTime = nowDate - beforeDate;
                        this.saveLog(saveTime);
                        // 判断当前有修改的内容，是当前页，才做将保存按钮置灰的操作。
                        if (this.currentChangePageIndex === pageIdx) {
                            Ktu.save.resetSaveNum();
                        };
                        Ktu.ktuData.updateTime = nowDate;
                        /* !isHideTips && Ktu.notice.success('保存成功');
                           避免每次保存都生成新的字体文件 */
                        const { ktuRefParamInfo } = result;
                        const resultList = ktuRefParamInfo[currentPageInfo.id];
                        currentPageData.objects.forEach((info, i) => {
                            if (info.type === 'textbox') {
                                Object.keys(resultList).forEach(o => {
                                    if (info.objectId === resultList[o].objectId) {
                                        info.ftFamilyList[0].fontFaceId = resultList[o].ftFamilyList[0].fontFaceId;
                                    }
                                });
                                info.ftFamilListChg = 0;
                            } else if (info.type === 'qr-code') {
                                for (let index = 0; index < resultList.length; index++) {
                                    const result = resultList[index];
                                    if (result.objectId === info.objectId) {
                                        info.fileId = result.fileId;
                                        info.src = result.path;
                                    }
                                }
                            } else if (info.type === 'map') {
                                for (let index = 0; index < resultList.length; index++) {
                                    const result = resultList[index];
                                    if (result.objectId === info.objectId) {
                                        info.src = result.path;
                                        info.fileId = result.fileId;
                                        info.image.fileId = result.fileId;
                                        info.image.src = result.path;
                                        info.image.originalSrc = result.path;
                                    }
                                }
                            }
                        });
                        if (ktuRefParamInfo.newFileId) {
                            currentPageInfo.fileId = ktuRefParamInfo.newFileId;
                        }
                        Ktu.simpleLog('saveSuccess');
                        Ktu.simpleLog('saveSuccessGroup');
                    } else {
                        Ktu.store.state.msg.isSaving = false;
                        Ktu.notice.error(result.msg);
                        if (result.rt == -1 && saveStr.includes('&')) {
                            //  定位哪里的问题
                            /* const message = _objects.reduce((currentObj, object, index) => {
                               if (object.type === 'textbox' || object.type === 'wordart') {
                               currentObj[index] = encodeURIComponent(object.text);
                               } else if (object.type === 'group') {
                               object.objects.forEach((obj, idx) => {
                               if (obj.type === 'textbox' || obj.type === 'wordart') {
                               currentObj[`${index}_${idx}`] = encodeURIComponent(obj.text);
                               }
                               });
                               }
                               return currentObj;
                               }, {}); */
                            axios.post('/ajax/ktu_h.jsp?cmd=logJsonErr', {
                                ktuId: Ktu.ktuData.id,
                                content: '含有&啦！！！！！',
                            });
                        }
                    }
                    Ktu.save.hasLocalPageData && Ktu.save.deleteLocalPageData(1, currentPageId);
                    if (this.currentChangePageIndex === pageIdx) {
                        // 保存成功 状态重置
                        Ktu.save.saveFailedState = 0;
                        Ktu.save.isClickSave = false;
                    }
                    Ktu.save.autoSave();
                    window.clearTimeout(saveTimer);
                })
                    .catch(() => {
                        Ktu.store.state.msg.isSaving = false;
                        Ktu.save.saveFailed(currentPageInfo, currentPageId);
                        !this.showSaveFailedTips && Ktu.notice.error('网络繁忙，请稍后再试');

                        Ktu.save.isClickSave = false;
                        Ktu.save.autoSave();
                        window.clearTimeout(saveTimer);
                        reject();
                    });
                /*
                $.ajax({
                    type: 'post',
                    url: '/ajax/ktu_h.jsp?cmd=set',
                    data: params.join(''),
                    async: !sync,
                    error: function() {
                        Ktu.store.state.msg.isSaving = false;
                        Ktu.notice.error('网络繁忙，请稍后再试');
                        Ktu.save.autoSave();
                        window.clearTimeout(saveTimer);
                        reject();
                    },
                    success: function(data) {
                        var result = jQuery.parseJSON(data);

                        resolve(result);

                        if (result.success) {
                            const nowDate = Date.now();
                            const saveTime = nowDate - beforeDate;
                            that.saveLog(saveTime);
                            Ktu.save.resetSaveNum();
                            Ktu.ktuData.updateTime = nowDate;
                            // !isHideTips && Ktu.notice.success('保存成功');
                            //避免每次保存都生成新的字体文件
                            var ktuRefParamInfo = result.ktuRefParamInfo;
                            var resultList = ktuRefParamInfo[currentPageInfo.id]
                            currentPageData.objects.forEach((info, i) => {
                                if (info.type === "textbox") {
                                    for (var o in resultList) {
                                        if (info.objectId === resultList[o].objectId) {
                                            info.ftFamilyList[0].fontFaceId = resultList[o].ftFamilyList[0].fontFaceId;
                                        }
                                    }
                                    info.ftFamilListChg = 0;
                                } else if (info.type === 'qr-code') {
                                    for (let index = 0; index < resultList.length; index++) {
                                        const result = resultList[index];
                                        if (result.objectId === info.objectId) {
                                            info.fileId = result.fileId;
                                            info.src = result.path;
                                        }
                                    }
                                }
                            });
                            if (ktuRefParamInfo.newFileId) {
                                currentPageInfo.fileId = ktuRefParamInfo.newFileId;
                            }
                        } else {
                            Ktu.store.state.msg.isSaving = false;
                            Ktu.notice.error(result.msg);
                        }
                        Ktu.save.autoSave();
                        window.clearTimeout(saveTimer);
                    }
                });
                */
            });
        }

        // 当module=2的时候，保存生成文本组合
        async saveTextGroup() {
            let obj;
            let base64 = null;
            let svg = null;

            // 将背景那一层去掉
            const activeObject = Ktu.selectedTemplateData.objects;
            const textGroupData = _.cloneDeep(activeObject);

            // 算上背景后元素只有1时不能进行文字组合保存
            if (textGroupData.length <= 1) {
                Ktu.notice.warning('文字组合保存时内容不能为空！');
                Ktu.store.state.msg.isSaving = false;
                return;
            }

            if (textGroupData.length >= 3) {
                // 文字组合中将多个元素不是组合的内容组合
                const newObjects = textGroupData.filter(object => {
                    if (object.type === 'background') {
                        return false;
                    }
                    return true;
                });
                const multi = new Multi({
                    objects: newObjects,
                });
                obj = await transferGroup(multi);
            } else {
                obj = textGroupData[1];
            }

            // 文字组合中将多个元素不是组合的内容组合
            function transferGroup(textGroupData) {
                return Ktu.element.transferGroup(textGroupData);
            }

            base64 = await Ktu.element.createThumbnail(obj);
            svg = obj.toSvg();
            obj = obj.toObject();

            return {
                obj,
                base64,
                svg,
            };
        }

        saveLog(saveTime) {
            let srcId = 0;
            if (saveTime <= 3000) {
                srcId = 1;
            } else if (saveTime > 3000 && saveTime <= 5000) {
                srcId = 2;
            } else if (saveTime > 5000 && saveTime <= 8000) {
                srcId = 3;
            } else if (saveTime > 8000 && saveTime <= 10000) {
                srcId = 4;
            } else if (saveTime > 10000) {
                srcId = 5;
            }
            console.log('saveTime2222', saveTime);
            Ktu.simpleLog('saveTime', srcId);
        }

        // 保存失败时的处理方法
        saveFailed(cont, pageId) {
            const {
                localPageData,
                localItemId,
                localObjId,
            } = Ktu.save.getLocalPageData(pageId);
            // 缓存数据里的objects
            const { objects } = cont.content[0];

            // 缓存缩略图
            const { tmpFilePath } = cont;
            // 本地缓存对象 时间减去5s 代码执行问题 本地保存总会晚于服务器时间
            const localPageObj = {
                localObjId,
                pageId,
                localItemId,
                objects,
                tmpFilePath,
                localTime: Date.now() - 5 * 1000,
            };
            // 标记当前obj是否在缓存中
            let objExistIdx = -1;
            // 判断时候存不存在当前id的数据
            for (let i = 0; i < localPageData.length; i++) {
                if (localPageData[i].localObjId === localObjId) {
                    objExistIdx = i;
                    break;
                }
            }
            if (objExistIdx !== -1) {
                // 存在 把它替换掉且放到数组最后尾 淘汰时机最后
                localPageData.splice(objExistIdx, 1);
            } else {
                // 不存在 超过5条 淘汰第一条
                if (localPageData.length >= 5) {
                    localPageData.shift();
                }
            }
            localPageData.push(localPageObj);
            // 存入缓存
            try {
                Ktu.save.setLocalData('localPageData', localPageData, true);
                // eslint-disable-next-line no-unused-vars
            } catch (err) {
                console.log('Sorry，保存内容过大，建议减少画布内容');
            }
            // 缓存状态为真
            Ktu.save.hasLocalPageData = true;
            if (this.saveFailedState > 0 && this.isClickSave) {
                Ktu.save.showSaveFailedTips = true;
                this.saveFailedState = -999;
                // 加入队列执行完变为false
                setTimeout(() => {
                    Ktu.save.showSaveFailedTips = false;
                }, 0);
            }
            this.saveFailedState++;
        }
        // 检查是否有缓存
        checkLocalPageData() {
            this.currentItemId = parseInt(`${Ktu.ktuAid}${Ktu.ktuId}`, 10);
            const localPD = JSON.parse(localStorage.getItem('localPageData'));
            if (!!localPD) {
                // 对比是否是当前itemId
                const filterLocalPD = localPD.filter(c => c.localItemId === this.currentItemId);
                if (filterLocalPD.length === 0) return null;
                Ktu.save.changeLocalPageState(true);
                return filterLocalPD;
            }
            return null;
        }
        // 保存成功 去除当前页面缓存 0整个作品的页面删除 1单个页面删除
        deleteLocalPageData(type, pageId) {
            const {
                localPageData,
                localItemId,
                localObjId,
            } = Ktu.save.getLocalPageData(pageId);

            // 放弃恢复时作品id的数据删除 保存成功时单页的id数据删除
            for (let i = 0; i < localPageData.length; i++) {
                let hasMatch = false;
                if (type) {
                    // 单个页面删除 比较唯一标识id
                    hasMatch = localPageData[i].localObjId === localObjId;
                } else {
                    // 作品删除
                    hasMatch = localPageData[i].localItemId === localItemId;
                }
                if (hasMatch) {
                    Ktu.save.romoveCoverPageId(localPageData[i].pageId);
                    localPageData.splice(i, 1);
                    i--;
                }
            }
            // 存入缓存
            Ktu.save.setLocalData('localPageData', localPageData);
            // 当前已无该作品缓存
            if (!Ktu.save.checkLocalPageData()) {
                Ktu.save.changeLocalPageState(false);
            }
        }
    }

    Ktu.save = new Save();
}());
