Ktu.disposeThreeText = function (tmpKey) {
    // 初始化的时候，及时清理掉无用的数据，避免内存爆炸
    if (!Ktu.tmpThreeTextContent) {
        return;
    }
    // 这个是用来缓存清理的3Ｄ文字数据中的renderer，因为这个东西很耗性能且有上限，单纯dispose不会清理，所以把它存下来继续用。
    if (!Ktu.threeTextConfig.tmpRenderer) {
        Ktu.threeTextConfig.tmpRenderer = [];
    }
    // 先找到当前页面所有3D文字的引用
    const tmpKeyList = [];
    Ktu.selectedTemplateData.objects.forEach((item, index) => {
        if (item.type == 'threeText') {
            tmpKeyList.push(item.tmpKey);
        }
    });
    // 遍历临时的数组，判断是否有无用数据
    Object.keys(Ktu.tmpThreeTextContent).forEach((tmpKey, index) => {
        const config = Ktu.tmpThreeTextContent[`${tmpKey}`];
        if (!config) {
            return;
        }
        if (tmpKeyList.indexOf(tmpKey) < 0 && config.pageIndex === Ktu.template.currentPageIndex) {
            const { group, renderer, scene } = config;
            scene.dispose && scene.dispose();
            // 保留旧的renderer，别浪费，很耗性能的。
            Ktu.threeTextConfig.tmpRenderer.push(renderer);
            if (group && group.children && group.children[0]) {
                // 不要的就dispose
                group.children[0].geometry.dispose();
                group.children[0].material.forEach((item, index) => {
                    if (item.map) {
                        item.map.dispose && item.map.dispose();
                    }
                    if (item.normalMap) {
                        item.normalMap.dispose && item.normalMap.dispose();
                    }
                });
            }
            delete Ktu.tmpThreeTextContent[`${tmpKey}`];
        }
    });
};
/*  ！！！ 因为需要打包以及压缩，所以源代码以及webpack的配置已经挪到了 ~dev1/web/flyer/tmp/KtuDemo/three/ 目录下，都是在本地打包后再上传的。
    包括编辑态引用的threeTextEle.min.js也是再那里打包，主要也是需要按需打包来减少js的资源文件，所以用了webpack。

    使用那个demo打包的时候，需要吧module/three的文件放到npm_modules里面，因为有改three.js的源码
    
    另外我也丢到了github上： https://github.com/demoyf/three
*/
class ThreeText extends TheElement {
    constructor(data, isNewAdd) {
        super(data);
        this.type = 'threeText';
        this.text = data.text || '双击编辑文字';
        if (data.msg) {
            const msg = typeof data.msg == 'string' ? JSON.parse(data.msg) : data.msg;
            data = _.assignIn(data, msg);
        }
        this.name = data.name || '';
        this.materialName = data.materialName || '';
        this.isNewAdd = isNewAdd;
        this.isLoading = false;
        this.isEditing = false;

        this.controls = {
            tl: true,
            tr: true,
            br: true,
            bl: true,
            rotate: true,
            threeRotate: true,
        };

        // 有src就优先展示图片
        this.fileId = data.fileId || '';
        this.src = data.src || '';
        this.ftFamilyList = data.ftFamilyList && data.ftFamilyList[0] ? data.ftFamilyList : [{
            fonttype: 0,
            fontid: 58,
        }];
        const fontType = this.ftFamilyList[0].fonttype;
        const fontId = this.ftFamilyList[0].fontid;
        this.ftFamilyList[0].con = this.text;
        const fontFamily = `ktu_Font_TYPE_${fontType}_ID_${fontId}RAN_${parseInt(Date.now(), 10)}`;
        this.fontFamily = fontFamily;
        this._fontSizeMult = Ktu.element._fontSizeMult;
        this._fontSizeFraction = Ktu.element._fontSizeFraction;
        this.fontSize = data.fontSize || 72;
        this.letterSpacing = data.letterSpacing || 1;
        this.lineHeight = data.lineHeight || 1;

        this.webGLWidth = 0;
        this.webGLHeight = 0;

        this.bevelThickness = data.bevelThickness || 0;
        this.bevelSize = data.bevelSize || 0;
        this.fontDepth = data.fontDepth || 0;
        this.tmpKey = data.tmpKey || `${~~new Date()}${Math.ceil(Math.random() * 10)}`;

        this.ftFamilListChg = data.ftFamilListChg;

        if (!this.ftFamilyList[0].tmp_fontface_path) {
            this.ftFamilListChg = 1;
        }

        // 临时对象，用于存放当前页面的3D文本的webGL依赖数据，并且在必要时清空无用的数据。
        if (!Ktu.tmpThreeTextContent) {
            Ktu.tmpThreeTextContent = {};
        }

        // 初始化3D旋转数据
        this.rotation = data.rotation ? data.rotation : { x: -20 * (Math.PI / 180), y: -25 * (Math.PI / 180) };
        this.tmpRotation = {
            x: 0,
            y: 0,
        };

        this.canCollect = false;

        this.frontMaterial = data.frontMaterial || {
            use: 'color',
            color: '#3164ff',
            gradident: {
                rad: 0,
                stopColorList: [{
                    color: '',
                    precent: 0,
                },
                {
                    color: '',
                    precent: 100,
                }],
            },
            texture: {
                path: '',
                repeat: 1,
            },
        };

        this.sideMaterial = data.sideMaterial || {
            use: 'color',
            color: '#ff7733',
            gradident: {
                rad: 0,
                stopColorList: [{
                    color: '',
                    precent: 0,
                },
                {
                    color: '',
                    precent: 100,
                }],
            },
            texture: {
                path: '',
                repeat: 1,
            },
        };

        this.limitScale = 1.4;

        this.environmentMap = data.environmentMap || {
            path: 'image/threeText/envMap/1.jpg',
        };

        this.openAmbientLight = data.openAmbientLight !== undefined ? data.openAmbientLight : true;
        this.pointLights = data.pointLights || [];
        this.directionLights = data.directionLights || [];
        this.spotLights = data.spotLights || [];

        this.filtText();

        this.initWorker();
        this.loadFontFamily(fontId);

        // 做一下防抖
        this.debounceInitThree = this.debounceFunc(this.initThree);

        this.isFromtInit = true;

        this.editable = true;
    }
    debounceFunc(callback, delay = 250) {
        let timer = undefined;
        let args = [];
        return function (...rest) {
            args = rest;
            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(() => {
                callback.apply(this, args);
            }, delay);
        };
    }
    async loadFontFamily(id) {
        // 加载当前字体的fontface，双击编辑的时候用，从Text那里复制来的
        if (!Ktu.indexedDB.isOpened) {
            await Ktu.indexedDB.openPromise;
        }
        const fontUrl = this.getFontUrl(this.ftFamilyList[0]);
        const { fontFamily } = this;
        if (!Ktu.indexedDB.hasFont(id)) {
            Ktu.indexedDB.get('fonts', id).then(res => {
                if (res) {
                    Ktu.indexedDB.blobToArrayBuffer(res.file, id)
                        .then(file => {
                            // 加载字体片段
                            const fontFace = new FontFace(res.fontName, file);
                            fontFace.load().then(loadedFace => {
                                document.fonts.add(loadedFace);
                                // 更新字体加载状态
                                Ktu.indexedDB.addFont(res);
                            });
                        })
                        .catch(err => {
                            loadFontPart.call(this);
                        });
                } else {
                    // 加载完整字体
                    Ktu.indexedDB.downloadFont(id);
                    loadFontPart.call(this);
                }
                function loadFontPart() {
                    axios.post(fontUrl, {
                        substring: encodeURIComponent(JSON.stringify(this.text)),
                    }, {
                        responseType: 'arraybuffer',
                    }).then(response => {
                        if (response) {
                            const fontFace = new FontFace(fontFamily, response.data);
                            fontFace.load().then(loadedFace => {
                                document.fonts.add(loadedFace);
                            });
                        }
                    });
                }
            });
        }
    }
    initWorker() {
        // 加载webWorker
        if (!Ktu.threeTextWorker) {
            Ktu.threeTextWorker = new Worker(Ktu.webWorkerPath.threeText);
            Ktu.threeTextWorker.onmessage = event => {
                // 需要重新给prototype，因为传递过来的时候，prototype都不会保留，还好Three.js都是原型继承。
                Object.keys(event.data.attributes).forEach((item, index) => {
                    if (item == 'normal') {
                        Object.setPrototypeOf(event.data.attributes[item], THREE.BufferAttribute.prototype);
                    } else {
                        Object.setPrototypeOf(event.data.attributes[item], THREE.Float32BufferAttribute.prototype);
                    }
                });
                Object.setPrototypeOf(event.data, THREE.BufferGeometry.prototype);
                Object.setPrototypeOf(event.data.boundingBox, THREE.Box3.prototype);
                if (event.data.objectId) {
                    Ktu.selectedTemplateData.objects.forEach((item, index) => {
                        if (item.type == 'threeText' && item.objectId == event.data.objectId) {
                            const type = event.data.callback || 'startRender';
                            item[type](event.data);
                        }
                    });
                }
            };
        }
    }
    uploadImagePromise() {
        // 保存的时候，要base64上传到后端。
        const self = this;
        return new Promise((reslove, reject) => {
            try {
                if (!this.src || !/data:image\/png/.test(this.src)) {
                    reslove();
                    return;
                }
                const url = `//${Ktu.manageDomain}/ajax/advanceUpload_h.jsp?cmd=_uploadPaste`;
                const data = this.src.split(',')[1];
                const imgType = 4;
                axios.post(url, {
                    data,
                    maxWidth: 16384,
                    maxHeight: 16384,
                    imgType,
                    imgMode: 2,
                    fileName: (+new Date()),
                    sysfile: true,
                }).then(res => {
                    const { data: { id, success, path } } = res;
                    if (success && id) {
                        self.fileId = id;
                        self.src = path;
                    }
                    reslove();
                })
                    .catch(err => {
                        reslove();
                    });
            // eslint-disable-next-line no-unused-vars
            } catch (err) {
                reslove();
            };
        });
    }
    loadFontBase64() {
        return new Promise((reslove, reject) => {
            reslove();
        });
    }
    getBase64() {
        // 这个是给刷新页面之后，元素还是一张图片，然后导出PNG是需要base64，所以我们把图片直接转成base64即可。
        return new Promise((reslove, reject) => {
            if (this.base64Src) {
                reslove();
            } else {
                const image = new Image();
                const { width, height } = this;
                image.setAttribute('crossOrigin', 'anonymous');
                image.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    image.width = width;
                    image.height = height;
                    const context = canvas.getContext('2d');
                    context.drawImage(image, 0, 0, width, height);
                    this.base64Src = canvas.toDataURL();
                    reslove();
                };
                image.onerror = reslove;
                image.src = this.src;
            }
        });
    }
    beforeDrawCanvas() {
        // 在绘制缩略图等需要用到initCanvas的地方，先做一下处理，canvas还没绘制完的，用图片顶着。
        const config = Ktu.tmpThreeTextContent[`${this.tmpKey}`];
        let { width, height } = this;
        return new Promise((reslove, reject) => {
            // 这个是因为要处理画布缩放的，PM说元素模糊了不得行，所以就要缩放canvas，同时生成的时候也就需要缩放了。
            const { scale } = Ktu.edit;
            if (scale > this.limitScale) {
                width *= scale;
                height *= scale;
            }
            if (!this.hasCanvasPainted || !config || !config.domElement || config.pageIndex !== Ktu.template.currentPageIndex) {
                // 还没有渲染完成的，有图片直接用图片展示。
                const image = new Image();
                image.setAttribute('crossOrigin', 'anonymous');
                image.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    image.width = width;
                    image.height = height;
                    const context = canvas.getContext('2d');
                    context.drawImage(image, 0, 0, width, height);
                    this.base64Src = canvas.toDataURL();
                    reslove(this);
                };
                image.onerror = reslove;
                image.src = this.src;
            } else {
                this.createImage().then(() => {
                    reslove(this);
                });
            }
        });
    }
    async initCanvas() {
        await this.beforeDrawCanvas();
        return this.drawCanvas();
    }
    createImage() {
        // webGL所在的canvas转图片
        const config = Ktu.tmpThreeTextContent[`${this.tmpKey}`];
        let { width, height, canvasLeft, canvasTop } = this;
        return new Promise((reslove, reject) => {
            const { scale } = Ktu.edit;
            // 画布缩放，canvas也会随着调整，所以生成的时候，宽高等也需要调整。
            if (scale > this.limitScale) {
                width *= scale;
                height *= scale;
                canvasLeft *= scale;
                canvasTop *= scale;
            }
            if ((!config || (!config.domElement) || !this.hasCanvasPainted)) {
                reslove();
                return;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext('2d');
            context.drawImage(config.domElement, canvasLeft, canvasTop, config.domElement.width, config.domElement.height);
            this.base64Src = canvas.toDataURL();
            if (this.needGenerateImage) {
                this.src = this.base64Src;
            }
            this.needGenerateImage = false;
            reslove();
        });
    }
    getFontName() {
        const fontId = this.ftFamilyList && this.ftFamilyList[0] ? this.ftFamilyList[0].fontid : 58;
        const font = Ktu.initialData.flyerFontList.find(font => font.id === fontId);
        return font ? font.nodeName : 'Source Han Sans CN Regular';
    }
    getLineHeight(isLastLine) {
        return this.fontSize * this._fontSizeMult * (isLastLine ? 1 : this.lineHeight);
    }
    toSvg(isAllInfo, useBase64) {
        let svgHtml = ``;
        const flipStr = this.getFlip();
        const gStyle = isAllInfo ? `transform="translate(${this.left} ${this.top}) scale(${this.scaleX} ${this.scaleY}) rotate(${this.angle}) ${flipStr}" opacity="${this.opacity} ${flipStr}"` : `transform="${flipStr}"`;
        if (this.src || this.base64Src) {
            const dimensions = this.getDimensions();
            const tmpSrc = useBase64 && this.base64Src ? this.base64Src : this.src;
            const g = `<g ${gStyle}>
                    <g>
                        <image imageid="${this.fileId || ''}" type="three-text" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="${tmpSrc}" width="${dimensions.w}" height="${dimensions.h}"></image>
                    </g>
                </g>`;
            if (!isAllInfo) {
                svgHtml = `
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                        version="1.1" width="${dimensions.w}" height="${dimensions.h}"
                        viewBox="0 0 ${dimensions.w} ${dimensions.h}" xml:space="preserve" style="overflow: visible;">
                        ${g}
                    </svg>
                `;
            } else {
                svgHtml = g;
            }
        }
        return svgHtml;
    }
    toObject() {
        const elementObj = TheElement.toObject(this);
        const msg = {
            rotation: this.rotation,
            sideMaterial: this.sideMaterial,
            frontMaterial: this.frontMaterial,
            fontDepth: this.fontDepth,
            bevelSize: this.bevelSize,
            bevelThickness: this.bevelThickness,
            name: this.name,
            materialName: this.materialName,
            openAmbientLight: this.openAmbientLight,
            pointLights: this.pointLights,
            directionLights: this.directionLights,
            spotLights: this.spotLights,
            environmentMap: this.environmentMap,
            letterSpacing: this.letterSpacing,
            lineHeight: this.lineHeight,
        };
        return _.assignIn(elementObj, {
            text: this.text,
            msg: JSON.stringify(msg),
            fontSize: this.fontSize,
            fileId: this.fileId || '',
            src: this.src,
            ftFamilyList: this.ftFamilyList,
            ftFamilListChg: this.ftFamilListChg,
            tmpKey: this.tmpKey,
        });
    }
    getAllInfo() {
        // 导出作品样式数据，这个函数调用主要是提供给设计师。
        const elementObj = TheElement.toObject(this);
        const msg = {
            rotation: this.rotation,
            sideMaterial: this.sideMaterial,
            frontMaterial: this.frontMaterial,
            fontDepth: this.fontDepth,
            bevelSize: this.bevelSize,
            bevelThickness: this.bevelThickness,
            materialName: this.materialName,
            openAmbientLight: this.openAmbientLight,
            pointLights: this.pointLights,
            directionLights: this.directionLights,
            spotLights: this.spotLights,
            environmentMap: this.environmentMap,
        };
        const tmpObject = _.assignIn(elementObj, {
            text: this.text,
            msg: JSON.stringify(msg),
            fontSize: this.fontSize,
            canCollect: false,
            ftFamilyList: this.ftFamilyList,
        });
        delete tmpObject.objectId;
        delete tmpObject.isSizeLock;
        delete tmpObject.shadow;
        delete tmpObject.strokeDashArray;
        delete tmpObject.strokeLineCap;
        delete tmpObject.strokeLineJoin;
        delete tmpObject.strokeMiterLimit;
        delete tmpObject.tmpKey;
        delete tmpObject.depth;
        delete tmpObject.isCollect;
        delete tmpObject.category;
        delete tmpObject.isOpenShadow;
        delete tmpObject.isLocked;
        delete tmpObject.src;
        delete tmpObject.fileId;
        delete tmpObject.ftFamilyList[0].fontFaceId;
        delete tmpObject.ftFamilyList[0].tmp_fontface_path;
        return tmpObject;
    }
    changeMaterialPromise(oldObject, newObject, index) {
        const that = this;
        return new Promise(async(reslove, reject) => {
            const config = Ktu.tmpThreeTextContent[`${this.tmpKey}`];
            const mesh = config.group.children[0];
            const material = mesh.material[index];
            // if (true || oldObject.useEnv !== newObject.useEnv || oldObject.useLight !== newObject.useLight) {
            if (material) {
                if (material.map) {
                    material.map.dispose && material.map.dispose();
                }
                if (material.normalMap) {
                    material.normalMap.dispose && material.normalMap.dispose();
                }
                material.dispose();
            }
            let tmpMaterial = null;
            if (newObject.use === 'color') {
                tmpMaterial = await that.getColorMaterial(newObject);
            } else {
                tmpMaterial = await that.getTextureMaterial(newObject);
            }
            mesh.material[index] = tmpMaterial;
            // }
            /* else if (oldObject.use !== newObject.use) {
                if (newObject.use == 'color') {
                    material.color = new THREE.Color(newObject.color);
                    if (material.map) {
                        material.map.dispose();
                    }
                    if (material.normalMap) {
                        material.normalMap.dispose();
                    }
                    material.normalMap = null;
                    material.map = null;
                    if (newObject.normalMap) {
                        material.normalMap = await this.loadImageTexture(`${Ktu.initialData.resRoot}/${newObject.normalMap}`);
                    }
                    material.needsUpdate = true;
                } else {
                    material.color = new THREE.Color(0xffffff);
                    if (newObject.texture.originPath) {
                        material.map = await this.loadImageTexture(`${Ktu.initialData.resRoot}/${newObject.texture.originPath}`);
                    }
                    if (newObject.normalMap) {
                        material.normalMap = await this.loadImageTexture(`${Ktu.initialData.resRoot}/${newObject.normalMap}`);
                    }
                    mesh.material[index].needsUpdate = true;
                }
            } else if (oldObject.use == 'color') {
                material.color = new THREE.Color(newObject.color);
                if (material.map) {
                    material.map.dispose();
                }
                if (material.normalMap) {
                    material.normalMap.dispose();
                }
                material.normalMap = null;
                material.map = null;
                if (newObject.normalMap) {
                    material.normalMap = await this.loadImageTexture(`${Ktu.initialData.resRoot}/${newObject.normalMap}`);
                }
                material.needsUpdate = true;
            } else if (oldObject.use == 'texture') {
                if (material.map) {
                    material.map.dispose();
                }
                material.color = new THREE.Color(0xffffff);
                if (newObject.texture.originPath) {
                    material.map = await this.loadImageTexture(`${Ktu.initialData.resRoot}/${newObject.texture.originPath}`);
                }
                if (newObject.normalMap) {
                    material.normalMap = await this.loadImageTexture(`${Ktu.initialData.resRoot}/${newObject.normalMap}`);
                }
                material.needsUpdate = true;
            }
            if (newObject.roughness !== undefined) {
                material.roughness = parseFloat(newObject.roughness);
            }
            if (newObject.metalness !== undefined) {
                material.metalness = parseFloat(newObject.metalness);
            } */
            reslove();
        });
    }
    resizePromise() {
        // three.js 自适应。 也就是调整canvas的宽高不模糊
        return new Promise((reslove, reject) => {
            const config = Ktu.tmpThreeTextContent[`${this.tmpKey}`];
            if (!config) {
                reslove();
                return;
            }
            let {
                scale,
            } = Ktu.edit;
            if (scale <= this.limitScale) {
                scale = 1;
            }
            const { renderer, camera, domElement } = config;
            const { webGLWidth, webGLHeight } = this;
            // 先设置缩放后的宽高
            renderer.setSize(webGLWidth * scale, webGLHeight * scale);
            domElement.style.transform = `scale(${1 / scale})`;
            domElement.style.transformOrigin = `0 0`;
            // 需要重置canvas的aspect。 不然会被拉伸
            camera.aspect = webGLWidth / webGLHeight;
            // 这一步也很关键。相机的矩阵更新，因为有修改了aspect，并且宽高也修改了，需要重新计算。
            camera.updateProjectionMatrix();
            this.scaleX = 1;
            this.scaleY = 1;
            this.update();
            reslove();
        });
    }
    resetGeometry() {
        this.isLoading = true;
        this.hasCanvasPainted = false;
        this.initText('reStartRender');
    }
    changeLightPromise() {
        return new Promise((reslove, reject) => {
            const config = Ktu.tmpThreeTextContent[`${this.tmpKey}`];
            if (!config) {
                reslove();
                return;
            }
            const { scene } = config;
            scene.children.forEach((item, index) => {
                if (item.isLight) {
                    scene.children[index] = undefined;
                };
            });
            scene.children = scene.children.filter(item => item !== undefined);
            this.initLights();
            reslove();
        });
    }
    changeRotationPromise() {
        return new Promise((reslove, reject) => {
            const config = Ktu.tmpThreeTextContent[`${this.tmpKey}`];
            if (!config) {
                reslove();
                return;
            }
            config.group.rotation.x = this.rotation.x;
            config.group.rotation.y = this.rotation.y;
            reslove();
        });
    }
    reStartRender(geometry) {
        const config = Ktu.tmpThreeTextContent[`${this.tmpKey}`];
        if (!config) {
            return;
        }
        config.group.children[0].geometry.dispose();
        const { boundingBox } = geometry;
        this.updateCameraZ(geometry.boundingBox);
        config.vertices = [
            new THREE.Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.max.z),
            new THREE.Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.min.z),
            new THREE.Vector3(boundingBox.max.x, boundingBox.min.y, boundingBox.min.z),
            new THREE.Vector3(boundingBox.max.x, boundingBox.min.y, boundingBox.max.z),
            new THREE.Vector3(boundingBox.min.x, boundingBox.max.y, boundingBox.max.z),
            new THREE.Vector3(boundingBox.min.x, boundingBox.max.y, boundingBox.min.z),
            new THREE.Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.max.z),
            new THREE.Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.min.z),
        ];
        config.group.children[0].geometry = geometry;
        config.group.children[0].geometry.needsUpdate = true;
        this.update();
        $(this.parentEle).html(config.domElement);
        this.hasCanvasPainted = true;
        this.isLoading = false;
        this.changeBoundBox();
        this.needGenerateImage = true;
        this.createImage();
    }
    compareObject() {
        const config = Ktu.tmpThreeTextContent[`${this.tmpKey}`];
        let hasChange = false;
        if (config) {
            const { oldObject, domElement } = config;
            if (oldObject) {
                const promiseList = [];
                let hasFontChange = false;
                let hasLightChange = false;
                Object.keys(oldObject).forEach((key, index) => {
                    const oldItem = oldObject[key];
                    const newItem = this[key];
                    if (newItem === undefined || oldItem === undefined) {
                        return;
                    }
                    if (key === 'ftFamilyList') {
                        if (newItem[0].fontid !== oldItem[0].fontid || newItem[0].con !== oldItem[0].con) {
                            hasChange = true;
                            hasFontChange = true;
                        };
                    }
                    else if (JSON.stringify(oldItem) != JSON.stringify(newItem)) {
                        hasChange = true;
                        switch (key) {
                            case 'frontMaterial':
                                promiseList.push(this.changeMaterialPromise(oldItem, newItem, 0));
                                break;
                            case 'sideMaterial':
                                promiseList.push(this.changeMaterialPromise(oldItem, newItem, 1));
                                break;
                            case 'webGLWidth':
                            case 'webGLHeight':
                                promiseList.push(this.resizePromise());
                                break;
                            case 'rotation':
                                promiseList.push(this.changeRotationPromise());
                                break;
                            case 'lineHeight':
                            case 'letterSpacing':
                            case 'fontDepth':
                            case 'bevelSize':
                            case 'bevelThickness':
                                hasFontChange = true;
                                break;
                            case 'spotLights':
                            case 'pointLights':
                            case 'directionLights':
                                hasLightChange = true;
                                break;
                        }
                    };
                });
                if (hasLightChange) {
                    promiseList.push(this.changeLightPromise());
                }
                if (promiseList.length > 0) {
                    this.isLoading = true;
                    Promise.all(promiseList).then(() => {
                        this.isLoading = false;
                        this.hasCanvasPainted = true;
                        config.group.rotation.x = this.rotation.x;
                        config.group.rotation.y = this.rotation.y;
                        this.update();
                        $(this.parentEle).html(domElement);
                        this.changeBoundBox();
                        this.needGenerateImage = true;
                        this.createImage();
                        config.oldObject = this.saveOldObject();
                        if (hasFontChange) {
                            this.resetGeometry();
                        }
                    });
                } else if (hasFontChange) {
                    config.oldObject = this.saveOldObject();
                    this.resetGeometry();
                }
            }
        }
        return hasChange;
    }
    checkNoSupportFontFamily() {
        const { fontid } = this.ftFamilyList[0];
        if (Ktu.threeTextConfig.noSupportFontList.includes(fontid)) {
            this.ftFamilyList[0].fontid = 58;
            delete this.ftFamilyList[0].tmp_fontface_path;
            this.ftFamilListChg = 1;
            const fontFamily = `ktu_Font_TYPE_${0}_ID_${58}RAN_${parseInt(Date.now(), 10)}`;
            this.fontFamily = fontFamily;
        }
    }
    elementDone(ele) {
        Ktu.disposeThreeText();
        this.isLoading = false;
        this.hasCanvasPainted = true;
        this.checkNoSupportFontFamily();
        const config = Ktu.tmpThreeTextContent[`${this.tmpKey}`];
        if (ele && !Ktu.isOpenLightHelper && !Ktu.isOpenAxesHelper) {
            ele.style.overflow = 'hidden';
        } else {
            ele.style.overflow = 'visible';
        }

        // 感觉现在的状态变量判断有点多并且应该有的重复了，后续看下能不能抽出来。
        if (this.isNewAdd || this.parentEle || !this.fileId) {
            this.needGenerateImage = true;
        }

        // 初始化并且有图片，那就不要直接loading，等有修改再loading。
        if (!this.parentEle && this.fileId && this.src && !config) {
            if (this.isFromtInit) {
                this.isFromtInit = false;
            }
            this.parentEle = ele;
            return;
        }

        // 保留父级元素的引用，用于将svg替换成canvas
        this.parentEle = ele;

        this.fontSize = this.scaleX * this.fontSize;

        // 需要等组件加载完毕，再初始化3D文字
        this.initCanvasWidth();

        if (this.compareObject()) {
            return;
        }

        // 只改变的dirty的场景，比如切换页面不会重新初始化，所以要先清除原来缓存的。
        if (Ktu.tmpThreeTextContent[`${this.tmpKey}`] && this.isFromtInit) {
            this.update();
            this.changeBoundBox();
            $(this.parentEle).html(Ktu.tmpThreeTextContent[`${this.tmpKey}`].domElement);
            this.isFromtInit = false;
            return;
        } else if (this.isFromtInit && this.fileId && this.src) {
            this.isFromtInit = false;
            return;
        }

        this.hasCanvasPainted = false;
        this.isLoading = true;
        this.isFromtInit = false;
        this.debounceInitThree();
    }
    initCanvasWidth() {
        if (this.scaleX !== 1) {
            // 用于计算字号(the-text-common), 因为拖拽缩放结束的时候scaleX实际上我们是不需要的。
            this.realScale = this.scaleX;
        }
        let maxCharCount = 0;
        let currentCharCount = 0;
        let lines = 0;
        let hasLine = true;
        let maxLineWidth = 0;
        let currentLineWidth = 0;
        // reduce好像好点，算了
        Array.from(this.text).forEach((item, index) => {
            if (item == '\n') {
                maxCharCount = Math.max(maxCharCount, currentCharCount);
                maxLineWidth = Math.max(maxLineWidth, currentLineWidth);
                currentCharCount = 0;
                currentLineWidth = 0;
                hasLine = true;
            } else {
                if (hasLine) {
                    lines ++;
                    hasLine = false;
                }
                currentCharCount++;
                if (/[a-zA-Z1-9]/.test(item)) {
                    currentLineWidth += this.fontSize * 0.75;
                } else if (' ' == item) {
                    currentLineWidth += this.fontSize * 0.44;
                } else {
                    currentLineWidth += this.fontSize;
                }
            }
        });
        maxCharCount = Math.max(maxCharCount, currentCharCount);
        maxLineWidth = Math.max(maxLineWidth, currentLineWidth);
        // 单个字符需要额外的宽高以及z轴偏移
        if (maxCharCount > 0) {
            const width = maxLineWidth + (maxCharCount - 1) * this.fontSize * this.letterSpacing / 1000;
            const height = lines * this.fontSize + (lines - 1) * Math.abs(this.lineHeight) * this.fontSize * this._fontSizeMult;
            const canvasSize = Math.max(width, height);
            this.webGLWidth = width;
            this.webGLHeight = canvasSize;
            this.webGLWidth *= 1.4;
            this.webGLHeight *= 1.4;
        };
    }
    saveOldObject() {
        // 暂时先通过json的方式把observer去掉, 暂时只对比用户可感知的部分，设计师自定义面板的部分先等等
        let oldObject = _.assignIn({
            spotLights: this.spotLights || [],
            pointLights: this.pointLights || [],
            directionLights: this.directionLights || [],
            fontSize: this.fontSize,
            ftFamilyList: this.ftFamilyList,
            webGLHeight: this.webGLHeight,
            webGLWidth: this.webGLWidth,
            frontMaterial: this.frontMaterial,
            sideMaterial: this.sideMaterial,
            fontDepth: this.fontDepth,
            bevelSize: this.bevelSize,
            bevelThickness: this.bevelThickness,
            letterSpacing: this.letterSpacing,
            lineHeight: this.lineHeight,
            rotation: this.rotation,
            // environmentMap: this.environmentMap || '',
        }, {});
        oldObject = JSON.parse(JSON.stringify(oldObject));
        return oldObject;
    }
    initThree() {
        const scene = new THREE.Scene();
        let renderer = null;
        /*  切换样式的时候，会频繁的触发new WebGLRenderer，但是这个东西是很耗性能的，所以在disposeThreeText，将旧的缓存下来
        这个也得益于WebGLRenderer并不会考虑他要渲染的是什么内容。
        */
        if (Ktu.threeTextConfig.tmpRenderer && Ktu.threeTextConfig.tmpRenderer.length > 0) {
            renderer = Ktu.threeTextConfig.tmpRenderer.pop();
        } else {
            renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
                // 必须加上这一行，才可以在2D的canvas上面绘制这个canvas
                preserveDrawingBuffer: true,
            });
        }
        renderer.setClearAlpha(0);
        renderer.setSize(this.webGLWidth, this.webGLHeight);
        const group = new THREE.Group();
        const { domElement } = renderer;
        domElement.style.position = 'absolute';
        Ktu.tmpThreeTextContent[`${this.tmpKey}`] = {
            scene,
            renderer,
            group,
            domElement,
            pageIndex: Ktu.template.currentPageIndex,
        };
        this.initPersectiveCamera();
        this.initLights();
        this.initText();
    }
    initPersectiveCamera() {
        const config = Ktu.tmpThreeTextContent[`${this.tmpKey}`];
        // fov这种比例应该是可以计算的，不至于说要自己手动测。（fov与相机可视区域宽度、相机Z轴距离有关，=> updateCameraZ）
        config.camera = new THREE.PerspectiveCamera(40, this.webGLWidth / this.webGLHeight, 0.1, 10000);
        config.scene.add(config.camera);
    }
    initLights() {
        // 添加光源
        const pointLights = this.pointLights || [];

        const directionLights = this.directionLights || [];

        const spotLights = this.spotLights || [];
        // 点光源
        const config = Ktu.tmpThreeTextContent[`${this.tmpKey}`];
        pointLights.forEach((item => {
            const pointLight = new THREE.PointLight(item.color, parseFloat(item.intensity),  0.0, parseFloat(item.decay));
            pointLight.position.set(parseFloat(item.position[0]), parseFloat(item.position[1]), parseFloat(item.position[2]));
            if (Ktu.isOpenLightHelper) {
                const sphereSize = 10;
                const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
                config.scene.add(pointLightHelper);
            }
            config.scene.add(pointLight);
        }));
        // 平行光源
        directionLights.forEach((item => {
            const directionLight = new THREE.DirectionalLight(item.color, parseFloat(item.intensity));
            directionLight.position.set(parseFloat(item.position[0]), parseFloat(item.position[1]), parseFloat(item.position[2]));
            if (Ktu.isOpenLightHelper) {
                const helper = new THREE.DirectionalLightHelper(directionLight, 10);
                config.scene.add(helper);
            }
            config.scene.add(directionLight);
        }));
        // 聚光灯
        spotLights.forEach((item => {
            const spotLight = new THREE.SpotLight(item.color, parseFloat(item.intensity), parseFloat(item.distance), parseFloat(item.angle), parseFloat(item.penumbra), parseFloat(item.decay));
            spotLight.position.set(parseFloat(item.position[0]), parseFloat(item.position[1]), parseFloat(item.position[2]));
            if (Ktu.isOpenLightHelper) {
                const helper = new THREE.SpotLightHelper(spotLight);
                config.scene.add(helper);
            }
            config.scene.add(spotLight);
        }));
        // 环境光
        const ambientLight = new THREE.AmbientLight(0xffffff);
        if (this.openAmbientLight) {
            config.scene.add(ambientLight);
        }

        if (Ktu.isOpenAxesHelper) {
            const axesHelper = new THREE.AxesHelper(1500);
            config.scene.add(axesHelper);
        }
    }
    getEnvImageList(context, maxWidth) {
        // 切割图片成6份，要做一个cubeTexture，充当环境贴图
        const tmpWidth = 512;
        let offsetX = 0;
        let offsetY = 0;
        const list = [];
        for (let i = 0; i < 6; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = tmpWidth;
            canvas.height = tmpWidth;
            const tmpContext = canvas.getContext('2d');
            const imgData = context.getImageData(offsetX, offsetY, tmpWidth, tmpWidth);
            tmpContext.putImageData(imgData, 0, 0);
            offsetX += tmpWidth;
            if (offsetX + tmpWidth > maxWidth) {
                offsetX = 0;
                offsetY += tmpWidth;
            }
            list.push(canvas);
        }
        return list;
    }
    loadEnvMap() {
        // 获取环境贴图
        return new Promise((reslove, reject) => {
            if (!this.environmentMap || !this.environmentMap.path) {
                reslove();
                return;
            }
            const canvas = document.createElement('canvas');
            const img = new Image();
            img.setAttribute('crossorigin', 'anonymous');
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                const context = canvas.getContext('2d');
                context.drawImage(img, 0, 0, img.width, img.height);
                // 切割成6个canvas，用来创建CubeTexture充当环境贴图
                const imageList = this.getEnvImageList(context, img.width);
                const cubeTexture = new THREE.CubeTexture(imageList);
                // 这个东西，很关键，必须设置成需要更新，在render的时候才会刷新这个texture
                cubeTexture.needsUpdate = true;
                reslove(cubeTexture);
            };
            img.onerror = err => reslove();
            img.src = `${Ktu.initialData.resRoot}/${this.environmentMap.path}`;
        });
    }
    getAlpha(color) {
        // 获取十六进制的alpha值
        let alpha = 1;
        if (/rgba|rgb/i.test(color)) {
            const rgb = color.match(/(\d(\.\d+)?)+/g);
            alpha = rgb[3];
            if (alpha === undefined) {
                alpha = 1;
            }
        }
        if ('transparent' == color) {
            alpha = 0;
        }
        return +alpha;
    }
    getColorMaterial(material) {
        // 获取颜色材质、
        if (material.useLight === undefined) {
            material.useLight = true;
        }
        if (material.useEnv === undefined) {
            material.useEnv = true;
        }
        let { roughness = 0.0, metalness = 0.5, color = '#ffffff', normalMap } = material;
        const config = Ktu.tmpThreeTextContent[`${this.tmpKey}`];
        const alpha = this.getAlpha(color);
        roughness = parseFloat(roughness);
        metalness = parseFloat(metalness);
        // 获取普通的颜色材质
        return new Promise((reslove, reject) => {
            const options = {
                color,
                roughness,
                metalness,
                transparent: true,
                opacity: alpha,
                lights: false,
            };
            if (config.envMap && material.useEnv) {
                options.envMap = config.envMap;
            }
            if (normalMap) {
                // 如果需要法线贴图的，先加载法线贴图
                this.loadImageTexture(`${Ktu.initialData.resRoot}/${normalMap}`).then(texture => {
                    options.normalMap = texture;
                    create();
                }, undefined, () => {
                    create();
                });
            } else {
                create();
            }
            function create() {
                // 根据是否要使用光源判断用哪一个材质。
                if (material.useLight) {
                    const material = new THREE.MeshStandardMaterial(options);
                    reslove(material);
                } else {
                    const material = new THREE.MeshBasicMaterial(options);
                    reslove(material);
                }
            }
        });
    }
    getTextureMaterial(material) {
        if (material.useLight === undefined) {
            material.useLight = true;
        }
        if (material.useEnv === undefined) {
            material.useEnv = true;
        }
        let { texture, roughness = 0, metalness = 0.5, normalMap } = material;
        const config = Ktu.tmpThreeTextContent[`${this.tmpKey}`];
        roughness = parseFloat(roughness);
        metalness = parseFloat(metalness);
        // 获取贴图材质
        return new Promise((reslove, reject) => {
            const options = {
                roughness,
                metalness,
                transparent: true,
                wireframeLinejoin: 'miter',
            };
            if (config.envMap && material.useEnv) {
                options.envMap = config.envMap;
            }
            function create() {
                if (material.useLight) {
                    const material = new THREE.MeshStandardMaterial(options);
                    reslove(material);
                } else {
                    const material = new THREE.MeshBasicMaterial(options);
                    reslove(material);
                }
            }
            if (normalMap) {
                this.loadImageTexture(`${Ktu.initialData.resRoot}/${normalMap}`).then(texture => {
                    options.normalMap = texture;
                    if (options.map) {
                        create();
                    }
                });
            }
            // src = 'https://kth.faisys.com/image/index/edit-word.png';
            this.loadImageTexture(`${Ktu.initialData.resRoot}/${texture.originPath}`).then(texture => {
                options.map = texture;
                if (normalMap && options.normalMap) {
                    create();
                } else if (!normalMap) {
                    create();
                }
            });
        });
    }
    getGradientMaterial(gradient) {
        // 获取渐变色的材质
        return new Promoise((reslove, reject) => {
            const { stopColorList } = gradient;
            const shader = new THREE.ShaderMaterial({
                uniforms: {
                    color1: {
                        type: 'vec3',
                        value: new THREE.Color(stopColorList[0].color),
                    },
                    color2: {
                        type: 'vec3',
                        value: new THREE.Color(stopColorList[1].color),
                    },
                    maxWidth: {
                        value: this.boundingBoxMaxX,
                    },
                    maxHeight: {
                        value: this.boundingBoxMaxY,
                    },
                    rad: { value: 90.0 },
                    PI: { value: Math.PI },
                },
                vertexShader: `
                    varying vec3 vUv;
    
                    void main() {
                        vUv = position;
                        vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
                        gl_Position = projectionMatrix * modelViewPosition;
                    }
                `,
                fragmentShader: `
                    uniform vec3 color1;
                    uniform vec3 color2;
                    uniform float maxWidth;
                    uniform float maxHeight;
                    uniform float PI;
                    uniform float rad;
                    varying vec3 vUv;
                    
                    float getCurrentDistance(float sx,float sy) {
                        float tmpRad = rad * (PI / 180.0);
                        float k = tan(tmpRad);
                        float width = maxWidth;
                        if (rad == 90.0) {
                            k = 0.0;
                            width = maxHeight;
                        }
                        float distance = (k * sx - sy) / sqrt(k*k + 1.0);
                        float res = sy - sx * k;
                        return (distance + width) / (width + width);
                    }
                    
                    float linearDistance(float st) {
                        return (st + maxWidth) / (maxWidth + maxWidth);
                    }
    
                    void main() {
                        float tmp = linearDistance(vUv.x);
                        gl_FragColor = vec4(mix(color1,color2,tmp),1.0);
                    }
                `,
            });
            reslove(shader);
        });
    }
    loadImageTexture(src, isBox) {
        // 加载3D文字图片纹理
        return new Promise((reslove, reject) => {
            new THREE.TextureLoader().load(src, texture => {
                texture.wrapS = THREE.MirroredRepeatWrapping;
                texture.wrapT = THREE.MirroredRepeatWrapping;
                // 3D字体的纹理，需要加一个repeat
                texture.repeat.set(0.01, 0.01);
                reslove(texture);
            }, undefined, err => {
                reject(err);
            });
        });
    }
    getMaterial(material = { color: '#ff7733' }) {
        if (material.use == 'garadient') {
            return this.getGradientMaterial(material.gradident);
        } else if (material.use == 'texture') {
            return this.getTextureMaterial(material);
        }
        return this.getColorMaterial(material);
    }
    async startRender(geometry) {
        const config = Ktu.tmpThreeTextContent[`${this.tmpKey}`];
        if (!config) {
            return;
        }
        const { boundingBox } = geometry;
        this.updateCameraZ(geometry.boundingBox);
        // 初始化的顶点数组（只需要8个），用于计算二维浏览器页面的坐标点
        config.vertices = [
            new THREE.Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.max.z),
            new THREE.Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.min.z),
            new THREE.Vector3(boundingBox.max.x, boundingBox.min.y, boundingBox.min.z),
            new THREE.Vector3(boundingBox.max.x, boundingBox.min.y, boundingBox.max.z),
            new THREE.Vector3(boundingBox.min.x, boundingBox.max.y, boundingBox.max.z),
            new THREE.Vector3(boundingBox.min.x, boundingBox.max.y, boundingBox.min.z),
            new THREE.Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.max.z),
            new THREE.Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.min.z),
        ];
        // 加载环境贴图
        config.envMap = await this.loadEnvMap();
        // 计算中心点
        this.boundingBoxMaxX = parseFloat(geometry.boundingBox.max.x);
        this.boundingBoxMaxY = parseFloat(geometry.boundingBox.max.y);
        const material = await Promise.all([this.getMaterial(this.frontMaterial), this.getMaterial(this.sideMaterial)]);
        const mesh = new THREE.Mesh(geometry, material);
        // mesh.castShadow = true;
        mesh.rotation.y = Math.PI * 2;
        // 用group好控制
        config.group.add(mesh);
        config.group.rotation.x = this.rotation.x;
        config.group.rotation.y = this.rotation.y;
        config.scene.add(config.group);
        config.group.position.z = - geometry.boundingBox.max.z;
        this.scaleX = 1;
        this.scaleY = 1;
        this.hasCanvasPainted = true;
        this.isLoading = false;
        const {
            scale,
        } = Ktu.edit;
        if (scale > this.limitScale) {
            const { renderer, camera, domElement } = config;
            const { webGLWidth, webGLHeight } = this;
            renderer.setSize(webGLWidth * scale, webGLHeight * scale);
            domElement.style.transform = `scale(${1 / scale})`;
            domElement.style.transformOrigin = `0 0`;
            camera.updateProjectionMatrix();
            this.update();
            $(this.parentEle).html(domElement);
            this.changeBoundBox();
            this.createImage();
        } else {
            $(this.parentEle).html(config.domElement);
            this.update();
            this.changeBoundBox();
            this.createImage();
        }
        config.oldObject = this.saveOldObject();
    }
    getFontUrl(tmpFont = { fontid: 58, fonttype: 0 }) {
        // 判断是否已经生成了字体片段的文件，并且该文件没有丢失。
        if (tmpFont.tmp_fontface_path && !/_404/.test(tmpFont.tmp_fontface_path)) {
            return tmpFont.tmp_fontface_path;
        }
        const cookie = `&_FSESSIONID=${$.cookie('_FSESSIONID')}&_TOKEN=${Ktu.initialData.token}`;
        // 请求font.jsp 有问题、 (需要留意一下异常情况的处理)
        const url = `/font.jsp?type=${tmpFont.fonttype}&id=${tmpFont.fontid}${cookie}`;
        return url;
    }
    initText(callback = 'startRender') {
        const url = this.getFontUrl(this.ftFamilyList[0]);
        const defaultFontUrl = this.getFontUrl();
        const { fontSize, fontDepth, bevelThickness, bevelSize, lineHeight, letterSpacing } = this;
        const data = {
            url,
            defaultFontUrl,
            fontSize,
            depth: fontDepth,
            bevelThickness,
            bevelSize,
            lineHeight,
            letterSpacing,
            text: this.text,
            objectId: this.objectId,
            callback,
        };
        Ktu.threeTextWorker.postMessage(data);
    }
    updateCameraZ(boundingBox) {
        // 重新计算camera的Z轴
        const config = Ktu.tmpThreeTextContent[`${this.tmpKey}`];
        if (!config) {
            return;
        }
        let { fov, aspect } = config.camera;
        const currentWidth = boundingBox.max.x - boundingBox.min.x + 60;
        const currentHeight = currentWidth / aspect;
        fov = fov * (Math.PI / 180) / 2;
        this.fovDeg = fov;
        const zIndex = Math.ceil(currentHeight / 2 / (Math.tan(fov)));
        config.camera.position.z = zIndex;
    }
    startRotation() {
        // 开始旋转，如果说没有初始化，就先初始化
        if (this.isLoading) {
            return;
        }
        const config = Ktu.tmpThreeTextContent[`${this.tmpKey}`];
        if (config) {
            return;
        }
        else if (this.parentEle) {
            this.elementDone(this.parentEle);
        }
    }
    changeRotation(angleX = 0, angleY = 0) {
        this.tmpRotation.x = (angleX * (Math.PI / 180));
        this.tmpRotation.y = (angleY * (Math.PI / 180));
        this.updateRotation();
    }
    setRotation() {
        // 设计师希望能够点击就直接旋转到这个角度
        const config = Ktu.tmpThreeTextContent[`${this.tmpKey}`];
        this.rotation.x = 0.05148721293383268;
        this.rotation.y = 0.42760566673861056;
        config.group.rotation.x = this.rotation.x;
        config.group.rotation.y = this.rotation.y;
        this.update();
        this.changeBoundBox();
    }
    updateRotation() {
        const config = Ktu.tmpThreeTextContent[`${this.tmpKey}`];
        let rotationX = this.rotation.x + this.tmpRotation.x;
        // x超过60 °，就不给旋转了
        if (rotationX > Math.PI / 2) {
            rotationX = Math.PI / 2;
        } else if (rotationX < -Math.PI / 2) {
            rotationX = -Math.PI / 2;
        }
        config.group.rotation.x = rotationX;
        config.group.rotation.y = this.rotation.y + this.tmpRotation.y;
        this.update();
        this.changeBoundBox();
    }
    threeRotationEnd() {
        // 3D旋转结束。
        Ktu.log('threeTextEdit', 'changeRotation');
        this.needGenerateImage = true;
        const config = Ktu.tmpThreeTextContent[`${this.tmpKey}`];
        this.rotation.x = config.group.rotation.x;
        this.rotation.y = config.group.rotation.y;
        if (config.oldObject) {
            config.oldObject.rotation = {
                x: this.rotation.x,
                y: this.rotation.y,
            };
        }
    }
    getDimensions() {
        return {
            w: this.width,
            h: this.height,
        };
    }
    changeBoundBox() {
        const config = Ktu.tmpThreeTextContent[`${this.tmpKey}`];
        const ele = config.group.children[0];
        if (!ele) {
            return;
        }
        ele.updateMatrixWorld();
        const final = {
            yMin: Infinity,
            yMax: 0,
            xMin: Infinity,
            xMax: 0,
        };
        // 遍历8个顶点，计算浏览器二维的四个边界，用来展示选择框
        config.vertices.map((item, index) => {
            const vector = item.clone();
            vector.applyMatrix4(ele.matrixWorld);
            const obj = this.toScreenPosition(vector);
            final.yMax = Math.max(obj.y, final.yMax);
            final.yMin = Math.min(obj.y, final.yMin);
            final.xMax = Math.max(obj.x, final.xMax);
            final.xMin = Math.min(obj.x, final.xMin);
            return 0;
        });
        const {
            scale,
        } = Ktu.edit;
        if (scale > this.limitScale) {
            final.yMax /= scale;
            final.xMax /= scale;
            final.xMin /= scale;
            final.yMin /= scale;
        };
        this.width = final.xMax - final.xMin;
        this.height = final.yMax - final.yMin;
        config.domElement.style.left = `${-final.xMin}px`;
        config.domElement.style.top = `${-final.yMin}px`;
        this.canvasLeft = -final.xMin;
        this.canvasTop = -final.yMin;
        setTimeout(() => {
            this.setCoords();
        });
    }
    toScreenPosition(pointer) {
        // 获取webgl内3D的坐标对应的浏览器二维坐标
        const config = Ktu.tmpThreeTextContent[`${this.tmpKey}`];
        const vector = new THREE.Vector3();
        const widthHalf = 0.5 * config.domElement.width;
        const heightHalf = 0.5 * config.domElement.height;
        vector.set(pointer.x, pointer.y, pointer.z);
        vector.project(config.camera);
        vector.x = (vector.x * widthHalf) + widthHalf;
        vector.y = - (vector.y * heightHalf) + heightHalf;
        return {
            x: vector.x,
            y: vector.y,
        };
    }
    update() {
        // 刷新renderer
        const that = Ktu.tmpThreeTextContent[`${this.tmpKey}`];
        that.renderer.render(that.scene, that.camera);
    }
    getEditingOffsetTop() {
        return this.lineHeight === 1 ? 0 : this.lineHeight * this.fontSize / 2;
    }
    getCharSpacing() {
        return this.fontSize * this.letterSpacing / 1000;
    }
    selectAll() {
        const range = document.createRange();
        range.selectNodeContents(this.textEditor);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
    }
    onDoubleClick(event) {
        event.preventDefault();
        this.enterEditing();
    }
    enterEditing() {
        // 从Text复制过来的一个双击进入编辑。
        this.isEditing = true;
        this.saveState();
        Vue.nextTick(() => {
            const textEditor = document.getElementById('textEditor');
            this.textEditor = textEditor;
            if (textEditor) {
                window.setTimeout(() => {
                    textEditor.focus();
                    this.selectAll();
                    textEditor.addEventListener('blur', () => {
                        this.exitEditing();
                    });
                    textEditor.addEventListener('keydown', event => {
                        if (this.editable) {
                            this.hasEdited = true;
                            if (event.keyCode === 67 || event.keyCode === 82 || event.keyCode === 83 || event.keyCode === 84) {
                                Ktu.interactive.canDraw = false;
                            }
                        } else {
                            event.preventDefault();
                        }
                    });
                    textEditor.addEventListener('keyup', event => {
                        this.editable = true;
                        Ktu.interactive.isDrawing = false;
                        Ktu.interactive.canDraw = true;
                    });
                    textEditor.addEventListener('copy', event => {
                        event.stopPropagation();
                    });
                    textEditor.addEventListener('paste', event => {
                        event.preventDefault();
                        event.stopPropagation();
                        if ((event.originalEvent || event).clipboardData) {
                            const content = (event.originalEvent || event).clipboardData.getData('text/plain');
                            const span = document.createElement('span');
                            span.innerText = content;
                            document.execCommand('insertHtml', false, span.innerHTML.replace(/\s/g, ' '));
                        }
                    });
                });
            }
        });
    }
    filtText() {
        // 过滤字体，不超过20个，但是不能算上换行符
        if (this.text.length > 20) {
            const textList = [];
            let count = 0;
            Array.from(this.text).forEach((item, index) => {
                if (count >= 20) {
                    return;
                }
                if (item != '\n') {
                    count ++;
                }
                textList.push(item);
            });
            if (textList.length < this.text.length) {
                Ktu.notice.error('只支持添加20个字符!');
            }
            this.text = textList.join('');
        }
    }
    async exitEditing() {
        // 退出编辑
        const tmpText = this.getEditedText().replace(/\s/, '');
        if (tmpText == '') {
            this.remove();
            return;
        }
        // 文本是否有被编辑过
        if (this.hasEdited) {
            this.modifiedState();
            this.text = this.getEditedText();
            this.filtText();
            delete this.ftFamilyList[0].tmp_fontface_path;
            delete this.ftFamilyList[0].fontFaceId;
            this.ftFamilyList[0].con = this.text;
            this.ftFamilListChg = 1;
            this.scaleX = 1;
            this.scaleY = 1;
            this.hasEdited = false;
            this.dirty = true;
        }
        this.isEditing = false;
        // 完成编辑后textbox需要重新生成svg，table需要退出编辑
        this.isHover = false;
        this.textEditor = null;
    }
    getEditedText() {
        let text = this.textEditor.innerText;
        if (/\r?\n/.test(text[text.length - 1])) {
            text = text.slice(0, text.length - 1);
        }
        // text = this.removeEmoji(text);
        return text;
    }
    removeEmoji(text = '') {
        const emojiReg = /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[A9|AE]\u3030|\uA9|\uAE|\u3030/ig;
        return text.replace(emojiReg, '');
    }
}
