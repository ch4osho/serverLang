Vue.component('dir', {
    template: `
    <div class="ele-dir" ref="dir"
        :class="{active}"
        :style="dirStyle"
        :draggable="index!=0 && isDraggable"
        @dragstart="dragstart"
        @dragend.stop="dragend"
        @dragenter="dragenter"
        @click="click"
        @drop="drop"
        @mousedown.stop>
        <div class="ele-dir-box"
            @contextmenu="showM($event,item,index,0)">
            <template v-if="type == 'add'">
                <div class="ele-dir-pic add">
                    <svg class="ele-dir-icon add">
                        <use xlink:href="#svg-ele-dir-add"></use>
                    </svg>
                </div>
            </template>
            <template v-else>
                <div v-show="!item.hideOperate" class="ele-dir-operate" @click.stop="operate($event,item,index,1)">
                    <svg class="ele-dir-icon">
                        <use xlink:href="#svg-ele-dir-more"></use>
                    </svg>
                </div>
                <div class="ele-dir-pic" :class="{active}">
                    <svg class="ele-dir-icon dir" viewBox="0 0 80 80" width="100%" height="100%" ref="svg">
                        <rect width="80" height="80" rx="4" ry="4" fill="transparent"></rect>
                        <rect class="an an-3" :class="{active}" x="27" y="14" width="26" height="17.61" rx="3" ry="3" fill="#f9c969"></rect>
                        <rect class="an an-2" :class="{active}" x="22" y="17" width="36" height="22.3" rx="3" ry="3" fill="#f99837"></rect>
                        <rect class="an an-1" :class="{active}" x="17" y="20" width="46" height="27" rx="3" ry="3" fill="#f96723"></rect>
                        <path d="M60,27H37.84c-1,0-3.18-4-4.84-4H20a3,3,0,0,0-3,3V56a3,3,0,0,0,3,3H60a3,3,0,0,0,3-3V30A3,3,0,0,0,60,27Z" fill="url(#svg_ele_dir_open)"></path>
                    </svg>
                </div>
            </template>
            <svg class="dir-type-active-arrow" v-if="active">
                <use xlink:href="#svg-material-active-arrow"></use>
            </svg>
        </div>
        <div v-show="!editStatus" @dragenter.stop class="ele-dir-title ellipsis" v-text="label" @click.stop="editTitle"></div>
        <input v-show="editStatus" @dragenter.stop class="ele-dir-input" type="text" ref="input" @click.stop @focus.self="focus($event)" @blur="blur($event)" @keyup.enter="blur($event)" :value="label" maxlength="20">
    </div>
    `,
    name: 'Dir',
    props: {
        item: {
            type: Object,
            default: null,
        },
        type: {
            type: String,
            default: 'normal',
        },
        label: {
            type: String,
            default: '',
        },
        index: {
            type: Number,
            default: 0,
        },
        active: {
            type: Boolean,
            default: false,
        },
        dirStyle: Object,
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
    data() {
        return {
            isDraggable: true,
        };
    },
    mounted() {
        if (this.item) {
            // 懒得给每个数据遍历了 直接创建赋值
            Vue.set(this.item, 'edit', false);
        }
    },
    methods: {
        click() {
            this.$emit('click');
        },
        dragenter() {
            this.$emit('dragenter');
        },
        dragstart(ev) {
            this.$emit('startDrag', ev);
        },
        dragend() {
            this.$emit('dragEnd');
        },
        drop(event) {
            this.$emit('drop', event, this.item);
        },
        editTitle() {
            this.$emit('titleClick', this);
            /* if(this.item && !this.item.hideOperate && this.active) {
               this.item.edit = true;
               } else */
        },
        operate(event, item, index, num) {
            this.$emit('operateClick', {
                event,
                item,
                index,
                num,
            });
        },
        focus(event) {
            this.isDraggable = false;
            this.$refs.input.select();
        },
        blur(event) {
            const { value } = this.$refs.input;
            if (value && this.label != value) {
                this.$emit('input', {
                    item: this.item,
                    value: this.$refs.input.value,
                });
            }
            this.isDraggable = true;
            this.item.edit = false;
        },
        showM(event, item, index, num) {
            event.preventDefault();
            if (index !== 0 && event.which === 3) {
                this.$emit('contextmenu', {
                    event,
                    item,
                    index,
                    num,
                });
            }
        },
    },
});
