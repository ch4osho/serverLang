Vue.component('ele-background', {
    mixins: [Ktu.mixins.dataHandler, Ktu.mixins.uploadSetting],
    template: `
    <div class="ele-background page">
        <div class="container" @scroll="scrollLoad" ref="container">
            <div class="title">纯色背景</div>
            <div class="colorSelectBox">
                <div class="colorPickerBox">

                    <color-picker v-model="color" :isGradient="true" :bigPicker="true" class="bg-color-picker" ref="colorPicker"></color-picker>

                    <div class="bg-btn collectBtn" @click="collectColor" title="添加到收藏">
                        <svg class="bg-btn-icon">
                            <use xlink:href="#svg-ele-collect"></use>
                        </svg>
                    </div>
                </div>
                <validate-input style="width:110px;" class="colorInput" :maxLength="7" valType="color" :inputVal="baseColor" @input="changeColor"></validate-input>
                <div class="bg-btn pickerBtn" @click="pickColor" @mousedown.stop ref="picker" title="取色器">
                    <svg class="bg-btn-icon" :class="{checked: isPickingColor}">
                        <use xlink:href="#svg-ele-picker"></use>
                    </svg>
                </div>
            </div>
            <div class="defaultColorBox">
                <div v-touch-ripple class="colorItem" :style="colorItemBg(item)" @click="useDefaultColor(item)" v-for="(item,index) in colorArr" :key="index"></div>
            </div>
            <div class="collectBox" v-if="collectColorArr.length > 0">
                <div class="title">收藏颜色</div>
                <div class="collectColorBox">
                    <div class="colorItem" @click="changeColor(item)" v-for="(item,index) in collectColorArr" :key="index" :class="getRadiusClass(index)">
                        <div class="bg" :style="colorItemBg(item)"></div>
                        <div class="mask isTop" @click.stop="delColor(index)" v-show="isDelState">
                            <svg class="bg-btn-icon">
                                <use xlink:href="#svg-ele-reduce"></use>
                            </svg>
                        </div>
                    </div>
                    <div class="bg-btn delBtn" @click="delColorState" title="取消收藏" :class="delBtnClass">
                        <svg class="bg-btn-icon">
                            <use xlink:href="#svg-ele-collect-del"></use>
                        </svg>
                    </div>
                </div>
            </div>
            <div class="title">图片背景</div>
            <ele-btn label="自定义图片" icon="add" @click="jumptoUpload" class="bg-border-dashed"></ele-btn>
            <div class="background-item-contaniner" >
                <div class="background-item-box clearfix" ref="slide">
                    <div class="background-item" v-for="(item,index) in itemList" :key="index" @click="changeBgImage(item)">
                        <div class="background-item-copyright-icon"
                            :class="{'other':copyrightArr.indexOf(item.comeFrom) > 0,'nocopyright' : copyrightArr.indexOf(item.comeFrom) < 0,'active' : item.showCopyright}"
                            @click.stop
                            @mouseenter="hoverCopyrightBtn($event,item)"
                            @mouseleave="wantToCloseInfo"></div>
                        <img class="background-item-img" :src="waterItemImg(item)"/>
                    </div>
                </div>
            </div>
            <loading v-show="isLoading"></loading>
            <pagination v-show="showPagination" :nowPage="nowIndex" :totalSize="itemTotal" :itemLimit="getLimit" :scrollLimit="scrollIndexLimit" @on-change="selectPageChange"></pagination>
        </div>

        <copyright v-if="showCopyright"
            :item="activeMaterial"
            :position="copyrightPosition"
            @close="closeCopyrightInfo"
            @enter="enterCopyrightInfo">
        </copyright>

    </div>
    `,
    mixins: [Ktu.mixins.copyright],
    data() {
        return {
            rgbaReg: /rgba/i,
            rgbReg: /rgb/i,
            backgroundObj: null,
            colorArr: ['#ff5c5c', '#ffbd4a', '#fff952', '#99e265', '#35b729',
                '#44d9e6', '#2eb2ff', '#5271ff', '#3f51b5', '#512da8', '#b760e6',
                '#ff63b1', '#000000', '#3d3d3d', '#adadad', '#ffffff',
            ],
            file_setting_multi: false,
            collectColorList: Ktu.userData.other.collectColor || [],
            isDelState: false,
            isLoading: false,
            hasLoadedAll: false,
            showPagination: false,
            nowIndex: 0,
            getLimit: 30,
            scrollLimit: 120,
            itemList: [],
            itemTotal: 0,
            colorEachRow: 8,
        };
    },
    computed: {
        /* backgroundObj: function() {
           return this.$store.state.data.backgroundObj;
           }, */
        color: {
            get() {
                const backgroundObj = Ktu.element.getBackgroundObj();
                return backgroundObj.backgroundColor;
            },
            set(value) {
                this.changeColor(value);
            },
        },
        currentpageId() {
            return this.$store.state.data.currentpageId;
        },
        baseColor() {
            const { backgroundColor } = Ktu.element.getBackgroundObj();
            if (!backgroundColor) {
                return;
            }
            if (typeof backgroundColor === 'string') {
                return backgroundColor.toUpperCase() == 'TRANSPARENT' ? 'TRANSPARENT' : Ktu.color.rgbToHex(backgroundColor).toUpperCase();
            } else if (backgroundColor.type === 'linear') {
                let linear = 'linear-gradient(to right,';
                backgroundColor.value.forEach((item, index, arr) => {
                    linear += item.color;
                    if (index !== arr.length - 1) linear += ',';
                });
                linear += ')';
                return linear;
            }
            let radial = 'radial-gradient(circle,';
            backgroundColor.value.forEach((item, index, arr) => {
                radial += item.color;
                if (index !== arr.length - 1) radial += ',';
            });
            radial += ')';
            return radial;
        },
        // 滚动加载 的 次数限制
        scrollIndexLimit() {
            return this.scrollLimit / this.getLimit;
        },
        isPickingColor: {
            get() {
                return this.$store.state.base.isPickingColor;
            },
            set(value) {
                this.$store.state.base.isPickingColor = value;
            },
        },
        delBtnClass() {
            const {
                length,
            } = this.collectColorArr;
            const row = Math.ceil(length / this.colorEachRow);
            const remain = length % this.colorEachRow;
            const rowStr = row === 1 ? 'top-right-radius' : '';
            return remain === 0 ? 'bottom-left-radius' : rowStr;
        },
        collectColorArr() {
            return this.collectColorList.filter(item => item !== 'colorful');
        },
    },
    watch: {
        currentpageId() {
            this.backgroundObj = Ktu.element.getBackgroundObj();
        },
    },
    created() {
        this.selectBackground();
        this.getBackgroundList();
        // Ktu.userData.other.collectColor.push('rgba(255,255,255)');
    },
    /* mounted: function() {
       var self = this;
       Ktu.tempResFilesList = []; */

    /* this.initUpload(".uploadBtn");
       }, */
    activated() {
        /* var activeObject = Ktu.canvas.getActiveObject();
           activeObject && activeObject.exitZoomMode && activeObject.exitZoomMode(false); */
        // this.selectBackground();
    },
    methods: {
        getBackgroundList() {
            this.isLoading = true;
            const url = '../ajax/fodder_h.jsp?cmd=getFodderList';

            axios.post(url, {
                // 图片类型的id
                category: 0,
                // 主题类型的id
                topic: 83,
                getLimit: this.getLimit,
                currentPage: this.nowIndex,
            }).then(res => {
                const info = (res.data);
                if (info.success) {
                    const {
                        data,
                    } = info;
                    const tmpArr = data.hits;

                    this.itemTotal = data.total_size;

                    if (this.itemList.length > 0) {
                        // this.itemList.push.apply(this.itemList, tmpArr);
                        this.itemList.push(...tmpArr);
                    } else {
                        this.itemList = tmpArr;
                    }

                    if (tmpArr.length < this.getLimit) {
                        this.hasLoadedAll = true;
                        // 虽然加载完毕 但如果不在第一页 要出现分页选择其他页
                        if (this.nowIndex > this.scrollIndexLimit) {
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
            this.closeCopyrightInfo();
            this.scrollTimer && window.clearTimeout(this.scrollTimer);
            this.scrollTimer = window.setTimeout(() => {
                // 滚动加载限制 数量大于等于最大加载数量 并且 少于总数量 才出现 分页选择
                if (this.itemList.length >= this.scrollLimit && this.itemList.length < this.itemTotal) {
                    this.showPagination = true;
                    return false;
                }

                const {
                    container,
                } = this.$refs;
                const {
                    slide,
                } = this.$refs;
                if (!this.isLoading && !this.hasLoadedAll && container.scrollTop + container.clientHeight >= slide.clientHeight) {
                    this.nowIndex++;
                    this.getBackgroundList();
                }
            }, 50);
        },
        waterItemImg(item) {
            let imgPath = item.pre160ViewPath;
            if (this.$store.state.base.isSupportWebp) {
                imgPath = Ktu.getWebpOrOtherImg(imgPath);
            }
            return imgPath;
        },
        selectPageChange(nowPage) {
            this.nowIndex = (nowPage - 1) * this.scrollIndexLimit;
            this.itemList = [];
            this.hasLoadedAll = false;
            this.showPagination = false;
            this.getBackgroundList();
        },
        selectBackground() {
            this.backgroundObj = Ktu.element.getBackgroundObj();
            console.log('this.backgroundObj',this.backgroundObj)
            const {
                backgroundObj,
            } = this;
            if (backgroundObj !== this.selectedData) {
                Ktu.interactive.uncheckAll();
                Ktu.selectedData = backgroundObj;
                // this.$store.commit('data/changeSelectedData', backgroundObj);
            }
        },
        useDefaultColor(value) {
            this.changeColor(value);
            Ktu.log('background', 'useDefaultColor');
        },
        changeColor(value) {
            /* console.log(value);
            this.selectBackground();
            if (value.toUpperCase() != 'TRANSPARENT' && !this.rgbaReg.test(value)) {
                value = value[0] === '#' ? value : `#${value}`;
            }
            this.backgroundObj.setBackGround(value); */
            /* this.$refs.colorPicker.updateHSL(value);
               this.backgroundObj.needRerenderCanvas = true;
               this.$store.commit('data/changeBackgroundProp', {
               prop: 'backgroundColor',
               value: value
               }); */

            this.selectBackground();
            if (!value.includes('type')) {
                let color = '';
                if (this.rgbReg.test(value) && !this.rgbaReg.test(value)) {
                    const arr = value.split('(');
                    const arr1 = arr[1].split(')');
                    const arr2 = arr1[0].split(',');
                    for (let i = 0; i < 3; i++) {
                        // eslint-disable-next-line radix
                        color += parseInt(arr2[i]).toString(16);
                    }
                    value = color;
                }
                if (value.toUpperCase() != 'TRANSPARENT' && !this.rgbaReg.test(value)) {
                    value = value[0] === '#' ? value : `#${value}`;
                }
                this.backgroundObj.setBackGround(value);
            } else {
                this.backgroundObj.setBackGround(value);
            }

            /* this.$refs.colorPicker.updateHSL(value);
               this.backgroundObj.needRerenderCanvas = true;
               this.$store.commit('data/changeBackgroundProp', {
               prop: 'backgroundColor',
               value: value
               }); */
        },
        changeBgImage(item) {
            // 设置 设置背景类型为图片image，裁切需要使用到

            this.selectBackground();

            // 如果背景处于裁剪状态需要退出裁剪才能正常切换背景
            this.backgroundObj && this.backgroundObj.isClipMode && this.backgroundObj.exitClipMode(false);

            const imageObject = {
                type: 'image',
                src: item.filePath,
                width: item.width,
                height: item.height,
                fileId: item.resourceId,
            };

            this.backgroundObj.setBackGround(imageObject);
            Ktu.log('background', 'useDefaultImage');
        },
        colorItemBg(color) {
            let result = color;
            if (color.includes('type')) {
                const value = JSON.parse(color);
                if (value.type === 'linear') {
                    let linear = 'linear-gradient(to right,';
                    value.value.forEach((item, index, arr) => {
                        linear += item.color;
                        if (index !== arr.length - 1) linear += ',';
                    });
                    linear += ')';
                    result = linear;
                } else {
                    let radial = 'radial-gradient(circle,';
                    value.value.forEach((item, index, arr) => {
                        radial += item.color;
                        if (index !== arr.length - 1) radial += ',';
                    });
                    radial += ')';
                    result = radial;
                }
            };
            return {
                background: result,
            };
        },
        // 收藏颜色
        collectColor() {
            if (!this.color) {
                return false;
            }
            const isReapeat = this.collectColorArr.some(color => this.color.toUpperCase() === color.toUpperCase());
            if (isReapeat) {
                this.$Notice.warning('该颜色已被收藏，请勿重复收藏');
            } else {
                this.collectColorList.push(this.color);
                this.saveCollectColor();
            }
        },
        // 删除收藏颜色的开关
        delColorState() {
            this.isDelState = !this.isDelState;
        },
        delColor(index) {
            this.collectColorList.splice(index, 1);
            if (this.collectColorList.length == 0) {
                this.isDelState = false;
            }
            this.saveCollectColor();
        },
        saveCollectColor() {
            const _this = this;
            axios.post('/ajax/ktu_h.jsp?cmd=setUserOther', {
                collectColor: JSON.stringify(this.collectColorList),
            }).then(res => {
                const result = (res.data);
                if (result.success) {
                    Ktu.userData.other.collectColor = _this.collectColorList;
                    _this.$Notice.success('操作成功！');
                }
            })
                .catch(err => {
                    _this.$Notice.error('服务繁忙，请稍后再试。');
                });
        },
        jumptoUpload() {
            /* this.$store.commit('data/changeShowModelType', 'changeBackground');
               Ktu.storeModule.mutations.changeShowModelType(changeBackground) */
            this.selectBackground();
            this.$store.commit('modal/imageSourceModalState', {
                isOpen: true,
            });
            Ktu.log('background', 'clickCustomImage');
        },
        pickColor() {
            if (this.isPickingColor) {
                return;
            }
            this.selectBackground();
            const vm = this;
            const previousColor = this.backgroundObj.backgroundColor;
            const imageSource = this.backgroundObj.image ? _.cloneDeep(this.backgroundObj.image) : null;
            vm.isPickingColor = true;

            const {
                picker,
            } = this.$refs;

            vm.backgroundObj.saveState();

            Ktu.utils.pickColor(picker, (color, addHistory) => {
                vm.backgroundObj.setBackGround(color);
                addHistory && vm.backgroundObj.modifiedState();
            }, () => {
                if (previousColor !== vm.backgroundObj.backgroundColor) {
                    vm.backgroundObj.setBackGround(imageSource ? imageSource : previousColor);
                }
                vm.isPickingColor = false;
            });
        },
        getRadiusClass(index) {
            const {
                length,
            } = this.collectColorArr;
            const row = Math.ceil((length + 1) / this.colorEachRow);
            const remain = length % this.colorEachRow;
            if (index === (row - 1) * this.colorEachRow) {
                return 'bottom-left-radius';
            } else if (index === (row - 1) * this.colorEachRow - 1 && remain !== this.colorEachRow - 1) {
                return 'bottom-right-radius';
            }
        },
    },
});
