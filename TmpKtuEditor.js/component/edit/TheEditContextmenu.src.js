Vue.component('edit-contextmenu', {
    props: {
        event: {
            type: MouseEvent,
        },
    },
    mixins: [Ktu.mixins.dataHandler],
    template: `<div ref="editContextmenu" class="edit-contextmenu" v-if="event" :style="styleObject" :class="{translateX: isNeedTranslateX, translateY: isNeedTranslateY}" @contextmenu.stop.prevent @mousedown.stop>
                  <div ref="editContextmenuCategory" class="edit-contextmenu-category" v-for="(category, index) in config[type][state]" :key="index" v-if="type && state && isShowCreateGroup(category) && !isHideSetGroup(index)">
                        <div class="edit-contextmenu-operate" :class="{opened:operate.name === openedOperate,locked:isLocked && operate.name === 'position'}" v-for="(operate, index) in category" :key="index" :ref="operate.name" @click="exec($event,operate.name)"
                        @mouseenter="showOptions($event,operate.name)"
                        @mouseleave="closeOptions($event,operate.name)"
                        v-if="isShowOperation(operate.name) && filterOperation(operate.name)">
                            <svg class="edit-contextmenu-icon">
                                <use :xlink:href="'#svg-contextmenu-'+operate.name"></use>
                            </svg>
                            <label class="edit-contextmenu-label">{{operate.label}}</label>
                            <svg class="edit-contextmenu-arrow" v-if="operate.hasOptions">
                                <use xlink:href="#svg-contextmenu-arrow"></use>
                            </svg>
                        </div>
                    </div>
                </div>`,
    data() {
        return {
            width: 158,
            // maxHeight: 368,
            maxHeight: 326,
            type: '',
            eleType: '',
            state: '',
            isUiManage: Ktu.isUIManage,
            isInternalAcct: Ktu._InternalAcct,
            config: {
                single: {
                    normal: [
                        [{
                            label: '锁定',
                            name: 'lock',
                        },
                        {
                            label: '收藏素材',
                            name: 'collection',
                        },
                        ],
                        [{
                            label: '层级',
                            name: 'level',
                            hasOptions: true,
                        },
                        {
                            label: '位置',
                            name: 'position',
                            hasOptions: true,
                        },
                        ],
                        [{
                            label: '导出为PNG',
                            name: 'export',
                        }, {
                            label: '复制',
                            name: 'copy',
                        },
                        {
                            label: '粘贴',
                            name: 'paste',
                        },
                        {
                            label: '删除',
                            name: 'remove',
                        },
                        ],
                        [{
                            label: '生成文组',
                            name: 'create',
                        }],
                    ],
                    locked: [
                        [{
                            label: '解除锁定',
                            name: 'unlock',
                        }, {
                            label: '收藏素材',
                            name: 'collection',
                        }],
                        [{
                            label: '层级',
                            name: 'level',
                            hasOptions: true,
                        },
                        {
                            label: '位置',
                            name: 'position',
                            hasOptions: true,
                        },
                        ],
                        [{
                            label: '导出为PNG',
                            name: 'export',
                        }, {
                            label: '复制',
                            name: 'copy',
                        },
                        {
                            label: '粘贴',
                            name: 'paste',
                        },
                        ],
                    ],
                    double: [
                        [{
                            label: '解除锁定',
                            name: 'unlock',
                        }, {
                            label: '取消收藏',
                            name: 'unCollection',
                        }],
                        [{
                            label: '层级',
                            name: 'level',
                            hasOptions: true,
                        },
                        {
                            label: '位置',
                            name: 'position',
                            hasOptions: true,
                        },
                        ],
                        [{
                            label: '导出为PNG',
                            name: 'export',
                        }, {
                            label: '复制',
                            name: 'copy',
                        },
                        {
                            label: '粘贴',
                            name: 'paste',
                        },
                        ],
                        [{
                            label: '生成文组',
                            name: 'create',
                        }],
                    ],
                    collected: [
                        [{
                            label: '锁定',
                            name: 'lock',
                        }, {
                            label: '取消收藏',
                            name: 'unCollection',
                        }],
                        [{
                            label: '层级',
                            name: 'level',
                            hasOptions: true,
                        },
                        {
                            label: '位置',
                            name: 'position',
                            hasOptions: true,
                        },
                        ],
                        [{
                            label: '导出为PNG',
                            name: 'export',
                        }, {
                            label: '复制',
                            name: 'copy',
                        },
                        {
                            label: '粘贴',
                            name: 'paste',
                        },
                        {
                            label: '删除',
                            name: 'remove',
                        },
                        ],
                        [{
                            label: '生成文组',
                            name: 'create',
                        }],
                    ],
                },
                multiselect: {
                    normal: [
                        [{
                            label: '组合',
                            name: 'group',
                        },
                        {
                            label: '锁定',
                            name: 'lock',
                        },
                        ],
                        [{
                            label: '对齐与分布',
                            name: 'horizontal_left',
                            hasOptions: true,
                        }, {
                            label: '层级',
                            name: 'level',
                            hasOptions: true,
                        },
                        {
                            label: '位置',
                            name: 'position',
                            hasOptions: true,
                        },
                        ],
                        [{
                            label: '导出为PNG',
                            name: 'export',
                        }, {
                            label: '复制',
                            name: 'copy',
                        },
                        {
                            label: '粘贴',
                            name: 'paste',
                        },
                        {
                            label: '删除',
                            name: 'remove',
                        },
                        ],
                        [{
                            label: '生成文组',
                            name: 'create',
                        }],
                    ],
                    locked: [
                        [{
                            label: '取消组合',
                            name: 'ungroup',
                        },
                        {
                            label: '解除锁定',
                            name: 'unlock',
                        },
                        ],
                        [{
                            label: '层级',
                            name: 'level',
                            hasOptions: true,
                        },
                        {
                            label: '位置',
                            name: 'position',
                            hasOptions: true,
                        },
                        ],
                        [{
                            label: '导出为PNG',
                            name: 'export',
                        }, {
                            label: '复制',
                            name: 'copy',
                        },
                        {
                            label: '粘贴',
                            name: 'paste',
                        },

                        ],
                    ],
                },
                group: {
                    normal: [
                        [{
                            label: '取消组合',
                            name: 'ungroup',
                        },
                        {
                            label: '锁定',
                            name: 'lock',
                        },
                        ],
                        [{
                            label: '对齐与分布',
                            name: 'horizontal_left',
                            hasOptions: true,
                        }, {
                            label: '层级',
                            name: 'level',
                            hasOptions: true,
                        },
                        {
                            label: '位置',
                            name: 'position',
                            hasOptions: true,
                        },
                        ],
                        [{
                            label: '导出为PNG',
                            name: 'export',
                        }, {
                            label: '复制',
                            name: 'copy',
                        },
                        {
                            label: '粘贴',
                            name: 'paste',
                        },
                        {
                            label: '删除',
                            name: 'remove',
                        },
                        ],
                        [{
                            label: '生成文组',
                            name: 'create',
                        }],
                    ],
                    locked: [
                        [{
                            label: '取消组合',
                            name: 'ungroup',
                        },
                        {
                            label: '解除锁定',
                            name: 'unlock',
                        },
                        ],
                        [{
                            label: '层级',
                            name: 'level',
                            hasOptions: true,
                        },
                        {
                            label: '位置',
                            name: 'position',
                            hasOptions: true,
                        },
                        ],
                        [{
                            label: '导出为PNG',
                            name: 'export',
                        }, {
                            label: '复制',
                            name: 'copy',
                        },
                        {
                            label: '粘贴',
                            name: 'paste',
                        },
                        ],
                    ],
                },
                background: {
                    locked: [
                        [{
                            label: '粘贴',
                            name: 'paste',
                        },
                            /* ,
                            {
                                label: '清除背景',
                                name: 'clear'
                            }*/
                        ],
                    ],
                },
            },
            openedOperate: '',

            top: 0,
            left: 0,
            // 菜单最小高度
            height: 326,
            // 距离底部10px
            delta: 10,
            isFromContextMenu: '',
        };
    },
    computed: {
        documentPosition() {
            return Ktu.edit.documentPosition;
        },
        scale() {
            return this.$store.state.data.scale;
        },
        isLocked() {
            return this.activeObject && this.activeObject.isLocked;
        },
        hasCopiedObject() {
            return this.$store.state.data.hasCopiedObject;
        },
        editSize() {
            return Ktu.edit.size;
        },
        position() {
            return {
                left: this.left,
                top: this.top,
            };
        },
        styleObject() {
            return {
                left: `${this.position.left}px`,
                top: `${this.position.top}px`,
            };
        },
        isNeedTranslateX() {
            return this.editSize.width < this.position.left + this.width;
        },
        isNeedTranslateY() {
            //  return  this.editSize.height < this.position.top + this.maxHeight;
            return this.editSize.height < this.position.top + this.height;
        },
        // 右键生成素材
        showExportImgModal: {
            get() {
                return this.$store.state.modal.showExportImgModal;
            },
            set(newValue) {
                this.$store.commit('modal/exportImgModalState', newValue);
            },
        },
        refreshContextMenu: {
            get() {
                return this.$store.state.base.refreshContextMenu;
            },
            set(newValue) {
                this.$store.state.base.refreshContextMenu = newValue;
            },
        },

        // 白名单的设计师账号
        isUIManageForWhite() {
            return Ktu.isUIManageForWhite;
        },
    },
    watch: {
        event(event) {
            console.log('这是右键的event',event)
            this.initPosition(event);
        },
        refreshContextMenu(newValue) {
            if (newValue) {
                this.changePosition();
                this.refreshContextMenu = false;
            }
        },
    },
    methods: {
        checkNeedHideGroup() {
            const objectArr = this.activeObject.objects;
            if (!objectArr) {
                return false;
            }
            for (let i = 0; i < objectArr.length; i++) {
                const item = objectArr[i];
                if (item && item.type === 'threeText') {
                    return true;
                }
            }
            return false;
        },
        isHideSetGroup(index) {
            if (this.type === 'multiselect' && this.checkNeedHideGroup() && index == 0) {
                return true;
            }
            return false;
        },
        initPosition(event) {
            if (event) {
                this.openedOperate = '';
                let object = Ktu.interactive.checkTarget(event);
                if (object) {
                    console.log('进来了7897989879')
                    if (object.type === 'group') {
                        this.type = 'group';
                    } else if (object.type === 'multi') {
                        this.type = 'multiselect';
                    } else if (object.type === 'background') {
                        this.type = 'background';
                    } else {
                        // 解决右键组合中单选元素的特殊情况
                        if (object.group) {
                            this.type = 'group';
                            Ktu.selectedGroup = object.group;
                            Ktu.selectedData = null;
                            object = object.group;
                        } else {
                            this.type = 'single';
                        }
                    }
                    // eslint-disable-next-line no-nested-ternary
                    this.state = object.isLocked ? (object.isCollect ? 'double' : 'locked') : (object.isCollect ? 'collected' : 'normal');
                    this.eleType = object.type;
                    this.$nextTick(() => {
                        if (!this.$refs.editContextmenu) {
                            return;
                        }
                        const editContextmenu = this.$refs.editContextmenu.getBoundingClientRect();
                        if (event.pageY + editContextmenu.height - this.editSize.top > this.editSize.height) {
                            this.top = this.editSize.height - editContextmenu.height - this.delta;
                        } else {
                            this.top = this.event.pageY - this.editSize.top;
                        }
                        this.left = this.event.pageX - this.editSize.left;
                        this.height = editContextmenu.height;
                    });
                } else {
                    this.emptyContextmenuEvent();
                }
                document.addEventListener('mousedown', this.emptyContextmenuEvent);
            } else {
                document.removeEventListener('mousedown', this.emptyContextmenuEvent);
            }
        },
        changePosition() {
            if (this.activeObject) {
                this.left = (this.activeObject.left + this.activeObject.width * this.activeObject.scaleX / 2) * this.scale + this.documentPosition.left;
                this.top = (this.activeObject.top + this.activeObject.height * this.activeObject.scaleY / 2) * this.scale + this.documentPosition.top;
                this.openedOperate && this.showDropMenu(this.openedOperate);
            }
        },
        isShowOperation(name) {
            if (name === 'paste') {
                return this.hasCopiedObject;
            } else if (name === 'create') {
                return this.isUiManage;
            } else if (name === 'collection') {
                return this.activeObject ? this.activeObject.canCollect : false;
            }
            return true;
        },
        filterOperation(name) {
            /* GIF图片右键菜单屏蔽生成文组/收藏素材/导出为PNG操作
             内部设计师允许复制操作，内部非设计师账号屏蔽复制操作
             */
            if (['create', 'collection', 'export'].indexOf(name) != -1 || (['copy', 'remove'].indexOf(name) != -1 && !Ktu.isUIManage)) {
                if (this.activeObject) {
                    switch (this.activeObject.type) {
                        case 'cimage':
                            return !/\.gif/.test(this.activeObject.image.src);
                            break;
                        case 'multi':
                        case 'group':
                            const objectArr = this.activeObject.objects;
                            for (let i = 0; i < objectArr.length; i++) {
                                if (objectArr[i].type === 'group') {
                                    const groupArr = objectArr[i].objects;
                                    for (let j = 0; j < groupArr.length; j++) {
                                        if (groupArr[j].type === 'cimage' && /\.gif/.test(groupArr[j].image.src)) {
                                            return false;
                                        }
                                    }
                                } else if (objectArr[i].type === 'cimage' && /\.gif/.test(objectArr[i].image.src)) {
                                    return false;
                                }
                            }
                            break;
                    }
                }
            }
            return true;
        },
        exec(e, operationName) {
            let logSrc = '';
            let isGif = this.eleType === 'cimage' && this.activeObject.imageType === 'gif';
            switch (operationName) {
                case 'lock':
                case 'unlock':
                    this.activeObject.lock();
                    logSrc = 'lock';
                    break;
                case 'collection':
                case 'unCollection':
                    this.activeObject.callbackState(this.activeObject.collect);
                    this.activeObject.collect();
                    break;
                case 'group':
                    this.activeObject.setGroup();
                    // 去掉组合内元素的描边
                    this.activeObject.objects.forEach(object => {
                        object.isSelected = false;
                    });
                    logSrc = 'group';
                    break;
                case 'ungroup':
                    this.activeObject.cancelGroup();
                    logSrc = 'ungroup';
                    break;
                    /* case 'up':
                    case 'down':
                    case 'top':
                    case 'bottom':
                        this.activeObject.changeZIndex(operationName);
                        logSrc = operationName;
                        break;*/
                case 'export':
                    this.exportImage();
                    break;
                case 'copy':
                    Ktu.element.copy();
                    logSrc = 'copy';
                    break;
                case 'paste':
                    Ktu.element.paste(true);
                    logSrc = 'paste';
                    break;
                case 'remove':
                    if (this.eleType === 'cimage' && this.activeObject.imageType === 'gif') {
                        isGif = true;
                    }
                    this.activeObject.remove();
                    logSrc = 'remove';
                    break;
                case 'create':
                    Ktu.element.createTextGroup(this);
                    logSrc = 'create';
                case 'horizontal_left':
                    e.stopPropagation();
                    break;
            };
            if ((['lock', 'remove'].indexOf(logSrc) != -1) && isGif) {
                Ktu.log('contextmenu', `${logSrc}_gif`);
            } else {
                Ktu.log('contextmenu', `${logSrc}_${this.eleType === 'group' ? this.type : this.eleType}`);
            }
            // 点击对齐与分布后，不退出菜单
            if (['horizontal_left', 'position', 'level'].indexOf(operationName) === -1) {
                this.emptyContextmenuEvent();
            }
        },
        // 展示二级菜单（暂时只针对对齐与分布/层级/位置）
        showOptions(e, operationName) {
            this.openedOperate = operationName;
            switch (operationName) {
                case 'horizontal_left':
                case 'level':
                case 'position':
                    this.showDropMenu(operationName);
                    break;
                default:
                    Ktu.store.commit('msg/setDropMenuStyle', {
                        type: 'dropMenuStyle',
                        data: {
                            isShow: false,
                        },
                    });
            }

            // 数据统计
            switch (this.eleType) {
                case 'textbox':
                case 'group':
                case 'multi':
                case 'path-group':
                    Ktu.log('contextmenu', `hover_${this.eleType}_${operationName}`);
                    break;
                case 'cimage':
                    Ktu.log('contextmenu', `hover_${this.activeObject.imageType}_${operationName}`);
                    break;
            };
        },
        // 关闭菜单
        closeOptions(e, operationName) {
            if (['horizontal_left', 'position', 'level'].indexOf(operationName) === -1) {
                this.openedOperate = '';
            }
        },
        emptyContextmenuEvent() {
            this.$emit('emptyContextmenuEvent');
        },

        // 是否显示设计师的文组生成按钮,避免多出设计师生成文组的按钮并且多了一条线
        isShowCreateGroup(list) {
            const flag = list.findIndex(item => item.name === 'create');
            if (flag == 0) {
                return this.isUiManage && !this.isUIManageForWhite;
            }
            return true;
        },
        // 弹出二级菜单（暂只针对 '对其与分布'）
        showDropMenu(operationName) {
            const editContextmenuOperate = this.$refs[operationName][0];
            const {
                editContextmenu,
            } = this.$refs;
            const editContextmenuWidth = editContextmenuOperate.offsetWidth;
            const editContextmenuOperateTop = this.getOffsetTop(editContextmenuOperate, 'edit-contextmenu-category');
            Ktu.store.commit('msg/setDropMenuStyle', {
                type: 'dropMenuStyle',
                data: {
                    left: parseInt(this.styleObject.left) + editContextmenuWidth + 4 - (this.isNeedTranslateX ? editContextmenu.offsetWidth : 0),
                    top: parseInt(this.styleObject.top) + editContextmenuOperateTop - 12,
                    isShow: !(this.isLocked && operationName === 'position'),
                    isNeedTranslateX: this.isNeedTranslateX,
                    isNeedTranslateY: false,
                    operationName,
                },
            });
            if (operationName === 'horizontal_left') {
                window.setTimeout(() => {
                    document.body.addEventListener('click', this.removeOpenedOperate);
                    document.body.addEventListener('contextmenu', this.removeOpenedOperate);
                }, 0);
            } else {
                window.setTimeout(() => {
                    document.body.removeEventListener('click', this.removeOpenedOperate);
                    document.body.removeEventListener('contextmenu', this.removeOpenedOperate);
                }, 0);
            }
        },
        removeOpenedOperate(e) {
            if (Ktu.store.state.msg.dropMenuStyle.isShow) {
                Ktu.store.commit('msg/setDropMenuStyle', {
                    type: 'dropMenuStyle',
                    data: {
                        isShow: false,
                    },
                });
            }
            document.body.removeEventListener('click', this.removeOpenedOperate);
            document.body.removeEventListener('contextmenu', this.removeOpenedOperate);
        },
        getOffsetTop(target, className) {
            if (Array.prototype.slice.call(target.classList).includes(className)) {
                return target.offsetTop;
            }
            return target.offsetTop + this.getOffsetTop(target.parentNode, className);
        },

        // 下载素材
        downloadImage(src) {
            if (!src) {
                this.$Notice.error('无可导出内容，请检查内容后重试');
                return;
            }
            // 生成一个a元素
            const a = document.createElement('a');
            // 创建一个单击事件
            const event = new MouseEvent('click');

            a.download = `凡科快图导出${this.getCurrentTime()}.png`;
            // 将生成的src设置为a.href属性
            console.log(src);
            a.href = URL.createObjectURL(src);
            // 触发a的单击事件
            a.dispatchEvent(event);
        },

        // 获取当前时间
        getCurrentTime() {
            const time = new Date();
            const year = time.getFullYear();
            let month = time.getMonth() + 1;
            let day = time.getDate();
            let hour = time.getHours();
            let minute = time.getMinutes();
            let second = time.getSeconds();

            month = month > 10 ? month : `0${month}`;
            day = day > 10 ? day : `0${day}`;
            hour = hour > 10 ? hour : `0${hour}`;
            minute = minute > 10 ? minute : `0${minute}`;
            second = second > 10 ? second : `0${second}`;
            return `${year}${month}${day}-${hour}${minute}${second}`;
        },

        // 右键导出素材
        exportImage() {
            this.showExportImgModal = true;
            if (this.activeObject.type == 'multi') {
                Ktu.element.transferGroup(this.activeObject).then(group => {
                    group.toDataURL(false).then(res => {
                        setTimeout(() => {
                            this.showExportImgModal = false;
                            this.downloadImage(res);
                        }, 1000);
                        // this.$Notice.success('快速导出PNG成功');
                        Ktu.log('exportImage', 'success');
                    })
                        .catch(e => {
                            this.$Notice.error('快速导出PNG失败，请检查网络后重试');
                            Ktu.log('exportImage', 'error');
                            this.showExportImgModal = false;
                        });
                });
            } else {
                this.activeObject.toDataURL(false).then(res => {
                    setTimeout(() => {
                        this.showExportImgModal = false;
                        this.downloadImage(res);
                    }, 1000);
                    // this.$Notice.success('快速导出PNG成功');
                    Ktu.log('exportImage', 'success');
                })
                    .catch(() => {
                        this.$Notice.error('快速导出PNG失败，请检查网络后重试');
                        Ktu.log('exportImage', 'error');
                        this.showExportImgModal = false;
                    });;
            }
        },
    },
});
