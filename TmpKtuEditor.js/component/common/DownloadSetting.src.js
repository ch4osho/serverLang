Vue.component('download-setting', {
    template: `
        <div>
            <div  v-if="curNavObj.type != 2">
                <template v-if="curNavObj.type === 3">
                    <div class="line" >
                        <div class="line-title">选择站点：</div>
                        <div class="line-des"  :class="{active:isShow}">
                            <div class="site-input" @click="showMenu">
                                <div class="inner-site-input">
                                    <span v-if="openedSiteObj.siteType === 1">凡科建站 - </span>
                                    <span v-else-if="openedSiteObj.siteType === 2">凡科商城 - </span>
                                    <span v-else>轻站小程序 - </span>
                                    {{openedSiteObj.name}}
                                </div>
                            </div>
                            <svg class="unfold-icon">
                                <use xlink:href="#svg-arrow"></use>
                            </svg>
                            <transition name="popover-up">
                                <div v-show="isShow" class="site-menu-list file-menu-popup" :class="{active: listHeight >= 272}" ref="siteList">
                                    <ul class="site-menu-popup">
                                        <li class="site-item" v-for="(item,index) in siteList" :key="index" :class="{active:item.siteid === openedSiteObj.siteid}" @click="chooseSite(item)">
                                            <p>
                                                <span v-if="item.siteType === 1">凡科建站 - </span>
                                                <span v-else-if="item.siteType === 2">凡科商城 - </span>
                                                <span v-else>轻站小程序 - </span>
                                                {{item.name}}
                                            </p>
                                        </li>
                                        <li class="site-item" v-if="siteTypeArr.indexOf(1) == -1">
                                            <p>凡科建站</p>
                                            <a href="https://i.jz.fkw.com/?siteId=1&openJzSourceId=97" target="_blank">未开通</a>
                                        </li>
                                        <li class="site-item" v-if="siteTypeArr.indexOf(2) == -1">
                                            <p>凡科商城</p>
                                            <a href="https://mall.fkw.com/" target="_blank">未开通</a>
                                        </li>
                                        <li class="site-item" v-if="siteTypeArr.indexOf(3) == -1">
                                            <p>轻站小程序</p>
                                            <a href="https://qz.fkw.com/" target="_blank">未开通</a>
                                        </li>
                                    </ul>
                                </div>
                            </transition>
                        </div>
                    </div>
                </template>
                <template v-else-if="curNavObj.type === 4 && weChatAvailable">
                    <div class="line" >
                        <div class="line-title">选择公众号：</div>
                        <div class="line-des"  :class="{active:isShow}">
                            <div class="weChat-input" @click="showMenu">
                                <div class="inner-weChat-input">{{weChatObj.nick_name}}</div>
                            </div>
                            <svg class="unfold-icon">
                                <use xlink:href="#svg-arrow"></use>
                            </svg>
                            <transition name="popover-up">
                                <div v-show="isShow" class="weChat-menu-list file-menu-popup">
                                    <div :class="{active:listHeight >= 208}" ref="weChatList">
                                        <ul class="weChat-menu-popup">
                                            <li class="weChat-item" v-for="(item,index) in weChatList" :key="index" :class="{active:item.nick_name === weChatObj.nick_name}" @click="chooseWeChat(item)">
                                                <p>{{item.nick_name}}</p>
                                            </li>
                                        </ul>
                                    </div>
                                    <div class="add-weChat">
                                        <svg class="svg-icon">
                                            <use xlink:href="#svg-weChat"></use>
                                        </svg>
                                        <iframe id="flyerWXAuth" frameborder="0" width="100%" height="100%" scrolling="no"  style="position:absolute;left:0" :src="iframeSrc"></iframe>

                                    </div>
                                </div>
                            </transition>
                        </div>
                    </div>
                </template>
                <div class="line" :class="{'workName':templateType !== 'normal'}">
                    <div class="line-title">作品名称：</div>
                    <div class="line-des">
                        <validate-input v-model="nowTitle" :inputVal="nowTitle" class="modal-input nav-title-input" style="width:208px"
                            @focus="focusInput" :class="{disable:isFromCustomization}">
                        </validate-input>
                    </div>
                </div>
                <div class="line" v-if="templateType==='normal'">
                    <div class="line-title">作品格式：</div>
                    <pull-down-list :curNavObj = "curNavObj" showListWay="formatList"></pull-down-list>
                </div>
                <div class="line" v-show="showQuality">
                    <div class="line-title">图片质量：</div>
                    <pull-down-list showListWay="qualityList" :templateType="templateType"></pull-down-list>
                </div>
                <div class="line" :class="{active:formatObj.value === 'pdf'}" v-if="pageNum > 1">
                    <div class="line-title" v-if="curNavObj.type === 1">下载页面：</div>
                    <div class="line-title" v-else>导出页面：</div>
                    <div class="line-des">
                    <radio-group v-model="pageValue">
                        <radio class="modal-radio" v-for="(item,index) in pageOptions" v-if="!(item.value==0&&formatObj.value == 'psd')" :key="index" :label="item.label" :value="item.value"></radio>
                    </radio-group>
                    </div>
                </div>

                <div class="advanced-setting" v-if="isShowAdvanced">
                    <transition :name="transitionName">
                        <div class="cut-img-option" v-if="(isShowSetting || !isAvancedFold) && showCutImg">
                            <div class="line tailor-container">
                                <div class="line-title tailor"><span>切</span><span>图：</span></div>
                                <div class="line-des">
                                    <div  class="tailor-rule" :class="{active:item.type === heightState.rule}" v-for="(item,index) in tailorOptions" :key="index">
                                        <svg @click="chooseRule(item)">
                                            <use :xlink:href="item.svgId"></use>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <transition :name="transitionName">
                                <template v-if="heightState.rule === 2">
                                    <div class="tailor-img">
                                        纵向平均切成
                                        <validate-input
                                            v-model="rows" :inputVal="rows" class="num-input" :class="{disable:isFromCustomization}">
                                        </validate-input>
                                        张图片
                                    </div>
                                </template>
                                <template v-else-if="heightState.rule === 3">
                                    <div class="tailor-img">
                                        横向平均切成
                                        <validate-input v-model="columns" :inputVal="columns" class="num-input"  :class="{disable:isFromCustomization}">
                                        </validate-input>
                                        张图片
                                    </div>
                                </template>
                                <template v-else-if="heightState.rule === 4">
                                    <div class="tailor-img">
                                        列数
                                        <validate-input v-model="columns" :inputVal="columns" class="num-input"  :class="{disable:isFromCustomization}">
                                        </validate-input>
                                        行数
                                        <validate-input
                                            v-model="rows" :inputVal="rows" class="num-input"  :class="{disable:isFromCustomization}">
                                        </validate-input>
                                        共{{rows * columns}}张
                                    </div>
                                </template>
                            </transition>
                        </div>
                    </transition>
                    <transition :name="transitionName">
                        <div class="line mark" v-if="!isAvancedFold && isShowMark" >
                            <div class="line-title">水&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;印：</div>
                            <div class="line-des">
                                <div class="mark-box " :class="{'has-tips':isMarkSelected && isHoverMark}" @mouseenter="isHoverMark = true" @mouseleave="isHoverMark = false" @click="addMark" tips="点击修改水印">
                                    <template v-if="!isMarkSelected">
                                        <div class="dashed-wrapper" >
                                            <svg v-if="!isHoverMark"><use xlink:href="#svg-mark-dashed" ></use></svg>
                                            <svg class="svg-mark-solid" v-else><use xlink:href="#svg-mark-solid" ></use></svg>
                                        </div>
                                        <div class="add-wrapper" >
                                            <svg>
                                                <use xlink:href="#svg-mark-add"></use>
                                            </svg>
                                            <span>添加水印</span>
                                        </div>
                                    </template>
                                    <template v-else>
                                        <div class="mark-svg" v-html="markData.svg" :class="{'img-mark':isImgMark}"></div>
                                        <div class="close-wrapper" @click.stop="deleteMark"  @mouseenter.stop="isHoverMark = false" @mouseleave.stop="isHoverMark = true">
                                            <svg>
                                                <use xlink:href="#svg-mark-close"></use>
                                            </svg>
                                        </div>
                                    </template>

                                </div>
                            </div>
                        </div>
                    </transition>
                    <div class="unfold-btn"  v-if="isAvancedFold" @click="showSetting">
                        <span>更多功能</span>
                        <svg class="unfold-icon">
                            <use xlink:href="#svg-arrow"></use>
                        </svg>
                    </div>
                </div>
            </div>
            <div v-else>
                <div class="line" >
                    <div class="line-title">图片质量：</div>
                    <pull-down-list showListWay="qualityList" :loadCodeStatus="loadCodeStatus" :templateType="templateType"></pull-down-list>
                </div>
                <div class="line active" v-if="pageNum > 1">
                    <div class="line-title">下载页面：</div>
                    <div class="line-des">
                        <radio-group v-model="pageValue">
                            <radio class="modal-radio" v-for="(item,index) in pageOptions" :key="index" :label="item.label" :value="item.value" :disabled="loadCodeStatus===5"></radio>
                        </radio-group>
                    </div>
                </div>
            </div>
        </div>
        `,
    mixins: [Ktu.mixins.popupCtrl],
    props: {
        curNavObj: {
            type: Object,
        },
        pageNum: {
            type: Number,
        },
        weChatList: {
            type: Array,
        },
        siteList: {
            type: Array,
        },
        loadCodeStatus: {
            type: Number,
        },
        weChatAvailable: {
            type: Boolean,
        },
        templateType: {
            type: String,
        },
    },
    data() {
        return {
            // 站点列表或者公众号列表的高度
            listHeight: 0,
            isFromCustomization: Ktu.isFromCustomization,
            tailorOptions: [
                {
                    type: 1,
                    svgId: '#svg-original',
                    des: '不分割',
                    cross: 0,
                    vertical: 0,
                    crossAvailable: true,
                    verticalAvailable: true,
                },
                {
                    type: 2,
                    svgId: '#svg-horizontal',
                    des: '纵向',
                    cross: 1,
                    vertical: 2,
                    crossAvailable: true,
                    verticalAvailable: true,
                },
                {
                    type: 3,
                    svgId: '#svg-vertical',
                    des: '横向',
                    cross: 2,
                    vertical: 1,
                    crossAvailable: true,
                    verticalAvailable: true,
                },
                {
                    type: 4,
                    svgId: '#svg-cellular',
                    des: '网格',
                    cross: 3,
                    vertical: 3,
                    crossAvailable: true,
                    verticalAvailable: true,
                },
            ],
            pageOptions: [
                {
                    label: '全部',
                    value: 0,
                }, {
                    label: '当前页',
                    value: 1,
                },
            ],
            siteTypeArr: [],
            isHoverMark: false,
        };
    },
    mounted() {
        if (this.siteList) {
            for (let i = 0; i < this.siteList.length; i++) {
                this.siteTypeArr.push(this.siteList[i].siteType);
            }
        }
    },
    created() {
        this.nowTitle = this.$store.state.msg.title;
        this.iframeSrc = `${this.getDomain()}/wxAuth.jsp?aid=${Ktu.ktuAid}&_Token=${$('#_TOKEN').attr('value')}&authorized=true`;
    },
    computed: {
        transitionName() {
            // return this.modalState == 'loading' ? 'fade' : '';
        },
        markData() {
            return this.$store.state.data.markData;
        },
        isImgMark() {
            return this.markData.type === 'img-mark';
        },
        isMarkSelected() {
            return JSON.stringify(this.markData) != '{}';
        },
        templateScale() {
            return Ktu.ktuData.other.height / Ktu.ktuData.other.width;
        },
        heightState() {
            return this.$store.state.modal.heightState;
        },
        rows: {
            get() {
                return this.$store.state.modal.tailorRuleObj.vertical;
            },
            set(value) {
                if (!(/^[2-4]$/.test(value))) {
                    this.$Notice.warning('请输入2~4的整数');
                    document.getElementsByClassName('ktu-message')[0].style.top = '275px';
                    this.$store.state.modal.tailorRuleObj.verticalAvailable = false;
                    return;
                }
                this.$store.state.modal.tailorRuleObj.vertical = value;
                this.$store.state.modal.tailorRuleObj.verticalAvailable = true;
            },
        },
        columns: {
            get() {
                return this.$store.state.modal.tailorRuleObj.cross;
            },
            set(value) {
                if (!(/^[2-4]$/.test(value))) {
                    this.$Notice.warning('请输入2~4的整数');
                    document.getElementsByClassName('ktu-message')[0].style.top = '275px';
                    this.$store.state.modal.tailorRuleObj.crossAvailable = false;
                    return;
                }
                this.$store.state.modal.tailorRuleObj.cross = value;
                this.$store.state.modal.tailorRuleObj.crossAvailable = true;
            },
        },
        formatObj: {
            get() {
                return this.$store.state.modal.formatObj;
            },
            set(value) {
                this.$store.state.modal.formatObj = value;
            },
        },
        weChatObj: {
            get() {
                return this.$store.state.modal.weChatObj;
            },
            set(value) {
                this.$store.state.modal.weChatObj = value;
            },
        },
        openedSiteObj: {
            get() {
                return this.$store.state.modal.openedSiteObj;
            },
            set(value) {
                this.$store.state.modal.openedSiteObj = value;
            },
        },
        isShowSetting: {
            get() {
                return this.$store.state.modal.isShowSetting;
            },
            set(value) {
                this.$store.state.modal.isShowSetting = value;
            },
        },
        pageValue: {
            get() {
                return this.$store.state.modal.pageValue;
            },
            set(value) {
                this.$store.state.modal.pageValue = value;
            },
        },
        tailorRuleObj: {
            get() {
                return this.$store.state.modal.tailorRuleObj;
            },
            set(value) {
                this.$store.state.modal.tailorRuleObj = value;
            },
        },
        nowTitle: {
            get() {
                return this.$store.state.modal.nowTitle;
            },
            set(value) {
                this.$store.state.modal.nowTitle = value;
            },
        },
        isAvancedFold: {
            get() {
                return this.$store.state.modal.isAvancedFold;
            },
            set(value) {
                this.$store.state.modal.isAvancedFold = value;
            },
        },
        isShowAdvanced() {
            return this.showCutImg || this.isShowMark;
        },
        showCutImg() {
            const filterArr = ['pdf', 'psd'];
            return this.templateType === 'normal' && this.curNavObj.type === 1 && !filterArr.includes(this.formatObj.value);
        },
        isShowMark() {
            const filterArr = ['pdf', 'psd'];
            return this.templateType === 'normal' && this.curNavObj.type === 1 && !filterArr.includes(this.formatObj.value);
        },
        showQuality() {
            const filterArr = ['pdf', 'psd'];
            return !filterArr.includes(this.formatObj.value);
        },
    },
    methods: {
        deleteMark() {
            Ktu.template.clearMarkData();
            Ktu.save.savePage(false);
        },
        getDomain() {
            const outHost = location.host;
            // 是否是独立或者本地环境
            const isLocal = /aaa|fff/.test(outHost);
            let ktuHost = '';
            if (isLocal) {
                // 是否是独立环境或本地环境
                ktuHost = 'http://kt-wx.faibak.com';
            } else {
                ktuHost = 'https://i.kt.fkw.com';
            }
            return ktuHost;
        },
        showMenu(e) {
            this.show();
            switch (e.target.className) {
                case 'site-input':
                case 'inner-site-input':
                    Vue.nextTick(() => {
                        // 超过272显示滚动条
                        this.listHeight = this.$refs.siteList.offsetHeight;
                    });
                    break;
                case 'weChat-input':
                case 'inner-weChat-input':
                    Vue.nextTick(() => {
                        this.listHeight = this.$refs.weChatList.offsetHeight;
                    });
            }
        },
        showSetting() {
            this.heightState.showSetting = 1;
            this.isAvancedFold = false;
        },
        chooseWeChat(item) {
            this.weChatObj = item;
        },
        chooseSite(item) {
            this.openedSiteObj = item;
        },
        chooseRule(item) {
            this.heightState.rule = item.type;
            this.tailorRuleObj = JSON.parse(JSON.stringify(item));
        },

        focusInput(e) {
            e.target.value = e.target.value.replace(/[^\d]/g, '') || '';
        },
        addMark() {
            this.$store.commit('modal/showMarkModalState', true);
        },
    },
});
