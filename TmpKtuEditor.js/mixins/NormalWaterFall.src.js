Ktu.mixins.normalWaterFall = {
    data() {
        return {
            // 经处理后的数据
            showData: null,
            // 排列列数
            colNum: 3,
            colHeights: [],
            waterFallHeight: 0,
            minHeight: 50,
            maxHeight: 600,
            boxRect: {
                bottom: 10,
                right: 10,
            },
            colWidth: 86,
        };
    },
    watch: {
        materialItem() {
            // 实际显示的图片尺寸数组
            this.showData = [];
            // 计算元素显示尺寸、位置
            this.computeShow();
        },
    },
    methods: {
        waterItemImg(item) {
            const sourceData = item.sourceData || item;
            let imgPath = sourceData.svgPrePath || sourceData.pre160ViewPath || sourceData.filePath;
            if (this.$store.state.base.isSupportWebp) {
                imgPath = Ktu.getWebpOrOtherImg(imgPath);
            }
            return imgPath;
        },
        computeShow() {
            const propData = this.materialItem;
            this.colHeights = new Array(this.colNum);
            this.colHeights.fill(0);

            // 元素尺寸
            let width; let height;
            // 元素位置
            let top; let left;
            // 宽高比
            let ratio;
            // 元素从该列数插入
            let insertIndex;
            let minColHeight;
            // let maxColHeight;
            let minColIndex;

            propData.forEach((item, index) => {
                minColHeight = this.getMinColHeight();
                // maxColHeight = this.getMaxColHeight();
                minColIndex = this.getMinColIndex(minColHeight);
                width = item.width || item.w || item.fw || item.pwidth;
                height = item.height || item.h || item.fh || item.pheight;
                // 宽高比
                ratio = width / height;

                insertIndex = minColIndex;
                width = this.colWidth;
                height = width / ratio;
                if (height < this.minHeight) {
                    height = this.minHeight;
                } else if (height > this.maxHeight) {
                    height = this.maxHeight;
                }
                left = (this.colWidth + this.boxRect.right) * insertIndex;
                top = this.colHeights[insertIndex];
                this.colHeights[insertIndex] += height + this.boxRect.bottom;

                // 存进显示数组
                const size = {
                    width,
                    height,
                    top,
                    left,
                    sourceData: item,
                    index,
                    style: {
                        width: `${width}px`,
                        height: `${height}px`,
                        top: `${top}px`,
                        left: `${left}px`,
                    },
                };
                this.showData.push(size);
            });
            this.waterFallHeight = this.getMaxColHeight();
        },
        // 获取当前最小高度的列的高度
        getMinColHeight() {
            const minHeight = Math.min.apply(null, this.colHeights);
            return minHeight;
        },
        // 获取当前最大高度的列的高度
        getMaxColHeight() {
            const maxHeight = Math.max.apply(null, this.colHeights);
            return maxHeight;
        },
        // 获取当前高度最小的列的表
        getMinColIndex(minHeight) {
            for (let i = 0, len = this.colHeights.length; i < len; i++) {
                if (this.colHeights[i] === minHeight) {
                    return i;
                }
            }
        },
    },
};
