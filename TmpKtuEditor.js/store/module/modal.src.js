;
Ktu.storeModule.modal = {
    namespaced: true,
    state: {
        consultModal: null,
        showConsultModal: false,

        downloadModal: null,
        showDownloadModal: false,
        formatObj: {},
        qualityObj: {},
        openedSiteObj: {},
        weChatObj: {},
        tailorRuleObj: {},
        pageValue: 0,
        oldTitle: '',
        nowTitle: '',
        // download-modal-body的高度 rule表示选择切图规则时改变高度
        heightState: { format: 0, rule: 1, showSetting: 0 },
        isShowSetting: false,

        saveAsModal: null,
        showSaveAsModal: false,

        showPsdUploadModal: false,
        psdUploadModal: null,

        showCollectNPSModal: false,
        collectNPSModal: null,

        normalModal: null,
        showNormalModal: false,

        phoneUploadModal: null,
        showPhoneUploadModal: false,

        resizefileModal: null,
        showResizefileModal: false,

        textInputModal: null,
        showTextInputModal: false,

        imageCropModal: null,
        showImageCropModal: false,

        loadingModal: null,
        showLoadingModal: false,

        imageSourceModal: null,
        showImageSourceModal: false,

        shareModal: null,
        showShareModal: false,

        fontAuthorizationModal: null,
        showFontAuthorizationModal: false,

        exportImgModal: null,
        showExportImgModal: false,

        auditModal: null,
        showAuditModal: false,

        normalAuditModal: null,
        showNormalAuditModal: false,

        festivalModal: null,
        showFestivalModal: false,

        // 下载loading显示状态，true显示，false隐藏
        downloadLoadingStatus: true,

        deleteMaterialModal: null,
        showDeleteMaterialModal: false,

        previewPopup: null,
        showPreviewPopup: false,

        // 显示导航栏预览
        navPreviewModal: null,
        showNavPreviewModal: false,

        // 显示抠图弹窗
        showKouTuModal: false,
        kouTuModal: null,

        // 显示邀请朋友编辑弹窗
        showInviteEditModal: false,
        inviteEditModal: null,

        // 修改弹窗中的收藏的id
        showModalChangeId: -1,

        // 弹窗中收藏状态
        showModalState: {},
        // 显示水印弹窗
        showMarkModal: false,
        markModal: null,

        isAvancedFold: true,
    },
    mutations: {
        modalState(state, obj) {
            const {
                modalName,
                modalObj,
                modalState,
                modalRender = {},
                isOpen,
            } = obj;
            if (isOpen) {
                const instance = new Vue({
                    render(h) {
                        return h(modalName, modalRender);
                    },
                    store: Ktu.store,
                });
                state[modalObj] = instance.$mount();
                document.body.appendChild(state[modalObj].$el);
                // modal.siblings('div.TheModal').removeClass('isTop');
            } else {
                setTimeout(() => {
                    if (state[modalObj]) {
                        state[modalObj].$destroy();
                        state[modalObj] != null && state[modalObj].$el && document.body.removeChild(state[modalObj].$el);
                        state[modalObj] = null;
                    }
                }, 300);
            }
            Vue.nextTick(() => {
                const modal = state[modalObj];
                if (modal === null) return;
                if (!isOpen) {
                    if ($(modal.$el).length) {
                        $(modal.$el).prev('.TheModal')
                            .addClass('isTop');
                    } else {
                        $('.TheModal:last').addClass('isTop');
                    }
                } else {
                    $(modal.$el).siblings('.TheModal')
                        .removeClass('isTop');
                }
                state[modalState] = isOpen;
            });
        },

        consultModalState(state, isOpen) {
            this.commit('modal/modalState', {
                isOpen,
                modalName: 'consult-modal-box',
                modalObj: 'consultModal',
                modalState: 'showConsultModal',
            });
        },
        resizeFileModalState(state, obj) {
            const {
                isOpen,
            } = obj;

            this.commit('modal/modalState', {
                isOpen,
                modalRender: obj,
                modalName: 'resizefile-modal-box',
                modalObj: 'resizefileModal',
                modalState: 'showResizefileModal',
            });
        },
        downloadModalState(state, isOpen) {
            this.commit('modal/modalState', {
                isOpen,
                modalName: 'download-modal',
                modalObj: 'downloadModal',
                modalState: 'showDownloadModal',
            });
        },
        saveAsModalState(state, isOpen) {
            this.commit('modal/modalState', {
                isOpen,
                modalName: 'save-as-modal',
                modalObj: 'saveAsModal',
                modalState: 'showSaveAsModal',
            });
        },
        psdUploadModalState(state, isOpen) {
            this.commit('modal/modalState', {
                isOpen,
                modalName: 'psd-upload-modal',
                modalObj: 'psdUploadModal',
                modalState: 'showPsdUploadModal',
            });
        },
        collectNPSModalState(state, isOpen) {
            this.commit('modal/modalState', {
                isOpen,
                modalName: 'collectnps-modal-box',
                modalObj: 'collectNPSModal',
                modalState: 'showCollectNPSModal',
            });
        },
        normalModalState(state, obj) {
            const {
                isOpen,
            } = obj;

            this.commit('modal/modalState', {
                isOpen,
                modalRender: obj,
                modalName: 'normal-modal',
                modalObj: 'normalModal',
                modalState: 'showNormalModal',
            });
        },
        phoneUploadModal(state, isOpen) {
            this.commit('modal/modalState', {
                isOpen,
                modalName: 'phone-upload-modal',
                modalObj: 'phoneUploadModal',
                modalState: 'showPhoneUploadModal',
            });
        },
        textInputModalState(state, isOpen) {
            this.commit('modal/modalState', {
                isOpen,
                modalName: 'text-input-modal',
                modalObj: 'textInputModal',
                modalState: 'showTextInputModal',
            });
        },
        imageCropModalState(state, isOpen) {
            this.commit('modal/modalState', {
                isOpen,
                modalName: 'image-crop-modal',
                modalObj: 'imageCropModal',
                modalState: 'showImageCropModal',
            });
        },
        loadingModalState(state, isOpen) {
            this.commit('modal/modalState', {
                isOpen,
                modalName: 'loading-modal',
                modalObj: 'loadingModal',
                modalState: 'showLoadingModal',
            });
        },
        festivalModalState(state, isOpen) {
            this.commit('modal/modalState', {
                isOpen,
                modalName: 'festival-modal-box',
                modalObj: 'festivalModal',
                modalState: 'showFestivalModal',
            });
        },
        imageSourceModalState(state, obj) {
            const {
                isOpen,
            } = obj;
            if (!isOpen) {
                Ktu.store.state.base.isImgsourceByHotkey = false;
            }
            this.commit('modal/modalState', {
                isOpen,
                modalRender: obj,
                modalName: 'image-source-modal',
                modalObj: 'imageSourceModal',
                modalState: 'showImageSourceModal',
            });
        },
        shareModalState(state, isOpen) {
            this.commit('modal/modalState', {
                isOpen,
                modalName: 'share-modal',
                modalObj: 'shareModal',
                modalState: 'showShareModal',
            });
        },
        auditModalState(state, isOpen) {
            this.commit('modal/modalState', {
                isOpen,
                modalName: 'audit-modal',
                modalObj: 'auditModal',
                modalState: 'showAuditModal',
            });
        },
        normalAuditModalState(state, isOpen) {
            this.commit('modal/modalState', {
                isOpen,
                modalName: 'normal-audit-modal',
                modalObj: 'normalAuditModal',
                modalState: 'showNormalAuditModal',
            });
        },
        fontAuthorizationModalState(state, isOpen) {
            this.commit('modal/modalState', {
                isOpen,
                modalName: 'font-authorization-modal',
                modalObj: 'fontAuthorizationModal',
                modalState: 'showFontAuthorizationModal',
            });
        },
        exportImgModalState(state, isOpen) {
            this.commit('modal/modalState', {
                isOpen,
                modalName: 'export-img-modal',
                modalObj: 'exportImgModal',
                modalState: 'showExportImgModal',
            });
        },
        deleteMaterialModalState(state, isOpen) {
            this.commit('modal/modalState', {
                isOpen,
                modalName: 'delete-materialModal-box',
                modalObj: 'deleteMaterialModal',
                modalState: 'showDeleteMaterialModal',
            });
        },
        showPreviewPopupState(state, isOpen) {
            this.commit('modal/modalState', {
                isOpen,
                modalName: 'preview-popup',
                modalObj: 'previewPopup',
                modalState: 'showPreviewPopup',
            });
        },
        showKouTuModalState(state, isOpen) {
            this.commit('modal/modalState', {
                isOpen,
                modalName: 'kou-tu-modal',
                modalObj: 'kouTuModal',
                modalState: 'showKouTuModal',
            });
        },
        inviteEditModalState(state, isOpen) {
            this.commit('modal/modalState', {
                isOpen,
                modalName: 'invite-edit-modal',
                modalObj: 'inviteEditModal',
                modalState: 'showInviteEditModal',
            });
        },
        navPreviewModalState(state, isOpen) {
            this.commit('modal/modalState', {
                isOpen,
                modalName: 'preview-modal',
                modalObj: 'navPreviewModal',
                modalState: 'showNavPreviewModal',
            });
        },
        showMarkModalState(state, isOpen) {
            this.commit('modal/modalState', {
                isOpen,
                modalName: 'mark-modal',
                modalObj: 'markModal',
                modalState: 'showMarkModal',
            });
        },
    },
};
