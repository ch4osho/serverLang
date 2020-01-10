Ktu.mixins.dataHandler = {
    computed: {
        selectedData() {
            return this.$store.state.data.selectedData;
        },
        selectedGroup() {
            return this.$store.state.data.selectedGroup;
        },
        currentMulti() {
            return this.$store.state.data.currentMulti;
        },
        activeObject() {
            return this.selectedData || this.selectedGroup || this.currentMulti;
        },
        selectedTemplateData() {
            return this.$store.state.data.selectedTemplateData;
        },
        isObjectInGroup() {
            return !!this.activeObject && !!this.activeObject.group;
        },
        // 马赛克背景
        edbg() {
            return this.$store.state.data.edbg;
        },
    },
    methods: {
        changeDataProp(prop, value, isAvoidSaveState) {
            this.$store.commit(this.activeObject.type === 'group' || this.activeObject.type === 'multi' ? 'data/changeDataInGroupProp' : 'data/changeDataProp', {
                prop,
                value,
                isAvoidSaveState,
            });
        },
        // 批量改变元素属性，此方法只会添加一次操作队列
        changeDataProps(obj) {
            this.$store.commit('data/changeDataProps', obj);
        },
        changeDataObject(prop, attr, value) {
            this.$store.commit('data/changeDataObject', {
                prop,
                attr,
                value,
            });
        },
        updateGroup() {
            if (this.selectedData && this.selectedData.group || this.activeObject.type === 'group' || this.activeObject.type === 'multi') {
                const group = this.selectedData ? this.selectedData.group : this.activeObject;
                group.updateSizePosition();
            }
        },
    },
    created() {
        /* console.log(this.selectedData);
		   console.log(this.selectedGroup);
		   console.log(this.currentMulti); */
    },
};
