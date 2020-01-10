Vue.component('tool-public', {
    mixins: [Ktu.mixins.dataHandler],
    template: `<div :class="['tool-public', {small: isSmallScreen}]">
                    <tool-position icon="position" @showPopUp="clickPosition"></tool-position>
                    <tool-level icon="level" @selectLevel="selectLevel" @showPopUp="clickLevel"></tool-level>
					<tool-btn class="tool-box" icon="lock" tips="锁定" :class="{checked: activeObject.isLocked}" @click="lock"  v-if="!hideLock && !isObjectInGroup&&!activeObject.isLocked"></tool-btn>
					<tool-btn class="tool-box" icon="lock" tips="解除锁定" :class="{checked: activeObject.isLocked}" @click="lock"  v-if="!hideLock && !isObjectInGroup&&activeObject.isLocked"></tool-btn>
                    <tool-btn class="tool-box" icon="copy" tips="复制" @click="copy" v-if="!hideBtn"></tool-btn>
                    <tool-btn class="tool-public-remove tool-box" icon="remove" tips="删除" @click="remove" v-if="!hideBtn" :class="{disabled: isLocked}"></tool-btn>
                </div>`,
    props: {
        eventType: {
            type: String,
            default: '',
        },
        hideLock: {
            type: Boolean,
            default: false,
        },
        isSmallScreen: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            levelList: Ktu.config.tool.options.levelList,
        };
    },
    computed: {
        /* isMultiselect: function(){
           return this.selectedData.type === 'group' && !this.selectedData.originGroup;
           }, */
        isLocked() {
            return this.activeObject.isLocked;
        },
        isCollect() {
            return this.activeObject.isCollect;
        },
        // 修改素材里我的收藏列表
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
        styleSetByEditContextMenu() {
            return Ktu.store.state.msg.dropMenuStyle;
        },
        hideBtn() {
            let hasGif = false;
            if (/gif$/.test(this.activeObject.imageType)) {
                hasGif = true;
            } else if (['group', 'multi'].indexOf(this.activeObject.type) !== -1) {
                const objectArr = this.activeObject.objects;
                for (let i = 0; i < objectArr.length; i++) {
                    if (objectArr[i].type === 'group') {
                        const groupArr = objectArr[i].objects;
                        for (let j = 0; j < groupArr.length; j++) {
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
        },
    },
    methods: {
        copy() {
            Ktu.element.copy();

            if (this.eventType) {
                Ktu.log(this.eventType, 'copy');
            } else {
                Ktu.log(this.activeObject.type, 'copy');
            }

            Ktu.element.paste();
        },

        // 选择层级里面选项
        selectLevel(level, recordHistory) {
            this.activeObject.changeZIndex(level, false, recordHistory);
            // 层级管理日志
            if (recordHistory) {
                let logName = level;
                // 区分是工具栏选择层级还是右键快捷菜单选择层级
                let type = 'tool';
                if (this.styleSetByEditContextMenu.isShow) {
                    type = 'contextmenu';
                }
                switch (level) {
                    case 'up':
                        logName = 'up';
                        break;
                    case 'down':
                        logName = 'down';
                        break;
                    case 'top':
                        logName = 'top';
                        break;
                    case 'bottom':
                        logName = 'bottom';
                        break;
                };
                logName += `_${type}`;
                Ktu.log('levelManage', logName);
            }
        },

        // 层级的激活
        clickLevel() {
            if (this.eventType) {
                Ktu.simpleLog(this.eventType, 'level');
            } else {
                if (this.activeObject.type === 'cimage' && /gif$/.test(this.activeObject.imageType)) {
                    Ktu.simpleLog('gif', 'level');
                } else {
                    Ktu.simpleLog(this.activeObject.type, 'level');
                }
            }
        },

        lock() {
            this.activeObject.lock();

            if (this.eventType) {
                Ktu.log(this.eventType, 'lock');
            } else {
                if (this.activeObject.type === 'cimage' && /gif$/.test(this.activeObject.imageType)) {
                    Ktu.log('gif', 'lock');
                } else {
                    Ktu.log(this.activeObject.type, 'lock');
                }
            }
        },

        remove() {
            if (this.eventType) {
                Ktu.log(this.eventType, 'remove');
            } else {
                if (this.activeObject.type === 'cimage' && /gif$/.test(this.activeObject.imageType)) {
                    Ktu.log('gif', 'remove');
                } else {
                    Ktu.log(this.activeObject.type, 'remove');
                }
            }
            this.activeObject.remove();
        },

        clickPosition() {
            const { type } = this.activeObject;
            if (type === 'cimage' && /\.gif$/.test(this.selectedData.image.src)) {
                Ktu.log('gif', 'position');
            }
            else if (type === 'cimage' && /\.png$/.test(this.selectedData.image.src)) {
                Ktu.log('png', 'position');
            }
            else if (this.eventType) {
                Ktu.log(this.eventType, 'position');
            } else {
                Ktu.log(this.activeObject.type, 'position');
            }
        },
        async collection() {
            await this.activeObject.collect(this.activeObject);
            this.shouldRefreshList.includes(this.activeObject.fileId || this.activeObject.image.fileId) ? '' : this.shouldRefreshList.push(this.activeObject.fileId || this.activeObject.image.fileId);
            // this.shouldRefreshList.includes(this.activeObject) ? '' : this.shouldRefreshList.push(this.activeObject);
        },
    },
});
