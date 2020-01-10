Vue.component('ele-qrCode', {
    template: `
        <div class="ele-qrCode">
            <div class="ele-qrCode-mask" v-show="qrIsTop" @click="closeEditor"></div>

            <div class="ele-qrCode-editor" :style="{'overflow':editorOverflow}">
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
                        @click="chooseType(item.type, $event)"
                    >
                        <svg class="qrCode-nav-svg">
                            <use :xlink:href="item.svgId"></use>
                        </svg>
                        <span>{{item.name}}</span>
                    </li>
                    <svg class="tab-underline" :style="{transform:'translate(' + tabUnderlinePoi + 'px,0)'}">
                        <use xlink:href="#tab-underline"></use>
                    </svg>
                </ul>

                <div class="ele-qrCode-container">
                    <div class="qrCode-left">
                        <div class="qrCode-img" id="qrCode" ref="qrCodeImg">
                            <div class="creating" v-show="isCreatingEleArt">
                                <div class="loading-box-left loading-box">
                                    <svg>
                                        <use xlink:href="#svg-loading"></use>
                                    </svg>
                                </div>
                                <div class="text">
                                    <p>生成中</p>
                                </div>
                            </div>
                            <p class="tip" v-if="tipShow">此处生成二维码</p>
                        </div>
                        <div :class="['qrCode-tip', {'creating-tip': isCreatingEleArt}]">
                            <span @click="cancelGenArtQrCode">{{tip}}</span>
                        </div>
                    </div>

                    <div class="qrCode-right">
                        <div class="qrCode-content">
                            <div class="qrCode-url" v-show="type === 1">
                                <label class="qrCode-label" for="url">
                                    <span class="text">输入链接</span>
                                </label>
                                <input
                                    :class="{'placeholder': isSpecialPlaceHolder}"
                                    id="url"
                                    type="text"
                                    v-model="url"
                                    placeholder="输入网址http://"
                                    maxlength="300"
                                    autocomplete="off"
                                    ref="linkRef"
                                    @blur="textInputBlur"
                                    @input="changeUrl"
                                />
                                <div class="vt-line"></div>
                                <div class="inside-url" @click.stop="showEleCodeSelf">
                                    <svg class="link-icon">
                                        <use xlink:href="#svg-ele-link"></use>
                                    </svg>
                                    <span>选择内链</span>
                                </div>
                            </div>

                            <div class="qrCode-vcard" v-show="type === 2">
                                <div class="input-group">
                                    <label for="name"><span>姓</span><span>名：</span></label>
                                    <input
                                        :class="{'placeholder': isSpecialPlaceHolder}"
                                        type="text"
                                        placeholder="请输入您的姓名"
                                        id="name"
                                        v-model="name"
                                        maxlength="20"
                                        autocomplete="off"
                                        ref="nameRef"
                                        @blur="textInputBlur"
                                    />
                                </div>
                                <div class="input-group">
                                    <label for="job"><span>职</span><span>位：</span></label>
                                    <input type="text" placeholder="请输入您的职位" id="job" v-model="job" maxlength="100" autocomplete="off"/>
                                </div>
                                <div class="input-group">
                                    <label for="telephone"><span>手</span><span>机：</span></label>
                                    <input type="text" placeholder="请输入您的手机号码" id="telephone" v-model="telephone" maxlength="20" autocomplete="off"/>
                                </div>
                                <div class="input-group">
                                    <label for="cellphone"><span>电</span><span>话：</span></label>
                                    <input type="text" placeholder="请输入您的电话号码" id="cellphone" v-model="cellphone" maxlength="20" autocomplete="off"/>
                                </div>
                                <div class="input-group">
                                    <label for="company"><span>公</span><span>司：</span></label>
                                    <input type="text" placeholder="请输入您的公司名称" id="company" class="company" v-model="company" maxlength="100" autocomplete="off"/>
                                </div>
                            </div>

                            <div
                              v-show="type===3"
                              class="scan-pic"
                              :class="{'hover':!scaning && !scaned, 'focus': textFocus}"
                              @click.stop="clickLocalUrl=false"
                              @mouseenter="textFocus=false"
                            >
                                <label for="code-file" class="scan-pic-input before-scan" v-if="!scaning && !scaned" ></label>
                                <input
                                  id="code-file"
                                  class="file-input"
                                  type="file"
                                  accept="image/*"
                                  title=""
                                  v-if="!scaning && !scaned"
                                  @change="scanImageChange"
                                >
                                <div class="svg-box" v-if="!scaning && !scaned">
                                    <svg class="scan-img" xmlns="http://www.w3.org/2000/svg">
                                        <use xlink:href="#svg-qrcode-upload"></use>
                                    </svg>
                                    <p class="text">请先上传2二维码图</p>
                                </div>
                                <div class="svg-box" v-if="scaning">
                                    <div class="scaning-svg-box">
                                        <div class="mix-color-box"></div>
                                        <svg class="scaning-corner" xmlns="http://www.w3.org/2000/svg">
                                            <use xlink:href="#svg-qrcode-upload-corner"></use>
                                        </svg>
                                        <svg class="move-thumb" xmlns="http://www.w3.org/2000/svg">
                                            <use xlink:href="#svg-qrcode-upload-line"></use>
                                        </svg>
                                        <svg class="inactive-img" xmlns="http://www.w3.org/2000/svg">
                                            <use xlink:href="#svg-qrcode-upload"></use>
                                        </svg>
                                    </div>
                                    <p class="text scaning">识别中..</p>
                                </div>
                                <div class="svg-box" v-if="scaned">
                                    <svg class="scaned-img" xmlns="http://www.w3.org/2000/svg">
                                        <use xlink:href="#svg-qrcode-upload-success"></use>
                                    </svg>
                                    <div class="text" :class="{'scaned':scaned}">
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
                                        <div class="upload-line"></div>
                                        <div class="upload-again-box">
                                            <p class="upload-again">
                                                <label for="code-file" class="scan-pic-input after-scan" v-if="scaned" @change="scanImageChange">
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
                        </div>
                        <div class="qrCode-tool" v-if="colorShow">
                            <div class="title">基础设置：</div>
                            <div class="qrCode-foreground" v-if="!isArtQrCode">
                                <label class="tip">前景色</label>
                                <color-picker
                                    class="qrCode-picker bg-color-picker"
                                    :value="foreground"
                                    :themePickerShow="true"
									:colorPickerShow="false"
									:showQrCodeTip="true"
									:direction="direction"
									colorType="foregroundColor"
                                    :artQrCode="isArtQrCode"
                                    logType="qrCodeStyle"
                                    @input="selectForeground"
                                ></color-picker>
                            </div>
                            <div class="qrCode-background">
                                <label class="tip">背景色</label>
                                <color-picker
                                    class="qrCode-picker bg-color-picker"
                                    :value="background"
                                    :themePickerShow="true"
                                    :colorPickerShow="false"
                                    :showQrCodeTip="true"
                                    :direction="direction"
									colorType="backgroundColor"
                                    logType="qrCodeStyle"
                                    @input="selectBackground"
                                ></color-picker>
                            </div>

                            <div class="vt-line"></div>

                            <div :class="['qrCode-upload',{'disable':isArtQrCode}]" @click="jumptoUpload($event)">
                                <svg class="upload-icon">
                                    <use xlink:href="#svg-ele-upload-qrcode"></use>
                                </svg>
                                <span>{{logoText}}</span>
                                <input type="file" ref="file" id="file"/>
                            </div>

                            <div v-if="logo" :class="['qrCode-remove',{'disable':isArtQrCode || !logo}]" @click="removeLogo">
                                <svg class="remove-icon">
                                    <use xlink:href="#svg-ele-remove"></use>
                                </svg>
                                <span>移除logo</span>
                            </div>
                        </div>

                        <!-- 二维码样式 -->
                        <div class="qrcode-style">
                            <div class="title">
                                <span class="text">二维码样式：</span>
                                <div class="style-tips" v-if="isArtQrCode">提示：请确保美化后二维码可以识别再使用</div>
                            </div>
                            <div class="style-box">
                                <div :class="['style', 'default', {'selected':!isArtQrCode}]" @click="useDefault">默认</div>
                                <div
                                    :class="['style', {'hover': !isCreatingEleArt, 'selected': selectedStyleIdx===item.id}]"
                                    v-for="item in styleList"
                                    key="item.id"
                                    :data-key="item.id"
                                    @click="useArtQrCodeFn(item,$event)"
                                >
                                    <img class="style-img" :src="item.coverSrc">
                                    <div class="creating" v-show="isCreatingEleArt && selectedArtId===item.id">
                                        <div class="loading-box-right loading-box">
                                            <svg>
                                                <use xlink:href="#svg-loading-small"></use>
                                            </svg>
                                        </div>
                                    </div>
                                    <!-- <div class="corner"></div> -->
                                </div>
                                <div class="style more" @click="showMoreStyle" v-if="eleStyleList.length>4">
                                    <svg class="style-more">
                                        <use xlink:href="#svg-ele-dir-more"></use>
                                    </svg>
                                </div>
                            </div>
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
                        v-for="(item, index) in insideUrlTabList"
                        :key="item.type"
                        :class="['tabs', item.className, {active: tabType === item.type}]"
                        @click="chooseInsideType(item.type)"
                      >
                        <span>{{item.name}}</span>
                        <div :class="['vl', {active: tabType === item.type || tabType - 1 === item.type}]" v-if="index < insideUrlTabList.length - 1"></div>
                      </div>
                    </div>
                    <div
                        :class="['product-list', {noData: noDataShow}]"
                        @scroll="productScrollLoad"
                        ref="productContainer" 
                    >
                      <div class="flyer-list" v-show="tabType===1 && !noDataShow" ref="flyerSlider">
                          <div
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
                      <div class="game-list" v-show="tabType===2 && !noDataShow" ref="gameSlider">
                          <div
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
                      <div class="home-list" v-show="tabType===3 && !noDataShow" ref="homeSlider">
                          <div
                            class="product-item home"
                            v-for="item in homeList"
                            :class="{'activeProduct': homeId === item.id}"
                             @click="chooseHome(item)"
                          >
                              <div class="product-left">
                                    <div class="product-img">
                                        <img :src="item.logoPath"/>
                                        <span :class="['corner', 'verTip'+item.version]"></span>
                                    </div>
                              </div>
                              <div class="product-right">
                                  <p class="title">{{item.companyName}}</p>
                                  <p class="desc">{{item.typeName}}</p>
                              </div>
                          </div>
                      </div>

                      <div class="noData" v-if="noDataShow">
                          <img class="noData-img" :src="noDataImg"/>
                          <p class="noData-tip">{{noDataTip}}</p>
                          <button 
                            class="noData-button btn-common btn" 
                            @click="noDataButtonClick"
                        >{{noDataButtonTip}}</button>
                      </div>
                    </div>
                    <div class="code-self-footer">
                      <div
                        class="btn applyBtn code-self-btn"
                        :class="{'disableBtn':!tempSelectedWork}"
                        @click.stop="selectWork"
                      >确认</div>
                      <div class="btn cancelBtn code-self-btn" @click.stop="closeEditor">取消</div>
                    </div>
                  </div>
                </transition>

                <div class="style-model" :class="{open: switchStyleModel}" v-show="showStyleModel">
                    <div class="title">二维码样式：</div>
                    <div class="style-box" @scroll="styleScrollLoad" ref="styleModelBox">
                        <div :class="['style', 'default', {'selected':!isArtQrCode}]" @click="useDefault">默认</div>
                        <div
                            :class="['style', {'hover': !isCreatingEleArt, 'selected': selectedStyleIdx===item.id}]"
                            v-for="item in eleStyleList"
                            key="item.id"
                            :data-key="item.id"
                            @click="useArtQrCodeFn(item,$event)"
                        >
                            <img class="style-img" :src="item.coverSrc">
                            <div class="creating" v-show="isCreatingEleArt && selectedArtId===item.id">
                                <div class="loading-box-right loading-box">
                                    <svg>
                                        <use xlink:href="#svg-loading-small"></use>
                                    </svg>
                                </div>
                            </div>
                            <!-- <div class="corner"></div> -->
                        </div>
                    </div>
                    <div class="style-model-switch" @click="hideMoreStyle">
                        <svg class="style-model-switch-iconBg">
                            <use xlink:href="#svg-ele-shrinkBg"></use>
                        </svg>
                        <svg class="style-model-switch-icon">
                            <use xlink:href="#svg-ele-shrink"></use>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    `,
    mixins: [Ktu.mixins.artQrCode],
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

            url: 'fkw.com',
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
            selectedFlyer: null,

            gameList: [],
            gameIndex: 0,
            gameId: 0,
            selectedGame: null,

            homeList: [],
            homeIndex: 0,
            homeId: -1,
            selectedHome: null,

            // 用于还没确认选择时记住点击的作品
            tempSelectedWork: null,
            // 用于记住选择的tab
            selectedTab: 1,

            flyerLoadedAll: false,
            gameLoadedAll: false,
            homeLoadedAll: false,
            // 内链作品是否正在加载
            isLoading: false,

            noFlyerImg: `${Ktu.initialData.resRoot}/image/editor/qrCode/noFlyer.jpg`,
            noDataImg: `${Ktu.initialData.resRoot}/image/editor/qrCode/noData.png`,

            foreground: '#000',
            background: '#fff',

            qrCode: '',

            disableBtn: true,
            updateState: true,

            // 控制选择二维码的弹框显示
            showCodeFromSelf: false,

            isInsideUrl: false,

            insideUrlTabList: [
                {
                    name: '微传单',
                    className: 'flyer',
                    type: 1,
                },
                {
                    name: '互动营销',
                    className: 'game',
                    type: 2,
                },
                {
                    name: '我的官网',
                    className: 'home',
                    type: 3,
                },
            ],
            // 点击内部链接时弹框内的tab
            tabType: 1,

            scaning: false,
            scaned: false,
            scanImage: {},
            clickLocalUrl: false,

            codeType: '',
            codeTypeTab: '',

            // 用来记录图片的数据是否改变
            index: 0,
            logoText: '上传logo',
            direction: 'normal',

            // 样式弹窗
            switchStyleModel: false,
            showStyleModel: false,
            editorOverflow: 'visible',

            isCreatingEleArt: false,
            // 保存不同类型二维码的样式数据
            typeObj: {
                1: {
                    selectedStyleIdx: null,
                    isArtQrCode: false,
                    options: null,
                    logo: '',
                },
                2: {
                    selectedStyleIdx: null,
                    isArtQrCode: false,
                    options: null,
                    logo: '',
                },
                3: {
                    selectedStyleIdx: null,
                    isArtQrCode: false,
                    options: null,
                    logo: '',
                },
            },
            styleModelScroll: 0,
            styleScrollTimer: null,
            styleLoading: false,
            styleLoadIndex: 0,
            // 聚焦时改变placeholder样式
            isSpecialPlaceHolder: false,
            // 切换颜色节流
            backgroundTimer: null,
            foregroundTimer: null,

            logo: '',
            qrCodeSize: 800,
            ratio: 3.85,
            textFocus: false,
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
            if (this.isCreatingEleArt) {
                return '取消生成';
            }
            return '实时预览更新';
        },

        noDataTip() {
            if (this.tabType === 1) {
                return '您还没有微传单，去创建一个吧~';
            } else if (this.tabType === 2) {
                return '您还没有互动营销，去创建一个吧~';
            }
            return '您还没有自己的网站，去创建一个吧~';
        },
        noDataButtonTip() {
            return '免费创建';
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
            } else if ((this.tabType === 1 && this.flyerList.length <= 0) || (this.tabType === 2 && this.gameList.length <= 0) || (this.tabType === 3 && this.homeList.length <= 0)) {
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
                console.log('这是Ktu.store.state.data.selectedData.msg',Ktu.store.state.data.selectedData.msg)
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

        // 判断是否为设计师账号
        isUiManage() {
            return Ktu.isUIManage;
        },

        isThirdDesigner() {
            return Ktu.isThirdDesigner;
        },

        isInternalAcct() {
            return Ktu._isInternalAcct;
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
        historyStyleList: {
            get() {
                return this.$store.state.base.historyStyleList;
            },
            set(value) {
                this.$store.state.base.historyStyleList = value;
            },
        },
        styleList() {
            if (this.eleStyleList.length >= 5) {
                return this.eleStyleList.slice(0, 4);
            }
            return this.eleStyleList;
        },
        eleStyleList: {
            get() {
                return this.$store.state.base.eleStyleList;
            },
            set(value) {
                this.$store.state.base.eleStyleList = value;
            },
        },
        totalStyleNum: {
            get() {
                return this.$store.state.base.totalStyleNum;
            },
            set(value) {
                this.$store.state.base.totalStyleNum = value;
            },
        },
        tabUnderlinePoi() {
            switch (this.type) {
                case 1:
                    return 12;
                case 2:
                    return 108;
                case 3:
                    return 228;
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
        logo(value) {
            if (value) {
                this.logoText = '更换logo';
            } else {
                this.logoText = '上传logo';
            }
        },
    },
    mounted() {
        this.isOpenUtilModal = true;

        if (this.eleStyleList.length === 0) {
            this.getStyleList();
            this.getQrCodeHistory();
        }

        console.log('这是this.qrCodeEditor.type',this.qrCodeEditor.type)

        console.log('这是oldData', this.oldData)
        if (this.qrCodeEditor.type === 'update') {
            this.type = this.oldData.type;
            this.isInsideUrl = this.oldData.isInsideUrl;
            this.foreground = this.oldData.foreground;
            this.background = this.oldData.background;
            this.isArtQrCode = this.oldData.isArtQrCode;
            if (this.oldData.typeObj) this.typeObj = this.oldData.typeObj;

            if (this.logo) {
                this.logoText = '更换logo';
            } else {
                this.logoText = '上传logo';
            }


            if (this.isArtQrCode) {
                this.artQrCodeOptions = Object.assign(this.oldData.artQrCodeOptions, {
                    width: 372,
                    height: 372,
                    x: 30.8,
                    y: 30.8,
                    ratio: 15.4,
                });

                // 需要重新绑定dom，经过parse的dom对象变质了
                this.artQrCodeOptions.dom = this.$refs.qrCodeImg;
                if (/_h$/.test(this.oldData.selectedStyleIdx)) {
                    this.selectedStyleIdx = Number(this.oldData.selectedStyleIdx.replace(/_h$/, ''));
                } else {
                    this.selectedStyleIdx = Number(this.oldData.selectedStyleIdx);
                }
                this.typeObj[this.type].selectedStyleIdx = this.selectedStyleIdx;
                this.typeObj[this.type].options = this.artQrCodeOptions;
                this.typeObj[this.type].isArtQrCode = true;
            }

            this.logo = this.oldData.logo;
            this.typeObj[this.type].logo = this.oldData.logo;

            if (this.type === 1 && (!this.oldData.flyer || !this.oldData.flyer.id) && (!this.oldData.game || !this.oldData.game.id) && (!this.oldData.home || this.oldData.home.id === -1)) {
                this.url = this.oldData.url;
            } else if (
                (this.type === 1 && this.oldData.flyer)
                || (this.type === 1 && this.oldData.game)
                || (this.type === 1 && this.oldData.home)
                || (this.type === 3 && this.oldData.flyer)
                || (this.type === 4 && this.oldData.game)
            ) {
                this.type = 1;
                if (this.oldData.flyer) {
                    this.tabType = 1;
                    this.selectedTab = 1;
                    this.selectedFlyer = this.oldData.flyer;
                    this.flyerId = this.selectedFlyer.id;
                    this.url = this.selectedFlyer.url;
                } else if (this.oldData.game) {
                    this.tabType = 2;
                    this.selectedTab = 2;
                    this.selectedGame = this.oldData.game;
                    this.gameId = this.selectedGame.id;
                    this.url = this.selectedGame.url;
                } else {
                    this.tabType = 3;
                    this.selectedTab = 3;
                    this.selectedHome = this.oldData.home;
                    this.homeId = this.selectedHome.id;
                    this.url = this.selectedHome.url;
                }
            } else if (this.type === 2) {
                this.name = this.oldData.name;
                this.job = this.oldData.job;
                this.telephone = this.oldData.telephone;
                this.cellphone = this.oldData.cellphone;
                this.company = this.oldData.company;
            } else if (
                this.type === 3
                && (!this.oldData.flyer)
                && (!this.oldData.game)) {
                this.localUrl = this.oldData.localUrl;
                this.scaned = true;
            }

            // this.updateState = false;
            this.chooseType(this.type, null);
        } else {
            this.chooseType(this.type, null);
        }
    },
    destroyed() {
        this.isOpenUtilModal = false;
    },
    methods: {
        createQrCode() {
            console.log('enter qrcode')
            if (this.isArtQrCode) {
                console.log('这是艺术二维码')
                const text = this.genText();
                if (!text) {
                    this.$refs.qrCodeImg.querySelector('img') && this.$refs.qrCodeImg.removeChild(this.$refs.qrCodeImg.querySelector('img'));
                    return;
                }

                this.artQrCodeOptions.text = text;
                if (this.artQrCodeOptions.styleItem.content.foreground) {
                    if (this.artQrCodeOptions.styleItem.content.foreground.imgUrlList[0]) {
                        this.useArtQrCode(this.artQrCodeOptions);
                    } else {
                        this.genQrCode();
                    }
                } else {
                    this.genQrCode();
                }
            } else {
                console.log('这是正常二维码')
                this.createQrCodeFn();
            }
        },
        // 关闭二维码编辑器
        closeEditor(event) {
            if (this.isCreatingEleArt) {
                this.cancelGenArtQrCode();
            }
            if (event && typeof event.target.className === 'string') {
                if (event.target.className.includes('fade')) return;
            }

            if (this.showCodeFromSelf) {
                this.showCodeFromSelf = false;
                this.tabType = this.selectedTab;
                if (this.selectedFlyer) {
                    this.flyerId = this.selectedFlyer.id;
                    this.tempSelectedWork = this.selectedFlyer;
                } else {
                    this.flyerId = 0;
                    this.tempSelectedWork = null;
                }

                if (this.selectedGame) {
                    this.gameId = this.selectedGame.id;
                    this.tempSelectedWork = this.selectedGame;
                } else {
                    this.gameId = 0;
                    this.tempSelectedWork = null;
                }

                if (this.selectedHome) {
                    this.homeId = this.selectedHome.id;
                    this.tempSelectedWork = this.selectedHome;
                } else {
                    this.homeId = -1;
                    this.tempSelectedWork = null;
                }
            } else {
                if (this.qrCodeEditor.type === 'update') {
                    this.selectedStyleIdx = this.oldData.selectedStyleIdx;
                    this.typeObj[this.type].logo = '';
                    Object.keys(this.typeObj).forEach(key => {
                        if (Number(key) !== this.oldData.type) {
                            this.typeObj[key] = {};
                        }
                    });
                }

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

        inputFocus() {
            if (this.type === 1) {
                this.$refs.linkRef.focus();
            } else if (this.type === 2) {
                if (!this.name && !this.job && !this.cellphone && !this.telephone && !this.company) {
                    this.$refs.nameRef.focus();
                }
            } else if (this.type === 3) {
                this.textFocus = true;
            }
        },

        // 选择前景色
        selectForeground(value) {
            this.inputFocus();
            this.foreground = value;
            this.foregroundTimer && clearTimeout(this.foregroundTimer);
            this.foregroundTimer = setTimeout(this.createQrCode, 20);
        },

        // 选择背景色
        selectBackground(value) {
            this.inputFocus();
            this.isCancel = false;
            this.background = value;
            this.backgroundTimer && clearTimeout(this.backgroundTimer);
            this.backgroundTimer = setTimeout(this.createQrCode, 20);
        },

        // 选择二维码类型
        chooseType(value, event) {
            if (this.isCreatingEleArt) {
                this.cancelUseStyle();
            }

            this.type = value;
            this.isCancel = false;

            if (event && this.typeObj) {
                // 点击切换时需要切换不同类型的艺术二维码
                this.typeObj[this.type].logo ? this.logo = this.typeObj[this.type].logo : this.logo = '';
                this.selectedStyleIdx = this.typeObj[this.type].selectedStyleIdx;
                this.artQrCodeOptions = this.typeObj[this.type].options;
                this.isArtQrCode = this.typeObj[this.type].isArtQrCode;
            }
            if (this.artQrCodeOptions) {
                this.artQrCodeOptions.dom = this.$refs.qrCodeImg;
            }

            // 隐藏二维码样式
            this.showStyleModel = false;
            this.switchStyleModel = false;
            this.editorOverflow = 'visible';

            if (this.type === 1) {
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

        // 打开素材库
        jumptoUpload(e) {
            if (this.isArtQrCode) return;
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
            if (this.isArtQrCode || !this.logo) return;
            const { file } = this.$refs;
            file.value = '';
            this.typeObj[this.type].logo = '';
            this.logo = '';
            this.createQrCode();
            this.logoText = '上传logo';
        },

        // 处理图片
        dealImg(data) {
            this.index++;
            const img = new Image();
            // safari不允许将绘制了跨域图片的canvas使用canvas.toDataUrl()，因此使用xhr获取blob，以代替代替跨域的url,避免了跨域问题
            const xhr = new XMLHttpRequest();
            xhr.open('get', `${data}?${this.index}`, true);
            xhr.responseType = 'blob';
            xhr.onload = () => {
                const objectURL = URL.createObjectURL(xhr.response);
                img.src = objectURL;
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

                            this.typeObj[this.type].logo = logoCanvas.toDataURL();
                            this.logo = logoCanvas.toDataURL();
                            this.createQrCode();
                            this.logoText = '更换logo';
                            this.inputFocus();
                        };
                    };
                };
            };

            xhr.send();
        },

        insideLinkLog() {
            if (!this.showCodeFromSelf) return;

            if (this.tabType === 1) {
                Ktu.log('qrCodeInsideLink', 'flyerShow');
            } else if (this.tabType === 2) {
                Ktu.log('qrCodeInsideLink', 'gameShow');
            } else if (this.tabType === 3) {
                Ktu.log('qrCodeInsideLink', 'homeShow');
            }
        },

        chooseInsideType(value) {
            if (this.tabType !== value) {
                this.tabType = value;
            }

            if (this.tabType === 1) {
                this.flyerList.length <= 0 && this.requestFlyer();
            } else if (this.tabType === 2) {
                this.gameList.length <= 0 && this.requestGame();
            } else if (this.tabType === 3) {
                this.homeList.length <= 0 && this.requestHome();
            }

            this.insideLinkLog();
        },

        // 确认选择时才记住选择的产品
        selectWork() {
            if (!this.tempSelectedWork) return;
            if (this.showCodeFromSelf === true) this.showCodeFromSelf = false;
            if (this.flyerId !== 0 && this.gameId === 0 && this.homeId === -1) {
                this.selectedFlyer = this.tempSelectedWork;
                this.selectedGame = null;
                this.selectedHome = null;
                this.tabType = 1;
            } else if (this.gameId !== 0 && this.flyerId === 0 && this.homeId === -1) {
                this.selectedGame = this.tempSelectedWork;
                this.selectedFlyer = null;
                this.selectedHome = null;
                this.tabType = 2;
            } else if (this.gameId === 0 && this.flyerId === 0 && this.homeId !== -1) {
                this.selectedHome = this.tempSelectedWork;
                this.selectedFlyer = null;
                this.selectedGame = null;
                this.tabType = 3;
            }
            this.selectedTab = this.tabType;
            this.url = this.tempSelectedWork.url;
            this.isInsideUrl = true;
            this.createQrCode();
        },

        // 选择的微传单
        chooseFlyer(value) {
            if (this.flyerId === value.id) {
                this.flyerId = 0;
                this.tempSelectedWork = null;
                return;
            }
            this.gameId = 0;
            this.homeId = -1;
            this.flyerId = value.id;
            this.tempSelectedWork = value;
        },

        // 选择的互动营销
        chooseGame(value) {
            if (this.gameId === value.id) {
                this.gameId = 0;
                this.tempSelectedWork = null;
                return;
            }
            this.flyerId = 0;
            this.homeId = -1;
            this.gameId = value.id;
            this.tempSelectedWork = value;
        },

        chooseHome(value) {
            if (this.homeId === value.id) {
                this.homeId = -1;
                this.tempSelectedWork = null;
                return;
            }
            this.flyerId = 0;
            this.gameId = 0;
            this.homeId = value.id;
            this.tempSelectedWork = value;
        },

        // 格式化url，去掉空格
        formatUrl() {
            this.url = this.url.replace(/(^\s*)|(\s*$)/g, '');
            this.createQrCode();
        },

        changeUrl() {
            if (this.isInsideUrl) {
                this.isInsideUrl = false;
                this.tempSelectedWork = null;
                this.tabType = 1;
                this.flyerId = 0;
                this.gameId = 0;
                this.homeId = 0;
                this.selectedFlyer = null;
                this.selectedGame = null;
                this.selectedHome = null;
            }
        },

        // 生成二维码
        createQrCodeFn() {
            // this.background = '#fff';
            this.cancelUseStyle();
            this.$nextTick(() => {
                this.createQrCodeImg();
            });
        },

        genText() {
            let text = '';

            if ((this.type === 1 && !this.isInsideUrl) || this.type === 3) {
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
            } else if (this.type === 1 && this.isInsideUrl) {
                if (this.tabType === 1) {
                    this.url = this.selectedFlyer.url;
                    text = this.selectedFlyer.url;
                    this.codeType = 'inside_link';
                } else if (this.tabType === 2) {
                    this.url = this.selectedGame.url;
                    text = this.selectedGame.url;
                    this.codeType = 'inside_link';
                } else if (this.tabType === 3) {
                    this.url = this.selectedHome.url;
                    text = this.selectedHome.url;
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
                throw new Error('no expect type');
            }

            return text;
        },

        genQrCode() {
            // 创建新的二维码需要清空旧的
            this.$refs.qrCodeImg.querySelector('img') && this.$refs.qrCodeImg.removeChild(this.$refs.qrCodeImg.querySelector('img'));

            const text = this.genText();


            console.log('这是text',text)

            if (!text) {
                return;
            }

            const qr = $('<div></div>');
            const callback = () => {
                const canvas = qr.find('canvas').get(0);
                console.log('这是qr.find(canvas).get(0)',canvas)
                console.log('这是qr.find(canvas)',qr.find('canvas'))
                console.log('这是qr',qr)
                const options = {
                    data: canvas.toDataURL(),
                    width: this.qrCodeSize,
                    height: this.qrCodeSize,
                    dom: this.$refs.qrCodeImg,
                    x: 8 * this.ratio,
                    y: 8 * this.ratio,
                    ratio: 4 * this.ratio,
                    styleItem: {},
                };
                canvas && this.createBorder(options);
            };

            // 创建dom节点保存二维码信息
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
                callback,
            );

            // 这里存在当有logo的时候存在异步回调
            if (!this.logo) {
                callback();
            }
        },

        createQrCodeImg() {
            this.isArtQrCode = false;
            this.typeObj[this.type] = {
                logo: this.typeObj[this.type].logo,
            };
            this.selectedStyleIdx = null;
            this.artQrCodeOptions = null;

            this.genQrCode();
        },

        // 更新二维码
        updateQrCode() {
            if (!this.selectedData.type) return;
            this.typeObj[this.type].logo = '';

            this.selectedData.saveState();
            this.selectedData.src = this.qrCode;
            this.selectedData.base64 = this.qrCode;
            const msg = this.recordMsg();
            this.selectedData.isArtQrCode = this.isArtQrCode;
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
            };
            Ktu.element.addModule('qrCode', obj);
        },

        // 给二维码添加白色边框
        createBorder(options) {
            console.log('这是createBorder的options',options)
            const image = new Image();
            image.src = options.data;

            image.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // 获取当前canvas二维码最终大小
                canvas.width = this.qrCodeSize;
                canvas.height = this.qrCodeSize;

                ctx.fillStyle = this.background;
                // 画圆角
                this.drawRoundRect(ctx, 0, 0, canvas.width, canvas.height, options.ratio);
                ctx.fill();

                ctx.drawImage(image, 0, 0, image.width, image.height, options.x, options.y, image.width, image.height);
                this.qrCode = canvas.toDataURL();

                // 更换div显示的二维码
                const img = new Image();
                img.src = this.qrCode;

                img.onload = () => {
                    options.dom.querySelector('img') && options.dom.removeChild(options.dom.querySelector('img'));
                    options.dom.querySelector('canvas') && options.dom.removeChild(options.dom.querySelector('canvas'));
                    options.dom.appendChild(img);

                    this.isArtQrCode && this.logFn();
                    // 这里主要用于判断是否修改过
                    if (this.updateState) {
                        this.disableBtn = false;
                    }
                    this.updateState = true;
                };
            };
        },

        // 记录二维码信息
        recordMsg() {
            Object.keys(this.typeObj).forEach(key => {
                if (Number(key) !== this.type) {
                    this.typeObj[key] = {};
                }
            });

            const msg = {};
            msg.type = this.type;
            msg.foreground = this.foreground;
            msg.background = this.background;
            msg.ratio = this.ratio;

            if (this.artQrCodeOptions) {
                msg.artQrCodeOptions = Object.assign({}, {
                    text: this.artQrCodeOptions.text,
                    styleItem: this.artQrCodeOptions.styleItem,
                });
            }

            // msg.typeObj = this.typeObj;
            msg.isArtQrCode = this.isArtQrCode;
            msg.selectedStyleIdx = this.selectedStyleIdx;
            msg.isInsideUrl = this.isInsideUrl;
            msg.logo = this.logo;

            if (this.type === 1) {
                msg.url = this.url;

                msg.flyer = this.selectedFlyer;
                msg.game = this.selectedGame;
                msg.home = this.selectedHome;
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

            if (this.type !== 1) this.isInsideUrl = false;

            if (this.qrCodeEditor.type === 'update') {
                this.updateQrCode();
            } else {
                this.createQrCodeObj();
            }
            this.closeEditor();

            this.isArtQrCode && this.addQrCodeHistory(this.artQrCodeOptions.styleItem);

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

        requestHome() {
            this.isLoading = true;

            const url = '../ajax/qrcode_h.jsp?cmd=getSites';

            axios
                .post(url, {
                    scrollIndex: this.homeIndex,
                })
                .then(res => {
                    const info = res.data;
                    if (info.success) {
                        const tmpArr = info.data;
                        this.homeList = [...this.homeList, ...tmpArr];
                        this.homeList.forEach(item => {
                            item.url = `http://${item.jumpUrl}`;
                            item.id = item.siteid;
                        });

                        // 当请求回来的数据不足20条则加载完毕
                        if (tmpArr.length < 20) {
                            this.homeLoadedAll = true;
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

        // 滚动加载我的官网数据
        homeScrollLoad() {
            this.homeScrollTimer && window.clearTimeout(this.homeScrollTimer);
            this.homeScrollTimer = window.setTimeout(() => {
                // 加载完毕 返回
                if (this.homeLoadedAll) return false;

                const container = this.$refs.productContainer;
                const slide = this.$refs.homeSlider;
                if (!this.isLoading && container.scrollTop + container.clientHeight >= slide.clientHeight) {
                    // this.isLoading = true;
                    this.homeIndex++;
                    this.requestHome();
                }
            }, 50);
        },

        productScrollLoad() {
            if (this.tabType === 1) {
                this.flyerScrollLoad();
            } else if (this.tabType === 2) {
                this.gameScrollLoad();
            } else {
                this.homeScrollLoad();
            }
        },

        // 选择内链
        showEleCodeSelf() {
            this.showCodeFromSelf = true;
            this.tempSelectedWork = null;

            this.insideLinkLog();

            if (this.tabType === 1) {
                if (this.selectedFlyer) {
                    this.flyerId = this.selectedFlyer.id;
                }
                if (this.flyerList.length === 0) {
                    this.requestFlyer();
                }
            } else if (this.tabType === 2) {
                if (this.selectedGame) {
                    this.gameId = this.selectedGame.id;
                }
                if (this.gameList.length === 0) {
                    this.requestFlyer();
                }
            } else if (this.tabType === 3) {
                if (this.selectedHome) {
                    this.homeId = this.selectedHome.id;
                }
                if (this.homeList.length === 0) {
                    this.requestFlyer();
                }
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
            console.log('传入图片')
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


            console.log('这是img',img)

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

                qrcode.decode($canvas.toDataURL());
            };


            console.log('这是qrcode',qrcode)

            qrcode.callback = result => {
                setTimeout(() => {
                    try {
                        if (!result.success) {
                            this.scaning = false;
                            this.localUrl ? (this.scaned = true) : (this.scaned = false);
                            this.$Notice.warning('无法识别，请上传清晰的二维码图片。');
                            return;
                        }

                        this.scaning = false;
                        this.scaned = true;
                        this.localUrl = result.msg;
                        this.createQrCode();
                    } catch (error) {
                        console.log(error);
                    }
                }, 2000);
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

        // 更多二维码样式
        showMoreStyle() {
            this.editorOverflow = 'hidden';
            this.showStyleModel = true;
            setTimeout(() => {
                this.switchStyleModel = true;
            }, 10);
            Ktu.simpleLog('qrCodeStyle', 'moreStyle');
        },
        hideMoreStyle() {
            this.switchStyleModel = false;
            setTimeout(() => {
                this.showStyleModel = false;
                this.editorOverflow = 'visible';
            }, 500);
        },

        useArtQrCodeFn(item, event) {

            console.log(item)
            if (this.isCreatingEleArt || this.selectedStyleIdx === item.id) {
                return;
            }
            
            console.log('you pick the qrcode style')

            // 如果是选择了历史记录的样式，data-key会带_h结尾，要去掉
            const dataKey = this.dataKeyFilter(event);

            // 关闭加载动画
            const callback = () => {
                this.isCreatingEleArt = false;
                this.selectedStyleIdx = dataKey;
                this.artQrCodeOptions = options;
                this.typeObj[this.type].options = options;
                if (this.isArtQrCode) {
                    this.typeObj[this.type].selectedStyleIdx = this.selectedStyleIdx;
                    this.typeObj[this.type].isArtQrCode = true;
                }
            };

            const text = this.genText();
            !text && this.inputFocus();

            // 参考上面的createQrCodeImg方法
            this.$refs.qrCodeImg.querySelector('canvas') && this.$refs.qrCodeImg.removeChild(this.$refs.qrCodeImg.querySelector('canvas'));
            const options = {
                text,
                dom: this.$refs.qrCodeImg,
                // 插件把高宽放大了两倍左右
                width: 372,
                height: 372,
                x: 8 * this.ratio,
                y: 8 * this.ratio,
                styleItem: item,
                ratio: 4 * this.ratio,
            };

            this.isCancel = false;

            if (!options.text) {
                this.$refs.qrCodeImg.querySelector('img') && this.$refs.qrCodeImg.removeChild(this.$refs.qrCodeImg.querySelector('img'));
                this.selectedStyleIdx = null;
                this.isArtQrCode = false;
                if (this.type === 1) {
                    if (!this.url) {
                        this.isSpecialPlaceHolder = true;
                        this.$refs.linkRef.setAttribute('placeholder', '请先输入内容');
                    }
                } else if (this.type === 2) {
                    if (!this.name && !this.job && !this.telephone && !this.cellphone && !this.company) {
                        this.isSpecialPlaceHolder = true;
                        this.$refs.nameRef.setAttribute('placeholder', '请先输入内容');
                    }
                }
                return;
            }

            this.isCreatingEleArt = true;
            this.disableBtn = true;
            this.useArtQrCode(options, callback, event);
            Ktu.simpleLog('qrCodeStyle', 'useStyle');
        },
        cancelUseStyle() {
            if (!this.selectedStyleIdx) this.isArtQrCode = false;
            if (this.isCreatingEleArt) {
                this.isCreatingEleArt = false;
                this.isCancel = true;
                clearTimeout(this.qrCodeTimer);
                this.qrCodeTimer = null;
                this.disableBtn = false;
            }
        },
        cancelGenArtQrCode() {
            if (this.isCreatingEleArt) {
                this.cancelUseStyle();
            };
        },
        getStyleList() {
            this.styleLoading = true;

            const url = '../ajax/artQrcode/getList_h.do?cmd=getList';

            axios
                .post(url, {
                    limit: 41,
                    scrollIndex: this.styleLoadIndex,
                    // 目前类型只有图像二维码，不传的话默认就是 1，除了 1 传其他就啥都没了
                    type: '1',
                })
                .then(res => {
                    this.eleStyleList = this.eleStyleList.concat(res.data.data.list);
                    this.totalStyleNum = res.data.data.totalSize;
                })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => {
                    this.styleLoading = false;
                });
        },
        styleScrollLoad() {
            this.styleScrollTimer && window.clearTimeout(this.styleScrollTimer);
            this.styleScrollTimer = window.setTimeout(() => {
                // 加载完毕 返回
                if (this.totalStyleNum === this.eleStyleList.length) return false;

                const container = this.$refs.styleModelBox;

                if (!this.styleLoading && container.scrollTop + container.clientHeight >= container.scrollHeight) {
                    this.styleLoadIndex++;
                    this.getStyleList();
                }
            }, 50);
        },
        useDefault() {
            this.inputFocus();
            if (!this.isArtQrCode) return;
            this.createQrCodeFn();
            Ktu.simpleLog('qrCodeStyle', 'defaultStyle');
        },
        textInputBlur() {
            this.isSpecialPlaceHolder = false;
            this.$refs.linkRef.setAttribute('placeholder', '输入网址http://');
            this.$refs.nameRef.setAttribute('placeholder', '输入您的姓名');
        },
        noDataButtonClick() {
            if (this.tabType === 1) {
                window.open('https://i.cd.fkw.com/manage/flyerNewManage.jsp?refer=5');
                Ktu.log('qrCodeInsideLink', 'flyerClick');
            }
            if (this.tabType === 2) {
                window.open('https://i.hd.fkw.com/version2/?fromPageId=0&openSourceId=501');
                Ktu.log('qrCodeInsideLink', 'gameClick');
            }
            if (this.tabType === 3) {
                document.cookie = `openJzSourceId=96; domain=${document.domain};`;
                window.open('https://i.jz.fkw.com/?siteId=1');
                Ktu.log('qrCodeInsideLink', 'homeClick');
            }
        },
    },
});
