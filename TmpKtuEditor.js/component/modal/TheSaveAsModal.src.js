
Vue.component('save-as-modal', {
    template: `
    <Modal class="manageModal sava-as-modal" :maskAnimate="modalAnimate" :width="width" :closable="modalState != 'loading'" :mask-closable="modalState != 'loading'" class-name="newModalBody" v-model="showSaveAsModal" ref="modal">
        <div class="moveModalHeader" slot="header">另存为</div>
        <div class="moveModalContent">
            <div class="contentBox">
                <ul class="dir-list" ref="dirList">
                    <li class="dir-item" v-for="(item, index) in dirList" :key="index"
                    :class="{'active': selectedDir && selectedDir.id === item.id}" @click="selectDir(item)">
                        <svg class="svg-icon">
                            <use xlink:href="#svg-folder-normal"></use>
                        </svg>
                        <input v-show="isEditing(item)" maxlength="20" class="title title-input" type="text" :value="item.name" @click.stop
                        @blur="rename(item)" ref="input" @keyup.enter="rename(item)"/>
                        <span v-show="!isEditing(item)" class="title" @dblclick.stop="editDirName(item)">{{item.name}}</span>
                        <svg class="svg-check-icon" v-if="selectedDir && selectedDir.id === item.id">
                            <use xlink:href="#svg-work-check"></use>
                        </svg>
                    </li>
                </ul>
                <div class="new-dir" @click="addNewDir">
                    <svg class="svg-icon">
                        <use xlink:href="#svg-dir-add"></use>
                    </svg>
                    <span>新建文件夹</span>
                </div>
            </div>

            <div class="reNameInput">
                作品名称：<input type="text" @focus="selectInput" @dblclick="selectInput" ref="fileNameInput" v-model="title" maxlength="30">
            </div>
        </div>
        <div class="moveModalFooter" slot="footer">
            <div class="btn btn-primary" @click="confirm">确定</div>
            <div class="btn btn-normal" @click="closeModal">取消</div>
        </div>
    </Modal>
    `,
    name: 'saveAsModal',
    props: {},
    data() {
        return {
            width: 462,
            modalState: 'normal',
            modalAnimate: true,
            selectedDir: null,
            renameDir: null,
            dirList: [],
            title: `[副本]${Ktu.ktuData.other.title}`,
        };
    },
    created() {
    },
    mounted() {
        this.getDirList();
    },
    computed: {
        showSaveAsModal: {
            get() {
                return this.$store.state.modal.showSaveAsModal;
            },
            set(newValue) {
                this.$store.commit('modal/saveAsModalState', newValue);
            },
        },
        chooseDirId() {
            return Ktu.ktuData.groupId;
        },
    },
    watch: {

    },
    methods: {
        selectInput() {
            this.$refs.fileNameInput.select();
        },
        getDirList() {
            const url = '../ajax/ktuListGroup_h.jsp?cmd=getKtuGroupList';
            axios
                .post(url, {})
                .then(res => {
                    const info = res.data;
                    if (info.success) {
                        const {
                            ktuGroupList,
                        } = info;
                        ktuGroupList.forEach(item => {
                            if (item.id === 0) {
                                item.name = '默认文件夹';
                                item.hideOperate = true;
                            } else {
                                item.hideOperate = false;
                            }
                            item.edit = false;
                        });
                        // //根据orderGroup进行排序
                        this.dirList = ktuGroupList.sort((item1, item2) => {
                            if (item1.orderGroup) {
                                return item1.orderGroup - item2.orderGroup;
                            }
                            return;
                        });
                        this.dirList = ktuGroupList;
                    }
                });
        },
        // 关闭弹框
        closeModal() {
            this.$store.commit('modal/saveAsModalState', false);
        },

        // 正在编辑的输入框
        isEditing(item) {
            return this.renameDir && item.id !== 0 && this.renameDir.id === item.id;
        },

        // 编辑文件夹
        editDirName(item) {
            this.renameDir = item;
            const idx = this.dirList.indexOf(item);
            this.$nextTick(() => {
                this.$refs.input[idx].select();
            });
        },

        // 新建文件夹
        addNewDir() {
            if (!this.isUiManager && this.dirList.length > 29) {
                this.$Notice.warning('最多创建29个文件夹');
                return;
            }

            const url = '../ajax/ktuListGroup_h.jsp?cmd=addKtuGroup';

            axios.post(url, {
                name: '新建文件夹',
            }).then(res => {
                const info = (res.data);
                if (info.success) {
                    const item = {
                        id: info.id,
                        name: '新建文件夹',
                        hideOperate: false,
                        ktuCount: 0,
                    };
                    this.dirList.push(item);
                    this.selectedDir = item;
                    this.editDirName(item);

                    //  div滚动到最底部
                    this.$nextTick(() => {
                        this.scrollBottom();
                    });
                    this.isUpdateDirList = {
                        value: true,
                        type: 'addDir',
                    };
                    Ktu.log('itemManage', 'addDir');
                    this.$Notice.success('新建文件夹成功');
                } else {
                    this.$Notice.error('新建文件夹失败');
                }
            })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => {

                });
        },

        // 选择文件夹
        selectDir(item) {
            this.selectedDir = item;
            this.newName = item.name;
        },

        rename(item) {
            const idx = this.dirList.indexOf(item);
            const {
                value,
            } = this.$refs.input[idx];
            if (value && item.name !== value) {
                const url = '../ajax/ktuGroup_h.jsp?cmd=setKtuGroup';

                axios.post(url, {
                    id: item.id,
                    name: value,
                }).then(res => {
                    const info = (res.data);
                    if (info.success) {
                        item.name = value;
                        Ktu.log('itemManage', 'renameDir');
                        this.$Notice.success('文件夹重命名成功');
                    } else {
                        this.$Notice.success('文件夹重命名失败');
                    }
                })
                    .catch(err => {
                        console.log(err);
                    })
                    .finally(() => {

                    });
            }
            this.renameDir = null;
        },
        // 作品移动
        confirm() {
            if (this.selectedDir == null) {
                this.$Notice.warning('请选择相应的文件夹');
                return;
            }
            if (this.title.length > 30) {
                this.$Notice.warning('标题长度不能超过30个字符');
                return;
            } else if (this.title.length == 0) {
                this.title = '无标题';
            }
            Ktu.save.saveAsPage(this.selectedDir.id, this.title).then(res => {
                Ktu.log('savaAsSuccess');
                this.closeModal();
            })
                .catch(err => {
                    this.closeModal();
                });

            /* if (this.selectedDir == null) {
               this.$Notice.warning('请选择相应的文件夹');
               return;
               }
               if (this.selectedDir.id === this.chooseDirId) {
               this.$Notice.warning('请不要移动到原本文件夹');
               return;
               }
               const url = '../ajax/ktuListGroup_h.jsp?cmd=setListKtuGroup';
               const idList = [];
               this.chooseItemList.forEach(item => {
               idList.push(item.id);
               });
               axios.post(url, {
               newId: this.selectedDir.id,
               oldId: this.chooseDirId,
               idList: JSON.stringify(idList),
               }).then(res => {
               const info = (res.data);
               if (info.success) {
               this.updateData();
               // log日志
               if (this.isBatchDeal) {
               Ktu.log('itemManage', 'batchDeal_move');
               } else {
               Ktu.log('itemManage', 'move');
               }
               this.$Notice.success('作品移动成功');
               } else {
               this.$Notice.success('作品移动失败');
               }
               })
               .catch(err => {
               console.log(err);
               })
               .finally(() => {
               });
               this.closeModal(); */
        },
        // 更新文件夹数据
        updateData() {
            this.isUpdateDirList = {
                value: true,
                type: 'workMove',
            };

            // 如果在全部文件夹中，不需要更新
            if (this.chooseDirId !== -1) {
                this.isUpdateList = {
                    value: true,
                    type: 'update',
                };
            }
        },

        // 滚动到底部
        scrollBottom() {
            const {
                dirList,
            } = this.$refs;
            dirList.scrollTop = dirList.scrollHeight;
        },
    },
});
