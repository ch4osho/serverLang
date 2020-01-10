Vue.component('image-source-dir', {
    template: `
    <div rippleColor="#ff7733" class="child-box" @click="click">
        <svg class="dir-icon" v-if="!editStatus">
            <use :xlink:href="item.id === -1 ? '#svg-source-tabBox-custom' : ( item.id === -2 ? '#svg-material-collection' : '#svg-img-modal-dir' )"></use>
        </svg>
        <div v-show="!editStatus" class="child-box-name ellipsis" v-text="item.name"></div>
        <input v-show="editStatus" class="child-name-input" type="text" ref="input" maxlength="20" placeholder="请输入文件名" @click.stop @focus="focus($event)" @blur="blur($event)" @keyup.enter="blur($event)" :value="label">

        <div v-if="!item.hideOperate && !editStatus" class="child-file-opt" @click.stop="openDirMenu($event,item)">
            <svg class="svg-ele-dir-more">
                <use xlink:href="#svg-source-more-icon_1"></use>
            </svg>
        </div>
        <div class="child-file-opt counter" v-else="editStatus">
            {{item.ktuCount}}
        </div>
        <div class="child-file-counter" v-if="!item.hideCount">
            {{item.ktuCount || 0}}
        </div>
        <slot></slot>
    </div>
    `,
    props: {
        item: Object,
    },
    data() {
        return {
            label: '',
        };
    },
    computed: {
        editStatus() {
            if (this.item) {
                return this.item.edit;
            }
            return false;
        },
    },
    watch: {
        editStatus: {
            handler(value) {
                if (value) {
                    Vue.nextTick(() => {
                        this.$refs.input.focus();
                    });
                }
            },
            immediate: true,
        },
    },
    mounted() {
        if (this.item) {
            // 懒得给每个数据遍历了 直接创建赋值
            Vue.set(this.item, 'edit', false);
            this.label = this.item.name;
        }
    },
    methods: {
        click() {
            if (this.editStatus) {
                this.item.edit = false;
            } else {
                this.$emit('click');
            }
        },
        focus(event) {
            this.$refs.input.select();
        },
        blur(event) {
            this.item.edit = false;

            const { value } = this.$refs.input;
            if (this.label != value) {
                this.renameDir(value);
            }
        },
        renameDir(value) {
            const url = '../ajax/ktuGroup_h.jsp?cmd=setKtuGroup';
            axios.post(url, {
                id: this.item.id,
                name: value,
            }).then(res => {
                const info = (res.data);
                if (info.success) {
                    this.$Notice.success(info.msg);
                    this.item.name = value;
                    this.label = value;
                    Ktu.log('uploadManage', 'renameDir');
                } else {
                    this.$Notice.error(info.msg);
                }
            })
                .catch(err => {
                    this.$Notice.error(err);
                })
                .finally(() => {
                });
        },
    },
});
