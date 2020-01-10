Ktu.mixins.waterFall = {
    data() {
        return {
            // 经处理后的数据
            showData: null,
            // 列高度
            colHeights: [0, 0, 0],
            defaultHeight: [0, 0, 0],
            waterFallHeight: 0,
            propRatio: [2, 3],
            maxDiff: 20,
            minHeight: 18,
            maxHeight: 600,
            boxRect: {
                bottom: 7,
                right: 7,
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
        waterFallLayOut() {
            this.showData = [];
            this.computeShow();
        },
        computeShow() {
            const propData = this.materialItem;
            if (this.defaultHeight) {
                this.colHeights = JSON.parse(JSON.stringify(this.defaultHeight));
            } else {
                this.colHeights = [0, 0, 0];
            }
            // this.colHeights = this.defaultHeight || [0, 0, 0]; // 列高度

            // 元素尺寸
            let width; let height;
            // 元素从该列数插入
            let insertIndex;
            // 元素位置
            let top;
            let left;
            // 宽高比
            let ratio;
            let cols;
            let minColHeight;
            // 占两列时，较高的一列
            let midColHeight;
            let maxColHeight;
            let minColIndex;

            propData.forEach((item, index) => {
                minColHeight = this.getMinColHeight();
                maxColHeight = this.getMaxColHeight();
                minColIndex = this.getMinColIndex(minColHeight);
                width = item.width || item.w || item.fw || item.pwidth;
                height = item.height || item.h || item.fh || item.pheight;
                // 宽高比
                ratio = width / height;
                cols = this.getItemCols(ratio);
                if (cols === 3) {
                    // 初始该占三列
                    if (maxColHeight - minColHeight > this.maxDiff) {
                        // 计算该占两列的情况
                        cols = 2;
                    } else {
                        width = this.colWidth * 3 + this.boxRect.right * (cols - 1);
                        insertIndex = 0;
                    }
                }
                if (cols === 2) {
                    // 初始该占两列
                    if (minColIndex === 0) {
                        if (this.colHeights[1] - this.colHeights[0] > this.maxDiff) {
                            cols = 1;
                        } else {
                            width = this.colWidth * 2 + this.boxRect.right * (cols - 1);
                            insertIndex = 0;
                            midColHeight = this.colHeights[1];
                        }
                    } else if (minColIndex === 1) {
                        if (this.colHeights[0] - this.colHeights[1] > this.maxDiff) {
                            if (this.colHeights[2] - this.colHeights[1] > this.maxDiff) {
                                cols = 1;
                            } else {
                                width = this.colWidth * 2 + this.boxRect.right * (cols - 1);
                                insertIndex = 1;
                                midColHeight = this.colHeights[2];
                            }
                        } else {
                            width = this.colWidth * 2 + this.boxRect.right * (cols - 1);
                            insertIndex = 0;
                            midColHeight = this.colHeights[0];
                        }
                    } else if (minColIndex === 2) {
                        if (this.colHeights[1] - this.colHeights[2] > this.maxDiff) {
                            cols = 1;
                        } else {
                            width = this.colWidth * 2 + this.boxRect.right * (cols - 1);
                            insertIndex = 1;
                            midColHeight = this.colHeights[1];
                        }
                    }
                }
                if (cols === 1) {
                    // 初始该占一列
                    width = this.colWidth + this.boxRect.right * (cols - 1);
                    insertIndex = minColIndex;
                }
                height = width / ratio;
                if (height < this.minHeight) {
                    height = this.minHeight;
                } else if (height > this.maxHeight) {
                    height = this.maxHeight;
                }
                left = (this.colWidth + this.boxRect.right) * insertIndex;
                switch (cols) {
                    case 1:
                        top = this.colHeights[insertIndex];
                        this.colHeights[insertIndex] += height + this.boxRect.bottom;
                        break;
                    case 2:
                        top = midColHeight;
                        this.colHeights[insertIndex] = midColHeight + height + this.boxRect.bottom;
                        this.colHeights[insertIndex + 1] = this.colHeights[insertIndex];
                        break;
                    case 3:
                        top = maxColHeight;
                        for (let i = 0; i < 3; i++) {
                            this.colHeights[i] = maxColHeight + height + this.boxRect.bottom;
                        }
                        break;
                }
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
                    canCollect: true,
                };
                this.showData.push(size);
            });
            this.$nextTick(() => {
                this.computeShowCallBack && this.computeShowCallBack();
            });
            this.waterFallHeight = this.getMaxColHeight();
        },
        // 元素初始该占列数
        getItemCols(ratio) {
            let cols = 1;
            if (ratio >= this.propRatio[1]) {
                cols = 3;
            } else if (ratio >= this.propRatio[0] && ratio < this.propRatio[1]) {
                cols = 2;
            } else if (ratio < this.propRatio[0]) {
                cols = 1;
            }
            return cols;
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
