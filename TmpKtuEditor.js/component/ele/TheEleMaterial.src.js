Vue.component('ele-material', {
    template: `
    <div class="ele-material page" :class="{active : activeChoose}">
        <div class="container" @scroll="scrollLoad" @mousewheel="mousewheelshow" ref="container">
            <div class="material-frame" :class="[switchFrame ? switchFrame : 'initFrame']" v-show="materialFrameShow&&activeItem.type!='collection'&&isFirstSearch">
                <div class="search-input-btn" @click="searchFrameFun">
                    <svg class="search-input-btn-icon">
                        <use xlink:href="#svg-ele-search-input"></use>
                    </svg>
                    <svg class="back-input-btn-icon">
                        <use xlink:href="#svg-ele-search-back"></use>
                    </svg>
                </div>
                <div class="frame-search-box">

                    <validate-input
                        placeholder="输入关键词搜索素材"
                        class="frame-search nav-title-input"
                        @keyup.enter.native="search(false)"
                        v-model="searchVal"
                        :inputVal="searchVal"
                        @focus="focusInput"
                        @onInput="changeData"
                        style="width:270px"
                        >
                    </validate-input>

                    <div class="input-mask"></div>
                    <svg class="frame-search-icon" @click="search">
                        <use xlink:href="#svg-ele-search-input"></use>
                    </svg>
                </div>
                <div class="theme-selector" :class="{opened: isShow}" @click="showList">
                    <p v-show="activeTopicIndex == -1" class="material-type-text">全部</p>
                    <p v-show="activeTopicIndex == item.key" v-for="(item,index) in materialTopic" class="material-type-text">{{item.name}}</p>
                    <div class="theme-selector-svg">
                        <svg class="theme-selector-arrow">
                            <use xlink:href="#svg-tool-btn"></use>
                        </svg>
                    </div>

                </div>
                <div v-if="isShow" class="material-type-box">
                    <div v-touch-ripple rippleColor="#ff7733" class="material-topic-item" :class="{active : activeTopicIndex == -1, deleteBackground: deleteBackground}" @click="chooseTopic(-1)" @mousedown="delBackground" @mouseup="addBackground">全部</div>
                    <div v-touch-ripple rippleColor="#ff7733" class="material-topic-item" :class="{active : activeTopicIndex == item.key}" @click="chooseTopic(item.key)" v-for="(item,index) in materialTopic" :key="index" v-text="item.name"></div>
                </div>
                <div class="frame-remove" @click="removeFrame">
                    <svg class="frame-remove-icon">
                        <use xlink:href="#svg-ele-search-clear"></use>
                    </svg>
                </div>
            </div>

             <div class="search-input-box">

                <button class="input-box-back" :class="!isFirstSearch ? 'is-transform-left' : ''" @click="hideBack(true)">
                    <span class="left-arrow">
                        <svg class="svg-icon">
                            <use xlink:href="#svg-left-arrow"></use>
                        </svg>
                    </span>
                    <span class="input-box-text">
                        返回
                    </span>
                </button>

                <validate-input
                    placeholder="输入关键词搜索素材"
                    class="search-input nav-title-input"
                    @keyup.enter.native="search(false)"
                    @focus="focusInput"
                    @blur="blurInput"
                    @onInput="changeData"
                    v-model="searchVal"
                    :inputVal="searchVal"
                    style="width:270px"
                    :class="!isFirstSearch ? 'is-search-after': ''"
                >
                </validate-input>

                <svg v-if="isFirstSearch || ifFocusOfInput" class="search-input-icon" @click="search">
                    <use xlink:href="#svg-ele-search-input"></use>
                </svg>
                <svg v-else class="search-input-icon" @click="hideBack(true)">
                    <use xlink:href="#svg-ele-search-clear"></use>
                </svg>

                <transition name="template-slide-up">
                    <div class="template-history" v-show="historyList.length > 0 && ifFocusOfInput" tabindex="-1" @focus="showHistory" @blur="hideHistory">
                        <div class="template-history-header">
                            <span class="sreach-history">历史搜索</span>
                            <span class="emty-history" @click="clearLastest">清空记录</span>
                        </div>
                        <div class="template-history-content">
                            <div class="history-item" v-for="(item, index) of historyList" @click="changeSearchVal(item)">
                                {{item}}
                            </div>
                        </div>
                    </div>
                </transition>

                <div class="search-type-box" v-show="!isFirstSearch">
                    <div class="search-type-item" :class="typeSearchActive === index ? 'active' : '' "
                        v-for="(item ,index) of searchTypeList"
                        :key="index"
                        @click="searchByType(item, index)"
                    >
                        <span class="search-type-item-title">{{item.label}}</span>
                    </div>
                    <div class="search-type-item-back" :style="itemStyle"></div>
                </div>

                <div class="history-loading" v-show="!isFirstSearch && isLoading">
                    <loading></loading>
                </div>

                <div v-if="searchDataList.length === 0 && !isFirstSearch && !isLoading" class="no-search-template">
                    <div class="no-result-image">
                    </div>
                    <div class="no-result-tips">
                        抱歉，没找到您想要的素材请修改关键词后再试
                    </div>
                    <button class="no-result-reback" @click="hideBack(false)">返回全部素材</button>
                </div>
            </div>


            <transition name="slide-up">
                <div class="search-group-box" ref="searchBox" :style="{height:waterFallHeightSearch + 'px'}" v-show="!isFirstSearch">
                    <div class="search-item-box"
                        v-for="(item,index) in showDataSearch"
                        :key="index" :class="materialClass(item.sourceData)"
                        :style="item.style"
                        @click="useWaterItem(item.sourceData, 1)"
                        @dragstart="dragStart($event, item.sourceData, 1)">
                        <div class="search-item-copyright-icon"
                            :class="{'other':copyrightArr.indexOf(item.sourceData.comeFrom) > 0,'nocopyright' : copyrightArr.indexOf(item.sourceData.comeFrom) < 0,'active' : item.sourceData.showCopyright}"
                            @click.stop
                            @mouseenter="hoverCopyrightBtn($event,item.sourceData)"
                            @mouseleave="wantToCloseInfo">
                        </div>
                        <div class="search-item-inner">
                            <img :src="waterItemImg(item)" class="search-item-img"/>
                            <div class="material-item-collection" @click.stop="changeCollectionState(item, 1, true)">
                                <svg class="svg-collection-have" v-if="item.sourceData.isCollect">
                                    <use xlink:href="#svg-collection-have"></use>
                                </svg>
                                <svg class="svg-collection-nohave" v-else>
                                    <use xlink:href="#svg-collection-have"></use>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
            <div v-show="hasLoadedSearchAll && searchDataList.length > 0 && !isLoading && !isFirstSearch" class="water-tip">
                <span class="water-tip-text">这是我的底线</span>
            </div>

            <div v-show="(showLine == -1 || lineIndex == showLine) && isFirstSearch" class="material-line" v-for="(lineItem,lineIndex) in materialType" :key="lineIndex">
                <div v-show="materialShow && !item.isSpecialShow"
                    class="material-type-box"
                    :class="{'material-type-box-active' : lineIndex == activeLineIndex && index == activeIndex}"
                    v-for="(item,index) in lineItem"
                    :key="index"
                    @click="chooseType(item,index,lineIndex)">
                    <div class="material-type-item" :class="['material-type-item-' + item.type]">
                        <svg class="material-type-svg">
                            <use :xlink:href="'#svg-material-'+item.type+'-'+theme"></use>
                        </svg>
                        <svg class="material-type-active-arrow" v-if="lineIndex == activeLineIndex && index == activeIndex && activeChoose">
                            <use xlink:href="#svg-material-active-arrow"></use>
                        </svg>
                    </div>
                    <div class="material-type-title" v-text="item.title"></div>

                </div>
                <transition name="slide-up">
                    <div v-if="activeChoose && activeLineIndex == lineIndex && activeItem.type=='collection'">
                        <div class="material-group-box" :class="materialGroupClass" ref="slide">
                            <div class="select-bar">
                                <div class="select-class-button" :class="searchOption==-1&&materialItem.length==0?'noData':''" v-show="!isManageCollection">
                                    {{searchOption==-1?'全部':(searchOption==0?'高清大图':(searchOption==1?'免抠PNG':(searchOption==20?'其他':'矢量素材')))}}
                                    <div class="select-class-triangle" :class="showOption?'active':''"></div>
                                    <div class="optionBox" :class="showOption?'active':''"  @mouseover="showOptions" @mouseout="hiddenOptions">
                                        <div class="select-class-options">
                                            <div v-for="item in selectOption" class="option" @click="changeSearchOption(item.type)">{{item.name}}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="select-manage-button" title="批量管理" :class="searchOption==-1&&materialItem.length==0?'noData':''" @click="enterManage" v-show="!isManageCollection">
                                        <svg class="select-manage-icon">
                                              <use xlink:href="#svg-ele-upload-setting"></use>
                                        </svg>
                                </div>
                                <ele-btn class="select-manage-all" :label="selectTip" @click="changeSelect" v-show="isManageCollection"></ele-btn>
                                <ele-btn class="select-manage-del" label="取消收藏" @click="delCollect" v-show="isManageCollection"></ele-btn>
                                <ele-btn class="select-manage-finish" label="完成管理" @click="finishManage" v-show="isManageCollection"></ele-btn>
                            </div>
                            <transition-group tag="div" name="sucai-material-show" class="material-item-box" :style="{height:waterFallHeight + 'px'}">
                                <div class="material-item" v-for="(item,index) in showData" :key="index+1" :index="index" @click="useWaterItem(item.sourceData,0)" :style="item.style" draggable="true" @dragstart="dragStart($event, item.sourceData,0)" >
                                    <!--<div class="material-item-copyright-icon" v-show="!isManageCollection" :class="{'other':copyrightArr.indexOf(item.sourceData.comeFrom) > 0,'nocopyright' : copyrightArr.indexOf(item.sourceData.comeFrom) < 0,'active' : item.sourceData.showCopyright}" @click.stop="showCopyrightInfo($event,item.sourceData)"></div>-->
                                    <div class="material-item-inner">
                                        <svg class="corner-mark"  v-if="isGifMaterial(item) && !isManageCollection">
                                            <use xlink:href="#svg-gif"></use>
                                        </svg>
                                        <img class="material-item-img" :src="waterItemImg(item)">
                                        <div class="material-item-collection" v-show="!isManageCollection" @click.stop="changeCollectionState(item.sourceData.resourceId, 0, false)">
                                            <svg class="svg-collection-have">
                                                <use xlink:href="#svg-collection-have"></use>
                                            </svg>
                                            <!--
                                            <svg class="svg-collection-nohave">
                                                <use xlink:href="#svg-collection-nohave"></use>
                                            </svg>-->
                                        </div>
                                        <div class="material-item-select" :class="chooseItemCollectionList.indexOf(item.sourceData.resourceId)!==-1?'choose':''" v-show="isManageCollection" @click.stop="selectCollection(item.sourceData.resourceId)">
                                            <svg>
                                                <use xlink:href="#svg-icon-ok"></use>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </transition-group>
                            <loading v-show="isLoading"></loading>
                            <!-- 分页 -->
                            <pagination v-show="showPagination" :nowPage="nowIndex" :totalSize="activeItemTotal" :itemLimit="materialGetLimit" :scrollLimit="scrollIndexLimit" @on-change="selectPageChange"></pagination>

                            <div v-show="hasLoadedAll && !showPagination&&materialItem.length!=0" class="water-tip">
                                <span class="water-tip-text">这是我的底线</span>
                            </div>
                            <div class="noData-tip" v-if="hasLoadedAll&&materialItem.length===0"  style="transform: translateZ(0)">
                                    <div class="tipInfo">还没有收藏的系统素材</div>
                            </div>
                        </div>
                    </div>
                    <div v-else-if="activeChoose && activeLineIndex == lineIndex" class="material-group-box" :class="materialGroupClass" ref="slide">
                        <div v-if="activeItem.type == 'line'" @click="addLineDash(item.strokeDashArray)"  draggable="true" @dragstart="dragStart($event, item,3)" class="lineDash" :key="'fixed'+index" v-for="(item,index) in fixedLineList">
                            <svg class="line-dash-svg">
                                <use :xlink:href="'#svg-line-dash-'+item.icon" ></use>
                            </svg>
                        </div>
                        <div v-if="activeItem.type == 'line'" @click="addLineDash(item.msg)"  draggable="true" @dragstart="dragStart($event, item,3)" :style="'height:'+item.height+'px;margin-top:16px;'" class="lineDash" :key="'fixed'+index" v-for="(item,index) in fixedLineArrow">
                            <svg class="line-dash-svg" :style="'height:'+item.height+'px'">
                                <use :xlink:href="'#svg-line-dash-'+item.icon" ></use>
                            </svg>
                        </div>
                        <div class="material-ktrq-tip-box" :class="{materialKtrqTipOpen:materialKtrqTipOpen}" v-if="activeItem.type=='box'">
                            <template v-if="!materialKtrqTipOpen">
                                <svg class="material-ktrq-tip-icon1">
                                    <use xlink:href="#svg-ktrq-use-tip"></use>
                                </svg>
                                <p class="material-ktrq-tip-content1">如何玩转图片容器？</p>
                                <div class="material-ktrq-tip-btn1" @click="materialKtrqTipOpen=true">查看</div>
                            </template>
                            <template v-if="materialKtrqTipOpen" >
                                <div class="material-ktrq-tip-gif" :class="{'material-ktrq-tip-gif2':materialKtrqTipType==2}"></div>
                                <p class="material-ktrq-tip-content2" v-if="materialKtrqTipType==1">从<span class="orange">“图片区域”</span>将图片素材拖入容器内</p>
                                <p class="material-ktrq-tip-content2" v-if="materialKtrqTipType==2" style="top:181px;">选中图片容器时<br>从<span class="orange">“画布区域”</span>将图片拖入容器内</p>
                                <div class="material-ktrq-tip-btn2" v-if="materialKtrqTipType==1" @click="materialKtrqTipType=2">下一个</div>
                                <div class="material-ktrq-tip-btn2" v-if="materialKtrqTipType==2" @click="materialKtrqTipType=1;materialKtrqTipOpen=false">我知道了</div>
                                <div class="material-ktrq-tip-dots">
                                    <span class="material-ktrq-tip-dot" v-for="dot in 2" :class="{active:materialKtrqTipType==dot}" @click="materialKtrqTipType=dot">{{dot}}</span>
                                </div>
                            </template>
                        </div>
                        <div v-show="materialShow" class="material-topic-item-box clearfix" :class="{'open-topic' :materialTopicOpen}" v-if="materialTopic.length > 0">
                            <div v-touch-ripple rippleColor="#ff7733" class="material-topic-item" :class="{active : activeTopicIndex == -1}" @click="chooseTopic(-1)">全部</div>
                            <div v-touch-ripple rippleColor="#ff7733" class="material-topic-item" :class="{active : activeTopicIndex == item.key}" @click="chooseTopic(item.key)" v-show="index < 8 || materialTopicOpen" v-for="(item,index) in materialTopic" :key="index" v-text="item.name"></div>
                            <div class="material-topic-item" v-show="materialTopic.length > showMaterialTopicLength" @click="materialTopicOpen = !materialTopicOpen" :title="materialTopicOpen?'收起':'展开'">
                                <svg class="material-type-svg">
                                    <use xlink:href="#svg-material-topic-switch"></use>
                                </svg>
                            </div>
                        </div>
                        <transition-group tag="div" name="sucai-material-show" class="material-item-box material-item-box-normal" :style="{height:waterFallHeight + 'px'}" >
                            <div class="material-item" :class="materialClass(item.sourceData)" v-for="(item,index) in showData" :key="index+1" :index="index" @click="useWaterItem(item.sourceData,1)" :style="item.style" draggable="true" @dragstart="dragStart($event, item.sourceData,1)" >
                                <div class="material-item-copyright-icon"
                                    @click.stop
                                    @mouseenter="hoverCopyrightBtn($event,item.sourceData)"
                                    @mouseleave="wantToCloseInfo">
                                    <svg class="svg-copyright nocopyright" v-if="copyrightArr.indexOf(item.sourceData.comeFrom) < 0">
                                        <use xlink:href="#svg-ele-cautious"></use>
                                    </svg>
                                    <svg class="svg-copyright other" v-else-if="copyrightArr.indexOf(item.sourceData.comeFrom) > 0">
                                        <use xlink:href="#svg-ele-finite"></use>
                                    </svg>
                                    <svg class="svg-copyright active" v-else>
                                        <use xlink:href="#svg-ele-free"></use>
                                    </svg>
                                </div>
                                <div class="material-item-inner">
                                    <img class="material-item-img" :src="waterItemImg(item)">
                                    <div class="material-item-collection" v-show="!isManageCollection" @click.stop="changeCollectionState(item, 1, false)">
                                            <svg class="svg-collection-have" v-if="item.sourceData.isCollect">
                                                <use xlink:href="#svg-collection-have"></use>
                                            </svg>
                                            <svg class="svg-collection-nohave" v-else>
                                                <use xlink:href="#svg-collection-have"></use>
                                            </svg>
                                        </div>
                                </div>
                            </div>
                        </transition-group>
                        <loading v-show="isLoading"></loading>
                        <!-- 分页 -->
                        <pagination v-show="showPagination" :nowPage="nowIndex" :totalSize="activeItemTotal" :itemLimit="materialGetLimit" :scrollLimit="scrollIndexLimit" @on-change="selectPageChange"></pagination>

                        <div v-show="hasLoadedAll && !showPagination" class="water-tip">
                            <span class="water-tip-text">这是我的底线</span>
                        </div>
                    </div>
                </transition>
            </div>
            <div class="ele-material-draw" v-if="isBtnVisible && isFirstSearch" @click="showDrawKeyboard">
                <svg class="ele-material-draw-icon">
                    <use xlink:href="#svg-material-draw"></use>
                </svg>
                快速绘制
            </div>


        </div>
        <div title="返回顶部" v-show="returnTopShow" class="returnTop" @click="returnTop">
            <svg class="ele-material-toTop">
                <use xlink:href="#new-back-top"></use>
            </svg>
        </div>
        <copyright v-if="showCopyright"
            @close="closeCopyrightInfo"
            @enter="enterCopyrightInfo"
            :item="activeMaterial"
            :position="copyrightPosition">
        </copyright>
    </div>
    `,
    name: 'eleMaterial',
    mixins: [Ktu.mixins.waterFall, Ktu.mixins.copyright, Ktu.mixins.popupCtrl, Ktu.mixins.Response, Ktu.mixins.textInContainer],
    directives: {
        transferDom: Ktu.directive.transferDom,
    },
    data() {
        return {
            // 激活 选择素材
            activeChoose: false,
            // 激活第几行
            activeLineIndex: 0,
            // 激活 行内第几个
            activeIndex: -1,
            // 当前记录到的素材ID
            logMaterialArrId: [],
            activeItem: null,
            activeItemTotal: 0,
            activeTopicIndex: -1,

            isLoading: false,
            hasLoadedAll: false,
            showPagination: false,
            materialKtrqTipOpen: false,
            materialKtrqTipType: 1,

            showOption: false,
            searchOption: -1,
            isManageCollection: false,
            chooseItemCollectionList: [],
            isAllSelect: false,
            selectTip: '全选',

            specialTopic: [23, 80, 81],
            materialType: [{
                title: '我的收藏',
                key: 8,
                type: 'collection',
            },
            {
                title: '图片',
                key: 0,
                type: 'pic',
            },
            {
                title: '免抠素材',
                key: 1,
                type: 'png',
            },
            {
                title: '矢量插图',
                key: 6,
                type: 'svg',
            },
            {
                title: '图片容器',
                key: 9,
                type: 'box',
            },
            {
                title: '文字容器',
                key: 5,
                type: 'banner',
            },
            {
                title: '装饰',
                key: 7,
                type: 'decoration',
            },
            {
                title: '线和箭头',
                key: 4,
                type: 'line',
            },
            {
                title: '形状',
                key: 3,
                type: 'shape',
            },
            {
                title: '图标',
                key: 2,
                type: 'icon',
            },
            {
                title: '内部素材',
                key: -3,
                type: 'inner',
                isSpecialShow: !Ktu._isInternalAcct,
            },
            ],
            selectOption: [{
                type: -1,
                name: '全部',
            },
            {
                type: 0,
                name: '高清大图',
            },
            {
                type: 1,
                name: '免抠PNG',
            },
            {
                type: 6,
                name: '矢量素材',
            },
            {
                type: 20,
                name: '其他',
            },
            ],
            fixedLineList: [{
                strokeDashArray: [0, 0],
                icon: 'one',
            },
            {
                strokeDashArray: [18, 6],
                icon: 'two',
            },
            {
                strokeDashArray: [6, 6],
                icon: 'three',
            },
            {
                strokeDashArray: [3, 6],
                icon: 'four',
            },
            {
                strokeDashArray: [8, 3, 3, 3],
                icon: 'five',
            },
            {
                strokeDashArray: [8, 3, 3, 3, 3, 3],
                icon: 'six',
            },
            {
                strokeDashArray: [12, 3, 6, 3],
                icon: 'seven',
            },
            {
                strokeDashArray: [3, 1],
                icon: 'eight',
            },
            ],
            fixedLineArrow: [{
                height: 30,
                icon: 'night',
                msg: {
                    arrowStyle: 'solid',
                    arrowEndpoint: {
                        left: false,
                        right: true,
                    },
                },
            },
            {
                height: 32,
                icon: 'ten',
                msg: {
                    arrowStyle: 'arrow',
                    arrowEndpoint: {
                        left: false,
                        right: true,
                    },
                },
            },
            {
                height: 32,
                icon: 'eleven',
                msg: {
                    arrowStyle: 'rectangle',
                    arrowEndpoint: {
                        left: true,
                        right: true,
                    },
                },
            },
            {
                height: 24,
                icon: 'twelve',
                msg: {
                    arrowStyle: 'circular',
                    arrowEndpoint: {
                        left: true,
                        right: true,
                    },
                },
            },
            ],
            materialTopic: [],
            materialItem: [],
            materialTopicOpen: false,
            nowIndex: 0,
            // 分页 每页获取数量
            materialGetLimit: 40,
            // 滚动加载 最多数量
            materialScrollLimit: 120,
            // 只显示当前类型所在行
            showLine: -1,
            materialFrameShow: false,
            searchFrameShow: false,
            returnTopShow: false,
            switchFrame: null,
            // 区分点击素材类型触发的滚动事件和鼠标滚动触发的滚动事件
            itemClick: false,
            materialShow: true,
            deleteBackground: false,
            // 记录删除素材数量，保证分页准确
            diffNumber: 0,
            lastestSearchs: [],
            searchTotal: 0,
            searchDataList: [],
            showDataSearch: [],
            // 列高度
            colHeightsSearch: [0, 0, 0],
            defaultHeightSearch: [0, 0, 0],
            waterFallHeightSearch: 0,
            propRatioSearch: [2, 3],
            maxDiffSearch: 20,
            minHeightSearch: 18,
            maxHeightSearch: 600,
            boxRectSearch: {
                bottom: 7,
                right: 7,
            },
            colWidthSearch: 86,
            ifFocusOfInput: false,
            isTimeOut: '',
            isFirstSearch: true,
            historyList: [],
            searchTypeList: [{
                label: '全部',
                type: -1,
                width: 48,
                left: 2,
                style: {
                    width: '48px',
                    left: '2px',
                },
            },
            {
                label: '高清大图',
                type: 2,
                width: 72,
                left: 50,
                style: {
                    width: '72px',
                    left: '52px',
                },
            },
            {
                label: '免抠PNG',
                type: 4,
                width: 74,
                left: 122,
                style: {
                    width: '74px',
                    left: '124px',
                },
            },
            {
                label: '矢量素材',
                type: 81,
                width: 72,
                left: 196,
                style: {
                    width: '72px',
                    left: '198px',
                },
            },
            ],
            typeSearchActive: 0,
            nowSearchIndex: 0,
            noResult: false,
            hasLoadedSearchAll: false,
            // debounceTimer: null,
            showMaterialTopicLength: 8,
            itemStyle: {},
            // isSearchDataCollect: false,
        };
    },
    watch: {
        /* materialFrameShow: {
           handler:function(value){
           if(value){
           $(this.$el).find('.material-item-box').scrollTop(30);
           }
           }
           } */
        /* materialTopicOpen(value) {
            this.logMaterialNav(value);
        },*/
        chooseItemCollectionList(newQuestion, oldQuestion) {
            if (newQuestion.length == this.materialItem.length && this.materialItem.length != 0) {
                this.isAllSelect = true;
                this.selectTip = this.isAllSelect ? '取消全选' : '全选';
            } else {
                this.isAllSelect = false;
                this.selectTip = this.isAllSelect ? '取消全选' : '全选';
            }
        },
        searchDataList() {
            // 实际显示的图片尺寸数组
            this.showDataSearch = [];
            // 计算元素显示尺寸、位置
            this.computeShowSearch();
        },
        searchVal(val) {
            if (val === '') {
                this.isFirstSearch = true;
            }
        },
        shouldRefreshList(newQuestion, oldQuestion) {
            if (this.selectedCategory == 'material' && newQuestion.length > 0) {
                if (this.activeItem && this.activeItem.type === 'collection') {
                    this.nowIndex = 0;
                    this.diffNumber = 0;
                    this.hasLoadedAll = false;
                    this.materialItem = [];
                    if (this.isFirstSearch) {
                        this.isLoading = true;
                        this.getCollection();
                    } else {
                        for (let i = 0; i < this.showDataSearch.length; i++) {
                            if (newQuestion == this.showDataSearch[i].sourceData.resourceId) {
                                // if (newQuestion == this.showDataSearch[i].sourceData) {
                                this.showDataSearch[i].sourceData.isCollect = !this.showDataSearch[i].sourceData.isCollect;
                            }
                        }
                    }
                } else {
                    if (this.isFirstSearch) {
                        this.isLoading = true;
                        newQuestion.forEach(item => {
                            this.materialItem.forEach((info, index) => {
                                if (info.resourceId == item) {
                                    this.materialItem[index].isCollect = !this.materialItem[index].isCollect;
                                };
                            });
                        });
                    } else {
                        // showDataSearch
                        for (let i = 0; i < this.showDataSearch.length; i++) {
                            if (newQuestion == this.showDataSearch[i].sourceData.resourceId) {
                                this.showDataSearch[i].sourceData.isCollect = !this.showDataSearch[i].sourceData.isCollect;
                            }
                        }
                    }
                }
                this.isLoading = false;
                this.shouldRefreshList = [];
            }
        },
        ifFocusOfInput(val) {
            this.getLaestSearch();
        },
    },
    created() {
        let tmpArr = [];
        const tmpmaterialType = [];
        this.materialType.forEach((e, i) => {
            tmpArr.push(e);
            if (tmpArr.length == 3 || i == this.materialType.length - 1) {
                tmpmaterialType.push(_.cloneDeep(tmpArr));
                tmpArr = [];
            }
        });
        this.materialType = tmpmaterialType;
        // this.logMaterialType_exposure();
        this.getLaestSearch();
    },
    activated() {
        this.shouldRefreshList = [];
    },
    deactivated() {
        this.waterInfoInit();
    },
    computed: {
        selectedCategory: {
            get() {
                return this.$store.state.base.selectedCategory;
            },
            set(value) {
                this.$store.commit('base/changeState', {
                    prop: 'selectedCategory',
                    value,
                });
            },
        },
        isGifTemplate() {
            return this.$store.state.base.isGifTemplate;
        },
        searchVal: {
            get() {
                return this.$store.state.base.searchMaterialValue;
            },
            set(value) {
                this.$store.state.base.searchMaterialValue = value;
            },
        },
        // 正在激活第几列的素材
        activePosition() {
            let str = '';
            if (this.activeChoose) {
                switch (this.activeIndex % 3) {
                    case 0:
                        str = 'first';
                        break;
                    case 1:
                        str = 'second';
                        break;
                    case 2:
                        str = 'third';
                        break;
                }
            }
            return str;
        },
        theme() {
            return this.$store.state.base.theme;
        },
        materialGroupClass() {
            if (this.activeItem && this.activeItem.key == 4) {
                return 'material-line-group';
            }
        },
        // 滚动加载的次数限制
        scrollIndexLimit() {
            return this.materialScrollLimit / this.materialGetLimit;
        },
        // 当屏幕高度太小，隐藏该按钮
        isBtnVisible() {
            if (this.activeChoose) {
                return false;
            }
            if (this.browserHeight && this.browserHeight < 680) {
                return false;
            }
            return true;
        },
        // 刷新素材里我的收藏列表
        shouldRefreshList: {
            get() {
                return this.$store.state.data.shouldRefreshList;
            },
            set(newValue) {
                this.$store.commit('data/changeState', {
                    prop: 'shouldRefreshList',
                    value: newValue,
                });
            },
        },

        // 刷新素材里我的收藏列表
        shouldRefreshUploadList: {
            get() {
                return this.$store.state.data.shouldRefreshUploadList;
            },
            set(newValue) {
                this.$store.commit('data/changeState', {
                    prop: 'shouldRefreshUploadList',
                    value: newValue,
                });
            },
        },
    },
    methods: {
        // 节流函数
        /*
        debounce(method, time = 30) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                method.call(this);
            }, time);
        },
        eleMaterialWheel(e) {
            this.debounce(() => {
                this.logMaterial();
            }, 300);
        },
        logMaterial() {
            const itemBox =  $('.material-item-box-normal');
            if (itemBox.length === 0 || this.showData.length === 0) return;
            const itemTop = itemBox.offset().top;
            const paddingTop = parseInt(itemBox.css('paddingTop'), 10);
            const marginTop = parseInt(itemBox.css('marginTop'), 10);
            const windowHeight = $(document).height();
            const showHeight = parseInt(windowHeight - itemTop, 10) - paddingTop - marginTop;
            const logMaterialArrId = [];
            this.showData.forEach(item => {
                if (item.top < showHeight && !this.logMaterialArrId.includes(item.sourceData.id)) {
                    logMaterialArrId.push(item.sourceData.id);
                    this.logMaterialArrId.push(item.sourceData.id);
                }
            });
            const { activeTopicIndex, activeItem } = this;
            logMaterialArrId.length && this.ajaxLog('logBssForExposure', {
                fodderId: JSON.stringify(logMaterialArrId),
                firstSort: JSON.stringify([activeItem.key]),
                secondSort: JSON.stringify([activeTopicIndex]),
            });
        },
        */
        isGifMaterial(item) {
            const sourceData = item.sourceData || item;
            const imgPath = sourceData.svgPrePath || sourceData.pre160ViewPath || sourceData.filePath;
            return imgPath && /gif$/.test(imgPath);
        },
        logMaterial_use(id) {
            const {
                activeItem,
                activeTopicIndex,
            } = this;
            if (activeItem && activeItem.key == 8) {
                return;
            }
            this.ajaxLog('logBssForUse', {
                fodderId: JSON.stringify([id]),
                firstSort: JSON.stringify([activeItem.key]),
                secondSort: JSON.stringify([activeTopicIndex]),
            });
        },
        /* logMaterialNav_use(id) {
            this.ajaxLog('logBssForUse', {
                firstSort: JSON.stringify([this.activeItem.key]),
                secondSort: JSON.stringify([id]),
            });
        },*/
        addLineDash(item) {
            let options;
            if (Array.isArray(item)) {
                options = {
                    type: 'line',
                    width: 273,
                    height: 2,
                    strokeWidth: 2,
                    strokeDashArray: item,
                    stroke: '#f73',
                    elementName: '线条',
                    msg: {
                        arrowStyle: 'normal',
                        arrowEndpoint: {
                            left: false,
                            right: true,
                        },
                    },
                };
            } else {
                options = {
                    type: 'line',
                    width: 273,
                    height: 6,
                    strokeWidth: 6,
                    stroke: '#f73',
                    elementName: '线条',
                    msg: item,
                };
            }
            Ktu.element.addModule('line', options);
            Ktu.log('quickDraw', 'line');
        },
        logMaterialNav(value) {
            const arrId = [];
            const key = this.activeItem ? JSON.stringify([this.activeItem.key]) : '';
            // this.clearLogData();
            arrId.push(value);
            this.ajaxLog('logBssForExposure', {
                firstSort: key,
                secondSort: JSON.stringify(arrId),
            });
        },
        /* computeShowCallBack() {
            this.logMaterial();
        },*/
        chooseTypeToLog(id) {
            if (id == 8) return;
            const logType = JSON.stringify([id]);
            this.ajaxLog('logBssForExposure', {
                firstSort: logType,
            });
            /* this.$nextTick(() => {
               this.logMaterialNav(this.materialTopicOpen, logType);
               }); */
        },
        /* clearLogData() {
            this.logMaterialArrId = [];
        },*/
        /*
        logMaterialType_exposure() {
            const arrId = [];
            this.materialType.map(item => {
                item.forEach(i => {
                    arrId.push(i.key);
                });
            });
            this.ajaxLog('logBssForExposure', {
                firstSort: JSON.stringify(arrId),
            });
        },*/

        ajaxLog(type, obj) {
            const url = `../ajax/fodder_h.jsp?cmd=${type}`;
            axios.post(url, obj);
        },
        searchByType(item, index) {
            this.itemStyle = item.style;
            this.typeSearchActive = index;
            this.searchType = item.type;
            this.nowSearchIndex = 0;
            this.search(true);
        },
        changeSearchVal(value) {
            this.searchVal = value;
            this.search(true);
        },
        hideBack(isSearchBtn) {
            this.materialFrameShow = false;
            this.searchVal = '';
            this.searchDataList = [];
            this.hasLoadedSearchAll = false;
            this.isFirstSearch = true;
            this.nowSearchIndex = 0;
            this.materialShow = true;
            if (isSearchBtn) {
                Ktu.simpleLog('searchOptions', 'clickBackBtn');
            } else {
                Ktu.simpleLog('searchOptions', 'clickNoResultBtn');
            }
            if (this.activeItem && this.activeItem.type == 'collection' && this.activeChoose) {
                this.materialItem = [];
                this.nowIndex = 0;
                this.getCollection();
            } else {
                this.materialItem = [];
                this.nowIndex = 0;
                this.getMaterialItem();
            }
        },
        hideHistory() {
            this.ifFocusOfInput = false;
        },
        showHistory() {
            // this.refs.sreachInput.focus();
            this.ifFocusOfInput = true;
            clearTimeout(this.isTimeOut);
            /* this.$nextTick(() => {
               this.$refs.sreachInput.inputFocus();
               clearTimeout(this.isTimeOut);
               }) */
        },
        // 文本框失焦
        blurInput() {
            this.isTimeOut = setTimeout(() => {
                this.ifFocusOfInput = false;
            }, 200);
        },
        // 清除历史记录
        cleanHistory() {
            this.historyList = [];
        },
        /* mouseenterMaterial(index) {
           this.hoverIndex === index;
           },
           mouseoutMaterial() {
           this.hoverIndex === -1;
           },
           input的值修改触发 */
        changeData(e) {
            this.searchVal = e.target.value;
        },
        focusInput(e) {
            this.ifFocusOfInput = true;
            e.target.value = e.target.value.replace(/[^\d]/g, '') || '';
        },
        showList() {
            this.show();
        },
        searchFrameFun() {
            if (this.searchFrameShow == true) {
                this.searchFrameShow = false;
                this.switchFrame = 'typeFrame';
            } else {
                this.searchFrameShow = true;
                this.switchFrame = 'searchFrame';
            }
        },
        removeFrame() {
            /* this.materialShow = true;
               // $(this.$el).find('.material-type-box').css('display','');
               // $(this.$el).find('.border-line').css('display','');
               // $(this.$el).find('.material-topic-item-box').css('display','');
               this.switchFrame = null;
               // this.activeLineIndex = 0;
               // this.activeIndex = 0;
               // this.activeItem = null;
               this.showLine = -1;
               this.activeChoose = !this.activeChoose;
               this.materialFrameShow = false; */

            this.waterInfoInit();
        },
        returnTop() {
            // this.isFirstSearch = true;
            this.$refs.container.scrollTop = 0;
            this.returnTopShow = false;
        },
        delBackground() {
            this.deleteBackground = true;
        },
        addBackground() {
            this.deleteBackground = false;
        },
        search(isClick = false) {
            if (this.searchVal == '') {
                this.$Notice.warning('请输入关键词');
                return false;
            }

            if (this.searchVal.length > 10) {
                this.$Notice.warning('关键词超过10个字符。');
                return false;
            }

            // this.showLine = -2;

            if (isClick) {
                Ktu.simpleLog('searchOptions', 'searchByClick');
            } else {
                Ktu.simpleLog('searchOptions', 'searchByInput');
            }
            /* this.showItemList = true;
            this.noResult = false;
            console.log('输入'); */
            Ktu.simpleLog('search');
            this.showPagination = false;
            this.isFirstSearch = false;
            this.searchDataList = [];
            this.nowSearchIndex = 0;
            this.getMaterialItemOfSearch();
            /* if(this.historyList.indexOf(this.searchVal) < 0) {
                this.historyList.unshift(this.searchVal);
            }
            if(this.historyList.length > 20) {
                this.historyList.splice(20);
            }

            this.$store.commit('base/changeState', {
                prop: 'selectedCategory',
                value: 'search'
            }); */
        },
        // 获取素材
        getMaterialItemOfSearch() {
            const url = '../ajax/fodder_h.jsp?cmd=getFodderWithKeyWord';
            const thisSearchType = this.searchType;

            this.isLoading = true;
            this.hasLoadedSearchAll = false;
            axios.post(url, {
                type: this.searchType,
                keyword: this.searchVal,
                getLimit: this.materialGetLimit,
                currentPage: this.nowSearchIndex,
                firstSort: this.activeItem ? this.activeItem.key : -1,
            }).then(res => {
                const info = (res.data);
                if (info.success) {
                    const {
                        data,
                    } = info;
                    const tmpArr = data.hits;

                    /*
                                如果搜索慢时 还没出结果就切换 会把新数据导入新的搜索中
                                这里防止这种情况
                                */
                    if (thisSearchType != this.searchType) {
                        return false;
                    }

                    this.searchTotal = data.total_size;
                    this.searchDataList.push(...tmpArr);

                    // 找不到相关关键词内容
                    if (this.searchTotal == 0) {
                        this.noResult = true;
                        Ktu.log('searchResult', 'none');
                    } else {
                        (this.nowSearchIndex == 0) && Ktu.log('searchResult', 'have');
                        this.noResult = false;
                        /* 手动调用一次滚动，防止没铺满，产生不了滚动加载
                                    this.scrollLoad(); */
                    }

                    if ((tmpArr.length < this.materialGetLimit) || (this.searchTotal == (this.nowSearchIndex + 1) * this.materialGetLimit)) {
                        this.hasLoadedSearchAll = true;
                        // 虽然加载完毕 但如果不在第一页 要出现分页选择其他页
                        /* if(this.nowIndex >= this.scrollIndexLimit ) {
                                        this.showPagination = true;
                                    } */
                    }
                    this.ifFocusOfInput = false;
                    this.getLaestSearch();
                }
            })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        // 选择素材类型
        chooseType(item, index, lineIndex) {
            this.showPagination = false;
            this.finishManage();
            this.activeItem = item;
            this.activeLineIndex = lineIndex;
            this.activeTopicIndex = -1;
            this.activeChoose = !this.activeChoose;
            if (this.showLine == -1) {
                this.showLine = lineIndex;
            } else {
                this.showLine = -1;
            }

            if (this.activeChoose) {
                this.chooseTypeToLog(item.key);
                this.nowIndex = 0;
                if (this.activeItem.type === 'collection') {
                    // return false;
                    Ktu.log('collect', 'clickCollection');
                    this.diffNumber = 0;
                    this.getCollection();
                } else {
                    if (this.activeItem.type === 'shape') {
                        this.$store.commit('msg/showManipulatetip', 'isShowShapeTip');
                    } else if (this.activeItem.type === 'line') {
                        this.$store.commit('msg/showManipulatetip', 'isShowLineTip');
                    }
                    this.getMaterialItem();
                }
                Ktu.log('clickMaterial', item.type);
            } else {
                this.waterInfoInit();
            }
            const tempIndex = this.activeIndex;
            this.activeIndex = index;
            // 点击其他类型时，不用收起直接弹出popup
            if (tempIndex !== index && !this.activeChoose) {
                this.chooseType(item, index, lineIndex);
            }
            if (!this.activeChoose) {
                this.activeIndex = -1;
            }
        },
        chooseTopic(topicIndex) {
            this.itemClick = true;
            this.logMaterialNav(topicIndex);
            if (this.materialFrameShow) {
                this.materialShow = false;
                /* $(this.$el).find('.material-type-box').css('display','none');
                   $(this.$el).find('.border-line').css('display','none');
                   $(this.$el).find('.material-topic-item-box').css('display','none'); */
            }
            /* console.log($(this.$el).find('.material-item-box').offset().top)
               if($(this.$el).find('.material-item-box').length && $(this.$el).find('.material-item-box').offset().top < 148){
               this.returnTopShow = true;
               }else{
               this.returnTopShow = false;
               } */
            this.nowIndex = 0;
            this.showPagination = false;

            this.materialItem = [];
            this.activeTopicIndex = topicIndex;
            this.getMaterialItem();
            Ktu.log(`click${Ktu.utils.firstUpper(this.activeItem.type)}Topic`, this.activeTopicIndex);
            this.returnTop();
            this.$nextTick(() => {
                this.returnTopShow = false;
                this.materialFrameShow = false;
                this.materialShow = true;
            });
        },
        // 获取素材
        getMaterialItem() {
            const url = '../ajax/fodder_h.jsp?cmd=getFodderList';
            if (!this.activeItem) {
                return;
            }
            const materialKey = this.activeItem.key;
            /* --------------------
               if (materialKey === 10) {
               var item = {
               "id": 582,
               "resourceId": "AFoIABBRGAAgvoyX4QUouKnVsgUw7gU4lAw",
               "fkNum": "AFoIABBRGAAgvoyX4QUouKnVsgUw7gU4lAw",
               "title": "资源 4.svg",
               "type": 81,
               "category": 9,
               "comeFrom": 4,
               "useLimit": 0,
               "size": 416,
               "width": 300,
               "height": 625,
               "filePath": "http://1448.s90i.aaadns.com.wbh.dev.cc/81/AFoIABBRGAAgvoyX4QUouKnVsgUw7gU4lAw.svg",
               "svgPreId": "AFoIABBRGAAg4qGA3gUo7KDmuwMw7gU4lAw",
               "svgPrePath": "http://1448.s90i.aaadns.com.wbh.dev.cc/4/AFoIABAEGAAg4qGA3gUolvudggMwrAI48QQ.png",
               "svg2PngPre160ViewPath": "http://1448.s90i.aaadns.com.wbh.dev.cc/4/AFoIABAEGAAg4qGA3gUolvudggMwrAI48QQ!160x160.png",
               "svg2PngPre450ViewPath": "http://1448.s90i.aaadns.com.wbh.dev.cc/4/AFoIABAEGAAg4qGA3gUolvudggMwrAI48QQ.png",
               "topic": "[90]"
               }
               var item1 = {
               "id": 583,
               "resourceId": "AFoIABBRGAAg7K6b4QUoltnf3wcw9AM42gM",
               "fkNum": "AFoIABBRGAAg7K6b4QUoltnf3wcw9AM42gM",
               "title": "资源 4.svg",
               "type": 81,
               "category": 9,
               "comeFrom": 4,
               "useLimit": 0,
               "size": 416,
               "width": 500,
               "height": 474,
               "filePath": "http://1448.s90i.aaadns.com.wbh.dev.cc/81/AFoIABBRGAAg7K6b4QUoltnf3wcw9AM42gM.svg",
               "svgPreId": "AFoIABBRGAAg7K6b4QUoltnf3wcw9AM42gM",
               "svgPrePath": "//1448.s90i.aaadns.com.wbh.dev.cc/4/AFoIABAEGAAgo7zZ3wUo4vuunQQwrAI4nAI.png",
               "svg2PngPre160ViewPath": "//1448.s90i.aaadns.com.wbh.dev.cc/4/AFoIABAEGAAgo7zZ3wUo4vuunQQwrAI4nAI!160x160.png",
               "svg2PngPre450ViewPath": "//1448.s90i.aaadns.com.wbh.dev.cc/4/AFoIABAEGAAgo7zZ3wUo4vuunQQwrAI4nAI.png",
               "topic": "[90]"
               }
               var item2 = {
               "id": 584,
               "resourceId": "AFoIABBRGAAg762b4QUoiNjTtAMw9AM49AM",
               "fkNum": "AFoIABBRGAAg762b4QUoiNjTtAMw9AM49AM",
               "title": "资源 4.svg",
               "type": 81,
               "category": 9,
               "comeFrom": 4,
               "useLimit": 0,
               "size": 416,
               "width": 500,
               "height": 474,
               "filePath": "http://1448.s90i.aaadns.com.wbh.dev.cc/81/AFoIABBRGAAg762b4QUoiNjTtAMw9AM49AM.svg",
               "svgPreId": "AFoIABBRGAAg762b4QUoiNjTtAMw9AM49AM",
               "svgPrePath": "//1448.s90i.aaadns.com.wbh.dev.cc/4/AFoIABAEGAAg9bzZ3wUoy8-mjAQwrAI4rAI.png",
               "svg2PngPre160ViewPath": "//1448.s90i.aaadns.com.wbh.dev.cc/4/AFoIABAEGAAg9bzZ3wUoy8-mjAQwrAI4rAI!160x160.png",
               "svg2PngPre450ViewPath": "//1448.s90i.aaadns.com.wbh.dev.cc/4/AFoIABAEGAAg9bzZ3wUoy8-mjAQwrAI4rAI.png",
               "topic": "[90]"
               }
               this.materialItem.push(item);
               this.materialItem.push(item1);
               this.materialItem.push(item2);
               return;
               }
               -------------------- */
            this.isLoading = true;
            this.hasLoadedAll = false;
            if (this.activeItem.type != 'collection') {
                if (this.materialTopic.length == 0) {
                    this.materialTopic = Ktu.config.material[this.activeItem.type];
                }
            }

            let postData = {
                category: this.activeItem.key,
                topic: this.activeTopicIndex,
                getLimit: this.materialGetLimit,
                currentPage: this.nowIndex,
            };

            if (postData.category === 6) {
                if (postData.topic === -1) {
                    postData = Object.assign({}, postData, {
                        otherCategorys: 8,
                    });
                } else if (postData.topic === 80) {
                    postData.category = 8;
                    postData.topic = -1;
                }
            }

            axios
                .post(url, postData)
                .then(res => {
                    const info = res.data;
                    if (info.success && this.activeItem.key == postData.category) {
                        const {
                            data,
                        } = info;
                        let tmpArr = data.hits;
                        // 如果快速点击 要判断是不是当前分类
                        if (this.activeChoose && materialKey === this.activeItem.key) {
                            // 过滤部分线条
                            if (this.activeItem.type == 'line') {
                                tmpArr = tmpArr.filter(item => {
                                    const filterList = [1902, 1904, 1905, 1906, 1907, 1908];
                                    return !filterList.includes(item.id);
                                });
                            }
                            this.activeItemTotal = data.total_size;
                            this.materialItem.push(...tmpArr);
                            if (data.hits.length < this.materialGetLimit || this.activeItemTotal == (this.nowIndex + 1) * this.materialGetLimit) {
                                this.hasLoadedAll = true;
                                /* 虽然加载完毕 但如果不在第一页 要出现分页选择其他页
                                   if (this.nowIndex >= this.scrollIndexLimit) {
                                   this.showPagination = true;
                                   } */
                            }
                        }
                    }
                })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        // 获取收藏
        getCollection(type = this.searchOption) {
            const url = '../ajax/ktuCollectFodder_h.jsp?cmd=getCollectList';

            this.isLoading = true;
            this.hasLoadedAll = false;
            axios
                .post(url, {
                    category: type,
                    limitCount: this.materialGetLimit,
                    scrollIndex: this.nowIndex,
                    diffNumber: this.diffNumber,
                    hideVessel: false,
                })
                .then(res => {
                    const info = res.data;
                    if (info.success && this.activeItem.type == 'collection') {
                        if (this.isGifTemplate) {
                            this.materialItem.push(...info.data);
                        } else {
                            this.materialItem = this.materialItem.concat(info.data.filter(item => item && !(/\.gif/.test(item.filePath))));
                        }
                        if (info.data.length < this.materialGetLimit) {
                            this.hasLoadedAll = true;
                            /* 虽然加载完毕 但如果不在第一页 要出现分页选择其他页
                               if (this.nowIndex >= this.scrollIndexLimit) {
                               this.showPagination = true;
                               } */
                        }
                    }
                })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        changeCollectionState(info, type, isSearch) {
            if (type == 0) {
                const downUrl = '../ajax/ktuCollectFodder_h.jsp?cmd=del';
                axios.post(downUrl, {
                    resourceId: info,
                })
                    .then(res => {
                        const {
                            data,
                        } = res;
                        if (data.success) {
                            Ktu.log('collect', 'disCollection');
                            Ktu.templateData.forEach(({
                                objects,
                            }) => {
                                objects.forEach(item => {
                                    if (item.fileId) {
                                        item.fileId === info ? item.isCollect = !item.isCollect : '';
                                    } else if (item.image) {
                                        item.image.fileId == info ? item.isCollect = !item.isCollect : '';
                                    }
                                    // item.fileId ? (item.fileId === info ? item.isCollect = !item.isCollect : '') : (item.image ? (item.image.fileId == info ? item.isCollect = !item.isCollect : '') : '');
                                });
                            });
                            this.diffNumber -= 1;
                            this.materialItem = this.materialItem.filter(item => item.resourceId != info);
                            if (!this.hasLoadedAll && this.materialItem.length == 0) {
                                this.nowIndex = 0;
                                this.diffNumber = 0;
                                this.getCollection();
                            }
                            this.shouldRefreshUploadList.includes(info) ? '' : this.shouldRefreshUploadList.push(info);
                        }
                    });
            } else {
                // info.sourceData.isCollect = !info.sourceData.isCollect;
                const url = info.sourceData.isCollect ? '../ajax/ktuCollectFodder_h.jsp?cmd=del' : '../ajax/ktuCollectFodder_h.jsp?cmd=add';
                if (isSearch) {
                    info.sourceData.isCollect = !info.sourceData.isCollect;
                }
                axios.post(url, {
                    category: info.sourceData.category,
                    resourceId: info.sourceData.resourceId,
                }).then(res => {
                    const {
                        data,
                    } = res;
                    if (data.success) {
                        if (info.sourceData.isCollect) {
                            Ktu.log('collect', 'collection');
                        } else {
                            Ktu.log('collect', 'disCollection');
                        }
                        Ktu.templateData.forEach(({
                            objects,
                        }) => {
                            objects.forEach(item => {
                                if (item.fileId) {
                                    item.fileId === info.sourceData.resourceId ? item.isCollect = !item.isCollect : '';
                                } else if (item.image) {
                                    item.image.fileId == info.sourceData.resourceId ? item.isCollect = !item.isCollect : '';
                                }
                                // item.fileId ? (item.fileId === info.sourceData.resourceId ? item.isCollect = !item.isCollect : '') : (item.image ? (item.image.fileId == info.sourceData.resourceId ? item.isCollect = !item.isCollect : '') : '');
                            });
                        });
                        this.shouldRefreshUploadList.includes(info.sourceData.resourceId) ? '' : this.shouldRefreshUploadList.push(info.sourceData.resourceId);
                        this.materialItem = this.materialItem.filter(item => {
                            if (item.resourceId == info.sourceData.resourceId) {
                                item.isCollect = !item.isCollect;
                            }
                            return true;
                        });
                    }
                })
                    .catch(err => {
                        console.log(err);
                    })
                    .finally(() => { });
            }
        },
        scrollLoad(e) {
            if (this.isFirstSearch) {
                // const self = this;
                this.isShow = false;
                // if($(this.$el).find('.material-group-box').length && $(this.$el).find('.material-group-box').offset().top < 60){
                if (
                    $(this.$el).find('.material-item-box').length
                    && $(this.$el)
                        .find('.material-item-box')
                        .offset().top < 157
                ) {
                    this.materialFrameShow = true;
                    /* this.materialShow = false;
                       $(this.$el).find('.material-type-box').css('display','none');
                       $(this.$el).find('.border-line').css('display','none');
                       $(this.$el).find('.material-topic-item-box').css('display','none'); */
                } else {
                    // this.materialFrameShow = this.materialFrameShow ? true : false
                    this.searchFrameShow = false;
                    /* this.materialFrameShow = false;
                       $(this.$el).find('.material-type-box').css('display','');
                       $(this.$el).find('.border-line').css('display','');
                       $(this.$el).find('.material-topic-item-box').css('display',''); */
                    if (!this.itemClick) {
                        this.materialFrameShow = false;
                        this.materialShow = true;
                        /* $(this.$el).find('.material-type-box').css('display','');
                           $(this.$el).find('.border-line').css('display','');
                           $(this.$el).find('.material-topic-item-box').css('display',''); */
                    }
                }
                if (
                    $(this.$el).find('.material-item-box').length
                    && $(this.$el)
                        .find('.material-item-box')
                        .offset().top < 146
                ) {
                    this.returnTopShow = true;
                } else {
                    this.returnTopShow = false;
                }
                this.closeCopyrightInfo();
                this.scrollTimer && window.clearTimeout(this.scrollTimer);
                this.scrollTimer = window.setTimeout(() => {
                    // 加载完毕 返回
                    if (this.hasLoadedAll) return false;
                    /* 滚动加载限制 数量大于等于最大加载数量 并且 少于总数量 才出现 分页选择
                    if (this.materialItem.length >= this.materialScrollLimit && this.materialItem.length < this.activeItemTotal) {
                        this.showPagination = true;
                        return false;
                    } */

                    const {
                        container,
                    } = this.$refs;
                    const slide = (this.$refs.slide && this.$refs.slide[0]);
                    if (this.activeChoose && !this.isLoading && container.scrollTop + container.clientHeight >= slide.clientHeight) {
                        this.isLoading = true;
                        this.nowIndex++;
                        if (this.activeItem.type == 'collection') {
                            this.getCollection();
                        } else {
                            this.getMaterialItem();
                        }
                    }
                    // self.itemClick = false
                }, 50);
            } else {
                this.isShow = false;
                this.materialShow = false;

                const {
                    container,
                } = this.$refs;
                const {
                    searchBox,
                } = this.$refs;

                if (container.scrollTop > 146) {
                    this.returnTopShow = true;
                } else {
                    this.returnTopShow = false;
                }
                this.closeCopyrightInfo();
                this.scrollTimer && window.clearTimeout(this.scrollTimer);
                this.scrollTimer = window.setTimeout(() => {
                    // 加载完毕 返回
                    if (this.hasLoadedSearchAll) return false;
                    /* 滚动加载限制 数量大于等于最大加载数量 并且 少于总数量 才出现 分页选择
                    if (this.materialItem.length >= this.materialScrollLimit && this.materialItem.length < this.activeItemTotal) {
                        this.showPagination = true;
                        return false;
                    }
                    console.log(slide); */
                    if (!this.isLoading && container.scrollTop + container.clientHeight >= searchBox.clientHeight) {
                        this.isLoading = true;
                        this.nowSearchIndex++;
                        this.getMaterialItemOfSearch();
                    }
                    // self.itemClick = false
                }, 50);
            }
        },
        mousewheelshow(e) {
            this.itemClick = false;
            if (e.deltaY < 0) {
                this.materialShow = true;
                if (
                    $(this.$el).find('.material-item-box').length
                    && $(this.$el)
                        .find('.material-item-box')
                        .offset().top > 145
                ) {
                    this.materialFrameShow = false;
                }
            }
        },
        selectPageChange(nowPage) {
            $('.container').scrollTop(0);
            this.nowIndex = (nowPage - 1) * this.scrollIndexLimit;
            this.materialItem = [];
            this.hasLoadedAll = false;
            this.showPagination = false;
            this.getMaterialItem();
        },
        // 瀑布流数据初始化
        waterInfoInit() {
            this.materialShow = true;
            /* $(this.$el).find('.material-type-box').css('display','');
               $(this.$el).find('.border-line').css('display','');
               $(this.$el).find('.material-topic-item-box').css('display',''); */
            this.showLine = -1;
            this.materialFrameShow = false;
            this.returnTopShow = false;
            this.switchFrame = null;
            this.activeChoose = false;
            this.materialTopicOpen = false;
            this.activeTopicIndex = -1;
            this.materialItem = [];
            this.materialTopic = [];
            this.nowIndex = 0;
            this.isLoading = false;
            this.hasLoadedAll = false;
            this.showPagination = false;
            this.closeCopyrightInfo();
        },
        waterItemImg(item) {
            const sourceData = item.sourceData || item;

            let imgPath = sourceData.svgPrePath || sourceData.pre160ViewPath || sourceData.filePath;
            if (this.$store.state.base.isSupportWebp && imgPath && !/base64/.test(imgPath)) {
                imgPath = Ktu.getWebpOrOtherImg(imgPath);
            }
            return imgPath;
        },

        materialClass(item) {
            if (!item.topic) return;
            const itemTopic = JSON.parse(item.topic);
            let specialTopic = false;

            itemTopic.some(topic => {
                if (this.specialTopic.indexOf(topic) >= 0) {
                    specialTopic = true;
                    return true;
                }
                return false;
            });

            if (specialTopic) {
                return 'material-item-special';
            }
        },
        // 使用物品
        useWaterItem(item, isCollect, position) {
            if (this.isFirstSearch) {
                this.logMaterial_use(item.id);
            }
            if (this.isManageCollection) {
                if (this.chooseItemCollectionList.indexOf(item.resourceId) > -1) {
                    const num = this.chooseItemCollectionList.indexOf(item.resourceId);
                    this.chooseItemCollectionList.splice(num, 1);
                } else {
                    this.chooseItemCollectionList.push(item.resourceId);
                }
                return;
            }
            let type = '';
            const object = {
                id: item.resourceId,
                path: item.filePath,
                // 来源分类
                category: item.category,
                canCollect: true,
                isCollect: isCollect == 1 ? item.isCollect : true,
            };
            switch (item.category) {
                case 0:
                case 1:
                    type = 'image';
                    break;
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                    type = 'svg';
                    break;
                case 9:
                    type = 'imageContainer';
                    break;
                case 20:
                    if (item.filePath.split('.').pop() == 'svg') {
                        type = 'svg';
                        break;
                    } else {
                        type = 'image';
                        break;
                    }
            }
            // 特殊处理，特定Id的形状添加时不添加svg，而是添加此类型的元素
            switch (item.id) {
                case 162:
                    object.drawType = 'fill';
                    type = 'ellipse';
                    break;
                case 163:
                    object.drawType = 'fill';
                    type = 'rect';
                    break;
                case 164:
                    object.drawType = 'fill';
                    object.radius = {
                        size: 10,
                        rt: true,
                        rb: true,
                        lb: true,
                        lt: true,
                    };
                    type = 'rect';
                    break;
                case 165:
                    object.drawType = 'fill';
                    object.radius = {
                        size: 35,
                        rt: true,
                        rb: true,
                        lb: true,
                        lt: true,
                    };
                    type = 'rect';
                    break;
                case 212:
                    object.drawType = 'stroke';
                    object.strokeWidth = 5;
                    type = 'ellipse';
                    break;
                case 213:
                    object.drawType = 'stroke';
                    object.strokeWidth = 5;
                    type = 'rect';
                    break;
                case 214:
                    object.drawType = 'stroke';
                    object.strokeWidth = 5;
                    object.radius = {
                        size: 10,
                        rt: true,
                        rb: true,
                        lb: true,
                        lt: true,
                    };
                    type = 'rect';
                    break;
                case 215:
                    object.drawType = 'stroke';
                    object.strokeWidth = 5;
                    object.radius = {
                        size: 35,
                        rt: true,
                        rb: true,
                        lb: true,
                        lt: true,
                    };
                    type = 'rect';
                    break;
            }

            if (type === 'image' || type == 'imageContainer') {
                object.w = item.width;
                object.h = item.height;
            }
            if (type === 'image') {
                object.smallSrc = this.waterItemImg(item);
            }
            if (position) {
                object.top = position.top;
                object.left = position.left;
            }
            if (item.category === 5) {
                const _this = this;
                // 获取绘制的svg的大小 目前只在文字容器需求需要
                object.getSvgSize = function (obj) {
                    _this.$store.commit('base/setPathGroup', obj);
                };
            }
            if (this.activeItem) {
                Ktu.simpleLog('addMaterial', this.activeItem.type);
                Ktu.simpleLog('addSysMaterial');
                Ktu.simpleLog(`add${Ktu.utils.firstUpper(this.activeItem.type)}Topic`, this.activeTopicIndex);
            } else {
                Ktu.simpleLog('addSysMaterial');
            }
            Ktu.element.addModule(type, object).then(() => {
                if (item.category === 5) {
                    const result = this.$store.state.base.pathGroup;
                    this.computedTextSize(result).then(res => {
                        this.addTextToCont(res);
                    });
                }
            });
        },
        dragStart(event, item, isCollect) {
            // 兼容firefox,必须setData，否则拖拽无法生效
            event.dataTransfer.setData('firefoxInfo', '');
            // 拖拽的时候存储拖拽值
            item.from = 'material';
            item.activeItem = this.activeItem;
            item.activeTopicIndex = this.activeTopicIndex;
            item.canCollect = true;
            item.isCollect = (isCollect == 3 ? 'line' : isCollect == 1 ? item.isCollect : true);
            Ktu.element.dragObject = item;
        },
        dragEnd(event, item) {
            const canvasRect = Ktu.edit.getEditareaSize();
            canvasRect.right = canvasRect.left + canvasRect.width;
            canvasRect.bottom = canvasRect.top + canvasRect.height;
            // 图片拖拽进容器
            Ktu.element.dragObject = null;

            // 判断是否拖进编辑器内
            if (event.pageX > canvasRect.left && event.pageX < canvasRect.right && event.pageY > canvasRect.top && event.pageY < canvasRect.bottom) {
                // var viewport  = Ktu.canvas.documentArea;
                const {
                    scale,
                } = Ktu.edit;
                const position = {
                    /* left: (event.pageX - canvasRect.left - viewport[4]) / scale - item.width / 2,
                       top: (event.pageY - canvasRect.top - viewport[5]) / scale - item.height / 2 */
                    left: (event.pageX - canvasRect.left - Ktu.edit.documentPosition.left) / scale,
                    top: (event.pageY - canvasRect.top - Ktu.edit.documentPosition.top) / scale,
                };
                this.useWaterItem(item, 1, position);
                /* Ktu.mainCanvas.addModule("image", {
                   id: img.i,
                   path: img.p,
                   //注意考虑当前缩放的比例
                   left: (event.pageX - canvasRect.left - viewport[4]) / scale - img.w / 2,
                   top: (event.pageY - canvasRect.top - viewport[5]) / scale - img.h / 2
                   }); */
            }
        },
        showDrawKeyboard() {
            Ktu.simpleLog('openDrawTips', 'materialBottom');
            this.$store.commit('msg/hideManipulatetipOnce', 'isShowShapeTip');
            this.$store.commit('base/changeState', {
                prop: 'isShowDrawKeyboard',
                value: true,
            });
        },
        // 显示选择框
        showOptions() {
            if (this.searchOption == -1 && (!this.showData || this.showData.length == 0)) return;
            this.showOption = true;
        },
        // 隐藏选择框
        hiddenOptions() {
            this.showOption = false;
        },
        // 选择分类
        changeSearchOption(type) {
            Ktu.log('collect', 'clickMaterialType');
            this.showOption = false;
            if (this.searchOption != type) {
                this.materialItem = [];
                this.nowIndex = 0;
                this.searchOption = type;
                this.getCollection();
            }
        },
        // 选择收藏
        selectCollection(id) {
            if (this.chooseItemCollectionList.indexOf(id) > -1) {
                const num = this.chooseItemCollectionList.indexOf(id);
                this.chooseItemCollectionList.splice(num, 1);
            } else {
                this.chooseItemCollectionList.push(id);
            }
        },
        // 进入管理
        enterManage() {
            if (this.showData.length > 0) {
                this.isManageCollection = true;
                this.chooseItemCollectionList = [];
            }
            Ktu.log('collect', 'clickManage');
        },
        // 完成管理
        finishManage() {
            this.isManageCollection = false;
            this.chooseItemCollectionList = [];
            this.isAllSelect = false;
            this.selectTip = this.isAllSelect ? '取消全选' : '全选';
        },
        // 全选与否
        changeSelect() {
            this.chooseItemCollectionList = [];
            if (!this.isAllSelect) {
                this.showData.forEach(item => {
                    this.chooseItemCollectionList.push(item.sourceData.resourceId);
                });
            }
            this.isAllSelect = !this.isAllSelect;
            this.selectTip = this.isAllSelect ? '取消全选' : '全选';
        },
        // 取消收藏
        delCollect() {
            if (this.chooseItemCollectionList.length > 0) {
                const tip = `确定要取消收藏选中的${this.chooseItemCollectionList.length}个素材吗？`;
                this.$Modal.confirm({
                    content: tip,
                    okBtnType: 'warn',
                    onOk: () => {
                        const url = '../ajax/ktuCollectFodder_h.jsp?cmd=delList';
                        axios.post(url, {
                            idList: JSON.stringify(this.chooseItemCollectionList),
                        })
                            .then(res => {
                                const {
                                    data,
                                } = res;
                                if (data.success) {
                                    this.$Notice.success('取消收藏成功');
                                    Ktu.log('collect', 'disCollection');
                                    this.diffNumber -= this.chooseItemCollectionList.length;
                                    this.materialItem = this.materialItem.filter(item => this.chooseItemCollectionList.every(data => item.resourceId != data));
                                    this.chooseItemCollectionList.forEach(info => {
                                        Ktu.templateData.forEach(({
                                            objects,
                                        }) => {
                                            objects.forEach(item => {
                                                if (item.fileId) {
                                                    item.fileId === info ? item.isCollect = !item.isCollect : '';
                                                } else if (item.image) {
                                                    item.image.fileId == info ? item.isCollect = !item.isCollect : '';
                                                }
                                                // item.fileId ? (item.fileId === info.sourceData.resourceId ? item.isCollect = !item.isCollect : '') : (item.image ? (item.image.fileId == info.sourceData.resourceId ? item.isCollect = !item.isCollect : '') : '');
                                            });
                                        });
                                    });
                                    this.clearSelect();
                                    if (this.materialItem.length == 0) {
                                        this.finishManage();
                                        if (!this.hasLoadedAll) {
                                            this.diffNumber = 0;
                                            this.nowIndex = 0;
                                            this.getCollection();
                                        }
                                    }
                                } else {
                                    this.$Notice.warning(data.msg);
                                }
                            });
                    },
                });
            } else {
                this.$Notice.warning('请选择要取消收藏的素材');
            }
        },
        // 清空选择
        clearSelect() {
            this.chooseItemCollectionList = [];
            this.isAllSelect = false;
            this.selectTip = this.isAllSelect ? '取消全选' : '全选';
        },
        // 获取历史记录
        getLaestSearch() {
            this.historyList = [];
            const url = '../ajax/ktuSearchRecord_h.jsp?cmd=get';

            axios.post(url, {
                type: 0,
            }).then(res => {
                const info = (res.data);
                if (info.success && info.recordList.searchList) {
                    this.historyList = JSON.parse(info.recordList.searchList).reverse();
                }
                // console.log(this.historyList);
            })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => {
                    // this.isLoading = false;
                });
        },
        // 清空历史记录
        clearLastest() {
            const url = '../ajax/ktuSearchRecord_h.jsp?cmd=del';
            const data = {
                type: 0,
            };
            axios.post(url, data).then(res => {
                const result = (res.data);
                if (result.success) {
                    Ktu.simpleLog('searchOptions', 'clearSearchHistory');
                    this.historyList = [];
                }
            })
                .catch(e => {
                    console.log(e);
                });
        },
        computeShowSearch() {
            const propData = this.searchDataList;
            // console.log(propData);
            if (this.defaultHeightSearch) {
                this.colHeightsSearch = JSON.parse(JSON.stringify(this.defaultHeightSearch));
            } else {
                this.colHeightsSearch = [0, 0, 0];
            }
            /* this.colHeights = this.defaultHeight || [0, 0, 0]; // 列高度
               元素尺寸 */
            let width;
            let height;
            // 元素从该列数插入
            let insertIndex;
            // 元素位置
            let top;
            let left;
            // 宽高比
            let ratio;
            let cols;
            let minColHeight;
            // 占两列时，较高的一列
            let midColHeight;
            let maxColHeight;
            let minColIndex;

            propData.forEach((item, index) => {
                minColHeight = this.getMinColHeightSearch();
                maxColHeight = this.getMaxColHeightSearch();
                minColIndex = this.getMinColIndexSearch(minColHeight);
                width = item.width || item.w || item.fw || item.pwidth;
                height = item.height || item.h || item.fh || item.pheight;
                // 宽高比
                ratio = width / height;
                cols = this.getItemColsSearch(ratio);
                // 初始该占三列
                if (cols === 3) {
                    if (maxColHeight - minColHeight > this.maxDiffSearch) {
                        // 计算该占两列的情况
                        cols = 2;
                    } else {
                        width = this.colWidthSearch * 3 + this.boxRectSearch.right * (cols - 1);
                        insertIndex = 0;
                    }
                }
                // 初始该占两列
                if (cols === 2) {
                    if (minColIndex === 0) {
                        if (this.colHeightsSearch[1] - this.colHeightsSearch[0] > this.maxDiffSearch) {
                            cols = 1;
                        } else {
                            width = this.colWidthSearch * 2 + this.boxRectSearch.right * (cols - 1);
                            insertIndex = 0;
                            midColHeight = this.colHeightsSearch[1];
                        }
                    } else if (minColIndex === 1) {
                        if (this.colHeightsSearch[0] - this.colHeightsSearch[1] > this.maxDiffSearch) {
                            if (this.colHeightsSearch[2] - this.colHeightsSearch[1] > this.maxDiffSearch) {
                                cols = 1;
                            } else {
                                width = this.colWidthSearch * 2 + this.boxRectSearch.right * (cols - 1);
                                insertIndex = 1;
                                midColHeight = this.colHeightsSearch[2];
                            }
                        } else {
                            width = this.colWidthSearch * 2 + this.boxRectSearch.right * (cols - 1);
                            insertIndex = 0;
                            midColHeight = this.colHeightsSearch[0];
                        }
                    } else if (minColIndex === 2) {
                        if (this.colHeightsSearch[1] - this.colHeightsSearch[2] > this.maxDiffSearch) {
                            cols = 1;
                        } else {
                            width = this.colWidthSearch * 2 + this.boxRectSearch.right * (cols - 1);
                            insertIndex = 1;
                            midColHeight = this.colHeightsSearch[1];
                        }
                    }
                }
                // 初始该占一列
                if (cols === 1) {
                    width = this.colWidthSearch + this.boxRectSearch.right * (cols - 1);
                    insertIndex = minColIndex;
                }
                height = width / ratio;
                if (height < this.minHeightSearch) {
                    height = this.minHeightSearch;
                } else if (height > this.maxHeightSearch) {
                    height = this.maxHeightSearch;
                }
                left = (this.colWidthSearch + this.boxRectSearch.right) * insertIndex;
                switch (cols) {
                    case 1:
                        top = this.colHeightsSearch[insertIndex];
                        this.colHeightsSearch[insertIndex] += height + this.boxRectSearch.bottom;
                        break;
                    case 2:
                        top = midColHeight;
                        this.colHeightsSearch[insertIndex] = midColHeight + height + this.boxRectSearch.bottom;
                        this.colHeightsSearch[insertIndex + 1] = this.colHeightsSearch[insertIndex];
                        break;
                    case 3:
                        top = maxColHeight;
                        for (let i = 0; i < 3; i++) {
                            this.colHeightsSearch[i] = maxColHeight + height + this.boxRectSearch.bottom;
                        }
                        break;
                }
                // 存进显示数组
                const size = {
                    width,
                    height,
                    top,
                    left,
                    sourceData: item,
                    index,
                    style: {
                        width: `${width}px`,
                        height: `${height}px`,
                        top: `${top}px`,
                        left: `${left}px`,
                    },
                    canCollect: true,
                };
                this.showDataSearch.push(size);
            });
            this.waterFallHeightSearch = this.getMaxColHeightSearch();
        },
        // 元素初始该占列数
        getItemColsSearch(ratio) {
            let cols = 1;
            if (ratio >= this.propRatioSearch[1]) {
                cols = 3;
            } else if (ratio >= this.propRatioSearch[0] && ratio < this.propRatioSearch[1]) {
                cols = 2;
            } else if (ratio < this.propRatioSearch[0]) {
                cols = 1;
            }
            return cols;
        },
        // 获取当前最小高度的列的高度
        getMinColHeightSearch() {
            const minHeight = Math.min.apply(null, this.colHeightsSearch);
            return minHeight;
        },
        // 获取当前最大高度的列的高度
        getMaxColHeightSearch() {
            const maxHeight = Math.max.apply(null, this.colHeightsSearch);
            return maxHeight;
        },
        // 获取当前高度最小的列的表
        getMinColIndexSearch(minHeight) {
            for (let i = 0, len = this.colHeightsSearch.length; i < len; i++) {
                if (this.colHeightsSearch[i] === minHeight) {
                    return i;
                }
            }
        },
    },
});
