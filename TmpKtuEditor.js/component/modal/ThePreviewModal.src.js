Vue.component('preview-popup', {
    template: `
    <modal class="preview-popup"  :width="contentStyle.width" :footer-hide="true" :closable="false" :maskAnimate="true" class-name="preview-popup" v-model="showPreviewPopup" >
        <div class="preview-content" :style="contentStyle">
            <div class="preview-content-mask" v-if="isShowDetailBox"></div>
            <div class="image-box"  ref="imageBox"  >
                <div v-if="!isLoadComplete && !isLoaded" class="loading">
                    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAACP0lEQVRIibXWTUuUURQH8N88DSUDpvlC9gKRBL1TIRRRtAlcBRHuXAV9hKJWrdr6IdrUMmgbRCRueqGyNAzEoLKsycqKCrFsce9lHqdhzGb6w3DunOc+53/Pc17uKSxe6LMMWrER67EBQ+jBZzzHLVzFw3pGinWedWM3unK6Tdgc1x3x14dzeIKLuF7LWKGGR6uwD7053WL04COOxQOkg2xFIbfvGk7jaz2PVuNoPCksYBJT+BZ196ve2Y7zGEQLBrALx/EmbcqqPMmTvMcNjOVIauEZzuAAHkfdTtwU4vsH0f4cySsML0NQjQkcigSJ7HI1UbfwrZMnd/FrBSQJP3BCxbNTOJkn2hPlAu78I0mebCDKAi4lojZ0xk2T+N4AScIkrsT1XhzJhNogpOZUE0gShqJNGMyE+MCclQV/OUwInQMOZyop+KmJJAnjUW7JhCIlBK/ZeBdla1Z3W+N4GuVMEfNC62j5D0TDOIvpDF+isv0/EK3DC8xkKEdlG0pNJClhbVyXM0zHPwVLr4ZG0atyfUxnQv3MRsU2zfGqFG0ReudcyrqxKIs4aGlXXymyaCPddeNJSYhTquKuBsgSSbr+p6LtJTfsIyEhOoS5YA3u+fu2VKoi+YDR/AkSfmIkbiD0wH7hCqkXt1Lc019FMhJtqvaIULy3VYaTInYIc8Gc0A9Tq2oRaq9NJbsIn2s0T1KLKHn2AC/jSTujoXb1i3pWSKpyrYf15rqyMBymAbInrlMTnhdGsLd4rdJhauI3g6N3tvbx4JgAAAAASUVORK5CYII=" >
                </div>
                <div class="image-wraper"  :class="(imageList.length>1?'multi':'single') + (canScroll?' scroll':'')">
                    <div class="img-container"  v-for="(imgUrl,index) in imageList" v-if="index < 2">
                        <img v-show="isLoaded" :style="imgMaxHeight" :src="canScroll?imgUrl.replace(/800x800/,''):imgUrl" title="查看大图" :ref="'img'+index" @click="showDetailBox(imgUrl,index)"  :class="{zoom:isShowMouseZoom}" @mouseenter="showMouseZoom" @mouseout="hideMouseZoom"  alt="" @load="onImgLoad(index)" >
                    </div>
                </div>
            </div>
            <div class="info-box">
                <div class="template-name">{{previewTemplate.name}}</div>
                <div class="template-size">
                    {{templateType}} {{size.width+size.unit}} × {{size.height+size.unit}}
                </div>

                <div class="template-operate">
                    <div class="use-btn" @click="useTemplate" v-if="isNeedPay" :class="{'disable': disable}">{{price}}图币兑换</div>
                    <div class="use-btn" @click="useTemplate" v-else>使用此模板</div>
                    <div class="collect-btn" :class="{collected: isCollected}" @click="collectTemplate" v-if="!isPrivate">
                        <svg class="svg-icon-collect">
                            <use xlink:href="#svg-preview-collectTemplate"></use>
                        </svg>
                    </div>
                </div>

                <!--
                <div class="user-coin-box">
                    <div class="coin-balance">
                        <img class="coin-icon" :src="coinSrc"/>
                        <span class="coin-des">图币余额：{{balance}}</span>
                    </div>
                    <div class="coin-btn" @click="getCoins">免费获取</div>
                </div>
                -->

                <div class="template-copy-right">
                    <p class="template-isCommercial">
                        <span class="svg-icon-faisco-img" v-if="previewTemplate.source === 0">
                            <use xlink:href="#svg-preview-ktu"></use>
                        </span>
                        <span class="svg-icon-faisco" v-if="previewTemplate.source === 1">
                            <img :src="previewTemplate.designerPath" alt="">
                        </span>
                        <svg class="svg-icon-faisco" v-if="previewTemplate.source === 2">
                            <use xlink:href="#svg-preview-share"></use>
                        </svg>
                        <span v-if="previewTemplate.source === 0">凡科快图</span>
                        <span v-if="previewTemplate.source === 1">{{previewTemplate.designerName}}</span>
                        <span v-if="previewTemplate.source === 2">网友共享</span>
                        <span class="can-use " v-if="previewTemplate.source !== 2" :class="{'can-use-lower': previewTemplate.source === 1}">可商用</span>
                        <span class="can-use use-carefully " v-if="previewTemplate.source === 2" >谨慎商用</span>
                    </p>
                    <p class="template-tips unBreakable" v-if="previewTemplate.source === 0">该模板由凡科网原创设计，凡科网客户可商用。</p>
                    <p class="template-tips" v-if="previewTemplate.source === 1">该模板由第三方设计师原创设计，凡科网客户可商用。</p>
                    <p class="template-tips" v-if="previewTemplate.source === 2">该模板由网友上传共享，仅供学习参考，<span class="worning">请谨慎用于商业用途。</span></p>
                </div>
            </div>
        </div>
        <div v-show="!isShowDetailBox" class="preview-content-close" @click="hideContent">
            <svg>
            <use xlink:href="#svg-preview-close" ></use>
            </svg>
        </div>
        <div v-show="!isShowDetailBox" class="preview-content-switch content-switch-previous" :class="{disable: currentTemplatesId.indexOf(this.template.id) == 0}" @click="templateSwitch(-1)">
            <svg>
            <use xlink:href="#svg-preview-arrow" ></use>
            </svg>
        </div>
        <div v-show="!isShowDetailBox" class="preview-content-switch content-switch-next" :class="{disable: currentTemplatesId.indexOf(this.template.id) == currentTemplatesId.length-1}" @click="templateSwitch(1)">
            <svg>
            <use xlink:href="#svg-preview-arrow" ></use>
            </svg>
        </div>
            <div class="image-detailBox"  v-show="isShowDetailBox" @mousemove="translateMove" @mouseup="translateEnd"  @wheel="mouseWheel" >
                <div class="mask" @click="hideDetailBox" ></div>
                    <div class="imgWraper" @click="hideDetailBox">
                        <img @dragstart="onImgDragstart" :style="imgStyle" @click.stop @mousedown="translateStart"  :src="zoomedImgUrl.replace(/800x800/,'')" alt="" >
                    </div>
                    <transition name="fade">
                        <div class="image-detailBox-close" @click="hideDetailBox" v-if="isShowBtn">
                            <svg>
                              <use xlink:href="#svg-preview-close" ></use>
                            </svg>
                        </div>
                    </transition>
                    <transition>
                        <div v-if="imageListLen > 1 && isShowBtn" class="switch switch-previous" :class="{disable: currentImgIndex === 0}"  @click="switchImage(currentImgIndex-1)">
                            <svg>
                              <use xlink:href="#svg-preview-arrow" ></use>
                            </svg>
                        </div>
                    </transition>
                    <transition>
                        <div v-if="imageListLen > 1 && isShowBtn" class="switch switch-next " :class="{disable: currentImgIndex === (imageList.length-1)}"  @click="switchImage(currentImgIndex+1)">
                            <svg>
                              <use xlink:href="#svg-preview-arrow" ></use>
                            </svg>
                        </div>
                    </transition>
                    <transition name="fade">
                        <div class="zoomTops" v-if="showTips">{{zoomTips}}</div>
                    </transition>
                </div>
            </div>
    </modal>
    `,
    mixins: [Ktu.mixins.templateHandler],
    name: 'previewPopup',
    props: {},
    data() {
        return {
            templateType: '',
            isShowMouseZoom: false,
            mouseBgPos: {
                left: 0,
                top: 0,
            },
            isShowDetailBox: false,
            translateX: 0,
            translateY: 0,
            zoom: 1,
            startPos: {
                left: 0,
                top: 0,
            },
            showTips: false,
            imageList: [],
            zoomedImgUrl: '',
            currentImgIndex: 0,
            size: {
                width: '',
                height: '',
                unit: '',
            },
            isLoadComplete: false,
            contentStyle: {
                width: 1029,
                height: 700,
            },
            isCollected: false,
            // 是否需要付钱
            isNeedPay: false,
            price: 0,
            isBusy: false,
            isLoaded: false,
            isShowBtn: true,
            balance: 0,
            previewTemplate: {},
            coinUrl: '',
            currentTemplateList: Ktu.store.state.data.currentTemplateList,
        };
    },
    computed: {
        // 宝贝详情页允许滚动
        canScroll() {
            return this.typeId == 205;
        },
        isPrivate() {
            return this.previewTemplate.isPrivate;
        },
        typeId() {
            return this.previewTemplate.typeId;
        },
        imageListLen() {
            return this.imageList.length;
        },
        zoomTips() {
            return `${Number(this.zoom * 100).toFixed(0)}%`;
        },
        imgStyle() {
            return {
                transform: `translate(${this.translateX}px,${this.translateY}px) scale(${this.zoom})`,
            };
        },
        imgMaxHeight() {
            return this.imageListLen > 1 ? {
                maxHeight: `${(parseInt(this.contentStyle.height, 10) - 60) * 0.48}px`,
            } : {};
        },

        // 按钮不可点击
        disable() {
            return this.isNeedPay && this.price > this.balance;
        },

        coinSrc() {
            return `${Ktu.initialData.resRoot}/image/manage/taskCenter/preview-coin.png`;
        },

        template() {
            return this.$store.state.data.template;
        },

        isReplaceAll() {
            return this.$store.state.data.isReplaceAll;
        },

        pageIdx() {
            return this.$store.state.data.pageIdx;
        },

        currentPageIndex() {
            return this.$store.state.data.currentPageIndex;
        },

        showModalChangeId: {
            get() {
                return this.$store.state.modal.showModalChangeId;
            },
            set(value) {
                this.$store.state.modal.showModalChangeId = value;
            },
        },

        showModalState: {
            get() {
                return this.$store.state.modal.showModalState;
            },
            set(value) {
                this.$store.state.modal.showModalState = value;
            },
        },

        currentTemplatesId() {
            if (this.currentTemplateList) {
                const currentTemplatesId = this.currentTemplateList.map(x => x.id);
                return currentTemplatesId;
            }
        },
    },
    created() {
        this.getShareInfo();
        /*
        // 获取用户的图币信息（更新比较稳妥）
        this.getCoinInfo();
        */
    },
    methods: {
        showBtn() {
            this.isShowBtn = true;
            if (this.timeOut) {
                clearTimeout(this.timeOut);
            }
            this.timeOut = setTimeout(() => {
                this.isShowBtn = false;
                clearTimeout(this.timeOut);
            }, 3000);
        },
        onImgLoad(index) {
            if (index === (this.imageList.length - 1)) {
                this.isLoaded = true;
            }
        },
        // 取消firefox下的默认拖拽行为
        onImgDragstart(e) {
            e.preventDefault();
        },
        // 切换预览的图片
        switchImage(index) {
            if (index < 0 || index > this.imageList.length - 1) {
                return;
            }
            this.currentImgIndex = index;
            this.zoomedImgUrl = this.imageList[index];
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
            this.showBtn();
            if (this.ismoving) {
                this.translateX = this.currentPos.x + event.pageX - this.startPos.x;
                this.translateY = this.currentPos.y + event.pageY - this.startPos.y;
            }
        },
        translateEnd(event) {
            this.ismoving = false;
        },
        showDetailBox(imgUrl, index) {
            this.currentImgIndex = index;
            this.zoomedImgUrl = imgUrl;
            this.isShowDetailBox = true;
        },
        hideDetailBox() {
            this.isShowDetailBox = false;
        },
        showMouseZoom() {
            this.isShowMouseZoom = true;
        },
        hideMouseZoom() {
            this.isShowMouseZoom = false;
        },
        // 取消收藏
        cancelCollectItem() {
            const url = '/ajax/ktuCollectTemplate_h.jsp?cmd=del';

            const params = {
                fromCaseId: this.previewTemplate.id,
            };

            axios.post(url, params).then(res => {
                const info = (res.data);

                if (info.success) {
                    this.isCollected = false;
                    const obj = {
                        value: false,
                        id: this.previewTemplate.id,
                    };
                    this.showModalState = obj;
                    this.$Notice.success(info.msg);
                    Ktu.log('collect', 'cancelFromModal');
                } else {
                    this.$Notice.warning(info.msg);
                }
            })
                .catch(err => {
                    this.$Notice.warning('取消收藏失败');
                })
                .finally(() => {
                    this.isBusy = false;
                });
        },
        // 收藏模板
        collectTemplate() {
            if (this.isBusy) {
                this.$Notice.warning('正在操作中，请稍候。');
                return;
            }

            this.isBusy = true;
            if (this.isCollected) {
                this.cancelCollectItem();
                return;
            }

            const url = '/ajax/ktuCollectTemplate_h.jsp?cmd=add';

            const params = {
                fromCaseId: this.previewTemplate.id,
                fromKtuAid: this.previewTemplate.ktuAid,
                fromKtuId: this.previewTemplate.ktuId,
                isFromPreview: true,
            };

            axios.post(url, params).then(res => {
                const info = (res.data);

                if (info.success) {
                    this.isCollected = true;
                    const obj = {
                        value: true,
                        id: this.previewTemplate.id,
                    };
                    this.showModalState = obj;
                    this.showModalChangeId = this.previewTemplate.id;
                    this.$Notice.success(info.msg);
                } else {
                    this.$Notice.warning(info.msg);
                }
            })
                .catch(err => {
                    this.$Notice.warning('收藏失败');
                })
                .finally(() => {
                    this.isBusy = false;
                });
        },
        // 获取模板类型
        getTemplateType(previewTemplate) {
            if (!!previewTemplate.behoof) {
                const typeNum = previewTemplate.behoof.split(',')[1];
                Ktu.allTemplateInfoList.forEach(item => {
                    if (item.id == typeNum) {
                        this.typeId = typeNum;
                        this.templateType = item.name;
                    }
                });
            }
        },
        // 获取模板信息(需要登陆)
        getShareInfo() {
            this.isLoadComplete = false;
            const url = `/ajax/ktuTemplate_h.jsp?cmd=getCaseInfo`;
            const params = {
                caseId: this.template.id,
                type: this.template.typeId,
                scenarioId: -1,
                kindId: -1,
                specialId: -1,
                keyword: '',
                isHome: 1,
            };

            axios.post(url, params).then(res => {
                if (res.data.success === true) {
                    const {
                        info,
                    } = res.data;
                    this.imageList = info.filePathList;
                    this.list = [];
                    let count = 0;

                    const onloadFn = () => {
                        count++;
                        if (count === (this.imageList.length)) {
                            this.isLoadComplete = true;
                        }
                    };
                    for (let i = 0; i < this.imageList.length; i++) {
                        this.list[i] = {};
                        this.list[i].img = new Image();
                        this.list[i].img.onload = onloadFn;
                        this.list[i].img.src = this.imageList[i];
                    }
                    this.designerName = info.designerName;
                    this.designerPortrait = info.designerPath;
                    this.size = info.size;
                    this.previewTemplate = info;
                    this.isCollected = info.isCollected;

                    /*
                    // 判断该模板用户是否需要兑换
                    if (info.needPay && !info.hasPay && info.tmprealprice > 0) {
                        this.isNeedPay = true;
                        this.price = info.tmprealprice;
                    } else {
                        this.isNeedPay = false;
                    }
                    */
                } else {
                    this.$Notice.warning(res.data.msg);
                }
            })
                .catch(err => {
                    this.$Notice.error(err);
                })
                .finally(() => {
                    /* 访问分享链接 区分正常 还是 异常 1-正常 2-异常
                       this.log(8000115, getInfo ? 1 : 2); */
                });
        },

        // 点击使用模板事件处理
        useTemplate() {
            if (this.disable) {
                this.$Notice.warning('图币余额不足');
                return;
            }

            const url = '../ajax/ktuCoin_h.jsp?cmd=exchangeTemplate';
            const params = {
                caseId: this.previewTemplate.id,
                fromAid: this.previewTemplate.ktuAid,
                fromId: this.previewTemplate.ktuId,
            };
            axios
                .post(url, params)
                .then(res => {
                    const {
                        data,
                    } = res;
                    if (data.success) {
                        this.isNeedPay = false;
                        this.showPreviewPopup = false;
                        if (this.isReplaceAll) {
                            this.replaceTemplates(this.template);
                        } else {
                            this.replaceTemplate(this.pageIdx, this.template, this.currentPageIndex);
                        }
                    } else {
                        this.$Notice.error(data.msg);
                    }
                })
                .catch(err => {
                    // this.$Notice.error(err);
                })
                .finally(() => {});
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

        // 获取图币
        getCoins() {
            this.showPreviewPopup = false;
            window.open(this.coinUrl);
        },

        getCoinInfo() {
            const token = $('#_TOKEN').attr('value');
            const url = `../ajax/ktuCoin_h.jsp?cmd=getAccountInfo&_TOKEN=${token}`;

            axios
                .get(url)
                .then(res => {
                    const {
                        data,
                    } = res;
                    if (data.success) {
                        this.balance = data.info.balance;
                        this.coinUrl = data.info.coinUrl;
                    }
                })
                .catch(err => {
                    this.$Notice.error(err);
                })
                .finally(() => {});
        },

        hideContent() {
            this.showPreviewPopup = false;
        },
        templateSwitch(num) {
            const currentIndex = this.currentTemplatesId.indexOf(this.template.id);
            if (num > 0 && currentIndex != this.currentTemplatesId.length - 1) {
                Ktu.store.state.data.template = this.currentTemplateList[currentIndex + 1];
                this.getShareInfo();
            } else if (num < 0 && currentIndex != 0) {
                Ktu.store.state.data.template = this.currentTemplateList[currentIndex - 1];
                this.getShareInfo();
            }
            $.getCacheScript(this.template.ktuFilePath, () => {
                this.asyncCallBack(this.pageIdx, this.template, this.currentPageIndex);
            });
        },
        async asyncCallBack(pageIdx, template, currentPageIndex) {
            // 使用模板需要过滤一些属性
            if (Ktu._jsData.tmpContents[0].content[0].objects) {
                for (const obj of Ktu._jsData.tmpContents[0].content[0].objects) {
                    await Ktu.element.objectFilter(obj);
                }
                this.$set(template, 'contents', Ktu._jsData.tmpContents);
            }
        },
    },
    mounted() {
        this.changeModalSize();
        window.addEventListener('resize', this.changeModalSize);
    },
    destroyed() {
        // document.body.style.overflow = 'auto';
        window.removeEventListener('resize', this.changeModalSize);
    },
});
