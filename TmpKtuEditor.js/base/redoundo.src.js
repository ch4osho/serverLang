const HistoryAction = (function () {
    function HistoryAction() { }
    /// /REVERT//////
    HistoryAction.getRevertAction = function (action) {
        switch (action) {
            case HistoryAction.CANVAS_INIT:
                return HistoryAction.CANVAS_INIT;
            case HistoryAction.OBJECT_ADD:
                return HistoryAction.OBJECT_REMOVE;
            case HistoryAction.OBJECT_REMOVE:
                return HistoryAction.OBJECT_ADD;
            case HistoryAction.OBJECT_MODIFY:
                return HistoryAction.OBJECT_MODIFY;
            case HistoryAction.OBJECT_ZINDEX:
                return HistoryAction.OBJECT_ZINDEX;
            case HistoryAction.OBJECT_CHANGE:
                return HistoryAction.OBJECT_CHANGE;

            case HistoryAction.OBJECT_GROUP:
                return HistoryAction.OBJECT_GROUP;
            case HistoryAction.GROUP_ADD:
                return HistoryAction.GROUP_REMOVE;
            case HistoryAction.GROUP_REMOVE:
                return HistoryAction.GROUP_ADD;
            case HistoryAction.GROUP_CHANGED:
                return HistoryAction.GROUP_CHANGED;
            case HistoryAction.GROUP_ZINDEX:
                return HistoryAction.GROUP_ZINDEX;
            // 组合
            case HistoryAction.GROUP_CONCAT:
                return HistoryAction.GROUP_SPLIT;
            // 解开组合
            case HistoryAction.GROUP_SPLIT:
                return HistoryAction.GROUP_CONCAT;
            // 页面变化
            case HistoryAction.PAGE_CHANGED:
                return HistoryAction.PAGE_CHANGED;
            case HistoryAction.PAGESIZE_CHANGED:
                return HistoryAction.PAGESIZE_CHANGED;
            // 接受回调处理
            case HistoryAction.CALLBACK:
                return HistoryAction.CALLBACK;
        }
    };

    return HistoryAction;
}());
// objectId对应撤销前进值 在object对象中添加 stateProperties
HistoryAction.CANVAS_INIT = 0;

HistoryAction.OBJECT_ADD = 1;
HistoryAction.OBJECT_MODIFY = 2;
HistoryAction.OBJECT_REMOVE = 3;
HistoryAction.OBJECT_ZINDEX = 4;
HistoryAction.OBJECT_GROUP = 5;
HistoryAction.OBJECT_CHANGE = 6;

HistoryAction.GROUP_ADD = 10;
HistoryAction.GROUP_REMOVE = 11;
HistoryAction.GROUP_CHANGED = 12;
HistoryAction.GROUP_ZINDEX = 13;
HistoryAction.GROUP_CONCAT = 14;
HistoryAction.GROUP_SPLIT = 15;

HistoryAction.PAGE_CHANGED = 16;
HistoryAction.CALLBACK = 17;

HistoryAction.PAGESIZE_CHANGED = 20;

const __extends = (this && this.__extends) || (function () {
    const extendStatics = Object.setPrototypeOf || ({
        __proto__: [],
    }
        instanceof Array && function (d, b) {
        d.__proto__ = b;
    }
    ) || function (d, b) {
        for (const p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    };

    return function (d, b) {
        extendStatics(d, b);

        function __() {
            this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype,
        new __());
    };
}());

const HistoryStep = (function () {
    function HistoryStep(action) {
        // 是否是原图所在的历史记录步骤
        this.action = action;
    }
    HistoryStep.prototype.beforeChange = function (beforeData) {
        this.beforeData = _.cloneDeep(beforeData);
    };

    HistoryStep.prototype.afterChange = function (afterData) {
        this.afterData = _.cloneDeep(afterData);
    };

    HistoryStep.prototype.run = function (isFromUndo) { };

    HistoryStep.prototype.backRun = function () { };

    HistoryStep.prototype.saveCallback = function (callback) {
        if (callback) {
            this.callback = callback;
        }
    };

    return HistoryStep;
}());
/**
 * 画布相关的历史记录
 */
const CanvasHistoryStep = (function (_super) {
    __extends(CanvasHistoryStep, _super);

    function CanvasHistoryStep(...args) {
        return _super !== null && _super.apply(this, [...args]) || this;
    }
    CanvasHistoryStep.prototype.run = function (isFromUndo) { };

    CanvasHistoryStep.prototype.backRun = function () {
    };

    return CanvasHistoryStep;
}(HistoryStep));

const ObjectHistoryStep = (function (_super) {
    __extends(ObjectHistoryStep, _super);

    function ObjectHistoryStep(...args) {
        return _super !== null && _super.apply(this, [...args]) || this;
    }

    ObjectHistoryStep.prototype.run = function (isFromUndo) {
        Ktu.element.loadObjectHistoryData(this.action, this.afterData, this.selectedObject, this);
    };

    ObjectHistoryStep.prototype.backRun = function () {
        /* if (Ktu.deleteBack) {
            this.beforeData.unshift(Ktu.deleteObject);
            Ktu.deleteBack = false;
        } */
        Ktu.element.loadObjectHistoryData(HistoryAction.getRevertAction(this.action), this.beforeData, this.beforeSelectedObject, this);
    };

    return ObjectHistoryStep;
}(HistoryStep));

const GroupHistoryStep = (function (_super) {
    __extends(GroupHistoryStep, _super);

    function GroupHistoryStep(...args) {
        return _super !== null && _super.apply(this, [...args]) || this;
    }
    GroupHistoryStep.prototype.run = function (isFromUndo) {
        Ktu.multi.loadGroupHistoryData(this.action, this.afterData, this.beforeData, this.selectedObject);
    };

    GroupHistoryStep.prototype.backRun = function () {
        Ktu.multi.loadGroupHistoryData(HistoryAction.getRevertAction(this.action), this.beforeData, this.afterData, this.beforeSelectedObject);
    };

    return GroupHistoryStep;
}(HistoryStep));

const PageSizeHistoryStep = (function (_super) {
    __extends(PageSizeHistoryStep, _super);

    function PageSizeHistoryStep(...args) {
        return _super !== null && _super.apply(this, [...args]) || this;
    }
    PageSizeHistoryStep.prototype.run = function (isFromUndo) {
        Ktu.template.resizePage(this.afterData, true);
    };

    PageSizeHistoryStep.prototype.backRun = function () {
        Ktu.template.resizePage(this.beforeData, true);
    };

    return PageSizeHistoryStep;
}(HistoryStep));

const PageHistoryStep = (function (_super) {
    __extends(PageHistoryStep, _super);

    function PageHistoryStep(...args) {
        return _super !== null && _super.apply(this, [...args]) || this;
    }
    PageHistoryStep.prototype.run = function (isFromUndo) {
        Ktu.template.loadPageHistoryData(this.action, this.afterData);
    };

    PageHistoryStep.prototype.backRun = function () {
        Ktu.template.loadPageHistoryData(HistoryAction.getRevertAction(this.action), this.beforeData);
    };

    return PageHistoryStep;
}(HistoryStep));

const CallbackStep = (function (_super) {
    __extends(CallbackStep, _super);

    function CallbackStep(...args) {
        return _super !== null && _super.apply(this, [...args]) || this;
    }
    CallbackStep.prototype.run = function () {
        this.callback(this.beforeData);
    };

    CallbackStep.prototype.backRun = function () {
        this.callback(this.beforeData);
    };

    return CallbackStep;
}(HistoryStep));

const HistoryStepFactory = (function () {
    function HistoryStepFactory() { }
    HistoryStepFactory.createHistory = function (action) {
        switch (action) {
            case HistoryAction.CANVAS_INIT:
                return new CanvasHistoryStep(action);
            case HistoryAction.OBJECT_ADD:
            case HistoryAction.OBJECT_MODIFY:
            case HistoryAction.OBJECT_REMOVE:
            case HistoryAction.OBJECT_ZINDEX:
            case HistoryAction.OBJECT_GROUP:
            case HistoryAction.OBJECT_CHANGE:
            {
                return new ObjectHistoryStep(action);
            }
            case HistoryAction.GROUP_ADD:
            case HistoryAction.GROUP_REMOVE:
            case HistoryAction.GROUP_CHANGED:
            case HistoryAction.GROUP_ZINDEX:
            case HistoryAction.GROUP_CONCAT:
            case HistoryAction.GROUP_SPLIT:
            {
                return new GroupHistoryStep(action);
            }
            case HistoryAction.PAGESIZE_CHANGED:
            {
                return new PageSizeHistoryStep(action);
            }
            case HistoryAction.PAGE_CHANGED:
            {
                return new PageHistoryStep(action);
            }
            case HistoryAction.CALLBACK:
            {
                return new CallbackStep(action);
            }
        }
    };
    return HistoryStepFactory;
}());

(function () {
    function KtuHistory() {
        const _this = this;

        // 把currentStep改成响应式，改变时提交给Vue。
        (function () {
            let currentStep = 0;
            Object.defineProperty(_this, 'currentStep', {
                get() {
                    return currentStep;
                },
                set(newValue) {
                    currentStep = newValue;
                    Ktu.store.commit('data/changeState', {
                        prop: 'needCheckStep',
                        value: true,
                    });
                },
            });
        }());

        _this.steps = [];
        /* coverIndex = 0;
           saveGapTime = 3000; */
        _this.isDirty = false;
        _this.historyDirty = false;

        return _this;
    }

    KtuHistory.prototype = {
        maxHistoryStep: 1000,

        undoAble() {
            return this.currentStep > 0;
        },
        redoAble() {
            return this.currentStep < (this.steps.length - 1);
        },
        checkAddHistory() {
            /**
             * 针对文字，需要单独添加判断 添加一步历史记录
             */
            const target = Ktu.canvas.getActiveGroup() || Ktu.canvas.getActiveObjectInGroup() || Ktu.canvas.getActiveObject();
            if (target != null && target.hasStateRecorded() && target.hasStateChanged()) {
                target.activeModify();
            }
        },
        undo() {
            /* this.checkAddHistory();
               读取当前这一步,然后执行backRun方法还原操作 */
            const historyStep = this.loadStep(this.currentStep);
            historyStep.backRun();
            // 跳到上一步
            this.loadStep(this.currentStep - 1);
        },
        redo() {
            // 跳到下一步,然后执行run方法进行操作
            const historyStep = this.loadStep(this.currentStep + 1);
            historyStep.run(false);
        },
        readStep(step) {
            step = Math.max(0, Math.min(this.steps.length - 1, step));
            return this.steps[step];
        },
        loadStep(step) {
            step = Math.max(0, Math.min(this.steps.length - 1, step));
            this.currentStep = step;
            this.historyDirty = true;
            return this.steps[this.currentStep];
        },
        /**
         * 添加历史记录,只是单纯的创建并添加,然后再返回,这时的历史记录只是一个空壳,
         * 需要在具体的环节去执行返回的历史记录对象的beforeChange和afterChange方法,将前后的数据传进去
         * @param stepAction
         * @returns {CanvasHistoryStep}
         */
        addStep(stepAction) {
            const oneHistoryStep = HistoryStepFactory.createHistory(stepAction);
            const target = Ktu.selectedData || {};
            oneHistoryStep.beforeSelectedObject = target.objectId ? target.objectId : null;
            oneHistoryStep.selectedObject = oneHistoryStep.beforeSelectedObject;
            this.steps.splice(this.currentStep + 1, this.steps.length - this.currentStep - 1, oneHistoryStep);
            if (this.steps.length > this.maxHistoryStep) {
                this.steps.shift();
            }
            this.currentStep = this.steps.length - 1;
            this.isDirty = true;
            this.historyDirty = true;

            // 如果不是添加素材，这里要初始化重复添加的记录
            if (stepAction !== HistoryAction.OBJECT_ADD) {
                Ktu.recordAddNum = 0;
                Ktu.lastAddImgScale = null;
            }

            return oneHistoryStep;
        },
        clearAll() {
            this.steps = [];
            this.currentStep = 0;
            this.historyDirty = false;
        },
    };

    Ktu.KtuHistory = KtuHistory;

    Ktu.historyManager = [];
    const { content } = Ktu.ktuData;
    for (let i = 0; i < content.length; i++) {
        Ktu.historyManager[i] = new KtuHistory();
    }
}());
