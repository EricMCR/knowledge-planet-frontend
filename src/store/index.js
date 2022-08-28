import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        // store token
        token: localStorage.getItem('token') ? localStorage.getItem('token') : '',
        userInfoText: localStorage.getItem('userInfo') ? localStorage.getItem('userInfo') : ''
    },
    mutations: {
        updateState (state) {
            state.token = localStorage.getItem('token') ? localStorage.getItem('token') : '';
            state.userInfoText = localStorage.getItem('userInfo') ? localStorage.getItem('userInfo') : '';
        },
        // Modify the token and store the token in localStorage
        changeLogin (state, user) {
            localStorage.setItem('token', user.token);
            localStorage.setItem('userInfo', JSON.stringify(user.userInfo));
        },
        // Sign out
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