<template>
    <a-layout class="full-height">
        <global-header>

        </global-header>
        <a-layout>
            <a-layout-content class="main-content">
                <div class="left-sider">
                    <div class="username-text">{{ this.username }}</div>
                    <a-divider style="background-color: #b6bbc0;"></a-divider>
                    <div>{{ userGraphList.length }} graphs</div>
                    <div>{{ totalViews }} views</div>
                </div>

                <div class="main-box">
                    <div class="title-box">
                        <a-input-search
                            v-model="searchText"
                            placeholder="Find a graph..."
                            enter-button
                            :loading="searchLoading"
                            @search="onSearch"
                        />
                    </div>
                    <a-list class="popular-graph-list" :grid="{ gutter: 16, column: 2 }" :data-source="userGraphList">
                        <a-list-item slot="renderItem" slot-scope="item">
                            <a-card class="graph-card">
                                <a class="graph-title" slot="title" @click="openPage('/graph/'+item.id)">
                                    {{item.name}}
                                </a>
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

export default {
    name: "user",
    data() {
        return {
            userGraphList: [
            ],
            username: '',
            searchText: '',
            searchLoading: false,

            totalGraphs: 0,
            totalViews: 0,

            curHeight: document.body.clientHeight,

        }
    },
    created() {
        let userInfo = JSON.parse(this.$store.state.userInfoText);
        this.username = userInfo.username;
    },
    mounted() {
        this.initUserGraphList();
    },
    methods: {
        ...mapMutations(['removeLogin', 'updateState']),
        initUserGraphList() {
            this.$request({
                url: '/user/userGraphList',
                method: 'POST',
                data: {
                    username: this.$route.params.username
                },
            }).then(res => {
                if (!res.data.success) {
                    this.$message.warning(res.data.desc);
                }else {
                    this.userGraphList = res.data.data;
                    this.totalGraphs = this.userGraphList.length;
                    this.userGraphList.map( graph => {
                        graph.createTime = this.formatDate(graph.createTime);
                        graph.updateTime = this.formatDate(graph.updateTime);
                    })
                    let views = 0;
                    this.userGraphList.forEach( graph => {
                        views += graph.views;
                    } )
                    this.totalViews = views;
                }
            })
        },
        onSearch() {
            this.searchLoading = true;
            this.$request({
                url: '/user/userGraphList',
                method: 'POST',
                data: {
                    username: this.$route.params.username,
                    searchText: this.searchText
                },
            }).then(res => {
                if (!res.data.success) {
                    this.$message.warning(res.data.desc);
                }else {
                    this.userGraphList = res.data.data;
                    this.userGraphList.map( graph => {
                        graph.createTime = this.formatDate(graph.createTime);
                        graph.updateTime = this.formatDate(graph.updateTime);
                    })
                }
                this.searchLoading = false;
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
        formatDate(dateString) {
            const date = new Date(dateString);
            return date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes();
        },
        openPage(path) {
            const routeData = this.$router.resolve({
                path: path,
            });
            window.open(routeData.href, '_blank');
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
    width: 25%;
}
.main-content .main-box {
    padding-top: 10px;
    width: 71%;
}
.main-content .left-sider .username-text {
    font-size: 30px;
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