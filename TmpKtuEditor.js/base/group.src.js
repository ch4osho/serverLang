class Group extends TheElement {
    constructor(data) {
        super(data);
        this.type = 'group';
        this.controls = {
            tl: true,
            tr: true,
            br: true,
            bl: true,
            rotate: true,
        };
        this.objects = data.objects;
        this.objects.forEach((object, index) => {
            object.group = this;
            this.objects[index] = Ktu.element.processElement(object);
        });
        // this.isPass = false;
        this.angle = this.angle || 0;
        this.isLocked = data.isLocked || false;
        let dirty = false;
        Object.defineProperty(this, 'dirty', {
            get() {
                return dirty;
            },
            set: value => {
                if (value) {
                    this.objects.forEach(object => {
                        object.dirty = true;
                    });
                }
                dirty = false;
            },
        });
        this.setCoords();
        this.transformFlip();
        this.loadedPromise = Promise.all(this.objects.reduce((currentArr, object) => {
            if (object.loadedPromise) {
                currentArr.push(object.loadedPromise);
            }
            return currentArr;
        }, []));
    }
    // 把旧数据的组合翻转转换为单元素翻转
    transformFlip() {
        if (!this.flipX && !this.flipY) {
            return;
        }
        const multi = new Multi(this.splitGroup());
        const group = multi.toGroup();
        this.left = group.left;
        this.top = group.top;
        this.flipX = group.flipX;
        this.flipY = group.flipY;
        this.scaleX = group.scaleX;
        this.scaleY = group.scaleY;
        this.angle = group.angle;
        this.objects.forEach((object, index) => {
            object.left = group.objects[index].left;
            object.top = group.objects[index].top;
            object.flipX = group.objects[index].flipX;
            object.flipY = group.objects[index].flipY;
            object.scaleX = group.objects[index].scaleX;
            object.scaleY = group.objects[index].scaleY;
            object.angle = group.objects[index].angle;
        });
        this.setCoords();
    }
    setCoords() {
        this.coords = this.calculateCoords();
        this.objects && this.objects.forEach(e => {
            e.setCoords();
        });
    }
    initCanvas() {
        // let count = this.objects.length;
        // return new Promise(resolve => {
        //     this.objects.forEach((item, i) => {
        //         if (item.type === 'cimage') {
        //             /* let path = item.image.src;
        //                path = Ktu.utils.getSmartTmpImage(path, item.image.width, item.image.height);
        //                Ktu.utils.imagepathToBase64(path).then(base => {
        //                item.pathBase = base; */
        //             count--;
        //             if (count == 0) {
        //                 this.drawCanvas().then(() => {
        //                     resolve(this);
        //                 });
        //             }
        //             // });
        //         } else if (item.type === 'imageContainer') {
        //             item.initCanvas().then(() => {
        //                 count--;
        //                 if (count == 0) {
        //                     this.drawCanvas().then(() => {
        //                         resolve(this);
        //                     });
        //                 }
        //             });
        //         } else {
        //             count--;
        //         }
        //     });
        //     if (count == 0) {
        //         this.drawCanvas().then(() => {
        //             resolve(this);
        //         });
        //     }
        // });
        return new Promise(resolve => {
            this.loadedPromise.then(() => {
                this.drawCanvas().then(() => {
                    resolve(this);
                });
            });
        });
    }
    setVisible() {
        this.saveState();
        this.visible = !this.visible;
        this.objects.forEach(e => {
            e.visible = this.visible;
            e.dirty = true;
        });
        this.modifiedState();
    }
    setOpacity(value) {
        this.opacity = value;
        this.objects.forEach(e => {
            e.setOpacity(value);
        });
    }
    lock() {
        this.saveState();
        this.isLocked = !this.isLocked;
        this.objects.forEach(e => {
            e.isLocked = this.isLocked;
        });
        this.modifiedState();
    }
    getPosition(objects = this.objects) {
        const boundingRects = objects.map(object => object.getBoundingRect());
        const minLeft = boundingRects.reduce((currentValue, boundingRect) => (boundingRect.left < currentValue ? boundingRect.left : currentValue), boundingRects[0].left);
        const minTop = boundingRects.reduce((currentValue, boundingRect) => (boundingRect.top < currentValue ? boundingRect.top : currentValue), boundingRects[0].top);
        const maxRight = boundingRects.reduce((currentValue, boundingRect) => (boundingRect.right > currentValue ? boundingRect.right : currentValue), 0);
        const maxBottom = boundingRects.reduce((currentValue, boundingRect) => (boundingRect.bottom > currentValue ? boundingRect.bottom : currentValue), 0);
        return {
            left: minLeft,
            top: minTop,
            width: maxRight - minLeft,
            height: maxBottom - minTop,
        };
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
    updateSizePosition() {
        this.objects.forEach((object, index) => {
            const position = this.objects[index].getPositionToEditor();
            object.left = position.left;
            object.top = position.top;
            object.scaleX *= this.scaleX;
            object.scaleY *= this.scaleY;
            object.angle += this.angle;
            if ((object instanceof Text || object instanceof OriginImage) && object.stroke && object.strokeWidth) {
                object.strokeWidth *= this.scaleX;
                // 历史原因，需要一个字段矫正字体描边后的位置
                if (object instanceof Text) {
                    object.originScaleX *= this.scaleX;
                }
            }
            object.setCoords();
        });
        const position = this.getPosition();
        this.left = position.left;
        this.top = position.top;
        this.width = position.width;
        this.height = position.height;
        this.angle = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.objects.forEach((object, index) => {
            const position = this.getPostionToGroup(object);
            object.left = position.left;
            object.top = position.top;
            object.setCoords();
        });
        this.dirty = true;
        this.setCoords();
    }
    distribute(type) {
        this.saveState();
        const { objects } = this;
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
        this.updateSizePosition();
        this.modifiedState();
    }
    setAlign(type) {
        this.saveState();
        /* const {
            tl,
            tr,
            bl,
            br,
        } = this.calculateCoords(); */
        let x; let y; let newCenterX; let newCenterY; let delX; let delY;
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
                       (k + 1 / k)*x  =  - (-1 / k) * e.centerX + e.centerY + k*bl.x - bl.y;
                       if (this.angle) {
                       k = (tl.y - bl.y) / (tl.x - bl.x);
                       x = (-(-1 / k) * e.coords.center.x + e.coords.center.y + k * bl.x - bl.y) / (k + 1 / k);
                       y = k * (x - bl.x) + bl.y;
                       } else { */
                    x = 0;
                    y = e.coords.center.y;
                    /* newCenterX = x + (objectBoundingRect.width / 2);
                           newCenterY = y ;
                           } */
                    newCenterX = x + Math.cos(Math.PI * this.angle / 180) * (objectBoundingRect.width / 2);
                    newCenterY = y + Math.sin(Math.PI * this.angle / 180) * (objectBoundingRect.width / 2);
                    break;
                case 'horizontal_right':
                    /* if (this.angle) {
                       k = (tr.y - br.y) / (tr.x - br.x);
                       x = (-(-1 / k) * e.coords.center.x + e.coords.center.y + k * br.x - br.y) / (k + 1 / k);
                       y = k * (x - br.x) + br.y;
                       } else { */
                    x = this.width;
                    y = e.coords.center.y;
                    // }
                    newCenterX = x - Math.cos(Math.PI * this.angle / 180) * (objectBoundingRect.width / 2);
                    newCenterY = y - Math.sin(Math.PI * this.angle / 180) * (objectBoundingRect.width / 2);
                    break;
                case 'vertical_top':
                    /* if (this.angle) {
                       k = (tl.y - tr.y) / (tl.x - tr.x);
                       x = (-(-1 / k) * e.coords.center.x + e.coords.center.y + k * tr.x - tr.y) / (k + 1 / k);
                       y = k * (x - tr.x) + tr.y;
                       } else { */
                    x = e.coords.center.x;
                    y = 0;
                    /* newCenterX = x
                           newCenterY = y + (e.height * e.scaleX / 2);
                           } */
                    newCenterX = x + Math.sin(Math.PI * this.angle / 180) * (objectBoundingRect.height / 2);
                    newCenterY = y + Math.cos(Math.PI * this.angle / 180) * (objectBoundingRect.height / 2);
                    break;
                case 'vertical_bottom':
                    /* if (this.angle) {
                       k = (bl.y - br.y) / (bl.x - br.x);
                       x = (-(-1 / k) * e.coords.center.x + e.coords.center.y + k * br.x - br.y) / (k + 1 / k);
                       y = k * (x - br.x) + br.y;
                       } else { */
                    x = e.coords.center.x;
                    y = this.height;
                    // }
                    newCenterX = x - Math.sin(Math.PI * this.angle / 180) * (objectBoundingRect.height / 2);
                    newCenterY = y - Math.cos(Math.PI * this.angle / 180) * (objectBoundingRect.height / 2);
                    break;
                case 'horizontal_center':
                    /* if (this.angle) {
                       k = (tl.y - bl.y) / (tl.x - bl.x);
                       x = (-(-1 / k) * e.coords.center.x + e.coords.center.y + k * bl.x - bl.y) / (k + 1 / k);
                       y = k * (x - bl.x) + bl.y;
                       } else { */
                    x = 0;
                    y = e.coords.center.y;
                    // }
                    newCenterX = x + Math.cos(Math.PI * this.angle / 180) * (this.width * this.scaleX / 2);
                    newCenterY = y + Math.sin(Math.PI * this.angle / 180) * (this.width * this.scaleX / 2);
                    break;
                case 'vertical_center':
                    /* if (this.angle) {
                       k = (tl.y - tr.y) / (tl.x - tr.x);
                       x = (-(-1 / k) * e.coords.center.x + e.coords.center.y + k * tr.x - tr.y) / (k + 1 / k);
                       y = k * (x - tr.x) + tr.y;
                       } else { */
                    x = e.coords.center.x;
                    y = 0;
                    // }
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
        this.updateSizePosition();
        this.modifiedState();
    }
    concatState(beforeData) {
        const newHistoryStep = Ktu.historyManager[Ktu.template.currentPageIndex].addStep(HistoryAction.GROUP_CONCAT);
        newHistoryStep.beforeChange(beforeData);
        newHistoryStep.afterChange(this.toObject());
        Ktu.save.changeSaveNum();
    }
    splitGroup() {
        const group = this.toObject();
        group.objects.forEach((object, index) => {
            const position = this.objects[index].getPositionToEditor();
            object.left = position.left;
            object.top = position.top;
            /* object.width *= group.scaleX;
               object.height *= group.scaleY; */
            object.scaleX *= group.scaleX;
            object.scaleY *= group.scaleY;

            let { angle } = object;
            if (group.flipX) {
                angle = 180 - angle;
            }
            if (group.flipY) {
                angle = 180 - angle;
            }
            angle += group.angle;
            angle > 360 && (angle -= 360);
            angle < 0 && (angle += 360);
            object.angle = angle;

            object.flipX = Boolean(object.flipX ^ group.flipY);
            object.flipY = Boolean(object.flipY ^ group.flipX);

            /* 多选锁定时会先将元素组成组合，组合拆分后则将元素的锁定状态设置为false，避免拆分后元素被锁定
               元素锁定是无法被多选选中，也不可能将组合中的个别元素锁定，所以可以直接设置为false */
            object.isLocked = false;
        });
        return group;
    }
    cancelGroup(beforeData) {
        beforeData = beforeData ? beforeData : this.toObject();
        const multi = new Multi(this.splitGroup());
        Ktu.selectedTemplateData.objects.splice(this.depth + 1, 0, ...multi.objects);
        Ktu.selectedTemplateData.objects.splice(this.depth, 1);
        Ktu.interactive.uncheckAll();
        Ktu.element.refreshElementKey();
        multi.splitState(beforeData);
        if (multi.objects.length === 1) {
            Ktu.selectedData = multi.objects[0];
        } else {
            Ktu.currentMulti = multi;
        }
    }
    toSvg(isAllInfo, useBase64) {
        if (!this.visible) {
            return '';
        }
        let svgHtml = '';
        const flipStr = this.getFlip();
        if (isAllInfo) {
            svgHtml = `<g transform="translate(${this.left} ${this.top}) rotate(${this.angle}) scale(${this.scaleX} ${this.scaleY}) ${flipStr}" opacity="${this.opacity}">
                            ${this.objects.reduce((currentStr, object) => `${currentStr + object.toSvg(isAllInfo, useBase64)}`, '')}
                        </g>`;
        } else {
            const objectsStr = this.objects.reduce((currentStr, object) => {
                const dimensions = object.getDimensions();
                return `${currentStr}
                        <g transform="translate(${object.left} ${object.top}) rotate(${object.angle}) translate(${dimensions.w / 2} ${dimensions.h / 2}) skewX(${object.skewX}) skewY(${object.skewY}) translate(${-dimensions.w / 2} ${-dimensions.h / 2})" opacity="${object.opacity}">
                            ${object.toSvg(false, true)}
                        </g>`;
            }, '');
            const dimensions = this.getDimensions();
            svgHtml = `
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${dimensions.w * this.scaleX}" height="${dimensions.h * this.scaleY}" transform="${flipStr}">
                ${objectsStr}
            </svg>`;
        }
        return svgHtml;
    }
    toObject() {
        const elementObj = TheElement.toObject(this);
        return _.assignIn(elementObj, {
            objects: this.objects.map(object => object.toObject()),
        });
    }
    setActive() {
        Ktu.interactive.uncheckAll();
        Ktu.selectedGroup = this;
    }
    fastMove(type) {
        if (this.isLocked || this.isInContainer) {
            return;
        }
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
    }
};
