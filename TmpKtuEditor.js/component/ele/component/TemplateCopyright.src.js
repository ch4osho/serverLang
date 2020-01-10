Vue.component('template-copyright', {
    template: `
    <div class="template-item-copyright" :style="position" @click.stop @mouseenter="enter" @mouseleave="close">
        <div class="copyright-modal-id">
            ID：<div class="copyright-modal-id-text" ref="modalId">{{copyRightId}}</div>
            <input class="input-hidden" type="text" readonly :value="copyRightId">
            <div class="copyright-modal-id-btn" @click.stop="copyModalId">
                <svg class="svg-icon">
                    <use xlink:href="#svg-ele-modal-identifier"></use>
                </svg>
            </div>
        </div>
        <div class="template-item-copyright-line">版权：{{template.source | copyright}}</div>
        <!--
        <Icon class="template-item-copyright-close" type="ios-close-empty" @click="close"></Icon>
        -->
        <div class="template-item-copyright-des">
            {{template.source | copyrightDes}}
            <span class="warning-tip" v-if="template.source == 2">请谨慎用于商业用途。</span>
        </div>
    </div>
    `,
    props: {
        item: Object,
        position: Object,
        nowTemplate: Object,
    },
    data() {
        return {};
    },
    computed: {
        template() {
            if (this.item.source != undefined) {
                return this.item;
            }
            return this.nowTemplate;
        },
        copyRightId() {
            return this.template.identifier;
        },
    },
    filters: {
        copyright(value) {
            let str = '';
            switch (value) {
                case 0:
                    str = '凡科网原创';
                    break;
                case 1:
                    str = '第三方设计师';
                    break;
                case 2:
                    str = '网友共享';
                    break;
                default:
                    str = '第三方设计师';
                    break;
            }
            return str;
        },
        copyrightDes(value) {
            let str = '';
            switch (value) {
                case 0:
                    str = '该模板由凡科网原创设计，凡科网客户可商用。';
                    break;
                case 1:
                    str = '该模板由第三方设计师原创设计，凡科网客户可商用。';
                    break;
                case 2:
                    str = '该模板由网友上传共享，仅供学习参考，';
                    break;
                default:
                    str = '该模板由第三方设计师原创设计，凡科网客户可商用。';
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
        copyModalId(event) {
            /* // var text = $(event.target).parents('.copyright-modal-id').find('.copyright-modal-id-text')[0];
               var text = this.$refs.modalId,range,selection;
               if (document.body.createTextRange) {
               range = document.body.createTextRange();
               range.moveToElementText(text);
               range.select();
               } else if (window.getSelection) {
               selection = window.getSelection();
               range = document.createRange();
               range.selectNodeContents(text);
               selection.removeAllRanges();
               selection.addRange(range);
               }
               // document.execCommand('Copy');
               document.execCommand("copy");
               this.$Notice.success("已复制模板ID"); */
            let tmpInput = document.createElement('textarea');
            tmpInput.value = this.template.identifier;
            document.body.appendChild(tmpInput);
            // 选择对象
            tmpInput.select();
            // 执行浏览器复制命令
            document.execCommand('Copy');
            tmpInput.remove();
            tmpInput = null;
            this.$Notice.success('复制成功');
        },
    },
});
