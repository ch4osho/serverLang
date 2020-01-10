class Filters {
    constructor(filters) {
        this.type = filters.type || 'origin';
        this.intensity = filters.intensity || 0;
        this.allFilters = ['vignette', 'brightness', 'contrast', 'saturation', 'tint', 'blur', 'sharpen', 'xProcess'];
        this.allFilters.forEach(filterName => {
            if (filters[filterName]) {
                const className = eval(filterName.slice(0, 1).toUpperCase() + filterName.slice(1));
                this[filterName] = new className(filters[filterName], this.options);
            }
        });
    }
    getDefs(options) {
        const defsStr = this.allFilters.reduce((currentStr, filterName) => (this[filterName] ? `${currentStr}${this[filterName].getDefs(options)}` : currentStr), '');
        const filtersStr = this.allFilters.reduce((currentStr, filterName) => (this[filterName] ? `${currentStr}${this[filterName].getFilter(options)}` : currentStr), '');
        return filtersStr ? `
        <defs>
            ${defsStr}
            <filter id="filter_${options.filterId}" x="0" y="0" width="100%" height="100%">
                ${filtersStr}
            </filter>
        </defs>` : '';
    }
    toObject() {
        const filters = this.allFilters.reduce((currentObject, filterName) => {
            if (this[filterName]) {
                currentObject[filterName] = this[filterName].toObject();
            }
            return currentObject;
        }, {});
        filters.type = this.type;
        filters.intensity = this.intensity;
        return filters;
    }
}
class Filter {
    constructor(data) {
        this.value = data.value;
    }
    getDefs() {
        return '';
    }
    getFilter() {
        return '';
    }
    toObject() {
        return {
            value: this.value,
        };
    }
}
class Brightness extends Filter {
    getFilter() {
        /* return `
           <feComponentTransfer data-filter="brightness" color-interpolation-filters="sRGB">
           <feFuncR type="linear" slope="1" intercept="${this.value}"></feFuncR>
           <feFuncG type="linear" slope="1" intercept="${this.value}"></feFuncG>
           <feFuncB type="linear" slope="1" intercept="${this.value}"></feFuncB>
           </feComponentTransfer>`; */
        return `<feColorMatrix data-filter="brightness" color-interpolation-filters="sRGB" type="matrix" values="1 0 0 0 ${this.value} 0 1 0 0 ${this.value} 0 0 1 0 ${this.value} 0 0 0 1 0"></feColorMatrix>`;
    }
}
class Contrast extends Filter {
    getFilter() {
        const slope = 1.015 * (this.value + 1.0) / (1.0 * (1.015 - this.value));
        const intercept = -0.5 * slope + 0.5;
        /* return `
           <feComponentTransfer data-filter="contrast" color-interpolation-filters="sRGB">
           <feFuncR type="linear" slope="${slope}" intercept="${intercept}"></feFuncR>
           <feFuncG type="linear" slope="${slope}" intercept="${intercept}"></feFuncG>
           <feFuncB type="linear" slope="${slope}" intercept="${intercept}"></feFuncB>
           </feComponentTransfer>`; */
        return `<feColorMatrix data-filter="contrast" color-interpolation-filters="sRGB" type="matrix" values="${slope} 0 0 0 ${intercept} 0 ${slope} 0 0 ${intercept} 0 0 ${slope} 0 ${intercept} 0 0 0 1 0"></feColorMatrix>`;
    }
}
class Saturation extends Filter {
    getFilter() {
        return `<feColorMatrix data-filter="saturation" type="saturate" values="${this.value + 1}"></feColorMatrix>`;
    }
}
class Tint extends Filter {
    constructor(data) {
        super(data);
        this.alpha = data.alpha || 0.14;
        this.minValue = -100;
        this.maxValue = 100;
        this.tintList = [
            '#ee82ee',
            '#ff0000',
            '#ffa500',
            '#ffff00',
            '#008000',
            '#0000ff',
            '#4b0082',
            '#ee82ee',
        ];
        // 两百个颜色 
        this.allTints = this.getTints();
    }
    rgbToHex(r, g, b) {
        const hex = ((r << 16) | (g << 8) | b).toString(16);
        return `#${new Array(Math.abs(hex.length - 7)).join('0')}${hex}`;
    }
    hexToRgb(hex) {
        const rgb = [];
        for (let i = 1; i < 7; i += 2) {
            rgb.push(parseInt(`0x${hex.slice(i, i + 2)}`, 16));
        }
        return rgb;
    }
    gradient(startColor, endColor, step) {
        const sColor = this.hexToRgb(startColor);
        const eColor = this.hexToRgb(endColor);
        // 计算R\G\B每一步的差值
        const rStep = (eColor[0] - sColor[0]) / step;
        const gStep = (eColor[1] - sColor[1]) / step;
        const bStep = (eColor[2] - sColor[2]) / step;

        const gradientColorArr = [];
        for (let i = 0; i < step; i++) {
            // 计算每一步的hex值
            gradientColorArr.push(this.rgbToHex(parseInt(rStep * i + sColor[0], 10), parseInt(gStep * i + sColor[1], 10), parseInt(bStep * i + sColor[2], 10)));
        }
        return gradientColorArr;
    }
    getTints() {
        const totalNum = this.maxValue - this.minValue;
        const step = Math.ceil(totalNum / (this.tintList.length - 1));
        const offset = step * (this.tintList.length - 1) - totalNum;
        const sliceIndex = Math.floor(offset / 2);

        const allTint = this.tintList.reduce((currentList, tint, index, tintList) => (tintList[index + 1] ? currentList.concat(this.gradient(tint, tintList[index + 1], step)) : currentList), []);
        return allTint.slice(sliceIndex, sliceIndex + totalNum);
    }
    getRgba(hex, opacity) {
        if (/^rgba?/.test(hex)) return hex;
        hex.indexOf('#') > -1 && (hex = hex.slice(1));
        hex = parseInt((hex.length == 6 ? hex : hex.split('').map(value => value + value)
            .join('')), 16);
        const rgb = [hex >> 16, (hex & 0x00FF00) >> 8, hex & 0x0000FF];
        return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${opacity})`;
    }
    getColorByNum(value) {
        return this.allTints[value < 0 ? value + 100 : value + 100 - 1];
    }
    getFilter() {
        let tint = this.getColorByNum(this.value);
        let rgb = this.hexToRgb(tint);
        rgb = {
            r: rgb[0] / 255,
            g: rgb[1] / 255,
            b: rgb[2] / 255,
        };
        // const offset = 7 / 100 * 2;
        const offset = this.alpha;
        tint = [rgb.r * offset, rgb.g * offset, rgb.b * offset];
        /* return `
           <feComponentTransfer data-filter="tint" color-interpolation-filters="sRGB">
           <feFuncR type="linear" slope="0.86" intercept="${tint[0]}"></feFuncR>
           <feFuncG type="linear" slope="0.86" intercept="${tint[1]}"></feFuncG>
           <feFuncB type="linear" slope="0.86" intercept="${tint[2]}"></feFuncB>
           </feComponentTransfer>
           ` */
        return `<feColorMatrix data-filter="tint" color-interpolation-filters="sRGB" type="matrix" values="0.86 0 0 0 ${tint[0]} 0 0.86 0 0 ${tint[1]} 0 0 0.86 0 ${tint[2]} 0 0 0 1 0"></feColorMatrix>`;
    }
}
class Blur extends Filter {
    getFilter() {
        return `<feGaussianBlur data-filter="blur" stdDeviation="${this.value}"></feGaussianBlur>`;
    }
}
class Sharpen extends Filter {
    getFilter() {
        return ` <feConvolveMatrix data-filter="sharpen" order="3,3" kernelMatrix="0 ${this.value} 0 ${this.value} ${-this.value * 4 + 1} ${this.value} 0 ${this.value} 0"></feConvolveMatrix>`;
    }
}
class XProcess extends Filter {
    getTable(xProcess) {
        if (0 < xProcess) {
            const deal = value => parseFloat((value * xProcess / 100).toFixed(2));
            const red = [0, .2, 0, -.1, 0].map(deal);
            const green = [0, .1, 0, -.1, 0].map(deal);
            const blue = [.2, 0, .2].map(deal);
            return [
                [
                    [0, 0],
                    [.3, .3 - red[1]],
                    [.7, .7 - red[3]],
                    [1, 1],
                ],
                [
                    [0, 0],
                    [.25, .25 - green[1]],
                    [.75, .75 - green[3]],
                    [1, 1],
                ],
                [
                    [0, blue[0]],
                    [0 + 2 / 3 * .5, blue[0] + 2 / 3 * (.5 - blue[0])],
                    [1 + 2 / 3 * -.5, 1 - blue[2] + 2 / 3 * (.5 - (1 - blue[2]))],
                    [1, 1 - blue[2]],
                ],
            ];
        }
        const deal = value => parseFloat((value * xProcess / -100).toFixed(2));
        const red = [0, .2, .5, -.05].map(deal);
        const green = [0, -.15, 0, 0].map(deal);
        const blue = [0, -.01, 0, .3].map(deal);
        return [
            [
                [0, 0],
                [.3, .3 - red[1]],
                [.7, .7 - red[2]],
                [.95, .95 - red[3]],
            ],
            [
                [0, 0],
                [.25, .25 - green[1]],
                [.6, .6],
                [1, 1],
            ],
            [
                [0, 0],
                [.3, .3 - blue[1]],
                [.5, .5],
                [1, 1 - blue[3]],
            ],
        ];
    }
    getRange(coord1, coord2, coord3, coord4) {
        function getXY(times, arr) {
            const double = times * times;
            const offset = 1 - times;
            const offsets = offset * offset;
            return arr[0] * offsets * offset + 3 * arr[1] * offsets * times + 3 * arr[2] * offset * double + arr[3] * double * times;
        }
        const coords = [];
        for (let x, y, sum = 0; 1 > sum; sum += 5e-5) {
            x = getXY(sum, [coord1.x, coord2.x, coord3.x, coord4.x]);
            y = getXY(sum, [coord1.y, coord2.y, coord3.y, coord4.y]);
            coords.push({
                x,
                y,
            });
        }
        const result = [{
            x: coord1.x,
            y: coord1.y,
        }];
        let sum = .05;
        let coord = null;
        coords.forEach(crd => {
            if (coord && crd.x > sum) {
                result.push(coord);
                sum += .05;
            }
            coord = crd;
        });
        result.push({
            x: coord4.x,
            y: coord4.y,
        });
        return result;
    }
    getFilter() {
        const table = this.getTable(this.value);
        const result = table.reduce((result, map) => {
            const range = this.getRange({
                x: map[0][0],
                y: map[0][1],
            }, {
                x: map[1][0],
                y: map[1][1],
            }, {
                x: map[2][0],
                y: map[2][1],
            }, {
                x: map[3][0],
                y: map[3][1],
            }).map(coord => coord.y);
            result.push(range.join(','));
            return result;
        }, []);
        return `
        <feComponentTransfer data-filter="xProcess" color-interpolation-filters="sRGB">
            <feFuncR type="table" tableValues="${result[0]}"></feFuncR>
            <feFuncG type="table" tableValues="${result[1]}"></feFuncG>
            <feFuncB type="table" tableValues="0,${result[2]},1"></feFuncB>
        </feComponentTransfer>`;
    }
}
class Vignette extends Filter {
    getDefs(options) {
        const startOffset = 90 - this.value;
        return `
            <radialGradient id="stops_${options.filterId}" r="75%">
                <stop offset="${startOffset}%" style="stop-color: rgb(0, 0, 0);stop-opacity:0;" />
                <stop offset="100%" style="stop-color: rgb(0, 0, 0);stop-opacity:1;" />
            </radialGradient>
            <rect id="rect_${options.filterId}" x="${options.left || 0}" y="${options.top || 0}" width="${options.width}" height="${options.height}" fill="url(#stops_${options.filterId})" />`;
    }
    getFilter(options) {
        return `
        <feImage xlink:href="#rect_${options.filterId}" result="vignette"></feImage>
        <feComposite in="vignette" in2="SourceGraphic"></feComposite>`;
    }
}
