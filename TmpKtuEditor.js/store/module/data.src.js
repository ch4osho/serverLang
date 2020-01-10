Ktu.storeModule.data = {
    namespaced: true,
    state: {
        scale: 1,
        zoom: '100%',
        uploadType: '',
        uploadNowSize: 0,
        uploadMaxSize: 0,
        needCheckStep: false,
        currentpageId: Ktu.ktuData.content[0],
        hasCopiedObject: false,
        selectedData: null,
        currentMulti: null,
        selectedGroup: null,
        selectedTemplateData: {},
        // 分享信息
        shareInfo: null,
        // 删除的素材文件夹
        deleteMaterialDir: {},
        // 记录删除素材文件夹触发的来源
        deleteMaterialOrigin: '',
        // 记录删除素材文件夹是否成功
        deleteMaterialSuccess: false,
        // 是否显示小提示窗口,
        isShowPopover: false,
        choosedType: 'null',
        // showLogoImgType: '',
        showLogoImgData: '',
        // 是否显示设计服务引流
        isShowDrainage: true,
        // 0代表未进入手机上传 1代表编辑态上传入口 2代表素材库入口
        phoneUploadEntrance: 0,
        // 监听手机是否上传图片
        phoneUploadImage: false,
        isKeyDownMoving: false,
        // 展示保存失败弹窗
        showSaveFailedTips: false,
        // 编辑器修改收藏的素材列表
        shouldRefreshList: [],
        // 编辑器修改收藏的用户上传图片列表
        shouldRefreshUploadList: [],
        // 是否覆盖之后后退或前进
        hasCoverPage: false,
        // 用于记录恢复后的情况清除PageHistoryData操作
        coverChangeNum: false,
        // 是否保存失败后覆盖
        hasCoverPage: false,
        // 当前预览模板的参数
        isReplaceAll: false,
        template: {},
        pageIdx: 0,
        currentPageIndex: 0,
        // 画布上马赛克背景
        edbg: null,
        // 手机上传文件夹ID
        uploadGroupId: null,
        // 素材库历史记录
        historicalRecord: [],
        // 素材库历史记录当前index
        historicalRecordIndex: null,
        // 审核模板信息
        chooseKtuItem: null,
        // 用于上传的水印svg
        markSvg: '',
        // 完整的水印数据
        markData: {},

    },
    mutations: {
        /* changeLogoImgType: function (state, type) {
           state.showLogoImgType = type
           }, */
        changeLogoImgData(state, data) {
            state.showLogoImgData = data;
        },
        changeState(state, obj) {
            state[obj.prop] = obj.value;
        },
        changePhoneUploadImage(state, data) {
            state.phoneUploadImage = data;
        },
        changePhoneUploadEntrance(state, data) {
            state.phoneUploadEntrance = data;
        },
        changeSelectedData(state, obj) {
            if (obj) {
                if (obj.originGroup) {
                    obj._objects.forEach(item => {
                        if (!item.elementName) {
                            switch (item.type) {
                                case 'back-ground-shape-image':
                                    item.elementName = '背景';
                                    break;
                                case 'textbox':
                                    item.elementName = '';
                                    break;
                                case 'compound-image':
                                    item.elementName = '图片';
                                    break;
                                case 'path-group':
                                    item.elementName = '图形';
                                    break;
                            }
                        }
                    });
                } else {
                    if (!obj.elementName) {
                        switch (obj.type) {
                            case 'back-ground-shape-image':
                                obj.elementName = '背景';
                                break;
                            case 'textbox':
                                obj.elementName = '';
                                break;
                            case 'compound-image':
                                obj.elementName = '图片';
                                break;
                            case 'path-group':
                                obj.elementName = '图形';
                                break;
                        }
                    }
                }
            }
            state.selectedData = obj;
        },
        changeDataProp(state, obj) {
            const data = obj.object ? obj.object : state.selectedData;
            !obj.isAvoidSaveState && data.saveState();
            !Object.prototype.hasOwnProperty.call(data, obj.prop)
                ? Vue.set(data, obj.prop, obj.value)
                : data[obj.prop] = obj.value;

            !obj.isAvoidSaveState && data.modifiedState();
            data.dirty = true;
            Ktu.save.changeSaveNum();
        },
        changeDataProps(state, obj) {
            const data = obj.object ? obj.object : state.selectedData;
            !obj.isAvoidSaveState && data.saveState();
            const props = Object.keys(obj);
            props.forEach((prop, index) => {
                if (prop !== 'object' && prop !== 'isAvoidSaveState') {
                    !Object.prototype.hasOwnProperty.call(data, obj.prop)
                        ? Vue.set(data, prop, obj[prop])
                        : data[prop] = obj[prop];
                }
            });
            !obj.isAvoidSaveState && data.modifiedState();
            data.dirty = true;
            Ktu.save.changeSaveNum();
        },
        changeDataObject(state, obj) {
            Ktu.save.changeSaveNum();
            state.selectedData[obj.prop][obj.attr] = obj.value;
        },
        changeDataInGroupProp(state, obj) {
            const data = obj.object ? obj.object : state.selectedGroup || state.currentMulti;
            !obj.isAvoidSaveState && data.saveState();
            /* data._objects.forEach((object, index) => {
               object.dirty = true;
               object[obj.prop] = obj.value;
               }); */
            const change = objects => {
                objects.forEach((object, index) => {
                    if (object.type === 'group') {
                        change(object.objects);
                    } else {
                        object[obj.prop] = obj.value;
                    }
                    object.dirty = true;
                });
            };
            change(data.objects);
            /* if (!obj.isAvoidSaveState) {
               data.originGroup ? data.activeChange() : data.activeModify();
               } */
            !obj.isAvoidSaveState && data.modifiedState();
            Ktu.save.changeSaveNum();
        },
        updateUploadStorage(state, obj) {
            state.uploadNowSize = obj.uploadNowSize;
            state.uploadMaxSize = obj.uploadMaxSize;
            obj.uploadType && (state.uploadType = obj.uploadType);
        },
        changeChoosedType(state, obj) {
            state.choosedType = obj.choosedType;
        },
        // 要删除的文件夹
        updateDelMaterialDir(state, obj) {
            state.deleteMaterialDir = obj;
        },
        // 监听素材文件夹是否删除成功
        updateDelMaterialSuccess(state, value) {
            state.deleteMaterialSuccess = value;
        },
        // 监听删除素材文件夹的来源
        updateDelMaterialOrigin(state, str) {
            state.deleteMaterialOrigin = str;
        },
    },
    actions: {
        getUploadStorage(context) {
            const url = '../ajax/ktuImage_h.jsp?cmd=state';

            axios.post(url, {}).then(res => {
                const info = (res.data);
                if (info.success) {
                    context.commit('updateUploadStorage', {
                        uploadMaxSize: Ktu.isThirdDesigner ? 10 * 1024 * 1024 * 1024 : info.state.maxSize,
                        uploadNowSize: info.state.statSize,
                    });
                }
            })
                .catch(err => {
                    Ktu.vm.$Notice.error(err);
                })
                .finally(() => {
                    // this.isLoading = false;
                });
        },
    },
};
