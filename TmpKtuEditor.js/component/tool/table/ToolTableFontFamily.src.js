Vue.component('tool-table-font-family', {
    mixins: [Ktu.mixins.dataHandler, Ktu.mixins.popupCtrl],
    props: {
        eventType: {
            type: [String, Number],
        },
    },
    template: `<div class="tool-box FontDrop-menu" :class="{opened: isShow}">
                    <div class="tool-btn btn-word" v-touch-ripple>
                        <span class="tool-btn-word" style="width: 90px;" @click="show">
                            {{fontLabel}}
                        </span>
                        <div class="tool-btn-arrow" @click="show">
                            <svg class="tool-btn-arrow-svg">
                                <use xlink:href="#svg-tool-arrow"></use>
                            </svg>
                        </div>
                    </div>
                    <transition :name="transitionName">

                        <div v-if="isShow" class="FontDrop-menu-popup scroll left" :class="{'reverseX': isNeedReverseX, 'reverseY': isNeedReverseY}"  ref="popup">
                            <Popover :config="popoverConfig"/>
                            <div class="fontFamilySelect">
                                <div class="CNFont" @click="changeFontDrop" :class="{selected: fontType == 0}">
                                    <span class="selected"></span>
                                    <span>{{typeName[0]}}</span>
                                </div>
                                <span class="line"></span>
                                <div class="ENGFont" @click="changeFontDrop" :class="{selected: fontType == 1}">
                                    <span class="selected"></span>
                                    <span>{{typeName[1]}}</span>
                                </div>
                            </div>

                            <div class="fontDropAll" @scroll="optionsScroll" :style="dropStyle">
                                <div class="optionsContainer">
                                    <div class="themeFont">
                                        <p>主题字体</p>
                                        <ul>
                                            <li
                                                class="FontDrop-menu-option"
                                                v-for="themeCategory in themeOptions"
                                                :class="{selected: themeCategory.fontid === fontId}"
                                                @click="selectFontFamily(themeCategory.fontid)"
                                                @mouseenter="showTips($event,fontListObject[themeCategory.fontid].isCharge)"
                                                @mouseleave="hideTips"
                                                >
                                                <svg class="FontDrop-menu-pic">
                                                    <use :xlink:href="'#svg-font-'+themeCategory.fontid"></use>
                                                </svg>
                                                <span class="sign" :style="{background:chargeConfig[fontListObject[themeCategory.fontid].isCharge].color}">{{chargeConfig[fontListObject[themeCategory.fontid].isCharge].text}}</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div class="FontDrop-menu-options" ref="options" id="optionsBox">
                                        <ul class="FontDrop-menu-category">
                                            <li class="FontDrop-menu-option"
                                                v-for="(option,index) in tmpOptions[fontDropTpye==3?fontType : fontDropTpye]"
                                                :class="{selected: option.value === fontId || option.value === fontParentId,split:option.isSplit,hoverChild: option.value === hoverId}"
                                                @click="!option.isSplit && selectFontFamily(option.value)"
                                                v-if="!(option.isSplit && !option.showSplit)"
                                                @mouseenter="showTips($event,option.isCharge,option)"
                                                @mouseleave="hideTips"
                                            >
                                                <div v-if="option.isSplit && option.showSplit" class="splitTitle">
                                                    <hr/>
                                                    <div class="fontSelect">
                                                        <p>{{option.text}}<span :class="{'active':isShowPopover && $index == index}" @click.stop="showPopover($event,option.type,index)">
                                                            <svg v-if="isShowPopover" class="FontDrop-menu-option-tip">
                                                                <use xlink:href="#svg-fontDrop-hoverTip"></use>
                                                            </svg>
                                                            <svg v-else class="FontDrop-menu-option-tip">
                                                                <use xlink:href="#svg-fontDrop-tip"></use>
                                                            </svg>

                                                        </span></p>
                                                    </div>
                                                </div>
                                                <div v-else-if="option.pic" class="svgBox">
                                                    <svg class="FontDrop-menu-pic">
                                                        <use :xlink:href="'#svg-'+option.pic"></use>
                                                    </svg>
                                                    <span class="sign" :style="{background:chargeConfig[option.isCharge].color}" >{{chargeConfig[option.isCharge].text}}</span>
                                                </div>
                                                <div v-if="option.childList && option.childList.length>0" class="FontDrop-menu-option-icon">
                                                    <svg class="FontDrop-menu-option-Arrow">
                                                        <use xlink:href="#svg-fontDrop-Arrow"></use>
                                                    </svg>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div class="tipsBox" ref="tipsBox" v-show="isShowTips">
                                {{tipsText}}
                            </div>
                            <div ref="fontChildPopup" class="FontDrop-option-child" :style="{top:childPopupTop,opacity:childPopupOpa}" >
                                <ul class="FontDrop-menu-childOption-category" v-show="option.value == hoverId" v-for="(option,index) in childFontArr" >
                                    <li class="FontDrop-menu-childOption"
                                        :class="{selected: childOption.value === fontId,split:childOption.isSplit}"
                                        v-for="(childOption,childIndex) in option.childList"
                                        @click="!childOption.isSplit && selectFontFamily(childOption.value)"
                                    >
                                        <svg class="FontDrop-menu-childOption-pic">
                                            <use :xlink:href="'#svg-'+childOption.pic"></use>
                                        </svg>
                                    </li>
                                </ul>
                            </div>
                        </div>


                    </transition>
                </div>`,
    data() {
        return {
            fontFaimlyList: Ktu.config.tool.options.fontFaimlyList,
            fontDropTpye: 3,
            isShowTips: false,
            tipsText: '',
            /* 0：代表可商用，1代表有限商用，2代表需要授权，3代表凡科字体
               text:代表标签块，color代表标签块颜色，title代表弹窗的题目，content代表弹窗的内容，splitConfig代表每个分割线的配置   //键值为排序顺序  0 -可商用 1有限商用 2需要授权 3 凡科专属 */
            chargeKeySort: [0, 3, 1, 2],
            chargeConfig: {
                0: {
                    text: '可商用',
                    color: '#39D888',
                    title: '免费字体',
                    content: '字体厂商或个人设计师向全社会开放授权，可免费商用。',
                    splitConfig: {
                        isSplit: true,
                        showSplit: true,
                        text: '免费字体',
                        type: 0,
                    },
                },
                1: {
                    text: '有限商用',
                    color: '#FF9900',
                    title: '有限商用字体',
                    content: '设计作品可在凡科网平台内（网站、H5、小程序等）商用，外部商用（淘宝、公众号、商业印刷等）需向字体厂商购买授权。',
                    tipsText: '该字体可在凡科网平台内商用；外部商用须购买授权。',
                    splitConfig: {
                        isSplit: true,
                        showSplit: true,
                        text: '有限商用字体',
                        type: 1,
                    },
                },
                2: {
                    text: '需授权',
                    color: '#FF3F3F',
                    title: '需授权字体',
                    content: '设计作品若用于商业用途，需向字体厂商购买授权。',
                    tipsText: '该字体若商用须向字体公司购买授权。',
                    splitConfig: {
                        isSplit: true,
                        showSplit: true,
                        text: '需授权字体',
                        type: 2,
                    },
                },
                3: {
                    text: '可商用',
                    color: '#39D888',
                    title: '凡科网臻享字体',
                    content: '臻享字体是凡科网已向字体厂商购买授权，提供给用户在凡科网平台免费使用的正版字体，设计作品可商用于网站、小程序、H5、公众号、淘宝等内外部场景。',
                    splitConfig: {
                        isSplit: true,
                        showSplit: true,
                        text: '凡科网臻享字体',
                        type: 3,
                    },
                },

            },
            popoverConfig: {
                width: 202,
                title: '可商用字体',
                content: '设计作品可用于商业用途。',
            },
            $index: 0,
            hoverId: -1,
            typeName: ['中文', '英文', '所有'],
            themeOptions: [],
            childPopupTop: '',
            hasFontChild: [10, 14, 16, 17, 30, 45],
            fontParentId: -1,
            childPopupOpa: 0,

            popUpWidth: 202,
            popUpHeight: 372,
            dropStyle: {},
        };
    },
    watch: {
        isShow(isShow) {
            if (isShow) {
                if (this.isNeedReverseY && this.isNeedAlainTop && document.getElementById('toolBar')) {
                    this.isNeedReverseY = false;
                    this.dropStyle = {
                        height: `${this.clientHeight - document.getElementById('toolBar').getBoundingClientRect().top - 100}px`,
                    };
                }
                this.themeOptions = this.getThemeOptions();
            }
        },
    },
    computed: {
        isGroup() {
            return this.activeObject.type === 'multi' || this.activeObject.type === 'group';
        },
        fontId() {
            if (this.isGroup) {
                const {
                    objects,
                } = this.activeObject;
                const fontId = Number(objects[0].fontFamily.match(/ID_(\d+)RAN/)[1]);
                const isSame = objects.every(object => Number(object.fontFamily.match(/ID_(\d+)RAN/)[1]) === fontId);
                return isSame ? fontId : 0;
            }
            if (this.activeObject.selectedCell) {
                const {
                    object,
                } = this.activeObject.selectedCell;

                if (object.fontFamily) {
                    return Number(object.fontFamily.match(/ID_(\d+)RAN/)[1]);
                }
            }
            return 0;
        },
        fontLabel() {
            return this.fontId ? _.find(this.fontFaimlyList, fontFamily => fontFamily.value === this.fontId).label : '字体';
        },
        fontType() {
            if ($(this.$refs.popup).find('.fontFamilySelect').length && $(this.$refs.popup).find('.fontFamilySelect .selected').length == 0) {
                return 2;
            }
            this.fontDropTpye = 3;
            if (this.isGroup) {
                const {
                    objects,
                } = this.activeObject;
                const ftFamilyList = objects[0].ftFamilyList[0];
                const fontType = ftFamilyList ? Number(ftFamilyList.fonttype) : 0;
                const isSame = objects.every(object => {
                    const ftFamilyList = object.ftFamilyList[0];
                    const objectFontType = ftFamilyList ? Number(ftFamilyList.fonttype) : 0;
                    return objectFontType === fontType;
                });
                return isSame ? fontType : 2;
            }

            let ftFamilyList;
            if (this.selectedData.selectedCell) {
                ftFamilyList = this.selectedData.selectedCell.object.ftFamilyList[0];
            }
            return ftFamilyList && ftFamilyList.fonttype !== undefined ? Number(ftFamilyList.fonttype) : 0;
        },
        fontListObject() {
            const obj = {};
            this.fontFaimlyList.forEach((item, index) => {
                item.value ? obj[item.value] = item : '';
            });
            return obj;
        },
        SYHTFontObj() {
            const fontList10 = this.fontFaimlyList.filter((e, i) => e.parent == 10);
            let fontObj10 = this.fontFaimlyList.filter((e, i) => e.value == 10)[0];
            fontObj10 = Object.assign({}, fontObj10);
            fontObj10.childList = fontList10;
            fontObj10.idList = [];
            fontList10.forEach((e, i) => {
                fontObj10.idList.push(e.value);
            });
            return fontObj10;
        },
        SYSTFontObj() {
            const fontList30 = this.fontFaimlyList.filter((e, i) => e.parent == 30);
            let fontObj30 = this.fontFaimlyList.filter((e, i) => e.value == 30)[0];
            fontObj30 = Object.assign({}, fontObj30);
            fontObj30.childList = fontList30;
            fontObj30.idList = [];
            fontList30.forEach((e, i) => {
                fontObj30.idList.push(e.value);
            });
            return fontObj30;
        },
        YRDZSTFontObj() {
            const fontList45 = this.fontFaimlyList.filter((e, i) => e.parent == 45);
            let fontObj45 = this.fontFaimlyList.filter((e, i) => e.value == 45)[0];
            fontObj45 = Object.assign({}, fontObj45);
            fontObj45.childList = fontList45;
            fontObj45.idList = [];
            fontList45.forEach((e, i) => {
                fontObj45.idList.push(e.value);
            });
            return fontObj45;
        },
        ALBBFontObj() {
            const fontList14 = this.fontFaimlyList.filter((e, i) => e.parent == 14);
            let fontObj14 = this.fontFaimlyList.filter((e, i) => e.value == 14)[0];
            fontObj14 = Object.assign({}, fontObj14);
            fontObj14.childList = fontList14;
            fontObj14.idList = [];
            fontList14.forEach((e, i) => {
                fontObj14.idList.push(e.value);
            });
            return fontObj14;
        },
        ALBBItalicFontObj() {
            const fontList16 = this.fontFaimlyList.filter((e, i) => e.parent == 16);
            let fontObj16 = this.fontFaimlyList.filter((e, i) => e.value == 16)[0];
            fontObj16 = Object.assign({}, fontObj16);
            fontObj16.childList = fontList16;
            fontObj16.idList = [];
            fontList16.forEach((e, i) => {
                fontObj16.idList.push(e.value);
            });
            return fontObj16;
        },
        ALBBEngFontObj() {
            const fontList17 = this.fontFaimlyList.filter((e, i) => e.parent == 17);
            let fontObj17 = this.fontFaimlyList.filter((e, i) => e.value == 17)[0];
            fontObj17 = Object.assign({}, fontObj17);
            fontObj17.childList = fontList17;
            fontObj17.idList = [];
            fontList17.forEach((e, i) => {
                fontObj17.idList.push(e.value);
            });
            return fontObj17;
        },
        childFontArr() {
            return [this.SYHTFontObj, this.SYSTFontObj, this.YRDZSTFontObj, this.ALBBFontObj, this.ALBBItalicFontObj, this.ALBBEngFontObj];
        },
        fontFaimlyListRepeat() {
            // const newFontFamilyList = [];
            const fontListOther = this.fontFaimlyList.filter((e, i) => e.parent == -1);
            fontListOther.forEach((e, i) => {
                if (e.value == 10) {
                    fontListOther.splice(i, 1, this.SYHTFontObj);
                } else if (e.value == 30) {
                    fontListOther.splice(i, 1, this.SYSTFontObj);
                } else if (e.value == 45) {
                    fontListOther.splice(i, 1, this.YRDZSTFontObj);
                } else if (e.value == 14) {
                    fontListOther.splice(i, 1, this.ALBBFontObj);
                } else if (e.value == 16) {
                    fontListOther.splice(i, 1, this.ALBBItalicFontObj);
                } else if (e.value == 17) {
                    fontListOther.splice(i, 1, this.ALBBEngFontObj);
                }
            });
            return fontListOther;
        },
        tmpOptions() {
            // typeLength = 指中文，英文等等种类的长度，chargeLength指字体权限的种类。//chargeKeySort 为charge排序
            const {
                chargeConfig,
                chargeKeySort,
            } = this;
            const obj = {};
            const result = {};
            const typeLength = this.typeName.length;
            for (let i = 0; i < typeLength; i++) {
                obj[i] = {};
                result[i] = [];
                Object.keys(chargeConfig).forEach(j => {
                    obj[i][j] = [];
                });
            }
            // let  CN_canUse = [],CN_lmtUse = [],CN_needAut = [],EN_canUse = [],EN_lmtUse = [],EN_needAut = [];
            this.fontFaimlyListRepeat.forEach((item, index) => {
                obj[item.type][item.isCharge].push(item);
                obj[typeLength - 1][item.isCharge].push(item);

                if (item.idList && item.idList.indexOf(this.fontId) > -1) {
                    this.fontParentId = item.value;
                }
            });
            Object.keys(obj).forEach(i => {
                for (let j = 0; j < chargeKeySort.length; j++) {
                    result[i] = result[i].concat(
                        obj[i][chargeKeySort[j]].length ? chargeConfig[chargeKeySort[j]].splitConfig : {
                            isSplit: true,
                        }, obj[i][chargeKeySort[j]]
                    );
                }
            });
            return result;
        },
        /* fontParentId: function(){
           this.fontFaimlyListRepeat.forEach((item,index)=> { */

        /* if(item.idList && item.idList.indexOf(this.fontId) > -1){
           return item.value;
           // console.log(this.fontParentId)
           }
           });
           }, */
        isShowPopover() {
            return this.$store.state.data.isShowPopover;
        },
    },
    beforeDestroy() {
        this.$store.commit('data/changeState', {
            prop: 'isShowPopover',
            value: false,
        });
    },

    methods: {
        // 获取当前所使用的字体
        getThemeOptions() {
            return this.selectedTemplateData.objects.reduce((result, object) => {
                if (object.type === 'group') {
                    object.objects.forEach(obj => {
                        if (obj.type === 'textbox' && obj.ftFamilyList && obj.ftFamilyList[0] && obj.ftFamilyList[0].fontid) {
                            if (!result.some(item => obj.ftFamilyList[0].fontid === item.fontid)) {
                                result.push(obj.ftFamilyList[0]);
                            }
                        } else if (object.type === 'table' && object.msg.ftFamilyList && object.msg.ftFamilyList[0] && object.msg.ftFamilyList[0].fontid) {
                            if (!result.some(item => object.msg.ftFamilyList[0].fontid === item.fontid)) {
                                result.push(object.msg.ftFamilyList[0]);
                            }
                        }
                    });
                } else {
                    if (object.type === 'textbox' && object.ftFamilyList && object.ftFamilyList[0] && object.ftFamilyList[0].fontid) {
                        if (!result.some(item => object.ftFamilyList[0].fontid === item.fontid)) {
                            result.push(object.ftFamilyList[0]);
                        }
                    } else if (object.type === 'table' && object.msg.ftFamilyList && object.msg.ftFamilyList[0] && object.msg.ftFamilyList[0].fontid) {
                        object.msg.tableData.dataList.forEach(row => {
                            row.forEach((cell => {
                                if (!result.some(item => cell.ftFamilyList[0].fontid === item.fontid)) {
                                    result.push(cell.ftFamilyList[0]);
                                }
                            }));
                        });
                    }
                }
                return result;
            }, []);
        },
        // 设置方位
        setPosition(ev, el) {
            const slef = $(ev.target);
            const eLeft = $(el).offset().left;
            const eTop = $(el).offset().top;
            return {
                left: (slef.offset().left - eLeft) + slef.width() + 10,
                top: slef.offset().top - eTop - 2,
            };
        },
        hideTips() {
            this.tipsText = '';
            this.isShowTips = false;
            // this.hoverId = -1;
        },
        // 显示下方提示框
        showTips(event, type, opt) {
            if (type === undefined) return;
            this.tipsText = this.chargeConfig[type].tipsText;
            if (this.tipsText) {
                this.isShowTips = true;
            }
            if (opt && opt.childList && opt.childList.length > 0) {
                this.hoverId = opt.value;
                const childPosition = this.setPosition(event, $('.FontDrop-menu-popup'));
                // this.childPopupTop = childPosition.top + 'px';
                this.$nextTick(() => {
                    if (this.$refs.popup && this.$refs.popup.offsetHeight < this.$refs.fontChildPopup.offsetHeight + childPosition.top) {
                        this.childPopupTop = `${this.$refs.popup.offsetHeight - this.$refs.fontChildPopup.offsetHeight - 2}px`;
                    } else {
                        this.childPopupTop = `${childPosition.top}px`;
                    }
                    this.childPopupOpa = 1;
                });
            } else {
                this.hoverId = -1;
                this.childPopupTop = '180px';
                this.childPopupOpa = 0;
            }
            /* console.log(this.refs)
               console.log(this.setPosition(event,$('.FontDrop-menu-popup'))) */
        },
        close() {
            this.$store.commit('data/changeState', {
                prop: 'isShowPopover',
                value: false,
            });
        },
        showPopover(event, type, index) {
            if (this.isShowPopover) {
                return this.close();
            }
            this.popoverConfig = Object.assign(this.popoverConfig, this.chargeConfig[type], this.setPosition(event, $('.FontDrop-menu-popup')));
            this.$store.commit('data/changeState', {
                prop: 'isShowPopover',
                value: true,
            });
            this.$index = index;
        },
        optionsScroll() {
            this.close();
        },
        /* optionsScroll(event){
            this.close();
            this.scrollLi = this.scrollLi || $('.FontDrop-menu-option').height();
            // this.scrollHeight = this.scrollHeight || $('.fontDropAll').height();
            // this.scrollContainerHeight = this.scrollContainerHeight || $('.fontDropAll .optionsContainer').height();
            // $(this.$refs.options).css({'transform':'translateY(500px)'});
            //this.process(()=>{
                // $('.yourSelector').css('transform').replace(/[^0-9\-,]/g,'').split(',')[5];
            //},100)
            let scrollPath = $('.fontDropAll').scrollTop();
            if(event.wheelDeltaY>0){
                scrollPath -= this.scrollLi;
            }else{
                scrollPath += this.scrollLi;
            }
           // if(scrollPath>(this.scrollContainerHeight - this.scrollHeight) || scrollPath<0){
            //    return false;
            //}
            $('.fontDropAll').scrollTop(scrollPath);
            // $('.scroll-bar-box').css({'top':scrollPath+'px'});
        },*/
        /* bindEditExit: function() {
           let selectedData = Ktu.canvas.getActiveObjectInGroup() || Ktu.canvas.getActiveObject();
           if (selectedData) {
           let listeners = selectedData.__eventListeners;
           if (!listeners || !listeners['editing:exited'] || !listeners['editing:exited'].length) {
           let ajustFontFamily = () => {
           if (selectedData) {
           let ftFamilyList = selectedData.ftFamilyList;
           let text = selectedData.text;
           if (ftFamilyList && ftFamilyList.length && text !== ftFamilyList[0].con) {
           this.selectFontFamily(ftFamilyList[0].fontid, true);
           }
           }
           }
           selectedData.on('editing:exited', ajustFontFamily);
           }
           } */

        /* },
           bindTextChanged: _.throttle(function() {
           this.$store.commit('data/changeState', {
           prop: 'needCheckStep',
           value: true
           });
           }, 5000), */
        selectFontFamily(id, isAvoidSaveState) {
            let isFontFamily = true;
            if (this.hasFontChild.indexOf(id) > -1) {
                isFontFamily = false;
            } else {
                this.fontParentId = -1;
            }
            let textType = 0;
            this.fontFaimlyList.some((fontFamily, index) => {
                if (id === fontFamily.value) {
                    textType = fontFamily.type;
                    return true;
                }
                return false;
            });
            const cookies = `&_FSESSIONID=${$.cookie('_FSESSIONID')}`;
            this.activeObject.saveState();
            if (isFontFamily) {
                if (this.isGroup) {
                    const {
                        objects,
                    } = this.activeObject;
                    const promises = objects.reduce((promiseList, object) => {
                        const substring = _.uniq(object.text).join('');
                        const fontUrl = `/font.jsp?type=${textType}&id=${id}${cookies}&v=${Math.random()}`;
                        const fontPromise = new Promise((resolve, reject) => {
                            const startTime = Date.now();
                            axios.post(fontUrl, {
                                substring: encodeURIComponent(JSON.stringify(substring)),
                            }, {
                                responseType: 'arraybuffer',
                            }).then(response => {
                                if (response) {
                                    const fontFamily = `ktu_Font_TYPE_${textType}_ID_${id}RAN_${parseInt(new Date().getTime(), 10)}`;
                                    const fontFace = new FontFace(fontFamily, response.data);
                                    fontFace.load().then(loadedFace => {
                                        document.fonts.add(loadedFace);
                                        object.fontFamily = fontFamily;
                                        const fontFaceId = (object.ftFamilyList && object.ftFamilyList[0] && object.ftFamilyList[0].fontFaceId) || '';
                                        object.ftFamilyList = [];
                                        object.ftFamilyList.push({
                                            con: substring,
                                            fontFaceId,
                                            fontid: id,
                                            fonttype: textType,
                                            fontfamily: fontFamily,
                                            tmp_fontface_path: fontUrl,
                                            hasLoaded: true,
                                        });
                                        object.ftFamilListChg = 1;
                                        object.hasChanged = true;
                                        object.dirty = true;
                                        object.setCoords();
                                        this.logLoadFontFamilyTime(startTime);
                                        resolve();
                                    });
                                    object.fontBase64 = object.transformArrayBufferToBase64(response.data);
                                }
                            });
                        });
                        promiseList.push(fontPromise);
                        return promiseList;
                    }, []);
                    Promise.all(promises).then(() => {
                            this.activeObject.modifiedState();
                            this.updateGroup();
                        })
                        .catch(e => {
                            console.log(e);
                        });
                } else {
                    const fontFamily = `ktu_Font_TYPE_${textType}_ID_${id}RAN_${parseInt(new Date().getTime(), 10)}`;
                    const {
                        selectedData,
                    } = this;
                    const substring = _.uniq(selectedData.getSubString()).join('');
                    const fontUrl = `/font.jsp?type=${textType}&id=${id}${cookies}`;
                    selectedData.msg.ftFamilListChg = 1;
                    const fontFaceId = (selectedData.msg.ftFamilyList && selectedData.msg.ftFamilyList[0] && selectedData.msg.ftFamilyList[0].fontFaceId) || '';
                    selectedData.msg.ftFamilyList = [];
                    selectedData.msg.ftFamilyList.push({
                        con: substring,
                        fontFaceId,
                        fontid: id,
                        fonttype: textType,
                        fontfamily: fontFamily,
                        tmp_fontface_path: fontUrl,
                        hasLoaded: true,
                    });
                    selectedData.msg.fontFamily = fontFamily;
                    this.activeObject.modifiedState();
                    const startTime = Date.now();
                    axios.post(fontUrl, {
                        substring: encodeURIComponent(JSON.stringify(substring)),
                    }, {
                        responseType: 'arraybuffer',
                    }).then(response => {
                        if (response) {
                            const fontFace = new FontFace(fontFamily, response.data);
                            fontFace.load().then(loadedFace => {
                                document.fonts.add(loadedFace);
                                /* selectedData.hasChanged = true;
                                       selectedData.dirty = true;
                                       selectedData.setCoords(); */
                                this.updateGroup();
                            });

                            selectedData.msg.fontBase64 = selectedData.transformArrayBufferToBase64(response.data);
                            this.logLoadFontFamilyTime(startTime);
                            selectedData.dirty = true;
                        }
                    });
                }
            }
            if (this.eventType) {
                Ktu.log(this.eventType, 'fontFamily');
            } else {
                Ktu.log(this.activeObject.type, 'fontFamily');
            }
            Ktu.simpleLog('useFontFamily', id);
            /* if(this.selectedData.group){
               Ktu.log('group', 'fontFamily');
               }else{
               Ktu.log('textbox', 'fontFamily');
               } */
        },
        logLoadFontFamilyTime(startTime) {
            let timeOffset = Math.ceil((Date.now() - startTime) / 1000);
            timeOffset = timeOffset <= 10 ? timeOffset : 11;
            Ktu.simpleLog('loadFontFamily', timeOffset);
        },
        changeFontDrop(event) {
            if ($(event.target).hasClass('selected')) {
                $(event.target).removeClass('selected');
                this.fontDropTpye = 2;
            } else {
                $(event.target).addClass('selected');
                if ($(event.target).siblings('div')
                    .hasClass('selected')) {
                    $(event.target).siblings('div')
                        .removeClass('selected');
                }
                if ($(event.target).hasClass('ENGFont')) {
                    this.fontDropTpye = 1;
                } else {
                    this.fontDropTpye = 0;
                }
            }
        },
        /* scrollIntoView() {
           //搜狗浏览器 scrollIntoView 有bug
           this.$nextTick(() => {
           if(this.$refs.selectedOption && this.$refs.selectedOption.length) {
           let offsetTop = this.$refs.selectedOption[0].offsetTop;
           Ktu.utils.scrollTop(this.$refs.options,this.$refs.options.scrollTop || 0,offsetTop);
           }
           });
           },
           fontFamilyWheel: function(event) {
           let fontFamily = this.$refs.fontFamily;
           if (fontFamily.isShow) {
           let direction = event.deltaY > 0 ? true : false;
           let nowFontFamily = null;
           this.fontFaimlyList.some((item) => {
           if (item.value == this.fontId) {
           nowFontFamily = item;
           return true;
           }
           });
           let nowIndex = this.fontFaimlyList.indexOf(nowFontFamily); */

        /* //判断界限
           if ((nowIndex == 0 && !direction) || (nowIndex == this.fontFaimlyList.length - 1 && direction)) return; */

        /* let nextFontFamily = direction ? this.fontFaimlyList[nowIndex + 1] : this.fontFaimlyList[nowIndex - 1];
           this.selectFontFamily(nextFontFamily.value);
           setTimeout(function() {
           fontFamily.scrollIntoView();
           }, 1000);
           }
           }, */

    },
});