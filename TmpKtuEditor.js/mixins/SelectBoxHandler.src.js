Ktu.mixins.selectBoxHandler = {
    data() {
        return {
            // 框的属性
            selectBoxWidth: 0,
            selectBoxHeight: 0,
            selectBoxTop: 0,
            selectBoxLeft: 0,
            // 鼠标点下时记录鼠标位置
            downClientX: 0,
            downClientY: 0,

            // 鼠标移出浏览器时用
            hadSelectBoxDashArea: false,
            // 框选元素
            selectBoxDashArea: '',
            // 开始框选时的 X 坐标
            selectStartX: 0,
            // 开始框选时的 Y 坐标
            selectStartY: 0,
            // 移动过程中的 X 坐标
            selectMoveX: 0,
            // 移动过程中的 Y 坐标
            selectMoveY: 0,

            selectedWaterFallItem: [],

            // 保存选中的作品，避免瀑布流刷新丢失已选作品
            tmpChooseList: [],
        };
    },
    computed: {
        showSelectBox: {
            get() {
                return this.$store.state.base.showSelectBox;
            },
            set(newValue) {
                this.$store.state.base.showSelectBox = newValue;
            },
        },
    },
    watch: {
        selectedWaterFallItem(value) {
            if (this.$options.name === 'ele-upload') {
                this.checkedItemList = value;
            }
        },
    },
    methods: {
        setBatchDeal(value) {
            if (this.$options.name === 'ele-upload') {
                this.manageStatus = value;
            }
        },
        selectBoxShow(e) {
            if (e.button !== 0) return;

            this.selectStartX = e.clientX - this.categoryWidth;
            this.selectStartY = e.clientY - this.containerTop + this.scrollTop;
            this.downClientX = e.clientX;
            this.downClientY = e.clientY;
            this.tmpChooseList = [];

            document.addEventListener('mousemove', this.selectBoxMove);

            window.addEventListener('blur', this.selectBoxHide);

            window.addEventListener('mouseup', this.selectBoxHide);
        },
        // 框选鼠标移动函数
        selectBoxMove(e) {
            // 判断是否真正move了
            if (e.clientX === this.downClientX && e.clientY === this.downClientY) return;
            this.showSelectBox = true;

            if (this.selectedWaterFallItem.length > 0) {
                this.setBatchDeal(true);
            }

            // 起始点是鼠标移动的X坐标（相对于浏览器的坐标） - 侧边栏宽度
            this.selectMoveX = e.clientX - this.categoryWidth;
            // 起始点是鼠标移动的X坐标（相对于浏览器的坐标） - 侧边栏宽度
            this.selectMoveY = e.clientY - this.containerTop + this.scrollTop;

            this.selectBoxWidth = Math.abs(this.selectStartX - this.selectMoveX);
            this.selectBoxHeight = Math.abs(this.selectStartY - this.selectMoveY);
            this.selectBoxTop = Math.min(this.selectStartY, this.selectMoveY);
            this.selectBoxLeft = Math.min(this.selectStartX, this.selectMoveX);

            // 框选到的卡片显示选择状态
            const worksElList = this.$refs.uploadItem;
            const worksItem = this.$refs.uploadItem.map(item => item.getAttribute('data-i'));
            for (let i = 0; i < worksElList.length; i++) {
                const left = worksElList[i].getBoundingClientRect().left - this.categoryWidth;
                const top = worksElList[i].getBoundingClientRect().top - this.containerTop + this.scrollTop;
                const { width } = worksElList[i].getBoundingClientRect();
                const { height } = worksElList[i].getBoundingClientRect();

                if (
                    // 四种情况，分别是右下方框选，右上方框选，左下方框选，左上方框选
                    (((this.selectStartX <= left && this.selectMoveX > left) || (this.selectStartX > left && this.selectStartX < left + width))
                        && this.selectMoveY > top
                        && this.selectStartY < top + height
                        && (this.selectMoveY >= this.selectStartY && this.selectMoveX >= this.selectStartX))
                    || (this.selectStartX > left
                        && this.selectMoveX < left + width
                        && this.selectMoveY < top + height
                        && this.selectStartY > top
                        && (this.selectMoveY < this.selectStartY && this.selectMoveX < this.selectStartX))
                    || (((this.selectStartX > left && this.selectStartX < left + width) || (this.selectStartX > left + width && this.selectMoveX < left + width))
                        && this.selectMoveY > top
                        && this.selectStartY < top + height
                        && (this.selectMoveY >= this.selectStartY && this.selectMoveX < this.selectStartX))
                    || (((this.selectStartX > left && this.selectStartX < left + width) || (this.selectStartX < left && this.selectMoveX > left))
                        && this.selectMoveY < top + height
                        && this.selectStartY > top
                        && (this.selectMoveY < this.selectStartY && this.selectMoveX >= this.selectStartX))
                ) {
                    if (!this.tmpChooseList.includes(worksItem[i])) {
                        this.selectedWaterFallItem.push(worksItem[i]);
                        this.tmpChooseList.push(worksItem[i]);
                    }
                } else {
                    if (this.tmpChooseList.length <= 0) {
                        this.selectedWaterFallItem = [];
                        // this.setBatchDeal(false);
                    }
                    if (this.tmpChooseList.includes(worksItem[i])) {
                        const index = this.tmpChooseList.indexOf(worksItem[i]);
                        this.selectedWaterFallItem.splice(index, 1);
                        this.tmpChooseList.splice(index, 1);
                    }
                }
            }
        },
        // 取消框选状态
        selectBoxHide(e) {
            if (e.clientX === this.downClientX && e.clientY === this.downClientY) {
                this.showSelectBox = false;
            } else {
                if (this.showSelectBox) this.showSelectBox = false;
            }

            document.removeEventListener('mousemove', this.selectBoxMove);
            window.removeEventListener('mouseup', this.selectBoxHide);
            window.removeEventListener('blur', this.selectBoxHide);

            Ktu.log('itemManage', 'box_to_choose');
        },
    },
};
