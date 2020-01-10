Ktu.mixins.materialHandler = {
    computed: {
        deleteMaterialDir: {
            get() {
                return this.$store.state.data.deleteMaterialDir;
            },
            set(obj) {
                this.$store.commit('data/updateDelMaterialDir', obj);
            },
        },
        // 删除成功 监听回调
        deleteMaterialSuccess: {
            get() {
                return this.$store.state.data.deleteMaterialSuccess;
            },
            set(value) {
                this.$store.commit('data/updateDelMaterialSuccess', value);
            },
        },
        // 监听删除素材文件夹的来源
        deleteMaterialOrigin: {
            get() {
                return this.$store.state.data.deleteMaterialOrigin;
            },
            set(str) {
                this.$store.commit('data/updateDelMaterialOrigin', str);
            },
        },
    },
    methods: {
        delDir(isChecked) {
            if (this.deleteMaterialDir.id == 0) {
                this.$Notice.warning('默认文件夹不能删除');
                return false;
            }
            const url = '../ajax/ktuGroup_h.jsp?cmd=delKtuGroup';

            axios.
                post(url, {
                    id: this.deleteMaterialDir.id,
                    delKtuImg: isChecked,
                })
                .then(res => {
                    const info = res.data;
                    if (info.success) {
                        // 删除成功 在主页面执行回调
                        this.deleteMaterialSuccess = true;
                        this.$Notice.success(info.msg);
                        Ktu.log('uploadManage', 'delDir');
                    }
                })
                .catch(err => {
                    this.$Notice.error(err);
                })
                .finally(() => {
                    // 无论结果如何 状态都重置
                    setTimeout(() => {
                        this.deleteMaterialSuccess = false;
                        this.deleteMaterialOrigin = '';
                    }, 10);
                });
        },
    },
};
