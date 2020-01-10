(function () {
    const prefixCls = 'ktu-page';

    Vue.component('page', {
        template: `
        <ul :class="wrapClasses" :style="styles">
            <span :class="[prefixCls + '-total']" v-if="showTotal">
                <slot>共{{ total }} <template v-if="total <= 1">条</template><template v-else>条</template></slot>
            </span>
            <li
                title="上一页"
                :class="prevClasses"
                @click="prev">
                <svg style="transform:rotate(180deg)"><use xlink:href="#svg-page-next"></use></svg>
            </li>
            <li :class="firstPageClasses" @click="changePage(1)">1</li>
            <li title="向前5页" v-if="showPrevMore" :class="[prefixCls + '-item-jump-prev']" @click="fastPrev">
                <svg class="more"><use xlink:href="#svg-page-more"></use></svg>
                <svg class="show"><use xlink:href="#svg-page-jump-prev"></use></svg>
            </li>
            <li :class="[prefixCls + '-item',{ [prefixCls + '-item-active'] : currentPage == page}]" @click="changePage(page)" v-for="page in pagers">{{page}}</li>
            <li title="向后5页" v-if="showNextMore" :class="[prefixCls + '-item-jump-next']" @click="fastNext">
                <svg class="more"><use xlink:href="#svg-page-more"></use></svg>
                <svg class="show"><use xlink:href="#svg-page-jump-next"></use></svg>
            </li>
            <li v-if="allPages > 1" :class="lastPageClasses" @click="changePage(allPages)">{{ allPages }}</li>
            <li
                title="下一页"
                :class="nextClasses"
                @click="next">
                <svg><use xlink:href="#svg-page-next"></use></svg>
            </li>
        </ul>
        `,
        name: 'Page',
        props: {
            current: {
                type: Number,
                default: 1,
            },
            total: {
                type: Number,
                default: 0,
            },
            pageSize: {
                type: Number,
                default: 10,
            },
            pageSizeOpts: {
                type: Array,
                default() {
                    return [10, 20, 30, 40];
                },
            },
            pagerCount: {
                type: Number,
                default: 7,
            },
            placement: {
                validator(value) {
                    return Ktu.oneOf(value, ['top', 'bottom']);
                },
                default: 'bottom',
            },
            transfer: {
                type: Boolean,
                default: false,
            },
            size: {
                validator(value) {
                    return Ktu.oneOf(value, ['small']);
                },
            },
            simple: {
                type: Boolean,
                default: false,
            },
            showTotal: {
                type: Boolean,
                default: false,
            },
            showElevator: {
                type: Boolean,
                default: false,
            },
            showSizer: {
                type: Boolean,
                default: false,
            },
            className: {
                type: String,
            },
            styles: {
                type: Object,
            },
        },
        data() {
            return {
                showPrevMore: false,
                showNextMore: false,
                prefixCls,
                currentPage: this.current,
                currentPageSize: this.pageSize,
            };
        },
        watch: {
            total(val) {
                const maxPage = Math.ceil(val / this.currentPageSize);
                if (maxPage < this.currentPage && maxPage > 0) {
                    this.currentPage = maxPage;
                }
            },
            current(val) {
                this.currentPage = val;
            },
            pageSize(val) {
                this.currentPageSize = val;
            },
        },
        computed: {
            pagers() {
                const { pagerCount } = this;
                const halfPagerCount = (pagerCount - 1) / 2;

                const currentPage = Number(this.currentPage);
                const pageCount = Number(this.allPages);

                let showPrevMore = false;
                let showNextMore = false;

                if (pageCount > pagerCount) {
                    if (currentPage > pagerCount - halfPagerCount) {
                        showPrevMore = true;
                    }

                    if (currentPage < pageCount - halfPagerCount) {
                        showNextMore = true;
                    }
                }

                const array = [];

                if (showPrevMore && !showNextMore) {
                    // 保持 前后翻页 数量一样
                    const startPage = pageCount - (pagerCount - 2) - 1;
                    for (let i = startPage; i < pageCount; i++) {
                        array.push(i);
                    }
                } else if (!showPrevMore && showNextMore) {
                    // 保持 前后翻页 数量一样
                    for (let i = 2; i < pagerCount + 1; i++) {
                        array.push(i);
                    }
                } else if (showPrevMore && showNextMore) {
                    const offset = Math.floor(pagerCount / 2) - 1;
                    for (let i = currentPage - offset; i <= currentPage + offset; i++) {
                        array.push(i);
                    }
                } else {
                    for (let i = 2; i < pageCount; i++) {
                        array.push(i);
                    }
                }

                this.showPrevMore = showPrevMore;
                this.showNextMore = showNextMore;

                return array;
            },
            isSmall() {
                return !!this.size;
            },
            allPages() {
                const allPage = Math.ceil(this.total / this.currentPageSize);
                return (allPage === 0) ? 1 : allPage;
            },
            simpleWrapClasses() {
                return [
                    `${prefixCls}`,
                    `${prefixCls}-simple`,
                    {
                        [`${this.className}`]: !!this.className,
                    },
                ];
            },
            simplePagerClasses() {
                return `${prefixCls}-simple-pager`;
            },
            wrapClasses() {
                return [
                    `${prefixCls}`,
                    {
                        [`${this.className}`]: !!this.className,
                        mini: !!this.size,
                    },
                ];
            },
            prevClasses() {
                return [
                    `${prefixCls}-prev`,
                    {
                        [`${prefixCls}-disabled`]: this.currentPage === 1,
                    },
                ];
            },
            nextClasses() {
                return [
                    `${prefixCls}-next`,
                    {
                        [`${prefixCls}-disabled`]: this.currentPage === this.allPages,
                    },
                ];
            },
            firstPageClasses() {
                return [
                    `${prefixCls}-item`,
                    {
                        [`${prefixCls}-item-active`]: this.currentPage === 1,
                    },
                ];
            },
            lastPageClasses() {
                return [
                    `${prefixCls}-item`,
                    {
                        [`${prefixCls}-item-active`]: this.currentPage === this.allPages,
                    },
                ];
            },
        },
        methods: {
            changePage(page) {
                if (this.currentPage != page) {
                    this.currentPage = page;
                    this.$emit('update:current', page);
                    this.$emit('on-change', page);
                }
            },
            prev() {
                const current = this.currentPage;
                if (current <= 1) {
                    return false;
                }
                this.changePage(current - 1);
            },
            next() {
                const current = this.currentPage;
                if (current >= this.allPages) {
                    return false;
                }
                this.changePage(current + 1);
            },
            fastPrev() {
                const page = this.currentPage - 5;
                if (page > 0) {
                    this.changePage(page);
                } else {
                    this.changePage(1);
                }
            },
            fastNext() {
                const page = this.currentPage + 5;
                if (page > this.allPages) {
                    this.changePage(this.allPages);
                } else {
                    this.changePage(page);
                }
            },
            onSize(pageSize) {
                this.currentPageSize = pageSize;
                this.$emit('on-page-size-change', pageSize);
                this.changePage(1);
            },
            onPage(page) {
                this.changePage(page);
            },
            keyDown(e) {
                const key = e.keyCode;
                const condition = (key >= 48 && key <= 57) || (key >= 96 && key <= 105) || key === 8 || key === 37 || key === 39;

                if (!condition) {
                    e.preventDefault();
                }
            },
            keyUp(e) {
                const key = e.keyCode;
                const val = parseInt(e.target.value, 10);

                if (key === 38) {
                    this.prev();
                } else if (key === 40) {
                    this.next();
                } else if (key === 13) {
                    let page = 1;

                    if (val > this.allPages) {
                        page = this.allPages;
                    } else if (val <= 0 || !val) {
                        page = 1;
                    } else {
                        page = val;
                    }

                    e.target.value = page;
                    this.changePage(page);
                }
            },
        },
    });
}());
