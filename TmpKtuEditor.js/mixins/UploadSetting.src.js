Ktu.mixins.uploadSetting = {
    data() {
        return {
            file_setting_type: '*.jpg;*.jpeg;*.png;*.svg;',
            file_setting_type_list: Ktu.ktuData.isGif ? ['jpg', 'jpeg', 'png', 'svg', 'gif'] : ['jpg', 'jpeg', 'png', 'svg'],
            file_size_limit: Ktu.isUIManage ? 80 : 20,
            file_setting_multi: true,
            file_setting_maxUploadList: 10,
            file_setting_maxChoiceList: 10,
            file_setting_imgMode: -1,
            file_setting_imgMaxWidth: 16384,
            file_setting_imgMaxHeight: 16384,
            upload: null,
            totalUploadNum: 0,
            currentUploadIndex: 0,
            needUploadSize: true,
        };
    },
    computed: {
        // 容量进度条样式
        sizeBarStyle() {
            const obj = {};
            const width = (this.uploadNowSize / this.uploadMaxSize).toFixed(4) * 100;
            if (width >= 80) {
                obj.backgroundColor = '#F04134';
            }
            obj.width = `${width}%`;
            return obj;
        },
        TYPE_ADVANCE_UPLOAD() {
            return this.$store.state.data.uploadType;
        },
        uploadNowSize() {
            return this.$store.state.data.uploadNowSize;
        },
        uploadMaxSize() {
            return this.$store.state.data.uploadMaxSize;
        },
        isGifTemplate() {
            return this.$store.state.base.isGifTemplate;
        },
    },
    methods: {
        // 获取上传空间
        getUploadStorage() {
            const url = '../ajax/ktuImage_h.jsp?cmd=state';

            axios.post(url, {
            }).then(res => {
                const info = (res.data);
                if (info.success) {
                    this.$store.commit('data/updateUploadStorage', {
                        uploadType: info.state.TYPE_ADVANCE_UPLOAD,
                        uploadNowSize: info.state.statSize,
                        uploadMaxSize: Ktu.isThirdDesigner || Ktu.isPartner ? 10 * 1024 * 1024 * 1024 : info.state.maxSize,
                    });
                }
            })
                .catch(err => {
                    this.$Notice.error(err);
                })
                .finally(() => {
                // this.isLoading = false;
                });
        },
        initUpload(initTarget, config = {}) {
            this.createHtml5Upload(initTarget, config);
            /* var self = this;
               axios.post("/ajax/advanceUpload_h.jsp?cmd=getUploadAuth", {
               ktuId: Ktu.ktuId
               }).then(function(res) {
               var info = JSON.parse(res.data);
               if (info.success) {
               self.createHtml5Upload(initTarget, info.state);
               }
               })["catch"](function(err) {
               console.log(err);
               }); */
        },
        // 获取快图项目底层基本配置
        getAdvanceSetting(isSupportUploadGif = false) {
            const { token } = Ktu.initialData;
            let acceptImageType = this.file_setting_type;
            if (Ktu.isUIManage && this.isGifTemplate && isSupportUploadGif) {
                acceptImageType += '*.gif;';
            }
            const self = this;
            return {
                auto: true,
                isJudgePush: true,
                isSvgToPng: true,
                // 快图的图片都不压缩
                isResizeImg: false,
                isConcurrent: true,
                fileTypeExts: acceptImageType,
                multi: true,
                fileSizeLimit: this.file_size_limit * 1024 * 1024,
                file_queue_limit: this.file_setting_maxUploadList,
                post_params: {
                    imgMode: this.file_setting_imgMode,
                    maxWidth: this.file_setting_imgMaxWidth,
                    maxHeight: this.file_setting_imgMaxHeight,
                    _TOKEN: token,
                    ktuId: Ktu.ktuId,
                },
                breakPoints: true,
                removeTimeout: 9999999,
                modalShow: false,
                resizeImg: {
                    maxWidth: 2000,
                    maxHeight: 2000,
                },
                getMaxSize() {
                    return self.uploadMaxSize;
                },
                getStatSize() {
                    return self.uploadNowSize;
                },
                onUploadStart(files) {
                    // 每个上传 弹窗只出现一次
                    this.modalShow = false;
                    self._uTime = new Date().getTime();
                },
                // 上传是否成功的标识符
                onUploadSuccess(file, text) {
                    const data = jQuery.parseJSON(text);
                    self.report(file, self.TYPE_ADVANCE_UPLOAD, data.success);
                    if (data.success) {
                        Ktu.log('upload', 'success');
                        Ktu.simpleLog('uploadLog', 'success');
                        self.uploadSuccess && self.uploadSuccess(data, file);
                    } else {
                        Ktu.log('upload', 'error');
                        self.uploadError && self.uploadError(data, file);
                    }
                },
                // 上传是否完全成功的标识符
                onUploadAllSuccess(file, data) {
                    self.uploadAllSuccess && self.uploadAllSuccess(JSON.parse(data), file);
                },
                // 选择后
                onSelect(file) {
                    return self.select && self.select(file);
                },
                // 进度条
                onUploadProgress(data, file) {
                    self.uploadProgress && self.uploadProgress(data, file);
                },
                msgInfo(type, msg) {
                    setTimeout(() => {
                        /* if (typeof msg == 'object' && msg.rt != undefined) {
                            if (msg.rt == -311 && !this.modalShow) {
                                this.modalShow = true;
                                self.$store.commit('modal/normalModalState', {
                                    isOpen: true,
                                    props: {
                                        modalText: '你上传的图片太多了，请明天再尝试上传',
                                        modalImgSrc: 'data:image/png;base64,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',
                                    },
                                });
                                Ktu.simpleLog('uploadLog', 'limit');
                            } else if (msg.rt == -7 && !this.modalShow) {
                                this.modalShow = true;
                                self.$store.commit('modal/normalModalState', {
                                    isOpen: true,
                                    props: {
                                        modalText: '存储容量不足，请删除部分图片后再上传',
                                        modalImgSrc: 'data:image/png;base64,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',
                                    },
                                });
                                Ktu.simpleLog('uploadLog', 'limit');
                            }
                        } else {
                        }*/
                        self.$Notice[type](msg);
                        Ktu.simpleLog('uploadLog', 'other');
                    }, 100);
                },
                // 获取文件大小url
                getFileSizeUrl: '/ajax/advanceUpload_h.jsp?cmd=_getUploadSize',
                // 这个url需要在文件上传前修改 暂时写在组件中
                uploader: '/ajax/advanceUpload_h.jsp?cmd=_upload',
                // 上传提交前准备的操作
                beforePushList(tmpFileArr, tmpDeferArr, file, paramObj) {
                    self.uploadPushList && self.uploadPushList(tmpFileArr, tmpDeferArr, file);
                },
            };
        },
        // 文件上传时候的一些限制
        limit() {
            const self = this;
            return {
                onSelectLimit(files) {
                    if (files.length > 10) {
                        self.$Notice.warning('单次上传资源不能超过10个。');
                        return false;
                    }
                    return true;
                },
            };
        },
        // dom点击时候图片的操作
        createHtml5Upload(target, config) {
            const self = this;
            const $target = $(target);
            // var $targetParent = $target.parent();

            const advanceSetting = Object.assign({}, this.getAdvanceSetting(true),
                // 生命周期
                {
                    onSelect(files) {
                        if (!self.limit().onSelectLimit(files)) {
                            return false;
                        }
                        self.upload.disable(self.upload.instanceID, true);

                        $target.off('click.busy').on('click.busy', () => {
                            self.$Notice.warning('正在上传，请稍后...');
                        });
                        self.totalUploadNum = files.length;
                        self.uploadSelect && self.uploadSelect(files);
                        return true;
                    },
                    onUploadSuccess(file, text) {
                        const data = jQuery.parseJSON(text);
                        // var tmpFile = Ktu.tempResFilesList.splice(0, 1)[0];
                        self.report(file, self.TYPE_ADVANCE_UPLOAD, data.success);

                        if (data.success) {
                            // 全部上传完后，才可以再上传
                            if (file.index == self.totalUploadNum) {
                                self.upload.enable(self.upload.instanceID);
                                $target.off('click.busy');
                            }
                            Ktu.log('upload', 'success');
                            Ktu.simpleLog('uploadLog', 'success');
                            self.uploadSuccess && self.uploadSuccess(data, file);
                        } else {
                            self.upload.enable(self.upload.instanceID);
                            $target.off('click.busy');
                            Ktu.log('upload', 'error');
                            self.uploadError && self.uploadError(data, file);
                        }
                    },
                    onUploadError(file, text) {
                        self.upload.enable(self.upload.instanceID);
                        $target.off('click.busy');
                        Ktu.log('upload', 'catch');
                        self.uploadError && self.uploadError(file.name, file);
                        self.report(file, self.TYPE_ADVANCE_UPLOAD, false);
                    },
                }, config
            );
            this.upload = $target.uploadify(advanceSetting);
            $target.find('.uploadify-button').length && $target.find('.uploadify-button')[0].addEventListener('click', () => {
                Ktu.log('upload', 'click');
            }, false);
        },
        report(file, type, flag) {
            const time = new Date().getTime() - this._uTime;
            let size = 0;
            if (typeof(file) != 'undefined') {
                size = file.size;
            }

            axios.post('/ajax/advanceUpload_h.jsp?cmd=_report', {
                type,
                size,
                time,
                flag,
            }).then(res => {
                // var info = JSON.parse(res.data);
            })
                .catch(err => {
                    console.log(err);
                });
        },
    },
};
