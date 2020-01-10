class PathGroup extends TheElement {
    constructor(data) {
        super(data);
        this.src = data.src;
        this.fileId = data.fileId;
        this.changedColors = data.changedColors || {};
        this.changedColors = typeof this.changedColors === 'string' ? JSON.parse(this.changedColors) : this.changedColors;
        this.originalColors = data.originalColors || {};
        this.originalColors = typeof this.originalColors === 'string' ? JSON.parse(this.originalColors) : this.originalColors;
        this.isClipMode = false;
        this.hasLoaded = false;
        this.paths = [];
        this.pathGradients = [];
        this.cssStyle = [];
        // this.hasAlphaCorner = data.hasAlphaCorner;
        this.hasAlphaCorner = false;
        this.radius = data.radius || {
            size: 0,
            rt: true,
            rb: true,
            lb: true,
            lt: true,
        };
        this.isSupportRadius = !this.hasAlphaCorner;
        // this.loadSvg();
        this.loadedPromise = this.loadSvg();
        this.clipId = Ktu.element.clipId;
        this.hoverTip = '双击换图';
        // 来源分类
        this.category = data.category != undefined ? data.category : null;
        this.image = data.image;
        if (this.image == undefined) {
            this.image = {
                src: this.src,
                originalSrc: this.src,
                left: 0,
                top: 0,
                scaleX: 1,
                scaleY: 1,
            };
        }
        this.cropScaleX = data.cropScaleX || 1;
        this.cropScaleY = data.cropScaleY || 1;
        // this.filters = new Filters(!data.filters ? {} : typeof data.filters === 'string' ? JSON.parse(data.filters) : data.filters);
    }
    loadSvg() {
        return new Promise((resolve, reject) => {
            const self = this;
            axios.get(this.src).then(res => {
                // 把svg中的中文转换一下，不然生成图片时可能会出现问题
                let svgRes = res.data;
                let chineseArray = svgRes.match(/[\u4e00-\u9fa5]+/g);
                const tmpSet = new Set(chineseArray);
                chineseArray = [...tmpSet];
                chineseArray.forEach((e, i) => {
                    const changeName = `fkktChange${i}`;
                    svgRes = svgRes.replace(new RegExp(e, 'g'), changeName);
                });

                const doc = new DOMParser().parseFromString(svgRes, 'image/svg+xml');
                const _svg = doc.getElementsByTagName('svg')[0];

                const reAllowedSVGTagNames = /^(path|circle|polygon|polyline|ellipse|rect|line|image|text)$/i;
                const reNotAllowedAncestors = /^(?:pattern|defs|symbol|metadata|clipPath|mask)$/i;
                // 初始化
                const width = _svg.width.baseVal.value ? _svg.width.baseVal.value : _svg.viewBox.baseVal.width;
                this.width = this.width === undefined ? width : this.width;
                const height = _svg.height.baseVal.value ? _svg.height.baseVal.value : _svg.viewBox.baseVal.height;
                this.height = this.height === undefined ? height : this.height;

                this.shapeWidth = this.shapeWidth === undefined ? Math.max(1, this.width * Math.abs(this.cropScaleX)) : this.shapeWidth;
                this.shapeHeight = this.shapeHeight === undefined ? Math.max(1, this.height * Math.abs(this.cropScaleY)) : this.shapeHeight;

                this.image.width = this.width;
                this.image.height = this.height;
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
                        do {
                            if (element.nodeName == 'svg') {
                                break;
                            }
                            const fillStyle = element.style.fill || element.getAttribute('fill');
                            const strokeStyle = element.style.stroke || element.getAttribute('stroke');
                            const opacity = element.style.opacity || element.getAttribute('opacity');
                            const {
                                isolation,
                            } = element.style;
                            const {
                                mixBlendMode,
                            } = element.style;
                            const transform = element.getAttribute('transform');
                            const transformStyle = element.style.transform;
                            const {
                                display,
                            } = element.style;
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
                            if (transform != undefined) {
                                if (param.transform == undefined) {
                                    param.transform = transform;
                                } else {
                                    param.transform = `${transform} ${param.transform}`;
                                }
                            }
                            if (transformStyle != '' && param.transformStyle == undefined) {
                                param.transformStyle = transformStyle;
                            }
                            if (display == 'none' && param.display == undefined) {
                                param.display = display;
                            }
                            // 不对路再加
                        } while (element = element.parentNode);
                        const ruleKeys = Object.keys(param);
                        let color = '';
                        ruleKeys.forEach(r => {
                            // 将id之类的修改，避免重复
                            if (param[r].indexOf('url') >= 0) {
                                param[r] = param[r].replace(/#(\S+?)(["']?)/, (s, s1, s2) => `#${self.objectId}_${s1}${s2}`);
                                // 只能先清掉，后面再改，直接再这里改，搜狗浏览器没反应
                                e.style[r] = '';
                            }
                            if (r == 'fill' && param[r].indexOf('url') < 0 && param[r] != 'none') {
                                color += param[r];
                            }
                            if (r == 'stroke' && param[r].indexOf('url') < 0 && param[r] != 'none') {
                                color += `||${param[r]}`;
                            }
                            if (r == 'transform') {
                                e.setAttribute('transform', param[r]);
                            } else {
                                // 当行内没有的时候才去设置
                                !e.style[r] && (e.style[r] = param[r]);
                            }
                        });
                        // 对于没有stroke 没有 fill的 给个黑色默认色
                        if (ruleKeys.length == 0) {
                            color = '#000';
                        }
                        colorChange[i] = color;
                    });
                    this.originalColors = _.cloneDeep(colorChange);
                    this.changedColors = JSON.stringify(this.changedColors) != '{}' ? this.changedColors : colorChange;
                    // 判断是否要显示描边的设置
                    return this.checkIsShowStroke();
                };
                const isShowStroke = getAttrAndCss();
                this.hasLoaded = true;
                this.dirty = true;
                this.setCoords();
                resolve(isShowStroke);
            });
        });
    }
    getFlip() {
        let flipStr = '';
        if (this.flipX) {
            flipStr += `matrix(-1,0,0,1,${this.viewBoxWidth},0)`;
        }
        if (this.flipY) {
            flipStr += `matrix(1,0,0,-1,0,${this.viewBoxHeight})`;
        }
        return flipStr;
    }
    // 刷新或生成元素canvas
    initCanvas() {
        return new Promise(resolve => {
            this.loadedPromise.then(() => {
                this.drawCanvas().then(() => {
                    resolve(this);
                });
            });
        });
    }
    getClipPath(clip) {
        let clipPath = '';
        let clipId = `clipPath_${this.clipId}`;
        if (!this.clipShape) {
            const x = -this.strokeWidth;
            const y = -this.strokeWidth;
            const width = this.shapeWidth * (this.viewBoxWidth / this.width) + this.strokeWidth * 2;
            const height = this.shapeHeight * (this.viewBoxHeight / this.height) + this.strokeWidth * 2;
            let path;
            let transform = '';
            if (this.radius && this.radius.size) {
                let r = this.radius.size;
                r = Math.min(r, Math.floor(Math.min(this.width * this.scaleX, this.height * this.scaleY) / 2 + 1));
                /* const rx = r / this.scaleX * (this.shapeWidth / (this.image.width * this.image.scaleX));
                   const ry = r / this.scaleY * (this.shapeHeight / (this.image.height * this.image.scaleY)); */
                const rx = r / this.scaleX * this.cropScaleX;
                const ry = r / this.scaleY * this.cropScaleY;
                const {
                    lt,
                    rt,
                    rb,
                    lb,
                } = this.radius;
                // 左上   右上    右下    左下
                path = `M${x} ${y + (lt ? ry : 0)}${lt ? `a${rx} ${ry} 0 0 1 ${rx} ${-ry}` : ''}h${width - (lt ? rx : 0) - (rt ? rx : 0)}${rt ? `a${rx} ${ry} 0 0 1 ${rx} ${ry}` : ''}v${height - (rt ? ry : 0) - (rb ? ry : 0)}${rb ? `a${rx} ${ry} 0 0 1 ${-rx} ${ry}` : ''}h${(rb ? rx : 0) + (lb ? rx : 0) - width}${lb ? `a${rx} ${ry} 0 0 1 ${-rx} ${-ry}` : ''}z`;
            } else {
                path = `M${x} ${y}h${width}v${height}h${-width}z`;
            }
            if (!!clip) {
                const scaleX = this.scaleX * this.width * Ktu.edit.scale / this.viewBoxWidth;
                const scaleY = this.scaleY * this.height * Ktu.edit.scale / this.viewBoxHeight;
                clipId = `${clipId}_clip`;

                transform = `scale(${scaleX},${scaleY})`;
            }
            clipPath = `
                <defs>
                    <clipPath id="${clipId}" style="transform:${transform}">
                        <path d="${path}"></path>
                    </clipPath>
                </defs>`;
        }
        return clipPath;
    }
    toSvg(isAllInfo) {
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
            let fill;
            let stroke;
            if (!!colors) {
                const colorArr = colors.split('||');
                fill = colorArr[0];
                stroke = colorArr[1];
                if (!!fill) {
                    const fillColor = Ktu.element.getRgb('fill', fill).rgb;
                    const {
                        opacity,
                    } = Ktu.element.getRgb('fill', fill);
                    e.style.fill = fillColor;
                    e.style.fillOpacity = opacity;
                    e.style.fillRule = 'nonzero';
                }
                if (!!stroke) {
                    const strokeColor = Ktu.element.getRgb('stroke', stroke).rgb;
                    const {
                        opacity,
                    } = Ktu.element.getRgb('stroke', stroke);
                    e.style.stroke = strokeColor;
                    e.style.strokeOpacity = opacity;
                    isShowStroke = false;
                }
            }
            contentHtml.push(e.outerHTML);
            if (e.tagName == 'line' && this.isOpenShadow) {
                const dimensions = this.getDimensions();
                contentHtml.push(`<rect x="0" y="${dimensions.h / 2}" width="${dimensions.w}" height="${dimensions.h}" style="${this.getSvgStrokeStyle()};opacity:0;"></rect>`);
            }
        });

        const shadowStr = this.getShadow();
        const _shadowId = `shadow_${this.objectId}`;
        const strokeStr = (isShowStroke) ? this.getSvgStrokeStyle() : '';
        const flipStr = this.getFlip();
        const gStyle = isAllInfo
            ? `transform="translate(${this.left} ${this.top}) rotate(${this.angle}) translate(${(this.strokeWidth / 2) * this.scaleX} ${(this.strokeWidth / 2) * this.scaleY}) scale(${this.scaleX * this.width / this.viewBoxWidth} ${this.scaleY * this.height / this.viewBoxHeight})  ${flipStr}" opacity="${this.opacity}" style="${strokeStr}"`
            : `style="${strokeStr}" transform="translate(${this.strokeWidth / 2} ${this.strokeWidth / 2}) ${flipStr}"`;
        // 圆角
        const clipId = `clipPath_${this.clipId}`;
        const clipPath = this.getClipPath();
        const isolation = this.isolation ? 'isolation:isolate' : '';
        // 计算shadow时用的是this.width 这里不填一个矩形，就有问题了
        const shadowRect = this.isOpenShadow ? `<rect x="0" y="0" width="${this.width}" height="${this.height}" fill="none" stroke="none"></rect>` : '';
        const {
            image,
        } = this;
        const imageLeft = this.flipX ? this.shapeWidth - image.left - image.width * image.scaleX : image.left;
        const imageTop = this.flipY ? this.shapeHeight - image.top - image.height * image.scaleY : image.top;
        g = `${shadowStr}
            <g  ${gStyle}>
                <g style="${this.isOpenShadow ? `filter:url(#${_shadowId});` : ''} ${isolation}">
                    ${shadowRect}
                    ${clipPath}
                    <g clip-path="url(#${clipId})">
                        <g transform ="translate(${imageLeft} ${imageTop}) scale(${image.scaleX} ${image.scaleY})">
                            ${contentHtml.join('')}
                        </g>
                    </g>
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
    toObject() {
        const elementObj = TheElement.toObject(this);

        /* let _this = _.cloneDeep(this);
           const image = _.cloneDeep(this.image);
           var changedColors = {}; */

        /* _this.changedColors.forEach((c,i)=>{
           changedColors[i] = c;
           }) */

        return _.assignIn(elementObj, {
            src: this.src,
            changedColors: _.cloneDeep(this.changedColors),
            originalColors: _.cloneDeep(this.originalColors),
            fileId: this.fileId,
            path: this.path,
            pathGradients: this.pathGradients,
            hasAlphaCorner: this.hasAlphaCorner,
            radius: _.cloneDeep(this.radius),
            category: this.category,
            /* image: image,
               cropScaleX: this.cropScaleX,
               cropScaleY: this.cropScaleY,
               shapeWidth: this.shapeWidth,
               shapeHeight: this.shapeHeight */
        });
    }
    onDoubleClick() {
        // if (!!this.group) {
        //     return;
        // }
        if (!this.isClipping) {
            if (!Ktu.store.state.data.historicalRecord.some((item, index) => {
                const recordId = item.imageData.i || item.imageData.resourceId;
                if (recordId === this.fileId) {
                    Ktu.store.state.data.historicalRecord[index].record = true;
                    Ktu.store.state.data.historicalRecordIndex = index;
                    return true;
                }
            })) {
                Ktu.store.state.data.historicalRecordIndex = null;
            }
            /* if (Ktu.store.state.data.historicalRecord.imageData && this.fileId) {
                const recordId = Ktu.store.state.data.historicalRecord.imageData.i || Ktu.store.state.data.historicalRecord.imageData.resourceId;
                if (recordId === this.fileId) {
                    Ktu.store.state.data.historicalRecord.record = true;
                }
            } */

            Ktu.vm.$store.commit('modal/imageSourceModalState', {
                isOpen: true,
            });
            Ktu.log('materialModal', 'doubleClick');
        }
    }
    enterClipMode() {
        this.saveState();
        /* if (this.isInContainer) {
           const position = this.containergetPositionToEditor();
           var toContainer = {}
           var container = this.container;
           toContainer.left = this.left;
           toContainer.top = this.top;
           toContainer.angle = 0;
           toContainer.scaleX = this.scaleX;
           toContainer.scaleY = this.scaleY;
           this.left = position.left;
           this.top = position.top;
           this.angle = container.angle;
           this.scaleX = this.scaleX * container.scaleX;
           this.scaleY = this.scaleY * container.scaleY;
           this.toContainer = toContainer;
           } */
        Ktu.imageClip.setClipObj(this);
    }
    exitClipMode(isSave) {
        Ktu.imageClip.exitClip(isSave);
        /* if (this.isInContainer) {
           this.left = this.toContainer.left;
           this.top = this.toContainer.top;
           this.angle = this.toContainer.angle;
           this.scaleX = this.toContainer.scaleX;
           this.scaleY = this.toContainer.scaleY;
           var container = this.container;
           this.container.dirty = true;
           } */
        if (!!isSave) {
            this.hasCrop = true;
            this.modifiedState();
        }
    }
    checkIsShowStroke() {
        let colorList = [];
        let isShowStroke = true;
        const colorKeys = Object.keys(this.changedColors);

        if (this.changedColors && colorKeys && colorKeys.length) {
            for (let index = 0; index < colorKeys.length; index++) {
                const colors = this.changedColors[colorKeys[index]];
                let fill;
                let stroke;
                if (!!colors) {
                    const colorArr = colors.split('||');
                    fill = colorArr[0];
                    stroke = colorArr[1];
                    if (!!fill && fill != 'none') {
                        const originFill = this.originalColors[colorKeys[index]].split('||')[0];
                        const isColorExist = colorList.some(color => (color.originFill === originFill && color.prop === 'fill' ? color.path.push(index) : false));
                        !isColorExist && colorList.push({
                            value: fill,
                            prop: 'fill',
                            path: [index],
                            originFill,
                        });
                    }
                    if (!!stroke && stroke != 'none') {
                        const originStroke = this.originalColors[colorKeys[index]].split('||')[0];
                        const isColorExist = colorList.some(color => (color.originStroke === originStroke && color.prop === 'stroke' ? color.path.push(index) : false));
                        !isColorExist && colorList.push({
                            value: stroke,
                            prop: 'stroke',
                            path: [index],
                            originStroke,
                        });
                        isShowStroke = false;
                    }
                }
            }
        }
        if (colorList.length > 10) {
            // 颜色超过10种时修改颜色和描边功能都隐藏，此时svg当做普通图片使用
            isShowStroke = false;
            colorList = [];
        }
        if (colorList.length && this.changedColors) {
            if (isShowStroke) {
                return true;
            }
        }
        return false;
    }
};
