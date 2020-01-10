function Edit() {
    let scale = 1;
    Object.defineProperty(this, 'scale', {
        get() {
            return scale;
        },
        set(val) {
            scale = val;
            Ktu.store.commit('data/changeState', {
                prop: 'scale',
                value: scale,
            });
        },
    });

    Object.defineProperty(this, 'maxZoomRate', {
        get() {
            return this.editorMode ? 8 : 4;
        },
        enumerable: true,
        configurable: true,
    });
    Object.defineProperty(this, 'minZoomRate', {
        get() {
            let zoom = this.fitZoom / 2;
            zoom > 1 && (zoom = 1);
            return zoom;
        },
        enumerable: true,
        configurable: true,
    });

    const that = this;

    this.hasLeftWindow = false;
    this.dirtyElekeys = [];
    this.isMoveMode = false;
    $(window).on('resize', target => {
        that.initEdit();
    });
    document.body.addEventListener('mouseleave', ev => {
        this.leftWindow(ev);
    });

    // window blur 事件用于判断当前页面是否失去焦点，可以用这个方法来代替ctrl+tab（alt+tab）切换页面
    window.addEventListener('blur', ev => {
        this.leftWindow(ev);
    });

    document.body.addEventListener('mouseenter', ev => {
        this.returnWindow(ev);
    });
    document.body.addEventListener('wheel', e => {
        if (e.ctrlKey) {
            e.preventDefault();
        }
    }, { passive: false });

    // 画布的上下滑动
    $('#ktuCanvasHolder').mousewheel(e => {
        if (e.ctrlKey || e.altKey || this.spaceKeyDown) {
            return;
        }

        let stepY;
        const speedUpRate = Ktu.edit.editBox.height / Ktu.edit.size.height * 1.5;

        if (e.deltaY >= 0) {
            // 1是比较适合的滚轮速度
            stepY = 1 / Ktu.thumb.thumbZoom * (speedUpRate > 2 ? 2 : speedUpRate);
        } else {
            stepY = -1 / Ktu.thumb.thumbZoom * (speedUpRate > 2 ? 2 : speedUpRate);
        }
        Ktu.edit.editBox.top += stepY;

        Ktu.edit.editBox.top = Math.min(Ktu.edit.editBox.top, 0);
        Ktu.edit.editBox.top = Math.max(Ktu.edit.editBox.top, (Ktu.edit.size.height - Ktu.edit.editBox.height));

        Ktu.thumb.drawMaskCanvas();

        Ktu.edit.calcDocumentPosition();

        Ktu.edit.setOutBox();
    });

    this.initEdit();
};

Edit.prototype = {
    spacePadding: 20,
    viewOffset: 0.1,
    editorMode: false,
    boxShowRight: 0,
    boxShowLeft: 0,
    // 是否生成一张较大的图片 t:（300 * xxx）；f：（100 * xxx）
    getBigTmpImage: true,

    leftWindow(ev) {
        this.hasLeftWindow = true;
        this.exitViewportEvent();
    },

    returnWindow(ev) {
        this.hasLeftWindow = false;
        // 如果鼠标重新进入页面，这些keyCode值重新设置为false避免ctrl+alt+a截图进来后，页面的自动对齐功能消失（需要重新按ctrl才能使用）。
        ['shift', 'alt', 'ctrl', 'meta'].forEach(key => {
            Mousetrap[key] = false;
        });
    },

    initEdit() {
        this.calcWindowSize();

        this.getEditareaSize();

        this.scale = this.setDimensions();
        this.oldScale = this.scale;

        this.getDocumentSize();

        this.initEditInfo();

        this.calcEditInfo();

        this.setOutBox();

        this.setEditorBox();

        this.drawMaskSVG();

        this.refreshContextMenu();
    },

    refreshEdit(timeTag) {
        let time = 0;
        if (!!timeTag) {
            time = 300;
        }

        setTimeout(() => {
            // 需要删除editBox才能重新居中
            this.editBox = {};

            this.getEditareaSize();

            this.refreshEditDom();

            Ktu.thumb.refreshThumb();
        }, time);
    },

    /* 计算页面最合适的缩放比例值
     */
    setDimensions() {
        const { width, height } = this.size;
        const docWidth = Ktu.ktuData.other.width;
        const docHeight = Ktu.ktuData.other.height;
        // 是否展开右侧
        const { isShowPage } = Ktu.store.state.base;

        this.viewMargin = Math.max(Math.min(width, height) * this.viewOffset, 70);

        if (isShowPage) {
            this.fitZoom = Math.min((width - 180 - this.viewMargin * 2) / docWidth, (height - this.viewMargin * 2) / docHeight);
        } else {
            this.fitZoom = Math.min((width - this.viewMargin * 2) / docWidth, (height - this.viewMargin * 2) / docHeight);
        }

        this.fitZoom = this.fitZoom > this.maxZoomRate ? this.maxZoomRate : this.fitZoom;

        return this.fitZoom;
    },

    /**
     * 获取浏览器区域的大小，以便准确计算editArea区域,也方便其他模块做一些响应式的处理
     */
    calcWindowSize() {
        const winWidth = $(window).width();
        const winHeight = $(window).height();

        Ktu.store.commit('base/changeState', {
            prop: 'browserHeight',
            value: winHeight,
        });

        Ktu.store.commit('base/changeState', {
            prop: 'browserWidth',
            value: winWidth,
        });
    },

    /* -变量 size 编辑区域可视区域的大小，.edit-area大小
     */
    getEditareaSize() {
        const winWidth = $(window).width();
        const winHeight = $(window).height();
        // let left = Ktu.config.ele.categoryWidth,
        let left = Ktu.store.state.base.browserHeight > 710 ? 80 : 70;
        let right = 0;
        const top = 60;

        if (Ktu.store.state.base.isShowEleDetail) {
            left += Ktu.config.ele.detailWidth;
        }

        if (Ktu.store.state.base.isShowPage) {
            right = 180;
        }

        const size = {
            width: (winWidth - left - right),
            height: (winHeight - top),
            left,
            top,
        };

        this.size = size;

        return this.size;
    },

    /* -变量 documentSize 内容区域大小，包含算上缩放大小和页面实际大小（viewWidth , viewHeight）
     */
    getDocumentSize() {
        const w = Ktu.ktuData.other.width;
        const h = Ktu.ktuData.other.height;
        const ow = Ktu.ktuData.other.originalWidth;
        const oh = Ktu.ktuData.other.originalHeight;

        this.documentSize = {
            width: w,
            height: h,
            originalWidth: ow,
            originalHeight: oh,
        };
    },

    /* 初始化页面缩略图路径
       初始化缩略区域比例值thumbZoom
       初始化其他一些辅助线的是否显示值
        */
    initEditInfo() {
        this.thumbZoom = Math.min(Ktu.globalConfig.navigatorSize / this.documentSize.width, Ktu.globalConfig.navigatorSize / this.documentSize.height);

        const manageStatus = sessionStorage.getItem('manageStatus') || 'user';
        this.isTemplateAccout = (Ktu.isThirdDesigner && (manageStatus === 'thirdParty' && !Ktu.isFromCustomization));

        this.hasSpecialGuideLines = Ktu.ktuData.type === 101;
        this.hasResizeLines = ([0, 112, 205].indexOf(Ktu.ktuData.type) >= 0 && Ktu.ktuData.other.unit === 1);
        this.hasResizeLineV = [0].indexOf(Ktu.ktuData.type) >= 0;

        /* 内部设计师，可以拖拉自定义类型页面，不能拖拉产品详情类型和营销长图类型
           三方设计师在设计模式下，无法拖拉更改页面
           其他类型都可以 */
        this.hasResizeLineH = [0].indexOf(Ktu.ktuData.type) >= 0 || ([112, 205].indexOf(Ktu.ktuData.type) >= 0 && !this.isTemplateAccout && !Ktu.isUIManage);

        $('.resize-line').remove();
        this.editBox = {};
        this.mousePosition = {};
    },

    /* -变量 editBox 编辑区域大小 #ktuCanvasHolder大小
       -变量 documentPostion 内容区域位置，可视区域位置和实际位置
        */
    calcEditInfo() {
        const { scale } = this;
        this.documentSize.viewWidth = Math.round(this.documentSize.width * this.scale);
        this.documentSize.viewHeight = Math.round(this.documentSize.height * this.scale);
        const { editBox } = this;
        const oldEditBox = _.cloneDeep(editBox);

        editBox.tmpWidth = Math.round(this.documentSize.viewWidth + 2 * this.spacePadding * scale / this.thumbZoom);
        editBox.tmpHeight = Math.round(this.documentSize.viewHeight + 2 * this.spacePadding * scale / this.thumbZoom);

        editBox.width = Math.max(editBox.tmpWidth, this.size.width);
        editBox.height = Math.max(editBox.tmpHeight, this.size.height);

        const newLeft = Math.round((this.size.width - editBox.width) / 2);
        const newTop = Math.round((this.size.height - editBox.height) / 2);

        const { pageX } = this.mousePosition;
        const { pageY } = this.mousePosition;

        if (editBox.left === undefined || newLeft >= 0) {
            editBox.left = newLeft;
        } else {
            const percentX = (pageX - (this.size.left + oldEditBox.left)) / oldEditBox.width;
            if (editBox.left > 0) {
                editBox.left = 0;
            } else if (editBox.left < (Ktu.edit.size.width - Ktu.edit.editBox.width)) {
                editBox.left = (Ktu.edit.size.width - Ktu.edit.editBox.width) / 2;
            } else if (!pageX) {
                editBox.left -= (editBox.width - oldEditBox.width) / 2;

                if (editBox.left < 2 * newLeft) {
                    editBox.left = 2 * newLeft;
                }
            } else {
                editBox.left = oldEditBox.left + (oldEditBox.width - editBox.width) * percentX;
            }
        }

        if (editBox.top === undefined || newTop >= 0) {
            editBox.top = newTop;
        } else {
            const percentY = (pageY - (this.size.top + oldEditBox.top)) / oldEditBox.height;
            if (editBox.top > 0) {
                editBox.top = 0;
            } else if (editBox.top < (Ktu.edit.size.height - Ktu.edit.editBox.height)) {
                editBox.top = (Ktu.edit.size.height - Ktu.edit.editBox.height) / 2;
            } else if (!pageY) {
                editBox.top -= (editBox.height - oldEditBox.height) / 2;

                if (editBox.top < 2 * newTop) {
                    editBox.top = 2 * newTop;
                }
            } else {
                editBox.top = oldEditBox.top + (oldEditBox.height - editBox.height) * percentY;
            }
        }

        editBox.bottom = window.innerHeight - this.size.top - (editBox.height + editBox.top);
        editBox.right = window.innerWidth - this.size.left - (editBox.width + editBox.left);

        const documentPosition = {
            viewLeft: Math.round((editBox.width - this.documentSize.viewWidth) / 2),
            viewTop: Math.round((editBox.height - this.documentSize.viewHeight) / 2),
        };

        this.documentPosition = documentPosition;
        this.editBox = editBox;

        this.calcDocumentPosition();
    },

    calcDocumentPosition() {
        this.documentPosition.top = this.documentPosition.viewTop + this.editBox.top;
        this.documentPosition.left = this.documentPosition.viewLeft + this.editBox.left;
    },

    /* 设置编辑区域（可滚动区域）大小和位置
     */
    setOutBox() {
        const translateStr = `translate(${this.editBox.left}px,${this.editBox.top}px)`;

        $('#ktuCanvasHolder').css({
            width: this.editBox.width,
            height: this.editBox.height,
            transform: translateStr,
        });
    },

    setEditorBox() {
        const x = this.documentPosition.viewLeft / this.scale;
        const y = this.documentPosition.viewTop / this.scale;

        const transform = `scale(${this.scale}) translate(${x}px, ${y}px)`;

        $('#editor').css({
            transform,
        });

        $('#editorView').css({
            width: this.documentSize.width,
            height: this.documentSize.height,
        });

        // 设置背景马赛克大小
        $('#edbg').css({
            transform: `translate(${x * this.scale}px, ${y * this.scale}px)`,
            width: this.documentSize.width * this.scale,
            height: this.documentSize.height * this.scale,
        });
    },

    /* 创建或刷新编辑区域的遮罩层
     */
    drawMaskSVG() {
        const tmpSvg = [];

        const bloodPos = this.getPrintTypePosition(Ktu.ktuData.type);

        const dswidth = this.documentSize.viewWidth;
        const dsheight = this.documentSize.viewHeight;

        const { width } = this.editBox;
        const { height } = this.editBox;
        const dsleft = this.documentPosition.viewLeft;
        const dstop = this.documentPosition.viewTop;

        tmpSvg.push(Ktu.element.SVGHEAD);
        tmpSvg.push(`width="${width}" height="${height}"`);
        tmpSvg.push(`viewBox="0 0 ${width} ${height}"`);
        tmpSvg.push(Ktu.element.SVGHEADTAIL);
        tmpSvg.push(`<path class="maskPath" xmlns="http://www.w3.org/2000/svg" d="M0 0 L${width} 0 L${width} ${height} L0 ${height} z m${dsleft} ${dstop} h${dswidth} v${dsheight} h-${dswidth}z" fill-rule="evenodd" fill="rgba(220, 220, 220,.9)"/>`);

        // 出血位
        if (bloodPos.x && bloodPos.y) {
            const bloodLeft = dsleft + bloodPos.x / 4 * this.scale;
            const bloodTop = dstop + bloodPos.x / 4 * this.scale;
            const bloodWidth = dswidth - bloodPos.x / 2 * this.scale;
            const bloodHeight = dsheight - bloodPos.x / 2 * this.scale;

            // tmpSvg.push(`<rect class="maskPath" x="${dsleft + bloodPos.x / 4 * this.scale}" y="${dstop + bloodPos.x / 4 * this.scale}" width="${dswidth - bloodPos.x / 2 * this.scale}" height="${dsheight - bloodPos.x / 2 * this.scale}" fill="none" stroke="rgba(200, 200, 200, .3)" stroke-width="${bloodPos.x / 2 * this.scale}"></rect>`);
            tmpSvg.push(`<path class="bloodPath" id="bloodPath" d="M${bloodLeft} ${bloodTop} L${bloodLeft + bloodWidth} ${bloodTop} L${bloodLeft + bloodWidth} ${bloodTop + bloodHeight} L${bloodLeft} ${bloodTop + bloodHeight} Z" fill="none" stroke="rgba(200, 200, 200, .3)" stroke-width="${bloodPos.x / 2 * this.scale}"></path>`);

            // 出血位四角实线
            tmpSvg.push(drawSolidLine(dsleft - 8, dstop + bloodPos.y / 2 * this.scale, dsleft - 18, dstop + bloodPos.y / 2 * this.scale, 'cornerLine1'));
            tmpSvg.push(drawSolidLine(dsleft + bloodPos.x / 2 * this.scale, dstop - 8, dsleft + bloodPos.x / 2 * this.scale, dstop - 18, 'cornerLine1'));

            tmpSvg.push(drawSolidLine(dsleft + dswidth + 8, dstop + bloodPos.y / 2 * this.scale, dsleft + dswidth + 18, dstop + bloodPos.y / 2 * this.scale, 'cornerLine2'));
            tmpSvg.push(drawSolidLine(dsleft + dswidth - bloodPos.x / 2 * this.scale, dstop - 8, dsleft + dswidth - bloodPos.x / 2 * this.scale, dstop - 18, 'cornerLine2'));

            tmpSvg.push(drawSolidLine(dsleft + dswidth + 8, dstop + dsheight - bloodPos.y / 2 * this.scale, dsleft + dswidth + 18, dstop + dsheight - bloodPos.y / 2 * this.scale, 'cornerLine3'));
            tmpSvg.push(drawSolidLine(dsleft + dswidth - bloodPos.x / 2 * this.scale, dstop + dsheight + 8, dsleft + dswidth - bloodPos.x / 2 * this.scale, dstop + dsheight + 18, 'cornerLine3'));

            tmpSvg.push(drawSolidLine(dsleft - 8, dstop + dsheight - bloodPos.y / 2 * this.scale, dsleft - 18, dstop + dsheight - bloodPos.y / 2 * this.scale, 'cornerLine4'));
            tmpSvg.push(drawSolidLine(dsleft + bloodPos.x / 2 * this.scale, dstop + dsheight + 8, dsleft + bloodPos.x / 2 * this.scale, dstop + dsheight + 18, 'cornerLine4'));

            // 出血位提示
            const bloodTip1 = `<g class="bloodTip" id="bloodTip1" style="display: none"><rect x="${dsleft - 50}" y="${dstop - 20}"  rx="10" ry="10" width="50" height="20" fill:"#35384b"/> <text x="${dsleft - 50 + 6}" y="${dstop - 6}" fill="#fff">出血位</text></g>`;
            const bloodTip2 = `<g class="bloodTip" id="bloodTip2" style="display: none"><rect x="${dsleft + dswidth}" y="${dstop - 20}"  rx="10" ry="10" width="50" height="20" fill:"#35384b"/> <text x="${dsleft + dswidth + 6}" y="${dstop - 6}" fill="#fff">出血位</text></g>`;
            const bloodTip4 = `<g class="bloodTip" id="bloodTip3" style="display: none"><rect x="${dsleft + dswidth}" y="${dstop + dsheight}"  rx="10" ry="10" width="50" height="20" fill:"#35384b"/> <text x="${dsleft + dswidth + 6}" y="${dstop + dsheight - 6 + 20}" fill="#fff">出血位</text></g>`;
            const bloodTip3 = `<g class="bloodTip" id="bloodTip4" style="display: none"><rect x="${dsleft - 50}" y="${dstop + dsheight}"  rx="10" ry="10" width="50" height="20" fill:"#35384b"/> <text x="${dsleft - 50 + 6}" y="${dstop + dsheight - 6 + 20}" fill="#fff">出血位</text></g>`;
            const bloodTip = bloodTip1 + bloodTip2 + bloodTip3 + bloodTip4;

            tmpSvg.push(bloodTip);

            // 描绘出血位四角实线
            function drawSolidLine(x1, y1, x2, y2, id) {
                return `<line class="cornerLine ${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke: #aaa; stroke-width: 1"></line>`;
            };
        }

        tmpSvg.push(Ktu.element.SVGFOOTER);

        if ($('#editorMask').length <= 0) {
            const maskNode = `<div class="editor-mask" id="editorMask">${tmpSvg.join('')}</div>`;

            $('#ktuCanvasHolder').append(maskNode);
        } else {
            $('#editorMask svg').remove();
            $('#editorMask').append(tmpSvg.join(''));
        }

        // 控制出血位提示的位置且是否显示
        if ($('#bloodPath').length > 0 && $('.bloodTip').length > 0) {
            const that = this;
            let isShowEleDetail;

            if (Ktu.isShowEleDetail === undefined) {
                isShowEleDetail = true;
            } else {
                isShowEleDetail = Ktu.isShowEleDetail;
            }

            let left;
            if (isShowEleDetail) {
                left = 80 + 320 + that.documentPosition.left;
            } else {
                left = 80 + that.documentPosition.left;
            }
            const right = left + dswidth;
            const top = 60 + that.documentPosition.top;
            const bottom = top + dsheight;

            const editorLeft = Math.round(left + bloodPos.y / 2);
            const editorTop = Math.round(top + bloodPos.y / 2);
            const editorRight = Math.round(right - bloodPos.y / 2);
            const editorBottom = Math.round(bottom - bloodPos.y / 2);

            const centerPoint = {
                x: left + dswidth / 2,
                y: top + dsheight / 2,
            };

            // 利用mousemove来判断出血位的出现
            $('#editor').mousemove(e => {
                // 鼠标是否在出血位上
                if (left < e.clientX && e.clientX < right && top < e.clientY && e.clientY < bottom
                    && !(editorLeft < e.clientX && e.clientX < editorRight && editorTop < e.clientY && e.clientY < editorBottom)) {
                    $('.bloodTip').css('display', 'none');
                    $('.cornerLine').css('stroke', '#aaa');
                    // 判断是否在左上角
                    if (e.clientX < centerPoint.x && e.clientY < centerPoint.y) {
                        $('#bloodTip1').css('display', 'block');
                        $('.cornerLine1').css('stroke', '#ff7733');
                        // 判断是否在右上角
                    } else if (e.clientX > centerPoint.x && e.clientY < centerPoint.y) {
                        $('#bloodTip2').css('display', 'block');
                        $('.cornerLine2').css('stroke', '#ff7733');
                        // 判断是否在右下角
                    } else if (e.clientX > centerPoint.x && e.clientY > centerPoint.y) {
                        $('#bloodTip3').css('display', 'block');
                        $('.cornerLine3').css('stroke', '#ff7733');
                        // 判断是否在左下角
                    } else if (e.clientX < centerPoint.x && e.clientY > centerPoint.y) {
                        $('#bloodTip4').css('display', 'block');
                        $('.cornerLine4').css('stroke', '#ff7733');
                    }
                } else {
                    $('.bloodTip').css('display', 'none');
                    $('.cornerLine').css('stroke', '#aaa');
                }
            });
            $('#editor').mouseout(() => {
                $('.bloodTip').css('display', 'none');
                $('.cornerLine').css('stroke', '#aaa');
            });
        }

        this.drawGuideLines();
        this.drawResizeLines();
    },

    /* 页面内容超出线
     */
    drawGuideLines() {
        /* if (!this.hasSpecialGuideLines) {
           return;
           } */
        if (Ktu.ktuData.type === 101 || Ktu.ktuData.type === 310 || Ktu.ktuData.type === 311) {
            const width = this.documentSize.viewWidth;
            const height = this.documentSize.viewHeight;

            let left = this.documentPosition.viewLeft;
            const top = this.documentPosition.viewTop;

            const color1 = '#FF7733';
            const color2 = '#ECECEC';

            const style1 = `stroke:${color1}; stroke-width: 1px; stroke-dasharray:8 8;`;
            const style2 = `stroke:${color2}; stroke-width: 1px; stroke-dasharray:8 8; stroke-dashoffset:8`;

            let line = '';

            if (Ktu.ktuData.type === 101) {
                // 当模板为旧版公众号推送首图类型
                const _HEIGHT = 409 * this.scale;
                const padding = top + (height - _HEIGHT) / 2;

                line = `<line x1="${left}" y1="${padding}" x2="${left + width}" y2="${padding}" style="${style1}"></line>
                <line x1="${left}" y1="${padding + _HEIGHT}" x2="${left + width}" y2="${padding + _HEIGHT}" style="${style1}"></line>
                <line x1="${left}" y1="${padding}" x2="${left + width}" y2="${padding}" style="${style2}"></line>
                <line x1="${left}" y1="${padding + _HEIGHT}" x2="${left + width}" y2="${padding + _HEIGHT}" style="${style2}"></line>`;
            } else if (Ktu.ktuData.type === 310) {
                // 当模板为折页类型
                line = `<line x1="${Math.round(left + width / 2)}" y1="${top}" x2="${Math.round(left + width / 2)}" y2="${top + height}" style="${style1}"></line>
                <line x1="${Math.round(left + width / 2)}" y1="${top}" x2="${Math.round(left + width / 2)}" y2="${top + height}" style="${style2}"></line>`;
            } else if (Ktu.ktuData.type === 311) {
                const bloodPos = this.getPrintTypePosition(Ktu.ktuData.type);
                // 当模板为三折页类型
                left += bloodPos.x / 2;
                line = `<line x1="${Math.round(left + (width - bloodPos.x) / 3)}" y1="${top}" x2="${Math.round(left + (width - bloodPos.x) / 3)}" y2="${top + height}" style="${style1}"></line>
                <line x1="${Math.round(left + (width - bloodPos.x) / 3)}" y1="${top}" x2="${Math.round(left + (width - bloodPos.x) / 3)}" y2="${top + height}" style="${style2}"></line>
                <line x1="${Math.round(left + (width - bloodPos.x) / 3 * 2)}" y1="${top}" x2="${Math.round(left + (width - bloodPos.x) / 3 * 2)}" y2="${top + height}" style="${style1}"></line>
                <line x1="${Math.round(left + (width - bloodPos.x) / 3 * 2)}" y1="${top}" x2="${Math.round(left + (width - bloodPos.x) / 3 * 2)}" y2="${top + height}" style="${style2}"></line>`;
            }
            $('#editorMask svg')[0].innerHTML += line;
        }
    },

    /* 自定义页面，更改画布大小的拖拉线
     */
    drawResizeLines() {
        if (!this.hasResizeLines) {
            return;
        }
        const { scale } = this;

        const step = 12;

        const width = this.documentSize.viewWidth;
        const height = this.documentSize.viewHeight;

        const vleft = this.documentPosition.viewLeft + width + step;
        const vtop = this.documentPosition.viewTop;
        const hleft = this.documentPosition.viewLeft;
        const htop = this.documentPosition.viewTop + height + step;

        const hhandLeft = Math.round(width / 2);
        const vhandtop = Math.round(height / 2);

        if ($('.resize-line').length <= 0) {
            let handleNodeV = '';
            let handleNodeH = '';

            const regularSize = Ktu.utils.checkWorkSizeInEdit({
                width,
                height,
            });

            if (this.hasResizeLineV) {
                handleNodeV = `<div class="resize-line-v resize-line" style="width:1px;height:${height}px;left:${vleft}px;top:${vtop}px">
                                <div class="resize-handel" style="top:${vhandtop}px">
                                    <div class="resize-width">${parseInt(regularSize.width / scale, 10)}px</div>
                                    <div class="resize-tip">拖动调整画布宽度</div>
                                </div>
                            </div> `;
            }

            if (this.hasResizeLineH) {
                handleNodeH = `<div class="resize-line-h resize-line" style="width:${width}px;height:1px;left:${hleft}px;top:${htop}px">
                                <div class="resize-handel" style="left:${hhandLeft}px">
                                    <div class="resize-height">${parseInt(regularSize.height / scale, 10)}px</div>
                                    <div class="resize-tip">拖动调整画布高度</div>
                                </div>
                            </div> `;
            }
            const handleNode = `${handleNodeV}
                             ${handleNodeH}`;

            $('#ktuCanvasHolder').append(handleNode);

            this.initResizeHandleEvent();
        } else {
            $('.resize-line-v').css({
                height,
                left: vleft,
                top: vtop,
            });
            $('.resize-line-v .resize-handel').css({
                top: vhandtop,
            });
            $('.resize-line-h').css({
                width,
                left: hleft,
                top: htop,
            });
            $('.resize-line-h .resize-handel').css({
                left: hhandLeft,
            });
        }
    },

    initResizeHandleEvent() {
        const node = $('.resize-line');
        node.off('mousedown');
        $(document).off('mousemove.pageResize mouseup.pageResize');

        let isMove = false;
        let $this;
        let startPaint;
        let isH = false;
        let {
            scale,
        } = this;
        const editNode = $('#editorView');
        const that = this;
        const {
            unit,
        } = Ktu.ktuData.other;

        node.on('mousedown', function (ev) {
            isMove = true;
            $(this).addClass('isMove');
            startPaint = ev;
            $this = $(this);
            // 判断是否是调节宽度的那一条
            isH = $(this).hasClass('resize-line-v');
            if (!$('.edit-contextmenu').length) {
                ev.stopPropagation();
            }
        });

        $(document).on('mousemove.pageResize', ev => {
            if (isMove) {
                scale = that.scale;

                const {
                    isLockWH,
                } = Ktu.store.state.base;
                const ratio = Ktu.store.state.base.originalWHRatio;

                const viewStepX = ev.clientX - startPaint.clientX;
                const viewStepY = ev.clientY - startPaint.clientY;
                const stepX = viewStepX / scale;
                const stepY = viewStepY / scale;
                let width = that.documentSize.width + stepX;
                let height = that.documentSize.height + stepY;

                const resizeTipNode = $this.find('.resize-tip');
                const resizeWidth = $this.find('.resize-width');
                const resizeHeight = $this.find('.resize-height');
                const regularSize = Ktu.utils.checkWorkSizeInEdit({
                    width,
                    height,
                    isLockWH,
                    ratio,
                    isH,
                });

                if (!regularSize) {
                    return;
                }

                width = regularSize.width;
                height = regularSize.height;

                if (isH) {
                    editNode.width(width);
                    that.documentSize.width = width;
                    that.documentSize.viewWidth = width * scale;

                    if (isLockWH) {
                        /* editNode.height(height);
                        that.documentSize.height = height;
                        that.documentSize.viewHeight = height * scale; */
                        // this.$store.state.base.originalWHRatio = width / height;
                    }
                    const widthText = parseInt(width, 10);
                    if (widthText >= 10000) {
                        resizeWidth.addClass('big-width');
                        resizeWidth.text('到达最大值，建议新增页面');
                        resizeTipNode.hide();
                    } else {
                        resizeWidth.removeClass('big-width');
                        resizeWidth.text(`${widthText}px`);
                        resizeTipNode.hide();
                    }
                } else {
                    editNode.height(height);
                    that.documentSize.height = height;
                    that.documentSize.viewHeight = height * scale;

                    if (isLockWH) {
                        /* editNode.width(width);
                        that.documentSize.width = width;
                        that.documentSize.viewWidth = width * scale; */
                        // this.$store.state.base.originalWHRatio = width / height;
                    }

                    const heightText = parseInt(height, 10);
                    if (heightText >= 10000) {
                        resizeHeight.addClass('big-width');
                        resizeHeight.text('到达最大值，建议新增页面');
                        resizeTipNode.hide();
                    } else {
                        resizeHeight.removeClass('big-width');
                        resizeHeight.text(`${heightText}px`);
                        resizeTipNode.hide();
                    }
                }

                that.drawMaskSVG();

                startPaint = ev;
                ev.stopPropagation();
            }
        })
            .on('mouseup.pageResize', ev => {
                // debugger;
                that.documentSize.width = parseInt(that.documentSize.width, 10);
                that.documentSize.height = parseInt(that.documentSize.height, 10);
                that.documentSize.viewWidth = parseInt(that.documentSize.viewWidth, 10);
                that.documentSize.viewHeight = parseInt(that.documentSize.viewHeight, 10);
                const {
                    isLockWH,
                } = Ktu.store.state.base;

                const {
                    templateType,
                } = Ktu.store.state.base;

                if (isMove) {
                    isMove = false;

                    if (isH) {
                        $this.find('.resize-tip').text('拖动调整画布宽度');
                        Ktu.log('resizePage', 'handleR');
                    } else {
                        $this.find('.resize-tip').text('拖动调整画布高度');
                        Ktu.log('resizePage', 'handleB');
                    }
                    node.removeClass('isMove');

                    const {
                        width,
                    } = that.documentSize;
                    const {
                        height,
                    } = that.documentSize;

                    const originalSize = Ktu.utils.getOriginalSize({
                        width,
                        height,
                        unit,
                    });

                    const {
                        originalWidth,
                    } = originalSize;
                    const {
                        originalHeight,
                    } = originalSize;

                    if (isLockWH) {
                        Ktu.store.state.base.originalWHRatio = width / height;
                    }

                    Ktu.template.resizePage({
                        originalWidth,
                        originalHeight,
                        unit,
                        id: templateType,
                    }).then(() => {
                        /* const image = $('.background image');
                        const imageWidth = image.width();
                        const imageHeight = image.height();
                        const imageSize = imageWidth / imageHeight;
                        const documentSize = Ktu.edit.documentSize.width /  Ktu.edit.documentSize.height;
                        const backgroundImg = Ktu.selectedTemplateData.objects[0].image;
                        if (imageSize <= documentSize) {
                            console.log('c');
                            image[0].style.transform = `translate(0px, -${(imageHeight * (Ktu.edit.documentSize.width / imageWidth) - Ktu.edit.documentSize.height) / 2}px)`;
                            backgroundImg.top = -((imageHeight * (Ktu.edit.documentSize.width / imageWidth) - Ktu.edit.documentSize.height) / 2);

                            backgroundImg.width = Ktu.edit.documentSize.width;

                            backgroundImg.height = imageHeight * (Ktu.edit.documentSize.width / imageWidth);

                            backgroundImg.left =  0;

                            if (imageWidth <= Ktu.edit.documentSize.width) {
                                image.width('100%');
                                image.height(imageHeight * (Ktu.edit.documentSize.width / imageWidth));
                                image[0].style.transform = `translate(0px, -${(imageHeight * (Ktu.edit.documentSize.width / imageWidth) - Ktu.edit.documentSize.height) / 2}px)`;
                                backgroundImg.top = -((imageHeight * (Ktu.edit.documentSize.width / imageWidth) - Ktu.edit.documentSize.height) / 2);
                                backgroundImg.width = Ktu.edit.documentSize.width;
                                backgroundImg.height = imageHeight * (Ktu.edit.documentSize.width / imageWidth);
                                backgroundImg.left =  0;
                            } else {
                                image[0].style.transform = `translate(-${(imageWidth - Ktu.edit.documentSize.width) / 2}px, -${(imageHeight - Ktu.edit.documentSize.height) / 2}px)`;
                                backgroundImg.width = imageWidth;

                                backgroundImg.height = imageHeight * (Ktu.edit.documentSize.width / imageWidth);

                                backgroundImg.top = -(imageHeight - Ktu.edit.documentSize.height) / 2;
                                backgroundImg.left =  -(imageWidth - Ktu.edit.documentSize.width) / 2;
                            }
                        }
                        else if (imageSize > documentSize) {
                            console.log('b');

                            if (imageHeight <= Ktu.edit.documentSize.height) {
                                image.height('100%');
                                image.width(imageWidth * (Ktu.edit.documentSize.height / imageHeight));
                                image[0].style.transform = `translate(-${(imageWidth * (Ktu.edit.documentSize.height / imageHeight) - Ktu.edit.documentSize.width) / 2}px, 0px)`;
                                backgroundImg.width = imageWidth * (Ktu.edit.documentSize.height / imageHeight);

                                backgroundImg.height = Ktu.edit.documentSize.height;

                                backgroundImg.left = -(imageWidth * (Ktu.edit.documentSize.height / imageHeight) - Ktu.edit.documentSize.width) / 2;
                                backgroundImg.top =  0;
                            } else {
                                image[0].style.transform = `translate(-${(imageWidth - Ktu.edit.documentSize.width) / 2}px, -${(imageHeight - Ktu.edit.documentSize.height) / 2}px)`;
                                backgroundImg.width = imageWidth * (Ktu.edit.documentSize.height / imageHeight);

                                backgroundImg.height = imageHeight;

                                backgroundImg.top =  -(imageHeight - Ktu.edit.documentSize.height) / 2;
                                backgroundImg.left = -(imageWidth - Ktu.edit.documentSize.width) / 2;
                            }
                        } */
                    });
                }
            });
    },

    getTmpImageSize() {
        let w = Ktu.ktuData.other.width;
        let h = Ktu.ktuData.other.height;

        const maxRadius = 160;
        const radia = w / h;

        // 如果宽高比例极大，则直接用thumb.width
        if (this.getBigTmpImage && (radia < 200 && radia > 0.02)) {
            if (radia > 1) {
                h = maxRadius;
                w = h * radia;
            } else {
                w = maxRadius;
                h = w / radia;
            }
        } else {
            w = Ktu.thumb.width;
            h = Ktu.thumb.height;
        }

        return {
            w,
            h,
        };
    },

    getPageTmpPath(time = 1000, pageIndex = Ktu.template.currentPageIndex, isTest = false) {
        if (time && this.inrefreshTimer) {
            clearTimeout(this.inrefreshTimer);
        }

        if (!!Ktu.currentMulti) {
            Ktu.currentMulti.objects.forEach(item => {
                this.dirtyElekeys.push(item.objectId);
            });
        } else if (!!Ktu.selectedGroup) {
            this.dirtyElekeys.push(Ktu.selectedGroup.objectId);
        } else if (!!Ktu.selectedData && !!Ktu.selectedData.container) {
            this.dirtyElekeys.push(Ktu.selectedData.container.objectId);
        } else if (Ktu.activeObject) {
            this.dirtyElekeys.push(Ktu.activeObject.objectId);
        }

        const pageData = Ktu.templateData[pageIndex];
        // console.log(pageData);
        const promise = new Promise(resolve => {
            this.inrefreshTimer = setTimeout(() => {
                let count = 0;
                pageData.objects.forEach((item, i) => {
                    if (!!item.hasChange || !item.canvas || this.dirtyElekeys.indexOf(item.objectId) >= 0) {
                        count++;
                        item.initCanvas().then(ele => {
                            /* arr.push(ele.depth);
                               console.log(arr.sort( (a , b) => {return a-b})); */
                            count--;
                            if (count == 0) {
                                resolve();
                            }
                        });
                    }
                });
                if (count == 0) {
                    resolve();
                }
            }, time);
        }).then(() => {
            const width = this.getTmpImageSize().w;
            const height = this.getTmpImageSize().h;
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext('2d');
            // pageData.objects.unshift(Ktu.saveBackgroundAfterObj);
            pageData.objects.forEach(item => {
                if (item.canvas && item.canvas.nodeName.toLowerCase() === 'canvas') {
                    context.drawImage(item.canvas, 0, 0, width, height);
                }
            });
            const themeColor = Ktu.themeColor(canvas);
            const { colorArr } = themeColor;
            const color = new Ktu.Color();

            if (!!themeColor) {
                const topColor = colorArr[0];
                const themeColorList = [];
                Ktu.ktuData.tmpContents[pageIndex].themeColor = `rgb(${topColor[0]}, ${topColor[1]}, ${topColor[2]})`;
                for (let i = 0; i < colorArr.length; i++) {
                    const setItem = {
                        color: color._rgbToHsl(colorArr[i][0], colorArr[i][1], colorArr[i][2]).map(item => Math.round(item)),
                        weight: Math.round(Number(themeColor.weight[i])),
                    };

                    themeColorList.push(setItem);
                }
                Ktu.ktuData.tmpContents[pageIndex].themeColorList = JSON.stringify(themeColorList);
            } else {
                console.error('获取不到主题色');
            }
            const pngBase64 = canvas.toDataURL('image/png');
            this.dirtyElekeys = [];

            if (isTest) {
                const wrapHtml = $(`<div class="f_DNSTraffic" style="position:absolute;top:0;left:0;z-index:99"></div>`);
                wrapHtml.append(canvas);
                $('body').append(wrapHtml);
                return pngBase64;
            }
            return pngBase64;
        });

        return promise;
    },

    /* 刷新页面缩略图
       将svg节点转换为base64图片
        */
    refreshPageTmpImage(idx = Ktu.template.currentPageIndex) {
        this.getPageTmpPath().then(dataUrl => {
            if (idx === Ktu.template.currentPageIndex) {
                Ktu.ktuData.tmpContents[idx].tmpFilePath = dataUrl;
                this.editorImagePath = dataUrl;
            }
            Ktu.thumb.drawImage();
        });
    },

    getPageTmpImage() {
        const domclone = $('#editorView');

        const promise = new Promise((resolve, reject) => {
            domtoimage.toPng(domclone[0])
                .then(dataUrl => {
                    resolve(dataUrl);
                })
                .catch(error => {
                    console.error('编辑区缩略图加载出问题', error);
                    reject();
                });
        });

        return promise;
    },

    /* 刷新编辑区域节点
     */
    refreshEditDom() {
        this.calcEditInfo();

        this.setOutBox();
        this.setEditorBox();
        this.drawMaskSVG();
    },

    refreshContextMenu() {
        if ($('.edit-contextmenu').length) {
            Ktu.store.state.base.refreshContextMenu = true;
        }
    },

    /* 页面缩放后的回调
     */
    zoom(viewScale) {
        if (viewScale == this.scale) {
            return;
        }
        this.oldScale = this.scale;

        this.scale = viewScale;

        this.refreshEditDom();

        Ktu.thumb.refreshThumb();

        this.refreshContextMenu();
        this.afterZoom();
    },

    afterZoom() {
        if (this.afterZoomtimer) {
            clearTimeout(this.afterZoomtimer);
            this.afterZoomtimer = undefined;
        };
        // 在缩放之后，需要resize一下3D文字。
        this.afterZoomtimer = setTimeout(() => {
            Ktu.templateData.forEach((pageData, index) => {
                if (pageData && pageData.objects) {
                    pageData.objects.forEach((item, index) => {
                        if (item && item.type === 'threeText') {
                            item.resizePromise && item.resizePromise();
                        };
                    });
                }
            });
            clearTimeout(this.afterZoomtimer);
            this.afterZoomtimer = undefined;
        }, 400);
    },

    /* 1:1的缩放比例
     */
    zoomNoScale() {
        this.zoom(1);
    },

    /* 最合适的缩放比例
     */
    zoomFit() {
        this.setDimensions();
        this.zoom(this.fitZoom);
    },

    /* 页面缩小
     */
    zoomOut() {
        let viewScale = this.scale;

        viewScale -= .04;

        if (viewScale < this.minZoomRate) viewScale = this.minZoomRate;

        this.zoom(viewScale);
    },

    /* 页面放大
     */
    zoomIn() {
        let viewScale = this.scale;

        viewScale += .04;

        if (viewScale > this.maxZoomRate) viewScale = this.maxZoomRate;

        this.zoom(viewScale);
    },

    /**
     * 选择缩放比例
     */
    selectZoom(value) {
        let viewScale = value;
        viewScale = viewScale < this.minZoomRate ? this.minZoomRate : value;
        viewScale = viewScale > this.maxZoomRate ? this.maxZoomRate : value;

        this.zoom(viewScale);
    },

    /**
     * 快捷键操作页面的缩放和移位
     * arg ev ：键盘时间event
     * isRegThumbEvent 是否已经绑定了操作事件
     */
    isRegThumbEvent: false,
    addViewportEvent(ev) {
        if (this.isRegThumbEvent) {
            return;
        }

        this.isRegThumbEvent = true;

        const editArea = $('#editArea');

        const keyCode = ev.code;
        editArea.css('cursor', '-webkit-grab');

        if (ev.code == 'Space' || ev.code == 'AltLeft' || ev.code == 'AltRight') {
            // 取消firefox的默认行为
            ev.preventDefault();
            this.spaceKeyDown = true;
            this.isMoveMode = true;
            // 屏蔽掉中间部分的hover
            $('#editor').css('pointerEvents', 'none');

            let isDrop = false;
            let isMove = false;

            editArea.on('mousedown.thumbMove', ev => {
                Ktu.thumb.grabStart(ev);
                isDrop = true;
                ev.stopPropagation();
            }).on('mousemove.thumbMove', ev => {
                if (isDrop) {
                    isMove = true;
                    Ktu.thumb.grabing(ev, false);
                }
                ev.stopPropagation();
            })
                .on('mouseup.thumbMove mouseleave.thumbMove', ev => {
                    Ktu.thumb.grabEnd(ev);

                    if (isMove) {
                        switch (keyCode) {
                            case 'Space':
                                Ktu.log('keyboard', 'moveCanvas_space');
                                break;
                            case 'ControlLeft' || 'ControlRight':
                                Ktu.log('keyboard', 'moveCanvas_ctrl');
                                break;
                            default:
                                Ktu.log('keyboard', 'moveCanvas_alt');
                                break;
                        }
                        Ktu.store.commit('msg/hideManipulatetip', 'isShowDrapTip');
                    }
                    isDrop = false;
                    isMove = false;
                });
        }

        editArea.on('wheel', event => {
            this.mousePosition = {
                pageX: event.pageX,
                pageY: event.pageY,
            };
            // webkit浏览器
            if (event.originalEvent.wheelDelta) {
                if (event.originalEvent.wheelDelta > 0) {
                    Ktu.edit.zoomIn();
                } else {
                    Ktu.edit.zoomOut();
                }
                // 兼容firefox浏览器
            } else if (event.originalEvent.deltaY) {
                if (event.originalEvent.deltaY < 0) {
                    Ktu.edit.zoomIn();
                } else {
                    Ktu.edit.zoomOut();
                }
            }

            switch (keyCode) {
                case 'Space':
                    Ktu.log('keyboard', 'scaleCanvas_space');
                    break;
                case 'ControlLeft' || 'ControlRight':
                    Ktu.log('keyboard', 'scaleCanvas_ctrl');
                    break;
                default:
                    Ktu.log('keyboard', 'scaleCanvas_alt');
                    break;
            }

            Ktu.store.commit('msg/hideManipulatetip', 'isShowScrollTip');

            event.preventDefault();
            event.stopPropagation();
        });
    },

    /**
     * 移除快捷键操作页面的缩放和移位
     */
    exitViewportEvent() {
        this.isRegThumbEvent = false;
        this.isMoveMode = false;
        this.spaceKeyDown = false;
        $('#editArea').off('wheel mousedown.thumbMove mousemove.thumbMove mouseup.thumbMove mouseleave.thumbMove');
        $('#editArea').css('cursor', 'default');
        $('#editor').css('pointerEvents', 'auto');
    },

    /**
     * 获取出血位的x,y坐标
     */
    getPrintTypePosition(type) {
        const DPI = 96;
        let objPos = {
            x: 0,
            y: 0,
        };
        if (type === 301 || type === 309) {
            objPos = {
                x: 2 * DPI / 25.4 + 2,
                y: 2 * DPI / 25.4 + 2,
            };
        } else if (type === 300 || type === 307 || type === 306 || type === 305
            || type === 302 || type === 303 || type === 304 || type === 308 || type === 310
            || type === 311 || type === 403 || type === 407 || type === 408) {
            objPos = {
                x: 6 * DPI / 25.4 + 2,
                y: 6 * DPI / 25.4 + 2,
            };
        }
        return objPos;
    },

    /**
     * 获取文本粘贴中心点
     */
    getDocumentViewCenter(originalWidth, originalHeight, newWidth, newHeight) {
        // 获取编辑区域的右下角坐标
        let rightBottomY;
        let rightBottomX;

        // 当偏移量 + 编辑空白的高小于外面的编辑时
        if (this.documentPosition.top + this.documentSize.viewHeight <= this.size.height && this.documentPosition.top > 0) {
            rightBottomY = this.documentPosition.viewTop + this.documentSize.viewHeight;
        } else {
            // 如果当偏移量大于0时证明白色区域还在编辑内
            if (this.documentPosition.top > 0) {
                rightBottomY = this.size.height + this.documentPosition.viewTop - this.documentPosition.top;
            } else {
                // 白色区域完全充满整个编辑区
                if (this.size.height + this.documentPosition.viewTop - this.documentPosition.top < this.documentPosition.viewTop + this.documentSize.viewHeight) {
                    rightBottomY = this.size.height + this.documentPosition.viewTop - this.documentPosition.top * 2;
                } else {
                    rightBottomY = this.documentPosition.viewTop + this.documentSize.viewHeight - this.documentPosition.top;
                }
            }
        }

        // 与上面同理
        if (this.documentPosition.left + this.documentSize.viewWidth <= this.size.width && this.documentPosition.left > 0) {
            rightBottomX = this.documentPosition.viewLeft + this.documentSize.viewWidth;
        } else {
            if (this.documentPosition.left > 0) {
                rightBottomX = this.size.width + this.documentPosition.viewLeft - this.documentPosition.left;
            } else {
                if (this.size.width + this.documentPosition.viewLeft - this.documentPosition.left < this.documentPosition.viewLeft + this.documentSize.viewWidth) {
                    rightBottomX = this.size.width + this.documentPosition.viewLeft - this.documentPosition.left * 2;
                } else {
                    rightBottomX = this.documentPosition.viewLeft + this.documentSize.viewWidth - this.documentPosition.left;
                }
            }
        }

        const center = {};
        center.x = ((rightBottomX - this.documentPosition.viewLeft) * originalWidth / this.documentSize.viewWidth - newWidth) / 2;
        center.y = ((rightBottomY - this.documentPosition.viewTop) * originalHeight / this.documentSize.viewHeight - newHeight) / 2;
        return center;
    },
};
