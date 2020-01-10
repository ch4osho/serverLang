Vue.component('normal-audit-modal', {
    template: `
    <Modal class="manageModal normal-audit-modal" :showMask="!isShowDetailBox" :maskAnimate="false"  :width="1269" v-model="showNormalAuditModal">
        <div class="manageModalheader" slot="header">
            <span>提交审核</span>
        </div>
        <div class="modal-box">
            <div class="container clearfix">
                <div class="cover-box">
                    <div class="title">封面</div>
                    <div class="img-container">
                        <div v-if="isLoadingImg" class="loading-tips-box">
                            <div class="loading"></div>
                            <div class="tips">正在更新，预计3~5s</div>
                        </div>
                        <img v-if="imgPath" class="img" :src="newCover?newCover:imgPath" @load="hideLoadingTips">
                        <div v-else class="loading">
                            <div class="loading-image"></div>
                            <span class="loading-text">正在更新，预计消耗3~5s</span>
                        </div>
                    </div>
                </div>
                <div class="work-main">
                    <div class="work-line">
                        <div class="work-line-title require" :class="{'ok' : title}">标题</div>
                        <input v-model="title" type="text" class="work-line-input" @blur="checkTitle" :class="{'warn':titleTip,'disable':checkStatus == 1 || checkStatus == 3}" :disabled="checkStatus == 1 || checkStatus == 3" ref="title">
                    </div>
                    <div class="work-line">
                        <div class="work-line-title">类型</div>
                         <div class="work-line-input disable">{{item.type | itemBigType}} - {{item.type | itemType}}</div>
                    </div>
                </div>
                <div class="work-box">
                    <div class="work-line" v-if="useList && useList.length">
                        <div class="work-line-title">用途</div>

                       <div class="checkbox-list">
                            <check-box class="checkbox-item" v-for="(item,index) in useList" :key="index" :value="uses.includes(item.id)" @input="chooseUseList($event,item)"
                            :class="{'disable': !canEdit}">
                                {{item.name}}
                            </check-box>
                       </div>
                    </div>
                    <div class="work-line"  v-if="tradeList && tradeList.length">
                        <div class="work-line-title">行业</div>

                        <div class="checkbox-list">
                            <check-box class="checkbox-item" v-for="(item,index) in tradeList" :key="index" :value="trades.includes(item.id)" @input="chooseTradeList($event,item)"
                            :class="{'disable': !canEdit}">
                                {{item.name}}
                            </check-box>
                        </div>
                    </div>
                    <div class="work-line">
                        <div class="work-line-title">节日</div>
                        <div class="work-line-des clearfix">
                            <div class="work-line-item" v-for="(item,index) in festival">
                                <span>{{item.name}}</span>
                                <svg v-if="canEdit" class="icon" @click="delFestival(index)"><use xlink:href="#svg-audit-close"></use></svg>
                            </div>
                            <div v-if="canEdit" class="work-line-btn" @click="showFestivalModal">
                                <svg class="icon"><use xlink:href="#svg-add-small"></use></svg>
                                <span>添加</span>
                            </div>
                        </div>
                    </div>
                    <div class="work-line">
                        <div class="work-line-title require" :class="{'ok' : keyWord.length > 0}">关键词</div>
                        <input placeholder="作品关键字，空格或回车添加关键字" @keydown.enter="addKeyword" @keydown.space="addKeyword" type="text" class="work-line-input" :class="{'warn':keywordTip,'disable':checkStatus == 1 || checkStatus == 3}" :disabled="checkStatus == 1 || checkStatus == 3" ref="keyWord">
                    </div>
                    <div class="keyword-box clearfix" v-if="keyWord.length > 0">
                        <div class="keyword" v-for="(item,index) in keyWord">
                            <span>{{item}}</span>
                            <svg v-if="canEdit" class="icon" @click="delKeyword(index)"><use xlink:href="#svg-audit-close"></use></svg>
                        </div>
                    </div>
                </div>
            </div>
            <div class="content-mask"></div>
            <div class="bottom">
                    <div v-if="checkStatus == 1" class="status-btn offer" @click="offAudit(item)">撤销</div>
                    <template  v-if="checkStatus == 0 || checkStatus == 2">
                        <div v-if="!limitTip" class="status-btn" @click="audit">提交审核</div>
                        <div v-else class="limit-tip" :style="checkStatus==2?'background:#FFECCF':''">
                            <svg class="svg-icon" v-if="checkStatus==2&&!isCloseSubmit">
                                <use xlink:href="#svg-audit-timeout"></use>
                            </svg>
                            <svg class="svg-icon" v-else>
                                <use xlink:href="#svg-audit-warning"></use>
                            </svg>
                            {{limitTip}}
                        </div>
                    </template>
                    <div v-else class="status-btn disable">{{checkStatus == 1 ? '审核中' : '已通过'}}</div>
            </div>
            <div class="log-container">
                <div class="log-title">审核记录</div>
                <div class="log-item" v-for="(item,index) in log" :class="['log-item-' + item.status]" v-show="!(item.auditFlag == 0 && item.status == 3)">
                    <div class="log-line">
                        <div class="log-status">{{item.status | itemCheckState}}</div>
                        <div class="log-time">{{item.createTime | localTime}}</div>
                    </div>
                    <div class="log-text" v-if="item.status == 3">模板通过审核</div>
                    <div class="log-text" v-else-if="item.status == 1">提交审核</div>
                    <div class="log-text" v-else>{{item.reason}}</div>
                    <div class="log-imgList" v-if="item.imgList&&item.imgList.length>0" >
                        <div class="log-img" @click="showImgDetail(i)" v-for="(i,index) in item.imgList" v-if="index<3">
                            <img :src="i" class="log-img"/>
                            <svg>
                                <use xlink:href="#svg-log-show"></use>
                            </svg>
                        </div>
                    </div>
                </div>
                <div class="log-no-data" v-if="log.length==0">
                    <svg>
                        <use xlink:href="#svg-no-log"></use>
                    </svg>
                </div>
            </div>
        </div>
        <div class="image-detailBox"  v-show="isShowDetailBox" @mousemove="translateMove" @mouseup="translateEnd"  @wheel="mouseWheel" >
        <div class="mask" @click="hideDetailBox" ></div>
            <div class="imgWraper" @click="hideDetailBox">
                <img @dragstart="onImgDragstart" :style="imgStyle" @click.stop @mousedown="translateStart"  :src="zoomedImgUrl" alt="" >
            </div>
            <transition name="fade">
                <div class="image-detailBox-close" @click="hideDetailBox" v-if="isShowBtn">
                    <svg>
                      <use xlink:href="#svg-preview-close" ></use>
                    </svg>
                </div>
            </transition>
            <transition>
                <div v-if="imageListLen > 1 && isShowBtn" class="switch switch-previous" :class="{disable: currentImgIndex === 0}"  @click="switchImage(currentImgIndex-1)">
                    <svg>
                      <use xlink:href="#svg-preview-arrow" ></use>
                    </svg>
                </div>
            </transition>
            <transition>
                <div v-if="imageListLen > 1 && isShowBtn" class="switch switch-next " :class="{disable: currentImgIndex === (imageList.length-1)}"  @click="switchImage(currentImgIndex+1)">
                    <svg>
                      <use xlink:href="#svg-preview-arrow" ></use>
                    </svg>
                </div>
            </transition>
            <transition name="fade">
                <div class="zoomTops" v-if="showTips">{{zoomTips}}</div>
            </transition>
        </div>
    </div>
    </Modal>
    `,
    name: 'NormalAuditModal',
    mixins: [Ktu.mixins.popupCtrl],
    props: {},
    data() {
        return {
            titleTip: false,
            title: '',
            festival: [],
            keyWord: [],
            keywordTip: false,
            log: [],
            logTip: false,
            cookieKey: '',
            cookieValue: '',

            useList: [],
            uses: [],
            tradeList: [],
            trades: [],
            auditLimit: {},
            limitTip: '',
            needWaitTime: '',

            specialTemplate: [],
            isSpecial: false,
            imgSrc: '',
            isLoadingImg: true,
            newCover: '',
            newCoverPathTypes: [313, 301, 302, 303, 305, 306, 307, 308, 309, 310, 311, 312, 314],
            isShowDetailBox: false,
            zoomedImgUrl: '',
            isShowBtn: true,
            imageListLen: 1,
            showTips: false,
            zoom: 1,
            translateX: 0,
            translateY: 0,
            startPos: {
                left: 0,
                top: 0,
            },
            // 针对需要更新封面的印刷类模板，定义每一行显示的卡片数量
            newCoverCountPerRow: {
                302: 6,
                // 304: 6,
                312: 7,
                313: 7,
                301: 5,
                303: 4,
                306: 4,
                307: 5,
                308: 5,
                309: 4,
                310: 5,
                311: 5,
                305: 4,
                314: 5,
            },
        };
    },
    mounted() {
        this.getLogMsg();
        this.getFestivalText(this.item.festivalText);
        this.title = this.item.name || this.item.title;
        this.keyWord = this.item.keyword ? this.item.keyword.split(' ') : [];
        this.uses = this.item.scenarioList || [];
        this.trades = this.item.newkindList || [];
        // 获取用途和行业
        this.initUseList();

        // 未审核的获取审核的状态与数量
        if (this.checkStatus == 0 || this.checkStatus == 2) {
            this.getCheckStatus();
        }
        if (this.checkStatus == 2) {

        }

        // 特殊模板需要获取新的缩略图
        this.getSpecialThumb();
        if (this.isNeedUpdateCover) {
            this.updateCover();
        }
    },
    computed: {
        isNeedUpdateCover() {
            return this.newCoverPathTypes.includes(this.item.type) && (this.checkStatus === 0 || this.checkStatus === 2);
        },
        showNormalAuditModal: {
            get() {
                return this.$store.state.modal.showNormalAuditModal;
            },
            set(newValue) {
                this.$store.commit('modal/normalAuditModalState', newValue);
            },
        },
        item() {
            return this.$store.state.data.chooseKtuItem;
        },
        checkStatus() {
            const status = this.item.firstCheck == 3 ? this.item.checkStatus : this.item.firstCheck;
            return status;
        },
        canEdit() {
            if (this.checkStatus == 1 || this.checkStatus == 3) {
                return false;
            }
            return true;
        },
        tmpFestival: {
            get() {
                return this.$store.state.base.tmpFestival;
            },
            set(newValue) {
                this.$store.commit('base/changeState', {
                    prop: 'tmpFestival',
                    value: newValue,
                });
            },
        },

        isSpecialTemplate() {
            return this.specialTemplate.includes(this.item.type);
        },

        imgPath() {
            if (this.isSpecialTemplate) {
                return this.imgSrc;
            }
            return this.item.src;
        },

        // 白名单的设计师账号
        isUIManageForWhite() {
            return Ktu.isUIManageForWhite;
        },

        imgStyle() {
            return {
                transform: `translate(${this.translateX}px,${this.translateY}px) scale(${this.zoom})`,
            };
        },

        zoomTips() {
            return `${Number(this.zoom * 100).toFixed(0)}%`;
        },
    },
    watch: {
        tmpFestival(value) {
            if (value.length == 0) return;
            this.festival = value;
            this.festival = uniq(this.festival);
            // this.tmpFestival = [];

            function uniq(array) {
                const temp = {};
                const tmp = [];
                array.forEach(item => {
                    const id = item.nameId;
                    if (!temp[id]) {
                        temp[id] = id;
                        tmp.push(item);
                    }
                });
                return tmp;
            }
        },
    },
    destroy() {
        this.tmpFestival = [];
    },
    filters: {
        itemBigType(typeId) {
            let str = '';
            const id = Math.floor(typeId / 100);
            switch (id) {
                case 1:
                    str = '社交媒体';
                    break;
                case 2:
                    str = '网站电商';
                    break;
                case 3:
                    str = '印刷';
                case 4:
                    str = '商务办公';
                    break;
            }
            return str;
        },

        itemType(typeId) {
            let str = '自定义';
            Ktu.allTemplateInfoList.some(item => {
                if (item.id == typeId) {
                    str = item.name;
                    return true;
                }
                return false;
            });
            return str;
        },
        itemCheckState(checkState) {
            let str = '';
            switch (checkState) {
                case 0:
                    str = '设计中';
                    break;
                case 1:
                    str = '审核中';
                    break;
                case 2:
                    str = '打回';
                    break;
                case 3:
                    str = '已通过';
                    break;
            }

            return str;
        },
        localTime(timeStamp) {
            const time = new Date(timeStamp);
            const y = time.getFullYear();
            const m = time.getMonth() + 1;
            const d = time.getDate();
            const h = time.getHours();
            const mm = time.getMinutes();
            // const s = time.getSeconds();

            return `${y}-${add0(m)}-${add0(d)} ${add0(h)}:${add0(mm)}`;

            function add0(m) {
                return m < 10 ? `0${m}` : m;
            };
        },
    },
    methods: {
        updateCover() {
            const url = '/utils/generateThirdKtuNewCover.jsp';
            const identifier = `${Ktu.ktuAid.toString(32)}Z${this.item.id.toString(32)}`;
            axios.post(url, {
                cmd: 'generateNewCover',
                type: this.item.type,
                identifier,
            }).then(res => {
                const info = res.data;
                if (info.success) {
                    this.newCover = info.data.newCoverSrc;
                    this.$store.commit({
                        type: 'index/coverUpdate',
                        value: {
                            id: this.item.id,
                            newCoverSrc: this.newCover,
                        },
                    });
                } else {
                    this.updateCover();
                }
            })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => { });
        },
        hideLoadingTips() {
            if (this.isNeedUpdateCover) {
                if (!this.newCover) {
                    this.isLoadingImg = true;
                } else {
                    this.isLoadingImg = false;
                }
            } else {
                this.isLoadingImg = false;
            }
        },
        getLogMsg() {
            const url = '/ajax/ktuThirdDesigner_h.jsp?cmd=getCheckMsg';

            axios.post(url, {
                caseId: this.item.ktuCaseId,
            }).then(res => {
                const info = (res.data);
                if (info.success) {
                    const {
                        checkInfo,
                    } = info;
                    // 设置cookie 判断有没有新信息
                    const updateVer = $.cookie(`thirdDesignerCheck${this.item.ktuCaseId}`);
                    this.cookieKey = `thirdDesignerCheck${this.item.ktuCaseId}`;
                    this.cookieValue = JSON.stringify(info.checkInfo.length);

                    if (checkInfo.length > 0 && updateVer != checkInfo.length) {
                        this.logTip = true;
                    }
                    this.log = checkInfo.sort((a, b) => b.createTime - a.createTime);
                }
            })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => { });
        },
        // 获取节日中文名
        getFestivalText(festivalText) {
            const url = '/ajax/ktuThirdDesigner/getFestivalTextList_h.do?cmd=getFestivalTextList';

            axios.post(url, {
                festivalText,
            }).then(res => {
                const info = (res.data);
                if (info.success) {
                    const tmpArr = [];
                    const idList = festivalText.split(',');
                    info.data.forEach((item, index) => {
                        tmpArr.push({
                            name: item.festivalName,
                            nameId: idList[index],
                        });
                    });
                    this.festival = tmpArr;
                    this.tmpFestival = tmpArr;
                }
            })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => { });
        },
        showFestivalModal() {
            this.$store.commit('modal/festivalModalState', true);
        },
        checkTitle() {
            if (this.$refs.title.value.trim() == '') {
                this.titleTip = true;
                this.$Notice.warning('请输入作品标题');
                return;
            }
            this.titleTip = false;
        },
        addKeyword() {
            const value = this.$refs.keyWord.value.trim();
            if (value) {
                this.keywordTip = false;
                this.keyWord.push(value);
                this.$refs.keyWord.value = '';
            }
        },
        delKeyword(index) {
            if (!this.canEdit) {
                this.$Notice.warning('审核中或已通过状态不可对作品信息进行编辑');
                return;
            }
            this.keyWord.splice(index, 1);
        },
        delFestival(index) {
            if (!this.canEdit) {
                this.$Notice.warning('审核中或已通过状态不可对作品信息进行编辑');
                return;
            }
            this.festival.splice(index, 1);
        },
        genThemeColor() {
            return new Promise((res, rej) => {
                const image = new Image();
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                image.src = this.imgPath.replace('.hsw.dev.cc', '');
                image.crossOrigin = 'Anonymous';

                image.onload = function () {
                    canvas.width = image.naturalWidth;
                    canvas.height = image.naturalHeight;
                    context.drawImage(image, 0, 0, canvas.width, canvas.height);

                    const themeColor = Ktu.themeColor(canvas);
                    const { colorArr } = themeColor;
                    if (!!themeColor) {
                        const themeColorList = [];
                        for (let i = 0; i < colorArr.length; i++) {
                            const setItem = {
                                color: Ktu.color.rgbToHSV(`rgb(${colorArr[i][0]}, ${colorArr[i][1]}, ${colorArr[i][2]}`).map(item => Math.round(item)),
                                weight: Math.round(Number(themeColor.weight[i])),
                            };

                            themeColorList.push(setItem);
                        }
                        res(JSON.stringify(themeColorList));
                    } else {
                        console.error('获取不到主题色');
                    }
                };

                image.onerror = function (err) {
                    console.log(err);
                    rej();
                };
            });
        },
        audit() {
            if (this.isLoadingImg) {
                this.$Notice.warning('请等待封面更新完成');
                return;
            }
            if (this.busy) return;
            this.busy = true;
            this.titleTip = false;
            this.keywordTip = false;

            // 缩略图要保证加载出来
            if (!this.imgPath && this.imgPath === '') {
                this.$Notice.warning('请等待封面更新完成');
                this.busy = false;
                return;
            }

            if (this.$refs.title.value.trim() == '') {
                this.titleTip = true;
                this.$Notice.warning('请输入作品标题');
                this.busy = false;
                return;
            }
            // 检测有没有关键字
            if (this.keyWord.length == 0) {
                this.keywordTip = true;
                this.$Notice.warning('请输入完整作品信息');
                this.busy = false;
                return;
            }
            const bigType = Math.floor(this.item.type / 100);
            const url = '/ajax/ktuThirdDesigner_h.jsp?cmd=setKtuThirdCase';
            const setColorUrl = '/ajax/ktu_h.jsp?cmd=setTopNColor';

            const caseInfo = {
                name: this.$refs.title.value.trim(),
                photo: this.item.fileId,
            };
            const festivalText = this.festival.map(item => item.nameId).join(',');

            this.genThemeColor().then(res => {
                axios
                    .post(setColorUrl, {
                        ktuId: this.item.id,
                        themeColorList: res,
                    }).then(res => { })
                    .catch(err => {
                        console.log(err);
                    })
                    .finally(() => {
                        this.$emit('cancelOss');
                    });
            });

            axios.post(url, {
                id: this.item.ktuCaseId,
                ktuId: this.item.id,
                time: this.item.caseUpdateTime,
                [`useName${bigType}`]: bigType,
                [`useBehoof${bigType}`]: this.item.type,
                festivalText,
                ktuKeyWord: this.keyWord.join(' '),
                flyerCaseInfo: JSON.stringify(caseInfo),
                scenarioIds: JSON.stringify(this.uses),
                newKindIds: JSON.stringify(this.trades),
            }).then(res => {
                const info = (res.data);
                if (info.success) {
                    this.item.ktuCaseId = info.returnData.id;
                    this.item.name = this.title;
                    this.item.title = this.title;
                    if (this.item.firstCheck == 3) {
                        this.item.checkStatus = 1;
                    } else {
                        this.item.firstCheck = 1;
                    }
                    this.item.caseUpdateTime = info.getUpdateTime;
                    this.item.keyword = this.keyWord.join(' ');
                    this.item.festivalText = festivalText;
                    this.item.scenarioList = this.uses;
                    this.item.newkindList = this.trades;
                    this.$Notice.success(info.msg);
                    this.showNormalAuditModal = false;
                    window.location.href = "/manage/ktuManage.jsp#/m/my";
                } else {
                    this.$Notice.warning(info.msg);
                }
            })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => {
                    setTimeout(() => {
                        this.busy = false;
                    }, 100);
                });
        },

        // 设置
        set() {
            if (this.isLoadingImg) {
                this.$Notice.warning('请等待封面更新完成');
                return;
            }
            if (this.busy) return;
            this.busy = true;
            this.titleTip = false;
            this.keywordTip = false;

            // 缩略图要保证加载出来
            if (!this.imgPath && this.imgPath === '') {
                this.$Notice.warning('请等待封面更新完成');
                this.busy = false;
                return;
            }

            if (this.$refs.title.value.trim() == '') {
                this.titleTip = true;
                this.$Notice.warning('请输入作品标题');
                this.busy = false;
                return;
            }
            // 检测有没有关键字
            if (this.keyWord.length == 0) {
                this.keywordTip = true;
                this.$Notice.warning('请输入完整作品信息');
                this.busy = false;
                return;
            }
            const bigType = Math.floor(this.item.type / 100);
            const url = '/ajax/ktuThirdDesigner_h.jsp?cmd=setKtuForWhite';

            const caseInfo = {
                name: this.$refs.title.value.trim(),
                photo: this.item.fileId,
            };
            const festivalText = this.festival.map(item => item.nameId).join(',');

            axios.post(url, {
                id: this.item.ktuCaseId,
                ktuId: this.item.id,
                time: this.item.caseUpdateTime,
                [`useName${bigType}`]: bigType,
                [`useBehoof${bigType}`]: this.item.type,
                festivalText,
                ktuKeyWord: this.keyWord.join(' '),
                flyerCaseInfo: JSON.stringify(caseInfo),
                scenarioIds: JSON.stringify(this.uses),
                newKindIds: JSON.stringify(this.trades),
            }).then(res => {
                const info = (res.data);
                if (info.success) {
                    this.item.ktuCaseId = info.returnData.id;
                    this.item.name = this.title;
                    this.item.title = this.title;

                    this.item.caseUpdateTime = info.getUpdateTime;
                    this.item.keyword = this.keyWord.join(' ');
                    this.item.festivalText = festivalText;
                    this.item.scenarioList = this.uses;
                    this.item.newkindList = this.trades;
                    this.$Notice.success(info.msg);
                    this.showNormalAuditModal = false;
                } else {
                    this.$Notice.warning(info.msg);
                }
            })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => {
                    setTimeout(() => {
                        this.busy = false;
                    }, 100);
                });
        },

        // 撤销审核
        offAudit(item) {
            // 缩略图要保证加载出来
            if (!this.imgPath && this.imgPath === '') {
                this.$Notice.warning('请等待封面更新完成');
                return;
            }

            const url = '/ajax/ktuThirdDesigner_h.jsp?cmd=setKtuThirdCaseRecall';

            axios.post(url, {
                id: this.item.ktuCaseId,
                ktuId: this.item.id,
                time: this.item.caseUpdateTime,
            }).then(res => {
                const info = (res.data);
                if (info.success) {
                    this.item.caseUpdateTime = info.getUpdateTime;
                    if (this.item.firstCheck == 3) {
                        this.item.checkStatus = 0;
                    } else {
                        this.item.firstCheck = 0;
                    }
                    this.$Notice.success(info.msg);
                    this.showNormalAuditModal = false;
                } else {
                    this.$Notice.warning(info.msg);
                }
            })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => { });
        },

        // 获取行业和用途
        initUseList() {
            const url = '/ajax/ktuThirdDesigner_h.jsp?cmd=getScenarioAndNewKindWithType';

            axios.post(url, {
                type: this.item.type,
            }).then(res => {
                const info = (res.data);
                if (info.success) {
                    this.useList = info.data.scenariosPara || [];
                    this.tradeList = info.data.kindsPara || [];
                }
            })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => { });;
        },

        // 选择用途
        chooseUseList(e, use) {
            if (!this.canEdit) {
                return;
            }
            if (this.uses.includes(use.id)) {
                this.uses.splice(this.uses.indexOf(use.id), 1);
            } else {
                this.uses.push(use.id);
            }
        },
        // 选择用途
        chooseTradeList(e, trade) {
            if (!this.canEdit) {
                return;
            }
            if (this.trades.includes(trade.id)) {
                this.trades.splice(this.trades.indexOf(trade.id), 1);
            } else {
                this.trades.push(trade.id);
            }
        },

        getCheckStatus() {
            const url = '/ajax/ktuThirdDesigner_h.jsp?cmd=getCheckInfo';

            axios.post(url, {
                type: this.item.type,
                id: this.item.ktuCaseId,
                ktuId: this.item.id,
            }).then(res => {
                const info = (res.data);
                if (info.success) {
                    this.auditLimit = info.data;
                    this.needWaitTime = info.data.needWaitTime || '';
                    this.initLimitTip();
                }
            })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => { });;
        },

        initLimitTip() {
            // 审核提示

            const {
                checkInCount,
                passCount,
                allowCommitCount,
                checkFailCount,
                isCloseSubmit,
            } = this.auditLimit;
            this.isCloseSubmit = isCloseSubmit;
            if (isCloseSubmit) {
                this.limitTip = `该模板设计质量未达要求，不允许再次提交审核，感谢您的制作。`;
            } else if (checkInCount + passCount >= allowCommitCount) {
                if (passCount >= allowCommitCount) {
                    this.limitTip = `本月该类型通过上限为${allowCommitCount}个，当前已通过${passCount}个，暂不允许提交。`;
                } else {
                    this.limitTip = `本月该类型通过上限为${allowCommitCount}个。当前已通过${passCount}个，审核中${checkInCount}个，暂不允许提交，请等待审核结果。`;
                }
            } else if (this.checkStatus == 2 && this.needWaitTime) {
                const time = this.needWaitTime.split('-');
                const date = time[2].split(' ');
                this.limitTip = `第${checkFailCount}次打回，${time[0]}年${time[1]}月${date[0]}日，${date[1]}后允许重新提交。`;
            } else {
                this.limitTip = '';
            }
        },

        getSpecialThumb() {
            if (this.specialTemplate.includes(this.item.type)) {
                const url = '/utils/generateNormalKtuNewCover.jsp?cmd=generateNewCover';

                const str = `${Ktu.ktuAid.toString(32)}Z${this.item.id.toString(32)}`;

                axios.post(url, {
                    type: this.item.type,
                    identifier: str,
                }).then(res => {
                    const info = (res.data);
                    if (info.success) {
                        this.imgSrc = info.data.newCoverSrc;
                        console.log(this.imgSrc);
                    }
                })
                    .catch(err => {
                        console.log(err);
                    })
                    .finally(() => { });
            }
        },
        translateMove(event) {
            this.showBtn();
            if (this.ismoving) {
                this.translateX = this.currentPos.x + event.pageX - this.startPos.x;
                this.translateY = this.currentPos.y + event.pageY - this.startPos.y;
            }
        },
        translateEnd(event) {
            this.ismoving = false;
        },
        // 鼠标滑轮放大缩小
        mouseWheel(e) {
            if (Ktu.browser.isFirefox) {
                // 兼容firefox浏览器，滚轮方向与webkit相反
                if (e.deltaY < 0) {
                    this.zoom += 0.03;
                } else {
                    this.zoom -= 0.03;
                }
            } else {
                if (e.wheelDeltaY > 0) {
                    this.zoom += 0.03;
                } else {
                    this.zoom -= 0.03;
                }
            }
            this.showTips = true;
            this.zoom = Math.min(this.zoom, 3);
            this.zoom = Math.max(this.zoom, 0.5);
            if (this.timer) {
                clearTimeout(this.timer);
            }
            this.timer = setTimeout(() => {
                this.showTips = false;
                this.timer = null;
            }, 1000);
        },

        hideDetailBox() {
            this.isShowDetailBox = false;
        },

        // 取消firefox下的默认拖拽行为
        onImgDragstart(e) {
            e.preventDefault();
        },

        translateStart(event) {
            this.ismoving = true;
            this.startPos = {
                x: event.pageX,
                y: event.pageY,
            };
            this.currentPos = {
                x: this.translateX,
                y: this.translateY,
            };
        },

        showBtn() {
            this.isShowBtn = true;
            if (this.timeOut) {
                clearTimeout(this.timeOut);
            }
            this.timeOut = setTimeout(() => {
                this.isShowBtn = false;
                clearTimeout(this.timeOut);
            }, 3000);
        },
        showImgDetail(img) {
            this.zoomedImgUrl = img;

            this.zoom = 1;
            this.translateX = 0;
            this.translateY = 0;
            this.startPos = {
                left: 0,
                top: 0,
            };
            this.isShowDetailBox = true;
        },
    },
});
