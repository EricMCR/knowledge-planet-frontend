<template>
    <a-layout-header class="header">
        <div class="header-logo" @click="$router.push('/homepage')">
            <img src="../../assets/logo.png" width="40" height="40"/>
            <h3 class="subtitle is-4">Knowledge Planet</h3>
        </div>
        <a-input-search
            class="globalSearchBox"
            v-model="globalSearchText"
            placeholder="Find a graph..."
            enter-button
            :loading="globalSearchLoading"
            @search="onGlobalSearch"
        />
        <div class="header-right">

            <template v-if="isLogin">
                <a-button @click="visibleCreateGraph = true;" type="primary" shape="circle" icon="plus"></a-button>
                <a-dropdown :trigger="['click']" style="cursor: pointer;">
                    <div style="display: flex; align-items: center;">
                        <h5 class="subtitle is-5">{{ username }}</h5>
                        <a-avatar
                            shape="square"
                            size="default"
                            :style="{ backgroundColor: color, verticalAlign: 'middle' }">
                            {{ username[0] }}
                        </a-avatar>
                        <a-icon style="color: #fff; font-size: 14px; margin-top: 5px;" type="caret-down"/>
                    </div>

                    <a-menu slot="overlay">
                        <a-menu-item @click="myGraphs">My graphs</a-menu-item>
                        <a-menu-item @click="changePwd">Change password</a-menu-item>
                        <a-menu-item @click="logout">Sign out</a-menu-item>
                    </a-menu>
                </a-dropdown>
            </template>

            <template v-else>
                <a-space>
                    <a-button ghost @click="$router.push('/login')">Sign in</a-button>
                    <a-button ghost @click="$router.push('/register')">Sign up</a-button>
                </a-space>

            </template>

        </div>

        <a-modal dialogClass="form-modal" v-model="visible" centered
                 title="Change password"
                 @cancel="handleClose" @ok="submitForm('form')" :width="450">
            <a-form-model ref="form" :model="form" :rules="rules" layout="horizontal" labelAlign="left"
                          :label-col="labelCol" :wrapper-col="wrapperCol">

                <a-form-model-item label="原密码" prop="oldPassword">
                    <a-input-password v-model="form.oldPassword" placeholder="请输入"> </a-input-password>
                </a-form-model-item>
                <a-form-model-item label="设置新密码" prop="newPassword">
                    <a-input-password v-model="form.newPassword" placeholder="请输入"> </a-input-password>
                </a-form-model-item>
                <a-form-model-item label="确认新密码" prop="confirmPassword">
                    <a-input-password v-model="form.confirmPassword" placeholder="请输入"> </a-input-password>
                </a-form-model-item>
            </a-form-model>
        </a-modal>

        <a-modal dialogClass="form-modal" v-model="visibleCreateGraph" centered
                 title="Create graph"
                 @cancel="handleGraphClose" @ok="submitGraphForm('createGraphForm')" :width="550">
            <a-form-model ref="createGraphForm" :model="createGraphForm" :rules="createGraphRules" layout="horizontal" labelAlign="left"
                          :label-col="labelCol" :wrapper-col="wrapperCol">

                <a-form-model-item label="Graph name" prop="name">
                    <a-input v-model="createGraphForm.name" placeholder="Please input name"> </a-input>
                </a-form-model-item>
                <a-form-model-item label="Description" prop="description">
                    <a-textarea v-model="createGraphForm.description" placeholder="Graph description"
                                :auto-size="{ minRows: 3, maxRows: 15 }"> </a-textarea>
                </a-form-model-item>
            </a-form-model>
        </a-modal>

    </a-layout-header>

</template>

<script>
import {mapMutations} from "vuex";

export default {
    name: "global-header",
    data() {
        let validatePwd = (rule, value, callback) => {
            if (value !== this.form.newPassword) {
                callback(new Error("两次输入不一致"));
            } else {
                callback();
            }
        };
        return {
            isLogin: false,

            id: '',
            username: '',
            color: '#f56a00',
            colorList: ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae'],

            visible: false,
            labelCol: { span: 6 },
            wrapperCol: { span: 17 },
            layout: 'horizontal',
            form: {
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            },
            rules: {
                newPassword: [
                    { required: true, message: '请设置密码', trigger: 'change' },
                    { min: 6, message: '密码最少6位', trigger: 'change' }
                ],
                oldPassword: [
                    { required: true, message: '请输入原密码', trigger: 'change' }
                ],
                confirmPassword: [
                    { required: true, message: '请再次输入新密码', trigger: 'change' },
                    { validator: validatePwd, trigger: 'change'}
                ]
            },

            visibleCreateGraph: false,
            createGraphForm: {
                name: '',
                description: ''
            },
            createGraphRules: {
                name: [
                    { required: true, message: 'Please input name', trigger: 'change' },
                    { max: 100, message: 'Name too long', trigger: 'change' }
                ],
                description: [

                ]
            },

            globalSearchText: '',
            globalSearchLoading: false
        }
    },
    created() {
        this.isLogin = this.$store.getters.isLogin
        if (this.isLogin) {
            this.initLogoutBox();
        }
        this.globalSearchText = this.$route.query.keywords?this.$route.query.keywords: '';
    },
    watch: {
        $route(to, from) {
            if (to.path === '/homepage' && from.path === '/homepage') {
                this.globalSearchText = to.query.keywords;
                this.$emit("refreshGraphList");
            }
        }
    },
    methods: {
        ...mapMutations(['removeLogin', 'updateState']),
        initLogoutBox() {
            let userInfo = JSON.parse(this.$store.state.userInfoText);
            this.id = userInfo.id;
            this.username = userInfo.username;
            const index = Math.round(Math.random() * 3);
            this.color = this.colorList[index];
        },
        myGraphs() {
            const routeData = this.$router.resolve({
                path: '/user/' + this.username,
            });
            window.open(routeData.href, '_blank');
        },
        //修改密码
        changePwd() {
            this.visible = true;
        },
        //注销账号
        logout() {
            this.removeLogin();
            this.updateState();
            this.$router.go(0);
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
        handleGraphClose() {
            this.$refs['createGraphForm'].clearValidate();
            this.createGraphForm = {
                name: '',
                description: ''
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
        submitGraphForm(formName) {
            this.$refs[formName].validate(valid => {
                if (valid) {
                    const modal = this.$info({
                        title: 'Creating graph...',
                        footer: null,
                        content: (
                            <div>
                                <a-spin style="margin-left: 100px; margin-top: 5px;">
                                    <a-icon slot="indicator" type="loading" style="font-size: 24px" spin />
                                </a-spin>
                            </div>
                        )
                    });
                    let params = {
                        name: this.createGraphForm.name,
                        description: this.createGraphForm.description
                    };
                    this.$request({
                        url: '/graph/create',
                        method: 'POST',
                        data: params,
                    }).then(res => {
                        if (!res.data.success) {
                            this.$message.warning(res.data.desc);
                        }else {
                            const graphId = res.data.data.id;
                            modal.destroy();
                            this.$message.success("Graph created successfully")
                            this.$router.push("/graph/" + graphId);
                        }
                    })
                }
            })
        },
        onGlobalSearch() {
            if (this.globalSearchText !== '') {
                this.$router.push({ path: '/homepage', query: { keywords: this.globalSearchText }})
            }else {
                this.$router.push({ path: '/homepage'})
            }
        }
    }
}
</script>

<style scoped>
.header {
    padding: 5px 20px;
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.header .header-logo {
    float: left;
    min-width: 200px;
    height: 40px;
    display: flex;
    align-items: center;
    cursor: pointer;
}
.header .header-logo h3 {
    padding: 0 10px;
    color: #fff;
}
.header .header-right {
    float: right;
    min-width: 150px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: end;
}
.header .header-right h5 {
    padding: 0 10px;
    color: #fff;
    margin-bottom: 0;
}
.globalSearchBox {
    width: 40%;
}
</style>