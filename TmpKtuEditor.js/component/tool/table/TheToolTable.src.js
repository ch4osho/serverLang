Vue.component('tool-table', {
    template: `
        <div class="tool-table">
            <template v-if="firstCell">
                <tool-table-style></tool-table-style>

                <div class="tool-split tool-box"></div>

                <div class="tool-box font-color-picker">
                    <color-picker :value="fontColor" @input="selectFontColor" ref="fontColorPicker" @show="showFontColor"></color-picker>
                    <tool-btn class="stool-box color-mask" icon="font_color" tips="字体色" @click="chooseFontColor" :style="fontColorStyle" :class="{opened: hasShowedFontColor}"></tool-btn>
                </div>

                <div class="tool-box bg-color-picker">
                    <color-picker :value="bgColor" @input="selectBgColor" ref="bgColorPicker" @show="showBgColor"></color-picker>
                    <tool-btn class="tool-box color-mask" icon="table_bg" tips="背景色" @click="chooseBgColor" :class="{opened: hasShowedBgColor}"></tool-btn>
                </div>

                <tool-table-border :stroke="stroke" @input="setBorderColor"></tool-table-border>

                <div class="tool-split tool-box"></div>

                <tool-font-family :isTable="true" @change="changeFontFamily" eventType="tableTool"></tool-font-family>

                <div class="tool-split tool-box"></div>

                <drop-menu :value="fontSize" :inputConf="{min: minFontSize, max: maxFontSize, maxLength: maxFontSize.toString().length, openGuide: false}" @input="selectFontSize" :options="fontSizeList" unit="px" menuWidth="70px" menuHeight="338px" style="font-size: 12px;">{{fontSize + 'px'}}</drop-menu>

                <div class="tool-split tool-box"></div>

                <tool-btn class="tool-box" icon="bold" tips="加粗" @click="setBold" :class="{checked: fontWeight === 'bold'}"></tool-btn>

                <tool-btn class="tool-box" icon="italic"  tips="斜体" @click="setItalic" :class="{checked: fontStyle === 'italic'}"></tool-btn>

                <div class="tool-split tool-box"></div>

                <drop-menu :value="textAlign" :icon="textAlign" tips="文本对齐" :options="justifyList" @input="setJustify"></drop-menu>

                <tool-shadow eventType="tableTool"></tool-shadow>

                <tool-opacity eventType="tableTool"></tool-opacity>

                <tool-rotate eventType="tableTool"></tool-rotate>

                <div class="tool-split tool-box"></div>

                <tool-table-drop-menu title="添加" :list="addLists" menuWidth="116px"  @input="selectAddOption"></tool-table-drop-menu>
                <tool-table-drop-menu title="删除" :list="deleteLists" menuWidth="92px"  @input="selectDeleteOption"></tool-table-drop-menu>

                <slot></slot>
            </template>
        </div>
    `,

    mixins: [Ktu.mixins.dataHandler],
    data() {
        return {
            fontSizeList: Ktu.config.tool.options.fontSizeList,
            justifyList: Ktu.config.tool.options.justifyList,
            minFontSize: 1,
            maxFontSize: 999,
            hasShowedFontColor: false,
            hasShowedBgColor: false,
            addList: [{
                    label: '向上插入一行',
                    value: 'up',
                    disabled: true,
                },
                {
                    label: '向下插入一行',
                    value: 'down',
                    disabled: true,
                },
                {
                    label: '向左插入一列',
                    value: 'left',
                    disabled: true,
                },
                {
                    label: '向右插入一列',
                    value: 'right',
                    disabled: true,
                },
            ],

            deleteList: [{
                    label: '删除本行',
                    value: 'row',
                    disabled: true,
                },
                {
                    label: '删除本列',
                    value: 'col',
                    disabled: true,
                },
            ],
            // 字体类型数组
            fontFaimlyList: Ktu.config.tool.options.fontFaimlyList,
        };
    },
    computed: {
        isEditing() {
            return false;
        },

        tableData() {
            return this.activeObject.msg.tableData || [];
        },

        selectedCell() {
            return this.selectedData.selectedCell;
        },

        selectedCellList() {
            return this.selectedData.selectedCellList;
        },

        selectedText() {
            if (this.selectedCell) {
                return this.selectedCell.object;
            }
            return this.firstCell.object;
        },

        firstCell() {
            if (this.selectedCellList.length > 0) {
                return this.selectedCellList[0];
            }
            return this.selectedData.msg.tableData.dataList.length > 0 ? this.selectedData.msg.tableData.dataList[0][0] : null;
        },

        bgColor() {
            if (this.selectedCell) {
                return this.selectedCell.bgColor;
            }
            return this.firstCell.bgColor;
        },

        fontColor() {
            if (this.selectedText) {
                return this.selectedText.fill;
            }
            return '#345';
        },

        fontColorStyle() {
            return {
                fill: this.fontColor,
            };
        },

        fontSize() {
            if (this.selectedText) {
                return Math.round(this.selectedText.fontSize * this.selectedData.scaleX);
            }
            return 20;
        },

        fontWeight() {
            if (this.selectedText) {
                return this.selectedText.fontWeight;
            }
        },

        fontStyle() {
            if (this.selectedText) {
                return this.selectedText.fontStyle;
            }
        },

        textAlign() {
            if (this.selectedText) {
                return this.selectedText.textAlign;
            }
        },

        stroke() {
            if (this.selectedCell) {
                return this.selectedCell.borderTopColor;
            }
            return this.firstCell.borderTopColor;
        },

        selectedColGroup() {
            const colGroup = new Array(this.tableData.col);
            this.selectedCellList.forEach(cell => {
                if (!colGroup[cell.col]) {
                    colGroup[cell.col] = [];
                }
                colGroup[cell.col].push(cell);
            });
            return colGroup;
        },

        selectedRowGroup() {
            const rowGroup = new Array(this.tableData.row);
            this.selectedCellList.forEach(cell => {
                if (!rowGroup[cell.row]) {
                    rowGroup[cell.row] = [];
                }
                rowGroup[cell.row].push(cell);
            });
            return rowGroup;
        },

        selectedCol() {
            if (this.selectedCellList && this.selectedCellList.length >= this.tableData.row) {
                const result = [];
                this.selectedColGroup.forEach((col, index) => {
                    if (col.length === this.tableData.row) {
                        result.push(index);
                    }
                });
                return result;
            }
            return [];
        },

        selectedRow() {
            if (this.selectedCellList && this.selectedCellList.length >= this.tableData.col) {
                const result = [];
                this.selectedRowGroup.forEach((row, index) => {
                    if (row.length === this.tableData.col) {
                        result.push(index);
                    }
                });
                return result;
            }
            return [];
        },

        addLists() {
            const list = JSON.parse(JSON.stringify(this.addList));
            if (this.selectedCell) {
                list.forEach(item => {
                    item.disabled = false;
                });
            } else if (this.selectedCol.length === 1) {
                list.forEach(item => {
                    if (item.value === 'left' || item.value === 'right') {
                        item.disabled = false;
                    } else {
                        item.disabled = true;
                    }
                });
            } else if (this.selectedRow.length === 1) {
                list.forEach(item => {
                    if (item.value === 'up' || item.value === 'down') {
                        item.disabled = false;
                    } else {
                        item.disabled = true;
                    }
                });
            }
            return list;
        },

        deleteLists() {
            const list = JSON.parse(JSON.stringify(this.deleteList));
            if (this.selectedCell) {
                list.forEach(item => {
                    item.disabled = false;
                });
            } else if (this.selectedCol.length === 1) {
                list.forEach(item => {
                    if (item.value === 'col') {
                        item.disabled = false;
                    } else {
                        item.disabled = true;
                    }
                });
            } else if (this.selectedRow.length === 1) {
                list.forEach(item => {
                    if (item.value === 'row') {
                        item.disabled = false;
                    } else {
                        item.disabled = true;
                    }
                });
            }
            return list;
        },
    },
    methods: {
        selectBgColor(value) {
            this.selectedData.saveState();
            this.selectedData.setBgColor(value);
            this.selectedData.modifiedState();
            this.selectedData.dirty = true;
            Ktu.log('tableTool', 'bgColor');
        },

        // 选择字体颜色
        selectFontColor(value) {
            this.selectedData.saveState();
            this.selectedData.setFontColor(value);
            this.selectedData.modifiedState();
            this.selectedData.dirty = true;
            Ktu.log('tableTool', 'fontColor');
        },

        chooseFontColor() {
            this.$refs.fontColorPicker.show();
        },

        chooseBgColor() {
            this.$refs.bgColorPicker.show();
        },

        selectFontSize(value) {
            this.selectedData.saveState();
            this.selectedData.setText('fontSize', value / this.selectedData.scaleY);
            this.selectedData.modifiedState();
            this.selectedData.dirty = true;
            Ktu.log('tableTool', 'fontSize');
        },

        setBorderColor(value) {
            this.selectedData.saveState();
            this.selectedData.setBorderColor(value);
            this.selectedData.modifiedState();
            this.selectedData.dirty = true;
            Ktu.log('tableTool', 'borderColor');
        },

        setJustify(value) {
            this.selectedData.saveState();
            this.selectedData.setText('textAlign', value);
            this.selectedData.modifiedState();
            this.selectedData.dirty = true;
            Ktu.log('tableTool', 'textAlign');
        },

        showFontColor(value) {
            this.hasShowedFontColor = value;
        },

        showBgColor(value) {
            this.hasShowedBgColor = value;
        },

        selectAddOption(value) {
            if (value === 'up') {
                const row = this.selectedCell ? this.selectedCell.row : this.selectedRow.length >= 1 ? this.selectedRow[0] : 0;
                this.selectedData.addRow(row);
            } else if (value === 'down') {
                const row = this.selectedCell ? this.selectedCell.row : this.selectedRow.length >= 1 ? this.selectedRow[0] : 0;
                this.selectedData.addRow(row + 1);
            } else if (value === 'left') {
                const col = this.selectedCell ? this.selectedCell.col : this.selectedCol.length >= 1 ? this.selectedCol[0] : 0;
                this.selectedData.addCol(col);
            } else if (value === 'right') {
                const col = this.selectedCell ? this.selectedCell.col : this.selectedCol.length >= 1 ? this.selectedCol[0] : 0;
                this.selectedData.addCol(col + 1);
            }
            Ktu.log('tableTool', 'add');
        },

        selectDeleteOption(value) {
            if (value === 'row') {
                const rowList = [];
                const row = this.selectedCell ? this.selectedCell.row : this.selectedRow.length >= 1 ? this.selectedRow[0] : 0;
                rowList.push(row);
                this.selectedData.delRow(rowList);
            } else if (value === 'col') {
                const colList = [];
                const col = this.selectedCell ? this.selectedCell.col : this.selectedCol.length >= 1 ? this.selectedCol[0] : 0;
                colList.push(col);
                this.selectedData.delCol(colList);
            }
            Ktu.log('tableTool', 'delete');
        },

        setBold() {
            this.selectedData.saveState();
            this.selectedData.setBold();
            this.selectedData.modifiedState();
            this.selectedData.dirty = true;
            Ktu.log('tableTool', 'bold');
        },
        setItalic() {
            this.selectedData.saveState();
            this.selectedData.setItalic();
            this.selectedData.modifiedState();
            this.selectedData.dirty = true;
            Ktu.log('tableTool', 'italic');
        },

        // 切换字体
        changeFontFamily(id) {
            let textType = 0;
            this.fontFaimlyList.some((fontFamily, index) => {
                if (id === fontFamily.value) {
                    textType = fontFamily.type;
                    return true;
                }
                return false;
            });

            // const cookies = `&_FSESSIONID=${$.cookie('_FSESSIONID')}`;
            const fontFamily = `ktu_Font_TYPE_${textType}_ID_${id}RAN_${parseInt(new Date().getTime(), 10)}`;
            const fontUrl = `/ajax/font_h.jsp?cmd=getFontPath&type=${textType}&id=${id}`;
            // const fontUrl = `/font.jsp?type=${textType}&id=${id}${cookies}`;
            const table = this.selectedData;
            const substring = _.uniq(table.getTableText()).join('');

            // 切换字体时分三种情况（单个单元格修改，多选单元格修改，默认整体表格修改）
            if (this.selectedCell) {
                const selectedData = this.selectedCell.object;
                if (!selectedData) {
                    return;
                }

                // 这里需要请求字体路径
                this.requestFontPath(fontUrl, substring).then(res => {
                    const fontFaceId = res.fileId || '';
                    selectedData.ftFamilListChg = 1;
                    selectedData.ftFamilyList = [];
                    selectedData.ftFamilyList.push({
                        con: substring,
                        fontFaceId,
                        fontid: id,
                        fonttype: textType,
                        fontfamily: fontFamily,
                        tmp_fontface_path: res.path,
                        hasLoaded: false,
                    });
                    selectedData.fontFamily = fontFamily;

                    if (Ktu.indexedDB.hasFont(id)) {
                        selectedData.hasChanged = true;
                        table.dirty = true;
                        selectedData.setCoords();
                        selectedData.loadFontBase64Promise = selectedData.loadFontBase64();
                        selectedData.loadFontBase64Promise.then(() => {
                            table.modifiedState();
                        });
                        // console.log('已经加载该字体');
                    } else {
                        if (Ktu.indexedDB.isOpened) {
                            Ktu.indexedDB.get('fonts', id).then(font => {
                                if (font) {
                                    Ktu.indexedDB.blobToArrayBuffer(font.file, id)
                                        .then(file => {
                                            // 加载字体片段
                                            const fontFace = new FontFace(font.fontName, file);

                                            fontFace.load().then(loadedFace => {
                                                document.fonts.add(loadedFace);
                                                selectedData.hasChanged = true;
                                                table.dirty = true;
                                                selectedData.setCoords();
                                                // 更新字体加载状态
                                                Ktu.indexedDB.addFont(font);

                                                selectedData.loadFontBase64Promise = selectedData.loadFontBase64();
                                                selectedData.loadFontBase64Promise.then(() => {
                                                    table.modifiedState();
                                                });
                                            });
                                        })
                                        .catch(err => {
                                            loadFontPart.call(this);
                                            console.log(err);
                                        });
                                } else {
                                    // 加载完整字体
                                    Ktu.indexedDB.downloadFont(id);
                                    loadFontPart.call(this);
                                }
                            });
                        } else {
                            loadFontPart.call(this);
                        }

                        function loadFontPart() {
                            const fontFace = new FontFace(fontFamily, `url(${res.path})`);
                            fontFace.load().then(loadedFace => {
                                document.fonts.add(loadedFace);
                                selectedData.hasChanged = true;
                                table.dirty = true;
                                selectedData.setCoords();
                                this.updateGroup();

                                selectedData.loadFontBase64Promise = selectedData.loadFontBase64();
                                selectedData.loadFontBase64Promise.then(() => {
                                    table.modifiedState();
                                });
                            });
                        }
                    }
                });
            } else {
                let selectedData = {};
                let isMulti = false;
                if (this.selectedCellList && this.selectedCellList.length > 0) {
                    isMulti = true;
                    selectedData = this.selectedCellList[0].object;
                } else {
                    selectedData = this.selectedData.msg.tableData.dataList[0][0].object;
                }

                // 这里需要请求字体路径
                this.requestFontPath(fontUrl, substring).then(res => {
                    const fontFaceId = res.fileId || '';

                    if (isMulti) {
                        this.selectedCellList.forEach(cell => {
                            cell.object.ftFamilListChg = 1;
                            cell.object.ftFamilyList = [];
                            cell.object.ftFamilyList.push({
                                con: substring,
                                fontFaceId,
                                fontid: id,
                                fonttype: textType,
                                fontfamily: fontFamily,
                                tmp_fontface_path: res.path,
                                hasLoaded: false,
                            });
                            cell.object.fontFamily = fontFamily;
                        });
                    } else {
                        this.selectedData.msg.tableData.dataList.forEach(row => {
                            row.forEach(cell => {
                                cell.object.ftFamilListChg = 1;
                                cell.object.ftFamilyList = [];
                                cell.object.ftFamilyList.push({
                                    con: substring,
                                    fontFaceId,
                                    fontid: id,
                                    fonttype: textType,
                                    fontfamily: fontFamily,
                                    tmp_fontface_path: res.path,
                                    hasLoaded: false,
                                });
                                cell.object.fontFamily = fontFamily;
                            });
                        });
                    }

                    function changeData(isMulti, list) {
                        if (isMulti) {
                            list.forEach(cell => {
                                cell.object.hasChanged = true;
                                cell.object.setCoords();
                                cell.object.fontBase64 = selectedData.fontBase64;
                            });
                        } else {
                            list.forEach(row => {
                                row.forEach(cell => {
                                    cell.object.hasChanged = true;
                                    cell.object.setCoords();
                                    cell.object.fontBase64 = selectedData.fontBase64;
                                });
                            });
                        }
                        table.dirty = true;
                    }

                    if (Ktu.indexedDB.hasFont(id)) {
                        // 修改一些数据

                        selectedData.loadFontBase64Promise = selectedData.loadFontBase64();
                        selectedData.loadFontBase64Promise.then(() => {
                            if (isMulti) {
                                changeData(isMulti, this.selectedCellList);
                            } else {
                                changeData(isMulti, this.selectedData.msg.tableData.dataList);
                            }
                            table.modifiedState();
                        });
                        // console.log('已经加载该字体');
                    } else {
                        if (Ktu.indexedDB.isOpened) {
                            Ktu.indexedDB.get('fonts', id).then(font => {
                                if (font) {
                                    Ktu.indexedDB.blobToArrayBuffer(font.file, id)
                                        .then(file => {
                                            // 加载字体片段
                                            const fontFace = new FontFace(font.fontName, file);

                                            fontFace.load().then(loadedFace => {
                                                document.fonts.add(loadedFace);
                                                // 更新字体加载状态
                                                Ktu.indexedDB.addFont(font);

                                                selectedData.loadFontBase64Promise = selectedData.loadFontBase64();
                                                selectedData.loadFontBase64Promise.then(() => {
                                                    if (isMulti) {
                                                        changeData(isMulti, this.selectedCellList);
                                                    } else {
                                                        changeData(isMulti, this.selectedData.msg.tableData.dataList);
                                                    }
                                                    table.modifiedState();
                                                });
                                            });
                                        })
                                        .catch(err => {
                                            loadFontPart.call(this);
                                            console.log(err);
                                        });
                                } else {
                                    // 加载完整字体
                                    Ktu.indexedDB.downloadFont(id);
                                    loadFontPart.call(this);
                                }
                            });
                        } else {
                            loadFontPart.call(this);
                        }

                        function loadFontPart() {
                            const fontFace = new FontFace(fontFamily, `url(${res.path})`);
                            fontFace.load().then(loadedFace => {
                                document.fonts.add(loadedFace);
                                this.updateGroup();

                                selectedData.loadFontBase64Promise = selectedData.loadFontBase64();
                                selectedData.loadFontBase64Promise.then(() => {
                                    if (isMulti) {
                                        changeData(isMulti, this.selectedCellList);
                                    } else {
                                        changeData(isMulti, this.selectedData.msg.tableData.dataList);
                                    }
                                    table.modifiedState();
                                });
                            });
                        }
                    }
                });
            }
        },

        //  请求字体片段路径和fontFaceId
        requestFontPath(fontUrl, substring) {
            return new Promise((resolve, reject) => {
                axios
                    .post(fontUrl, {
                        substring: encodeURIComponent(JSON.stringify(substring)),
                        ktuId: Ktu.ktuId,
                    }).then(response => {
                        if (response.status == 200) {
                            resolve(response.data.info);
                        } else {
                            console.log('请求字体路径失败');
                            reject();
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        reject();
                    });
            });
        },
    },
});