class Text extends TheElement {
    constructor(data) {
        super(data);
        this.type = 'text';
        // this.strokeLineJoin = 'round';
        this.fileId = data.fileId;
        this.fill = data.fill || '#345';
        this.fontFamily = data.fontFamily;
        this.fontSize = data.fontSize || 72;
        this.fontStyle = data.fontStyle || 'normal';
        this.fontWeight = data.fontWeight || 'normal';
        this.ftFamilListChg = data.ftFamilListChg;
        this.ftFamilyList = data.ftFamilyList;
        // this.text = this.removeEmoji(data.text);
        this.text = data.text;
        this.textAlign = data.textAlign || 'center';
        this.textDecoration = data.textDecoration || '';
        this.charSpacing = data.charSpacing || 0;
        this.lineHeight = data.lineHeight === undefined ? 1 : data.lineHeight;
        this.controls = {
            tl: true,
            tr: true,
            br: true,
            bl: true,
            ml: true,
            mr: true,
            rotate: true,
        };
        this.elementName = data.elementName || '';

        this._fontSizeMult = Ktu.element._fontSizeMult;
        this._fontSizeFraction = Ktu.element._fontSizeFraction;
        this.height = this.height === undefined ? this.fontSize * this._fontSizeMult : this.height;
        this.isInTable = data.isInTable || false;
        this.table = data.table || null;

        // 是否需要重新计算文本元素大小
        this.hasChanged = false;
        // this._textLines = null;
        this.fontBase64 = data.fontBase64;
        this.loadedPromise = Promise.resolve(this.loadFont());
        this.loadFontBase64Promise = this.loadFontBase64(false, true);

        this.isEditing = false;
        this.editable = data.editable !== undefined ? data.editable : true;
        this.scaleProp = 'wh';
        // this.hoverTip = Ktu.store.state.is360Brower ? '双击编辑' : '双击或按F2编辑';
        this.hoverTip = '双击编辑';
        this.originScaleX = data.originScaleX || 1;
        this.textBg = data.textBg || 'transparent';
        !this.isInTable && this.adjustFontSize();
    }
    adjustFontSize() {
        setTimeout(() => {
            const defaultFontSize = 72;
            if (this.fontSize === defaultFontSize) {
                return;
            }
            const scaleX = this.fontSize * this.scaleX / defaultFontSize;
            this.fontSize = defaultFontSize;
            this.width = this.width * this.scaleX / scaleX;
            this.scaleX = scaleX;
            this.scaleY = scaleX;
            this.hasChanged = true;
            this.dirty = true;
        });
    }
    transformArrayBufferToBase64(buffer) {
        if (!buffer) {
            return;
        }
        const bytes = new Uint8Array(buffer);
        const binary = bytes.reduce((currentStr, byte) => `${currentStr}${String.fromCharCode(byte)}`, '');
        /* for (var len = bytes.byteLength, i = 0; i < len; i++) {
           binary += String.fromCharCode(bytes[i]);
           } */
        return `data:;base64,${window.btoa(binary)}`;
    }

    loadFontBase64(isLoadFont, isInit) {
        return new Promise((resolve, reject) => {
            if (!isInit && this.ftFamilyList && this.ftFamilyList[0] && this.ftFamilyList[0].tmp_fontface_path && this.text) {
                if (this.ftFamilyList[0].tmp_fontface_path.includes('.jsp')) {
                    const substring = _.uniq(this.text).join('');
                    axios
                        .post(this.ftFamilyList[0].tmp_fontface_path, {
                            substring: encodeURIComponent(JSON.stringify(substring)),
                        }, {
                            responseType: 'arraybuffer',
                        })
                        .then(response => {
                            if (response) {
                                this.fontBase64 = this.transformArrayBufferToBase64(response.data);

                                if (isLoadFont) {
                                    const fontFamily = this.ftFamilyList[0].fontfamily;
                                    const fontFace = new FontFace(fontFamily, response.data);
                                    fontFace.load().then(loadedFace => {
                                        document.fonts.add(loadedFace);
                                        this.ftFamilyList[0].hasLoaded = true;
                                        this.hasChanged = true;
                                        this.dirty = true;
                                        this.setCoords();
                                    });
                                }
                                resolve();
                            }
                        })
                        .catch(e => {
                            console.log(e);
                            reject();
                        });
                } else {
                    axios
                        .get(this.ftFamilyList[0].tmp_fontface_path, {
                            responseType: 'arraybuffer',
                        }).then(response => {
                            this.fontBase64 = this.transformArrayBufferToBase64(response.data);

                            if (isLoadFont) {
                                const fontFamily = this.ftFamilyList[0].fontfamily;
                                const fontFace = new FontFace(fontFamily, response.data);
                                fontFace.load().then(loadedFace => {
                                    document.fonts.add(loadedFace);
                                    this.ftFamilyList[0].hasLoaded = true;
                                    this.hasChanged = true;
                                    this.dirty = true;
                                    this.setCoords();
                                    // 确保表格初始化字体位置计算正确
                                    if (this.isInTable) {
                                        this.table.dirty = true;
                                    }
                                });
                            }
                            resolve();
                        })
                        .catch(() => {
                            reject();
                        });
                }
            } else {
                resolve();
            }
        });
    }

    loadFont() {
        if (this.ftFamilyList[0] && this.ftFamilyList[0].fontFaceId && this.ftFamilyList[0].hasLoaded) {
            return;
        }

        if (this.ftFamilyList[0]) {
            /* 字体管家字体下架，需要把它们装成思源常规
               const transformFontList = [35, 38, 39, 41, 42, 43, 44, 47, 48, 49, 50, 51]; */
            /* if(transformFontList.includes(this.ftFamilyList[0].fontid)){
               this.ftFamilyList[0].fontid = defaultFont;
               this.updateFont();
               setTimeout(() => {
               Ktu.save.changeSaveNum();
               });
               return;
               } */
            if (this.ftFamilyList[0].fontFaceId) {
                return new Promise((resolve, reject) => {
                    if (!Ktu.indexedDB.isOpened) {
                        // 数据库还没开启的话就要下载字体片段
                        this.loadFontBase64Promise = this.loadFontBase64(true);
                        Ktu.indexedDB.openPromise.then(() => {
                            this.loadCacheFont(resolve, reject);
                        }).catch(err => {
                            console.log(err);
                        });
                    } else {
                        this.loadFontBase64Promise = this.loadFontBase64();
                        this.loadCacheFont(resolve, reject);
                    }
                });
            } else if (this.isInTable) {
                if (!this.text) {
                    return;
                }
                const fontType = this.ftFamilyList[0].fonttype;
                const fontId = this.ftFamilyList[0].fontid;
                const fontUrl = `/ajax/font_h.jsp?cmd=getFontPath&type=${fontType}&id=${fontId}`;
                const fontFamily = `ktu_Font_TYPE_${fontType}_ID_${fontId}RAN_${parseInt(Date.now(), 10)}`;
                const substring = _.uniq(this.text).join('');
                return new Promise((resolve, reject) => {
                    axios
                        .post(fontUrl, {
                            substring: encodeURIComponent(JSON.stringify(substring)),
                            ktuId: Ktu.ktuId,
                        }).then(response => {
                            if (response.status == 200) {
                                this.ftFamilyList[0].fontFaceId = response.data.info.fileId;
                                this.ftFamilyList[0].tmp_fontface_path = response.data.info.path;
                                this.fontFamily = fontFamily;
                                resolve();
                            } else {
                                console.log('请求字体路径失败');
                                reject();
                            }
                        })
                        .catch(err => {
                            console.log(err);
                            reject();
                        });
                });
            }
            return this.updateFont();
        }
        // 字体丢失处理
        Vue.set(this.ftFamilyList, 0, {
            // hasLoaded: true
            fontid: 58,
            fonttype: 0,
            tmp_fontface_path: 'default',
        });
        return this.updateFont();
    }

    // 判断加载缓存字体
    loadCacheFont(resolve, reject) {
        const fontId = this.ftFamilyList[0].fontid;
        const defaultFont = 58;

        if (Ktu.indexedDB.isOpened) {
            if (Ktu.indexedDB.hasFont(fontId)) {
                this.ftFamilyList[0].hasLoaded = true;
                this.hasChanged = true;
                this.dirty = true;
                this.setCoords();
                resolve();
                // console.log('已经加载该字体!');
            } else {
                Ktu.indexedDB.get('fonts', fontId).then(res => {
                    if (res) {
                        // 加载缓存完整字体
                        Ktu.indexedDB.blobToArrayBuffer(res.file, fontId)
                            .then(file => {
                                const fontFace = new FontFace(res.fontName, file);
                                fontFace.load()
                                    .then(loadedFace => {
                                        document.fonts.add(loadedFace);
                                        this.ftFamilyList[0].hasLoaded = true;
                                        this.hasChanged = true;
                                        this.dirty = true;
                                        this.setCoords();
                                        // 插入字体列表
                                        Ktu.indexedDB.addFont(res);
                                        resolve();
                                    })
                                    .catch(e => {
                                        console.log(e);
                                        reject();
                                    });
                            })
                            .catch(err => {
                                loadFontPart.call(this, resolve, reject);
                                console.log(err);
                            });
                    } else {
                        // 下载完整字体文件
                        Ktu.indexedDB.downloadFont(fontId);
                        loadFontPart.call(this, resolve, reject);
                    }
                });
            }
        } else {
            loadFontPart.call(this, resolve, reject);
        }

        function loadFontPart(resolve, reject) {
            if (!this.text) {
                resolve();
                return;
            }
            const fontFace = new FontFace(this.fontFamily, `url(${this.ftFamilyList[0].tmp_fontface_path})`);
            const random = Math.random * 100;
            const render = () => {
                this.ftFamilyList[0].hasLoaded = true;
                this.hasChanged = true;
                this.dirty = true;
                resolve();
            };
            const forceRenderTimer = setTimeout(() => {
                console.log(`字体:${this.text}加载无响应`);
                render();
            }, 5000);
            setTimeout(() => {
                fontFace.load().then(loadedFace => {
                    // let loadedFace = await fontFace.load();
                    clearTimeout(forceRenderTimer);
                    document.fonts.add(loadedFace);
                    render();
                }, () => {
                    this.ftFamilyList[0].fontid = defaultFont;
                    this.updateFont();
                    Ktu.save.changeSaveNum();
                    clearTimeout(forceRenderTimer);
                    console.log(`字体:${this.text}加载失败`);
                });
            }, random);
        }
    }

    updateFont() {
        if (this.isInTable) {
            if (!this.text) {
                return;
            }
            const oldFtFamilyList = this.ftFamilyList[0];
            if (oldFtFamilyList && oldFtFamilyList.fontid) {
                const table = Ktu.selectedData;
                const substring = _.uniq(table.getTableText()).join('');
                const fontId = oldFtFamilyList.fontid;
                const fontType = oldFtFamilyList.fonttype;
                const fontFamily = `ktu_Font_TYPE_${fontType}_ID_${fontId}RAN_${parseInt(new Date().getTime(), 10)}`;
                const fontUrl = `/ajax/font_h.jsp?cmd=getFontPath&type=${fontType}&id=${fontId}`;
                return new Promise((resolve, reject) => {
                    axios
                        .post(fontUrl, {
                            substring: encodeURIComponent(JSON.stringify(substring)),
                            ktuId: Ktu.ktuId,
                        }).then(response => {
                            if (response.status == 200) {
                                const res = response.data.info;
                                const fontFaceId = res.fileId || '';
                                this.ftFamilListChg = 1;
                                this.ftFamilyList = [];
                                this.ftFamilyList.push({
                                    con: substring,
                                    fontFaceId,
                                    fontid: fontId,
                                    fonttype: fontType,
                                    fontfamily: fontFamily,
                                    tmp_fontface_path: res.path,
                                    hasLoaded: false,
                                });
                                this.fontFamily = fontFamily;

                                this.hasChanged = true;
                                this.dirty = true;
                                this.setCoords();

                                this.loadFontBase64Promise = this.loadFontBase64();

                                resolve();
                            } else {
                                console.log('请求字体路径失败');
                                reject();
                            }
                        })
                        .catch(err => {
                            console.log(err);
                            reject();
                        });
                });
            }
        } else {
            const oldFtFamilyList = this.ftFamilyList[0];
            if (oldFtFamilyList && oldFtFamilyList.fontid) {
                const substring = _.uniq(this.text).join('');
                const cookies = `&_FSESSIONID=${$.cookie('_FSESSIONID')}`;
                const fontId = oldFtFamilyList.fontid;
                const fontType = oldFtFamilyList.fonttype;
                const fontFamily = `ktu_Font_TYPE_${fontType}_ID_${fontId}RAN_${parseInt(Date.now(), 10)}`;
                const fontUrl = `/font.jsp?type=${fontType}&id=${fontId}${cookies}`;
                this.ftFamilListChg = 1;
                this.ftFamilyList = [];
                this.ftFamilyList.push({
                    con: this.text,
                    fontFaceId: oldFtFamilyList.fontFaceId,
                    fontid: fontId,
                    fonttype: fontType,
                    fontfamily: fontFamily,
                    tmp_fontface_path: fontUrl,
                    hasLoaded: true,
                });
                this.fontFamily = fontFamily;

                if (Ktu.indexedDB.isOpened) {
                    if (Ktu.indexedDB.hasFont(fontId)) {
                        this.hasChanged = true;
                        this.dirty = true;
                        this.setCoords();

                        this.loadFontBase64Promise = this.loadFontBase64();
                        // console.log('已经加载该字体');
                    } else {
                        Ktu.indexedDB.get('fonts', fontId).then(res => {
                            if (res) {
                                // 加载字体片段
                                return new Promise((resolve, reject) => {
                                    Ktu.indexedDB.blobToArrayBuffer(res.file, fontId)
                                        .then(file => {
                                            const fontFace = new FontFace(res.fontName, file);
                                            fontFace.load()
                                                .then(loadedFace => {
                                                    document.fonts.add(loadedFace);
                                                    this.hasChanged = true;
                                                    this.dirty = true;
                                                    this.setCoords();
                                                    this.loadFontBase64Promise = this.loadFontBase64();
                                                    // 插入字体列表
                                                    Ktu.indexedDB.addFont(res);
                                                    resolve();
                                                })
                                                .catch(e => {
                                                    console.log(e);
                                                    reject();
                                                });
                                        })
                                        .catch(err => {
                                            loadFontPart.call(this, resolve, reject);
                                            console.log(err);
                                        });
                                });
                            }
                            // 加载完整字体文件
                            Ktu.indexedDB.downloadFont(fontId);

                            return new Promise((resolve, reject) => {
                                loadFontPart.call(this, resolve, reject);
                            });
                        });
                    }
                } else {
                    return new Promise((resolve, reject) => {
                        loadFontPart.call(this, resolve, reject);
                    });
                }

                function loadFontPart(resolve, reject) {
                    if (!this.text) {
                        resolve();
                        return;
                    }
                    axios
                        .post(fontUrl, {
                            substring: encodeURIComponent(JSON.stringify(substring)),
                        }, {
                            responseType: 'arraybuffer',
                        })
                        .then(response => {
                            if (response) {
                                const fontFace = new FontFace(fontFamily, response.data);
                                fontFace.load().then(loadedFace => {
                                    document.fonts.add(loadedFace);
                                    this.hasChanged = true;
                                    this.dirty = true;
                                    this.setCoords();
                                    resolve();
                                });
                                this.loadFontBase64Promise = this.loadFontBase64();
                                // this.fontBase64 = this.transformArrayBufferToBase64(response.data);
                            }
                        })
                        .catch(e => {
                            console.log(e);
                            reject();
                        });
                }
            }
        }
    }

    initCanvas() {
        return new Promise(resolve => {
            this.loadFontBase64Promise.then(() => {
                this.drawCanvas().then(() => {
                    resolve(this);
                });
            });
        });
    }
    getEditingOffsetTop() {
        return this.lineHeight === 1 ? 0 : this.getLineHeight() / 2 + this.fontSize / 2 - this.getLineY(0);
    }
    getCharSpacing() {
        return this.fontSize * this.charSpacing / 1000;
    }
    getLineHeight(isLastLine) {
        return this.fontSize * this._fontSizeMult * (isLastLine ? 1 : this.lineHeight);
    }
    getLineY(lineIndex) {
        return (this._fontSizeMult - this._fontSizeFraction) * this.fontSize + this.getLineHeight() * lineIndex;
    }
    initTextHeight() {
        // 最后一行不计算行高
        const height = (this._textLines.length - 1) * this.getLineHeight() + this.getLineHeight(true);
        /* if (this.skewX || this.skewY) {
           console.log(this.width, height);
           } */
        this.height = height;
        this.setCoords();
    }
    getCharWidth(char) {
        const fontId = this.ftFamilyList[0].fontid;
        const fontFamily = Ktu.indexedDB.hasFont(fontId) ? this.getFontName() : this.fontFamily;

        // 表格比较特殊，用回自己的计算方式
        if (this.isInTable) {
            return this.table.getTextBounding(char, fontFamily, this.fontSize).width;
        }

        if (!this.ctx) {
            const canvas = document.createElement('canvas');
            this.ctx = canvas.getContext('2d');
        }
        const {
            ctx,
        } = this;
        ctx.font = `${this.fontSize}px ${fontFamily}, Source Han Sans CN Regular, Symbola`;
        return ctx.measureText(char).width;
    }
    getFontFamily() {
        const fontId = this.ftFamilyList && this.ftFamilyList[0] ? this.ftFamilyList[0].fontid : 0;
        const fontFamily = Ktu.indexedDB.hasFont(fontId) ? this.getFontName() : this.fontFamily;
        return fontFamily;
    }
    initCharX(_textLines) {
        let currentX = 0;
        const charSpacing = this.getCharSpacing();
        _textLines.forEach(textLine => {
            if (this.textAlign === 'left') {
                currentX = 0;
            } else {
                const totalLineWidth = textLine.reduce((currentWidth, text, index) => currentWidth + text.width + (index === textLine.length - 1 ? 0 : charSpacing), 0);
                if (this.textAlign === 'center') {
                    currentX = (this.width - totalLineWidth) / 2;
                } else {
                    currentX = this.width - totalLineWidth;
                }
            }
            textLine.forEach((text, index) => {
                text.x = currentX + (index === 0 ? 0 : textLine[index - 1].width + charSpacing);
                currentX = text.x;
            });
        });
        this._textLines = _textLines;
    }
    initTextLines() {
        if (!this.hasChanged && this._textLines) {
            return;
        }
        const textLines = this.text.split(/\r?\n/);
        const _textLines = [
            [],
        ];

        let currentWidth = 0;
        let currentLineIndex = 0;
        const charSpacing = this.getCharSpacing();
        textLines.forEach((textLine, lineIndex) => {
            // const chars = textLine.split('');
            const chars = [...textLine];
            chars.forEach((char, charIndex) => {
                const charWidth = this.getCharWidth(char);
                if (currentWidth + charWidth > this.width) {
                    _textLines[++currentLineIndex] = [];
                    currentWidth = 0;
                }
                _textLines[currentLineIndex].push({
                    char,
                    width: charWidth,
                });
                currentWidth += charWidth + charSpacing;
            });
            if (lineIndex !== textLines.length - 1) {
                _textLines[++currentLineIndex] = [];
                currentWidth = 0;
            }
        });

        this.initCharX(_textLines);
        // 表格不需要计算高度换行
        if (!this.isInTable) {
            this.initTextHeight();
        }
        this.hasChanged = false;
    }
    getFontName() {
        const fontId = this.ftFamilyList && this.ftFamilyList[0] ? this.ftFamilyList[0].fontid : 58;
        const font = Ktu.initialData.flyerFontList.find(font => font.id === fontId);
        return font ? font.nodeName : 'Source Han Sans CN Regular';
    }
    escapeXml(string) {
        return string.replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\s/g, ' ');
    }
    getSvgStrokeStyle() {
        // 字体加粗和描边用的都是stroke属性
        const strokeStyle = {};
        if (this.fontWeight === 'bold') {
            const stroke = Ktu.element.getRgb('fill', this.fill, this);
            strokeStyle.stroke = stroke.rgb;
            strokeStyle['stroke-opacity'] = stroke.opacity;
            strokeStyle['stroke-width'] = this.fontSize * 0.032;
        }
        if (this.strokeWidth && this.stroke) {
            const stroke = Ktu.element.getRgb('stroke', this.stroke, this);
            strokeStyle.stroke = stroke.rgb;
            strokeStyle['stroke-opacity'] = stroke.opacity ? stroke.opacity : 1;
            strokeStyle['stroke-width'] = this.strokeWidth / this.scaleX + (this.fontWeight === 'bold' ? strokeStyle['stroke-width'] : 0);
            strokeStyle['stroke-miterlimit'] = this.strokeMiterLimit;
            strokeStyle['stroke-linejoin'] = this.strokeLineJoin;
            strokeStyle['stroke-linecap'] = this.strokeLineCap;
            strokeStyle['stroke-dasharray'] = this.strokeDashArray;
        }
        return Object.keys(strokeStyle).reduce((str, prop) => `${str + prop}: ${strokeStyle[prop]};`, '');
    }
    getTextLineSvg() {
        return this._textLines.reduce((lineStr, textLine, lineIndex) => {
            const lineY = this.getLineY(lineIndex);
            return lineStr + textLine.reduce((charStr, text) => {
                // 斜体用skewX(15deg)实现，转换为矩阵等于tan(-15deg),注意基点是字体的x,y坐标
                const italicTransform = this.fontStyle === 'italic' ? `transform="translate(${text.x} ${lineY}) skewX(-15) translate(${-text.x} ${-lineY})"` : '';
                return `${charStr}
                    <text x="${text.x}" y="${lineY}" ${italicTransform}>${this.escapeXml(text.char)}</text>
                `;
            }, '');
        }, '');
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
        const strokeStr = Ktu.element.getRgb('fill', this.fill, this).rgb;
        return `<g stroke-linecap="butt" style="stroke: ${strokeStr}; stroke-width: ${this.fontSize / 15};">
            ${lineStr}</g>`;
    }
    getFontStyle() {
        return this.fontBase64 ? `
        <style type="text/css">
            @font-face {
                font-family: ${this.fontFamily};
                src: url(${this.fontBase64});
            }
        </style>
        ` : '';
    }
    getBg() {
        const fillStr = Ktu.element.getRgb('fill', this.textBg).str;
        return `
            <rect width="${this.width}" height="${this.height}" style="${fillStr}"></rect>
        `;
    }
    // 表格不需要initTextHeight
    toSvg(isAllInfo, isScreenShot) {
        if (!this.visible) {
            return '';
        }

        this.initTextLines();

        const shaodwStr = this.getShadow();
        const gStyle = isAllInfo ? `transform="translate(${this.left} ${this.top}) rotate(${this.angle}) scale(${this.scaleX} ${this.scaleY}) skewX(${this.skewX}) skewY(${this.skewY})" opacity="${this.opacity}"` : '';
        const shadowId = `shadow_${this.objectId}`;
        const fillStr = Ktu.element.getRgb('fill', this.fill, this).str;
        const flipStr = this.getFlip();
        // 这里有缓存字体使用缓存字体
        const fontId = this.ftFamilyList[0].fontid;
        let family = (isAllInfo && !isScreenShot) || (!isScreenShot && Ktu.indexedDB.hasFont(fontId)) ? this.getFontName() : this.fontFamily;
        // 处理汉字无法使用英文字体的时候使用
        family += ', Source Han Sans CN Regular, Symbola';
        // 计算shadow时用的是this.width 这里不填一个矩形，就有问题了
        const shadowRect = this.isOpenShadow ? `<rect x="0" y="0" width="${this.width}" height="${this.height}" fill="none" stroke="none"></rect>` : '';
        const g = `${shaodwStr}
                <g  ${gStyle}>
                    <defs>${Ktu.element.getGradient('fill', this.fill, this)}</defs>
                    <defs>${Ktu.element.getGradient('stroke', this.stroke, this)}</defs>
                    ${!this.isInTable ? this.getBg() : ''}
                    ${isScreenShot ? this.getFontStyle() : ''}
                    <g ${this.isOpenShadow ? `style="filter:url(#${shadowId})"` : ''}>
                        ${shadowRect}
                        <g font-size="${this.fontSize}"
                            style="font-family: ${family};${fillStr};${this.getSvgStrokeStyle()}" transform="translate(${this.strokeWidth / this.originScaleX / 2} ${this.strokeWidth / this.originScaleX / 2}) ${flipStr}">
                            ${this.getTextLineSvg()}
                            ${this.getUnderlineSvg()}
                        </g>
                    </g>
                </g>`;

        let svgHtml = '';
        if (!isAllInfo) {
            const dimensions = this.getDimensions();
            svgHtml = this.isEditing ? '' : `
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                    version="1.1" width="${dimensions.w * this.scaleX}" height="${dimensions.h * this.scaleY}"
                    viewBox="0 0 ${dimensions.w} ${dimensions.h}" xml:space="preserve" style="overflow: visible;">
                    ${g}
                </svg>
            `;
        } else {
            svgHtml = g;
        }
        return svgHtml;
    }

    getSvgNode() {
        return this.toSvg();
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
            fontBase64: this.fontBase64,
            originScaleX: this.originScaleX || 1,
            textBg: this.textBg || 'transparent',
            isInTable: this.isInTable,
        });
    }
    enterEditing() {
        this.isEditing = true;
        this.dirty = true;
        this.saveState();
        Vue.nextTick(() => {
            const textEditor = document.getElementById('textEditor');
            this.textEditor = textEditor;
            if (textEditor) {
                this.isInTable && textEditor.focus();
                window.setTimeout(() => {
                    !this.isInTable && textEditor.focus();
                    this.selectAll();
                    textEditor.addEventListener('blur', () => {
                        this.exitEditing();
                    });
                    textEditor.addEventListener('keydown', event => {
                        if (this.editable) {
                            /* if (event.keyCode === 32) {
                               event.preventDefault();
                               // const range = window.getSelection().getRangeAt(0);
                               // range.deleteContents();
                               // const space = document.createElement('space');
                               // space.innerHTML = '&nbsp;';
                               // range.insertNode(space);
                               // range.collapse();
                               document.execCommand('insertHtml', false, '&nbsp;');
                               } */
                            if (event.keyCode === 67 || event.keyCode === 82 || event.keyCode === 83 || event.keyCode === 84) {
                                Ktu.interactive.canDraw = false;
                            }
                            // 表格暂不支持换行
                            if (this.isInTable && event.keyCode === 13) {
                                event.preventDefault();
                            }
                        } else {
                            event.preventDefault();
                        }
                    });
                    textEditor.addEventListener('keyup', event => {
                        this.editable = true;
                        Ktu.interactive.isDrawing = false;
                        Ktu.interactive.canDraw = true;
                    });
                    textEditor.addEventListener('copy', event => {
                        event.stopPropagation();
                    });
                    textEditor.addEventListener('paste', event => {
                        event.preventDefault();
                        event.stopPropagation();
                        if ((event.originalEvent || event).clipboardData) {
                            const content = (event.originalEvent || event).clipboardData.getData('text/plain');
                            const span = document.createElement('span');
                            span.innerText = content;
                            // document.execCommand('insertHtml', false, span.innerHTML);
                            document.execCommand('insertHtml', false, span.innerHTML.replace(/\s/g, ' '));
                        }
                    });
                });
            }
        });
    }
    removeEmoji(text = '') {
        const emojiReg = /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[A9|AE]\u3030|\uA9|\uAE|\u3030/ig;
        return text.replace(emojiReg, '');
    }
    getEditedText() {
        let text = this.textEditor.innerText;
        if (/\r?\n/.test(text[text.length - 1])) {
            text = text.slice(0, text.length - 1);
        }
        // text = this.removeEmoji(text);
        /* text = text.replace(/<div>/g, '\n').replace(/<\/div>/g, '').replace(/<br>/g, '').replace(/&nbsp;/g, ' ');
           text  = text.replace(/<\/?space>/g, '').replace(/[(&lt;)(&gt;)(&amp;)(&quot;)]/g, function(s,s1,s2,s3,s4) {
           console.log(s,s1,s2,s3,s4);
           switch (match) {
           case '<':
           return '&lt;';
           case ''>'':
           return '&gt;';
           case '&':
           return '&amp;';
           case '\'':
           return '&quot;';
           }
           });
           const container = document.createElement('span');
           container.innerHTML = text;
           text = container.innerText; */
        return text;
    }
    async exitEditing() {
        // 编辑的文本是否属于表格的
        const currentText = this.getEditedText();
        if (currentText !== this.text) {
            if (this.isInTable && this.table) {
                const beforeData = this.table.toObject();
                this.table.selectedCell.text = currentText;
                this.text = currentText;
                // 添加历史
                await this.updateFont();
                this.changeState({
                    beforeData,
                    afterData: this.table.toObject(),
                });
            } else {
                this.text = currentText;
                await this.updateFont();
                this.modifiedState();
            }
        }

        this.isEditing = false;
        // 完成编辑后textbox需要重新生成svg，table需要退出编辑
        if (this.isInTable && this.table) {
            this.table.exitEditing && this.table.exitEditing();
            this.dirty = true;
            this.table.dirty = true;
        } else {
            this.dirty = true;
        }
        this.isHover = false;
        this.textEditor = null;
        delete this.canvas;
        if (!!this.group) {
            this.group.updateSizePosition();
        }
    }
    selectAll() {
        const range = document.createRange();
        range.selectNodeContents(this.textEditor);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
    }
    onDoubleClick(event) {
        event.preventDefault();
        this.enterEditing();
    }
    beforeResize() {
        this.maxCharWidth = this._textLines.reduce((max, line) => {
            line.forEach(char => {
                char.width * this.scaleX > max && (max = char.width * this.scaleX);
            });
            return max;
        }, 0);
    }
    async set(prop, value, isChangeText = false) {
        this.saveState();
        this[prop] = value;
        this.modifiedState();
        if (isChangeText) {
            await this.updateFont();
        }
        this.dirty = true;
        Ktu.save.changeSaveNum();
    }
    setBold() {
        const fontWeight = this.fontWeight === 'bold' ? 'normal' : 'bold';
        this.set('fontWeight', fontWeight);
    }
    setItalic() {
        const fontStyle = this.fontStyle === 'italic' ? 'normal' : 'italic';
        this.set('fontStyle', fontStyle);
    }
    setUnderline() {
        const textDecoration = this.textDecoration === 'underline' ? '' : 'underline';
        this.set('textDecoration', textDecoration);
    }
    setConversion(isAllCapitalize) {
        const textLowerReg = /[a-z]/;
        // const beforeText = this.text;
        if (textLowerReg.test(this.text)) {
            // this.text = this.text.toUpperCase();
            this.set('text', this.text.toUpperCase(), true);
        } else {
            this.set('text', this.text.toLowerCase(), true);
        }
        this.hasChanged = true;
    }
};
