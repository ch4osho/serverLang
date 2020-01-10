Vue.component('ele-utils', {
    template: `
    <div class="ele-utils page" :class="{active : activeChoose}">
        <div class="container">
            <div class="utils-line" v-for="(lineItem,lineIndex) in utilsType" :key="lineIndex">
                <div class="utils-box" :class="{'active' : lineIndex == activeLineIndex && index == activeIndex}"
                    v-for="(item,index) in lineItem" :key="index" @click="chooseType(item,index,lineIndex)">
                    <div class="box-item" :class="['box-item-' + item.type]">
                        <svg class="box-svg">
                            <use :xlink:href="'#svg-utils-'+item.type"></use>
                        </svg>
                        <svg class="active-arrow" v-if="activeChoose&&lineIndex == activeLineIndex && index == activeIndex && !isClickQrCode && !isClickWordArt && !isClickMap">
                            <use xlink:href="#svg-material-active-arrow"></use>
                        </svg>
                    </div>
                    <div class="box-title" v-text="item.title"></div>
                </div>
                <transition name="slide-up">
                    <div v-if="activeChoose && activeLineIndex == lineIndex && !isClickQrCode&&!isClickWordArt&&!isClickMap" class="utils-group" ref="slide">
                        <div class="group-container" v-if="activeIndex == 2">
                            <div class="tableUnit" :class="{'active': tableType !== -1}">
                                <div class="units-line" v-for="(line, lineIndex) in tableUnit">
                                    <div class="box-item" :class="{'active': tableType === item.type}"
                                        v-for="item in line" @click="chooseTableType(lineIndex, item)">
                                        <svg class="table-icon">
                                            <use :xlink:href="item.icon"></use>
                                        </svg>
                                    </div>

                                    <transition name="slide-up">
                                        <div class="customUnit" v-if="lineIndex === activeTableLine" @click.stop>
                                            <div class="custom-context">
                                                <div class="inputBox">
                                                    <label class="input-tip">行数</label>
                                                    <input type="text" id="cus_row" placeholder="行数" class="unitInput" v-model="rows" ref="rowInput"
                                                    @focus="focusRow" @input="numberOnlyRow">
                                                    <span class="tip"> x </span>
                                                    <label class="input-tip">列数</label>
                                                    <input type="text" id="cus_col" placeholder="列数" class="unitInput" v-model="cols"
                                                    @focus="focusCol" @input="numberOnlyCol">
                                                </div>

                                                <div class="btn-box">
                                                    <div class="btn" @click="okCustomUnit">确定</div>
                                                </div>

                                                <div class="btn-upload-box" @mouseleave="closeTips" @mouseenter="showTips">
                                                    <div class="btn-upload" @mousedown="closeTips" @click="importExcel">上传Excel</div>
                                                    <input id="select_excel" type="file" ref="excelInput"
                                                     @change="excelChange" />
                                                </div>

                                                <div class="upload-title-tip" v-show="isShowTips">不能上传空表格，行/列数不能超过20</div>
                                            </div>
                                            <div class="custom-arrow" :style="arrowStyle"></div>
                                        </div>
                                    </transition>
                                </div>
                            </div>
                        </div>

                        <div class="group-container" v-if="activeIndex == 1">
                            <div class="chartUnit">
                                <div v-for="(chart,index) in chartUnit" class="box-item" :class="['box-item-' + chart.type]" @click="createChart(chart)">
                                    <svg class="box-svg">
                                        <use :xlink:href="'#svg-utils-chart-'+chart.type"></use>
                                    </svg>
                                </div>
                            </div>
						</div>
                    </div>
                </transition>

            </div>
		</div>

		<div class="excel-upload-error f_DNSTraffic" v-transfer-dom data-transfer="true" v-show="isShowErrorTips" @mousedown.stop>
			<div class="error-wrapper">
				<svg class="error-icon">
                    <use xlink:href="#svg-utils-error-excel"></use>
                </svg>
                <div class="error-tip">
                    <p class="error-title">哎呀，识别不了您的表格</p>
                    <p class="error-content">不能上传空表格，行/列数不能超过20</p>
                </div>
                <div class="btn btn-common error-btn" @click="closeError">知道了</div>
			</div>
        </div>

        <div class="manage-excel-upload-progress f_DNSTraffic" v-transfer-dom data-transfer="true" v-show="isShowUploadProgress">
            <div class="progress-wrapper">
                <svg class="upload-icon">
                    <use xlink:href="#svg-utils-upload-excel"></use>
                </svg>
                <div class="upload-progress">
                    <div class="upload-progress-bg" :style="{width : barWidth + '%'}">
                        <div class="upload-progress-bar"></div>
                    </div>
                    <div class="upload-progress-text">{{uploadPercent}}%</div>
                </div>
                <button class="upload-cancel" @click="stopExcelUpload">取消上传</button>
            </div>
        </div>
    </div>
    `,
    mixins: [Ktu.mixins.waterFall, Ktu.mixins.copyright],
    data() {
        return {
            // 激活 选择素材
            activeChoose: false,
            // 激活第几行
            activeLineIndex: -1,
            // 激活 行内第几个
            activeIndex: -1,
            activeItem: null,

            // 一级目录类型
            utilsType: [
                [{
                    title: '二维码',
                    key: 10,
                    type: 'qrCode',
                },
                {
                    title: '图表',
                    key: 0,
                    type: 'chart',
                },
                {
                    title: '表格',
                    key: 1,
                    type: 'table',
                },
                ],
                [{
                    title: '词云',
                    key: 2,
                    type: 'wordArt',
                },
                {
                    title: '地图',
                    key: 3,
                    type: 'map',
                },
                ],
            ],

            rows: 4,
            cols: 4,
            defaultRows: 4,
            defaultCols: 4,

            // 表单的子属性
            tableUnit: Ktu.config.table.unit(),

            // 存放表单在选的时候，选了那些行列
            selectingTable: {
                tr: -1,
                td: -1,
            },

            tableType: -1,
            activeTableLine: -1,
            tableUnit: [
                [{
                    type: 0,
                    color: '#67C7FF',
                    icon: '#svg-utils-table-0',
                },
                {
                    type: 1,
                    color: '#67C7FF',
                    icon: '#svg-utils-table-1',
                },
                {
                    type: 2,
                    color: '#67C7FF',
                    icon: '#svg-utils-table-2',
                },

                ],
                [{
                    type: 3,
                    color: '#67C7FF',
                    icon: '#svg-utils-table-3',
                }, {
                    type: 4,
                    color: '#67C7FF',
                    icon: '#svg-utils-table-4',
                },
                {
                    type: 5,
                    color: '#67C7FF',
                    icon: '#svg-utils-table-5',
                },
                ],
                [{
                    type: 6,
                    color: '#67C7FF',
                    icon: '#svg-utils-table-6',
                },
                {
                    type: 7,
                    color: '#67C7FF',
                    icon: '#svg-utils-table-7',
                },
                {
                    type: 8,
                    color: '#67C7FF',
                    icon: '#svg-utils-table-8',
                },
                ],
            ],
            tableColor: '',

            chartUnit: Ktu.config.chart.unit,
            isClickQrCode: false,
            isClickWordArt: false,
            isClickMap: false,
            isShowTips: false,
            isShowError: false,
            isShowUploadProgress: false,
            isUploading: false,
            isCancelUpload: false,
            uploadTimer: '',
            barWidth: 0,
            uploadPercent: 0,
            dataList: null,
            hasLogExcelFail: false,
        };
    },

    computed: {
        activePosition() {
            let str = '';
            if (this.activeChoose) {
                switch (this.activeIndex % 3) {
                    case 0:
                        str = 'first';
                        break;
                    case 1:
                        str = 'second';
                        break;
                    case 2:
                        str = 'third';
                        break;
                }
            }
            return str;
        },
        //  是否显示二维码编辑页
        qrCodeEditor: {
            get() {
                return this.$store.state.base.qrCodeEditor;
            },
            set(value) {
                this.$store.state.base.qrCodeEditor = value;
            },
        },
        //  是否显示二维码编辑页
        wordArtEditor: {
            get() {
                return this.$store.state.base.wordArtEditor;
            },
            set(value) {
                this.$store.state.base.wordArtEditor = value;
            },
        },
        // 是否显示地图编辑页
        mapEditor: {
            get() {
                return this.$store.state.base.mapEditor;
            },
            set(value) {
                this.$store.state.base.mapEditor = value;
            },
        },

        documentSize() {
            return Ktu.edit.documentSize;
        },

        arrowStyle() {
            return {
                left: `${this.tableType % 3 * 96 + 30}px`,
            };
        },
        isShowErrorTips() {
            return this.isShowError && !this.isShowUploadProgress && !this.isCancelUpload;
        },
    },
    created() {
        /* const map = {
            title: '地图',
            key: 3,
            type: 'map',
        };

        if (Ktu.isDevDebug) {
            this.utilsType[1].push(map);
        } */
    },
    watch: {
        qrCodeEditor: {
            handler(value) {
                if (value.show === false && value.type === 'add') {
                    this.activeChoose = false;
                }
            },
            deep: true,
        },
        wordArtEditor: {
            handler(value) {
                if (value.show === false && value.type === 'add') {
                    this.activeChoose = false;
                }
            },
            deep: true,
        },
        mapEditor: {
            handler(value) {
                if (value.show === false && value.type === 'add') {
                    this.activeChoose = false;
                }
            },
            deep: true,
        },
        isUploading: {
            handler(value) {
                Vue.nextTick(() => {
                    if (value) {
                        this.uploadTimer = setInterval(() => {
                            this.uploadPercent++;
                            this.barWidth++;
                            if (this.uploadPercent >= 100) {
                                this.isShowUploadProgress = false;
                                if (this.dataList !== null) {
                                    Ktu.simpleLog('table', 'excelSuccess');
                                    this.createTable(this.dataList.length, this.dataList[0].length, this.dataList);
                                }
                                clearInterval(this.uploadTimer);
                            }
                        }, 6);
                    }
                    else {
                        clearInterval(this.uploadTimer);
                    }
                });
            },
        },
    },
    methods: {
        chooseType(item, index, lineIndex) {
            // 再次点击收起图表列表
            if (this.activeIndex === index && this.activeLineIndex === lineIndex && !this.isClickQrCode && !this.isClickWordArt && !this.isClickMap) {
                this.activeChoose = false;
                this.activeIndex = -1;
                this.activeLineIndex = -1;
                return;
            }
            this.activeChoose = true;
            this.activeItem = item;
            this.activeIndex = index;
            this.activeLineIndex = lineIndex;

            if (this.activeItem.type === 'qrCode' && this.activeChoose) {
                // 更改二维码编辑器状态和类型
                this.isClickQrCode = true;
                this.qrCodeEditor = {
                    show: true,
                    type: 'add',
                };
            } else if (this.activeItem.type === 'wordArt' && this.activeChoose) {
                this.isClickWordArt = true;
                this.wordArtEditor = {
                    show: true,
                    type: 'add',
                };
                Ktu.log('addWordCloud');
            } else if (this.activeItem.type === 'map' && this.activeChoose) {
                this.isClickMap = true;
                this.mapEditor = {
                    show: true,
                    type: 'add',
                };
                Ktu.log('clickMapUtil');
            } else {
                this.isClickQrCode = false;
                this.isClickWordArt = false;
                this.isClickMap = false;
            }
        },

        focusRow(e) {
            e.target.select();
            this.defaultRows = this.rows;
            this.defaultCols = this.cols;
        },

        focusCol(e) {
            e.target.select();
            this.defaultRows = this.rows;
            this.defaultCols = this.cols;
        },

        // 自定义输入表格
        okCustomUnit() {
            const rowNum = parseInt(this.rows, 10) || 0;
            const colNum = parseInt(this.cols, 10) || 0;

            if (!rowNum || !colNum) {
                Ktu.notice.error('请输入1~20的整数');
                this.rows = this.defaultRows;
                this.cols = this.defaultCols;
                return;
            }

            if (rowNum > 20 || colNum > 20) {
                Ktu.notice.error('请输入1~20的整数');
                this.rows = this.defaultRows;
                this.cols = this.defaultCols;
                return;
            }

            this.createTable(rowNum, colNum);
        },

        numberOnlyRow(e) {
            this.rows = e.target.value.replace(/[^\d]/g, '');
        },

        numberOnlyCol(e) {
            this.cols = e.target.value.replace(/[^\d]/g, '');
        },

        createChart(chart) {
            const chartData1 = [{
                type: '主题1',
                data: [{
                    label: '类型1',
                    value: 10,
                },
                {
                    label: '类型2',
                    value: 20,
                },
                {
                    label: '类型3',
                    value: 30,
                },
                {
                    label: '类型4',
                    value: 40,
                },
                ],
            }];

            const chartData2 = [{
                type: '主题1',
                data: [{
                    label: '类型1',
                    value: 10,
                },
                {
                    label: '类型2',
                    value: 20,
                },
                {
                    label: '类型3',
                    value: 30,
                },
                {
                    label: '类型4',
                    value: 40,
                },
                ],
            },
            {
                type: '主题2',
                data: [{
                    label: '类型1',
                    value: 20,
                },
                {
                    label: '类型2',
                    value: 30,
                },
                {
                    label: '类型3',
                    value: 40,
                },
                {
                    label: '类型4',
                    value: 50,
                },
                ],
            },
            ];
            const chartData3 = [{
                type: '主题1',
                data: [{
                    label: '类型1',
                    value: 60,
                },
                {
                    label: '类型2',
                    value: 50,
                },
                {
                    label: '类型3',
                    value: 60,
                },
                {
                    label: '类型4',
                    value: 50,
                },
                {
                    label: '类型5',
                    value: 60,
                },
                {
                    label: '类型6',
                    value: 50,
                },
                ],
            }];

            const object = {
                width: 600,
                height: 300,
                color: '#1e88e5',
                isShowLabel: true,
                isShowLegend: true,
            };

            switch (chart.type) {
                case 'rect':
                    object.type = 'rectChart';
                    object.fontColor = '#999';
                    object.data = chartData1;
                    break;
                case 'gRect':
                    object.type = 'gRectChart';
                    object.fontColor = '#999';
                    object.data = chartData2;
                    break;
                case 'hRect':
                    object.type = 'hRectChart';
                    object.fontColor = '#999';
                    object.data = chartData1;
                    break;
                case 'hGRect':
                    object.type = 'hGRectChart';
                    object.fontColor = '#999';
                    object.data = chartData2;
                    break;
                case 'line':
                    object.type = 'lineChart';
                    object.fontColor = '#999';
                    object.data = chartData1;
                    break;
                case 'gLine':
                    object.type = 'gLineChart';
                    object.fontColor = '#999';
                    object.data = chartData2;
                    break;
                case 'pie':
                    object.type = 'pieChart';
                    object.fontColor = '#fff';
                    object.data = chartData1;
                    object.width = 400;
                    object.height = 400;
                    break;
                case 'donut':
                    object.type = 'donutChart';
                    object.fontColor = '#fff';
                    object.data = chartData1;
                    object.width = 400;
                    object.height = 400;
                    break;
                case 'rose':
                    object.type = 'roseChart';
                    object.fontColor = '#fff';
                    object.data = chartData3;
                    object.width = 400;
                    object.height = 400;
                    break;
            }

            Ktu.element.addModule('chart', object);
            Ktu.log('chart', chart.type);
        },

        // 选择表格模板类型
        chooseTableType(lineIndex, item) {
            if (this.tableType === item.type) {
                console.log('走到if里面了')
                this.tableType = -1;
                this.tableColor = '';
                this.activeTableLine = -1;
            } else {
                console.log('走到else里面了')
                this.tableType = item.type;
                this.tableColor = item.color;
                this.activeTableLine = lineIndex;
                this.$nextTick(() => {
                    // this.$refs.rowInput && this.$refs.rowInput.select();
                });
            }
        },

        // 创建表格
        createTable(tr, td, dataList = []) {
            const {
                width,
                height,
            } = this.documentSize;
            const height1 = width * 0.8 / td / 2.5 * tr;
            const lastHeight = height1 > height * 0.8 ? height * 0.8 : height1;
            const object = {
                type: 'table',
                width: width * 0.8,
                height: lastHeight,
                tableData: {
                    row: tr,
                    col: td,
                    dataList,
                    isNewBuilt: true,
                },
                tableType: this.tableType,
                themeColor: this.tableColor,
                strokeWidth: 1,
                borderColor: '#f1faff',
            };
            Ktu.element.addModule('table', object);
            Ktu.log('table', 'customize');
            this.tableColor = '';
            this.tableType = -1;
            this.activeTableLine = -1;
        },

        closeError() {
            this.isShowError = false;
        },

        importExcel() {
            this.$refs.excelInput[0].click();
        },
        // 导入excel后的处理
        excelChange(e) {
            this.isShowTips = false;
            this.barWidth = 0;
            this.uploadPercent = 0;
            this.isUploading = false;
            this.isCancelUpload = false;
            this.hasLogExcelFail = false;
            const {
                files,
            } = e.target;
            if (!!files && files.length > 0) {
                if (files[0].size > 2 * 1024 * 1024) {
                    Ktu.notice.error('单个文件大小不能超过2MB');
                    return;
                }
            }
            if (files[0] === undefined) {
                return;
            }
            // 上传文件转换为formData格式
            const fd = new FormData();
            fd.append('filedata', files[0], files[0].name);
            const url = '/ajax/advanceUpload_h.jsp?cmd=importExcelForFn';
            this.isShowUploadProgress = true;
            axios
                .post(url, fd, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                })
                .then(res => {
                    this.isUploading = true;
                    const info = res.data;
                    const check = info.success && !(info.dataList.length <= 1 && info.dataList[0].length <= 0);
                    if (check) {
                        this.formatData(info.dataList);
                    } else {
                        this.dataList = null;
                        this.isShowError = true;
                        if (!this.hasLogExcelFail) {
                            this.hasLogExcelFail = true;
                            Ktu.log('table', 'excelFail');
                        }
                    }
                })
                .catch(err => {
                    this.dataList = null;
                    console.log(err);
                })
                .finally(() => {
                    // 清空上传的excle文件
                    this.$refs.excelInput[0].value = '';
                });
        },

        showTips() {
            this.isShowTips = true;
        },

        closeTips() {
            this.isShowTips = false;
        },

        stopExcelUpload() {
            this.isShowUploadProgress = false;
            this.isUploading = false;
            this.isShowError = false;
            this.isCancelUpload = true;
            if (!this.hasLogExcelFail) {
                this.hasLogExcelFail = true;
                Ktu.simpleLog('table', 'excelFail');
            }
        },

        formatData(data) {
            const lenList = data.map(value => value.length);
            const maxTd = Math.max(...lenList);
            this.dataList = data;
            data.map(element => {
                for (let i = element.length; i < maxTd; i++) {
                    element.push('');
                }
            });
            this.dataList = data;
        },
    },
});
