Vue.component('chart-data-edit', {
    template: `
        <div class="chart-data-edit" v-if="selectedData && selectedData.type == 'chart'"
        @click.stop
        @mousedown.stop="mousedownChart">
            <div class="chart-wrapper" :class="{'trash-hover': trashHover, 'multipleChart': isMultipleChart}" :style="chartStyle"
            @click="select"
            @mousedown="mousedown"
            @mousemove="mousemove"
            @mouseup="mouseup"
            @contextmenu.stop.prevent>
                <div class="chart-header-btn" v-if="!event">
                    <div class="chart-btn plus-btn col-plus-btn" :style="addColStyle" v-show="hoverCol != -1"
                    @mousemove.stop
                    @mousedown.stop
                    @click="addCol('hoverCol')">
                        <svg class="btn-icon">
                            <use xlink:href="#svg-tool-add"></use>
                        </svg>
                    </div>
                    <div class="chart-btn plus-btn row-plus-btn" :style="addRowStyle"  v-show="hoverRow != -1"
                    @mousemove.stop
                    @mousedown.stop
                    @click="addRow('hoverRow')">
                        <svg class="btn-icon">
                            <use xlink:href="#svg-tool-add"></use>
                        </svg>
                    </div>
                    <div class="chart-btn trash-btn" :style="trashStyle" v-show="selectedCol || selectedRow"
                    @click="deleteData('hoverDelete')"
                    @mousedown.stop
                    @mouseover="mouseover"
                    @mouseout="mouseout">
                        <svg class="btn-icon">
                            <use xlink:href="#svg-tool-remove"></use>
                        </svg>
                    </div>

                    <div class="col-btn-area" @mousemove="mousemoveStop"></div>
                    <div class="row-btn-area" @mousemove="mousemoveStop"></div>
                </div>

                <div class="chart-container" :style="{'width':chartContainerWidth+'px','max-height':chartContainerHeight+'px'}" @scroll="scroll" @mousedown.stop="mousedownChart" ref="chartContainer">
                    <div class="chart-plus-line" v-if="!event">
                        <div class="col-plus-line" :style="colLineStyle"  v-show="hoverCol != -1"></div>
                        <div class="row-plus-line" :style="rowLineStyle"  v-show="hoverRow != -1"></div>
                    </div>
                    <div class="chart-header">
                        <div class="chart-corner"></div>
                        <div class="chart-col-headers">
                            <ul class="chart-col-wrapper">
                                <li class="chart-col-header" col="0" @click="selectCol(0)"
                                @mouseenter="mouseenterCol($event, -1)"
                                @mousemove="mousemoveCol($event, -1)"></li>
                                <li class="chart-col-header" v-for="(item, index) in chartData[0].data" :col="index + 1" :class="{'selected': selectedCol == index + 1}"
                                @click.stop="selectCol(index + 1)"
                                @mouseenter="mouseenterCol($event, index)"
                                @mousemove="mousemoveCol($event, index)"
                                @contextmenu="contextmenu($event, 0, index + 1)"></li>
                            </ul>
                        </div>
                        <div class="chart-row-headers">
                            <ul class="chart-row-wrapper">
                                <li class="chart-row-header" row="0" @click="selectRow(0)"
                                @mouseenter="mouseenterRow($event, -1)"
                                @mousemove="mousemoveRow($event, -1)"></li>
                                <li class="chart-row-header" v-for="(item, index) in chartData"
                                :row="index + 1" :class="{'selected': selectedRow == index + 1}"
                                @click.stop="selectRow(index + 1)"
                                @mouseenter="mouseenterRow($event, index)"
                                @mousemove="mousemoveRow($event, index)"
                                @contextmenu="contextmenu($event, index + 1, 0)"></li>
                            </ul>
                        </div>
                    </div>

                    <div class="chart-menu" ref="chartMenu">
                        <div class="chart-body">
                            <ul class="chart-row">
                                <li class="chart-cell cell-header cell-blank" col="0" row="0"></li>
                                <li class="chart-cell cell-header" v-for="(type, index) in chartData[0].data"
                                :col="index + 1" row="0"
                                :class="{'selected': selectedCol == index + 1}"
                                :style="{'width': cellWidth + 'px',height: cellHeight + 'px'}">
                                    <input type="text" class="input" v-model="type.label" maxlength="10"
                                    @change="changeLabel($event, index)"
                                    @click="focusInput"
                                    @keyup.enter="enter"
                                    @contextmenu="contextmenu($event, 0, index + 1)"/>
                                </li>
                            </ul>
                            <ul class="chart-row" v-for="(item, index) in chartData">
                                <li class="chart-cell cell-header"
                                col="0" :row="index + 1"
                                :class="{'selected': selectedRow == index + 1}">
                                    <input type="text" class="input" v-model="chartData[index].type" maxlength="10"
                                    @change="changeType($event, index)"
                                    @click="focusInput"
                                    @keyup.enter="enter"
                                    @contextmenu="contextmenu($event, index + 1, 0)"/>
                                </li>
                                <li class="chart-cell" v-for="(cell, idx) in item.data"
                                :col="idx + 1" :row="index + 1"
                                :class="{'selected': selectedCol == idx + 1 || selectedRow == index + 1}">
                                    <input type="text" class="input" v-model="cell.value" min="0" maxlength="10"
                                    @keydown="isNumber"
                                    @change="changeData($event, cell)"
                                    @input="checkInput(cell)"
                                    @click="focusInput"
                                    @contextmenu="contextmenu($event, index + 1, idx + 1)"/>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="chart-tool"  @mousedown.stop>
                    <div class="tool-addRow" :class="{'disableBtn': disableRow}" @click="addRow('addRow')">
                        <svg class="row-icon">
                            <use xlink:href="#svg-tool-add-row"></use>
                        </svg>
                        <span>添加行</span>
                    </div>
                    <div class="tool-addCol" :class="{'disableBtn': disableCol}" @click="addCol('addCol')">
                        <svg class="col-icon">
                            <use xlink:href="#svg-tool-add-col"></use>
                        </svg>
                        <span>添加列</span>
                    </div>
                    <div class="tool-split"></div>
                    <div class="tool-excel" @click="importExcel">
                        <svg class="excel-icon">
                            <use xlink:href="#svg-tool-excel"></use>
                        </svg>
                        <span>导入EXCEl表格</span>
                        <input class="excel-input" ref="excelInput" type="file" @change="excelChange"
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"/>
                        <div class="excel-gif"></div>
                    </div>
                    <div class="tool-split"></div>
                    <div class="tool-label">
                        <span>显示图例</span>
                        <ktu-switch :value="isShowLegend" @input="input1" logName=""></ktu-switch>
                    </div>
                    <div class="tool-count">
                        <span>显示数据标签</span>
                        <ktu-switch :value="isShowLabel"  @input="input2" logName=""></ktu-switch>
                    </div>
                </div>
            </div>

            <div class="chart-contextmenu" :style="contextmenuStyle" v-if="event" @mousedown.stop>
                <ul class="contextmenu-list">
                    <li class="contextmenu-item" :class="{'disable': disableDelRow}"
                    @click="selectDelType(0)"
                    @mouseover="mouseoverRow"
                    @mouseout="mouseoutRow">
                        <label class="contextmenu-label">删除该行</label>
                    </li>
                    <li class="contextmenu-item" :class="{'disable': disableDelCol}"
                    @click="selectDelType(1)"
                    @mouseover="mouseoverCol"
                    @mouseout="mouseoutCol">
                        <label class="contextmenu-label">删除该列</label>
                    </li>
                </ul>
            </div>

            <div class="excel-import-error f_DNSTraffic" v-transfer-dom data-transfer="true" v-show="isShowError" @mousedown.stop>
                <div class="error-wrapper">
                    <div class="error-icon"></div>
                    <div class="error-tip">
                        <h1 class="error-title">哎呀，识别不了您的表格~</h1>
                        <p class="error-content">只支持一维、二维表格，表头不允许只输入数字，表格里不含公式</p>
                    </div>
                    <div class="btn btn-common error-btn" @click="closeError">知道了</div>
                </div>
            </div>
        </div>
    `,
    /* <div class="chart-close-btn">
            <Icon type="ios-close-empty" class="close-icon"></Icon>
        </div>
    */
    name: 'chartDataEdit',
    mixins: [Ktu.mixins.dataHandler],
    props: {},
    data() {
        return {
            isShowError: false,
            // 多行数据图表
            multipleChart: ['gRectChart', 'gLineChart', 'hGRectChart'],

            selectedCol: 0,
            selectedRow: 0,

            isShowColPlus: false,
            isShowRowPlus: false,
            hoverCol: -1,
            hoverRow: -1,

            scrollLeft: 0,
            scrollTop: 0,

            trashHover: false,

            isDrag: false,
            transformX: 0,
            transformY: 0,
            left: 0,
            top: 0,
            startX: 0,
            startY: 0,

            // 激发右键弹出菜单
            event: null,
            // 用于右键删除行列的缓存
            cacheSelected: {
                col: 0,
                row: 0,
            },
            chartContainerWidth: 566,
            chartContainerHeight: 226,
            cellWidth: 110,
            cellHeight: 30,
        };
    },
    computed: {
        isEditChartData: {
            get() {
                return this.$store.state.base.isEditChartData;
            },
            set(value) {
                this.$store.commit('base/changeState', {
                    prop: 'isEditChartData',
                    value,
                });
            },
        },

        // 左边栏是否展开
        isShowEleDetail() {
            return this.$store.state.base.isShowEleDetail;
        },

        // 图表数据
        chartData() {
            if (this.selectedData && this.selectedData.msg && this.selectedData.msg.data) {
                return JSON.parse(JSON.stringify(this.selectedData.msg.data));
            }
            return null;
        },

        // 是否显示标签
        isShowLabel: {
            get() {
                return this.selectedData.msg.isShowLabel;
            },
            set(value) {
                this.selectedData.msg.isShowLabel = value;
            },
        },

        // 是否显示图例
        isShowLegend: {
            get() {
                return this.selectedData.msg.isShowLegend;
            },
            set(value) {
                this.selectedData.msg.isShowLegend = value;
            },
        },

        // 是否是接受多行数据的图标，用于数据编辑
        isMultipleChart() {
            return this.multipleChart.includes(this.selectedData.msg.chartType);
        },

        // 垃圾桶的位置
        trashStyle() {
            if (this.selectedCol || this.selectedRow) {
                if (this.selectedCol) {
                    return {
                        display: 'block',
                        top: '5px',
                        left: `${95 + this.selectedCol * 110 - this.scrollLeft}px`,
                    };
                }
                return {
                    display: 'block',
                    top: `${28 + this.selectedRow * 30 - this.scrollTop}px`,
                    left: `${60 - this.scrollLeft}px`,
                };
            }
            return {
                display: 'none',
            };
        },

        //  列添加的位置
        addColStyle() {
            if (this.hoverCol != -1) {
                const pos = 148 + this.hoverCol * 110 - this.scrollLeft;

                // 显示范围做个限制
                if (pos < 25 || pos > 588) {
                    this.hoverCol = -1;
                }
                return {
                    left: `${pos}px`,
                };
            }
        },

        // 行添加的位置
        addRowStyle() {
            if (this.hoverRow != -1) {
                return {
                    top: `${68 + this.hoverRow * 30 - this.scrollTop}px`,
                };
            }
        },

        // 列添加线的样式
        colLineStyle() {
            if (this.hoverCol != -1) {
                return {
                    left: `${124 + this.hoverCol * 110}px`,
                    // 46 = 30(表头) + 16
                    height: `${46 + 30 * this.chartData.length}px`,
                };
            }
        },

        // 行添加线的样式
        rowLineStyle() {
            if (this.hoverRow != -1) {
                return {
                    top: `${44 + this.hoverRow * 30}px`,
                    // 126 = 110(表头) + 16
                    width: `${126 + 110 * this.chartData[0].data.length}px`,
                };
            }
        },

        // 定位位置
        chartStyle() {
            return {
                left: `${this.left}px`,
                top: `${this.top}px`,
            };
        },

        // 是否可以添加行
        disableRow() {
            if (this.isMultipleChart && this.chartData.length < 20) {
                return false;
            }
            return true;
        },

        // 是否可以添加列
        disableCol() {
            if (this.chartData[0].data.length < 20) {
                return false;
            }
            return true;
        },

        // 右键菜单位置
        position() {
            const left = this.event.clientX;
            const top = this.event.clientY;

            // 做一些边界处理
            return {
                left,
                top,
            };
        },

        // 右键菜单的样式
        contextmenuStyle() {
            return {
                left: `${this.position.left}px`,
                top: `${this.position.top}px`,
            };
        },

        // 能否删除行
        disableDelRow() {
            if (this.cacheSelected.row && this.isMultipleChart && this.chartData.length > 1) {
                return false;
            }
            return true;
        },

        // 能否删除列
        disableDelCol() {
            if (this.cacheSelected.col && this.chartData[0].data.length > 1) {
                return false;
            }
            return true;
        },
    },
    watch: {
        chartData: {
            handler(value) {
                if (value) {
                    value.length >= 7 ? (this.chartContainerWidth = 572) : (this.chartContainerWidth = 566);
                    value[0].data.length > 4 && value.length >= 6 ? (this.chartContainerHeight = 232) : (this.chartContainerHeight = 226);
                }
            },
            immediate: true,
        },
    },
    created() {
        if (this.isEditChartData) {
            if (this.isShowEleDetail) {
                this.left = 80 + 320 + 10;
            } else {
                this.left = 80 + 10;
            }
            this.top = 116;

            window.setTimeout(() => {
                window.addEventListener('mousedown', this.closeModal);
                window.addEventListener('mouseup', this.mouseup);
            }, 100);
        }
    },
    deactivate() {
        /* document.removeEventListener('click', this.closeModal);
           document.removeEventListener('dblclick', this.closeModal); */
    },
    methods: {
        // 关闭图表数据编辑模态框
        closeModal() {
            window.removeEventListener('mousedown', this.closeModal);
            window.removeEventListener('mouseup', this.mouseup);
            this.isEditChartData = false;
        },

        //  关闭导入表格错误提示
        closeError() {
            this.isShowError = false;
        },

        // 全选文字
        focusInput(e) {
            e.target.select();
        },

        // 取消选择
        select() {
            this.selectedRow = 0;
            this.selectedCol = this.selectedRow;
        },

        //  选择列
        selectCol(col) {
            this.selectedCol = col;
            this.selectedRow = 0;
        },

        // 选择行
        selectRow(row) {
            if (!this.isMultipleChart) {
                return;
            }
            this.selectedCol = 0;
            this.selectedRow = row;
        },

        // 滚动激发
        scroll(e) {
            this.scrollLeft = e.target.scrollLeft;
            this.scrollTop = e.target.scrollTop;
        },

        mousedown(e) {
            this.isDrag = true;
            this.startX = e.offsetX;
            this.startY = e.offsetY;
            window.addEventListener('mousemove', this.mousemove);
        },

        mousemove(e) {
            if (this.isDrag) {
                this.left = e.clientX - this.startX;
                this.top = e.clientY - this.startY;
            } else {
                // this.isDrag = false;
                this.mousemoveAll();
            }
        },
        mouseup(e) {
            if (this.isDrag) {
                this.startX = e.clientX;
                this.startY = e.clientY;
                this.isDrag = false;
                window.removeEventListener('mousemove', this.mousemove);
            }
        },

        // hover垃圾桶
        mouseover() {
            this.trashHover = true;
        },

        // 离开垃圾桶
        mouseout() {
            this.trashHover = false;
        },

        // 显示列添加
        mouseenterCol(e, key) {
            if (this.disableCol || this.isDrag || this.event) {
                return;
            }
            if (e.offsetX < 55) {
                this.hoverCol = key;
            } else {
                this.hoverCol = key + 1;
            }
        },

        // 判断列添加
        mousemoveCol(e, key) {
            if (!this.isDrag || this.isDrag) {
                e.stopPropagation();
            }
            if (this.disableCol || this.event) {
                return;
            }
            if (e.offsetX < 55) {
                this.hoverCol = key;
            } else {
                this.hoverCol = key + 1;
            }
        },

        // 显示行添加
        mouseenterRow(e, key) {
            if (this.disableRow || this.isDrag || this.event) {
                return;
            }
            if (e.offsetY < 15) {
                this.hoverRow = key;
            } else {
                this.hoverRow = key + 1;
            }
        },

        // 判断列添加
        mousemoveRow(e, key) {
            if (!this.isDrag) {
                e.stopPropagation();
            }
            if (this.disableRow || this.isDrag || this.event) {
                return;
            }
            if (!this.isMultipleChart) {
                return;
            }
            if (e.offsetY < 15) {
                this.hoverRow = key;
            } else {
                this.hoverRow = key + 1;
            }
        },

        mousemoveStop(e) {
            if (!this.isDrag) {
                e.stopPropagation();
            }
        },

        //  取消行列选择
        mousemoveAll() {
            this.hoverRow = -1;
            this.hoverCol = this.hoverRow;
        },

        enter(e) {
            e.target.blur();
        },

        isNumber(e, item) {
            const {
                keyCode,
            } = e;
            // 数字
            if (keyCode >= 48 && keyCode <= 57) return true;
            // 小数字键盘
            if (keyCode >= 96 && keyCode <= 105) return true;
            // Backspace, del, 左右方向键,tab
            const allowKeys = [8, 46, 37, 39, 9, 110, 190];
            if (allowKeys.includes(keyCode)) return true;

            if (keyCode == 13) {
                this.enter(e);
                return true;
            }
            e.preventDefault();
            return false;
        },

        // 数据输入验证
        changeData(e, item) {
            const value = e.target.value * 1;
            if (isNaN(value) || typeof value != 'number' || value == '' || value < 0) {
                item.value = 0;
            } else {
                item.value = value;
            }
            this.changeMsg();
        },

        checkInput(item) {
            /* let value = item.value;
               if (isNaN(value) || typeof parseFloat(value) != "number" || value == '') {
               item.value = 0;
               } else {
               item.value = parseFloat(value);
               } */
        },

        // 添加列
        addCol(eventType) {
            if (this.disableCol) {
                return;
            }
            if (this.chartData[0].data.length < 20) {
                // 做一个校验，默认最后一列添加
                if (this.hoverCol == -1) {
                    this.hoverCol = this.chartData[0].data.length;
                }
                this.chartData.forEach(obj => {
                    if (obj.data.length < 20) {
                        obj.data.splice(this.hoverCol, 0, {
                            label: '类型',
                            value: 0,
                        });
                    }
                });
                this.changeMsg();
                Ktu.log('chartTool', eventType);

                const addColIndex = this.hoverCol + 1;
                this.$nextTick(() => {
                    $('.chart-row')
                        .eq(1)
                        .find(`li[col=${addColIndex}]`)
                        .find('input')
                        .select();

                    this.$refs.chartContainer.scrollTop = 0;
                    if (eventType === 'addCol') {
                        this.$refs.chartContainer.scrollLeft = this.$refs.chartContainer.scrollWidth - this.$refs.chartContainer.clientWidth;
                    } else {
                        this.$refs.chartContainer.scrollLeft = addColIndex >= 5 ? this.scrollLeft + this.cellWidth : this.scrollLeft;
                    }
                });
            } else {
                Ktu.notice.error('数据列数不能超过20列！');
                return;
            }
            this.mousemoveAll();
        },

        // 添加行
        addRow(eventType) {
            if (this.disableRow) {
                return;
            }
            // 做一个校验，默认最后一行添加
            if (this.hoverRow == -1) {
                this.hoverRow = this.chartData.length;
            }
            if (this.chartData.length < 20) {
                const obj = {
                    type: '主题',
                    data: [],
                };
                this.chartData[0].data.forEach((item, index) => {
                    obj.data.push({
                        label: item.label,
                        value: 0,
                    });
                });
                this.chartData.splice(this.hoverRow, 0, obj);

                this.changeMsg();
                Ktu.log('chartTool', eventType);

                const addRowIndex = this.hoverRow + 1;
                this.$nextTick(() => {
                    $('.chart-row')
                        .eq(addRowIndex)
                        .find('li[col=1]')
                        .find('input')
                        .select();

                    this.$refs.chartContainer.scrollLeft = 0;
                    if (eventType === 'addRow') {
                        this.$refs.chartContainer.scrollTop = this.$refs.chartContainer.scrollHeight - this.$refs.chartContainer.clientHeight;
                    } else {
                        this.$refs.chartContainer.scrollTop = addRowIndex >= 7 ? this.scrollTop + this.cellHeight : this.scrollTop;
                    }
                });
            } else {
                Ktu.notice.error('数据行数不能超过20行！');
                return;
            }
            this.mousemoveAll();
        },

        deleteData(eventType) {
            if (this.selectedCol) {
                if (this.chartData[0].data.length > 1) {
                    this.chartData.forEach(obj => {
                        if (obj.data.length > 1) {
                            obj.data.splice(this.selectedCol - 1, 1);
                        }
                    });
                    this.changeMsg();
                    Ktu.log('chartTool', eventType);
                } else {
                    Ktu.notice.error('最后一列数据不能删除！');
                    return;
                }
            } else {
                if (this.chartData.length > 1) {
                    this.chartData.splice(this.selectedRow - 1, 1);
                    this.changeMsg();
                    Ktu.log('chartTool', eventType);
                } else {
                    Ktu.notice.error('最后一行数据不能删除！');
                    return;
                }
            }
        },

        // 激发excel文件上传
        importExcel() {
            this.$refs.excelInput.click();
        },

        // 更改数据的类型表头
        changeType(e, index) {
            this.chartData[index].type = e.target.value;
            this.changeMsg();
        },

        // 改变label需要遍历所有进行修改
        changeLabel(e, idx) {
            this.chartData.forEach(obj => {
                obj.data.forEach((item, index) => {
                    if (index === idx) {
                        item.label = e.target.value;
                    }
                });
            });
            this.changeMsg();
        },

        // 改变数据即更新视图
        changeMsg(isSaveState = true) {
            isSaveState && this.selectedData.saveState();
            this.selectedData.msg.data = this.chartData;
            // this.selectedData.changeColor(this.selectedData.msg.color);
            this.selectedData.modifiedState();
            this.selectedData.dirty = true;
        },

        // 导入excel后的处理
        excelChange(e) {
            const {
                files,
            } = e.target;
            if (!!files && files.length > 0) {
                if (files[0].size > 2 * 1024 * 1024) {
                    Ktu.notice.error('单个文件大小不能超过2MB');
                    return;
                }
            }

            // 上传文件转换为formData格式
            const fd = new FormData();
            fd.append('filedata', files[0], files[0].name);

            const url = '../ajax/advanceUpload_h.jsp?cmd=importExcel';

            axios
                .post(url, fd, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                })
                .then(res => {
                    const info = res.data;
                    if (info.success) {
                        if (info.xAxis.length > 0) {
                            this.formatData(info);
                            Ktu.log('chartTool', 'importExcel');
                        } else {
                            this.isShowError = true;
                        }
                    } else {
                        this.isShowError = true;
                    }
                })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => {
                    // 清空上传的excle文件
                    this.$refs.excelInput.value = '';
                });
        },

        // 整理数据
        formatData(data) {
            const arr = [];
            if (this.isMultipleChart) {
                // 多行图表数据处理
                data.yAxis.forEach((item, index) => {
                    const object = {};
                    object.type = this.sliceStr(item, 10, false);
                    object.data = [];

                    data.xAxis.forEach((prop, idx) => {
                        if (idx != 0) {
                            const obj = {};
                            obj.label = this.sliceStr(prop, 10, false);
                            obj.value = this.sliceStr(data.dataList[index][idx - 1]);
                            object.data.push(obj);
                        }
                    });
                    arr.push(object);
                });
            } else {
                //  单行数据处理，只取第一行
                const object = {};
                object.type = this.sliceStr(data.yAxis[0], 10, false);
                object.data = [];

                data.xAxis.forEach((prop, idx) => {
                    if (idx != 0) {
                        const obj = {};
                        obj.label = this.sliceStr(prop, 10, false);
                        obj.value = this.sliceStr(data.dataList[0][idx - 1]);
                        object.data.push(obj);
                    }
                });
                arr.push(object);
            }

            this.selectedData.saveState();
            this.selectedData.msg.data = arr;
            this.changeMsg(false);
        },

        // 保存数据修改历史
        input1(val) {
            this.selectedData.saveState();
            this.isShowLegend = val;
            this.changeMsg(false);
        },

        input2(val) {
            this.selectedData.saveState();
            this.isShowLabel = val;
            this.changeMsg(false);
        },

        // 截取字符串
        sliceStr(str, num = 10, isNumber = true) {
            if (isNumber) {
                if (!str || str < 0) {
                    if (str == 0) {
                        return 0;
                    }
                    return 10;
                }
                str += '';
                return parseFloat(str.length > num ? str.slice(0, num) : str);
            }
            return str.length > num ? str.slice(0, num) : str;
        },

        // 右键事件
        contextmenu(e, rowIdx, colIdx) {
            e.preventDefault();
            e.target.blur();

            /* if (rowIdx && !this.isMultipleChart) {
               return;
               } */

            this.event = e;
            this.cacheSelected = {
                row: rowIdx,
                col: colIdx,
            };
            // 当前只有其中删除行或者列
            if (rowIdx && !colIdx) {
                this.selectedRow = rowIdx;
                this.selectedCol = 0;
            } else if (!rowIdx && colIdx) {
                this.selectedRow = 0;
                this.selectedCol = colIdx;
            } else {
                this.initData();
            }
        },

        selectDelType(type) {
            if (type === 0) {
                if (this.disableDelRow) {
                    return;
                }
                this.selectedRow = this.cacheSelected.row;
            } else {
                if (this.disableDelCol) {
                    return;
                }
                this.selectedCol = this.cacheSelected.col;
            }
            this.deleteData('contextmenuDelete');
            this.initData();
            this.event = null;
            this.cacheSelected = {
                row: 0,
                col: 0,
            };
        },

        mousedownChart() {
            this.initData();
            this.event = null;
        },

        mouseoverRow() {
            if (this.disableDelRow || this.disableDelCol) {
                return;
            }
            this.selectedRow = this.cacheSelected.row;
        },

        mouseoutRow() {
            if (this.disableDelRow || this.disableDelCol) {
                return;
            }
            this.selectedRow = 0;
        },
        mouseoverCol() {
            if (this.disableDelRow || this.disableDelCol) {
                return;
            }
            this.selectedCol = this.cacheSelected.col;
        },
        mouseoutCol() {
            if (this.disableDelRow || this.disableDelCol) {
                return;
            }
            this.selectedCol = 0;
        },

        initData() {
            this.selectedRow = 0;
            this.selectedCol = 0;
            this.hoverRow = -1;
            this.hoverCol = -1;
        },
    },
});
