
//type:1-文件夹, 2-链接
export const menuList = [
    {
        title: '首页',
        url: '/#/chartsPage',
        type: 2,
        icon: 'home',
        allowedAuth: [0, 1, 2]
    },
    {
        title: '用户管理',
        url: '/#/clientManagement',
        type: 2,
        icon: 'user',
        allowedAuth: [0, 1, 2]
    },
    {
        title: '地址管理',
        url: '/#/addressManagement',
        type: 2,
        icon: 'environment',
        allowedAuth: [0, 1, 2]
    },
    {
        title: '订单管理',
        url: '/#/orderManagement',
        type: 2,
        icon: 'money-collect',
        allowedAuth: [0, 1, 2]
    },
    {
        title: '代驾管理',
        type: 1,
        subMenuList: [
            {
                title: '代驾信息',
                url: '/#/driverManagement',
                type: 2,
                icon: 'user'
            },
            {
                title: '代驾审核',
                url: '/#/driverAudit',
                type: 2,
                icon: 'audit'
            }
        ],
        icon: 'car',
        allowedAuth: [1, 2]
    },
    {
        title: '管理员管理',
        url: '/#/adminManagement',
        type: 2,
        icon: 'setting',
        allowedAuth: [2]
    }
]