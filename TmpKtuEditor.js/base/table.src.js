class Table extends TheElement {
    constructor(obj) {
        super(obj);

        this.type = obj.type;
        // 同样表格的信息保存在msg里
        this.msg = typeof obj.msg == 'string' ? JSON.parse(obj.msg) : obj.msg;
        this.msg.class = `table_${this.objectId}`;

        this.containerClass = this.msg.class;
        this.scaleProp = 'wh';

        // 控制点
        this.controls = {
            tl: false,
            tr: false,
            br: true,
            bl: false,
            mt: false,
            mr: true,
            mb: true,
            ml: false,
            rotate: true,
        };

        this.selectedCell = null;
        this.selectedCellList = [];
        this.isEditingText = false;
        // 真实边框值
        this.factStrokeWidth = this.strokeWidth / this.scaleX || 0;

        // 初始化数据一波
        this.initTableData();
    }

    /* 通过path查找点击目标,svg的className是一个对象，通过baseVal区分 */
    checkTarget(event) {
        const paths = event.path || (event.composedPath && event.composedPath());
        for (const path of paths) {
            if (path.className && path.className.baseVal && path.className.baseVal.includes('cell')) {
                const row = path.getAttribute('row');
                const col = path.getAttribute('col');
                return this.msg.tableData.dataList[row][col];
            }
        }
    }

    /* 双击进入单元格编辑功能
       @param {*} event */
    onDoubleClick(event) {
        event.preventDefault();
        this.selectCell(this.checkTarget(event));

        // 双击单元格进入文本编辑
        if (this.selectedCell) {
            this.selectedCell.object.enterEditing();
            this.enterEditing();
        }
    }

    /**
     * 单击选择单元格
     * @param {*} event
     */
    onClick(event) {
        const cell = this.checkTarget(event);
        if (!cell) {
            return;
        }
        const checkKey = event.ctrlKey || event.shiftKey;
        if (checkKey && (this.selectedCell || this.selectedCellList.length > 0)) {
            this.selectCellList(cell);
        } else {
            this.selectCell(cell);
        }
    }

    /**
     * 清除选择的单元格
     */
    clearSelect() {
        this.selectedCell = null;
        this.selectedCellList = [];
        this.exitSelect();
    }

    /**
     * 全选表格
     */
    selectAll() {
        this.clearSelect();
        this.msg.tableData.dataList.forEach(row => {
            row.forEach(cell => {
                this.selectedCellList.push(cell);
            });
        });
        this.enterSelect();
    }

    /**
     * 选择表格某一列
     * @param {*} index
     */
    selectCol(index) {
        this.clearSelect();
        this.msg.tableData.dataList.forEach(row => {
            row.forEach(cell => {
                if (cell.col === index) {
                    this.selectedCellList.push(cell);
                }
            });
        });
        this.enterSelect();
    }

    /**
     * 选择表格某一行
     * @param {*} index
     */
    selectRow(index) {
        this.clearSelect();
        this.msg.tableData.dataList.forEach(row => {
            row.forEach(cell => {
                if (cell.row === index) {
                    this.selectedCellList.push(cell);
                }
            });
        });
        this.enterSelect();
    }

    /**
     * 选择当前选中的单元格，并且添加相关的类以改变样式
     * @param {*} cell
     */
    selectCell(cell) {
        this.exitSelect();

        this.selectedCell = cell;
        this.selectedCellList = [];

        this.enterSelect();
    }

    /**
     * 选择
     * @param {*} cell
     */
    selectCellList(cell) {
        this.exitSelect();
        if (this.selectedCellList.length > 0) {
            // 有则删除无则添加
            if (this.selectedCellList.includes(cell)) {
                const index = this.selectedCellList.findIndex(item => item.col === cell.col && item.row === cell.row);
                if (index >= 0) {
                    this.selectedCellList.splice(index, 1);

                    if (this.selectedCellList.length === 1) {
                        this.selectedCell = this.selectedCellList[0];
                        this.selectedCellList = [];
                    }
                }
            } else {
                this.selectedCellList.push(cell);
                this.selectedCell = null;
            }
        } else {
            // 判断当前选择和点击是否同一个
            if (this.selectedCell !== cell) {
                this.selectedCellList.push(this.selectedCell);
            }
            this.selectedCellList.push(cell);
            this.selectedCell = null;
        }

        // 需要对数组进行排序
        if (this.selectedCellList.length > 1) {
            this.selectedCellList = this.selectedCellList.sort((a, b) => a.row - b.row);
            this.selectedCellList = this.selectedCellList.sort((a, b) => a.col - b.col);
        }

        this.enterSelect();
    }

    /**
     * 进入单元格选中状态
     */
    enterSelect() {
        const node = document.querySelector(`#${this.containerClass}`);

        if (this.selectedCell) {
            const cell = this.selectedCell;
            const className = `.cell_${cell.row}_${cell.col}`;
            const cellNode = node.querySelector(className);
            cellNode && this.addCellClass(cellNode, 'isSelected');
        } else if (this.selectedCellList.length > 0) {
            this.selectedCellList.forEach(cell => {
                const className = `.cell_${cell.row}_${cell.col}`;
                const cellNode = node.querySelector(className);
                cellNode && this.addCellClass(cellNode, 'isSelected');
            });
        }
    }

    /**
     * 取消单元格选中状态
     */
    exitSelect() {
        const node = document.querySelector(`#${this.containerClass}`);
        const cellNode = node.querySelectorAll('.isSelected');
        cellNode.forEach(item => {
            this.removeCellClass(item, 'isSelected');
        });
    }

    /**
     * 选择当前选中的单元格进入编辑，并且添加相关的类以改变样式
     */
    enterEditing() {
        this.isEditingText = true;
        this.exitSelect();
        this.selectedCellList = [];

        const cell = this.selectedCell;
        if (cell) {
            const node = document.querySelector(`#${this.containerClass}`);
            const className = `.cell_${cell.row}_${cell.col}`;
            const cellNode = node.querySelector(className);
            cellNode && this.addCellClass(cellNode, 'isEditing');
        }
    }

    /**
     * 退出单元格编辑
     */
    exitEditing() {
        this.isEditingText = false;
        const node = document.querySelector(`#${this.containerClass}`);
        const cellNode = node.querySelector('.isEditing');
        cellNode && this.removeCellClass(cellNode, 'isEditing');
    }

    /**
     * 初始化表格数据，如果传入的表格中只有行数和列数，
     * 根据行数和列数，初始化一个空白表格
     */
    initTableData() {
        if (this.msg.tableData.isNewBuilt) {
            // 新建表格

            const {
                row,
            } = this.msg.tableData;
            const {
                col,
            } = this.msg.tableData;

            if (!row) {
                Ktu.notice.error('所创建表格的行数为空');
                return;
            }

            if (!col) {
                Ktu.notice.error('所创建表格的列数为空');
                return;
            }

            // 获取行列的宽度
            this.msg.cellWidth = (this.msg.viewWidth / col);
            this.msg.cellHeight = (this.msg.viewHeight / row);

            const dataList = _.cloneDeep(this.msg.tableData.dataList);

            // 有数据的新建表格
            if (dataList.length > 0) {
                this.msg.tableData.dataList = [];

                dataList.forEach((row, i) => {
                    const rowList = [];
                    row.forEach((item, j) => {
                        const obj = this.initTextObj(null, this.msg.cellWidth, this.msg.cellHeight);
                        const text = item.replace(/[\r\n]/g, '');
                        const cell = {
                            text,
                            limitText: text,
                            row: i,
                            col: j,
                            width: this.msg.cellWidth,
                            height: this.msg.cellHeight,
                            borderTopColor: this.msg.borderColor,
                            borderBottomColor: this.msg.borderColor,
                            borderLeftColor: this.msg.borderColor,
                            borderRightColor: this.msg.borderColor,
                            bgColor: '',
                            object: obj,
                            hasChangedBgColor: false,
                            hasChangedBorderColor: false,
                        };

                        // 计算显示的文字
                        const fontFamily = obj.getFontFamily ? obj.getFontFamily() : '';
                        cell.object.text = this.initLimitText(cell, fontFamily, obj.fontSize);
                        rowList.push(cell);
                    });
                    this.msg.tableData.dataList.push(rowList);
                });
            } else {
                this.msg.tableData.dataList = [];

                for (let i = 0; i < row; i++) {
                    const row = [];
                    for (let j = 0; j < col; j++) {
                        const obj = this.initTextObj(null, this.msg.cellWidth, this.msg.cellHeight);

                        row.push({
                            text: '',
                            limitText: '',
                            row: i,
                            col: j,
                            width: this.msg.cellWidth,
                            height: this.msg.cellHeight,
                            borderTopColor: this.msg.borderColor,
                            borderBottomColor: this.msg.borderColor,
                            borderLeftColor: this.msg.borderColor,
                            borderRightColor: this.msg.borderColor,
                            bgColor: '',
                            object: obj,
                            hasChangedBgColor: false,
                            hasChangedBorderColor: false,
                        });
                    }

                    this.msg.tableData.dataList.push(row);
                }
            }

            // 初始化表格的样式
            this.initTableStyle(this.msg.type, this.msg.themeColor, true);
            this.msg.tableData.isNewBuilt = false;
        } else {
            // 初始化旧表格

            // 保持边框大小不变
            this.factStrokeWidth = this.strokeWidth / this.scaleX;

            const {
                row,
                col,
                dataList,
            } = this.msg.tableData;

            // 表格整体宽高改变时单元格的计算：
            if (this.width != this.msg.viewWidth || this.height != this.msg.viewHeight) {
                const {
                    viewWidth,
                    viewHeight,
                } = this.msg;

                this.msg.viewWidth = this.width;
                this.msg.viewHeight = this.height;
                this.msg.cellWidth = (this.msg.viewWidth / col);
                this.msg.cellHeight = (this.msg.viewHeight / row);

                // 单元格宽高计算：
                dataList.forEach(row => {
                    row.forEach(cell => {
                        cell.width = cell.width / viewWidth * this.width;
                        cell.height = cell.height / viewHeight * this.height;
                    });
                });

                this.clearSelect();
            }

            // 初始化文本对象
            dataList.forEach(row => {
                row.forEach(cell => {
                    cell.object = this.initTextObj(cell, this.msg.cellWidth, this.msg.cellHeight);
                });
            });
        }
    }

    /**
     * 初始化表格的文本
     * @param {*} cell
     * 没有cell参数则是新建文本
     */
    initTextObj(cell, width, height) {
        let object = {};
        if (cell) {
            cell.object.type = 'textbox';
            cell.object.width = cell.width - this.factStrokeWidth;
            cell.object.height = cell.height - this.factStrokeWidth;

            cell.object.top = (cell.height - cell.object.fontSize) / 2;
            cell.object.left = this.factStrokeWidth / 2;
            cell.object.hasChanged = true;
            cell.object.isInTable = true;
            cell.object.table = this;

            if (cell.object instanceof TheElement) {
                object = cell.object;
            } else {
                object = Ktu.element.processElement(cell.object);
            }
            // 计算显示的文字
            const fontFamily = object.getFontFamily ? object.getFontFamily() : '';
            cell.object.text = this.initLimitText(cell, fontFamily, object.fontSize);
        } else {
            // 让新建表格文本字号自适应
            const fontSize = Math.round(height / 3);
            const textObj = {
                type: 'textbox',
                text: '',
                fill: '#345',
                width: width - this.factStrokeWidth,
                height: height - this.factStrokeWidth,
                fontSize,
                ftFamilListChg: 1,
                ftFamilyList: [{
                    fontid: 58,
                    fonttype: 0,
                    tmp_fontface_path: 'default',
                }],
                fontWeight: 'normal',
                fontStyle: 'normal',
                textAlign: 'center',
                top: (height - this.factStrokeWidth - fontSize) / 2,
                left: this.factStrokeWidth / 2,
                scaleX: 1,
                scaleY: 1,
                isInTable: true,
                table: this,
            };

            object = Ktu.element.processElement(textObj);
        }

        return object;
    }

    /* 计算单元格中最多能显示多少文字
       目前只显示一行，编辑的时候可以显示多行，超出以省略号 */
    initLimitText(cell, fontFamily, fontSize) {
        let limitText = '';

        const textBounding = this.getTextBounding('快', fontFamily, fontSize);

        const isOverFlow = textBounding.height > (cell.height - this.factStrokeWidth) || textBounding.width > (cell.width - this.factStrokeWidth);

        if (isOverFlow) {
            limitText = '';
        } else {
            const that = this;
            let textWidth = 0;

            const rectWidth = cell.width - this.factStrokeWidth;
            for (let i = 0; i < cell.text.length; i++) {
                const fontChar = cell.text[i];

                textWidth += this.getTextBounding(fontChar, fontFamily, fontSize).width;

                if (textWidth >= rectWidth) {
                    computeOverText();
                    break;
                }

                limitText += fontChar;
            }

            function computeOverText() {
                limitText = '';
                textWidth = 0;
                const limitWidth = rectWidth - that.getTextBounding('...', fontFamily, fontSize).width;

                for (let i = 0; i < cell.text.length; i++) {
                    const fontChar = cell.text[i];

                    textWidth += that.getTextBounding(fontChar, fontFamily, fontSize).width;

                    if (textWidth >= limitWidth) {
                        limitText += '...';
                        break;
                    }

                    limitText += fontChar;
                }
            }
        }
        cell.limitText = limitText;
        return limitText;
    }

    /* 获取被渲染出来的SVG节点的范围大小
       比如获取表格中任意单元格的位置和大小 */
    getBoxBound(node) {
        const bound = node[0].getBoundingClientRect();
        return bound;
    }

    /* 根据表格字体和字号计算文本的长度 */
    getTextBounding(word, fontFamily, fontSize) {
        const textWH = {};

        let span = document.getElementById('getHeight');
        if (!span) {
            span = document.createElement('span');
            span.id = 'getHeight';
            document.body.appendChild(span);
            span.style.visibility = 'hidden';
            span.style.fontFamily = fontFamily;
            span.style.display = 'inline-block';
        }
        span.innerText = word;
        span.style.fontSize = `${fontSize}px`;
        textWH.width = span.offsetWidth;
        textWH.height = span.offsetHeight;
        if (fontSize < 12) {
            textWH.width *= (fontSize / 12);
            textWH.height *= (fontSize / 12);
        }
        return textWH;
    }

    /* 获取一个空白的单元格，主要用于添加行列等 */
    getBlankCellData(width, height) {
        const obj = this.initTextObj(null, width, height);
        return {
            text: '',
            width,
            height,
            borderTopColor: this.msg.borderColor,
            borderBottomColor: this.msg.borderColor,
            borderLeftColor: this.msg.borderColor,
            borderRightColor: this.msg.borderColor,
            bgColor: '',
            object: obj,
            limitText: '',
            hasChangedBgColor: false,
            hasChangedBorderColor: false,
        };
    }

    /* 添加单元格的isSelected class
       svg 中的节点无法直接通过AddClass，removeClass来修改节点的class只能通过attribute修改 */
    addCellClass(node, className) {
        const name = node.getAttribute('class');
        if (name.indexOf(className) < 0) {
            node.setAttribute('class', `${className} ${name}`);
        }
    }

    /* 清除单元格的isSelected class */
    removeCellClass(node, className) {
        let name = node.getAttribute('class').replace(className, '');
        name = name.trim();
        node.setAttribute('class', name);
    }

    /**
     * 新添加元素后，重新排列计算单元格的row和col值
     */
    refreshTableIndex() {
        this.msg.tableData.dataList.forEach((row, i) => {
            row.forEach((cell, j) => {
                cell.row = i;
                cell.col = j;
            });
        });
    }

    /**
     * 获取渐变色
     * @param {*} color
     * @param {*} type
     */
    getColor(color, index) {
        if (color === 'transparent') {
            return 'transparent';
        }
        const hsl = this.RGBToHSL(this.HexToRGB(color));

        //  通过hsl获取渐变色
        if (index === -1) {
            const l = hsl.l + 0.15;
            hsl.l = Math.min(1, l);
            const rgb = this.HSLToRGB(hsl);
            return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`;
        }
        // 通过hue来获取相关的渐变色
        let r;
        let g;
        let b;
        const colorStep = 30;
        const h = (hsl.h * 360 + index * colorStep) / 360;
        const {
            s,
            l,
            a,
        } = hsl;

        if (s == 0) {
            // achromatic
            r = l;
            g = l;
            b = l;
        } else {
            const hue2rgb = function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
    }

    HSLToRGB(hsl) {
        const {
            h,
            s,
            l,
        } = hsl;
        let r;
        let g;
        let b;
        if (s == 0) {
            // achromatic
            b = l;
            g = b;
            r = g;
        } else {
            const hue2rgb = function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255),
            a: hsl.a,
        };
    }
    RGBToHSL(rgb) {
        let {
            r,
            g,
            b,
            a,
        } = rgb;
        r /= 255, g /= 255, b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h;
        let s;
        const l = (max + min) / 2;
        if (max == min) {
            // achromatic
            s = 0;
            h = s;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        return {
            h,
            s,
            l,
            a,
        };
    }
    HexToRGB(hex) {
        if (hex.includes('rgb')) {
            const rgba = hex.match(/^rgba?[\s+]?\([\s+]?(\d+\.?\d*)[\s+]?,[\s+]?(\d+\.?\d*)[\s+]?,[\s+]?(\d+\.?\d*)[\s+]?,?[\s+]?(\d+\.?\d*)/i);
            return {
                r: rgba[1],
                g: rgba[2],
                b: rgba[3],
                a: rgba[4] || 1,
            };
        }
        hex.indexOf('#') > -1 && (hex = hex.slice(1));
        hex = parseInt((hex.length == 6 ? hex : hex.split('').map(value => value + value)
            .join('')), 16);
        return {
            r: hex >> 16,
            g: (hex & 0x00FF00) >> 8,
            b: (hex & 0x0000FF),
            a: 1,
        };
    }

    /**
     * 生成单元格的内容
     * @param {*} cell
     */
    createCell(cell) {
        const {
            col,
            row,
        } = cell;

        const maxCol = this.msg.tableData.col;
        const maxRow = this.msg.tableData.row;

        const correctUnit = 0;

        const {
            height,
        } = cell;
        const {
            width,
        } = cell;

        const {
            borderTopColor,
            borderBottomColor,
            borderLeftColor,
            borderRightColor,
        } = cell;

        const opacityTop = 1;
        let opacityBottom = 1;
        const opacityLeft = 1;
        let opacityRight = 1;

        /* 每个单元格需要判断边框是否出现
           下边框 */
        if (row < (maxRow - 1)) {
            opacityBottom = 0;
        }
        // 右边框
        if (col < (maxCol - 1)) {
            opacityRight = 0;
        }
        // 上边框
        if (row >= 1) {
            // opacityTop = 1;
        }
        // 左边框
        if (col >= 1) {
            // opacityLeft = 1;
        }

        const borderTopStyle = Ktu.element.getRgb('stroke', borderTopColor).str;
        const borderBottomStyle = Ktu.element.getRgb('stroke', borderBottomColor).str;
        const borderLeftStyle = Ktu.element.getRgb('stroke', borderLeftColor).str;
        const borderRightStyle = Ktu.element.getRgb('stroke', borderRightColor).str;

        const fillStyle = Ktu.element.getRgb('fill', cell.bgColor).str;

        const rectWidth = width - this.factStrokeWidth > 0 ? width - this.factStrokeWidth : 0;
        const rectHeight = height - this.factStrokeWidth > 0 ? height - this.factStrokeWidth : 0;

        const rectSvg = `<rect x="${this.factStrokeWidth / 2}" y="${this.factStrokeWidth / 2}" width="${rectWidth}" height="${rectHeight}" style="${fillStyle}"></rect>`;

        // 通过四角线段对四个角落进行填补
        let lineTopSvg = '';
        if (row === 0) {
            if (col === 0) {
                lineTopSvg = opacityTop ? `<line x1="${correctUnit - this.factStrokeWidth / 2}" y1="${correctUnit}" x2="${width}" y2="${correctUnit}" opacity="${opacityTop}" style="${this.strokeLine} ${borderTopStyle}"/>` : '';
            } else if (col === this.msg.tableData.col - 1) {
                lineTopSvg = opacityTop ? `<line x1="${correctUnit}" y1="${correctUnit}" x2="${width + this.factStrokeWidth / 2}" y2="${correctUnit}" opacity="${opacityTop}" style="${this.strokeLine} ${borderTopStyle}"/>` : '';
            } else {
                lineTopSvg = opacityTop ? `<line x1="${correctUnit}" y1="${correctUnit}" x2="${width}" y2="${correctUnit}" opacity="${opacityTop}" style="${this.strokeLine} ${borderTopStyle}"/>` : '';
            }
        } else {
            lineTopSvg = opacityTop ? `<line x1="${correctUnit}" y1="${correctUnit}" x2="${width}" y2="${correctUnit}" opacity="${opacityTop}" style="${this.strokeLine} ${borderTopStyle}"/>` : '';
        }

        let lineBottomSvg = '';
        if (row === this.msg.tableData.row - 1) {
            if (col === 0) {
                lineBottomSvg = opacityBottom ? `<line x1="${correctUnit - this.factStrokeWidth / 2}" y1="${height}" x2="${width}" y2="${height}" opacity="${opacityBottom}" style="${this.strokeLine} ${borderBottomStyle}"/>` : '';
            } else if (col === this.msg.tableData.col - 1) {
                lineBottomSvg = opacityBottom ? `<line x1="${correctUnit}" y1="${height}" x2="${width + this.factStrokeWidth / 2}" y2="${height}" opacity="${opacityBottom}" style="${this.strokeLine} ${borderBottomStyle}"/>` : '';
            } else {
                lineBottomSvg = opacityBottom ? `<line x1="${correctUnit}" y1="${height}" x2="${width}" y2="${height}" opacity="${opacityBottom}" style="${this.strokeLine} ${borderBottomStyle}"/>` : '';
            }
        } else {
            lineBottomSvg = opacityBottom ? `<line x1="${correctUnit}" y1="${height}" x2="${width}" y2="${height}" opacity="${opacityBottom}" style="${this.strokeLine} ${borderBottomStyle}"/>` : '';
        }

        const lineLeftSvg = opacityLeft ? `<line x1="${correctUnit}" y1="${correctUnit}" x2="${correctUnit}" y2="${height}" opacity="${opacityLeft}" style="${this.strokeLine} ${borderLeftStyle}"/>` : '';
        const lineRightSvg = opacityRight ? `<line x1="${width}" y1="${correctUnit}" x2="${width}" y2="${height}" opacity="${opacityRight}" style="${this.strokeLine} ${borderRightStyle}"/>` : '';

        const cellPath = `${rectSvg} ${lineTopSvg} ${lineBottomSvg} ${lineLeftSvg} ${lineRightSvg}`;

        return cellPath;
    }

    getSvgStrokeStyle() {
        return `stroke-width: ${this.factStrokeWidth}; stroke-dasharray: ${this.strokeDashArray}; stroke-linecap: ${this.strokeLineCap}; stroke-linejoin: ${this.strokeLineJoin}; stroke-miterlimit: ${this.strokeMiterLimit};`;
    }

    /**
     * 生成表格textbox的内容，单元格大小和位置根据单元格属性中的width，height计算
     * @param {*} cell
     */
    createText(cell, isScreenShot) {
        const textSvg = cell.object.toSvg(true, isScreenShot, false);
        return textSvg;
    }

    /**
     * 获取表格中所有的文字，以便请求字体（加上'.'）
     */
    getSubString() {
        let subString = '.';

        this.msg.tableData.dataList.forEach(row => {
            row.forEach(cell => {
                subString += cell.text;
            });
        });

        return subString;
    }

    /* 生成表格SVG的内容
       遍历tableData.dataList当单元格不是isHide显示出来
       单元格大小和位置根据单元格属性中的width，height计算 */
    createEle(isScreenShot) {
        let tabLeg = '';
        const {
            dataList,
        } = this.msg.tableData;

        dataList.forEach((row, i) => {
            const rowX = 0;
            let rowY = 0;

            for (let x = 0; x < i; x++) {
                rowY += dataList[x][0].height;
            }

            tabLeg += `<g class="row" transform="translate(${rowX} , ${rowY})">`;

            row.forEach((cell, j) => {
                // const cellX = j * this.msg.cellWidth;
                let cellX = 0;
                const cellY = 0;

                for (let y = 0; y < j; y++) {
                    cellX += dataList[0][y].width;
                }

                let className = `cell_${cell.row}_${cell.col}`;
                if (this.selectedCell && this.selectedCell.row === cell.row && this.selectedCell.col === cell.col || this.selectedCellList.length > 0 && this.selectedCellList.includes(cell)) {
                    className += ' isSelected';
                }

                const textSvg = this.createText(cell, isScreenShot);
                const cellPath = this.createCell(cell);

                tabLeg += `<g class="cell ${className}" transform="translate(${cellX} , ${cellY})" row="${cell.row}" col="${cell.col}"
                            width="${cell.width}" height="${cell.height}" style="overflow: hidden">
                                ${cellPath}
                                ${textSvg}
                            </g>`;
            });
            tabLeg += `</g>`;
        });

        return tabLeg;
    }

    /**
     * 生成svgData
     * @param {*} isAllInfo
     */
    toSvg(isAllInfo, isScreenShot) {
        // 设置svg不可时
        if (!this.visible) {
            return '';
        }

        this.initTableData();

        this.strokeLine = this.getSvgStrokeStyle();

        const ele = this.createEle(isScreenShot);
        const defs = '';
        let svg = '';
        const shadowStr = this.getShadow() || '';
        const _shadowId = `shadow_${this.objectId}`;
        const flipStr = this.getFlip();

        let {
            viewWidth,
            viewHeight,
        } = this.msg;

        viewWidth += this.factStrokeWidth;
        viewHeight += this.factStrokeWidth;

        const gStyle = isAllInfo ? `transform="translate(${this.left + this.factStrokeWidth / 2 * this.scaleX}, ${this.top + this.factStrokeWidth / 2 * this.scaleY}) rotate(${this.angle}) scale(${this.scaleX} ${this.scaleY}) ${flipStr}" opacity="${this.opacity}"` : `transform="translate(${this.factStrokeWidth / 2}, ${this.factStrokeWidth / 2}) ${flipStr}"`;

        // 添加背景
        const isTransparent = this.msg.tableData.dataList.some(row => row.some(cell => cell.bgColor === 'transparent'));
        const isDashLine = this.strokeDashArray.every(item => item === 0);
        const rectBgColor = isTransparent ? 'transparent' : isDashLine ? this.msg.borderColor : '#fff';
        const rectFill = Ktu.element.getRgb('fill', rectBgColor).str;
        const rectBg = this.strokeWidth ? `<rect x="0" y="0" width="${viewWidth}" height="${viewHeight}" style="${rectFill}" transform="translate(${-this.factStrokeWidth / 2}, ${-this.factStrokeWidth / 2})"></rect>` : '';

        const g = `${shadowStr}
        <g ${gStyle}>
            <g ${this.isOpenShadow ? `style="filter:url(#${_shadowId})"` : ''}>
                ${rectBg}
                ${ele}
                ${defs}
            </g>
        </g>`;

        if (isAllInfo) {
            svg = g;
        } else {
            svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" xml:space="preserve" width="${viewWidth * this.scaleX}" height="${viewHeight * this.scaleY}" viewBox="0 0 ${viewWidth} ${viewHeight}"
                    preserveAspectRatio="none" style="overflow: visible" id="${this.containerClass}">
                        ${g}
                    </svg>`;
        }
        return svg;
    }

    /**
     * 对象化
     */
    toObject() {
        const elementObj = TheElement.toObject(this);
        // 需要对单元格的text对象进行对象化
        const _this = _.cloneDeep(this);
        const data = _this.msg.tableData.dataList;
        data.forEach(row => {
            row.forEach(cell => {
                if (cell.object.toSvg) {
                    cell.object.table = null;
                    cell.object = cell.object.toObject();
                }
            });
        });

        return _.assignIn(elementObj, {
            msg: JSON.stringify(_this.msg),
            fill: this.fill,
        });
    }

    getDimensions() {
        return {
            w: this.width + this.strokeWidth / this.scaleX,
            h: this.height + this.strokeWidth / this.scaleY,
        };
    }

    /**
     * 获取表格中所被选中单元格的文字(注意加上‘.’)
     */
    getTableText() {
        let text = '.';
        if (this.selectedCell) {
            text += this.selectedCell.text;
        } else if (this.selectCellList && this.selectedCellList.length > 0) {
            this.selectedCellList.forEach(cell => {
                text += cell.text;
            });
        } else {
            this.msg.tableData.dataList.forEach(row => {
                row.forEach(cell => {
                    text += cell.text;
                });
            });
        }
        return text;
    }

    /**
     * 设置表格背景颜色
     * @param {*} color
     */
    setBgColor(color) {
        this.setCell('bgColor', color);
        this.setCell('hasChangedBgColor', true);
    }

    /**
     * 设置表格文本颜色
     * @param {*} color
     */
    setFontColor(color) {
        this.setText('fill', color);
    }

    /**
     * 设置单元格的边框颜色
     * @param {*} color
     */
    setBorderColor(color, isReset) {
        if (this.selectedCell && !isReset) {
            this.setCell('hasChangedBorderColor', true);
            this.setBorder(this.selectedCell, color);
        } else if (this.selectedCellList.length > 0 && !isReset) {
            this.setCell('hasChangedBorderColor', true);
            this.selectedCellList.forEach(cell => {
                this.setBorder(cell, color);
            });
        } else {
            // 当修改全部边框时，主题边框也改变
            this.msg.borderColor = color;
            this.setCell('hasChangedBorderColor', false);
            this.msg.tableData.dataList.forEach(row => {
                row.forEach(cell => {
                    this.setBorder(cell, color);
                });
            });
        }
    }

    /**
     * 修改单元格的边框
     * @param {*} cell
     * @param {*} color
     */
    setBorder(cell, color) {
        const {
            col,
            row,
        } = cell;
        const {
            tableData,
        } = this.msg;
        const maxCol = tableData.col;
        const maxRow = tableData.row;

        cell.borderTopColor = color;
        cell.borderBottomColor = color;
        cell.borderLeftColor = color;
        cell.borderRightColor = color;

        if (col < maxCol - 1) {
            const nextVCell = tableData.dataList[row][col + 1];
            nextVCell.borderLeftColor = color;
        }

        if (row < maxRow - 1) {
            const nextHCell = tableData.dataList[row + 1][col];
            nextHCell.borderTopColor = color;
        }
    }

    /**
     * 设置字体加粗
     */
    setBold() {
        const {
            object,
        } = this.selectedCell ? this.selectedCell : this.selectedCellList.length > 0 ? this.selectedCellList[0] : this.msg.tableData.dataList[0][0];

        const fontWeight = object.fontWeight === 'bold' ? 'normal' : 'bold';
        this.setText('fontWeight', fontWeight);
    }

    /**
     * 设置字体斜体
     */
    setItalic() {
        const {
            object,
        } = this.selectedCell ? this.selectedCell : this.selectedCellList.length > 0 ? this.selectedCellList[0] : this.msg.tableData.dataList[0][0];

        const fontStyle = object.fontStyle === 'italic' ? 'normal' : 'italic';
        this.setText('fontStyle', fontStyle);
    }

    /**
     * 设置单元格文本某些通用属性
     * @param {*} prop
     * @param {*} value
     */
    setText(prop, value) {
        if (this.selectedCell) {
            this.selectedCell.object[prop] = value;
        } else if (this.selectedCellList.length > 0) {
            this.selectedCellList.forEach(cell => {
                cell.object[prop] = value;
            });
        } else {
            this.msg.tableData.dataList.forEach(row => {
                row.forEach(cell => {
                    cell.object[prop] = value;
                });
            });
        }
    }

    /**
     * 设置表格单元格通用属性
     * @param {*} prop
     * @param {*} value
     */
    setCell(prop, value) {
        if (this.selectedCell) {
            this.selectedCell[prop] = value;
        } else if (this.selectedCellList.length > 0) {
            this.selectedCellList.forEach(cell => {
                cell[prop] = value;
            });
        } else {
            this.msg.tableData.dataList.forEach(row => {
                row.forEach(cell => {
                    cell[prop] = value;
                });
            });

            if (prop === 'bgColor') {
                this.msg.themeColor = value;
            }
        }
    }

    /**
     * 设置表格msg的属性
     * @param {*} prop
     * @param {*} value
     */
    setMsg(prop, value) {
        this.msg[prop] = value;
    }

    /* 添加行 */
    addRow(rowIndex) {
        if (this.msg.tableData.row >= 20) {
            Ktu.notice.error('请勿创建多于20行的表格');
            return;
        }

        rowIndex = rowIndex !== null ? rowIndex : this.msg.tableData.row;

        this.msg.tableData.row++;
        const {
            col,
        } = this.msg.tableData;

        // 获取最大列数
        const maxRow = this.msg.tableData.row;

        const rowList = [];
        const {
            dataList,
        } = this.msg.tableData;

        for (let i = 0; i < col; i++) {
            const {
                width,
            } = dataList[0][i];
            const height = this.msg.cellHeight;

            const blankCell = this.getBlankCellData(width, height);
            rowList.push(blankCell);
        }

        dataList.splice(rowIndex, 0, rowList);

        this.height += this.msg.cellHeight;
        this.msg.viewHeight = this.height;

        this.clearSelect();
        this.refreshTableIndex();

        if (rowIndex < maxRow - 1) {
            for (let i = 0; i < col; i++) {
                if (0 < rowIndex && dataList[rowIndex - 1][i].hasChangedBorderColor) {
                    dataList[rowIndex][i].borderTopColor = dataList[rowIndex - 1][i].borderBottomColor;
                }
                dataList[rowIndex + 1][i].borderTopColor = dataList[rowIndex + 1][i].borderBottomColor;
            }
        } else {
            for (let i = 0; i < col; i++) {
                if (dataList[rowIndex - 1][i].hasChangedBorderColor) {
                    dataList[rowIndex][i].borderTopColor = dataList[rowIndex - 1][i].borderBottomColor;
                }
            }
        }

        this.initTableStyle(this.msg.type, this.msg.themeColor, false);

        this.modifiedState();
        this.dirty = true;
        if (!!this.group) {
            this.group.updateSizePosition();
        }
    }

    /* 删除行 */
    delRow(rowIndex) {
        const count = rowIndex.length || 1;
        let index = rowIndex;
        let height = 0;

        const {
            dataList,
        } = this.msg.tableData;

        if (this.msg.tableData.row === 1) {
            Ktu.notice.error('最后一行数据不能删除');
            return;
        }

        if (Array.isArray(rowIndex)) {
            index = rowIndex[0];
        }

        rowIndex.forEach(item => {
            height += dataList[item][0].height;
        });

        dataList.splice(index, count);

        this.height -= height;
        this.msg.viewHeight = this.height;

        this.msg.tableData.row -= count;

        this.clearSelect();
        this.refreshTableIndex();
        this.initTableStyle(this.msg.type, this.msg.themeColor, false);

        this.modifiedState();
        this.dirty = true;
        if (!!this.group) {
            this.group.updateSizePosition();
        }
    }

    /* 添加列 */
    addCol(colIndex) {
        if (this.msg.tableData.col >= 20) {
            Ktu.notice.error('请勿创建多于20列的表格');
            return;
        }

        colIndex = colIndex !== null ? colIndex : this.msg.tableData.col;

        this.msg.tableData.col++;

        // 获取最大列数
        const maxCol = this.msg.tableData.col;

        const {
            dataList,
        } = this.msg.tableData;

        dataList.forEach((row, i) => {
            const width = this.msg.cellWidth;
            const {
                height,
            } = dataList[i][0];
            const blankCell = this.getBlankCellData(width, height);
            row.splice(colIndex, 0, blankCell);
        });

        this.width += this.msg.cellWidth;
        this.msg.viewWidth = this.width;

        this.clearSelect();
        this.refreshTableIndex();

        dataList.forEach(row => {
            // 更改相应单元格border颜色
            if (colIndex < maxCol - 1) {
                if (0 < colIndex && row[colIndex - 1].hasChangedBorderColor) {
                    row[colIndex].borderLeftColor = row[colIndex - 1].borderRightColor;
                }
                row[colIndex + 1].borderLeftColor = row[colIndex + 1].borderRightColor;
            } else {
                if (row[colIndex - 1].hasChangedBorderColor) {
                    row[colIndex].borderLeftColor = row[colIndex - 1].borderRightColor;
                }
            }
        });
        this.initTableStyle(this.msg.type, this.msg.themeColor, false);

        this.modifiedState();
        this.dirty = true;
        if (!!this.group) {
            this.group.updateSizePosition();
        }
    }

    /* 删除列 */
    delCol(colIndex) {
        const count = colIndex.length || 1;
        let index = colIndex;
        let width = 0;

        if (this.msg.tableData.col === 1 || colIndex.length === this.msg.tableData.col) {
            Ktu.notice.error('最后一列数据不能删除');
            return;
        }

        if (Array.isArray(colIndex)) {
            index = colIndex[0];
        }

        const {
            dataList,
        } = this.msg.tableData;

        colIndex.forEach(item => {
            width += dataList[0][item].width;
        });

        dataList.forEach(row => {
            row.splice(index, count);
        });

        this.width -= width;
        this.msg.viewWidth = this.width;
        this.msg.tableData.col -= count;

        this.clearSelect();
        this.refreshTableIndex();
        this.initTableStyle(this.msg.type, this.msg.themeColor, false);

        this.modifiedState();
        this.dirty = true;
        this.setCoords();
        if (!!this.group) {
            this.group.updateSizePosition();
        }
    }

    /**
     * 设置表格模板样式
     * @param {*} type
     * @param {*} color
     * @param {*} isReset
     */
    initTableStyle(type, color, isReset) {
        const table = this.msg.tableData.dataList;

        switch (type) {
            case 0: {
                table.forEach(row => {
                    row.forEach(cell => {
                        if (isReset) {
                            cell.bgColor = color;
                        } else {
                            if (!cell.hasChangedBgColor) {
                                cell.bgColor = color;
                            }
                        }
                    });
                });
                break;
            }
            case 1: {
                const rgba = this.getColor(color, -1);
                table.forEach((row, rowIndex) => {
                    row.forEach(cell => {
                        if (isReset) {
                            if (rowIndex === 0) {
                                cell.bgColor = color;
                            } else {
                                cell.bgColor = rgba;
                            }
                        } else {
                            if (!cell.hasChangedBgColor) {
                                if (rowIndex === 0) {
                                    cell.bgColor = color;
                                } else {
                                    cell.bgColor = rgba;
                                }
                            }
                        }
                    });
                });
                break;
            }
            case 2: {
                const rgba = this.getColor(color, -1);
                table.forEach((row, rowIndex) => {
                    row.forEach((cell, index) => {
                        if (isReset) {
                            if (index === 0) {
                                cell.bgColor = color;
                            } else {
                                cell.bgColor = rgba;
                            }
                        } else {
                            if (!cell.hasChangedBgColor) {
                                if (index === 0) {
                                    cell.bgColor = color;
                                } else {
                                    cell.bgColor = rgba;
                                }
                            }
                        }
                    });
                });
                break;
            }
            case 3: {
                const rgba = this.getColor(color, -1);
                table.forEach((row, rowIndex) => {
                    row.forEach((cell, index) => {
                        if (isReset) {
                            if (index === 0 || rowIndex === 0) {
                                cell.bgColor = color;
                            } else {
                                cell.bgColor = rgba;
                            }
                        } else {
                            if (!cell.hasChangedBgColor) {
                                if (index === 0 || rowIndex === 0) {
                                    cell.bgColor = color;
                                } else {
                                    cell.bgColor = rgba;
                                }
                            }
                        }
                    });
                });
                break;
            }
            case 4: {
                const rgba = this.getColor(color, -1);
                table.forEach((row, rowIndex) => {
                    row.forEach((cell, index) => {
                        if (isReset) {
                            if (rowIndex % 2 === 0) {
                                cell.bgColor = color;
                            } else {
                                cell.bgColor = rgba;
                            }
                        } else {
                            if (!cell.hasChangedBgColor) {
                                if (rowIndex % 2 === 0) {
                                    cell.bgColor = color;
                                } else {
                                    cell.bgColor = rgba;
                                }
                            }
                        }
                    });
                });
                break;
            }
            case 5: {
                const rgba = this.getColor(color, -1);
                table.forEach((row, rowIndex) => {
                    row.forEach((cell, index) => {
                        if (isReset) {
                            if (index % 2 === 0) {
                                cell.bgColor = color;
                            } else {
                                cell.bgColor = rgba;
                            }
                        } else {
                            if (!cell.hasChangedBgColor) {
                                if (index % 2 === 0) {
                                    cell.bgColor = color;
                                } else {
                                    cell.bgColor = rgba;
                                }
                            }
                        }
                    });
                });
                break;
            }
            case 6: {
                table.forEach((row, rowIndex) => {
                    let rgba = '';
                    if (rowIndex % 2 === 0) {
                        rgba = this.getColor(color, rowIndex / 2);
                    } else {
                        rgba = this.getColor(this.getColor(color, (rowIndex - 1) / 2), -1);
                    }
                    row.forEach((cell, index) => {
                        if (isReset) {
                            cell.bgColor = rgba;
                        } else {
                            if (!cell.hasChangedBgColor) {
                                cell.bgColor = rgba;
                            }
                        }
                    });
                });
                break;
            }
            case 7: {
                table.forEach((row, rowIndex) => {
                    row.forEach((cell, index) => {
                        if (isReset) {
                            if (rowIndex === 0) {
                                cell.bgColor = this.getColor(color, index);
                            } else {
                                cell.bgColor = this.getColor(this.getColor(color, index), -1);
                            }
                        } else {
                            if (!cell.hasChangedBgColor) {
                                if (rowIndex === 0) {
                                    cell.bgColor = this.getColor(color, index);
                                } else {
                                    cell.bgColor = this.getColor(this.getColor(color, index), -1);
                                }
                            }
                        }
                    });
                });
                break;
            }
            case 8: {
                table.forEach((row, rowIndex) => {
                    const rgba = this.getColor(color, rowIndex);
                    row.forEach((cell, index) => {
                        if (isReset) {
                            if (index === 0) {
                                cell.bgColor = rgba;
                            } else {
                                cell.bgColor = this.getColor(rgba, -1);
                            }
                        } else {
                            if (!cell.hasChangedBgColor) {
                                if (index === 0) {
                                    cell.bgColor = rgba;
                                } else {
                                    cell.bgColor = this.getColor(rgba, -1);
                                }
                            }
                        }
                    });
                });
                break;
            }
        }

        if (isReset) {
            this.setBorderColor(this.msg.borderColor, true);
        }
    }

    /**
     * 表格单元格拉伸
     * @param {*} type
     * @param {*} index
     * @param {*} offset
     */
    resize(object, offsetX, offsetY) {
        const radian = this.angle * Math.PI / 180;
        const angleCos = Math.cos(radian);
        const angleSin = Math.sin(radian);

        const {
            type,
            index,
        } = object;
        const {
            row,
            col,
            dataList,
        } = this.msg.tableData;
        if (type === 'row') {
            if (index === 0) {
                if (dataList[index][0].height - offsetY < 10) {
                    return;
                }

                dataList[index].forEach(cell => {
                    cell.height -= offsetY;
                });

                this.left -= offsetY * angleSin * this.scaleX;
                this.top += offsetY * angleCos * this.scaleY;
                this.height -= offsetY;
                this.msg.viewHeight = this.height;
            } else if (index === row) {
                if (dataList[index - 1][0].height + offsetY < 10) {
                    return;
                }

                dataList[index - 1].forEach(cell => {
                    cell.height += offsetY;
                });
                this.height += offsetY;
                this.msg.viewHeight = this.height;
            } else {
                if (dataList[index - 1][0].height + offsetY < 10 || dataList[index][0].height - offsetY < 10) {
                    return;
                }

                dataList[index - 1].forEach(cell => {
                    cell.height += offsetY;
                });
                dataList[index].forEach(cell => {
                    cell.height -= offsetY;
                });
            }
        } else {
            if (index === 0) {
                if (dataList[0][index].width - offsetX < 10) {
                    return;
                }

                dataList.forEach(row => {
                    row[index].width -= offsetX;
                });

                this.left += offsetX * angleCos * this.scaleX;
                this.top += offsetX * angleSin * this.scaleY;
                this.width -= offsetX;
                this.msg.viewWidth = this.width;
            } else if (index === col) {
                if (dataList[0][index - 1].width + offsetX < 10) {
                    return;
                }

                dataList.forEach(row => {
                    row[index - 1].width += offsetX;
                });

                this.width += offsetX;
                this.msg.viewWidth = this.width;
            } else {
                if (dataList[0][index - 1].width + offsetX < 10 || dataList[0][index].width - offsetX < 10) {
                    return;
                }

                dataList.forEach(row => {
                    row[index - 1].width += offsetX;
                });

                dataList.forEach(row => {
                    row[index].width -= offsetX;
                });
            }
        }
    }
};