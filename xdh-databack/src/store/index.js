import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        visitedMenus: []
    },
    mutations: {

        // 添加已访问菜单
        addMenus({ visitedMenus }, payload) {
            if (payload.name) visitedMenus.push(payload);
        },
        
        // 删除已访问菜单
        deleteMenus({ visitedMenus }, payload) {
            visitedMenus.splice(
                visitedMenus.findIndex(item => {
                    return item.name === payload.name;
                }),
                1
            );
        }
    },
    actions: {
        addMenus({ commit }, payload) {
            commit('addMenus', payload);
        },
        deleteMenus({ commit }, payload) {
            commit('deleteMenus', payload);
        }
    },
    getters: {
        visitedMenus: state => {
            return state.visitedMenus;
        }
    }
});
