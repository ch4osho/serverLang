class Chart extends TheElement {
    constructor(obj) {
        super(obj);
        this.type = obj.type;

        this.msg = typeof obj.msg == 'string' ? JSON.parse(obj.msg) : obj.msg;
        // 颜色偏移值
        this.msg.colorStep = 20;

        // 颜色透明度
        this.msg.alpha = 1;

        //  字体大小
        this.msg.fontSize = 12;

        //  刻度线颜色
        this.msg.axisColor = '#f2f2f2';
        //  XY轴线的颜色
        this.msg.baseAxisColor = '#ccc';

        this.hoverTip = '双击更改图表信息';

        // 图例配置参数
        this.legendOptions = {
            // 整个图例的x偏移量
            x: 10,
            // 整个图例的y偏移量
            y: 20,
            // 整个图例的宽度
            w: this.msg.viewWidth - 20,
            // 整个图例的高度
            h: 0,
            // 图例字体大小
            fontSize: 12,
            // 图例字体颜色
            fontColor: '#999',
            // 单项中是否有图标
            hasIcon: true,
            // 单项中图标半径
            iconRadius: 5,
            // 单项中字体和图标的x偏移
            textMarginX: 4,
            // 单项中字体和图标的y偏移
            textMarginY: 4,
            // 单项的x偏移
            marginX: 16,
            // 单项的y偏移
            marginY: 3,
            // 单项的最大值
            maxValue: this.msg.viewWidth - 20,
            // 用于存放图例单项的坐标参数
            lines: [],
        };
        /* this.scaleProp = 'wh';
           控制点 */
        this.controls = {
            tl: true,
            tr: true,
            br: true,
            bl: true,
            rotate: true,
        };
    }

    // 双击进入图表数据编辑
    onDoubleClick() {
        if (Ktu.store.state.base.isEditChartData) {
            Ktu.store.commit('base/changeState', {
                prop: 'isEditChartData',
                value: false,
            });
        } else {
            Ktu.store.commit('base/changeState', {
                prop: 'isEditChartData',
                value: true,
            });
        }
    }

    /**
     * 用于获取文字显示区域的宽高
     * @param {*} text 要计算的文本
     */
    getTextBounding(text, labelOps) {
        labelOps = labelOps || this.legendOptions;

        if (!this.tmpTextNode) {
            const node = `<span class="tmp-getTextRect" style="font-family:${labelOps.fontFamily};font-size: 12px">${text}</span>`;
            $('body').append(node);
            this.tmpTextNode = $('.tmp-getTextRect');
        }

        this.hasTmpTextNode = true;

        this.tmpTextNode.text(text);

        const bound = this.tmpTextNode.eq(0)[0].getBoundingClientRect();
        return bound;
    }

    /**
     * 当文本超过最大长度时获取省略后的文本
     * @param {*} text 原文本
     * @param {*} maxSize 最大长度
     */
    getLimitText(text, maxSize) {
        let textWidth = 0;
        let limitText = '';

        for (let i = 0; i < text.length; i++) {
            const fontChar = text[i];

            textWidth += this.getTextBounding(fontChar).width;

            if (textWidth > maxSize) {
                limitText = `${limitText.slice(0, -1)}...`;
                break;
            }

            limitText += fontChar;
        }

        return limitText;
    }

    /**
     * 获取文本的尺寸和计算文本内容
     * @param {*} text
     * @param {*} maxSize
     */
    getLabelText(text, maxSize) {
        let ops = this.getTextBounding(text);

        if (ops.width > maxSize) {
            text = this.getLimitText(text, maxSize);
            ops = this.getTextBounding(text);
        }

        ops.text = text;

        return ops;
    }

    /**
     * 计算图例的大小
     * 单个图例宽度为 item.x = 文本宽度 + 单个图例x偏移量 + [图标半径 + 文本与图标偏移量]
     * 单个图例高度为 item.h = 文本高度 + 单个图例y偏移量
     * 单个图例偏移量 item.x 如果是每一行的第一个为0，否则为前一个item.x
     * 单个图例偏移量 item.y 第一行为0,否则为前面行数的高度之和
     *
     * maxValue 单个图例的最大值，超过则省略显示
     * @param {*} text 图例单个中的文本内容
     */
    calcLabelBounding(text = ' ', labelOps) {
        labelOps = labelOps || this.legendOptions;

        const item = {};

        const {
            hasIcon,
        } = labelOps;
        const {
            maxValue,
        } = labelOps;

        const maxTextSize = hasIcon ? (maxValue - labelOps.iconRadius - labelOps.textMarginX) : maxValue;
        const textOps = this.getLabelText(text, maxTextSize);

        item.text = textOps.text;
        item.w = textOps.width + labelOps.marginX;
        item.h = textOps.height + labelOps.marginY;

        if (hasIcon) {
            item.w += labelOps.iconRadius + labelOps.textMarginX;
        }

        const count = labelOps.lines.length;

        if (count === 0) {
            item.x = 0;
            item.y = 0;
            item.sumW = item.w;
            item.sumH = item.h;
        } else {
            item.x = labelOps.lines[count - 1].sumW;
            item.y = labelOps.lines[count - 1].y;
            item.sumW = item.w + item.x;
            // 避免字符串为空时计算错误
            item.sumH = labelOps.lines[count - 1].sumH < 19 ? 19 : labelOps.lines[count - 1].sumH;

            if (item.sumW > labelOps.w) {
                item.x = 0;
                item.y += item.h;
                item.sumW = item.w;
                item.sumH += item.h;
            }
        }
        labelOps.lines.push(item);
    }

    // 创建图例
    createLegend(data) {
        const ops = this.legendOptions;
        const {
            iconRadius,
        } = ops;
        const textX = iconRadius + ops.textMarginX;
        const textY = ops.textMarginY;
        const textSize = ops.fontSize;
        const textColor = ops.fontColor;

        let legendPath = '';

        // 要重置lines数组，不然就会一直累加
        this.legendOptions.lines = [];
        const {
            viewWidth,
        } = this.msg;
        const {
            viewHeight,
        } = this.msg;

        let maxLegendWidth = 0;

        data.forEach((item, i) => {
            const {
                color,
            } = item;
            const {
                alpha,
            } = this.msg;

            if (item.type) {
                this.calcLabelBounding(item.type);
            } else if (item.label) {
                this.calcLabelBounding(item.label);
            } else {
                this.calcLabelBounding();
            }

            // 算出图例的总宽度
            if (ops.lines[i].sumW > maxLegendWidth) {
                maxLegendWidth = ops.lines[i].sumW;
            }

            const {
                text,
            } = ops.lines[i];
            const itemX = ops.lines[i].x;
            const itemY = ops.lines[i].y;

            legendPath += `<g class="legend-item" transform="translate(${itemX}, ${itemY})">
                        <circle cx="0" cy="0" r="${iconRadius}" fill="${color}" fill-opacity="${alpha}"/>
                        <text x="${textX}" y="${textY}" fill="${textColor}" font-size="${textSize}px">${Ktu.encodeHtml(text)}</text>
                    </g>`;
        });

        ops.h = ops.lines[ops.lines.length - 1].sumH;

        // 最后一个的图例间隔不算
        const legendX = (viewWidth - maxLegendWidth + ops.marginX) / 2;
        // 10是适当调整
        const legendY = viewHeight - ops.h + 10;

        const legendG = `<g class="legend-group" transform="translate(${legendX}, ${legendY})">
                            ${legendPath}
                        </g>`;

        return legendG;
    }

    /**
     * 初始化图标的HSL值
     */
    initHSL() {
        const {
            color,
        } = this.msg;

        if (color.indexOf('#') > -1 || color == 'transparent') {
            this.msg.hsl = this.RGBToHSL(this.HexToRGB(color));

            if (color == 'transparent') {
                this.msg.alpha = 0;
            } else {
                this.msg.alpha = 1;
            }
        } else {
            this.msg.hsl = this.RGBToHSL(this.RGBAToRGB(color));
        }

        // hue值
        this.msg.colorHue = this.msg.hsl.h * 360;
    }

    /**
     * RGB转化成HSL值
     * @param {*} rgb 转化成rgb对象{r: x, g: y, b:z}
     */
    RGBToHSL(rgb) {
        let {
            r,
            g,
            b,
        } = rgb;
        r /= 255, g /= 255, b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h;
        let s;
        const l = (max + min) / 2;
        if (max == min) {
            // achromatic
            h = 0;
            s = 0;
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
        };
    }

    /**
     * RGBA转化成RGB值
     * @param {*} rgba 转化成rgb对象{r: x, g: y, b:z}
     */
    RGBAToRGB(rgba) {
        let str = '';
        const reg = /\((.+?)\)/g;
        str = rgba.match(reg)[0];
        str = str.substring(1, str.length - 1).split(',');
        this.msg.alpha = str[3];
        return {
            r: str[0],
            g: str[1],
            b: str[2],
        };
    }

    /**
     * Hex转化成RGB值
     * @param {*} hex 用户选择的16进制rgb
     */
    HexToRGB(hex) {
        hex.indexOf('#') > -1 && (hex = hex.slice(1));
        hex = parseInt((hex.length == 6 ? hex : hex.split('').map(value => value + value)
            .join('')), 16);
        return {
            r: hex >> 16,
            g: (hex & 0x00FF00) >> 8,
            b: (hex & 0x0000FF),
        };
    }

    /**
     * HSL转化成RGB值
     * @param {*} hsl 转换而来的hsl
     */
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
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255),
        };
    }

    // 获取颜色（hue范围0-360）
    getColor(hue) {
        // 当选择透明颜色时
        if (this.msg.color == 'transparent') {
            return 'transparent';
        }

        let r;
        let g;
        let b;
        const {
            hsl,
        } = this.msg;
        // let a = this.msg.alpha || 1;

        const h = hue / 360;
        const {
            s,
        } = hsl;
        const {
            l,
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
        // 返回rgb，后端不支持rgba
        return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
    }

    // 更改主题颜色
    changeColor(value) {
        this.msg.color = value;
        this.initHSL();

        const {
            data,
        } = this.msg;
        const {
            colorHue,
        } = this.msg;
        const {
            colorStep,
        } = this.msg;

        data.forEach((item, idx) => {
            item.data.forEach((ele, i) => {
                ele.color = this.getColor(colorHue + i * colorStep);
            });
        });
    }

    // 更改字体颜色
    changeFontColor(value) {
        this.msg.fontColor = value;
    }

    toSvg(isAllInfo) {
        if (!this.visible) {
            return '';
        }

        // msg需要从字符串换为对象才能进行下面操作
        this.msg = typeof this.msg == 'string' ? JSON.parse(this.msg) : this.msg;

        this.initHSL();
        this.formatData();

        const ele = this.createEle();
        const defs = this.createDefs();

        let svg = '';
        const shadowStr = this.getShadow();
        const _shadowId = `shadow_${this.objectId}`;
        const flipStr = this.getFlip();

        const {
            viewWidth,
            viewHeight,
        } = this.msg;

        const gStyle = isAllInfo ? `transform="translate(${this.left} ${this.top}) rotate(${this.angle}) scale(${this.scaleX} ${this.scaleY}) ${flipStr}" opacity="${this.opacity}"` : `transform="${flipStr}"`;
        const g = `${shadowStr}
                    <g ${gStyle}>
                        <g ${this.isOpenShadow ? `style="filter:url(#${_shadowId})"` : ''}>
                            ${ele}
                            ${defs}
                        </g>
                    </g>`;

        if (isAllInfo) {
            svg = g;
        } else {
            svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" xml:space="preserve" width="${viewWidth * this.scaleX}" height="${viewHeight * this.scaleY}" viewBox="0 0 ${viewWidth} ${viewHeight}" preserveAspectRatio="none" style="overflow: visible">
                        ${g}
                    </svg>`;
        }

        // 记得清除dom节点
        this.tmpTextNode = '';
        $('.tmp-getTextRect') && $('.tmp-getTextRect').remove();
        return svg;
    }

    toObject() {
        const elementObj = TheElement.toObject(this);
        return _.assignIn(elementObj, {
            msg: JSON.stringify(this.msg),
        });
    }
};

// 柱状图
class RectChart extends Chart {
    constructor(data) {
        super(data);
        this.msg.chartType = 'rectChart';
    }

    // 整理图表数据
    formatData() {
        let maxValue = 0;

        const {
            data,
        } = this.msg;
        const {
            colorHue,
        } = this.msg;
        const {
            colorStep,
        } = this.msg;

        data.forEach((item, idx) => {
            item.color = item.color || this.getColor(colorHue + idx * colorStep);

            item.data.forEach((ele, i) => {
                ele.color = ele.color || this.getColor(colorHue + i * colorStep);

                if (maxValue < ele.value * 1) {
                    maxValue = ele.value * 1;
                }
            });
        });

        this.maxValue = maxValue;
    }

    // 计算初始化图表大小
    initChartSize() {
        this.axisX = {
            x: 0,
            y: 5,
            offsetY: 2,
            // 图例字体大小
            fontSize: 12,
            // 图例字体颜色
            color: '#999',
            fontFamily: 'sans-serif',
            // 用于存放图例单项的坐标参数
            lines: [],
        };

        this.axisY = {
            x: 5,
            y: 0,
            stepUnit: 10,
            // 图例字体大小
            fontSize: 12,
            // 图例字体颜色
            color: '#999',
            fontFamily: 'sans-serif',
            // 用于存放图例单项的坐标参数
            lines: [],
        };
        this.chart = {};

        const categoryLen = this.msg.data.length;
        const itemLen = this.msg.data[0].data.length;
        const {
            viewWidth,
        } = this.msg;
        const {
            viewHeight,
        } = this.msg;

        this.axisY.stepUnit = Math.ceil(this.maxValue / 8);
        this.axisY.num = Math.ceil(this.maxValue / this.axisY.stepUnit) + 1;
        this.axisY.maxValue = this.axisY.num * this.axisY.stepUnit;
        const boundY = this.getTextBounding(this.axisY.maxValue, {});
        this.axisY.w = Math.ceil(boundY.width) || 20;

        // 这里最要获取高度随便传一个中文即可
        const boundX = this.getTextBounding('中');
        this.axisX.h = Math.ceil(boundX.height) || 20;

        this.chart.x = this.axisY.w + this.axisY.x;
        this.chart.y = this.axisY.y;
        this.chart.w = viewWidth - this.chart.x;
        // 需要减去图例的高度
        this.chart.h = viewHeight - this.axisX.h - this.axisY.y - this.legendOptions.h - 10;
        // 每一项的宽度
        this.chart.itemWidth = this.chart.w / itemLen;
        // 单个矩形的宽度
        this.chart.rectWidth = this.chart.itemWidth / (categoryLen + 1);
        // 每一项矩形区域的左右偏移量，大小为一个矩形宽度的一半
        this.chart.itemOffsetX = (this.chart.itemWidth - this.chart.rectWidth * categoryLen) / 2;
        this.axisX.w = this.chart.itemWidth - this.chart.itemOffsetX * 2;
        this.axisX.maxValue = this.chart.itemWidth - 5;
    }

    // 创建坐标系
    createAxis() {
        let axisXSVG = '';
        let axisYSVG = '';
        let axisLSVG = '';
        const {
            axisX,
        } = this;
        const {
            axisY,
        } = this;
        const {
            chart,
        } = this;

        const {
            data,
        } = this.msg;
        const {
            fontColor,
        } = this.msg;
        const {
            axisColor,
        } = this.msg;
        const {
            baseAxisColor,
        } = this.msg;
        const {
            viewHeight,
        } = this.msg;

        // rgba颜色需要进行转换
        const textStyle = `style="${Ktu.element.getRgb('fill', fontColor).str}"`;

        /* this.axisX.lines = [];
           创建X坐标上的标注 */
        data[0].data.forEach((item, i) => {
            this.calcLabelBounding(item.label, axisX);

            const {
                text,
            } = axisX.lines[i];
            const itemX = chart.itemWidth * i + chart.itemWidth / 2;
            const itemY = axisX.fontSize + axisX.offsetY;

            axisXSVG += `<text x="${itemX}" y="${itemY}" ${textStyle}>${Ktu.encodeHtml(text)}</text>`;
        });

        // 创建Y坐标和横向刻度线
        for (let i = 0; i < axisY.num; i++) {
            const y = (axisY.num - i) / axisY.num * chart.h;

            axisYSVG += `<text x="${-axisY.x}" y="${y}" ${textStyle}>${i * this.axisY.stepUnit}</text>`;

            if (i > 0) {
                axisLSVG += `<rect x="0" y="${y}" width="${chart.w}" height="1"></rect>`;
            }
        }

        const axisXX = chart.x;
        // 减去图例高度
        const axisXY = viewHeight - axisX.h - this.legendOptions.h - 10;

        const axisYX = axisY.x + axisY.w;
        const axisYY = axisY.y;

        return `<g class="axis axisX" fill="${axisX.color}" font-size="${axisX.fontSize}px" font-family="${axisX.fontFamily}" text-anchor="middle" transform="translate( ${axisXX}, ${axisXY})">
					<rect x="0" y="0" width="${chart.w}" height="1" fill="${baseAxisColor}"></rect>
					${axisXSVG}
                </g>
                <g class="axis axisL" fill="${axisColor}" transform="translate(${axisYX},${axisYY})">
					${axisLSVG}
				</g>
				<g class="axis axisY" fill="${axisY.color}" font-size="${axisY.fontSize}px" font-family="${axisY.fontFamily}" text-anchor="end" transform="translate(${axisYX},${axisYY})">
					<rect x="0" y="0" width="1" height="${chart.h}" fill="${baseAxisColor}"></rect>
					${axisYSVG}
				</g>`;
    }

    createEle() {
        const {
            chartType,
        } = this.msg;

        // 是否显示图例
        const {
            isShowLegend,
        } = this.msg;
        let legendGSVG = '';

        if (chartType == 'rectChart') {
            legendGSVG = this.createLegend(this.msg.data[0].data);
        } else {
            legendGSVG = this.createLegend(this.msg.data);
        }

        if (!isShowLegend) {
            legendGSVG = '';
        }

        this.initChartSize();
        const axisGSVG = this.createAxis();

        const {
            chart,
        } = this;
        let pathG = '';

        const {
            data,
        } = this.msg;
        const {
            fontColor,
        } = this.msg;
        const {
            fontSize,
        } = this.msg;
        const {
            isShowLabel,
        } = this.msg;

        // rgba颜色需要进行转换
        const textStyle = `style="${Ktu.element.getRgb('fill', fontColor).str}"`;
        const {
            alpha,
        } = this.msg;

        data.forEach((item, idx) => {
            let rectG = '';

            item.data.forEach((ele, i) => {
                const w = chart.rectWidth;
                const x = chart.itemOffsetX + i * chart.itemWidth;

                const h = (ele.value / this.axisY.maxValue) * chart.h || 0;

                const y = chart.h - h || 0;

                if (isShowLabel) {
                    rectG += `<g class="chart-item" transform="translate(${x},${y})">
                                <rect x="0" y="0" width="${w}" height="${h}" fill="${ele.color}" fill-opacity="${alpha}"></rect>
                                <text x="${w / 2}" y="-2" ${textStyle} font-size="${fontSize}" text-anchor="middle">${Ktu.encodeHtml(ele.value)}</text>
                            </g>`;
                } else {
                    rectG += `<g class="chart-item" transform="translate(${x},${y})">
                                <rect x="0" y="0" width="${w}" height="${h}" fill="${ele.color}" fill-opacity="${alpha}"></rect>
                            </g>`;
                }
            });

            const x = chart.rectWidth * idx;
            const y = 0;

            pathG += `<g class="chart-group" transform="translate(${x},${y})">
						${rectG}
                    </g>`;
        });

        const svg = `<g class="chart-container">
                        ${axisGSVG}
                        ${legendGSVG}
                        <g class="chart-groups" transform="translate(${this.chart.x},${this.chart.y})">
                            ${pathG}
                        </g>
                    </g>`;
        return svg;
    }

    createDefs() {
        return ``;
    }
};

// 分组柱状图
class GRectChart extends RectChart {
    constructor(data) {
        super(data);
        this.msg.chartType = 'gRectChart';
    }

    // 整理图表数据
    formatData() {
        let maxValue = 0;

        const {
            data,
        } = this.msg;
        const {
            colorHue,
        } = this.msg;
        const {
            colorStep,
        } = this.msg;

        data.forEach((item, idx) => {
            item.color = item.color || this.getColor(colorHue + idx * colorStep);

            item.data.forEach((ele, i) => {
                // 多维数组时
                ele.color = item.color;
                if (maxValue < ele.value * 1) {
                    maxValue = ele.value * 1;
                }
            });
        });

        this.maxValue = maxValue;
    }

    changeColor(value) {
        this.msg.color = value;
        this.initHSL();

        const {
            data,
        } = this.msg;
        const {
            colorHue,
        } = this.msg;
        const {
            colorStep,
        } = this.msg;

        data.forEach((item, idx) => {
            item.color = this.getColor(colorHue + idx * colorStep);

            item.data.forEach((ele, i) => {
                ele.color = item.color;
            });
        });
    }
};

// 折线图
class LineChart extends Chart {
    constructor(data) {
        super(data);
        this.msg.chartType = 'lineChart';
    }

    formatData() {
        let maxValue = 0;

        const {
            data,
        } = this.msg;
        const {
            colorHue,
        } = this.msg;
        const {
            colorStep,
        } = this.msg;

        data.forEach((item, idx) => {
            item.color = item.color || this.getColor(colorHue + idx * colorStep);

            item.data.forEach((ele, i) => {
                ele.color = item.color;
                if (maxValue < ele.value * 1) {
                    maxValue = ele.value * 1;
                }
            });
        });

        this.maxValue = maxValue;
    }

    // 更改颜色
    changeColor(value) {
        this.msg.color = value;
        this.initHSL();

        const {
            data,
        } = this.msg;
        const {
            colorHue,
        } = this.msg;
        const {
            colorStep,
        } = this.msg;

        data.forEach((item, idx) => {
            item.color = this.getColor(colorHue + idx * colorStep);

            item.data.forEach((ele, i) => {
                ele.color = item.color;
            });
        });
    }

    initChartSize() {
        this.axisX = {
            x: 0,
            y: 3,
            offsetY: 2,
            // 坐标字体大小
            fontSize: 12,
            // 坐标轴颜色
            color: '#ccc',
            fontFamily: 'sans-serif',
            // 用于存放图例单项的坐标参数
            lines: [],
        };

        this.axisY = {
            x: 3,
            y: 0,
            stepUnit: 10,
            // 坐标字体大小
            fontSize: 12,
            // 坐标轴颜色
            color: '#999',
            fontFamily: 'sans-serif',
            // 用于存放图例单项的坐标参数
            lines: [],
        };

        this.chart = {};

        const itemLen = this.msg.data[0].data.length;
        const {
            viewWidth,
        } = this.msg;
        const {
            viewHeight,
        } = this.msg;

        this.axisY.stepUnit = Math.ceil(this.maxValue / 8);
        this.axisY.num = Math.ceil(this.maxValue / this.axisY.stepUnit) + 1;
        this.axisY.maxValue = this.axisY.num * this.axisY.stepUnit;
        const boundY = this.getTextBounding(this.axisY.maxValue, {});
        this.axisY.w = Math.ceil(boundY.width) || 20;

        // 这里最要获取高度随便传一个中文即可
        const boundX = this.getTextBounding('中');
        this.axisX.h = Math.ceil(boundX.height) || 20;

        this.chart.x = this.axisY.w + this.axisY.x;
        this.chart.y = this.axisY.y;
        this.chart.w = viewWidth - this.chart.x;
        // 需要减去图例的高度
        this.chart.h = viewHeight - this.axisX.h - this.axisY.y - this.legendOptions.h - 10;
        // 每一项的宽度
        this.chart.itemWidth = this.chart.w / itemLen;
        // this.chart.h = viewHeight - this.axisX.h - this.axisY.y;

        this.axisX.w = this.chart.x;
        this.axisY.h = this.chart.h;
        this.axisX.maxValue = this.chart.itemWidth - 5;
    }

    createAxis() {
        let axisXSVG = '';
        let axisYSVG = '';
        let axisLSVG = '';
        const {
            axisX,
        } = this;
        const {
            axisY,
        } = this;
        const {
            chart,
        } = this;

        const {
            data,
        } = this.msg;
        const {
            fontColor,
        } = this.msg;
        const {
            axisColor,
        } = this.msg;
        const {
            baseAxisColor,
        } = this.msg;
        const {
            viewHeight,
        } = this.msg;

        // rgba颜色需要进行转换
        const textStyle = `style="${Ktu.element.getRgb('fill', fontColor).str}"`;

        // 创建X坐标上的标注
        data[0].data.forEach((item, i) => {
            this.calcLabelBounding(item.label, axisX);

            const {
                text,
            } = axisX.lines[i];
            const itemX = chart.itemWidth * i + chart.itemWidth / 2;
            const itemY = axisX.fontSize + axisX.offsetY;

            axisXSVG += `<text x="${itemX}" y="${itemY}" ${textStyle}>${Ktu.encodeHtml(text)}</text>`;
        });

        // 创建Y坐标和横向刻度线
        for (let i = 0; i < axisY.num; i++) {
            const y = (axisY.num - i) / axisY.num * chart.h;

            axisYSVG += `<text x="${-axisY.x}" y="${y}" ${textStyle}>${i * this.axisY.stepUnit}</text>`;

            if (i > 0) {
                axisLSVG += `<rect x="0" y="${y}" width="${chart.w}" height="1"></rect>`;
            }
        }

        const axisXX = chart.x;
        // 减去图例高度
        const axisXY = viewHeight - axisX.h - this.legendOptions.h - 10;
        const axisYX = axisY.x + axisY.w;
        const axisYY = axisY.y;

        return `<g class="axis axisX" fill="${axisX.color}" font-size="${axisX.fontSize}px" font-family="${axisX.fontFamily}" text-anchor="middle" transform="translate( ${axisXX}, ${axisXY})">
					<rect x="0" y="0" width="${chart.w}" height="1" fill="${baseAxisColor}"></rect>
					${axisXSVG}
                </g>
                <g class="axis axisL" fill="${axisColor}" transform="translate(${axisYX},${axisYY})">
					${axisLSVG}
				</g>
				<g class="axis axisY" fill="${axisY.color}" font-size="${axisY.fontSize}px" font-family="${axisY.fontFamily}" text-anchor="end" transform="translate(${axisYX},${axisYY})">
					<rect x="0" y="0" width="1" height="${chart.h}" fill="${baseAxisColor}"></rect>
					${axisYSVG}
				</g>`;
    }

    createEle() {
        const {
            chartType,
        } = this.msg;

        // 是否显示图例
        const {
            isShowLegend,
        } = this.msg;
        const {
            isShowLabel,
        } = this.msg;
        let legendGSVG = '';

        if (chartType == 'lineChart') {
            legendGSVG = this.createLegend(this.msg.data[0].data);
        } else {
            legendGSVG = this.createLegend(this.msg.data);
        }

        if (!isShowLegend) {
            legendGSVG = '';
        }

        this.initChartSize();
        const axisGSVG = this.createAxis();

        const itemLen = this.msg.data[0].data.length;

        const {
            chart,
        } = this;
        let pathGSVG = '';

        const {
            data,
        } = this.msg;
        const {
            fontColor,
        } = this.msg;
        const {
            fontSize,
        } = this.msg;

        // rgba颜色需要进行转换
        const textStyle = `style="${Ktu.element.getRgb('fill', fontColor).str}"`;
        const {
            alpha,
        } = this.msg;
        const {
            objectId,
        } = this;

        data.forEach((item, idx) => {
            let textGSVG = '';
            let points = '';

            item.data.forEach((ele, i) => {
                const w = chart.itemWidth / 2;
                const x = parseInt(i * chart.itemWidth + w, 10);

                const h = (ele.value / this.axisY.maxValue) * chart.h || 0;
                const y = parseInt(chart.h - h, 10) || 0;

                points += `${x} ${y}`;

                if (i < itemLen - 1) {
                    points += ',';
                }

                const textX = x;
                const textY = y - 5;

                // 是否显示数据标签
                if (isShowLabel) {
                    textGSVG += `<text x="${textX}" y="${textY}" ${textStyle} font-size="${fontSize}" text-anchor="middle">${Ktu.encodeHtml(ele.value)}</text>`;
                } else {
                    textGSVG = '';
                }
            });

            pathGSVG += `<g class="chart-item">
							<polyline points="${points}" stroke="${item.color}" stroke-opacity="${alpha}" fill="none" style="marker : url(#${objectId}circle${idx})"></polyline>
							${textGSVG}
						</g>`;
        });

        return `<g class="chart-container">
					${axisGSVG}
					${legendGSVG}
					<g class="chart-group" transform="translate(${chart.x},${chart.y})">
						${pathGSVG}
					</g>
				</g>`;
    }

    createDefs() {
        let defsSVG = '';

        const {
            data,
        } = this.msg;
        const {
            alpha,
        } = this.msg;
        const {
            objectId,
        } = this;

        data.forEach((item, i) => {
            defsSVG += `<marker id="${objectId}circle${i}" markerWidth="10" markerHeight="10" refX="5" refY="5">
							<circle cx="5" cy="5" r="4" fill="${item.color}" fill-opacity="${alpha}"></circle>
						</marker>`;
        });

        return `<defs>${defsSVG}</defs>`;
    }
};

// 多段折线图
class GLineChart extends LineChart {
    constructor(data) {
        super(data);
        this.msg.chartType = 'gLineChart';
    };
};

// 饼图
class PieChart extends Chart {
    constructor(data) {
        super(data);
        this.msg.chartType = 'pieChart';

        // 图表配置参数
        this.chartOptions = {
            // 整个图表的X偏移量
            marginX: 0,
            // 整个图表的Y偏移量
            marginY: 10,
            // 外圈半径
            bigRadius: 160,
            // 内圈半径
            smartRadius: 100,
            // 标注的字体大小
            fontSize: 12,
        };
    };

    formatData() {
        const itemLen = this.msg.data[0].data.length;

        const {
            data,
        } = this.msg;
        const {
            colorHue,
        } = this.msg;
        const {
            colorStep,
        } = this.msg;

        data.forEach((item, idx) => {
            let sum = 0;
            const totalValue = item.data.reduce((prev, cur) => parseFloat(cur.value) + parseFloat(prev), 0);

            item.data.forEach((ele, i) => {
                ele.color = ele.color || this.getColor(colorHue + i * colorStep);

                if (i < itemLen - 1) {
                    ele.percent = (ele.value / totalValue).toFixed(4);
                    sum += parseFloat(ele.percent);
                } else {
                    ele.percent = (1 - sum).toFixed(4);
                }

                ele.angle = ele.percent * Math.PI * 2;
            });
        });
    }

    createLegend() {
        const ops = this.legendOptions;
        const {
            iconRadius,
        } = ops;
        const textX = iconRadius + ops.textMarginX;
        const textY = iconRadius;
        const textSize = ops.fontSize;
        const textColor = ops.fontColor;

        let legendPath = '';

        let maxLegendWidth = 0;

        // 要重置lines数组，不然就会一直累加
        this.legendOptions.lines = [];

        const itemLen = this.msg.data[0].data.length;
        const cData = this.msg.data[0].data;
        const {
            viewWidth,
        } = this.msg;
        const {
            viewHeight,
        } = this.msg;
        const {
            alpha,
        } = this.msg;

        for (let i = 0; i < itemLen; i++) {
            const ele = cData[i];
            const {
                color,
            } = ele;

            this.calcLabelBounding(ele.label);

            // 算出图例的总宽度
            if (ops.lines[i].sumW > maxLegendWidth) {
                maxLegendWidth = ops.lines[i].sumW;
            }

            const {
                text,
            } = ops.lines[i];
            const itemX = ops.lines[i].x;
            const itemY = ops.lines[i].y;

            legendPath += `<g class="legend-item" transform="translate(${itemX}, ${itemY})">
							<circle cx="0" cy="0" r="${iconRadius}" fill="${color}" fill-opacity="${alpha}"/>
							<text x="${textX}" y="${textY}" fill="${textColor}" font-size="${textSize}px">${Ktu.encodeHtml(text)}</text>
						</g>`;
        }

        ops.h = ops.lines[ops.lines.length - 1].sumH;

        const legendX = (viewWidth - maxLegendWidth + ops.marginX) / 2;
        // legendY = ops.y + this.chartOptions.marginY + this.chartOptions.bigRadius * 2 + 10;
        const legendY = viewHeight - ops.h - 10;

        const legendG = `<g class="legend-group" transform="translate(${legendX}, ${legendY})">
						${legendPath}
					</g>`;

        return legendG;
    }

    createEle() {
        let arcPath = '';
        const textSize = this.chartOptions.fontSize;

        let sumAngle = -Math.PI / 2;

        const itemLen = this.msg.data[0].data.length;
        const cData = this.msg.data[0].data;
        const {
            fontColor,
        } = this.msg;
        const {
            viewWidth,
        } = this.msg;
        const {
            viewHeight,
        } = this.msg;

        const {
            isShowLabel,
        } = this.msg;
        // 是否显示图例
        const {
            isShowLegend,
        } = this.msg;
        let legendGSVG = '';

        if (isShowLegend) {
            legendGSVG = this.createLegend();
        }

        // rgba颜色需要进行转换
        const textStyle = `style="${Ktu.element.getRgb('fill', fontColor).str}"`;
        const {
            alpha,
        } = this.msg;

        /* 这里圆的半径应该需要计算自适应(viewHeight-legend的高度)
           let bRadius = this.chartOptions.bigRadius,
           sRadius = this.chartOptions.smartRadius; */
        const bRadius = (viewHeight - this.legendOptions.h - this.chartOptions.marginY - this.legendOptions.y - 10) / 2;
        const sRadius = bRadius - 60;

        for (let i = 0; i < itemLen; i++) {
            const ele = cData[i];
            const {
                color,
            } = ele;

            const startAngle = sumAngle;
            const endAngle = sumAngle + ele.angle;
            sumAngle = endAngle;

            const x1 = Math.round(bRadius * Math.cos(startAngle));
            const y1 = Math.round(bRadius * Math.sin(startAngle));
            const x2 = Math.round(bRadius * Math.cos(endAngle));
            const y2 = Math.round(bRadius * Math.sin(endAngle));

            // 当比例大于0.5即大于180度，该值为1
            const largeFlag = ele.percent > 0.5 ? 1 : 0;

            // 当某个值过大时，比例接近1.0000时,做极限处理
            let path = '';
            let text = '';
            if (ele.percent == 1.0000) {
                // path = `<circle fill="${color}" cx="0" cy="0" r="${bRadius}"></circle>`;
                path = `<path fill="${color}" fill-opacity="${alpha}" d="M${-bRadius}, 0 a${bRadius}, ${bRadius}, 0, 1, 0, ${bRadius * 2}, 0 a${bRadius}, ${bRadius}, 0, 1, 0, ${-bRadius * 2} 0 Z"></path>`;
            } else if (ele.percent == 0.0000) {
                path = '';
            } else {
                path = `<path fill="${color}" fill-opacity="${alpha}" stroke="#fff" stroke-width="0" d="M${0},${0} L${x1},${y1} A${bRadius},${bRadius},0,${largeFlag},1,${x2},${y2} Z"></path>`;
            }

            const textX = (bRadius + sRadius) / 2 * Math.cos(startAngle + ele.angle / 2);
            const textY = (bRadius + sRadius) / 2 * Math.sin(startAngle + ele.angle / 2) + textSize / 2;

            // 是否显示数据标签
            if (isShowLabel) {
                text = `<text x="${textX}" y="${textY}" ${textStyle} font-size="${textSize}px" text-anchor="middle">${Ktu.encodeHtml(ele.value)}</text>`;
            } else {
                text = '';
            }
            arcPath += `<g class="chart-item">
                            ${path}
                            ${text}
                        </g>`;
        }

        const pathX = viewWidth / 2;
        // pathY = this.legendOptions.lines[0].h + this.legendOptions.y + bRadius + this.chartOptions.marginY + 10;
        const pathY = this.chartOptions.marginY + bRadius;

        const pathGSVG = `<g class="chart-group" transform="translate(${pathX}, ${pathY})">
						${arcPath}
					</g>`;

        const svg = `<g class="chart-container">
                        ${pathGSVG}
						${legendGSVG}
					</g>`;

        return svg;
    }

    createDefs() {
        return ``;
    }
};

// 环形图
class DonutChart extends Chart {
    constructor(data) {
        super(data);
        this.msg.chartType = 'donutChart';

        // 图表配置参数
        this.chartOptions = {
            // 整个图表的X偏移量
            marginX: 0,
            // 整个图表的Y偏移量
            marginY: 10,
            // 外圈半径
            bigRadius: 160,
            // 内圈半径
            smartRadius: 100,
            // 标注的字体大小
            fontSize: 12,
        };
    }

    formatData() {
        const itemLen = this.msg.data[0].data.length;
        const {
            data,
        } = this.msg;
        const {
            colorHue,
        } = this.msg;
        const {
            colorStep,
        } = this.msg;

        data.forEach((item, idx) => {
            let sum = 0;
            const totalValue = item.data.reduce((prev, cur) => parseFloat(cur.value) + parseFloat(prev), 0);

            item.data.forEach((ele, i) => {
                ele.color = ele.color || this.getColor(colorHue + i * colorStep);

                if (i < itemLen - 1) {
                    ele.percent = (ele.value / totalValue).toFixed(4);
                    sum += parseFloat(ele.percent);
                } else {
                    ele.percent = (1 - sum).toFixed(4);
                }

                ele.angle = ele.percent * Math.PI * 2;
            });
        });
    }

    createLegend() {
        const ops = this.legendOptions;
        const {
            iconRadius,
        } = ops;
        const textX = iconRadius + ops.textMarginX;
        const textY = iconRadius;
        const textSize = ops.fontSize;
        const textColor = ops.fontColor;

        let legendPath = '';

        let maxLegendWidth = 0;

        // 要重置lines数组，不然就会一直累加
        this.legendOptions.lines = [];

        const itemLen = this.msg.data[0].data.length;
        const cData = this.msg.data[0].data;
        const {
            viewWidth,
        } = this.msg;
        const {
            viewHeight,
        } = this.msg;
        const {
            alpha,
        } = this.msg;

        for (let i = 0; i < itemLen; i++) {
            const ele = cData[i];
            const {
                color,
            } = ele;

            this.calcLabelBounding(ele.label);

            // 算出图例的总宽度
            if (ops.lines[i].sumW > maxLegendWidth) {
                maxLegendWidth = ops.lines[i].sumW;
            }

            const {
                text,
            } = ops.lines[i];
            const itemX = ops.lines[i].x;
            const itemY = ops.lines[i].y;

            legendPath += `<g class="legend-item" transform="translate(${itemX}, ${itemY})">
							<circle cx="0" cy="0" r="${iconRadius}" fill="${color}" fill-opacity="${alpha}"/>
							<text x="${textX}" y="${textY}" fill="${textColor}" font-size="${textSize}px">${Ktu.encodeHtml(text)}</text>
						</g>`;
        }

        ops.h = ops.lines[ops.lines.length - 1].sumH;

        const legendX = (viewWidth - maxLegendWidth + ops.marginX) / 2;
        // legendY = ops.y + this.chartOptions.marginY + this.chartOptions.bigRadius * 2 + 10;
        const legendY = viewHeight - ops.h - 10;

        const legendG = `<g class="legend-group" transform="translate(${legendX}, ${legendY})">
						${legendPath}
					</g>`;

        return legendG;
    }

    createEle() {
        let arcPath = '';
        const textSize = this.chartOptions.fontSize;

        let sumAngle = -Math.PI / 2;

        const itemLen = this.msg.data[0].data.length;
        const cData = this.msg.data[0].data;
        const {
            fontColor,
        } = this.msg;
        const {
            viewWidth,
        } = this.msg;
        const {
            viewHeight,
        } = this.msg;

        const {
            isShowLabel,
        } = this.msg;
        // 是否显示图例
        const {
            isShowLegend,
        } = this.msg;
        let legendGSVG = '';

        if (isShowLegend) {
            legendGSVG = this.createLegend();
        }

        // rgba颜色需要进行转换
        const textStyle = `style="${Ktu.element.getRgb('fill', fontColor).str}"`;
        const {
            alpha,
        } = this.msg;

        /* 这里圆的半径应该需要计算自适应(viewHeight-legend的高度)
           let bRadius = this.chartOptions.bigRadius,
           sRadius = this.chartOptions.smartRadius; */
        const bRadius = (viewHeight - this.legendOptions.h - this.chartOptions.marginY - this.legendOptions.y - 10) / 2;
        const sRadius = bRadius - 60;

        for (let i = 0; i < itemLen; i++) {
            const ele = cData[i];
            const {
                color,
            } = ele;

            const startAngle = sumAngle;
            const endAngle = sumAngle + ele.angle;
            sumAngle = endAngle;

            const x1 = Math.round(bRadius * Math.cos(startAngle));
            const y1 = Math.round(bRadius * Math.sin(startAngle));
            const x2 = Math.round(bRadius * Math.cos(endAngle));
            const y2 = Math.round(bRadius * Math.sin(endAngle));

            const x3 = Math.round(sRadius * Math.cos(endAngle));
            const y3 = Math.round(sRadius * Math.sin(endAngle));
            const x4 = Math.round(sRadius * Math.cos(startAngle));
            const y4 = Math.round(sRadius * Math.sin(startAngle));

            // 当比例大于0.5即大于180度，该值为1
            const largeFlag = ele.percent > 0.5 ? 1 : 0;

            // 当某个值过大时，比例接近1.0000时,做极限处理
            let path = '';
            let text = '';
            if (ele.percent == 1.0000) {
                path = `<path fill="${color}" fill-opacity="${alpha}" d="M${-bRadius}, 0 a${bRadius}, ${bRadius}, 0, 1, 0, ${bRadius * 2}, 0 a${bRadius}, ${bRadius}, 0, 1, 0, ${-bRadius * 2} 0 Z
                M${-sRadius}, 0 a${sRadius}, ${sRadius}, 0, 1, 0, ${sRadius * 2}, 0 a${sRadius}, ${sRadius}, 0, 1, 0, ${-sRadius * 2} 0 Z" fill-rule="evenodd"></path>`;
            } else if (ele.percent == 0.0000) {
                path = '';
            } else {
                path = `<path fill="${color}" fill-opacity="${alpha}" stroke="#fff" stroke-width="0" d="M${x1},${y1} A${bRadius},${bRadius},0,${largeFlag},1,${x2},${y2} L${x3},${y3} A${sRadius},${sRadius},0,${largeFlag},0,${x4},${y4} Z"></path>`;
            }

            const textX = (bRadius + sRadius) / 2 * Math.cos(startAngle + ele.angle / 2);
            const textY = (bRadius + sRadius) / 2 * Math.sin(startAngle + ele.angle / 2) + textSize / 2;

            if (isShowLabel) {
                text = `<text x="${textX}" y="${textY}" ${textStyle} font-size="${textSize}px" text-anchor="middle">${Ktu.encodeHtml(ele.value)}</text>`;
            } else {
                text = '';
            }
            arcPath += `<g class="chart-item">
                            ${path}
                            ${text}
                        </g>`;
        }

        const pathX = viewWidth / 2;
        // pathY = this.legendOptions.lines[0].h + this.legendOptions.y + bRadius + this.chartOptions.marginY + 10;
        const pathY = this.chartOptions.marginY + bRadius;

        const pathGSVG = `<g class="chart-group" transform="translate(${pathX}, ${pathY})">
                    ${arcPath}
                </g>`;

        const svg = `<g class="chart-container">
                    ${pathGSVG}
                    ${legendGSVG}
                </g>`;

        return svg;
    }

    createDefs() {
        return ``;
    }
};

// 玫瑰图
class RoseChart extends Chart {
    constructor(data) {
        super(data);
        this.msg.chartType = 'roseChart';

        // 图表配置参数
        this.chartOptions = {
            // 整个图表的X偏移量
            marginX: 0,
            // 整个图表的Y偏移量
            marginY: 10,
            // 外圈半径
            bigRadius: 160,
            // 内圈半径
            smartRadius: 100,
            // 标注的字体大小
            fontSize: 12,
        };
    }

    formatData() {
        let maxValue = 0;
        const itemLen = this.msg.data[0].data.length;

        const {
            data,
        } = this.msg;
        const {
            colorHue,
        } = this.msg;
        const {
            colorStep,
        } = this.msg;

        data.forEach((item, idx) => {
            let sum = 0;
            const totalValue = item.data.reduce((prev, cur) => parseFloat(cur.value) + parseFloat(prev), 0);

            item.data.forEach((ele, i) => {
                ele.color = ele.color || this.getColor(colorHue + i * colorStep);

                if (i < itemLen - 1) {
                    ele.percent = (ele.value / totalValue).toFixed(4);
                    sum += parseFloat(ele.percent);
                } else {
                    ele.percent = (1 - sum).toFixed(4);
                }

                ele.angle = ele.percent * Math.PI * 2;

                if (maxValue < ele.value * 1) {
                    maxValue = ele.value * 1;
                }
            });
        });

        /* let axisY_step = 5;
           let axisY_num = Math.ceil(maxValue / axisY_step) + 1
           this.maxValue = axisY_num * axisY_step; */
        this.maxValue = maxValue;

        /* 最大扇面的半径
           this.maxRadius = (maxValue / this.maxValue) * this.chartOptions.bigRadius; */
        this.maxRadius = this.chartOptions.bigRadius;
    }

    createLegend() {
        const ops = this.legendOptions;
        const {
            iconRadius,
        } = ops;
        const textX = iconRadius + ops.textMarginX;
        const textY = iconRadius;
        const textSize = ops.fontSize;
        const textColor = ops.fontColor;

        let legendPath = '';

        let maxLegendWidth = 0;

        // 要重置lines数组，不然就会一直累加
        this.legendOptions.lines = [];

        const itemLen = this.msg.data[0].data.length;
        const cData = this.msg.data[0].data;
        const {
            viewWidth,
        } = this.msg;
        const {
            viewHeight,
        } = this.msg;
        const {
            alpha,
        } = this.msg;

        for (let i = 0; i < itemLen; i++) {
            const ele = cData[i];
            const {
                color,
            } = ele;

            this.calcLabelBounding(ele.label);

            // 算出图例的总宽度
            if (ops.lines[i].sumW > maxLegendWidth) {
                maxLegendWidth = ops.lines[i].sumW;
            }

            const {
                text,
            } = ops.lines[i];
            const itemX = ops.lines[i].x;
            const itemY = ops.lines[i].y;

            legendPath += `<g class="legend-item" transform="translate(${itemX}, ${itemY})">
							<circle cx="0" cy="0" r="${iconRadius}" fill="${color}" fill-opacity="${alpha}"/>
							<text x="${textX}" y="${textY}" fill="${textColor}" font-size="${textSize}px">${Ktu.encodeHtml(text)}</text>
						</g>`;
        }

        ops.h = ops.lines[ops.lines.length - 1].sumH;

        const legendX = (viewWidth - maxLegendWidth + ops.marginX) / 2;
        // legendY = ops.y + this.chartOptions.marginY + this.chartOptions.bigRadius * 2 + 10;
        const legendY = viewHeight - ops.h - 10;

        const legendG = `<g class="legend-group" transform="translate(${legendX}, ${legendY})">
						${legendPath}
					</g>`;

        return legendG;
    }

    createEle() {
        const itemLen = this.msg.data[0].data.length;

        let arcPath = '';
        const textSize = this.chartOptions.fontSize;

        let sumAngle = -Math.PI / 2;
        const angleStep = Math.PI * 2 / itemLen;

        const cData = this.msg.data[0].data;
        const {
            fontColor,
        } = this.msg;
        const {
            viewWidth,
        } = this.msg;
        const {
            viewHeight,
        } = this.msg;

        const {
            isShowLabel,
        } = this.msg;
        // 是否显示图例
        const {
            isShowLegend,
        } = this.msg;
        let legendGSVG = '';

        if (isShowLegend) {
            legendGSVG = this.createLegend();
        }

        // rgba颜色需要进行转换
        const textStyle = `style="${Ktu.element.getRgb('fill', fontColor).str}"`;
        const {
            alpha,
        } = this.msg;

        /* 这里圆的半径应该需要计算自适应(viewHeight-legend的高度)
           let bRadius = this.chartOptions.bigRadius,
           sRadius = this.chartOptions.smartRadius; */
        const bRadius = (viewHeight - this.legendOptions.h - this.chartOptions.marginY - this.legendOptions.y - 10) / 2;

        cData.forEach((item, idx) => {
            const {
                color,
            } = item;

            const startAngle = sumAngle;
            const endAngle = sumAngle + angleStep;
            sumAngle = endAngle;

            // let radius = (item.value / this.maxValue) * viewHeight / 2;
            const radius = (item.value / this.maxValue) * bRadius;

            const x1 = Math.round(radius * Math.cos(startAngle));
            const y1 = Math.round(radius * Math.sin(startAngle));
            const x2 = Math.round(radius * Math.cos(endAngle));
            const y2 = Math.round(radius * Math.sin(endAngle));

            const textX = radius / 2 * Math.cos(startAngle + angleStep / 2);
            const textY = radius / 2 * Math.sin(startAngle + angleStep / 2) + textSize / 2;

            // 当某个值过大时，比例接近1.0000时,做极限处理
            let path = '';
            let text = '';
            if (item.percent == 1.0000) {
                // path = `<path fill="${color}" stroke="#fff" stroke-width="1px" d="M${0},${0} L${x1},${y1} A${radius},${radius},0,0,1,${x2},${y2} Z"></path>`;
                path = `<path fill="${color}" fill-opacity="${alpha}" d="M${-radius}, 0 a${radius}, ${radius}, 0, 1, 0, ${radius * 2}, 0 a${radius}, ${radius}, 0, 1, 0, ${-radius * 2} 0 Z"></path>`;
            } else if (item.percent == 0.0000) {
                path = '';
            } else {
                path = `<path fill="${color}" fill-opacity="${alpha}" stroke="#fff" stroke-width="0" d="M${0},${0} L${x1},${y1} A${radius},${radius},0,0,1,${x2},${y2} Z"></path>`;
            }

            if (isShowLabel) {
                text = `<text x="${textX}" y="${textY}" ${textStyle} font-size="${textSize}px" text-anchor="middle">${Ktu.encodeHtml(item.value)}</text>`;
            } else {
                text = '';
            }

            arcPath += `<g class="chart-item">
                            ${path}
                            ${text}
                        </g>`;
        });

        const pathX = viewWidth / 2;
        // pathY = this.maxRadius + this.legendOptions.y + this.legendOptions.lines[0].h + this.chartOptions.marginY + 10;
        const pathY = this.chartOptions.marginY + bRadius;

        const pathGSVG = `<g class="chart-group" transform="translate(${pathX}, ${pathY})">
						${arcPath}
					</g>`;

        const svg = `<g class="chart-container">
                        ${pathGSVG}
                        ${legendGSVG}
					</g>`;

        return svg;
    }

    createDefs() {
        return ``;
    }
};

// 横向柱状图
class HRectChart extends Chart {
    constructor(data) {
        super(data);
        this.msg.chartType = 'hRectChart';
    }

    // 整理图表数据
    formatData() {
        let maxValue = 0;
        let maxLabel = '类型';

        const {
            data,
        } = this.msg;
        const {
            colorHue,
        } = this.msg;
        const {
            colorStep,
        } = this.msg;

        data.forEach((item, idx) => {
            item.color = item.color || this.getColor(colorHue + idx * colorStep);

            item.data.forEach((ele, i) => {
                ele.color = ele.color || this.getColor(colorHue + i * colorStep);

                if (maxValue < ele.value * 1) {
                    maxValue = ele.value * 1;
                }

                if (maxLabel.length < ele.label.length) {
                    maxLabel = ele.label;
                }
            });
        });
        this.maxValue = maxValue;
        this.maxLabel = maxLabel;
    }

    // 初始化计算图表的大小
    initChartSize() {
        this.axisX = {
            x: 0,
            y: 5,
            stepUnit: 10,
            offsetY: 10,
            // 图例字体大小
            fontSize: 12,
            // 图例字体颜色
            color: '#999',
            fontFamily: 'sans-serif',
            // 用于存放图例单项的坐标参数
            lines: [],
        };

        this.axisY = {
            x: 5,
            y: 0,
            offsetX: 2,
            stepUnit: 10,
            // 图例字体大小
            fontSize: 12,
            // 图例字体颜色
            color: '#999',
            fontFamily: 'sans-serif',
            // 用于存放图例单项的坐标参数
            lines: [],
        };

        this.chart = {};

        const categoryLen = this.msg.data.length;
        const itemLen = this.msg.data[0].data.length;
        const {
            viewWidth,
        } = this.msg;
        const {
            viewHeight,
        } = this.msg;

        const boundY = this.getTextBounding(this.maxLabel, {});
        this.axisY.w = Math.ceil(boundY.width) || 20;

        // 这个时候x轴才是数值轴
        this.axisX.stepUnit = Math.ceil(this.maxValue / 8);
        this.axisX.num = Math.ceil(this.maxValue / this.axisX.stepUnit) + 1;
        this.axisX.maxValue = this.axisX.num * this.axisX.stepUnit;

        // 这里最要获取高度随便传一个中文即可
        const boundX = this.getTextBounding('中');
        this.axisX.h = Math.ceil(boundX.height) || 20;

        this.chart.x = this.axisY.w + this.axisY.x;
        this.chart.y = this.axisY.y;
        this.chart.w = viewWidth - this.chart.x;
        // 需要减去图例的高度
        this.chart.h = viewHeight - this.axisX.h - this.axisY.y - this.legendOptions.h - 10;
        // 每一项的宽度
        this.chart.itemWidth = this.chart.h / itemLen;
        // 单个矩形的宽度
        this.chart.rectWidth = this.chart.itemWidth / (categoryLen + 1);
        // 每一项矩形区域的左右偏移量，大小为一个矩形宽度的一半
        this.chart.itemOffsetY = (this.chart.itemWidth - this.chart.rectWidth * categoryLen) / 2;
        this.axisY.w = this.chart.itemWidth - this.chart.itemOffsetY * 2;
        this.axisY.maxValue = this.chart.itemWidth * 2 - 5;
    }

    // 创建坐标系
    createAxis() {
        let axisXSVG = '';
        let axisYSVG = '';
        let axisLSVG = '';
        const {
            axisX,
        } = this;
        const {
            axisY,
        } = this;
        const {
            chart,
        } = this;

        const {
            data,
        } = this.msg;
        const {
            fontColor,
        } = this.msg;
        const {
            axisColor,
        } = this.msg;
        const {
            baseAxisColor,
        } = this.msg;
        const {
            viewHeight,
        } = this.msg;

        // rgba颜色需要进行转换
        const textStyle = `style="${Ktu.element.getRgb('fill', fontColor).str}"`;

        // 创建Y坐标上的标注
        data[0].data.forEach((item, i) => {
            this.calcLabelBounding(item.label, axisY);

            const {
                text,
            } = axisY.lines[i];
            const itemY = chart.itemWidth * i + chart.itemWidth / 2;
            const itemX = -axisY.x;

            axisYSVG += `<text x="${itemX}" y="${itemY}" ${textStyle} dominant-baseline="middle">${Ktu.encodeHtml(text)}</text>`;
        });

        // 创建X坐标和纵向刻度线
        for (let i = 0; i < axisX.num; i++) {
            const x = i / axisX.num * chart.w;

            axisXSVG += `<text x="${x}" y="${axisX.y + axisX.offsetY}" ${textStyle}>${i * this.axisX.stepUnit}</text>`;

            if (i > 0) {
                axisLSVG += `<rect x="${x}" y="0" width="1" height="${chart.h}"></rect>`;
            }
        }

        const axisXX = chart.x;
        // 减去图例高度
        const axisXY = viewHeight - axisX.h - this.legendOptions.h - 10;

        // const axisYX = axisY.x + axisY.w;
        const axisYY = axisY.y;

        return `<g class="axis axisX" fill="${axisX.color}" font-size="${axisX.fontSize}px" font-family="${axisX.fontFamily}" text-anchor="middle" transform="translate( ${axisXX}, ${axisXY})">
                    <rect x="0" y="0" width="${chart.w}" height="1" fill="${baseAxisColor}"></rect>
                    ${axisXSVG}
                </g>
                <g class="axis axisL" fill="${axisColor}" transform="translate(${axisXX},${axisYY})">
                    ${axisLSVG}
                </g>
                <g class="axis axisY" fill="${axisY.color}" font-size="${axisY.fontSize}px" font-family="${axisY.fontFamily}" text-anchor="end" transform="translate(${axisXX},${axisYY})">
                    <rect x="0" y="0" width="1" height="${chart.h}" fill="${baseAxisColor}"></rect>
                    ${axisYSVG}
                </g>`;
    }

    // 创建元素
    createEle() {
        const {
            chartType,
        } = this.msg;

        // 是否显示图例
        const {
            isShowLegend,
        } = this.msg;
        let legendGSVG = '';

        if (chartType == 'hRectChart') {
            legendGSVG = this.createLegend(this.msg.data[0].data);
        } else {
            legendGSVG = this.createLegend(this.msg.data);
        }

        if (!isShowLegend) {
            legendGSVG = '';
        }

        this.initChartSize();
        const axisGSVG = this.createAxis();

        const {
            chart,
        } = this;
        let pathG = '';

        const {
            data,
        } = this.msg;
        const {
            fontColor,
        } = this.msg;
        const {
            fontSize,
        } = this.msg;
        const {
            isShowLabel,
        } = this.msg;

        // rgba颜色需要进行转换
        const textStyle = `style="${Ktu.element.getRgb('fill', fontColor).str}"`;
        const {
            alpha,
        } = this.msg;

        data.forEach((item, idx) => {
            let rectG = '';

            item.data.forEach((ele, i) => {
                const h = chart.rectWidth;
                const y = chart.itemOffsetY + i * chart.itemWidth;

                const w = (ele.value / this.axisX.maxValue) * chart.w || 0;
                const x = 0;

                if (isShowLabel) {
                    rectG += `<g class="chart-item" transform="translate(${x},${y})">
                                <rect x="0" y="0" width="${w}" height="${h}" fill="${ele.color}" fill-opacity="${alpha}"></rect>
                                <text x="${w + 5}" y="${h / 2}" ${textStyle} font-size="${fontSize}" dominant-baseline="middle" text-anchor="start">${Ktu.encodeHtml(ele.value)}</text>
                            </g>`;
                } else {
                    rectG += `<g class="chart-item" transform="translate(${x},${y})">
                                <rect x="0" y="0" width="${w}" height="${h}" fill="${ele.color}" fill-opacity="${alpha}"></rect>
                            </g>`;
                }
            });

            const y = chart.rectWidth * idx;
            const x = 0;

            pathG += `<g class="chart-group" transform="translate(${x},${y})">
                        ${rectG}
                    </g>`;
        });
        const svg = `<g class="chart-container">
                        ${axisGSVG}
                        ${legendGSVG}
                        <g class="chart-groups" transform="translate(${this.chart.x},${this.chart.y})">
                            ${pathG}
                        </g>
                    </g>`;
        return svg;
    }

    // 创建定义
    createDefs() {
        return ``;
    }
};

// 横向分组柱状图
class HGRectChart extends HRectChart {
    constructor(data) {
        super(data);
        this.msg.chartType = 'hGRectChart';
    }

    // 整理图表数据
    formatData() {
        let maxValue = 0;
        let maxLabel = '类型';

        const {
            data,
        } = this.msg;
        const {
            colorHue,
        } = this.msg;
        const {
            colorStep,
        } = this.msg;

        data.forEach((item, idx) => {
            item.color = item.color || this.getColor(colorHue + idx * colorStep);

            item.data.forEach((ele, i) => {
                // 多维数组时
                ele.color = item.color;
                if (maxValue < ele.value * 1) {
                    maxValue = ele.value * 1;
                }

                if (maxLabel.length < ele.label.length) {
                    maxLabel = ele.label;
                }
            });
        });

        this.maxValue = maxValue;
        this.maxLabel = maxLabel;
    }

    changeColor(value) {
        this.msg.color = value;
        this.initHSL();

        const {
            data,
        } = this.msg;
        const {
            colorHue,
        } = this.msg;
        const {
            colorStep,
        } = this.msg;

        data.forEach((item, idx) => {
            item.color = this.getColor(colorHue + idx * colorStep);

            item.data.forEach((ele, i) => {
                ele.color = item.color;
            });
        });
    }
};
