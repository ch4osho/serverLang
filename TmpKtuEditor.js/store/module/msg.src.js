Ktu.storeModule.msg = {
    namespaced: true,
    state: {
        title: Ktu.ktuData.other.title,
        updateTime: Ktu.ktuData.updateTime,
        isSaving: false,
        hasSaveCompleted: true,
        saveChangedNum: 0,
        isShowDrapTip: false,
        isShowScrollTip: false,
        // 是否显示形状的提示
        isShowShapeTip: false,
        // 是否显示线条的提示
        isShowLineTip: false,
        // 是否显示文本的提示
        isShowTextTip: false,
        // 编辑器辅助线
        openAssistLine: false,
        isAutoSnap: true,
        snapLineColor: '#ff7733',
        assistLinesx: [],
        assistLinesy: [],
        // tips配置
        arrayTipConfig: [
            { name: 'isShowDrapTip', ktu: 'tmpIsHideDrapTip', local: 'isHideDrapTip' },
            { name: 'isShowScrollTip', ktu: 'tmpIsHideScrollTip', local: 'isHideScrollTip' },
            { name: 'isShowShapeTip', ktu: 'tmpIsHideShapeTip', local: 'isHideShapeTip' },
            { name: 'isShowLineTip', ktu: 'tmpIsHideLineTip', local: 'isHideLineTip' },
            { name: 'isShowTextTip', ktu: 'tmpIsHideTextTip', local: 'isHideTextTip' },
            // {name:"isShowShapeTip",ktu:"tmpIsHideShapeTip"},
        ],
        // 对齐与分布/层级/位置的弹窗样式
        dropMenuStyle: {
            isShow: false,
            left: 0,
            top: 0,
            isNeedTranslateX: false,
            isNeedTranslateY: false,
            operationName: '',
        },
        isShowDropMenu: false,
        isShowContextmenu: false,
    },
    getters: {
        // 返回管理态的Path
        toManagePath() {
            if (!!Ktu.isFromThirdDesigner) {
                if (!!Ktu.isFromCustomization) {
                    return '/manage/ktuManage.jsp?mstatus=1#/m/customization';
                }
                return '/manage/ktuManage.jsp?mstatus=1#/m/my';
            }
            return  '/manage/ktuManage.jsp#/m/my';
        },
    },
    mutations: {
        update(state, obj) {
            state[obj.prop] = obj.value;
        },

        showManipulatetip(state, type) {
            // store下的数据
            const arrayState = [];
            // 当前数据
            let obj = {};
            const { arrayTipConfig } = state;

            // 存下所有type
            const arrayType = arrayTipConfig.map(item => item.name);
            if (!arrayType.includes(type)) {
                return;
            }

            arrayTipConfig.forEach(item => (item.name === type ? obj = item : arrayState.push(!state[item.name])));
            if (type === obj.name && !Ktu[obj.ktu]) {
                console.log(type);
                state[type] = arrayState.every(item => item);
            }

            /*

                        if(type== 'isShowDrapTip' && !Ktu.tmpIsHideDrapTip ) {
                            console.log(arrayState,"arrayList");
                            const test = arrayState.every((item)=>item);
                            state.isShowDrapTip = !state.isShowScrollTip && true;
                            console.log(state.isShowDrapTip,"state.isShowDrapTip")
                            console.log(test,"test");
                        }

                        if(type== 'isShowScrollTip' && !Ktu.tmpIsHideScrollTip ) {
                            state.isShowScrollTip = !state.isShowDrapTip && true;
                        }
            */
            /* if(type== 'isShowShapeTip' && !Ktu.tmpIsHideShapeTip ) {
				state.isShowShapeTip = !state.isShowDrapTip && true;
			}*/
        },

        hideManipulatetip(state, type) {
            const { arrayTipConfig } = state;
            const arrayType = arrayTipConfig.map(item => item.name);
            // 获取当前配置的tips
            let obj = {};
            if (!arrayType.includes(type)) {
                return;
            }
            arrayTipConfig.forEach(item => (item.name === type ? obj = item : ''));
            if (type == obj.name) {
                state[obj.name] = false;
                Ktu[obj.ktu] = true;
                localStorage.setItem(obj.local, true);
            }
            /* if(type== 'isShowDrapTip' && state.isShowDrapTip) {
				state.isShowDrapTip = false;

				Ktu.tmpIsHideDrapTip = true;

				localStorage.setItem('isHideDrapTip', true);
			}

			if(type== 'isShowScrollTip' && state.isShowScrollTip) {
				state.isShowScrollTip = false;

				Ktu.tmpIsHideScrollTip = true;

				localStorage.setItem('isHideScrollTip', true);
			}*/
        },
        // 关闭一次，但是下次还是会展示出来
        hideManipulatetipOnce(state, type) {
            state[type] = false;
        },
        setAssistLineOptions(state, obj) {
            state[obj.prop] = obj.value;
            localStorage.setItem(obj.prop, obj.value);
        },
        setDropMenuStyle(state, obj) {
            state[obj.type] = obj.data;
        },

    },
};

