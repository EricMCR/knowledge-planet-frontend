import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        // 存储token
        token: localStorage.getItem('token') ? localStorage.getItem('token') : '',
        userInfoText: localStorage.getItem('userInfo') ? localStorage.getItem('userInfo') : ''
    },
    mutations: {
        updateState (state) {
            state.token = localStorage.getItem('token') ? localStorage.getItem('token') : '';
            state.userInfoText = localStorage.getItem('userInfo') ? localStorage.getItem('userInfo') : '';
        },
        // 修改token，并将token存入localStorage
        changeLogin (state, user) {
            localStorage.setItem('token', user.token);
            localStorage.setItem('userInfo', JSON.stringify(user.userInfo));
        },
        //退出登录
        removeLogin () {
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
        },

    },
    getters: {
        isLogin (state) {
            return state.token !== '' && state.userInfoText !== '';

        }
    }
})

export default store;