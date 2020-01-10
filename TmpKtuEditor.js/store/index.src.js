Ktu.store = new Vuex.Store({
    state: {
        isDevDebug: Ktu.isDevDebug,
        is360Brower: Ktu.utils.is360Brower(),
    },
    getters: {

    },
    mutations: {

    },
    modules: {
        base: Ktu.storeModule.base,
        msg: Ktu.storeModule.msg,
        data: Ktu.storeModule.data,
        modal: Ktu.storeModule.modal,
    },
});
