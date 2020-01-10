Vue.component('pagination', {
    template: `
    <div class="pagination">
        <div class="pagination-btn pagination-btn-prev" :class="prevClass" @click="prevPage">
            <svg class="pagination-page-icon">
                <use xlink:href="#svg-page-next"></use>
            </svg>
        </div>
        <div class="pagination-select" @click="show">
            <span>{{currentPage}}/{{totalPage}}</span>
            <svg class="pagination-select-icon">
                <use xlink:href="#svg-tool-arrow"></use>
            </svg>
        </div>
        <div class="pagination-btn" :class="nextClass" @click="nextPage">
            <svg class="pagination-page-icon">
                <use xlink:href="#svg-page-next"></use>
            </svg>
        </div>

        <transition name="slide-down">
            <ul v-if="isShow" class="pagination-select-popup">
                <li class="pagination-select-popup-option" :class="{active:currentPage == index+1}" @click="selectPage(index)" v-for="(item,index) in totalPage">第{{index+1}}页</li>
            </ul>
        </transition>
    </div>
    `,
    mixins: [Ktu.mixins.popupCtrl],
    data() {
        return {
            currentPage: 1,
        };
    },
    props: {
        nowPage: {
            type: Number,
            default: 1,
        },
        totalSize: {
            type: Number,
            default: 0,
        },
        // 分页 获取数量
        itemLimit: {
            type: Number,
            default: 20,
        },
        // 滚动分页 滚动次数
        scrollLimit: {
            type: Number,
            default: 1,
        },
    },
    computed: {
        prevClass() {
            return {
                disable: this.currentPage == 1,
            };
        },
        nextClass() {
            return {
                disable: this.currentPage == this.totalPage,
            };
        },
        totalPage() {
            return Math.ceil(this.totalSize / (this.itemLimit * this.scrollLimit));
        },
    },
    watch: {
        nowPage(val) {
            this.currentPage = Math.floor(this.nowPage / this.scrollLimit) + 1;
        },
    },
    mounted() {
    },
    methods: {
        pageChange() {
            this.$emit('update:current', this.currentPage);
            this.$emit('on-change', this.currentPage);
        },
        prevPage() {
            if (this.currentPage <= 1) {
                return false;
            }
            this.currentPage--;
            this.pageChange();
        },
        nextPage() {
            if (this.currentPage >= this.totalPage) {
                return false;
            }
            this.currentPage++;
            this.pageChange();
        },
        selectPage(page) {
            this.currentPage = page + 1;
            this.pageChange();
        },
    },
});
