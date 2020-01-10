Vue.component('image-source-modal', {
    template: `
    <modal class="manageModal imageSource-modal" :width="modalClassObj[modalType]._w" class-name="imageSourceModalBody" v-model="showImageSourceModal" @mousedown="logMouseCoords" :maskAnimate="modelMask">
        <div class="imageSourceModalBox" :class="[modalClassObj[modalType]._cn]" :style="{'height':screenHeight + 'px'}" ref="imageSourceModalBox">
            <aside class="image-aside">
                <div :class="['uploadBox',upload]">
                    <label :class="[hoverType==1?'small':'']" :for="'select_btn_' + upload.instanceID" @click.stop="uploadBtnClick">
                        <svg class="svg localsvg"><use xlink:href="#svg-material-upload"></use></svg>
                        <span>
                            本地上传
                        </span>
                    </label>
                    <label :class="[hoverType==2?'small':(isOss?'hover':'')]" class="phoneUpload" @click.stop="phoneUploadBtnClick" @mouseenter="changeAnimate(1)" @mouseleave="changeAnimate(2)">
                        <svg class="svg"><use xlink:href="#svg-phone-upload-pic"></use></svg>
                        <span>
                            手机上传
                        </span>
                    </label>
                </div>
                <div class="source-type-tab source-type-tab-custom">
                    <transition name="only-slide-up">
                        <div class="source-childlist my-list" ref="dirList" @click.stop="clickParentTab(0)">
                        <image-source-dir class="source-childlist-header" :item="dirListTitle" @click="clickUploadChild({'item':dirListTitle,'type':1,'init':false})" :class="{'active' : dirListTitle.open&&activeUploadChild.id==dirListTitle.id , 'activeAll' : dirListTitle.open}">
                           <svg class="source-tabBox-switch-svg">
                            <use :xlink:href="'#svg-source-tabBox-switch'"></use>
                        </svg>
                        </image-source-dir>


                        <transition name="only-slide-up">
                        <div v-if="dirListTitle.open">
                            <div rippleColor="#ff7733" :class="['dir-btn',dirList.length >= 30?'disable':'']">文件夹（{{dirList.length}}）
                                <span @click="addDir" class="has-tips" tips="添加文件夹">
                                    <svg class="svg"><use xlink:href="#svg-source-add-icon"></use></svg>
                                </span>
                            </div>
                            <div class="dir-list" @scroll="uploadScrolled">
                                <image-source-dir :item="item" :key="item.id" v-for="(item,index) in dirList" :class="{'active' : activeUploadChild && activeUploadChild.id == item.id}" @click="clickUploadChild({'item':item,'init':false})">
                                    <div v-if="!item.hideOperate && !item.edit" class="child-file-opt" @click.stop="openDirMenu($event,item)">
                                        <svg class="svg-ele-dir-more">
                                            <use xlink:href="#svg-source-more-icon_1"></use>
                                        </svg>
                                    </div>
                                </image-source-dir>
                            </div>
                            <!--<div class="mask" v-if="uploadShowMask && dirList.length>5">-->
                            <!--</div>-->
                            </div>
                          </transition>
                            <Menu v-if="showDirMenu" :item="dirItem" :offsetTop="14" :position="dirPosition" :operateList="dirOperateList" @execOperate="dirOperate" @close="closeDirMenu"></Menu>
                        </div>
                    </transition>
                </div>
                <div class="splice" v-if="dirListTitle.open">
                    <span></span>
                </div>
                <div class="source-type-tab"
                    :class="['source-type-tab-' + materialType.type , {'active' : activeParentIndex === materialType.key && materialType.open}]"
                    @click="clickParentTab(1)">

                    <div class="source-tabBox" :class="['source-tabBox-' + materialType.type,{'active' : searchStatus}]">
                        <svg class="source-tabBox-svg">
                            <use :xlink:href="'#svg-source-tabBox-' + materialType.type"></use>
                        </svg>

                        <span class="source-tabBox-title" v-text="materialType.title"></span>

                        <svg class="source-tabBox-switch-svg">
                            <use :xlink:href="'#svg-source-tabBox-switch'"></use>
                        </svg>
                    </div>


                    <transition name="only-slide-up">
                        <div v-if="activeParentIndex === materialType.key && materialType.open" class="source-childlist">
                            <div v-show="!item.isSpecialShow" rippleColor="#ff7733" class="child-box" v-for="(item,index) in materialType.child"
                            :class="{'active' : activeMaterialChild && activeMaterialChild.id == item.id}"
                            @click.stop="clickMaterialChild({'item':item})">

                                <span class="child-box-name" v-text="item.name"></span>
                            </div>
                        </div>
                    </transition>
                </div>

                <div class="splice" v-if="activeParentIndex === materialType.key && materialType.open">
                    <span></span>
                </div>
                <div class="source-type-tab source-type-tab-custom">
                    <transition name="only-slide-up">
                    <div class="source-childlist my-list" @click.stop="clickParentTab(-1)">
                        <image-source-dir class="source-childlist-header" :item="myCollection" @click="clickCollection(myCollection)" :class="{'active' : activeUploadChild && activeUploadChild.id == myCollection.id}"></image-source-dir>
                    </div>
                    </transition>
                </div>
            </aside>

            <div class="image-box" :style="{'overflow':isLoading?'hidden':'auto'}">
                <div class="upload-item-box" v-show="activeParentIndex === 0" ref="uploadContainer">
                    <div class="upload-line">
                        <div :class="['manage-btn',uploadItem.length < 1 ? 'disable' : '']" @click="manageStatus">
                            <svg class="svg-complate" v-if="uploadManageStatus"><use xlink:href="#svg-source-complate-img"></use></svg>
                            <svg v-else><use xlink:href="#svg-ele-upload-setting"></use></svg>
                            <span :class="uploadManageStatus?'text-complate':''">{{uploadManageStatus ? '完成管理' : '批量管理'}}</span>
                        </div>
                        <div class="upload-storage" @click.stop v-if="!uploadManageStatus">
                            <div class="slide">
                                <div class="slide-bar" :style="sizeBarStyle"></div>
                                <div class="storage-size">{{filterNowSize}}/{{filterMaxSize}}</div>
                            </div>
                            <div class="storage-text clearfix">
                                <div class="storage-up has-tips" tips="暂不支持">
                                    <span>扩充<svg class="svg"><use xlink:href="#svg-source-tabBox-switch"></use></svg></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="boxLoading" v-show="isLoading">
                        <div class="loadingImage"></div>
                        <div class="TextShow">加载中</div>
                    </div>
                    <div class="upload-item-container" ref="uploadItemContainer" @scroll="scrolled($event)" v-show="!isLoading">
                        <div class="upload-list clearfix" :style="{'margin-bottom':(uploadManageStatus ? 80 : 0) + 'px'}">
                            <div class="upload-btn" :class="{disabled:uploadManageStatus}" v-show="uploadItem.length > 0">
                                <div class="upload-content" @click.stop="uploadBtnClick">
                                    <svg><use xlink:href="#svg-ele-modal-add"></use></svg>
                                    <div>上传图片</div>
                                </div>
                                <div class="isHover" v-if="isUIManage && isGifTemplate">JPG/PNG/SVG/GIF &nbsp;大小不超{{this.file_size_limit}}M</div>
                                <div class="isHover" v-else>支持JPG/PNG/SVG 大小不超{{this.file_size_limit}}M</div>
                            </div>
                            <div v-if="uploadItem.length < 1" class="no-upload">
                                <div class="no-item-img"></div>
                                <div class="no-item-text">还没有上传素材</div>
                                <div class="no-item-btn-group">
                                    <label class="no-item-btn orange" :for="'select_btn_' + upload.instanceID"  @click.stop="uploadBtnClick">本地上传</label>
                                    <div class="no-item-btn"  @click.stop="phoneUploadBtnClick">手机上传</div>
                                </div>
                                </div>
                            <div class="upload-item" :class="{'checked':item.checked}" v-for="(item,index) in uploadItem" :key="index" ref="uploadItem" v-else>
                                <div class="upload-item-btn upload-item-manage" :class="{'checked':item.checked}" v-show="uploadManageStatus">
                                    <div v-show="item.checked" class="upload-item-checked">
                                        <svg>
                                            <use xlink:href="#svg-ele-checked"></use>
                                        </svg>
                                    </div>
                                </div>
                                <div class="upload-item-bg" :class="{'isHover':item.isHover}" @click="useUploadImg(item)">
                                    <div class="ele-upload-ing" v-if="item.isUploading || (item.uploadPercent && item.uploadPercent < 99)" @click.stop="uploadingTips">
                                        <div class="upload-ing-slide">
                                            <div class="upload-ing-bar" :style="{width: item.uploadPercent+'%'}"></div>
                                        </div>
                                    </div>
                                    <div class="upload-item-btn-container">
                                        <div class="upload-item-btn upload-item-operate" v-show="!uploadManageStatus" @click.stop="openUploadMenu($event,item)">
                                            <svg>
                                                <use xlink:href="#svg-source-more-icon"></use>
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="nameMask" v-if="!item.edit">
                                        <div class="upload-item-name ellipsis" :title="item.n" v-text="item.n"></div>
                                    </div>
                                    <svg class="corner-mark"  v-if="isGifMaterial(item) && !uploadManageStatus">
                                        <use xlink:href="#svg-corner-mark"></use>
                                    </svg>
                                    <img :src="item.sp160p || item.p160p || item.p" class="upload-img" v-if="!isGifMaterial(item)">
                                    <img :src="item.p" class="upload-img" v-else>
                                </div>
                                <div class="nameInputBox" v-if="item.edit">
                                    <input  type="text" class="upload-item-input" :value="item.n" :title="item.n" @keyup.enter="changeItemName($event,item,true)" @blur="changeItemName($event,item)" maxLength="30" />
                                </div>
                            </div>
                        </div>
                        <page v-show="!uploadManageStatus && !isLoading && uploadTotal > uploadGetLimit" :current="uploadIndex+1" :page-size="uploadGetLimit" :total="uploadTotal" @on-change="uploadPageChange"></page>
                    </div>

                    <Menu v-if="showUploadMenu" :offsetLeft="-75" :offsetTop="18" :item="activeUploadItem" :position="uploadPosition" :operateList="activeUploadItem.isCollect?uploadOperateListCollect:uploadOperateListNoCollect" @execOperate="uploadOperate" @hoverOperate="hoverOperate" @close="closeUploadMenu"></Menu>

                    <div class="ele-dir-list" v-if="showDirListMenu" :style="dirListPosition">
                        <div v-if="item.id != -1" class="line" v-for="(item,index) in dirList" @click="moveImg(item)" :class="{'active':item.id == activeDir.id}">
                            <svg class="line-icon">
                                <use xlink:href="#svg-img-modal-dir"></use>
                            </svg>
                            <div class="line-name ellipsis">{{item.name}}</div>
                            <svg class="line-active-icon" v-show="item.id == activeDir.id">
                                <use xlink:href="#svg-tool-sure"></use>
                            </svg>
                        </div>
                    </div>
                </div>
                <div class="upload-manage-box" v-if="activeParentIndex === 0 && uploadManageStatus">
                    <!--<check-box class="check-box manage-btn" :value="checkedAll" @input="checkAllInput">全选</check-box>-->
                    <div class="manage-boxleft">
                        <div :class="['manage-btn theme',checkedAll?'active':'']" @click.stop="checkAllInput">
                            <div class="svgBox">
                                <svg class="svg"><use :xlink:href="checkedAll?'#svg-source-choose':'#svg-source-choose-border'"></use></svg>
                            </div>
                            <span>{{checkedAll?'取消全选':'全选'}}</span>
                        </div>
                        <div class="hasSelectedNum">
                            <p>已选中<span>{{checkedItem.length}}</span>张</p>
                        </div>
                    </div>
                    <div class="manage-boxright">
                        <div class="manage-btn theme" :class="{disabled:checkedItem.length === 0}" @click.stop="batchMoveImg">
                            <div class="svgBox">
                                <svg class="svg"><use xlink:href="#svg-source-move-img"></use></svg>
                            </div>
                            <span>移动</span>
                        </div>
                        <div class="manage-btn theme" :class="{disabled:checkedItem.length === 0}" @click="batchDelImg">
                            <div class="svgBox">
                                <svg class="svg"><use xlink:href="#svg-source-trash-img"></use></svg>
                            </div>
                            <span>删除</span>
                        </div>
                        <div class="split"></div>
                        <div class="manage-btn finish" @click="manageStatus">完成管理</div>
                        <div class="manage-btn cancel" @click="manageStatus">取消</div>
                    </div>
                </div>
                <div class="upload-manage-box" v-if="activeParentIndex === -1 && uploadManageStatus">
                    <!--<check-box class="check-box manage-btn" :value="checkedAll" @input="checkAllInput">全选</check-box>-->
                    <div class="manage-boxleft">
                        <div :class="['manage-btn theme',checkedCollectionAll?'active':'']" @click.stop="checkAllCollection">
                            <div class="svgBox">
                                <svg class="svg"><use :xlink:href="checkedCollectionAll?'#svg-source-choose':'#svg-source-choose-border'"></use></svg>
                            </div>
                            <span>{{checkedCollectionAll?'取消全选':'全选'}}</span>
                        </div>
                        <div class="hasSelectedNum">
                            <p>已选中<span>{{checkedCollectionItem.length}}</span>张</p>
                        </div>
                    </div>
                    <div class="manage-boxright">
                        <div class="manage-btn theme" :class="{disabled:checkedCollectionItem.length === 0}" @click="delCollect">
                            <div class="svgBox">
                                <svg class="svg"><use xlink:href="#svg-source-trash-img"></use></svg>
                            </div>
                            <span>取消收藏</span>
                        </div>
                        <div class="split"></div>
                        <div class="manage-btn finish" @click="collectStatus">完成管理</div>
                        <div class="manage-btn cancel" @click="collectStatus">取消</div>
                    </div>
                </div>

                <div class="material-item-box" v-show="activeParentIndex === 1" ref="materialContainer">
                    <div class="top">
                        <image-source-material-topic v-show="materialTopic.length > 0 && !searchStatus" :showLength="modalClassObj[modalType]._nl" :materialTopic="materialTopic" :materialTopicValue="materialTopicValue" @click="clickMaterialTopic"></image-source-material-topic>
                        <div class="search-type-box" v-show="searchStatus">
                            <div class="search-type-item" :class="{active:searchType == item.type}" @click="changeSearchType(item.type)" v-for="(item,index) in searchTypeArr">
                            {{item.name}}</span>
                            </div>
                        </div>
                        <div class="search-input-box">
                            <validate-input
                                placeholder="输入关键词，按Enter搜索素材"
                                class="search-input nav-title-input"
                                @keyup.enter.native="searchMaterial"
                                @click="searchShow"
                                @focus="focusInput"
                                @blur="blurInput"
                                @onInput="changeData"
                                v-model="searchVal"
                                :inputVal="searchVal"
                                style="width:240px"
                            >
                            </validate-input>
                            <svg class="search-input-icon" v-if="showItemList && searchVal == lastSearchVal" @click="clearSearch">
                                <use xlink:href="#svg-ele-search-clear"></use>
                            </svg>
                            <svg v-else class="search-input-icon" @click="searchMaterial">
                                <use xlink:href="#svg-ele-search-input"></use>
                            </svg>
                            <transition name="slide-up">
                                <div class="search-lastest-box" v-show="isSearchShow && lastestSearchs.length > 0" tabindex="-1" @blur="hideHistory">
                                    <div class="search-lastest-title">
                                        <span>历史搜索</span>
                                        <span class="clear-history" @click="clearLastestSearch">清空记录</span>
                                    </div>
                                    <div class="search-lastest-item-box clearfix">
                                        <div class="search-lastest-item" v-for="(item,index) in lastestSearchs" @click="lastestSearch(item)">{{item}}</div>
                                    </div>
                                </div>
                            </transition>
                        </div>

                    </div>

                    <div class="material-item-list" @scroll="scrolled">
                        <div class="container" :style="{height:waterFallHeight + 'px'}">
                            <div class="material-item" :class="materialClass(item.sourceData)" v-for="(item,index) in showData"
                            :style="item.style" @click="useImg(item.sourceData)">
                                <div class="material-item-copyright-icon"
                                    :class="{'other':copyrightArr.indexOf(item.sourceData.comeFrom) > 0,
                                    'nocopyright' : copyrightArr.indexOf(item.sourceData.comeFrom) < 0,
                                    'active' : item.sourceData.showCopyright}"
                                    @click.stop
                                    @mouseenter="hoverCopyrightBtn($event,item.sourceData)"
                                    @mouseleave="wantToCloseInfo">
                                    <svg class="copyright-icon copyright-icon-other" v-if="copyrightArr.indexOf(item.sourceData.comeFrom) > 0"><use xlink:href="#svg-copyright-other"></use></svg>
                                    <svg class="copyright-icon copyright-icon-nocopyright" v-if="copyrightArr.indexOf(item.sourceData.comeFrom) < 0"><use xlink:href="#svg-copyright-nocopyright"></use></svg>
                                    <svg class="copyright-icon copyright-icon-normal" v-if="copyrightArr.indexOf(item.sourceData.comeFrom) == 0"><use xlink:href="#svg-copyright-normal"></use></svg>
                                </div>
                                <div class="material-item-collection" @click.stop="changeCollectionState(item)">
                                    <svg class="svg-collection-have" v-if="item.sourceData.isCollect">
                                        <use xlink:href="#svg-collection-icon"></use>
                                    </svg>
                                    <svg class="svg-collection-nohave" v-else>
                                        <use xlink:href="#svg-collection-icon"></use>
                                    </svg>
                                </div>
                                <img class="material-item-img" :src="waterItemImg(item)">
                            </div>
                        </div>
                        <div class="search-no-tip" v-show="searchStatus && noResult">
                            <div class="search-no-tip-img"></div>
                            <div class="search-no-tip-text">抱歉，没有找到<span class="search-no-tip-value">"{{lastSearchVal}}"</span>相关素材，</div>
                            <div class="search-no-tip-text">我们已积累你的需求，换一个关键词试试？</div>
                        </div>
                        <page v-show="!isLoading && materialTotal > materialGetLimit" :current="materialIndex+1" :page-size="materialGetLimit" :total="materialTotal" @on-change="materialPageChange"></page>
                    </div>
                    <copyright v-if="showCopyright"
                        :item="activeMaterial"
                        :position="copyrightPosition"
                        @close="closeCopyrightInfo"
                        @enter="enterCopyrightInfo">
                    </copyright>
                </div>
                <div class="collection-item-box upload-item-box" v-show="activeParentIndex === -1">
                    <div class="upload-line">
                        <div :class="['manage-btn',collectionItem.length < 1 ? 'disable' : '']" @click="collectStatus">
                            <svg class="svg-complate" v-if="uploadManageStatus"><use xlink:href="#svg-source-complate-img"></use></svg>
                            <svg v-else><use xlink:href="#svg-ele-upload-setting"></use></svg>
                            <span :class="uploadManageStatus?'text-complate':''">{{uploadManageStatus ? '完成管理' : '批量管理'}}</span>
                        </div>
                        <div class="collectionType" v-if="!uploadManageStatus">
                            类型：<div class="typeTips" @mouseover="showOptions" @mouseout="hiddenOptions">
                                    {{searchOption==-1?'全部':(searchOption==0?'高清大图':(searchOption==1?'免抠PNG':(searchOption==20?'其他':'矢量素材')))}}
                                    <div class="select-class-triangle" :class="showOption?'active':''"></div>
                                    <div class="optionBox" :class="showOption?'active':''"  @mouseover="showOptions" @mouseout="hiddenOptions">
                                        <div class="select-class-options">
                                            <div v-for="item in selectOption" class="option" @click="changeSearchOption(item.type)">{{item.name}}</div>
                                        </div>
                                    </div>
                                 </div>
                        </div>
                    </div>
                    <div class="boxLoading" v-show="isLoading">
                        <div class="loadingImage"></div>
                        <div class="TextShow">加载中</div>
                    </div>
                    <div class="upload-item-container" ref="uploadItemContainer" @scroll="scrolled($event)" v-show="!isLoading">
                        <div class="upload-list clearfix" :style="{'margin-bottom':(uploadManageStatus ? 80 : 0) + 'px'}">
                            <div v-if="collectionItem.length < 1" class="no-upload">
                                <div class="no-item-img"></div>
                                <div class="no-item-text">还没有收藏素材</div>
                            </div>
                            <div class="upload-item" :class="{'checked':item.checked}" v-for="(item,index) in collectionItem" ref="collectionItem" v-else>
                                <div class="upload-item-btn upload-item-manage" :class="{'checked':item.checked}" v-show="uploadManageStatus">
                                    <div v-show="item.checked" class="upload-item-checked">
                                        <svg>
                                            <use xlink:href="#svg-ele-checked"></use>
                                        </svg>
                                    </div>
                                </div>
                                <div class="upload-item-bg" @click="useCollectionImg(item)">
                                    <div class="material-item-collection" v-show="!uploadManageStatus" @click.stop="delCollection(item)">
                                        <svg class="svg-collection-have">
                                            <use xlink:href="#svg-collection-icon"></use>
                                        </svg>
                                    </div>
                                    <svg class="corner-mark" v-if="isGifMaterial(item) && !uploadManageStatus">
                                        <use xlink:href="#svg-corner-mark"></use>
                                    </svg>
                                    <img :src="waterItemImg(item)" class="upload-img" >
                                </div>
                            </div>
                        </div>
                        <page v-show="!uploadManageStatus && !isLoading && collectionTotal > collectionGetLimit" :current="collectionIndex+1" :page-size="collectionGetLimit" :total="collectionTotal" @on-change="collectionPageChange"></page>
                    </div>

                    <Menu v-if="showUploadMenu" :offsetLeft="-75" :offsetTop="18" :item="activeUploadItem" :position="uploadPosition" :operateList="activeUploadItem.isCollect?uploadOperateListCollect:uploadOperateListNoCollect" @execOperate="uploadOperate" @close="closeUploadMenu"></Menu>

                    <div class="ele-dir-list" v-if="showDirListMenu" :style="dirListPosition">
                        <div v-if="item.id != -1" class="line" v-for="(item,index) in dirList" @click="moveImg(item)" :class="{'active':item.id == activeDir.id}">
                            <svg class="line-icon">
                                <use xlink:href="#svg-img-modal-dir"></use>
                            </svg>
                            <div class="line-name">{{item.name}}</div>
                            <svg class="line-active-icon" v-show="item.id == activeDir.id">
                                <use xlink:href="#svg-tool-sure"></use>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </modal>
    `,
    name: 'imageSourceModal',
    mixins: [
        Ktu.mixins.dataHandler,
        Ktu.mixins.popupCtrl,
        Ktu.mixins.uploadSetting,
        Ktu.mixins.normalWaterFall,
        Ktu.mixins.copyright,
        Ktu.mixins.textInContainer,
        Ktu.mixins.materialHandler,
    ],
    props: {
        isOpen: Boolean,
        modelMask: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            // 屏幕大小
            screenWidth: 0,
            // 屏幕高度
            screenHeight: 0,
            /*
                key:modalType   _w:宽度   _cn ：class命名 _nl：nav长度  myWn : upload素材一行多少个, myHn:upload素材有多少行
                _wfo：瀑布流object{ _n:瀑布流个数，key:当前activeChildIndex}
            */
            // x:698  m: 843 l:1003 xl:1163     自适应响应Object
            modalClassObj: {
                _xl: {
                    _w: 1163, _cn: '_xl', _nl: 10, myWn: 6, myHn: 10, _wfo: {
                        default: { _n: 6 },
                        7: { _n: 5 },
                        0: { _n: 5 },
                        1: { _n: 5 },
                        5: { _n: 5 },
                        4: { _n: 3 },
                    },
                },
                _l: {
                    _w: 1003, _cn: '_l', _nl: 8, myWn: 5, myHn: 10, _wfo: {
                        default: { _n: 5 },
                        7: { _n: 4 },
                        0: { _n: 4 },
                        1: { _n: 4 },
                        5: { _n: 4 },
                        4: { _n: 3 },
                    },
                },
                _m: {
                    _w: 843, _cn: '_m', _nl: 5, myWn: 4, myHn: 10, _wfo: {
                        default: { _n: 4 },
                        7: { _n: 3 },
                        0: { _n: 3 },
                        1: { _n: 3 },
                        5: { _n: 3 },
                        4: { _n: 2 },
                    },
                },
                _s: {
                    _w: 698, _cn: '_s', _nl: 2, myWn: 3, myHn: 10, _wfo: {
                        default: { _n: 4 },
                        7: { _n: 3 },
                        0: { _n: 3 },
                        1: { _n: 3 },
                        5: { _n: 3 },
                        4: { _n: 2 },
                    },
                },
            },
            modalType: '_xl',
            materialType:
            /* .
            {
                type: 'custom',
                key: 0,
                title: '我的素材',
                open: true,
                child: [{
                    name: "我的素材",
                    id: -1,
                    hideOperate: true
                }]
            },*/
            {
                type: 'systoms',
                key: 1,
                title: '系统素材',
                open: false,
                child: [
                    {
                        name: '高清图片',
                        id: 0,
                        type: 'pic',
                    },
                    {
                        name: '免抠素材',
                        id: 1,
                        type: 'png',
                    },
                    {
                        name: '矢量插图',
                        id: 6,
                        type: 'svg',
                    },
                    {
                        name: '文字容器',
                        id: 5,
                        type: 'banner',
                    },
                    {
                        name: '线和箭头',
                        id: 4,
                        type: 'line',
                    },
                    {
                        name: '装饰',
                        id: 7,
                        type: 'decoration',
                    },
                    {
                        name: '形状',
                        id: 3,
                        type: 'shape',
                    },
                    {
                        name: '图标',
                        id: 2,
                        type: 'icon',
                    },
                    {
                        name: '内部素材',
                        id: -3,
                        type: 'inner',
                        isSpecialShow: !Ktu._isInternalAcct,
                    },
                    /* {
                       name: "图表",
                       id: 8,
                       type: "chart"
                       } */
                ],
            },
            dirOperateList: [
                {
                    icon: 'ele-dir-edit',
                    label: '重命名',
                    name: 'dirRename',
                },
                {
                    icon: 'ele-remove',
                    label: '删除',
                    name: 'deleteDir',
                },
            ],
            uploadOperateListCollect: [
                {
                    icon: 'ele-dir-edit',
                    label: '重命名',
                    name: 'imgRename',
                },
                {
                    icon: 'contextmenu-unCollection',
                    label: '取消收藏',
                    name: 'delCollect',
                },
                {
                    icon: 'ele-upload-move',
                    label: '移动',
                    name: 'move',
                },
                {
                    icon: 'ele-remove',
                    label: '删除',
                    name: 'deleteImg',
                },
            ],

            isLoading: false,
            activeChildIndex: 0,
            activeParentIndex: 0,
            dirListTitle: {
                name: '我的素材',
                id: -1,
                open: false,
                hideOperate: true,
                hideCount: true,
            },
            myCollection: {
                name: '我的收藏',
                id: -2,
                hideOperate: true,
                hideCount: true,
            },
            selectOption: [
                {
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
            dirList: [],
            dirItem: null,
            dirPosition: null,
            showDirMenu: false,

            activeDir: null,
            dirListPosition: null,
            showDirListMenu: false,
            // 上传相关变量
            showShadow: false,
            uploadPosition: null,
            showUploadMenu: false,
            activeUploadChild: null,
            activeUploadItem: null,
            tmpUploadItem: null,
            uploadManageStatus: false,
            checkedAll: false,
            checkedCollectionAll: false,
            checkedItem: [],
            checkedCollectionItem: [],
            uploadItem: [],
            uploadIndex: 0,
            uploadTotal: 0,
            collectionTotal: 0,
            uploadGetLimit: 0,
            // 搜索相关变量
            searchTypeArr: Ktu.config.search.typeArr,
            searchType: -1,
            searchVal: '',
            lastestSearchs: [],
            lastSearchVal: '',
            showItemList: false,
            searchStatus: false,
            // 素材相关变量
            activeMaterialChild: null,
            materialList: [],
            materialItem: [],
            materialTopic: [],
            materialIndex: 0,
            materialTotal: 0,
            materialTopicValue: -1,
            materialGetLimit: 45,
            collectionGetLimit: 36,
            specialTopic: [23, 80, 81],
            isDrawingSvg: false,
            hoverType: 2,
            debounceTimer: null,
            uploadShowMask: true,
            searchOption: -1,
            collectionIndex: 0,
            collectionItem: [],
            // 历史记录展示面板
            isSearchShow: false,
            isTimeOut: null,
            showOption: false,
        };
    },
    async created() {
        await this.pageStart();
        this.historicalRecord[this.historicalRecordIndex].record = false;
    },
    computed: {
        isUIManage() {
            return Ktu.isUIManage;
        },
        selectedData() {
            return this.$store.state.data.selectedData;
        },
        isOss() {
            return Ktu.isFaier;
        },
        isBackground() {
            return this.selectedData.type == 'background';
        },
        isQrCode() {
            return this.$store.state.base.qrCodeEditor.show;
        },
        // 监听手机上传图片
        phoneUploadImage: {
            get() {
                return this.$store.state.data.phoneUploadImage;
            },
            set(value) {
                this.$store.commit('data/changePhoneUploadImage', value);
            },
        },
        showImageSourceModal: {
            get() {
                return this.$store.state.modal.showImageSourceModal;
            },
            set(newValue) {
                this.$store.commit('modal/imageSourceModalState', {
                    isOpen: newValue,
                });
            },
        },
        // 拖拽上传完毕
        changePicComplete: {
            get() {
                return this.$store.state.base.changePicComplete;
            },
            set(value) {
                this.$store.state.base.changePicComplete = value;
            },
        },
        dropComplete: {
            get() {
                return this.$store.state.base.dropComplete;
            },
            set(value) {
                this.$store.state.base.dropComplete = value;
            },
        },
        historicalRecord: {
            get() {
                return this.$store.state.data.historicalRecord;
            },
            set(value) {
                this.$store.state.data.historicalRecord = value;
            },
        },
        historicalRecordIndex: {
            get() {
                return this.$store.state.data.historicalRecordIndex;
            },
            set(value) {
                this.$store.state.data.historicalRecordIndex = value;
            },
        },
        filterNowSize() {
            // 小与1G
            if (this.uploadNowSize < 1024 * 1024 * 1024) {
                return `${(this.uploadNowSize / 1024 / 1024).toFixed(2)}M`;
            }
            return `${(this.uploadNowSize / 1024 / 1024 / 1024).toFixed(2)}G`;
        },
        filterMaxSize() {
            // 小与1G
            if (this.uploadMaxSize < 1024 * 1024 * 1024) {
                return `${parseInt(this.uploadMaxSize / 1024 / 1024, 10)}M`;
            }
            return `${parseInt(this.uploadMaxSize / 1024 / 1024 / 1024, 10)}G`;
        },
        showPhoneUploadModal: {
            get() {
                return this.$store.state.modal.showPhoneUploadModal;
            },
            set(newValue) {
                this.$store.commit('modal/phoneUploadModal', newValue);
            },
        },
        qrIsTop: {
            get() {
                return this.$store.state.base.qrIsTop;
            },
            set(value) {
                this.$store.state.base.qrIsTop = value;
            },
        },
        // 修改素材里我的收藏列表
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
        uploadOperateListNoCollect() {
            const arr = [
                {
                    icon: 'ele-dir-edit',
                    label: '重命名',
                    name: 'imgRename',
                },
                {
                    icon: 'material-collection',
                    label: '收藏素材',
                    name: 'collect',
                },
                {
                    icon: 'ele-upload-move',
                    label: '移动',
                    name: 'move',
                    otherIcon: 'ele-spread',
                },
                {
                    icon: 'ele-remove',
                    label: '删除',
                    name: 'deleteImg',
                },
            ];
            if (this.activeUploadItem && /\.gif/.test(this.activeUploadItem.p)) {
                arr.splice(1, 1);
            }
            return arr;
        },

    },
    watch: {
        activeParentIndex: {
            handler(value) {
                if (typeof (this.historicalRecordIndex) !== 'number') {
                    this.historicalRecord.push({
                        record: false,
                        type: 'my',
                        activeDir: '',
                        searchOption: '',
                        imageData: '',
                        category: '',
                        page: 0,
                    });
                    this.historicalRecordIndex = this.historicalRecord.length - 1;
                }
                const { record, activeDir, page, category } = _.cloneDeep(this.historicalRecord[this.historicalRecordIndex]);
                if (value == 1) {
                    record ? (
                        Vue.nextTick(async () => {
                            this.searchStatus = false;
                            this.uploadManageStatus = false;
                            this.materialIndex = page;
                            if (category) {
                                this.clickMaterialChild({ item: activeDir, record: true, category: true });
                                Vue.nextTick(() => {
                                    this.clickMaterialTopic(category, true);
                                });
                            } else {
                                this.clickMaterialChild({ item: activeDir, record: true });
                            }
                        })
                    ) : (Vue.nextTick(() => {
                        this.searchStatus = false;
                        this.uploadManageStatus = false;
                        this.clickMaterialChild({ item: this.materialList[0] });
                    }));
                }
            },
            immediate: true,
        },
        phoneUploadImage: {
            deep: true,
            handler(nowVal) {
                if (nowVal == true && this.activeUploadChild) {
                    this.uploadIndex = 0;
                    this.uploadItem = [];
                    this.init(['getDirList', 'getUploadList', 'getUploadStorage']);
                    this.$nextTick(() => {
                        this.phoneUploadImage = false;
                    });
                }
            },
        },
        dropComplete(nowVal) {
            if (nowVal) {
                this.dropComplete = false;
                // 只有选中默认文件夹才刷新
                this.operateAfter();
            }
        },
        changePicComplete() {
            if (nowVal) {
                this.dropComplete = false;
                // 只有选中默认文件夹才刷新
                this.operateAfter();
            }
        },
        checkedItem: {
            immediate: true,
            handler(value) {
                if (value.length == this.uploadItem.length && this.uploadItem.length > 0) {
                    this.checkedAll = true;
                } else {
                    this.checkedAll = false;
                }
            },
        },
        checkedCollectionItem: {
            immediate: true,
            handler(value) {
                if (value.length == this.collectionItem.length && this.collectionItem.length > 0) {
                    this.checkedCollectionAll = true;
                } else {
                    this.checkedCollectionAll = false;
                }
            },
        },
        screenWidth(value) {
            let name;
            if (value >= 1300) {
                name = '_xl';
            } else if (value > 1100) {
                name = '_l';
            } else if (value > 900) {
                name = '_m';
            } else {
                name = '_s';
            }
            this.modalType != name ? (this.modalType = name) : '';
        },
        modalType(value) {
            if (this.searchStatus || this.activeMaterialChild) {
                const targetId = this.searchStatus ? 0 : this.activeMaterialChild.id;
                this.changeWaterFallSize(targetId, value);
                this.showData = [];
                this.computeShow();
            }
        },
        // 监听素材文件夹删除动作
        deleteMaterialSuccess(value) {
            value
                && this.deleteMaterialOrigin === 'modal'
                && this.delDirSuccess();
        },
    },

    mounted() {
        Vue.nextTick(() => {
            this.initUpload('.imageSource-modal .upload-btn');
        });
    },
    methods: {
        searchShow() {
            this.isSearchShow = true;
        },

        isGifMaterial(item) {
            return /gif$/.test(item.p || item.filePath);
        },
        // 文本框失焦
        blurInput() {
            this.isTimeOut = setTimeout(() => {
                this.isSearchShow = false;
            }, 200);
        },
        showHistory() {
            this.isSearchShow = true;
            this.isTimeOut && clearTimeout(this.isTimeOut);
        },
        hideHistory() {
            this.isSearchShow = false;
        },
        logMaterial_use(id) {
            const { activeMaterialChild, materialTopicValue } = this;
            if (!activeMaterialChild || (activeMaterialChild && activeMaterialChild.id == 8)) {
                return;
            }
            this.ajaxLog('logBssForUse', {
                fodderId: JSON.stringify([id]),
                firstSort: JSON.stringify([activeMaterialChild.id]),
                secondSort: JSON.stringify([materialTopicValue]),
            });
        },

        // 选择分类
        changeSearchOption(type) {
            Ktu.log('collect', 'clickMaterialType');
            this.uploadManageStatus = false;
            this.checkedCollectionItem = [];
            this.showOption = false;
            if (this.searchOption != type) {
                this.collectionItem = [];
                this.collectionIndex = 0;
                this.searchOption = type;
                this.historicalRecord[this.historicalRecordIndex].searchOption = type;
                this.getCollection();
            }
        },
        // 获取收藏
        getCollection(type = this.searchOption) {
            const url = '../ajax/ktuCollectFodder_h.jsp?cmd=getCollectList';
            this.isLoading = true;
            axios
                .post(url, {
                    category: type,
                    limitCount: this.collectionGetLimit,
                    scrollIndex: this.collectionIndex,
                    hideVessel: true,
                })
                .then(res => {
                    const info = res.data;
                    if (info.success) {
                        this.collectionItem.forEach(item => {
                            item.checked = false;
                        });
                        this.collectionTotal = info.totalNum;
                        this.collectionItem = info.data;

                        if (this.collectionTotal == 0 || info.data.length == 0) {
                            this.uploadManageStatus = false;
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

        // 显示选择框
        showOptions() {
            if (this.searchOption == -1 && this.collectionItem.length == 0) return;
            this.showOption = true;
        },
        // 隐藏选择框
        hiddenOptions() {
            this.showOption = false;
        },
        logMaterialNav(value) {
            const arrId = [];
            const key = this.activeMaterialChild ? JSON.stringify([this.activeMaterialChild.id]) : '';
            // this.clearLogData();
            arrId.push(value);
            this.ajaxLog('logBssForExposure', {
                firstSort: key,
                secondSort: JSON.stringify(arrId),
            });
        },
        chooseTypeToLog(id) {
            if (id == 8) return;
            const logType = JSON.stringify([id]);
            this.ajaxLog('logBssForExposure', {
                firstSort: logType,
            });
        },
        ajaxLog(type, obj) {
            const url = `../ajax/fodder_h.jsp?cmd=${type}`;
            axios.post(url, obj);
        },
        // 节流函数
        debounce(method, time = 30) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                method.call(this);
            }, time);
        },
        // 页面开始
        pageStart() {
            this.upload = this.upload || {};
            Ktu.tempResFilesList = [];
            // this.dirList = this.materialType[0].child;
            this.materialList = this.materialType.child;
            this.getDirList();
            this.getLaestSearch();
            // 记录屏幕大小
            this.screenWidth = $(window).width();
            this.screenHeight = $(window).height() - 140;
            const { myWn, myHn } = this.modalClassObj[this.modalType];
            this.uploadGetLimit = myWn * myHn - 1;
            // 判断是否有记录 以及去除快捷键打开的场景
            if (this.historicalRecord[this.historicalRecordIndex].record && !Ktu.store.state.base.isImgsourceByHotkey) {
                switch (this.historicalRecord[this.historicalRecordIndex].type) {
                    case 'my':
                        this.uploadIndex = this.historicalRecord[this.historicalRecordIndex].page;
                        this.clickUploadChild({ item: this.historicalRecord[this.historicalRecordIndex].activeDir, type: 1, pageInit: true });
                        break;
                    case 'collection':
                        this.clickParentTab(-1);
                        this.clickCollection(this.myCollection, true);
                        break;
                    case 'system':
                        this.clickParentTab(1);
                        break;
                    default:
                        this.uploadIndex = this.historicalRecord[this.historicalRecordIndex].page;
                        this.clickUploadChild({ item: this.historicalRecord[this.historicalRecordIndex].activeDir, type: 1, pageInit: true });
                        break;
                }
            } else {
                this.clickUploadChild({ item: this.dirListTitle, type: 1 });
            }
            window.onresize = () => {
                this.debounce(() => {
                    this.screenHeight = $(window).height() - 140;
                    this.screenWidth = $(window).width();
                    this.init(['closeDirList', 'closeDirMenu', 'closeUploadMenu', 'closeCopyrightInfo']);
                });
            };
        },
        init(arr = []) {
            arr.map(item => this[item]());
        },
        changeData(e) {
            this.searchVal = e.target.value;
        },
        changeAnimate(value) {
            if (value == 2) {
                clearTimeout(this.mouseenterTimer);
            }
            this.mouseenterTimer = setTimeout(() => {
                if ($('.uploadBox').hasClass('disableBox')) return;
                this.hoverType = value;
            }, 200);
        },
        focusInput(e) {
            e.target.value = e.target.value.replace(/[^\d]/g, '') || '';
        },
        // 切换大类 tab 或者 收起tab
        clickParentTab(value) {
            if (value == 1) {
                if (this.activeParentIndex != this.materialType.key) {
                    this.materialType.open = true;
                    this.activeChildIndex = 0;
                } else {
                    this.materialType.open = !this.materialType.open;
                }
            }
            const typeList = ['collection', 'my', 'system'];
            this.historicalRecord[this.historicalRecordIndex].type = typeList[value + 1];
            typeList[value + 1] == 'my' ? this.historicalRecord[this.historicalRecordIndex].searchOption = -1 : '';
            this.activeParentIndex = value;
        },
        // 切换 上传类型的 tab
        clickUploadChild({ item, type = 0, init = true, pageInit = false }) {
            this.showDirListMenu = false;
            if (this.activeDir === item) {
                this.activeDir = [];
            } else {
                this.activeDir = item;
            }
            if (type == 1) {
                this.dirListTitle.open = !this.dirListTitle.open;
            }
            if (this.activeUploadChild && this.activeUploadChild.id == item.id) {
                return;
            }
            this.historicalRecord[this.historicalRecordIndex].activeDir = item;
            this.materialType.open = false;
            pageInit ? '' : this.uploadIndex = 0;
            this.uploadItem = [];
            this.checkedItem = [];
            this.uploadManageStatus = false;
            this.searchStatus = false;
            this.activeUploadChild = item;
            this.init(['getUploadList', 'closeUploadMenu', 'closeDirMenu']);
        },

        clickCollection(item, record = false) {
            this.materialType.open = false;
            this.dirListTitle.open = false;
            if (this.activeDir === item) return;
            this.activeUploadChild = item;
            this.activeDir = item;
            if (record) {
                this.collectionIndex = this.historicalRecord[this.historicalRecordIndex].page;
                this.searchOption = this.historicalRecord[this.historicalRecordIndex].searchOption;
            } else {
                this.collectionIndex = 0;
            }
            this.collectionItem = [];
            this.checkedCollectionItem = [];
            this.uploadManageStatus = false;
            this.searchStatus = false;
            this.init(['getCollection', 'closeDirMenu', 'closeUploadMenu']);
        },
        // 切换 素材类型的 tab
        clickMaterialChild({ item, record = false, category = false }) {
            this.showDirListMenu = false;
            this.dirListTitle.open = false;
            this.activeUploadChild = null;
            this.activeDir = null;
            if (this.activeMaterialChild === item) return;
            // 统计一级栏目瀑光
            this.chooseTypeToLog(item.id);
            !record ? this.materialIndex = 0 : '';
            console.log(this.materialIndex);
            this.materialItem = [];
            this.searchStatus = false;
            this.uploadManageStatus = false;
            const materialTopic = Object.assign([], Ktu.config.material[item.type]);
            this.materialTopic = materialTopic;
            if (materialTopic.length > 0) {
                materialTopic.unshift({
                    key: -1,
                    name: '全部',
                });
            }
            this.historicalRecord[this.historicalRecordIndex].activeDir = item;
            this.materialTopicValue = -1;
            this.activeMaterialChild = item;
            this.changeWaterFallSize(item.id);
            const actionList = ['closeCopyrightInfo', 'closeDirMenu', 'closeUploadMenu'];
            !category ? actionList.push('getMaterial') : '';
            this.init(actionList);
        },
        // 切换 素材类型的 主题
        clickMaterialTopic(item, record = false) {
            // 记录二级栏目
            this.logMaterialNav(item.key);
            !record ? this.materialIndex = 0 : '';
            this.materialItem = [];
            this.materialTopicValue = item.key;
            this.getMaterial();
        },
        // 弹窗滚动的方法 用来清空一些变量
        scrolled(event) {
            this.debounce(() => {
                this.init(['closeDirList', 'closeDirMenu', 'closeUploadMenu', 'closeCopyrightInfo']);
            }, 100);
        },
        uploadScrolled(event) {
            this.debounce(() => {
                if (event && event.target) {
                    const { scrollTop, clientHeight, scrollHeight } = event.target;
                    const show = (scrollTop + clientHeight) < (scrollHeight - 9);
                    this.uploadShowMask = show;
                }
            });
        },
        // 改变瀑布类型的 个数 和 宽度  （素材类型使用
        changeWaterFallSize(materialId, type = this.modalType) {
            const obj = this.modalClassObj[type];
            const _wfo = obj._wfo[materialId] || obj._wfo.default;
            const imgModal = $(this.$refs.imageSourceModalBox);
            const _leftW = imgModal.find('.image-aside').width();
            const _margin = parseInt(imgModal.find('.material-item-list .container').css('marginLeft'), 10);
            const svgMargin = 10;
            // 获取内容宽度
            const contentW = obj._w - _leftW - _margin * 2 - (_wfo._n - 1) * svgMargin;
            this.colWidth = contentW / _wfo._n;
            this.colNum = _wfo._n;
        },

        // 获取文件夹列表
        getDirList() {
            const url = '../ajax/ktuGroup_h.jsp?cmd=getKtuGroupList';

            axios
                .post(url, {})
                .then(res => {
                    const info = res.data;
                    if (info.success) {
                        let num = 0;
                        // 重置
                        this.dirList = [];
                        // 给id为0 即 默认文件夹添加属性
                        info.ktuGroupList.map(item => {
                            if (item.id === 0) {
                                item.hideOperate = true;
                            }
                            item.edit = false;
                            // 总数
                            num += item.ktuCount;
                            return false;
                        });
                        this.dirListTitle.ktuCount = num;
                        this.dirList.push(...info.ktuGroupList);
                    }
                    // this.$forceUpdate();
                })
                .catch(err => {
                    this.$Notice.error(err);
                })
                .finally(() => { });
        },
        // 显示 文件夹操作 菜单
        openDirMenu(event, item) {
            const { target } = event;
            const position = target.getBoundingClientRect();
            const dirListPosition = this.$refs.dirList.getBoundingClientRect();
            if (!this.showDirMenu) {
                this.showDirMenu = true;
                this.dirItem = item;
                this.dirPosition = {
                    top: position.top - dirListPosition.top,
                };
            } else {
                this.closeDirMenu();
            }
        },
        // 关闭 文件夹菜单
        closeDirMenu() {
            this.showDirMenu = false;
            this.dirItem = null;
        },
        // 文件夹菜单的 具体操作
        dirOperate({ item, operateName }) {
            const operate = {
                dirRename: () => {
                    item.edit = true;
                    this.$forceUpdate();
                },
                deleteDir: () => {
                    this.deleteMaterialDir = item;
                    const getListUrl = '../ajax/ktuImage_h.jsp?cmd=getList';

                    axios
                        .post(getListUrl, {
                            groupId: this.deleteMaterialDir.id,
                            type: $.toJSON(this.file_setting_type_list),
                            scrollIndex: this.scrollIndex,
                            getLimit: 1,
                            isGetCount: true,
                        })
                        .then(res => {
                            const info = res.data;
                            if (info.success) {
                                return info.count;
                            }
                        })
                        .then(count => {
                            // 删除来源 modal
                            this.deleteMaterialOrigin = 'modal';
                            if (count > 0) {
                                // 打开弹窗
                                this.$store.commit('modal/deleteMaterialModalState', true);
                            } else {
                                // 传true 直接删除
                                this.delDir(true);
                            }
                        });
                },
            };
            operate[operateName]();
            this.init(['closeDirMenu']);
        },
        // 增加文件夹
        addDir() {
            if (this.dirList.length >= 30) {
                this.$Notice.warning('文件夹已超出30个');
                return false;
            }
            const url = '../ajax/ktuGroup_h.jsp?cmd=addKtuGroup';

            axios
                .post(url, {
                    name: '新建文件夹',
                })
                .then(res => {
                    const info = res.data;
                    if (info.success) {
                        this.dirList.push({
                            name: '新建文件夹',
                            id: info.id,
                        });
                        Ktu.log('uploadManage', 'addDir');
                        this.$Notice.success(info.msg);
                        // 添加完毕后 默认可以编辑
                        Vue.nextTick(() => {
                            this.dirList[this.dirList.length - 1].edit = true;
                        });
                    } else {
                        this.$Notice.error(info.msg);
                    }
                })
                .catch(err => {
                    this.$Notice.error(err);
                })
                .finally(() => { });
        },
        delDirSuccess() {
            this.init(['getUploadStorage', 'getDirList']);
            Ktu.log('uploadManage', 'delDir');
            // 如果是删除当前文件夹 跳转到默认文件夹
            if (this.deleteMaterialDir.id === this.activeDir.id) {
                this.clickUploadChild({ item: this.dirList[0], init: false });
            }
        },
        // 展示 所有文件夹列表
        showDirList(obj) {
            this.showDirListMenu = true;
            this.tmpUploadItem = obj.item;
            this.dirListPosition = {
                top: obj.top,
                bottom: obj.bottom,
                left: obj.left,
                right: obj.right,
            };
            document.addEventListener('click', this.closeDirList);
        },
        // 关闭 文件夹列表
        closeDirList() {
            if (this.showDirListMenu) {
                this.showDirListMenu = false;
                this.tmpUploadItem = null;
                this.dirListPosition = null;
                document.removeEventListener('click', this.closeDirList);
            }
        },

        // 上传页面 菜单的具体操作
        uploadOperate({ event, item, operateName }) {
            if (operateName != 'move') {
                const operate = {
                    deleteImg: () => {
                        this.sureToDeleteImg(item);
                    },
                    imgRename: () => {
                        this.editItemName(item);
                    },
                    collect: () => {
                        this.changeCollectMaterial(item);
                    },
                    delCollect: () => {
                        this.changeCollectMaterial(item);
                    },
                };
                operate[operateName]();
                this.closeUploadMenu();
            }
        },
        hoverOperate({ event, item, operateName }) {
            if (operateName == 'move') {
                const { target } = event;
                const position = target.getBoundingClientRect();
                const containerPosition = this.$refs.uploadContainer.getBoundingClientRect();
                let top = position.top - containerPosition.top;
                let left = position.left - containerPosition.left + position.width + 4;

                if (top + 202 > containerPosition.height) {
                    top = containerPosition.height - 202;
                }
                if (left + 171 > containerPosition.width) {
                    left = position.left - containerPosition.left - 171;
                }
                this.showDirList({
                    item,
                    top: `${top}px`,
                    left: `${left}px`,
                });
            } else {
                this.closeDirList();
            }
        },
        // 改变收藏素材的状态
        changeCollectMaterial(item) {
            const url = item.isCollect ? '../ajax/ktuCollectFodder_h.jsp?cmd=del' : '../ajax/ktuCollectFodder_h.jsp?cmd=add';
            axios.post(url, {
                category: 20,
                resourceId: item.i,
            }).then(res => {
                const { data } = res;
                if (data.success) {
                    if (item.isCollect) {
                        Ktu.log('collect', 'collection');
                    } else {
                        Ktu.log('collect', 'disCollection');
                    }
                    Ktu.templateData.forEach(({ objects }) => {
                        objects.forEach(item2 => {
                            if (item2.fileId) {
                                item2.fileId === item.i ? item2.isCollect = !item2.isCollect : '';
                            } else if (item2.image) {
                                item2.image.fileId == item.i ? item2.isCollect = !item2.isCollect : '';
                            }
                            // item.fileId ? (item.fileId === info.sourceData.resourceId ? item.isCollect = !item.isCollect : '') : (item.image ? (item.image.fileId == info.sourceData.resourceId ? item.isCollect = !item.isCollect : '') : '');
                        });
                    });
                    this.shouldRefreshList.includes(item.i) ? '' : this.shouldRefreshList.push(item.i);
                    this.uploadItem = this.uploadItem.filter(item2 => {
                        if (item2.i == item.i) {
                            item2.isCollect = !item2.isCollect;
                        }
                        return true;
                    });
                    this.materialItem = this.materialItem.filter(item2 => {
                        if (item2.resourceId == item.i) {
                            item2.isCollect = !item2.isCollect;
                        }
                        return true;
                    });
                }
            })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => { });
        },
        // 批量移动图片
        batchMoveImg(event) {
            if (this.checkedItem.length == 0) return;
            const status = this.showDirListMenu;
            const position = event.target.getBoundingClientRect();
            const containerPosition = this.$refs.uploadContainer.getBoundingClientRect();
            const _x = position.left - containerPosition.left + 5;
            // 定位
            const _y = containerPosition.bottom - position.bottom + 25;
            if (status) {
                this.closeDirList();
            } else {
                this.showDirList({
                    bottom: `${_y}px`,
                    left: `${_x}px`,
                });
            }
        },
        // 批量删除图片
        batchDelImg() {
            if (this.checkedItem.length == 0) return;
            this.$Modal.confirm({
                content: `共计${this.checkedItem.length}张素材，要删除它们吗？`,
                okText: '删除',
                okBtnType: 'warn',
                onOk: () => {
                    this.deleteImg(this.checkedItem);
                },
            });
        },

        // 取消收藏
        delCollect() {
            if (this.checkedCollectionItem.length > 0) {
                const tip = `确定要取消收藏选中的${this.checkedCollectionItem.length}个素材吗？`;
                this.$Modal.confirm({
                    content: tip,
                    okBtnType: 'warn',
                    onOk: () => {
                        const list = [];
                        this.checkedCollectionItem.forEach(item => {
                            list.push(item.resourceId);
                        });
                        const url = '../ajax/ktuCollectFodder_h.jsp?cmd=delList';
                        axios.post(url, {
                            idList: JSON.stringify(list),
                        })
                            .then(res => {
                                const { data } = res;
                                if (data.success) {
                                    this.$Notice.success('取消收藏成功');
                                    Ktu.log('collect', 'disCollection');
                                    this.checkedCollectionItem.forEach(info => {
                                        Ktu.templateData.forEach(({ objects }) => {
                                            objects.forEach(item => {
                                                if (item.fileId) {
                                                    item.fileId === info.resourceId ? item.isCollect = !item.isCollect : '';
                                                } else if (item.image) {
                                                    item.image.fileId == info.resourceId ? item.isCollect = !item.isCollect : '';
                                                }
                                            });
                                        });
                                    });
                                    if (this.collectionItem.length == this.checkedCollectionItem.length && this.collectionIndex > 0) {
                                        this.collectionIndex--;
                                    } else {

                                    }
                                    this.getCollection();
                                    this.checkedCollectionItem = [];
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
        sureToDeleteImg(item) {
            this.$Modal.confirm({
                content: '确定删除当前素材吗？',
                okBtnType: 'warn',
                onOk: () => {
                    this.deleteImg(item);
                },
            });
        },
        // 删除图片  单个与批量共用
        deleteImg(item) {
            let imgIdList = [];
            const url = '../ajax/ktuImage_h.jsp?cmd=delToRecycle';

            if (Array.isArray(item)) {
                imgIdList = item.map(item => item.i);
            } else {
                imgIdList.push(item.i);
            }
            axios
                .post(url, {
                    imgIdList: JSON.stringify(imgIdList),
                })
                .then(res => {
                    const info = res.data;
                    if (info.success) {
                        if (Array.isArray(item)) {
                            this.uploadTotal -= item.length;
                            this.checkedItem = [];
                            Ktu.log('uploadManage', 'delBatch');
                        } else {
                            this.uploadTotal--;
                            Ktu.log('uploadManage', 'delSingle');
                        }
                        this.$Notice.success('删除成功');
                        Ktu.log('materialModal', 'delete');
                        this.getUploadStorage();

                        this.operateAfter();
                    } else {
                        this.$Notice.warning(info.msg);
                    }
                })
                .catch(err => {
                    this.$Notice.error(err);
                });
        },
        // 移动图片  单个与批量共用
        moveImg(dir) {
            let imgIdList = [];
            const url = '../ajax/ktuImage_h.jsp?cmd=setImgToGroup';

            if (dir.id == this.activeDir.id) {
                return;
            }

            if (this.checkedItem.length > 0) {
                imgIdList = this.checkedItem.map(item => item.i);
            } else {
                imgIdList.push(this.tmpUploadItem.i);
            }

            axios
                .post(url, {
                    groupId: dir.id,
                    imgIdList: JSON.stringify(imgIdList),
                })
                .then(res => {
                    const info = res.data;
                    if (info.success) {
                        if (this.checkedItem.length > 0) {
                            this.uploadTotal -= this.checkedItem.length;
                            this.checkedItem = [];
                            Ktu.log('uploadManage', 'moveBatch');
                        } else {
                            this.uploadTotal--;
                            Ktu.log('uploadManage', 'moveSingle');
                        }
                        this.$Notice.success('移动成功');
                        Ktu.log('materialModal', 'move');
                        this.operateAfter();
                    } else {
                        this.$Notice.warning(info.msg);
                    }
                })
                .catch(err => {
                    console.log('err');
                    this.$Notice.error(err);
                });
        },

        // 显示 上传 的操作菜单
        openUploadMenu(event, item) {
            const { target } = event;
            const position = target.getBoundingClientRect();
            const containerPosition = this.$refs.uploadContainer.getBoundingClientRect();
            if (item != this.activeUploadItem) {
                this.showUploadMenu = true;
                this.activeUploadItem && (this.activeUploadItem.isHover = false);
                this.activeUploadItem = item;
                this.activeUploadItem.isHover = true;
                let top = position.top - containerPosition.top + 7;;
                if (containerPosition.height - position.top + containerPosition.top < 128) {
                    top = top - position.height - 144;
                }

                this.uploadPosition = {
                    top,
                    left: position.left - containerPosition.left + 75 - 140 + 27,
                    width: 140,
                };
            } else {
                this.closeUploadMenu();
            }
        },
        // 关闭 上传菜单
        closeUploadMenu() {
            this.showUploadMenu = false;
            this.uploadPosition = null;
            if (this.activeUploadItem) {
                this.activeUploadItem.isHover = false;
                this.activeUploadItem = null;
            }
        },
        // 获取 上传页面的素材
        getUploadList() {
            const url = '../ajax/ktuImage_h.jsp?cmd=getList';

            this.isLoading = true;
            axios.post(url, {
                groupId: this.activeUploadChild.id,
                type: $.toJSON(this.file_setting_type_list),
                scrollIndex: this.uploadIndex,
                getLimit: this.uploadGetLimit,
                isGetCount: true,
            }).then(res => {
                const info = (res.data);
                if (info.success) {
                    this.uploadTotal = info.count;
                    info.data.forEach(item => {
                        item.isHover = false;
                        item.checked = false;
                    });
                    this.uploadItem.push(...info.data);
                }
                this.closeDirMenu();
            })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        // 上传页面  页面改变
        uploadPageChange(page) {
            this.uploadItem = [];
            this.uploadIndex = page - 1;
            this.getUploadList();
        },
        collectionPageChange(page) {
            this.collectionItem = [];
            this.collectionIndex = page - 1;
            this.getCollection();
        },
        // 点击上传素材的名字 进行编辑模式
        editItemName(item) {
            const itemIndex = this.uploadItem.indexOf(item);
            if (item.edit == undefined) {
                Vue.set(item, 'edit', true);
            } else {
                item.edit = true;
            }
            Vue.nextTick(() => {
                const uploadItem = this.$refs.uploadItem[itemIndex];
                uploadItem.querySelector('.upload-item-input').select();
            });
        },
        // 改变 上传素材的名字
        changeItemName(event, item, isEnter) {
            item.edit = false;
            const nowValue = event.target.value.trim();
            if (nowValue == item.n || nowValue == '' || isEnter) return;
            const url = '../ajax/ktuImage_h.jsp?cmd=set';

            axios
                .post(url, {
                    id: item.i,
                    name: nowValue,
                })
                .then(res => {
                    const info = res.data;
                    if (info.success) {
                        item.n = nowValue;
                        this.$Notice.success('修改成功');
                    } else {
                        this.$Notice.warning(info.msg);
                    }
                })
                .catch(err => {
                    this.$Notice.error(err);
                })
                .finally(() => { });
        },
        // 使用上传素材
        useUploadImg(item) {
            if (this.uploadManageStatus) {
                if (item.checked) {
                    const index = this.checkedItem.indexOf(item);
                    item.checked = false;
                    this.checkedItem.splice(index, 1);
                } else {
                    item.checked = true;
                    this.checkedItem.push(item);
                }
            } else {
                this.useImg(item);
            }
        },
        // 使用收藏素材
        useCollectionImg(item) {
            if (this.uploadManageStatus) {
                if (item.checked) {
                    const index = this.checkedCollectionItem.indexOf(item);
                    item.checked = false;
                    this.checkedCollectionItem.splice(index, 1);
                } else {
                    item.checked = true;
                    this.checkedCollectionItem.push(item);
                }
            } else {
                item.canCollect = true;
                item.isCollect = true;
                if (item.filePath.split('.').pop() == 'svg') {
                    item.type = 81;
                }
                this.useImg(item);
            }
        },
        // 进入上传窗口的 管理模式
        manageStatus() {
            if (this.uploadItem.length) {
                if (this.uploadManageStatus) {
                    this.checkedItem.forEach(item => {
                        item.checked = false;
                    });
                    this.checkedItem = [];
                    this.uploadManageStatus = false;
                } else {
                    this.uploadManageStatus = true;
                }
                Ktu.log('materialModal', 'manage');
            }
        },
        collectStatus() {
            if (this.uploadManageStatus) {
                this.collectionItem.forEach(item => {
                    item.checked = false;
                });
                this.checkedCollectionItem = [];
                this.uploadManageStatus = false;
            } else {
                if (this.collectionItem.length) {
                    this.uploadManageStatus = true;
                }
            }
            Ktu.log('materialModal', 'manage');
        },
        // 管理模式下 全选当前页面的所有素材
        checkAllInput() {
            const { checkedAll } = this;
            if (checkedAll) {
                this.uploadItem.forEach(item => {
                    item.checked = false;
                });
                this.checkedItem = [];
                this.checkedAll = false;
            } else {
                this.uploadItem.forEach(item => {
                    item.checked = true;
                });
                this.checkedItem = Object.assign([], this.uploadItem);
                this.checkedAll = true;
            }
            // this.$forceUpdate();
        },
        checkAllCollection() {
            if (this.checkedCollectionAll) {
                this.collectionItem.forEach(item => {
                    item.checked = false;
                });
                this.checkedCollectionItem = [];
                this.checkedCollectionAll = false;
            } else {
                this.collectionItem.forEach(item => {
                    item.checked = true;
                });
                this.checkedCollectionItem = Object.assign([], this.collectionItem);
                this.checkedCollectionAll = true;
            }
        },

        // 获取 素材
        getMaterial() {
            this.isLoading = true;
            const url = '../ajax/fodder_h.jsp?cmd=getFodderList';
            const materialKey = this.activeMaterialChild.id;
            let postData = {
                category: this.activeMaterialChild.id,
                topic: this.materialTopicValue,
                getLimit: this.materialGetLimit,
                currentPage: this.materialIndex,
            };
            if (postData.category === 6) {
                if (postData.topic === -1) {
                    postData = Object.assign({}, postData, { otherCategorys: 8 });
                } else if (postData.topic === 80) {
                    postData.category = 8;
                    postData.topic = -1;
                }
            }

            axios
                .post(url, postData)
                .then(res => {
                    const info = res.data;
                    if (info.success) {
                        const { data } = info;
                        const tmpArr = data.hits;
                        // 如果快速点击 要判断是不是当前分类
                        if (materialKey == this.activeMaterialChild.id) {
                            this.materialTotal = data.total_size;
                            this.materialItem.push(...tmpArr);
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
        materialPageChange(page) {
            this.materialItem = [];
            this.materialIndex = page - 1;
            if (this.searchStatus) {
                this.getSearchItem();
            } else {
                this.getMaterial();
            }
        },
        // 判断 素材的class
        materialClass(item) {
            const itemTopic = JSON.parse(item.topic);
            let specialTopic = false;
            let itemAutoHeight = false;

            itemTopic.some(topic => {
                if (this.specialTopic.indexOf(topic) >= 0) {
                    specialTopic = true;
                    return true;
                }
                return false;
            });

            if (item.category == 4) {
                itemAutoHeight = true;
            }

            return {
                'material-item-special': specialTopic,
                'material-item-auto-height': itemAutoHeight,
            };
        },
        // 计算 素材的版权信息弹窗的位置
        computedCopyrightPosition(event, item) {
            const { target } = event;
            const position = target.getBoundingClientRect();
            const containerPosition = this.$refs.materialContainer.getBoundingClientRect();
            const top = position.top - containerPosition.top + 16;
            let left = position.left - containerPosition.left;
            if (left + 200 > containerPosition.width) {
                left = containerPosition.width - 200;
            }
            this.copyrightPosition = {
                left: `${left}px`,
                top: `${top}px`,
            };
            this.showCopyright = true;
            this.activeMaterial = item;
            this.activeMaterial.showCopyright = true;
            document.addEventListener('click', this.closeCopyrightInfo);
        },

        // 清空最近搜索记录
        clearLastestSearch() {
            const url = '../ajax/ktuSearchRecord_h.jsp?cmd=del';

            axios
                .post(url, {
                    type: 0,
                })
                .then(res => {
                    const info = res.data;
                    if (info.success) {
                        this.lastestSearchs = [];
                    }
                })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => {
                    // this.isLoading = false;
                });
        },
        // 获取最近搜索记录
        getLaestSearch() {
            const url = '../ajax/ktuSearchRecord_h.jsp?cmd=get';

            axios
                .post(url, {
                    type: 0,
                })
                .then(res => {
                    const info = res.data;
                    if (info.success && info.recordList.searchList) {
                        this.lastestSearchs = JSON.parse(info.recordList.searchList).reverse();
                    }
                })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => {
                    // this.isLoading = false;
                });
        },
        // 根据最近搜索记录 搜索
        lastestSearch(val) {
            this.searchVal = val;
            this.searchMaterial();
            Ktu.log('lastestSearch');
        },
        changeSearchType(type) {
            this.searchType = type;
            if (this.searchVal) {
                this.searchMaterial();
            } else {
                this.clearSearch();
                // this.searchType = type;
            }
        },
        // 搜索素材前的一些操作
        clearSearch() {
            this.showItemList = false;
            this.searchVal = '';
            this.searchType = -1;
            this.searchStatus = false;
            this.materialIndex = 0;
            this.materialItem = [];
            if (this.lastActiveMaterial) {
                this.activeMaterialChild = this.lastActiveMaterial;
                this.lastActiveMaterial = null;
            }
            this.changeWaterFallSize(this.activeMaterialChild.id);
            this.getMaterial();
            this.closeCopyrightInfo();
        },
        // 搜索素材前的一些操作
        searchMaterial() {
            this.searchVal = this.searchVal.replace(/ /g, '');
            if (this.searchVal == '') {
                this.$Notice.warning('请输入关键词');
                return false;
            }
            if (this.searchVal.length > 10) {
                this.$Notice.warning('关键词超过10个字符。');
                return false;
            }

            this.searchStatus = true;
            this.lastSearchVal = this.searchVal;
            this.materialItem = [];
            this.materialIndex = 0;
            this.showItemList = true;
            this.noResult = false;
            if (this.activeMaterialChild) {
                this.lastActiveMaterial = this.activeMaterialChild;
                this.activeMaterialChild = null;
            }
            // 搜索列表 按照默认布局排列
            this.changeWaterFallSize(0);
            this.getSearchItem();
            if (this.lastestSearchs.indexOf(this.searchVal) < 0) {
                this.lastestSearchs.unshift(this.searchVal);
            }
            if (this.lastestSearchs.length > 20) {
                this.lastestSearchs.splice(20);
            }
            Ktu.log('search');
            Ktu.simpleLog('materialModal', 'search');
        },
        // 获取搜索的列表
        getSearchItem() {
            const url = '../ajax/fodder_h.jsp?cmd=getFodderWithKeyWord';
            const thisSearchType = this.searchType;

            this.isLoading = true;

            axios
                .post(url, {
                    type: this.searchType,
                    keyword: this.searchVal,
                    getLimit: this.materialGetLimit,
                    currentPage: this.materialIndex,
                })
                .then(res => {
                    const info = res.data;
                    if (info.success) {
                        const { data } = info;
                        const tmpArr = data.hits;
                        /*
                    如果搜索慢时 还没出结果就切换 会把新数据导入新的搜索中
                    这里防止这种情况
                    */
                        if (thisSearchType != this.searchType) {
                            return false;
                        }

                        this.materialTotal = data.total_size;
                        this.materialItem.push(...tmpArr);
                        // 找不到相关关键词内容
                        if (this.materialTotal == 0) {
                            this.noResult = true;
                            Ktu.log('searchResult', 'none');
                        } else {
                            this.materialIndex == 0 && Ktu.log('searchResult', 'have');
                            this.noResult = false;
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

        // 使用 素材
        useImg(item) {
            this.historicalRecord[this.historicalRecordIndex].imageData = item;
            const { type } = this.historicalRecord[this.historicalRecordIndex];
            this.historicalRecord[this.historicalRecordIndex].page = type === 'my' ? this.uploadIndex : (type == 'system' ? this.materialIndex : this.collectionIndex);
            type === 'system' && (this.historicalRecord[this.historicalRecordIndex].category = {
                key: this.materialTopicValue,
            });
            // 避免快速双击时执行两次
            if (!this.isDrawingSvg) {
                this.isDrawingSvg = true;
                this.logMaterial_use(item.id);
                /* 判断是否由LOGO那里调用
                   if (this.$store.state.data.showModelType !== 'QrCode') {
                   是否使用快捷键打开素材库 */
                if (Ktu.store.state.base.isImgsourceByHotkey) {
                    this.applyImgHotkey(item);
                } else if (this.isQrCode) {
                    item.p160p = item.pre160ViewPath || item.p160p || item.svg2PngPre160ViewPath || item.filePath || item.p;
                    this.qrIsTop = true;
                    this.$store.commit('data/changeLogoImgData', item);
                    Ktu.simpleLog('qrCodeStyle', 'logo');
                    // this.$store.commit('data/changeLogoImgType', 'changeBackground');
                } else {
                    // 记录日志,需要区分png和jpg
                    const { type } = this.activeObject;
                    if (type === 'cimage') {
                        if (this.activeObject.isInContainer) {
                            // 这个是图片容器的log，暂时没哟
                        } else {
                            if (this.activeObject.image && /\.png$/.test(this.activeObject.image.src)) {
                                Ktu.simpleLog('png', 'change');
                            } else {
                                Ktu.simpleLog(type, 'change');
                            }
                        }
                    } else if (type === 'line' || type === 'rect' || type === 'ellipse') {
                        // 快速描绘的统一记录
                        Ktu.simpleLog('quickDrawTool', 'change');
                    } else {
                        Ktu.simpleLog(type, 'change');
                    }

                    Ktu.simpleLog('materialModal', this.activeParentIndex ? 'addUpload' : 'addSystem');
                    if (item.type == 81 || item.f == 81) {
                        this.applySvgImg(item);
                    } else if (item.type == 3 || item.f == 3) {
                        this.applyGifImg(item);
                    } else {
                        this.applyPngImg(item);
                    }
                }
                this.showImageSourceModal = false;
                // 异步处理
                setTimeout(function () {
                    this.isDrawingSvg = false;
                }, 0);
                /* } else {
                   // 这是LOGO调用时情况
                   // 处理成统一字段
                   item.p160p = item.pre160ViewPath || item.p160p || item.svg2PngPre160ViewPath || item.filePath;
                   this.$store.commit('data/changeShowModelData', item);
                   // 每次关闭就重新赋值
                   this.$store.commit('data/changeShowModelType', 'changeBackground');
                   this.$store.commit('modal/imageSourceModalState',{
                   isOpen : false
                   })
                   } */
            }
        },
        // 更换 png素材
        applyPngImg(info) {
            const { selectedData } = this;
            if (this.isBackground) {
                this.applyBackground(info);
                return;
                // selectedData.modifiedState();
            }
            // selectedData.saveState();
            if (selectedData.type === 'imageContainer') {
                selectedData.changePic(info);
            } else {
                const object = {
                    type: 'changePic',
                    id: info.resourceId || info.i,
                    path: info.filePath || info.p,
                    w: info.width || info.w,
                    h: info.height || info.h,
                    category: info.category,
                    isCollect: info.isCollect || false,
                    canCollect: info.isCollect !== undefined,
                };
                Ktu.element.addModule('image', object);
            }
        },
        // 更换 svg素材
        applySvgImg(info) {
            if (this.isBackground) {
                this.$Notice.warning('背景图不能使用svg格式');
                return;
            }
            const { selectedData } = Ktu;
            const { dblclickCategory } = this.$store.state.base;
            if (selectedData.type === 'imageContainer') {
                this.$Notice.warning('图片容器不能使用svg格式');
                return;
            }
            // selectedData.saveState();
            const object = {
                type: 'changePic',
                id: info.resourceId || info.i,
                path: info.filePath || info.p,
                w: info.width || info.fw,
                h: info.height || info.fh,
                category: info.category,
                isCollect: info.isCollect || false,
                canCollect: info.isCollect !== undefined,
            };
            if (info.category === 5 && dblclickCategory !== 5) {
                const _this = this;
                // 获取绘制的svg的大小 目前只在文字容器需求需要
                object.getSvgSize = function (obj) {
                    _this.$store.commit('base/setPathGroup', obj);
                };
            }
            Ktu.element.addModule('svg', object).then(() => {
                // 目标素材是文字容器 但双击来源的素材不为文字容器时
                if (info.category === 5 && dblclickCategory !== 5) {
                    const result = this.$store.state.base.pathGroup;
                    result.position = {
                        left: result.left + (result.width * result.scaleX) / 2,
                        top: result.top + (result.height * result.scaleY) / 2,
                    };
                    this.computedTextSize(result).then(res => {
                        this.addTextToCont(res);
                    });
                }
            });
        },

        // 更换gif素材
        applyGifImg(info) {
            if (this.isBackground) {
                this.$Notice.warning('GIF素材不支持设为背景');
                return;
            }
            const { selectedData } = Ktu;
            if (selectedData.type === 'imageContainer') {
                this.$Notice.warning('图片容器不能使用GIF格式');
                return;
            }
            this.$Notice.warning('无法替换成GIF图片');
            return;

            const object = {
                type: 'changePic',
                id: info.resourceId || info.i,
                path: info.filePath || info.p,
                w: info.width || info.w,
                h: info.height || info.h,
                category: info.category,
                isCollect: info.isCollect || false,
                canCollect: info.isCollect !== undefined,
            };
            Ktu.element.addModule('image', object);
        },
        // 快捷键打开素材库添加图片
        applyImgHotkey(info) {
            if (info.type == 81 || info.f == 81) {
                const object = {
                    type: 'path-group',
                    id: info.resourceId || info.i,
                    path: info.filePath || info.p,
                    w: info.width || info.w,
                    h: info.height || info.h,
                    category: info.category,
                    isCollect: info.isCollect || false,
                    canCollect: info.isCollect !== undefined,
                };
                if (info.category === 5) {
                    const _this = this;
                    // 获取绘制的svg的大小 目前只在文字容器需求需要
                    object.getSvgSize = function (obj) {
                        _this.$store.commit('base/setPathGroup', obj);
                    };
                }
                Ktu.element.addModule('svg', object).then(() => {
                    // 打开的是文字容器 添加默认文字
                    if (info.category === 5) {
                        const result = this.$store.state.base.pathGroup;
                        this.computedTextSize(result).then(res => {
                            this.addTextToCont(res);
                        });
                    }
                });
            } else {
                const object = {
                    type: 'cimage',
                    id: info.resourceId || info.i,
                    path: info.filePath || info.p,
                    w: info.width || info.w,
                    h: info.height || info.h,
                    category: info.category,
                    isCollect: info.isCollect || false,
                    canCollect: info.isCollect !== undefined,
                };
                Ktu.element.addModule('image', object);
            }
        },
        // 替换背景
        applyBackground(info, image) {
            const imageObject = {
                type: 'image',
                src: info.filePath || info.p,
                width: info.width || info.w,
                height: info.height || info.h,
                fileId: info.resourceId || info.i,
            };
            this.selectedData.setBackGround(imageObject);
            Ktu.log('backgroundTool', 'change');
        },

        // 点击上传按钮
        uploadBtnClick(event) {
            /* if (this.uploadManageStatus) {
            //     event.preventDefault();
            //     return;
            // }*/
            Ktu.log('materialModal', 'upload');
        },
        // 手机上传
        phoneUploadBtnClick() {
            if (this.isOss) return;
            Ktu.simpleLog('materialModal', 'phoneUpload');
            const activeDir = this.activeDir || {};
            this.$store.commit('data/changeState', { prop: 'uploadGroupId', value: activeDir.id < 0 ? 'undefined' : activeDir.id });
            this.$store.commit('data/changePhoneUploadEntrance', 2);
            this.$store.commit('modal/phoneUploadModal', true);
        },
        // 获取当前上传的是哪一个文件
        getCurrentUploadImg(file) {
            let currentUploadImg;
            for (let index = 0; index < this.uploadItem.length && index <= this.totalUploadNum; index++) {
                if (this.uploadItem[index].index == file.index) {
                    currentUploadImg = this.uploadItem[index];
                    break;
                }
            }
            return currentUploadImg;
        },
        // 上传列表提交前的操作  进行筛选操作
        uploadPushList(tmpFileArr, tmpDeferArr, file) {
            const createObjectURL = function (blob) {
                return window[window.webkitURL ? 'webkitURL' : 'URL'].createObjectURL(blob);
            };

            const defer = $.Deferred();
            tmpDeferArr.push(defer);

            const newImgData = createObjectURL(file);
            const newImg = new Image();
            newImg.onload = info => {
                const { target } = info;
                const { width } = target;
                const { height } = target;

                if (width > 16380 || height > 16380) {
                    this.$Notice.warning(`${file.name}宽高大于16380，请裁剪后再上传。`);
                    defer.resolve();
                } else {
                    if (/svg/.test(file.type)) {
                        svgJudge.bind(this)(file, target, defer);
                    } else {
                        tmpFileArr.push(file);
                        defer.resolve();
                    }
                }
            };
            newImg.src = newImgData;

            function svgJudge(file, target, defer) {
                const reader = new FileReader();
                reader.readAsText(file);

                reader.onload = ev => {
                    const text = ev.target.result;
                    // 读取svg结构 如果带有image 直接返回
                    if (text.match(/<(image)/gim) != null) {
                        this.$Notice.warning(`${file.name}格式异常上传失败。`);
                    } else {
                        // 准备空画布
                        const canvas = document.createElement('canvas');
                        let { width } = target;
                        let { height } = target;
                        const scale = width / height;
                        // 保证缩略图不能过小
                        if (width < 300 && height < 300) {
                            width = 300;
                            height = width / scale;
                        }
                        canvas.width = width;
                        canvas.height = height;
                        // 取得画布的2d绘图上下文
                        const context = canvas.getContext('2d');
                        context.drawImage(newImg, 0, 0, width, height);

                        let pngBase64 = canvas.toDataURL('image/png');
                        pngBase64 = pngBase64.split(',')[1];
                        file.pngStr = pngBase64;

                        tmpFileArr.push(file);
                    }
                    defer.resolve();
                };
                reader.onerror = function () {
                    defer.reject();
                };
            }
        },
        // 获取 筛选后的上传列表
        uploadSelect(files) {
            if (!files) return false;

            if (this.uploadIndex > 0) {
                this.uploadPageChange(1);
            }
            const createObjectURL = function (blob) {
                return window[window.webkitURL ? 'webkitURL' : 'URL'].createObjectURL(blob);
            };

            files.forEach((fileInfo, index) => {
                Ktu.tempResFilesList.push(fileInfo);
                // 先占位 串行上传的
                const tmpObj = {
                    fw: 86,
                    fh: 86,
                    p: '',
                    n: fileInfo.name,
                    isUploading: true,
                    uploadPercent: 0,
                    checked: false,
                    index: parseInt(index, 10) + 1,
                };
                if (/svg/.test(fileInfo.type)) {
                    tmpObj.f = 81;
                    Ktu.log('uploadType', 'svg');
                } else if (/png/.test(fileInfo.type)) {
                    Ktu.log('uploadType', 'png');
                } else if (/jpg|jpeg/.test(fileInfo.type)) {
                    Ktu.log('uploadType', 'jpg');
                }

                this.uploadItem.unshift(tmpObj);

                const newImgData = createObjectURL(fileInfo);
                const tmpImage = new Image();

                tmpImage.onload = info => {
                    // 准备空画布
                    const canvas = document.createElement('canvas');
                    const { width } = info.target;
                    const { height } = info.target;
                    canvas.width = width;
                    canvas.height = height;

                    // 取得画布的2d绘图上下文
                    const context = canvas.getContext('2d');
                    context.drawImage(tmpImage, 0, 0, width, height);

                    const pngBase64 = canvas.toDataURL('image/png');

                    for (let i = 0; i < this.uploadItem.length; i++) {
                        const nowImg = this.uploadItem[i];
                        if (nowImg.index == parseInt(index, 10) + 1) {
                            nowImg.fw = tmpImage.width;
                            nowImg.fh = tmpImage.height;
                            nowImg.p = pngBase64;

                            if (nowImg.uploadSuccess) {
                                this.$delete(nowImg, 'isUploading');
                                this.$delete(nowImg, 'index');
                            }
                            break;
                        }
                    }
                };
                tmpImage.src = newImgData;
            });
            const groupId = this.activeDir ? this.activeDir.id : 0;
            this.upload.changeParam({
                groupId: groupId > 0 ? groupId : 0,
            });
        },
        uploadProgress(data, file) {
            const currentUploadImg = this.getCurrentUploadImg(file);
            if (currentUploadImg) {
                /* let percent = Math.floor(100 * (data.loaded / data.total));
                percent > 99 && (percent = 99);*/
                currentUploadImg.uploadPercent = 99;
            }
        },
        uploadSuccess(data, file) {
            // 统一数据属性
            const { checkedAll } = this;
            if (checkedAll) {
                this.checkAllInput();
            }

            const currentUploadImg = this.getCurrentUploadImg(file);
            if (currentUploadImg) {
                this.$set(currentUploadImg, 'i', data.id);
                this.$set(currentUploadImg, 'p', data.path);
                this.$set(currentUploadImg, 'w', data.width);
                this.$set(currentUploadImg, 'h', data.height);
                this.$set(currentUploadImg, 'uploadSuccess', true);
                this.$delete(currentUploadImg, 'isUploading');
                this.$delete(currentUploadImg, 'index');
                /* var srcSplit = data.path.split('/');
                   var idPath = srcSplit[srcSplit.length-1].split(".")[0]+'!160x160.'+srcSplit[srcSplit.length-1].split('.')[1];
                   srcSplit[srcSplit.length-1] = idPath;
                   this.$set(currentUploadImg, 'p160p', srcSplit.join('/')); */

                const limit = this.uploadGetLimit;
                this.uploadTotal++;
                if (this.uploadItem.length > limit) {
                    this.uploadItem.pop();
                }

                /* if(currentUploadImg.path) {
                   this.$delete(currentUploadImg, 'isUploading');
                   this.$delete(currentUploadImg, 'index');
                   } */

                if (this.totalUploadNum - 1 === this.currentUploadIndex++) {
                    this.totalUploadNum = 0;
                    this.currentUploadIndex = 0;
                }
                this.getUploadStorage();
                // 重新获取文件夹
                this.getDirList();
            }
        },
        // 任何操作后的重刷新
        operateAfter() {
            this.uploadItem = [];
            // 如果当前页已经没有可操作的 自动往前一页
            if ((this.uploadIndex > 1 || this.uploadIndex == 1) && this.uploadTotal % this.uploadGetLimit == 0) {
                this.uploadIndex--;
            } else if (this.uploadIndex < 1 && this.uploadTotal == 0) {
                this.uploadManageStatus = false;
            }
            this.init(['getUploadList', 'getDirList']);
        },
        uploadError(name, file) {
            const currentUploadImg = this.getCurrentUploadImg(file);
            const itemIndex = this.uploadItem.indexOf(currentUploadImg);
            this.uploadItem.splice(itemIndex, 1);
        },
        uploadingTips() {
            this.$Notice.warning('正在上传，请稍后...');
        },
        delCollection(info) {
            const url = '../ajax/ktuCollectFodder_h.jsp?cmd=del';
            axios.post(url, {
                category: info.category,
                resourceId: info.resourceId,
            }).then(res => {
                const { data } = res;
                if (data.success) {
                    Ktu.templateData.forEach(({ objects }) => {
                        objects.forEach(item => {
                            if (item.fileId) {
                                item.fileId === info.resourceId ? item.isCollect = !item.isCollect : '';
                            } else if (item.image) {
                                item.image.fileId == info.resourceId ? item.isCollect = !item.isCollect : '';
                            }
                            // item.fileId ? (item.fileId === info.sourceData.resourceId ? item.isCollect = !item.isCollect : '') : (item.image ? (item.image.fileId == info.sourceData.resourceId ? item.isCollect = !item.isCollect : '') : '');
                        });
                    });

                    this.materialItem = this.materialItem.filter(item => {
                        if (item.resourceId == info.resourceId) {
                            item.isCollect = !item.isCollect;
                        }
                        return true;
                    });
                    this.uploadItem = this.uploadItem.filter(item2 => {
                        if (item2.i == info.resourceId) {
                            item2.isCollect = !item2.isCollect;
                        }
                        return true;
                    });
                    // this.collectionItem = this.collectionItem.filter(item => item.resourceId != info.resourceId);
                    this.shouldRefreshList.includes(info.resourceId) ? '' : this.shouldRefreshList.push(info.resourceId);
                    if (this.collectionItem.length == 1 && this.collectionIndex > 0) {
                        this.collectionIndex--;
                    }
                    this.getCollection();
                }
            });
        },
        changeCollectionState(info) {
            const url = info.sourceData.isCollect ? '../ajax/ktuCollectFodder_h.jsp?cmd=del' : '../ajax/ktuCollectFodder_h.jsp?cmd=add';
            axios.post(url, {
                category: info.sourceData.category,
                resourceId: info.sourceData.resourceId,
            }).then(res => {
                const { data } = res;
                if (data.success) {
                    Ktu.templateData.forEach(({ objects }) => {
                        objects.forEach(item => {
                            if (item.fileId) {
                                item.fileId === info.sourceData.resourceId ? item.isCollect = !item.isCollect : '';
                            } else if (item.image) {
                                item.image.fileId == info.sourceData.resourceId ? item.isCollect = !item.isCollect : '';
                            }
                            // item.fileId ? (item.fileId === info.sourceData.resourceId ? item.isCollect = !item.isCollect : '') : (item.image ? (item.image.fileId == info.sourceData.resourceId ? item.isCollect = !item.isCollect : '') : '');
                        });
                    });
                    this.materialItem = this.materialItem.filter(item => {
                        if (item.resourceId == info.sourceData.resourceId) {
                            item.isCollect = !item.isCollect;
                        }
                        return true;
                    });
                    this.uploadItem = this.uploadItem.filter(item2 => {
                        if (item2.i == info.sourceData.resourceId) {
                            item2.isCollect = !item2.isCollect;
                        }
                        return true;
                    });
                    this.shouldRefreshList.includes(info.sourceData.resourceId) ? '' : this.shouldRefreshList.push(info.sourceData.resourceId);
                }
            })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => {

                });
        },
        /* copyrightId: function(comeFrom){
        //     copyrightArr.indexOf(item.sourceData.comeFrom) > 0
        // },*/
    },
});
