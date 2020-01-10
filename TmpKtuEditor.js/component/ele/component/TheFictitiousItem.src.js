Vue.component('fictitious-item', {
    template: `
        <div class="fictitious-item">
            <ul class="fictitious-list">
                <li class="item" v-for="(item, index) in visibleList"
                :style="{'left': item.left + 'px', 'top': item.top + 'px', 'width': item.tw + 'px', 'height': item.th +'px'}"
                :class="{'isMove': isFollowMouse}">
                    <div class="work-img">
                        <img :src="waterItemImg(item)" v-if="isFollowMouse && index === visibleList.length - 1"/>
                        <p class="work-count" v-if="index === visibleList.length - 1 && isFollowMouse">{{workCount}}</p>
                    </div>
                </li>
            </ul>
        </div>
    `,
    data() {
        return {
            isFollowMouse: false,
            mousePos: null,
            left: 0,
            top: 0,
            startTime: null,
            endTime: null,
            // 优化不需要全部选中元素都显示动画,过多会卡顿
            visibleList: [],
        };
    },
    computed: {
        nowEditorObj() {
            return this.$store.state.base.nowEditorObj;
        },
        // 批量管理多选列表
        chooseItemList: {
            get() {
                if (this.nowEditorObj == 0) {
                    return this.$store.state.base.checkedItem;
                }
            },
            set(newValue) {
                if (this.nowEditorObj == 0) {
                    this.$store.state.base.checkedItem = newValue;
                }
            },
        },
        // 是否正在拖动作品
        isMovingWork: {
            get() {
                if (this.nowEditorObj == 0) {
                    return this.$store.state.base.isMovingImage;
                }
            },
            set(newValue) {
                if (this.nowEditorObj == 0) {
                    this.$store.state.base.isMovingImage = newValue;
                }
            },
        },
        workCount() {
            if (this.chooseItemList) {
                return this.chooseItemList.length;
            }
        },
        clientHeight() {
            return document.body.clientHeight;
        },

        // 作品可视区域
        visibleArea() {
            return {
                top: 0,
                bottom: this.clientHeight,
            };
        },
    },
    created() {
        this.chooseItemList.forEach(item => {
            // let BDR = item.dom.getBoundingClientRect();
            let BDR;
            if (this.nowEditorObj == 0) {
                const dom = document.querySelector(`div[data-i="${item.i}"]`);
                if (!dom) return;
                BDR = dom.getBoundingClientRect();
            }

            if (BDR.top > this.visibleArea.top && BDR.top < this.visibleArea.bottom) {
                Vue.set(item, 'left', BDR.left);
                Vue.set(item, 'top', BDR.top);
                this.visibleList.push(item);
            }
        });
        this.isMovingWork = true;
        this.onDragStart();
    },
    mounted() {},
    watch: {},
    destroyed() {
        document.removeEventListener('dragstart', this.onDragStart);
        document.removeEventListener('dragover', this.onDrag);
        document.removeEventListener('dragend', this.onDragEnd);
    },
    methods: {
        waterItemImg(waterItem) {
            let item;
            if (this.nowEditorObj == 0) item = waterItem;
            let imgPath = item.src || item.sp160p || item.path || item.p450p || item.p160p;
            if (this.$store.state.base.isSupportWebp && imgPath && !/base64/.test(imgPath)) {
                imgPath = Ktu.getWebpOrOtherImg(imgPath);
            }
            return imgPath;
        },

        onDragStart() {
            document.addEventListener('dragover', this.onDrag);
            document.addEventListener('dragend', this.onDragEnd);
        },

        onDrag(e) {
            if (this.left === e.clientX && this.top === e.clientY) {
                return;
            }

            if (!this.isFollowMouse) {
                this.startTime = new Date().getTime();
                this.visibleList.forEach((item, index) => {
                    if (index === this.visibleList.length - 1) {
                        item.tw = 50;
                        item.th = 50;
                    } else {
                        item.tw = 40;
                        item.th = 40;
                    }
                });
                setTimeout(() => {
                    if (this.isMovingWork) {
                        this.isFollowMouse = true;
                    }
                }, 100);
            }

            if (e.clientX !== 0 && e.clientY !== 0) {
                this.visibleList.forEach((item, index) => {
                    if (index === this.visibleList.length - 1) {
                        item.left = e.clientX;
                        item.top = e.clientY;
                    } else {
                        item.left = e.clientX + 5;
                        item.top = e.clientY + 10;
                    }
                });

                this.left = e.clientX;
                this.top = e.clientY;
            }
        },

        onDragEnd(e) {
            this.visibleList.forEach(item => {
                const dom = document.querySelector(`div[data-i="${item.i}"]`);
                if (!dom) return;
                const BDR = dom.getBoundingClientRect();
                Vue.set(item, 'left', BDR.left);
                Vue.set(item, 'top', BDR.top);
            });

            this.isFollowMouse = false;

            // 不够100ms事件就出发dragEnd不延迟消失
            this.endTime = new Date().getTime();
            if (this.endTime - this.startTime > 100) {
                setTimeout(() => {
                    this.isMovingWork = false;
                }, 100);
            } else {
                this.isMovingWork = false;
            }
            document.removeEventListener('dragstart', this.onDragStart);
            document.removeEventListener('drag', this.onDrag);
            document.removeEventListener('dragend', this.onDragEnd);
        },
    },
});
