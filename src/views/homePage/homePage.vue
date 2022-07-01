<template>
    <a-layout class="full-height">
        <global-header>

        </global-header>
        <a-layout>
            <a-layout-sider width="200" style="background: #fff" collapsible :collapsedWidth="80">
                <a-menu
                    mode="inline"
                    @select="handleMenuSelect"
                    :style="{ height: '100%', borderRight: 0 }"
                    :selectedKeys="selectedMenuKeys" theme="dark"
                >
                    <template v-for="item in menuList">
                        <a-sub-menu v-if="item.type === 1" :key="item.url">
                            <span slot="title">
                                <a-icon :type="item.icon" />
                                <span>{{item.title}}</span>
                            </span>
                            <a-menu-item v-for="subItem in item.subMenuList" :key="subItem.url" :disabled="item.disabled">
                                <a-icon :type="subItem.icon" />
                                <span>{{subItem.title}}</span>
                            </a-menu-item>
                        </a-sub-menu>
                        <a-menu-item v-if="item.type === 2" :key="item.url" :disabled="item.disabled">
                            <a-icon :type="item.icon" />
                            <span>{{item.title}}</span>
                        </a-menu-item>
                    </template>

                </a-menu>
            </a-layout-sider>
            <a-layout>
                <a-layout-content>
                    <a-tabs v-show="tabList.length"
                            class="frame-tabs" type="editable-card"
                            style="height: 100%; padding-left: 1px;" :tabBarStyle="{margin: 0}"
                            @edit="onEdit" :activeKey="currentTabKey"
                            @change="changeTab" :tabBarGutter = 0
                            hideAdd :animated="false">
                        <a-tab-pane v-for="item in tabList" :key="item.url" :tab="item.title" :closable="true" :forceRender="false">
                            <iframe class="tab-frame" :src="item.url" :style="{height:(curHeight - 105)+'px'}"></iframe>
                        </a-tab-pane>
                    </a-tabs>

<!--                    <charts-page v-show="!tabList.length"></charts-page>-->
                </a-layout-content>

            </a-layout>
        </a-layout>

    </a-layout>

</template>

<script>
import { mapMutations } from 'vuex'
import {menuList} from './menuConfig'

export default {
    name: "homePage",
    data() {
        return {

            //侧边菜单列表
            menuList: menuList,
            selectedMenuKeys: ['/#/chartsPage'],

            //当前标签页列表
            tabList: [],
            currentTabKey: '',

            curHeight: document.body.clientHeight,

        }
    },
    created() {
        // this.menuIfDisabledCheck();
        //
        // //默认打开首页
        // let data = this.getTabData('/#/chartsPage');
        // this.addTab(data);
    },
    methods: {
        ...mapMutations(['removeLogin', 'updateState']),
        //处理侧边菜单选中事件
        handleMenuSelect(params) {
            let data = this.getTabData(params.key);
            this.selectedMenuKeys[0] = params.key;
            this.addTab(data);
        },
        //根据url在菜单列表中查找页面数据
        getTabData(url) {
            for (let item of this.menuList) {
                if (item.type === 1 && item.subMenuList) {
                    for (let subItem of item.subMenuList) {
                        if (subItem.url === url) {
                            return subItem;
                        }
                    }
                }else if (item.type === 2 && item.url === url) {
                    return item;
                }
            }
        },
        //添加tab页
        addTab(data) {
            if (this.tabList.every(item => { return item.url !== data.url; })) {
                this.tabList.push({
                    title: data.title,
                    url: data.url
                })
            }
            this.currentTabKey = data.url;
        },
        onEdit(targetKey, action) {
            this[action](targetKey);
        },
        remove(targetKey) {
            this.tabList.splice(this.tabList.findIndex(item => {
                return item.url === targetKey;
            }), 1);
            if (this.tabList.length) {
                this.currentTabKey = this.tabList[this.tabList.length - 1].url;
                this.selectedMenuKeys[0] = this.tabList[this.tabList.length - 1].url;
            }else {
                this.currentTabKey = '';
            }
            if (this.selectedMenuKeys.length && this.selectedMenuKeys[0] === targetKey) {
                this.selectedMenuKeys.splice(0, 1);
            }

        },
        changeTab(activeKey) {
            this.currentTabKey = activeKey;
            this.selectedMenuKeys[0] = activeKey;
        },
        //处理修改密码窗口的关闭事件
        handleClose() {
            this.$refs['form'].clearValidate();
            this.form = {
                oldPassword: '',
                newPassword: '',
                comfirmPassword: ''
            }
        },
        //菜单权限检查
        menuIfDisabledCheck() {
            const auth = JSON.parse(localStorage.getItem('userInfo')).userRole;
            for (let item of menuList) {
                if (item.allowedAuth && item.allowedAuth.length) {
                    if (!item.allowedAuth.includes(auth)) {
                        item.disabled = true;
                    }else {
                        item.disabled = false;
                    }
                }
            }
        },
        submitForm(formName) {
            this.$refs[formName].validate(valid => {
                if (valid) {
                    let params = {
                        id: this.id,
                        oldPassword: this.form.oldPassword,
                        newPassword: this.form.newPassword
                    };

                    console.log()
                    this.$request({
                        url: '/admin/updatePwd',
                        method: 'POST',
                        data: params,
                        headers: {
                            token: this.$store.state.Authorization
                        }
                    }).then(res => {
                        if (res.data.status == '200') {
                            this.$message.success('操作成功');
                            this.visible = false;
                            this.handleClose();
                        }else {
                            this.$message.warning(res.data.desc);
                        }
                    })
                }
            })
        }
    }
}
</script>

<style>
.full-height {
    height: 100%;
}
.frame-tabs .ant-tabs-top-content, .ant-tabs-tabpane, .tab-frame {
    height: 100%;
    width: 100%;

}
.frame-tabs .tab-frame {
    width: calc(100% - 14px);
    margin: 7px;
    border-radius: 15px;
}
</style>