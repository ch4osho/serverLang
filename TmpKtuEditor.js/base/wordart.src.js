class Wordart extends Text {
    constructor(data) {
        super(data);
        this.type = 'wordart';
        this.style = typeof data.style === 'string' ? JSON.parse(data.style) : data.style;
        this.loadedPromise = Promise.all([this.loadPattern(), this.loadedPromise]);
    }
    initCanvas() {
        return new Promise(resolve => {
            Promise.all([this.loadFontBase64Promise, this.loadedPromise]).then(() => {
                this.drawCanvas().then(() => {
                    resolve(this);
                });
            });
        });
    }
    loadPattern() {
        // 生成base64用于截图
        this.patternBase64 = {};
        const imageMap = this.style.covers.reduce((currentObject, cover, index) => {
            if (cover.picture) {
                currentObject[index] = this.getPatternHref(cover.picture);
            }
            return currentObject;
        }, {});

        const loadPatternPromises = Object.keys(imageMap).reduce((currentArray, index) => {
            const promise = new Promise((resolve, reject) => {
                const src = imageMap[index];
                const image = new Image();
                image.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = image.width;
                    canvas.height = image.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(image, 0, 0);
                    this.patternBase64[index] = canvas.toDataURL();
                    resolve();
                };
                image.crossOrigin = 'anonymous';
                image.src = src;
            });
            currentArray.push(promise);
            return currentArray;
        }, []);
        return Promise.all(loadPatternPromises);
    }
    // 计算艺术字由于描边，偏移额外占的空间
    getOffsetDimensions() {
        if (!this.style) {
            return 0;
        }
        const position =  this.style.covers.reduce((offset, cover) => {
            const { strokeWidth = 0 } = cover;
            const left = cover.left > 0 ? cover.left + strokeWidth : strokeWidth;
            const right = cover.left < 0 ? Math.abs(cover.left) + strokeWidth : strokeWidth;
            const top = cover.top > 0 ? cover.top + strokeWidth : strokeWidth;
            const bottom = cover.bottom < 0 ? Math.abs(cover.bottom) + strokeWidth : strokeWidth;
            offset.left = left > offset.left ? left : offset.left;
            offset.right = right > offset.right ? right : offset.right;
            offset.top = top > offset.top ? top : offset.top;
            offset.bottom = bottom > offset.bottom ? bottom : offset.bottom;
            return offset;
        }, { left: 0, right: 0, top: 0, bottom: 0 });
        return {
            w: position.left + position.right,
            h: position.top + position.bottom,
            x: (position.left + position.right) / 2,
            y: (position.top + position.bottom) / 2,
            /* w: 0,
               h: 0,
               x: 0,
               y: 0, */
        };
    }
    getDimensions() {
        const offset = this.getOffsetDimensions();
        return {
            w: this.width + offset.w,
            h: this.height + offset.h,
        };
    }
    getSvgStrokeStyle(strokeObject) {
        // 字体加粗和描边用的都是stroke属性
        const strokeStyle = {};
        if (this.fontWeight === 'bold') {
            if (strokeObject.stroke && strokeObject.stroke.includes('cover')) {
                strokeStyle.stroke = `url(#${strokeObject.stroke})`;
            } else {
                const stroke = Ktu.element.getRgb('stroke', strokeObject.fill || strokeObject.stroke);
                strokeStyle.stroke = stroke.rgb;
                strokeStyle['stroke-opacity'] = stroke.opacity;
            }
            strokeStyle['stroke-width'] = this.fontSize * 0.032;
        }
        if (strokeObject && strokeObject.stroke && strokeObject.strokeWidth) {
            if (strokeObject.stroke && strokeObject.stroke.includes('cover')) {
                strokeStyle.stroke = `url(#${strokeObject.stroke})`;
            } else {
                const stroke = Ktu.element.getRgb('stroke', strokeObject.stroke);
                strokeStyle.stroke = stroke.rgb;
                strokeStyle['stroke-opacity'] = stroke.opacity;
            }
            strokeStyle['stroke-width'] = strokeObject.strokeWidth + (this.fontWeight === 'bold' ? strokeStyle['stroke-width'] : 0);
            strokeStyle['stroke-miterlimit'] = this.strokeMiterLimit;
            strokeStyle['stroke-linejoin'] = this.strokeLineJoin;
            strokeStyle['stroke-linecap'] = this.strokeLineCap;
            strokeStyle['stroke-dasharray'] = this.strokeDashArray;
        }
        return Object.keys(strokeStyle).reduce((str, prop) => `${str + prop}: ${strokeStyle[prop]};`, '');
    }
    getUnderlineSvg() {
        if (this.textDecoration !== 'underline') {
            return '';
        }
        const lineStr = this._textLines.reduce((currentStr, textLine, lineIndex) => {
            let str = currentStr;
            if (textLine[0]) {
                const underlineY = this.getLineY(lineIndex) + this.fontSize / 10;
                const start = {
                    x: textLine[0].x,
                    y: underlineY,
                };
                const end = {
                    x: textLine[textLine.length - 1].x + textLine[textLine.length - 1].width,
                    y: underlineY,
                };
                const line = `<line x1 = "${start.x}" y1 = "${start.y}" x2 = "${end.x}" y2 = "${end.y}"></line>`;
                str = currentStr + line;
            }
            return str;
        }, '');
        const strokeStr = Ktu.element.getRgb('stroke', this.style.themeColor).str;
        return `<g stroke-linecap="butt" style="${strokeStr}stroke-width: ${this.fontSize / 15};">
            ${lineStr}</g>`;
    }
    getCoverShadow(cover, coverShadowId) {
        if (!cover.blur) {
            return '';
        }
        const colorObject = Ktu.element.getRgb('fill', cover.color);
        const isSourceGraphic = cover.stroke || cover.fill;
        return `
        <defs>
            <filter id="${coverShadowId}" width="200%" height="200%">
                <feGaussianBlur stdDeviation="${cover.blur}" in="${isSourceGraphic ? 'sourceGraphic' : 'SourceAlpha'}" result="blur"></feGaussianBlur>
                ${isSourceGraphic
        ? ''
        : `<feFlood flood-color="${colorObject.rgb}" flood-opacity="${colorObject.opacity}"/>
                <feComposite in2="blur" operator="in" />`
}
            </filter>
        </defs>
        `;
    }
    getCoverGradient(cover, coverGradientId) {
        if (!Array.isArray(cover.fill)) {
            return '';
        }
        const directionMap = {
            horizontal: '',
            vertical: 'x1="0%" y1="0%" x2="0%" y2="100%"',
            diagonal: 'x1="0%" y1="0%" x2="100%" y2="100%"',
        };
        const direction = cover.direction ? cover.direction : 'horizontal';
        const directionStr = directionMap[direction];

        return `
        <defs>
            <linearGradient id="inner_${coverGradientId}" ${directionStr}>
                ${cover.fill.reduce((currentStr, color, index, arr) => {
        let offset = 0;
        let colorObject = null;
        // fill的元素为颜色字符串时，offset平分100%
        if (typeof color === 'string') {
            offset = 100 / (arr.length - 1) * index;
            colorObject = Ktu.element.getRgb('fill', color);
        } else {
            offset = color.offset;
            const specialColor = this.getColor('fill', index, 'fill');
            colorObject = Ktu.element.getRgb('fill', specialColor || color.color);
        }
        return `${currentStr}
                    <stop offset="${offset}%" stop-color="${colorObject.rgb}" stop-opacity="${colorObject.opacity}"></stop>
                    `;
    }, '')}
            </linearGradient>
            <pattern id="${coverGradientId}" x="0" y="0" width="${this.width}" height="${this.height}" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="${this.width}" height="${this.height}" fill="url(#inner_${coverGradientId})"/>
            </pattern>
        </defs>
        `;
    }
    getCoverPatternFilename(name) {
        const env = Ktu.isDev ? 'dev' : 'pro';
        return Ktu.config.textPicturePath[name][env];
    }
    getPatternHref(name) {
        const prefix = Ktu.initialData.fodderPath.match(/.*?\/.+?\//)[0];
        const fileName = this.getCoverPatternFilename(name);
        // 素材库中png文件夹为4，jpg为2
        const type = fileName.includes('.jpg') ? 2 : 4;
        return `${prefix + type}/${fileName}`;
    }
    getTintStr(color, tintId) {
        if (!color || color === 'transparent') {
            return '';
        }
        const getRgb = color => {
            if (/^rgba?/.test(color)) {
                const matchResult = color.match(/rgba?\(([0-9]{1,3}),\s?([0-9]{1,3}),\s?([0-9]{1,3}),\s?(\d{0,1}\.?\d*)/);
                return [matchResult[1], matchResult[2], matchResult[3], matchResult[4]];
            }
            color.indexOf('#') > -1 && (color = color.slice(1));
            color = parseInt((color.length == 6 ? color : color.split('').map(value => value + value)
                .join('')), 16);
            return [color >> 16, (color & 0x00FF00) >> 8, color & 0x0000FF];
        };
        let rgba = getRgb(color);
        rgba = {
            r: rgba[0] / 255,
            g: rgba[1] / 255,
            b: rgba[2] / 255,
            a: rgba[3] || 1,
        };
        const offset = 0.3;
        const tint = [rgba.r * offset, rgba.g * offset, rgba.b * offset, rgba.a];
        return `
        <defs>
            <filter id="${tintId}" x="0" y="0" width="100%" height="100%">
                <feColorMatrix data-filter="tint" color-interpolation-filters="sRGB" type="matrix" values="0.86 0 0 0 ${tint[0]} 0 0.86 0 0 ${tint[1]} 0 0 0.86 0 ${tint[2]} 0 0 0 ${tint[3]} 0"></feColorMatrix>
            </filter>
        </defs>`;
    }
    getCoverPattern(cover, coverPatternId, isScreenShot) {
        if (cover.picture) {
            return this.getCoverPicture(cover, coverPatternId, isScreenShot);
        } else if (cover.paths) {
            return this.getCoverPaths(cover, coverPatternId, isScreenShot);
        }
        return '';
    }
    getCoverPicture(cover, coverPatternId, isScreenShot) {
        const [picWidth, picHeight] = [cover.width / this.scaleX, cover.height / this.scaleY];
        const [textWidth, textHeight] = [this.width, this.height];
        /* if (picWidth / picHeight >= textWidth / textHeight) {
           const repeatNum = Math.ceil(textHeight / picHeight);
           height = textHeight / repeatNum;
           width = height / picHeight * picWidth;
           top = 0;
           left = -(width - textWidth) / 2;
           } else {
           const repeatNum = Math.ceil(textWidth / picWidth);
           width = textWidth / repeatNum;
           height = width / picWidth * picHeight;
           left = 0;
           top = -(height - textHeight) / 2;
           } */
        let imageWidth = picWidth;
        let imageHeight = picHeight;
        let left = 0;
        let top = 0;
        // 宽高有一个超过原图宽高时，按原图宽高居中平铺。
        if (picWidth < textWidth || picHeight < textHeight) {
            left = -(picWidth - textWidth) / 2;
            if (left > 0) {
                left = 0;
            }
            top = -(picHeight - textHeight) / 2;
            if (top > 0) {
                top = 0;
            }
            // 宽高均未超过原图宽高时，缩小原图居中显示
        } else {
            if (picWidth / picHeight >= textWidth / textHeight) {
                imageHeight = textHeight;
                imageWidth = textHeight / picHeight * picWidth;
                top = 0;
                left = -(imageWidth - textWidth) / 2;
            } else {
                imageWidth = textWidth;
                imageHeight = textWidth / picWidth * picHeight;
                left = 0;
                top = -(imageHeight - textHeight) / 2;
            }
        }
        // pattern宽高应尽可能小，提高性能
        let patternWidth = textWidth;
        let patternHeight = textHeight;
        if (textWidth > picWidth) {
            patternWidth = picWidth;
        }
        if (textHeight > picHeight) {
            patternHeight = picHeight;
        }
        const tintId = `tint_${coverPatternId}`;
        const tintStr = this.getTintStr(cover.tint, tintId);

        let index = -1;
        this.style.covers.some((cov, idx) => {
            if (cov.picture === cover.picture) {
                index = idx;
                return true;
            }
            return false;
        });
        const href = isScreenShot ? this.patternBase64[index] : this.getPatternHref(cover.picture);
        return `
        <defs>
            ${tintStr}
            <pattern id="${coverPatternId}" x="0" y="0" width="${patternWidth}" height="${patternHeight}" patternUnits="userSpaceOnUse">
                <image ${tintStr ? `filter="url(#${tintId})"` : ''} xlink:href="${href}" x="${left}" y="${top}" width="${imageWidth}" height="${imageHeight}" imageid="${this.getCoverPatternFilename(cover.picture).split('.')[0]}"/>
            </pattern>
        </defs>
        `;
    }
    getCoverPaths(cover, coverPatternId, isScreenShot) {
        return `
        <defs>
            <pattern id="${coverPatternId}" x="0" y="0" width="${cover.width}" height="${cover.height}" patternUnits="userSpaceOnUse">
                ${
    cover.paths.reduce((currentString, path, index) => {
        const fill = this.getColor('paths', index, 'fill') || path.fill;
        const stroke = this.getColor('paths', index, 'stroke') || path.stroke;
        const fillStr = Ktu.element.getRgb('fill', fill).str;
        let strokeStr = Ktu.element.getRgb('stroke', stroke).str;
        if (path.strokeWidth) {
            strokeStr += `stroke-width: ${path.strokeWidth};`;
        }
        const style = ` style="${fillStr + strokeStr}" `;
        return `${currentString}
                            ${path.path.replace(' ', style)}
                        `;
    }, '')
}
            </pattern>
        </defs>
        `;
    }
    HSLToRGB(hsl) {
        const {
            h,
            s,
            l,
        } = hsl;
        let r; let g; let b;
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
        let h; let s; const l = (max + min) / 2;
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
    getDarkColor(baseColor, index) {
        if (baseColor === 'transparent') {
            return 'transparent';
        }
        const hsl = this.RGBToHSL(this.HexToRGB(baseColor));
        /* const h = hsl.h - 0.02 * index;
           hsl.h = Math.max(0, h); */
        const l = hsl.l - 0.05 * index;
        hsl.l = Math.max(0, l);
        const rgb = this.HSLToRGB(hsl);
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`;
    }
    // 不同艺术字颜色变化的特殊处理
    getColor(propName, index, colorPropName) {
        // 颜色配置字典
        const colorMap = new Map([
            ['stroke5_covers_3', () => this.style.covers[1].stroke],
            ['solid1_paths_1', () => this.style.covers[0].paths[0].fill],
            [/solid2_covers_[2468]/, () => this.style.covers[0].fill],
            [/solid3_covers_[123]/, index => this.getDarkColor(this.style.covers[0].fill, index)],
            [/solid4_covers_[123]/, index => this.getDarkColor(this.style.covers[0].fill, index)],
            [/solid5_covers_[234]/, index => this.getDarkColor(this.style.covers[1].stroke, index)],
            ['cover1_covers_2', () => this.style.covers[1].stroke],
            ['gradient2_fill_0', () => this.style.covers[0].fill[0].color],
            ['gradient2_fill_1', () => this.style.covers[0].fill[1].color],
            ['dynamic2_covers_2', () => this.style.covers[0].fill],
            ['fashion_paths_1', () => this.style.covers[0].paths[0].fill],
            [/slice_fill_[13]/, index => this.style.covers[0].fill[index - 1].color],
            ['light_covers_1', () => {
                if (colorPropName !== 'fill') {
                    const rgb = this.HexToRGB(this.style.covers[0].stroke);
                    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`;
                }
            }],

        ]);
        const { name } = this.style;
        const keyName = `${name}_${propName}_${index}`;
        const key = [...colorMap.keys()].find(rule => rule === keyName || rule.test && rule.test(keyName));
        if (key) {
            return colorMap.get(key)(index);
        }
    }
    getCoverSvg(textData, isScreenShot) {
        const covers = _.cloneDeep(this.style.covers);
        covers.reverse();
        return covers.reduce((currentStr, cover, index) => {
            /* const color = cover.fill || cover.stroke || cover.color;
               const strokeWidth = cover.strokeWidth ? covers.slice(index).reduce((currentNum, cover) => {
               return currentNum + (cover.strokeWidth ? cover.strokeWidth * 2 : 0);
               }, 0) : 0; */
            const strokeWidth = cover.strokeWidth * 2;
            const coverShadowId = `shadow_cover_${index}_${this.objectId}`;
            const coverShadowStr = this.getCoverShadow(cover, coverShadowId);
            const coverGradientId = `gradient_cover_${index}_${this.objectId}`;
            const coverGradientStr = this.getCoverGradient(cover, coverGradientId);
            const coverPatternId = `pattern_cover_${index}_${this.objectId}`;
            const coverPatternStr = this.getCoverPattern(cover, coverPatternId, isScreenShot);
            const fill = this.getColor('covers', covers.length - 1 - index, 'fill') || cover.fill;
            const stroke = this.getColor('covers', covers.length - 1 - index, 'stroke') || cover.stroke;
            const fillStr = coverGradientStr || coverPatternStr ? `fill: url(#${coverGradientStr ? coverGradientId : coverPatternId})` : cover.fill ? Ktu.element.getRgb('fill', fill).str : cover.blur ? '' : 'fill: none;';
            const strokeObject = {
                strokeWidth,
                stroke: coverGradientStr ? coverGradientId : coverPatternStr ? coverPatternId : stroke,
                fill: cover.fill,
            };
            const offsetDimensions = this.getOffsetDimensions();
            return `${currentStr}
            ${coverShadowStr}
            ${coverGradientStr}
            ${coverPatternStr}
            <g ${index === 0 && this.isOpenShadow ? `style="filter:url(#${textData.shadowId})"` : ''}>
                ${coverShadowStr ? `<g filter="url(#${coverShadowId})">` : ''}
                <g font-size="${this.fontSize}"
                    style="font-family: ${textData.family};${fillStr};${this.getSvgStrokeStyle(strokeObject)}"
                    transform="translate(${cover.left ? cover.left : 0} ${cover.top ? cover.top : 0}) ${textData.flipStr} translate(${offsetDimensions.x} ${offsetDimensions.y})">
                    ${this.getTextLineSvg()}
                    ${this.getUnderlineSvg()}
                </g>
                ${coverShadowStr ? '</g>' : ''}
            </g>
            `;
        }, '');
    }
    /* getSvg(textData, isScreenShot) {
       const styleMap = new Map([
       ['cover', this.getCoverSvg],
       ]);
       const key = [...styleMap.keys()].find(rule => rule === this.style.type || rule.test && rule.test(this.style.type));
       return styleMap.get(key).call(this, textData, isScreenShot);
       } */
    toSvg(isAllInfo, isScreenShot) {
        if (!this.visible) {
            return '';
        }
        this.initTextLines(true);
        const dimensions = this.getDimensions();
        const shaodwStr = this.getShadow();
        const gStyle = isAllInfo ? `transform="translate(${this.left} ${this.top}) rotate(${this.angle}) scale(${this.scaleX} ${this.scaleY}) translate(${dimensions.w / 2} ${dimensions.h / 2}) skewX(${this.skewX}) skewY(${this.skewY}) translate(${-dimensions.w / 2} ${-dimensions.h / 2})" opacity="${this.opacity}"` : '';
        const shadowId = `shadow_${this.objectId}`;
        const flipStr = this.getFlip();
        const fontId = this.ftFamilyList[0].fontid;
        let family = (isAllInfo && !isScreenShot) || (!isScreenShot && Ktu.indexedDB.hasFont(fontId)) ? this.getFontName() : this.fontFamily;
        family += ', Source Han Sans CN Regular, Symbola';
        const textData = {
            shadowId,
            flipStr,
            family,
        };
        const svg = this.getCoverSvg(textData, isScreenShot);

        const g = `${shaodwStr}
                <g  ${gStyle}>
                    ${isScreenShot ? this.getFontStyle() : ''}
                    ${svg}
                </g>`;

        let svgHtml = '';
        if (!isAllInfo) {
            svgHtml = this.isEditing ? '' : `
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                    version="1.1" width="${dimensions.w * (isScreenShot ? this.scaleX : 1)}" height="${dimensions.h * (isScreenShot ? this.scaleY : 1)}"
                    viewBox="0 0 ${dimensions.w} ${dimensions.h}" xml:space="preserve" style="overflow: visible;">
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
            ftFamilListChg: this.ftFamilListChg,
            fontSize: this.fontSize,
            fontFamily: this.fontFamily,
            ftFamilyList: _.cloneDeep(this.ftFamilyList),
            text: this.text,
            lineHeight: this.lineHeight,
            charSpacing: this.charSpacing,
            textAlign: this.textAlign,
            textDecoration: this.textDecoration,
            fontStyle: this.fontStyle,
            fontWeight: this.fontWeight,
            style: JSON.stringify(this.style),
            patternBase64: this.group ? '' : this.patternBase64,
            fontBase64: this.group ? '' : this.fontBase64,
        });
    }
}
