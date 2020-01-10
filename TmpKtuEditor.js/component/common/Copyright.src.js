Vue.component('copyright', {
    template: `
    <div class="material-item-copyright" :style="position" @click.stop @mouseenter="enter" @mouseleave="close">
        <div v-if="copyRightId" class="material-item-copyright-line">
            ID：<div class="copyright-modal-id-text" ref="modalId">{{copyRightId}}</div>
            <div class="copyright-modal-id-btn" @click="copyModalId">
                <svg class="svg-icon">
                    <use xlink:href="#svg-ele-modal-identifier"></use>
                </svg>
            </div>
        </div>
        <div v-else class="material-item-copyright-line">ID：{{item.id}}</div>
        <div class="material-item-copyright-line">版权：{{item.comeFrom | copyright}}</div>
        <div class="material-item-copyright-des" v-if="copyrightArr.indexOf(item.comeFrom) > -1">{{item.comeFrom | copyrightDes}}</div>
        <div class="material-item-copyright-des" v-else>本素材由网友上传，仅供学习交流，<span style="color:#f04134;">请谨慎用于商业用途</span></div>
    </div>
    `,
    props: {
        item: Object,
        position: Object,
    },
    data() {
        return {
            copyrightArr: [0, 1, 4],
        };
    },
    computed: {
        copyRightId() {
            return this.item.identifier;
        },
    },
    filters: {
        copyright(value) {
            let str = '';
            switch (value) {
                case 0 :
                    str = '凡科网原创';
                    break;
                case 1 :
                    str = 'CC0';
                    break;
                case 4 :
                    str = '第三方';
                    break;
                default :
                    str = '网友上传';
                    break;
            }
            return str;
        },
        copyrightDes(value) {
            let str = '';
            switch (value) {
                case 0 :
                    str = '本素材由凡科网官方制作，可在凡科网平台内应用于商业用途';
                    break;
                case 1 :
                    str = 'CC0知识共享协议素材，可应用于商业用途';
                    break;
                case 4 :
                    str = '凡科网已向第三方购买版权，可在凡科网平台内应用于商业用途';
                    break;
            }
            return str;
        },
    },
    methods: {
        enter() {
            this.$emit('enter');
        },
        close() {
            this.$emit('close');
        },
        copyModalId() {
            const text = this.$refs.modalId;
            if (document.body.createTextRange) {
                const range = document.body.createTextRange();
                range.moveToElementText(text);
                range.select();
            } else if (window.getSelection) {
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(text);
                selection.removeAllRanges();
                selection.addRange(range);
            }
            // document.execCommand('Copy');
            document.execCommand('copy');
            this.$Notice.success('已复制模板ID');
        },
    },
});
