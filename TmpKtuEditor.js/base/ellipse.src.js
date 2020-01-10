class Ellipse extends TheElement {
    constructor(data) {
        super(data);
        this.fill = data.fill;
        this.scaleX = data.scaleX || 1;
        this.scaleY = data.scaleY || 1;
        this.isOpenStroke = data.isOpenStroke;
        this.isOpenColor = data.isOpenColor;
        this.scaleProp = 'wh';
        this.fileId = data.fileId;
        this.hoverTip = '双击换图';
    }
    onDoubleClick() {
        if (!!this.group) {
            return;
        }
        if (!this.isClipping) {
            // this.enterClipMode();
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
    toSvg(isAllInfo) {
        if (!this.visible) {
            return '';
        }
        const shaodwStr = this.getShadow();
        const _shadowId = `shadow_${this.objectId}`;

        const gStyle = isAllInfo ? `transform="translate(${this.left} ${this.top}) rotate(${this.angle}) scale(${this.scaleX} ${this.scaleY})" opacity="${this.opacity}"` : '';
        const fillStr = Ktu.element.getRgb('fill', this.fill, this).str;
        const g = `${shaodwStr}
                <defs>${Ktu.element.getGradient('fill', this.fill, this)}</defs>
                <g  ${gStyle}>
                    <g ${this.isOpenShadow ? `style="filter:url(#${_shadowId})"` : ''}>
                    <ellipse transform="translate(${this.strokeWidth / 2} ${this.strokeWidth / 2})" style="${fillStr} ${this.getSvgStrokeStyle()}" cx="${this.width / 2}" cy="${this.height / 2}" rx="${this.width / 2}" ry="${this.height / 2}"></ellipse>
                    </g>
                </g>`;

        let svgHtml = '';
        if (!isAllInfo) {
            const dimensions = this.getDimensions();
            svgHtml = `
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
    toObject() {
        const elementObj = TheElement.toObject(this);
        return _.assignIn(elementObj, {
            fill: this.fill,
        });
    }
};
