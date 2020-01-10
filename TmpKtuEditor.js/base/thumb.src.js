function Thumb() {
    this.spacePadding = Ktu.edit.spacePadding;

    this.initThumb();
};

Thumb.prototype = {
    show: true,

    initThumb() {
        this.thumbContainer = $('#editThumb');

        this.thumbNode = $('#viewNavigator');

        this.thumbTrigger = $('#thumb-trigger');

        this.upperMaskCanvas = $('#naviCanvas')[0];

        this.upperMaskCanvasCtx = this.upperMaskCanvas.getContext('2d');

        this.thumbZoom = Ktu.edit.thumbZoom;

        this.setBox();

        this.refreshThumb();

        this.drawImage();
    },
    /**
     * 刷新缩略图节点
     */
    refreshThumb() {
        this.scale = Ktu.edit.scale;

        if (Ktu.edit.editBox.width == Ktu.edit.size.width && Ktu.edit.editBox.height == Ktu.edit.size.height) {
            this.thumbContainer.hide();
        } else {
            this.thumbContainer.show();
            this.drawMaskCanvas();
        }
    },

    /**
     * 初始化thumb外框的大小和遮罩canvas大小
     */
    setBox() {
        const boxwidth = Math.round(Ktu.edit.documentSize.width * this.thumbZoom + 2 * this.spacePadding);
        const boxheight = Math.round(Ktu.edit.documentSize.height * this.thumbZoom + 2 * this.spacePadding);

        this.upperMaskCanvas.width = boxwidth;
        this.upperMaskCanvas.height = boxheight;

        this.width = boxwidth;
        this.height = boxheight;

        this.thumbNode.css({
            width: boxwidth,
            height: boxheight,
        });
    },

    /**
     * 画遮罩canvas上的可以区域所对应的矩形
     */
    drawMaskCanvas() {
        const ctx = this.upperMaskCanvasCtx;
        const { upperMaskCanvas } = this;
        ctx.save();
        ctx.clearRect(0, 0, upperMaskCanvas.width, upperMaskCanvas.height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
        ctx.lineWidth = .8;

        const zoom = this.scale / this.thumbZoom;

        const thumbEditView = {
            x: -Ktu.edit.editBox.left / zoom,
            y: -Ktu.edit.editBox.top / zoom,
            w: Ktu.edit.size.width / zoom,
            h: Ktu.edit.size.height / zoom,
        };

        ctx.fillRect(0, 0, upperMaskCanvas.width, upperMaskCanvas.height);
        ctx.clearRect(thumbEditView.x, thumbEditView.y, thumbEditView.w, thumbEditView.h);
        ctx.restore();
    },

    /**
     * 刷新缩略图图片
     */
    drawImage() {
        const thumbImage = this.thumbNode.find('#thumbImage')[0];

        thumbImage.src = Ktu.edit.editorImagePath;
    },

    /**
     * 切换缩略图的显示隐藏
     */
    triggerThumb() {
        if (this.show) {
            this.show = false;
            this.thumbNode.addClass('hide-thumb');
        } else {
            this.show = true;
            this.thumbNode.removeClass('hide-thumb');
        }
        Ktu.log('thumb', this.show ? 'open' : 'close');
    },

    grabStart(position) {
        this.isGraping = true;

        this.forePosition = position;
    },
    grabing(position, inThumb = true) {
        if (this.isGraping && this.forePosition) {
            const step = {
                x: position.clientX - this.forePosition.clientX,
                y: position.clientY - this.forePosition.clientY,
            };
            this.forePosition = position;

            const stepX = inThumb ? -(step.x / this.thumbZoom) : step.x;
            const stepY = inThumb ? -(step.y / this.thumbZoom) : step.y;

            Ktu.edit.editBox.left += stepX;
            Ktu.edit.editBox.top += stepY;

            Ktu.edit.editBox.left = Math.min(Ktu.edit.editBox.left, 0);
            Ktu.edit.editBox.top = Math.min(Ktu.edit.editBox.top, 0);
            Ktu.edit.editBox.left = Math.max(Ktu.edit.editBox.left, (Ktu.edit.size.width - Ktu.edit.editBox.width));
            Ktu.edit.editBox.top = Math.max(Ktu.edit.editBox.top, (Ktu.edit.size.height - Ktu.edit.editBox.height));

            this.drawMaskCanvas();

            Ktu.edit.calcDocumentPosition();
            Ktu.edit.setOutBox();
        }
    },
    grabEnd(position) {
        console.log('grabEnd');
        this.isGraping = false;

        this.forePosition = null;
        Ktu.store.commit('msg/showManipulatetip', 'isShowDrapTip');

        Ktu.lastAddImgScale = -1;
        Ktu.recordAddNum = 0;

        Ktu.log('thumb', 'move');

        Ktu.edit.refreshContextMenu();
    },

};
