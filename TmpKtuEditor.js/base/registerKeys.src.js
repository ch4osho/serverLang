Ktu.registerKeys = function () {
    const oldHandleKey = Mousetrap.prototype.handleKey;
    Mousetrap.prototype.handleKey = function (character, modifiers, e, ...args) {
        const self = this;
        Mousetrap[String.fromCharCode(e.which).toLowerCase()] = e.type == 'keydown';
        ['shift', 'alt', 'ctrl', 'meta'].forEach(key => {
            Mousetrap[key] = false;
        });
        modifiers.forEach(key => {
            Mousetrap[key] = true;
        });
        return oldHandleKey.apply(self, [character, modifiers, e, ...args]);
    };
    /*
        Mousetrap global bind plugin
    * */
    (function (Mousetrap) {
        const _globalCallbacks = {};
        const _originalStopCallback = Mousetrap.prototype.stopCallback;
        Mousetrap.prototype.stopCallback = function (e, element, combo, sequence) {
            const self = this;
            if (self.paused) {
                return true;
            }
            if (_globalCallbacks[combo] || _globalCallbacks[sequence]) {
                return false;
            }
            return _originalStopCallback.call(self, e, element, combo);
        };
        Mousetrap.prototype.bindGlobal = function (keys, callback, action) {
            const self = this;
            self.bind(keys, callback, action);
            if (keys instanceof Array) {
                for (let i = 0; i < keys.length; i++) {
                    _globalCallbacks[keys[i]] = true;
                }
                return;
            }
            _globalCallbacks[keys] = true;
        };
        Mousetrap.init();
    }(Mousetrap));

    Mousetrap.init();

    // 全选
    Mousetrap.bind(['ctrl+a', 'command+a'], event => {
        // 如果正在使用工具弹窗禁止使用该快捷键
        if (Ktu.store.state.base.isOpenUtilModal) {
            return;
        }
        Ktu.element.selectedAll();
        event.preventDefault();
    });
    /* 复制
       Mousetrap.bind(["ctrl+c", "command+c"], function(event) {
       Ktu.log('keyboard', 'copy');
       Ktu.element.copy();
       event.preventDefault();
       });
       //粘贴
       Mousetrap.bind(["ctrl+v", "command+v"], function(event) {
       Ktu.log('keyboard', 'paste');
       Ktu.element.paste();
       event.preventDefault();
       }); */

    // 前进撤销
    Mousetrap.bind(['ctrl+z', 'command+z'], event => {
        if (Ktu.historyManager[Ktu.template.currentPageIndex].undoAble()) {
            Ktu.historyManager[Ktu.template.currentPageIndex].undo();
            Ktu.log('keyboard', 'back');
        }
        event.preventDefault();
    });

    Mousetrap.bind(['ctrl+y', 'command+y', 'ctrl+shift+z', 'command+shift+z'], event => {
        if (Ktu.historyManager[Ktu.template.currentPageIndex].redoAble()) {
            Ktu.historyManager[Ktu.template.currentPageIndex].redo();
            Ktu.log('keyboard', 'forword');
        }
        event.preventDefault();
    });

    // 保存页面
    Mousetrap.bindGlobal(['ctrl+s', 'command+s'], event => {
        Ktu.log('keyboard', 'save');
        Ktu.template.saveCurrentPage();
        Ktu.save.isClickSave = true;
        event.preventDefault();
    });
    // 删除元素
    Mousetrap.bind(['backspace', 'del'], event => {
        Ktu.log('keyboard', 'remove');
        !!Ktu.activeObject && !Ktu.interactive.isMoving && Ktu.activeObject.remove();
        event.preventDefault();
        event.stopPropagation();
    });
    // 控制页面缩放
    Mousetrap.bindGlobal(['ctrl+0', 'command+0'], event => {
        Ktu.edit.zoomFit();
        event.preventDefault();
    });
    Mousetrap.bindGlobal(['ctrl+alt+0', 'command+alt+0'], event => {
        Ktu.edit.zoomNoScale(true);
        event.preventDefault();
    });
    Mousetrap.bindGlobal(['ctrl++', 'command++', 'command+=', 'ctrl+='], event => {
        Ktu.log('keyboard', 'enlarge');
        Ktu.edit.zoomIn();
        event.preventDefault();
    });
    Mousetrap.bindGlobal(['ctrl+-', 'command+-'], event => {
        Ktu.log('keyboard', 'reduce');
        Ktu.edit.zoomOut();
        event.preventDefault();
    });

    let hasSavedState = false;
    let movingTimeout;
    Mousetrap.bind(['left', 'up', 'right', 'down'], event => {
        if (Ktu.activeObject) {
            if (!hasSavedState) {
                Ktu.activeObject.saveState();
                hasSavedState = true;
            }
            let position = 'left';
            switch (event.key) {
                case 'ArrowLeft':
                    position = 'left';
                    break;
                case 'ArrowRight':
                    position = 'right';
                    break;
                case 'ArrowUp':
                    position = 'up';
                    break;
                case 'ArrowDown':
                    position = 'down';
                    break;
            }
            Ktu.activeObject.smallMove(position);
            Ktu.activeObject.setCoords();
            if (Ktu.activeObject.group) {
                Ktu.activeObject.group.updateSizePosition();
            }
            event.preventDefault();
            Ktu.store.commit('data/changeState', {
                prop: 'isKeyDownMoving',
                value: true,
            });
            clearTimeout(movingTimeout);
        }
    }, 'keydown').bind(['left', 'up', 'right', 'down'], () => {
        if (Ktu.activeObject) {
            Ktu.activeObject.modifiedState();
            Ktu.activeObject.setCoords();
            hasSavedState = false;
            setTimeout(() => {
                Ktu.store.commit('data/changeState', {
                    prop: 'isKeyDownMoving',
                    value: false,
                });
                clearTimeout(movingTimeout);
            }, 800);
        }
    }, 'keyup');
    Mousetrap.bindGlobal(['shift+left', 'shift+up', 'shift+right', 'shift+down'], event => {
        if (Ktu.activeObject) {
            if (Ktu.activeObject.isEditing && Ktu.activeObject.type === 'textbox') return;
            if (!hasSavedState) {
                Ktu.activeObject.saveState();
                hasSavedState = true;
            }
            let position = 'left';
            switch (event.key) {
                case 'ArrowLeft':
                    position = 'left';
                    break;
                case 'ArrowRight':
                    position = 'right';
                    break;
                case 'ArrowUp':
                    position = 'up';
                    break;
                case 'ArrowDown':
                    position = 'down';
                    break;
            }
            Ktu.activeObject.fastMove(position);
            Ktu.activeObject.setCoords();
            if (Ktu.activeObject.group) {
                Ktu.activeObject.group.updateSizePosition();
            }
            Ktu.log('keyboard', 'fastMove');
            event.preventDefault();
            Ktu.store.commit('data/changeState', {
                prop: 'isKeyDownMoving',
                value: true,
            });
            clearTimeout(movingTimeout);
        }
    }, 'keydown');

    Mousetrap.bindGlobal(['shift+left', 'shift+up', 'shift+right', 'shift+down'], event => {
        if (Ktu.activeObject) {
            Ktu.activeObject.modifiedState();
            Ktu.activeObject.setCoords();
            hasSavedState = false;
            movingTimeout = setTimeout(() => {
                Ktu.store.commit('data/changeState', {
                    prop: 'isKeyDownMoving',
                    value: false,
                });
                clearTimeout(movingTimeout);
            }, 800);
        }
    }, 'keyup');

    // 层级的'上移一层'、'下移一层'、'置顶'、'置地'
    Mousetrap.bindGlobal('ctrl+]', event => {
        Ktu.log('keyboard', 'up');
        if (Ktu.activeObject) {
            Ktu.activeObject.changeZIndex('up');
        }
        event.preventDefault();
    });
    Mousetrap.bindGlobal('ctrl+[', event => {
        Ktu.log('keyboard', 'down');
        if (Ktu.activeObject) {
            Ktu.activeObject.changeZIndex('down');
        }
        event.preventDefault();
    });
    Mousetrap.bindGlobal('ctrl+shift+]', event => {
        Ktu.log('keyboard', 'top');
        if (Ktu.activeObject) {
            Ktu.activeObject.changeZIndex('top');
        }
        event.preventDefault();
    });
    Mousetrap.bindGlobal('ctrl+shift+[', event => {
        Ktu.log('keyboard', 'bottom');

        if (Ktu.activeObject) {
            Ktu.activeObject.changeZIndex('bottom');
        }
        event.preventDefault();
    });
    // 组合、取消组合
    Mousetrap.bindGlobal('ctrl+g', event => {
        Ktu.log('keyboard', 'group');
        const {
            activeObject,
        } = Ktu;
        const isGroup = activeObject && activeObject.type === 'group';
        const isMulti = activeObject && activeObject.type === 'multi';
        if (isGroup) {
            activeObject.cancelGroup();
        } else if (isMulti) {
            activeObject.setGroup();
        }
        event.preventDefault();
    });
    Mousetrap.bindGlobal('ctrl+l', () => {
        Ktu.log('keyboard', 'lock');
        Ktu.activeObject.lock();
        event.preventDefault();
    });

    // 字体加粗、斜体、下划线
    Mousetrap.bindGlobal(['ctrl+b', 'command+b'], event => {
        if (Ktu.selectedData && Ktu.selectedData.type === 'textbox') {
            Ktu.selectedData.setBold();
            Ktu.log('keyboard', 'bold');
            event.preventDefault();
        }
    });
    Mousetrap.bindGlobal(['ctrl+i', 'command+i'], event => {
        if (Ktu.selectedData && Ktu.selectedData.type === 'textbox') {
            Ktu.selectedData.setItalic();
            Ktu.log('keyboard', 'italic');
            event.preventDefault();
        }
    });
    Mousetrap.bindGlobal(['ctrl+u', 'command+u'], event => {
        if (Ktu.selectedData && Ktu.selectedData.type === 'textbox') {
            Ktu.selectedData.setUnderline();
            Ktu.log('keyboard', 'underline');
            event.preventDefault();
        }
    });
    Mousetrap.bindGlobal(['ctrl+o'], event => {
        event.preventDefault();
        // 如果正在使用工具弹窗禁止使用该快捷键
        if (Ktu.store.state.base.isOpenUtilModal) {
            return;
        }
        if (!Ktu.store.state.modal.showImageSourceModal) {
            Ktu.store.state.base.isImgsourceByHotkey = true;
            Ktu.vm.$store.commit('modal/imageSourceModalState', {
                isOpen: true,
            });
            Ktu.log('keyboard', 'imageSource');
        }
    });
    // 选中当前文本所有内容
    Mousetrap.bind('f2', event => {
        const {
            activeObject,
        } = Ktu;
        if (activeObject && (activeObject.type === 'textbox' || activeObject.type === 'wordart' || activeObject.type === 'threeText') && !activeObject.isEditing) {
            activeObject.enterEditing();
        }
        event.preventDefault();
    });

    Mousetrap.bind(['space', 'alt', 'ctrl'], event => {
        !Ktu.edit.hasLeftWindow && Ktu.edit.addViewportEvent(event);
        event.preventDefault();
    });

    Mousetrap.bind(['space', 'alt', 'ctrl'], event => {
        Ktu.edit.exitViewportEvent();
        event.preventDefault();
    }, 'keyup');

    document.addEventListener('paste', event => {
        const canInputTarget = ['input', 'textarea'];
        const isStop = canInputTarget.some(target => $(document.activeElement).is(target));
        if (isStop) {
            return;
        }
        // 如果正在使用工具弹窗禁止使用该快捷键
        if (Ktu.store.state.base.isOpenUtilModal) {
            return;
        }
        // 如果正在复制上传图片禁止继续复制
        if (Ktu.store.state.base.isCopyUpload) {
            return;
        }

        Ktu.log('keyboard', 'paste');

        const url = '/ajax/advanceUpload_h.jsp?cmd=_uploadPaste';
        const acceptImageType = ['image/jpeg', 'image/png', 'image/svg+xml'];
        const clipboardData = event.clipboardData || event.originalEvent.clipboardData;
        const text = clipboardData.getData('text/plain').trim() || '';

        if (clipboardData && clipboardData.files.length > 0) {
            const {
                items,
            } = clipboardData;
            const types = clipboardData.types || [];
            let item = items[0];
            // 保存在剪贴板中的数据类型
            for (let i = 0; i < types.length; i++) {
                if (types[i] === 'Files') {
                    item = items[i];
                    break;
                }
            }

            // 判断是否为图片数据
            if (item && item.kind === 'file' && item.type.match(/^image\//i)) {
                Ktu.store.commit('base/changeState', {
                    prop: 'isCopyUpload',
                    value: true,
                });

                const blob = item.getAsFile();
                const reader = new FileReader();
                let imgType = 0;
                let time = 0;
                switch (item.type) {
                    case acceptImageType[0]:
                        imgType = 2;
                        break;
                    case acceptImageType[1]:
                        imgType = 4;
                        break;
                    case acceptImageType[2]:
                        imgType = 81;
                        break;
                }
                reader.onload = function (event) {
                    const data = event.target.result.split(',')[1];
                    let date = new Date();
                    const year = date.getFullYear();
                    let month = date.getMonth() + 1;
                    month < 10 && (month = `0${month}`);
                    let day = date.getDate();
                    day < 10 && (day = `0${day}`);
                    date = year + month + day;
                    axios.post(url, {
                        data,
                        maxWidth: 16384,
                        maxHeight: 16384,
                        imgType,
                        imgMode: 2,
                        fileName: item.name || date,
                    }).then(res => {
                        const info = (res.data);
                        if (info.success) {
                            // 完成复制上传图片
                            time = 500;
                            Ktu.store.commit('base/changeState', {
                                prop: 'isFinishCopyUpload',
                                value: true,
                            });
                            userImg(info);
                            Ktu.vm.$store.dispatch('data/getUploadStorage');
                            Ktu.store.state.base.changePicComplete = true;
                            setTimeout(() => {
                                Ktu.notice.success('图片已经同步到“上传”窗口内。');
                            }, time);
                        } else {
                            if (typeof info == 'object' && info.rt != undefined) {
                                if (info.rt == -311) {
                                    Ktu.vm.$store.commit('modal/normalModalState', {
                                        isOpen: true,
                                        props: {
                                            modalText: '你上传的图片太多了，请明天再尝试上传',
                                            modalImgSrc: `${Ktu.initialData.resRoot}/image/editor/upload/tooMuch.png`,
                                        },
                                    });
                                } else if (info.rt == -7) {
                                    Ktu.vm.$store.commit('modal/normalModalState', {
                                        isOpen: true,
                                        props: {
                                            modalText: '存储容量不足，请删除部分图片后再上传',
                                            modalImgSrc: `${Ktu.initialData.resRoot}/image/editor/upload/storageLimit.png`,
                                        },
                                    });
                                } else {
                                    Ktu.modal.confirm({
                                        content: info.msg,
                                    });
                                }
                            } else {
                                Ktu.modal.confirm({
                                    content: info.msg,
                                });
                            }
                        }
                    })
                        .catch(err => {
                            Ktu.modal.confirm({
                                content: '网络中断,图片上传失败',
                            });
                            console.error(err);
                        })
                        .finally(() => {
                            setTimeout(() => {
                                Ktu.store.commit('base/changeState', {
                                    prop: 'isCopyUpload',
                                    value: false,
                                });
                                Ktu.store.commit('base/changeState', {
                                    prop: 'isFinishCopyUpload',
                                    value: false,
                                });
                            }, time);
                        });
                };
                reader.readAsDataURL(blob);
                clearClip();
            }
        } else if (clipboardData && text) {
            // 当剪切板的内容为文本时
            const item = clipboardData.items[0];
            if (item && item.kind === 'string') {
                const object = {
                    text,
                    width: 300,
                    fontSize: 72,
                    scaleX: 1 / 3,
                    scaleY: 1 / 3,
                    color: '#345',
                };
                Ktu.element.addModule('textbox', object);
                clearClip();
            }
        } else {
            Ktu.element.paste();
        }
    });

    document.addEventListener('copy', event => {
        /* 进行复制的时候 把黏贴数据重置
           let clipboardData = event.clipboardData || event.originalEvent.clipboardData; */

        /* if (clipboardData.files.length > 0) {
           clearClip();
           } */

        /* 这个无法从剪切板内容进行判断（浏览器用户隐私机制），只能从copy激发的activeElement的元素判断是否需要清空剪切板操作，
           textbox里面没有触发到copy事件比较奇怪，不过也不影响结果 */
        if (!$(document.activeElement).is('input') && !$(document.activeElement).is('textarea')) {
            clearClip();
        }

        Ktu.log('keyboard', 'copy');
        Ktu.element.copy();
    });

    function clearClip() {
        const copyInput = document.createElement('input');
        copyInput.style.position = 'fixed';
        copyInput.style.top = '-9999px';
        copyInput.style.left = '-9999px';
        copyInput.style.width = '2em';
        copyInput.style.height = '2em';
        copyInput.style.padding = 0;
        copyInput.style.border = 'none';
        copyInput.style.outline = 'none';
        copyInput.style.boxShadow = 'none';
        copyInput.style.background = 'transparent';
        copyInput.value = ' ';
        document.body.appendChild(copyInput);
        copyInput.select();
        document.execCommand('copy');

        document.body.removeChild(copyInput);
    }

    function userImg(item) {
        const object = {
            id: item.id,
            path: item.path,
            callback() {
                Ktu.element.copy();
            },
        };

        if (/\.svg/.test(object.path)) {
            Ktu.element.addModule('svg', object);
        } else {
            object.w = item.width;
            object.h = item.height;

            Ktu.element.addModule('image', object);
        }
    }
};
