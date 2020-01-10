Vue.component('share-modal', {
    template: `
    <modal class="manageModal share-modal" :class="{'banShare':banShare}" :width="width" v-model="showShareModal">
        <template v-if="banShare">
            <div class="block-tip">
                <div class="block-img"></div>
                <div class="block-text">{{shareInfo.msg}}</div>
            </div>
            <div class="btn-box">
                <btn class="btn">
                    <a class="btn-link" style="display:block;width:100%;height:100%;" href="http://www.fkw.com/feedback/feedback.html?t=3&p=7&d=true" target="_blank">申诉</a>
                </btn>
                <btn @click="cancel" class="btn cancel" type="cancel">取消</btn>
            </div>
        </template>
        <template v-else>
            <header class="ktu-modal-header">
                {{this.isUserB? '转发' : '分享'}}
            </header>
            <svg class="svg-icon" @click="cancel">
                <use xlink:href="#svg-close-icon"></use>
            </svg>
            <div class="container">
                <div class="left">
                    <div class="link-box">
                        <input class="link ellipsis" type="text" readonly :value="shareInfo.url" @focus="linkFocus">
                        <div class="copy-btn" @click="copy">复制链接</div>
                    </div>
                    <div class="check-box-container">
                        <div class="check-inblock" :class="shareInfo.canCopy ? 'is-checked' : ''">
                            <svg class="svg-icon" @click="setCopy">
                                <use xlink:href="#svg-check-true"></use>
                            </svg>
                            <label>
                                <input type="checkbox" :checked="shareInfo.canCopy" @change="setCopy(shareInfo.canCopy)">
                                </input>
                                允许复制
                            </label>
                        </div>
                        <div class="check-inblock" :class="shareInfo.canDownload ? 'is-checked' : ''">
                            <svg class="svg-icon" @click="setDownload">
                                <use xlink:href="#svg-check-true"></use>
                            </svg>
                            <label>
                                <input type="checkbox" :checked="shareInfo.canDownload" @change="setDownload(shareInfo.canDownload)">
                                </input>
                                允许下载
                            </label>
                        </div>
                    </div>
                </div>
                <div class="right">
                    <img class="img" :src="miniCode">
                    <p>微信扫一扫{{this.isUserB? '转发' : '分享'}}</p>
                </div>
            </div>
        </template>
    </modal>
    `,
    name: 'shareModal',
    props: {
    },
    data() {
        return {
            width: 0,
            miniCode: `/ajax/wxaQrcode.jsp?cmd=wxaQrcode&ktuId=${Ktu.ktuId}&ktuAid=${Ktu.ktuAid}&_TOKEN=${Ktu.initialData.token}`,
        };
    },
    computed: {
        showShareModal: {
            get() {
                return this.$store.state.modal.showShareModal;
            },
            set(newValue) {
                this.$store.commit('modal/shareModalState', newValue);
            },
        },
        shareInfo() {
            return this.$store.state.data.shareInfo;
        },
        banShare() {
            return this.shareInfo.closeKtu || this.shareInfo.closeAccount;
        },
        isUserB() {
            return Ktu._isUserB;
        },
    },
    mounted() {
        this.width = this.banShare ? 500 : 610;
    },
    methods: {
        // 点击 全选链接
        linkFocus(event) {
            event.target.select();
        },
        copy() {
            let tmpInput = document.createElement('textarea');
            tmpInput.value = this.shareInfo.url;
            document.body.appendChild(tmpInput);
            // 选择对象
            tmpInput.select();
            // 执行浏览器复制命令
            document.execCommand('Copy');
            tmpInput.remove();
            tmpInput = null;
            this.$Notice.success('复制成功');
        },
        setCopy(value) {
            const url = '/ajax/ktu_h.jsp?cmd=setKtuCopy';
            axios.post(url, {
                ktuId: Ktu.ktuId,
            }).then(res => {
                const result = (res.data);
                if (result.success) {
                    this.shareInfo.canCopy = !this.shareInfo.canCopy;
                }
            })
                .catch(err => {
                    this.$Notice.error('服务繁忙，请稍后再试。');
                });
        },
        cancel() {
            this.showShareModal = false;
        },
        setDownload(value) {
            const url = '/ajax/ktu_h.jsp?cmd=setKtuDownload';
            axios.post(url, {
                ktuId: Ktu.ktuId,
            }).then(res => {
                const result = (res.data);
                if (result.success) {
                    this.shareInfo.canDownload = !this.shareInfo.canDownload;
                }
            })
                .catch(err => {
                    this.$Notice.error('服务繁忙，请稍后再试。');
                });
        },
    },
});

