Vue.component('tool-change-pic', {
    template: `
    <div class="tool-box tool-change-pic">
        <tool-btn @click="click">{{ btnTitle }}</tool-btn>
        <input style="display:none;" type="file" :accept="type" ref="input">
    </div>`,
    mixins: [Ktu.mixins.dataHandler],
    props: {
        type: {
            type: String,
            default: 'image/jpg,image/jpeg,image/png,image/svg+xml',
        },
        isBackground: Boolean,
        eventType: {
            type: [String, Number],
        },
        btnTitle: {
            type: String,
            default: '更换图片',
        },
    },
    data() {
        return {
            acceptImageType: ['image/jpeg', 'image/png', 'image/svg+xml'],
        };
    },
    computed: {
        // 更换图片完毕
        changePicComplete: {
            get() {
                return this.$store.state.base.changePicComplete;
            },
            set(value) {
                this.$store.state.base.changePicComplete = value;
            },
        },
    },
    mounted() {
        this.$refs.input.onchange = e => {
            const file = e.target.files[0];
            this.readerUploadFile(file);
            this.$refs.input.value = '';
        };
    },
    methods: {
        click(event) {
            this.$store.commit('modal/imageSourceModalState', {
                isOpen: true,
            });
            if (this.activeObject.type === 'imageContainer') {
                Ktu.simpleLog('imageContainer', 'btnChangePic');
            }
            Ktu.log('materialModal', 'change');
            if (this.eventType) {
                Ktu.simpleLog(this.eventType, 'change');
            }
        },
        readerUploadFile(file) {
            debugger;
            const reader = new FileReader();

            reader.onload = e => {
                const base64 = e.target.result;
                const newImg = new Image();
                let width; let height;

                const promise = new Promise((resolve, reject) => {
                    newImg.onload = info => {
                        const { target } = info;
                        width = target.width;
                        height = target.height;

                        if (width > 16380 || height > 16380) {
                            this.$Notice.warning(`${file.name}宽高大于16380，请裁剪后再上传。`);
                        } else {
                            if (/svg/.test(file.type)) {
                                svgJudge.bind(this)(file, target, newImg, resolve, reject);
                            } else {
                                resolve();
                            }
                        }
                    };

                    newImg.src = base64;
                });

                promise.then(svgPreData => {
                    this.isUpload = true;
                    this.upload({
                        base64,
                        file,
                        width,
                        height,
                        svgPreData,
                    });
                });
            };

            reader.readAsDataURL(file);

            function svgJudge(file, target, newImg, resolve, reject) {
                const reader = new FileReader();
                reader.readAsText(file);

                reader.onload = ev => {
                    const text = ev.target.result;
                    // 读取svg结构 如果带有image 直接返回
                    if (text.match(/<(image)/img) != null) {
                        this.$Notice.warning(`${file.name}格式异常上传失败。`);
                    } else {
                        const canvas = document.createElement('canvas');
                        let { width } = target;
                        let { height } = target;
                        const scale = width / height;
                        // 保证缩略图不能过小
                        if (width < 300 && height < 300) {
                            width = 300;
                            height = width / scale;
                        }
                        canvas.width = width;
                        canvas.height = height;

                        // 取得画布的2d绘图上下文
                        const context = canvas.getContext('2d');
                        context.drawImage(newImg, 0, 0, width, height);

                        let svgPreData = canvas.toDataURL('image/png');
                        svgPreData = svgPreData.split(',')[1];

                        resolve(svgPreData);
                    }
                };
                reader.onerror = function () {
                    reject();
                };
            }
        },
        upload(params) {
            const { base64, file, width, height, svgPreData } = params;

            const url = '/ajax/advanceUpload_h.jsp?cmd=_uploadPaste';
            let imgType = 0;
            switch (file.type) {
                case this.acceptImageType[0]:
                    imgType = 2; break;
                case this.acceptImageType[1]:
                    imgType = 4; break;
                case this.acceptImageType[2]:
                    imgType = 81; break;
            }
            const imgWidth = width || 100;
            const imgHeight = height || 100;

            axios.post(url, {
                data: base64.split(',')[1],
                maxWidth: 16384,
                maxHeight: 16384,
                imgType,
                imgMode: 2,
                fileName: file.name,
                svgWidth: imgWidth,
                svgHeight: imgHeight,
                svgPreData,
            }).then(res => {
                const info = (res.data);

                if (info.success) {
                    try {
                        if (imgType != 81) {
                            this.applyPngImg(info);
                        } else {
                            this.applySvgImg(info);
                        }
                    } catch (err) {
                        console.log(err);
                        this.$Modal.confirm({
                            content: '更换图片失败',
                        });
                    }
                } else {
                    this.$Modal.confirm({
                        content: info.msg,
                    });
                }
            })
                .catch(err => {
                    console.log(err);
                    this.$Modal.confirm({
                        content: '网络中断上传失败',
                    });
                })
                .finally(() => {

                });
        },
        applyPngImg(info) {
            const { selectedData } = Ktu;
            if (this.isBackground) {
                selectedData.saveState();
                this.applyBackground(info);
                selectedData.modifiedState();
            } else if (this.isInContainer) {
                this.image.fileId = info.id;
                this.image.width = info.width;
                this.image.height = info.height;
                this.image.scaleX = 1;
                this.image.scaleY = 1;
                /* child.width = item.width;
                   child.height = item.height;
                   child.scaleX = 1; */
                const src = info.path;
                this.setImageSource(src);
                this.setImageCenter();
                this.container.dirty = true;
            } else {
                selectedData.saveState();

                const object = {
                    type: 'changePic',
                    id: info.id,
                    path: info.path,
                    imgWidth: info.width,
                    imgHeight: info.height,
                };
                Ktu.element.addModule('image', object);
            }
        },
        applySvgImg(info) {
            const { selectedData } = Ktu;
            selectedData.saveState();

            const object = {
                type: 'changePic',
                id: info.id,
                path: info.path,
            };
            Ktu.element.addModule('svg', object);
        },
        // 替换背景
        applyBackground(info, image) {
            const imageObject = {
                type: 'image',
                src: info.path,
                tmpSrc: info.thumbPath,
                width: info.width,
                height: info.height,
                fileId: info.id,
            };
            this.selectedData.setBackGround(imageObject);
        },
    },
});
