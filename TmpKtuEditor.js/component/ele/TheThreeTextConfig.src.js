Vue.component('ele-three-config', {
    template: `<div class="three-config-container">
                 <div class="point-light-container a-container">
                    <div class="title" style="color:#ff7733;">面板输入框除颜色外都支持输入小数</div>
                 </div>
                 <div class="point-light-container a-container">
                    <div class="title">
                        <span>旋转到合适角度</span>
                        <button @click="setRotation()">go</button>
                    </div>
                 </div>
                  <div class="point-light-container a-container">
                    <div class="title">
                        <span>光源位置辅助</span>
                        <ktu-switch v-model="openHelper"></ktu-switch>
                    </div>
                  </div>
                  <div class="point-light-container a-container">
                    <div class="title">
                        <span>世界坐标轴辅助</span>
                        <ktu-switch v-model="openAxesHelper"></ktu-switch>
                    </div>
                  </div>
                  <div class="point-light-container a-container">
                    <div class="title">
                        <span>环境光</span>
                        <ktu-switch v-model="openAmbientLight"></ktu-switch>
                    </div>
                  </div>
                  <div class="point-light-container a-container">
                    <div class="title">
                        <span>点光源(输入后点击按钮)</span>
                        <button @click="addPointLight()">添加光源</button>
                    </div>
                    <div class="input-tab">
                        <div v-for="(item, index) in pointLightInput" class="item-tab">
                            <label>{{item.desc}}：
                                <validate-input
                                    placeholder=""
                                    class="config-input"
                                    v-model="item.value"
                                    :inputVal="item.value"
                                    style="width:50px"
                                >
                                </validate-input>
                            </label>
                        </div>
                    </div>
                  </div>
                  <div class="point-light-list list-container">
                    <div class="list-item" v-for="(item, index) in pointLights">
                        <span>{{item.position[0]}},{{item.position[1]}},{{item.position[2]}},{{item.color}},{{item.intensity}}</span>
                        <button @click="deletePointLight(index)">删除</button>
                    </div>
                  </div>
                  <div class="direct-light-container  a-container">
                    <div class="title">
                        <span>平行光源</span>
                        <button @click="addDirectLight()">添加光源</button>
                    </div>
                    <div class="input-tab">
                        <div v-for="(item, index) in directLightInput" class="item-tab">
                            <label>{{item.desc}}：
                                <validate-input
                                    placeholder=""
                                    class="config-input"
                                    v-model="item.value"
                                    :inputVal="item.value"
                                    style="width:50px"
                                >
                                </validate-input>
                            </label>
                        </div>
                    </div>
                  </div>
                  <div class="direct-light-list list-container">
                     <div class="list-item" v-for="(item, index) in directionLights">
                        <span>{{item.position[0]}},{{item.position[1]}},{{item.position[2]}},{{item.color}},{{item.intensity}}</span>
                        <button @click="deleteDirectLight(index)">删除</button>
                     </div>
                  </div>
                  <div class="spot-light-container  a-container">
                    <div class="title">
                        <span>聚光灯光源 <a style="color: #ff7733;" href="http://www.yanhuangxueyuan.com/threejs/examples/#webgl_lights_spotlight" target="_blank">在线案例</a></span>
                        <button @click="addSpotLight()">添加光源</button>
                    </div>
                    <div class="input-tab">
                        <div v-for="(item, index) in spotLightInput" class="item-tab">
                            <label>{{item.desc}}：
                                <validate-input
                                    placeholder=""
                                    class="config-input"
                                    v-model="item.value"
                                    :inputVal="item.value"
                                    style="width:50px"
                                >
                                </validate-input>
                            </label>
                        </div>
                    </div>
                  </div>
                  <div class="spot-light-list list-container">
                    <div class="list-item" v-for="(item, index) in spotLights">
                        <span>{{item.position[0]}},{{item.position[1]}},{{item.position[2]}},{{item.color}},{{item.intensity}},{{item.distance}},{{item.angle}}, {{item.penumbra}}</span>
                        <button @click="deleteSpotLight(index)">删除</button>
                    </div>
                  </div>
                  <div class="front-material a-container">
                    <div class="title">
                        <span>环境贴图<span style="color:#ff7733;">(雪碧图，单图512x512)</span></span>
                        <button @click="changeEnvMap()">切换贴图</button>
                    </div>
                    <div class="input-tab">
                        <div v-for="(item, index) in envMapInput" class="item-tab" :style="{width: (item.max ? '100%' : '46%')}">
                            <label>{{item.desc}}：
                                <validate-input
                                    placeholder=""
                                    class="config-input"
                                    v-model="item.value"
                                    :inputVal="item.value"
                                    :style="{width: (item.max?240 : 50) + 'px'}"
                                >
                                </validate-input>
                            </label>
                        </div>
                    </div>
                  </div>
                  <div class="front-material a-container">
                    <div class="title">
                        <span>正反面材质<span style="color:#ff7733;">(不填写贴图就是使用颜色)</span></span>
                        <button @click="changeFrontMaterial()">切换材质</button>
                    </div>
                    <div class="input-tab">
                        <div v-for="(item, index) in frontMaterialInput" class="item-tab" :style="{width: (item.max ? '100%' : '46%')}">
                            <label>{{item.desc}}：
                                <validate-input v-if="!item.isSwitch"
                                    placeholder=""
                                    class="config-input"
                                    v-model="item.value"
                                    :inputVal="item.value"
                                    :style="{width: (item.max?240 : 50) + 'px'}"
                                >
                                </validate-input>
                                <ktu-switch v-if="item.isSwitch" v-model="item.value"></ktu-switch>
                            </label>
                        </div>
                    </div>
                  </div>
                  <div class="front-material a-container">
                    <div class="title">
                        <span>侧边材质</span>
                        <button @click="changeSideMaterial()">切换材质</button>
                    </div>
                    <div class="input-tab">
                        <div v-for="(item, index) in sideMaterialInput" class="item-tab" :style="{width: (item.max ? '100%' : '46%')}">
                            <label>{{item.desc}}：
                                <validate-input v-if="!item.isSwitch"
                                    placeholder=""
                                    class="config-input"
                                    v-model="item.value"
                                    :inputVal="item.value"
                                    :style="{width: (item.max?240 : 50) + 'px'}"
                                >
                                </validate-input>
                                <ktu-switch v-if="item.isSwitch" v-model="item.value"></ktu-switch>
                            </label>
                        </div>
                    </div>
                  </div>
                  <div class="export-container a-container">
                    <button @click="exportMaterial()">导出材质和光源</button>
                    <button @click="exportAll()">导出当前作品样式</button>
                  </div>
              </div>`,
    mixins: [Ktu.mixins.dataHandler],
    data() {
        return {
            pointLightInput: {
                x: {
                    desc: 'x轴位置',
                    value: 0,
                },
                y: {
                    desc: 'y轴位置',
                    value: 0,
                },
                z: {
                    desc: 'z轴位置',
                    value: 0,
                },
                color: {
                    desc: '颜色',
                    value: '#ffffff',
                },
                intensity: {
                    desc: '光照强度',
                    value: 1,
                },
                decay: {
                    desc: '光照衰退(1-2)',
                    value: 1,
                },
            },
            pointLights: [],
            directLightInput: {
                x: {
                    desc: 'x轴位置',
                    value: 10,
                },
                y: {
                    desc: 'y轴位置',
                    value: 10,
                },
                z: {
                    desc: 'z轴位置',
                    value: 10,
                },
                color: {
                    desc: '颜色',
                    value: '#ffffff',
                },
                intensity: {
                    desc: '光照强度',
                    value: 1,
                },
            },
            directionLights: [],
            spotLightInput: {
                x: {
                    desc: 'x轴位置',
                    value: 100,
                },
                y: {
                    desc: 'y轴位置',
                    value: 100,
                },
                z: {
                    desc: 'z轴位置',
                    value: 100,
                },
                color: {
                    desc: '颜色',
                    value: '#cccccc',
                },
                intensity: {
                    desc: '光照强度',
                    value: 1,
                },
                distance: {
                    desc: 'distance',
                    value: 500,
                },
                angle: {
                    desc: 'angle',
                    value: 0.5,
                },
                penumbra: {
                    desc: 'penumbra',
                    value: 0,
                },
                decay: {
                    desc: '光照衰退(1-2)',
                    value: 1,
                },
            },
            spotLights: [],
            envMapInput: {
                path: {
                    desc: '贴图路径',
                    value: '',
                    max: true,
                },
            },
            frontMaterialInput: {
                useLight: {
                    isSwitch: true,
                    value: true,
                    desc: '受光源影响',
                },
                useEnv: {
                    isSwitch: true,
                    value: true,
                    desc: '受环境贴图影响',
                },
                normalMap: {
                    value: '',
                    desc: '法线贴图',
                    max: true,
                },
                originPath: {
                    value: '',
                    desc: '纹理贴图',
                    max: true,
                },
                thumbPath: {
                    value: '',
                    desc: '贴图缩略图',
                    max: true,
                },
                roughness: {
                    value: 0,
                    desc: '镜面相似度(0-1,0为镜面)',
                },
                metalness: {
                    value: 0.5,
                    desc: '金属相似度(0-1,1为金属)',
                },
            },
            sideMaterialInput: {
                useLight: {
                    isSwitch: true,
                    value: true,
                    desc: '受光源影响',
                },
                useEnv: {
                    isSwitch: true,
                    value: true,
                    desc: '受环境贴图影响',
                },
                normalMap: {
                    value: '',
                    desc: '法线贴图',
                    max: true,
                },
                originPath: {
                    value: '',
                    desc: '纹理贴图',
                    max: true,
                },
                thumbPath: {
                    value: '',
                    desc: '贴图缩略图',
                    max: true,
                },
                roughness: {
                    value: 0,
                    desc: '镜面相似度(0-1,0为镜面)',
                },
                metalness: {
                    value: 0,
                    desc: '金属相似度(0-1,1为金属)',
                },
            },
        };
    },
    created() {
        const activeObject = this.getThreeObject();
        if (!activeObject) {
            return;
        }
        this.hasTips = false;
        this.pointLights = activeObject.pointLights;
        this.directionLights = activeObject.directionLights;
        this.spotLights = activeObject.spotLights;
        if (activeObject.environmentMap) {
            this.envMapInput.path.value = activeObject.environmentMap.path || '';
        }
        if (activeObject.frontMaterial) {
            this.frontMaterialInput.normalMap.value = activeObject.frontMaterial.normalMap || '';
            this.frontMaterialInput.originPath.value = activeObject.frontMaterial.texture.originPath || '';
            this.frontMaterialInput.thumbPath.value = activeObject.frontMaterial.texture.thumbPath || '';
            this.frontMaterialInput.roughness.value = activeObject.frontMaterial.roughness || 0;
            this.frontMaterialInput.metalness.value = activeObject.frontMaterial.metalness || 0.5;
            this.frontMaterialInput.useLight.value = activeObject.frontMaterial.useLight === undefined ? true : activeObject.frontMaterial.useLight;
            this.frontMaterialInput.useEnv.value = activeObject.frontMaterial.useEnv === undefined ? true : activeObject.frontMaterial.useEnv;
        }
        if (activeObject.sideMaterial) {
            this.sideMaterialInput.normalMap.value = activeObject.sideMaterial.normalMap || '';
            this.sideMaterialInput.originPath.value = activeObject.sideMaterial.texture.originPath || '';
            this.sideMaterialInput.thumbPath.value = activeObject.sideMaterial.texture.thumbPath || '';
            this.sideMaterialInput.roughness.value = activeObject.sideMaterial.roughness || 0;
            this.sideMaterialInput.metalness.value = activeObject.sideMaterial.metalness || 0.5;
            this.sideMaterialInput.useLight.value = activeObject.sideMaterial.useLight === undefined ? true : activeObject.sideMaterial.useLight;
            this.sideMaterialInput.useEnv.value = activeObject.sideMaterial.useEnv === undefined ? true : activeObject.sideMaterial.useEnv;
        }
    },
    methods: {
        changeEnvMap() {
            const { envMapInput } = this;
            const activeObject = this.getThreeObject();
            if (!activeObject) {
                return;
            }
            envMapInput.path.value = envMapInput.path.value.replace(/\\/, '/');
            activeObject.environmentMap = {
                path: envMapInput.path.value,
            };
            activeObject.dirty = true;
        },
        setRotation() {
            const activeObject = this.getThreeObject();
            if (!activeObject) {
                return;
            }
            activeObject.setRotation();
        },
        changeFrontMaterial() {
            const { frontMaterialInput } = this;
            const activeObject = this.getThreeObject();
            if (!activeObject) {
                return;
            }

            frontMaterialInput.normalMap.value = frontMaterialInput.normalMap.value.replace(/\\/, '/');
            frontMaterialInput.originPath.value = frontMaterialInput.originPath.value.replace(/\\/, '/');
            frontMaterialInput.thumbPath.value = frontMaterialInput.thumbPath.value.replace(/\\/, '/');

            activeObject.frontMaterial.normalMap = frontMaterialInput.normalMap.value || '';
            activeObject.frontMaterial.texture.originPath = frontMaterialInput.originPath.value || '';
            activeObject.frontMaterial.texture.thumbPath = frontMaterialInput.thumbPath.value || '';
            activeObject.frontMaterial.roughness = frontMaterialInput.roughness.value || 0.0;
            activeObject.frontMaterial.metalness = frontMaterialInput.metalness.value || 0.5;
            activeObject.frontMaterial.useLight = frontMaterialInput.useLight.value;
            activeObject.frontMaterial.useEnv = frontMaterialInput.useEnv.value;
            if (activeObject.frontMaterial.texture.originPath) {
                activeObject.frontMaterial.use = 'texture';
            } else {
                activeObject.frontMaterial.use = 'color';
            }
            activeObject.dirty = true;
        },
        changeSideMaterial() {
            const { sideMaterialInput } = this;
            const activeObject = this.getThreeObject();
            if (!activeObject) {
                return;
            }

            sideMaterialInput.normalMap.value = sideMaterialInput.normalMap.value.replace(/\\/, '/');
            sideMaterialInput.originPath.value = sideMaterialInput.originPath.value.replace(/\\/, '/');
            sideMaterialInput.thumbPath.value = sideMaterialInput.thumbPath.value.replace(/\\/, '/');

            activeObject.sideMaterial.normalMap = sideMaterialInput.normalMap.value || '';
            activeObject.sideMaterial.texture.originPath = sideMaterialInput.originPath.value || '';
            activeObject.sideMaterial.texture.thumbPath = sideMaterialInput.thumbPath.value || '';
            activeObject.sideMaterial.roughness = sideMaterialInput.roughness.value || 0.0;
            activeObject.sideMaterial.metalness = sideMaterialInput.metalness.value || 0.5;
            activeObject.sideMaterial.useLight = sideMaterialInput.useLight.value;
            activeObject.sideMaterial.useEnv = sideMaterialInput.useEnv.value;
            if (activeObject.sideMaterial.texture.originPath) {
                activeObject.sideMaterial.use = 'texture';
            } else {
                activeObject.sideMaterial.use = 'color';
            }
            activeObject.dirty = true;
        },
        exportMaterial() {
            const activeObject = this.getThreeObject();
            if (activeObject) {
                const { frontMaterial, sideMaterial, pointLights = [], openAmbientLight, directionLights = [], spotLights = [] } = activeObject;
                const tmpObject = {
                    frontMaterial,
                    sideMaterial,
                    pointLights,
                    openAmbientLight,
                    directionLights,
                    spotLights,
                };
                const text = JSON.stringify(tmpObject);
                Ktu.utils.copyText(text, res => {
                    if (res.success) {
                        this.$Notice.success('数据已复制到剪切板');
                    } else {
                        this.$Notice.error('数据复制失败');
                    };
                });
            }
        },
        exportAll() {
            const activeObject = this.getThreeObject();
            if (activeObject) {
                const text = JSON.stringify(activeObject.getAllInfo());
                Ktu.utils.copyText(text, res => {
                    if (res.success) {
                        this.$Notice.success('数据已复制到剪切板');
                    } else {
                        this.$Notice.error('数据复制失败');
                    };
                });
            }
        },
        addPointLight() {
            const activeObject = this.getThreeObject();
            if (activeObject) {
                const pointLight = {};
                const info = this.pointLightInput;
                pointLight.position = [info.x.value, info.y.value, info.z.value];
                pointLight.color = info.color.value;
                pointLight.intensity = info.intensity.value;
                pointLight.decay = info.decay.value;
                this.pointLights.push(pointLight);
                activeObject.pointLights = this.pointLights;
                activeObject.dirty = true;
            }
        },
        addDirectLight() {
            const activeObject = this.getThreeObject();
            if (activeObject) {
                const directLight = {};
                const info = this.directLightInput;
                directLight.position = [info.x.value, info.y.value, info.z.value];
                directLight.color = info.color.value;
                directLight.intensity = info.intensity.value;
                this.directionLights.push(directLight);
                activeObject.directionLights = this.directionLights;
                activeObject.dirty = true;
            }
        },
        addSpotLight() {
            const activeObject = this.getThreeObject();
            if (activeObject) {
                const spotLight = {};
                const info = this.spotLightInput;
                spotLight.position = [info.x.value, info.y.value, info.z.value];
                spotLight.color = info.color.value;
                spotLight.intensity = info.intensity.value;
                spotLight.distance = info.distance.value;
                spotLight.decay = info.decay.value;
                spotLight.penumbra = info.penumbra.value;
                spotLight.angle = info.angle.value;
                this.spotLights.push(spotLight);
                activeObject.spotLights = this.spotLights;
                activeObject.dirty = true;
            }
        },
        deletePointLight(index) {
            const activeObject = this.getThreeObject();
            if (activeObject) {
                this.pointLights.splice(index, 1);
                activeObject.pointLights = this.pointLights;
                activeObject.dirty = true;
            }
        },
        deleteDirectLight(index) {
            const activeObject = this.getThreeObject();
            if (activeObject) {
                this.directionLights.splice(index, 1);
                activeObject.directionLights = this.directionLights;
                activeObject.dirty = true;
            }
        },
        deleteSpotLight(index) {
            const activeObject = this.getThreeObject();
            if (activeObject) {
                this.spotLights.splice(index, 1);
                activeObject.spotLights = this.spotLights;
                activeObject.dirty = true;
            }
        },
        getThreeObject() {
            if (this.activeObject && this.activeObject.type == 'threeText') {
                return this.activeObject;
            }
            let activeObject = null;
            let hasGetEle = false;
            Ktu.selectedTemplateData.objects.forEach(item => {
                if (hasGetEle) {
                    return;
                }
                if (item && item.type == 'threeText') {
                    hasGetEle = true;
                    activeObject = item;
                }
            });
            if (!activeObject && !this.hasTips) {
                this.hasTips = true;
                this.$Notice.error('先添加3D文本');
            }
            return activeObject;
        },
    },
    computed: {
        openHelper: {
            get() {
                return Ktu.isOpenLightHelper;
            },
            set(value) {
                Ktu.isOpenLightHelper = value;
                const activeObject = this.getThreeObject();
                if (!activeObject) {
                    return;
                }
                activeObject.dirty = true;
            },
        },
        openAxesHelper: {
            get() {
                return Ktu.isOpenAxesHelper;
            },
            set(value) {
                Ktu.isOpenAxesHelper = value;
                const activeObject = this.getThreeObject();
                if (!activeObject) {
                    return;
                }
                activeObject.dirty = true;
            },
        },
        openAmbientLight: {
            get() {
                const activeObject = this.getThreeObject();
                if (!activeObject) {
                    return false;
                }
                return activeObject.openAmbientLight;
            },
            set(value) {
                const activeObject = this.getThreeObject();
                if (!activeObject) {
                    return;
                }
                activeObject.openAmbientLight = value;
                activeObject.dirty = true;
            },
        },
    },
});
