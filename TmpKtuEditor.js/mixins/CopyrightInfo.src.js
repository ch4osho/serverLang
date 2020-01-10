
Ktu.mixins.copyright = {
    data() {
        return {
            copyrightArr: [0, 1, 4],
            showCopyright: false,
            activeMaterial: null,
            copyrightPosition: null,
            closeInfoTimer: null,
            showCopyrightTimer: null,
        };
    },
    methods: {
        hoverCopyrightBtn(event, item) {
            // 每次进来前先清除定时器
            clearTimeout(this.showCopyrightTimer);
            // 延迟0.4s后出现
            this.showCopyrightTimer = setTimeout(() => {
                this.showCopyrightInfo(event, item);
            }, 400);
        },
        wantToCloseInfo() {
            clearTimeout(this.showCopyrightTimer);
            this.closeInfoTimer = setTimeout(() => {
                this.closeCopyrightInfo();
            }, 200);
        },
        showCopyrightInfo(event, item) {
            // 再次点击关闭
            if (this.activeMaterial == item) {
                this.closeCopyrightInfo();
                return;
            }
            // 如果有其他激活的 先把它取消
            this.activeMaterial && (this.activeMaterial.showCopyright = false);

            this.computedCopyrightPosition(event, item);
        },
        computedCopyrightPosition(event, item) {
            const { target } = event;
            const position = target.getBoundingClientRect();
            let left = 0;
            const top = position.top - 44;
            if (position.left > 150) {
                left = 96;
            } else {
                left = position.left - 80;
            }
            this.copyrightPosition = {
                left: `${left}px`,
                top: `${top}px`,
            };
            this.showCopyright = true;
            this.activeMaterial = item;
            this.activeMaterial.showCopyright = true;
            // document.addEventListener('click', this.closeCopyrightInfo);
        },
        closeCopyrightInfo() {
            clearTimeout(this.showCopyrightTimer);
            clearTimeout(this.closeInfoTimer);
            this.showCopyright = false;
            this.activeMaterial && (this.activeMaterial.showCopyright = false);
            this.activeMaterial = null;
            // document.removeEventListener('click', this.closeCopyrightInfo);  
        },
        enterCopyrightInfo() {
            clearTimeout(this.closeInfoTimer);
        },
    },
};
