Vue.component('psd-upload-modal', {
    template: `
    <Modal class="manageModal psd-upload-modal" :width="showModalWidth" :closable="!isUploading" :mask-closable="showModal == 'uploadModal' && !isUploading" class-name="newModalBody" v-model="showPsdUploadModal" ref="modal">
        <div slot="header" class="download-modal-header">
            <span class="titleTip">上传PSD</span>
        </div>
        <div class="modal-body" v-if="showModal == 'uploadModal'">
            <div class="uploadArea" id="file-upload-btn">
                <div class="uploadArea-svg">
                    <svg class="psd-nav-icon">
                        <use xlink:href="#svg-nav-psd-icon" class="nav-icon-use"></use>
                    </svg>
                    <div class="PSDUploadText">上传PSD</div>
                </div>
                <input id="select_psd_btn" class="psdSelectbtn" type="file" accept=".psd" @change="psdUploadChange">
                <a id="psd_upload_button" href="javascript:void(0)" class="uploadify-button" @click="psdUploadFun"></a>
            </div>
            <div class="textToImg">
                <div class="title">文本转换为图片：</div>
                <div class="des">
                    <ktu-switch :value="isToImage" v-model="isToImage"></ktu-switch>
                </div>
            </div>
            <div class="attention">
                <div class="psdInfo">
                    请将图层锁定和链接全部解开，使用了蒙版或样式的图层须转成智能对象；文本若不转换为图片，上传后只保留字号和颜色；文件大小不超{{psdSizeLimit}}M。详见
                    <a href="https://docs.qq.com/doc/DUVhuQ3ZWTXJ2WVZX?opendocxfrom=admin" target="_blank" class="psdLink">PSD文件规格说明</a>
                </div>
              </div>
        </div>
        <div class="modal-body" v-else-if = "showModal == 'reUpload'">
            <div class="bigFileTips">
                <div class="tipsImage"></div>
                <p class="tipsText">您的PSD文件超过{{psdSizeLimit}}M，请调整后再重新上传噢~</p>
            </div>
            <div class="uploadArea uploadArea-more" id="file-psdUpload-btn" style="height:138px;">
                <div class="psd-icon-content uploadArea-svg">
                    <svg class="psd-nav-icon">
                        <use xlink:href="#svg-nav-psd-icon" class="nav-icon-use"></use>
                    </svg>
                    <div class="reUploadText">重新上传</div>
                </div>
                <input id="select_psd_btn" class="psdSelectbtn" type="file" accept=".psd" @change="psdUploadChange">
                <a id="psd_upload_button" href="javascript:void(0)" class="uploadify-button" @click="psdUploadFun"></a>
            </div>
            <div class="textToImg">
                <div class="title">文本转换为图片：</div>
                <div class="des">
                    <ktu-switch :value="isToImage" v-model="isToImage"></ktu-switch>
                </div>
            </div>
        </div>
        <div class="modal-body" v-else-if = "showModal == 'uploadSpeed'">
            <div class="tipsImage"></div>

            <div class="psd-upload-progress">
                <div class="psd-upload-progress-bg" :style="{width : barWidth}">
                    <div class="psd-upload-progress-bar"></div>
                </div>
                <div class="psd-upload-progress-text">{{barWidth}}</div>
            </div>

            <div class="removeUpload" @click="unUploadFun">
                <button>{{unUpload}}</button>
            </div>
        </div>
        <div class="modal-body" v-else-if = "showModal == 'uploadSuccess'">
            <div class="successImage"></div>
            <div class="psd-upload-success">
                <div class="psd-upload-success-bg">
                    <div class="psd-upload-success-bar"></div>
                </div>
                <div class="psd-upload-success-text">100%</div>
            </div>
            <div class="putinUpload">导入成功</div>
        </div>
        <div class="modal-body" v-else-if = "showModal == 'uploadError'">
            <div slot="header" class="download-modal-header">
            </div>
            <div class="errorImage"></div>
            <div class="errorUploadText">导入失败</div>
            <div class="errorUploadBtn">
                <div class="errorReupload" @click="errorReupload">重新上传</div>
                <div class="errorDelete" @click="errorDelete">取消</div>
            </div>
        </div>
    </Modal>
    `,
    name: 'psdUploadModal',
    props: {},
    mixins: [Ktu.mixins.popupCtrl, Ktu.mixins.dataHandler, Ktu.mixins.uploadSetting],
    data() {
        return {
            modalState: 'normal',
            uploadKtuPSDObject: {
                uploadKtuPSD: false,
                importPSDText: false,
            },
            // uploadModal上传弹窗；uploadSpeed上传进度弹窗；reUpload重新上传弹窗；uploadSuccess上传成功
            showModal: 'uploadModal',
            unUpload: '取消上传',
            isToImage: Ktu.vm.$store.state.base.PSDTextToImage,
            psdUploadPercent: '',
            canvasScale: 1,
            imgStoreOver: 0,
            isUploading: false,

            moduleContent: [],
            uploadKtuPSDO: {
                fileIndex: 0,
                totalSize: 0,
                index: 1,
            },
            PSDChildren: '',
            layerTotalsize: 0,
            layerIndex: 0,
            layerOver20: false,
            cancelUpload: false,
            // cantReadPsd: Ktu.cantReadPsd = false,
            imageType: 'image/png',
        };
    },
    computed: {
        showPsdUploadModal: {
            get() {
                return this.$store.state.modal.showPsdUploadModal;
            },
            set(newValue) {
                this.$store.commit('modal/psdUploadModalState', newValue);
            },
        },
        showModalWidth() {
            if (this.showModal == 'uploadSpeed' || this.showModal == 'uploadSuccess' || this.showModal == 'uploadError') {
                return '390';
            }
            return '460';
        },
        psdSizeLimit() {
            // return Ktu.isFromCustomization ? 200 : 500;
            return 500;
        },
        barWidth() {
            if (this.layerIndex == 0) {
                return '0%';
            }
            return `${parseInt((this.layerIndex / this.layerTotalsize) * 100, 10)}%`;
        },
        isUIManage() {
            return Ktu.isUIManage;
        },
    },
    watch: {
        showModal: {
            handler(value) {
                Vue.nextTick(() => {
                    // const self = this;
                    const {
                        modal,
                    } = this.$refs;
                    const modalBody = $(modal.$el).find('.ktu-modal-body');
                    if (value == 'uploadSpeed') {
                        this.isUploading = true;
                        modalBody.css({
                            width: '390',
                            height: '290',
                        });
                    } else if (value == 'uploadSuccess') {
                        modalBody.css('width', 390);
                        modalBody.css('height', 290);
                    } else if (value == 'uploadError') {
                        modalBody.css('width', 390);
                        modalBody.css('height', 285);
                    } else {
                        modalBody.css('width', 460);
                        modalBody.css('height', 354);
                    }
                });
            },
            immediate: true,
        },
        imgStoreOver(curVal, oldVal) {
            if (curVal == -7) {
                this.showPsdUploadModal = false;
                this.$store.commit('modal/normalModalState', {
                    isOpen: true,
                    props: {
                        modalText: '存储容量不足，请删除部分图片后再上传',
                        modalImgSrc: `${Ktu.initialData.resRoot}/image/editor/upload/storageLimit.png`,
                    },
                });
            }
        },
        isToImage(curVal, oldVal) {
            Ktu.vm.$store.state.base.PSDTextToImage = curVal;
        },
        /* cantReadPsd(curVal, oldVal) {
             console.log('cantReadPsd');
         },*/
    },
    methods: {
        psdUploadFun() {
            if (this.isUploading) {
                this.$Notice.warning('正在上传，请稍后...');
                return;
            }
            $(this.$el).find('.psdSelectbtn')
                .trigger('click');
        },
        psdUploadChange(e) {
            const self = this;
            if (self.isUploading) {
                this.$Notice.warning('正在上传，请稍后...');
            }
            self.isUploading = true;
            if (e.target.files[0]) {
                // url = URL.createObjectURL(e.target.files[0]);
                const fileName = e.target.files[0].name;
                const psdReg = /\.(psd)$/;
                if (!psdReg.test(fileName)) {
                    this.showPsdUploadModal = false;
                    this.$Notice.warning('请上传psd格式的文件！');
                    return;
                }
                if (Ktu.isFromCustomization) {
                    if (e.target.files[0].size >= 524288000) {
                        self.showModal = 'reUpload';
                        self.isUploading = false;
                        return;
                    }
                    const psdFile = e.target.files[0];
                    const psdFileSize = psdFile.size / 1024 / 1024;
                    const uploadCount = parseInt(psdFileSize / 5, 10) + parseInt((psdFileSize % 5) ? 1 : 0, 10);
                    (function iterator(i) {
                        const fileSize = psdFile.size;
                        const shardSize = 5 * 1024 * 1024;

                        const shardStart = i * shardSize;
                        const shardEnd = Math.min(fileSize, shardStart + shardSize);
                        const psdmd5 = $.md5(psdFile.name + psdFile.size + psdFile.type + psdFile.lastModified);

                        const filed = new FormData();
                        const newFile = psdFile.slice(shardStart, shardEnd);

                        newFile.filename = psdFile.name;
                        newFile.lastModifiedDate = psdFile.lastModifiedDate;
                        newFile.lastModified = psdFile.lastModified;

                        filed.append('filedata', newFile, psdFile.name);
                        filed.append('totleSize', fileSize);
                        filed.append('fileMd5', psdmd5);
                        filed.append('initSize', shardStart);

                        if (i === uploadCount - 1) {
                            filed.append('complete', true);
                        } else {
                            filed.append('complete', false);
                        }

                        axios.post(`../ajax/advanceUpload_h.jsp?cmd=_uploadPSDtoOPT&ktuId=${Ktu.ktuData.id}`, filed, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                'X-Requested-With': 'XMLHttpRequest',
                            },
                        }).then(res => {
                            const resData = res.data;
                            if (resData.success) {
                                if (i === uploadCount - 1) {
                                    axios.post(`../ajax/advanceUpload_h.jsp?cmd=_savePSDtoOPT&ktuId=${Ktu.ktuData.id}&fileId=${resData.id}`).then(res => {

                                    });
                                } else {
                                    iterator(i + 1);
                                }
                            }
                        });
                    }(0));
                } else {
                    if (e.target.files[0].size >= 524288000) {
                        self.showModal = 'reUpload';
                        self.isUploading = false;
                        return;
                    }
                }
            } else {
                return self.isUploading = false;
            }

            // photopea的方式
            if (e.target.files[0]) {
                self.showModal = 'uploadSpeed';
                Ktu.analyzePsd.prototype.np(e.target.files, null, null, null, psdData => {
                    let psdScale;
                    const ktuWidth = Ktu.ktuData.other.width;
                    const ktuHeight = Ktu.ktuData.other.height;
                    const psdWidth = psdData.X;
                    const psdHeight = psdData.v;
                    if (ktuWidth / ktuHeight <= psdWidth / psdHeight) {
                        psdScale = ktuWidth / psdWidth;
                    } else {
                        psdScale = ktuHeight / psdHeight;
                    }
                    const children = psdData.R;
                    const childLength = children.length;
                    self.layerTotalsize = childLength;
                    (function childIterator(childrenInfo) {
                        if (childrenInfo < childLength) {
                            if (!self.cancelUpload) {
                                const layer = children && children[childrenInfo];
                                const isText = layer && layer.add && layer.add.TySh;
                                const layerObject = {};
                                if (layer.buffer.byteLength > 0) {
                                    // text
                                    if (!self.isToImage && isText) {
                                        layerObject.text = isText.Ma.Txt.v;
                                        const layerFontSize = layer.add.TySh.kU.EngineDict.StyleRun.RunArray[0].StyleSheet.StyleSheetData
                                                            && layer.add.TySh.kU.EngineDict.StyleRun.RunArray[0].StyleSheet.StyleSheetData.FontSize;
                                        const layerFontTran = layer.add.TySh.Y && layer.add.TySh.Y._u || 1;
                                        const layerFontColor = layer.add.TySh.kU.EngineDict.StyleRun.RunArray[0].StyleSheet.StyleSheetData.FillColor
                                            && layer.add.TySh.kU.EngineDict.StyleRun.RunArray[0].StyleSheet.StyleSheetData.FillColor.Values;
                                        layerObject.fontSize = 72;
                                        layerObject.scaleX = layerFontSize * layerFontTran / 72;
                                        layerObject.width = layer.rect.X / layerObject.scaleX + 12;
                                        /* layerObject.left = layer.rect.x + layer.rect.X / 2;
                                        layerObject.top = layer.rect.y + layer.rect.v / 2;*/
                                        layerObject.left = layer.rect.x;
                                        layerObject.top = layer.rect.y;
                                        layerObject.psdScale = psdScale;
                                        if (layerFontColor) {
                                            layerObject.fill = `rgba(${Math.round(layerFontColor[1] * 255)},${Math.round(layerFontColor[2] * 255)},${Math.round(layerFontColor[3] * 255)}, 1)`;
                                        } else {
                                            layerObject.fill = 'rgb(1,1,1,1)';
                                        }
                                        layerObject.uploadType = 'psdUpload';
                                        Ktu.element.addModule('textbox', layerObject);
                                        childIterator(++childrenInfo);
                                        if (self.layerIndex < self.layerTotalsize) {
                                            self.layerIndex++;
                                        }
                                    } else {
                                        // image
                                        layerObject.h = layer.rect.v;
                                        layerObject.w = layer.rect.X;
                                        layerObject.scale = 1;
                                        layerObject.forbid = true;
                                        /* ktu.addmodule加上height/2
                                        layerObject.top = layer.rect.y + layer.rect.v / 2;
                                        layerObject.left = layer.rect.x + layer.rect.X / 2;*/
                                        layerObject.top = layer.rect.y;
                                        layerObject.left = layer.rect.x;
                                        layerObject.fileName = layer.name;
                                        layerObject.uploadType = 'psdUpload';
                                        layerObject.psdScale = psdScale;
                                        const fd = new FormData();
                                        const imgCanvas = self.toCanvas(layerObject.w, layerObject.h, layer.buffer);
                                        imgCanvas.toBlob(blob => {
                                            fd.append('filedata', blob);
                                            fd.append('totalSize', blob.size);
                                            if (blob.size / 1024 / 1024 > 20) {
                                                if (!self.isUIManage) {
                                                    self.imageType = 'image/jpeg';
                                                    childIterator(childrenInfo);
                                                    return;
                                                }
                                                if (blob.size / 1024 / 1024 > 50) {
                                                    self.imageType = 'image/jpeg';
                                                    childIterator(childrenInfo);
                                                    return;
                                                }
                                            }
                                            axios.post(`../ajax/uploadPSDImg_h.jsp?cmd=uploadPSDImageNew&width=${layer.rect.X}&height=${layer.rect.v}`, fd, {
                                                headers: {
                                                    'Content-Type': 'multipart/form-data',
                                                },
                                            }).then(res => {
                                                const imgInfo = res.data;
                                                if (imgInfo.success) {
                                                    layerObject.id = imgInfo.id;
                                                    layerObject.path = imgInfo.path;
                                                    layerObject.tmpSrc = imgInfo.path;

                                                    Ktu.element.addModule('image', layerObject);
                                                    childIterator(++childrenInfo);
                                                    if (self.layerIndex < self.layerTotalsize) {
                                                        self.layerIndex++;
                                                    }
                                                } else {
                                                    self.isUploading = false;
                                                    if (imgInfo.rt == '-7') {
                                                        self.imgStoreOver = imgInfo.rt;
                                                    } else {
                                                        self.showModal = 'uploadError';
                                                    }
                                                }
                                            });
                                        }, self.imageType);
                                        self.imageType = 'iamge/png';
                                    }
                                } else {
                                    childIterator(++childrenInfo);
                                }
                            } else {
                                self.isUploading = false;
                                self.showPsdUploadModal = false;
                                axios.post('../ajax/uploadPSDImg_h.jsp?cmd=setImgList', {
                                    ktuId: Ktu.ktuData.id,
                                }).then(res => {
                                    const info = res.data;
                                    if (info.success) {
                                        self.$store.state.base.changePicComplete = true;
                                        self.getUploadStorage();
                                    }
                                });
                            }
                        } else {
                            self.showModal = 'uploadSuccess';
                            axios.post('../ajax/uploadPSDImg_h.jsp?cmd=setImgList', {
                                ktuId: Ktu.ktuData.id,
                            }).then(res => {
                                const info = res.data;
                                if (info.success) {
                                    self.$store.state.base.changePicComplete = true;
                                    self.getUploadStorage();
                                }
                            });
                            setTimeout(() => {
                                self.showPsdUploadModal = false;
                            }, 120);
                            return ;
                        }
                    }(0));
                });
            }
        },
        unUploadFun() {
            const self = this;
            self.cancelUpload = true;
            self.showPsdUploadModal = false;
            /* axios.post('../ajax/uploadPSDImg_h.jsp?cmd=deleteImg', {
            //     ktuId: Ktu.ktuData.id,
            // }).then((res => {
            // }));*/
        },
        toCanvas(w, h, pix) {
            let context; let i; let imageData; let len; let pixel; let pixelData; let ref;
            const canvas = document.createElement('canvas');
            if (0 < w && w < 1) {
                w = 1;
            }
            if (0 < h && h < 1) {
                h = 1;
            }
            if (this.layerOver20) {
                canvas.width = w / 1.2;
                canvas.height = h / 1.2;
                context = canvas.getContext('2d');
                imageData = context.getImageData(0, 0, w / 1.2, h / 1.2);
                pixelData = imageData.data;
                // imageData.data = pix;
                ref = pix;
                // for (i = j = 0, len = ref.length; j < len; i = ++j) {
                for (i = 0, len = ref.length; i < len; i++) {
                    pixel = ref[i];
                    pixelData[i] = pixel;
                }
                context.putImageData(imageData, 0, 0);
                return canvas;
            }
            canvas.width = w;
            canvas.height = h;
            context = canvas.getContext('2d');
            imageData = context.getImageData(0, 0, w, h);
            pixelData = imageData.data;
            // imageData.data = pix;
            ref = pix;
            // for (i = j = 0, len = ref.length; j < len; i = ++j) {
            for (i = 0, len = ref.length; i < len; i++) {
                pixel = ref[i];
                pixelData[i] = pixel;
            }
            context.putImageData(imageData, 0, 0);
            return canvas;
            /* canvas.toBlob(function(blob){
                   return blob;
                   })
                   return canvas.toDataURL('image/png'); */
            this.layerOver20 = false;
        },
        errorReupload() {
            this.showModal = 'uploadModal';
        },
        errorDelete() {
            this.showPsdUploadModal = false;
        },
    },
});
