Vue.component('ele-qrCode-old', {
    template: `
        <div class="ele-qrCode-old">
            <div class="ele-qrCode-mask" v-show="qrIsTop" @click="closeEditor"></div>

            <div class="ele-qrCode-editor">
                <div class="ele-qrCode-head">
                    <h1 class="title">{{title}}</h1>
                    <div class="btn-close" @click="closeEditor">
                        <slot name="close">
                            <!-- <icon type="ios-close-empty" class="ktu-icon-ios-close-empty"></icon> -->
                            <svg class="svg-icon" width="12.5" height="12.4">
                                <use xlink:href="#svg-close-icon"></use>
                            </svg>
                        </slot>
                    </div>
                </div>

                <ul class="qrCode-nav">
                     <li
                        class="tab"
                        v-for="item in tabList"
                        :class="{'active': type === item.type}"
                        @click="chooseType(item.type)"
                    >
                        <span>{{item.name}}</span>
                    </li>
                    <svg class="tab-underline" :style="{transform:'translate(' + tabUnderlinePoi + 'px,0)'}">
                        <use xlink:href="#tab-underline"></use>
                    </svg>
                </ul>

                <div class="ele-qrCode-container">
                    <div class="qrCode-left">
                        <div class="qrCode-img" id="qrCode">
                            <p class="tip" v-if="tipShow">此处生成二维码</p>
                        </div>
                        <div class="qrCode-tip">{{tip}}</div>
                    </div>

                    <div class="qrCode-right">
                        <div class="qrCode-content">
                            <div class="qrCode-outside" v-show="type === 1">
                              <label class="qrCode-label" @click="handleOutsideUrlClick">
                                <input type="radio" name="url" class="qrCode-radio" :checked="outsideUrlChecked"/>
                                <span class="virtual-radio"></span>
                                <span class="text">外部链接</span>
                              </label>
                              <input
                                type="text"
                                id="outside-url"
                                v-model="url"
                                placeholder="输入网址http://"
                                maxlength="300"
                                @focus="handleOutsideUrlClick"
                                autocomplete="off"
                              />
                            </div>
                            <div class="qrCode-inside" v-show="type === 1">
                              <label class="qrCode-label" @click="handleInsideUrlClick">
                                <input
                                    type="radio"
                                    name="url"
                                    class="qrCode-radio"
                                    :checked="insideUrlChecked"
                                />
                                <span class="virtual-radio"></span>
                                <span class="text">内部链接</span>
                              </label>
                              <div class="inside-input-box">
                                <input
                                    class="insideUrl-input"
                                    type="text" id="inside-url"
                                    v-model="insideUrl"
                                    @focus="handleInsideUrlClick"
                                    autocomplete="off"
                                />
                                <button class="choose-inside-url" @click.stop="showEleCodeSelf">选择内链</button>
                              </div>
                            </div>

                            <div class="qrCode-vcard" v-show="type === 2">
                                <div class="input-group">
                                    <label for="name">姓名</label>
                                    <input type="text" placeholder="请输入您的姓名" id="name" v-model="name" maxlength="20" autocomplete="off"/>
                                </div>
                                <div class="input-group">
                                    <label for="job">职位</label>
                                    <input type="text" placeholder="请输入您的职位" id="job" v-model="job" maxlength="100" autocomplete="off"/>
                                </div>
                                <div class="input-group">
                                    <label for="telephone">手机</label>
                                    <input type="text" placeholder="请输入您的手机号码" id="telephone" v-model="telephone" maxlength="20" autocomplete="off"/>
                                </div>
                                <div class="input-group">
                                    <label for="cellphone">电话</label>
                                    <input type="text" placeholder="请输入您的电话号码" id="cellphone" v-model="cellphone" maxlength="20" autocomplete="off"/>
                                </div>
                                <div class="input-group">
                                    <label for="company">公司</label>
                                    <input type="text" placeholder="请输入您的公司名称" id="company" class="company" v-model="company" maxlength="100" autocomplete="off"/>
                                </div>
                            </div>

                            <div
                              v-show="type===3"
                              class="scan-pic"
                              :class="{'hover':isHoverScanPic && !scaning && !scaned,'large':scaned}"
                              @mouseenter="enterScanPic"
                              @mouseleave="leaveScanPic"
                              @click.stop="clickLocalUrl=false"
                              @mouseup="isHoverScanPic=false"
                            >
                                <label for="code-file" class="scan-pic-input before-scan" v-if="!scaning && !scaned" ></label>
                                <input
                                  id="code-file"
                                  style="display:none;"
                                  type="file"
                                  accept="image/*"
                                  title=""
                                  v-if="!scaning && !scaned"
                                  @change="scanImageChange"
                                >
                                <div class="svg-box" v-if="!scaning && !scaned">
                                  <svg class="scan-img" xmlns="http://www.w3.org/2000/svg">
                                      <image
                                        v-show="!isHoverScanPic"
                                        :xlink:href="scanImg"
                                        style="transform:translate(-11px,-9px);"
                                        x="0" y="0" height="500" width="70"

                                      />
                                        <image
                                        v-show="isHoverScanPic"
                                        :xlink:href="scanImg"
                                        style="transform:translate(-11px,-69px);"
                                        x="0" y="0" height="500" width="70"

                                      />
                                  </svg>
                                  <p class="text">上传二维码图片</p>
                                </div>
                                <div class="svg-box" v-if="scaning">
                                    <div class="scaning-svg-box">
                                        <svg class="move-thumb" xmlns="http://www.w3.org/2000/svg">
                                            <defs>
                                                <clipPath id="cut-rect">
                                                    <rect x="0" y="350" width="63" height="58" />
                                                </clipPath>
                                            </defs>
                                            <image
                                                :xlink:href="scanImg"
                                                style="clip-path:url(#cut-rect);transform:translate(-10px, -354px)"
                                                 x="0" y="0" height="500" width="70"
                                            />
                                        </svg>
                                        <svg class="scaning-img" xmlns="http://www.w3.org/2000/svg">
                                            <image
                                            :xlink:href="scanImg"
                                            style="transform:translate(-4px, -376px);"
                                             x="0" y="0" height="500" width="70"
                                            />

                                        </svg>
                                        <svg class="active-img" xmlns="http://www.w3.org/2000/svg" ref="activeSvg">
                                            <image
                                                :xlink:href="scanImg"
                                                style="transform:translate(-12px, -282px);"
                                                 x="0" y="0" height="500" width="70"
                                                ref="activeImage"
                                            />
                                        </svg>
                                        <svg class="inactive-img" xmlns="http://www.w3.org/2000/svg">
                                            <image
                                            :xlink:href="scanImg"
                                            style="transform:translate(-12px, -202px);"
                                             x="0" y="0" height="500" width="70"
                                            />
                                        </svg>
                                    </div>
                                    <p class="text scaning">识别中..</p>
                                </div>
                                <div class="svg-box" v-if="scaned">
                                  <svg class="scaned-img" xmlns="http://www.w3.org/2000/svg">
                                    <image
                                      :xlink:href="scanImg"
                                      style="transform:translate(-11px, -133px);"
                                       x="0" y="0" height="500" width="70"
                                    />
                                  </svg>
                                  <p class="text" :class="{'scaned':scaned}">
                                    <span class="scan-content">识别内容&nbsp;</span>
                                    <span class="localUrl-text" v-if="!clickLocalUrl" @click.stop="editLocalUrl" ref="localUrlSpan">{{localUrl}}</span>
                                    <input
                                        v-else
                                        class="local-url-input"
                                        :value="localUrl"
                                        autofocus="autofocus"
                                        @blur="clickLocalUrl=false"
                                        @click.stop
                                        ref="localUrlInput"
                                        autocomplete="off"
                                    />
                                  </p>
                                  <div class="upload-again-box">
                                    <p class="upload-again">
                                      <label for="code-file" class="scan-pic-input after-scan" v-if="scaned" @change="scanImageChange">
                                        <svg>
                                          <use xlink:href="#svg-ele-refresh"></use>
                                        </svg>
                                        重新上传
                                      </label>
                                      <input
                                        id="code-file"
                                        style="display:none;"
                                        type="file"
                                        accept="image/*"
                                        title=""
                                        v-if="scaned"
                                        @change="scanImageChange"
                                      >
                                    </p>
                                  </div>
                                </div>
                            </div>
                        </div>
                        <div class="qrCode-tool" v-if="colorShow">
                            <div class="qrCode-foreground">
                                <label class="tip">前景色</label>
                                <color-picker
                                    :value="foreground"
                                    @input="selectForeground"
                                    class="qrCode-picker bg-color-picker"
                                    :themePickerShow="true"
                                    :colorPickerShow="false"
                                    :direction="direction"
                                    colorType="foregroundColor"
                                    logType="qrCodeStyle"
                                ></color-picker>
                            </div>
                            <div class="qrCode-background">
                                <label class="tip">背景色</label>
                                <color-picker
                                    :value="background"
                                    @input="selectBackground"
                                    class="qrCode-picker bg-color-picker"
                                    :themePickerShow="true"
                                    :colorPickerShow="false"
                                    :showQrCodeTip="true"
                                    :direction="direction"
                                    colorType="backgroundColor"
                                    logType="qrCodeStyle"
                                ></color-picker>
                            </div>

                            <div class="qrCode-upload">
                                <span>{{logoText}}</span>
                                <input @click="jumptoUpload($event)" type="file" ref="file" id="file"/>
                            </div>

                            <div class="qrCode-remove" v-if="logo" @click="removeLogo">移除logo</div>
                        </div>
                    </div>
                </div>
                <div class="ele-qrCode-foot">
                    <div class="btn applyBtn" :class="{'disableBtn': disableBtn}" @click="addToCanvas">{{btnTitle}}</div>
                    <div class="btn cancelBtn" @click="closeEditor">取消</div>
                </div>

                <!-- 微传单、互动营销弹框 -->
                <transition name="fade">
                  <div class="ele-code-self-mask" v-if="showCodeFromSelf" ref="eleCodeSelf" @click.stop="closeEditor"></div>
                </transition>
                <transition name="fade">
                  <div class="code-self-wrapper" :class="{'active': showCodeFromSelf}" v-if="showCodeFromSelf">
                    <div class="code-self-head">
                      <h1 class="title">本帐号中选择</h1>
                      <div class="btn-close" @click="closeEditor">
                        <slot name="close">
                            <svg class="svg-icon" width="12.5" height="12.4">
                                <use xlink:href="#svg-close-icon"></use>
                            </svg>
                        </slot>
                      </div>
                    </div>
                    <div class="product-type">
                      <div
                        v-for="item in insideUrlTabList"
                        :key="item.type"
                        class="tabs"
                        :class="{'flyer': item.type === 1, 'game': item.type === 2, 'active': tabType === item.type}"
                        @click="chooseInsideType(item.type)"
                      >
                        {{item.name}}
                      </div>
                    </div>
                    <div
                        class="product-list"
                        @scroll="productScrollLoad"
                        ref="productContainer" >
                      <div class="flyer-list" ref="flyerSlider">
                          <div
                            v-show="tabType===1"
                            class="product-item flyer"
                            v-for="item in flyerList"
                            :class="{'activeProduct': flyerId === item.id}"
                             @click="chooseFlyer(item)"
                          >
                              <div class="product-left">
                                  <div class="product-img">
                                      <img :src="waterItemImg(item.coverPath)"/>
                                  </div>
                              </div>
                              <div class="product-right">
                                  <p class="title">{{item.title}}</p>
                                  <p class="desc">{{item.dec}}</p>
                              </div>
                          </div>
                      </div>
                      <div class="game-list" ref="gameSlider">
                          <div
                            v-show="tabType===2"
                            class="product-item game"
                            v-for="item in gameList"
                            :class="{'activeProduct': gameId === item.id}"
                             @click="chooseGame(item)"
                          >
                              <div class="product-left">
                                  <div class="product-img">
                                      <img :src="item.img"/>
                                  </div>
                              </div>
                              <div class="product-right">
                                  <p class="title">{{item.name}}</p>
                                  <p class="desc">{{item.typeName}}</p>
                              </div>
                          </div>
                      </div>

                      <div class="noData" v-if="noDataShow">
                          <img :src="noDataImg"/>
                          <p class="noData-tip">{{noDataTip}}</p>
                      </div>
                    </div>
                    <div class="code-self-footer">
                      <div
                        class="btn applyBtn code-self-btn"
                        :class="{'disableBtn':JSON.stringify(tempSelectedWork)==='{}'}"
                        @click.stop="selectWork"
                      >确认</div>
                      <div class="btn cancelBtn code-self-btn" @click.stop="closeEditor">取消</div>
                    </div>
                  </div>
                </transition>
            </div>
        </div>
    `,
    data() {
        return {
            tabList: [
                {
                    name: '链接',
                    svgId: '#svg-ele-link',
                    type: 1,
                },
                {
                    name: '名片',
                    svgId: '#svg-ele-card',
                    type: 2,
                },
                {
                    name: '从图片识别',
                    svgId: '#svg-ele-scan',
                    type: 3,
                },
            ],
            type: 1,

            logo: '',

            url: '',
            // 从图片识别的url
            localUrl: '',
            name: '',
            job: '',
            cellphone: '',
            telephone: '',
            company: '',

            flyerList: [],
            flyerIndex: 0,
            flyerId: 0,
            selectedFlyer: {},

            gameList: [],
            gameIndex: 0,
            gameId: 0,
            selectedGame: {},
            // 用于还没确认选择时记住点击的作品
            tempSelectedWork: {},
            // 用于记住选择的tab
            selectedTab: 1,

            flyerLoadedAll: false,
            gameLoadedAll: false,
            isLoading: false,

            noFlyerImg: `${Ktu.initialData.resRoot}/image/editor/qrCode/noFlyer.jpg`,
            noDataImg: `${Ktu.initialData.resRoot}/image/editor/qrCode/noData.png`,

            scanImg: `${Ktu.initialData.resRoot}/image/editor/qrCode/scanOld.png`,

            foreground: '#000',
            background: '#fff',

            qrCode: '',

            disableBtn: true,
            updateState: true,

            insideUrl: '',
            // 二维码由内链生成
            insideUrlChecked: false,
            // 二维码由外链生成
            outsideUrlChecked: false,
            // 控制选择二维码的弹框显示
            showCodeFromSelf: false,

            insideUrlTabList: [
                {
                    name: '微传单',
                    type: 1,
                },
                {
                    name: '互动营销',
                    type: 2,
                },
            ],
            // 点击内部链接时弹框内的tab
            tabType: 1,

            isHoverScanPic: false,
            scaning: false,
            scaned: false,
            scanImage: {},
            clickLocalUrl: false,

            codeType: '',
            codeTypeTab: '',

            // 用来记录图片的数据是否改变
            index: 0,
            logoText: '添加logo',
            direction: 'up',
            // 切换颜色节流
            backgroundTimer: null,
            foregroundTimer: null,
            qrCodeSize: 800,
        };
    },
    computed: {
        title() {
            if (this.qrCodeEditor.type === 'update') {
                return '更改二维码';
            }
            return '添加二维码';
        },

        btnTitle() {
            if (this.qrCodeEditor.type === 'update') {
                return '更改完成';
            }
            return '应用到画板';
        },

        tip() {
            return '实时预览更新';
        },

        noDataTip() {
            if (this.tabType === 1) {
                return '您还没有微传单去创建一个吧~';
            }
            return '您还没互动营销去创建一个吧~';
        },
        // 是否显示二维码编辑页
        qrCodeEditor: {
            get() {
                return this.$store.state.base.qrCodeEditor;
            },
            set(value) {
                this.$store.state.base.qrCodeEditor = value;
            },
        },

        // 没有数据的时候
        noDataShow() {
            if (this.type === 2 || this.type === 3) {
                return false;
            }
            if (this.isLoading) {
                return false;
            } else if ((this.tabType === 1 && this.flyerList.length <= 0) || (this.tabType === 2 && this.gameList.length <= 0)) {
                return true;
            }

            return false;
        },

        colorShow() {
            if (this.type === 1 || this.type === 2 || this.type === 3) {
                return true;
            }
            return false;
        },

        selectedData() {
            if (Ktu.store.state.data.selectedData) {
                return Ktu.store.state.data.selectedData;
            }
            return {};
        },

        oldData() {
            if (Ktu.store.state.data.selectedData) {
                return Ktu.store.state.data.selectedData.msg;
            }
            return {};
        },

        // 此处生成二维码的提示
        tipShow() {
            if (this.qrCode) {
                return false;
            }
            return true;
        },

        ratio() {
            // 主要设计图是用208（更新的情况下取原有的阈值）
            if (this.qrCodeEditor.type === 'update' && this.oldData) {
                return this.oldData.ratio;
            }
            return (this.qrCodeSize / 208).toFixed(4);
        },

        // 判断是否为设计师账号
        isUiManage() {
            return Ktu.isUIManage;
        },

        isThirdDesigner() {
            return Ktu.isThirdDesigner;
        },

        changeImgData() {
            return this.$store.state.data.showLogoImgData;
        },
        qrIsTop: {
            get() {
                return this.$store.state.base.qrIsTop;
            },
            set(value) {
                this.$store.state.base.qrIsTop = value;
            },
        },
        tabUnderlinePoi() {
            switch (this.type) {
                case 1:
                    return 0;
                case 2:
                    return 75;
                case 3:
                    return 172;
            }
        },
        isOpenUtilModal: {
            get() {
                return this.$store.state.base.isOpenUtilModal;
            },
            set(value) {
                this.$store.state.base.isOpenUtilModal = value;
            },
        },
    },
    watch: {
        qrCode() {
            if (this.qrCode === '') {
                this.disableBtn = true;
            }
        },
        url() {
            this.formatUrl();
        },
        insideUrl() {
            this.createQrCode();
        },
        name() {
            this.createQrCode();
        },
        job() {
            this.createQrCode();
        },
        cellphone() {
            this.createQrCode();
        },
        telephone() {
            this.createQrCode();
        },
        company() {
            this.createQrCode();
        },
        scanImage(value) {
            if (JSON.stringify(value) !== '{}') {
                this.scaning = true;
            }
        },
        changeImgData(value, oldValue) {
            // 监听到值变化时调用dealImg函数
            this.dealImg(value.p160p);
        },
    },
    mounted() {
        this.isOpenUtilModal = true;

        if (this.qrCodeEditor.type === 'update') {
            console.log(this.oldData);
            this.type = this.oldData.type;
            this.foreground = this.oldData.foreground;
            this.background = this.oldData.background;
            this.logo = this.oldData.logo;

            if (this.type === 1 && !this.oldData.flyer && !this.oldData.game) {
                this.url = this.oldData.url;
                this.outsideUrlChecked = true;
            } else if (
                (this.type === 1 && this.oldData.flyer)
                || (this.type === 1 && this.oldData.game)
                || (this.type === 3 && this.oldData.flyer)
                || (this.type === 4 && this.oldData.game)
            ) {
                this.type = 1;
                this.insideUrlChecked = true;
                if (this.oldData.flyer) {
                    this.tabType = 1;
                    this.selectedTab = 1;
                    this.selectedFlyer = this.oldData.flyer;
                    this.flyerId = this.selectedFlyer.id;
                    this.insideUrl = this.selectedFlyer.url;
                } else {
                    this.tabType = 2;
                    this.selectedTab = 2;
                    this.selectedGame = this.oldData.game;
                    this.gameId = this.selectedGame.id;
                    this.insideUrl = this.selectedGame.url;
                }
            } else if (this.type === 2) {
                this.name = this.oldData.name;
                this.job = this.oldData.job;
                this.telephone = this.oldData.telephone;
                this.cellphone = this.oldData.cellphone;
                this.company = this.oldData.company;
            } else if (this.type === 3 && !this.oldData.flyer && !this.oldData.game) {
                this.localUrl = this.oldData.localUrl;
                this.scaned = true;
            }
            this.chooseType(this.type);
        } else {
            this.chooseType(this.type);
        }

        if (this.logo) {
            this.logoText = '更换logo';
        }
    },
    destroyed() {
        this.isOpenUtilModal = false;
    },
    methods: {
        // 关闭二维码编辑器
        closeEditor(event) {
            if (event && typeof event.target.className === 'string') {
                if (event.target.className.includes('fade')) return;
            }

            if (this.showCodeFromSelf) {
                this.showCodeFromSelf = false;
                this.tabType = this.selectedTab;
            } else {
                this.qrCodeEditor.show = false;
            }
        },

        // 使用图片
        waterItemImg(path) {
            let imgPath = path;
            if (imgPath) {
                if (this.$store.state.base.isSupportWebp) {
                    imgPath = Ktu.getWebpOrOtherImg(imgPath);
                }
            } else {
                imgPath = this.noFlyerImg;
            }

            return imgPath;
        },

        // 选择前景色
        selectForeground(value) {
            this.foreground = value;
            this.foregroundTimer && clearTimeout(this.foregroundTimer);
            this.foregroundTimer = setTimeout(this.createQrCode, 20);
        },

        // 选择背景色
        selectBackground(value) {
            this.background = value;
            this.backgroundTimer && clearTimeout(this.backgroundTimer);
            this.backgroundTimer = setTimeout(this.createQrCode, 20);
        },

        // 选择二维码类型
        chooseType(value) {
            // 清空缓存二维码信息
            $('#qrCode img') && $('#qrCode img').remove();

            this.type = value;

            // 设计师当是外链时有默认值
            if (this.type === 1 && (this.isUiManage || this.isThirdDesigner) && this.url === '') {
                this.url = 'fkw.com';
                this.outsideUrlChecked = true;
                this.codeTypeTab = 'link';
            } else if (this.type === 1) {
                this.codeTypeTab = 'link';
            } else if (this.type === 2) {
                this.codeTypeTab = 'card';
            } else if (this.type === 3) {
                this.codeTypeTab = 'scan';
            }
            this.chooseInsideType(this.tabType);

            Ktu.simpleLog('ceateQrCode', this.codeTypeTab);
            this.createQrCode();
        },

        chooseInsideType(value) {
            if (this.tabType !== value) {
                this.gameId = 0;
                this.flyerId = 0;
                this.tempSelectedWork = {};
                this.tabType = value;
            }

            if (this.tabType === 1 && this.flyerList.length <= 0) {
                this.requestFlyer();
            } else if (this.tabType === 2 && this.gameList.length <= 0) {
                this.requestGame();
            }
        },

        // 选择上传的logo
        chooseLogo() {
            const file = this.$refs.file.files[0];

            if (file) {
                const reader = new FileReader();

                const that = this;
                reader.onload = function () {
                    that.dealImg(this.result);
                };
                reader.readAsDataURL(file);
            }
        },

        // 打开素材库
        jumptoUpload(e) {
            e.preventDefault();
            /* 触发vuex中的事件
               this.$store.commit('data/changeLogoImgType', 'QrCode') */
            this.$store.commit('modal/imageSourceModalState', {
                isOpen: true,
                props: {
                    modelMask: false,
                },
            });
            this.qrIsTop = false;
        },

        // 移除logo
        removeLogo() {
            const { file } = this.$refs;
            file.value = '';

            this.logo = '';
            this.createQrCode();
            this.logoText = '添加logo';
        },

        // 处理图片
        dealImg(data) {
            console.log(data, 'xxx');
            this.index++;
            const img = new Image();
            // 防止图片收到污染
            img.src = `${data}?${this.index}`;
            /* console.log(img.src);
               处理图片跨域，也是污染问题 */
            img.setAttribute('crossOrigin', 'anonymous');
            img.onload = () => {
                const imgCanvas = document.createElement('canvas');
                const imgCtx = imgCanvas.getContext('2d');
                imgCanvas.width = 54 * this.ratio;
                imgCanvas.height = 54 * this.ratio;
                imgCtx.drawImage(img, 0, 0, img.width, img.height, 0, 0, imgCanvas.width, imgCanvas.height);

                const image = new Image();
                image.setAttribute('crossOrigin', 'anonymous');
                image.src = imgCanvas.toDataURL();
                image.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = 54 * this.ratio;
                    canvas.height = 54 * this.ratio;

                    const pattern = ctx.createPattern(image, 'no-repeat');
                    this.drawRoundRect(ctx, 0, 0, image.width, image.height, 4 * this.ratio);
                    ctx.fillStyle = pattern;
                    ctx.fill();

                    const logo = new Image();
                    logo.setAttribute('crossOrigin', 'anonymous');
                    logo.src = canvas.toDataURL();
                    logo.onload = () => {
                        const logoCanvas = document.createElement('canvas');
                        const logoCtx = logoCanvas.getContext('2d');
                        logoCanvas.width = 62 * this.ratio;
                        logoCanvas.height = 62 * this.ratio;

                        this.drawRoundRect(logoCtx, 0, 0, logoCanvas.width, logoCanvas.height, 4 * this.ratio);
                        logoCtx.fillStyle = '#fff';
                        logoCtx.fill();

                        this.drawRoundRect(logoCtx, 4 * this.ratio, 4 * this.ratio, imgCanvas.width, imgCanvas.height, 4 * this.ratio);
                        logoCtx.strokeStyle = '#888';
                        logoCtx.lineWidth = 0.5;
                        logoCtx.stroke();

                        logoCtx.drawImage(logo, 0, 0, imgCanvas.width, imgCanvas.height, 4 * this.ratio, 4 * this.ratio, imgCanvas.width, imgCanvas.height);

                        this.logo = logoCanvas.toDataURL();
                        this.createQrCode();
                        this.logoText = '更换logo';
                    };
                };
            };
        },

        // 描绘圆角矩形
        drawRoundRect(content, x, y, w, h, r) {
            const minSize = Math.min(w, h);
            if (r > minSize / 2) r = minSize / 2;
            // 开始绘制
            content.beginPath();
            content.moveTo(x + r, y);
            content.arcTo(x + w, y, x + w, y + h, r);
            content.arcTo(x + w, y + h, x, y + h, r);
            content.arcTo(x, y + h, x, y, r);
            content.arcTo(x, y, x + w, y, r);
            content.closePath();
        },

        // 选择的微传单
        chooseFlyer(value) {
            if (this.tempSelectedWork.id === value.id) {
                this.flyerId = 0;
                this.tempSelectedWork = {};
                return;
            }
            this.flyerId = value.id;
            this.tempSelectedWork = value;
        },

        // 选择的互动营销
        chooseGame(value) {
            if (this.tempSelectedWork.id === value.id) {
                this.gameId = 0;
                this.tempSelectedWork = {};
                return;
            }
            this.gameId = value.id;
            this.tempSelectedWork = value;
        },

        // 格式化url，去掉空格
        formatUrl() {
            this.url = this.url.replace(/(^\s*)|(\s*$)/g, '');
            this.createQrCode();
        },

        // 生成二维码
        createQrCode() {
            this.$nextTick(() => {
                this.createQrCodeImg();
            });
        },

        createQrCodeImg() {
            // 创建新的二维码需要清空旧的
            $('#qrCode img') && $('#qrCode img').remove();

            let text = '';
            const that = this;

            if ((this.type === 1 && !this.insideUrlChecked) || this.type === 3) {
                let url = this.type === 1 ? this.url : this.localUrl;
                if (!url || url === '') {
                    this.qrCode = '';
                    return;
                }
                if (url.indexOf('payapp.weixin.qq.com/aa/') > -1) {
                    text = '';
                } else {
                    if (url.indexOf('http://') < 0 && url.indexOf('https://') < 0) {
                        url = `http://${url}`;
                    }
                }

                text = url;
                this.codeType = this.type === 1 ? 'outside_link' : 'scan';
            } else if (this.type === 1 && this.insideUrlChecked) {
                if (this.tabType === 1) {
                    this.insideUrl = this.selectedFlyer.url;
                    text = this.selectedFlyer.url;
                    this.codeType = 'inside_link';
                } else if (this.tabType === 2) {
                    this.insideUrl = this.selectedGame.url;
                    text = this.selectedGame.url;
                    this.codeType = 'inside_link';
                }
            } else if (this.type === 2) {
                if (this.name === '' && this.job === '' && this.telephone === '' && this.cellphone === '' && this.company === '') {
                    this.qrCode = '';
                    return;
                }
                text
                    = `BEGIN:VCARD \r\nFN:${
                        this.name
                    }\r\nTITLE:${
                        this.job
                    } \r\nTEL;WORK,VOICE:${
                        this.telephone
                    }\r\nTEL;CELL,VOICE:${
                        this.cellphone
                    }\r\nORG:${
                        this.company
                    }\r\nEND:VCARD`;
                this.codeType = 'card';
            } else {
                return;
            }

            if (!text) {
                return;
            }
            // 创建dom节点保存二维码信息
            const qr = $('<div></div>');
            qr.qrcode(
                {
                    render: 'canvas',
                    text,
                    // 二维码的宽度
                    width: this.qrCodeSize - 16 * this.ratio,
                    // 二维码的高度
                    height: this.qrCodeSize - 16 * this.ratio,
                    // 二维码中间的图片
                    src: this.logo,
                    imgWidth: 58 * this.ratio,
                    imgHeight: 58 * this.ratio,
                    // 二维码的后景色
                    background: this.background,
                    // 二维码的前景色
                    foreground: this.foreground,
                },
                callback
            );

            // 这里存在当有logo的时候存在异步回调
            if (!this.logo) {
                callback();
            }

            function callback() {
                const canvas = qr.find('canvas').get(0);
                that.createBorder(canvas.toDataURL());
            }
        },

        // 更新二维码
        updateQrCode() {
            if (!this.selectedData.type) return;
            this.selectedData.saveState();
            this.selectedData.src = this.qrCode;
            this.selectedData.base64 = this.qrCode;
            const msg = this.recordMsg();
            this.selectedData.msg = msg;
            this.selectedData.dirty = true;
            this.selectedData.modifiedState();
        },

        // 生成一个新的二维码对象
        createQrCodeObj() {
            const msg = this.recordMsg();
            const obj = {
                type: 'qr-code',
                src: this.qrCode,
                msg,
                elementName: '二维码',
                width: this.qrCodeSize,
                height: this.qrCodeSize,
                canCollect: true,
                category: 20,
                isCollect: false,
            };
            Ktu.element.addModule('qrCode', obj);
        },

        // 给二维码添加白色边框
        createBorder(data) {
            const image = new Image();
            image.src = data;

            image.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // 获取当前canvas二维码最终大小
                canvas.width = this.qrCodeSize;
                canvas.height = this.qrCodeSize;

                ctx.fillStyle = this.background;
                // 画圆角
                this.drawRoundRect(ctx, 0, 0, canvas.width, canvas.height, 4 * this.ratio);
                ctx.fill();

                ctx.drawImage(image, 0, 0, image.width, image.height, 8 * this.ratio, 8 * this.ratio, image.width, image.height);
                this.qrCode = canvas.toDataURL();

                // 更换div显示的二维码
                const img = new Image();
                img.src = this.qrCode;

                img.onload = () => {
                    $('#qrCode img').remove();
                    $('#qrCode').append(img);

                    // 这里主要用于判断是否修改过
                    if (this.updateState) {
                        this.disableBtn = false;
                    }
                    this.updateState = true;
                };
                // this.updateQrCode();
            };
        },

        // 记录二维码信息
        recordMsg() {
            const msg = {};
            msg.type = this.type;
            msg.foreground = this.foreground;
            msg.background = this.background;
            msg.logo = this.logo;
            msg.ratio = this.ratio;

            if (this.type === 1 && !this.insideUrlChecked) {
                msg.url = this.url;
            } else if (this.type === 1 && this.insideUrlChecked) {
                if (this.selectedTab === 1) {
                    msg.flyer = this.selectedFlyer;
                } else if (this.selectedTab === 2) {
                    msg.game = this.selectedGame;
                }
            } else if (this.type === 2) {
                msg.name = this.name;
                msg.job = this.job;
                msg.cellphone = this.cellphone;
                msg.telephone = this.telephone;
                msg.company = this.company;
            } else if (this.type === 3) {
                msg.localUrl = this.localUrl;
            }
            return msg;
        },

        // 添加到画布
        addToCanvas() {
            if (this.disableBtn || !this.qrCodeEditor.show) {
                return;
            }
            if (this.qrCodeEditor.type === 'update') {
                this.updateQrCode();
            } else {
                this.createQrCodeObj();
            }
            this.closeEditor();

            Ktu.log('qrCodeModal', this.codeType);
        },

        // 请求微传单数据
        requestFlyer() {
            this.isLoading = true;

            const url = '../ajax/qrcode_h.jsp?cmd=getFlyerListOnlyNormal';

            axios
                .post(url, {
                    scrollIndex: this.flyerIndex,
                    isInit: true,
                    isForQrCode: true,
                })
                .then(res => {
                    const info = res.data;

                    if (info.success) {
                        const tmpArr = info.data;
                        this.flyerList = [...this.flyerList, ...tmpArr];
                        // this.flyerList = [];

                        // 当请求回来的数据不足20条则加载完毕
                        if (tmpArr.length < 20) {
                            this.flyerLoadedAll = true;
                        }
                    }
                })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },

        // 请求互动营销数据
        requestGame() {
            this.isLoading = true;

            const url = '../ajax/qrcode_h.jsp?cmd=getHDgames';

            axios
                .post(url, {
                    scrollIndex: this.gameIndex,
                })
                .then(res => {
                    const info = res.data;
                    if (info.success) {
                        const tmpArr = info.data;
                        this.gameList = [...this.gameList, ...tmpArr];
                        // this.gameList = [];

                        // 当请求回来的数据不足20条则加载完毕
                        if (tmpArr.length < 20) {
                            this.gameLoadedAll = true;
                        }
                    }
                })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },

        // 滚动加载微传单数据
        flyerScrollLoad() {
            this.flyerScrollTimer && window.clearTimeout(this.flyerScrollTimer);
            this.flyerScrollTimer = window.setTimeout(() => {
                // 加载完毕 返回
                if (this.flyerLoadedAll) return false;

                const container = this.$refs.productContainer;
                const slide = this.$refs.flyerSlider;
                if (!this.isLoading && container.scrollTop + container.clientHeight >= slide.clientHeight) {
                    // this.isLoading = true;
                    this.flyerIndex++;
                    this.requestFlyer();
                }
            }, 50);
        },

        // 滚动加载互动营销数据
        gameScrollLoad() {
            this.gameScrollTimer && window.clearTimeout(this.gameScrollTimer);
            this.gameScrollTimer = window.setTimeout(() => {
                // 加载完毕 返回
                if (this.gameLoadedAll) return false;

                const container = this.$refs.productContainer;
                const slide = this.$refs.gameSlider;
                if (!this.isLoading && container.scrollTop + container.clientHeight >= slide.clientHeight) {
                    // this.isLoading = true;
                    this.gameIndex++;
                    this.requestGame();
                }
            }, 50);
        },

        productScrollLoad() {
            if (this.tabType === 1) {
                this.flyerScrollLoad();
            } else {
                this.gameScrollLoad();
            }
        },

        handleOutsideUrlClick() {
            this.insideUrlChecked = false;
            this.outsideUrlChecked = true;
            if (!this.outsideUrl) {
                this.qrCode = '';
            }
            this.createQrCode();
        },
        handleInsideUrlClick() {
            this.outsideUrlChecked = false;
            this.insideUrlChecked = true;
            if (!this.insideUrl) {
                this.qrCode = '';
            }
            this.createQrCode();
        },

        // 选择内链
        showEleCodeSelf() {
            this.showCodeFromSelf = true;
            /* this.outsideUrlChecked = false;
               this.insideUrlChecked = true; */

            if (this.flyerId !== '') {
                this.tempSelectedWork = this.selectedFlyer;
            }
            if (this.flyerId !== '') {
                this.tempSelectedWork = this.selectedGame;
            }

            if (this.tabType === 1) {
                this.flyerId = this.selectedFlyer.id;
            } else {
                this.gameId = this.selectedGame.id;
            }

            this.$nextTick(() => {
                const activeProduct = $('.activeProduct');
                if (activeProduct.length > 0) {
                    const activeProductTop = activeProduct.position().top;
                    activeProduct
                        .parent()
                        .parent()
                        .scrollTop(activeProductTop);
                }
            });
        },

        // 确认选择时才记住选择的产品
        selectWork() {
            if (!this.tempSelectedWork.url) return;
            if (this.showCodeFromSelf === true) this.showCodeFromSelf = false;
            if (this.tabType === 1) {
                this.selectedFlyer = this.tempSelectedWork;
            } else {
                this.selectedGame = this.tempSelectedWork;
            }
            this.selectedTab = this.tabType;
            this.insideUrlChecked = true;
            this.createQrCode();
        },

        enterScanPic() {
            this.isHoverScanPic = true;
        },
        leaveScanPic(e) {
            if (e.target.className.includes('scan-pic')) {
                this.isHoverScanPic = false;
            }
        },
        // 图片识别成功点击链接
        editLocalUrl() {
            this.clickLocalUrl = true;
            const width = this.$refs.localUrlSpan.clientWidth;

            Vue.nextTick(() => {
                const { localUrlInput } = this.$refs;
                localUrlInput.select();
                localUrlInput.style.width = `${width}px`;
            });
        },
        // 扫默图片
        scanImageChange(e) {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                this.scanImageFunc(file);
            }
        },
        scanImageFunc(file) {
            const _this = this;

            this.scaning = true;
            this.scaned = false;

            const $canvas = $('<canvas></canvas>')[0];
            const context = $canvas.getContext('2d');
            const img = new Image();

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function (e) {
                img.src = e.target.result;
            };

            img.onload = function () {
                $canvas.width = this.width;
                $canvas.height = this.height;

                context.clearRect(0, 0, this.width, this.height);

                const imageData = context.getImageData(0, 0, this.width, this.height).data;

                const isAlphaBackground = _this.isAlphaBackground(imageData);

                if (isAlphaBackground) {
                    // 如果是透明背景的二维码图片就加一个白底
                    context.fillStyle = '#ffffff';
                    context.fillRect(0, 0, $canvas.width, $canvas.height);
                    context.drawImage(img, 0, 0);
                } else {
                    context.drawImage(img, 0, 0);
                }

                qrDecode.decodeByUrl($canvas.toDataURL(), (err, txt) => {
                    setTimeout(() => {
                        if (err) {
                            _this.scaning = false;
                            _this.localUrl ? (_this.scaned = true) : (_this.scaned = false);
                            _this.$Notice.warning('无法识别，请上传清晰的二维码图片。');
                            return;
                        }

                        _this.scaning = false;
                        _this.scaned = true;
                        _this.localUrl = txt;

                        _this.createQrCode();
                    }, 2000);
                });
            };
        },
        // 判断图片是否透明背景
        isAlphaBackground(imageData) {
            let isAlphaBackground = false;
            for (let index = 3; index < imageData.length; index += 4) {
                if (imageData[index] != 255) {
                    isAlphaBackground = true;
                    break;
                }
            }
            return isAlphaBackground;
        },
    },
});
