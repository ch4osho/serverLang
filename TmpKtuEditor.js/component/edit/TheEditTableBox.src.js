Vue.component('edit-table-box', {
    template: `
                <div class="edit-box-table ele" v-show="!isResizing"
                    :data-index="target.group ? target.group.key : target.key"
                    :data-subindex="target.group ? target.key : undefined"
                >
                    <div class="table-corner" @click="selectAll"></div>

                    <div class="table-row-area" :class="{'hoverTrash': isHoverRowTrash}" @mouseleave="tableMouseleave">
                        <ul class="table-row-headers">
                            <li class="table-row-header" v-for="(item, index) in rowList"
                                :row="index" :class="{'selected': selectedRow.includes(index)}" :style="{height: index === 0 ? item.height * scale + strokeWidth / 2 + 'px' : item.height * scale + 'px'}"
                                @click="selectRow(index)"
                                @mouseenter="mouseenterRow($event, index)"
                                @mousemove="mousemoveRow($event, index)"
                                ref="rowHeader">

                                <div class="split first-split" v-if="index === 0" :style=rowSplitStyle></div>
                                <div class="split" :style=rowSplitStyle></div>
                            </li>
                        </ul>

                        <div class="table-row-tool">
                            <div class="table-btn plus-btn row-plus-btn" v-if="hoverRow > -1" :style="rowPlusStyle"
                                @click="addRow">
                                <svg class="btn-icon">
                                    <use xlink:href="#svg-tool-add"></use>
                                </svg>
                            </div>

                            <div class="table-btn delete-btn row-delete-btn" v-if="selectedRow.length > 0 && !isSelectAll" :style="rowTrashStyle"
                                @mouseover="mouseover('row')"
                                @mouseout="mouseout('row')"
                                @mousedown="delRow">
                                <svg class="btn-icon">
                                    <use xlink:href="#svg-tool-remove"></use>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div class="table-col-area" :class="{'hoverTrash': isHoverColTrash}" @mouseleave="tableMouseleave">
                        <ul class="table-col-headers">
                            <li class="table-col-header" v-for="(item, index) in colList"
                                :col="index" :class="{'selected': selectedCol.includes(index)}" :style="{width: index === 0 ? item.width * scale + strokeWidth / 2 + 'px' : item.width * scale + 'px'}"
                                @click="selectCol(index)"
                                @mouseenter="mouseenterCol($event, index)"
                                @mousemove="mousemoveCol($event, index)"
                                ref="colHeader">

                                <div class="split first-split" v-if="index === 0" :style=colSplitStyle></div>
                                <div class="split" :style=colSplitStyle></div>
                            </li>
                        </ul>

                        <div class="table-col-tool">
                            <div class="table-btn plus-btn col-plus-btn" v-if="hoverCol > -1" :style="colPlusStyle"
                                @click="addCol">
                                <svg class="btn-icon">
                                    <use xlink:href="#svg-tool-add"></use>
                                </svg>
                            </div>
                            <div class="table-btn delete-btn col-delete-btn" v-if="selectedCol.length > 0 && !isSelectAll" :style="colTrashStyle"
                                @mouseover="mouseover('col')"
                                @mouseout="mouseout('col')"
                                @mousedown="delCol">
                                <svg class="btn-icon">
                                    <use xlink:href="#svg-tool-remove"></use>
                                </svg>
                            </div>
                        </div>

                    </div>

                    <div class="row-plus-line" :style="rowLineStyle" v-if="hoverRow > -1"></div>
                    <div class="col-plus-line" :style="colLineStyle" v-if="hoverCol > -1"></div>

                    <div class="table-resize-area">
                        <ul class="resize-row-area">
                            <li class="resize-row" v-for="(item, index) in rowList" :style="{height: index === 0 ? item.height * scale + strokeWidth + 'px' : item.height * scale + 'px'}">
                                <div class="resize-line first-resize" v-if="index === 0"
                                    data-control="table_resize"
                                    :row-index="index"
                                    @mouseenter="mouseenterResize"
                                    @mousemove="mouseenterResize"
                                    :style="{cursor: getCursor('row'), height: strokeWidth < 3 ? 3 : strokeWidth + 'px'}"></div>
                                <div class="resize-line"
                                    data-control="table_resize"
                                    :row-index="index + 1"
                                    @mouseenter="mouseenterResize"
                                    @mousemove="mouseenterResize"
                                    :style="{cursor: getCursor('row'), height: strokeWidth < 3 ? 3 : strokeWidth+ 'px'}"></div>
                            </li>
                        </ul>
                        <ul class="resize-col-area">
                            <li class="resize-col" v-for="(item, index) in colList" :style="{width: index === 0 ? item.width * scale + strokeWidth + 'px' : item.width * scale + 'px'}">
                            <div class="resize-line first-resize" v-if="index === 0"
                                    data-control="table_resize"
                                    :col-index="index"
                                    @mouseenter="mouseenterResize"
                                    @mousemove="mouseenterResize"
                                    :style="{cursor: getCursor('col'), width: strokeWidth < 3 ? 3 : strokeWidth + 'px'}"></div>
                                <div class="resize-line"
                                    data-control="table_resize"
                                    :col-index="index + 1"
                                    @mouseenter="mouseenterResize"
                                    @mousemove="mouseenterResize"
                                    :style="{cursor: getCursor('col'), width: strokeWidth < 3 ? 3 : strokeWidth + 'px'}"></div>
                            </li>
                        </ul>
                    </div>

                    <edit-table-text></edit-table-text>
                </div>
    `,
    mixins: [Ktu.mixins.dataHandler],
    data() {
        return {
            hoverCol: -1,
            hoverRow: -1,
            isHoverColTrash: false,
            isHoverRowTrash: false,
        };
    },
    computed: {
        isResizing() {
            return this.$store.state.base.interactive.isResizing;
        },

        editScale() {
            return this.$store.state.data.scale;
        },

        tableScale() {
            return this.activeObject.scaleX;
        },

        // 总缩放值
        scale() {
            return this.editScale * this.tableScale;
        },

        target() {
            return this.activeObject && (this.activeObject.isInContainer ? this.activeObject.container : this.activeObject);
        },

        // 边框大小
        strokeWidth() {
            return this.target.strokeWidth * this.editScale;
        },

        tableData() {
            return this.activeObject.msg.tableData || {};
        },

        dataList() {
            return this.tableData.dataList;
        },

        rowList() {
            const list = [];
            this.dataList.forEach((row, index) => {
                list.push(this.dataList[index][0]);
            });
            return list || [];
        },

        colList() {
            return this.dataList[0] || [];
        },

        rowToolPos() {
            if (this.hoverRow > -1) {
                let pos = 0;

                for (let i = 0; i < this.hoverRow; i++) {
                    pos += this.rowList[i].height * this.scale;
                }
                return pos + this.strokeWidth / 2;
            }
            return 0;
        },

        colToolPos() {
            if (this.hoverCol > -1) {
                let pos = 0;
                for (let i = 0; i < this.hoverCol; i++) {
                    pos += this.colList[i].width * this.scale;
                }
                return pos + this.strokeWidth / 2;
            }
            return 0;
        },

        rowPlusStyle() {
            return {
                top: `${this.rowToolPos - 13}px`,
            };
        },

        rowLineStyle() {
            return {
                top: `${this.rowToolPos + 16 - 1}px`,

            };
        },

        colPlusStyle() {
            return {
                left: `${this.colToolPos - 13}px`,
            };
        },

        colLineStyle() {
            return {
                left: `${this.colToolPos + 16 - 1}px`,
            };
        },

        rowTrashStyle() {
            if (this.selectedCol.length == this.tableData.col) {
                return {
                    display: 'none',
                };
            }
            if (this.selectedRow.length > 0) {
                let pos = 0;
                const rows = this.selectedRow[0];

                for (let i = 0; i < rows; i++) {
                    pos += this.rowList[i].height * this.scale;
                }
                return {
                    top: `${pos - 30}px`,
                };
            }
            return {};
        },

        colTrashStyle() {
            if (this.selectedCol.length > 0) {
                let pos = 0;
                let width = 0;
                const cols = this.selectedCol[0];

                this.selectedCol.forEach(item => {
                    width += this.colList[item].width * this.scale;
                });

                for (let i = 0; i < cols; i++) {
                    pos += this.colList[i].width * this.scale;
                }

                return {
                    left: `${pos + width / 2 - 13}px`,
                };
            }
            return {};
        },

        selectedCell() {
            return this.activeObject.selectedCell;
        },

        selectedCellList() {
            return this.activeObject.selectedCellList;
        },

        selectedColGroup() {
            const colGroup = new Array(this.tableData.col);
            this.selectedCellList.forEach(cell => {
                if (!colGroup[cell.col]) {
                    colGroup[cell.col] = [];
                }
                colGroup[cell.col].push(cell);
            });
            return colGroup;
        },

        selectedRowGroup() {
            const rowGroup = new Array(this.tableData.row);
            this.selectedCellList.forEach(cell => {
                if (!rowGroup[cell.row]) {
                    rowGroup[cell.row] = [];
                }
                rowGroup[cell.row].push(cell);
            });
            return rowGroup;
        },

        selectedCol() {
            if (this.selectedCellList && this.selectedCellList.length >= this.tableData.row) {
                const result = [];
                this.selectedColGroup.forEach((col, index) => {
                    if (col.length === this.tableData.row) {
                        result.push(index);
                    }
                });
                return result;
            }
            return [];
        },

        selectedRow() {
            if (this.selectedCellList && this.selectedCellList.length >= this.tableData.col) {
                const result = [];
                this.selectedRowGroup.forEach((row, index) => {
                    if (row.length === this.tableData.col) {
                        result.push(index);
                    }
                });
                return result;
            }
            return [];
        },

        isSelectAll() {
            if (this.selectedCellList.length === this.tableData.row * this.tableData.col) {
                return true;
            }
            return false;
        },

        resRoot() {
            return Ktu.initialData.resRoot;
        },

        rowSplitStyle() {
            return {
                bottom: `${-this.strokeWidth / 2}px`,
                height: `${this.strokeWidth}px`,
            };
        },

        colSplitStyle() {
            return {
                right: `${-this.strokeWidth / 2}px`,
                width: `${this.strokeWidth}px`,
            };
        },
    },
    watch: {
        target() {
            if (this.target.type === 'multi') {
                this.target.objects.forEach(object => {
                    if (object.type === 'table') {
                        this.resetSelect();
                    }
                });
            }
        },

        tableScale(value) {
            if (value) {
                this.resetSelect();
            }
        },
    },
    mounted() {
        this.resetSelect();
    },
    beforeDestroy() {
        // this.resetSelect();
    },
    methods: {
        selectAll() {
            this.activeObject.selectAll();
        },

        // 表格操作框的方法
        selectCol(index) {
            this.activeObject.selectCol(index);
        },

        selectRow(index) {
            this.activeObject.selectRow(index);
        },

        mouseenterRow(e, index) {
            const height = e.target.offsetHeight;
            const {
                offsetY,
            } = e;
            if (offsetY < height / 2) {
                this.hoverRow = index;
            } else {
                this.hoverRow = index + 1;
            }
            this.hoverCol = -1;
        },

        mousemoveRow(e, index) {
            this.mouseenterRow(e, index);
        },

        mouseenterCol(e, index) {
            const width = e.target.offsetWidth;
            const {
                offsetX,
            } = e;
            if (offsetX < width / 2) {
                this.hoverCol = index;
            } else {
                this.hoverCol = index + 1;
            }
            this.hoverRow = -1;
        },

        mousemoveCol(e, index) {
            this.mouseenterCol(e, index);
        },

        tableMouseleave() {
            this.hoverCol = -1;
            this.hoverRow = -1;
        },

        mouseover(type) {
            if (type === 'col') {
                this.isHoverColTrash = true;
            } else {
                this.isHoverRowTrash = true;
            }
            this.tableMouseleave();
            $('#editorView .selected').addClass('hoverTrash');
        },

        mouseout(type) {
            if (type === 'col') {
                this.isHoverColTrash = false;
            } else {
                this.isHoverRowTrash = false;
            }
            $('#editorView .selected').removeClass('hoverTrash');
        },

        addRow() {
            if (this.hoverRow > -1) {
                this.activeObject.addRow(this.hoverRow);
            }
            this.resetSelect();
            Ktu.log('tableBox', 'addRow');
        },

        addCol() {
            if (this.hoverCol > -1) {
                this.activeObject.addCol(this.hoverCol);
            }
            this.resetSelect();
            Ktu.log('tableBox', 'addCol');
        },

        delRow() {
            if (this.selectedRow.length > 0) {
                this.activeObject.delRow(this.selectedRow);
            }
            this.resetSelect();
            Ktu.log('tableBox', 'deleteRow');
        },

        delCol() {
            if (this.selectedCol.length > 0) {
                this.activeObject.delCol(this.selectedCol);
            }
            this.resetSelect();
            Ktu.log('tableBox', 'deleteCol');
        },

        resetSelect() {
            if (this.target && this.target.type === 'table') {
                this.target.clearSelect();
                this.isHoverColTrash = false;
                this.isHoverRowTrash = false;
            }
        },

        mouseenterResize() {
            this.tableMouseleave();
        },

        mousemoveResize() {
            this.tableMouseleave();
        },

        // 获取resize的鼠标样式
        getCursor(control) {
            let cursor = 'resize-0';
            let totalAngle = 0;
            const {
                angle,
            } = this.target;
            const cursorMap = ['resize-0', 'resize-45', 'resize-90', 'resize-135'];

            if (control === 'row') {
                totalAngle = angle + 22.5;
            } else {
                totalAngle = 90 + angle + 22.5;
            }

            totalAngle < 0 && (totalAngle += 360);
            totalAngle >= 360 && (totalAngle -= 360);
            !totalAngle && (totalAngle = 0);

            cursor = cursorMap[Math.floor(totalAngle / 45) % 4];
            return `url(${this.resRoot}/image/editor/edit/table/${cursor}.svg) 8 8, e-resize`;
        },
    },
});