class Multi {
    constructor(data) {
        this.type = 'multi';
        const objects = data.objects.map(item => {
            const object = Ktu.element.processElement(item);
            object.isSelected = true;
            if (object.objects) {
                object.objects.forEach(obj => {
                    obj.isSelected = true;
                    // obj.multi = this;
                });
            }
            // object.multi = this;
            return object;
        });
        // 按depth排序
        this.objects = objects.sort((last, next) => last.depth - next.depth);

        this.scaleX = data.scaleX || 1;
        this.scaleY = data.scaleY || 1;
        this.isPass = false;
        this.opacity = data.opacity || 1;
        this.angle = data.angle || 0;
        this.depth = 0;
        this.setOriginAngle();
        this.controls = {
            tl: true,
            tr: true,
            br: true,
            bl: true,
            rotate: true,
        };
        if (data.left && data.top && data.width && data.height) {
            this.left = data.left;
            this.top = data.top;
            this.width = data.width;
            this.height = data.height;
        } else {
            this.setSizePosition();
        }
        this.setCoords();
        this.dirty = false;
        let dirty = false;
        Object.defineProperty(this, 'dirty', {
            get() {
                return dirty;
            },
            set: value => {
                if (value) {
                    this.objects.forEach(object => {
                        if (!object.noUpdateDirty) {
                            object.dirty = true;
                        };
                    });
                }
                dirty = false;
            },
        });
    }
    toObject() {
        const objects = this.objects.map(item => (item.toObject ? item.toObject() : item));

        objects.sort((last, next) => last.depth - next.depth);
        return {
            width: this.width,
            height: this.height,
            angle: this.angle,
            left: this.left,
            top: this.top,
            opacity: this.opacity,
            scaleX: this.scaleX,
            scaleY: this.scaleY,
            type: this.type,
            objects,
        };
    }

    getPosition(objects = this.objects) {
        const boundingRects = objects.map(object => object.getBoundingRect());
        const minLeft = boundingRects.reduce((currentValue, boundingRect) => (boundingRect.left < currentValue ? boundingRect.left : currentValue), boundingRects[0].left);
        const minTop = boundingRects.reduce((currentValue, boundingRect) => (boundingRect.top < currentValue ? boundingRect.top : currentValue), boundingRects[0].top);
        const maxRight = boundingRects.reduce((currentValue, boundingRect) => (boundingRect.right > currentValue ? boundingRect.right : currentValue), boundingRects[0].right);
        const maxBottom = boundingRects.reduce((currentValue, boundingRect) => (boundingRect.bottom > currentValue ? boundingRect.bottom : currentValue), boundingRects[0].bottom);
        return {
            left: minLeft,
            top: minTop,
            width: maxRight - minLeft,
            height: maxBottom - minTop,
        };
    }
    setSizePosition() {
        const position = this.getPosition();
        this.left = position.left;
        this.top = position.top;
        this.width = position.width;
        this.height = position.height;
    }
    updateSizePosition() {
        this.angle = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.setSizePosition();
    }
    smallMove(type) {
        switch (type) {
            case 'left':
                this.left--;
                break;
            case 'up':
                this.top--;
                break;
            case 'right':
                this.left++;
                break;
            case 'down':
                this.top++;
        }

        this.objects.forEach(e => {
            e.smallMove(type);
        });
    }
    fastMove(type) {
        switch (type) {
            case 'left':
                this.left -= 10;
                break;
            case 'up':
                this.top -= 10;
                break;
            case 'right':
                this.left += 10;
                break;
            case 'down':
                this.top += 10;
        }

        this.objects.forEach(e => {
            e.fastMove(type);
        });
    }
    setCoords() {
        this.coords = this.calculateCoords();
        this.objects.forEach(e => {
            e.setCoords();
        });
    }
    calculateCoords() {
        const dimensions = this.getDimensions();
        const width = dimensions.w * this.scaleX;
        const height = dimensions.h * this.scaleY;
        const radian = this.angle * Math.PI / 180;
        const tl = {
            x: this.left,
            y: this.top,
        };
        const tr = {
            x: tl.x + width * Math.cos(radian),
            y: tl.y + width * Math.sin(radian),
        };
        const br = {
            x: tr.x - height * Math.sin(radian),
            y: tr.y + height * Math.cos(radian),
        };
        const bl = {
            x: tl.x - height * Math.sin(radian),
            y: tl.y + height * Math.cos(radian),
        };
        const center = {
            x: (tl.x + br.x) / 2,
            y: (tl.y + br.y) / 2,
        };
        return {
            tl,
            tr,
            br,
            bl,
            center,
        };
    }
    getBoundingRect() {
        const coords = this.calculateCoords();
        // const keys = Object.keys(coords);
        const keys = ['tl', 'tr', 'bl', 'br'];
        const arrX = [];
        const arrY = [];
        keys.forEach(k => {
            arrX.push(coords[k].x);
            arrY.push(coords[k].y);
        });
        const minX = Math.min.call(null, ...arrX);
        const maxX = Math.max.call(null, ...arrX);
        const minY = Math.min.call(null, ...arrY);
        const maxY = Math.max.call(null, ...arrY);
        return {
            left: minX,
            top: minY,
            width: maxX - minX,
            height: maxY - minY,
            right: maxX,
            bottom: maxY,
        };
    }
    getCenterPoint() {
        const radian = Math.PI * this.angle / 180;
        const angle = Math.atan(this.width * this.scaleX / (this.height * this.scaleY));
        // 求边长
        const hypotenuse = Math.sqrt((this.width * this.scaleX) ** 2 + (this.height * this.scaleY) ** 2);
        this.centerX = this.left + hypotenuse / 2 * Math.sin(angle - radian);
        this.centerY = this.top + hypotenuse / 2 * Math.cos(angle - radian);
        return {
            x: this.left + hypotenuse / 2 * Math.sin(angle - radian),
            y: this.top + hypotenuse / 2 * Math.cos(angle - radian),
        };
    }
    // 将中心点转化为Left top
    getOriginTopLeft() {
        const radian = Math.PI * this.angle / 180;
        const angle = Math.atan(this.width * this.scaleX / (this.height * this.scaleY));
        // 求边长
        const hypotenuse = Math.sqrt((this.width * this.scaleX) ** 2 + (this.height * this.scaleY) ** 2);
        // 得到相对于元素中心点的坐标
        /* const toCenter = {
            x: -hypotenuse / 2 * Math.sin(angle - radian),
            y: -hypotenuse / 2 * Math.cos(angle - radian),
        }; */
        // 矩阵转换，由点向量乘以旋转代表的矩阵后解方程得出公式。
        const originLeft = this.coords.center.x - hypotenuse / 2 * Math.sin(angle - radian);
        const originTop = this.coords.center.y - hypotenuse / 2 * Math.cos(angle - radian);
        this.top = originTop;
        this.left = originLeft;
    }
    setOriginAngle() {
        this.objects.forEach(object => {
            object.originAngle = object.angle - this.angle;
        });
    }
    setAngle(type) {
        const self = this;
        const rotate = {
            getAngle() {
                let angle = type === 'left' ? self.angle - 90 : self.angle + 90;
                angle > 360 && (angle -= 360);
                angle < 0 && (angle += 360);
                return angle;
            },
            setAngle: angle => {
                angle = angle === undefined ? rotate.getAngle() : angle;
                /* self.objects.forEach(e => {
                   e.angle = e.originAngle + angle;
                   const radian = Math.PI * angle / 180;
                   // 两个中心点之间的向量
                   var newx = self.coords.center.x + Math.cos(radian) * (e.originCenterX - self.coords.center.x) - Math.sin(radian) * (e.originCenterY - self.coords.center.y);
                   var newy = self.coords.center.y + Math.sin(radian) * (e.originCenterX - self.coords.center.x) + Math.cos(radian) * (e.originCenterY - self.coords.center.y);
                   // 向量乘矩阵得到新的向量，可以得出旋转之后的中心点坐标
                   console.log(newx)
                   e.coords.center.x = newx;
                   e.coords.center.y = newy;
                   e.getOriginTopLeft();
                   e.setCoords();
                   })
                   // //求边长
                   const hypotenuse = Math.sqrt((Math.pow(self.width * self.scaleX, 2) + Math.pow(self.height * self.scaleY, 2))) / 2;
                   // //得到相对于元素中心点的坐标
                   const radian = Math.PI * angle / 180;
                   let left = self.coords.center.x - hypotenuse * (Math.cos(radian) * (self.width * self.scaleX / hypotenuse / 2) - Math.sin(radian) * (self.height * self.scaleY / hypotenuse / 2));
                   let top = self.coords.center.y - hypotenuse * (Math.sin(radian) * (self.width * self.scaleX / hypotenuse / 2) + Math.cos(radian) * (self.height * self.scaleY / hypotenuse / 2));
                   self.left = left;
                   self.top = top;
                   self.angle = angle;
                   self.getMaxWidthHeight();
                   self.setCoords(); */
                const {
                    center,
                } = this.coords;
                const turn = object => {
                    const originAngle = object.originAngle || 0;
                    const offsetAngle = originAngle + angle - object.angle;
                    const objectAngle = originAngle + angle;
                    /* objectAngle > 360 && (objectAngle -= 360);
                       objectAngle < 0 && (objectAngle += 360); */
                    object.angle = objectAngle;

                    const radian = Math.PI * offsetAngle / 180;
                    const toOriginPoint = {
                        x: object.left - center.x,
                        y: object.top - center.y,
                    };
                    const end = {
                        x: Math.cos(radian) * toOriginPoint.x - Math.sin(radian) * toOriginPoint.y,
                        y: Math.sin(radian) * toOriginPoint.x + Math.cos(radian) * toOriginPoint.y,
                    };
                    object.left = end.x + center.x;
                    object.top = end.y + center.y;
                    object.setCoords();
                };
                this.objects.forEach(turn);
                turn(this);
            },
            setMatrix() {
                self.objects.forEach(e => {
                    e.setAngle(type);
                });
            },
            left() {
                this.setAngle();
            },
            right() {
                this.setAngle();
            },
            horizontal() {
                this.setMatrix();
            },
            vertical() {
                this.setMatrix();
            },
        };
        typeof type !== 'number' && this.saveState();
        typeof type === 'number' ? rotate.setAngle(type) : rotate[type]();
        typeof type !== 'number' && this.modifiedState();
    }
    getMaxWidthHeight() {
        const boundingRect = this.getBoundingRect();
        this.maxWidth = boundingRect.width;
        this.maxHeight = boundingRect.height;
    }
    setPosition(type, recordHistory = true, customeCoords = null) {
        recordHistory && this.saveState();
        this.getMaxWidthHeight();
        let delX = 0;
        let delY = 0;
        switch (type) {
            case 'left':
                delX = this.maxWidth / 2 - this.coords.center.x;
                break;
            case 'right':
                delX = (Ktu.edit.documentSize.width - this.maxWidth / 2) - this.coords.center.x;
                break;
            case 'top':
                delY = this.maxHeight / 2 - this.coords.center.y;
                break;
            case 'bottom':
                delY = (Ktu.edit.documentSize.height - this.maxHeight / 2) - this.coords.center.y;
                break;
            case 'center':
                delX = (Ktu.edit.documentSize.width) / 2 - this.coords.center.x;
                delY = (Ktu.edit.documentSize.height) / 2 - this.coords.center.y;
                break;
            case 'topBottomCenter':
                delY = (Ktu.edit.documentSize.height) / 2 - this.coords.center.y;
                break;
            case 'leftRightCenter':
                delX = (Ktu.edit.documentSize.width) / 2 - this.coords.center.x;
                break;
            case 'custome':
                // 自定义坐标
                if (!customeCoords) return;
                delX = parseInt(customeCoords.x, 10) - this.left;
                delY = parseInt(customeCoords.y, 10) - this.top;
                this.directSetTopLeft(this, delX, delY);
                break;
        }!customeCoords && this.computedOriginTopLeft(this, delX, delY);
        this.setCoords();
        this.objects.forEach(e => {
            !customeCoords ? this.computedOriginTopLeft(e, delX, delY) : this.directSetTopLeft(e, delX, delY);
            e.setCoords();
        });

        recordHistory && this.modifiedState();
    }
    computedOriginTopLeft(who, delX, delY) {
        who.coords.center.x += delX;
        who.coords.center.y += delY;
        who.getOriginTopLeft();
    }
    directSetTopLeft(who, delX, delY) {
        who.left += delX;
        who.top += delY;
    }
    lock() {
        const needLock = true;
        this.setGroup(needLock);
    }
    remove(addStep = true) {
        // 若多选中包含有gif图片，内部非设计师账号不允许删除并给出提示
        let hasGif = false;
        const objectArr = this.objects;
        for (let i = 0; i < objectArr.length; i++) {
            if (objectArr[i].type === 'group') {
                const groupArr = objectArr[i].objects;
                for (let j = 0; j < groupArr.length; j++) {
                    if (groupArr[j].type === 'cimage' && /\.gif/.test(groupArr[j].image.src)) {
                        hasGif = true;
                    }
                }
            } else if (objectArr[i].type === 'cimage' && /\.gif/.test(objectArr[i].image.src)) {
                hasGif = true;
            }
        }
        if (Ktu.isUIManage || !hasGif || !addStep) {
            addStep && this.removeState();
            Ktu.selectedTemplateData.objects = Ktu.selectedTemplateData.objects.filter(object => !this.objects.some(multiObject => multiObject === object));
            Ktu.element.refreshElementKey();
            Ktu.interactive.uncheckAll();
        } else if (addStep) {
            Ktu.notice.warning('作品必须含有一张GIF');
        }
        /* this.objects.forEach(e => {
           var selKey = e.key;
           Ktu.selectedTemplateData.objects.splice(selKey, 1);
           Ktu.element.refreshElementKey();
           }); */
    }
    changeZIndex(mode) {
        /* 下移时需要从selectedTemplateData从左到右执行
           上移需要从右面开始 */
        this.savaZindexState();

        // 需要按照key对数组进行排序，这样才能准确定位每个位置
        const objects = this.objects.sort((a, b) => a.key - b.key);

        // 多选时，移动需要遍历并且找出准确的位置插入
        let idx;
        let newIdx;
        let objsMoved = 0;
        switch (mode) {
            case 'up': {
                for (let i = objects.length - 1; i >= 0; i--) {
                    const temp = objects[i];
                    idx = temp.key;

                    if (idx < Ktu.selectedTemplateData.objects.length - 1 - objsMoved) {
                        newIdx = idx + 1;
                        temp.changeZIndex(newIdx, true);
                    }
                    objsMoved++;
                }
                break;
            }

            case 'bottom':
                for (let i = objects.length - 1; i >= 0; i--) {
                    const temp = objects[i];
                    temp.changeZIndex(mode, true);
                }
                break;

            case 'down':
                objects.forEach(obj => {
                    idx = Ktu.selectedTemplateData.objects.indexOf(obj);
                    if (idx > 1 + objsMoved) {
                        newIdx = idx - 1;
                        obj.changeZIndex(newIdx, true);
                    }
                    objsMoved++;
                });
                break;

            case 'top':
                objects.forEach(obj => {
                    obj.changeZIndex(mode, true);
                });
                break;
        }
        this.zindexState();
    }
    setOpacity(value) {
        this.opacity = value;
        this.objects.forEach(e => {
            e.setOpacity(value);
        });
    }
    resetMutil() {
        this.angle = 0;
        // 获取left top width height
        this.updateSizePosition();
        this.setCoords();
    }
    distribute(type) {
        this.saveState();
        const {
            objects,
        } = this;
        const distribute = function (prop) {
            // 按centerX或者centerY的值进行排序，并记录index。
            const sizeProp = prop === 'centerX' ? 'width' : 'height';
            const sortList = objects.map((object, index) => {
                const boundingRect = object.getBoundingRect();
                const obj = {
                    index,
                    width: boundingRect.width,
                    height: boundingRect.height,
                };
                obj[prop] = prop === 'centerX' ? object.coords.center.x : object.coords.center.y;
                return obj;
            }).sort((prevObject, nextObject) => prevObject[prop] - nextObject[prop]);
            // 除了第一个和最后一个元素外所有元素的间距和元素大小的总距离
            const totalMargin = sortList[sortList.length - 1][prop] - sortList[0][prop] - sortList[sortList.length - 1][sizeProp] / 2 - sortList[0][sizeProp] / 2;
            // 计算每个元素间距。
            const marginEachObject = (totalMargin - sortList.slice(1, sortList.length - 1).reduce((totalSize, object, index) => totalSize + object[sizeProp], 0)) / (sortList.length - 1);
            // var marginEachObject = totalMargin / sortList.length - 2;
            sortList.reduce((prevProp, object, index, _this) => {
                if (index === 0 || index === sortList.length - 1) {
                    return prevProp;
                }
                // 根据间距和元素大小重新计算left或者top值
                const newProp = prevProp + _this[index - 1][sizeProp] / 2 + marginEachObject + object[sizeProp] / 2;
                // 初始值偏移
                if (prop === 'centerX') {
                    objects[object.index].coords.center.x = newProp;
                } else {
                    objects[object.index].coords.center.y = newProp;
                }
                objects[object.index].getOriginTopLeft();
                objects[object.index].setCoords();
                return newProp;
            }, sortList[0][prop]);
        };
        switch (type) {
            case 'horizontal':
                distribute('centerX');
                break;
            case 'vertical':
                distribute('centerY');
                break;
            case 'average':
                distribute('centerX');
                distribute('centerY');
                break;
        }
        this.resetMutil();
        this.modifiedState();
    }
    setAlign(type) {
        this.saveState();
        const {
            tl,
            tr,
            bl,
            br,
        } = this.calculateCoords();
        let x;
        let y;
        let k;
        let newCenterX;
        let newCenterY;
        let delX;
        let delY;

        // y  = k*(x-bl.x) + bl.y

        this.objects.forEach(e => {
            const objectBoundingRect = e.getBoundingRect();
            switch (type) {
                case 'horizontal_left':

                    /* y = (-1 / k) * (x - e.centerX) + e.centerY
                       k*(x-bl.x) + bl.y = (-1 / k) * (x - e.centerX) + e.centerY;
                       kx - k*bl.x + bl.y = (-1 / k)*x - (-1 / k) * e.centerX +e.centerY;
                       kx   = (-1 / k)*x - (-1 / k) * e.centerX + e.centerY + k*bl.x - bl.y;
                       kx - (-1 / k)*x  =  - (-1 / k) * e.centerX + e.centerY + k*bl.x - bl.y;
                       (k + 1 / k)*x  =  - (-1 / k) * e.centerX + e.centerY + k*bl.x - bl.y; */
                    if (this.angle) {
                        k = (tl.y - bl.y) / (tl.x - bl.x);
                        x = (-(-1 / k) * e.coords.center.x + e.coords.center.y + k * bl.x - bl.y) / (k + 1 / k);
                        y = k * (x - bl.x) + bl.y;
                    } else {
                        x = this.left;
                        y = e.coords.center.y;
                        /* newCenterX = x + (objectBoundingRect.width / 2);
                           newCenterY = y ; */
                    }
                    newCenterX = x + Math.cos(Math.PI * this.angle / 180) * (objectBoundingRect.width / 2);
                    newCenterY = y + Math.sin(Math.PI * this.angle / 180) * (objectBoundingRect.width / 2);
                    break;
                case 'horizontal_right':
                    if (this.angle) {
                        k = (tr.y - br.y) / (tr.x - br.x);
                        x = (-(-1 / k) * e.coords.center.x + e.coords.center.y + k * br.x - br.y) / (k + 1 / k);
                        y = k * (x - br.x) + br.y;
                    } else {
                        x = this.left + this.width;
                        y = e.coords.center.y;
                    }
                    newCenterX = x - Math.cos(Math.PI * this.angle / 180) * (objectBoundingRect.width / 2);
                    newCenterY = y - Math.sin(Math.PI * this.angle / 180) * (objectBoundingRect.width / 2);
                    break;
                case 'vertical_top':
                    if (this.angle) {
                        k = (tl.y - tr.y) / (tl.x - tr.x);
                        x = (-(-1 / k) * e.coords.center.x + e.coords.center.y + k * tr.x - tr.y) / (k + 1 / k);
                        y = k * (x - tr.x) + tr.y;
                    } else {
                        x = e.coords.center.x;
                        y = this.top;
                        /* newCenterX = x
                           newCenterY = y + (e.height * e.scaleX / 2); */
                    }
                    newCenterX = x + Math.sin(Math.PI * this.angle / 180) * (objectBoundingRect.height / 2);
                    newCenterY = y + Math.cos(Math.PI * this.angle / 180) * (objectBoundingRect.height / 2);
                    break;
                case 'vertical_bottom':
                    if (this.angle) {
                        k = (bl.y - br.y) / (bl.x - br.x);
                        x = (-(-1 / k) * e.coords.center.x + e.coords.center.y + k * br.x - br.y) / (k + 1 / k);
                        y = k * (x - br.x) + br.y;
                    } else {
                        x = e.coords.center.x;
                        y = this.top + this.height;
                    }
                    newCenterX = x - Math.sin(Math.PI * this.angle / 180) * (objectBoundingRect.height / 2);
                    newCenterY = y - Math.cos(Math.PI * this.angle / 180) * (objectBoundingRect.height / 2);
                    break;
                case 'horizontal_center':
                    if (this.angle) {
                        k = (tl.y - bl.y) / (tl.x - bl.x);
                        x = (-(-1 / k) * e.coords.center.x + e.coords.center.y + k * bl.x - bl.y) / (k + 1 / k);
                        y = k * (x - bl.x) + bl.y;
                    } else {
                        x = this.left;
                        y = e.coords.center.y;
                    }
                    newCenterX = x + Math.cos(Math.PI * this.angle / 180) * (this.width * this.scaleX / 2);
                    newCenterY = y + Math.sin(Math.PI * this.angle / 180) * (this.width * this.scaleX / 2);
                    break;
                case 'vertical_center':
                    if (this.angle) {
                        k = (tl.y - tr.y) / (tl.x - tr.x);
                        x = (-(-1 / k) * e.coords.center.x + e.coords.center.y + k * tr.x - tr.y) / (k + 1 / k);
                        y = k * (x - tr.x) + tr.y;
                    } else {
                        x = e.coords.center.x;
                        y = this.top;
                    }
                    newCenterX = x + Math.sin(Math.PI * this.angle / 180) * (this.height * this.scaleY / 2);
                    newCenterY = y + Math.cos(Math.PI * this.angle / 180) * (this.height * this.scaleY / 2);
                    break;
            }
            delX = newCenterX - e.coords.center.x;
            delY = newCenterY - e.coords.center.y;
            e.coords.center.x += delX;
            e.coords.center.y += delY;
            e.getOriginTopLeft();
            e.setCoords();
        });
        this.resetMutil();
        this.modifiedState();
    }
    saveState(type) {
        if (type == HistoryAction.GROUP_ZINDEX) {
            const objects = Ktu.selectedTemplateData.objects || [];
            this.originalState = objects.map(item => item.objectId);
        } else {
            this.originalState = this.toObject();
        }
    }
    savaZindexState() {
        this.saveState(HistoryAction.GROUP_ZINDEX);
    }
    modifiedState() {
        const newHistoryStep = Ktu.historyManager[Ktu.template.currentPageIndex].addStep(HistoryAction.GROUP_CHANGED);
        newHistoryStep.beforeChange(this.originalState);
        newHistoryStep.afterChange(this.toObject());
        Ktu.save.changeSaveNum();
    }
    addedState() {
        const newHistoryStep = Ktu.historyManager[Ktu.template.currentPageIndex].addStep(HistoryAction.GROUP_ADD);
        newHistoryStep.beforeChange(this.toObject());
        newHistoryStep.afterChange(this.toObject());
        Ktu.save.changeSaveNum();
    }
    removeState() {
        const newHistoryStep = Ktu.historyManager[Ktu.template.currentPageIndex].addStep(HistoryAction.GROUP_REMOVE);
        newHistoryStep.beforeChange(this.toObject());
        newHistoryStep.afterChange(this.toObject());
        Ktu.save.changeSaveNum();
    }
    zindexState() {
        const objects = Ktu.selectedTemplateData.objects || [];
        const currentState = objects.map(item => item.objectId);
        const newHistoryStep = Ktu.historyManager[Ktu.template.currentPageIndex].addStep(HistoryAction.OBJECT_ZINDEX);
        newHistoryStep.beforeChange(this.originalState);
        newHistoryStep.afterChange(currentState);
        Ktu.save.changeSaveNum();
    }
    splitState(beforeData) {
        const newHistoryStep = Ktu.historyManager[Ktu.template.currentPageIndex].addStep(HistoryAction.GROUP_SPLIT);
        newHistoryStep.beforeChange(beforeData);
        newHistoryStep.afterChange(this.toObject());
        Ktu.save.changeSaveNum();
    }
    getPostionToGroup(object) {
        const hypotenuse = Math.sqrt((object.left - this.left) ** 2 + (object.top - this.top) ** 2);
        const totalRadian = Math.atan((object.top - this.top) / (object.left - this.left)) || 0;
        const radian = totalRadian - this.angle * Math.PI / 180;
        return {
            left: Math.abs(hypotenuse * Math.cos(radian)),
            top: Math.abs(hypotenuse * Math.sin(radian)),
        };
    }
    toGroup() {
        // 组合先解除组合，组成新多选
        let newObjects = [];
        for (let index = 0; index < this.objects.length; index++) {
            const object = this.objects[index];
            if (object.type === 'group') {
                const {
                    objects,
                } = object.splitGroup();
                const groupObjects = [];
                objects.forEach(object => {
                    const obj = Ktu.element.processElement(object);
                    groupObjects.push(obj.toObject());
                });
                // newObjects = groupObjects.concat(newObjects);
                newObjects = newObjects.concat(groupObjects);
            } else {
                newObjects.push(object.toObject());
            }
        }

        /* newObjects.sort((last, next) => {
           return last.depth - next.depth;
           }) */

        const multi = this.toObject();
        multi.objects = newObjects;

        multi.opacity = 1;
        multi.objects.forEach((object, index) => {
            object.angle -= multi.angle;
            if (!multi.depth || object.depth > multi.depth) {
                multi.depth = object.depth;
            }
            const position = this.getPostionToGroup(object);
            object.left = position.left;
            object.top = position.top;
            object.left /= multi.scaleX;
            object.top /= multi.scaleY;
            this.key = index;
            object.depth = this.key;
            object.scaleX /= multi.scaleX;
            object.scaleY /= multi.scaleY;
        });
        return new Group(multi);
    }
    setGroup(needLock) {
        const beforeData = this.toObject();
        const group = this.toGroup();
        Ktu.selectedTemplateData.objects.splice(group.depth, 0, group);
        this.remove(false);

        if (needLock) {
            group.isLocked = true;
            group.objects.forEach(e => {
                e.isLocked = group.isLocked;
            });
        }
        Ktu.selectedGroup = group;
        group.concatState(beforeData);
    }
    getDimensions() {
        return {
            w: this.width,
            h: this.height,
        };
    }
};

Ktu.multi = {};

Ktu.multi.loadGroupHistoryData = function (action, historyData, currentData, selectedObject) {
    const {
        objects,
    } = Ktu.selectedTemplateData;
    // let multiElements = [];
    historyData = _.cloneDeep(historyData);
    if (action == HistoryAction.GROUP_CHANGED) {
        const multi = historyData;
        multi.objects.forEach((info, index) => {
            const {
                depth,
            } = info;
            const newElement = Ktu.element.processElement(info);
            /* let element = objects[depth];
               $.extend(true, element, newElement); */
            Vue.set(objects, depth, newElement);
            newElement.dirty = true;
            multi.objects[index] = newElement;
        });
        Ktu.selectedData = null;
        Ktu.currentMulti = new Multi(multi);
    } else if (action == HistoryAction.GROUP_ADD) {
        historyData.objects.forEach((info, index) => {
            const {
                depth,
            } = info;
            const element = Ktu.element.processElement(info);
            element.dirty = true;
            objects.splice(depth, 0, element);
            Ktu.element.refreshElementKey();
            historyData.objects[index] = element;
        });

        Ktu.currentMulti = new Multi(historyData);
    } else if (action == HistoryAction.GROUP_REMOVE) {
        historyData.objects.sort((bef, aft) => aft.depth - bef.depth);

        historyData.objects.forEach(info => {
            const {
                depth,
            } = info;
            objects.splice(depth, 1);
        });

        Ktu.element.refreshElementKey();
        Ktu.interactive.uncheckAll();
    } else if (action == HistoryAction.GROUP_ZINDEX) {
        const tmpObjects = new Array(objects.length);
        for (let i = historyData.length - 1; i >= 0; i--) {
            const objId = objects[i].objectId;
            const idx = historyData.indexOf(objId);
            tmpObjects[idx] = objects[i];
        }
        Ktu.templateData[Ktu.template.currentPageIndex].objects = tmpObjects;
        Ktu.element.refreshElementKey();
    } else if (action === HistoryAction.GROUP_SPLIT) {
        const index = objects.findIndex(object => object.objectId === currentData.objectId);
        objects.splice(index, 1);
        historyData.objects.sort((last, next) => last.depth - next.depth);
        historyData.objects.forEach((obj, index, objs) => {
            const newObj = Ktu.element.processElement(obj);
            objs[index] = newObj;
            objects.splice(obj.depth, 0, newObj);
        });
        Ktu.element.refreshElementKey();
        Ktu.interactive.uncheckAll();
        if (historyData.objects.length === 1) {
            Ktu.selectedData = historyData.objects[0];
        } else {
            Ktu.currentMulti = new Multi(historyData);
        }
    } else if (action === HistoryAction.GROUP_CONCAT) {
        Ktu.selectedTemplateData.objects = objects.filter(object => !currentData.objects.some(obj => obj.objectId === object.objectId));
        const newGroup = Ktu.element.processElement(historyData);
        Ktu.selectedTemplateData.objects.splice(historyData.depth, 0, newGroup);
        Ktu.element.refreshElementKey();
        Ktu.interactive.uncheckAll();
        Ktu.selectedGroup = newGroup;
    }

    Ktu.save.changeSaveNum();
};