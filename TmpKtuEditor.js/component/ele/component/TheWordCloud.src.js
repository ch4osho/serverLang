Vue.component('ele-wordArt', {
    template: `
        <div class="ele-wordArt">
            <div class="ele-wordArt-mask" v-show="!isShowBatchMask && !isShowCustomizeMask" @click="closeEditor"></div>
            <transition>
                <div class="batch-import-mask" v-show="isShowBatchMask" @click.self="closeBatchMask">
                    <div class="batch-import">
                        <div class="batch-import-header">
                            <span class="import-header-text">批量导入</span>
                            <span class="import-header-icon">
                                <svg class="svg-icon" @click="closeBatchMask">
                                    <use xlink:href="#svg-close-icon"></use>
                                </svg>
                            </span>
                        </div>
                        <div class="batch-import-content">
                            <div class="import-content-tip">
                                可用逗/句/冒/顿号作为词语分隔
                            </div>
                            <textarea class="import-content-textarea" v-model="importData" @keyup.enter="detailImportData">
                            </textarea>
                            <div class="import-content-bottom">
                                <button class="content-bottom-btn" @click="detailImportData">确认</button>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
            <transition>
                <div class="set-image-mask" v-show="isShowImageMask" @click.self="closeImageMask">
                    <div class="set-image-contanier">
                        <span class="close-icon" @click="closeImageMask">
                            <svg class="svg-icon">
                                <use xlink:href="#svg-close-icon">
                                </use>
                            </svg>
                        </span>
                        <div class="set-image-contanier-left">
                            <canvas ref="changeImg"></canvas>
                        </div>
                        <div class="set-image-contanier-right">
                            <div class="set-image-color">
                                <span>叠加颜色</span>
                                <color-picker
                                    :value="imageColor"
                                    @input="changeColorOfImage"
                                    class="qrCode-picker bg-color-picker"
                                    :themePickerShow="true"
                                    :colorPickerShow="false"
                                ></color-picker>
                            </div>
                            <div class="set-image-reverse">
                                <span>图片反向</span>
                                <ktu-switch v-model="isReverse"></ktu-switch>
                            </div>
                            <div class="set-image-render">
                                <tool-slider title="渲染范围" :value="renderDegree" :isWordArt="isWordArt" :min="0" :max="100" :step="1" @input="changeRenderDegree"></tool-slider>
                            </div>
                            <div class="set-image-splice">
                                <tool-slider title="分离程度" :value="spliceDegree" :isWordArt="isWordArt" :min="0" :max="100" :step="1" @input="changeSpliceDegree"></tool-slider>
                            </div>
                            <div class="set-image-button" @click="createImgCloud">
                                确定
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
            <transition>
                <div class="set-material-mask" v-show="isShowMaterialMask" @click.self="closeMaterialMask">
                    <div class="set-material-contanier">
                        <span class="close-icon" @click="closeMaterialMask">
                            <svg class="svg-icon">
                                <use xlink:href="#svg-close-icon">
                                </use>
                            </svg>
                        </span>
                        <div class="set-material-image">
                            <div class="set-material-svg" v-html="imgSvg"></div>
                        </div>
                        <div class="set-material-tips">点击下方色块修改颜色：</div>
                        <div class="set-material-colors">
                            <div class="material-colors-item" v-for="(item, index) of meterialColorList" :key="index">
                                <color-picker
                                    :value="item"
                                    @click.native="saveMaterialInfo(item, index)"
                                    @input="changeMaterialColor"
                                    class="qrCode-picker bg-color-picker"
                                    :themePickerShow="true"
                                    :colorPickerShow="false"
                                    :direction="direction"
                                ></color-picker>
                            </div>
                        </div>
                        <div class="set-material-confim" @click="changeMaterialImage">确定</div>
                    </div>
                </div>
            </transition>
            <div class="customize-angle-mask" v-show="isShowCustomizeMask" @click.self="closeCustomizeMask">
                <div class="customize-angle-container">
                    <div class="customize-container-header">
                        <span class="customize-header-title">自定义旋转角度</span>
                        <span class="customize-header-icon">
                            <svg class="svg-icon" @click="closeCustomizeMask">
                                <use xlink:href="#svg-close-icon"></use>
                            </svg>
                        </span>
                    </div>
                    <div class="customize-container-content">
                        <div class="customize-container-option">
                            <div class="customize-option-inputarea">
                                <validate-input class="search-input nav-title-input"
                                    v-model="angleVal"
                                    :inputVal="angleVal"
                                    style="width:142px;box-shadow: none;"
                                    @keyup.enter.native="addAngleItem"
                                >
                                </validate-input>
                                <span>
                                    <svg class="svg-icon" @click="addAngleItem">
                                        <use xlink:href="#svg-word-upload"></use>
                                    </svg>
                                </span>
                            </div>
                            <div class="customize-option-addarea">
                                <span class="option-addarea" @click="addRandomAngleItem">
                                    <span class="option-addarea-icon">
                                        <svg class="svg-icon">
                                            <use xlink:href="#svg-word-random"></use>
                                        </svg>
                                    </span>
                                    随机添加
                                </span>
                            </div>
                            <div class="customize-option-cleararea">
                                <span class="option-cleararea" @click="clearAngleAll">
                                    <span class="option-cleararea-icon">
                                        <svg class="svg-icon">
                                            <use xlink:href="#svg-word-empty"></use>
                                        </svg>
                                    </span>
                                    清空
                                </span>
                            </div>
                        </div>
                        <div class="customize-container-word">
                            <div class="customize-container-word-item" v-for="(item, index) of angleListData">
                                <span class="customize-word-item-text">{{item.angle}}°</span>
                                <span class="customize-word-item-close" @click="deleteAngleItem(index)">
                                    <svg class="svg-icon">
                                        <use xlink:href="#svg-close-icon"></use>
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="customize-container-bottom">
                        <button class="container-bottom-btn" @click="addTextArrangements">确认</button>
                    </div>
                </div>
            </div>
            <div class="ele-wordArt-editor">
                <div class="wordArt-mask-header">
                    <div class="wordArt-header-left">
                        <span class="theme-text">生成词云</span>
                        <a class="tip-text" @click="wordCloudTips" target="_blank" href="https://docs.qq.com/doc/DUGNxRE5xY0RrS2py">
                            带你玩转词云
                            <span class="tip-icon">
                                <svg class="svg-icon">
                                    <use xlink:href="#svg-page-jump-next"></use>
                                </svg>
                            </span>
                        </a>
                    </div>
                    <div class="wordArt-header-right">
                        <span class="close-icon" @click="closeEditor">
                            <svg class="svg-icon">
                                <use xlink:href="#svg-close-icon"></use>
                            </svg>
                        </span>
                    </div>
                    <div class="mask-header">
                    </div>
                </div>
                <div class="wordArt-mask-content">
                    <div class="wordArt-content-isSending-loading" v-if="isSending">
                        <div class="mask-div"></div>
                        <loading></loading>
                    </div>
                    <div class="wordArt-content-right">
                        <div class="wordArt-content-right-mask"></div>
                        <ul class="content-nav-lists">
                            <li v-for="(item, index) of navList" :key="index"
                                :class="['content-nav-lists-item',
                                (index == activeItem) ? 'content-nav-lists-item-active' : '',
                                (index == activeItem - 1) ? 'content-nav-list-active-before' : '',
                                (index == activeItem + 1) ? 'content-nav-list-active-after' : '']"
                                @click="changeActiveIndex(index)"
                            >
                                <span class="content-nav-lists-item-icon">
                                    <svg class="svg-icon">
                                        <use :xlink:href="item.svgId"></use>
                                    </svg>
                                </span>
                                {{item.name}}
                            </li>
                            <div class="content-nav-lists-top" v-if="activeItem > 0" :style="navTopStyle"></div>
                            <div class="content-nav-lists-bottom" :style="navBottomStyle"></div>
                        </ul>
                        <div class="wordArt-content-right-top">
                            <div v-show="activeItem == 1" class="content-edit-text">
                                <div class="edit-text-content">
                                    <div class="content-edit-text-header">
                                        <div class="text-header-top">
                                            <span class="text-header-left-font">
                                                默认字体
                                            </span>
                                            <div class="font-family-container">
                                                <tool-font-family
                                                :isWordArt="isWordArt"
                                                :propsFontId="importFontId"
                                                @change="changeImportFontId">
                                                </tool-font-family>
                                            </div>
                                        </div>
                                        <div class="text-header-bottom">
                                            <div class="text-header-right" :class="isExtendAdvanced ? 'is-extend-advanced' : ''" @click="showAdvanced">
                                                <svg class="tool-btn-arrow-svg">
                                                    <use xlink:href="#svg-tool-arrow"></use>
                                                </svg>
                                                <span v-show="isExtendAdvanced">常用</span>
                                                <span v-show="!isExtendAdvanced">高级</span>
                                            </div>
                                            <div class="optionContainer">
                                                <span class="text-option-item" :class="rowIndex >= 0 && rowIndex < tableData.length ? 'is-can-option' : ''" @click="optionType(0)">
                                                    <span class="text-option-item-icon">
                                                        <svg class="svg-icon">
                                                            <use :xlink:href="optionList[0].svgId"></use>
                                                        </svg>
                                                    </span>
                                                    {{optionList[0].option}}
                                                </span>
                                                <span class="text-option-item" :class="isResetTableData ? 'is-can-option' : ''" @click="optionType(1)">
                                                    <span class="text-option-item-icon">
                                                        <svg class="svg-icon">
                                                            <use :xlink:href="optionList[1].svgId"></use>
                                                        </svg>
                                                    </span>
                                                    {{optionList[1].option}}
                                                </span>
                                                <span class="text-option-item" :class="tableData.length > 0 ? 'is-can-option' : ''" @click="optionType(2)">
                                                    <span class="text-option-item-icon">
                                                        <svg class="svg-icon">
                                                            <use :xlink:href="optionList[2].svgId"></use>
                                                        </svg>
                                                    </span>
                                                    {{optionList[2].option}}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="text-table-container" ref="tableContainer" @scroll="isScroll($event)">
                                        <div class="content-edit-text-table" :class="isExtendAdvanced ? 'isExtendTable' : ''">
                                            <div class="th-row">
                                                <div class="th-row-item" v-for="(item, index) of theadList" :key="index" :class="item.class">
                                                {{item.label}}
                                                </div>
                                            </div>
                                            <div class="td-row" v-for="(item, index) of tableData"
                                            :key="index" :class="rowIndex == index ? 'row-active' : ''"
                                             @click="changeRowIndex(index)"
                                            :style="{'margin-bottom': (isMoreThanHeight && index == tableData.length - 1) ? '36px' : '0'}"
                                             >
                                                <div class="td-row-item first-item" draggable="false">
                                                    <input class="row-item-input" draggable="false" v-model="tableData[index].title"  maxlength="20" @blur="wordTitlecheck" @focus="wordTitleFocus(index, $event)"/>
                                                </div>
                                                <div class="td-row-item second-item" draggable="false">
                                                    <input class="row-item-input" draggable="false" v-model="tableData[index].wordNum" @blur="wordNumCheck"/>
                                                </div>
                                                <div class="td-row-item third-item">
                                                    <color-picker
                                                        :value="item.color"
                                                        @click.native="changeSelectIndex(index, $event)"
                                                        @input="selectForeground"
                                                        :themePickerShow="true"
                                                        :colorPickerShow="false"
                                                        :direction="direction"
                                                        :defaultBtnShow="true"
                                                    ></color-picker>
                                                </div>
                                                <div class="td-row-item four-item">
                                                    <div class="font-family-container">
                                                        <tool-font-family
                                                        :propsFontId="item.fontId"
                                                        :isWordArt="isWordArt"
                                                        :isDefaultBtn="true"
                                                        @change="fontChangeId"
                                                        @refreshDefault = "refreshDefault">
                                                        </tool-font-family>
                                                    </div>
                                                </div>
                                                <div class="td-row-item five-item">
                                                    <div class="td-row-item-rotate" tabindex="-1" @focus="changeActiveRotateIndex($event,index)" @blur="clearRotateShowIndex" :class="index == rotateShowIndex ? 'is-open' : ''">
                                                        <input  draggable="false"  class="row-item-input-angle" v-model="tableData[index].angle" @blur="angleCheck"  maxlength="7"/>
                                                        <span class="angle-placehoder" v-if="!tableData[index].angle">默认</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="edit-text-bottom">
                                    <div class="text-bottom-input">
                                        <input class="row-item-input" placeholder="在此输入新词按enter添加" v-model="addTableText" @keyup.enter="addRowData" @blur="addRowData"/>
                                    </div>
                                    <div class="text-header-left">
                                        <div class="text-header-left-slipt"></div>
                                        <span class="text-header-left-lead" @click="showBatchMask">
                                            <span class="batch-import-icon">
                                                <svg class="svg-icon">
                                                    <use xlink:href="#edit-batch-import"></use>
                                                </svg>
                                            </span>
                                            批量导入
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div v-show="activeItem == 0" class="content-select-image">
                                <div class="select-image-header">
                                    <div class="select-image-contanier">
                                        <div v-for="(item, index) of imageNavList"
                                        :class="{'imageActive':index==imageNavIndex}"
                                        class="select-image-header-item"
                                        @click="changeImageNavIndex(index)">
                                            {{item.name}}
                                        </div>
                                    </div>
                                </div>
                                <div class="select-image-content">
                                    <div class="graphic-shape" v-show="imageNavIndex == 0">
                                        <div class="topic-item-list">
                                            <div class="topic-item"
                                            v-for="(item, index) of topicTenList"
                                            :class="{'topicListActive':index==topicListIndex}"
                                            @click="clickMaterialTopic(item, index, false)">
                                                {{item.name}}
                                            </div>
                                                <div class="more-item-switch" :class="{'isShowMoreActive': isShowMore}" v-show="topicList.length > 10" tabindex="-1" @focus="showMore" @blur="closeShowMore">
                                                    <svg>
                                                        <use xlink:href="#svg-source-switch">
                                                        </use>
                                                    </svg>
                                                    <transition :name="transitionName">
                                                        <div class="more-item-popup" v-show="isShowMore">
                                                            <div class="more-item" v-for="(item, index) of topicTenAfterList"
                                                             @click="clickMaterialTopic(item, index, true)"
                                                             :class="{'topic-after-active':index==topicAfterIndex}"
                                                            >
                                                                {{item.name}}
                                                            </div>
                                                        </div>
                                                    </transition>
                                                </div>
                                        </div>
                                        <div class="material-item-list-container" v-if="materialListShow">
                                            <div class="material-item-list">
                                                <div class="material-item" v-for="(item, index) of iamgeShowData" :class="selectedItem.id == item.id ? 'material-item-active' : ''" @click="userMaterial(item, index)">
                                                    <img class="material-item-img" :src="item.filePath">
                                                    <div class="material-item-color" @click="showMaterialMask(item, index)">
                                                        设置颜色
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="material-self-rect" v-if="!materialListShow">
                                            <div class="rect-color-contanier">
                                                <div class="rect-color-font">颜色设置</div>
                                                <color-picker
                                                    :value="rectColor"
                                                    @input="changeColorOfRect"
                                                    class="qrCode-picker bg-color-picker"
                                                    :themePickerShow="true"
                                                    :colorPickerShow="false"
                                                ></color-picker>
                                            </div>
                                            <div class="rect-size-contanier">
                                                <div class="rect-color-font">尺寸设置</div>

                                                <div class="check-inblock" :class="isRedioCanvas ? 'is-checked' : ''">
                                                    <svg class="svg-icon" @click="setDownload">
                                                        <use xlink:href="#svg-check-true"></use>
                                                    </svg>
                                                    <label>
                                                        <input type="checkbox" :checked="isRedioCanvas" @change="setDownload"/>
                                                        使用画布比例
                                                    </label>
                                                </div>

                                            </div>
                                            <div class="inputBox">

                                                <label class="input-tip">宽</label>
                                                <validate-input
                                                    id="rf_canvasWidth"
                                                    class="newModalInput nav-title-input"
                                                    style="width:68px"
                                                    @keyup.native="changeW"
                                                    v-model="widthVal"
                                                    :inputVal="widthVal"
                                                    @focus="focusInput"
                                                    @blur.native="blurInput">
                                                </validate-input>

                                                <div class="lock-icon" @click="toggleLock" :tips="tip">
                                                    <svg v-show="!isLockWH" class="svg-lock-icon">
                                                        <use xlink:href="#svg-unlock-wh"></use>
                                                    </svg>

                                                    <svg v-show="isLockWH" class="svg-lock-icon">
                                                        <use xlink:href="#svg-lock-wh"></use>
                                                    </svg>
                                                </div>

                                                <label class="input-tip">高</label>
                                                <validate-input id="rf_canvasHeight"
                                                    class="newModalInput nav-title-input"
                                                    style="width:68px"
                                                    @keyup.native="changeH"
                                                    v-model="heightVal"
                                                    :inputVal="heightVal"
                                                    @focus="focusInput"
                                                    @blur.native="blurInput">
                                                </validate-input>

                                                <div class="selector">
                                                    像素
                                                </div>
                                            </div>
                                            <div class="rect-contanier">
                                                <div class="material-rect" :style="rectStyle">
                                                </div>
                                            </div>
                                            <div class="rect-style-proview">
                                                样式预览
                                            </div>
                                            <div class="rect-bottom">
                                                <span class="use-rect" :class="(widthVal > 0 && heightVal > 0) ? 'can-use-rect' : ''" @click="useRectShape">使用该图形</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="text-shape" v-show="imageNavIndex == 1">
                                        <div class="text-shape-header">
                                            <div class="text-shape-header-item">
                                                <div class="shape-header-item-font">
                                                    字体设置
                                                </div>
                                                <tool-font-family
                                                    ref="fontFamilySet"
                                                    :propsFontId="textareaFontId"
                                                    :isWordArt="isWordArt"
                                                    @change="changeTextareaFontId">
                                                </tool-font-family>
                                            </div>

                                            <div class="text-shape-header-item">
                                                <div class="shape-header-item-font">
                                                    颜色设置
                                                </div>

                                                <color-picker
                                                    :value="textShapeColor"
                                                    @input="changeColorOfShape"
                                                    class="qrCode-picker bg-color-picker"
                                                    :themePickerShow="true"
                                                    :colorPickerShow="false"
                                                ></color-picker>
                                            </div>


                                            <div class="text-shape-header-item">
                                                <div class="shape-header-item-font">
                                                    样式设置
                                                </div>

                                                <div class="shape-header-style-set">
                                                    <tool-btn icon="bold"
                                                        tips="加粗" @click="setFontStyle('bold')"
                                                        :class="isActiveText.hasStr('bold') >= 0 ? 'isActiveTool' : ''"
                                                        >
                                                    </tool-btn>

                                                    <tool-btn icon="italic"
                                                        tips="斜体" @click="setFontStyle('italic')"
                                                        :class="isActiveText.hasStr('italic') >= 0 ? 'isActiveTool' : ''"
                                                        >
                                                    </tool-btn>
                                                </div>
                                            </div>

                                        </div>
                                        <div class="text-shape-textarea-container">
                                            <textarea class="text-shape-textarea" spellcheck="false" maxlength="16" ref="shapeTextarea" :style="textareaStyle" placeholder="在此输入文字" v-model="shapeText" @keydown.enter="stopChangeRow" @blur="textshapeblur"></textarea>
                                            <canvas id="text-shape-canvas" class="text-shape-canvas" width="338" height="203" ref="shapeTextareaCanvas" ></canvas>
                                        </div>
                                        <div class="text-shape-footer">
                                            <span class="shape-footer-user" :class="shapeText.length > 0 ? '' : 'is-can-use-shape'" @click="useWordShape">使用该图形</span>
                                        </div>
                                    </div>
                                    <div class="up-load-image" v-show="imageNavIndex == 2">
                                        <loading v-if="getImgLoading"></loading>
                                        <div class="up-load-container">
                                            <div class="upload-item">
                                                <div class="up-load-tips">
                                                    <div class="up-load-tips-icon">
                                                        <svg class="svg-icon">
                                                            <use xlink:href="#svg-word-upload"></use>
                                                        </svg>
                                                    </div>
                                                    <span class="up-load-tips-image">上传图片</span>
                                                </div>
                                                <div class="upload-tips">
                                                    支持JPG/PNG 大小不超500K
                                                </div>
                                                <input @change="fileChange($event)" class="upload-item-input" id="addPic" type="file" accept="image/jpg,image/jpeg,image/png"/>
                                            </div>
                                            <div class="upload-img-item" v-for="(item, index) in uploadList" :key="index" @click="chooseImageItem(index, item)" :class="index == imageChooseIndex ? 'upload-img-active-item' : ''">
                                                <img class="img-item-container" v-if="item.p160p" :src="item.p160p" />
                                                <div class="img-item-set"  @click="showImageMask(item)">
                                                    设置
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-show="activeItem == 2" class="content-set-style">
                                <div class="set-style-content">
                                    <div class="set-style-content-item">
                                        <div class="style-color-container">
                                            <span class="content-item-label">颜色设置</span>
                                            <span class="color-mode">
                                                <span class="mode-default" :class="colorMode == 0 ? 'mode-active' : ''" @click="changeModeActive(0)">默认</span>
                                                <span class="mode-customize" :class="colorMode == 1 ? 'mode-active' : ''" @click="changeModeActive(1)">自定义</span>
                                            </span>
                                        </div>
                                        <div class="color-list">
                                            <div class="color-list-reset" :class="{'isDeleteStatus': isDeleteStatus || colorMode == 0}" @click="randomAddColor">
                                                <!--
                                                    <svg class="svg-icon">
                                                        <use xlink:href="#svg-word-random"></use>
                                                    </svg>
                                                -->
                                                随机配色
                                            </div>
                                            <div class="color-list-item" v-for="(item, index) of colorListData">
                                                <color-picker
                                                    v-show="colorMode !== 0"
                                                    :value="item.color"
                                                    @click.native="changeColorIndex(index)"
                                                    @input="colorForeground"
                                                    class="qrCode-picker bg-color-picker"
                                                    :themePickerShow="true"
                                                    :colorPickerShow="false"
                                                ></color-picker>
                                                <div class="color-list-item-instead" v-show="colorMode == 0" :style="'background:' + addRgba(item.color)">
                                                </div>
                                                <div class="color-list-item-delete" v-show="isDeleteStatus" @click="deleteColorItem(index)">
                                                    <svg class="svg-icon">
                                                        <use xlink:href="#svg-word-reduce"></use>
                                                    </svg>
                                                </div>
                                            </div>
                                            <div class="color-list-add" :class="{'isDeleteStatus': isDeleteStatus || colorMode == 0 || colorListData.length == 5}">
                                                <svg class="svg-icon">
                                                    <use xlink:href="#svg-word-upload"></use>
                                                </svg>
                                                <div class="add-color" v-if="!isDeleteStatus && colorMode !== 0 && colorListData.length < 5">
                                                    <color-picker
                                                        :value="addColor"
                                                        @input="addColorItem"
                                                        class="qrCode-picker bg-color-picker"
                                                        :themePickerShow="true"
                                                        :colorPickerShow="false"
                                                    ></color-picker>
                                                </div>
                                            </div>
                                            <div class="color-list-delete" :class="{'isDeleteStatus': colorMode == 0}" v-if="!isDeleteStatus" @click="changeDeleteStatus">
                                                <svg class="svg-icon">
                                                    <use xlink:href="#svg-word-reduce"></use>
                                                </svg>
                                            </div>
                                            <div class="color-list-confirm" v-else @click="changeDeleteStatus">
                                                <svg class="svg-icon">
                                                    <use xlink:href="#svg-word-confirm"></use>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="set-style-content-item">
                                        <div class="content-item-contanier">
                                            <span class="content-item-label">背景透明度</span>
                                            <validate-input class="content-item-unit"
                                                valType = "number"
                                                v-model="backgroundOpacity"
                                                :inputVal="backgroundOpacity"
                                                style="width: 40px"
                                                @keyup.enter.native="changeSliderCount(0, 0, 100, backgroundOpacity)"
                                                @blur.native="changeSliderCount(0, 0, 100, backgroundOpacity)"
                                            >
                                            </validate-input>
                                        </div>
                                        <div class="backgroundItem">
                                            <tool-slider :value="backgroundOpacity" :isWordArt="isWordArt" :min="0" :max="100" :step="1" unit="%" @input="changeBackgroundOpacity"></tool-slider>
                                        </div>
                                    </div>
                                    <div class="set-style-content-item">
                                        <span class="content-item-label">文字排列</span>
                                        <div class="text-arrangement">
                                            <div class="text-arrangement-left" @click="leftTransition" :class="leftDistanceGird === 0 ? 'firstGird' : ''">
                                                <svg class="svg-icon">
                                                    <use xlink:href="#edit-batch-arrow"></use>
                                                </svg>
                                            </div>
                                            <div class="text-arrangement-item-contanier">
                                                <div class="arrangement-item-contanier" :style="'left:' + leftDistance + 'px'">
                                                    <div class="text-arrangement-item" v-for="(item, index) of labelListData"
                                                    :key="index" @click="showCustomizeMask(index)"
                                                    :class="index == showCustomizeMaskIndex ? 'arrangement-item-active' : ''"
                                                    >
                                                       <svg class="svg-icon">
                                                            <use :xlink:href="item.svgId"></use>
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="text-arrangement-right" @click="rightTransition" :class="leftDistanceGird === labelListData.length - 5 ? 'firstGird' : ''">
                                                <svg class="svg-icon">
                                                    <use xlink:href="#edit-batch-arrow"></use>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="set-style-content-item">
                                        <div class="content-item-contanier">
                                            <span class="content-item-label">文字数量</span>
                                            <validate-input class="content-item-unit"
                                                valType = "number"
                                                v-model="textNum"
                                                :inputVal="textNum"
                                                :max = "999"
                                                style="width: 40px"
                                                @keyup.enter.native="changeSliderCount(1, 0, 999, textNum)"
                                                @blur.native="changeSliderCount(1, 0, 999, textNum)"
                                            >
                                            </validate-input>
                                        </div>
                                        <div class="backgroundItem">
                                            <tool-slider :value="textNum" :isWordArt="isWordArt" :min="0" :max="999" :step="1" unit="%" @input="changeTextNum"></tool-slider>
                                        </div>
                                    </div>
                                    <div class="set-style-content-item">
                                        <div class="content-item-contanier">
                                            <span class="content-item-label">文字密度</span>
                                            <validate-input class="content-item-unit"
                                                valType = "number"
                                                v-model="textDensity"
                                                :inputVal="textDensity"
                                                style="width: 40px"
                                                @keyup.enter.native="changeSliderCount(2, 0, 100, textDensity)"
                                                @blur.native="changeSliderCount(2, 0, 100, textDensity)"
                                            >
                                            </validate-input>
                                        </div>
                                        <div class="backgroundItem">
                                            <tool-slider :value="textDensity" :isWordArt="isWordArt" :min="0" :max="100" :step="1" unit="%" @input="changeTextDensity"></tool-slider>
                                        </div>
                                    </div>
                                </div>
                                <div class="set-style-bottom">
                                    <span class="style-bottom-reset" :class="isUpdata ? 'isUpdata' : ''" @click="rebackDefault">
                                        <span class="style-bottom-icon">
                                            <svg class="svg-icon">
                                                <use xlink:href="#svg-word-reset"></use>
                                            </svg>
                                        </span>
                                        恢复默认
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="wordArt-content-left">
                        <div class="wordArt-content-left-top">
                            <canvas class="canvasContainer" ref="mainCanvas" width="878" height="658">
                            </canvas>
                            <div class="wordArt-content-loading"  v-if="isGenerating">
                                <loading></loading>
                                <div class="mask-div">词云正在生成，请耐心等候~</div>
                            </div>
                            <div class="wordArt-content-tips" v-if="isFristCome&&!isGenerating">
                            </div>
                        </div>
                        <div class="wordArt-content-left-bottom">
                            <!--
                                <span class="content-left-generate" :class="(isReGenerateWordCloud&&bgsrc) ? 'is-regenerate' : ''" @click="generateWordCloud">
                                    <span class="generate-icon">
                                        <svg class="svg-icon">
                                            <use xlink:href="#svg-word-generate"></use>
                                        </svg>
                                    </span>
                                    生成词云
                                        <div class="generate-tips" v-show="isReGenerateWordCloud&&bgsrc">
                                            有新改动，请重新生成词云
                                        </div>
                                </span>
                            -->
                            <span class="content-left-generate is-regenerate" :class="[isAddAnimation ? 'is-animation' : '', isGenerating ? 'no-background' : '']" @click="generateWordCloud">
                                <div v-if="isGenerating">正在生成...</div>
                                <div v-else>
                                    <span class="generate-icon">
                                        <svg class="svg-icon">
                                            <use xlink:href="#svg-word-generate"></use>
                                        </svg>
                                    </span>
                                    生成词云
                                </div>
                            </span>
                        </div>
                    </div>
                </div>
                <div class="wordArt-mask-footer">
                    <div class="mask-footer"></div>
                    <button class="mask-footer-application" :class="(isGenerateWordArt&&!isReGenerateWordCloud) ? '':'disabled'" @click="saveWordArt">应用到画板</button>
                    <button class="mask-footer-cancel" @click="closeEditor">取消</button>
                </div>
            </div>
        </div>
    `,
    mixins: [Ktu.mixins.dataHandler, Ktu.mixins.popupCtrl, Ktu.mixins.uploadSetting, Ktu.mixins.normalWaterFall, Ktu.mixins.copyright, Ktu.mixins.textInContainer],
    data() {
        return {
            isReverse: false,
            // 导航栏选项
            navList: [
                {
                    name: '选择形状',
                    svgId: '#edit-choose-shape',
                },
                {
                    name: '编辑文本',
                    svgId: '#edit-text',
                },
                {
                    name: '设置样式',
                    svgId: '#edit-set-style',
                },
            ],
            // 编辑文本按钮
            optionList: [
                {
                    option: '删除',
                    svgId: '#svg-word-detele',
                },
                {
                    option: '重置',
                    svgId: '#svg-word-reset',
                },
                {
                    option: '清空',
                    svgId: '#svg-word-empty',
                },
            ],

            // 表格表头
            theadList: [
                {
                    label: '编辑文本',
                    width: 225,
                    class: 'first-item',
                },
                {
                    label: '词频',
                    width: 54,
                    class: 'second-item',
                },
                {
                    label: '颜色',
                    width: 54,
                    class: 'third-item',
                },
                {
                    label: '字体',
                    width: 112,
                    class: 'four-item',
                },
                {
                    label: '角度',
                    width: 60,
                    class: 'five-item',
                },
            ],
            // 当前active Tab页
            activeItem: 0,

            foreground: '#000',
            direction: 'up',
            styleDirection: 'down',
            selectIndex: 0,
            colorIndex: 0,
            // 显示高级是否展开
            isExtendAdvanced: false,
            // 用来存储table数据
            tableData: [
                {
                    title: '凡科',
                    wordNum: 10,
                    color: 'transparent',
                    fontId: -10,
                    angle: '',
                },
                {
                    title: '快图',
                    wordNum: 10,
                    color: 'transparent',
                    fontId: -10,
                    angle: '',
                },
                {
                    title: '词云',
                    wordNum: 10,
                    color: 'transparent',
                    fontId: -10,
                    angle: '',
                },
            ],
            // 设置样式上方的颜色列表
            colorListData: [
                {
                    color: '#ce93d8',
                },
                {
                    color: '#42a5f5',
                },
                {
                    color: '#f4511e',
                },
                {
                    color: '#c8e6c9',
                },
                {
                    color: '#9fa8da',
                },
            ],
            // 选择图像上方类型
            imageNavList: [
                {
                    name: '图形形状',
                },
                {
                    name: '文字形状',
                },
                {
                    name: '上传图片',
                },
            ],
            // 图形形状上的label
            topicList: [
                {
                    key: 52,
                    name: '基础',
                    category: 3,
                },
                {
                    key: 55,
                    name: '心形',
                    category: 3,
                },
                {
                    key: 56,
                    name: '星形',
                    category: 3,
                },
                {
                    key: 57,
                    name: '花形',
                    category: 3,
                },
                {
                    key: 58,
                    name: '多边形',
                    category: 3,
                },
                {
                    key: 61,
                    name: '立体',
                    category: 3,
                },
                {
                    key: 63,
                    name: '半圆',
                    category: 3,
                },
                {
                    key: 64,
                    name: '祥云',
                    category: 3,
                },
                {
                    key: 31,
                    name: '名片',
                    category: 2,
                },
                {
                    key: 32,
                    name: '商务',
                    category: 2,
                },
                {
                    key: 33,
                    name: '社交',
                    category: 2,
                },
                {
                    key: 34,
                    name: '科技',
                    category: 2,
                },
                {
                    key: 35,
                    name: '人物',
                    category: 2,
                },
                {
                    key: 36,
                    name: '金融',
                    category: 2,
                },
                {
                    key: 37,
                    name: '自然',
                    category: 2,
                },
                {
                    key: 38,
                    name: '服饰',
                    category: 2,
                },
                {
                    key: 42,
                    name: '动物',
                    category: 2,
                },
                {
                    key: 43,
                    name: '运动',
                    category: 2,
                },
                {
                    key: 44,
                    name: '教育',
                    category: 2,
                },
                {
                    key: 45,
                    name: '美食',
                    category: 2,
                },
                {
                    key: 46,
                    name: '表情',
                    category: 2,
                },
                {
                    key: 49,
                    name: '娱乐',
                    category: 2,
                },
                {
                    key: 51,
                    name: '学习',
                    category: 2,
                },
            ],
            // 用来存储文字排列的信息
            labelListData: [
                {
                    svgId: '#svg-word-arrangement',
                    angle: [0],
                },
                {
                    svgId: '#svg-word-arrangement1',
                    angle: [0],
                },
                {
                    svgId: '#svg-word-arrangement2',
                    angle: [270],
                },
                {
                    svgId: '#svg-word-arrangement3',
                    angle: [0, 270],
                },
                {
                    svgId: '#svg-word-arrangement4',
                    angle: [315, 45],
                },
                {
                    svgId: '#svg-word-arrangement5',
                    angle: [315],
                },
                {
                    svgId: '#svg-word-arrangement6',
                    angle: [30, 330],
                },
                {
                    svgId: '#svg-word-arrangement7',
                    angle: [30],
                },
                {
                    svgId: '#svg-word-arrangement8',
                    angle: [45, 315],
                },
                {
                    svgId: '#svg-word-arrangement9',
                    angle: [0, 315, 270],
                },
            ],
            // 自定义旋转角度列表
            angleListData: [
                { angle: 0 },
                { angle: 45 },
                { angle: 135 },
                { angle: 225 },
                { angle: 315 },
            ],
            isActiveText: ['bold'],
            // 用来存储前十个
            topicTenList: [],
            // 十个后面的列表
            topicTenAfterList: [],
            // 传给Font组件，判断是否是词云
            isWordArt: true,
            // 字体类型数组
            fontFaimlyList: Ktu.config.tool.options.fontFaimlyList,
            // 控制哪个旋转组件显示
            rotateShowIndex: -1,
            // 批量导入弹窗
            isShowBatchMask: false,
            // 图片设置弹窗
            isShowImageMask: false,
            // 自定义弹窗
            isShowCustomizeMask: false,
            // 存储输入数据
            importData: '',
            imageNavIndex: 0,
            topicListIndex: 1,
            topicAfterIndex: -1,
            // 素材所要参数
            materialGetLimit: 100,
            materialTopicValue: 52,
            materialTopicCategory: 3,
            materialIndex: 0,
            iamgeShowData: [],
            // 控制更多模块显示隐藏
            isShowMore: false,
            textareaStyle: {},
            backgroundOpacity: 95,
            textNum: 200,
            textDensity: 70,
            isDeleteStatus: false,
            addColor: '',
            // 向右移动的距离
            leftDistance: 0,
            // 向右移动了多少个格子
            leftDistanceGird: 0,
            angleVal: 0,
            isUpdata: false,
            isDefaultData: {},
            rowIndex: -1,
            tableTemplist: [],
            // 添加的文本
            addTableText: '',
            // 添加文本的数量
            addTableTextNum: 0,
            addTableColor: '#fff',
            addTextAngle: 0,
            addTableFontId: 0,
            addAngleExtend: false,
            isMoreThanHeight: false,
            // 批量导入的默认字体
            importFontId: 58,
            textareaFontId: 58,
            // 判断是否要重新生成词云
            isReGenerateWordCloud: false,
            // 判断第几个文字排列
            showCustomizeMaskIndex: 1,
            // 文本框中的文字
            shapeText: '',
            // 是否要重置
            isResetTableData: false,
            // 记录角度top位置
            angleScrollTop: 0,
            // 用来储存选取的角度数组
            selectAngleList: [0],
            // 是否已经生成词云
            isGenerateWordArt: false,
            // 词云数据
            ktWordCloud: null,
            bgsrc: null,
            textShapeColor: '#000',
            rectColor: '#000',
            imageColor: '#000',
            isFristChangeColor: true,
            // 是否生成中
            isGenerating: false,
            // 是否已经生成
            isGenerated: false,
            // 是否应用中
            isSending: false,
            // 是否可以点击使用图片
            isUseUploadImage: false,
            // 一开始canvas中的字体大小
            canvasFontSize: 50,
            // 编辑模式
            colorMode: 0,
            // 素材库形状还是文字形状
            shapeMode: 0,
            // 高清背景图base64
            bgBase64: '',
            // 判断哪个形状被选中
            selectedItem: {},
            // 一开始进来
            isFristCome: true,
            // 控制图形列表状态
            materialListShow: true,
            widthVal: '',
            heightVal: '',
            unitList: [{
                value: 1,
                label: '像素',
            },
                /* {
                    value: 2,
                    label: '毫米',
                },
                {
                    value: 3,
                    label: '厘米',
                },
                {
                    value: 4,
                    label: '英寸',
                }, */
            ],
            unitLabel: '像素',
            unit: 1,
            isLockWH: false,
            iconConf: {
                width: 68,
                height: 160,
            },
            isRedioCanvas: false,
            redioOfRect: 1,
            uploadList: [],
            renderDegree: 100,
            spliceDegree: 100,
            imageChooseIndex: -1,
            isShowMaterialMask: false,
            width: 0,
            height: 0,
            pathGradients: [],
            paths: [],
            originalColors: [],
            changedColors: [],
            changeFrist: true,
            changedColorObject: {},
            changedColorList: [],
            meterialColorList: [],
            objectId: '',
            clipId: '',
            imgSvg: '',
            chooseMaterialItem: '',
            chooseMaterialIndex: -1,
            viewBoxWidth: 0,
            viewBoxHeight: 0,
            imgSvgSrc: '',
            showMaterialIndex: -1,
            files: [],
            changeImageCanvas: '',
            changeImageCxt: '',
            changeImageData: '',
            copyImageData: '',
            changeImageSrc: '',
            renderDegreeSrc: '',
            spliceDegreeSrc: '',
            renderValue: 100,
            spliceValue: 100,
            getImgLoading: true,
            isUseRectShape: false,
            randomColorList: [
                [
                    {
                        color: '#F7A325',
                    },
                    {
                        color: '#12492F',
                    },
                    {
                        color: '#0A2F35',
                    },
                    {
                        color: '#F56038',
                    },
                    {
                        color: '#FFCA7A',
                    },
                ],
                [
                    {
                        color: '#454D66',
                    },
                    {
                        color: '#309975',
                    },
                    {
                        color: '#58B368',
                    },
                    {
                        color: '#DAD873',
                    },
                    {
                        color: '#EFEEB4',
                    },
                ],
                [
                    {
                        color: '#072448',
                    },
                    {
                        color: '#54D2D2',
                    },
                    {
                        color: '#FFCB00',
                    },
                    {
                        color: '#F8AA4B',
                    },
                    {
                        color: '#FF6150',
                    },
                ],
                [
                    {
                        color: '#1F306E',
                    },
                    {
                        color: '#553772',
                    },
                    {
                        color: '#8F3B76',
                    },
                    {
                        color: '#C7417B',
                    },
                    {
                        color: '#F5487F',
                    },
                ],
                [
                    {
                        color: '#343090',
                    },
                    {
                        color: '#5F59F7',
                    },
                    {
                        color: '#6592FD',
                    },
                    {
                        color: '#44C2FD',
                    },
                    {
                        color: '#8C61FF',
                    },
                ],
                [
                    {
                        color: '#492B7C',
                    },
                    {
                        color: '#301551',
                    },
                    {
                        color: '#ED8A0A',
                    },
                    {
                        color: '#F6D912',
                    },
                    {
                        color: '#FFF29C',
                    },
                ],
                [
                    {
                        color: '#FF9210',
                    },
                    {
                        color: '#D28830',
                    },
                    {
                        color: '#C16C08',
                    },
                    {
                        color: '#FFAA45',
                    },
                    {
                        color: '#FFBD6F',
                    },
                ],
                [
                    {
                        color: '#C80606',
                    },
                    {
                        color: '#260000',
                    },
                    {
                        color: '#5B9CAF',
                    },
                    {
                        color: '#E9AF2A',
                    },
                    {
                        color: '#557222',
                    },
                ],
                [
                    {
                        color: '#78B0A6',
                    },
                    {
                        color: '#76426C',
                    },
                    {
                        color: '#B8D6C7',
                    },
                    {
                        color: '#2A2D43',
                    },
                    {
                        color: '#7B202C',
                    },
                ],
                [
                    {
                        color: '#D29C30',
                    },
                    {
                        color: '#6F92E1',
                    },
                    {
                        color: '#ED40A2',
                    },
                    {
                        color: '#3356A6',
                    },
                    {
                        color: '#FFC145',
                    },
                ],
                [
                    {
                        color: '#5EB7B7',
                    },
                    {
                        color: '#96D1C7',
                    },
                    {
                        color: '#FC7978',
                    },
                    {
                        color: '#FFAFB0',
                    },
                    {
                        color: '#FF8A65',
                    },
                ],
                [
                    {
                        color: '#B7DCCC',
                    },
                    {
                        color: '#95ADBE',
                    },
                    {
                        color: '#574F7D',
                    },
                    {
                        color: '#503A65',
                    },
                    {
                        color: '#3C2A4D',
                    },
                ],
                [
                    {
                        color: '#7c0a02',
                    },
                    {
                        color: '#b22222',
                    },
                    {
                        color: '#e25822',
                    },
                    {
                        color: '#f1bc31',
                    },
                    {
                        color: '#FFA726',
                    },
                ],
                [
                    {
                        color: '#2B2B2B',
                    },
                    {
                        color: '#E3B04B',
                    },
                    {
                        color: '#F1D6AB',
                    },
                    {
                        color: '#DDDDDD',
                    },
                    {
                        color: '#5A5A5A',
                    },
                ],
                [
                    {
                        color: '#8F4426',
                    },
                    {
                        color: '#DE6B35',
                    },
                    {
                        color: '#F9B282',
                    },
                    {
                        color: '#31BBCE',
                    },
                    {
                        color: '#64ccda',
                    },
                ],
                [
                    {
                        color: '#3C4245',
                    },
                    {
                        color: '#5F6769',
                    },
                    {
                        color: '#719192',
                    },
                    {
                        color: '#DFCDC3',
                    },
                    {
                        color: '#A05F5F',
                    },
                ],
                [
                    {
                        color: '#583A17',
                    },
                    {
                        color: '#E85569',
                    },
                    {
                        color: '#DE1D41',
                    },
                    {
                        color: '#F6B8AD',
                    },
                    {
                        color: '#FFDA8B',
                    },
                ],
                [
                    {
                        color: '#FFA721',
                    },
                    {
                        color: '#2B89D6',
                    },
                    {
                        color: '#C42E4A',
                    },
                    {
                        color: '#EFDBAE',
                    },
                    {
                        color: '#662e36',
                    },
                ],
                [
                    {
                        color: '#D7C1A1',
                    },
                    {
                        color: '#C1BFBB',
                    },
                    {
                        color: '#96806F',
                    },
                    {
                        color: '#C2A954',
                    },
                    {
                        color: '#DBD6CA',
                    },
                ],
                [
                    {
                        color: '#64B39B',
                    },
                    {
                        color: '#BEACA7',
                    },
                    {
                        color: '#7EDDD1',
                    },
                    {
                        color: '#CA3845',
                    },
                    {
                        color: '#FEC3D9',
                    },
                ],
            ],
            // 是否添加动画
            isAddAnimation: false,
        };
    },
    props: {
        eventType: {
            type: [String, Number],
        },
    },
    computed: {
        navTopStyle() {
            return {
                height: `${this.activeItem * 68}px`,
            };
        },

        navBottomStyle() {
            return {
                height: `${530 - (this.activeItem + 1) * 68}px`,
            };
        },

        title() {
            if (this.wordArtEditor.type === 'update') {
                return '更改二维码';
            }
            return '添加二维码';
        },

        btnTitle() {
            if (this.wordArtEditor.type === 'update') {
                return '更改完成';
            }
            return '应用到画板';
        },

        rectStyle() {
            let width = 0;
            let height = 0;

            width = this.widthVal;
            height = this.heightVal;

            const redio = 298 / 127;

            const rectRedio = this.widthVal / this.heightVal;

            if (rectRedio > redio) {
                if (width > 298) {
                    width = 298;
                    height = 298 / rectRedio;
                }
            } else {
                if (height > 124) {
                    height = 124;
                    width = 124 * rectRedio;
                }
            }

            return {
                width: `${width}px`,
                height: `${height}px`,
                backgroundColor: `${this.rectColor}`,
            };
        },

        //  是否显示词云编辑页
        wordArtEditor: {
            get() {
                return this.$store.state.base.wordArtEditor;
            },
            set(value) {
                this.$store.state.base.wordArtEditor = value;
            },
        },
        isOpenUtilModal: {
            get() {
                return this.$store.state.base.isOpenUtilModal;
            },
            set(value) {
                this.$store.state.base.isOpenUtilModal = value;
            },
        },

        tip() {
            if (this.isLockWH) {
                return '解锁高宽比';
            }
            return '锁定高宽比';
        },
    },
    watch: {
        tableData: {
            handler(newValue, oldValue) {
                if (this.isFromInitTableData) {
                    return;
                }
                this.isReGenerateWordCloud = true;
                this.isResetTableData = true;
            },
            deep: true,
        },
        shapeText(value, oldValue) {
            if (value.length > oldValue.length) {
                this.getCanvasInfo(true);
            } else {
                this.getCanvasInfo(false);
            }
            this.$nextTick(() => {
                this.textShapeStyle();
            });
        },
        isReverse(value) {
            this.changeImageAttributes();
        },
        isShowImageMask() {
            this.renderDegree = 100;
            this.spliceDegree = 100;
            this.isReverse = false;
            this.imageColor = '#000';
            this.isFristChangeColor = true;
        },
        isReGenerateWordCloud() {
            if (this.isReGenerateWordCloud) {
                this.isAddAnimation = true;
            }
        },
    },
    mounted() {
        this.isOpenUtilModal = true;
        /* if (this.$refs.tableContainer.scrollHeight > 296) {
            this.isMoreThanHeight = true;
            this.$refs.lastItem.style.position = 'absolute';
            this.$refs.lastItem.style.bottom = 0;
            this.$refs.lastItem.style.background = 'white';
        } */
        if (this.wordArtEditor.type === 'update') {
            const msg = _.cloneDeep(this.selectedData.msg);
            this.tableData = msg.tableData;
            this.bgsrc = msg.bgOringinalSrc;
            this.selectAngleList = msg.selectAngleList;
            this.textNum = msg.textNum;
            this.showCustomizeMaskIndex = msg.showCustomizeMaskIndex;
            this.colorListData = msg.colorListData;
            this.textDensity = msg.textDensity;
            this.backgroundOpacity = msg.backgroundOpacity;
            this.isActiveText = msg.isActiveText;
            this.textShapeColor = msg.textShapeColor;
            this.textareaFontId = msg.textareaFontId;
            this.shapeText = msg.shapeText;
            this.shapeMode = msg.shapeMode;
            this.colorMode = msg.colorMode;
            this.imageNavIndex = msg.shapeMode;
            this.selectedItem = msg.selectedItem;
            this.importFontId = msg.importFontId;
            this.imageChooseIndex = msg.imageChooseIndex;
            this.isLockWH = msg.isLockWH;
            this.widthVal = msg.widthVal;
            this.heightVal = msg.heightVal;
            this.isRedioCanvas = msg.isRedioCanvas;
            this.rectColor = msg.rectColor;
            if (msg.topicListIndex == 0) {
                this.topicListIndex = 0;
                this.materialListShow = false;
            } else {
                this.materialListShow = true;
            }
            if (this.shapeText != '') {
                this.changeTextareaFontId(this.textareaFontId);
                this.textShapeStyle();
            }
        }
        this.getFileList();
        this.initTableDataFont(true);
        this.initTableTemplist();
        this.defaultDataInit();
        this.ktWordCloud = new ktWordCloud({
            el: this.$refs.mainCanvas,
        });
        setTimeout(() => {
            this.initUpload('.upload-btn');
        });
    },
    destroyed() {
        this.isOpenUtilModal = false;
    },
    methods: {
        fileChange(e) {
            this.files = e.target.files[0];
            if (this.files.size > 512 * 1024) {
                this.$Notice.warning('图片仅支持小于500K');
                return;
            }
            if (this.uploadList.length > 50) {
                this.$Notice.warning('图片最多可上传50张');
                return;
            }
            Ktu.log('wordCloudEdit', 'uploadImage');
            this.getImgLoading = true;
            const url = `/ajax/advanceUpload_h.jsp?cmd=uploadFontCloud&totalSize=${this.files.size}&type=1`;
            const postData = new FormData();
            postData.append('filedata', this.files);
            axios
                .post(url, postData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                })
                .then(res => {
                    if (res.status == 200 && res.data.success) {
                        this.getFileList();
                    }
                })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => {
                });
            /* const reads = new FileReader();
            reads.readAsDataURL(this.files);
            reads.onload = e => {
                this.$set(this.uploadList[0], 'src', e.target.result);
            }; */
        },
        getFileList() {
            // this.getImgLoading = true;
            const url = `ajax/ktuImage_h.jsp?cmd=getFontCloudList&type=1`;
            axios
                .get(url)
                .then(res => {
                    if (res.status == 200 && res.data.success) {
                        this.uploadList = [];
                        this.uploadList.push(...res.data.data);
                    }
                })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => {
                    this.getImgLoading = false;
                });
        },
        saveMaterialInfo(item, index) {
            this.chooseMaterialItem = item;
            this.chooseMaterialIndex = index;
        },
        changeMaterialColor(value) {
            let index = 0;
            for (let i = 0; i < this.changedColorList.length; i++) {
                if (this.selectedItem.id == this.changedColorList[i].id) {
                    index = i;
                }
            }
            for (let i = 0; i < this.changedColors.length; i++) {
                if (this.changedColorList[index].colorLists[this.chooseMaterialIndex].includes(i)) {
                    this.$set(this.changedColors, i, value);
                }
            }
            /* for (let i = 0; i < this.changedColors.length; i++) {
                if (this.changedColors[i] == this.meterialColorList[this.chooseMaterialIndex]) {
                    this.$set(this.changedColors, i, value);
                }
            } */
            this.imgSvg = this.toSvg();
            this.$set(this.meterialColorList, this.chooseMaterialIndex, value);
        },
        changeMaterialImage() {
            this.imgSvgSrc = `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(this.imgSvg)))}`;
            this.bgsrc = this.imgSvgSrc;
            this.$set(this.iamgeShowData[this.showMaterialIndex], 'filePath', this.imgSvgSrc);
            this.isShowMaterialMask = false;
            this.isUseRectShape = false;
        },
        chooseImageItem(index, item) {
            this.imageChooseIndex = index;
            this.isReGenerateWordCloud = true;
            this.isUseRectShape = false;
            this.shapeMode = 2;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.src = `${item.p450p}&time=${new Date()}`;
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                canvas.height = img.height;
                canvas.width = img.width;
                ctx.drawImage(img, 0, 0, img.width, img.height);
                const dataURL = canvas.toDataURL('image/png');
                this.bgsrc = dataURL;
            };
        },
        setDownload() {
            if (this.isRedioCanvas && this.isLockWH) {
                this.isLockWH = !this.isLockWH;
            } else {
                this.isLockWH = true;
            }
            this.isRedioCanvas = !this.isRedioCanvas;
            this.redioOfRect = Ktu.edit.documentSize.width / Ktu.edit.documentSize.height;
        },
        selectUnit(option) {
            this.unit = option.value;
        },
        toggleLock() {
            const width = parseInt(this.widthVal, 10);
            const height = parseInt(this.heightVal, 10);

            if (!height) {
                this.$Notice.error('请输入高度值');
                $('#rf_canvasHeight').focus();
                return;
            }
            if (!width) {
                this.$Notice.error('请输入宽度值');
                $('#rf_canvasWidth').focus();
                return;
            }

            if (this.isLockWH) {
                this.isRedioCanvas = false;
            }

            this.isLockWH = !this.isLockWH;

            this.redioOfRect = width / height;
        },

        blurInput(e) {
            this.widthVal = (parseInt(this.widthVal, 10) || 0);
            this.heightVal = (parseInt(this.heightVal, 10) || 0);
        },

        focusInput(e) {
            e.target.value = parseInt(e.target.value.replace(/[^\d]/g, '') || '', 10);
            if (e.target.placeholder == '高度') {
                this.heightVal = (parseInt(this.heightVal, 10) || 0);
            } else {
                this.widthVal = (parseInt(this.widthVal, 10) || 0);
            }
        },

        changeW(e) {
            e.target.value = e.target.value.replace(/[^\d]/g, '') || '';

            if (this.isLockWH) {
                const ratio = this.redioOfRect;

                this.heightVal = Math.round(e.target.value / ratio);
            }
        },
        changeH(e) {
            e.target.value = e.target.value.replace(/[^\d]/g, '') || '';

            if (this.isLockWH) {
                const ratio = this.redioOfRect;

                this.widthVal = Math.round(e.target.value * ratio);
            }
        },
        // 改变滑动条数据
        changeSliderCount(type, min, max, value) {
            // eslint-disable-next-line radix
            let data = parseInt(value);
            if (isNaN(data)) {
                this.$Notice.warning('请正确输入数字');
            }
            if (data > max) {
                data = max;
            } else if (data < min) {
                data = min;
            }
            if (type == '0') {
                this.changeBackgroundOpacity(data);
            } else if (type == '1') {
                this.textNum = data;
            } else if (type == '2') {
                this.textDensity = data;
            }
            this.isUpdata = true;
            this.isReGenerateWordCloud = true;
        },
        addRgba(value) {
            const color = value.colorRgb(0.5);
            return color;
        },
        textShapeStyle() {
            let bold = '';
            if (this.isActiveText.hasStr('bold') >= 0) {
                bold = 'bold';
            } else {
                bold = 'normal';
            }
            let italic = '';
            if (this.isActiveText.hasStr('italic') >= 0) {
                italic = 'italic';
            } else {
                italic = 'normal';
            }
            this.textareaStyle = {
                fontSize: `${this.canvasFontSize}px`,
                fontFamily: this.shapeTextFamily,
                color: this.textShapeColor,
                fontWeight: bold,
                fontStyle: italic,
            };
        },
        changeModeActive(mode) {
            this.colorMode = mode;
            this.isReGenerateWordCloud = true;
            this.isUpdata = true;
            this.isDeleteStatus = false;
            if (mode == 0) {
                Ktu.log('wordCloudEdit', 'styleDefaultColor');
            } else {
                Ktu.log('wordCloudEdit', 'styleCustomColor');
            }
        },
        // 改变字数时获取textar下canvas的
        getCanvasInfo(isAdd) {
            if (!this.shapeTextareaCanvasCtx) {
                const canvas = this.$refs.shapeTextareaCanvas;
                this.shapeTextareaCanvasCtx = canvas.getContext('2d');
            }
            const { width, height } = this.shapeTextareaCanvasCtx.canvas;
            this.shapeTextareaCanvasCtx.clearRect(0, 0, width, height);
            this.shapeTextareaCanvasCtx.fillStyle = this.textShapeColor;
            let bold = '';
            if (this.isActiveText.hasStr('bold') >= 0) {
                bold = 'bold';
            } else {
                bold = 'normal';
            }
            let italic = '';
            if (this.isActiveText.hasStr('italic') >= 0) {
                italic = 'italic';
            } else {
                italic = 'normal';
            }
            this.shapeTextareaCanvasCtx.font = `${bold} ${italic} ${this.canvasFontSize}px ${this.shapeTextFamily}`;
            let textWidth = this.shapeTextareaCanvasCtx.measureText(this.shapeText).width;
            // if (isAdd) {
            while (textWidth > 300) {
                this.shapeTextareaCanvasCtx.clearRect(0, 0, width, height);
                this.canvasFontSize--;
                this.shapeTextareaCanvasCtx.font = `${bold} ${italic} ${this.canvasFontSize}px ${this.shapeTextFamily}`;
                textWidth = this.shapeTextareaCanvasCtx.measureText(this.shapeText).width;
            }
            // } else {
            while (textWidth < 290 && this.canvasFontSize < 50) {
                this.shapeTextareaCanvasCtx.clearRect(0, 0, width, height);
                this.canvasFontSize++;
                this.shapeTextareaCanvasCtx.font = `${bold} ${italic} ${this.canvasFontSize}px ${this.shapeTextFamily}`;
                textWidth = this.shapeTextareaCanvasCtx.measureText(this.shapeText).width;
            }
            // }
            /* let MaxWidthtext = 0;
            for (let i = 0; i < this.shapeText.length; i++) {
                if (ctx.measureText(this.shapeText[i]).width > MaxWidthtext) {
                    MaxWidthtext = ctx.measureText(this.shapeText[i]).width;
                }
            } */
        },
        wordNumCheck() {
            if (this.tableData[this.rowIndex].wordNum <= 0) {
                this.tableData[this.rowIndex].wordNum = 1;
            }
            if (this.tableData[this.rowIndex].wordNum >= 10) {
                this.tableData[this.rowIndex].wordNum = 10;
            }
            Ktu.log('wordCloudEdit', 'changeWordNum');
        },
        wordTitlecheck() {
            this.tableData[this.rowIndex].title = Ktu.decodeHtml(this.tableData[this.rowIndex].title);
            if (!this.tableData[this.rowIndex].title) {
                this.tableData.splice(this.rowIndex, 1);
                return;
            }
            this.tableData[this.rowIndex].title = Ktu.encodeHtml(this.tableData[this.rowIndex].title);
            if (this.oldWordTitle == this.tableData[this.rowIndex].title) {
                return;
            }
            this.getFontFamily(this.tableData[this.rowIndex].fontId, this.tableData[this.rowIndex].title, this.rowIndex);
        },
        wordTitleFocus(index, event) {
            event.currentTarget.select();
            this.oldWordTitle = this.tableData[index].title;
        },
        angleCheck() {
            Ktu.log('wordCloudEdit', 'changeAngle');
        },
        refreshDefault() {
            this.tableData[this.rowIndex].fontId = -10;
            Ktu.log('wordCloudEdit', 'clickDefaultFF');
        },
        wordCloudTips() {
            Ktu.log('wordCloudEdit', 'clickWordCloudTips');
        },
        // 禁止文本换行
        stopChangeRow(e) {
            e.preventDefault();
            return false;
        },
        textshapeblur() {
            this.changeTextareaFontId(this.textareaFontId);
        },
        // 改变选择图形中的文字颜色
        changeColorOfShape(value) {
            this.textShapeColor = value;
            this.textShapeStyle();
            Ktu.simpleLog('wordCloudEdit', 'changeTextShapeColor');
        },

        changeColorOfRect(value) {
            this.rectColor = value;
        },
        changeColorOfImage(value) {
            this.imageColor = value;
            this.isFristChangeColor = false;
            this.changeImageAttributes();
        },
        // 上传图片使用该图形
        useUploadImage() {
            this.isReGenerateWordCloud = true;
            this.shapeMode = 2;
        },
        uploadPushList(tmpFileArr, tmpDeferArr, file) {
            const createObjectURL = function (blob) {
                return window[window.webkitURL ? 'webkitURL' : 'URL'].createObjectURL(blob);
            };
            const defer = $.Deferred();
            tmpDeferArr.push(defer);
            if (file.size > 10 * 1024 * 1024) {
                this.$Notice.warning(`${file.name}大于10M,请压缩后上传`);
                defer.resolve();
            } else {
                if (/svg/.test(file.type)) {
                    const newImgData = createObjectURL(file);
                    const newImg = new Image();
                    newImg.onload = info => {
                        const svgJudge = (file, target, defer) => {
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
                        };
                        const { target } = info;
                        svgJudge.bind(this)(file, target, defer);
                    };
                    newImg.src = newImgData;
                } else {
                    tmpFileArr.push(file);
                    defer.resolve();
                }
            }
        },
        uploadingTips() {
            this.$Notice.warning('正在上传，请稍后...');
        },
        uploadProgress(data, file) {
            let percent = Math.floor(100 * (data.loaded / data.total));
            percent > 99 && (percent = 99);
        },
        uploadSuccess(data, file) {
            this.bgsrc = data.path;
            this.isUseUploadImage = true;
        },
        useRectShape() {
            if (this.widthVal <= 0 && this.heightVal <= 0) {
                this.$Notice.warning('请正确输入信息');
                return;
            }

            this.isReGenerateWordCloud = true;

            const tmpCanvas = document.createElement('canvas');

            // tmpCtx.strokeStyle = "red";

            // tmpCtx.strokeRect(50, 50, 50, 50);
            const redio = this.widthVal / this.heightVal;
            let width;
            let height;
            if (redio > 1) {
                width = 500;
                height = width / redio;
            } else {
                height = 500;
                width = height * redio;
            }
            tmpCanvas.width = width;
            tmpCanvas.height = height;
            const tmpCtx = tmpCanvas.getContext('2d');
            tmpCtx.fillStyle = `${this.rectColor}`;

            this.isUseRectShape = true;

            this.shapeMode = 0;

            tmpCtx.fillRect(0, 0, width, height);

            this.bgsrc = tmpCanvas.toDataURL();

            this.generateWordCloud();
        },
        // 文字形状使用该图形
        useWordShape() {
            if (!this.shapeText) {
                this.$Notice.warning('请先添加文本');
                return;
            }
            this.shapeMode = 1;
            this.isReGenerateWordCloud = true;
            let bold = '';
            this.isUseRectShape = false;
            if (this.isActiveText.hasStr('bold') >= 0) {
                bold = 'bold';
            } else {
                bold = 'normal';
            }
            let italic = '';
            if (this.isActiveText.hasStr('italic') >= 0) {
                italic = 'italic';
            } else {
                italic = 'normal';
            }
            const tmpCanvas = document.createElement('canvas');
            const tmpCtx = tmpCanvas.getContext('2d', {
                willReadFrequently: true,
            });
            const tmpCanvasScale = 10;
            tmpCtx.font = `${bold} ${italic} ${this.canvasFontSize * tmpCanvasScale}px ${this.shapeTextFamily}`;
            const textWidth = tmpCtx.measureText(this.shapeText).width;
            const fw = textWidth;
            const fh = this.canvasFontSize * tmpCanvasScale;
            const boxWidth = parseInt(fw + 0.5 * fh, 10);
            const boxHeight = parseInt(1.5 * fh, 10);
            tmpCanvas.setAttribute('width', boxWidth);
            tmpCanvas.setAttribute('height', boxHeight);
            tmpCtx.translate(boxWidth / 2, boxHeight / 2);
            // fillText 时修复 偏移到中心点
            const fillTextOffsetX = -fw / 2;
            const fillTextOffsetY = -fh * 0.5;
            tmpCtx.fillStyle = this.textShapeColor;
            tmpCtx.font = `${bold} ${italic} ${this.canvasFontSize * tmpCanvasScale}px ${this.shapeTextFamily}`;
            tmpCtx.textBaseline = 'middle';
            tmpCtx.fillText(this.shapeText, fillTextOffsetX, fillTextOffsetY + this.canvasFontSize * tmpCanvasScale * 0.5);
            console.time();
            const _imgData = tmpCtx.getImageData(0, 0, boxWidth, boxHeight);
            const info = wordCloudUnit.getImageDataInfo(_imgData.data, boxWidth, boxWidth, boxHeight, 1, 0);
            const imgRealWidth = (info.bounds[1] - info.bounds[3]);
            const imgRealHeight = (info.bounds[2] - info.bounds[0]);
            const tmpCanvas1 = document.createElement('canvas');
            const tmpCtx1 = tmpCanvas1.getContext('2d', {
                willReadFrequently: true,
            });
            tmpCanvas1.setAttribute('width', imgRealWidth);
            tmpCanvas1.setAttribute('height', imgRealHeight);
            tmpCtx1.drawImage(tmpCanvas, info.bounds[3], info.bounds[0], imgRealWidth, imgRealHeight, 0, 0, imgRealWidth, imgRealHeight);
            /* tmpCanvas1.style.position="absolute";
            tmpCanvas1.style.left="0";
            tmpCanvas1.style.top="0";
            tmpCanvas1.style.zIndex="999";
            document.body.appendChild(tmpCanvas1) */
            this.bgsrc = tmpCanvas1.toDataURL();
            Ktu.log('wordCloudEdit', 'useTextShape');
            console.timeEnd();
            this.generateWordCloud();
        },
        // 使用素材 init是第一次进入的时候有个默认图形，不显示修改生成的提示
        userMaterial(item, index, isInit) {
            if (this.selectedItem === item) {
                return;
            }
            const { width, height } = item;
            let newW = width;
            let newH = height;
            this.isUseRectShape = false;
            if (width > height) {
                if (width > 800) {
                    newW = 800;
                    newH = height * newW / width;
                }
                if (width < 500) {
                    newW = 500;
                    newH = height * newW / width;
                }
            } else {
                if (height > 800) {
                    newH = 800;
                    newW = width / height * newH;
                }
                if (height < 500) {
                    newH = 500;
                    newW = width / height * newH;
                }
            }
            if (Ktu.isMozilla()) {
                console.time();
                axios.get(item.filePath).then(res => {
                    // 把svg中的中文转换一下，不然生成图片时可能会出现问题
                    const svgRes = res.data;

                    const doc = new DOMParser().parseFromString(svgRes, 'image/svg+xml');
                    const _svg = doc.getElementsByTagName('svg')[0];

                    document.body.appendChild(_svg);
                    const bBox = _svg.getBBox();
                    _svg.setAttribute('width', bBox.width);
                    _svg.setAttribute('height', bBox.height);
                    document.body.removeChild(_svg);
                    _svg.style.position = '';
                    _svg.style.left = '';
                    const DOMURL = window.URL || window.webkitURL || window;
                    const svgBlob = new Blob([_svg.outerHTML], {
                        type: 'image/svg+xml',
                    });
                    const base64 = DOMURL.createObjectURL(svgBlob);
                    const img = new Image();
                    img.width = newW;
                    img.height = newH;
                    img.onload = () => {
                        const tmpCanvas = document.createElement('canvas');
                        const tmpctx = tmpCanvas.getContext('2d');
                        tmpCanvas.setAttribute('width', img.width);
                        tmpCanvas.setAttribute('height', img.height);
                        tmpctx.drawImage(img, 0, 0, img.width, img.height);

                        const _imgData = tmpctx.getImageData(0, 0, img.width, img.height);
                        const info = wordCloudUnit.getImageDataInfo(_imgData.data, img.width, img.width, img.height, 1, 0);
                        const imgRealWidth = (info.bounds[1] - info.bounds[3]);
                        const imgRealHeight = (info.bounds[2] - info.bounds[0]);
                        const tmpCanvas1 = document.createElement('canvas');
                        const tmpCtx1 = tmpCanvas1.getContext('2d', {
                            willReadFrequently: true,
                        });
                        tmpCanvas1.setAttribute('width', imgRealWidth);
                        tmpCanvas1.setAttribute('height', imgRealHeight);
                        tmpCtx1.drawImage(tmpCanvas, info.bounds[3], info.bounds[0], imgRealWidth, imgRealHeight, 0, 0, imgRealWidth, imgRealHeight);

                        /* tmpCanvas.style.position = 'absolute';
                        tmpCanvas.style.left = '0';
                        tmpCanvas.style.top = '0';
                        tmpCanvas.style.zIndex = '999';
                        document.body.appendChild(tmpCanvas);*/
                        this.bgsrc = tmpCanvas1.toDataURL();
                        this.shapeMode = 0;
                        if (!isInit) {
                            this.isReGenerateWordCloud = true;
                        }
                        this.selectedItem = item;
                        console.timeEnd();
                    };
                    img.crossOrigin = 'anonymous';
                    img.src = base64;
                });
            } else {
                const img = new Image();
                img.width = newW;
                img.height = newH;
                img.onload = () => {
                    const tmpCanvas = document.createElement('canvas');
                    const tmpctx = tmpCanvas.getContext('2d');
                    tmpCanvas.setAttribute('width', img.width);
                    tmpCanvas.setAttribute('height', img.height);
                    tmpctx.drawImage(img, 0, 0, img.width, img.height);
                    const _imgData = tmpctx.getImageData(0, 0, img.width, img.height);
                    const info = wordCloudUnit.getImageDataInfo(_imgData.data, img.width, img.width, img.height, 1, 0);
                    const imgRealWidth = (info.bounds[1] - info.bounds[3]);
                    const imgRealHeight = (info.bounds[2] - info.bounds[0]);
                    const tmpCanvas1 = document.createElement('canvas');
                    const tmpCtx1 = tmpCanvas1.getContext('2d', {
                        willReadFrequently: true,
                    });

                    tmpCanvas1.setAttribute('width', imgRealWidth);
                    tmpCanvas1.setAttribute('height', imgRealHeight);
                    tmpCtx1.drawImage(tmpCanvas, info.bounds[3], info.bounds[0], imgRealWidth, imgRealHeight, 0, 0, imgRealWidth, imgRealHeight);
                    this.bgsrc = tmpCanvas1.toDataURL();

                    /* tmpCanvas1.style.position="absolute";
                    tmpCanvas1.style.left="0";
                    tmpCanvas1.style.top="0";
                    tmpCanvas1.style.zIndex="999";
                    document.body.appendChild(tmpCanvas1);*/
                    this.shapeMode = 0;
                    if (!isInit) {
                        this.isReGenerateWordCloud = true;
                    }
                    this.selectedItem = item;
                };
                img.crossOrigin = 'anonymous';
                img.src = item.filePath;
            }
        },
        getOpacityBgBase64() {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    const tmpCanvas = document.createElement('canvas');
                    const tmpctx = tmpCanvas.getContext('2d');
                    tmpCanvas.setAttribute('width', img.width);
                    tmpCanvas.setAttribute('height', img.height);
                    tmpctx.drawImage(img, 0, 0, img.width, img.height);
                    const newimgData = tmpctx.getImageData(0, 0, img.width, img.height);
                    wordCloudUnit.alphation(newimgData, (100 - this.backgroundOpacity) / 100);
                    tmpctx.putImageData(newimgData, 0, 0);
                    this.bgBase64 = tmpCanvas.toDataURL();
                    resolve();
                };
                img.crossOrigin = 'anonymous';
                img.src = this.bgsrc;
            });
        },
        // 生成词云
        async generateWordCloud() {
            // 生成词云功能入口
            Ktu.log('wordCloudEdit', 'generate');
            if (!this.bgsrc || this.isGenerating) {
                return;
            }
            if (this.tableData.length == 0) {
                this.$Notice.warning('请先添加文本');
                return;
            }
            const canvas = this.$refs.mainCanvas;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.isGenerating = true;
            this.isFristCome = false;
            this.isAddAnimation = false;
            setTimeout(() => {
                const tableResult = _.cloneDeep(this.tableData);
                console.log('这是tableResult',tableResult)
                tableResult.forEach(e => {
                    if (isNaN(e.angle) || !e.angle) {
                        e.angle = 'default';
                    } else {
                        e.angle = parseInt(e.angle, 10);
                    }
                    if (e.color === 'transparent') {
                        e.color = 'default';
                    }
                    if (e.fontId === -10) {
                        e.fontId = this.importFontId;
                    }
                });
                this.isReGenerateWordCloud = false;
                this.isFristCome = false;
                // 设置字数
                this.ktWordCloud.setTextCount(this.textNum);
                // 设置旋转列表
                this.ktWordCloud.setRotateList(this.selectAngleList);
                if (this.colorMode == 1) {
                    this.ktWordCloud.setColorList(this.colorListData);
                } else {
                    this.ktWordCloud.clearColorList();
                }
                // 设置颜色列表

                /* 设置文本列表
                要处理字体 */
                /* this.tableData.forEach(e => {
                Ktu.initialData.flyerFontList.forEach(f => {
                if (e.fontId === f.id) {
                e.fontFamilyName = f.cname;
                }
                });
                }); */
                this.ktWordCloud.setTextList(tableResult);
                // 设置密度
                this.ktWordCloud.setDensity(this.textDensity);
                // 设置背景透明度
                this.ktWordCloud.setBgOpacity(100 - this.backgroundOpacity);
                // this.ktWordCloud.startFillText();
                this.ktWordCloud.readBackground(this.bgsrc)
                    .then(this.ktWordCloud.startFillText.bind(this.ktWordCloud))
                    .then(() => {
                        if (!!this.ktWordCloud.svgData) {
                            this.isGenerateWordArt = true;
                            this.isGenerating = false;
                            this.isGenerated = true;
                        } else {
                            this.$Notice.warning('出错了,请换一个形状重试！');
                            this.isGenerating = false;
                        }
                    });
                this.isAddAnimation = false;
            }, 100);
        },
        // 监听滚动
        isScroll(e) {
            this.rotateShowIndex = -1;
            /* this.$nextTick(() => {
                this.$refs.lastItem.style.bottom = `${-e.target.scrollTop}px`;
            }); */
        },

        // 改变添加一行的颜色
        changeAddTableColor(value) {
            this.addTableColor = value;
        },

        showAdvanced() {
            this.isExtendAdvanced = !this.isExtendAdvanced;
            Ktu.log('wordCloudEdit', 'clickSuper');
        },
        // 改变添加一行的字体
        ChangeTableFontId(value) {
            this.addTableFontId = value;
        },

        changeAddTextAngle(value, param) {
            this.addTextAngle = value;
        },

        // 初始化table副本数据
        initTableTemplist() {
            this.tableTemplist = this.objDeepCopy(this.tableData);
        },

        // 文本编辑底下操作
        optionType(index) {
            // 如果index为0则为删除,1为重置，2为清空
            if (index == 0) {
                if (this.rowIndex >= 0 && this.rowIndex < this.tableData.length) {
                    this.tableData.splice(this.rowIndex, 1);
                    /* if (this.$refs.tableContainer.scrollHeight < 337) {
                        this.isMoreThanHeight = false;
                        this.$refs.lastItem.style.position = 'relative';
                    } else {
                        this.$refs.tableContainer.scrollTop = this.$refs.tableContainer.scrollTop - 36;
                    } */
                }
                Ktu.log('wordCloudEdit', 'delWord');
            }
            else if (index == 1) {
                if (!this.isResetTableData) {
                    return;
                }
                // const more = this.tableTemplist.length - this.tableData.length;
                this.tableData = this.objDeepCopy(this.tableTemplist);
                this.initTableDataFont();
                /* if (this.$refs.tableContainer.scrollHeight > 296) {
                    this.$nextTick(() => {
                        this.isMoreThanHeight = true;
                        this.$refs.lastItem.style.position = 'absolute';
                        this.$refs.lastItem.style.bottom = this.$refs.tableContainer.scrollTop - 36;
                        if (more < 0) {
                            this.$refs.tableContainer.scrollTop = this.$refs.tableContainer.scrollTop + more * 36;
                            if (this.$refs.tableContainer.scrollHeight < 296) {
                                this.$refs.lastItem.style.position = 'relative';
                                this.isMoreThanHeight = false;
                            }
                        }
                    });
                } */
                this.isResetTableData = false;
                Ktu.log('wordCloudEdit', 'clickWordListDefault');
            }
            else {
                this.tableData = [];
                this.isMoreThanHeight = false;
                this.$refs.tableContainer.scrollTop = 0;
                // this.$refs.lastItem.style.position = 'relative';
                Ktu.log('wordCloudEdit', 'clickWordListDel');
            }
        },

        // 添加一行数据
        addRowData() {
            if (this.addTableText == '') {
                this.$Notice.warning('请正确添加信息');
                return;
            }
            /* else if (this.addTableTextNum == 0) {
                this.$Notice.warning('文本数量不能为0');
                return;
            } */
            const obj = {};
            obj.title = Ktu.encodeHtml(this.addTableText);
            obj.wordNum = 10;
            obj.color = 'transparent';
            obj.angle = '';
            obj.fontId = -10;
            /* obj.wordNum = this.addTableTextNum;
            obj.color = this.addTableColor;
            obj.angle = this.addTextAngle;
            obj.fontFamily = this.addTableFontId; */
            this.tableData.push(obj);
            this.addTableText = '';
            /* this.addTableTextNum = 0;
            this.addTableColor = '#fff';
            this.addTextAngle = 0;
            this.addTableFontId = 0; */
            this.$Notice.success('成功添加');
            /* if (this.$refs.tableContainer.scrollHeight > 260) {
                this.isMoreThanHeight = true;
                this.$refs.lastItem.style.position = 'absolute';
                this.$refs.lastItem.style.bottom = `${-this.$refs.tableContainer.scrollTop}px`;
                this.$nextTick(() => {
                    this.$refs.tableContainer.scrollTop = this.$refs.tableContainer.scrollHeight - 296;
                });
            } */
            this.getFontFamily(obj.fontId, this.tableData[this.tableData.length - 1].title, this.tableData.length - 1);

            Ktu.log('wordCloudEdit', 'addWord');
        },

        //
        changeRowIndex(index) {
            this.rowIndex = index;
        },

        // 初始化赋值给默认对象
        defaultDataInit() {
            this.isDefaultData.leftDistance = this.leftDistance;
            this.isDefaultData.leftDistanceGird = this.leftDistanceGird;
            this.isDefaultData.labelListData = this.objDeepCopy(this.labelListData);
            this.isDefaultData.backgroundOpacity = this.backgroundOpacity;
            this.isDefaultData.textNum = this.textNum;
            this.isDefaultData.textDensity = this.textDensity;
            this.isDefaultData.colorListData = this.objDeepCopy(this.colorListData);
        },

        // 恢复默认
        rebackDefault() {
            if (!this.isUpdata) {
                return;
            }
            this.leftDistance = this.isDefaultData.leftDistance;
            this.leftDistanceGird = this.isDefaultData.leftDistanceGird;
            this.labelListData = this.objDeepCopy(this.isDefaultData.labelListData);
            this.backgroundOpacity = this.isDefaultData.backgroundOpacity;
            this.textNum = this.isDefaultData.textNum;
            this.textDensity = this.isDefaultData.textDensity;
            this.colorListData = this.objDeepCopy(this.isDefaultData.colorListData);
            this.showCustomizeMaskIndex = 1;
            this.colorMode = 0;
            this.isUpdata = false;
            this.angleListData = [];
            this.selectAngleList = [0];
            this.isReGenerateWordCloud = true;
            const obj = {};
            for (let i = 0; i < this.labelListData[0].angle.length; i++) {
                obj.angle = this.labelListData[0].angle[i];
                this.angleListData.push(obj);
                // this.labelListData.push(obj);
            }
            Ktu.log('wordCloudEdit', 'styleDefault');
            // this.angleListData = this.labelListData[0];
        },

        // 随机添加一个颜色的颜色块
        randomAddColor() {
            if (this.isDeleteStatus || this.colorMode == 0) {
                return;
            }
            const index = Math.floor(Math.random() * 20);

            // const color = `#${(Math.random() * 0xffffff << 0).toString(16)}`;
            /* const color = `rgb(${Math.floor(Math.random() * (255 + 1))}, ${Math.floor(Math.random() * (255 + 1))}, ${Math.floor(Math.random() * (255 + 1))})`;
            const obj = {};
            obj.color = color;
            this.colorListData.push(obj); */
            for (let i = 0; i < this.colorListData.length; i++) {
                this.$set(this.colorListData[i], 'color', this.randomColorList[index][i].color);
                // this.colorListData[i].color = this.randomColorList[index].color[i];
            }
            this.isUpdata = true;
            this.isReGenerateWordCloud = true;
            Ktu.log('wordCloudEdit', 'styleCustomAddRandomColor');
        },

        // 添加文字排列的方式
        addTextArrangements() {
            console.log('这是进入到了哪一步')
            this.labelListData[0].angle = [];
            for (let i = 0; i < this.angleListData.length; i++) {
                const obj = {
                    svgId: '#svg-word-arrangement1',
                };
                obj.angle = this.angleListData[i].angle;
                this.labelListData[0].angle.push(obj.angle);
                // this.labelListData.push(obj);
            }
            this.selectAngleList = this.labelListData[0].angle;
            this.$Notice.success('成功添加自定义角度');
            this.isUpdata = true;
            this.isShowCustomizeMask = false;
            // this.angleListData = [];
        },

        // 删除点击的角度
        deleteAngleItem(index) {
            this.angleListData.splice(index, 1);
        },

        // 添加输入的角度
        addAngleItem() {
            const obj = {};
            if (isNaN(this.angleVal)) {
                this.$Notice.warning('请输入数字，范围0-360');
                this.angleVal = '';
                return;
            }
            if (this.angleVal > 360 || this.angleVal < 0 || this.angleVal === '') {
                this.$Notice.warning('输入值范围在0-360之间');
                this.angleVal = '';
                return;
            }
            obj.angle = parseInt(this.angleVal, 10);
            this.angleListData.push(obj);
            this.angleVal = '';
        },

        // 随机添加角度
        addRandomAngleItem() {
            const obj = {};
            obj.angle = Math.floor(Math.random() * 360);
            this.angleListData.push(obj);
        },

        // 清空所有的角度
        clearAngleAll() {
            this.angleListData = [];
        },

        // 展示自定义弹窗
        showCustomizeMask(index) {
            this.showCustomizeMaskIndex = index;
            this.isUpdata = true;
            this.isReGenerateWordCloud = true;
            this.selectAngleList = this.labelListData[index].angle;
            if (index !== 0) {
                Ktu.log('wordCloudEdit', 'styleDefaultRotate');
                return;
            }
            this.isShowCustomizeMask = true;
            Ktu.log('wordCloudEdit', 'styleCustomRotate');
        },

        // 点击向右滑动
        leftTransition() {
            if (this.leftDistanceGird == 0) {
                return;
            }
            if (this.leftDistanceGird == 0) {
                this.leftDistance = 0;
            } else if (this.leftDistanceGird >= 5) {
                this.leftDistanceGird -= 5;
            } else {
                this.leftDistanceGird = 0;
            }
            this.leftDistance = -this.leftDistanceGird * 64;
            this.isUpdata = true;
        },

        // 点击向左滑动
        rightTransition() {
            if (this.leftDistanceGird == this.labelListData.length - 5) {
                return;
            }
            if (this.labelListData.length - this.leftDistanceGird >= 10) {
                this.leftDistanceGird += 5;
            } else {
                this.leftDistanceGird += this.labelListData.length - this.leftDistanceGird - 5;
            }
            this.leftDistance = -this.leftDistanceGird * 64;
            this.isUpdata = true;
        },

        // 添加一个颜色
        addColorItem(value) {
            if (this.colorListData.length >= 5) {
                this.$Notice.warning('颜色数量最多5个');
                return;
            }
            this.addColor = value;
            const obj = {};
            obj.color = value;
            this.colorListData.push(obj);
            this.isUpdata = true;
            this.isReGenerateWordCloud = true;
            Ktu.log('wordCloudEdit', 'styleCustomAddColor');
        },

        // 删除一个颜色
        deleteColorItem(index) {
            this.colorListData.splice(index, 1);
            this.isUpdata = true;
            this.isReGenerateWordCloud = true;
            Ktu.log('wordCloudEdit', 'styleCustomDelColor');
        },

        // 更改为删除状态
        changeDeleteStatus() {
            if (this.colorMode == 0) {
                return;
            }
            this.isDeleteStatus = !this.isDeleteStatus;
        },

        // 设置字体样式
        setFontStyle(value) {
            if (value == 'bold') {
                const index = this.isActiveText.hasStr(value);
                if (index >= 0) {
                    this.isActiveText.splice(index, 1);
                } else {
                    this.isActiveText.push(value);
                }
                Ktu.log('wordCloudEdit', 'changeTextShapeBold');
            } else if (value == 'italic') {
                const index = this.isActiveText.hasStr(value);
                if (index >= 0) {
                    this.isActiveText.splice(index, 1);
                } else {
                    this.isActiveText.push(value);
                }
                Ktu.log('wordCloudEdit', 'changeTextShapeItalic');
            }
            this.getCanvasInfo(false);
            this.$nextTick(() => {
                this.textShapeStyle();
            });
        },
        // 显示更多
        showMore() {
            this.isShowMore = true;
        },

        // 关闭显示更多
        closeShowMore() {
            this.isShowMore = false;
        },

        // 点击获取数据
        clickMaterialTopic(item, index, isAfter) {
            if (index == 0 && !isAfter) {
                this.topicListIndex = index;
                this.materialListShow = false;
                return;
            }
            this.materialListShow = true;
            if (isAfter) {
                this.topicAfterIndex = index;
                this.topicListIndex = -1;
            } else {
                this.topicListIndex = index;
                this.topicAfterIndex = -1;
            }
            this.materialIndex = 0;
            this.materialItem = [];
            this.materialTopicValue = item.key;
            this.materialTopicCategory = item.category;
            this.iamgeShowData = [];
            this.getMaterial();
        },

        // 获取形状的数据
        getMaterial() {
            const url = '../ajax/fodder_h.jsp?cmd=getFodderList';
            // let materialKey = this.activeMaterialChild.id;

            const postData = {
                category: this.materialTopicCategory,
                topic: this.materialTopicValue,
                getLimit: this.materialGetLimit,
                currentPage: this.materialIndex,
            };

            /* if (postData.category === 6) {
               if (postData.topic === -1) {
               postData = Object.assign({}, postData, { otherCategorys: 8 });
               } else if (postData.topic === 80) {
               postData.category = 8;
               postData.topic = -1;
               }
               } */

            axios
                .post(url, postData)
                .then(res => {
                    const info = res.data;
                    if (info.success) {
                        const { data } = info;
                        const tmpArr = data.hits;
                        /* console.log(info);
                           如果快速点击 要判断是不是当前分类
                           if (materialKey == this.activeMaterialChild.id) {
                           this.materialTotal = data.total_size;
                           this.materialItem.push(...tmpArr);
                           } */
                        this.iamgeShowData.push(...tmpArr);
                        if (this.wordArtEditor.type !== 'update' && this.materialTopicCategory === 3 && this.materialTopicValue === 52 && !this.isGenerated) {
                            this.$nextTick(() => {
                                this.userMaterial(tmpArr[0], 0, true);
                            });
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

        changeImageNavIndex(index) {
            this.imageNavIndex = index;
            if (index == 0) {
                Ktu.log('wordCloudEdit', 'clickImageShape');
            } else if (index == 1) {
                Ktu.log('wordCloudEdit', 'clickTextShape');
            } else if (index == 2) {
                Ktu.log('wordCloudEdit', 'useImage');
            }
        },

        // 处理文本框获取的数据
        detailImportData() {
            if (this.importData !== '') {
                const str = this.importData;
                // 将所有符合的符号转为逗号
                const List = str.replace(/，/g, ',').
                    replace(/。/g, ',')
                    .replace(/\./g, ',').
                    replace(/、/g, ',').
                    replace(/：/g, ',')
                    .replace(/:/g, ',');
                const arr = List.split(',');
                for (let i = 0; i < arr.length; i++) {
                    if (!!arr[i]) {
                        const obj = {
                            wordNum: 1,
                            color: 'transparent',
                            fontId: -10,
                            angle: '',
                        };
                        obj.title = arr[i];
                        this.tableData.push(obj);
                    }
                }
                // 再次更新字体
                this.initTableDataFont(false);
                /* this.$nextTick(() => {
                    if (this.$refs.tableContainer.scrollHeight > 296) {
                        this.isMoreThanHeight = true;
                        this.$refs.lastItem.style.position = 'absolute';
                        this.$refs.lastItem.style.bottom = this.$refs.tableContainer.scrollTop - 36;
                        this.$refs.tableContainer.scrollTop = this.$refs.tableContainer.scrollHeight - 296;
                    }
                }); */
            }
            this.isShowBatchMask = false;
            Ktu.log('wordCloudEdit', 'importSuccess');
            this.$Notice.success('成功添加');
        },

        // 将旋转的角度归0
        angleBack() {
            this.tableData[this.rotateShowIndex].angle = 0;
        },

        // 关闭旋转组件
        clearRotateShowIndex() {
            this.rotateShowIndex = -1;
        },

        // 控制哪个旋转组件显示
        changeActiveRotateIndex(e, index) {
            this.angleScrollTop = e.target.offsetTop - this.$refs.tableContainer.scrollTop + 136;
            this.rotateShowIndex = index;
            /* this.$nextTick(() => {
                this.angleScrollTop = e.target.offsetTop - this.$refs.tableContainer.scrollTop + 136;
            }) */
        },

        // 改变文本框中字体
        changeTextareaFontId(id) {
            if (this.shapeText == '') {
                this.$Notice.warning('请先输入文字');
                this.$refs.fontFamilySet.resetState();
                return;
            }

            this.textareaFontId = id;

            let textType = 0;
            this.fontFaimlyList.some((fontFamily, index) => {
                if (id === fontFamily.value) {
                    textType = fontFamily.type;
                    return true;
                }
                return false;
            });
            const fontFamily = `ktu_Font_TYPE_${textType}_ID_${id}RAN_${parseInt(new Date().getTime(), 10)}`;
            const substring = _.uniq(this.shapeText).join('');

            const fontUrl = `/ajax/font_h.jsp?cmd=getFontPath&type=${textType}&id=${id}`;
            axios.post(fontUrl, {
                substring: encodeURIComponent(JSON.stringify(substring)),
                ktuId: Ktu.ktuId,
            }).then(response => {
                if (response.status == 200) {
                    const fontFace = new FontFace(fontFamily, `url(${response.data.info.path})`);
                    fontFace.load().then(loadedFace => {
                        document.fonts.add(loadedFace);
                        this.shapeTextFamily = fontFamily;
                        this.getCanvasInfo(false);
                        this.$nextTick(() => {
                            this.textShapeStyle();
                        });
                        // this.updateGroup();
                    });
                    /* this.$nextTick(() => {
                       this.$refs.shapeTextarea.style.fontFamily = fontFamily;
                       }) */
                }
            });

            Ktu.simpleLog('wordCloudEdit', 'changeTextShapeFF');
        },

        // 改变导入默认字体
        changeImportFontId(value) {
            this.importFontId = value;
            this.initTableDataFont(true);
            this.isReGenerateWordCloud = true;
            Ktu.log('wordCloudEdit', 'changeDefaultFF');
        },

        // 接收从字体组件传来的ID
        fontChangeId(id) {
            this.tableData[this.rowIndex].fontId = id;
            Ktu.log('wordCloudEdit', 'changeFF');
            /* if (this.shapeText == '') {
                this.$Notice.warning('请先输入文字');
                return;
            } */

            // this.textareaFontId = id;

            /* let textType = 0;
            this.fontFaimlyList.some((fontFamily, index) => {
                if (id === fontFamily.value) {
                    textType = fontFamily.type;
                    return true;
                }
                return false;
            });

            let obj = this.tableData[this.rowIndex];

            const fontFamily = `ktu_Font_TYPE_${textType}_ID_${id}RAN_${parseInt(new Date().getTime(), 10)}`;
            const substring = _.uniq(this.tableData[this.rowIndex].title).join('');

            const cookies = `&_FSESSIONID=${$.cookie('_FSESSIONID')}`;
            const fontUrl = `/font.jsp?type=${textType}&id=${id}${cookies}`;
            axios.post(fontUrl, {
                substring: encodeURIComponent(JSON.stringify(substring)),
            }, {
                responseType: 'arraybuffer',
            }).then(response => {
                if (response.status == 200) {
                    const fontFace = new FontFace(fontFamily, response.data);
                    fontFace.load().then(loadedFace => {
                        document.fonts.add(loadedFace);
                        obj.style = `fontFamily:${fontFamily}`;
                        this.$set(this.tableData, this.rowIndex, obj);
                    });
                }
            });

            Ktu.simpleLog('useFontFamily', id); */
            this.getFontFamily(id, this.tableData[this.rowIndex].title, this.rowIndex);
        },

        // 获取字体
        getFontFamily(id, text, value) {
            let realId = id;
            if (realId === -10) {
                realId = this.importFontId;
            }
            let textType = 0;
            this.fontFaimlyList.some((fontFamily, index) => {
                if (realId === fontFamily.value) {
                    textType = fontFamily.type;
                    return true;
                }
                return false;
            });

            const obj = this.tableData[value];

            const fontFamily = `ktu_Font_TYPE_${textType}_ID_${realId}_ROW_${value}_RAN_${parseInt(new Date().getTime(), 10)}`;
            const substring = _.uniq(text).join('');

            const fontUrl = `/ajax/font_h.jsp?cmd=getFontPath&type=${textType}&id=${realId}`;
            return new Promise((resolve, reject) => {
                axios.post(fontUrl, {
                    substring: encodeURIComponent(JSON.stringify(substring)),
                    ktuId: Ktu.ktuId,
                }).then(response => {
                    if (response.status == 200) {
                        const fontFace = new FontFace(fontFamily, `url(${response.data.info.path})`);
                        fontFace.load().then(loadedFace => {
                            document.fonts.add(loadedFace);
                            obj.style = `fontFamily:${fontFamily}`;
                            obj.fontFamilyName = fontFamily;
                            obj.fontFileId = response.data.info.fileId;
                            obj.fontPath = response.data.info.path;
                            this.$set(this.tableData, value, obj);
                            resolve();
                        });
                    }
                });
            });
            Ktu.simpleLog('useFontFamily', id);
        },
        // 初始化表格字体
        initTableDataFont(isInit) {
            if (isInit) {
                this.isFromInitTableData = true;
            }
            const promiseList = [];
            for (let i = 0; i < this.tableData.length; i++) {
                promiseList.push(this.getFontFamily(this.tableData[i].fontId, this.tableData[i].title, i));
            }
            Promise.all(promiseList).then(() => {
                if (isInit) {
                    this.isFromInitTableData = false;
                } else {
                    this.isReGenerateWordCloud = true;
                }
            });
        },

        // 改变tab
        changeActiveIndex(index) {
            this.activeItem = index;
        },

        // 关闭词云编辑器
        closeEditor(e) {
            /* if (e) {
               console.log(e.target.className);
               if (e.target.className.includes('fade')) {
               return;
               }
               } */
            this.wordArtEditor.show = false;
        },

        // 关闭自定义窗口
        closeCustomizeMask() {
            this.isShowCustomizeMask = false;
        },

        // 关闭批量导入窗口
        closeBatchMask() {
            this.isShowBatchMask = false;
            this.importData = '';
        },

        // 展开批量导入窗口
        showBatchMask() {
            this.importData = '';
            this.isShowBatchMask = true;
            Ktu.log('wordCloudEdit', 'clickImport');
        },

        // 关闭图片设置弹窗
        closeImageMask() {
            this.isShowImageMask = false;
        },

        // 展开图片设置弹窗
        showImageMask(item) {
            Ktu.log('wordCloudEdit', 'setShape');
            const img = new Image();
            img.src = `${item.p450p}&timeStamp=${new Date()}`;
            img.setAttribute('crossOrigin', 'anonymous');
            this.changeImageSrc = img.src;
            img.onload = () => {
                const redio = img.width / img.height;
                this.isShowImageMask = true;
                /* this.changeImageCanvas = this.$refs.changeImg;
                this.changeImageCxt = this.changeImageCanvas.getContext('2d');
                if (redio > 1) {
                    this.changeImageCanvas.width = 342;
                    this.changeImageCanvas.height = 342 / redio;
                } else {
                    this.changeImageCanvas.height = 342;
                    this.changeImageCanvas.width = 342 * redio;
                }
                this.changeImageCxt.drawImage(img, 0, 0, this.changeImageCanvas.width, this.changeImageCanvas.height);
                this.changeImageData = this.changeImageCxt.getImageData(0, 0, this.changeImageCanvas.width, this.changeImageCanvas.height);
                this.copyImageData = JSON.parse(JSON.stringify(this.changeImageData));
                this.changeImageCxt.putImageData(this.changeImageData, 0, 0); */
                const canvas = this.$refs.changeImg;
                this.changeImageCanvas = this.$refs.changeImg;
                this.changeImageCxt = canvas.getContext('2d');
                const ctx = canvas.getContext('2d');
                if (redio > 1) {
                    canvas.width = 342;
                    canvas.height = 342 / redio;
                } else {
                    canvas.height = 342;
                    canvas.width = 342 * redio;
                }
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const changeImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                // this.copyImageData = JSON.parse(JSON.stringify(this.changeImageData));
                ctx.putImageData(changeImageData, 0, 0);
                this.renderDegreeSrc = canvas.toDataURL('image/jpeg');
                this.spliceDegreeSrc = canvas.toDataURL('image/jpeg');
            };
        },

        closeMaterialMask() {
            this.isShowMaterialMask = false;
        },

        showMaterialMask(item, index) {
            this.isShowMaterialMask = true;
            this.objectId = item.svgPreId;
            this.showMaterialIndex = index;

            Ktu.log('wordCloudEdit', 'setColor');
            // 处理所有路径，得到颜色等信息
            axios.get(item.filePath).then(res => {
                this.changedColors = [];
                this.changedColorObject = {};
                // 把svg中的中文转换一下，不然生成图片时可能会出现问题
                let svgRes = res.data;
                let chineseArray = svgRes.match(/[\u4e00-\u9fa5]+/g);
                const tmpSet = new Set(chineseArray);
                chineseArray = [...tmpSet];
                chineseArray.forEach((e, i) => {
                    const changeName = `fkktChange${i}`;
                    svgRes = svgRes.replace(new RegExp(e, 'g'), changeName);
                });

                const doc = new DOMParser().parseFromString(svgRes, 'image/svg+xml');
                const _svg = doc.getElementsByTagName('svg')[0];

                const reAllowedSVGTagNames = /^(path|circle|polygon|polyline|ellipse|rect|line|image|text)$/i;
                const reNotAllowedAncestors = /^(?:pattern|defs|symbol|metadata|clipPath|mask)$/i;
                // 初始化
                const width = _svg.width.baseVal.value ? _svg.width.baseVal.value : _svg.viewBox.baseVal.width;
                this.width = this.width === undefined ? width : item.width;
                const height = _svg.height.baseVal.value ? _svg.height.baseVal.value : _svg.viewBox.baseVal.height;
                this.height = this.height === undefined ? height : item.height;

                /* this.shapeWidth = this.shapeWidth === undefined ? Math.max(1, this.width * Math.abs(this.cropScaleX)) : this.shapeWidth;
                this.shapeHeight = this.shapeHeight === undefined ? Math.max(1, this.height * Math.abs(this.cropScaleY)) : this.shapeHeight; */

                /* this.image.width = this.width;
                this.image.height = this.height;*/
                // 有viewbox的本身就可能会有缩放
                this.viewBoxWidth = _svg.viewBox.baseVal.width || _svg.width.baseVal.value;
                this.viewBoxHeight = _svg.viewBox.baseVal.height || _svg.height.baseVal.value;

                const svgNodes = _svg.querySelectorAll(':not(svg)');
                // 获取显示效果渐变
                const getGradientDefs = function (doc) {
                    const tagArray = ['linearGradient', 'radialGradient'];
                    const gradientDefs = {};
                    const elist = [].filter.call(svgNodes, e => tagArray.indexOf(e.nodeName.replace('svg:', '')) > -1);

                    elist.forEach(e => {
                        let xlink = e.getAttribute('xlink:href');
                        if (!!xlink) {
                            xlink = `#${item.svgPreId}_${xlink.substring(1)}`;
                            e.setAttribute('xlink:href', xlink);
                        }
                        // 将id之类的修改，避免重复
                        const id = `${item.svgPreId}_${e.getAttribute('id')}`;
                        e.setAttribute('id', id);
                        gradientDefs[id] = e;
                    });
                    return gradientDefs;
                };
                this.pathGradients = getGradientDefs(doc);

                // 获取cssStyleSheet 并设置到节点中
                const setStyleSheet = () => {
                    const style = [].filter.call(svgNodes, e => e.nodeName == 'style');
                    const allRules = {};
                    if (!!style) {
                        style.forEach(e => {
                            let tmpRule = [];
                            if (!!e.sheet) {
                                [].forEach.call(e.sheet.cssRules, e => {
                                    tmpRule.push(e.cssText);
                                });
                            } else {
                                tmpRule = e.textContent.split('}');
                                tmpRule = tmpRule.map(e => `${e}}`);
                                tmpRule.splice(tmpRule.length - 1, 1);
                            }

                            tmpRule.forEach(e => {
                                let styleContents = e;
                                let rules;
                                if (styleContents) {
                                    styleContents = styleContents.replace(/\/\*[\s\S]*?\*\//g, '');
                                    rules = styleContents.match(/[^{]*\{[\s\S]*?\}/g);
                                    rules = rules.map(rule => rule.trim());
                                    rules.forEach(rule => {
                                        const match = rule.match(/([\s\S]*?)\s*\{([^}]*)\}/);
                                        const ruleObj = {};
                                        const declaration = match[2].trim();
                                        const propertyValuePairs = declaration.replace(/;$/, '').split(/\s*;\s*/);
                                        for (let i = 0, len = propertyValuePairs.length; i < len; i++) {
                                            const pair = propertyValuePairs[i].split(/\s*:\s*/);
                                            const property = pair[0];
                                            const value = pair[1];
                                            ruleObj[property] = value;
                                        }
                                        rule = match[1];
                                        rule.split(',').forEach(_rule => {
                                            _rule = _rule.replace(/^svg/i, '').trim();
                                            if (_rule === '') {
                                                return;
                                            }
                                            if (allRules[_rule]) {
                                                _.assignIn(allRules[_rule], ruleObj);
                                            } else {
                                                allRules[_rule] = _.clone(ruleObj);
                                            }
                                        });
                                    });
                                }
                            });
                        });
                    }
                    const setCss = function (path) {
                        path.classList.forEach(c => {
                            if (!!allRules[`.${c}`]) {
                                const thisRule = allRules[`.${c}`];
                                const ruleKeys = Object.keys(thisRule);
                                ruleKeys.forEach(r => {
                                    // 当行内没有的时候才去设置
                                    if (!path.style[r]) {
                                        path.style[r] = thisRule[r];
                                    }
                                });
                            }
                        });
                    };
                    svgNodes.forEach(e => {
                        if (!!e.classList.length) {
                            setCss(e);
                        }
                    });
                };
                setStyleSheet();
                // 获取显示的节点
                const hasAncestorWithNodeName = function (element, nodeName) {
                    while (element && (element = element.parentNode)) {
                        if (element.nodeName && nodeName.test(element.nodeName.replace('svg:', '')) && !element.getAttribute('instantiated_by_use')) {
                            return true;
                        }
                    }
                    return false;
                };
                this.paths = [].filter.call(svgNodes, e => reAllowedSVGTagNames.test(e.nodeName.replace('svg:', '')) && !hasAncestorWithNodeName(e, reNotAllowedAncestors));

                // 获取继承的属性和style
                const getAttrAndCss = () => {
                    const colorChange = [];
                    this.paths.forEach((e, i) => {
                        const param = {};
                        let element = e;
                        do {
                            if (element.nodeName == 'svg') {
                                break;
                            }
                            const fillStyle = element.style.fill || element.getAttribute('fill');
                            const strokeStyle = element.style.stroke || element.getAttribute('stroke');
                            const opacity = element.style.opacity || element.getAttribute('opacity');
                            const {
                                isolation,
                            } = element.style;
                            const {
                                mixBlendMode,
                            } = element.style;
                            const transform = element.getAttribute('transform');
                            const transformStyle = element.style.transform;
                            const {
                                display,
                            } = element.style;
                            if (fillStyle != undefined && fillStyle != '' && param.fill == undefined) {
                                param.fill = fillStyle;
                            }
                            if (strokeStyle != undefined && strokeStyle != '' && param.stroke == undefined) {
                                param.stroke = strokeStyle;
                            }
                            if (opacity != undefined && opacity != '' && param.opacity == undefined) {
                                param.opacity = opacity;
                            }
                            if (mixBlendMode != '' && param.mixBlendMode == undefined) {
                                param.mixBlendMode = mixBlendMode;
                            }
                            if (isolation != '' && param.isolation == undefined) {
                                // this.isolation = true;
                                param.isolation = 'isolate';
                            }
                            if (transform != undefined) {
                                if (param.transform == undefined) {
                                    param.transform = transform;
                                } else {
                                    param.transform = `${transform} ${param.transform}`;
                                }
                            }
                            if (transformStyle != '' && param.transformStyle == undefined) {
                                param.transformStyle = transformStyle;
                            }
                            if (display == 'none' && param.display == undefined) {
                                param.display = display;
                            }
                            // 不对路再加
                        } while (element = element.parentNode);
                        const ruleKeys = Object.keys(param);
                        let color = '';
                        ruleKeys.forEach(r => {
                            // 将id之类的修改，避免重复
                            if (param[r].indexOf('url') >= 0) {
                                param[r] = param[r].replace(/#(\S+?)(["']?)/, (s, s1, s2) => `#${item.svgPreId}_${s1}${s2}`);
                                // 只能先清掉，后面再改，直接再这里改，搜狗浏览器没反应
                                e.style[r] = '';
                            }
                            if (r == 'fill' && param[r].indexOf('url') < 0 && param[r] != 'none') {
                                color += param[r];
                            }
                            if (r == 'stroke' && param[r].indexOf('url') < 0 && param[r] != 'none') {
                                color += `||${param[r]}`;
                            }
                            if (r == 'transform') {
                                e.setAttribute('transform', param[r]);
                            } else {
                                // 当行内没有的时候才去设置
                                !e.style[r] && (e.style[r] = param[r]);
                            }
                        });
                        // 对于没有stroke 没有 fill的 给个黑色默认色
                        if (ruleKeys.length == 0) {
                            color = '#000';
                        }
                        colorChange.push(color);
                    });
                    this.originalColors = _.cloneDeep(colorChange);
                    this.changedColors = this.changedColors.length > 0 ? this.changedColors : colorChange;
                    this.meterialColorList = Array.from(new Set(this.changedColors));
                    // if (this.changeFrist) {
                    let isPresence = false;
                    this.changedColorList.forEach((e, index) => {
                        if (e.id == item.id) {
                            isPresence = true;
                            return;
                        }
                    });
                    if (!isPresence) {
                        const obj = {
                            id: item.id,
                        };
                        obj.colorList = [];
                        for (let i = 0; i < this.meterialColorList.length; i++) {
                            obj.colorList.push(this.meterialColorList[i]);
                        }
                        obj.colorLists = [];
                        for (let j = 0; j < this.meterialColorList.length; j++) {
                            const arr = [];
                            for (let i = 0; i < this.changedColors.length; i++) {
                                if (obj.colorList[j] == this.changedColors[i]) {
                                    arr.push(i);
                                }
                            }
                            obj.colorLists.push(arr);
                        }
                        this.changedColorList.push(obj);
                    }
                    /* // this.changeFrist = false;
                    } */
                };
                getAttrAndCss();
                this.imgSvg = this.toSvg();
                /* this.hasLoaded = true;
                this.dirty = true;
                this.setCoords();
                resolve(isShowStroke); */
            });
        },

        // 将图片转成svg
        toSvg(isAllInfo = true) {
            let svgHtml = '';
            let g = '';
            const contentHtml = [];
            const gradientIds = Object.keys(this.pathGradients);
            this.paths.forEach((e, i) => {
                if (gradientIds.length != 0) {
                    gradientIds.forEach(c => {
                        if (e.outerHTML.indexOf(c) > -1) {
                            contentHtml.push(this.pathGradients[c].outerHTML);
                        }
                    });
                }
                const colors = this.changedColors[i];
                let fill;
                let stroke;
                if (!!colors) {
                    const colorArr = colors.split('||');
                    fill = colorArr[0];
                    stroke = colorArr[1];
                    if (!!fill) {
                        const fillColor = Ktu.element.getRgb('fill', fill).rgb;
                        const {
                            opacity,
                        } = Ktu.element.getRgb('fill', fill);
                        e.style.fill = fillColor;
                        e.style.fillOpacity = opacity;
                        e.style.fillRule = 'nonzero';
                    }
                    if (!!stroke) {
                        const strokeColor = Ktu.element.getRgb('stroke', stroke).rgb;
                        const {
                            opacity,
                        } = Ktu.element.getRgb('stroke', stroke);
                        e.style.stroke = strokeColor;
                        e.style.strokeOpacity = opacity;
                    }
                }
                contentHtml.push(e.outerHTML);
                if (e.tagName == 'line') {
                    contentHtml.push(`<rect x="0" y="${this.height / 2}" width="${this.width}" height="${this.height}" style="opacity:0;"></rect>`);
                }
            });
            g = `
                <g>
                    ${contentHtml.join('')}
                </g>
                `;
            if (this.height > this.width) {
                svgHtml = `
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                    version="1.1" width="${116 * this.width / this.height}" height="160"
                    viewBox="0 0 ${this.viewBoxWidth} ${this.viewBoxHeight}" xml:space="preserve" preserveAspectRatio="none" style="overflow: visible;">
                    ${g}
                </svg>`;
            } else {
                svgHtml = `
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                    version="1.1" width="116" height="${116 * this.height / this.width}"
                    viewBox="0 0 ${this.viewBoxWidth} ${this.viewBoxHeight}" xml:space="preserve" preserveAspectRatio="none" style="overflow: visible;">
                    ${g}
                </svg>`;
            }
            // svgHtml = g;
            return svgHtml;
        },
        //
        changeSelectIndex(index, e) {
            this.selectIndex = index;
        },

        changeColorIndex(index) {
            if (this.colorMode == 0) {
                return;
            }
            this.colorIndex = index;
        },

        colorForeground(value) {
            if (this.colorMode == 0) {
                this.$Notice.warning('该状态下颜色不可改变');
                return;
            }
            this.colorListData[this.colorIndex].color = value;
            this.isUpdata = true;
            this.isReGenerateWordCloud = true;
            Ktu.log('wordCloudEdit', 'styleCustomClickColor');
        },

        // 选择颜色
        selectForeground(value) {
            const realvalue = value;
            if (realvalue === this.tableData[this.selectIndex].color) {
                return;
            }
            // this.foreground = value;
            this.tableData[this.selectIndex].color = realvalue;
            if (value == 'default') {
                Ktu.log('wordCloudEdit', 'clickDefaultColor');
            } else {
                Ktu.log('wordCloudEdit', 'changeColor');
            }
        },

        stop(item, args) {
            item.angle = args[0];
        },

        // 改变背景透明度
        changeBackgroundOpacity(value, param) {
            this.backgroundOpacity = value;
            this.isUpdata = true;
            if (!this.isGenerated) {
                this.isReGenerateWordCloud = true;
            } else {
                this.ktWordCloud.changeBgOpacity(100 - value);
            }
            Ktu.log('wordCloudEdit', 'styleBgOpacity');
        },

        changeRenderDegree(value, param) {
            this.renderDegree = value;

            this.changeImageAttributes();
        },

        changeSpliceDegree(value, param) {
            this.spliceDegree = value;

            this.changeImageAttributes();
        },

        changeImageAttributes() {
            const str = '#';
            const isColor = this.imageColor.indexOf(str) > -1;
            const colorChange = [];
            for (let i = 1; i < 7; i += 2) {
                // eslint-disable-next-line radix
                colorChange.push(parseInt(`0x${this.imageColor.slice(i, i + 2)}`));
            }
            const img = new Image();
            img.setAttribute('crossOrigin', 'anonymous');
            img.src = `${this.changeImageSrc}&timeStamp=${new Date()}`;
            img.onload = () => {
                const canvas = this.$refs.changeImg;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                if (this.spliceDegree < 100) {
                    this.filterBorder(imageData, this.spliceDegree);
                }
                const imageDataLength = imageData.data.length / 4;
                // // 解析之后进行算法运算
                for (let i = 0; i < Math.floor(imageDataLength); i++) {
                    const red = imageData.data[i * 4];
                    const green = imageData.data[i * 4 + 1];
                    const blue = imageData.data[i * 4 + 2];
                    const gray = 0.3 * red + 0.59 * green + 0.11 * blue;
                    let newBlack;
                    if (this.isFristChangeColor) {
                        if (this.isReverse) {
                            if (gray > 255 * (this.renderDegree / 100)) {
                                newBlack = 0;
                                imageData.data[i * 4] = newBlack;
                                imageData.data[i * 4 + 1] = newBlack;
                                imageData.data[i * 4 + 2] = newBlack;
                            } else {
                                newBlack = 255;
                                imageData.data[i * 4] = newBlack;
                                imageData.data[i * 4 + 1] = newBlack;
                                imageData.data[i * 4 + 2] = newBlack;
                            }
                        } else {
                            if (gray > 255 * (this.renderDegree / 100)) {
                                newBlack = 255;
                                imageData.data[i * 4] = newBlack;
                                imageData.data[i * 4 + 1] = newBlack;
                                imageData.data[i * 4 + 2] = newBlack;
                            }
                        }
                    } else {
                        if (this.isReverse) {
                            if (isColor) {
                                if (gray > 255 * (this.renderDegree / 100)) {
                                    imageData.data[i * 4] = colorChange[0];
                                    imageData.data[i * 4 + 1] = colorChange[1];
                                    imageData.data[i * 4 + 2] = colorChange[2];
                                } else {
                                    newBlack = 255;
                                    imageData.data[i * 4] = newBlack;
                                    imageData.data[i * 4 + 1] = newBlack;
                                    imageData.data[i * 4 + 2] = newBlack;
                                }
                            } else {
                                if (gray > 255 * (this.renderDegree / 100)) {
                                    newBlack = 0;
                                    imageData.data[i * 4] = newBlack;
                                    imageData.data[i * 4 + 1] = newBlack;
                                    imageData.data[i * 4 + 2] = newBlack;
                                } else {
                                    newBlack = 255;
                                    imageData.data[i * 4] = newBlack;
                                    imageData.data[i * 4 + 1] = newBlack;
                                    imageData.data[i * 4 + 2] = newBlack;
                                }
                            }
                        } else {
                            if (isColor) {
                                if (gray > 255 * (this.renderDegree / 100)) {
                                    newBlack = 255;
                                    imageData.data[i * 4] = newBlack;
                                    imageData.data[i * 4 + 1] = newBlack;
                                    imageData.data[i * 4 + 2] = newBlack;
                                } else {
                                    imageData.data[i * 4] = colorChange[0];
                                    imageData.data[i * 4 + 1] = colorChange[1];
                                    imageData.data[i * 4 + 2] = colorChange[2];
                                }
                            } else {
                                if (gray > 255 * (this.renderDegree / 100)) {
                                    newBlack = 255;
                                    imageData.data[i * 4] = newBlack;
                                    imageData.data[i * 4 + 1] = newBlack;
                                    imageData.data[i * 4 + 2] = newBlack;
                                }
                            }
                        }
                    }
                }
                ctx.putImageData(imageData, 0, 0);
                // this.bgsrc = canvas.toDataURL();
            };
        },

        createImgCloud() {
            this.isShowImageMask = false;
            const canvas = this.$refs.changeImg;
            this.bgsrc = canvas.toDataURL();
            this.shapeMode = 2;
            this.isUseRectShape = false;
            setTimeout(() => {
                this.generateWordCloud();
            }, 100);
        },

        filterBorder(imgdata, inputValue) {
            const input = imgdata;
            function Sobel(imgdata, callback) {
                const w = imgdata.width;
                const h = imgdata.height;
                const { data } = imgdata;
                const kernelX = [
                    [-1, 0, 1],
                    [-2, 0, 2],
                    [-1, 0, 1],
                ];
                const kernelY = [
                    [-1, -2, -1],
                    [0, 0, 0],
                    [1, 2, 1],
                ];
                // 获取x、y所处像素点的rgb值，并返回平均值
                function getAvg(x, y) {
                    const i = ((w * y) + x) * 4;
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    return (0.3 * r + 0.59 * g + 0.11 * b);
                }
                for (let y = 0; y < h; y++) {
                    for (let x = 0; x < w; x++) {
                        const pixelX = (
                            (kernelX[0][0] * getAvg(x - 1, y - 1)) + (kernelX[0][1] * getAvg(x, y - 1)) + (kernelX[0][2] * getAvg(x + 1,
                                y - 1)) + (kernelX[1][0] * getAvg(x - 1, y)) + (kernelX[1][1] * getAvg(x, y)) + (kernelX[1][2] * getAvg(x
                                    + 1, y)) + (kernelX[2][0] * getAvg(x - 1, y + 1)) + (kernelX[2][1] * getAvg(x, y + 1)) + (kernelX[2][2]
                                        * getAvg(x + 1, y + 1)));
                        const pixelY = (
                            (kernelY[0][0] * getAvg(x - 1, y - 1)) + (kernelY[0][1] * getAvg(x, y - 1)) + (kernelY[0][2] * getAvg(x + 1,
                                y - 1)) + (kernelY[1][0] * getAvg(x - 1, y)) + (kernelY[1][1] * getAvg(x, y)) + (kernelY[1][2] * getAvg(x
                                    + 1, y)) + (kernelY[2][0] * getAvg(x - 1, y + 1)) + (kernelY[2][1] * getAvg(x, y + 1)) + (kernelY[2][2]
                                        * getAvg(x + 1, y + 1)));
                        const magnitude = Math.sqrt((pixelX * pixelX) + (pixelY * pixelY)) >> 0;
                        callback(magnitude, x, y);
                    }
                }
            }
            function setEmpty(data, w, x, y) {
                const i = ((w * y) + x) * 4;
                data[i] = 0;
                data[i + 1] = 0;
                data[i + 2] = 0;
                data[i + 3] = 0;
            }
            const collectors = [];
            Sobel(input, (value, x, y) => {
                if (value > 255 * (inputValue / 100)) {
                    collectors.push([x, y]);
                }
            });
            collectors.forEach(_e => {
                /* setEmpty(input.data, input.width, _e[0]-1, _e[1]-1);
                setEmpty(input.data, input.width, _e[0], _e[1]-1);
                setEmpty(input.data, input.width, _e[0]+1, _e[1]-1);
                setEmpty(input.data, input.width, _e[0]+1, _e[1]); */
                setEmpty(input.data, input.width, _e[0], _e[1]);
                /* setEmpty(input.data, input.width, _e[0]+1, _e[1]);
                setEmpty(input.data, input.width, _e[0]-1, _e[1]+1);
                setEmpty(input.data, input.width, _e[0], _e[1])+1;
                setEmpty(input.data, input.width, _e[0]+1, _e[1]+1); */
            });
        },

        // 改变文字数量
        changeTextNum(value, param) {
            this.textNum = value;
            this.isUpdata = true;
            this.isReGenerateWordCloud = true;
            Ktu.log('wordCloudEdit', 'styleWordCount');
        },

        // 改变文字密度
        changeTextDensity(value, param) {
            this.textDensity = value;
            this.isUpdata = true;
            this.isReGenerateWordCloud = true;
            Ktu.log('wordCloudEdit', 'styleTextDensity');
        },

        // 深拷贝
        objDeepCopy(source) {
            const sourceCopy = source instanceof Array ? [] : {};
            Object.keys(source).forEach(item => {
                sourceCopy[item] = typeof source[item] === 'object' ? this.objDeepCopy(source[item]) : source[item];
            });
            return sourceCopy;
        },
        // 应用到画板
        saveWordArt() {
            if (this.isSending) {
                return;
            }
            this.isSending = true;
            const blob = new Blob([this.ktWordCloud.svgData], {
                type: 'text/plain',
            });
            const fileRe = new FileReader();
            fileRe.onload = e => {
                const svgBase64 = e.target.result;
                this.getOpacityBgBase64().then(() => {
                    const { bgBase64 } = this;
                    const url = '/ajax/advanceUpload_h.jsp?cmd=_uploadPasteSvgAndPng';
                    axios.post(url, {
                        svgData: svgBase64.split(',')[1],
                        imgData: bgBase64.split(',')[1],
                        svgWidth: this.ktWordCloud.cw,
                        svgHeight: this.ktWordCloud.ch,
                        sysfile: true,
                    }).then(res => {
                        if (!res.data.success) {
                            this.$Notice.warning('出错了,请重试！');
                            return;
                        }
                        this.isSending = false;
                        console.log(this.shapeMode);
                        const msg = {
                            bgSrc: res.data.imgInfo.path,
                            bgfileId: res.data.imgInfo.id,
                            svgSrc: res.data.svgInfo.path,
                            svgfileId: res.data.svgInfo.id,
                            tableData: this.tableData,
                            bgOringinalSrc: this.bgsrc,
                            selectAngleList: this.selectAngleList,
                            textNum: this.textNum,
                            showCustomizeMaskIndex: this.showCustomizeMaskIndex,
                            colorListData: this.colorListData,
                            textDensity: this.textDensity,
                            backgroundOpacity: this.backgroundOpacity,
                            isActiveText: this.isActiveText,
                            textShapeColor: this.textShapeColor,
                            textareaFontId: this.textareaFontId,
                            shapeText: this.shapeText,
                            shapeMode: this.shapeMode,
                            colorMode: this.colorMode,
                            selectedItem: this.selectedItem,
                            importFontId: this.importFontId,
                            imageChooseIndex: this.imageChooseIndex,
                        };

                        if (this.isUseRectShape) {
                            msg.isLockWH = this.isLockWH;
                            msg.widthVal = this.widthVal;
                            msg.heightVal = this.heightVal;
                            msg.isRedioCanvas = this.isRedioCanvas;
                            msg.rectColor = this.rectColor;
                            msg.topicListIndex = 0;
                        } else {
                            msg.isLockWH = false;
                            msg.widthVal = '';
                            msg.heightVal = '';
                            msg.isRedioCanvas = false;
                            msg.rectColor = '#000';
                            msg.topicListIndex = this.topicListIndex;
                        }

                        const width = this.ktWordCloud.cw;
                        const height = this.ktWordCloud.ch;
                        if (this.$store.state.base.wordArtEditor.show) {
                            if (this.shapeMode == 0) {
                                Ktu.log('addWordCloud', 'imageShape');
                            } else if (this.shapeMode == 1) {
                                Ktu.log('addWordCloud', 'textShape');
                            }
                            if (this.wordArtEditor.type === 'update') {
                                Ktu.element.addModule('wordCloud', { msg, width, height, type: 'changeWordCloud' });
                            } else {
                                Ktu.element.addModule('wordCloud', { msg, width, height });
                            }
                        }
                        this.closeEditor();
                    });
                });
            };
            fileRe.readAsDataURL(blob);
        },
        stopDrag(e) {
            return false;
        },
    },
    created() {
        this.getMaterial();

        // 为获取素材复制前10个
        if (this.topicList.length > 5) {
            this.topicTenList.push({
                name: '自定义矩形',
            });
            for (let i = 0; i < this.topicList.length; i++) {
                if (i < 5) {
                    this.topicTenList.push(this.topicList[i]);
                } else {
                    this.topicTenAfterList.push(this.topicList[i]);
                }
            }
        } else {
            for (let i = 0; i < this.topicList.length; i++) {
                this.topicTenList.push(this.topicList[i]);
            }
        }

        // 将16进制转换成rgb格式, 透明度0.5
        String.prototype.colorRgb = function (transparency) {
            // 16进制颜色值的正则
            const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
            // 把颜色值变成小写
            let color = this.toLowerCase();
            if (reg.test(color)) {
                // 如果只有三位的值，需变成六位，如：#fff => #ffffff
                if (color.length === 4) {
                    let colorNew = '#';
                    // eslint-disable-next-line no-var
                    for (let i = 1; i < 4; i += 1) {
                        colorNew += color.slice(i, i + 1).concat(color.slice(i, i + 1));
                    }
                    color = colorNew;
                }
                // 处理六位的颜色值，转为RGB
                const colorChange = [];
                for (let i = 1; i < 7; i += 2) {
                    // eslint-disable-next-line radix
                    colorChange.push(parseInt(`0x${color.slice(i, i + 2)}`));
                }
                return `RGB(${colorChange.join(',')}, ${transparency})`;
            }
            return color;
        };

        // 判断数组中是否存在一个字符串
        Array.prototype.hasStr = function (str) {
            let n = this.length;
            while (n--) {
                if (this[n] == str) {
                    return n;
                }
            }
            return -1;
        };
    },
});
