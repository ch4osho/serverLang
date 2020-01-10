(function () {
    // 'use strict';

    // var Ktu = global.Ktu || (global.Ktu = { });

    if (Ktu.Color) {
        console.warn('Ktu.Color is already defined.');
        return;
    }

    /**
     * Color class
     * The purpose of {@link Ktu.Color} is to abstract and encapsulate common color operations;
     * {@link Ktu.Color} is a constructor and creates instances of {@link Ktu.Color} objects.
     *
     * @class Ktu.Color
     * @param {String} color optional in hex or rgb(a) or hsl format or from known color list
     * @return {Ktu.Color} thisArg
     * @tutorial {@link http://Ktujs.com/Ktu-intro-part-2/#colors}
     */
    function Color(color) {
        if (!color) {
            this.setSource([0, 0, 0, 1]);
        }
        else {
            this._tryParsingColor(color);
        }
    }

    Ktu.Color = Color;

    /** @lends Ktu.Color.prototype */
    Ktu.Color.prototype = {

        /**
         * @private
         * @param {String|Array} color Color value to parse
         */
        _tryParsingColor(color) {
            let source;

            if (color in Color.colorNameMap) {
                color = Color.colorNameMap[color];
            }

            if (color === 'transparent') {
                source = [255, 255, 255, 0];
            }

            if (!source) {
                source = Color.sourceFromHex(color);
            }
            if (!source) {
                source = Color.sourceFromRgb(color);
            }
            if (!source) {
                source = Color.sourceFromHsl(color);
            }
            if (!source) {
                // if color is not recognize let's make black as canvas does
                source = [0, 0, 0, 1];
            }
            if (source) {
                this.setSource(source);
            }
        },

        /**
       * Adapted from <a href="https://rawgithub.com/mjijackson/mjijackson.github.com/master/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript.html">https://github.com/mjijackson</a>
       * @private
       * @param {Number} r Red color value
       * @param {Number} g Green color value
       * @param {Number} b Blue color value
       * @return {Array} Hsl color
       */
        _rgbToHsl(r, g, b) {
            r /= 255; g /= 255; b /= 255;

            let h;
            let s;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);

            const l = (max + min) / 2;

            if (max === min) {
                // achromatic
                s = 0;
                h = s;
            }
            else {
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

            return [
                Math.round(h * 360),
                Math.round(s * 100),
                Math.round(l * 100),
            ];
        },

        /**
       * Returns source of this color (where source is an array representation; ex: [200, 200, 100, 1])
       * @return {Array}
       */
        getSource() {
            return this._source;
        },

        /**
       * Sets source of this color (where source is an array representation; ex: [200, 200, 100, 1])
       * @param {Array} source
       */
        setSource(source) {
            this._source = source;
        },

        /**
       * Returns color representation in RGB format
       * @return {String} ex: rgb(0-255,0-255,0-255)
       */
        toRgb() {
            const source = this.getSource();
            return `rgb(${source[0]},${source[1]},${source[2]})`;
        },

        /**
       * Returns color representation in RGBA format
       * @return {String} ex: rgba(0-255,0-255,0-255,0-1)
       */
        toRgba() {
            const source = this.getSource();
            return `rgba(${source[0]},${source[1]},${source[2]},${source[3]})`;
        },

        /**
       * Returns color representation in HSL format
       * @return {String} ex: hsl(0-360,0%-100%,0%-100%)
       */
        toHsl() {
            const source = this.getSource();
            const hsl = this._rgbToHsl(source[0], source[1], source[2]);

            return `hsl(${hsl[0]},${hsl[1]}%,${hsl[2]}%)`;
        },

        /**
       * Returns color representation in HSLA format
       * @return {String} ex: hsla(0-360,0%-100%,0%-100%,0-1)
       */
        toHsla() {
            const source = this.getSource();
            const hsl = this._rgbToHsl(source[0], source[1], source[2]);

            return `hsla(${hsl[0]},${hsl[1]}%,${hsl[2]}%,${source[3]})`;
        },

        /**
       * Returns color representation in HEX format
       * @return {String} ex: FF5555
       */
        toHex() {
            const source = this.getSource(); let r; let g; let b;

            r = source[0].toString(16);
            r = (r.length === 1) ? (`0${r}`) : r;

            g = source[1].toString(16);
            g = (g.length === 1) ? (`0${g}`) : g;

            b = source[2].toString(16);
            b = (b.length === 1) ? (`0${b}`) : b;

            return r.toUpperCase() + g.toUpperCase() + b.toUpperCase();
        },

        /**
       * Returns color representation in HEXA format
       * @return {String} ex: FF5555CC
       */
        toHexa() {
            const source = this.getSource(); let a;

            a = source[3] * 255;
            a = a.toString(16);
            a = (a.length === 1) ? (`0${a}`) : a;

            return this.toHex() + a.toUpperCase();
        },

        /**
       * Gets value of alpha channel for this color
       * @return {Number} 0-1
       */
        getAlpha() {
            return this.getSource()[3];
        },

        /**
       * Sets value of alpha channel for this color
       * @param {Number} alpha Alpha value 0-1
       * @return {Ktu.Color} thisArg
       */
        setAlpha(alpha) {
            const source = this.getSource();
            source[3] = alpha;
            this.setSource(source);
            return this;
        },

        /**
       * Transforms color to its grayscale representation
       * @return {Ktu.Color} thisArg
       */
        toGrayscale() {
            const source = this.getSource();
            const average = parseInt((source[0] * 0.3 + source[1] * 0.59 + source[2] * 0.11).toFixed(0), 10);
            const currentAlpha = source[3];
            this.setSource([average, average, average, currentAlpha]);
            return this;
        },

        /**
       * Transforms color to its black and white representation
       * @param {Number} threshold
       * @return {Ktu.Color} thisArg
       */
        toBlackWhite(threshold) {
            const source = this.getSource();
            let average = (source[0] * 0.3 + source[1] * 0.59 + source[2] * 0.11).toFixed(0);
            const currentAlpha = source[3];

            threshold = threshold || 127;

            average = (Number(average) < Number(threshold)) ? 0 : 255;
            this.setSource([average, average, average, currentAlpha]);
            return this;
        },

        /**
       * Overlays color with another color
       * @param {String|Ktu.Color} otherColor
       * @return {Ktu.Color} thisArg
       */
        overlayWith(otherColor) {
            if (!(otherColor instanceof Color)) {
                otherColor = new Color(otherColor);
            }

            const result = [];
            const alpha = this.getAlpha();
            const otherAlpha = 0.5;
            const source = this.getSource();
            const otherSource = otherColor.getSource();

            for (let i = 0; i < 3; i++) {
                result.push(Math.round((source[i] * (1 - otherAlpha)) + (otherSource[i] * otherAlpha)));
            }

            result[3] = alpha;
            this.setSource(result);
            return this;
        },
    };

    /**
     * Regex matching color in RGB or RGBA formats (ex: rgb(0, 0, 0), rgba(255, 100, 10, 0.5), rgba( 255 , 100 , 10 , 0.5 ), rgb(1,1,1), rgba(100%, 60%, 10%, 0.5))
     * @static
     * @field
     * @memberOf Ktu.Color
     */
    // eslint-disable-next-line max-len
    Ktu.Color.reRGBa = /^rgba?\(\s*(\d{1,3}(?:\.\d+)?%?)\s*,\s*(\d{1,3}(?:\.\d+)?%?)\s*,\s*(\d{1,3}(?:\.\d+)?%?)\s*(?:\s*,\s*((?:\d*\.?\d+)?)\s*)?\)$/;

    /**
     * Regex matching color in HSL or HSLA formats (ex: hsl(200, 80%, 10%), hsla(300, 50%, 80%, 0.5), hsla( 300 , 50% , 80% , 0.5 ))
     * @static
     * @field
     * @memberOf Ktu.Color
     */
    Ktu.Color.reHSLa = /^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3}%)\s*,\s*(\d{1,3}%)\s*(?:\s*,\s*(\d+(?:\.\d+)?)\s*)?\)$/;

    /**
     * Regex matching color in HEX format (ex: #FF5544CC, #FF5555, 010155, aff)
     * @static
     * @field
     * @memberOf Ktu.Color
     */
    Ktu.Color.reHex = /^#?([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})$/i;

    /**
     * Map of the 17 basic color names with HEX code
     * @static
     * @field
     * @memberOf Ktu.Color
     * @see: http://www.w3.org/TR/CSS2/syndata.html#color-units
     */
    Ktu.Color.colorNameMap = {
        aqua: '#00FFFF',
        black: '#000000',
        blue: '#0000FF',
        fuchsia: '#FF00FF',
        gray: '#808080',
        grey: '#808080',
        green: '#008000',
        lime: '#00FF00',
        maroon: '#800000',
        navy: '#000080',
        olive: '#808000',
        orange: '#FFA500',
        purple: '#800080',
        red: '#FF0000',
        silver: '#C0C0C0',
        teal: '#008080',
        white: '#FFFFFF',
        yellow: '#FFFF00',
    };

    /**
     * @private
     * @param {Number} p
     * @param {Number} q
     * @param {Number} t
     * @return {Number}
     */
    function hue2rgb(p, q, t) {
        if (t < 0) {
            t += 1;
        }
        if (t > 1) {
            t -= 1;
        }
        if (t < 1 / 6) {
            return p + (q - p) * 6 * t;
        }
        if (t < 1 / 2) {
            return q;
        }
        if (t < 2 / 3) {
            return p + (q - p) * (2 / 3 - t) * 6;
        }
        return p;
    }

    /**
     * Returns new color object, when given a color in RGB format
     * @memberOf Ktu.Color
     * @param {String} color Color value ex: rgb(0-255,0-255,0-255)
     * @return {Ktu.Color}
     */
    Ktu.Color.fromRgb = function (color) {
        return Color.fromSource(Color.sourceFromRgb(color));
    };

    /**
     * Returns array representation (ex: [100, 100, 200, 1]) of a color that's in RGB or RGBA format
     * @memberOf Ktu.Color
     * @param {String} color Color value ex: rgb(0-255,0-255,0-255), rgb(0%-100%,0%-100%,0%-100%)
     * @return {Array} source
     */
    Ktu.Color.sourceFromRgb = function (color) {
        const match = color.match(Color.reRGBa);
        if (match) {
            const r = parseInt(match[1], 10) / (/%$/.test(match[1]) ? 100 : 1) * (/%$/.test(match[1]) ? 255 : 1);
            const g = parseInt(match[2], 10) / (/%$/.test(match[2]) ? 100 : 1) * (/%$/.test(match[2]) ? 255 : 1);
            const b = parseInt(match[3], 10) / (/%$/.test(match[3]) ? 100 : 1) * (/%$/.test(match[3]) ? 255 : 1);

            return [
                parseInt(r, 10),
                parseInt(g, 10),
                parseInt(b, 10),
                match[4] ? parseFloat(match[4]) : 1,
            ];
        }
    };

    /**
     * Returns new color object, when given a color in RGBA format
     * @static
     * @function
     * @memberOf Ktu.Color
     * @param {String} color
     * @return {Ktu.Color}
     */
    Ktu.Color.fromRgba = Color.fromRgb;

    /**
     * Returns new color object, when given a color in HSL format
     * @param {String} color Color value ex: hsl(0-260,0%-100%,0%-100%)
     * @memberOf Ktu.Color
     * @return {Ktu.Color}
     */
    Ktu.Color.fromHsl = function (color) {
        return Color.fromSource(Color.sourceFromHsl(color));
    };

    /**
     * Returns array representation (ex: [100, 100, 200, 1]) of a color that's in HSL or HSLA format.
     * Adapted from <a href="https://rawgithub.com/mjijackson/mjijackson.github.com/master/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript.html">https://github.com/mjijackson</a>
     * @memberOf Ktu.Color
     * @param {String} color Color value ex: hsl(0-360,0%-100%,0%-100%) or hsla(0-360,0%-100%,0%-100%, 0-1)
     * @return {Array} source
     * @see http://http://www.w3.org/TR/css3-color/#hsl-color
     */
    Ktu.Color.sourceFromHsl = function (color) {
        const match = color.match(Color.reHSLa);
        if (!match) {
            return;
        }

        const h = (((parseFloat(match[1]) % 360) + 360) % 360) / 360;
        const s = parseFloat(match[2]) / (/%$/.test(match[2]) ? 100 : 1);
        const l = parseFloat(match[3]) / (/%$/.test(match[3]) ? 100 : 1);
        let r; let g; let b;

        if (s === 0) {
            b = l;
            g = b;
            r = g;
        }
        else {
            const q = l <= 0.5 ? l * (s + 1) : l + s - l * s;
            const p = l * 2 - q;

            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return [
            Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255),
            match[4] ? parseFloat(match[4]) : 1,
        ];
    };

    /**
     * Returns new color object, when given a color in HSLA format
     * @static
     * @function
     * @memberOf Ktu.Color
     * @param {String} color
     * @return {Ktu.Color}
     */
    Ktu.Color.fromHsla = Color.fromHsl;

    /**
     * Returns new color object, when given a color in HEX format
     * @static
     * @memberOf Ktu.Color
     * @param {String} color Color value ex: FF5555
     * @return {Ktu.Color}
     */
    Ktu.Color.fromHex = function (color) {
        return Color.fromSource(Color.sourceFromHex(color));
    };

    /**
     * Returns array representation (ex: [100, 100, 200, 1]) of a color that's in HEX format
     * @static
     * @memberOf Ktu.Color
     * @param {String} color ex: FF5555 or FF5544CC (RGBa)
     * @return {Array} source
     */
    Ktu.Color.sourceFromHex = function (color) {
        if (color.match(Color.reHex)) {
            const value = color.slice(color.indexOf('#') + 1);
            const isShortNotation = (value.length === 3 || value.length === 4);
            const isRGBa = (value.length === 8 || value.length === 4);
            const aValueCharAt = isShortNotation ? (value.charAt(3) + value.charAt(3)) : value.substring(6, 8);
            const r = isShortNotation ? (value.charAt(0) + value.charAt(0)) : value.substring(0, 2);
            const g = isShortNotation ? (value.charAt(1) + value.charAt(1)) : value.substring(2, 4);
            const b = isShortNotation ? (value.charAt(2) + value.charAt(2)) : value.substring(4, 6);
            const a = isRGBa ?  aValueCharAt : 'FF';

            return [
                parseInt(r, 16),
                parseInt(g, 16),
                parseInt(b, 16),
                parseFloat((parseInt(a, 16) / 255).toFixed(2)),
            ];
        }
    };

    /**
     * Returns new color object, when given color in array representation (ex: [200, 100, 100, 0.5])
     * @static
     * @memberOf Ktu.Color
     * @param {Array} source
     * @return {Ktu.Color}
     */
    Ktu.Color.fromSource = function (source) {
        const oColor = new Color();
        oColor.setSource(source);
        return oColor;
    };
}());

// 普通的提取主题色方法，暂时不适用这个方法获取
(function () {
    const formatColor = function (n) {
        return ['rgb(', n, ')'].join('');
    };

    const formatPalette = function (n) {
        return n.map(n => formatColor(n.name));
    };

    const precision = 5;
    const paletteSize = 2;
    const RGBaster = {};
    const exclude = ['rgb(0,0,0)', 'rgb(255,255,255)'];

    RGBaster.colors = function (canvas) {
        const ctx = canvas.getContext('2d');
        const { width } = canvas;
        const { height } = canvas;

        const imageData = ctx.getImageData(0, 0, width, height);

        const imageBuff = imageData.data;

        const buffLength = imageBuff.length;

        const themeColor = {
            dominant: {
                name: '',
                count: 0,
            },
            palette: [...new Array(paletteSize)].map(Boolean)
                .map(() => ({
                    name: '0,0,0',
                    count: 0,
                })),
        };

        const colorParam = {}; let color = ''; const colorUnit = [];

        const somePletteFn = count => {
            themeColor.palette.some(img => (count > img.count ? (img.name = color,
            img.count = count,
            !0) : void 0));
        };

        for (let l = 0 ; l < buffLength;) {
            colorUnit[0] = imageBuff[l];
            colorUnit[1] = imageBuff[l + 1];
            colorUnit[2] = imageBuff[l + 2];

            color = colorUnit.join(',');

            colorParam[color] = color in colorParam ? colorParam[color] + 1 : 1;

            if (-1 === exclude.indexOf(formatColor(color))) {
                const count = colorParam[color];

                if (count > themeColor.dominant.count) {
                    themeColor.dominant.name = color;
                    themeColor.dominant.count = count;
                } else {
                    somePletteFn(count);
                }
            }

            l += 4 * precision;
        }

        const paletteColor = formatPalette(themeColor.palette);
        const colors = {
            dominant: formatColor(themeColor.dominant.name),
            secondary: paletteColor[0],
            palette: paletteColor,
        };

        return colors;
    };

    Ktu.RGBaster = RGBaster;
}());

// 八叉树提取主体颜色
/* (function () {
    const OctreeNode = function () {
        this.isLeaf = false;
        this.pixelCount = 0;
        this.red = 0;
        this.green = 0;
        this.blue = 0;
        this.children = [null, null, null, null, null, null, null, null];
        this.next = null;
    };

    let root = null;
    let leafNum = 0;
    let colorMap = null;
    let reducible = null;

    function createNode(index, level) {
        const node = new OctreeNode();
        if (level === 7) {
            node.isLeaf = true;
            leafNum++;
        } else {
            // 将其丢到第 level 层的 reducible 链表中
            node.next = reducible[level];
            reducible[level] = node;
        }

        return node;
    }

    function addColor(node, color, level) {
        if (node.isLeaf) {
            node.pixelCount += 1;
            node.red += color.r;
            node.green += color.g;
            node.blue += color.b;
        }
        else {
            let str = '';
            let r = color.r.toString(2);
            let g = color.g.toString(2);
            let b = color.b.toString(2);
            while (r.length < 8)
                r = `0${r}`;
            while (g.length < 8)
                g = `0${g}`;
            while (b.length < 8)
                b = `0${b}`;

            str += r[level];
            str += g[level];
            str += b[level];

            const index = parseInt(str, 2);

            if (null === node.children[index]) {
                node.children[index] = createNode(index, level + 1);
            }

            if (undefined === node.children[index]) {
                console.log(index, level, color.r.toString(2));
            }

            addColor(node.children[index], color, level + 1);
        }
    }

    function reduceTree() {
        // 找到最深层次的并且有可合并节点的链表
        let level = 6;
        while (null == reducible[level]) {
            level -= 1;
        }

        // 取出链表头并将其从链表中移除
        const node = reducible[level];
        reducible[level] = node.next;

        // 合并子节点
        let r = 0;
        let g = 0;
        let b = 0;
        let count = 0;
        for (let i = 0; i < 8; i++) {
            if (null === node.children[i]) continue;
            r += node.children[i].red;
            g += node.children[i].green;
            b += node.children[i].blue;
            count += node.children[i].pixelCount;
            leafNum--;
        }

        // 赋值
        node.isLeaf = true;
        node.red = r;
        node.green = g;
        node.blue = b;
        node.pixelCount = count;
        leafNum++;
    }

    function buidOctree(imageData, maxColors) {
        const total = imageData.length / 4;
        for (let i = 0; i < total; i++) {
            // 添加颜色
            addColor(root, {
                r: imageData[i * 4],
                g: imageData[i * 4 + 1],
                b: imageData[i * 4 + 2],
            }, 0);

            // 合并叶子节点
            while (leafNum > maxColors)
                reduceTree();
        }
    }

    function colorsStats(node, object) {
        if (node.isLeaf) {
            const r = parseInt(node.red / node.pixelCount, 10);
            const g = parseInt(node.green / node.pixelCount, 10);
            const b = parseInt(node.blue / node.pixelCount, 10);

            const color = `${r},${g},${b}`;
            if (object[color]) object[color] += node.pixelCount;
            else object[color] = node.pixelCount;
            return;
        }

        for (let i = 0; i < 8; i++) {
            if (null !== node.children[i]) {
                colorsStats(node.children[i], object);
            }
        }
    }

    const themeColor = function (canvas, ctx) {
        ctx = ctx || canvas.getContext('2d');
        let width = 0;
        let height = 0;
        let imageData = null;

        width = canvas.width;
        height = canvas.height;

        imageData = ctx.getImageData(0, 0, width, height).data;

        root = new OctreeNode();
        colorMap = {};
        reducible = {};
        leafNum = 0;

        // 第二个参数不能小于8，否则会在合并节点时进入死循环，原因是不足8个节点时，无法删除节点，即最少保留8个节点
        buidOctree(imageData, 8);

        colorsStats(root, colorMap);

        const arr = [];
        const colorArr = [];
        Object.keys(colorMap).forEach(key => {
            colorArr.push(key);
            arr.push({ key: colorMap[key] });
        });
        colorArr.sort((a, b) => colorMap[b] - colorMap[a]);
        colorArr.forEach((item, index) => {
            colorArr[index] = item.split(',');
        });

        arr.sort((a, b) => b.key - a.key);

        const topFive = arr.slice(0, 5);
        const total = topFive.reduce((acc, cur) => ({
            key: acc.key + cur.key,
        }));
        const weight = topFive.map(item => Math.round((item.key / total.key) * 100));

        return { colorArr: colorArr.slice(0, 5), weight };
    };

    Ktu.themeColor = themeColor;
}()); */

