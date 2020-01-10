Vue.component('phone-upload-modal', {
    template: `
    <Modal class="manageModal phone-upload-modal" :width="660" :height="523" @on-cancel="close()" class-name="phoneUploadModal" v-model="showPhoneUploadModal">
        <div class="title">手机上传</div>
        <div class="codeContent" v-if="uploadState==1"">


            <div style="position:relative;">
                <img class="qrCode" :src="codeUrl">
                <loading v-show="isLoading" style="position:absolute;top:0;left:0;bottom:0;right:0;"></loading>
            </div>

            <div class="qrCodeTips">微信扫一扫，上传手机图片</div>
            <div class="waitingTime" v-show="timeOut">等待时间过长，请重新扫描二维码</div>
        </div>
        <div class="transmission" v-if="uploadState==3">
            <div class="img"></div>
            <div class="transmissionTips">请在手机上操作，上传完成前请勿关闭弹窗</div>
            <ele-btn label="重新扫码" class="closeBtn" @click="getCode(1)"></ele-btn>
        </div>
        <div class="uploadImgManage" v-if="uploadState==2">
            <div class="imgBox">
                <div class="imgItem" v-for="(item,index) in imgList" :class="phoneUploadEntrance==1?'canChoose':''" @click="changeCheck(index)">
                    <div class="checkBox"  v-if="phoneUploadEntrance==1"  :class="item.checked?'checked':''">
                        <svg>
                            <use xlink:href="#svg-ele-upload-checked"></use>
                        </svg>
                    </div>
                    <img :src="(item.p160p||item.sp)" :style="item.imgStyle" alt="">
                </div>
            </div>
            <div class="bottomBtn">
                <ele-btn class="finishBtn" label="完成" :class="phoneUploadEntrance!==1?'middle':''" @click="close('close')"></ele-btn>
                <ele-btn v-if="phoneUploadEntrance==1" label="添加到画板" class="addBtn" :class="checkedList.length==0?'disable':''" @click="add"></ele-btn>
            </div>
        </div>
    </Modal>
    `,
    name: 'phoneUploadModal',
    props: {

    },
    data() {
        return {
            imgList: [],
            checkedList: [],
            codeUrl: null,
            // 上传状态 1扫码前 2有图片上传 3链接完成
            uploadState: 0,
            timer: null,
            ScanCodeTimer: null,
            timeOut: false,
            endPoll: false,
            isLoading: true,
        };
    },
    created() {
        this.$once('hook:beforeDestroy', () => {
            clearInterval(this.ScanCodeTimer);
            clearInterval(this.timer);
        });
        Ktu.log('phoneUploadModal', 'open');
        this.getCode();
    },

    computed: {
        showPhoneUploadModal: {
            get() {
                return this.$store.state.modal.showPhoneUploadModal;
            },
            set(newValue) {
                this.$store.commit('modal/phoneUploadModal', newValue);
            },
        },
        phoneUploadEntrance() {
            return this.$store.state.data.phoneUploadEntrance;
        },
        groupId() {
            return this.$store.state.data.uploadGroupId;
        },
    },
    methods: {
        changeCheck(index) {
            if (this.phoneUploadEntrance == 1) {
                const hasChecked = this.checkedList.indexOf(index);
                this.imgList[index].checked = !this.imgList[index].checked;
                hasChecked === -1 ? this.checkedList.push(index) : this.checkedList.splice(hasChecked, 1);
            }
        },
        // 手机上传成功
        getImages() {
            const url = '../ajax/ktuImage_h.jsp?cmd=getPhoneUploadFlag';
            axios
                .post(url, {
                    ktuId: Ktu.ktuId,
                })
                .then(res => {
                    const { data } = res;
                    if (this.imgList.length == 0) {
                        if (!data.success && data.timeOut == false) {
                            this.uploadState = 1;
                            this.getCode();
                            this.timeOut = true;
                        }
                    }
                    if (data.endPoll) {
                        this.endPoll = true;
                        clearInterval(this.timer);
                    }
                    if (data.success && data.flag) {
                        this.uploadState = 2;
                        this.getImagesInfo();
                        Ktu.log('phoneUploadModal', 'success');
                    } else if (!data.success && !data.pcflag) {
                        clearInterval(this.timer);
                    }
                })
                .catch(e => {
                    console.log(e);
                });
        },
        getImagesInfo() {
            const url = '../ajax/ktuImage_h.jsp?cmd=getImagInfo';
            axios
                .post(url, {
                    ktuId: Ktu.ktuId,
                })
                .then(res => {
                    const { data } = res;
                    if (data.success) {
                        data.info.forEach(item => {
                            item.checked = true;
                            item.h > item.w ? item.imgStyle = {
                                width: 'auto',
                                height: '100%',
                            } : item.imgStyle = {
                                width: '100%',
                                height: 'auto',
                            };
                            this.imgList.push(item);
                            this.checkedList.push(this.checkedList.length);
                        });

                        this.$store.commit('data/changePhoneUploadImage', true);
                    }
                })
                .catch(e => {
                    console.log(e);
                });
        },
        // 获取二维码
        getCode(item = 0) {
            const url = '../ajax/ktuImage_h.jsp?cmd=delPhoneUploadScene';
            axios
                .post(url, {
                    ktuId: Ktu.ktuId,
                })
                .then(res => {
                    const { data } = res;
                    if (data.success) {
                        this.codeUrl = `../ajax/wxaQrcode.jsp?cmd=fileUpload&ktuId=${Ktu.ktuId}&groupId=${this.groupId}&_TOKEN=${Ktu.initialData.token}?m=${Math.random()}`;
                        this.uploadState = 1;
                        this.imgList = [];
                        this.checkedList = [];
                        if (item == 1) {
                            Ktu.log('phoneUploadModal', 'replace');
                        }
                    }
                })
                .catch(e => {
                    console.log(e);
                });
        },
        // 验证是否扫码成功
        getScanCodeFlag() {
            const url = '../ajax/ktuImage_h.jsp?cmd=getScanCodeFlag';
            axios
                .post(url, {
                    ktuId: Ktu.ktuId,
                })
                .then(res => {
                    const { data } = res;
                    if (!data.success && data.timeOut == false) {
                        this.getCode();
                    } else if (data.success && data.flag) {
                        this.uploadState = 3;
                        this.timeOut = false;
                        Ktu.log('phoneUploadModal', 'code');
                    }
                })
                .catch(e => {
                    console.log(e);
                });
        },
        // 添加到画板
        add() {
            if (this.checkedList.length == 0) return;
            const PromiseAll = [];
            this.checkedList.forEach(item => {
                PromiseAll.push(new Promise((resolve, reject) => {
                    this.useImg(this.imgList[item]);
                    resolve();
                }));
                Promise.all(PromiseAll).then(() => {
                    this.close('close');
                });
            });
            Ktu.log('phoneUploadModal', 'add');
        },
        useImg(item) {
            const object = {
                id: item.i || item.resourceId,
                path: item.p || item.filePath,
            };
            if (/\.svg/.test(object.path)) {
                object.tmpSrc = item.sp160p;
                if (/ktrq-/.test(item.n)) {
                    object.w = item.width;
                    object.h = item.height;
                    Ktu.element.addModule('imageContainer', object);
                } else {
                    Ktu.element.addModule('svg', object);
                }
            } else {
                object.tmpSrc = item.p160p || item.sp;
                object.w = item.w;
                object.h = item.h;

                Ktu.element.addModule('image', object);
            }

            // 添加上传素材
            Ktu.log('addUploadMaterial');
            // 上传操作-使用
            Ktu.log('upload', 'use');
        },
        // 关闭弹窗
        close(item) {
            if (!this.endPoll) {
                const url = '../ajax/ktuImage_h.jsp?cmd=delPhoneUploadScene';
                axios
                    .post(url, {
                        ktuId: Ktu.ktuId,
                    });
            }
            if (item == 'close') {
                this.showPhoneUploadModal = false;
            }
        },
    },
    watch: {
        uploadState(val, oldVal) {
            clearInterval(this.ScanCodeTimer);
            clearInterval(this.timer);
            if (val == 1) {
                const image = new Image();
                this.ScanCodeTimer = setInterval(() => {
                    this.getScanCodeFlag();
                }, 3000);
                image.onload = () => {
                    this.isLoading = false;
                };
                image.src = this.codeUrl;
            } else {
                this.timer = setInterval(() => {
                    this.getImages();
                }, 3000);
            }
        },
    },
});

