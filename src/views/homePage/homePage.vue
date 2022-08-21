<template>
    <a-layout class="full-height">
        <global-header @refreshGraphList="initGraphList"></global-header>
        <a-layout>
            <a-layout-content class="main-content">

                <div class="main-box">
                    <div class="title-box" v-if="this.$route.query.keywords">Search results for "{{ this.$route.query.keywords }}"</div>
                    <div class="title-box" v-else>Popular knowledge graphs</div>
                    <a-list class="popular-graph-list" :grid="{ gutter: 16, column: 2 }" :data-source="graphList">
                        <a-list-item slot="renderItem" slot-scope="item">
                            <a-card class="graph-card">
                                <a class="graph-title" slot="title" @click="openPage('/graph/'+item.id)">
                                    {{item.name}}
                                </a>
                                <div slot="extra">
                                    created by <a class="username-text" @click="openPage('/user/'+item.username)">{{item.username}}</a>
                                </div>
                                <div class="desc">{{ item.description }}</div>
                                <div class="bottom-info">
                                    <a-icon style="margin-right: 5px;" type="eye" /> views: {{item.views}}
                                    <span style="width: 18px;"></span>
                                    Updated  {{item.updateTime}}
                                </div>

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
    name: "homepage",
    data() {
        return {

            graphList: [
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
        this.initGraphList();
    },
    methods: {
        ...mapMutations(['removeLogin', 'updateState']),
        initGraphList() {
            this.$request({
                url: '/graph/graphList',
                method: 'POST',
                data: {
                    searchText: this.$route.query.keywords ? this.$route.query.keywords : ''
                },
            }).then(res => {
                if (!res.data.success) {
                    this.$message.warning(res.data.desc);
                }else {
                    this.graphList = res.data.data;
                    this.graphList.map( graph => {
                        graph.createTime = this.formatDate(graph.createTime);
                        graph.updateTime = this.formatDate(graph.updateTime);
                    })
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
        },
        openPage(path) {
            const routeData = this.$router.resolve({
                path: path,
            });
            window.open(routeData.href, '_blank');
        },
        formatDate(dateString) {
            const date = new Date(dateString);
            return date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes();
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
    width: 90%;
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