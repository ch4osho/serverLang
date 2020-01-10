Vue.component('nav-area', {
    template: `
    <nav class="nav-area">
        <div class="nav-logo" @click="quit(true)" title="返回管理平台">
            <svg class="nav-logo-icon">
                <use xlink:href="#svg-nav-logo"></use>
            </svg>
        </div>
        <file-menu></file-menu>
        <nav-btn icon="back" btnName="后退" class="has-tips" tips="Ctrl+Z" :class="{disabled: !undoAble}" @click="back"></nav-btn>
        <nav-btn icon="forward" btnName="前进" class="has-tips" tips="Ctrl+Y" :class="{disabled: !redoAble}" @click="forward"></nav-btn>
        <div class="nav-split"></div>
        <div class="nav-title-box">
            <validate-input ref="titleInput" v-if="editInputState" :inputVal="title" @input="updateTitle" :blurCallBack="titleInputBlur" class="nav-title-input" style="width:200px"></validate-input>
            <div v-else class="nav-title-container" @click="editTitle">
                <!--<svg class="nav-icon">
                    <use xlink:href="#svg-nav-edit" class="nav-icon-use"></use>
                </svg>-->
                <div class="nav-title" id="nav-title" ref="navTitle" @mouseover="scroll" @mouseout="resetScrollLeft">
                    <div class="inner" ref="navTitleContainer">
                        <span>{{title}}</span>
                    </div>
                </div>
                <div class="nav-title-tip"  v-if="!isFromCustomization">修改标题</div>
            </div>
        </div>
        <div class="nav-save">
            <div class="has-tips" :class="{'show-tips' : !hasShowSaveTips}" :tips="'自动保存：'+(isAutoSave ? '开启' : '关闭')">
                <ktu-switch v-model="isAutoSave" logName="autoSave"></ktu-switch>
            </div>
            <div class="nav-updatetime" style="margin-top:1px">{{isSaving ? '正在保存' : hasSavedAll ? updateTime+'更新' : '有步骤未保存'}}</div>
        </div>

        <div class="nav-right">
            <div class="btn nav-save-btn btn-compound" :tips="isDisabledSave ? '作品无修改' : 'Ctrl+S'" :class="{'disabled': isDisabledSave&&afterAnimation, 'has-tips': hasSaveCompleted, 'isSaving': isSaving||!afterAnimation}" @click="save">
                <svg class="btn-icon" :style="isSaving?'opacity:0':''">
                    <use xlink:href="#svg-nav-save"></use>
                </svg>
                <label class="btn-label btn-label-hasIcon">
                    保存
                    <svg v-show="isSaving||!afterAnimation" class="save-animation-img" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="18" height="18" viewBox="0 0 18 18">
                        <circle cx="9" cy="9" r="8" stroke="#FFD1BA" stroke-width="2" fill="none"/>
                        <path d="M9 1 A 8 8 0 0 1 17 9" v-show="afterAnimation" stroke="#f73" stroke-width="2" fill="none" class="round"/>
                        <rect :class="!afterAnimation?'animation':''" style="width: 0;height: 2px;" rx="1" ry="1" x="5" y="7.5" fill="#f73" class="right1"/>
                        <rect :class="!afterAnimation?'animation':''" style="width: 0;height: 2px;" rx="1" ry="1" x="6.5" y="11" fill="#f73" class="right2"/>
                    </svg>
                </label>
            </div>
            <btn class="preview-btn" @click="showPreview" icon="svg-nav-preview">预览</btn>
            <consult-menu @share="share" @quit="quit" :isFromDesignService="isFromDesignService"></consult-menu>

            <download-menu v-if="!isFromThirdDesigner||(isFromThirdDesigner&&!isFromCustomization&&isUIManageForWhite)"></download-menu>

            <btn v-if="isFromThirdDesigner&&isFromCustomization"  class="share-btn" @click="audit" icon="svg-nav-audit" type="compound">审核</btn>

            <btn v-if="isFromThirdDesigner&&!isFromCustomization&&!isUIManageForWhite" :class="{'disabled': isDisabledAudit}" class="share-btn" @click="normalAudit" icon="svg-nav-audit" type="compound">审核</btn>
		</div>
	</nav>
	`,
    data() {
        return {
            firstTimeout: '',
            secondTimeout: '',
            isOverflow: false,
            editInputState: false,
            undoAble: false,
            redoAble: false,
            isFromCustomization: Ktu.isFromCustomization,
            historyInfo: Ktu.historyManager,
            hasShowSaveTips: localStorage.getItem('hasShowSaveTips') === 'true',
            // 提示出现过即加锁
            saveFaileTipsLock: false,
            afterAnimation: true,
        };
    },
    computed: {
        needCheckStep: {
            get() {
                return this.$store.state.data.needCheckStep;
            },
            set(value) {
                this.$store.commit('data/changeState', {
                    prop: 'needCheckStep',
                    value,
                });
            },
        },

        isFromDesignService() {
            return this.getParam('start') === 'designService';
        },

        isDisabledAudit() {
            const colorArr = ['#fff', '#ffffff', 'rgba(255,255,255,1)'];
            const template = Ktu.templateData;
            return template.length == 1 && template[0].objects.length == 1 && colorArr.includes(template[0].objects[0].backgroundColor) && !template[0].objects[0].image;
        },

        toManagePath() {
            let result = this.$store.getters['msg/toManagePath'];
            // 跳运营
            if (this.getParam('start') == 'designService') {
                result = `http://${Ktu.portalHost}/designer/desCenter.jsp?tab=serviceTab`;
            }
            return result;
        },
        title() {
            return this.$store.state.msg.title;
        },
        isDisabledSave() {
            return this.$store.state.msg.saveChangedNum === 0;
        },
        showSaveFailedTips() {
            return this.$store.state.data.showSaveFailedTips;
        },
        isAutoSave: {
            get() {
                return this.$store.state.base.isAutoSave;
            },
            set(value) {
                axios.post('/ajax/ktu_h.jsp?cmd=setUserOther', {
                    isAutoSave: value,
                }).then(res => {
                    const result = (res.data);
                    if (result.success) {
                        this.$store.commit('base/changeState', {
                            prop: 'isAutoSave',
                            value,
                        });
                        Ktu.userData.other.isAutoSave = value;
                        Ktu.save.autoSave();
                    } else {
                        this.$Notice.error(result.msg);
                    }
                })
                    .catch(err => {
                        this.$Notice.error('服务繁忙，请稍后再试。');
                    });
                Ktu.log('autoSave');
            },
        },
        hasSavedAll() {
            return !(this.$store.state.msg.saveChangedNum);
        },
        isSaving: {
            get() {
                return this.$store.state.msg.isSaving;
            },
            set(value) {
                this.$store.commit('msg/update', {
                    prop: 'isSaving',
                    value,
                });
            },
        },
        hasSaveCompleted: {
            get() {
                return this.$store.state.msg.hasSaveCompleted;
            },
            set(value) {
                this.$store.commit('msg/update', {
                    prop: 'hasSaveCompleted',
                    value,
                });
            },
        },
        updateTime: {
            get() {
                const now = Date.now();
                const {
                    updateTime,
                } = this.$store.state.msg;
                const updateDate = new Date(updateTime);
                const time = now - updateTime;
                const pastTimeToday = now % (24 * 60 * 60 * 1000);
                let timeFormat = '';
                if (time < pastTimeToday + 24 * 60 * 60 * 1000) {
                    let hours = updateDate.getHours();
                    hours < 10 && (hours = `0${hours}`);
                    let minutes = updateDate.getMinutes();
                    minutes < 10 && (minutes = `0${minutes}`);
                    timeFormat = `${(time < pastTimeToday ? '今天' : '昨天') + hours} : ${minutes}`;
                } else {
                    timeFormat = `${updateDate.getFullYear()}年${updateDate.getMonth() + 1}月${updateDate.getDate()}日`;
                }
                return timeFormat;
            },
            set(value) {
                this.$store.commit('msg/update', {
                    prop: 'updateTime',
                    value,
                });
            },
        },
        isFromThirdDesigner() {
            return Ktu.isFromThirdDesigner;
        },
        isUIManageForWhite() {
            return Ktu.isUIManageForWhite;
        },

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
    },
    watch: {
        editInputState(editInputState) {
            this.$nextTick(() => {
                setTimeout(() => {
                    if (!editInputState) {
                        this.computeLength();
                    }
                }, 100);
            });
        },
        needCheckStep(needCheckStep) {
            if (needCheckStep) {
                const {
                    currentPageIndex,
                } = Ktu.template;

                this.undoAble = Ktu.historyManager[currentPageIndex].undoAble();
                this.redoAble = Ktu.historyManager[currentPageIndex].redoAble();
                this.needCheckStep = false;

                // 重置是否添加图片的变化
                Ktu.isAddImgChange = false;
            }
        },
        isSaving(isSaving) {
            if (isSaving) {
                this.hasSaveCompleted = false;
            } else {
                this.afterAnimation = false;
                setTimeout(() => {
                    this.afterAnimation = true;
                    this.hasSaveCompleted = true;
                }, 1120);
            }
        },
        showSaveFailedTips(val) {
            if (val && !this.saveFaileTipsLock) {
                this.saveFaileTips();
                // 加锁
                this.saveFaileTipsLock = true;
            }
        },
    },
    created() {
        // 更新时间响应式
        let {
            updateTime,
        } = Ktu.ktuData;
        Object.defineProperty(Ktu.ktuData, 'updateTime', {
            get() {
                return updateTime;
            },
            set: newValue => {
                updateTime = newValue;
                this.updateTime = updateTime;
                this.isSaving = false;
            },
        });

        // 重置前进撤销检测值
        this.needCheckStep = false;
        // 开启自动保存提示，点击任意地方关闭
        if (!this.hasShowSaveTips) {
            const logSaveTipsFlag = () => {
                localStorage.setItem('hasShowSaveTips', true);
                this.hasShowSaveTips = true;
                document.removeEventListener('mousedown', logSaveTipsFlag);
            };
            document.addEventListener('mousedown', logSaveTipsFlag);
        }
    },
    mounted() {
        // Ktu.save.init();
        /* 计算nav-title这个元素的宽度
           this.$nextTick(() => {
           Ktu.save.start();
           }); */
        this.computeLength();
    },
    methods: {
        getParam(paramName) {
            let paramValue = '';
            let isFound = !1;
            if (window.location.search.indexOf('?') == 0 && window.location.search.indexOf('=') > 1) {
                const arrSource = unescape(window.location.search).substring(1, window.location.search.length)
                    .split('&');
                let i = 0;
                while (i < arrSource.length && !isFound)
                    arrSource[i].indexOf('=') > 0 && arrSource[i].split('=')[0].toLowerCase() == paramName.toLowerCase() && (paramValue = arrSource[i].split('=')[1], isFound = !0), i++;
            }
            return paramValue == '' && (paramValue = null), paramValue;
        },
        showPreview() {
            Ktu.log('previewModalClick');
            this.$store.commit('modal/navPreviewModalState', true);
        },
        audit() {
            // 未保存要先保存 要等保存完毕后才打开弹窗
            Ktu.template.saveCurrentPage(true).then(() => {
                this.$store.commit('modal/auditModalState', true);
            });
        },
        async normalAudit() {
            const url = `/ajax/ktuThirdDesigner_h.jsp?cmd=getKtuWithThirdDesigner&id=${Ktu.ktuId}`;
            const { data } = await axios.get(url);
            Ktu.log('auditClick');
            if (data.success) {
                this.$store.commit('data/changeState', {
                    prop: 'chooseKtuItem',
                    value: data.data,
                });
                // 未保存要先保存 要等保存完毕后才打开弹窗
                Ktu.template.saveCurrentPage(true).then(() => {
                    this.$store.commit('modal/normalAuditModalState', true);
                });
            } else {
                this.$Notice.error('服务繁忙，请稍后再试。');
            }
        },
        resetScrollLeft() {
            this.$refs.navTitleContainer.scrollLeft = 0;
            clearTimeout(this.firstTimeout);
            clearTimeout(this.secondTimeout);
        },
        scroll() {
            if (this.isOverflow) {
                this.firstTimeout = setTimeout(this.textScroll, 300);
            }
        },
        textScroll() {
            if (this.editInputState) {
                return;
            }
            this.$refs.navTitleContainer.scrollLeft++;
            this.secondTimeout = setTimeout(this.textScroll, 50);
        },
        computeLength() {
            if ($('#nav-title').width() === 200) {
                this.isOverflow = true;
            } else {
                this.isOverflow = false;
            }
        },
        back() {
            if (Ktu.historyManager[Ktu.template.currentPageIndex].undoAble()) {
                Ktu.historyManager[Ktu.template.currentPageIndex].undo();
                Ktu.log('back');
            }
            return false;
        },
        forward() {
            if (Ktu.historyManager[Ktu.template.currentPageIndex].redoAble()) {
                Ktu.historyManager[Ktu.template.currentPageIndex].redo();
                Ktu.log('forward');
            }
            return false;
        },
        editTitle() {
            if (Ktu.isFromCustomization) {
                return;
            }
            const self = this;
            this.editInputState = true;
            this.$nextTick(() => {
                self.$refs.titleInput.$el.focus();
            });
            Ktu.log('editTitle');
        },
        updateTitle(value) {
            // const self = this;
            if (value === '') {
                value = '无标题';
            }
            if (value !== this.title) {
                axios.post('/ajax/ktu_h.jsp?cmd=setOther', {
                    title: value,
                    ktuId: Ktu.ktuId,
                }).then(res => {
                    const result = (res.data);
                    if (result.success) {
                        this.$store.commit('msg/update', {
                            prop: 'title',
                            value,
                        });

                        Ktu.ktuData.other.title = value;
                        document.title = `${value}-凡科快图`;
                        this.$Notice.success('修改标题成功');
                    }
                })
                    .catch(err => {
                        this.$Notice.error('服务繁忙，请稍后再试。');
                    });
            }
        },
        titleInputBlur(value) {
            this.editInputState = false;
        },
        share() {
            // 未保存要先保存 要等保存完毕后才打开弹窗
            Ktu.template.saveCurrentPage(true).then(() => {
                if (this.shareBusy) return false;
                this.shareBusy = true;
                Ktu.log('share');
                if (!this.$store.state.base.shareLink) {
                    const url = '/ajax/ktu_h.jsp?cmd=setKtuShare';
                    axios
                        .post(url, {
                            ktuId: Ktu.ktuId,
                        }).then(res => {
                            const result = (res.data);
                            // 如果返回成功 或者 提示封禁
                            if (result.success || result.closeKtu || result.closeAccount) {
                                // result.closeKtu = true;
                                this.$store.commit('data/changeState', {
                                    prop: 'shareInfo',
                                    value: result,
                                });
                                this.$store.commit('modal/shareModalState', true);
                            }
                        })
                        .catch(err => {
                            this.$Notice.error('服务繁忙，请稍后再试。');
                        })
                        .finally(() => {
                            this.shareBusy = false;
                        });
                } else {
                    this.$store.commit('modal/shareModalState', true);
                }
            });
        },
        quit(isFromLogo) {
            isFromLogo === true
                ? Ktu.log('clickLogo')
                : Ktu.log('quit');
            if (Ktu.save.saveChangedNum > 0) {
                this.$Modal.confirm({
                    content: '您的作品正处于编辑状态，离开该页面将会失去您对该作品所做的修改。确定关闭？',
                    okBtnType: 'warn',
                    onOk: () => {
                        Ktu.isActiveClick = true;
                        // window.location.href = this.toManagePath;
                        if (isFromLogo === true) {
                            window.location.href = this.toManagePath;
                        } else {
                            window.open('', '_self', '');
                            window.close();
                        }
                    },
                });
            } else {
                if (isFromLogo === true) {
                    window.location.href = this.toManagePath;
                } else {
                    window.open('', '_self', '');
                    window.close();
                }
            }
        },
        save() {
            Ktu.template.saveCurrentPage();
            Ktu.save.changeClickSaveState(true);
            Ktu.log('save');
        },
        handleInviteClick() {
            this.$store.commit('modal/inviteEditModalState', true);
        },
        saveFaileTips() {
            // 提示框
            this.$Modal.warning({
                content: '作品保存失败，可尝试刷新页面或隔一段时间后再保存作品',
                okText: '确认',
                renderClose: true,
            });
            Ktu.log('saveFailed', 'alertRefreshTips');
        },
    },
});
