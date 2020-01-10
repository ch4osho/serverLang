// 本文件针对重构之前的数据进行处理
Ktu.compat = {
    // 旧数据的top,left值是旋转后左上角的位置，改为与旋转无关。
    position(object) {
        if (object.originX === 'center') {
            object.left -= object.width * object.scaleX / 2;
            object.top -= object.height * object.scaleY / 2;
            return;
        }
        /* if (!object.angle) {
           return;
           }
           const radian = Math.PI * object.angle / 180;
           const angle = Math.atan(object.width*object.scaleX / (object.height*object.scaleY));
           //求边长
           const hypotenuse = Math.sqrt((Math.pow(object.width * object.scaleX, 2) + Math.pow(object.height * object.scaleY, 2)));
           //得到相对于元素中心点的坐标
           const toCenter = {
           x: -hypotenuse / 2 * Math.sin(angle - radian),
           y: -hypotenuse / 2 * Math.cos(angle - radian)
           };
           //矩阵转换，由点向量乘以旋转代表的矩阵后解方程得出公式。
           const originTop = toCenter.y * Math.cos(radian) - toCenter.x * Math.sin(radian);
           const originLeft = (toCenter.x + Math.sin(radian) * originTop) / Math.cos(radian);
           object.top += originTop - toCenter.y;
           object.left += originLeft - toCenter.x; */
    },
    /* group(group) {
       let relW = group.width * group.scaleX;
       let relH = group.height * group.scaleY;
       let groupId = "group" + new Date().getTime();
       group.objects.forEach((object) => {
       object.groupId = groupId;
       //
       this.transformGroupPosition(object, group);
       // object.left = object.left * group.scaleX + relW / 2 + group.left;
       // object.top = object.top * group.scaleY + relH / 2 + group.top;
       object.scaleX = object.scaleX * group.scaleX;
       object.scaleY = object.scaleY * group.scaleY;
       object.angle = group.angle + object.angle;
       });
       }, */
    group(group) {
        group.objects.forEach((object, index) => {
            object.left += group.width / 2;
            object.top += group.height / 2;
            object.depth = index;
        });
    },
    background(bg) {
        bg.type = 'background';
        if (!!bg.image) {
            // 图片裁切，left top 是image的中心点到compound image 的左上角，这里需要转换
            if (bg.image.originX == 'center') {
                bg.image.left = bg.image.left - (bg.image.width * bg.image.scaleX / 2);
                bg.image.top = bg.image.top - (bg.image.height * bg.image.scaleY / 2);
            }
        }
    },
    image(image) {
        image.type = 'cimage';
        if (!!image.image) {
            // 图片裁切，left top 是image的中心点到compound image 的左上角，这里需要转换
            if (image.image.originX == 'center') {
                image.image.left = image.image.left - (image.image.width * image.image.scaleX / 2);
                image.image.top = image.image.top - (image.image.height * image.image.scaleY / 2);
            }
            image.image = {
                height: image.image.height,
                width: image.image.width,
                left: image.image.left,
                top: image.image.top,
                scaleX: image.image.scaleX,
                scaleY: image.image.scaleY,
                src: image.image.src,
                fileId: image.image.fileId,
            };
        }
        delete image.fill;
    },
    svg(object) {
        this.stroke(object);
    },
    text(object) {
        this.stroke(object);
        /* if(object.charSpacing){
           object.width += object.fontSize * object.charSpacing / 1000;
           } */
    },
    stroke(object) {
        if (object.stroke === null || this.stroke === 'transparent') {
            object.strokeWidth = 0;
        }
        /* if(object.strokeWidth){
           object.width += object.strokeWidth;
           object.height += object.strokeWidth;
           } */
    },
    process(data) {
        /* 上线要改这个时间
           if(Ktu.ktuData.updateTime>1540276061331){
           return
           }
           
           data.objects = data.objects.reduce((newObjects, object) => {
           if (object.type == 'group') {
           //先把top,left转换为未旋转的初始值。
           this.transformPosition(object);
           // 先把坐标和缩放同步到组合内部元素
           Ktu.template.initGroup(object);
           return newObjects.concat(object.objects);
           } else {
           return newObjects.concat([object]);
           }
           }, []); */
        if (!data.objects.length) {
            return;
        }

        if (data.objects[0].type === 'background' || data.objects[0].type === 'group' && data.objects[0].originGroup === undefined) {
            return;
        }
        data.objects.forEach((object, index) => {
            object.key = index;
            /* 组合旋转基点仍然保留top left，所以不需要转换
               object.type !== 'group' && this.position(object); */
            this.position(object);
            switch (object.type) {
                case 'group':
                    this.group(object);
                    this.process(object);
                    break;
                case 'back-ground-shape-image':
                    this.background(object);
                    break;
                case 'compound-image':
                    this.image(object);
                    break;
                case 'path-group':
                case 'path':
                    this.svg(object);
                    break;
                case 'textbox':
                    this.text(object);
                    break;
                case 'rect':
                    break;
                case 'ellipse':
                    break;
                case 'qr-code':
                    break;
                default:
                    break;
            }
        });
    },
};
