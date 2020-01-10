Ktu.vm = new Vue({
    el: '#ktu',
    data: {
        hasLoaded: false,
    },
    store: Ktu.store,
    computed: { 
        isDroping: {
            get() {
                return this.$store.state.base.isDroping;
            },
            set(value) {
                this.$store.state.base.isDroping = value;
            },
        },
    },
    mounted() {
        // 意外关闭
        window.addEventListener('beforeunload', event => {
            if (Ktu.save.saveChangedNum > 0 && !Ktu.isActiveClick) {
                const tips = '您的作品正处于编辑状态，离开该页面将会失去您对该作品所做的修改。确定关闭';
                event.returnValue = tips;
                return tips;
            }
        });

        Ktu.main();
        Ktu.log('into');
    },
    created(){
        console.log(this)
    },
    methods: {
        /* globalClickCtrl: function() {
           //关闭所有弹窗
           // this.$store.commit('popup/closeAll');
           //拿到当前选中的元素，避免多选时框选边界在canvas外而失效
           this.getSelected();
           // this.getSelectionStyles();
           },
           getSelected: function (event) {
           var selectedData = Ktu.selectedData; */

        /* // 判断当前激活元素是否为input 防止更改颜色时错乱
           if (selectedData != this.$store.state.data.selectedData && document.activeElement.localName != "input") {
           this.$store.commit('data/changeSelectedData', selectedData);
           }
           }, */
        initDropEvent() {

        },
        /* getSelectionStyles: function(){
           var selectedData = this.$store.state.data.selectedData;
           var selectionStylesList = [];
           if(selectedData.type === 'textbox'){
           var selectionStart = selectedData.selectionStart;
           var selectionEnd = selectedData.selectionEnd;
           // selectionStart === selectionEnd ?
           // selectionStylesList = selectedData.getSelectionStyles(0, selectedData.text.length) :
           // selectionStylesList = selectedData.getSelectionStyles(selectionStart, selectionEnd);
           var styles = selectedData.styles;
           Object.keys(styles).forEach(function(row, rowIdx){
           Object.keys(styles[rowIdx]).forEach(function(word, wordIdx){
           selectionStylesList.push(styles[rowIdx][wordIdx]);
           });
           });
           selectionStart != selectionEnd && (selectionStylesList = selectionStylesList.slice(selectionStart, selectionEnd));
           }
           this.$store.commit('data/changeSelectionStyles', selectionStylesList);
           } */
    },
    /* router: new VueRouter({
       routes: Ktu.config.categories.map(function(category) {
       return {
       path: '/' + category.name,
       name: category.name,
       component: Ktu.routerComponent[category.name]
       }
       }),
       linkActiveClass: 'selected',
       linkExactActiveClass: ''
       }), */
});
// 只有在开发环境 或者线上内部帐号 才开启devtools工具
if (Ktu.isDevDebug || Ktu._isInternalAcct) {
    Vue.config.devtools = true;
} else {
    Vue.config.devtools = false;
}
// 监控 vue的报错信息
Vue.config.errorHandler = function (err, vm, info) {
    console.error(err);
    /* console.log(vm);
       console.log(info); */

    if (window.FAI_HAWK_EYE) {
        const HE = window.FAI_HAWK_EYE;
        const expData = {};
        const expUrl = `${window.location.protocol + Ktu.initialData.resRoot}/js/ktuEditor.min.js`;
        const expMsg = err.message + info;
        let expStack = '';
        if (err.stack) {
            expStack = err.stack;
        }
        const expStatus = 0;
        const expLineno = 0;
        const expColno = 0;

        expData[HE._DEF._REPORT._EXCEPTION._URL] = expUrl;
        expData[HE._DEF._REPORT._EXCEPTION._MESSAGE] = expMsg;
        expData[HE._DEF._REPORT._EXCEPTION._STACK] = expStack;
        expData[HE._DEF._REPORT._EXCEPTION._STATUS] = expStatus;
        expData[HE._DEF._REPORT._EXCEPTION._LINE_NUM] = expLineno;
        expData[HE._DEF._REPORT._EXCEPTION._COL_NUM] = expColno;
        expData[HE._DEF._REPORT._EXCEPTION._TYPE] = HE._DEF._REPORT._EXCEPTION._EXCEPTION_TYPE._JS_EXCEPTION;

        Ktu._report(HE, expData, 2);
    }
};

Ktu._report = function (HE, reportData, reportType) {
    const data = {};
    Object.keys(HE._DATA).forEach(key => {
        data[key] = HE._DATA[key];
    });
    Object.keys(reportData).forEach(key => {
        data[key] = reportData[key];
    });

    // 记录上报时间
    data[HE._DEF._REPORT._BASIC._CLI_TIME] = new Date().getTime();

    // 记录上报类型
    data[HE._DEF._REPORT._BASIC._REPORT_TYPE] = reportType;

    // 数据上报
    HE._TOOL._sendReport(HE.FAI_HAWK_EYE_REPORT_URL, data);
};

(function () {
    if (!navigator.serviceWorker) return;
    navigator.serviceWorker.register('../sw.src.js')
        .then(reg => {
            console.log('SW registered!', reg);
        })
        .catch(err => {
            console.log('Boo!', err);
        })
        .then(() => {
            if (navigator.serviceWorker.controller !== null) {
                console.log('心跳开始');
                // 每1秒发一次心跳
                const HEARTBEAT_INTERVAL = 10 * 1000;
                const sessionId = window.location.href;
                const heartbeat = function () {
                    if (!navigator.serviceWorker.controller) return;
                    if (!navigator.serviceWorker.controller.postMessage) return;
                    navigator.serviceWorker.controller.postMessage({
                        type: 'heartbeat',
                        id: sessionId,
                        // 附加信息，如果页面 crash，上报的附加数据
                        data: {
                            href: sessionId,
                            time: Date.now(),
                        },
                    });
                };
                window.addEventListener('beforeunload', () => {
                    if (!navigator.serviceWorker.controller) return;
                    if (!navigator.serviceWorker.controller.postMessage) return;
                    navigator.serviceWorker.controller.postMessage({
                        type: 'unload',
                        id: sessionId,
                    });
                });
                setInterval(heartbeat, HEARTBEAT_INTERVAL);
                heartbeat();
            }
        });

    let dbMethod;
    (function () {
        let db;
        // 本演示使用的数据库名称
        const dbName = 'crash';
        // 版本
        const version = 1;

        // 打开数据库
        const DBOpenRequest = indexedDB.open(dbName, version);

        // 如果数据库打开失败
        DBOpenRequest.onerror = function (event) {
            console.log('数据库打开失败');
        };

        DBOpenRequest.onsuccess = function (event) {
            // 存储数据结果
            db = DBOpenRequest.result;
            checkIndexDB();
        };

        // 下面事情执行于：数据库首次创建版本，或者window.indexedDB.open传递的新版本（版本数值要比现在的高）
        DBOpenRequest.onupgradeneeded = function (event) {
            const db = event.target.result;

            db.onerror = function (event) {
                console.log('数据库打开失败');
            };

            // 创建一个数据库存储对象
            const objectStore = db.createObjectStore(dbName, {
                keyPath: 'id',
                autoIncrement: true,
            });

            // 定义存储对象的数据项
            objectStore.createIndex('id', 'id', {
                unique: true,
            });
            objectStore.createIndex('time', 'time');
        };

        dbMethod = {
            add(newItem) {
                const transaction = db.transaction([dbName], 'readwrite');
                // 打开已经存储的数据对象
                const objectStore = transaction.objectStore(dbName);
                // 添加到数据对象中
                const objectStoreRequest = objectStore.add(newItem);
                objectStoreRequest.onsuccess = function (event) {
                    dbMethod.show();
                };
            },
            edit(id, data) {
                // 编辑数据
                const transaction = db.transaction([dbName], 'readwrite');
                // 打开已经存储的数据对象
                const objectStore = transaction.objectStore(dbName);
                // 获取存储的对应键的存储对象
                const objectStoreRequest = objectStore.get(id);
                // 获取成功后替换当前数据
                objectStoreRequest.onsuccess = function (event) {
                    // 当前数据
                    const myRecord = objectStoreRequest.result;
                    // 遍历替换
                    Object.keys(data).forEach(key => {
                        if (typeof myRecord[key] != 'undefined') {
                            myRecord[key] = data[key];
                        }
                    });
                    // 更新数据库存储数据
                    objectStore.put(myRecord);
                };
            },
            del(id) {
                // 打开已经存储的数据对象
                const objectStore = db.transaction([dbName], 'readwrite').objectStore(dbName);
                // 直接删除
                const objectStoreRequest = objectStore.delete(id);
                // 删除成功后
                objectStoreRequest.onsuccess = function () {
                    dbMethod.show();
                };
            },
            show(callback) {
                // 打开对象存储，获得游标列表
                const result = [];
                const objectStore = db.transaction(dbName).objectStore(dbName);
                objectStore.openCursor().onsuccess = function (event) {
                    const cursor = event.target.result;
                    // 如果游标没有遍历完，继续下面的逻辑
                    if (cursor) {
                        result.push(cursor.value);
                        cursor.continue();
                        // 如果全部遍历完毕
                    } else {
                        if (result.length > 0) {
                            callback && callback(result);
                        }
                    }
                };
            },
        };

        // 检查indexDB有没有异常数据
        function checkIndexDB() {
            // 说明有崩溃页面记录
            dbMethod.show(result => {
                let crashNum = localStorage.getItem('carshNum');
                if (!crashNum) {
                    crashNum = 1;
                } else {
                    crashNum = +crashNum + 1;
                }
                localStorage.setItem('carshNum', crashNum);

                console.log('有崩溃页面记录');
                result.forEach(item => {
                    if (window.FAI_HAWK_EYE) {
                        const HE = window.FAI_HAWK_EYE;
                        const expData = {};
                        expData[HE._DEF._REPORT._EXCEPTION._URL] = window.location.href;
                        expData[HE._DEF._REPORT._EXCEPTION._STACK] = crashNum;
                        expData[HE._DEF._REPORT._EXCEPTION._STATUS] = 0;
                        expData[HE._DEF._REPORT._EXCEPTION._LINE_NUM] = 0;
                        expData[HE._DEF._REPORT._EXCEPTION._COL_NUM] = 0;
                        expData[HE._DEF._REPORT._EXCEPTION._TYPE] = 5;

                        Ktu._report(HE, expData, 2);
                    }
                    dbMethod.del(item.id);
                });
            });
        }
    }());
}());
