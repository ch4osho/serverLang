Vue.component('ele-upload', {
    template: `
    <div class="ele-upload page" :class="{'active':activeDir}" @dragenter="dragenterEleUpload">
        <div class="container" @scroll="scrollLoad" ref="container" @mousedown="selectBoxShow">
            <div class="ele-dir-group clearfix" >
                <dir
                    :label="item.name"
                    :item="item"
                    :key="index"
                    :index="index"
                    :dirStyle="dirStyle(item)"
                    @dragenter="dragenterDir(item)"
                    @click="chooseDir(item)"
                    @titleClick="chooseDirTitle"
                    @input="renameDir"
                    @drop="handleDirDrop(item)"
                    @operateClick="openDirMenu"
                    @startDrag="dragStartDir($event,item)"
                    @dragEnd="dirDragEnd"
                    @contextmenu="openDirMenu"
                    :active="activeDir && item.id == activeDir.id"
                    v-for="(item,index) in dirList"
                    ref="dirs"
                ></dir>
                <dir v-show="dirList.length < 30" label="添加文件夹" :dirStyle="dirStyle('add')" @click="addDir" type="add"></dir>
                <div class="dir-placeholder" @drop.stop="moveDir"  v-if="movingDir" :style="dirMaskStyle">
                    <div class="topBox"></div>
                </div>
            </div>
            <transition name="upload-slide-up">
                <div class="ele-upload-group" v-if="activeDir" :style="waterFallTop" ref="eleUploadGroup">
                    <div class="ele-btn-box" v-show="!manageStatus" @mousedown.stop ref="btnBox">
                        <ele-btn label="本地上传" icon="upload-new" class="upload-btn"></ele-btn>
                        <div @click="phoneUpload" :class="{'hover':isOss}" class="ele-btn phoneUpload-btn" >
                            <svg class="ele-btn-icon">
                                <use xlink:href="#svg-ele-upload-phone"></use>
                            </svg>
                            <label class="ele-btn-label">手机上传</label>
                        </div>
                        <div class="setting-btn" @click="enterManage" title="批量管理">
                            <svg class="btn-icon"">
                                <use xlink:href="#svg-ele-upload-setting"></use>
                            </svg>
                        </div>
                    </div>
                    <div class="ele-btn-box" v-show="manageStatus" @mousedown.stop ref="btnBoxActive">
                        <div
                            v-touch-ripple
                            class="operate-btn"
                            :class="{'disable' : checkedItemList.length == 0 || disableBtn}"
                            @click.stop="batchMoveImg($event)"
                        >
                            移动
                        </div>
                        <div
                            v-touch-ripple
                            class="operate-btn del" :class="{'disable' : checkedItemList.length == 0 || disableBtn}"
                            @click="batchDelImg"
                        >删除</div>
                        <div v-touch-ripple class="manage-btn" @click="finishManage">完成管理</div>
                    </div>
                    <!--<div class="ele-upload-tip" ref="uploadTip">{{manageStatus ? "请选择图片" : "支持JPG/PNG/SVG图片，大小不超过"+ file_size_limit +"M"}}</div>-->
                    <div class="ele-upload-tip" ref="uploadTip">{{tipMessage}}</div>
                    <div class="ele-upload-tip limit-num" v-if="isGifTemplate && !manageStatus">作品仅能含有一张GIF</div>
                    <div class="ele-upload-slide" ref="slide" >
                        <transition-group class="ele-upload-waterfall" tag="div" name="sucai-material-show" style="height:eleUploadGroupHeight+'px'">
                            <div
                                class="ele-upload-item"
                                v-for="(item,index) in materialItem"
                                :order="index"
                                :key="index+1"
                                @click.stop="clickImg(item)"
                                @mousedown.stop
                                draggable="true"
                                @dragstart="dragStart($event, item)"
                                @dragend.stop="imageDragEnd"
                                ref="uploadItem"
                                :data-i="item.i"
                            >
                                <div class="ele-upload-item-manage" v-show="manageStatus" :style="{border:checkedItemList.includes(item.i) ? '0' : '1px solid #bfbfbf'}">
                                    <div v-show="checkedItemList.includes(item.i)" class="ele-upload-item-checked">
                                        <svg class="">
                                            <use xlink:href="#svg-ele-checked"></use>
                                        </svg>
                                    </div>
                                </div>
                                <div
                                    class="ele-upload-mask"
                                    @contextmenu="openUploadMenu($event,item,0)"
                                    :class="{'isHover': item.isHover,'hover':!showSelectBox}"
                                >
                                    <svg class="corner-mark" v-if="isGifMaterial(item) && !manageStatus">
                                        <use xlink:href="#svg-corner-mark"></use>
                                    </svg>
                                    <img draggable="false" :src="waterItemImg(item)" class="ele-upload-img" :style="item.imgStyle">
                                    <div class="ele-upload-ing" v-if="item.isUploading || (item.uploadPercent && item.uploadPercent < 99)" @click.stop="uploadingTips">
                                        <div class="upload-ing-shadow" :style="{height: item.uploadPercent+'%'}">
                                            <div class="upload-ing-percent">{{item.uploadPercent+'%'}}</div>
                                        </div>
                                    </div>

                                    <template v-else>
                                        <div class="ele-upload-operate">
                                            <div v-show="!manageStatus" class="upload-operate-open"  @click.stop="openUploadMenu($event,item,1)">
                                                <svg class="upload-operate-open-icon">
                                                    <use xlink:href="#svg-ele-dir-more"></use>
                                                </svg>
                                            </div>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </transition-group>
                    </div>
                    <loading v-show="isLoading"></loading>
                    <pagination v-show="showPagination" :totalSize="totalItem" :itemLimit="getLimit" :scrollLimit="scrollIndexLimit" @on-change="selectPageChange" ref="page"></pagination>
                </div>
            </transition>

            <div
                v-if="showSelectBox"
                style="background-color:rgba(255, 119, 51, 0.1);z-index:9;border:1px solid #FF7733;position:absolute;"
                :style="{width: selectBoxWidth+'px', height: selectBoxHeight+'px', top: selectBoxTop+'px', left: selectBoxLeft+'px'}"
            >
            </div>
        </div>

        <div class="ele-upload-storage">
            <div class="slide">
                <div class="slide-bar" :style="sizeBarStyle"></div>
            </div>
            <div class="storage-text clearfix">
                <div class="storage-size">{{filterNowSize}}/{{filterMaxSize}}</div>
                <div class="storage-up" v-tip="'up'" tips="暂不支持">
                    <span>扩充</span>
                    <svg class="storage-up-icon">
                        <use xlink:href="#svg-ele-shrink"></use>
                    </svg>
                </div>
            </div>
        </div>

        <Menu v-if="showDirMenu" :offsetTop="-42" :length="dirList.length" :offsetLeft="-150" :item="dirItem" :position="dirPosition" :operateList="dirOperateList" @execOperate="dirOperate" @close="closeDirMenu"></Menu>

        <Menu v-if="showUploadMenu" :offsetTop="-42" :offsetLeft="-156" :item="uploadItem" :position="uploadPosition" :operateList="operateList" @execOperate="uploadOperate" @close="closeUploadMenu"></Menu>

        <fictitious-item v-if="isMovingImage"></fictitious-item>

        <div class="ele-dir-list" v-if="showDirListMenu" :style="dirListPosition">
            <div class="line" v-for="(item,index) in dirList" @click="moveImg(item)" :class="{'active':item.id == activeDir.id}">
                <svg class="line-icon">
                    <use xlink:href="#svg-ele-dir-icon"></use>
                </svg>
                <div class="line-name">{{item.name}}</div>
                <svg class="line-active-icon" v-show="item.id == activeDir.id">
                    <use xlink:href="#svg-tool-sure"></use>
                </svg>
            </div>
        </div>
    </div>
    `,
    mixins: [
        Ktu.mixins.uploadSetting,
        Ktu.mixins.selectBoxHandler,
        Ktu.mixins.Response,
        Ktu.mixins.materialHandler,
    ],
    /* <draggable @end="dragEnd" class="ele-upload-drag" :options="{chosenClass: 'ele-upload-drag-chosen'}">
       </draggable> */
    data() {
        return {
            materialItem: [],
            scrollIndex: 0,
            // 进入管理状态
            manageStatus: false,
            // 瀑布流相关设置
            propRatio: [],
            minHeight: 30,
            // 激活 行内第几个
            activeIndex: 0,
            activeDir: null,
            tmpDir: null,
            tmpPage: null,
            // 加载相关
            totalItem: 0,
            getLimit: 30,
            scrollLimit: 120,
            isLoading: false,
            hasLoadedAll: false,
            showPagination: false,
            // 文件夹操作相关
            dirList: [],
            dirOperateList: [
                {
                    icon: 'ele-dir-edit',
                    label: '重命名',
                    name: 'dirRename',
                },
                {
                    icon: 'ele-remove',
                    label: '删除文件夹',
                    name: 'deleteDir',
                },
                {
                    icon: 'ele-move-left',
                    label: '往前移动',
                    name: 'forward',
                },
                {
                    icon: 'ele-move-right',
                    label: '往后移动',
                    name: 'backward',
                },
            ],
            showDirMenu: false,
            dirItem: null,
            dirPosition: null,
            showDirListMenu: false,
            removingDir: false,
            dirListPosition: null,
            // 图片操作相关
            operateList: [
                {
                    icon: 'ele-upload-moreChoose',
                    label: '多选',
                    name: 'moreChoose',
                },
                {
                    icon: 'ele-upload-move',
                    label: '移动',
                    name: 'move',
                },
                {
                    icon: 'ele-remove',
                    label: '删除',
                    name: 'deleteImg',
                },
            ],
            showUploadMenu: false,
            uploadItem: null,
            uploadPosition: null,
            checkedItemList: [],
            selectBoxHeight: 0,
            scrollTop: 0,
            containerTop: 0,
            disableBtn: false,
            movingDir: false,
            dirMaskStyle: `top:0px;left:0px;opacity:0`,
            theMoveDir: null,
            theLeaveDir: null,
            theLastLeaveDir: null,
            eleUploadGroupHeight: 0,
            btnBoxHeight: 0,
            uploadTipHeight: 0,
            loadingFlag: '',
            rowPos: 0,
            isLargerRow: false,
        };
    },
    computed: {
        // 是否是内部账号
        isInternalAcct() {
            return Ktu._isInternalAcct;
        },
        // 滚动加载 的 次数限制
        scrollIndexLimit() {
            return this.scrollLimit / this.getLimit;
        },
        // 拖拽上传完毕
        dropComplete: {
            get() {
                return this.$store.state.base.dropComplete;
            },
            set(value) {
                this.$store.state.base.dropComplete = value;
            },
        },
        isOss() {
            return Ktu.isFaier;
        },
        // 监听手机上传图片
        phoneUploadImage: {
            get() {
                return this.$store.state.data.phoneUploadImage;
            },
            set(value) {
                this.$store.commit('data/changePhoneUploadImage', value);
            },
        },
        // 更换图片完毕
        changePicComplete: {
            get() {
                return this.$store.state.base.changePicComplete;
            },
            set(value) {
                this.$store.state.base.changePicComplete = value;
            },
        },
        // 正在激活 第几列的素材
        activePosition() {
            let str = '';
            if (this.activeDir) {
                switch (this.dirList.indexOf(this.activeDir) % 3) {
                    case 0:
                        str = 'first';
                        break;
                    case 1:
                        str = 'second';
                        break;
                    case 2:
                        str = 'third';
                        break;
                }
            }
            return str;
        },

        tipMessage() {
            let str = '';
            if (this.manageStatus) {
                str = '请选择图片';
            } else {
                // 判断是否是GIF作品
                if (this.isGifTemplate && Ktu.isUIManage) {
                    str = `支持JPG/PNG/SVG/GIF图片，大小不超过${this.file_size_limit}M`;
                } else {
                    str = `支持JPG/PNG/SVG图片，大小不超过${this.file_size_limit}M`;
                }
            }
            return str;
        },
        waterFallTop() {
            if (!this.activeDir) return;
            const index = this.dirList.indexOf(this.activeDir);
            this.isLargerRow = parseInt((index / 3), 10) > this.rowPos;
            this.rowPos = parseInt((index / 3), 10);
            const { container } = this.$refs;
            const dirDom = this.$refs.dirs[index];
            const position = dirDom.$el.getBoundingClientRect();
            return {
                top: `${container.scrollTop + position.bottom - 80 - (this.isLargerRow && this.isOpened ? this.slideHeight + 100 : 0)}px`,
            };
        },
        isShowEleDetail() {
            return this.$store.state.base.isShowEleDetail;
        },
        ktuId() {
            return Ktu.ktuData.id;
        },
        isFromThirdDesigner() {
            return Ktu.isFromThirdDesigner;
        },
        filterNowSize() {
            // 小与1G
            if (this.uploadNowSize < 1024 * 1024 * 1024) {
                return `${(this.uploadNowSize / 1024 / 1024).toFixed(2)}M`;
            }
            return `${(this.uploadNowSize / 1024 / 1024 / 1024).toFixed(2)}G`;
        },
        filterMaxSize() {
            // 小与1G
            if (this.uploadMaxSize < 1024 * 1024 * 1024) {
                return `${parseInt(this.uploadMaxSize / 1024 / 1024, 10)}M`;
            }
            return `${parseInt(this.uploadMaxSize / 1024 / 1024 / 1024, 10)}G`;
        },
        isDroping: {
            get() {
                return this.$store.state.base.isDroping;
            },
            set(value) {
                this.$store.state.base.isDroping = value;
            },
        },
        showPhoneUploadModal: {
            get() {
                return this.$store.state.modal.showPhoneUploadModal;
            },
            set(newValue) {
                this.$store.commit('modal/phoneUploadModal', newValue);
            },
        },
        isFromOut: {
            get() {
                return this.$store.state.base.isFromOut;
            },
            set(value) {
                this.$store.state.base.isFromOut = value;
            },
        },
        nowEditorObj: {
            get() {
                return this.$store.state.base.nowEditorObj;
            },
            set(value) {
                this.$store.state.base.nowEditorObj = value;
            },
        },
        isMovingImage: {
            get() {
                return this.$store.state.base.isMovingImage;
            },
            set(value) {
                this.$store.state.base.isMovingImage = value;
            },
        },
        checkedItem: {
            get() {
                return this.$store.state.base.checkedItem;
            },
            set(value) {
                this.$store.state.base.checkedItem = value;
            },
        },
        enterEditCenter: {
            get() {
                return this.$store.state.base.enterEditCenter;
            },
            set(value) {
                this.$store.state.base.enterEditCenter = value;
            },
        },
        // 刷新素材里我的收藏列表
        shouldRefreshUploadList: {
            get() {
                return this.$store.state.data.shouldRefreshUploadList;
            },
            set(newValue) {
                this.$store.commit('data/changeState', {
                    prop: 'shouldRefreshUploadList',
                    value: newValue,
                });
            },
        },
    },
    watch: {
        manageStatus(nowVal) {
            if (!nowVal && !this.isMovingImage) {
                // 重置选中的图片
                this.checkedItemList = [];
            }
        },
        activeDir(nowVal) {
            if (!nowVal) {
                this.scrollIndex = 0;
                this.materialItem = [];
            }
        },
        phoneUploadImage(nowVal) {
            if (nowVal == true) {
                this.materialItem = [];
                this.scrollIndex = 0;
                this.getImgList();
                this.getUploadStorage();
                this.$nextTick(() => {
                    this.phoneUploadImage = false;
                });
            }
        },
        dropComplete: {
            immediate: true,
            handler(nowVal) {
                if (nowVal) {
                    this.dropComplete = false;
                    // 只有选中默认文件夹才刷新
                    if (this.activeDir === this.dirList[0]) {
                        this.scrollIndex = 0;
                        this.materialItem = [];
                        this.getImgList();
                        this.getUploadStorage();
                    }
                }
            },
        },
        changePicComplete: {
            immediate: true,
            handler(nowVal) {
                if (nowVal) {
                    this.changePicComplete = false;
                    // 只有选中默认文件夹才刷新
                    if (this.activeDir === this.dirList[0]) {
                        this.scrollIndex = 0;
                        this.materialItem = [];
                        this.getImgList();
                    }
                }
            },
        },
        isShowEleDetail(nowval) {
            if (!nowval && this.manageStatus) {
                this.finishManage();
            }
        },
        checkedItemList(nowval) {
            this.checkedItem = [];
            nowval.forEach(checkedItem => {
                this.materialItem.forEach(item => {
                    if (item.i === checkedItem) {
                        this.checkedItem.push(item);
                    }
                });
            });
        },
        enterEditCenter(value) {
            if (value && !this.activeDir) {
                this.openDir(this.tmpDir);
            }
        },
        // 监听素材文件夹删除动作
        deleteMaterialSuccess(value) {
            value
                && this.deleteMaterialOrigin === 'tab'
                && this.delDirSuccess();
        },
        shouldRefreshUploadList(newQuestion, oldQuestion) {
            if (newQuestion.length > 0) {
                newQuestion.forEach(item => {
                    this.materialItem.forEach((info, index) => {
                        if (info.i == item) {
                            this.materialItem[index].isCollect = !this.materialItem[index].isCollect;
                        };
                    });
                });
                this.shouldRefreshUploadList = [];
            }
        },
    },
    mounted() {
        this.containerTop = this.$refs.container.getBoundingClientRect().top;
        Ktu.tempResFilesList = [];
        this.nowEditorObj = 0;
        this.getDirList();
    },
    updated() {
        this.computeMarginTop();
    },
    activated() {
        this.scrollTop = 0;
        this.computeMarginTop();
    },
    deactivated() {
        this.clearDragObject();
        this.finishManage();
    },
    methods: {
        getCurrentUploadImg(file) {
            let currentUploadImg;
            for (let index = 0; index < this.materialItem.length && index <= this.totalUploadNum; index++) {
                if (this.materialItem[index].index == file.index) {
                    currentUploadImg = this.materialItem[index];
                    break;
                }
            }
            return currentUploadImg;
        },
        chooseDir(item) {
            if (this.removingDir) {
                return;
            }
            // 定时器延迟，先确保菜单关闭
            this.manageStatus = false;
            setTimeout(() => {
                if (this.activeDir) {
                    if (this.activeDir != item) {
                        this.openDir(item);
                    } else {
                        this.closeDir();
                    }
                } else {
                    this.openDir(item);
                }
            });
        },
        openDir(item) {
            if (this.movingDir) {
                return;
            }
            this.isOpened = !!this.activeDir;

            if (this.$refs.slide) {
                if (this.showPagination) {
                    this.slideHeight = this.$refs.slide.offsetHeight + 62;
                } else {
                    this.slideHeight = this.$refs.slide.offsetHeight;
                }
            } else {
                this.slideHeight = 0;
            }
            // this.slideHeight = this.$refs.slide ? (this.showPagination ? this.$refs.slide.offsetHeight + 62 : this.$refs.slide.offsetHeight) : 0;

            this.hasLoadedAll = false;
            this.showPagination = false;

            // 重置this.scrollIndex和this.materialItem，避免切换文件夹时位置错误
            this.activeDir = null;
            Vue.nextTick(() => {
                this.activeDir = item;
                this.getImgList(item);
                Vue.nextTick(() => {
                    this.initUpload('.upload-btn');
                });
            });
        },
        closeDir() {
            this.tmpPage = this.$refs.page;
            this.tmpDir = this.activeDir;
            this.activeDir = null;
            this.scrollIndex = 0;
            this.materialItem = [];
            this.eleUploadGroupHeight = 0;
            if (this.checkedItemList.length <= 0) {
                this.manageStatus = false;
            }
            this.hasLoadedAll = false;
            this.showPagination = false;
        },
        handleDirDrop(item) {
            if (this.movingDir) {
                return;
            }
            if (item.id !== this.tmpDir.id) {
                this.activeDir = this.tmpDir;
            }
            this.moveImg(item);
            this.isMovingImage = false;
        },

        chooseDirTitle(dirItem) {
            const { item } = dirItem;
            if (this.activeDir) {
                if (this.activeDir == item) {
                    !item.hideOperate && (item.edit = true);
                } else {
                    this.chooseDir(item);
                }
            } else {
                !item.hideOperate && (item.edit = true);
            }
        },
        computeMarginTop() {
            if (this.$refs.btnBox || this.$refs.btnBoxActive) {
                const btnBox = this.manageStatus ? this.$refs.btnBoxActive : this.$refs.btnBox;
                const btnBoxMargin
                    = Number(window.getComputedStyle(btnBox)['margin-top'].replace(/\D/g, '')) + Number(window.getComputedStyle(btnBox)['margin-bottom'].replace(/\D/g, ''));
                this.btnBoxHeight = btnBox.offsetHeight + btnBoxMargin;
            }
            if (this.$refs.uploadTip) {
                const uploadTipMargin
                    = Number(window.getComputedStyle(this.$refs.uploadTip)['margin-top'].replace(/\D/g, ''))
                    + Number(window.getComputedStyle(this.$refs.uploadTip)['margin-bottom'].replace(/\D/g, ''));
                this.uploadTipHeight = this.$refs.uploadTip.offsetHeight + uploadTipMargin;
            }
            let marginTop = this.eleUploadGroupHeight + this.btnBoxHeight + this.uploadTipHeight;
            if (this.isLoading) marginTop += 60;
            if (this.showPagination) marginTop += 60;

            return marginTop;
        },
        dirStyle(dir) {
            let activeIndex; let activeLine; let targetIndex; let targetLine;

            if (this.activeDir) {
                // 正在激活第几个文件夹
                activeIndex = this.dirList.indexOf(this.activeDir);
                // 激活文件夹在第几行 从1开始
                activeLine = parseInt(activeIndex / 3, 10) + 1;
                if (dir == 'add') {
                    targetIndex = this.dirList.length;
                } else {
                    targetIndex = this.dirList.indexOf(dir);
                }
                targetLine = parseInt(targetIndex / 3, 10) + 1;
                const marginTop = this.computeMarginTop();
                if (targetLine - activeLine == 1) {
                    return {
                        'margin-top': `${marginTop}px`,
                    };
                }
            }
        },

        getImgList(isAwait) {
            const { page } = this.$refs;
            const url = '../ajax/ktuImage_h.jsp?cmd=getList';

            this.isLoading = true;

            // 获取图片是异步的，因此在多次切换文件夹时，只有this.loadingFlag是最新的才会显示图片列表
            const flag = Number(Math.random().toString()
                .substr(3, length) + Date.now()).toString(36);
            this.loadingFlag = flag;
            axios
                .post(url, {
                    groupId: this.activeDir.id,
                    type: $.toJSON(this.file_setting_type_list),
                    scrollIndex: this.scrollIndex,
                    getLimit: this.getLimit,
                    isGetCount: true,
                    ktuId: this.ktuId,
                    flag: $.md5(`${this.ktuId}${this.isFromThirdDesigner}`),
                })
                .then(res => {
                    const info = res.data;
                    if (info.success && this.loadingFlag === flag) {
                        this.totalItem = info.count;
                        info.data.forEach(item => {
                            item.isHover = false;
                            item.checked = false;
                            if (item.p160h > item.p160w || item.sp160h > item.sp160w) {
                                item.imgStyle = {
                                    width: 'auto',
                                    height: '100%',
                                };
                            } else {
                                item.imgStyle = {
                                    width: '100%',
                                    height: 'auto',
                                };
                            }
                        });
                        // 防止快速点击文件夹文件叠加
                        isAwait ? (this.materialItem = info.data) : this.materialItem.push(...info.data);
                        this.eleUploadGroupHeight = Math.ceil(this.materialItem.length / 3) * 93;

                        if (info.data.length < this.getLimit) {
                            this.hasLoadedAll = true;
                            // 虽然加载完毕 但如果不在第一页 要出现分页选择其他页
                            if (page && page.currentPage > 1) {
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
        // 用来刷新列表 给删除 移动 上传刷新用
        refreshList({ index = this.scrollIndex, limit = this.getLimit, scrollTop }) {
            const { page } = this.$refs;
            const { container } = this.$refs;
            const url = '../ajax/ktuImage_h.jsp?cmd=getList';

            this.isLoading = true;
            this.materialItem = [];
            this.hasLoadedAll = false;
            this.showPagination = false;

            axios
                .post(url, {
                    groupId: this.activeDir.id,
                    type: $.toJSON(this.file_setting_type_list),
                    scrollIndex: index,
                    getLimit: limit,
                    isGetCount: true,
                    ktuId: this.ktuId,
                    flag: $.md5(`${this.ktuId}${this.isFromThirdDesigner}`),
                })
                .then(res => {
                    const info = res.data;
                    if (info.success) {
                        this.totalItem = info.count;
                        info.data.forEach(item => {
                            item.isHover = false;
                            item.checked = false;
                            if (item.p160h > item.p160w || item.sp160h > item.sp160w) {
                                item.imgStyle = {
                                    width: 'auto',
                                    height: '100%',
                                };
                            } else {
                                item.imgStyle = {
                                    width: '100%',
                                    height: 'auto',
                                };
                            }
                        });
                        this.materialItem.push(...info.data);
                        this.eleUploadGroupHeight = Math.ceil(this.materialItem.length / 3) * 93;

                        Vue.nextTick(() => {
                            container.scrollTop = scrollTop;
                        });

                        if (info.data.length < limit) {
                            this.hasLoadedAll = true;
                            // 虽然加载完毕 但如果不在第一页 要出现分页选择其他页
                            if (page && page.currentPage > 1) {
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
            this.closeDirList();
            this.closeDirMenu();
            this.closeUploadMenu();

            const { slide } = this.$refs;
            const { container } = this.$refs;
            this.scrollTop = container.scrollTop;

            this.scrollTimer && window.clearTimeout(this.scrollTimer);
            this.scrollTimer = window.setTimeout(() => {
                // 加载完毕 返回
                if (this.hasLoadedAll) return false;
                // 滚动加载限制 数量大于等于最大加载数量 并且 少于总数量 才出现 分页选择
                if (this.materialItem.length >= this.scrollLimit && this.materialItem.length < this.totalItem) {
                    this.showPagination = true;
                    return false;
                }

                if (this.activeDir && !this.isLoading && container.scrollTop + container.clientHeight >= slide.clientHeight) {
                    this.isLoading = true;
                    this.scrollIndex++;
                    this.getImgList();
                }
            }, 50);
        },
        isGifMaterial(item) {
            return /gif$/.test(item.p);
        },
        waterItemImg(item) {
            let imgPath = '';
            if (/gif$/.test(item.p)) {
                imgPath = item.p;
            } else {
                imgPath = item.sp160p || item.p300p || item.p160p || item.path;
            }
            if (this.$store.state.base.isSupportWebp && imgPath && !/base64/.test(imgPath)) {
                imgPath = Ktu.getWebpOrOtherImg(imgPath);
            }
            return imgPath;
        },
        // 切换页面
        selectPageChange(nowPage, isStay) {
            if (!isStay) {
                $('.container').scrollTop(0);
            }
            this.scrollIndex = (nowPage - 1) * this.scrollIndexLimit;
            this.materialItem = [];
            // this.checkedItem = [];
            this.checkedItemList = [];
            this.hasLoadedAll = false;
            this.showPagination = false;
            this.getImgList();
        },

        uploadPushList(tmpFileArr, tmpDeferArr, file) {
            const createObjectURL = function (blob) {
                return window[window.webkitURL ? 'webkitURL' : 'URL'].createObjectURL(blob);
            };

            const defer = $.Deferred();
            tmpDeferArr.push(defer);

            const newImgData = createObjectURL(file);
            const newImg = new Image();
            newImg.onload = info => {
                const { target } = info;
                const { width } = target;
                const { height } = target;

                if (width > 16380 || height > 16380) {
                    this.$Notice.warning(`${file.name}宽高大于16380，请裁剪后再上传。`);
                    defer.resolve();
                } else {
                    if (/svg/.test(file.type)) {
                        svgJudge.bind(this)(file, target, defer);
                    } else {
                        tmpFileArr.push(file);
                        defer.resolve();
                    }
                }
            };
            newImg.src = newImgData;

            function svgJudge(file, target, defer) {
                const reader = new FileReader();
                reader.readAsText(file);

                reader.onload = ev => {
                    const text = ev.target.result;
                    // 读取svg结构 如果带有image 直接返回
                    if (text.match(/<(image)/gim) != null) {
                        this.$Notice.warning(`${file.name}格式异常上传失败。`);
                    } else {
                        // 准备空画布
                        const canvas = document.createElement('canvas');
                        let { width } = target;
                        let { height } = target;
                        const scale = width / height;
                        // 保证缩略图不能过小
                        if (width < 300 && height < 300) {
                            width = 300;
                            height = width / scale;
                        }
                        canvas.width = width;
                        canvas.height = height;
                        // 取得画布的2d绘图上下文
                        const context = canvas.getContext('2d');
                        context.drawImage(newImg, 0, 0, width, height);

                        let pngBase64 = canvas.toDataURL('image/png');
                        pngBase64 = pngBase64.split(',')[1];
                        file.pngStr = pngBase64;

                        tmpFileArr.push(file);
                    }
                    defer.resolve();
                };
                reader.onerror = function () {
                    defer.reject();
                };
            }
        },
        uploadSelect(files) {
            if (!files) return false;

            if (this.scrollIndex > this.scrollIndexLimit) {
                this.selectPageChange(0);
            }
            const createObjectURL = function (blob) {
                return window[window.webkitURL ? 'webkitURL' : 'URL'].createObjectURL(blob);
            };
            /* const arr = []; const  { materialItem } = this;
               for (const index in files) { */
            files.forEach((fileInfo, index) => {
                Ktu.tempResFilesList.push(fileInfo);
                // 先占位 串行上传的
                const tmpObj = {
                    fw: 86,
                    fh: 86,
                    path: '',
                    isUploading: true,
                    uploadPercent: 99,
                    index: parseInt(index, 10) + 1,
                };
                if (/svg/.test(fileInfo.type)) {
                    tmpObj.f = 81;
                    Ktu.log('uploadType', 'svg');
                } else if (/png/.test(fileInfo.type)) {
                    Ktu.log('uploadType', 'png');
                } else if (/jpg|jpeg/.test(fileInfo.type)) {
                    Ktu.log('uploadType', 'jpg');
                }
                this.materialItem.unshift(tmpObj);
                // arr.unshift(tmpObj);

                const newImgData = createObjectURL(fileInfo);
                const tmpImage = new Image();

                tmpImage.onload = info => {
                    // 准备空画布
                    const canvas = document.createElement('canvas');
                    const { width, height } = info.target;
                    const radio = width / height;
                    if (height > width) {
                        canvas.width = 86 * radio;
                        canvas.height = 86;
                    } else {
                        canvas.width = 86;
                        canvas.height = 86 / radio;
                    }
                    // 取得画布的2d绘图上下文
                    const context = canvas.getContext('2d');
                    context.drawImage(tmpImage, 0, 0, canvas.width, canvas.height);

                    const pngBase64 = canvas.toDataURL('image/png');
                    for (let i = 0; i < this.materialItem.length; i++) {
                        const nowImg = this.materialItem[i];
                        if (nowImg.index == parseInt(index, 10) + 1) {
                            nowImg.fw = tmpImage.width;
                            nowImg.fh = tmpImage.height;
                            nowImg.path = pngBase64;

                            if (nowImg.uploadSuccess) {
                                this.$delete(nowImg, 'isUploading');
                                this.$delete(nowImg, 'index');
                            }
                            break;
                        }
                    }
                };

                tmpImage.src = newImgData;
            });
            /* this.materialItem = arr.concat(materialItem);
               this.$forceUpdate(); */
            this.upload.changeParam({
                groupId: this.activeDir.id,
            });
        },
        uploadProgress(data, file) {
            const currentUploadImg = this.getCurrentUploadImg(file);
            if (currentUploadImg) {
                /* console.log(file,"file");
                let percent = Math.floor(100 * (data.loaded / data.total));
                percent > 99 && (percent = 99);*/
                currentUploadImg.uploadPercent = 99;
                this.eleUploadGroupHeight = Math.ceil(this.materialItem.length / 3) * 93;
            }
        },
        uploadSuccess(data, file) {
            // 统一数据属性
            const currentUploadImg = this.getCurrentUploadImg(file);
            if (currentUploadImg) {
                this.$set(currentUploadImg, 'i', data.id);
                this.$set(currentUploadImg, 'p', data.path);
                this.$set(currentUploadImg, 'w', data.width);
                this.$set(currentUploadImg, 'h', data.height);
                this.$set(currentUploadImg, 'n', data.name);
                this.$set(currentUploadImg, 'uploadSuccess', true);
                if (data.height > data.width) {
                    this.$set(currentUploadImg, 'imgStyle', {
                        width: 'auto',
                        height: '100%',
                    });
                } else {
                    this.$set(currentUploadImg, 'imgStyle', {
                        width: '100%',
                        height: 'auto',
                    });
                }
                // 如果上传svg 要获取到它转png的字段
                if (data.type == 81) {
                    this.$set(currentUploadImg, 'p160p', data.svgPrePath);
                } else {
                    const srcSplit = (data.pre160ViewPath && data.pre160ViewPath.split('/')) || data.path.split('/');
                    const idPath = `${srcSplit[srcSplit.length - 1].split('.')[0]}.${srcSplit[srcSplit.length - 1].split('.')[1]}`;
                    srcSplit[srcSplit.length - 1] = idPath;
                    this.$set(currentUploadImg, 'p160p', srcSplit.join('/'));
                }

                const limit = ((this.scrollIndex % this.scrollIndexLimit) + 1) * this.getLimit;
                this.eleUploadGroupHeight = Math.ceil(this.materialItem.length / 3) * 93;
                this.totalItem++;
                if (this.materialItem.length > limit) {
                    this.materialItem.pop();
                }
                if (this.materialItem.length >= this.scrollLimit && this.materialItem.length < this.totalItem) {
                    this.showPagination = true;
                }

                if (currentUploadImg.path) {
                    this.$delete(currentUploadImg, 'isUploading');
                    this.$delete(currentUploadImg, 'index');
                }

                if (this.totalUploadNum - 1 === this.currentUploadIndex++) {
                    this.totalUploadNum = 0;
                    this.currentUploadIndex = 0;
                }
                this.getUploadStorage();
            }
        },
        uploadError(name, file) {
            const currentUploadImg = this.getCurrentUploadImg(file);
            const itemIndex = this.materialItem.indexOf(currentUploadImg);
            this.materialItem.splice(itemIndex, 1);
        },
        uploadingTips() {
            this.$Notice.warning('正在上传，请稍后...');
        },
        dragStart(event, item) {
            // Firefox拖拽必须携带数据，否则无法拖拽
            event.dataTransfer.setData('firefoxInfo', '');

            // 拖拽的时候存储拖拽值
            if (!this.manageStatus) {
                item.from = 'upload';
                this.checkedItemList = [];
                this.checkedItemList.push(item.i);
                Ktu.element.dragObject = item;
                console.log(item);
            } else {
                this.checkedItem.forEach(item => (item.from = 'upload'));
                Ktu.element.dragObjectList = this.checkedItem;
            }
            if (!this.checkedItemList.includes(item.i)) {
                event.preventDefault();
                return;
            }
            const tmpImg = new Image();
            tmpImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAFCAYAAABmWJ3mAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjAyQTU2RjhFQUVCQTExRTk4NEZCQkQwMDAxMzE5N0NFIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjAyQTU2RjhGQUVCQTExRTk4NEZCQkQwMDAxMzE5N0NFIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MDJBMzRFMjBBRUJBMTFFOTg0RkJCRDAwMDEzMTk3Q0UiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MDJBMzRFMjFBRUJBMTFFOTg0RkJCRDAwMDEzMTk3Q0UiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7aWJsgAAAAF0lEQVR42mL8//8/AzbAxIADUFECIMAAcowDB6uwnfkAAAAASUVORK5CYII=';
            event.dataTransfer.setDragImage(tmpImg, 0, 0);
            this.isMovingImage = true;
        },
        imageDragEnd() {
            if (!this.activeDir) {
                this.openDir(this.tmpDir);
            }
            this.isDroping = false;
            this.isFromOut = true;
            if (this.isMovingImage) {
                this.isMovingImage = false;
            }
        },
        dragEnd(event, img) {
            const canvasRect = Ktu.edit.getEditareaSize();
            canvasRect.right = canvasRect.left + canvasRect.width;
            canvasRect.bottom = canvasRect.top + canvasRect.height;
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
                this.useImg(img, position);
            }
        },
        clickImg(item) {
            if (this.manageStatus) {
                if (!this.checkedItemList.includes(item.i)) {
                    this.checkedItemList.push(item.i);
                } else {
                    const index = this.checkedItemList.indexOf(item.i);
                    this.checkedItemList.splice(index, 1);
                }
            } else {
                this.useImg(item);
            }
        },
        useImg(item, position) {
            const object = {
                id: item.i || item.resourceId,
                path: item.p || item.filePath,
                canCollect: true,
                isCollect: item.isCollect,
            };
            if (position) {
                object.top = position.top;
                object.left = position.left;
            }
            if (/\.svg/.test(object.path)) {
                object.tmpSrc = item.sp160p;
                if (/ktrq-/.test(item.n)) {
                    object.w = item.width;
                    object.h = item.height;
                    Ktu.element.addModule('imageContainer', object);
                } else {
                    Ktu.element.addModule('svg', object);
                }
            } else {
                object.tmpSrc = item.p160p || item.sp;
                object.w = item.w;
                object.h = item.h;
                object.smallSrc = this.waterItemImg(item);

                Ktu.element.addModule('image', object);
            }
            // 添加上传素材
            Ktu.log('addUploadMaterial');
            // 上传操作-使用
            Ktu.log('upload', 'use');
        },
        showDirList(position) {
            Vue.set(this, 'dirListPosition', position);
            this.showDirListMenu = true;
            document.addEventListener('click', this.closeDirList);
        },
        closeDirList() {
            this.showDirListMenu = false;
            this.dirListPosition = null;
            document.removeEventListener('click', this.closeDirList);
        },
        // 批量移动图片
        batchMoveImg(event) {
            if (this.checkedItemList.length == 0) return;
            const windowHeight = window.innerHeight;
            const { target } = event;
            const position = target.getBoundingClientRect();
            let top = position.top - 65;

            // 判断 是否把文件夹列表 挤出屏幕外
            if (windowHeight - position.top < 202) {
                top = position.top - 210;
            }
            this.showDirList({
                top: `${top}px`,
                left: '24px',
            });
        },
        // 批量删除图片
        batchDelImg() {
            if (this.checkedItemList.length == 0) return;
            this.$Modal.confirm({
                content: `共计${this.checkedItemList.length}张素材，要删除它们吗？`,
                okText: '删除',
                okBtnType: 'warn',
                onOk: () => {
                    this.deleteImg(this.checkedItem);
                },
            });
        },
        sureToDeleteImg(item) {
            this.$Modal.confirm({
                content: '确定删除当前素材吗？',
                okBtnType: 'warn',
                onOk: () => {
                    this.deleteImg(item);
                },
            });
        },
        // 删除图片  单个与批量共用
        deleteImg(item) {
            const { container } = this.$refs;
            const { scrollTop } = container;
            const { page } = this.$refs;
            let imgIdList = [];
            const url = '../ajax/ktuImage_h.jsp?cmd=delToRecycle';

            if (Array.isArray(item)) {
                imgIdList = item.map(item => item.i);
            } else {
                imgIdList.push(item.i);
            }
            axios
                .post(url, {
                    imgIdList: JSON.stringify(imgIdList),
                })
                .then(res => {
                    const info = res.data;
                    if (info.success) {
                        if (Array.isArray(item)) {
                            this.totalItem -= item.length;
                            this.checkedItemList = [];
                            Ktu.log('uploadManage', 'delBatch');
                        } else {
                            this.totalItem--;
                            Ktu.log('uploadManage', 'delSingle');
                        }
                        this.$Notice.success('删除成功');
                        this.getUploadStorage();
                        // 如果当前页已经没有可操作的 自动往前一页
                        if (page.currentPage > 1 && this.totalItem % this.scrollLimit == 0) {
                            page.prevPage();
                        } else {
                            this.refreshList({
                                index: (page.currentPage - 1) * this.scrollIndexLimit,
                                limit: ((this.scrollIndex % this.scrollIndexLimit) + 1) * this.getLimit,
                                scrollTop,
                            });
                        }
                    } else {
                        this.$Notice.warning(info.msg);
                    }
                })
                .catch(err => {
                    this.$Notice.error(err);
                })
                .finally(() => { });
        },
        // 移动图片  单个与批量共用
        moveImg(dir) {
            if (this.movingDir) {
                return;
            }
            const activeDir = this.activeDir ? this.activeDir : this.tmpDir;
            const { container } = this.$refs;
            const { scrollTop } = container;
            const page = this.$refs.page || this.tmpPage;
            let imgIdList = [];
            const url = '../ajax/ktuImage_h.jsp?cmd=setImgToGroup';

            if (dir.id == activeDir.id) {
                return;
            }

            if (this.checkedItem.length > 0) {
                imgIdList = this.checkedItem.map(item => item.i);
            } else if (this.isMovingImage) {
                imgIdList.push(Ktu.element.dragObject.i);
            } else {
                imgIdList.push(this.uploadItem.i);
            }

            axios
                .post(url, {
                    groupId: dir.id,
                    imgIdList: JSON.stringify(imgIdList),
                })
                .then(res => {
                    const info = res.data;
                    if (info.success) {
                        if (this.checkedItem.length > 0) {
                            this.totalItem -= this.checkedItem.length;
                            this.checkedItemList = [];
                            Ktu.log('uploadManage', 'moveBatch');
                        } else {
                            this.totalItem--;
                            Ktu.log('uploadManage', 'moveSingle');
                        }
                        this.$Notice.success('移动成功');
                        // 如果当前页已经没有可操作的 自动往前一页
                        if (page.currentPage > 1 && this.totalItem % this.scrollLimit == 0) {
                            this.$refs.page.prevPage();
                        } else {
                            this.refreshList({
                                index: (page.currentPage - 1) * this.scrollIndexLimit,
                                limit: ((this.scrollIndex % this.scrollIndexLimit) + 1) * this.getLimit,
                                scrollTop,
                            });
                        }
                    } else {
                        this.$Notice.warning(info.msg);
                    }
                })
                .catch(err => {
                    this.$Notice.error(err);
                })
                .finally(() => { });
        },
        // 上传菜单的操作
        openUploadMenu(event, item, num) {
            if (num == 0 && event.which !== 3) {
                return;
            }
            event.preventDefault();
            if (item != this.uploadItem) {
                if (this.showUploadMenu) {
                    this.closeDirMenu();
                    return;
                }
                if (this.manageStatus) return;
                this.showUploadMenu = true;
                this.uploadItem && (this.uploadItem.isHover = false);
                this.uploadItem = item;
                this.uploadPosition
                    = num == 1
                        ? { left: event.x - 10, top: event.y - 5 }
                        : {
                            left: event.x + 70,
                            top: event.y - 5,
                        };
                document.addEventListener('click', this.closeDirMenu);
            } else {
                this.closeDirMenu();
            }
        },
        closeUploadMenu() {
            this.showUploadMenu = false;
            this.uploadPosition = null;
            this.uploadItem && (this.uploadItem.isHover = false);
        },
        uploadOperate({ event, item, operateName }) {
            const operate = {
                move: () => {
                    const windowHeight = window.innerHeight;
                    const { target } = event;
                    const position = target.getBoundingClientRect();
                    let top = position.top - 65;

                    // 判断 是否把文件夹列表 挤出屏幕外
                    if (windowHeight - position.top < 202) {
                        top = position.top - 210;
                    }
                    this.showDirList({
                        top: `${top}px`,
                        left: '24px',
                    });
                },
                deleteImg: () => {
                    this.sureToDeleteImg(item);
                },
                moreChoose: () => {
                    Ktu.log('uploadManage', 'moreChoose');
                    this.checkedItemList.push(item.i);
                    this.manageStatus = true;
                },
            };
            operate[operateName]();
            this.closeUploadMenu();
        },
        // 文件夹菜单的操作
        openDirMenu({ event, item, index, num }) {
            if (this.removingDir) {
                return;
            }
            this.closeUploadMenu();
            if (item != this.dirItem) {
                this.showDirMenu = true;
                this.dirItem = item;
                this.dirItem.index = index;
                this.dirPosition = num == 1 ? { left: event.x > 200 ? event.x - 47.66 : event.x + 70, top: event.y - 10 } : { left: event.x + 70, top: event.y - 10 };
            } else {
                this.closeDirMenu();
            }
        },
        closeDirMenu() {
            this.showUploadMenu = false;
            this.dirItem = null;
            this.showDirMenu = null;
            this.uploadItem = null;
        },
        dirOperate({ item, operateName, index }) {
            const operate = {
                dirRename() {
                    item.edit = true;
                },
                deleteDir: () => {
                    this.deleteMaterialDir = item;
                    this.closeDir();
                    const getListUrl = '../ajax/ktuImage_h.jsp?cmd=getList';
                    axios
                        .post(getListUrl, {
                            groupId: this.deleteMaterialDir.id,
                            type: $.toJSON(this.file_setting_type_list),
                            scrollIndex: this.scrollIndex,
                            getLimit: 1,
                            isGetCount: true,
                            ktuId: this.ktuId,
                            flag: $.md5(`${this.ktuId}${this.isFromThirdDesigner}`),
                        })
                        .then(res => {
                            const info = res.data;
                            if (info.success) {
                                return info.count;
                            }
                        })
                        .then(count => {
                            // 删除来源 tab
                            this.deleteMaterialOrigin = 'tab';
                            if (count > 0) {
                                this.$store.commit('modal/deleteMaterialModalState', true);
                            } else {
                                // 传true 直接删除
                                this.delDir(true);
                            }
                        });
                },
                backward: () => {
                    if (index + 1 == this.dirList.length) {
                        return;
                    }
                    Ktu.log('uploadManage', 'moveDirRight');
                    this.moveAnimation(this.dirList.indexOf(item), this.dirList.indexOf(item) + 1);
                },
                forward: () => {
                    if (index == 1) {
                        return;
                    }
                    Ktu.log('uploadManage', 'moveDirLeft');
                    this.moveAnimation(this.dirList.indexOf(item) - 1, this.dirList.indexOf(item));
                },
            };
            operate[operateName]();
            this.closeDirMenu();
        },
        // 删除素材文件夹成功执行的回调
        delDirSuccess() {
            const index = this.dirList.indexOf(this.deleteMaterialDir);
            this.getUploadStorage();
            this.dirList.splice(index, 1);
        },
        // 获取文件夹列表
        getDirList() {
            const url = '../ajax/ktuGroup_h.jsp?cmd=getKtuGroupList';

            axios
                .post(url, {})
                .then(res => {
                    const info = res.data;
                    if (info.success) {
                        // 给id为0 即 默认文件夹添加属性
                        info.ktuGroupList.some(item => {
                            if (item.id === 0) {
                                item.hideOperate = true;
                                return true;
                            }
                            return false;
                        });
                        this.dirList.push(...info.ktuGroupList);
                        // 默认选中第一个

                        this.chooseDir(this.dirList[0]);
                    }
                })
                .catch(err => {
                    this.$Notice.error(err);
                })
                .finally(() => {
                    // this.isLoading = false;
                });
        },
        addDir() {
            // 激活
            if (this.activeDir) {
                setTimeout(() => {
                    this.closeDir();
                });
            }
            if (this.dirList.length >= 30) {
                this.$Notice.warning('文件夹已超出30个');
                return false;
            }
            const url = '../ajax/ktuGroup_h.jsp?cmd=addKtuGroup';
            axios
                .post(url, {
                    name: '新建文件夹',
                })
                .then(res => {
                    const info = res.data;
                    if (info.success) {
                        this.dirList.push({
                            name: '新建文件夹',
                            id: info.id,
                            orderGroup: info.id,
                        });
                        Ktu.log('uploadManage', 'addDir');
                        this.$Notice.success(info.msg);
                        // 添加完毕后 默认可以编辑
                        Vue.nextTick(() => {
                            this.dirList[this.dirList.length - 1].edit = true;
                        });
                    } else {
                        this.$Notice.error(info.msg);
                    }
                })
                .catch(err => {
                    this.$Notice.error(err);
                })
                .finally(() => { });
        },
        renameDir({ item, value }) {
            item.name = value;
            const url = '../ajax/ktuGroup_h.jsp?cmd=setKtuGroup';

            axios
                .post(url, {
                    id: item.id,
                    name: value,
                })
                .then(res => {
                    const info = res.data;
                    if (info.success) {
                        this.$Notice.success(info.msg);
                        Ktu.log('uploadManage', 'renameDir');
                    } else {
                        this.$Notice.error(info.msg);
                    }
                })
                .catch(err => {
                    this.$Notice.error(err);
                })
                .finally(() => { });
        },
        // 完成管理状态
        finishManage() {
            this.checkedItemList = [];
            this.manageStatus = false;
        },
        // 拖动素材到文件夹上时收起
        dragenterDir(item) {
            if (this.movingDir) {
                const index = this.dirList.indexOf(item);
                if (index == 0) {
                    return;
                }
                const { left, top } = this.$refs.dirs[index].$el.getBoundingClientRect();
                const scrollBar = document.querySelector('.container').scrollTop;
                setTimeout(() => {
                    this.dirMaskStyle = `top:${top - 60 + scrollBar}px;left:${left - 80}px;opacity:1`;
                }, 0);
                this.theLastLeaveDir = JSON.parse(JSON.stringify(this.theLeaveDir));
                this.theLeaveDir = index;
                this.theLastLeaveDir ? this.dirList.splice(this.theLastLeaveDir, 1, ...this.dirList.splice(this.theMoveDir, 1, this.dirList[this.theLastLeaveDir])) : '';
                this.dirList.splice(this.theMoveDir, 1, ...this.dirList.splice(this.theLeaveDir, 1, this.dirList[this.theMoveDir]));
                return;
            }
            if (this.activeDir) {
                this.closeDir();
            }
        },
        dragenterEleUpload(event) {
            if (this.enterEditCenter) {
                this.enterEditCenter = false;
            }
        },

        // 拖放文件夹开始
        dragStartDir(ev, item) {
            this.closeDir();
            this.showDirMenu = false;
            const { left, top } = ev.target.getBoundingClientRect();
            const scrollBar = document.querySelector('.container').scrollTop;
            this.movingDir = true;
            this.theMoveDir = this.dirList.indexOf(item);
            this.theLeaveDir = null;
            setTimeout(() => {
                this.dirMaskStyle = `top:${top - 60 + scrollBar}px;left:${left - 80 + scrollBar}px;opacity:1`;
            }, 0);
        },
        // 拖拽结束
        dirDragEnd() {
            this.dirMaskStyle = `top:0px;left:0px;opacity:0`;
            this.movingDir = false;
        },
        // 确认移动Dir
        moveDir() {
            if (!this.theLeaveDir) {
                return;
            }
            let temp = {};
            let id = {};
            const List = [];
            this.dirList.forEach((item, index) => {
                if (index == 0) {
                    return;
                }
                List.push({ id: item.id, orderGroup: item.orderGroup, name: item.name });
            });
            temp = List[this.theLeaveDir - 1].name;
            List[this.theLeaveDir - 1].name = List[this.theMoveDir - 1].name;
            List[this.theMoveDir - 1].name = temp;
            id = List[this.theLeaveDir - 1].id;
            List[this.theLeaveDir - 1].id = List[this.theMoveDir - 1].id;
            List[this.theMoveDir - 1].id = id;
            const url = '../ajax/ktuGroup_h.jsp?cmd=batchSetKtuGroup';
            axios
                .post(url, {
                    groupList: JSON.stringify(List),
                })
                .then(res => {
                    Ktu.log('uploadManage', 'dragMoveDir');
                    const url = '../ajax/ktuGroup_h.jsp?cmd=getKtuGroupList';
                    axios
                        .post(url, {})
                        .then(res => {
                            const info = res.data;
                            if (info.success) {
                                // 给id为0 即 默认文件夹添加属性
                                info.ktuGroupList.some(item => {
                                    if (item.id === 0) {
                                        item.hideOperate = true;
                                        return true;
                                    }
                                    return false;
                                });
                                this.dirList = [];
                                this.dirList.push(...info.ktuGroupList);
                                this.dirList.forEach(item => {
                                    Vue.set(item, 'edit', false);
                                });
                            }
                        })
                        .catch(err => {
                            this.$Notice.error(err);
                        })
                        .finally(() => {
                            // this.isLoading = false;
                        });
                })
                .catch(err => {
                    this.$Notice.error(err);
                })
                .finally(() => { });
            // this.dirList.splice(this.theMoveDir, 1, ...this.dirList.splice(this.theLeaveDir , 1, this.dirList[this.theMoveDir]))
        },

        // 前进后退动画
        moveAnimation(index1, index2) {
            this.removingDir = true;
            this.closeDir();
            const Rect1 = this.$refs.dirs[index1].$el.getBoundingClientRect();
            const Rect2 = this.$refs.dirs[index2].$el.getBoundingClientRect();
            const X = Rect1.left - Rect2.left;
            const Y = Rect1.top - Rect2.top;

            this.$refs.dirs[index1].$el.style.transition = `0.5s`;
            this.$refs.dirs[index1].$el.style.transform = `translate(${-X}px,${-Y}px)`;
            this.$refs.dirs[index2].$el.style.transition = `0.5s`;
            this.$refs.dirs[index2].$el.style.transform = `translate(${X}px,${Y}px)`;
            let temp = {};
            const List = [];
            this.dirList.forEach((item, index) => {
                if (index == 0) {
                    return;
                }
                List.push({ id: item.id, orderGroup: item.orderGroup, name: item.name });
            });

            temp = List[index1 - 1].orderGroup;
            List[index1 - 1].orderGroup = List[index2 - 1].orderGroup;
            List[index2 - 1].orderGroup = temp;
            const url = '../ajax/ktuGroup_h.jsp?cmd=batchSetKtuGroup';
            axios
                .post(url, {
                    groupList: JSON.stringify(List),
                })
                .then(res => {
                    setTimeout(() => {
                        const url = '../ajax/ktuGroup_h.jsp?cmd=getKtuGroupList';
                        axios
                            .post(url, {})
                            .then(res => {
                                const info = res.data;
                                if (info.success) {
                                    // 给id为0 即 默认文件夹添加属性
                                    info.ktuGroupList.some(item => {
                                        if (item.id === 0) {
                                            item.hideOperate = true;
                                            return true;
                                        }
                                        return false;
                                    });

                                    this.dirList = [];
                                    this.$refs.dirs[index1].$el.style.transition = `0s`;
                                    this.$refs.dirs[index1].$el.style.transform = ``;
                                    this.$refs.dirs[index2].$el.style.transition = `0s`;
                                    this.$refs.dirs[index2].$el.style.transform = ``;
                                    this.dirList.push(...info.ktuGroupList);
                                    this.dirList.forEach(item => {
                                        Vue.set(item, 'edit', false);
                                    });
                                    this.removingDir = false;
                                }
                            })
                            .catch(err => {
                                this.$Notice.error(err);
                            })
                            .finally(() => {
                                // this.isLoading = false;
                            });
                    }, 500);
                })
                .catch(err => {
                    this.$Notice.error(err);
                })
                .finally(() => { });
        },
        enterManage() {
            this.manageStatus = true;
            this.checkedItemList = [];
        },
        clearDragObject() {
            Ktu.element.dragObject = null;
            Ktu.element.dragObjectList = null;
        },
        // 手机上传
        phoneUpload() {
            if (this.isOss) {
                return;
            }
            Ktu.simpleLog('upload', 'phone');
            this.$store.commit('data/changeState', { prop: 'uploadGroupId', value: this.activeDir.id });
            this.$store.commit('data/changePhoneUploadEntrance', 1);
            this.showPhoneUploadModal = true;
        },
    },
});
