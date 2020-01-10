Vue.component('ele-component', {
    mixins: [Ktu.mixins.dataHandler],
    template: `
    <div class="page-area-component" :class="{is360Brower : is360Brower}">
        <div class="comp-container" ref="container">
            <ul class="comp-ul" id="compList" @wheel="wheel" @scroll="scroll" ref="compList" :style="compListStyle">
                <li v-for="(comp,index) in compObjList" class="comp "
                    :class="{'selected' : selectedKey.indexOf(comp.objectId)>=0 , 'isHide' : !comp.visible , 'isLock' : comp.isLocked}"
                    @click="compClick( $event,index )"
                    @mousedown="compMouseDown( $event,index )"
                    @dragstart="compDragStart( $event,index )"
                    @drag="compDrop( $event,index )"
                    @dragend="compDragend( $event,index )"
                    @dragover="compDragOver(  $event,index )"
                    @mouseenter="compHover( $event,index )"
                    @mouseleave="compLeave( $event,index )">
                    <div class="ele-group">
                        <div class="comp-li" v-if="comp.type == 'group'" v-for="(item,idx) in comp.objects" @dblclick="compdblclick( $event , index, item)" @contextmenu.prevent="contextmenu($event,index)">
                            <div class="comp-type" v-if="item.imageType === 'gif'">
                                <svg class="comp-icon gif">
                                    <use xlink:href="#svg-gif-image"></use>
                                </svg>
                            </div>
                            <div class="comp-type" v-else>
                                <svg class="comp-icon">
                                    <use v-if="isText(item)" xlink:href="#svg-etype-text"></use>
                                    <use v-else xlink:href="#svg-etype-image"></use>
                                </svg>
                            </div>

                            <div class="ele-comp-name">
                                <p class="ele-name-state">
                                    <span>{{dealEleName(item)}}</span>
                                </p>
                                <div class="ele-name-change">
                                    <input class="changeEleName" type="text" v-model="item.elementName" maxlength="20" placeholder="请输入名称" autocomplete="off"
                                        @blur="changeNameBlur( $event, item )"/>
                                </div>
                            </div>

                            <div class="ele-comp-opt" @dblclick.stop>
                                <div class="opt-btn opt-btn-link opt-btn-tip">
                                    <svg class="comp-icon">
                                        <use xlink:href="#svg-compOpt-link-s"></use>
                                    </svg>
                                </div>

                                <div class="opt-btn opt-btn-show" @click.stop="compHide( $event , index )" :title="comp.visible?'隐藏':'显示'">
                                    <svg class="comp-icon">
                                        <use xlink:href="#svg-compOpt-hide"></use>
                                    </svg>
                                </div>

                                <div class="opt-btn opt-btn-lock" @mousedown.stop @click.stop="compLock( $event , index )" :title="comp.isLocked?'解锁':'锁定'">
                                    <svg class="comp-icon comp-icon-lock">
                                        <use xlink:href="#svg-compOpt-lock"></use>
                                    </svg>

                                </div>

                            </div>
                        </div>
                    </div>

                    <div class="comp-li" v-if="comp.type != 'group'" @dblclick="compdblclick( $event, index, comp)" @contextmenu.prevent="contextmenu($event,index)">
                        <div class="comp-type" v-if="comp.imageType === 'gif'">
                            <svg class="comp-icon gif">
                                <use xlink:href="#svg-gif-image"></use>
                            </svg>
                        </div>
                        <div class="comp-type" v-else>
                            <svg class="comp-icon">
                                <use v-if="isText(comp)" xlink:href="#svg-etype-text"></use>
                                <use v-else xlink:href="#svg-etype-image"></use>
                            </svg>
                        </div>

                        <div class="ele-comp-name">
                            <p class="ele-name-state">
                                <span>{{dealEleName(comp)}}</span>
                            </p>
                            <div class="ele-name-change">
                                <input class="changeEleName" type="text" @focus="saveCurrentName" v-model="comp.elementName" maxlength="20" placeholder="请输入名称" autocomplete="off" @blur="changeNameBlur( $event, comp )"/>
                            </div>
                        </div>

                        <div class="ele-comp-opt" v-if="comp.type !== 'background'" @dblclick.stop>
                            <div class="opt-btn opt-btn-show" @click="compHide( $event , index )" :title="comp.visible?'隐藏':'显示'">
                                <svg class="comp-icon">
                                    <use xlink:href="#svg-compOpt-hide"></use>
                                </svg>
                            </div>

                            <div class="opt-btn opt-btn-lock" @mousedown.stop @click="compLock( $event , index )" :title="comp.isLocked?'解锁':'锁定'">
                                <svg class="comp-icon comp-icon-lock">
                                    <use xlink:href="#svg-compOpt-lock"></use>
                                </svg>

                            </div>
                        </div>
                    </div>

                    <div v-if="dropElementKey == index" class="addSplace"></div>
                </li>
            </ul>
            <div class="container-scroll" v-if="hasScroll">
                <div class="scroll-bar" :style="barStyle" @mousedown="mousedownBar"></div>
            </div>
        </div>

        <div class="comp-footer" >
            <div :class="{'disabled' : selectedKey.length<=0 || activeObject.type == 'background'}">
                <div :class="{'disabled':activeObject && activeObject.isLocked}" class="opt-btn opt-btn-del"  v-if="!hideBtn" @click="delEle()">
                    <svg class="comp-icon">
                        <use xlink:href="#svg-compOpt-del"></use>
                    </svg>
                    <div class="opt-tip top">删除</div>
                </div>

                <div class="opt-btn opt-btn-copy" v-if="!hideBtn" @click="copyEle()">
                    <svg class="comp-icon">
                        <use xlink:href="#svg-compOpt-copy"></use>
                    </svg>
                    <div class="opt-tip top">复制</div>
                </div>

                <div v-if="isMultSelcted && activeObject.type !== 'group' && !isContainerThreeText" class="opt-btn opt-btn-link" @click="linkGroup()">
                    <svg class="comp-icon">
                        <use xlink:href="#svg-compOpt-link"></use>
                    </svg>
                    <div class="opt-tip top">组合</div>
                </div>

                <div v-if="activeObject && activeObject.type === 'group'" class="opt-btn opt-btn-unlink" :class="{active: hideBtn}" @click="unlinkGroup()">
                    <svg class="comp-icon">
                        <use xlink:href="#svg-compOpt-unlink"></use>
                    </svg>
                    <div class="opt-tip top">取消组合</div>
                </div>

                <div class="opt-btn opt-btn-level" :class="{'noTip': noTip,'setLeft': hideBtn}">
                    <tool-level v-if="activeObject" :isToolBar="false" @selectLevel="selectLevel" @isShow="toolLevelShow"></tool-level>
                    <svg class="comp-icon" v-else>
                        <use xlink:href="#svg-compOpt-level"></use>
                    </svg>
                    <div class="opt-tip top">层级</div>
                </div>

            </div>
        </div>

        <ele-contextmenu :event="contextmenuEvent" @emptyContextmenuEvent="emptyContextmenuEvent" @rename="rename"></ele-contextmenu>
    </div>
    `,
    name: 'ele-component',
    props: {

    },
    data() {
        return {
            // 记录要元素要拖拉到什么位置
            dropElementKey: -1,
            /* 记录部件列表的高度top，bottom值，用于处理当拖出图层区域时滚动列表
               compListHeight: 1,
               compListTop: 1,
               compListBottom: 1, */
            noTip: false,
            wheelY: 0,

            // 右键事件
            contextmenuEvent: null,
            currentIndex: null,
            currentObject: null,
            currentTarget: null,

            // 滚动
            isDragging: false,
            containerHeight: 0,
            compListHeight: 0,
            maxScroll: 0,
            hasScroll: false,
            barHeight: 0,
            barTranslateY: 0,
            barHeight: 0,
            maxBarTranslateY: 0,
            barInterval: 50,
            barDragging: false,
            containerBCR: null,
        };
    },
    computed: {
        hideBtn() {
            let hasGif = false;
            const activeObject = this.selectedData || this.selectedGroup || this.currentMulti;
            if (activeObject) {
                if (/gif$/.test(activeObject.imageType)) {
                    hasGif = true;
                } else if (['group', 'multi'].indexOf(activeObject.type) !== -1) {
                    const objectArr = activeObject.objects;
                    for (let i = 0; i < objectArr.length; i++) {
                        if (objectArr[i].type === 'group') {
                            const groupArr = objectArr[i].objects;
                            for (let j = 0;j < groupArr.length;j++) {
                                if (groupArr[j].type === 'cimage' && /\.gif/.test(groupArr[j].image.src)) {
                                    hasGif = true;
                                }
                            }
                        } else if (objectArr[i].type === 'cimage' && /\.gif/.test(objectArr[i].image.src)) {
                            hasGif = true;
                        }
                    }
                }
                return !Ktu.isUIManage && hasGif;
            }
        },
        compObjList() {
            const selTemplateData = this.$store.state.data.selectedTemplateData;
            const { objects } = selTemplateData;
            return objects;
        },

        objectLength() {
            let count = this.compObjList.length;
            this.compObjList.forEach(item => {
                if (item.objects) {
                    count += item.objects.length - 1;
                }
            });
            return count;
        },

        // 获取选中元素的objectId
        selectedKey() {
            const keys = [];

            const activeObject = this.currentMulti || this.selectedGroup || this.selectedData;

            if (activeObject) {
                if (activeObject.type === 'multi') {
                    const _objects = activeObject.objects || [];
                    for (let i = 0; i < _objects.length; i++) {
                        keys.push(_objects[i].objectId);
                    }
                } else {
                    keys.push(activeObject.objectId);
                }
            }

            return keys;
        },

        isMultSelcted() {
            return this.selectedKey.length > 1;
        },

        is360Brower() {
            // return this.$store.state.is360Brower;
            return true;
        },

        // 滚动的样式
        compListStyle() {
            return {
                transform: `translateY(${this.wheelY}px)`,
            };
        },

        // 滚动条样式
        barStyle() {
            return {
                height: `${this.barHeight}px`,
                transform: `translateY(${this.barTranslateY}px)`,
            };
        },
        isContainerThreeText() {
            if (this.activeObject && this.activeObject.objects) {
                for (let i = 0; i < this.activeObject.objects.length; i++) {
                    const item = this.activeObject.objects[i];
                    if (item && item.type == 'threeText') {
                        return true;
                    }
                }
            }
            return false;
        },
    },
    watch: {
        objectLength() {
            this.initScroll();
        },
    },
    mounted() {
        // 当浏览器容器改变是实时更新数据
        window.addEventListener('resize', () => (() => {
            this.initScroll();
        })());
        this.initScroll();
    },
    methods: {
        isText(object) {
            if (object.type === 'threeText') {
                return true;
            }
            return object instanceof Text;
        },
        compClick(ev, idx) {
            // 这个点击图层的更新元素操作应该在mosuedown做比较稳妥
            const target = this.compObjList[idx];
            /* Ktu.selectedData = target
               Ktu.mainCanvas.setElementMultSelected(ev,target);
               if (!(this.activeObject && target === this.activeObject)) { */
            Ktu.interactive.select(target, ev);
            // }
        },

        compdblclick(ev, idx, obj) {
            const target = this.compObjList[idx];
            if (target.type == 'background') {
                return;
            }
            // 当elementName的值为空时，需要将text值赋予给他
            if (obj instanceof Text && obj.elementName === '') {
                obj.elementName = obj.text.substring(0, 20);
            }

            if (obj.type === 'threeText' && obj.elementName === '') {
                obj.elementName = obj.text.substring(0, 20);
            }

            $(ev.currentTarget).addClass('active');

            this.$nextTick(() => {
                $(ev.currentTarget).find('.changeEleName')
                    .select();
            });
        },

        changeNameBlur(ev, obj) {
            $(ev.currentTarget).closest('.comp-li')
                .removeClass('active');
            // 当elementName的值等于text默认没有改动
            if (obj instanceof Text && obj.elementName === obj.text.substring(0, 20)) {
                obj.elementName = '';
            } else {
                this.activeObject.modifiedState();
            }
        },

        saveCurrentName() {
            this.activeObject.saveState();
        },

        compHover(ev, idx) {
            // 拖拽的时候不能hover
            if (this.isDragging) { return; }

            const target = this.compObjList[idx];

            target.isHover = true;

            if (target.objects) {
                target.objects.forEach(item => {
                    item.isHover = true;
                });
            }

            $(ev.currentTarget).addClass('isHover');
        },

        compLeave(ev, idx) {
            const target = this.compObjList[idx];

            target.isHover = false;

            if (target.objects) {
                target.objects.forEach(item => {
                    item.isHover = false;
                });
            }

            $(ev.currentTarget).removeClass('isHover');
        },

        compHide(ev, idx) {
            this.compClick({}, idx);
            ev.stopPropagation();
            this.activeObject.setVisible();
            Ktu.log('eleComp', 'hide');
        },

        compLock(ev, idx) {
            this.contextmenuEvent = ev;
            this.compClick({}, idx);
            ev.stopPropagation();
            this.activeObject.lock();
            Ktu.log('eleComp', 'lock');
        },

        linkGroup() {
            this.activeObject.setGroup();
            Ktu.log('eleComp', 'group');
        },

        unlinkGroup() {
            this.activeObject.cancelGroup();
            Ktu.log('eleComp', 'group');
        },

        delEle() {
            const that = this;
            this.$Modal.confirm({
                content: '将选中的所有元素删除，是否继续？',
                onOk() {
                    that.activeObject.remove();
                    Ktu.log('eleComp', 'del');
                },
            });
        },

        copyEle() {
            // 这里因为copy中有异步操作，确保对象更改完再进行复制
            Ktu.element.copy();
            Ktu.element.paste();
            Ktu.log('eleComp', 'copy');
            this.noTip = false;
        },

        createDragImage(text) {
            const $img = $('<div></div>');

            $img.text(text);

            $img.css({
                top: '-110px',
                left: '-110px',
                position: 'absolute',
                pointerEvents: 'none',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: '#fff',
                fontSize: '12px',
                paddingLeft: '5px',
                lineHeight: '34px',
                width: '160px',
                height: '34px',
                'z-index': 9999,
            }).appendTo(document.body);

            setTimeout(() => {
                $img.remove();
            });
            return $img[0];
        },

        compMouseDown(ev, idx) {
            const target = this.compObjList[idx];

            /* 这个要处理当画布选中元素，而右侧图层拖动另一个元素产生问题，要及时更新activeObject
               if (!(this.activeObject && target === this.activeObject)) {
               Ktu.interactive.select(target, ev);
               } */

            if (target.type != 'background') {
                $(ev.currentTarget).attr('draggable', true);
                this.compIsMove = true;
            }
        },

        compDragStart(ev, idx) {
            // 兼容firefox,必须setData，否则拖拽无法生效
            ev.dataTransfer.setData('firefox', '');
            this.isDragging = true;
            const target = this.compObjList[idx];

            const listNode = $('#compList')[0];

            if (!listNode) {
                return;
            }

            // 第一个判断避免后面报错。第二个判断是避免按ctrl选中同一个元素再直接拖拉此时的状态为多选状态
            if (!this.activeObject || (target !== this.activeObject && this.activeObject.type != 'multi')) {
                Ktu.interactive.select(target, ev);
            }

            const offsetX = 10;
            const offsetY = 10;

            ev.dataTransfer.effectAllowed = 'move';
            const dragTipText = this.isMultSelcted || target.type == 'group' ? '拖拉选中的元素' : this.dealEleName(target);
            const $img = this.createDragImage(dragTipText);

            ev.dataTransfer.setDragImage($img, offsetX, offsetY);

            /* this.compListHeight = $('#compList').height();
               this.compListTop = $('#compList').offset().top;
               this.compListBottom = this.compListHeight + this.compListTop;
               this.compListHasScroll = listNode.offsetWidth != listNode.clientWidth; */
        },

        compDragOver(ev, idx) {
            this.dropElementKey = idx;
        },

        compDrop(ev, idx) {
            // 避免containerBCR没有的时候下面报错
            if (!this.containerBCR) {
                return;
            }
            const cursorY = ev.pageY;
            const delta = 30;

            if (cursorY > this.containerBCR.bottom - delta) {
                if (this.wheelY > this.maxScroll) {
                    if (this.wheelY < (this.maxScroll + 10)) {
                        this.wheelY = this.maxScroll;
                    } else {
                        this.wheelY -= 10;
                    }
                    this.initBar();
                }
            } else if (cursorY < this.containerBCR.top + delta) {
                if (this.wheelY < 0) {
                    if (this.wheelY > -10) {
                        this.wheelY = 0;
                    } else {
                        this.wheelY += 10;
                    }
                    this.initBar();
                }
            }
        },

        compDragend(ev, idx) {
            this.isDragging = false;
            const selData = this.activeObject;

            if (this.dropElementKey < 0) {
                return;
            }

            const newIdx = (this.dropElementKey <= idx) ? this.dropElementKey + 1 : this.dropElementKey;

            this.dropElementKey = -1;

            selData.savaZindexState();

            if (!this.isMultSelcted) {
                const { depth } = this.activeObject;
                Ktu.selectedTemplateData.objects.splice(depth, 1);
                Ktu.selectedTemplateData.objects.splice(newIdx, 0, selData);
            } else {
                // 这里需要根据depth重新排序，不然下面for先删掉depth值小的，后面的大的的元素就会删错
                const objs = selData.objects.sort((prev, next) => prev.depth - next.depth);

                for (let i = objs.length - 1; i >= 0; i--) {
                    const item = objs[i];
                    const { depth } = item;
                    Ktu.selectedTemplateData.objects.splice(depth, 1);
                }

                Ktu.selectedTemplateData.objects.splice(newIdx, 0, ...objs);
            }

            Ktu.element.refreshElementKey();

            selData.zindexState();
        },

        selectLevel(level, recordHistory) {
            this.activeObject.changeZIndex(level, false, recordHistory);

            // 层级管理日志
            Ktu.simpleLog(this.activeObject.type, 'level');
            if (recordHistory) {
                let logName = level;
                switch (level) {
                    case 'up':
                        logName = 'up_tool';
                        break;
                    case 'down':
                        logName = 'down_tool';
                        break;
                    case 'top':
                        logName = 'top_tool';
                        break;
                    case 'bottom':
                        logName = 'bottom_tool';
                        break;
                };
                Ktu.log('levelManage', logName);
            }
        },

        toolLevelShow(value) {
            this.noTip = value;
        },

        // 处理当type="textbook"且elementName为空时，以text为显示值
        dealEleName(obj) {
            if (obj instanceof Text) {
                if (obj.elementName !== '') {
                    return obj.elementName;
                }
                return obj.text.substring(0, 20);
            } else if (obj.type === 'threeText') {
                if (obj.elementName === '') {
                   return obj.text.substring(0, 20);
                }
                return obj.elementName;
            }
            return obj.elementName;
        },

        wheel(ev) {
            if (!this.is360Brower || !this.hasScroll) {
                return;
            }

            let y = this.wheelY;
            y -= ev.deltaY / 2;

            // 做一个极限处理
            if (y > 0) {
                y = 0;
            } else if (y < this.maxScroll) {
                y = this.maxScroll;
            }

            this.wheelY = y;
            this.emptyContextmenuEvent();
            this.initBar();
        },

        scroll(e) {
            // 滑动关闭右键菜单
            this.emptyContextmenuEvent();
        },

        // 右键图层
        contextmenu(ev, idx) {
            const target = this.compObjList[idx];

            if (this.activeObject && this.activeObject.type === 'multi' && this.activeObject.objects.includes(target)) {
                this.contextmenuEvent = ev;
            } else {
                if (target.type !== 'background') {
                    // 清空之前的选择
                    Ktu.selectedData = null;
                    Ktu.selectedGroup = null;
                    Ktu.currentMulti = null;

                    Ktu.interactive.select(target, ev);

                    this.contextmenuEvent = ev;
                    this.currentIndex = idx;
                    this.currentObject = target;
                    this.currentTarget = ev.currentTarget;
                }
            }
        },

        emptyContextmenuEvent() {
            this.contextmenuEvent = null;
            this.currentIndex = null;
            this.currentObject = null;
            this.currentTarget = null;
        },

        // 重命名
        rename() {
            const ev = {
                currentTarget: this.currentTarget,
            };
            this.compdblclick(ev, this.currentIndex, this.currentObject);
        },

        // 计算滚动的条件
        initScroll() {
            this.$nextTick(() => {
                const containerHeight = this.$refs.container;
                const compListHeight = this.$refs.compList;
                this.containerHeight = containerHeight ? containerHeight.clientHeight : 0;
                this.compListHeight = compListHeight ? compListHeight.clientHeight : 0;

                this.maxScroll = this.containerHeight - this.compListHeight;
                this.hasScroll = this.compListHeight > this.containerHeight;
                this.barHeight = this.containerHeight / this.compListHeight * this.containerHeight;
                this.maxBarTranslateY = this.containerHeight - this.barHeight;

                if (this.wheelY < this.maxScroll) {
                    this.wheelY = this.maxScroll;
                } else if (this.wheelY > 0) {
                    this.wheelY = 0;
                }

                // 有滚动条才需要上下拖拽滚动
                if (this.hasScroll) {
                    this.containerBCR = containerHeight.getBoundingClientRect();
                }
            });
        },

        // 计算滚动条的位置
        initBar() {
            this.barTranslateY = this.wheelY / this.maxScroll * this.maxBarTranslateY;
        },

        mousedownBar(e) {
            e.preventDefault();
            this.onBarDragStart(e);
            window.addEventListener('mousemove', this.onBarDragging);
            window.addEventListener('mouseup', this.onBarDragEnd);
        },

        onBarDragStart() {
            this.barDragging = true;
            this.barStartY = event.clientY;
        },

        onBarDragging() {
            if (this.barDragging) {
                const deltaY = event.clientY - this.barStartY;

                // 这个注意deltaX的值是否足以改变translateX；
                const count = Math.round(deltaY / this.barInterval);

                if (count !== 0) {
                    if (count < 0) {
                        this.wheel({ deltaY: -100 });
                    } else if (count > 0) {
                        this.wheel({ deltaY: 100 });
                    }

                    this.barStartY = event.clientY;
                }
            }
        },

        onBarDragEnd() {
            if (this.barDragging) {
                this.barDragging = false;
            }
            window.removeEventListener('mouseup', this.onBarDragEnd);
            window.removeEventListener('mousemove', this.onBarDragging);
        },

    },
});
