Vue.component('Menu', {
    template: `
    <div class="menu-operate-popup" :style="popupPosition">
        <div class="menu-operate" :class="item.index==1&&index==2||length==item.index+1&&index==3?'gray':''" v-for="(operate, index) in operateList" v-show="operateOptionShow(operate)" :key="index" @click.stop="execOperate($event,operate.name,item.index)" @mouseenter.stop="hoverOperate($event,operate.name,item.index)">
            <svg class="menu-operate-icon">
                <use :xlink:href="'#svg-'+operate.icon"></use>
            </svg>
            <label>{{operate.label}}</label>
            <svg v-if="operate.otherIcon" class="menu-operate-otherIcon">
                <use :xlink:href="'#svg-'+operate.otherIcon"></use>
            </svg>
        </div>
    </div>
    `,
    name: 'Menu',
    props: {
        item: Object,
        operateList: Array,
        position: Object,
        length: Number,
        offsetTop: {
            type: Number,
            default: 0,
        },
        offsetLeft: {
            type: Number,
            default: 0,
        },
    },
    computed: {
        popupPosition() {
            if (this.position == null) {
                return null;
            }
            const left = this.position.left + this.offsetLeft;
            let top = this.position.top + this.offsetTop;
            let height;
            if (this.offsetLeft == -150) {
                height = 125;
            } else {
                height = 100;
            }
            const { offsetHeight } = document.querySelector('.container');
            if (top + height > offsetHeight) {
                top -= height + 30;
            }
            const width = this.position.width ? this.position.width : null;
            return {
                left: `${left}px`,
                top: `${top}px`,
                width: `${width}px`,
            };
        },
    },
    data() {
        return {
        };
    },
    mounted() {
        document.addEventListener('click', this.close);
    },
    methods: {
        operateOptionShow(operate) {
            if (this.item && operate.noShowType) {
                return this.item.f != operate.noShowType;
            }
            return true;
        },
        execOperate(event, operateName, index) {
            this.$emit('execOperate', {
                event,
                item: this.item,
                operateName,
                index,
            });
        },
        close() {
            this.$emit('close');
            document.removeEventListener('click', this.closeMenu);
        },
        hoverOperate(event, operateName, index) {
            this.$emit('hoverOperate', {
                event,
                item: this.item,
                operateName,
                index,
            });
        },
    },
});