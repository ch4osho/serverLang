Ktu.mixins.artQrCode = {
    data() {
        return {
            isArtQrCode: false,
            // 用于标识点击的样式，进入loading
            selectedArtId: null,
            startTime: '',
            isCancel: false,
            qrCodeTimer: null,
        };
    },
    computed: {
        selectedStyleIdx: {
            get() {
                return this.$store.state.base.selectedStyleIdx;
            },
            set(value) {
                this.$store.state.base.selectedStyleIdx = value;
            },
        },
        artQrCodeOptions: {
            get() {
                return this.$store.state.base.artQrCodeOptions;
            },
            set(value) {
                console.log('123');
                this.$store.state.base.artQrCodeOptions = value;
            },
        },
    },
    methods: {
        // 描绘圆角矩形
        drawRoundRect(content, x, y, w, h, r) {
            const minSize = Math.min(w, h);
            if (r > minSize / 2) r = minSize / 2;
            // 开始绘制
            content.beginPath();
            content.moveTo(x + r, y);
            content.arcTo(x + w, y, x + w, y + h, r);
            content.arcTo(x + w, y + h, x, y + h, r);
            content.arcTo(x, y + h, x, y, r);
            content.arcTo(x, y, x + w, y, r);
            content.closePath();
        },
        createArtQrCode(options) {
            return new Promise((resolve, reject) => {
                // 存放所有 promise 的状态
                const qr = [];
                const UIscource = new Array(9);
                if (!options.styleItem) reject();
                const imgList = options.styleItem.content.foreground.imgUrlList;
                // 加载素材文件
                const promiseFn = i => new Promise((resolve, reject) => {
                    const img = new Image();
                    img.setAttribute('crossOrigin', 'anonymous');
                    img.src = imgList[i];
                    UIscource[i] = img;
                    if (this.isCancel) {
                        reject();
                    }
                    img.onload = () => {
                        resolve();
                    };
                });
                for (let i = 0; i < imgList.length; i++) {
                    if (imgList[i] === '') continue;
                    const promise = promiseFn(i);
                    qr.push(promise);
                }
                Promise.all(qr)
                    .then(() => {
                        const promise2 = new Promise((resolve, reject) => {
                            new ArtQRCode(options.dom, {
                                text: options.text,
                                // 插件会把这个高宽放大两倍
                                width: options.width,
                                height: options.height,
                                top: 0,
                                left: 0,
                                // 对应每种遍历情况的填充图案
                                eye: UIscource[0] ? UIscource[0] : '',
                                col2: UIscource[1] ? UIscource[1] : '',
                                row4: UIscource[2] ? UIscource[2] : '',
                                row3: UIscource[3] ? UIscource[3] : '',
                                row2col3: UIscource[4] ? UIscource[4] : '',
                                row3col2: UIscource[5] ? UIscource[5] : '',
                                row2col2: UIscource[6] ? UIscource[6] : '',
                                corner: UIscource[7] ? UIscource[7] : '',
                                single: UIscource[8] ? UIscource[8] : '',
                                isBeautify: imgList.length > 0,
                            });
                            if (this.isCancel) {
                                reject();
                            };
                            resolve();
                        });

                        promise2
                            .then(() => {
                                const canvas = options.dom.querySelector('canvas');
                                options.data = canvas.toDataURL();
                                this.createBorder && this.createBorder(options);
                            })
                            .then(() => {
                                resolve();
                            })
                            .catch(err => {
                                console.log(err);
                                console.log('cancel generating art qrCode');
                            });
                    })
                    .catch(err => {
                        console.log('cancel generating art qrCode');
                    });
            });
        },
        useArtQrCode(options, callback, event) {
            const tmpId = /_h$/.test(options.styleItem.id) ? Number(options.styleItem.id.replace(/_h$/, '')) : Number(options.styleItem.id);
            if (tmpId !== this.selectedStyleIdx || !this.isArtQrCode) {
                if (event) {
                    let dataKey;
                    if (event.target.nodeName === 'IMG' || event.target.className === 'corner') {
                        dataKey = event.target.parentElement.getAttribute('data-key');
                    } else {
                        dataKey = event.target.getAttribute('data-key');
                    }
                    this.selectedArtId = /_h$/.test(dataKey) ? dataKey : Number(dataKey);
                }
                this.startTime = new Date().getTime();
                this.qrCodeTimer = setTimeout(() => {
                    this.createArtQrCode(options)
                        .then(() => {
                            callback && callback();
                        })
                        .catch(() => {
                            console.log('cancel generating art qrCode');
                        });
                }, 1000);

                this.isArtQrCode = true;
            } else {
                this.createArtQrCode(options)
                    .then(() => {
                        this.startTime = new Date().getTime();
                    })
                    .catch(() => {
                        console.log('cancel generating art qrCode');
                    });
            }
        },
        // 添加二维码样式历史
        addQrCodeHistory(styleItem) {
            const url = '../ajax/artQrcode_h.jsp?cmd=addHistory';

            const styleId = typeof styleItem.id === 'string' ? Number(styleItem.id.replace(/_h$/, '')) : styleItem.id;

            // 历史没有才添加进历史
            let isInHistory = false;
            for (let i = 0; i < this.historyStyleList.length; i++) {
                const id = Number(this.historyStyleList[i].id.replace(/_h$/, ''));
                if (id === styleId) {
                    isInHistory = true;
                } else {
                    continue;
                }
            }

            if (!isInHistory) {
                axios
                    .post(url, {
                        ktuId: Ktu.ktuData.id,
                        qrcodeId: styleId,
                    })
                    .then(() => {
                        const styleItemClone = typeof styleItem.id === 'string' ? styleItem : Object.assign({}, styleItem, { id: `${styleItem.id}_h` });
                        this.historyStyleList.length >= 4 && this.historyStyleList.pop();
                        this.historyStyleList.unshift(styleItemClone);
                    })
                    .catch(err => {
                        console.log(err);
                    })
                    .finally();
            }
        },
        // 获取二维码样式历史
        getQrCodeHistory() {
            const url = '../ajax/artQrcode_h.jsp?cmd=getHistory';

            axios
                .post(url, {
                    ktuId: Ktu.ktuData.id,
                    // 历史的个数，后端会存够100个，看ui图似乎4个就够了，那就传个4呗
                    num: '4',
                })
                .then(res => {
                    this.historyStyleList = res.data.infoList.slice(0, 4).map(item => {
                        item.id = `${item.id}_h`;
                        item.qrCodeIdentifier = `${item.qrCodeIdentifier}_h`;
                        return item;
                    });

                    // 去重
                    for (let i = 0; i < this.historyStyleList.length; i++) {
                        for (let j = i + 1; j < this.historyStyleList.length; j++) {
                            if (this.historyStyleList[i].id === this.historyStyleList[j].id) {
                                this.historyStyleList.splice(j, 1);
                                j--;
                            }
                        }
                    }
                })
                .catch(err => {
                    console.log(err);
                })
                .finally();
        },
        logFn() {
            const timeDiff = (new Date().getTime() - this.startTime) / 1000;
            if (timeDiff < 2) {
                Ktu.simpleLog('artQrCodeTimer', 'lessTwoSec');
                Ktu.simpleLog('artQrCodeTimerKTE', 'lessTwoSec');
            } else if (timeDiff >= 2 && timeDiff < 3) {
                Ktu.simpleLog('artQrCodeTimer', 'twoToThreeSec');
                Ktu.simpleLog('artQrCodeTimerKTE', 'twoToThreeSec');
            } else if (timeDiff >= 3 && timeDiff < 4) {
                Ktu.simpleLog('artQrCodeTimer', 'threeToFourSec');
                Ktu.simpleLog('artQrCodeTimerKTE', 'threeToFourSec');
            } else if (timeDiff >= 4 && timeDiff < 5) {
                Ktu.simpleLog('artQrCodeTimer', 'fourToFiveSec');
                Ktu.simpleLog('artQrCodeTimerKTE', 'fourToFiveSec');
            } else if (timeDiff > 5) {
                Ktu.simpleLog('artQrCodeTimer', 'overFiveSec');
                Ktu.simpleLog('artQrCodeTimerKTE', 'overFiveSec');
            }
            this.startTime = null;
        },
        dataKeyFilter(event) {
            let dataKey;
            if (event.target.nodeName === 'IMG' || event.target.className === 'corner') {
                if (/_h$/.test(event.target.parentElement.getAttribute('data-key'))) {
                    dataKey = event.target.parentElement.getAttribute('data-key');
                } else {
                    dataKey = Number(event.target.parentElement.getAttribute('data-key'));
                }
            } else {
                if (/_h$/.test(event.target.getAttribute('data-key'))) {
                    dataKey = event.target.getAttribute('data-key');
                } else {
                    dataKey = Number(event.target.getAttribute('data-key'));
                }
            }

            return dataKey;
        },
    },
};
