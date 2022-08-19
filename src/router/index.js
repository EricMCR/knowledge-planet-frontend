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
        path: '/homePage',
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
    },
    {
        path: '/chartsPage',
        name: '图表页',
        component: () => import('@/components/charts-page/chartsPage.vue')
    },
]

const router =  new Router({
    routes
})

// 导航守卫
// 使用 router.beforeEach 注册一个全局前置守卫，判断用户是否登陆
router.beforeEach((to, from, next) => {
    let isLogin = store.getters.isLogin;
    if (isLogin) {
        if (to.path === '/login') {
            next('/homePage');
        }
    }
    next();
});

//解决  vue-router路由版本更新产生的问题,导致路由跳转失败抛出该错误
const originalPush = Router.prototype.push
Router.prototype.push = function push(location, onResolve, onReject) {
    if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
    return originalPush.call(this, location).catch(err => err)
}

export default router;