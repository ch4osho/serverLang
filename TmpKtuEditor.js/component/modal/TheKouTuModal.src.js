Vue.component('kou-tu-modal', {
    template: `
    <modal class="manageModal kou-tu-modal" :width="screenWidth" :style="{height:screenHeight + 'px'}" :closable="closable" :mask-closable="maskClosable" class-name="newModalBody" v-model="showKouTuModal">
        <div class="koutu-loading ktu-loading" v-if="showLoading">
            <div class="loading-box full">
                <div class="loading-circle loading-circle-3"></div>
                <div class="loading-circle loading-circle-2"></div>
                <div class="loading-circle loading-circle-1"></div>
                <div class="loading-icon"></div>
            </div>
        </div>
        <div class="iframe-container">
            <iframe :src="iframeSrc" :width="screenWidth +'px'" :height="screenHeight + 'px'">
            </iframe>
        </div>
    </modal>
    `,
    name: 'kouTuModal',
    props: {},
    data() {
        return {
            closable: false,
            maskClosable: true,
            screenWidth: 1600,
            screenHeight: 795,
            minWidth: 950,
            minHeight: 550,
            maxWidth: 1600,
            maxHeight: 795,
            debounceTimer: null,
            iframeSrc: '',
            showLoading: true,
        };
    },
    created() {
        this.pageStart();
        this.getClipImageInfo();
    },
    computed: {
        showKouTuModal: {
            get() {
                return this.$store.state.modal.showKouTuModal;
            },
            set(newValue) {
                this.$store.commit('modal/showKouTuModalState', newValue);
            },
        },
    },
    destroyed() {
        this.pageEnd();
    },
    methods: {
        debounce(method, time = 30) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                method.call(this);
            }, time);
        },
        closeLoading() {
            // 合并loading，等待抠图编辑器页面loading结束 postMessage再关。
            this.showLoading = false;
            this.maskClosable = false;
        },
        cancel() {
            setTimeout(() => {
                this.$store.commit('modal/showKouTuModalState', false);
            }, 300);
            // 取消抠图
        },
        error(msg) {
            // 抠图异常处理
            this.$Notice.error(msg);
        },
        success(data = {}) {
            // 抠图成功返回数据后的处理
            if (!data.id || !data.path) {
                this.$Notice.error('图片生成异常，请刷新后重试');
                return;
            }
            this.$store.commit('modal/showKouTuModalState', false);
            const { selectedData } = this.$store.state.data;
            // 存储前一个的状态
            selectedData.saveState();
            if (selectedData.type == 'background') {
                this.applyBackground(data);
            } else {
                this.applyImage(data);
            }
            // 清除一些状态
            selectedData.isSystem = false;
            selectedData.isCollect = false;
            // 更新新的数据，并且将旧数据加入历史队列
            selectedData.modifiedState();
        },
        sizeOut(data = {}) {
            const { selectedData } = this.$store.state.data;
            if (data.cutoutId) {
                selectedData.image.cutoutId = data.cutoutId;
            }
            this.closeAndNotic('资源已超过容量限制，请删除部分素材后重试');
        },
        applyImage(data) {
            const { selectedData } = this.$store.state.data;
            // 如果没有原图的id，存储一个，后续要拿这个东西去获取原图做抠图。
            if (!selectedData.image.recourceFileId) {
                selectedData.image.recourceFileId = selectedData.image.fileId;
            }
            selectedData.image.fileId = data.id;
            if (data.pre160ViewPath) {
                selectedData.image.smallSrc = data.pre160ViewPath;
            }
            if (data.cutoutId) {
                selectedData.image.cutoutId = data.cutoutId;
            }
            const img = new Image();
            const url = URL.createObjectURL(data.localBlob);
            img.onload = () => {
                if (data.width && data.height && (selectedData.width !== data.width || selectedData.height !== data.height)) {
                    selectedData.cropScaleX = 1;
                    selectedData.cropScaleY = 1;
                    selectedData.image.width = data.width;
                    selectedData.image.height = data.height;
                    selectedData.image.scaleX = 1;
                    selectedData.image.scaleY = 1;
                    selectedData.image.left = 0;
                    selectedData.image.top = 0;
                    selectedData.width = data.width;
                    selectedData.height = data.height;
                    selectedData.shapeWidth = data.width;
                    selectedData.shapeHeight = data.height;
                }
                selectedData.image.src = url;
                selectedData.dirty = true;
                selectedData.hasLoaded = true;
                this.loadRealImage(selectedData.image.src2000);
            };
            img.onerror = () => {
                selectedData.setImageSource(data.path);
            };
            selectedData.setImageSource(data.path, true);
            // 改用blob的本地文件路径，防止图片加载过程太长。
            img.src = url;
        },
        // 替换背景
        applyBackground(data) {
            const { selectedData } = this.$store.state.data;
            const imageObject = {
                type: 'image',
                src: data.path,
                tmpSrc: data.thumbPath,
                width: data.width,
                height: data.height,
                fileId: data.id,
            };
            if (!selectedData.image.recourceFileId) {
                imageObject.recourceFileId = selectedData.image.fileId;
            } else {
                imageObject.recourceFileId = selectedData.image.recourceFileId;
            }
            if (data.cutoutId) {
                imageObject.cutoutId = data.cutoutId;
            }
            selectedData.setBackGround(imageObject);
        },
        /*         loadRealImage(selectedData) {
            // 禁用缓存的，实际上还是要加上这个，加载完真实图片之后，展示出来。
            if (selectedData && selectedData.image.src2000) {
                const image = new Image();
                image.src = selectedData.image.src2000;
                image.onload = () => {
                    selectedData.image.src = selectedData.image.src2000;
                    selectedData.dirty = true;
                    selectedData.hasLoaded = true;
                };
            };
        }, */
        loadRealImage(src2000) {
            if (src2000) {
                const image = new Image();
                image.src = src2000;
            };
        },
        tmpFunc(event) {
            if (event && event.data) {
                const res = event.data;
                this[`${res.key}`] && this[`${res.key}`](res.value);
            }
        },
        pageStart() {
            // 事件绑定
            this.calcSize();
            window.onresize = () => {
                this.debounce(this.calcSize);
            };
            window.addEventListener('message', this.tmpFunc, true);
        },
        pageEnd() {
            window.removeEventListener('message', this.tmpFunc, true);
        },
        calcSize() {
            // 弹窗上下左右各留60
            let width = $(window).width() - 120;
            let height = $(window).height() - 120;
            width = Math.max(width, this.minWidth);
            height = Math.max(height, this.minHeight);
            width = Math.min(width, this.maxWidth);
            height = Math.min(height, this.maxHeight);
            this.screenWidth = width;
            this.screenHeight = height;
        },
        getClipImageInfo() {
            // 获取抠图数据
            const { selectedData } = this.$store.state.data;
            if (selectedData) {
                // 这个kouTuFileId，只是拿来取clippingInfo的数据。
                let kouTuFileId = '';
                // cutoutId 如果没有抠过图，那么他就是空的，后端会重新生成。如果是有的话，后端不会返回这个id，所以需要在下面赋值。
                const { image: { fileId: imageId, recourceFileId, cutoutId: clippingId = '' } } = selectedData;
                kouTuFileId = recourceFileId || imageId;
                const url = `/ajax/ktuCutoutImg/uploadFromEditor.do?oriResourceId=${kouTuFileId}&cutoutId=${clippingId}`;
                axios
                    .get(url)
                    .then(res => {
                        console.log('抠图接口的返回',res)
                        if (res && res.data) {
                            // 请求成功才禁止关闭弹窗。（有的异常可能不会被捕获到，这个时候还是让用户能够关闭抠图弹窗好点）
                            const { data: { id = clippingId, clippingInfo, msg: errmsg, success }  } = res.data;
                            // 获取到clipping的数据拼接成iframe的url
                            if (success && id && clippingInfo) {
                                this.iframeSrc = `//${Ktu.manageDomain}/koutu/editor.jsp?fromModal=true&secret=${clippingInfo.secret}&id=${clippingInfo.id}&test=${clippingInfo.test}&fileId=${id}&userNameId=${clippingInfo.userNameId}&name=${clippingInfo.originalFilename}`;
                            } else {
                                this.closeAndNotic(errmsg);
                            }
                        } else {
                            this.closeAndNotic();
                        }
                    })
                    .catch(() => {
                        this.closeAndNotic();
                    });
            }
        },
        closeAndNotic(errmsg = '服务器异常，请刷新后重试') {
            this.$Notice.error(errmsg);
            this.cancel();
        },
    },
});
