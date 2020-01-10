(function () {
    class IndexedDB {
        constructor() {
            this.DB_NAME = 'ktu';
            this.DB_VERSION = 1;
            this.DB_STORE_NAME = 'fonts';
            this.DB = null;
            this.fontList = [];
            this.isOpened = false;
            this.downloadPromiseList = [];
            this.loadingFontList = [];
            this.limit = 30;
            this.LRU = [];
            this.allFontList = Ktu.initialData.flyerFontList.concat([
                /* {
                   id: -2,
                   cname: 'seguiemj_2',
                   nodeName: 'Segoe UI Emoji',
                   }, */
                {
                    id: -3,
                    cname: 'Symbola',
                    nodeName: 'Symbola',
                },
            ]);
            // 开启数据库
            this.openPromise = this.openIndexedDB('fonts', [{
                key: 'fontName',
                unique: true,
            }, {
                key: 'file',
                unique: true,
            }]);
        }

        // 是否支持indexedDB
        isSupport() {
            if (!window.indexedDB) {
                return false;
            }
            return true;
        }

        // 新建或者开启数据库
        openIndexedDB(DB_STORE_NAME, DB_ARGUMENT) {
            return new Promise((resolve, reject) => {
                if (!DB_STORE_NAME && !this.isSupport()) {
                    reject();
                    return;
                }
                const request = window.indexedDB.open(this.DB_NAME, this.DB_VERSION);

                const that = this;

                request.onerror = function (event) {
                    that.isOpened = false;
                    reject();
                    console.log(`${that.DB_NAME}字体数据库打开失败!`);
                };

                request.onsuccess = function (event) {
                    // 获取全部字体
                    that.DB = this.result;
                    // getAll('fonts');
                    that.isOpened = true;
                    resolve();
                    // console.log(`${that.DB_NAME}字体数据库打开成功!`);
                };

                request.onupgradeneeded = function (event) {
                    const db = event.target.result;

                    if (!db.objectStoreNames.contains(DB_STORE_NAME)) {
                        const store = event.target.result.createObjectStore(
                            DB_STORE_NAME, {
                            keyPath: 'fontId',
                            autoIncrement: false,
                        });

                        DB_ARGUMENT.forEach(item => {
                            store.createIndex(item.key, item.key, {
                                unique: item.unique || true,
                            });
                        });
                    }
                };

                // 获取所有的字体文件数据
                function getAll(DB_STORE_NAME) {
                    const store = that.getObjectStore(DB_STORE_NAME, 'readwrite');

                    const request = store.openCursor();
                    that.fontList = [];

                    request.onerror = function (event) {
                        reject();
                        console.log('读取失败!');
                    };

                    request.onsuccess = function (event) {
                        const cursor = event.target.result;
                        const promiseList = [];

                        if (cursor) {
                            // 验证版本是否最新
                            const font = Ktu.fontList.find(item => item.id == cursor.value.fontId) || {};
                            if (font && font.version == cursor.value.version) {
                                that.fontList.push({
                                    fontId: cursor.value.fontId,
                                    fontName: cursor.value.fontName,
                                    file: cursor.value.file,
                                });
                            } else {
                                promiseList.push(that.clear(font.id));
                            }

                            cursor.continue();
                        } else {
                            that.isOpened = true;
                            Promise.all(promiseList).then(() => {
                                resolve();
                            });
                        }
                    };
                }
            });
        }

        // 删除数据库
        deleteDatabase(DB_STORE_NAME) {
            this.DB.deleteDatabase(DB_STORE_NAME);
        }

        // 通过事务获取数据库实例
        getObjectStore(DB_STORE_NAME, mode) {
            const tx = this.DB.transaction(DB_STORE_NAME, mode);
            return tx.objectStore(DB_STORE_NAME);
        }

        // 清除数据库
        clearObjectStore(DB_STORE_NAME) {
            const store = this.getObjectStore(DB_STORE_NAME, 'readwrite');
            const request = store.clear();

            request.onsuccess = function (event) {
                console.log('清除成功!');
            };

            request.onerror = function (event) {
                console.log('清除失败!');
            };
        }

        getBlob(key, DB_STORE_NAME, callback) {
            const request = DB_STORE_NAME.get(key);

            request.onsuccess = function (event) {
                const value = event.target.result;
                if (value) callback(value.blob);
            };
        }

        // 增加字体文件
        add(DB_STORE_NAME, object) {
            return new Promise((resolve, reject) => {
                this.getAll().then(() => {
                    const store = this.getObjectStore(DB_STORE_NAME, 'readwrite');

                    const request = store.add(object);
                    const that = this;

                    request.onsuccess = function (event) {
                        // 顺带加载字体
                        if (!that.hasFont(object.fontId)) {
                            that.blobToArrayBuffer(object.file, object.fontId).then(file => {
                                const fontFace = new FontFace(object.fontName, file);
                                fontFace.load().then(loadedFace => {
                                    document.fonts.add(loadedFace);

                                    // 插入字体列表
                                    that.addFont(object);
                                    resolve();
                                });
                            });
                        }
                        // console.log('缓存字体成功!');
                    };
                    request.onerror = function (event) {
                        console.log('缓存字体失败!');
                        reject();
                    };
                });
            });
        }

        // 获取某个数据
        get(DB_STORE_NAME, fontId = 58) {
            return new Promise((resolve, reject) => {
                if (!this.isOpened) {
                    reject();
                    return;
                }
                const store = this.getObjectStore(DB_STORE_NAME, 'readwrite');
                const request = store.get(fontId);
                const that = this;

                request.onerror = function (event) {
                    reject();
                    console.log('读取失败!');
                };

                request.onsuccess = function (event) {
                    if (request.result) {
                        // 验证版本是否最新
                        const font = Ktu.fontList.find(item => item.id == fontId) || {};

                        if (font && font.version == request.result.version && request.result.file.type) {
                            resolve(request.result);
                            that.updateCachetTime(fontId);
                        } else {
                            if (!request.result.file.type) {
                                // 先暴力清除下所有的数据(arrayBuffer)
                                that.clearAll().then(() => {
                                    that.downloadFont(fontId);
                                });
                            } else {
                                that.clear(fontId).then(() => {
                                    that.downloadFont(fontId);
                                });
                            }
                            resolve();
                        }

                        // console.log(`数据读取成功!`);
                    } else {
                        that.downloadFont(fontId);
                        resolve();
                        // console.log('未获得数据记录!');
                    }
                };
            });
        }

        // 查找fontList的字体
        findFont(fontId) {
            return this.fontList.find(item => item.fontId == fontId) || {};
        }

        // 判断是否有字体缓存
        hasFont(fontId) {
            return this.fontList.some(item => item.fontId == fontId);
        }

        // 增加已缓存字体
        addFont(object) {
            if (!this.hasFont(object.fontId)) {
                this.fontList.push({
                    fontId: object.fontId,
                    fontName: object.fontName,
                    version: object.version,
                    time: object.time,
                });
            }
        }

        // 获取缓存字体的总数目，做一个限制
        getAll() {
            return new Promise((resolve, reject) => {
                const store = this.getObjectStore(this.DB_STORE_NAME, 'readwrite');
                const request = store.openCursor();
                const that = this;

                request.onerror = function (event) {
                    reject();
                    console.log('读取失败!');
                };

                request.onsuccess = function (event) {
                    const cursor = event.target.result;

                    if (cursor) {
                        if (!that.LRU.some(item => item.fontId == cursor.value.fontId)) {
                            that.LRU.push({
                                fontId: cursor.value.fontId,
                                fontName: cursor.value.fontName,
                                time: cursor.value.time,
                            });
                        }
                        cursor.continue();
                    } else {
                        // 做一个数量限制
                        if (that.LRU.length >= that.limit) {
                            that.LRU.sort((a, b) => a.time - b.time);

                            const {
                                fontId,
                            } = that.LRU[0];

                            that.LRU = that.LRU.filter(item => item.fontId != fontId);
                            that.clear(fontId).then(() => {
                                resolve();
                            });
                        } else {
                            resolve();
                        }
                    }
                };
            });
        }

        // 更新使用缓存时间
        updateCachetTime(fontId) {
            const objectStore = this.getObjectStore(this.DB_STORE_NAME, 'readwrite');
            const request = objectStore.get(fontId);

            request.onerror = function (event) {
                // 错误处理
                console.log('读取失败!');
            };

            request.onsuccess = function (event) {
                // 获取我们想要更新的数据
                const data = event.target.result;

                if (data) {
                    // 更新你想修改的数据
                    data.time = new Date().getTime();

                    // 把更新过的对象放回数据库
                    const requestUpdate = objectStore.put(data);
                    requestUpdate.onerror = function (event) {
                        // 错误处理
                        console.log('操作失败');
                    };
                    requestUpdate.onsuccess = function (event) {
                        // console.log('更新完成');
                    };
                }
            };
        }

        // 判断缓存字体是否加载
        hasLoaded(fontId) {
            const font = this.findFont(fontId);
            if (font) {
                return font.hasLoaded;
            }
            return false;
        }

        //  判断字体是否在添加
        isLoading(fontId) {
            if (this.loadingFontList.includes(fontId)) {
                return true;
            }
            this.loadingFontList.push(fontId);
            return false;
        }

        // 下载字体
        downloadFont(fontId) {
            if (!this.isOpened) {
                return;
            }

            // 当前字体正在下载的时候
            if (this.downloadPromiseList.includes(fontId)) {
                return Promise.resolve();
            }
            this.downloadPromiseList.push(fontId);

            const font = this.allFontList.find(item => item.id == fontId);
            const {
                version,
            } = Ktu.fontList.find(item => item.id == fontId);

            let fontName = '';
            let cname = '';
            if (font) {
                fontName = font.nodeName.replace(/'/g, '');
                cname = font.cname;
            }
            const url = `${Ktu.initialData.resRoot}/css/fonts/woff2/${cname}.woff2`;
            // console.log(url);
            return new Promise((resolve, reject) => {
                axios({
                    url,
                    // responseType: 'arraybuffer',
                    responseType: 'blob',
                })
                    .then(response => {
                        // 插入字体、加载字体
                        if (!this.hasFont(fontId)) {
                            this.add('fonts', {
                                fontId,
                                fontName,
                                file: response.data,
                                version,
                                time: new Date().getTime(),
                            }).then(() => {
                                resolve();
                            })
                                .catch(() => {
                                    reject();
                                });
                        }
                    })
                    .catch(err => {
                        this.downloadPromiseList = this.downloadPromiseList.filter(item => item !== fontId);
                        reject();
                    });
            });
        }

        // 更新fontList,已经加载
        updateFontList(fontId) {
            const font = this.findFont(fontId);
            font.hasLoaded = true;
            // console.log('字体加载成功!');
        }

        // 清除字体文件缓存
        clearAll() {
            return new Promise((resolve, reject) => {
                const store = this.getObjectStore('fonts', 'readwrite');
                const request = store.clear();
                const that = this;

                request.onsuccess = function (event) {
                    that.fontList = [];
                    console.log('清除成功!');
                    resolve();
                };

                request.onerror = function (event) {
                    console.log('清除失败!');
                    reject();
                };
            });
        }

        // 删除某个字体文件
        clear(fontId) {
            return new Promise((resolve, reject) => {
                const store = this.getObjectStore('fonts', 'readwrite');
                const request = store.delete(fontId);
                const that = this;

                request.onsuccess = function (event) {
                    that.fontList = that.fontList.filter(item => item.fontId != fontId);
                    that.LRU = that.LRU.filter(item => item.fontId != fontId);
                    resolve();
                    // console.log('清除成功!');
                };

                request.onerror = function (event) {
                    reject();
                    console.log('清除失败!');
                };
            });
        }

        blobToArrayBuffer(blob, fontId) {
            const that = this;

            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = function (event) {
                    // 读不出缓存文件的arrayBuffer时重新缓存字体
                    if (event.target.result) {
                        resolve(event.target.result);
                    } else {
                        that.clear(fontId).then(() => {
                            that.downloadFont(fontId);
                        });
                        reject();
                    }
                };

                reader.onerror = function (err) {
                    console.log(err);
                    that.clear(fontId).then(() => {
                        that.downloadFont(fontId);
                    });
                    reject();
                };
                reader.readAsArrayBuffer(blob);
            });
        }
    }
    Ktu.indexedDB = new IndexedDB();

    // 字体版本
    Ktu.fontList = [{
        id: 4,
        fontName: '仿宋',
        version: '20191028',
    },
    {
        id: 8,
        fontName: '隶书',
        version: '20191028',
    },
    {
        id: 15,
        fontName: '幼圆',
        version: '20191028',
    },
    {
        id: 20,
        fontName: 'Ardeco',
        version: '20191028',
    },
    {
        id: 21,
        fontName: 'BlackOpsOne',
        version: '20191028',
    },
    {
        id: 22,
        fontName: 'CevicheOne',
        version: '20191028',
    },
    {
        id: 23,
        fontName: 'DancingScript',
        version: '20191028',
    },
    {
        id: 24,
        fontName: 'Mademoiselle',
        version: '20191028',
    },
    {
        id: 25,
        fontName: 'FrederickatheGreat',
        version: '20191028',
    },
    {
        id: 26,
        fontName: 'Playball',
        version: '20191028',
    },
    {
        id: 27,
        fontName: 'PoiretOne',
        version: '20191028',
    },
    {
        id: 28,
        fontName: 'Ribbon Trim',
        version: '20191028',
    },
    {
        id: 32,
        fontName: '楷体',
        version: '20191028',
    },
    {
        id: 33,
        fontName: '站酷高端黑',
        version: '20191028',
    },
    {
        id: 34,
        fontName: '站酷快乐体',
        version: '20191028',
    },
    {
        id: 35,
        fontName: '字体管家版宋',
        version: '20191028',
    },
    {
        id: 36,
        fontName: '庞门正道标题体',
        version: '20191028',
    },
    {
        id: 38,
        fontName: '鬼泣',
        version: '20191028',
    },
    {
        id: 39,
        fontName: '字体管家幻夜伯爵',
        version: '20191028',
    },
    {
        id: 40,
        fontName: '站酷酷黑',
        version: '20191028',
    },
    {
        id: 41,
        fontName: '字体管家棉花糖',
        version: '20191028',
    },
    {
        id: 42,
        fontName: '字体管家润行',
        version: '20191028',
    },
    {
        id: 43,
        fontName: '甜甜圈',
        version: '20191028',
    },
    {
        id: 44,
        fontName: '夕禾',
        version: '20191028',
    },
    {
        id: 46,
        fontName: '851手写体',
        version: '20191028',
    },
    {
        id: 47,
        fontName: '字体管家波点',
        version: '20191028',
    },
    {
        id: 48,
        fontName: '字体管家粗圆',
        version: '20191028',
    },
    {
        id: 49,
        fontName: '字体管家方萌',
        version: '20191028',
    },
    {
        id: 50,
        fontName: '字体管家星玥体',
        version: '20191028',
    },
    {
        id: 51,
        fontName: '语文老师的字',
        version: '20191028',
    },
    {
        id: 52,
        fontName: 'Addict Italic',
        version: '20191028',
    },
    {
        id: 53,
        fontName: '站酷小薇LOGO体',
        version: '20191028',
    },
    {
        id: 10,
        fontName: '',
        version: '20191028',
    },
    {
        id: 54,
        fontName: '思源黑体-粗体',
        version: '20191028',
    },
    {
        id: 55,
        fontName: '思源黑体-纤细',
        version: '20191028',
    },
    {
        id: 56,
        fontName: '思源黑体-特粗',
        version: '20191028',
    },
    {
        id: 57,
        fontName: '思源黑体-细体',
        version: '20191028',
    },
    {
        id: 58,
        fontName: '思源黑体-常规',
        version: '20191028',
    },
    {
        id: 30,
        fontName: '',
        version: '20191028',
    },
    {
        id: 59,
        fontName: '思源宋体-粗体',
        version: '20191028',
    },
    {
        id: 60,
        fontName: '思源宋体-纤细',
        version: '20191028',
    },
    {
        id: 61,
        fontName: '思源宋体-特粗',
        version: '20191028',
    },
    {
        id: 63,
        fontName: '思源宋体-中等',
        version: '20191028',
    },
    {
        id: 64,
        fontName: '思源宋体-常规',
        version: '20191028',
    },
    {
        id: 65,
        fontName: '站酷文艺体',
        version: '20191028',
    },
    {
        id: 66,
        fontName: 'Joker手写体',
        version: '20191028',
    },
    {
        id: 67,
        fontName: '濑户字体',
        version: '20191028',
    },
    {
        id: 68,
        fontName: '沐瑶软笔手写体',
        version: '20191028',
    },
    {
        id: 69,
        fontName: '文泉驿等宽正黑',
        version: '20191028',
    },
    {
        id: 70,
        fontName: '文泉驿正黑',
        version: '20191028',
    },
    {
        id: 71,
        fontName: '汉仪贤二体',
        version: '20191028',
    },
    {
        id: 45,
        fontName: '',
        version: '20191028',
    },
    {
        id: 72,
        fontName: '杨任东竹石体-粗体',
        version: '20191028',
    },
    {
        id: 73,
        fontName: '杨任东竹石体-纤细',
        version: '20191028',
    },
    {
        id: 74,
        fontName: '杨任东竹石体-特粗',
        version: '20191028',
    },
    {
        id: 75,
        fontName: '杨任东竹石体-细体',
        version: '20191028',
    },
    {
        id: 76,
        fontName: '杨任东竹石体-中等',
        version: '20191028',
    },
    {
        id: 77,
        fontName: '杨任东竹石体-常规',
        version: '20191028',
    },
    {
        id: 78,
        fontName: '杨任东竹石体-中粗',
        version: '20191028',
    },
    {
        id: 79,
        fontName: '站酷庆科黄油体',
        version: '20191028',
    },
    {
        id: 80,
        fontName: 'Akronim',
        version: '20191028',
    },
    {
        id: 81,
        fontName: 'Bungee_Shade',
        version: '20191028',
    },
    {
        id: 82,
        fontName: 'Caesar_Dressing',
        version: '20191028',
    },
    {
        id: 83,
        fontName: 'Diplomata_SC',
        version: '20191028',
    },
    {
        id: 84,
        fontName: 'Gravitas_One',
        version: '20191028',
    },
    {
        id: 85,
        fontName: 'Kumar_One_Outline',
        version: '20191028',
    },
    {
        id: 86,
        fontName: 'Monoton',
        version: '20191028',
    },
    {
        id: 87,
        fontName: 'Press_Start_2P',
        version: '20191028',
    },
    {
        id: 88,
        fontName: 'Ribeye_Marrow',
        version: '20191028',
    },
    {
        id: 89,
        fontName: '喜鹊古字典体',
        version: '20191028',
    },
    {
        id: 90,
        fontName: '喜鹊聚珍体',
        version: '20191028',
    },
    {
        id: 91,
        fontName: '喜鹊乐敦体',
        version: '20191028',
    },
    {
        id: 92,
        fontName: '喜鹊小轻松体',
        version: '20191028',
    },
    {
        id: 93,
        fontName: '喜鹊在山林体',
        version: '20191028',
    },
    {
        id: 94,
        fontName: '喜鹊招牌体',
        version: '20191028',
    },
    {
        id: 95,
        fontName: '日本花园明朝体',
        version: '20191028',
    },
    {
        id: 96,
        fontName: '锐字真言体',
        version: '20191028',
    },
    {
        id: 97,
        fontName: '仓耳爱民小楷',
        version: '20191028',
    },
    {
        id: 98,
        fontName: '仓耳爱情练习生',
        version: '20191028',
    },
    {
        id: 99,
        fontName: '仓耳茶小苏体',
        version: '20191028',
    },
    {
        id: 100,
        fontName: '仓耳初遇体',
        version: '20191028',
    },
    {
        id: 101,
        fontName: '仓耳呆萌小木头体',
        version: '20191028',
    },
    {
        id: 102,
        fontName: '仓耳呆牛手写体',
        version: '20191028',
    },
    {
        id: 103,
        fontName: '仓耳古风楷书',
        version: '20191028',
    },
    {
        id: 104,
        fontName: '仓耳乐志体',
        version: '20191028',
    },
    {
        id: 105,
        fontName: '仓耳暖男手札体',
        version: '20191028',
    },
    {
        id: 106,
        fontName: '仓耳青雀体',
        version: '20191028',
    },
    {
        id: 107,
        fontName: '仓耳松果体',
        version: '20191028',
    },
    {
        id: 108,
        fontName: '仓耳再见那些年体',
        version: '20191028',
    },
    {
        id: 109,
        fontName: '仓耳章鱼小丸子体',
        version: '20191028',
    },
    {
        id: 110,
        fontName: '方正仿宋',
        version: '20191028',
    },
    {
        id: 111,
        fontName: '方正黑体',
        version: '20191028',
    },
    {
        id: 112,
        fontName: '方正楷体',
        version: '20191028',
    },
    {
        id: 113,
        fontName: '方正书宋',
        version: '20191028',
    },
    {
        id: 114,
        fontName: '锐字云字库彩云',
        version: '20191028',
    },
    {
        id: 115,
        fontName: '锐字云字库粗圆',
        version: '20191028',
    },
    {
        id: 116,
        fontName: '锐字云字库行草',
        version: '20191028',
    },
    {
        id: 117,
        fontName: '锐字云字库行楷',
        version: '20191028',
    },
    {
        id: 118,
        fontName: '锐字云字库琥珀',
        version: '20191028',
    },
    {
        id: 119,
        fontName: '锐字云字库隶变',
        version: '20191028',
    },
    {
        id: 120,
        fontName: '锐字云字库美黑',
        version: '20191028',
    },
    {
        id: 121,
        fontName: '锐字云字库胖头鱼',
        version: '20191028',
    },
    {
        id: 122,
        fontName: '锐字云字库锐倩',
        version: '20191028',
    },
    {
        id: 123,
        fontName: '锐字云字库水柱',
        version: '20191028',
    },
    {
        id: 124,
        fontName: '锐字云字库魏体',
        version: '20191028',
    },
    {
        id: 125,
        fontName: '锐字云字库姚体',
        version: '20191028',
    },
    {
        id: 126,
        fontName: '锐字云字库中长宋',
        version: '20191028',
    },
    {
        id: 127,
        fontName: '锐字云字库综艺',
        version: '20191028',
    },
    {
        id: 128,
        fontName: '叶根友霸域行书',
        version: '20191028',
    },
    {
        id: 129,
        fontName: '叶根友古刻体',
        version: '20191028',
    },
    {
        id: 130,
        fontName: '叶根友爵宋体',
        version: '20191028',
    },
    {
        id: 131,
        fontName: '叶根友锐劲格美',
        version: '20191028',
    },
    {
        id: 132,
        fontName: '叶根友唐楷体',
        version: '20191028',
    },
    {
        id: 133,
        fontName: '叶根友微刚体',
        version: '20191028',
    },
    {
        id: 134,
        fontName: '叶根友微影体',
        version: '20191028',
    },
    {
        id: 135,
        fontName: '叶根友依凤简',
        version: '20191028',
    },
    {
        id: 136,
        fontName: '叶根友韵柔',
        version: '20191028',
    },
    {
        id: 137,
        fontName: '叶根友佐善体',
        version: '20191028',
    },
    {
        id: 138,
        fontName: '站酷曦冉体',
        version: '20191028',
    },
    {
        id: 139,
        fontName: '站酷鸿远御风体',
        version: '20191028',
    },
    {
        id: 140,
        fontName: '站酷冷水萧青刻古典体',
        version: '20191028',
    },
    {
        id: 141,
        fontName: '站酷冷水萧青刻体',
        version: '20191028',
    },
    {
        id: 142,
        fontName: '站酷妙典和风体',
        version: '20191028',
    },
    {
        id: 143,
        fontName: '站酷蔦书体',
        version: '20191028',
    },
    {
        id: 144,
        fontName: '站酷庆科建黑体',
        version: '20191028',
    },
    {
        id: 145,
        fontName: '站酷庆科追梦体',
        version: '20191028',
    },
    {
        id: 146,
        fontName: '站酷锐锐体',
        version: '20191028',
    },
    {
        id: 147,
        fontName: '站酷彤彤体',
        version: '20191028',
    },
    {
        id: 148,
        fontName: '庞门正道粗书体',
        version: '20191028',
    },
    {
        id: 14,
        fontName: '',
        version: '20191028',
    },
    {
        id: 149,
        fontName: '阿里巴巴普惠体-纤细',
        version: '20191028',
    },
    {
        id: 150,
        fontName: '阿里巴巴普惠体-细体',
        version: '20191028',
    },
    {
        id: 151,
        fontName: '阿里巴巴普惠体-常规',
        version: '20191028',
    },
    {
        id: 152,
        fontName: '阿里巴巴普惠体-粗体',
        version: '20191028',
    },
    {
        id: 153,
        fontName: '阿里巴巴普惠体-特粗',
        version: '20191028',
    },
    {
        id: 16,
        fontName: '',
        version: '20191028',
    },
    {
        id: 154,
        fontName: 'AlibabaSans-LightItalic',
        version: '20191028',
    },
    {
        id: 155,
        fontName: 'AlibabaSans-RegularItalic',
        version: '20191028',
    },

    {
        id: 156,
        fontName: 'AlibabaSans-MediumItalic',
        version: '20191028',
    },
    {
        id: 157,
        fontName: 'AlibabaSans-BoldItalic',
        version: '20191028',
    },
    {
        id: 158,
        fontName: 'AlibabaSans-HeavyItalic',
        version: '20191028',
    },
    {
        id: 17,
        fontName: '',
        version: '20191028',
    },
    {
        id: 159,
        fontName: 'AlibabaSans-Light',
        version: '20191028',
    },
    {
        id: 160,
        fontName: 'AlibabaSans-Regular',
        version: '20191028',
    },
    {
        id: 161,
        fontName: 'AlibabaSans-Medium',
        version: '20191028',
    },
    {
        id: 162,
        fontName: 'AlibabaSans-Bold',
        version: '20191028',
    },
    {
        id: 163,
        fontName: 'AlibabaSans-Heavy',
        version: '20191028',
    },
    {
        id: 164,
        fontName: 'AlibabaSans-Black',
        version: '20191028',
    },
    {
        id: 165,
        fontName: '黑体',
        version: '20191028',
    },
    {
        id: 166,
        fontName: '宋体',
        version: '20191028',
    },
    {
        id: 167,
        fontName: '包图小白体',
        version: '20191028',
    },
    /* {
                                       id: -2,
                                       fontName: 'seguiemj',
                                       version: '20191123',
                                       }, */
    {
        id: -3,
        fontName: 'Symbola',
        version: '20191122',
    },
    {
        id: 168,
        fontName: '问藏书房',
        version: '20191206',
    },
    {
        id: 169,
        fontName: 'AbrilFatface-Regular',
        version: '20191206',
    },
    {
        id: 170,
        fontName: 'Audiowide-Regular',
        version: '20191206',
    },
    {
        id: 171,
        fontName: 'BungeeInline-Regular',
        version: '20191206',
    },
    {
        id: 173,
        fontName: 'Chonburi-Regular',
        version: '20191206',
    },
    {
        id: 174,
        fontName: 'Codystar-Regular',
        version: '20191206',
    },
    {
        id: 175,
        fontName: 'ConcertOne-Regular',
        version: '20191206',
    },
    {
        id: 176,
        fontName: 'Creepster-Regular',
        version: '20191206',
    },
    {
        id: 177,
        fontName: 'FascinateInline-Regular',
        version: '20191206',
    },
    {
        id: 178,
        fontName: 'FasterOne-Regular',
        version: '20191206',
    },
    {
        id: 179,
        fontName: 'FredokaOne-Regular',
        version: '20191206',
    },
    {
        id: 180,
        fontName: 'Galada-Regular',
        version: '20191206',
    },
    {
        id: 181,
        fontName: '',
        version: '20191206',
    },
    {
        id: 182,
        fontName: 'JosefinSans-Bold',
        version: '20191206',
    },
    {
        id: 183,
        fontName: 'JosefinSans-Light',
        version: '20191206',
    },
    {
        id: 184,
        fontName: 'JosefinSans-Regular',
        version: '20191206',
    },
    {
        id: 185,
        fontName: 'JosefinSans-SemiBold',
        version: '20191206',
    },
    {
        id: 186,
        fontName: 'JosefinSans-Thin',
        version: '20191206',
    },
    {
        id: 187,
        fontName: 'Limelight-Regular',
        version: '20191206',
    },
    {
        id: 188,
        fontName: 'Lobster-Regular',
        version: '20191206',
    },
    {
        id: 189,
        fontName: '',
        version: '20191206',
    },
    {
        id: 190,
        fontName: 'Lora-Bold',
        version: '20191206',
    },
    {
        id: 191,
        fontName: 'Lora-Regular',
        version: '20191206',
    },
    {
        id: 192,
        fontName: 'LuckiestGuy-Regular',
        version: '20191206',
    },
    {
        id: 193,
        fontName: 'Modak-Regular',
        version: '20191206',
    },
    {
        id: 194,
        fontName: 'MrsSaintDelafield-Regular',
        version: '20191206',
    },
    {
        id: 195,
        fontName: 'NothingYouCouldDo-Regular',
        version: '20191206',
    },
    {
        id: 196,
        fontName: '',
        version: '20191206',
    },
    {
        id: 197,
        fontName: 'Orbitron-Black',
        version: '20191206',
    },
    {
        id: 198,
        fontName: 'Orbitron-Bold',
        version: '20191206',
    },
    {
        id: 199,
        fontName: 'Orbitron-Medium',
        version: '20191206',
    },
    {
        id: 200,
        fontName: 'Orbitron-Regular',
        version: '20191206',
    },
    {
        id: 201,
        fontName: '',
        version: '20191206',
    },
    {
        id: 202,
        fontName: 'Oswald-Bold',
        version: '20191206',
    },
    {
        id: 203,
        fontName: 'Oswald-Light',
        version: '20191206',
    },
    {
        id: 204,
        fontName: 'Oswald-Medium',
        version: '20191206',
    },
    {
        id: 205,
        fontName: 'Oswald-Regular',
        version: '20191206',
    },
    {
        id: 206,
        fontName: 'Oswald-SemiBold',
        version: '20191206',
    },
    {
        id: 207,
        fontName: 'PermanentMarker-Regular',
        version: '20191206',
    },
    {
        id: 208,
        fontName: 'Plaster-Regular',
        version: '20191206',
    },
    {
        id: 209,
        fontName: '',
        version: '20191206',
    },
    {
        id: 210,
        fontName: 'PlayfairDisplay-Black',
        version: '20191206',
    },
    {
        id: 211,
        fontName: 'PlayfairDisplay-Bold',
        version: '20191206',
    },
    {
        id: 212,
        fontName: 'PlayfairDisplay-Regular',
        version: '20191206',
    },
    {
        id: 213,
        fontName: 'Righteous-Regular',
        version: '20191206',
    },
    {
        id: 214,
        fontName: 'Rye-Regular',
        version: '20191206',
    },
    {
        id: 215,
        fontName: 'VastShadow-Regular',
        version: '20191206',
    }
    ];
    // 初始化就要开启字体数据库
}());
