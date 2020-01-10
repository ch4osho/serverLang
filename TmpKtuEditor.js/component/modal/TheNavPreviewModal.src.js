Vue.component('preview-modal', {
    template: `
    <Modal @on-cancel="close" class="previewModal" :width="1029" :footerHide="true" :closable="false" v-model="showNavPreviewModal" :showMask="!isShowDetailBox" :maskAnimate="!isShowDetailBox">
        <div class="preview-content-mask" v-if="isShowDetailBox"></div>
        <div class="image-detailBox-close" v-if="isBtnOnload" @click="hideModal">
            <svg>
                <use xlink:href="#svg-preview-close" ></use>
            </svg>
        </div>
        <div class="leftBox">
            <div class="container" :style="{'width':(preview.width || 700) + 'px', 'height':(preview.height || 700) + 'px'}" v-if="preview.imgKey">
                <div class="svgDom"
                    v-html="svgDom"
                    v-for="item in preview.container"
                    :style="{'left':item.left + 'px','top':item.top + 'px', 'width':item.width + 'px','height':item.height + 'px'}">
                </div>
                <img :src="URL + '/image/editor/PreviewEditer/'+ preview.imgKey +'.png'"/>
            </div>
            <div
                :style="imgMaxHeight"
                v-html="svgDom"
                title="查看大图"
                @click="showDetailBox()"
                :class="['containerBottom',setClass]"
                @mousemove.stop
                alt=""
            >
            </div>
        </div>
        <div class="rightBox">
            <div class="title">
                {{title}}
            </div>
            <div class="type">{{templateItem.name}} {{fileSize}}</div>
            <div class="btnBox">
                <div @click="toLog" :class="isFromThirdDesigner?'oneBtn':''">
                    <download-menu class="btn downBtn"></download-menu>
                </div>
                <btn @click="share" v-if="!isFromThirdDesigner"  class="btn shareBtn" icon="svg-nav-share" >{{isUserB?'转发':'分享'}}</btn>
            </div>
        </div>
        <div class="image-detailBox" @click.self="hideDetailBox"  v-show="isShowDetailBox" @wheel="mouseWheel" >
            <div class="imgWraper">
                <div @dragstart="onImgDragstart" :style="imgStyle" @click.self="hideDetailBox" @mousemove.stop="translateMove" @mouseup="translateEnd"  @mousedown="translateStart"  v-html="svgDom" alt="" class="imgBox"></div>
            </div>
            <!--
                <transition name="fade">
                    <div class="image-detailBox-close" @click="hideDetailBox" v-if="isShowBtn">
                        <svg>
                        <use xlink:href="#svg-preview-close" ></use>
                        </svg>
                    </div>
                </transition>

            -->
            <transition name="fade">
                <div class="zoomTops" v-if="showTips">{{zoomTips}}</div>
            </transition>
        </div>
    </div>
    </Modal>
    `,
    name: 'preview-modal',
    props: {
        /* modalImgSrc: String,
           modalText: String,
           btnText: {
           type: String,
           default: '我知道了',
           },
           okFn: Function, */
    },
    data() {
        return {
            shareBusy: false,
            unitType: {
                2: 'mm',
                3: 'cm',
                4: 'in',
                default: 'px',
            },
            isShowDetailBox: false,
            translateX: 0,
            translateY: 0,
            zoom: 1,
            contentStyle: {
                width: 1029,
                height: 700,
            },
            showTips: false,
            zoomedImgUrl: '',
            isBtnOnload: false,
            // 判断是否第三方设计师
            isThirdDesigner: Ktu.isThirdDesigner,
            // 判断是用户模式还是设计师模式（管理态的header设置的）
            manageStatus: sessionStorage.getItem('manageStatus'),
        };
    },
    created() {
        this.showBtn();
        console.log('the nav previewmodal is creeated')
    },
    computed: {
        imgMaxHeight() {
            return this.imageListLen > 1 ? {
                maxHeight: `${(parseInt(this.contentStyle.height, 10) - 60) * 0.48}px`,
            } : {};
        },
        setClass() {
            const templateData = Ktu.ktuData.other;
            const radio = templateData.originalWidth / templateData.originalHeight;
            if ((templateData.originalWidth <= 650 && templateData.originalHeight <= 630) || radio > 1.04) {
                return this.preview.imgKey ? 'paved' : 'centent';
            } else if (radio < 0.166666) {
                return 'soLong';
            }
        },
        zoomTips() {
            return `${Number(this.zoom * 100).toFixed(0)}%`;
        },
        imgStyle() {
            return {
                transform: `translate(${this.translateX}px,${this.translateY}px) scale(${this.zoom})`,
            };
        },
        unit() {
            return this.unitType[this.templateItem.unitId] || 'px';
        },
        showNavPreviewModal: {
            get() {
                return this.$store.state.modal.showNavPreviewModal;
            },
            set(newValue) {
                this.$store.commit('modal/navPreviewModalState', newValue);
            },
        },
        preview() {
            return Ktu.config.templatePreview[this.pageType] || {
                container: [{}],
            };
        },
        templateItem() {
            for (let i = 0; i < this.fileOptions.length; i++) {
                if (this.fileOptions[i].id === this.pageType) {
                    return this.fileOptions[i];
                }
            }
        },
        fileSize() {
            const templateData = Ktu.ktuData.other;
            let unit = '';
            switch (templateData.unit) {
                case 1:
                    unit = 'px';
                    break;
                case 2:
                    unit = 'mm';
                    break;
                case 3:
                    unit = 'cm';
                    break;
                case 4:
                    unit = 'in';
                    break;
            }
            return `${templateData.originalWidth + unit} x ${templateData.originalHeight}${unit}`;
        },
        URL() {
            return Ktu.initialData.resRoot;
        },
        svgDom() {
            return Ktu.template.toSvg();
        },
        pageType() {
            return this.$store.state.base.templateType;
        },
        fileOptions() {
            return Ktu.config.fileOptions;
        },
        isUserB() {
            return Ktu._isUserB;
        },
        title() {
            return this.$store.state.msg.title;
        },
        isFromThirdDesigner() {
            return Ktu.isFromThirdDesigner;
        },
        isFromCustomization() {
            return Ktu.isFromCustomization;
        },
    },
    methods: {
        close() {
            this.isBtnOnload = false;
        },
        showBtn() {
            setTimeout(() => {
                this.isBtnOnload = true;
            }, 300);
        },
        hideModal() {
            if (this.isShowDetailBox) {
                this.hideDetailBox();
            } else {
                this.isBtnOnload = false;
                this.showNavPreviewModal = false;
            }
        },
        // 取消firefox下的默认拖拽行为
        onImgDragstart(e) {
            e.preventDefault();
        },
        // 鼠标滑轮放大缩小
        mouseWheel(e) {
            if (Ktu.browser.isFirefox) {
                // 兼容firefox浏览器，滚轮方向与webkit相反
                if (e.deltaY < 0) {
                    this.zoom += 0.03;
                } else {
                    this.zoom -= 0.03;
                }
            } else {
                if (e.wheelDeltaY > 0) {
                    this.zoom += 0.03;
                } else {
                    this.zoom -= 0.03;
                }
            }
            this.showTips = true;
            this.zoom = Math.min(this.zoom, 3);
            this.zoom = Math.max(this.zoom, 0.5);
            if (this.timer) {
                clearTimeout(this.timer);
            }
            this.timer = setTimeout(() => {
                this.showTips = false;
                this.timer = null;
            }, 1000);
        },
        translateStart(event) {
            if (event.target.className === 'imgBox') {
                return;
            }
            this.ismoving = true;
            this.startPos = {
                x: event.pageX,
                y: event.pageY,
            };
            this.currentPos = {
                x: this.translateX,
                y: this.translateY,
            };
        },
        translateMove(event) {
            // this.showBtn();
            if (this.ismoving) {
                this.translateX = this.currentPos.x + event.pageX - this.startPos.x;
                this.translateY = this.currentPos.y + event.pageY - this.startPos.y;
            }
        },
        translateEnd(event) {
            this.ismoving = false;
        },
        showDetailBox() {
            this.isShowDetailBox = true;
        },
        hideDetailBox() {
            this.isShowDetailBox = false;
        },
        changeModalSize(e) {
            const height = document.body.clientHeight;
            const width = document.body.clientWidth;
            if (height < 259) {
                this.contentStyle = {
                    height: `${259}px`,
                    width: this.contentStyle.width,
                };
            } else if (height < 600) {
                this.contentStyle = {
                    height: `${height}px`,
                    width: this.contentStyle.width,
                };
            } else if (height < 700) {
                this.contentStyle = {
                    height: `${600}px`,
                    width: this.contentStyle.width,
                };
            }
            if (width < 830) {
                this.contentStyle = {
                    height: this.contentStyle.height,
                    width: `${730}px !important`,
                };
            } else if (width < 1129) {
                this.contentStyle = {
                    height: this.contentStyle.height,
                    width: `${width - 100}px !important`,
                };
            }
            if (height > 700 && width > 1129) {
                this.contentStyle = {
                    height: `${700}px`,
                    width: `${1029}px`,
                };
            }
        },

        /* end */
        cancel() {
            this.showShareModal = false;
        },
        // 下载
        toLog() {
            Ktu.log('previewModal', 'download');
        },
        share() {
            // 未保存要先保存 要等保存完毕后才打开弹窗
            Ktu.template.saveCurrentPage(true).then(() => {
                if (this.shareBusy) return false;
                this.shareBusy = true;
                Ktu.log('previewModal', 'share');
                if (!this.$store.state.base.shareLink) {
                    const url = '/ajax/ktu_h.jsp?cmd=setKtuShare';
                    axios
                        .post(url, {
                            ktuId: Ktu.ktuId,
                        }).then(res => {
                            const result = (res.data);
                            // 如果返回成功 或者 提示封禁
                            if (result.success || result.closeKtu || result.closeAccount) {
                                // result.closeKtu = true;
                                this.$store.commit('data/changeState', {
                                    prop: 'shareInfo',
                                    value: result,
                                });
                                this.$store.commit('modal/shareModalState', true);
                            }
                        })
                        .catch(err => {
                            this.$Notice.error('服务繁忙，请稍后再试。');
                        })
                        .finally(() => {
                            this.shareBusy = false;
                        });
                } else {
                    this.$store.commit('modal/shareModalState', true);
                }
            });
        },
    },
});
