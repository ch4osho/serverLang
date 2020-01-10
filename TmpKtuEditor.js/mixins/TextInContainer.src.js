// 用于计算文字容器内的文字显示大小 以及要加载的文字的方法
Ktu.mixins.textInContainer = {
    methods: {
        computedTextSize(res) {
            return new Promise(((resolve, reject) => {
                try {
                    const ops = {
                        text: '双击输入文字',
                        fontSize: 0,
                        textWidth: 300,
                        scaleX: 1 / (Ktu.ktuData.other.width / 720),
                        scaleY: 1 / (Ktu.ktuData.other.width / 720),
                    };
                    if (res.position) {
                        ops.position = res.position;
                    }
                    const boxWidth = res.width * res.scaleX;
                    const boxHeight = res.height * res.scaleY;
                    const aspectRatio = boxWidth / boxHeight;
                    if (aspectRatio > 1) {
                        // 乘于画板缩放再乘于0.2
                        ops.fontSize = boxHeight * 0.2;
                        if (ops.textWidth / boxWidth > 0.6) {
                            ops.textWidth = boxWidth * 0.6;
                        }
                    } else {
                        ops.fontSize = boxWidth * 0.15;
                        if (ops.textWidth / boxWidth > 1) {
                            ops.textWidth = boxWidth * 1;
                        }
                    }
                    resolve(ops);
                } catch (err) {
                    reject(err);
                }
            }));
        },
        addTextToCont(options) {
            Ktu.element.addModule('textbox', {
                text: options.text,
                fontSize: options.fontSize,
                width: options.textWidth,
                scaleX: options.scaleX,
                scaleY: options.scaleY,
                // 注意考虑当前缩放的比例
                left: options.position ? options.position.left : undefined,
                top: options.position ? options.position.top : undefined,
                color: '#345',
            });
        },
    },
};
