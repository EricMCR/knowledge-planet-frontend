<template>
    <a-layout-header class="header">
        <div class="header-logo" @click="$router.push('homePage')">
            <img src="../../assets/logo.png" width="40" height="40"/>
            <h3 class="subtitle is-4">Knowledge Planet</h3>
        </div>
        <div class="header-right">

            <template v-if="isLogin">
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
                 title="修改密码"
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
        }
    },
    created() {
        this.isLogin = this.$store.getters.isLogin
        if (this.isLogin) {
            this.initLogoutBox();
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
                            token: this.$store.state.token
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

<style scoped>
.header {
    padding: 5px 20px;
    height: 50px;
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
</style>