class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    getMagnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
    add(vector) {
        const v = new Vector();
        v.x = this.x + vector.x;
        v.y = this.y + vector.y;
        return v;
    }
    subtract(vector) {
        const v = new Vector();
        v.x = this.x - vector.x;
        v.y = this.y - vector.y;
        return v;
    }
    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }
    edge(vector) {
        return this.subtract(vector);
    }
    perpendicular() {
        const v = new Vector();
        v.x = this.y;
        v.y = 0 - this.x;
        return v;
    }
    normalize() {
        const v = new Vector();
        const m = this.getMagnitude();
        v.x = this.x / m;
        v.y = this.y / m;
        return v;
    }
    normal() {
        const p = this.perpendicular();
        return p.normalize();
    }
    rotate(angle) {
        const radians = angle * Math.PI / 180;
        const sin = Math.sin(radians);
        const cos = Math.cos(radians);
        const rx = this.x * cos - this.y * sin;
        const ry = this.x * sin + this.y * cos;
        return {
            x: rx,
            y: ry,
        };
    }
};
class Interactive extends SnapLine {
    constructor(options) {
        super(options);
        this.container = options.container;
        this.element = options.element;
        this.editor = options.editor;
        this.box = options.box;
        this.isMoving = false;
        this.canTranslate = false;
        this.isTranslating = false;
        this.canResize = false;
        this.isResizing = false;
        this.canRotate = false;
        this.isRotating = false;
        this.canRadius = false;
        this.currentControl = '';
        this.downEvent = null;
        this.moveEvent = null;
        this.isSelecting = false;
        this.start = null;
        this.end = null;
        this.selectedBox = null;
        this.editorClientRect = null;
        this.hoverTip = null;
        this.moveCount = 0;
        // 缩放最小1px
        this.scaleLimit = 1;
        this.acrossMap = {
            tl: 'br',
            tr: 'bl',
            br: 'tl',
            bl: 'tr',
            mt: 'mb',
            mr: 'ml',
            mb: 'mt',
            ml: 'mr',
        };
        this.canDraw = true;
        this.beforeSelectedData = null;
        this.dragOverObjects = [];
        this.dragOverIndex = null;
        this.hasTranslated = false;
        this.firstMove = null;

        this.isThreeRotating = false;
    }
    initEditorClientRect() {
        if (!this.editorClientRect) {
            this.editorClientRect = document.getElementById(this.editor).getBoundingClientRect();
        }
    }
    uncheckAll() {
        const uncheck = objects => {
            objects.forEach(object => {
                object.isSelected = false;
                if (object.type === 'group' || object.type == 'imageContainer') {
                    uncheck(object.objects);
                }
            });
        };
        uncheck(Ktu.selectedTemplateData.objects);
        Ktu.selectedData = null;
        Ktu.selectedGroup = null;
        Ktu.currentMulti = null;
    }
    createOBB(objectOBB, object) {
        const angle = objectOBB.angle || 0;
        const radian = Math.PI * angle / 180;
        // 拿中心点
        const center = {
            x: objectOBB.left + objectOBB.width / 2,
            y: objectOBB.top + objectOBB.height / 2,
        };
        if (radian) {
            const centerPoint = object.coords.center;
            center.x = this.editorClientRect.left + centerPoint.x * Ktu.edit.scale;
            center.y = this.editorClientRect.top + centerPoint.y * Ktu.edit.scale;
        }
        return {
            width: objectOBB.width,
            height: objectOBB.height,
            centerPoint: new Vector(center.x, center.y),
            axes: [new Vector(Math.cos(radian), Math.sin(radian)), new Vector(-1 * Math.sin(radian), Math.cos(radian))],
        };
    }
    getProjectionRadius(obb, axis) {
        return (obb.width * Math.abs(axis.dot(obb.axes[0])) + obb.height * Math.abs(axis.dot(obb.axes[1]))) / 2;
    }
    isCollided(object) {
        const selectedOBB = this.createOBB(this.selectedBox);
        const dimensions = object.getDimensions();
        let objectOBB = {
            width: dimensions.w * object.scaleX * Ktu.edit.scale,
            height: dimensions.h * object.scaleY * Ktu.edit.scale,
            angle: object.angle,
            left: object.left * Ktu.edit.scale + this.editorClientRect.left,
            top: object.top * Ktu.edit.scale + this.editorClientRect.top,
        };
        objectOBB = this.createOBB(objectOBB, object);
        const nv = selectedOBB.centerPoint.subtract(objectOBB.centerPoint);
        return selectedOBB.axes.concat(objectOBB.axes).every(axis => this.getProjectionRadius(selectedOBB, axis) + this.getProjectionRadius(objectOBB, axis) > Math.abs(nv.dot(axis)));
        /* var axisA1 = selectedOBB.axes[0];
           if (this.getProjectionRadius(selectedOBB, axisA1) + this.getProjectionRadius(objectOBB, axisA1) <= Math.abs(nv.dot(axisA1))) return false;
           var axisA2 = selectedOBB.axes[1];
           if (this.getProjectionRadius(selectedOBB, axisA2) + this.getProjectionRadius(objectOBB, axisA2) <= Math.abs(nv.dot(axisA2))) return false;
           var axisB1 = objectOBB.axes[0];
           if (this.getProjectionRadius(selectedOBB, axisB1) + this.getProjectionRadius(objectOBB, axisB1) <= Math.abs(nv.dot(axisB1))) return false;
           var axisB2 = objectOBB.axes[1];
           if (this.getProjectionRadius(selectedOBB, axisB2) + this.getProjectionRadius(objectOBB, axisB2) <= Math.abs(nv.dot(axisB2))) return false;
           return true; */
    }
    changeSelectedTarget(target) {
        target.isSelected = true;
        (!!target.container) && (target.container.isSelected = true);
        switch (target.type) {
            case 'multi':
                target.objects.forEach(object => {
                    object.isSelected = true;
                });
                Ktu.currentMulti = target;
                break;
            case 'group':
                Ktu.selectedGroup = target;
                target.objects.forEach(object => {
                    object.isSelected = false;
                });
                break;
            default:
                if (target.group || target.container) {
                    const sourceObject = target.group || target.container;
                    sourceObject.objects.forEach(object => {
                        object !== target && (object.isSelected = false);
                    });
                }
                Ktu.selectedData = target;
                break;
        }
    }
    checkTarget(event) {
        const paths = event.path || (event.composedPath && event.composedPath());
        const isLeftDown = 'which' in event ? event.which === 1 : event.button === 0;
        let isGroup = false;
        // 先遍历一次，看是不是组合里面
        for (const path of paths) {
            // 点中未选中的元素（包括组合）
            if (path.className && path.className.includes && path.className.includes('ele') && path.getAttribute('data-index')) {
                const index = path.getAttribute('data-index');
                const subindex = path.getAttribute('data-subindex');
                if (!!index && !!subindex) {
                    isGroup = true;
                }
            }
        }
        for (const path of paths) {
            // 选中resize点
            if (path.getAttribute && path.getAttribute('data-control') && isLeftDown) {
                this.currentControl = path.getAttribute('data-control');
                this.isOnResizing = true;
                if (Ktu.activeObject.objects) {
                    this.Multi = Ktu.activeObject.objects.concat();
                }

                // currentControl为表格的table_resize,需要记录行列
                if (this.currentControl === 'table_resize') {
                    const row = path.getAttribute('row-index');
                    const col = path.getAttribute('col-index');
                    path.classList.add('active');
                    if (row) {
                        this.tableResizeData = {
                            type: 'row',
                            index: parseInt(row, 10),
                            path,
                        };
                    } else {
                        this.tableResizeData = {
                            type: 'col',
                            index: parseInt(col, 10),
                            path,
                        };
                    }
                }
            } else {
                // debugger;
            }
            // 点中已选中的元素
            if (!isGroup && path.getAttribute && path.getAttribute('data-type') == 'containerImage' && path.getAttribute('data-subindex')) {
                const parent = $(path).closest('.ele')
                    .get(0);
                const index = parent.getAttribute('data-index');
                const target = Ktu.selectedTemplateData.objects[index];
                // const subindex = path.getAttribute('data-subindex');
                /* if(target.objects.length>1){
                   点中组合中子元素 */
                /* if (target && subindex) {
                    return target.objects[subindex];
                } else if (!Ktu.selectedData || (Ktu.selectedData && !(Ktu.selectedData.container && Ktu.selectedData.container == target))) {
                    return target;
                }*/
                return target;
                // 点中未选中的元素（包括组合）
            } else if (path.className && path.className.includes && path.className.includes(this.element) && path.getAttribute('data-index')) {
                this.isSameChoice = false;
                const index = path.getAttribute('data-index');
                const target = Ktu.selectedTemplateData.objects[index];
                const subindex = path.getAttribute('data-subindex');
                // 点中组合中子元素
                if (Ktu.selectedGroup === target && subindex && isLeftDown) {
                    return target.objects[subindex];
                }
                return target;
                // 点中已选中的元素
            } else if (path.id && path.id.includes(this.box)) {
                this.isSameChoice = true;
                return Ktu.currentMulti || Ktu.selectedGroup || Ktu.selectedData;
            }
        }
        return null;
    }
    translate(e) {
        this.isMoving = true;
        this.isTranslating = true;
        if (Ktu.currentMulti) {
            this.translateObjects(e);
        } else {
            this.translateObject(e);
        }
    }
    translateObject(e) {
        const event = this.moveEvent;
        const target = this.getEditTarget();
        if (!target) {
            return;
        }

        /* if (target.isInContainer) {
            target = target.container;
        }*/
        this.hasTranslated = true;
        if (e.shiftKey) {
            if (!this.firstMove) {
                if (Math.abs(event.clientX - this.start.x) > 0 && Math.abs(event.clientX - this.start.x) > Math.abs(event.clientY - this.start.y)) {
                    this.firstMove = 'level';
                } else {
                    this.firstMove = 'vertical';
                }
                Ktu.log('keyboard', 'dragAndDrop');
            }
            if (this.firstMove == 'level') {
                target.left = this.start.left + (event.clientX - this.start.x) / Ktu.edit.scale;
            } else {
                target.top = this.start.top + (event.clientY - this.start.y) / Ktu.edit.scale;
            }
        } else {
            target.left = this.start.left + (event.clientX - this.start.x) / Ktu.edit.scale;
            target.top = this.start.top + (event.clientY - this.start.y) / Ktu.edit.scale;
        }
        target.setCoords();
        if (target.type == 'cimage' && this.beforeSelectedData && this.beforeSelectedData.type == 'imageContainer') {
            target.isTranslating = true;
            this.checkXYInImageContainer(target);
            return;
        }
        this.checkTranslate(target);
    }
    translateObjects(e) {
        const {
            currentMulti,
        } = Ktu;
        const event = this.moveEvent;
        const offsetLeft = event.clientX - this.start.x;
        const offsetTop = event.clientY - this.start.y;
        const {
            objectsPosition,
        } = this.start;
        const {
            scale,
        } = Ktu.edit;
        if (e.shiftKey) {
            if (!this.firstMove) {
                if (Math.abs(offsetLeft) > 0 && Math.abs(offsetLeft) > Math.abs(offsetTop)) {
                    this.firstMove = 'level';
                } else {
                    this.firstMove = 'vertical';
                }
                Ktu.log('keyboard', 'dragAndDrop');
            }
            if (this.firstMove == 'level') {
                currentMulti.left = this.start.left + offsetLeft / scale;
            } else {
                currentMulti.top = this.start.top + offsetTop / scale;
            }
        } else {
            currentMulti.left = this.start.left + offsetLeft / scale;
            currentMulti.top = this.start.top + offsetTop / scale;
        }
        currentMulti.objects.forEach((object, index) => {
            if (e.shiftKey) {
                if (this.firstMove == 'level') {
                    object.left = objectsPosition[index].left + offsetLeft / scale;
                } else {
                    object.top = objectsPosition[index].top + offsetTop / scale;
                }
            } else {
                object.left = objectsPosition[index].left + offsetLeft / scale;
                object.top = objectsPosition[index].top + offsetTop / scale;
            }
            object.setCoords();
        });
        currentMulti.setCoords();
        this.checkTranslate(currentMulti);
    }
    checkXYInImageContainer(source) {
        const item = source.image;
        const target = this.checkImageContainerTarget();

        if (!item) {
            return;
        }
        const filePath = item.src;
        this.cleanDragOverImage();
        if (!!filePath && !(/\.svg/.test(filePath)) && !!target && !!target.parent && target.parent.type == 'imageContainer') {
            if (!target.childIndex) {
                return;
            }
            const {
                childIndex,
            } = target;
            const child = target.parent.objects[childIndex];
            const {
                fileId,
            } = item;
            if (child.image.fileId == fileId) {
                return;
            }

            // 加入经过的对象，后面会清掉信息
            (!this.dragOverObjects.some(e => e == child)) && (this.dragOverObjects.push(child));
            this.dragOverIndex = this.dragOverObjects.indexOf(child);
            child.originImage = _.cloneDeep(child.image);
            child.image.fileId = item.fileId;
            child.image.width = item.width || item.w;
            child.image.height = item.height || item.h;
            child.image.scaleX = 1;
            child.image.scaleY = 1;
            child.image.src2000 = null;
            /* child.width = item.width;
               child.height = item.height;
               child.scaleX = 1; */
            const {
                src,
            } = item;
            // child.setImageSource(src);
            child.image.src = Ktu.utils.get160Image(src);
            child.setImageCenter(true);
            target.parent.dirty = true;
        } else {
            this.dragOverIndex = null;
        }
    }
    cleanDragOverImage() {
        this.dragOverObjects.forEach((e, i) => {
            if (!!e.originImage && this.dragOverIndex != i) {
                e.image.fileId = e.originImage.fileId;
                e.image.height = e.originImage.height;
                e.image.left = e.originImage.left;
                e.image.originalSrc = e.originImage.originalSrc;
                e.image.scaleX = e.originImage.scaleX;
                e.image.scaleY = e.originImage.scaleY;
                e.image.src = e.originImage.src;
                e.image.top = e.originImage.top;
                e.image.width = e.originImage.width;
                e.image.smallSrc = e.originImage.smallSrc;
                e.image.src2000 = e.originImage.src2000;
                e.container.dirty = true;
                delete e.originImage;
            }
        });
    }
    checkImageContainerTarget() {
        const event = this.moveEvent;
        // const { target: evTarget } = event;
        let paths = [];
        // paths = event.path || (event.composedPath && event.composedPath());
        paths = Ktu.utils.getPaths(event);
        const result = {};
        let sourceData = Ktu.selectedTemplateData;
        /* 先遍历一次，看是不是组合里面
           然后改变sourceData */
        for (const path of paths) {
            // 点中未选中的元素（包括组合）
            if (path.className && path.className.includes && path.className.includes('ele') && path.getAttribute('data-index')) {
                const index = path.getAttribute('data-index');
                const target = sourceData.objects[index];
                const subindex = path.getAttribute('data-subindex');
                if (!!subindex) {
                    sourceData = target;
                }
            }
        }
        for (const path of paths) {
            // 点中已选中的元素
            if (path.getAttribute && path.getAttribute('data-type') == 'containerImage' && path.getAttribute('data-subindex')) {
                const parent = $(path).closest('.ele')
                    .get(0);
                const index = parent.getAttribute('data-index');
                const target = sourceData.objects[index];
                result.parent = target;
                result.childIndex = path.getAttribute('data-subindex');
            }
        }

        return result;
    }
    dropInImageContainer(source) {
        const item = source.image;
        const target = this.checkImageContainerTarget();
        if (!item) {
            return;
        }
        this.dragOverIndex = null;
        // 清掉经过的对象
        this.cleanDragOverImage();
        this.dragOverObjects = [];
        const filePath = item.src;

        /* console.log(!!filePath);
           console.log(!(/\.svg/.test(filePath)));
           console.log(!!target );
           console.log(!!target.parent);
           console.log(target.parent.type == 'imageContainer'); */
        if (!!filePath && !(/\.(svg)|(gif)/.test(filePath)) && !!target && !!target.parent && target.parent.type == 'imageContainer') {
            if (!target.childIndex) {
                return;
            }
            Ktu.element.groupStateObject = target.parent;
            source.saveState(HistoryAction.OBJECT_GROUP);
            const {
                childIndex,
            } = target;
            const child = target.parent.objects[childIndex];
            child.image.fileId = item.fileId;
            child.image.width = item.width || item.w;
            child.image.height = item.height || item.h;
            child.image.scaleX = 1;
            child.image.scaleY = 1;
            child.filters = source.filters;

            /* child.width = item.width;
               child.height = item.height;
               child.scaleX = 1; */
            const {
                src,
            } = item;
            delete child.image.smallSrc;
            child.setImageSource(src);
            child.setImageCenter();
            /* target.parent.modifiedState();
               child.autoCrop(); */
            target.parent.dirty = true;
            target.parent.hasChange = true;

            const selKey = source.key;
            Ktu.selectedTemplateData.objects.splice(selKey, 1);
            Ktu.element.refreshElementKey();

            source.groupState();
            Ktu.selectedData = target.parent;
            Ktu.element.groupStateObject = null;
            Ktu.simpleLog('imageContainer', 'dragCenterPic');
            return;
        }
    }
    changeMapZoom(target) {
        const mapWidth = 595;
        const mapHeight = 335;
        let mapTimer = null;

        if (!document.querySelector('#hiddenMapContainer')) {
            const container = document.createElement('div');
            container.setAttribute('id', 'hiddenMapContainer');
            container.style.visibility = 'hidden';
            container.style.width = `${mapWidth}px`;
            container.style.height = `${mapHeight}px`;
            container.classList.add('f_DNSTraffic');
            document.body.appendChild(container);
        }

        const diffScale = target.scaleX - this.oldTarget.scaleX;
        const newZoom = this.oldTarget.msg.mapObj.zoom - diffScale;

        const map = new AMap.Map('hiddenMapContainer', {
            zoom: newZoom,
            center: [target.msg.mapObj.longitude, target.msg.mapObj.latitude],
            // 使用3D视图
            viewMode: '3D',
            keyboardEnable: false,
            resizeEnable: true,
            mapStyle: target.msg.mapStyle,
        });
        new AMap.Marker({
            position: [target.msg.mapObj.longitude, target.msg.mapObj.latitude],
            map,
        });

        map.on('complete', () => {
            if (mapTimer) {
                clearTimeout(mapTimer);
                mapTimer = null;
            }
            mapTimer = setTimeout(() => {
                const mapCanvas = document.querySelector('#hiddenMapContainer .amap-layer');
                const newMapSrc = mapCanvas.toDataURL();

                const image = new Image();
                image.setAttribute('crossOrigin', 'Anonymous');
                image.src = newMapSrc;

                image.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    canvas.width = mapWidth;
                    canvas.height = mapHeight;

                    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

                    const imgIcon = new Image();
                    imgIcon.setAttribute('crossOrigin', 'Anonymous');
                    imgIcon.src = `${Ktu.initialData.resRoot}/image/editor/map/mark_bs.png`;

                    imgIcon.onload = () => {
                        ctx.drawImage(imgIcon, canvas.width / 2 - imgIcon.width / 2, canvas.height / 2 - imgIcon.height, imgIcon.width, imgIcon.height);

                        target.image.src = canvas.toDataURL();
                        target.image.smallSrc = canvas.toDataURL();
                        target.image.originalSrc = canvas.toDataURL();
                        target.dirty = true;
                        target.msg.mapObj.zoom = newZoom;
                        target.modifiedState();
                    };
                };
            }, 500);
        });
    }
    /**
     * checkResize 是拖拉时的自动吸附功能
     */
    resize() {
        this.isMoving = true;
        this.isResizing = true;
        let target;
        if (Ktu.currentMulti) {
            this.resizeObjects();

            target = Ktu.currentMulti;

            this.checkResize(target, this.currentControl);

            if (!!target.snapOffsetX || !!target.snapOffsetY) {
                this.resizeObjects({
                    x: target.snapOffsetX,
                    y: target.snapOffsetY,
                });
            }
        } else {
            target = this.getEditTarget();
            target = target || Ktu.selectedGroup || Ktu.selectedData;
            this.resizeObject(target);
            this.checkResize(target, this.currentControl);

            if (!!target.snapOffsetX || !!target.snapOffsetY) {
                this.resizeObject(target);
            }
        }

        // 缩放需要重新生成地图
        /* if (target.type === 'map') {
            if (this.resizeTimer) {
                clearInterval(this.resizeTimer);
                this.resizeTimer = null;
            }

            this.resizeTimer = setTimeout(() => {
                this.changeMapZoom(target);
            }, 1000);
        } */

        // 重新调整组的位置和大小
        if (target.group) {
            target.group.updateSizePosition();
        }
    }
    setResize(offsets) {
        const canResize = offsets.every(offsetObj => {
            const {
                object,
            } = offsetObj;
            const {
                offset,
            } = offsetObj;
            // eslint-disable-next-line no-nested-ternary
            const scaleXProp = offset.width ? 'width' : offset.scaleX ? 'scaleX' : '';
            // eslint-disable-next-line no-nested-ternary
            const scaleYProp = offset.height ? 'height' : offset.strokeWidth ? 'strokeWidth' : offset.scaleY ? 'scaleY' : '';
            let {
                scaleLimit,
            } = this;
            // 先计算有没有超出限制，超出后return
            if (scaleXProp) {
                const otherXProp = scaleXProp === 'width' ? 'scaleX' : 'width';
                const newScaleXValue = object[scaleXProp] + offset[scaleXProp];
                // 文本横向缩放时最小值为最宽字体长度
                if (object instanceof Text || object.type === 'threeText') {
                    // 等比放大字体时，大于999返回false
                    if (!this.currentControl.includes('m') && object.fontSize * newScaleXValue > 999 && newScaleXValue * object[otherXProp] > object[scaleXProp] * object[otherXProp]) {
                        return false;
                    }
                    if (this.currentControl.includes('m')) {
                        scaleLimit = object.maxCharWidth;
                    }
                }
                if (object.type === 'group') {
                    const isOverFontsize = object.objects.some(obj => {
                        if (obj instanceof Text) {
                            // 等比放大字体时，大于999返回false
                            if (!this.currentControl.includes('m') && obj.fontSize * newScaleXValue * obj.scaleX > 999 && newScaleXValue * object[otherXProp] > object[scaleXProp] * object[otherXProp]) {
                                return true;
                            }
                        }
                        return false;
                    });
                    if (isOverFontsize) {
                        return false;
                    }
                }
                // 线段横向缩放时最小值
                if (object instanceof Line && this.currentControl.includes('m')) {
                    scaleLimit = 1;
                }
                // 当缩小时，小于最小值则返回false
                if (scaleLimit > newScaleXValue * object[otherXProp] && newScaleXValue * object[otherXProp] < object[scaleXProp] * object[otherXProp]) {
                    return false;
                }
            }
            if (scaleYProp) {
                // eslint-disable-next-line no-nested-ternary
                const otherYProp = scaleYProp === 'height' || scaleYProp === 'strokeWidth' ? 'scaleY' : object.height ? 'height' : 'strokeWidth';
                const newScaleYValue = object[scaleYProp] + offset[scaleYProp];
                if (scaleLimit > newScaleYValue * object[otherYProp]) {
                    return false;
                }
            }
            return true;
        });
        if (canResize) {
            offsets.forEach(offsetObj => {
                const {
                    offset,
                } = offsetObj;
                const {
                    object,
                } = offsetObj;
                Object.keys(offset).forEach(property => {
                    offsetObj.object[property] += offset[property];
                });
                object.setCoords();
            });
        }
    }
    resizeObject(target) {
        const event = this.moveEvent;
        target = target || Ktu.selectedGroup || Ktu.selectedData;
        if (!target) {
            return;
        }
        /* if (target.isInContainer) {
            target = target.container;
        }*/
        const {
            currentControl,
        } = this;
        let height;
        let width;
        if (target.type === 'line') {
            height = target.actualHeight;
            width = target.actualWidth;
        } else {
            height = target.height;
            width = target.width;
        }

        const includedAngle = Math.atan(height * target.scaleY / (width * target.scaleX)) * 180 / Math.PI;
        const controlAngleMap = {
            mr: 0,
            br: includedAngle,
            mb: 90,
            bl: 180 - includedAngle,
            ml: 180,
            tl: 180 + includedAngle,
            mt: 270,
            tr: 360 - includedAngle,
        };
        const {
            acrossMap,
        } = this;
        const radian = target.angle * Math.PI / 180;
        const angleCos = Math.cos(radian);
        const angleSin = Math.sin(radian);
        let offsetX = (event.clientX - this.start.x) / Ktu.edit.scale;
        let offsetY = (event.clientY - this.start.y) / Ktu.edit.scale;
        const cornerList = currentControl.includes('m') ? ['mr', 'mb', 'ml', 'mt'] : ['br', 'bl', 'tl', 'tr'];
        let totalAngle = target.angle + controlAngleMap[currentControl] + (currentControl.includes('m') ? 90 / 2 : 0);
        totalAngle < 0 && (totalAngle += 360);
        totalAngle >= 360 && (totalAngle -= 360);
        !totalAngle && (totalAngle = 0);
        const plusPosition = cornerList[Math.floor(totalAngle / 90)];
        const xSign = plusPosition.includes('r') ? 1 : -1;
        const ySign = plusPosition.includes('b') ? 1 : -1;
        offsetX *= xSign;
        offsetY *= ySign;

        const snapOffsetX = target.snapOffsetX || 0;
        const snapOffsetY = target.snapOffsetY || 0;

        offsetX = (Math.abs(snapOffsetX) > Math.abs(offsetX)) ? -snapOffsetX : offsetX;
        offsetY = (Math.abs(snapOffsetY) > Math.abs(offsetY)) ? -snapOffsetY : offsetY;

        /* offsetX = snapOffset.x ? -snapOffset.x  : offsetX;
           offsetY = snapOffset.y ? -snapOffset.y : offsetY; */

        const offset = {};
        // 不等比例缩放
        if (currentControl.includes('m')) {
            if (acrossMap[currentControl] !== plusPosition && currentControl !== plusPosition) {
                [offsetX, offsetY] = [offsetY, offsetX];
            }
            if (currentControl === 'mr' || currentControl === 'ml') {
                // 拖拉改变真实宽度
                if (target.scaleProp === 'wh') {
                    offset.width = offsetX / target.scaleX;
                    target.hasChanged !== undefined && (target.hasChanged = true);
                    // 拖拉改变scale值
                } else {
                    const offsetScaleX = offsetX / target.width;
                    offset.scaleX = offsetScaleX;
                }
                if (currentControl === 'ml') {
                    offset.left = -offsetX * angleCos;
                    offset.top = -offsetX * angleSin;
                }
            } else if (currentControl === 'mb' || currentControl === 'mt') {
                if (target.scaleProp === 'wh') {
                    if (target.type === 'line') {
                        offset.strokeWidth = offsetY / target.scaleY;
                    } else {
                        offset.height = offsetY / target.scaleY;
                    }
                } else {
                    const offsetScaleY = offsetY / target.height;
                    offset.scaleY = offsetScaleY;
                }
                if (currentControl === 'mt') {
                    offset.left = offsetY * angleSin;
                    offset.top = -offsetY * angleCos;
                }
            }

            // 破坏比例的缩放取消尺寸锁定
            if (target.isSizeLock) {
                target.isSizeLock = false;
            }

            // 等比例缩放
        } else {
            const originWHRatio = width * target.scaleX / (height * target.scaleY);
            // 取偏移总和按比例均分
            offsetY = (offsetX + offsetY) / (1 + originWHRatio);
            offsetX = offsetY * originWHRatio;
            if (offsetX && offsetY) {
                const offsetScaleY = offsetY / height;
                const offsetScaleX = offsetX / width;

                offset.scaleX = offsetScaleX;
                offset.scaleY = offsetScaleY;
                if (currentControl === 'br') {} else if (currentControl === 'tl') {
                    const sideLength = Math.sqrt(offsetX ** 2 + offsetY ** 2);
                    const includedAngle = Math.atan(originWHRatio);
                    const angleOffset = includedAngle - radian;
                    const sign = offsetX < 0 ? -1 : 1;
                    offset.left = -sideLength * Math.sin(angleOffset) * sign;
                    offset.top = -sideLength * Math.cos(angleOffset) * sign;
                } else if (currentControl === 'tr') {
                    offset.left = offsetY * angleSin;
                    offset.top = -offsetY * angleCos;
                } else if (currentControl === 'bl') {
                    offset.left = -offsetX * angleCos;
                    offset.top = -offsetX * angleSin;
                }
            }
        }

        this.setResize([{
            offset,
            object: target,
        }]);

        this.start = {
            x: event.clientX,
            y: event.clientY,
        };
        if (!this.dirtyAfterMouseUp) {
            target.dirty = true;
        }
    }
    resizeObjects(snapOffset) {
        const event = this.moveEvent;
        const target = Ktu.currentMulti;

        if (!target) {
            return;
        }
        const {
            currentControl,
        } = this;
        const includedAngle = Math.atan(target.height * target.scaleY / (target.width * target.scaleX)) * 180 / Math.PI;
        const controlAngleMap = {
            br: includedAngle,
            bl: 180 - includedAngle,
            tl: 180 + includedAngle,
            tr: 360 - includedAngle,
        };
        const {
            acrossMap,
        } = this;
        let offsetX = (event.clientX - this.start.x) / Ktu.edit.scale;
        let offsetY = (event.clientY - this.start.y) / Ktu.edit.scale;
        const cornerList = ['br', 'bl', 'tl', 'tr'];
        let totalAngle = target.angle + controlAngleMap[currentControl];
        totalAngle < 0 && (totalAngle += 360);
        totalAngle >= 360 && (totalAngle -= 360);
        !totalAngle && (totalAngle = 0);
        const plusPosition = cornerList[Math.floor(totalAngle / 90)];
        const xSign = plusPosition.includes('r') ? 1 : -1;
        const ySign = plusPosition.includes('b') ? 1 : -1;
        offsetX *= xSign;
        offsetY *= ySign;

        snapOffset = snapOffset || {};
        offsetX = snapOffset.x ? -snapOffset.x : offsetX;
        offsetY = snapOffset.y ? -snapOffset.y : offsetY;

        const originWHRatio = target.width * target.scaleX / (target.height * target.scaleY);
        // 取偏移总和按比例均分
        offsetY = (offsetX + offsetY) / (1 + originWHRatio);
        offsetX = offsetY * originWHRatio;
        // 整体缩放值，所有元素包括多选都是应用这个缩放值
        const totalOffsetScaleX = offsetX / (target.width * target.scaleX);
        const totalOffsetScaleY = offsetY / (target.height * target.scaleY);
        const offsets = [];
        const turn = (object, index) => {
            // 计算实际缩放值
            const dimensions = object.getDimensions();
            const objectOffsetScaleX = dimensions.w * object.scaleX * totalOffsetScaleX / dimensions.w;
            const objectOffsetScaleY = dimensions.h * object.scaleY * totalOffsetScaleY / dimensions.h;
            // 根据基点坐标计算相对位置
            const coord = target.coords[acrossMap[currentControl]];
            const toOriginPoint = {
                x: object.left - coord.x,
                y: object.top - coord.y,
            };
            // 矩阵公式计算偏移量
            const end = {
                x: totalOffsetScaleX * toOriginPoint.x,
                y: totalOffsetScaleY * toOriginPoint.y,
            };
            const objectOffset = {};
            objectOffset.scaleX = objectOffsetScaleX;
            objectOffset.scaleY = objectOffsetScaleY;
            objectOffset.left = end.x;
            objectOffset.top = end.y;
            offsets.push({
                object,
                offset: objectOffset,
            });
        };
        target.objects.forEach(turn);
        turn(target);
        this.setResize(offsets);
        this.start = {
            x: event.clientX,
            y: event.clientY,
        };
        target.dirty = true;
    }
    // 获取组内当前编辑的元素（所在组或元素）
    getEditTarget() {
        /* console.log(this.isEditingGroup);
           if (this.isEditingGroup) {
           return Ktu.selectedGroup;
           } */
        return Ktu.selectedData || Ktu.selectedGroup;
    }
    // 拿到开始旋转时鼠标指针与中心点向量和旋转图标与中心点向量的夹角
    getRotateOffsetAngle() {
        const event = this.downEvent;
        let target;
        if (Ktu.currentMulti) {
            target = Ktu.currentMulti;
        } else {
            target = Ktu.selectedData || Ktu.selectedGroup;
        }
        /* if (!!target && target.isInContainer) {
            target = target.container;
        }*/
        let radian = Math.PI * (target.angle + 90) / 180;
        const {
            center,
        } = target.coords;
        const mouse = new Vector((event.clientX - this.editorClientRect.left) / Ktu.edit.scale - center.x, (event.clientY - this.editorClientRect.top) / Ktu.edit.scale - center.y);
        const icon = new Vector(Math.cos(radian), Math.sin(radian));
        radian = Math.acos(mouse.dot(icon) / (mouse.getMagnitude() * icon.getMagnitude()));
        let angle = radian * 180 / Math.PI;
        /* 判断夹角正负，因为指针可能在图标左侧或者右侧。
           取任意与指针和图标夹角都小于180度的向量去对比角度，此处直接拿元素旋转的角度向量 */
        const start = new Vector(Math.cos(Math.PI * target.angle / 180), Math.sin(Math.PI * target.angle / 180));
        const mouseRadian = Math.acos(start.dot(mouse) / (start.getMagnitude() * mouse.getMagnitude()));
        const iconRadian = Math.acos(start.dot(icon) / (start.getMagnitude() * icon.getMagnitude()));
        if (mouseRadian < iconRadian) {
            angle = -angle;
        }
        return angle;
    }
    rotate() {
        this.isMoving = true;
        this.isRotating = true;
        let target;
        if (Ktu.currentMulti) {
            target = Ktu.currentMulti;
        } else {
            target = Ktu.selectedData || Ktu.selectedGroup;
        }

        /* if (target.isInContainer) {
            target = target.container;
        }*/
        const mouse = {
            x: (event.clientX - this.editorClientRect.left) / Ktu.edit.scale,
            y: (event.clientY - this.editorClientRect.top) / Ktu.edit.scale,
        };
        const centerInGroup = Object.assign({}, target.coords.center);
        if (target.group) {
            centerInGroup.x = centerInGroup.x + target.group.left;
            centerInGroup.y = centerInGroup.y + target.group.top;
        }
        const end = new Vector(mouse.x - centerInGroup.x, mouse.y - centerInGroup.y);
        // 图标0度时的向量，在正下方，单位向量为（0,1）。
        const start = new Vector(0, 1);
        // 向量点乘公式 a * b = |a||b|cosθ
        let radian = Math.acos(start.dot(end) / (start.getMagnitude() * end.getMagnitude()));
        // 大于180度时，角度取向量夹角与360的差
        if (end.x.toFixed(6) > 0) {
            radian = Math.PI * 2 - radian;
        }
        /* console.log(radian);
           此处减去指针与实际图标的夹角，避免开始旋转时的小角度跳动
           console.log(Ktu.store.state.data.selectedData); */
        // let oldAngle = 0;
        let angle;
        // let isSun;

        /* console.log(Ktu.store.state.data.selectedData);
           console.log(Ktu.store.state.data.currentMulti);
           console.log(Ktu.store.state.data.selectedGroup);
           console.log(Ktu.store.state.data.selectedTemplateData);
           目标元素 */
        let arrowElement = Ktu.store.state.data.selectedData || Ktu.store.state.data.currentMulti || Ktu.store.state.data.selectedGroup;

        /* console.log(arrowElement);
           console.log(target.group);
           console.log(this.start.offsetAngle);
           console.log(target.group); */

        // 这里图片容器需要特殊处理，因为如果选择里面的元素是无法设置角度的。
        if (arrowElement.containerId) {
            const imageContainerList = [];
            let isBreak = false;
            for (let i = 0; i < Ktu.store.state.data.selectedTemplateData.objects.length; i++) {
                if (Ktu.store.state.data.selectedTemplateData.objects[i].type == 'imageContainer') {
                    imageContainerList.push(Ktu.store.state.data.selectedTemplateData.objects[i]);
                }
            }
            for (let j = 0; j < imageContainerList.length; j++) {
                for (let k = 0; k < imageContainerList[j].objects.length; k++) {
                    if (imageContainerList[j].objects[k].isSelected) {
                        isBreak = true;
                        break;
                    }
                }
                if (isBreak) {
                    arrowElement = imageContainerList[j];
                    break;
                }
            }
        }

        angle = Math.round(radian * 180 / Math.PI - this.start.offsetAngle);

        // console.log(angle - arrowElement.angle);

        /* if (angle - arrowElement.angle > 0) {
            isSun = true;
        } else if (angle - arrowElement.angle === 0) {
            isSun = isSun;
        } else {
            isSun = false;
        } */

        // console.log(isSun);

        // console.log(arrowElement.angle);

        // console.log(arrowElement)

        if (target.group) {
            if (arrowElement.angle > 0) {
                angle = Math.round(radian * 180 / Math.PI);
                if (angle - Math.abs(arrowElement.angle) > 180) {
                    angle = -360 + Math.round(radian * 180 / Math.PI - this.start.offsetAngle);
                }
            }
            // 如果一开始没有角度时，判断顺时针还是逆时针
            else if (arrowElement.angle === 0) {
                if (radian < 3) {
                    angle = Math.round(radian * 180 / Math.PI);
                } else {
                    angle = -360 + Math.round(radian * 180 / Math.PI);
                }
            } else {
                angle = -360 + Math.round(radian * 180 / Math.PI);
                if (arrowElement.angle - angle > 180) {
                    angle = Math.round(radian * 180 / Math.PI - this.start.offsetAngle);
                }
            }
        } else {
            if (arrowElement.angle > 0) {
                angle = Math.round(radian * 180 / Math.PI - this.start.offsetAngle);
                // 这里是处理快速没有过0点时的状况
                if (angle - Math.abs(arrowElement.angle) > 180) {
                    angle = -360 + Math.round(radian * 180 / Math.PI - this.start.offsetAngle);
                }
            }
            // 如果一开始没有角度时，判断顺时针还是逆时针
            else if (arrowElement.angle === 0) {
                if (radian < 3) {
                    angle = Math.round(radian * 180 / Math.PI - this.start.offsetAngle);
                } else {
                    angle = -360 + Math.round(radian * 180 / Math.PI - this.start.offsetAngle);
                }
            } else {
                angle = -360 + Math.round(radian * 180 / Math.PI - this.start.offsetAngle);
                // 这里是处理快速没有过0点时的状况
                if (arrowElement.angle - angle > 180) {
                    angle = Math.round(radian * 180 / Math.PI - this.start.offsetAngle);
                }
            }
        }

        /* console.log(angle);
        console.log(radian); */
        /* if (target.group) {
           angle = Math.round(radian * 180 / Math.PI);
           } else {
           angle = Math.round(radian * 180 / Math.PI - this.start.offsetAngle);
           } */

        /* if (target.group) {
           angle = Math.round(radian * 180 / Math.PI);
           if (radian === 0) {
           if (angle > 180) {
           angle = -360 + angle;
           }
           }
           } else {
           angle = Math.round(radian * 180 / Math.PI - this.start.offsetAngle);
           if (angle === 360 || angle === 0) {
           if (angle > 180) {
           arrow = -1;
           } else {
           arrow = 1;
           }
           }
           if (arrow > 0) {
           console.log('a');
           angle = angle;
           } else {
           console.log('b');
           angle = -360 + angle;
           }
           } */
        angle = this.checkRotate(angle);
        // console.log(angle);
        target.setAngle(angle);
        if (target.group) {
            target.group.updateSizePosition();
        }
    }

    threeRotate() {
        // 需要确保canvas初始化完毕才能够绘制
        const target = Ktu.selectedData;
        if (target.hasCanvasPainted) {
            // 偏移200，就旋转90°吧
            this.isThreeRotating = true;
            const angleX = ((this.end.y - this.start.y) / 200) * 90;
            const angleY = ((this.end.x - this.start.x) / 200) * 90;
            target.changeRotation(angleX, angleY);
        }
    }
    threeRotateEnd() {
        const target = Ktu.selectedData;
        if (this.end && target.hasCanvasPainted) {
            target.threeRotationEnd();
            target.modifiedState();
        }
    }

    radius() {
        const event = this.moveEvent;
        const target = this.getEditTarget();
        let offsetX = (event.clientX - this.start.x) / Ktu.edit.scale;
        let offsetY = (event.clientY - this.start.y) / Ktu.edit.scale;
        const cornerList = ['mr', 'mb', 'ml', 'mt'];
        let totalAngle = target.angle + 90 / 2;
        totalAngle < 0 && (totalAngle += 360);
        totalAngle >= 360 && (totalAngle -= 360);
        !totalAngle && (totalAngle = 0);
        const plusPosition = cornerList[Math.floor(totalAngle / 90)];
        const xSign = plusPosition.includes('r') ? 1 : -1;
        const ySign = plusPosition.includes('b') ? 1 : -1;
        offsetX *= xSign;
        offsetY *= ySign;
        if ('ml' !== plusPosition && 'mr' !== plusPosition) {
            [offsetX, offsetY] = [offsetY, offsetX];
        }
        const maxRadius = Math.floor(Math.min(target.width * target.scaleX, target.height * target.scaleY) / 2 + 1);
        let radius = target.radius.size + offsetX;
        radius = Math.min(Math.max(0, radius), maxRadius);
        target.radius.size = radius;
        target.dirty = true;
        this.start = {
            x: event.clientX,
            y: event.clientY,
        };
    }

    // 表格的单元格缩放
    tableResize() {
        const event = this.moveEvent;
        const target = this.getEditTarget();

        const oldPosition = {
            x: this.start.x,
            y: this.start.y,
        };
        const newPosition = {
            x: event.clientX,
            y: event.clientY,
        };
        const oldPositionToCenter = {
            x: oldPosition.x - target.coords.center.x,
            y: oldPosition.y - target.coords.center.y,
        };
        const newPositionToCenter = {
            x: newPosition.x - target.coords.center.x,
            y: newPosition.y - target.coords.center.y,
        };
        const radian = -target.angle * Math.PI / 180;
        const originOldPosition = {
            x: Math.cos(radian) * oldPositionToCenter.x - Math.sin(radian) * oldPositionToCenter.y + target.coords.center.x,
            y: Math.sin(radian) * oldPositionToCenter.x + Math.cos(radian) * oldPositionToCenter.y + target.coords.center.y,
        };
        const originNewPosition = {
            x: Math.cos(radian) * newPositionToCenter.x - Math.sin(radian) * newPositionToCenter.y + target.coords.center.x,
            y: Math.sin(radian) * newPositionToCenter.x + Math.cos(radian) * newPositionToCenter.y + target.coords.center.y,
        };
        const offsetX = (originNewPosition.x - originOldPosition.x) / Ktu.edit.scale;
        const offsetY = (originNewPosition.y - originOldPosition.y) / Ktu.edit.scale;

        target.resize(this.tableResizeData, offsetX / target.scaleX, offsetY / target.scaleY);

        target.dirty = true;
        target.setCoords();

        if (target.group) {
            target.group.updateSizePosition();
        }
        this.start = {
            x: event.clientX,
            y: event.clientY,
        };
    }

    getTarget() {
        return Ktu.currentMulti || Ktu.selectedGroup || Ktu.selectedData;
    }
    // 选中的目标是否是已选中的上一个目标
    isLastTarget(target) {
        return target && (Ktu.currentMulti === target || Ktu.selectedGroup === target || Ktu.selectedData === target);
    }
    isGrouping(event, selectedTarget) {
        const target = this.getTarget();
        // 是否满足快捷键
        const checkKey = event.ctrlKey || event.shiftKey;
        // 是否未锁定
        const notLocked = target && !target.isLocked;
        // 是否点到已选中组合的子元素
        const notSelectTargetInSelectedGroup = !(selectedTarget && selectedTarget.group && selectedTarget.group === Ktu.selectedGroup);
        // const isContainer = (target && target.container && selectedTarget && selectedTarget.type === 'imageContainer') || (target && target.type === 'imageContainer' && selectedTarget && selectedTarget.container);
        const isContainer = !!(!!target && !!target.isInContainer || !!selectedTarget && !!selectedTarget.isInContainer);
        return checkKey && notLocked && notSelectTargetInSelectedGroup && !isContainer;
    }
    getSelectedObjects() {
        const target = this.getTarget();
        if (target.type === 'multi') {
            return target.objects;
        } else if (target.container) {
            return [target.container];
        }
        return [target];
    }
    getNewMultiObjects(target) {
        let index = 0;
        const isTargetInMulti = Ktu.currentMulti && Ktu.currentMulti.objects.some((object, idx) => {
            if (object === target) {
                index = idx;
                return true;
            }
            return false;
        });
        let objects;
        if (isTargetInMulti) {
            Ktu.currentMulti.objects.splice(index, 1);
            objects = Ktu.currentMulti.objects;
        } else {
            objects = this.getSelectedObjects();
            objects.push(target);
        }
        return objects;
    }
    select(target, ev) {
        const event = ev || this.downEvent;
        if (this.isGrouping(event, target) && !target.isLocked) {
            const objects = this.getNewMultiObjects(target);
            this.uncheckAll();
            if (objects.length) {
                this.changeSelectedTarget(new Multi({
                    objects,
                }));
                /* Ktu.currentMulti = new Multi({
                   objects: objects
                   }); */
            }
        } else {
            if (target.type == 'background' && (event.ctrlKey || event.shiftKey)) {} else {
                if (target) {
                    if (!target.group) {
                        this.beforeSelectedData = Ktu.selectedData;
                        this.uncheckAll();
                    }
                    this.changeSelectedTarget(target);
                }
            }
        }
    }
    checkHover(event) {
        // 图片在编辑器拉入图片容器的处理
        if (Ktu.selectedData && Ktu.selectedData.isTranslating) {
            return;
        }
        let target = null;
        const paths = event.path || (event.composedPath && event.composedPath());
        let isGroup = false;
        // 先遍历一次，看是不是组合里面
        for (const path of paths) {
            // 点中未选中的元素（包括组合）
            if (path.className && path.className.includes && path.className.includes('ele') && path.getAttribute('data-index')) {
                const index = path.getAttribute('data-index');
                const subindex = path.getAttribute('data-subindex');
                if (!!index && !!subindex) {
                    isGroup = true;
                }
            }
        }
        for (const path of paths) {
            // 点中已选中的元素]
            if (!isGroup && path.getAttribute && path.getAttribute('data-type') == 'containerImage' && path.getAttribute('data-subindex')) {
                const parent = $(path).closest('.ele')
                    .get(0);
                const index = parent.getAttribute('data-index');
                target = Ktu.selectedTemplateData.objects[index];

                if (!target) {
                    break;
                }

                const subindex = path.getAttribute('data-subindex');
                /* if(target.objects.length>1){
                   点中组合中子元素 */
                if (subindex) {
                    target = target.objects[subindex];
                    target.isHover = true;
                    break;
                }
                /* }
                   点中未选中的元素（包括组合） */
            } else if (path.className && path.className.includes && path.className.includes(this.element) && path.getAttribute('data-index')) {
                const index = path.getAttribute('data-index');
                target = Ktu.selectedTemplateData.objects[index];
                if (!target) {
                    break;
                }
                const subindex = path.getAttribute('data-subindex');
                // 图片容器图片区域hover
                if (target.type == 'imageContainer') {
                    target.objects.forEach(e => {
                        e.isHover = false;
                    });
                }
                // //点中组合中子元素
                if (subindex) {
                    target = target.objects[subindex];
                    break;
                }
            }
        }
        if (!!target) {
            if (this.lastHoverTarget != target) {
                clearTimeout(this.hoverTimeoutId);
                if (!!target.hoverTip && target.type != 'imageContainer' && !(target.isInContainer && Ktu.selectedData && Ktu.selectedData == target)) {
                    this.hoverTip = null;
                    this.hoverTimeoutId = setTimeout(() => {
                        if (target.group && (target.type === 'cimage' || target.type === 'path-group' || target.type === 'ellipse' || target.type === 'rect')) {
                            // this.hoverTip = null;
                            if (target.imageType == 'gif') {
                                this.hoverTip = null;
                            } else {
                                if (Ktu.selectedData) {
                                    if (Ktu.selectedData == target) {
                                        this.hoverTip = target.hoverTip;
                                    } else {
                                        this.hoverTip = null;
                                    }
                                } else {
                                    this.hoverTip = target.hoverTip;
                                }
                            }
                        } else {
                            if (target.isInContainer) {
                                this.hoverTip = target.container.hoverTip;
                            } else {
                                if (target.imageType !== 'gif') {
                                    if (Ktu.selectedData) {
                                        if (Ktu.selectedData == target) {
                                            this.hoverTip = target.hoverTip;
                                        } else {
                                            this.hoverTip = null;
                                        }
                                    } else {
                                        this.hoverTip = target.hoverTip;
                                    }
                                }
                            }
                        }
                        /* this.end = {
                           x: event.clientX,
                           y: event.clientY
                           } */
                    }, 500);
                } else if (target.type == 'imageContainer') {
                    this.hoverTimeoutId = setTimeout(() => {
                        if (target.group) {
                            if (Ktu.selectedData) {
                                if (Ktu.selectedData == target) {
                                    this.hoverTip = '双击换图';
                                } else {
                                    this.hoverTip = null;
                                }
                            } else {
                                this.hoverTip = '双击换图';
                            }
                        }
                    }, 500);
                } else {
                    this.hoverTip = null;
                    this.end = {};
                }
            } else if (target.isInContainer && Ktu.selectedData && Ktu.selectedData == target) {
                this.hoverTip = null;
                this.end = {};
            } else {
                this.end = {
                    x: event.clientX,
                    y: event.clientY,
                };
            }
            this.lastHoverTarget = target;
        } else {
            this.hoverTip = null;
            this.end = {};
        }
    }
    isInMulti(target) {
        const currentTarget = this.getTarget();
        if (currentTarget && currentTarget.type === 'multi') {
            return currentTarget.objects.some(object => object === target);
        }
        return false;
    }
    mousedown(event) {
        if (Ktu.imageClip.isClipping || Ktu.edit.isMoveMode || Ktu.edit.inAssistlLint) {
            return;
        }
        if (document.activeElement) {
            document.activeElement.blur();
        }
        this.downEvent = event;
        this.start = {
            x: event.clientX,
            y: event.clientY,
        };
        const isTimeMatch = Date.now() - this.lastMouseDownTime < 350;
        const isPositionMath = this.lastMouseDownPosition && Math.abs(event.clientX - this.lastMouseDownPosition.x) < 3 && Math.abs(event.clientY - this.lastMouseDownPosition.y) < 3;
        const isDoubleClick = isTimeMatch && isPositionMath;
        this.lastMouseDownTime = Date.now();
        this.lastMouseDownPosition = {
            x: event.clientX,
            y: event.clientY,
        };
        // 左键mousedown
        const isLeftDown = 'which' in event ? event.which === 1 : event.button === 0;
        this.tempTarget = Ktu.selectedData || Ktu.selectedGroup || Ktu.currentMulti;
        let target = this.checkTarget(event);
        this.target = target;
        this.oldTarget = _.cloneDeep(target);
        const targetType = this.target ? this.target.type : '';
        this.hasTranslated = false;

        if (this.target && this.target.group && this.tempTarget === this.target.group && this.hasGroupMoved) {
            this.isEditingGroup = true;
            this.uncheckAll();
            this.changeSelectedTarget(this.target.group);
            target = this.target.group;
        } else {
            if (!this.isSameChoice) {
                if (targetType !== 'multi') {
                    if ((targetType !== 'group')) {
                        this.isEditingGroup = false;
                        this.selectedGroup = null;
                    } else if (this.tempTarget && this.tempTarget.group === this.target) {
                        this.isEditingGroup = true;
                        Ktu.selectedData = null;
                    }
                }
            }
        }
        this.initEditorClientRect();
        // 在容器中的不处理
        if (target) {
            // 单击触发选择
            target.onClick && target.onClick(event);
            if (this.isLastTarget(target)) {
                if (!this.currentControl && target.type === 'multi' && isLeftDown) {
                    // 多选需要暂时把选中层pointer-events设为none,让点击能够穿透选中子元素
                    target.isPass = true;
                }
                if (target.type === 'group') {
                    this.changeSelectedTarget(target);
                }
                if (isDoubleClick && isLeftDown && !this.currentControl) {
                    // 双击前记录当前点击对象来源哪个分类
                    if (Ktu.selectedData) {
                        Ktu.vm.$store.commit('base/updateDblclickCategory', Ktu.selectedData.category);
                    }
                    if (target.type === 'imageContainer') {
                        Ktu.simpleLog('imageContainer', 'dlClickChangePic');
                        const imgInContainer = target.objects[0];
                        imgInContainer && imgInContainer.onDoubleClick && imgInContainer.onDoubleClick(event);
                    } else {
                        target.onDoubleClick && target.onDoubleClick(event);
                    }
                    this.resetAll();
                    return;
                }
            } else {
                this.select(target);
            }
            if (target.group && this.isEditingGroup) {
                target = target.group;
            }
            if (this.isInMulti(target)) {
                target = this.getTarget();
            }

            // 解决拖动过程中右键无法更新组的大小位置
            if (!isLeftDown) {
                if (this.target.type === 'group') {
                    this.target.updateSizePosition();
                }
            }
            // 解决拖动过程中右键后，没有保存状态导致无法正确前进和后退
            if (!this.isMoving) {
                target.saveState && target.saveState();
            }
            if (this.currentControl) {
                if (this.currentControl === 'unlock') {
                    target.lock();
                } else if (this.currentControl === 'rotate') {
                    this.canRotate = true;
                    this.start.offsetAngle = this.getRotateOffsetAngle();
                } else if (this.currentControl === 'radius_size') {
                    this.canRadius = true;
                } else if (this.currentControl.includes('radius_position')) {
                    target = this.getEditTarget();
                    const position = this.currentControl.split('_')[2];
                    target.radius[position] = !target.radius[position];
                    target.modifiedState();
                    target.dirty = true;
                } else if (this.currentControl === 'threeRotate') {
                    this.canThreeRotate = true;
                    this.start = {
                        x: event.clientX,
                        y: event.clientY,
                    };
                    target.saveState();
                    target.startRotation();
                } else if (this.currentControl === 'table_resize') {
                    this.canTableResize = true;
                } else {
                    this.canResize = true;
                    if (target.objects) {
                        target.objects.forEach(object => {
                            object.beforeResize && object.beforeResize();
                            if (object.type == 'threeText') {
                                object.noUpdateDirty = true;
                                this.dirtyAfterMouseUp = true;
                            }
                        });
                    } else {
                        target.beforeResize && target.beforeResize();
                        // 如果是3D文字的resize，再mouseup之后再触发dirty修改。
                        if (target.type == 'threeText') {
                            this.dirtyAfterMouseUp = true;
                        }
                    }
                }
            } else if (target.isLocked) {
                if (!Ktu.selectedGroup || target.type == 'background') {
                    this.isSelecting = true;
                }
            } else {
                this.canTranslate = true;
                this.start.left = target.left;
                this.start.top = target.top;

                if (!!Ktu.currentMulti) {
                    this.start.objectsPosition = Ktu.currentMulti.objects.map(object => ({
                        left: object.left,
                        top: object.top,
                    }));
                }
            }
        } else {
            if (event.shiftKey || event.ctrlKey) {
                this.isSelecting = true;
            } else {
                this.uncheckAll();
                this.isSelecting = true;
            }
        }
    }
    mousemove(event) {
        !this.currentControl && this.checkHover(event);
        this.moveEvent = event;
        if (Ktu.imageClip.isClipping || Ktu.edit.isMoveMode) {
            return;
        }

        if (this.start) {
            // 防止点击进入
            this.moveCount++;
            if (this.moveCount == 1) {
                return;
            }
            if (this.canTranslate) {
                this.hoverTip = null;
                this.translate(event);
            } else if (this.canResize) {
                this.hoverTip = null;
                this.resize();
            } else if (this.canRotate) {
                this.hoverTip = null;
                this.rotate();
            } else if (this.canRadius) {
                this.hoverTip = null;
                this.radius();
            } else if (this.canThreeRotate) {
                this.hoverTip = null;
                this.end = {
                    x: event.clientX,
                    y: event.clientY,
                };
                this.threeRotate();
            } else if (this.canTableResize) {
                this.tableResize();
            } else if (this.isSelecting) {
                this.end = {
                    x: event.clientX,
                    y: event.clientY,
                };
                const {
                    start,
                    end,
                } = this;
                const selectedBox = {
                    left: Math.min(start.x, end.x),
                    top: Math.min(start.y, end.y),
                    width: Math.abs(end.x - start.x),
                    height: Math.abs(end.y - start.y),
                };
                Ktu.store.commit('base/changeState', {
                    prop: 'selectedBox',
                    value: selectedBox,
                });
                this.selectedBox = selectedBox;
                if (!Ktu.selectedData || Ktu.selectedData.type !== 'background') {
                    Ktu.selectedTemplateData.objects.forEach(object => {
                        if (!object.isLocked && object.visible) {
                            if (this.isCollided(object) || object.isSelected) {
                                object.hasChosen = true;
                            } else {
                                object.hasChosen = false;
                            }
                        }
                    });
                } else {
                    Ktu.selectedTemplateData.objects.forEach(object => {
                        if (!object.isLocked && object.visible) {
                            if (this.isCollided(object)) {
                                object.hasChosen = true;
                            } else {
                                object.hasChosen = false;
                            }
                        }
                    });
                }
            }
        }
    }
    mouseup(event) {
        if (Ktu.imageClip.isClipping) {
            return;
        }
        this.firstMove = null;
        if (this.isSelecting) {
            const currentMulti = {
                objects: Ktu.selectedTemplateData.objects.filter(object => {
                    if (object.hasChosen) {
                        object.hasChosen = false;
                        return !object.isLocked;
                    }
                    return false;
                }),
            };
            if (currentMulti.objects.length) {
                this.uncheckAll();
                if (currentMulti.objects.length === 1) {
                    this.changeSelectedTarget(currentMulti.objects[0]);
                } else {
                    this.changeSelectedTarget(new Multi(currentMulti));
                }
            }
            if (Ktu.selectedGroup) {
                this.selectedData = null;
                this.changeSelectedTarget(Ktu.selectedGroup);
            }
        } else if (Ktu.selectedGroup) {
            /* mousedown 和 mouseup 相差ms内判定为点击，这时检查子元素
               if (Date.now() - this.lastMouseDownTime < 350) {
               const target = this.checkTarget(event);
               if (target) {
               Ktu.selectedData && (Ktu.selectedData.isSelected = false);
               Ktu.selectedData = null;
               if (target !== Ktu.selectedGroup) {
               Ktu.selectedData = target;
               target.isSelected = true;
               Ktu.selectedGroup.objects.forEach((object) => {
               object !== target && (object.isSelected = false);
               });
               if (isDoubleClick) {
               target.onDoubleClick && target.onDoubleClick();
               }
               } else {
               Ktu.selectedGroup.objects.forEach((object) => {
               object.isSelected = true;
               });
               }
               }
               }
               Ktu.selectedGroup.isPass = false; */
        } else if (Ktu.currentMulti) {
            // mousedown 和 mouseup 相差ms内判定为点击，这时检查子元素
            const isTimeMatch = Date.now() - this.lastMouseDownTime < 350;
            const isPositionMatch = this.lastMouseDownPosition && Math.abs(event.clientX - this.lastMouseDownPosition.x) === 0 && Math.abs(event.clientY - this.lastMouseDownPosition.y) === 0;
            const isTap = isTimeMatch && isPositionMatch;
            if (isTap) {
                const target = this.checkTarget(event);
                if (target) {
                    if (this.isGrouping(event, target)) {
                        if (target.type !== 'multi' && !target.isLocked) {
                            const objects = this.getNewMultiObjects(target);
                            this.uncheckAll();
                            if (objects.length > 1) {
                                this.changeSelectedTarget(new Multi({
                                    objects,
                                }));
                            } else {
                                this.changeSelectedTarget(objects[0]);
                            }
                        }
                    } else {
                        if (!target.isLocked) {
                            this.uncheckAll();
                            this.changeSelectedTarget(target);
                            if (target.type !== 'group') {
                                this.changeSelectedTarget(target);
                            }
                        }
                    }
                }
            }
            Ktu.currentMulti && (Ktu.currentMulti.isPass = false);
        }
        if (this.target && this.target.group && this.hasTranslated) {
            this.target.group.updateSizePosition();
        }
        if (this.isMoving || this.canRadius) {
            const target = this.getTarget();
            if (target.isTranslating && target.type == 'cimage' && this.beforeSelectedData && this.beforeSelectedData.type == 'imageContainer') {
                target.isTranslating = false;
                this.dropInImageContainer(target);
            } else {
                target.modifiedState();
            }

            Ktu.log('move');
        }
        if (this.canThreeRotate) {
            this.threeRotateEnd();
        }

        // 激活的resizeLine去掉active
        if (this.canTableResize) {
            this.tableResizeData.path.classList.remove('active');
            this.target.modifiedState();
        }

        // 要凉
        if (this.canRotate && this.target.type === 'threeText') {
            Ktu.log('threeTextEdit', 'changeAngle');
        }
        if (this.dirtyAfterMouseUp) {
            const target = this.getTarget();
            if (target.objects) {
                target.objects.forEach((item, index) => {
                    if (item.type == 'threeText' && item.noUpdateDirty) {
                        item.dirty = true;
                        delete item.noUpdateDirty;
                    }
                });
            } else {
                target.dirty = true;
            }
        }
        // 激活的resizeLine去掉active
        if (this.canTableResize) {
            this.tableResizeData.path.classList.remove('active');
            this.target.modifiedState();
        }

        this.resetAll();

        // 组合时，根据前后两次点击的坐标，判断是点击还是拖动，点击则选中组合内元素，拖动则不选中
        this.lastMouseUpPosition = {
            x: event.clientX,
            y: event.clientY,
        };
        if (this.target && this.target.group && this.lastMouseDownPosition && this.lastMouseDownPosition.x === event.clientX && this.lastMouseDownPosition.y === event.clientY) {
            this.hasGroupMoved = false;
            this.isEditingGroup = false;
            this.selectedGroup = null;
            Ktu.selectedData = this.target;
        } else {
            this.hasGroupMoved = true;
        }

        if (this.resizeTimer) {
            clearInterval(this.resizeTimer);
            this.resizeTimer = null;
        }

        /* if (this.target && this.target.type === 'map' && (this.target.scaleX !== this.oldTarget.scaleX || this.target.scaleY !== this.oldTarget.scaleY)) {
            this.changeMapZoom(this.target);
        } */
    }
    resetAll() {
        this.moveCount = 0;
        this.isMoving = false;
        this.canTranslate = false;
        this.isTranslating = false;
        this.canResize = false;
        this.isResizing = false;
        this.canRotate = false;
        this.isRotating = false;
        this.canRadius = false;
        this.canTableResize = false;
        this.currentControl = '';
        this.downEvent = null;
        this.moveEvent = null;
        this.isSelecting = false;
        this.canThreeRotate = false;
        this.isThreeRotating = false;
        this.dirtyAfterMouseUp = false;
        this.start = null;
        this.end = null;
        this.selectedBox = null;
        this.editorClientRect = null;
        this.tableResizeData = null;
        this.hideAllGuides();
        Ktu.store.commit('base/changeState', {
            prop: 'selectedBox',
            value: null,
        });
    }
    initEvent() {
        document.getElementById(this.container).addEventListener('mousedown', this.mousedown.bind(this));
        window.addEventListener('mousemove', this.mousemove.bind(this));
        window.addEventListener('mouseup', this.mouseup.bind(this));
    }
    init() {
        this.initEvent();
    }
};
