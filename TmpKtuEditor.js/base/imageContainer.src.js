Ktu.imageContainer = {};
Ktu.imageContainer.fileId = 'AIwBCAAQURgAIJ2D-OEFKOaY1CAw6Ac46Ac';
Ktu.imageContainer.src = 'http://1.s140i.faiusr.com/81/AIwBCAAQURgAIJ2D-OEFKOaY1CAw6Ac46Ac.svg';
class ImageContainer extends TheElement {
    constructor(data) {
        super(data);
        this.type = 'imageContainer';
        this.controls = {
            tl: true,
            tr: true,
            br: true,
            bl: true,
            rotate: true,
        };
        /* Object.defineProperty(this, 'dirty', {
           get: () => {
           return dirty;
           },
           set: (value) => {
           if (value) {
           this.objects.forEach((object) => {
           object.dirty = true;
           });
           }
           dirty = false;
           }
           }); */
        const objects = typeof data.objects == 'string' ? JSON.parse(data.objects) : data.objects;
        this.objects = data.objects != undefined ? objects : [];
        this.objects.forEach((object, index) => {
            (!!object && !!object.image && typeof object.image == 'string') && (object.image = JSON.parse(object.image));
            this.objects[index] = Ktu.element.processElement(object);
        });
        if (!this.objects.length) {
            this.noInit = true;
        }
        this.src = data.src;
        this.canCollect = true;
        this.fileId = data.fileId;
        this.paths = [];
        this.pathGradients = [];
        this.loadedPromise = this.loadSvg();
        this.changedColors = data.changedColors || {};
        this.changedColors = typeof this.changedColors === 'string' ? JSON.parse(this.changedColors) : this.changedColors;
        this.originalColors = data.originalColors || {};
        this.originalColors = typeof this.originalColors === 'string' ? JSON.parse(this.originalColors) : this.originalColors;
        this.hoverTip = '双击换图或拖入图片';
    }
    loadSvg() {
        return new Promise((resolve, reject) => {
            const self = this;
            axios.get(this.src).then(res => {
                const doc = new DOMParser().parseFromString(res.data, 'image/svg+xml');
                const _svg = doc.getElementsByTagName('svg')[0];
                const reAllowedSVGTagNames = /^(path|circle|polygon|polyline|ellipse|rect|line|image|text)$/i;
                const reNotAllowedAncestors = /^(?:pattern|defs|symbol|metadata|clipPath|mask)$/i;
                // 初始化
                const width = _svg.width.baseVal.value ? _svg.width.baseVal.value : _svg.viewBox.baseVal.width;
                this.width = this.width === undefined ? width : this.width;
                const height = _svg.height.baseVal.value ? _svg.height.baseVal.value : _svg.viewBox.baseVal.height;
                this.height = this.height === undefined ? height : this.height;
                // 有viewbox的本身就可能会有缩放
                this.viewBoxWidth = _svg.viewBox.baseVal.width || _svg.width.baseVal.value;
                this.viewBoxHeight = _svg.viewBox.baseVal.height || _svg.height.baseVal.value;
                const svgNodes = _svg.querySelectorAll(':not(svg)');
                // 获取显示效果渐变
                const getGradientDefs = function (doc) {
                    const tagArray = ['linearGradient', 'radialGradient'];
                    const gradientDefs = {};
                    const elist = [].filter.call(svgNodes, e => tagArray.indexOf(e.nodeName.replace('svg:', '')) > -1);
                    elist.forEach(e => {
                        let xlink = e.getAttribute('xlink:href');
                        if (!!xlink) {
                            xlink = `#${self.objectId}_${xlink.substring(1)}`;
                            e.setAttribute('xlink:href', xlink);
                        }
                        // 将id之类的修改，避免重复
                        const id = `${self.objectId}_${e.getAttribute('id')}`;
                        e.setAttribute('id', id);
                        gradientDefs[id] = e;
                    });
                    return gradientDefs;
                };
                this.pathGradients = getGradientDefs(doc);
                // 获取cssStyleSheet 并设置到节点中
                const setStyleSheet = () => {
                    const style = [].filter.call(svgNodes, e => e.nodeName == 'style');
                    const allRules = {};
                    if (!!style) {
                        style.forEach(e => {
                            let tmpRule = [];
                            if (!!e.sheet) {
                                [].forEach.call(e.sheet.cssRules, e => {
                                    tmpRule.push(e.cssText);
                                });
                            } else {
                                tmpRule = e.textContent.split('}');
                                tmpRule = tmpRule.map(e => `${e}}`);
                                tmpRule.splice(tmpRule.length - 1, 1);
                            }
                            tmpRule.forEach(e => {
                                let styleContents = e;
                                let rules;
                                if (styleContents) {
                                    styleContents = styleContents.replace(/\/\*[\s\S]*?\*\//g, '');
                                    rules = styleContents.match(/[^{]*\{[\s\S]*?\}/g);
                                    rules = rules.map(rule => rule.trim());
                                    rules.forEach(rule => {
                                        const match = rule.match(/([\s\S]*?)\s*\{([^}]*)\}/);
                                        const ruleObj = {};
                                        const declaration = match[2].trim();
                                        const propertyValuePairs = declaration.replace(/;$/, '').split(/\s*;\s*/);
                                        for (let i = 0, len = propertyValuePairs.length; i < len; i++) {
                                            const pair = propertyValuePairs[i].split(/\s*:\s*/);
                                            const property = pair[0];
                                            const value = pair[1];
                                            ruleObj[property] = value;
                                        }
                                        rule = match[1];
                                        rule.split(',').forEach(_rule => {
                                            _rule = _rule.replace(/^svg/i, '').trim();
                                            if (_rule === '') {
                                                return;
                                            }
                                            if (allRules[_rule]) {
                                                _.assignIn(allRules[_rule], ruleObj);
                                            } else {
                                                allRules[_rule] = _.clone(ruleObj);
                                            }
                                        });
                                    });
                                }
                            });
                        });
                    }
                    const setCss = function (path) {
                        path.classList.forEach(c => {
                            if (!!allRules[`.${c}`]) {
                                const thisRule = allRules[`.${c}`];
                                const ruleKeys = Object.keys(thisRule);
                                ruleKeys.forEach(r => {
                                    // 当行内没有的时候才去设置
                                    if (!path.style[r]) {
                                        path.style[r] = thisRule[r];
                                    }
                                });
                            }
                        });
                    };
                    svgNodes.forEach(e => {
                        if (!!e.classList.length) {
                            setCss(e);
                        }
                    });
                };
                setStyleSheet();
                // 获取显示的节点
                const hasAncestorWithNodeName = function (element, nodeName) {
                    while (element && (element = element.parentNode)) {
                        if (element.nodeName && nodeName.test(element.nodeName.replace('svg:', '')) && !element.getAttribute('instantiated_by_use')) {
                            return true;
                        }
                    }
                    return false;
                };
                this.paths = [].filter.call(svgNodes, e => reAllowedSVGTagNames.test(e.nodeName.replace('svg:', '')) && !hasAncestorWithNodeName(e, reNotAllowedAncestors));
                // 获取继承的属性和style
                const getAttrAndCss = () => {
                    const colorChange = {};
                    this.paths.forEach((e, i) => {
                        const param = {};
                        let element = e;
                        let iscontinue = false;
                        do {
                            if (element.nodeName == 'svg') {
                                break;
                            }
                            const fillStyle = element.style.fill || element.getAttribute('fill');
                            const strokeStyle = element.style.stroke || element.getAttribute('stroke');
                            const opacity = element.style.opacity || element.getAttribute('opacity');
                            const { isolation } = element.style;
                            const { mixBlendMode } = element.style;
                            if (fillStyle != undefined && fillStyle != '' && param.fill == undefined) {
                                param.fill = fillStyle;
                            }
                            if (strokeStyle != undefined && strokeStyle != '' && param.stroke == undefined) {
                                param.stroke = strokeStyle;
                            }
                            if (opacity != undefined && opacity != '' && param.opacity == undefined) {
                                param.opacity = opacity;
                            }
                            if (mixBlendMode != '' && param.mixBlendMode == undefined) {
                                param.mixBlendMode = mixBlendMode;
                            }
                            if (isolation != '' && param.isolation == undefined) {
                                this.isolation = true;
                                param.isolation = 'isolate';
                            }
                            // 不对路再加
                        } while (element = element.parentNode);
                        // 添加图片
                        if (!!e.getAttribute('id') && e.getAttribute('id').indexOf('compoundImage') > -1) {
                            // 因为viewbox 和 width 有个缩放值，如果直接拿路径算宽高位置，是不准确的
                            const clipshapeInfo = this.getContainerDim(e, this.width / this.viewBoxWidth, this.height / this.viewBoxHeight);
                            e.setAttribute('fill', '');
                            e.setAttribute('stroke', '');
                            e.setAttribute('opacity', '');
                            clipshapeInfo.clipShape = e.outerHTML.replace(/style="(.*?)"/, '');
                            clipshapeInfo.containerId = e.getAttribute('id');
                            // 如果没有就创建
                            if (this.noInit) {
                                this.createImage(clipshapeInfo);
                            } else {
                                const idx = e.getAttribute('idx');
                                if (!!idx) {
                                    this.objects[idx].clipshapeInfo = clipshapeInfo;
                                    this.objects[idx].clipShape = clipshapeInfo.clipShape;
                                    this.objects[idx].controls = {};
                                    this.objects[idx].isInContainer = true;
                                    this.objects[idx].container = this;
                                    this.objects[idx].isSupportRadius = false;
                                    if (this.objects[idx].image.src.indexOf('.svg') > -1) {
                                        this.objects[idx].image.src = Ktu.imageContainer.src;
                                        this.objects[idx].image.fileId = Ktu.imageContainer.fileId;
                                    }
                                }
                            }
                            iscontinue = true;
                        }

                        const ruleKeys = Object.keys(param);
                        let color = '';
                        /* console.log(ruleKeys);
                           debugger; */
                        ruleKeys.forEach(r => {
                            // 将id之类的修改，避免重复
                            if (param[r].indexOf('url') >= 0) {
                                param[r] = param[r].replace(/#(\S+?)(["']?)/, (s, s1, s2) => `#${self.objectId}_${s1}${s2}`);
                                e.style[r] = param[r];
                            }
                            if (r == 'fill' && param[r].indexOf('url') < 0 && param[r] != 'none') {
                                color += param[r];
                            }
                            if (r == 'stroke' && param[r].indexOf('url') < 0 && param[r] != 'none') {
                                color += `||${param[r]}`;
                            }
                            // 当行内没有的时候才去设置
                            !e.style[r] && (e.style[r] = param[r]);
                        });
                        // 对于没有stroke 没有 fill的 给个黑色默认色
                        if (ruleKeys.length == 0) {
                            color = '#000';
                        }
                        if (!iscontinue) {
                            colorChange[i] = color;
                        } else {
                            colorChange[i] = 'none';
                        }
                    });
                    this.originalColors = _.cloneDeep(colorChange);
                    this.changedColors = JSON.stringify(this.changedColors) != '{}' ? this.changedColors : colorChange;
                };
                getAttrAndCss();
                this.hasLoaded = true;
                this.dirty = true;
                resolve();
            });
        });
    }
    getClipPath(clipId) {
        let clipPath = '';
        if (this.radius && this.radius.size) {
            let r = this.radius.size;
            r = Math.min(r, Math.floor(Math.min(this.width * this.scaleX, this.height * this.scaleY) / 2 + 1));
            // 起点
            const x = 0;
            const y = 0;
            const { width } = this;
            const { height } = this;
            const rx = r / this.scaleX;
            const ry = r / this.scaleY;
            const {
                lt,
                rt,
                rb,
                lb,
            } = this.radius;
            // 左上   右上    右下    左下
            const path = `M${x} ${y + (lt ? ry : 0)}${lt ? `a${rx} ${ry} 0 0 1 ${rx} ${-ry}` : ''}h${width - (lt ? rx : 0) - (rt ? rx : 0)}${rt ? `a${rx} ${ry} 0 0 1 ${rx} ${ry}` : ''}v${height - (rt ? ry : 0) - (rb ? ry : 0)}${rb ? `a${rx} ${ry} 0 0 1 ${-rx} ${ry}` : ''}h${(rb ? rx : 0) + (lb ? rx : 0) - width}${lb ? `a${rx} ${ry} 0 0 1 ${-rx} ${-ry}` : ''}z`;
            clipPath = `
            <defs>
                <clipPath id="clipPath_${this.clipId}">
                    <path d="${path}"></path>
                </clipPath>
            </defs>`;
        }
        return clipPath;
    }
    initCanvas() {
        let count = this.objects.length;
        return new Promise(resolve => {
            this.objects.forEach((item, i) => {
                if (item.type === 'cimage') {
                    item.loadedPromise.then(() => {
                        count--;
                        if (count == 0) {
                            this.drawCanvas().then(() => {
                                resolve(this);
                            });
                        }
                    });
                    /* if (item.base64) {
                       count--;
                       if(count == 0) {
                       this.drawCanvas().then(() => {
                       resolve( this );
                       });
                       }
                       } else {
                       item.loadSmallImg().then(() => {
                       count--;
                       if(count == 0) {
                       this.drawCanvas().then(() => {
                       resolve( this );
                       });
                       }
                       });
                       } */
                }
            });
        });
    }

    // 生成原图画质的base
    getBase64() {
        let count = this.objects.length;
        return new Promise((resolve, reject) => {
            this.objects.forEach((item, i) => {
                if (item.type === 'cimage') {
                    const path = item.image.originalSrc;
                    Ktu.utils.imagepathToBase64(path).then(base => {
                        item.base64 = base;
                        count--;
                        if (count == 0) {
                            resolve(this);
                        }
                    });
                }
            });
        });
    }

    toSvg(isAllInfo, useBasePath) {
        if (!this.visible) {
            return '';
        }
        let svgHtml = '';
        let g = '';
        const contentHtml = [];
        const gradientIds = Object.keys(this.pathGradients);
        let isShowStroke = true;
        this.paths.forEach((e, i) => {
            if (gradientIds.length != 0) {
                gradientIds.forEach(c => {
                    if (e.outerHTML.indexOf(c) > -1) {
                        contentHtml.push(this.pathGradients[c].outerHTML);
                    }
                });
            }
            const colors = this.changedColors[i];
            let fill; let stroke;
            if (!!colors) {
                const colorArr = colors.split('||');
                fill = colorArr[0];
                stroke = colorArr[1];
                if (!!fill) {
                    const fillColor = Ktu.element.getRgb('fill', fill).rgb;
                    const { opacity } = Ktu.element.getRgb('fill', fill);
                    e.style.fill = fillColor;
                    e.style.fillOpacity = opacity;
                }
                if (!!stroke) {
                    const strokeColor = Ktu.element.getRgb('stroke', stroke).rgb;
                    const { opacity } = Ktu.element.getRgb('stroke', stroke);
                    e.style.stroke = strokeColor;
                    e.style.strokeOpacity = opacity;
                    isShowStroke = false;
                }
            }
            if (!!e.getAttribute('id') && e.getAttribute('id').indexOf('compoundImage') > -1) {
                const idx = e.getAttribute('idx');
                if (!!idx) {
                    const imageStr = `<g data-type="containerImage" class="ktrq-image" data-subindex="${idx}">${this.objects[idx].toPath(useBasePath)}</g>`;
                    contentHtml.push(imageStr);
                }
            } else {
                contentHtml.push(e.outerHTML);
                if (e.tagName == 'line' && this.isOpenShadow) {
                    const dimensions = this.getDimensions();
                    contentHtml.push(`<rect x="0" y="${dimensions.h / 2}" width="${dimensions.w}" height="${dimensions.h}" style="${this.getSvgStrokeStyle()};opacity:0;"></rect>`);
                }
            }
        });
        const shadowStr = this.getShadow();
        const _shadowId = `shadow_${this.objectId}`;
        const strokeStr = (isShowStroke) ? this.getSvgStrokeStyle() : '';
        const flipStr = this.getFlip();
        const gStyle = isAllInfo ? `transform="translate(${this.left + (this.strokeWidth / 2) * this.scaleX} ${this.top + (this.strokeWidth / 2) * this.scaleY}) scale(${this.scaleX * this.width / this.viewBoxWidth} ${this.scaleY * this.height / this.viewBoxHeight}) rotate(${this.angle}) ${flipStr}" opacity="${this.opacity}" style="${strokeStr}"` : `style="${strokeStr}" transform="translate(${this.strokeWidth / 2} ${this.strokeWidth / 2}) ${flipStr}"`;
        // 圆角
        /* const clipId = `clipPath_${this.clipId}`;
        const clipPath = this.getClipPath(); */
        const isolation = this.isolation ? 'isolation:isolate' : '';
        /* 图片
           var imageStr = this.objects.reduce((prev, cur,currentIndex)=>{
           return `<g data-type="containerImage"  data-subindex="${currentIndex}">${cur.toPath(useBasePath)}</g>` + prev;
           }, ""); */

        g = `${shadowStr}
            <g  ${gStyle}>
                <g style="${this.isOpenShadow ? `filter:url(#${_shadowId});` : ''} ${isolation}">
                    ${contentHtml.join('')}
                </g>
            </g>`;
        svgHtml = g;
        if (!isAllInfo) {
            const dimensions = this.getDimensions();
            svgHtml = `
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                    version="1.1" width="${dimensions.w * this.scaleX}" height="${dimensions.h * this.scaleY}"
                    viewBox="0 0 ${this.viewBoxWidth + this.strokeWidth} ${this.viewBoxHeight + this.strokeWidth}" xml:space="preserve"  preserveAspectRatio="none" style="overflow: visible;">
                    ${g}
                </svg>`;
        }
        return svgHtml;
    }
    parsePath(path) {
        const commandLengths = {
            m: 2,
            l: 2,
            h: 1,
            v: 1,
            c: 6,
            s: 4,
            q: 4,
            t: 2,
            a: 7,
        };
        const repeatedCommands = {
            m: 'l',
            M: 'L',
        };
        path = path.match && path.match(/[mzlhvcsqta][^mzlhvcsqta]*/gi);
        if (!path) {
            return [];
        }
        const result = [];
        const coords = [];
        let currentPath;
        let parsed;
        const re = /([-+]?((\d+\.\d+)|((\d+)|(\.\d+)))(?:e[-+]?\d+)?)/ig;
        let match;
        let coordsStr;
        for (let i = 0, coordsParsed, len = path.length; i < len; i++) {
            currentPath = path[i];
            coordsStr = currentPath.slice(1).trim();
            coords.length = 0;
            while ((match = re.exec(coordsStr))) {
                coords.push(match[0]);
            }
            coordsParsed = [currentPath.charAt(0)];
            for (let j = 0, jlen = coords.length; j < jlen; j++) {
                parsed = parseFloat(coords[j]);
                if (!isNaN(parsed)) {
                    coordsParsed.push(parsed);
                }
            }
            let command = coordsParsed[0];
            const commandLength = commandLengths[command.toLowerCase()];
            const repeatedCommand = repeatedCommands[command] || command;
            if (coordsParsed.length - 1 > commandLength) {
                for (let k = 1, klen = coordsParsed.length; k < klen; k += commandLength) {
                    result.push([command].concat(coordsParsed.slice(k, k + commandLength)));
                    command = repeatedCommand;
                }
            } else {
                result.push(coordsParsed);
            }
        }
        return result;
    }
    getContainerDim(element, scaleX, scaleY) {
        const self = this;
        const dim = {
            pathDim() {
                const aX = [];
                const aY = [];
                let current;
                let previous = null;
                let subpathStartX = 0;
                let subpathStartY = 0;
                let x = 0;
                let y = 0;
                let controlX = 0;
                let controlY = 0;
                let tempX;
                let tempY;
                let bounds;
                const d = element.getAttribute('d');
                const path = self.parsePath(d);
                for (let i = 0, len = path.length; i < len; ++i) {
                    current = path[i];
                    switch (current[0]) {
                        case 'l':
                            x += current[1];
                            y += current[2];
                            bounds = [];
                            break;
                        case 'L':
                            x = current[1];
                            y = current[2];
                            bounds = [];
                            break;
                        case 'h':
                            x += current[1];
                            bounds = [];
                            break;
                        case 'H':
                            x = current[1];
                            bounds = [];
                            break;
                        case 'v':
                            y += current[1];
                            bounds = [];
                            break;
                        case 'V':
                            y = current[1];
                            bounds = [];
                            break;
                        case 'm':
                            x += current[1];
                            y += current[2];
                            subpathStartX = x;
                            subpathStartY = y;
                            bounds = [];
                            break;
                        case 'M':
                            x = current[1];
                            y = current[2];
                            subpathStartX = x;
                            subpathStartY = y;
                            bounds = [];
                            break;
                        case 'c':
                            tempX = x + current[5];
                            tempY = y + current[6];
                            controlX = x + current[3];
                            controlY = y + current[4];
                            bounds = Ktu.utils.getBoundsOfCurve(x, y, x + current[1],
                                y + current[2],
                                controlX,
                                controlY,
                                tempX, tempY);
                            x = tempX;
                            y = tempY;
                            break;
                        case 'C':
                            controlX = current[3];
                            controlY = current[4];
                            bounds = Ktu.utils.getBoundsOfCurve(x, y, current[1], current[2], controlX, controlY, current[5], current[6]);
                            x = current[5];
                            y = current[6];
                            break;
                        case 's':
                            // transform to absolute x,y
                            tempX = x + current[3];
                            tempY = y + current[4];
                            if (previous[0].match(/[CcSs]/) === null) {
                                /* If there is no previous command or if the previous command was not a C, c, S, or s,
                                   the control point is coincident with the current point */
                                controlX = x;
                                controlY = y;
                            } else {
                                // calculate reflection of previous control points
                                controlX = 2 * x - controlX;
                                controlY = 2 * y - controlY;
                            }
                            bounds = Ktu.utils.getBoundsOfCurve(x, y, controlX, controlY, x + current[1], y + current[2], tempX, tempY);
                            /* set control point to 2nd one of this command
                               "... the first control point is assumed to be
                               the reflection of the second control point on
                               the previous command relative to the current point." */
                            controlX = x + current[1];
                            controlY = y + current[2];
                            x = tempX;
                            y = tempY;
                            break;
                        case 'S':
                            tempX = current[3];
                            tempY = current[4];
                            if (previous[0].match(/[CcSs]/) === null) {
                                /* If there is no previous command or if the previous command was not a C, c, S, or s,
                                   the control point is coincident with the current point */
                                controlX = x;
                                controlY = y;
                            } else {
                                // calculate reflection of previous control points
                                controlX = 2 * x - controlX;
                                controlY = 2 * y - controlY;
                            }
                            bounds = Ktu.utils.getBoundsOfCurve(x, y, controlX, controlY, current[1], current[2], tempX, tempY);
                            x = tempX;
                            y = tempY;
                            /* set control point to 2nd one of this command
                               "... the first control point is assumed to be
                               the reflection of the second control point on
                               the previous command relative to the current point." */
                            controlX = current[1];
                            controlY = current[2];
                            break;
                        case 'q':
                            // transform to absolute x,y
                            tempX = x + current[3];
                            tempY = y + current[4];
                            controlX = x + current[1];
                            controlY = y + current[2];
                            bounds = Ktu.utils.getBoundsOfCurve(x, y, controlX, controlY, controlX, controlY, tempX, tempY);
                            x = tempX;
                            y = tempY;
                            break;
                        case 'Q':
                            controlX = current[1];
                            controlY = current[2];
                            bounds = Ktu.utils.getBoundsOfCurve(x, y, controlX, controlY, controlX, controlY, current[3], current[4]);
                            x = current[3];
                            y = current[4];
                            break;
                        case 't':
                            // transform to absolute x,y
                            tempX = x + current[1];
                            tempY = y + current[2];
                            if (previous[0].match(/[QqTt]/) === null) {
                                /* If there is no previous command or if the previous command was not a Q, q, T or t,
                                   assume the control point is coincident with the current point */
                                controlX = x;
                                controlY = y;
                            } else {
                                // calculate reflection of previous control point
                                controlX = 2 * x - controlX;
                                controlY = 2 * y - controlY;
                            }
                            bounds = Ktu.utils.getBoundsOfCurve(x, y, controlX, controlY, controlX, controlY, tempX, tempY);
                            x = tempX;
                            y = tempY;
                            break;
                        case 'T':
                            tempX = current[1];
                            tempY = current[2];
                            if (previous[0].match(/[QqTt]/) === null) {
                                /* If there is no previous command or if the previous command was not a Q, q, T or t,
                                   assume the control point is coincident with the current point */
                                controlX = x;
                                controlY = y;
                            } else {
                                // calculate reflection of previous control point
                                controlX = 2 * x - controlX;
                                controlY = 2 * y - controlY;
                            }
                            bounds = Ktu.utils.getBoundsOfCurve(x, y, controlX, controlY, controlX, controlY, tempX, tempY);
                            x = tempX;
                            y = tempY;
                            break;
                        case 'a':
                            // TODO: optimize this
                            bounds = Ktu.utils.getBoundsOfArc(x, y, current[1], current[2], current[3], current[4], current[5], current[6] + x, current[7] + y);
                            x += current[6];
                            y += current[7];
                            break;
                        case 'A':
                            // TODO: optimize this
                            bounds = Ktu.utils.getBoundsOfArc(x, y, current[1], current[2], current[3], current[4], current[5], current[6], current[7]);
                            x = current[6];
                            y = current[7];
                            break;
                        case 'z':
                        case 'Z':
                            x = subpathStartX;
                            y = subpathStartY;
                            break;
                    }
                    previous = current;
                    bounds.forEach(point => {
                        aX.push(point.x);
                        aY.push(point.y);
                    });
                    aX.push(x);
                    aY.push(y);
                }
                const minX = Math.min(...aX) || 0;
                const minY = Math.min(...aY) || 0;
                const maxX = Math.max(...aX) || 0;
                const maxY = Math.max(...aY) || 0;
                const deltaX = maxX - minX;
                const deltaY = maxY - minY;
                const o = {
                    left: minX * scaleX,
                    top: minY * scaleY,
                    w: deltaX * scaleX,
                    h: deltaY * scaleY,
                };
                return o;
            },
            rectDim() {
                return {
                    left: parseFloat(element.getAttribute('x')) * scaleX,
                    top: parseFloat(element.getAttribute('y')) * scaleY,
                    w: parseFloat(element.getAttribute('width')) * scaleX,
                    h: parseFloat(element.getAttribute('height')) * scaleY,
                };
            },
        };
        return !!dim[`${element.tagName}Dim`] && dim[`${element.tagName}Dim`]();
    }
    createImage(options) {
        let obj = {
            type: 'cimage',
            image: {
                left: 0,
                top: 0,
                scaleX: 1,
                scaleY: 1,
                fileId: Ktu.imageContainer.fileId,
                src: Ktu.imageContainer.src,
                width: 1000,
                height: 1000,
            },
            width: options.w,
            height: options.h,
            left: options.left,
            top: options.top,
            elementName: '图片',
        };
        /* var s = Math.max(options.w / obj.width, options.h / obj.height);
           obj.scaleX = options.w / obj.width;
           obj.scaleY = options.h / obj.height; */

        /* obj.shapeWidth = obj.width;
           obj.shapeHeight = obj.height; */

        /* obj.cropScaleX = (options.w / s) / obj.width;
           obj.cropScaleY = (options.h / s) / obj.height; */
        obj = new Cimage(obj);
        obj.controls = {};
        obj.setImageCenter(true);
        obj.isInContainer = true;
        obj.clipShape = options.clipShape;
        obj.clipshapeInfo = options;
        obj.containerId = options.containerId;
        obj.container = this;
        obj.isSupportRadius = false;
        this.objects.push(obj);
    }
    toObject() {
        const elementObj = TheElement.toObject(this);
        const _this = _.cloneDeep(this);
        /* var changedColors = {};
           _this.changedColors.forEach((c,i)=>{
           changedColors[i] = c;
           }) */
        return _.assignIn(elementObj, {
            src: _this.src,
            changedColors: _.cloneDeep(this.changedColors),
            originalColors: _.cloneDeep(this.originalColors),
            fileId: _this.fileId,
            path: _this.path,
            pathGradients: _this.pathGradients,
            radius: _.cloneDeep(this.radius),
            objects: this.objects.map(object => object.toObject()),
        });
    }
    changePic(info) {
        const imgInContainer = this.objects[0];
        imgInContainer.saveState();
        imgInContainer.image.fileId = info.resourceId || info.i;
        imgInContainer.image.width = info.width || info.w;
        imgInContainer.image.height = info.height || info.h;
        imgInContainer.image.scaleX = 1;
        imgInContainer.image.scaleY = 1;
        const src = info.filePath || info.p;
        delete imgInContainer.image.smallSrc;
        imgInContainer.setImageSource(src);
        imgInContainer.setImageCenter();
        imgInContainer.modifiedState();
        imgInContainer.autoCrop();
        imgInContainer.container.dirty = true;
    }
}
