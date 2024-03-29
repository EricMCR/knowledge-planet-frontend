import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'

Vue.use(Router)

export const routes = [
    {
        path: '/',
        redirect: '/homePage'
    },
    {
        path: '/login',
        name: 'Sign in',
        component: () => import('@/views/login/login.vue')
    },
    {
        path: '/register',
        name: 'Sign up',
        component: () => import('@/views/register/register.vue')
    },
    {
        path: '/homepage',
        name: 'Home Page',
        component: () => import('@/views/homePage/homePage.vue')
    },
    {
        path: '/graph/:id',
        name: 'Graph Page',
        component: () => import('@/views/graph/graph.vue')
    },
    {
        path: '/user/:username',
        name: 'User Page',
        component: () => import('@/views/user/user.vue')
    }
]

const router =  new Router({
    routes
})

// Navigation guard
// Use router.beforeEach to register a global preemptive guard to determine if the user is logged in
router.beforeEach((to, from, next) => {
    let isLogin = store.getters.isLogin;
    if (isLogin) {
        if (to.path === '/login') {
            next('/homePage');
        }
    }
    next();
});

//Resolving issues arising from vue-router route version updates
const originalPush = Router.prototype.push
Router.prototype.push = function push(location, onResolve, onReject) {
    if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
    return originalPush.call(this, location).catch(err => err)
}

export default router;