Vue.component('edit-draw', {
    template: `<div class="edit-draw" @mousedown="drawStart" v-if="drawMode" ref="rootEl">
                    <canvas ref="canvas" class="edit-draw-canvas"></canvas>
                    <div class="edit-draw-assist">
                        <template v-if="!end">
                            <div class="edit-draw-tips">
                                摁住鼠标左键
                                <svg class="edit-draw-icon"><use xlink:href="#svg-ele-keyboardLeft"></use></svg>
                                ，拖拽绘制{{drawName}}
                            </div>
                            <div v-for="(types, mode) in typeObj" v-if="mode === drawMode" class="edit-draw-types">
                                <div v-for="(type, index) in types" :class="['edit-draw-type-'+mode, {selected: drawType === index}]" class="edit-draw-type" @click="selectType(index)" @mousedown.stop></div>
                            </div>
                        </template>
                        <div class="edit-draw-tips" v-else>松开鼠标左键，完成绘制</div>
                    </div>
                </div>`,
    data() {
        return {
            position: null,
            start: null,
            end: null,
            defaultLineWidth: 2,
            defaultStrokeWidth: 1,
            drawType: 0,
            typeObj: {
                rect: ['fill', 'stroke'],
                square: ['fill', 'stroke'],
                circle: ['fill', 'stroke'],
                text: ['title', 'subtitle', 'content'],
            },
            textObj: {
                fontId: 58,
                fill: '#345',
                text: '',
                fontSize: 72,
                scale: 1,
            },
            defatultText: {
                title: '做营销，上凡科网',
                subtitle: '专注企业营销服务',
                content: '凡科网，凡科公司旗下的一站式中小微企业营销服务平台，主要为中小微企业提供多元、易用、高效的营销产品和服务。产品包括凡科建站、凡科互动、凡科微传单、凡科轻站小程序、凡科公众号助手、凡科快图、凡科邮箱等，具有简单、灵活、快速、低成本、可视化的特点，能让中小微企业更轻松快速地开展互联网营销；同时凡科网配备大量优质的第三方营销服务，可满足中小微企业各阶段的营销需求，使广大中小微企业能够获得更全面的一站式企业营销解决方案。',
            },
            textList: _.cloneDeep(Ktu.config.ele.text),
            cursorOffset: 11.5,
        };
    },
    computed: {
        drawMode: {
            get() {
                return this.$store.state.base.drawMode;
            },
            set(value) {
                this.$store.commit('base/changeState', {
                    prop: 'drawMode',
                    value,
                });
            },
        },
        isOpenUtilModal() {
            return this.$store.state.base.isOpenUtilModal;
        },
        drawName() {
            switch (this.drawMode) {
                case 'line':
                    return '线条';
                case 'rect':
                    return '矩形';
                case 'square':
                    return '正方形';
                case 'circle':
                    return '圆形';
                case 'text':
                    return '文本';
            }
        },
    },
    mounted() {
        console.log('MousetrapMousetrap',Mousetrap)
        Mousetrap.bind(['l', 'r', 's', 'c', 't'], event => {
            // 如果正在使用工具弹窗禁止使用该快捷键
            if (this.isOpenUtilModal) {
                return;
            }
            event.preventDefault();
            if (!Ktu.interactive.isDrawing && !this.drawMode && Ktu.interactive.canDraw) {
                Ktu.element.checkAndExitClip();
                Ktu.interactive.isDrawing = true;
                Ktu.interactive.uncheckAll();
                // 键位映射
                const keyMap = new Map([
                    [/l/i, 'line'],
                    [/r/i, 'rect'],
                    [/s/i, 'square'],
                    [/c/i, 'circle'],
                    [/t/i, 'text'],
                ]);
                const key = [...keyMap.keys()].find(rule => rule.test(event.key));
                this.drawMode = keyMap.get(key);
                this.$nextTick(() => {
                    /* const editorClientRectTop = Ktu.edit.documentPosition.viewTop + Ktu.edit.editBox.top;
                       const editorClientRectLeft = Ktu.edit.documentPosition.viewLeft + Ktu.edit.editBox.left;
                       this.position = this.$refs.rootEl.getBoundingClientRect();
                       console.log(editorClientRectLeft, this.position.left);
                       console.log(editorClientRectTop, this.position.top); */
                    this.adjustSize();
                    this.drawMask();
                });
            }
        }, 'keydown');
        Mousetrap.bind(['l', 'r', 's', 'c', 't'], () => {
            this.exitDrawing();
            Ktu.interactive.isDrawing = false;
            Ktu.interactive.canDraw = true;
            /* const activeObject = Ktu.canvas.getActiveObject();
               activeObject && activeObject.hiddenTextarea && activeObject.hiddenTextarea.focus(); */
        }, 'keyup');
        /* 预先加载艺术字
           const cookies = "&_FSESSIONID=" + $.cookie("_FSESSIONID");
           const fontId = this.textObj.fontId;
           const textType = 0;
           const defaultText = Object.keys(this.defatultText).reduce((currentStr, type) => {
           return currentStr + this.defatultText[type];
           }, '');
           const fontUrl = "/font.jsp?type=" + textType + "&id=" + fontId + cookies;
           axios.post(fontUrl, {
           substring: encodeURIComponent(JSON.stringify(defaultText))
           }, {
           responseType: 'arraybuffer'
           }).then((response) => {
           if(response){ */
        const fontFace = new FontFace('defaultFamily', `url(${Ktu.initialData.resRoot}/css/fonts/drawText.ttf)`);
        fontFace.load().then(loadedFace => {
            document.fonts.add(loadedFace);
        });
        /* }
           });
           window.setTimeout(() => {
           const widthEachWord = this.textObj.fontSize;
           const heightEachWord = this.textObj.fontSize * Ktu.element._fontSizeMult;
           this.textList.forEach((text) => {
           text.widthEachWord = widthEachWord;
           text.heightEachWord = heightEachWord;
           });
           }, 100); */
    },
    methods: {
        selectType(type) {
            this.drawType = type;
        },
        adjustSize() {
            const {
                width,
                height,
            } = Ktu.edit.size;
            const { canvas } = this.$refs;
            if (canvas.width !== width) {
                canvas.width = width;
            }
            if (canvas.height !== height) {
                canvas.height = height;
            }
        },
        clear() {
            const { canvas } = this.$refs;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        },
        drawMask() {
            const editorClientRectTop = Ktu.edit.documentPosition.viewTop + Ktu.edit.editBox.top;
            const editorClientRectLeft = Ktu.edit.documentPosition.viewLeft + Ktu.edit.editBox.left;
            const {
                viewWidth,
                viewHeight,
            } = Ktu.edit.documentSize;
            const { canvas } = this.$refs;
            const ctx = canvas.getContext('2d');
            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, .5)';
            ctx.fillRect(editorClientRectLeft, editorClientRectTop, viewWidth, viewHeight);
            ctx.restore();
        },
        drawStart(event) {
            this.start = {
                x: event.offsetX + this.cursorOffset,
                y: event.offsetY + this.cursorOffset,
            };
            window.addEventListener('mousemove', this.drawing);
            window.addEventListener('mouseup', this.drawEnd);
        },
        removeAllEvent() {
            window.removeEventListener('mousemove', this.drawing);
            window.removeEventListener('mouseup', this.drawEnd);
        },
        drawing(event) {
            const zoom = Ktu.edit.scale;
            this.clear();
            this.drawMask();
            this.end = {
                x: event.clientX - Ktu.edit.size.left + this.cursorOffset,
                y: event.clientY - Ktu.edit.size.top + this.cursorOffset,
            };
            const { canvas } = this.$refs;
            const ctx = canvas.getContext('2d');
            ctx.save();
            ctx.beginPath();
            const {
                start,
                end,
            } = this;
            const draw = {
                line: () => {
                    ctx.lineWidth = this.defaultLineWidth * zoom;
                    ctx.moveTo(start.x, start.y);
                    ctx.lineTo(end.x, start.y);
                    ctx.closePath();
                    ctx.stroke();
                },
                rect: () => {
                    ctx.lineWidth = this.defaultStrokeWidth * zoom;
                    if (this.drawMode === 'square') {
                        const offsetX = Math.abs(end.x - start.x);
                        const offsetY = Math.abs(end.y - start.y);
                        if (offsetX > offsetY) {
                            end.y = start.y + (start.y > end.y ? -offsetX : offsetX);
                        } else {
                            end.x = start.x + (start.x > end.x ? -offsetY : offsetY);
                        }
                    }
                    ctx.moveTo(start.x, start.y);
                    ctx.lineTo(end.x, start.y);
                    ctx.lineTo(end.x, end.y);
                    ctx.lineTo(start.x, end.y);
                    ctx.closePath();
                    ctx[this.typeObj[this.drawMode][this.drawType]]();
                },
                square() {
                    draw.rect();
                },
                circle: () => {
                    ctx.lineWidth = this.defaultStrokeWidth * zoom;
                    const offsetX = Math.abs(end.x - start.x);
                    const offsetY = Math.abs(end.y - start.y);
                    if (offsetX > offsetY) {
                        end.y = start.y + (start.y > end.y ? -offsetX : offsetX);
                    } else {
                        end.x = start.x + (start.x > end.x ? -offsetY : offsetY);
                    }
                    const center = {
                        x: (start.x + end.x) / 2,
                        y: (start.y + end.y) / 2,
                    };
                    const radius = Math.abs(end.x - start.x) / 2;
                    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx[this.typeObj[this.drawMode][this.drawType]]();
                },
                text: () => {
                    // 框
                    ctx.lineWidth = 1;
                    const textConf = this.textList[this.drawType];
                    const scale = Ktu.ktuData.other.width / 720 * textConf.scale;
                    const widthEachWord = this.textObj.fontSize * zoom * scale;
                    const heightEachWord = this.textObj.fontSize * Ktu.element._fontSizeMult * zoom * scale;
                    const drawType = this.typeObj[this.drawMode][this.drawType];
                    const origin = {
                        x: Math.min(start.x, end.x),
                        y: Math.min(start.y, end.y),
                    };
                    const width = Math.abs(start.x - end.x);
                    const height = Math.abs(start.y - end.y);
                    const drawBorder = (color, dash, offset) => {
                        ctx.strokeStyle = color;
                        ctx.setLineDash(dash);
                        ctx.lineDashOffset = offset;
                        ctx.strokeRect(origin.x, origin.y, width, drawType !== 'content' ? heightEachWord : height);
                    };
                    drawBorder('#969696', [4, 4], 0);
                    drawBorder('#fff', [4, 4], 4);
                    // 字
                    ctx.fillStyle = this.textObj.fill;
                    ctx.textBaseline = 'middle';
                    this.textObj.fontSize = textConf.fontSize;
                    this.textObj.scale = scale;
                    const wordEachLine = Math.floor(width / widthEachWord);
                    /* const heightOffset = textConf.fontSize * size.scaleX / 34 * 5 * zoom;
                       Y坐标从中点开始画 */
                    const textY = heightEachWord / Ktu.element._fontSizeMult / 2;
                    let defatultText = this.defatultText[this.typeObj.text[this.drawType]];
                    ctx.font = `${textConf.fontSize * scale * zoom}px "defaultfamily"`;
                    if (drawType !== 'content') {
                        ctx.translate(width / 2, 0);
                        ctx.textAlign = 'center';
                        const text = defatultText.slice(0, wordEachLine);
                        ctx.fillText(text, origin.x, origin.y + textY);
                        this.textObj.text = text;
                        this.drawText = text;
                    } else {
                        // 逐行绘制
                        const lineNum = Math.ceil(height / heightEachWord);
                        // 保存当前绘制的文字，实际绘制到画布时使用。
                        this.textObj.text = '';
                        for (let index = 0; index < lineNum; index++) {
                            const startIndex = wordEachLine * index;
                            if (defatultText.slice(startIndex).length < wordEachLine) {
                                defatultText = _.repeat(defatultText, 2);
                            }
                            const text = defatultText.slice(startIndex, startIndex + wordEachLine);
                            // 大于字数限制时不再重复
                            if ((this.textObj.text + text).length > 20000) {
                                break;
                            }
                            ctx.fillText(text, origin.x, origin.y + textY + index * heightEachWord);
                            this.textObj.text += text;
                        }
                    }
                },
            };
            draw[this.drawMode] && draw[this.drawMode]();
            ctx.restore();
        },
        exitDrawing() {
            if (this.end) {
                this.removeTipsModal(this.drawMode);
                this.render();
            }
            this.drawMode = '';
            this.start = null;
            this.end = null;
            this.removeAllEvent();
        },
        drawEnd() {
            if (this.end) {
                this.removeTipsModal(this.drawMode);
                this.render(true);
                this.drawMode = '';
            }
            this.start = null;
            this.end = null;
            this.removeAllEvent();
        },
        // 去掉提示
        removeTipsModal(type) {
            switch (type) {
                case 'text':
                    Ktu.store.commit('msg/hideManipulatetip', 'isShowTextTip');
                    break;
                case 'line':
                    Ktu.store.commit('msg/hideManipulatetip', 'isShowLineTip');
                    break;
                default:
                    Ktu.store.commit('msg/hideManipulatetip', 'isShowShapeTip');
                    break;
            }
        },
        pointerToCoords(pointer) {
            const editorClientRectTop = Ktu.edit.documentPosition.viewTop + Ktu.edit.editBox.top;
            const editorClientRectLeft = Ktu.edit.documentPosition.viewLeft + Ktu.edit.editBox.left;
            const viewZoom = Ktu.edit.scale;
            return {
                x: (pointer.x - editorClientRectLeft) / viewZoom,
                y: (pointer.y - editorClientRectTop) / viewZoom,
            };
        },
        render(isNeedBanEdit) {
            const {
                start,
                end,
            } = this;
            const startCoords = this.pointerToCoords(start);
            const endCoords = this.pointerToCoords(end);
            // const origonalStartY = startCoords.y;
            if (startCoords.x > endCoords.x) {
                [startCoords.x, endCoords.x] = [endCoords.x, startCoords.x];
            }
            if (startCoords.y > endCoords.y) {
                [startCoords.y, endCoords.y] = [endCoords.y, startCoords.y];
            }
            // const maxDepth = Ktu.canvas.getMaxDepth();
            let object = null;
            let isAsync = false;
            const add = {
                line: () => {
                    const top = startCoords.y;
                    const left = startCoords.x;
                    const width = endCoords.x - startCoords.x || 1;
                    const height = 0;
                    object = new Line({
                        type: 'line',
                        top,
                        left,
                        width,
                        height,
                        strokeWidth: this.defaultLineWidth,
                        strokeDashArray: [0, 0],
                        stroke: '#000',
                        elementName: '线条',
                        isOpenColor: true,
                    });
                },
                rect: () => {
                    const top = startCoords.y;
                    const left = startCoords.x;
                    const width = endCoords.x - startCoords.x || 1;
                    const height = endCoords.y - startCoords.y || 1;
                    object = {
                        type: 'rect',
                        top,
                        left,
                        width,
                        height,
                        elementName: this.drawMode === 'rect' ? '矩形' : '正方形',
                    };
                    if (this.typeObj[this.drawMode][this.drawType] === 'fill') {
                        object.fill = '#000';
                        object.isOpenColor = true;
                    } else {
                        object.fill = '';
                        object.stroke = '#000';
                        object.strokeWidth = this.defaultStrokeWidth;
                        object.top -= this.defaultStrokeWidth / 2;
                        object.left -= this.defaultStrokeWidth / 2;
                        object.isOpenStroke = true;
                    }
                    object = new Rect(object);
                },
                square() {
                    add.rect();
                },
                circle: () => {
                    const top = startCoords.y;
                    const left = startCoords.x;
                    const width = endCoords.x - startCoords.x || 1;
                    const height = endCoords.y - startCoords.y || 1;
                    object = {
                        type: 'ellipse',
                        width,
                        height,
                        top,
                        left,
                        elementName: '圆形',
                    };
                    if (this.typeObj[this.drawMode][this.drawType] === 'fill') {
                        object.fill = '#000';
                        object.isOpenColor = true;
                    } else {
                        object.fill = '';
                        object.stroke = '#000';
                        object.strokeWidth = this.defaultStrokeWidth;
                        object.top -= this.defaultStrokeWidth / 2;
                        object.left -= this.defaultStrokeWidth / 2;
                        object.isOpenStroke = true;
                    }
                    object = new Ellipse(object);
                },
                text: () => {
                    isAsync = true;
                    const { textObj } = this;
                    const { scale } = textObj;
                    const top = startCoords.y;
                    const left = startCoords.x;
                    const width = (endCoords.x - startCoords.x) / scale;
                    const drawType = this.typeObj.text[this.drawType];
                    object = {
                        type: 'textbox',
                        top,
                        left,
                        width,
                        fill: textObj.fill,
                        scaleX: scale,
                        scaleY: scale,
                        text: textObj.text,
                        fontSize: textObj.fontSize,
                        textAlign: drawType === 'content' ? 'left' : 'center',
                        elementName: '文本',
                        editable: !isNeedBanEdit,
                        ftFamilListChg: 1,
                        ftFamilyList: [{
                            fontid: textObj.fontId,
                            fonttype: 0,
                            tmp_fontface_path: 'default',
                        }],
                    };
                    /* const cookies = "&_FSESSIONID=" + $.cookie("_FSESSIONID");
                       const fontId = textObj.fontId;
                       const textType = 0;
                       // const fontUrl = "/font.jsp?substring=" + encodeURIComponent(object.text) + "&type=" + textType + "&id=" + fontId + cookies;
                       const fontUrl = "/font.jsp?type=" + textType + "&id=" + fontId + cookies;
                       const substring = _.uniq(object.text).join('');
                       axios.post(fontUrl, {
                       substring: encodeURIComponent(JSON.stringify(substring))
                       }, {
                       responseType: 'arraybuffer'
                       }).then((response) => {
                       if (response) {
                       const fontFamily = "ktu_Font_TYPE_0_ID_" + fontId + "RAN_" + parseInt(new Date().getTime());
                       const fontFace = new FontFace(fontFamily, response.data);
                       fontFace.load().then((loadedFace) => {
                       document.fonts.add(loadedFace);
                       object.ftFamilListChg = 1;
                       object.fontFamily = fontFamily;
                       object.ftFamilyList = [{
                       con: substring,
                       fontFaceId: "",
                       fontid: fontId,
                       fonttype: 0,
                       fontfamily: fontFamily,
                       tmp_fontface_path: fontUrl,
                       hasLoaded: true
                       }];
                       object = new Textbox(object);
                       // const size = object.getSize();
                       // object.scaleX = size.scaleX;
                       // object.scaleY = size.scaleY;
                       Ktu.selectedTemplateData.objects.push(object);
                       Ktu.selectedData = object;
                       Ktu.selectedData.addedState();
                       object.enterEditing();
                       });
                       }
                       }); */
                    object = new Textbox(object);
                    Ktu.selectedTemplateData.objects.push(object);
                    Ktu.selectedData = object;
                    Ktu.selectedData.addedState();
                    object.enterEditing();
                    const input = document.createElement('input');
                    input.focus();
                },
            };
            add[this.drawMode] && add[this.drawMode]();
            Ktu.log('quickDraw', this.drawMode);
            if (!isAsync) {
                if (object.type == 'line') {
                    object.isOpenColor = true;
                }
                Ktu.selectedTemplateData.objects.push(object);
                Ktu.selectedData = object;
                Ktu.selectedData.addedState();
            }
            this.drawType = 0;
        },
    },
});
