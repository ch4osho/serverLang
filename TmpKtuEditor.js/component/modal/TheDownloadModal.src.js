Vue.component('download-modal', {
    template: `
    <Modal class="manageModal download-modal" :class="{'hasDrainage': isShowDrainage}" :maskAnimate="modalAnimate" :downloadModalStyles="{overflow:'hidden'}" :width="width" :mask-closable="modalState != 'loading'" class-name="newModalBody downloadModal" v-model="showDownloadModal" ref="modal">
        <div class="bind-weChat-mask" v-show="isShowTipModal">
            <div class="bind-weChat-tip">
                <svg @click="changeBindStatus">
                    <use xlink:href="#collect-modal-close"></use>
                </svg>
                <p>为了你的帐号安全，该二维码不能给他人扫</p>
                <div class="view-btn">
                    <btn class="btn" @click="closeTipModal">确定</btn>
                    <btn class="btn close-btn" @click="changeBindStatus">取消</btn>
                </div>
            </div>
        </div>
        <div slot="header" class="download-modal-header">
            <span class="titleTip">下载</span>
            <div :class="['tips-box',chargeTips[chargeStatus].className]" ref="tips">
                <div class="tips-text" :style="{maxWidth:chargeTips[chargeStatus].width+'px'}">
                    <svg class="tips-text-icon">
                        <use xlink:href="#svg-right" class="tips-text-icon"  v-if="chargeStatus==0"></use>
                        <use xlink:href="#svg-warning-yellow" class="tips-text-icon" v-else-if="chargeStatus==1"></use>
                        <use xlink:href="#svg-warning-red" class="tips-text-icon" v-else></use>
                    </svg>
                    <p>{{chargeTips[chargeStatus].text}}<span v-if="chargeStatus!=0" @click="showQueryModal">查看</span></p>
                </div>
            </div>
        </div>

        <div class="download-modal-nav">
            <div class="top-navs">
                <div class="nav-title" :class="{active:item.type === curNavObj.type}" v-for="(item,index) in navObj" :key="index" @click="changeTab(item)">
                    <span>{{item.label}}</span>
                </div>
            </div>
            <div class="nav-active-bar" :style="{transform:'translate(' + position + 'px,0)'}">
            </div>
        </div>

        <div class="download-modal-body" :style="{height:modalBodyHeight + 'px'}">
            <a href="https://docs.qq.com/doc/DUFpkZXhjRkZlT0Vl" target="_blank" @click="clickLink" class="export-des" :class="{active:curNavObj.type === 4}" v-show="showLink">图片导出在哪?</a>
            <template  v-if="modalState == 'normal'">
                <div class="modal-body active">
                    <!--下载到电脑-->
                    <div class="download-to-computer" v-show="curNavObjCopy.type === 1">
                        <download-setting :curNavObj="curNavObjCopy" :pageNum="pageNum" :templateType="templateType"></download-setting>
                    </div>
                    <!--下载到手机-->
                    <div class="download-to-phone" v-show="curNavObjCopy.type === 2" :class="{active: pageNum > 1}">
                        <div class="QR-code-loading" v-if = "loadCodeStatus === 1">
                            <svg class="loading-img">
                                <use xlink:href="#svg-QR-loading"></use>
                            </svg>
                            <div class="loading-text">二维码加载中...</div>
                        </div>
                        <div class="QR-code-info" v-else-if = "loadCodeStatus > 1">
                            <template v-if="codeSrc">
                                <div class="QR-code-img">
                                    <div :style="{backgroundImage:'url('+ codeSrc + ')'}"></div>
                                    <div class="invalid-QR-code" v-if="loadCodeStatus === 4" @click="getNewQRCode">
                                        <svg>
                                            <use xlink:href="#refresh-QR-code"></use>
                                        </svg>
                                        <p>二维码已过期</p>
                                        <p>点击刷新</p>
                                    </div>
                                    <div class="invalid-QR-code" v-else-if="loadCodeStatus === 5">
                                        <svg class="reload">
                                            <use xlink:href="#svg-QR-reloading"></use>
                                        </svg>
                                    </div>
                                </div>
                                <p class="tips">微信扫码「关注公众号」下载图片</p>
                                <p class="time" v-if="hasBindWeChat || isFromOss">该二维码10分钟后过期</p>
                                <div class="bindWeChat" v-else :class="{active:loadCodeStatus === 5}" @click="changeBindStatus">
                                    <svg class="bind" v-if="showBindedBtn" >
                                        <use xlink:href="#svg-bind-weChat"></use>
                                    </svg>
                                    <svg class="notbind" v-else>
                                        <use xlink:href="#svg-notbind-weChat"></use>
                                    </svg>
                                    <span>绑定微信帐号</span>
                                </div>
                            </template>
                            <template v-else>
                                <div class="fail-container" :class="{active:pageNum > 1}" v-if="loadCodeStatus != 5">
                                    <div class="fail-image"></div>
                                    <p class="fail-tips">当前图片超过2M，请降低图片质量</p>
                                </div>
                                <div class="loading-container" v-else>
                                    <svg class="loading-img" :class="{active:pageNum > 1}">
                                        <use xlink:href="#svg-QR-loading"></use>
                                    </svg>
                                </div>
                            </template>
                        </div>
                        <download-setting :curNavObj="curNavObjCopy" :pageNum="pageNum" :loadCodeStatus="loadCodeStatus" :templateType="templateType" v-if="loadCodeStatus !== 1"></download-setting>
                    </div>
                    <!--导出到站点-->
                    <div class="export-to-site" v-show="curNavObjCopy.type === 3">
                        <div class="unavailable-site center" v-if="!siteAvailable">
                            <div class="tips">暂未开通站点，请点击免费开通</div>
                            <div class="unavailable-site-list">
                                <div class="unavailable-site-obj" v-for="item in siteObj" :key="item.index">
                                    <svg class="site-icon">
                                        <use :xlink:href="item.svgId"></use>
                                    </svg>
                                    <p class="site-title">{{item.title}}</p>
                                    <p class="site-des">{{item.des}}</p>
                                    <a :href="item.address" target="_blank">免费开通</a>
                                </div>
                            </div>
                        </div>
                        <div class="available-site"  v-else>
                            <download-setting :curNavObj="curNavObjCopy" :pageNum="pageNum" :siteList="siteList" :templateType="templateType"></download-setting>
                        </div>
                    </div>
                    <!--导出到公众号-->
                    <div class="export-to-weChat" v-show="curNavObjCopy.type === 4">
                        <div class="unavailable-weChat" v-if="!weChatAvailable">
                            <div class="weChat-img"></div>
                            <p class="tips">您尚未添加公众号，请点击添加</p>
                            <div class="add-weChat">
                                <iframe id="flyerWXAuth" frameborder="0" width="100%" height="100%" scrolling="no"  :src="iframeSrc"></iframe>
                            </div>
                        </div>
                        <div class="available-weChat"  v-else>
                            <download-setting :curNavObj="curNavObjCopy" :pageNum="pageNum" :weChatList="weChatList" :weChatAvailable="weChatAvailable" :templateType="templateType"></download-setting>
                        </div>
                    </div>
                </div>
            </template>
            <template  v-else>
                <div class="modal-body">
                    <div class="downloadStatus" v-show="curNavObj.type === 1">
                        <div v-show="modalState == 'loading'">
                            <loading :loadingType="2" :size="105"></loading>
                            <div class="modal-text">作品正在云端生成中...</div>
                        </div>
                        <div v-show="modalState == 'error'">
                            <img src="data:image/png;base64,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" class="modal-img error">
                            <div class="modal-text">网络异常，请检查网络后重试</div>
                        </div>
                        <div v-show="modalState == 'success'">
                            <img src="data:image/png;base64,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" class="modal-img success">
                            <div class="modal-text" style="color:#555;">作品已自动下载至你本地</div>
                            <div class="modal-text link" @click="download">没开始下载？点此重新下载</div>
                        </div>
                    </div>
                    <div class="download-to-phone" v-show="curNavObj.type === 2">
                        <div v-show="modalState == 'error'">
                            <img src="data:image/png;base64,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" class="modal-img error">
                            <div class="modal-text">网络异常，请检查网络后重试</div>
                        </div>
                    </div>
                    <div class="export-to-site" v-show="[3,4].indexOf(curNavObj.type) != -1">
                        <template v-if="modalState == 'loading'">
                            <div class="exporting" >
                                <div class="export-status-img"></div>
                                <div class="export-status-info">
                                    <div class="export-progress">
                                        <div class="export-progress-bg" :style="{width : barWidth + '%'}">
                                            <div class="export-progress-bar"></div>
                                        </div>
                                    </div>
                                    <div class="export-progress-text">({{exportPercent}} %)</div>
                                </div>
                            </div>
                        </template>
                        <template  v-if="modalState == 'success'">
                            <div class="export-success center">
                                <div class="export-status-img"></div>
                                <div class="export-status-info" v-if="curNavObj.type === 3">已成功导出至“{{openedSiteObj.name}}”</div>
                                <div class="export-status-info" v-else>已成功导出至“{{weChatObj.nick_name}}”</div>
                            </div>
                        </template>
                        <template v-if="modalState == 'error'">
                            <div class="export-fail center">
                                <div class="export-status-img" :class="{active:exportState === 'partialSucc'}" v-if="exportState === 'partialSucc'"></div>
                                <img src="data:image/png;base64,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" class="modal-img error" v-else>
                                <div class="export-status-info">{{failReason}}</div>
                            </div>
                        </template>
                    </div>
                </div>
            </template>
        </div>
        <div class="download-modal-footer">
            <template  v-if="curNavObj.type === 1">
                <div class="modal-btn">
                    <btn class="btn" v-if="modalState == 'normal'" @click="download">点击下载</btn>
                    <btn class="btn close-btn" v-else-if="modalState == 'loading'" @click="close">取消</btn>
                    <div class="view-btn" v-else>
                        <btn class="btn" @click="back">返回</btn>
                        <btn class="btn close-btn" @click="close">关闭</btn>
                    </div>
                </div>
            </template>
            <template  v-else-if="showModalBtn">
                <div class="modal-btn">
                    <btn class="btn" :class="{active:isFromOss}" v-if="modalState == 'normal'" @click="exportWork">导出</btn>
                    <div class="view-btn" v-else-if="modalState == 'success'">
                        <btn class="btn" @click="back">返回</btn>
                        <btn class="btn close-btn" @click="close">关闭</btn>
                    </div>
                    <div v-else>
                        <btn class="btn close-btn" @click="back">返回</btn>
                    </div>
                </div>
            </template>
            <template v-else>
                <div class="modal-btn" v-if="modalState == 'error'">
                    <btn class="btn close-btn" @click="close">关闭</btn>
                </div>
            </template>
        </div>
        <!--<div v-show="!isThirdDesigner && isShowDrainage && getCookie('hasCloseDrainageEdi')!='true'" class="download-drainage" ref="drainage">
            <div class="download-drainage-close" @click.stop="drainageClose"></div>
            <a href="https://i.fkw.com/designer/index.jsp" target="_blank" @click="drainageLog"></a>
        </div>-->
    </Modal>
    `,
    name: 'downloadModal',
    mixins: [Ktu.mixins.dataHandler],
    props: {},
    data() {
        return {
            width: 524,
            barWidth: 0,
            exportPercent: 0,
            modalState: 'normal',
            oldTitle: this.$store.state.msg.title,
            curNavObj: {
                type: 1,
                label: '下载到电脑',
            },
            curNavObjCopy: {},
            curQualityObj: {},
            weChatList: [],
            siteList: [],
            navObj: [{
                type: 1,
                label: '下载到电脑',
            },
            {
                type: 2,
                label: '下载到手机',
            },
            {
                type: 3,
                label: '导出到站点',
            },
            {
                type: 4,
                label: '导出到公众号',
            },
            ],
            failReason: '',
            chargeStatus: 0,
            iframe: null,
            chargeTips: [{ text: '当前作品字体均可商用（仅限可编辑文本）', className: 'canUse', link: false },
                { text: '当前作品字体含有限商用字体，凡科网平台外商用需授权，', className: 'lmtUse', link: true, width: 320 },
                { text: '当前作品字体含不可商用字体，商用须授权，', className: 'needAut', link: true }],
            siteObj: [{
                svgId: '#svg-site',
                title: '凡科建站',
                des: '在线自助建站平台',
                address: 'https://i.jz.fkw.com/?siteId=1&openJzSourceId=97',
            },
            {
                svgId: '#svg-mall',
                title: '凡科商城',
                des: '搭建爆款小程序商城',
                address: 'https://mall.fkw.com/',
            },
            {
                svgId: '#svg-program',
                title: '轻站小程序',
                des: '3分钟制作专属小程序',
                address: 'https://qz.fkw.com/',
            },
            ],
            codeSrc: '',
            hasQRCode: false,
            /* 判断首次是png还是pdf的高度
            firstType: { id: 2, label: 'PNG（含背景）', value: 'png' },*/
            queryModal: false,
            modalAnimate: true,
            // 是否下载完成标记位
            isDownloadEnd: false,
            // 站点是否开通
            siteAvailable: false,
            // 是否关注了公众号
            weChatAvailable: false,
            // 0 首次点击下载到手机 1 正在加载二维码  2 3 二维码未过期 4二维码已过期 5重新获取二维码
            loadCodeStatus: 0,
            // key 代表格式,value 代表切换到某一格式下增加的设置项的高度 1=>jpg 2=>png 3=>pdf 4=>gif 5=>psd 模板下tab切换到站点和公众号
            heightStateByFormat: { 1: 33, 2: 33, 3: 0, 4: 56, 5: 0 },
            // key 代表选择的切图方式, value 代表切换到某种切图增加的设置项的高度 1=>原图 2=>横向 3=>纵向 4=>网格
            heightStateByRule: { 0: 0, 1: 55, 2: 91, 3: 91, 4: 91 },
            // 水印设置项的高度
            heightStateByMark: {
                0: 0,
                1: 35,
            },
            // 切割设置项的高度
            heightStateByCut: {
                0: 0,
                1: 60,
            },
            exportState: '',
            // 当前模板是否是gif模板
            templateType: Ktu.ktuData.isGif ? 'gif' : 'normal',
            isBindWeChat: false,
            hasBindWeChat: false,
            showBindedBtn: false,
            isShowTipModal: false,
        };
    },
    created() {
        Ktu.log('downloadClick');
        this.setConfiguration();
        this.judeyTips();
        this.isHasOpenSite();
        this.isHasPublicAccounts();
        // 预加载 iframe
        this.iframe = document.createElement('iframe');
        this.iframe.src = `${this.getDomain()}/wxAuth.jsp?aid=${Ktu.ktuAid}&_Token=${$('#_TOKEN').attr('value')}`;
        this.iframe.style.display = 'none';
        document.body.appendChild(this.iframe);
    },
    mounted() {
        /* if (this.isShowDrainage && this.getCookie('hasCloseDrainageEdi') != 'true') {
           Ktu.log('designDrainage', 'downloadDrainageS');
           } */
    },
    computed: {
        markSvg() {
            return this.$store.state.data.markSvg;
        },
        isInternalAcct() {
            return Ktu._isInternalAcct;
        },
        // 判断首次是png还是pdf的高度
        firstType: {
            get() {
                if (this.templateType === 'normal') {
                    return { id: 2, label: 'PNG（含背景）', value: 'png' };
                }
                return { value: 'gif' };
            },
            set(obj) {
                return obj;
            },
        },
        isFromOss() {
            return Ktu.isFaier;
        },
        // .nav-active-bar的位置
        position() {
            switch (this.curNavObj.type) {
                case 1:
                    return 0;
                case 2:
                    return 120;
                case 3:
                    return 240;
                case 4:
                    return 367;
            }
        },
        showModalBtn() {
            return (this.curNavObj.type === 3 && this.siteAvailable && this.modalState !== 'loading') || (this.curNavObj.type === 4 && this.weChatAvailable && this.modalState !== 'loading');
        },
        iframeSrc() {
            return `${this.getDomain()}/wxAuth.jsp?aid=${Ktu.ktuAid}&_Token=${$('#_TOKEN').attr('value')}&authorized=false`;
        },
        modalBodyHeight() {
            if (this.modalState === 'normal') {
                if (this.curNavObj.type === 2) {
                    return 372;
                } else if (this.curNavObj.type === 3) {
                    if (!this.siteAvailable) {
                        if (this.pageNum > 1) {
                            return 340;
                        }
                    }
                    if (this.heightState.format === 4) {
                        return 268;
                    }
                    if (this.pageNum > 1) {
                        return 340;
                    }
                    return 305;
                } else if (this.curNavObj.type === 4) {
                    if (this.pageNum > 1) {
                        return 353;
                    }
                    return 305;
                }
                return this.baseHeight
                    + this.heightStateByFormat[this.heightState.format]
                    + this.heightStateByRule[!this.showCutImg ? 0 : this.heightState.rule]
                    + this.heightStateByMark[(this.isShowAdvanced && !this.isAvancedFold) ? 1 : 0]
                    + this.heightStateByCut[(this.isShowSetting || !this.isAvancedFold) && this.showCutImg ? 1 : 0];
            }
            return 414;
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
        // 显示图片导出到哪的链接
        showLink() {
            if (this.modalState === 'normal') {
                if (this.curNavObjCopy.type === 3 && this.siteAvailable) {
                    return true;
                } else if (this.curNavObjCopy.type === 4 && this.weChatAvailable) {
                    return true;
                }
                return false;
            }
            return false;
        },
        heightState() {
            return this.$store.state.modal.heightState;
        },
        formatObj: {
            get() {
                return this.$store.state.modal.formatObj;
            },
            set(obj) {
                this.$store.state.modal.formatObj = obj;
            },
        },
        qualityObj: {
            get() {
                return this.$store.state.modal.qualityObj;
            },
            set(value) {
                this.$store.state.modal.qualityObj = value;
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
        isShowSetting: {
            get() {
                return this.$store.state.modal.isShowSetting;
            },
            set(value) {
                this.$store.state.modal.isShowSetting = value;
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
        nowTitle() {
            return this.$store.state.modal.nowTitle;
        },
        pageValue: {
            get() {
                return this.$store.state.modal.pageValue;
            },
            set(value) {
                this.$store.state.modal.pageValue = value;
            },
        },

        showDownloadModal: {
            get() {
                return this.$store.state.modal.showDownloadModal;
            },
            set(newValue) {
                this.timer && clearInterval(this.timer);
                this.$store.commit('modal/downloadModalState', newValue);
                this.iframe && document.body.contains(this.iframe) && document.body.removeChild(this.iframe);
                if (!newValue) {
                    const ktuMessage = document.getElementsByClassName('ktu-message')[0];
                    if (ktuMessage) {
                        ktuMessage.style.display = 'none';
                        ktuMessage.style.top = '24px';
                        setTimeout(() => {
                            ktuMessage.style.display = 'block';
                        }, 3000);
                    }
                }
            },
        },
        /* 下载作品loading状态
           downloadLoadingStatus: {
           get: function () {
           return this.$store.state.modal.downloadLoadingStatus;
           },
           set: function (newValue) {
           this.$store.state.modal.downloadLoadingStatus = newValue;
           }
           },
           作品页面数 */
        pageNum() {
            return Ktu.ktuData.tmpContents.length;
        },
        tailorRuleObj: {
            get() {
                return this.$store.state.modal.tailorRuleObj;
            },
            set(value) {
                this.$store.state.modal.tailorRuleObj = value;
            },
        },
        fontFaimly() {
            const obj = {};
            Ktu.config.tool.options.fontFaimlyList.forEach(item => {
                obj[item.value] = item;
            });
            return obj;
        },
        fontIdArray() {
            const fontIdArr = [];
            const obj = {};
            const newArr = [];
            let forEachArr = [];
            if (this.pageValue == 1) {
                forEachArr = [Ktu.selectedTemplateData];
            } else {
                forEachArr = Ktu.templateData;
            }
            forEachArr.forEach(item => {
                const {
                    objects,
                } = item;
                objects.forEach(objItem => {
                    if (objItem.type === 'textbox' || objItem.type === 'wordart' || objItem.type === 'threeText') {
                        objItem.ftFamilyList.forEach(fontItem => {
                            fontIdArr.push(fontItem.fontid);
                        });
                    } else if (objItem.type === 'group') {
                        objItem.objects.forEach(groupItem => {
                            if (groupItem.type === 'textbox' || groupItem.type === 'wordart' || groupItem.type === 'threeText') {
                                groupItem.ftFamilyList.forEach(fontItem => {
                                    fontIdArr.push(fontItem.fontid);
                                });
                            } else if (groupItem.type === 'wordCloud') {
                                if (groupItem.msg.shapeMode == 1) {
                                    fontIdArr.push(groupItem.msg.textareaFontId);
                                }
                                groupItem.msg.tableData.forEach(fontItem => {
                                    fontIdArr.push((fontItem.fontId === -10 ? groupItem.msg.importFontId : fontItem.fontId));
                                });
                            } else if (groupItem.type === 'table') {
                                groupItem.msg.tableData.dataList.forEach(row => {
                                    row.forEach(cell => {
                                        const fontId = cell.object.ftFamilyList[0].fontid;
                                        fontIdArr.push(fontId ? fontId : 58);
                                    });
                                });
                            }
                        });
                    } else if (objItem.type === 'wordCloud') {
                        if (objItem.msg.shapeMode == 1) {
                            fontIdArr.push(objItem.msg.textareaFontId);
                        }
                        objItem.msg.tableData.forEach(fontItem => {
                            fontIdArr.push((fontItem.fontId === -10 ? objItem.msg.importFontId : fontItem.fontId));
                        });
                    } else if (objItem.type === 'table') {
                        objItem.msg.tableData.dataList.forEach(row => {
                            row.forEach(cell => {
                                const fontId = cell.object.ftFamilyList[0].fontid;
                                fontIdArr.push(fontId ? fontId : 58);
                            });
                        });
                    }
                });
            });
            // 去重
            fontIdArr.forEach((item, i) => {
                if (!obj[item]) {
                    newArr.push(item);
                    obj[item] = 1;
                }
            });
            return newArr;
        },
        needAutArr() {
            const arr = [];
            this.fontIdArray.forEach((item, i) => (this.fontFaimly[item].isCharge == 2 ? arr.push(this.fontFaimly[item].label) : ''));
            return arr;
        },
        lmtUseArr() {
            const arr = [];
            this.fontIdArray.forEach((item, i) => (this.fontFaimly[item].isCharge == 1 ? arr.push(this.fontFaimly[item].label) : ''));
            return arr;
        },
        isShowDrainage: {
            get() {
                return this.$store.state.data.isShowDrainage;
            },
            set(value) {
                this.$store.state.data.isShowDrainage = value;
            },
        },
        isThirdDesigner() {
            return Ktu.isThirdDesigner;
        },
        isAvancedFold: {
            get() {
                return this.$store.state.modal.isAvancedFold;
            },
            set(value) {
                this.$store.state.modal.isAvancedFold = value;
            },
        },
    },
    watch: {
        curNavObj(obj) {
            // 在没有开通任何站点的情况下每切换一个tab都判断是否开通了站点
            if (!this.siteAvailable) {
                this.isHasOpenSite();
            }
            this.modalState = 'normal';
            this.hasQRCode = false;
            if (this.templateType === 'normal') {
                this.qualityObj = { label: '高清', type: 2 };
            } else {
                this.qualityObj = { label: 'GIF原图', type: 0, gifType: 333 };
            }
            if (obj.type === 1) {
                this.formatObj = this.firstType;
            } else if (obj.type === 2) {
                Ktu.simpleLogObjDog('exportWork', 'downloadToPhone');
                this.formatObj = {};
                if (this.loadCodeStatus > 0) {
                    this.qualityObj = this.curQualityObj;
                    this.pageValue = this.curPageValue;
                }
                if (this.loadCodeStatus === 0) {
                    // this.hasQRCode = true;
                    this.pageValue = 0;
                    this.getQRCode();
                }
            } else {
                // 判断是否添加了公众号
                if (obj.type === 4) {
                    this._timer && clearTimeout(this._timer);
                    this.isHasPublicAccounts();
                }
                if (Ktu.ktuData.isGif) {
                    this.formatObj = { value: 'gif' };
                } else {
                    this.formatObj = { id: 2, label: 'PNG（含背景）', value: 'png' };
                }
            }
        },

        formatObj(obj) {
            if (this.curNavObj.type != 2) {
                this.pageValue = 0;
            }
            this.heightState.rule = 1;
            this.tailorRuleObj = {};

            const templateScale = Ktu.ktuData.other.height / Ktu.ktuData.other.width;
            if (templateScale >= 2.5 && this.curNavObj.type == 1) {
                this.isShowSetting = true;
                this.heightState.showSetting = 1;
            } else {
                this.isShowSetting = false;
                this.heightState.showSetting = 0;
            }

            // 默认关闭更多功能
            this.isAvancedFold = true;

            switch (obj.value) {
                case 'jpg':
                    this.heightState.format = 1;
                    break;
                case 'png':
                    this.heightState.format = 2;
                    break;
                case 'pdf':
                    Ktu.template.clearMarkData();
                    this.heightState.format = 3;
                    break;
                case 'gif':
                    Ktu.template.clearMarkData();
                    if ([3, 4].indexOf(this.curNavObj.type) != -1) {
                        this.heightState.format = 4;
                    } else {
                        this.heightState.format = 5;
                    }
                    break;
                case 'psd':
                    Ktu.template.clearMarkData();
                    this.heightState.format = 5;
                    this.pageValue = 1;
                    break;
            }
        },

        pageValue(val, old) {
            if (this.curNavObj.type === 2) {
                if (this.hasQRCode && this.loadCodeStatus > 2) {
                    this.loadCodeStatus = 5;
                    this.countdown();
                }
            }
            this.judeyTips();
        },

        qualityObj(val) {
            if (this.curNavObj.type === 2) {
                if (this.hasQRCode && this.loadCodeStatus > 2) {
                    this.loadCodeStatus = 5;
                    this.countdown();
                } else {
                    this.hasQRCode = true;
                }
            }
        },
    },
    methods: {
        closeTipModal() {
            $('.ktu-modal-mask').css('opacity', 1);
            this.isShowTipModal = false;
        },
        changeBindStatus() {
            if (this.loadCodeStatus === 5 && !this.isShowTipModal) {
                return;
            }
            this.showBindedBtn = !this.showBindedBtn;
            if (this.showBindedBtn ^ this.isShowTipModal) {
                this.isShowTipModal = !this.isShowTipModal;
                if (this.isShowTipModal) {
                    $('.ktu-modal-mask').css('opacity', 0);
                } else {
                    $('.ktu-modal-mask').css('opacity', 1);
                }
            }
            this.loadCodeStatus = 5;
            this.countdown();
        },
        setConfiguration() {
            this.curNavObjCopy = this.curNavObj;
            if (this.templateType === 'normal') {
                this.qualityObj = { label: '高清', type: 2 };
            } else {
                this.qualityObj = { label: 'GIF原图', type: 0, gifType: 333 };
            }
            this.curQualityObj = this.qualityObj;
            this.curPageValue = 0;
            if (this.pageNum > 1) {
                this.baseHeight = 257;
            } else if (this.templateType === 'normal') {
                this.baseHeight = 209;
            } else {
                this.baseHeight = 217;
            }
            if (Ktu.ktuData.other.unit != 1) {
                this.formatObj = { id: 4, label: 'PDF印刷', value: 'pdf' };
                this.firstType = JSON.parse(JSON.stringify(this.formatObj));
            } else {
                this.formatObj = this.firstType;
            }
        },

        clickLink() {
            Ktu.simpleLogObjDog('exportWork', 'clickLink');
        },

        changeTab(navObj) {
            if (this.modalState === 'loading') {
                if (this.curNavObj.type === 1) {
                    this.$Notice.warning('正在生成作品，请稍等');
                } else {
                    this.$Notice.warning('正在导出作品，请稍等');
                }
                return;
            }
            // 由下载到手机转换到其他tab,记录当前图片质量对象与下载页面
            if (this.curNavObj.type === 2) {
                this.curQualityObj = this.qualityObj;
                this.curPageValue = this.pageValue;
            }
            this.curNavObjCopy = {};
            this.curNavObj = navObj;
            setTimeout(() => {
                this.curNavObjCopy = this.curNavObj;
            }, 300);
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
        getQRCode() {
            this.loadCodeStatus = 1;
            this.countdown();
        },
        getNewQRCode() {
            Ktu.simpleLogObjDog('exportWork', 'getNewQRCode');
            this.loadCodeStatus = 5;
            this.countdown();
        },
        countdown() {
            this.timer && clearTimeout(this.timer);
            const imageType = this.templateType === 'normal' ? '' : 'gif';
            const src = '../ajax/ktuFile_h.jsp?cmd=uploadToWX';
            const image = new Image();
            axios.post(src, {
                type: imageType,
                ktuId: Ktu.ktuId,
                pageId: `[${this.pageValue === 1 ? Ktu.template.currentpageId : Ktu.ktuData.content}]`,
                title: this.nowTitle,
                quality: this.qualityObj.type,
                gifType: this.qualityObj.gifType,
                bind: this.showBindedBtn,
            }).then(res => {
                const result = res.data;
                this.hasBindWeChat = !result.needBind && !result.checkBind;
                if (result.base64) {
                    image.onload = () => {
                        this.loadCodeStatus = 2;
                        setTimeout(() => {
                            // 10分钟之后二维码失效
                            let maxTime = 600;
                            this.loadCodeStatus = 3;
                            this.timer = setInterval(() => {
                                --maxTime;
                                if (maxTime === 0) {
                                    this.loadCodeStatus = 4;
                                    clearInterval(this.timer);
                                }
                            }, 1000);
                        }, 0);
                    };
                    this.codeSrc = result.base64;
                    image.src = this.codeSrc;
                } else {
                    this.loadCodeStatus = 3;
                    this.codeSrc = '';
                }
            })
                .catch(err => {
                    console.log(err);
                    this.modalState = 'error';
                    this.loadCodeStatus = 0;
                });
        },
        // 查看字体
        showQueryModal() {
            this.$store.commit('base/changeState', {
                prop: 'FontAutObj',
                value: {
                    needAut: this.needAutArr,
                    lmtUse: this.lmtUseArr,
                },
            });
            this.$store.commit('modal/fontAuthorizationModalState', true);
        },
        judeyTips() {
            let num = 0;
            this.fontIdArray.forEach((item, i) => {
                const {
                    isCharge,
                } = this.fontFaimly[item];
                if (isCharge == 2 || isCharge == 1) {
                    // 获取状态值 2 -- 需要权限  1-- 限制使用    状态值 2>1 显示2
                    num = isCharge > num ? isCharge : num;
                }
            });
            this.chargeStatus = num;
        },
        // 先获取所有图层的textbox的字体id。

        //  a标签下载
        downloadFile(src, type) {
            const $a = document.createElement('a');
            $a.setAttribute('href', src);
            // 重命名，去掉版本号，解决safari浏览器文件格式为dms的问题
            $a.setAttribute('download', decodeURIComponent(src).split('f=')[1].split('&v')[0]);
            document.documentElement.appendChild($a);
            $a.click();
            document.documentElement.removeChild($a);
            Ktu.simpleLogObjDog('downloadSuccObj', type);
            Ktu.simpleLogObjDog('downloadSuccObjGroup', type);
            Ktu.simpleLog('downloadSucc', type);
            Ktu.simpleLog('downloadSuccGroup', type);
            Ktu.simpleLog('downloadNum', this.pageValue == 1 ? 'single' : 'all');
            this.updateTitle();
            this.modalState = 'success';
            // log字体ID
            this.fontIdArray.forEach(id => {
                Ktu.simpleLog('downloadFontFamily', id);
            });
            // 开通未满七天 || 开通满七天并且下载次数<3 || 已经做过满意度调查（包括点击了不再提示） 三种情况不弹出弹窗
            const downloadCount = $.cookie('downloadCount');
            if (downloadCount) {
                $.cookie('downloadCount', parseInt(downloadCount, 10) + 1, {
                    expires: 365,
                    path: '/',
                });
            } else {
                $.cookie('downloadCount', 1, {
                    expires: 365,
                    path: '/',
                });
            }
            const isNotShowNPSModal = $.cookie('isNotShowNPSModal');
            if (downloadCount >= 3 && !isNotShowNPSModal) {
                this.isNeedPopupModal();
            }
        },

        isNeedPopupModal() {
            const src = '/ajax/ktuSurvey_h.jsp?cmd=getSurvey';
            axios.post(src, {
                _TOKEN: $('#_TOKEN').attr('value'),
            }).then(res => {
                const result = res.data;
                if (result.success && result.needPopup) {
                    this.$store.commit('modal/collectNPSModalState', true);
                }
            })
                .catch(err => {
                    console.log(err);
                });
            return false;
        },
        downloadByIsDebug() {
            if (JSON.stringify(this.tailorRuleObj) != '{}' && (!this.tailorRuleObj.crossAvailable || !this.tailorRuleObj.verticalAvailable)) {
                this.tailorRuleObj.crossAvailable = true;
                this.tailorRuleObj.verticalAvailable = true;
                return;
            }
            this.modalState = 'loading';
            const type = this.templateType === 'normal' ? this.formatObj.value : 'gif';
            const src = `/ajax/ktuFile_h.jsp?cmd=generateDownLoadFile&ktuAid=${Ktu.ktuAid}`;
            const pageId = this.pageValue === 1 || type === 'psd' ? Ktu.template.currentpageId : 0;
            axios.post(src, {
                type,
                ktuId: Ktu.ktuId,
                pageId,
                title: this.nowTitle,
                hideBg: this.formatObj.id === 3,
                quality: this.qualityObj.type,
                cross: this.tailorRuleObj.cross || 0,
                vertical: this.tailorRuleObj.vertical || 0,
                gifType: this.qualityObj.gifType,
                watermarkSvg: this.markSvg,
            }).then(res => {
                const result = (res.data);
                if (result.success) {
                    if (!this.showDownloadModal) return;
                    this.downloadFile(result.filePath, type);
                    // code 0:还没获取到下载文件  1:获取到了  2:系统异常了
                } else if (!result.success && 0 === parseInt(result.code, 10)) {
                    //  轮询是否下载完成 20190507
                    window.setTimeout(() => {
                        //  暂定5s 且只轮询 5min
                        const startTime = new Date().getTime();
                        const timer = window.setInterval(() => {
                            console.log('timer start......');
                            axios.post('/ajax/ktuFile_h.jsp?cmd=getDownloadTask', {
                                type,
                                ktuId: Ktu.ktuId,
                                pageId,
                                title: this.nowTitle,
                                hideBg: this.formatObj.id === 3,
                                quality: this.qualityObj.type,
                                cross: this.tailorRuleObj.cross || 0,
                                vertical: this.tailorRuleObj.vertical || 0,
                                gifType: this.qualityObj.gifType,
                            }).then(res => {
                                const result = res.data;
                                console.log('timer result', result);
                                if (result.success && 1 === parseInt(result.code, 10)) {
                                    window.clearInterval(timer);
                                    console.log('我获取下载文件完啦');
                                    if (!this.showDownloadModal) return;
                                    this.downloadFile(result.filePath, type);
                                } else if (!result.success && 0 === parseInt(result.code, 10)) {
                                    // 还没获取到 继续轮询
                                    console.log('我还没获取到呀');
                                } else if (!result.success && 2 === parseInt(result.code, 10)) {
                                    //  获取异步任务异常
                                    console.log('获取下载文件异常啦!');
                                    this.modalState = 'error';
                                    window.clearInterval(timer);
                                }
                            })
                                .catch(err => {
                                    this.modalState = 'error';
                                    console.err('getDownloadTask err', err);
                                    window.clearInterval(timer);
                                });
                            if (!this.showDownloadModal) {
                                window.clearInterval(timer);
                            }
                            //  只轮询 5min
                            const endTime = new Date().getTime();
                            if (endTime - startTime >= 1000 * 60 * 5 && this.showDownloadModal) {
                                this.modalState = 'error';
                                window.clearInterval(timer);
                            }
                        }, 5000);
                    }, 100);
                } else if (!result.success && 2 === parseInt(result.code, 10)) {
                    this.modalState = 'error';
                }
            })
                .catch(err => {
                    console.log(err);
                    this.modalState = 'error';
                })
                .finally(() => {
                    Ktu.fdp.download(type);
                });
        },

        checkAuthorizerFlag() {
            if (!this.weChatAvailable && this.curNavObj.type === 4 && this.showDownloadModal) {
                const src = '/ajax/ktuFile_h.jsp?cmd=checkAuthorizerFlag';
                axios.post(src, {}).then(res => {
                    const result = res.data;
                    if (result.success && result.flag) {
                        this.isHasPublicAccounts();
                        clearTimeout(this._timer);
                    }
                })
                    .catch(err => {
                        console.log(err);
                    });
                this._timer = setTimeout(this.checkAuthorizerFlag, 3000);
            }
        },
        //  废弃
        downloadByIsNotDebug() {
            this.modalState = 'loading';
            const {
                modal,
            } = this.$refs;
            const modalBody = $(modal.$el).find('.ktu-modal-body');
            modalBody.css('height', 330);

            const type = this.formatObj.value;
            // const token = $('#_TOKEN').attr('value');

            const src = `/ajax/ktuFile_h.jsp?cmd=generateDownLoadFile&ktuAid=${Ktu.ktuAid}`;
            axios.post(src, {
                type,
                ktuId: Ktu.ktuId,
                pageId: this.pageValue == 1 ? Ktu.template.currentpageId : 0,
                title: this.nowTitle,
                hideBg: this.bgValue == 1,
            }).then(res => {
                const result = (res.data);
                if (result.success) {
                    if (!this.showDownloadModal) return;
                    const src = result.filePath;
                    const $a = document.createElement('a');
                    $a.setAttribute('href', src);
                    $a.setAttribute('download', decodeURIComponent(src));
                    document.documentElement.appendChild($a);
                    $a.click();
                    document.documentElement.removeChild($a);

                    Ktu.simpleLogObjDog('downloadSuccObj', type);
                    Ktu.simpleLogObjDog('downloadSuccObjGroup', type);
                    Ktu.simpleLog('downloadSucc', type);
                    Ktu.simpleLog('downloadSuccGroup', type);
                    Ktu.simpleLog('downloadNum', this.pageValue == 1 ? 'single' : 'all');
                    this.updateTitle();
                    this.modalState = 'success';
                    // log字体ID
                    this.fontIdArray.forEach(id => {
                        Ktu.simpleLog('downloadFontFamily', id);
                    });
                } else {
                    this.modalState = 'error';
                }
            })
                .catch(err => {
                    this.modalState = 'error';
                });
        },
        download() {
            //  20190624 改新逻辑
            this.downloadByIsDebug();
            /* const url = `/ajax/ktuFile_h.jsp?cmd=getIsDebug`;
               const ktuAid = Ktu.ktuAid || 0;
               console.log(ktuAid);
               axios.post(url, {
               }).then(res => {
               const result = res.data;
               if ((result.success && result.isDebug) || ktuAid < 100000) {
               this.downloadByIsDebug();
               } else {
               this.downloadByIsNotDebug();
               }
               }).catch(err => {
               this.downloadByIsNotDebug();
               }); */
        },
        exportWork() {
            if (this.isFromOss) {
                this.$Notice.warning('没有权限');
                return;
            }
            this.modalState = 'loading';
            const self = this;
            const imageType = this.templateType === 'normal' ? this.formatObj.value : 'gif';
            const timer = setInterval(() => {
                self.exportPercent++;
                self.barWidth++;
                if (self.exportPercent >= 99) {
                    clearInterval(timer);
                }
            }, 6);
            if (this.curNavObj.type === 3) {
                const src = '/ajax/ktuFile_h.jsp?cmd=uploadToSite';
                axios.post(src, {
                    maxWidth: 16384,
                    maxHeight: 16384,
                    imgMode: 2,
                    ktuId: Ktu.ktuId,
                    siteId: this.openedSiteObj.siteid,
                    comeFrom: this.openedSiteObj.siteType,
                    title: this.nowTitle || '未命名文件',
                    type: imageType,
                    aid: this.openedSiteObj.wxappAid,
                    hideBg: this.formatObj.id === 3,
                    pageId: this.pageValue === 1 ? JSON.stringify([Ktu.template.currentpageId]) : JSON.stringify(Ktu.ktuData.content),
                    limitM: this.openedSiteObj.limitM,
                    quality: this.qualityObj.type,
                    gifType: this.qualityObj.gifType,
                }).then(res => {
                    const result = res.data;
                    clearInterval(timer);
                    this.exportPercent = 0;
                    this.barWidth = 0;
                    if (this.formatObj.value === 'gif') {
                        Ktu.simpleLogObjDog('exportWork', 'downloadGifToSite');
                    } else if (this.formatObj.value === 'jpg') {
                        Ktu.simpleLogObjDog('exportWork', 'selectJPG');
                    } else {
                        if (this.bgValue) {
                            Ktu.simpleLogObjDog('exportWork', 'selectPNG_noBg');
                        } else {
                            Ktu.simpleLogObjDog('exportWork', 'selectPNG');
                        }
                    }
                    let siteType = '';
                    switch (this.openedSiteObj.siteType) {
                        case 1:
                            siteType = '凡科建站';
                            Ktu.simpleLogObjDog('exportWork', 'selectSite');
                            break;
                        case 2:
                            siteType = '凡科商城';
                            Ktu.simpleLogObjDog('exportWork', 'selectMall');
                            break;
                        case 3:
                            siteType = '轻站小程序';
                            Ktu.simpleLogObjDog('exportWork', 'selectProgram');
                            break;
                    }
                    if (result.success && !result.error) {
                        this.updateTitle();
                        this.modalState = 'success';
                    } else if ((result.success && result.error) || !result.success) {
                        switch (result.reason.priority) {
                            case 1:
                                this.failReason = `系统错误，`;
                                break;
                            case 2:
                                this.failReason = `${siteType}当前版本仅支持${this.openedSiteObj.limitM}M内的图片，`;
                                break;
                            case 3:
                                this.failReason = `图片数量已满，`;
                                break;
                            case 4:
                                this.failReason = `站点容量已满，`;
                                break;
                        }
                        if (result.reason.num === Ktu.ktuData.content.length) {
                            this.failReason += '导出失败';
                        } else {
                            this.failReason += `${result.reason.num}张图片导出失败`;
                        }
                        this.updateTitle();
                        this.modalState = 'error';
                        this.exportState = 'partialSucc';
                    }
                })
                    .catch(err => {
                        this.failReason = '导出失败,请检查网络后重试';
                        this.modalState = 'error';
                    });
            } else {
                const src = '/ajax/ktuFile_h.jsp?cmd=uploadToWXAuthorizer';
                axios.post(src, {
                    authorizer_appid: this.weChatObj.appid,
                    comeFrom: this.weChatObj.comeFrom,
                    siteId: this.weChatObj.siteId || 1,
                    ktuId: Ktu.ktuId,
                    pageId: this.pageValue === 1 ? JSON.stringify([Ktu.template.currentpageId]) : JSON.stringify(Ktu.ktuData.content),
                    title: this.nowTitle || '未命名文件',
                    type: imageType,
                    hideBg: this.formatObj.id === 3,
                    quality: this.qualityObj.type,
                    gifType: this.qualityObj.gifType,
                }).then(res => {
                    const result = res.data;
                    clearInterval(timer);
                    this.exportPercent = 0;
                    this.barWidth = 0;
                    if (result.success && !result.error) {
                        this.updateTitle();
                        this.modalState = 'success';
                    } else if ((result.success && result.error) || !result.success) {
                        switch (result.reason.priority) {
                            case 2:
                                this.failReason = `上传的图片大于2M，${result.reason.num}张图片导出失败`;
                                break;
                            default:
                                this.failReason = `系统错误，${result.reason.num}张图片导出失败`;
                                break;
                        }
                        this.updateTitle();
                        this.modalState = 'error';
                        this.exportState = 'partialSucc';
                    }
                })
                    .catch(err => {
                        this.failReason = '导出失败,请检查网络后重试';
                        this.modalState = 'error';
                    });
            }
        },
        updateTitle() {
            if (this.oldTitle == this.nowTitle) return;
            axios.post('/ajax/ktu_h.jsp?cmd=setOther', {
                title: this.nowTitle,
                ktuId: Ktu.ktuId,
            }).then(res => {
                const result = (res.data);
                if (result.success) {
                    this.$store.commit('msg/update', {
                        prop: 'title',
                        value: this.nowTitle,
                    });
                    document.title = `${this.nowTitle}-凡科快图`;
                    Ktu.ktuData.other.title = this.nowTitle;
                    Ktu.log('downloadUpdateTitle');
                }
            })
                .catch(err => {
                    this.$Notice.error('服务繁忙，请稍后再试。');
                });
        },
        close() {
            this.showDownloadModal = false;
        },
        back() {
            this.modalState = 'normal';
        },
        isHasOpenSite() {
            const src = '/ajax/ktuFile_h.jsp?cmd=getOtherSite';
            axios.post(src, {
                _TOKEN: $('#_TOKEN').attr('value'),
            }).then(res => {
                const result = res.data;
                if (result.success) {
                    if (!result.list.length) {
                        this.siteAvailable = false;
                        return;
                    }
                    this.siteAvailable = true;
                    this.siteList = result.list;
                    this.openedSiteObj = this.siteList[0];
                }
            })
                .catch(err => {
                    console.log(err);
                });
        },
        isHasPublicAccounts() {
            const src = '/ajax/ktuFile_h.jsp?cmd=getAuthorizerList';
            axios.post(src, {}).then(res => {
                const result = res.data;
                if (result.success) {
                    if (!result.list.length) {
                        this.weChatAvailable = false;
                        this.checkAuthorizerFlag();
                        return;
                    }
                    this.weChatAvailable = true;
                    this.weChatList = result.list;
                    this.weChatObj = this.weChatList[0];
                }
            })
                .catch(err => {
                    console.log(err);
                });
        },
        getCookie(name) {
            const arr = document.cookie.match(new RegExp(`(^| )${name}=([^;]*)(;|$)`));
            if (arr != null) {
                return unescape(arr[2]);
            }
            return null;
        },
        drainageClose(event) {
            this.isShowDrainage = false;
            this.$refs.drainage.style.display = 'none';

            const closeCountEdi = $.cookie('closeCountEdi');
            if (closeCountEdi) {
                $.cookie('closeCountEdi', parseInt(closeCountEdi, 10) + 1, {
                    expires: 365,
                });
            } else {
                $.cookie('closeCountEdi', 1, {
                    expires: 365,
                });
            }
            if (parseInt($.cookie('closeCountEdi'), 10) < 3) {
                const curDate = new Date();
                const curTime = curDate.getTime();
                // 当日凌晨的时间戳,减去一毫秒是为了防止后续得到的时间不会达到00:00:00的状态
                const curWeeHours = new Date(curDate.toLocaleDateString()).getTime() - 1;
                // 当日已经过去的时间（毫秒）
                const passedTamp = curTime - curWeeHours;
                // 当日剩余时间
                const leftTamp = 24 * 60 * 60 * 1000 - passedTamp;
                const leftTime = new Date();
                leftTime.setTime(leftTamp + curTime);

                /* var testTime = curTime+5*1000
                   var testNextTime = new Date();
                   testNextTime.setTime(testTime);
                   创建cookie */
                document.cookie = `${'hasCloseDrainageEdi' + '='}${escape('true')};expires=${leftTime.toGMTString()}`;
            } else {
                $.cookie('hasCloseDrainageEdi', 'true', {
                    expires: 365,
                });
            }
        },
        drainageLog() {
            Ktu.log('designDrainage', 'downloadDrainageC');
        },
        /* isHasGifMaterial() {
            const { objects } = Ktu.selectedTemplateData;
            if (Ktu.ktuData.isGif) {
                for (let i = 0; i < objects.length; i++) {
                    if (objects[i].type != 'cimage') {
                        continue;
                    } else if (objects[i].imageType !== 'gif') {
                        continue;
                    } else {
                        this.templateType = 'gif';
                        break;
                    }
                }
            }
        },*/
    },
});
