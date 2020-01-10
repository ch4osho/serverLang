class Line extends TheElement {
    constructor(data) {
        super(data);
        this.fill = data.fill;
        this.scaleProp = 'wh';
        this.controls = {
            mt: true,
            mr: true,
            mb: true,
            ml: true,
            rotate: true,
            bl: false,
            br: false,
            tl: false,
            tr: false,
        };
        this.isSizeLock = false;
        const msg = data.msg === undefined ? {
            arrowStyle: 'normal',
            arrowEndpoint: {
                left: false,
                right: true,
            },
        } : data.msg;
        this.actualWidth = this.width;
        this.actualHeight = this.strokeWidth;
        this.msg = typeof msg == 'string' ? JSON.parse(msg) : msg;
        this.left = data.left;
        this.top = data.top;
        this.getActualSize();
        this.setCoords();
    }

    getArrowSize(style) {
        let arrowWidth;
        let arrowHeight;
        const { h } = this.getLineDimensions();
        switch (style) {
            case 'arrow':
                arrowWidth = Math.sqrt(2 * h * h) / 2 + h * 2;
                arrowHeight = h + (h / Math.sqrt(2)) / 2;
                break;
            case 'solid':
                arrowWidth = h * 2;
                arrowHeight = h;
                break;
            case 'square':
                arrowWidth = h * 3;
                arrowHeight = h;
                break;
            case 'circular':
                arrowWidth = h * 3;
                arrowHeight = h;
                break;
            case 'rectangle':
                arrowWidth = h * 1.5;
                arrowHeight = h;
                break;
            case 'normal':
                arrowWidth = 0;
                arrowHeight = 0;
                break;
        }
        return {
            arrowWidth,
            arrowHeight,
        };
    }

    getOriginPoint(type, endPoint, originPoint, lastStyle) {
        let newOriginPoint;
        const { arrowWidth, arrowHeight } = this.getArrowSize(this.msg.arrowStyle);
        const { left, right } = this.msg.arrowEndpoint;
        // 三种方式 添加 删除 或者 切换箭头
        if (type == 'add') {
            newOriginPoint = (endPoint == 'left' ? {
                x: originPoint.x - arrowWidth,
                y: right ? originPoint.y : originPoint.x - arrowWidth,
            } : {
                x: originPoint.x,
                y: left ? originPoint.y : originPoint.y - arrowHeight,
            });
        }
        else if (type == 'del') {
            newOriginPoint = (endPoint == 'left' ? {
                x: originPoint.x + arrowWidth,
                y: right ? originPoint.y : originPoint.y + arrowHeight,
            } : {
                x: originPoint.x,
                y: left ? originPoint.y : originPoint.y + arrowHeight,
            });
        } else if (type == 'reset') {
            if (lastStyle) {
                const { arrowWidth: lastArrowWidth, arrowHeight: lastArrowHeight } = this.getArrowSize(lastStyle);
                newOriginPoint = (left ? {
                    x: originPoint.x - arrowWidth + lastArrowWidth,
                    y: originPoint.y - arrowHeight + lastArrowHeight,
                } : {
                    x: originPoint.x,
                    y: right ? originPoint.y - arrowHeight + lastArrowHeight : originPoint.y,
                });
            }
        }
        return newOriginPoint;
    }

    setEndPoint(type, endPoint, lastStyle = '') {
        const { center } = this.coords;
        // 获取线段左顶点相对中心的坐标
        const toCenter = {
            x: this.left - center.x,
            y: this.top - center.y,
        };
        const radian = -this.angle * Math.PI / 180;
        const matrix = [Math.cos(radian), Math.sin(radian), -Math.sin(radian), Math.cos(radian)];
        // 通过旋转矩阵算出旋转前的顶点坐标
        const originPoint = {
            x: matrix[0] * toCenter.x + matrix[2] * toCenter.y + center.x,
            y: matrix[1] * toCenter.x + matrix[3] * toCenter.y + center.y,
        };
        // 获取旋转前的箭头左顶点坐标
        const newOriginPoint = this.getOriginPoint(type, endPoint, originPoint, lastStyle);
        // 获取相对中心点的坐标
        const newPointToCenter = {
            x: newOriginPoint.x - center.x,
            y: newOriginPoint.y - center.y,
        };
        // 通过逆运算推导出旋转后的顶点坐标
        const radian1 = this.angle * Math.PI / 180;
        const matrix1 = [Math.cos(radian1), Math.sin(radian1), -Math.sin(radian1), Math.cos(radian1)];
        const newPoint = {
            x: matrix1[0] * newPointToCenter.x + matrix1[2] * newPointToCenter.y + center.x,
            y: matrix1[1] * newPointToCenter.x + matrix1[3] * newPointToCenter.y + center.y,
        };
        this.left = newPoint.x;
        this.top = newPoint.y;
        this.setCoords();
    }
    // 获取实际线段的宽高
    getDimensions() {
        return {
            w: this.actualWidth,
            h: this.actualHeight,
        };
    }
    // 获取除去箭头的线段的宽高
    getLineDimensions() {
        return {
            w: this.width,
            h: this.strokeWidth,
        };
    }

    setCoords() {
        this.getActualSize();
        this.coords = this.calculateCoords();
    }
    // 计算真实宽高
    getActualSize() {
        if (!this.msg) return;
        const { left, right } = this.msg.arrowEndpoint;
        const { h, w } = this.getLineDimensions();
        let arrowWidth = 0;
        let arrowHeight = 0;
        switch (this.msg.arrowStyle) {
            case 'arrow':
                arrowWidth = Math.sqrt(2 * h * h) / 2 + 2 * h;
                arrowHeight = 2 * h + h / Math.sqrt(2);
                break;
            case 'solid':
                arrowWidth = 2 * h;
                arrowHeight = 2 * h;
                break;
            case 'square':
                arrowWidth = 3 * h;
                arrowHeight = 2 * h;
                break;
            case 'circular':
                arrowWidth = 3 * h;
                arrowHeight = 2 * h;
                break;
            case 'rectangle':
                arrowWidth = 1.5 * h;
                arrowHeight = 2 * h;
                break;
        }
        if (right && left) {
            this.actualWidth = w + arrowWidth * 2;
            this.actualHeight = h + arrowHeight;
        } else if (!(right || left)) {
            this.actualWidth = w;
            this.actualHeight = h;
        } else {
            this.actualWidth = w + arrowWidth;
            this.actualHeight = h + arrowHeight;
        };
    }
    getFlip() {
        let flipStr = '';
        if (this.flipX) {
            flipStr += `matrix(-1,0,0,1,${this.actualWidth},0)`;
        }
        if (this.flipY) {
            flipStr += ` matrix(1,0,0,-1,0,${this.actualHeight})`;
        }
        return flipStr;
    }
    toSvg(isAllInfo) {
        if (!this.visible) {
            return '';
        }
        const shadowStr = this.getShadow();
        const _shadowId = `shadow_${this.objectId}`;
        const flipStr = this.getFlip();
        const gStyle = isAllInfo ? `transform="translate(${this.left} ${this.top}) rotate(${this.angle}) scale(${this.scaleX} ${this.scaleY}) ${flipStr}" opacity="${this.opacity}"` : `transform="${flipStr}"`;
        const { h, w } = this.getLineDimensions();
        const { left, right } = this.msg.arrowEndpoint;
        let arrowRightStyle;
        let arrowLeftStyle;
        let x1 = 0;
        let y1 = h / 2;
        let x2 = w;
        let y2 = h / 2;
        let fill;
        if (this.msg.arrowStyle !== 'normal' && this.stroke !== 'transparent') {
            this.stroke = Ktu.color.rgbToHex(this.stroke);
        }
        switch (this.msg.arrowStyle) {
            case 'arrow':
                if (left) {
                    x1 += Math.sqrt(2 * h * h) / 2 + 2 * h;
                    y1 += h + (h / Math.sqrt(2)) / 2;
                    x2 += Math.sqrt(2 * h * h) / 2 + 2 * h;
                    y2 += h + (h / Math.sqrt(2)) / 2;
                } else if (right) {
                    y1 += h + (h / Math.sqrt(2)) / 2;
                    y2 += h + (h / Math.sqrt(2)) / 2;
                }
                arrowRightStyle = right
                    ? `
                    <polyline points="${x2 + 0.5 * h} ,${y2 - 1.5 * h} ${x2 + 2 * h} ,${y2} ${x2 + 0.5 * h},${y2 + 1.5 * h}" style="${this.getSvgStrokeStyle()};fill:none;stroke-dasharray:none;"/>
                    <line style="${this.getSvgStrokeStyle()};stroke-dasharray:none;" x1="${x2 - 1 / this.scaleX}" y1="${y2}" x2="${x2 + h * 2 - 1 / this.scaleX}" y2="${y2}"></line>
                    ` : '';
                arrowLeftStyle = left
                    ? `
                    <polyline points="${x1 - 0.5 * h} ,${y1 - 1.5 * h} ${x1 - 2 * h} ,${y1} ${x1 - 0.5 * h},${y1 + 1.5 * h}" style="${this.getSvgStrokeStyle()};fill:none;stroke-dasharray:none;"/>
                    <line style="${this.getSvgStrokeStyle()};stroke-dasharray:none;" x1="${x1 - h * 2 + 1 / this.scaleX}" y1="${y1}" x2="${x1 + 1 / this.scaleX}" y2="${y1}"></line>
                    ` : '';
                break;
            case 'solid':
                if (left) {
                    x1 += h * 2;
                    y1 += h;
                    x2 += h * 2;
                    y2 += h;
                } else if (right) {
                    y1 += h;
                    y2 += h;
                }
                fill = this.stroke == 'transparent' ? 'none' : (this.stroke || 'none');
                arrowRightStyle = right
                    ? `<path d="M${x2 + h * 0.5} ${y2 - h * 1.5}
                                    L${x2 + h * 2} ${y2}
                                    L${x2 + h * 0.5} ${y2 + h * 1.5} Z"
                                    style="fill:${fill};stroke-dasharray:none;"/>
                    <line style="${this.getSvgStrokeStyle()};stroke-dasharray:none;" x1="${x2 - 1 / this.scaleX}" y1="${y2}" x2="${x2 + h / 2 + 1 / this.scaleX}" y2="${y2}"></line>
                                    ` : '';
                arrowLeftStyle = left
                    ? `<path d="M${x1 - h * 0.5} ${y1 - 1.5 * h}
                                    L${x1 - h * 2} ${y1}
                                    L${x1 - h * 0.5} ${y1 + h * 1.5} Z"
                                    style="fill:${fill};stroke-dasharray:none;"/>
                    <line style="${this.getSvgStrokeStyle()};stroke-dasharray:none;" x1="${x1 - h / 2 - 1 / this.scaleX}" y1="${y1}" x2="${x1 + 1 / this.scaleX}" y2="${y1}"></line>
                                    ` : '';
                break;
            case 'square':
                if (left) {
                    x1 += h * 3;
                    y1 += h;
                    x2 += h * 3;
                    y2 += h;
                } else if (right) {
                    y1 += h;
                    y2 += h;
                }
                fill = this.stroke == 'transparent' ? 'none' : (this.stroke || 'none');
                arrowRightStyle = right
                    ? `
                    <path d="M${x2 + h * 1.5} ${y2 - 1.5 * h}
                                    L${x2 + h * 3} ${y2}
                                    L${x2 + h * 1.5} ${y2 + 1.5 * h}
                                    L${x2} ${y2} Z"
                                    style="fill:${fill};stroke-dasharray:none;"/>
                    <line style="${this.getSvgStrokeStyle()};stroke-dasharray:none;" x1="${x2 - 1 / this.scaleX}" y1="${y2}" x2="${x2 + h * 1.5 - 1 / this.scaleX}" y2="${y2}"></line>
                    ` : '';
                arrowLeftStyle = left
                    ? `
                    <path d="M${x1 - 1.5 * h} ${y1 - 1.5 * h}
                                    L${x1 - h * 3} ${y2}
                                    L${x1 - 1.5 * h} ${y1 + 1.5 * h}
                                    L${x1} ${y2} Z"
                                    style="fill:${fill};stroke-dasharray:none;"/>
                    <line style="${this.getSvgStrokeStyle()};stroke-dasharray:none;" x1="${x1 - h * 1.5 + 1 / this.scaleX}" y1="${y1}" x2="${x1 + 1 / this.scaleX}" y2="${y1}"></line>
                    ` : '';
                break;
            case 'circular':
                if (left) {
                    x1 += h * 3;
                    y1 += h;
                    x2 += h * 3;
                    y2 += h;
                } else if (right) {
                    y1 += h;
                    y2 += h;
                }
                fill = this.stroke == 'transparent' ? 'none' : (this.stroke || 'none');
                arrowRightStyle = right
                    ? `<circle cx="${x2 + h * 1.5}" cy="${y2}" r="${h * 1.5}" style="fill:${fill};stroke-dasharray:none;"/>
                    <line style="${this.getSvgStrokeStyle()};stroke-dasharray:none;" x1="${x2 - 1 / this.scaleX}" y1="${y2}" x2="${x2 + h * 1.5 - 1 / this.scaleX}" y2="${y2}"></line>
                    ` : '';
                arrowLeftStyle = left
                    ? `<circle cx="${x1 - h * 1.5}" cy="${y1}" r="${h * 1.5}" style="fill:${fill};stroke-dasharray:none;"/>
                    <line style="${this.getSvgStrokeStyle()};stroke-dasharray:none;" x1="${x1 - h * 1.5 + 1 / this.scaleX}" y1="${y1}" x2="${x1 + 1 / this.scaleX}" y2="${y1}"></line>
                    ` : '';
                break;
            case 'rectangle':
                if (left) {
                    x1 += h * 1.5;
                    y1 += h;
                    x2 += h * 1.5;
                    y2 += h;
                } else if (right) {
                    y1 += h;
                    y2 += h;
                }
                arrowRightStyle = right
                    ? `
                        <line style="${this.getSvgStrokeStyle()};stroke-dasharray:none;" x1="${x2 + h}" y1="${y2 - 1.5 * h}" x2="${x2 + h}" y2="${y2 + 1.5 * h}"></line>
                        <line style="${this.getSvgStrokeStyle()};stroke-dasharray:none;" x1="${x2 - 1 / this.scaleX}" y1="${y2}" x2="${x2 + h / 2 + 1 / this.scaleX}" y2="${y2}"></line>
                        `
                    : '';
                arrowLeftStyle = left
                    ? `
                        <line style="${this.getSvgStrokeStyle()};stroke-dasharray:none;" x1="${x1 - h}" y1="${y1 - 1.5 * h}" x2="${x1 - h}" y2="${y1 + 1.5 * h}"></line>
                        <line style="${this.getSvgStrokeStyle()};stroke-dasharray:none;" x1="${x1 - h - 1 / this.scaleX}" y1="${y1}" x2="${x1 + 1 / this.scaleX}" y2="${y1}"></line>
                        `
                    : '';
                break;
        };
        const { h: actualHeight, w: actualWidth } = this.getDimensions();
        const shadowRect = this.isOpenShadow ? `<rect x="${x1 * this.scaleX}" y="${y1 * this.scaleY}" width="${x2 * this.scaleX}" height="${y2 * this.scaleY} style="${this.getSvgStrokeStyle()};opacity:0;"` : '';
        const g = `${shadowStr}
                <g   ${gStyle}>
                    <g ${this.isOpenShadow ? `style="filter:url(#${_shadowId})"` : ''}>
                        ${arrowRightStyle}
                        ${arrowLeftStyle}
                        <line style="${this.getSvgStrokeStyle()}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"></line>
                        ${shadowRect}
                    </g>
                </g>`;
        let svgHtml = '';
        if (!isAllInfo) {
            svgHtml = `
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                    version="1.1" width="${actualWidth * this.scaleX}" height="${actualHeight * this.scaleY}"
                    viewBox="0 0 ${actualWidth} ${actualHeight}" xml:space="preserve" style="overflow: visible;">
                    ${g}
                </svg>
            `;
        } else {
            svgHtml = g;
        }
        return svgHtml;
    }
    toObject() {
        const elementObj = TheElement.toObject(this);
        return _.assignIn(elementObj, {
            fill: this.fill,
            msg: JSON.stringify(this.msg),
        });
    }
}
