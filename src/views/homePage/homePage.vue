<template>
    <a-layout class="full-height">
        <global-header>

        </global-header>
        <a-layout>
            <a-layout-content class="main-content">
                <div class="left-sider">
                    <div class="username-text">Eric</div>
                    <a-divider style="background-color: #b6bbc0;"></a-divider>
                    <div>Your Knowledge Graph</div>
                    <a-list item-layout="horizontal" :data-source="myGraphList">
                        <a-list-item slot="renderItem" slot-scope="item">
                            <a-list-item-meta
                                :description="item.description"
                            >
                                <a slot="title" href="https://www.antdv.com/">{{ item.name }}</a>
                            </a-list-item-meta>
                        </a-list-item>
                    </a-list>
                </div>

                <div class="main-box">
                    <div class="title-box">Popular knowledge graphs</div>
                    <a-list class="popular-graph-list" :grid="{ gutter: 16, column: 2 }" :data-source="popularGraphList">
                        <a-list-item slot="renderItem" slot-scope="item">
                            <a-card class="graph-card">
                                <a class="graph-title" slot="title" @click="$router.push('graph/'+item.id)">
                                    {{item.name}}
                                </a>
                                <div slot="extra">
                                    created by <a class="username-text">{{item.username}}</a>
                                </div>
                                <div class="desc">{{ item.description }}</div>
                                <div class="bottom-info"><a-icon style="margin-right: 5px;" type="eye" /> views: {{item.views}}   Updated {{item.updatedTime}}</div>

                            </a-card>
                        </a-list-item>
                    </a-list>
                </div>

            </a-layout-content>
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

            myGraphList: [
                {
                    id: 212332131,
                    name: "Graph 1",
                    description: "This is my first knowledge graph.",
                    views: 21
                },
                {
                    id: 212387231,
                    name: "Graph 2",
                    description: "This is my second knowledge graph.",
                    views: 322
                }
            ],

            popularGraphList: [
            ],

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

    },
    mounted() {
        this.initPopularGraphList();
    },
    methods: {
        ...mapMutations(['removeLogin', 'updateState']),
        initPopularGraphList() {
            this.$request({
                url: '/graph/popularGraphList',
                method: 'POST',
                data: {

                },
            }).then(res => {
                if (!res.data.success) {
                    this.$message.warning(res.data.desc);
                }else {
                    this.popularGraphList = res.data.data;
                }
            })
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
.main-content {
    padding-top: 20px;
    margin: 0px auto;
    width: 100%;
    max-width: 1280px;
    min-height: 600px;
    display: flex;
    justify-content: space-around;
}
.main-content .left-sider {
    padding: 10px;
    width: 30%;
}
.main-content .main-box {
    padding-top: 10px;
    width: 66%;
}
.main-content .left-sider .username-text {
    font-size: 25px;
    font-weight: lighter;
}
.main-box .title-box {
    font-size: 22px;
    font-weight: lighter;
}

.main-box .popular-graph-list {
    padding: 15px 0;
}

.main-box .graph-card .username-text {
    font-size: 16px;
    font-weight: normal;
    color: black;
}

.main-box .graph-card .bottom-info {
    margin-top: 10px;
    display: flex;
    align-items: center;
}

.main-box .graph-card .graph-title {
    cursor: pointer;
    color: #0969da;
    text-decoration: none;
    font-size: 19px;
}

</style>