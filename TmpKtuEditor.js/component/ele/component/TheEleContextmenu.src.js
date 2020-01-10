Vue.component('ele-contextmenu', {
    template: `<div class="ele-contextmenu" v-if="event" :style="styleObject" @mousedown.stop>
                    <div class="ele-contextmenu-category" v-for="(category, index) in config[type][state]" :key="index" v-if="type && state && !isHideSetGroup(index)">
                        <div class="ele-contextmenu-operate" v-for="(operate, index) in category" :key="index" @click="exec(operate.name)" v-if="filterOperation(operate.name)">
                            <label class="ele-contextmenu-label">{{operate.label}}</label>
                        </div>
                    </div>
                </div>`,
    mixins: [Ktu.mixins.dataHandler],
    props: {
        event: {
            type: MouseEvent,
        },
    },
    data() {
        return {
            type: '',
            state: '',
            height: 149,

            config: {
                single: {
                    normal: [
                        [{
                            label: '锁定',
                            name: 'lock',
                        }],
                        [{
                            label: '重命名',
                            name: 'rename',
                        }, {
                            label: '复制',
                            name: 'copy',
                        }, {
                            label: '删除',
                            name: 'remove',
                        }],
                    ],
                    locked: [
                        [{
                            label: '解除锁定',
                            name: 'unlock',
                        }],
                        [{
                            label: '重命名',
                            name: 'rename',
                        }, {
                            label: '复制',
                            name: 'copy',
                        }],
                    ],
                },
                multi: {
                    normal: [
                        [{
                            label: '组合',
                            name: 'group',
                        }, {
                            label: '锁定',
                            name: 'lock',
                        }],
                        [{
                            label: '复制',
                            name: 'copy',
                        }, {
                            label: '删除',
                            name: 'remove',
                        }],
                    ],
                    locked: [
                        [{
                            label: '组合',
                            name: 'group',
                        }, {
                            label: '解除锁定',
                            name: 'unlock',
                        }],
                        [{
                            label: '复制',
                            name: 'copy',
                        }],
                    ],
                },
                group: {
                    normal: [
                        [{
                            label: '解除组合',
                            name: 'ungroup',
                        }, {
                            label: '锁定',
                            name: 'lock',
                        }],
                        [{
                            label: '复制',
                            name: 'copy',
                        }, {
                            label: '删除',
                            name: 'remove',
                        }],
                    ],
                    locked: [
                        [{
                            label: '解除组合',
                            name: 'ungroup',
                        }, {
                            label: '解除锁定',
                            name: 'unlock',
                        }],
                        [{
                            label: '复制',
                            name: 'copy',
                        }],
                    ],
                },
            },
        };
    },
    computed: {
        position() {
            let left = this.event.pageX - Ktu.edit.size.left - Ktu.edit.size.width;
            let top = this.event.pageY - 104;

            // 做一些边界处理
            if (left && left > 60) {
                left = 60;
            }

            if (top && top > (Ktu.edit.size.height - 152 - 46 - 40)) {
                top = Ktu.edit.size.height - 152 - 46 - 40;
            }

            return {
                left,
                top,
            };
        },

        // 设置菜单top，left值
        styleObject() {
            return {
                left: `${this.position.left}px`,
                top: `${this.position.top}px`,
            };
        },
    },
    watch: {
        event(event) {
            if (event) {
                const object = this.activeObject;
                if (object) {
                    if (object.type === 'group') {
                        this.type = 'group';
                    } else if (object.type === 'multi') {
                        this.type = 'multi';
                    } else {
                        this.type = 'single';
                    }
                    this.state = object.isLocked ? 'locked' : 'normal';
                } else {
                    this.emptyContextmenuEvent();
                }

                document.addEventListener('mousedown', this.emptyContextmenuEvent);
            } else {
                document.removeEventListener('mousedown', this.emptyContextmenuEvent);
            }
        },
    },
    methods: {
        filterOperation(name) {
            if (['copy', 'remove'].indexOf(name) !== -1 && !Ktu.isUIManage) {
                // return this.activeObject && this.activeObject.imageType !== 'gif';
                if (this.activeObject) {
                    switch (this.activeObject.type) {
                        case 'cimage':
                            return this.activeObject.imageType !== 'gif';
                            break;
                        case 'multi':
                        case 'group':
                            const objectArr = this.activeObject.objects;
                            for (let i = 0; i < objectArr.length; i++) {
                                if (objectArr[i].type === 'group') {
                                    const groupArr = objectArr[i].objects;
                                    for (let j = 0;j < groupArr.length;j++) {
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
            if (this.type === 'multi' && this.checkNeedHideGroup() && index == 0) {
                return true;
            }
            return false;
        },
        // 关闭右键菜单
        emptyContextmenuEvent() {
            this.$emit('emptyContextmenuEvent');
        },

        // 执行右键菜单命令
        exec(operationName) {
            let logSrc = '';
            switch (operationName) {
                case 'lock':
                case 'unlock':
                    this.activeObject.lock();
                    logSrc = 'lock';
                    break;
                case 'group':
                    this.activeObject.setGroup();
                    logSrc = 'group';
                    break;
                case 'ungroup':
                    this.activeObject.cancelGroup();
                    logSrc = 'group';
                    break;
                case 'copy':
                    Ktu.element.copy();
                    Ktu.element.paste();
                    logSrc = 'copy';
                    break;
                case 'remove':
                    this.activeObject.remove();
                    logSrc = 'remove';
                    break;
                case 'rename':
                    this.$emit('rename');
                    logSrc = 'rename';
                    break;
            };
            Ktu.log('layerContextmenu', logSrc);
            this.emptyContextmenuEvent();
        },
    },
});
