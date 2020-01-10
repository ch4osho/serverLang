Vue.component('ele-text', {
    template: `<div class="ele-text page" v-if="hasLoadedText">
                    <div class="ele-text-container container" ref="container" @scroll="scrollLoad">
                        <div class="ele-text-type">
                            <div v-for="(text, index) in textList" :style="{fontSize: text.egFontSize+'px',fontWeight: text.bold?'bold':'400'}" class="ele-text-add" @click="addText(text, index, 'textbox')"  @dragstart="dragStart($event, text)" draggable="true" @dragend="dragEnd($event, text, index, 'textbox')">{{text.title}}</div>
                        </div>
                        <div class="ele-text-content">
                            <div class="ele-text-head" ref="textHeader">
                                <div class="ele-text-tab" v-for="(tab, index) in textBarList" :key="index" @click="chooseTextType(tab, index)" :class="{'active': textBarType === tab.key}">{{tab.name}}</div>
                                <div class="back-color" :style="{width: tabWidth + 'px',left: tabLeft + 'px',}"></div>
                            </div>
                            <div class="ele-text-split" v-if="isFromThirdDesigner"></div>
                            <div class="ele-text-slide" ref="slide" :class="{style: !textBarList.textGroup || textBarType !== textBarList.textGroup.key }">
                                <transition name="material-show">
                                    <div v-if="textBarType === textBarList.wordArt.key">
                                        <div class="ele-text-item" v-for="(style, styleName) in textStyle" :key="styleName" :index="styleName" @click="addText(style, Object.keys(textStyle).indexOf(styleName), 'wordart')" draggable="true"  @dragstart="dragStart($event, style)" @dragend="dragEnd($event, style, Object.keys(textStyle).indexOf(styleName), 'wordart')">
                                            <div class="ele-text-item-inner">
                                                <img class="ele-text-item-img" :src="getStylePreview(styleName)" v-if="hasMounted">
                                            </div>
                                        </div>
                                        <div class="water-tip">
                                            <span class="water-tip-text">这是我的底线</span>
                                        </div>
                                    </div>
                                </transition>
                                <transition name="material-show">
                                    <div v-if="textBarList.threeText && textBarType === textBarList.threeText.key">
                                        <div class="ele-text-item" v-for="(item, index) in threeTextList" :key="index" @click="addThreeText(item, 'threeText')" draggable="true"  @dragstart="dragStart($event, item)" @dragend="dragEndThreeText($event, item, 'threeText')">
                                            <div class="ele-text-item-inner">
                                                <img class="ele-text-item-img" :src="getThreeTextPreview(item.name)" v-if="hasMounted">
                                            </div>
                                        </div>
                                        <div class="water-tip">
                                            <span class="water-tip-text">这是我的底线</span>
                                        </div>
                                    </div>
                                </transition>
                                <transition name="material-show">
                                    <div v-if="textBarList.textGroup && textBarType == textBarList.textGroup.key">
                                        <div class="ele-text-group">
                                            <div class="ele-text-item" v-for="(item,index) in materialItem" :key="index" :index="index" @click="useWaterItem(item)" draggable="true"  @dragstart="dragStart($event, item)" @dragend="dragEndTextGroup($event, item)">
                                                <div class="ele-text-item-inner">
                                                    <img class="ele-text-item-img" :src="waterItemImg(item)">
                                                </div>
                                            </div>
                                        </div>
                                        <loading v-show="isLoading"></loading>
                                        <!-- 分页 -->
                                        <pagination v-show="showPagination" :nowPage="nowIndex" :totalSize="activeItemTotal" :itemLimit="materialGetLimit" :scrollLimit="scrollIndexLimit" @on-change="selectPageChange"></pagination>

                                        <div v-show="hasLoadedAll && !showPagination && loadAllTip" class="water-tip">
                                            <span class="water-tip-text">这是我的底线</span>
                                        </div>
                                    </div>
                                </transition>
                            </div>
                        </div>
                   </div>
                </div>`,
    data() {
        return {
            isUiManage: Ktu.isUIManage,
            hasLoadedText: true,

            textList: Ktu.config.ele.text,
            textBarList: {
                wordArt: {
                    key: 'wordArt',
                    name: '艺术字',
                },
                threeText: {
                    key: 'threeText',
                    name: '3D文字',
                },
                textGroup: {
                    key: 'textGroup',
                    name: '文字组合',
                },
            },
            textBarType: 'wordArt',

            isLoading: false,
            hasLoadedAll: false,
            showPagination: false,

            nowIndex: 0,
            materialItem: [],
            materialItemLeft: [],
            materialItemRight: [],
            // 当前是单色还是多色文字组合
            color: 0,

            activeItemTotal: 0,
            // 每次请求获取数量
            materialGetLimit: 20,
            // 滚动加载 最多数量
            materialScrollLimit: 120,

            // 是否正在添加素材
            isAddingText: false,

            /* 获取画布的中心点
               centerPoint: Ktu.mainCanvas.getBackgroundObj().getCenterPoint(), */

            // 记录两列高度
            leftHeight: 0,
            rightHeight: 0,
            paddingTop: 6,

            loadAllTip: false,
            textStyle: Ktu.config.textStyle,
            pageX: 0,
            pageY: 0,
            hasMounted: false,
            tabWidth: 0,
            tabLeft: 2,
            threeTextList: Ktu.threeTextConfig.threeTextList,
        };
    },
    computed: {
        isFromThirdDesigner() {
            return Ktu.isFromThirdDesigner;
        },
        // 滚动加载的次数限制
        scrollIndexLimit() {
            return this.materialScrollLimit / this.materialGetLimit;
        },
        documentWidth() {
            return Ktu.edit.documentSize.width;
        },
        documentHeight() {
            return Ktu.edit.documentSize.height;
        },
        /* 获取画布的中心点
           centerPoint: function () {
           return {
           x: this.documentWidth / 2,
           y: this.documentHeight / 2
           };
           }, */
    },
    created() {
        if (!Ktu.isSupportWebGL && this.textBarList.threeText) {
            Vue.delete(this.textBarList, 'threeText');
        }
        if (this.isFromThirdDesigner) {
            Vue.delete(this.textBarList, 'textGroup');
        }
    },
    mounted() {
        // 第三方设计师 不获取文字排版
        if (!this.isFromThirdDesigner) {
            this.getMaterialItem();
        }

        // firefox无法在ondrag,ondragend事件获取pageX,pageY,为了兼容在document.body中使用dragOver事件中获取pageX,pageY
        document.body.addEventListener('dragover', this.onDragover);
        setTimeout(() => {
            this.hasMounted = true;
        }, 100);
        const { offsetWidth = 272 } = this.$refs.textHeader;
        this.textKeyList = Object.keys(this.textBarList);
        this.tabWidth = (offsetWidth - 4) / this.textKeyList.length;
    },
    methods: {
        getStylePreview(style) {
            return this.hasMounted ? `${Ktu.initialData.resRoot}/image/editor/textStyle/${style}.png` : '';
        },
        getThreeTextPreview(style = 'threeText') {
            return this.hasMounted ? `${Ktu.initialData.resRoot}/image/threeText/list/thumb/${style}.png` : '';
        },
        // 首次使用时候显示提示框
        showTextTip() {
            Ktu.store.commit('msg/showManipulatetip', 'isShowTextTip');
        },
        addText(textObj, index, type) {
            this.showTextTip();
            if (this.isAddingText) {
                return;
            }
            this.isAddingText = true;
            const text = textObj.text ? textObj.text : '双击编辑文字';
            Ktu.element.addModule(type, {
                text,
                width: textObj.width ? textObj.width : text.length * 80,
                fontSize: textObj.fontSize,
                fontId: textObj.fontId,
                fontWeight: textObj.fontWeight,
                scaleX: textObj.scale,
                scaleY: textObj.scale,
                fill: textObj.fill ? textObj.fill : this.fontColor(),
                shadow: _.cloneDeep(textObj.shadow),
                skewX: textObj.skewX,
                skewY: textObj.skewY,
                style: _.cloneDeep(textObj.style),
                from: 'textBox',
            });
            setTimeout(() => {
                this.isAddingText = false;
                Ktu.isAddImgChange = true;
                // 记录添加相同素材次数
            }, 100);
            if (type === 'wordart') {
                Ktu.log('addWordart', 'add');
                Ktu.simpleLog('wordart_add', index + 1);
            } else {
                Ktu.log('addText', index);
            }
        },
        addThreeText(textObj, type) {
            if (this.isAddingThreeText) {
                return;
            }
            this.isAddingThreeText = true;
            const newObject = _.assignIn({}, textObj);
            delete newObject.left;
            delete newObject.top;
            newObject.src = `${Ktu.initialData.resRoot}/image/threeText/list/original/${textObj.name}.png`;
            Ktu.element.addModule(type, newObject);
            Ktu.log('threeTextAdd', 'add');
            setTimeout(() => {
                this.isAddingThreeText = false;
            }, 100);
        },
        chooseTextType(tab) {
            // 切换topbar的小方块位置(通过key的下标去计算就好了)
            const index = this.textKeyList.indexOf(tab.key);
            this.tabLeft = index * this.tabWidth + 2;
            this.textBarType = tab.key;
            if (this.textBarList.textGroup && tab.key === this.textBarList.textGroup.key) {
                this.waterDataInit();
            }
        },
        selectPageChange(nowPage) {
            this.waterDataInit(nowPage);
        },
        scrollLoad() {
            this.scrollTimer && window.clearTimeout(this.scrollTimer);
            this.scrollTimer = window.setTimeout(() => {
                // 加载完毕 返回
                if (this.hasLoadedAll) return false;
                // 滚动加载限制 数量大于等于最大加载数量 并且 少于总数量 才出现 分页选择
                if (this.materialItem.length >= this.materialScrollLimit && this.materialItem.length < this.activeItemTotal) {
                    this.showPagination = true;
                    return false;
                }

                const {
                    container,
                } = this.$refs;
                const {
                    slide,
                } = this.$refs;
                if (!this.isLoading && container.scrollTop + container.clientHeight >= slide.clientHeight) {
                    this.isLoading = true;
                    this.nowIndex++;
                    this.getMaterialItem();
                }
            }, 50);
        },
        waterItemImg(item) {
            let imgPath = item.path;
            if (this.$store.state.base.isSupportWebp) {
                imgPath = Ktu.getWebpOrOtherImg(imgPath);
            }
            return imgPath;
        },

        // 瀑布流数据初始化
        waterDataInit(nowPage) {
            if (nowPage) {
                this.nowIndex = (nowPage - 1) * this.scrollIndexLimit;
            } else {
                this.nowIndex = 0;
            }
            $('.container').scrollTop(0);
            this.materialItem = [];
            this.materialItemLeft = [];
            this.materialItemRight = [];
            this.leftHeight = 0;
            this.rightHeight = 0;
            this.isLoading = false;
            this.hasLoadedAll = false;
            this.showPagination = false;
            this.getMaterialItem();
        },
        // 使用物品
        useWaterItem(item, position) {
            this.showTextTip();
            Ktu.recordAddNum = Ktu.recordAddNum || 0;
            // 生成中不可重复点击，知道生成成功后重新激活
            if (this.isAddingText) {
                return;
            }
            this.isAddingText = true;
            $.getCacheScript(item.filePath, () => {
                item.contents = Ktu.element.removeFontFaceId(Ktu._jsData.tmpContents);

                const template = item.contents[0];
                const objects = this.getPosition(template.content[0].objects, position, item.id);
                // 对旧数据进行处理
                if (!!objects[0].originGroup) {
                    Ktu.compat.process(template.content[0]);
                }
                // 初始化对象
                Ktu.template.processTemplate(template.content[0]);

                // 插入对象(需要先把objectId更新)
                objects[0].objectId = Ktu.element.newObjectId;

                if (objects[0].objects) {
                    objects[0].objects.forEach(item => {
                        item.objectId = Ktu.element.newObjectId;
                    });
                }

                Ktu.selectedTemplateData.objects.push(objects[0]);

                Ktu.element.refreshElementKey();
                Ktu.interactive.uncheckAll();
                if (objects[0].type == 'group') {
                    Ktu.selectedGroup = objects[0];
                    Ktu.selectedGroup.addedState();
                    Ktu.selectedData = null;
                } else {
                    Ktu.selectedData = objects[0];
                    Ktu.selectedData.addedState();
                }

                setTimeout(() => {
                    this.isAddingText = false;
                    Ktu.isAddImgChange = true;
                }, 100);
            });
            Ktu.log('addTextGroup', this.color);
        },

        // 正确显示素材显示位置(注意当前缩放值scaleX，scaleY)
        getPosition(obj, position, id) {
            const object = obj[0];
            let [newWidth, newHeight] = [object.width, object.height];

            if (this.documentWidth < object.width || this.documentHeight < object.height) {
                const [documentRatio, objectRatio] = [this.documentWidth / this.documentHeight, object.width / object.height];
                if (documentRatio <= objectRatio) {
                    // [size.width, size.height] = [documentWidth, documentWidth / width * height];
                    [newWidth, newHeight] = [this.documentWidth, this.documentWidth / object.width * object.height];
                } else {
                    [newWidth, newHeight] = [this.documentHeight / object.height * object.width, this.documentHeight];
                }
                object.scaleX = newWidth / object.width;
                object.scaleY = newHeight / object.height;
            }
            // 当是拖拉的时候有不采用居中定位
            if (position) {
                object.left = position.left - object.width * object.scaleX / 2;
                object.top = position.top - object.height * object.scaleY / 2;
                Ktu.recordAddNum = 0;
                Ktu.lastAddImgId = '';
            } else {
                this.recordNum(id);
                const pasteOffset = Math.max(10, this.documentWidth / 30, this.documentHeight / 30);
                object.left = (Ktu.edit.documentSize.width - object.width * object.scaleX) / 2 + pasteOffset * Ktu.recordAddNum;
                object.top = (Ktu.edit.documentSize.height - object.height * object.scaleY) / 2 + pasteOffset * Ktu.recordAddNum;
            }
            return obj;
        },

        // 记录添加素材的次数并且错位显示
        recordNum(id) {
            if (Ktu.lastAddImgId === id && Ktu.isAddImgChange) {
                Ktu.recordAddNum += 1;
            } else {
                Ktu.recordAddNum = 0;
            }
            Ktu.lastAddImgId = id;
        },
        // firefox无法在ondrag,ondragend事件获取pageX,pageY,为了兼容在document.body中使用dragOver事件中获取pageX,pageY
        onDragover(ev) {
            this.pageX = ev.pageX;
            this.pageY = ev.pageY;
        },
        dragStart(event, item) {
            event.stopPropagation();
            event.dataTransfer.setData('firefoxInfo', '');
            // 拖拽的时候存储拖拽值
            Ktu.element.dragObject = item;
        },

        dragEnd(event, textObj, index, type) {
            this.showTextTip();
            const canvasRect = Ktu.edit.getEditareaSize();
            canvasRect.right = canvasRect.left + canvasRect.width;
            canvasRect.bottom = canvasRect.top + canvasRect.height;

            
            // 判断是否拖进编辑器内
            if (this.pageX > canvasRect.left && this.pageX < canvasRect.right && this.pageY > canvasRect.top && this.pageY < canvasRect.bottom) {
                const {
                    scale,
                } = Ktu.edit;
                const text = textObj.text || '双击编辑文字';
                Ktu.element.addModule(type, {
                    text,
                    width: textObj.width ? textObj.width : text.length * 80,
                    fontSize: textObj.fontSize,
                    scaleX: textObj.scale,
                    scaleY: textObj.scale,
                    // 注意考虑当前缩放的比例
                    left: (this.pageX - canvasRect.left - Ktu.edit.documentPosition.left) / scale,
                    top: (this.pageY - canvasRect.top - Ktu.edit.documentPosition.top) / scale,
                    style: _.cloneDeep(textObj.style),
                    from: 'textBox',
                    fontId: textObj.fontId,
                    fontWeight: textObj.fontWeight,
                    fill: textObj.fill ? textObj.fill : this.fontColor(),
                    shadow: _.cloneDeep(textObj.shadow),
                    skewX: textObj.skewX,
                    skewY: textObj.skewY,
                });
                if (type === 'wordart') {
                    Ktu.log('addWordart', 'add');
                    Ktu.simpleLog('wordart_add', index + 1);
                } else {
                    Ktu.log('addText', index);
                }
            }
        },
        dragEndThreeText(event, textObj, type) {
            const canvasRect = Ktu.edit.getEditareaSize();
            canvasRect.right = canvasRect.left + canvasRect.width;
            canvasRect.bottom = canvasRect.top + canvasRect.height;
            // 判断是否拖进编辑器内
            if (this.pageX > canvasRect.left && this.pageX < canvasRect.right && this.pageY > canvasRect.top && this.pageY < canvasRect.bottom) {
                const {
                    scale,
                } = Ktu.edit;
                this.isAddingThreeText = true;
                const newObject = _.assignIn(textObj, {});
                newObject.src = `${Ktu.initialData.resRoot}/image/threeText/list/original/${newObject.name}.png`;
                newObject.left = (this.pageX - canvasRect.left - Ktu.edit.documentPosition.left) / scale,
                newObject.top = (this.pageY - canvasRect.top - Ktu.edit.documentPosition.top) / scale;
                Ktu.element.addModule(type, newObject);
                Ktu.log('threeTextAdd', 'add');
                setTimeout(() => {
                    this.isAddingThreeText = false;
                }, 100);
            }
        },
        dragEndTextGroup(event, item) {
            const canvasRect = Ktu.edit.getEditareaSize();
            canvasRect.right = canvasRect.left + canvasRect.width;
            canvasRect.bottom = canvasRect.top + canvasRect.height;
            // 图片拖拽进容器
            Ktu.element.dragObject = null;

            // 判断是否拖进编辑器内
            if (this.pageX > canvasRect.left && this.pageX < canvasRect.right && this.pageY > canvasRect.top && this.pageY < canvasRect.bottom) {
                const {
                    scale,
                } = Ktu.edit;
                const position = {
                    left: (this.pageX - canvasRect.left - Ktu.edit.documentPosition.left) / scale,
                    top: (this.pageY - canvasRect.top - Ktu.edit.documentPosition.top) / scale,
                };
                item.from = 'textBox';
                this.useWaterItem(item, position);
            }
        },

        // 获取素材
        getMaterialItem() {
            if (this.textBarList.textGroup && this.textBarType === this.textBarList.textGroup.key) {
                const url = '../ajax/ktuEleAssociation_h.jsp?cmd=getEleAssociationList';

                this.isLoading = true;
                this.loadAllTip = false;
                this.hasLoadedAll = false;

                axios.post(url, {
                    scrollIndex: this.nowIndex,
                    limit: 20,
                    color: this.color,
                }).then(res => {
                    const info = (res.data);

                    if (info.success) {
                        this.activeItemTotal = info.totalSize;
                        const tmpArr = info.data;

                        this.materialItem.push(...tmpArr);

                        // 当请求回来的数据不足20条则加载完毕
                        if (tmpArr.length < this.materialGetLimit || (this.activeItemTotal == (this.nowIndex + 1) * this.materialGetLimit)) {
                            /* 这个为了避免该提示老是出现在资源加载完成前出现*/
                            /* setTimeout(() => { */
                            this.hasLoadedAll = true;
                            /* }, 1000);*/
                            /* 虽然加载完毕 但如果不在第一页 要出现分页选择其他页 */
                            if (this.nowIndex >= this.scrollIndexLimit) {
                                this.showPagination = true;
                            }
                        }
                        setTimeout(() => {
                            this.loadAllTip = true;
                        }, 500);
                    }
                })
                    .catch(err => {
                        console.log(err);
                    })
                    .finally(() => {
                        this.isLoading = false;
                    });
            }
        },

        /* // 加载图片获取两列的高度
           getImg: function (item, callback) {
           let img = new Image();
           img.src = this.waterItemImg(item);
           //如果图片被缓存，则直接返回缓存数据
           if (img.complete) {
           callback(Number(img.height) / Number(img.width));
           } else {
           //完全加载完毕的事件
           img.onload = function () {
           callback(Number(img.height) / Number(img.width));
           }
           }
           }, */

        // 16进制颜色转为RGB格式
        colorRgb(value) {
            const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
            let color = value.toLowerCase();
            if (color && reg.test(color)) {
                if (color.length === 4) {
                    let colorNew = '#';
                    for (let i = 1; i < 4; i += 1) {
                        colorNew += color.slice(i, i + 1).concat(color.slice(i, i + 1));
                    }
                    color = colorNew;
                }
                // 处理六位的颜色值
                const colorChange = [];
                for (let i = 1; i < 7; i += 2) {
                    colorChange.push(parseInt(`0x${color.slice(i, i + 2)}`, 16));
                }
                return {
                    r: colorChange[0],
                    g: colorChange[1],
                    b: colorChange[2],
                };
            }
            return color;
        },

        // 插入文本的颜色（取决于背景的颜色）
        fontColor() {
            const bgColor = this.colorRgb(Ktu.element.getBackgroundObj().backgroundColor) || {};
            if (bgColor.r < 127 && bgColor.g < 127 && bgColor.b < 127) {
                return '#fff';
            }
            return '#345';
        },
    },
});
