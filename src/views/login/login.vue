<template>
    <section class="main-box hero is-medium is-primary is-bold">
        <div class="hero-body">
            <div class="columns title-box" @click="$router.push('/homePage')">
                <img src="../../assets/logo.png" width="40" height="40"/>
                <div style="border-left: 2px solid; margin-left: 20px; padding-left: 20px;">
                    <h2 class="title 3">Knowledge Planet</h2>
                </div>
            </div>
            <div class="card login-box">
                <h1 class="title is-4 container" style="width: fit-content; color: hsl(0, 0%, 29%);">Sign in</h1>
                <a-form-model ref="form" :model="form" :rules="rules">
                    <a-form-model-item prop="username">
                        <a-input type="text" v-model="form.username" placeholder="Username" @keydown.native="keyRules"
                                 :maxLength="11">
                            <a-icon slot="prefix" type="user" style="color: rgba(0,0,0,.25)"/>
                        </a-input>
                    </a-form-model-item>
                    <a-form-model-item prop="password">
                        <a-input-password v-model="form.password" placeholder="Password">
                            <a-icon slot="prefix" type="lock" style="color: rgba(0,0,0,.25)"/>
                        </a-input-password>
                    </a-form-model-item>
                    <a-form-model-item>
                        <a-checkbox v-model="rememberMe">Remember me</a-checkbox>
                        <a style="float: right; margin-right: 10px;" @click="$router.push('/register')">Sign up</a>
                        <a-button type="primary" :loading="loading" style="width: 100%; margin-top: 15px;"
                                  @click="submit('form')">Sign in
                        </a-button>
                    </a-form-model-item>
                </a-form-model>

            </div>
        </div>

    </section>
</template>

<script>
import {mapMutations} from 'vuex'
import Cookie from 'js-cookie'

export default {
    name: "login",
    data() {
        return {
            form: {
                username: '',
                password: ''
            },
            rules: {
                username: [
                    {required: true, message: 'Please input username', trigger: 'change'},
                    {min: 4, message: 'Minimum 4 digits', trigger: 'change'}
                ],
                password: [
                    {required: true, message: 'Please input password', trigger: 'change'}
                ],
            },
            rememberMe: false,
            loading: false
        }
    },
    created() {
        //用户上次登录选择记住我时，使用cookie数据
        if (Cookie.get('username') && Cookie.get('password') && Cookie.get('rememberMe')) {
            this.form.username = Cookie.get('username');
            this.form.password = Cookie.get('password');
            this.rememberMe = (Cookie.get('rememberMe') === 'true');
        }
    },
    methods: {
        ...mapMutations(['changeLogin', 'updateState']),
        submit(formName) {
            this.$refs[formName].validate(valid => {
                if (valid) {
                    this.loading = true;
                    this.$request({
                        url: '/user/login',
                        method: 'POST',
                        data: {
                            username: this.form.username,
                            password: this.form.password
                        }
                    }).then(res => {
                        this.loading = false;
                        if (!res.data.success) {
                            this.$message.warning(res.data.desc);
                        } else {
                            this.$message.success("Sign in successfully")
                            if (this.rememberMe) {
                                this.rememberLoginInfo();
                            } else {
                                this.removeLoginInfo();
                            }
                            this.changeLogin({
                                token: res.data.data.token,
                                userInfo: res.data.data.userInfo
                            });
                            this.updateState();
                            this.$router.push('/homePage');

                        }
                    })
                }
            })
        },
        //记住用户登录信息
        rememberLoginInfo() {
            Cookie.set('username', this.form.username, {expires: 7});
            Cookie.set('password', this.form.password, {expires: 7});
            Cookie.set('rememberMe', this.rememberMe, {expires: 7});
        },
        //删除用户登录信息
        removeLoginInfo() {
            Cookie.remove('username');
            Cookie.remove('password');
            Cookie.remove('rememberMe');
        },
        keyRules(e) {
            let patt = /[`~!@#$%^&*()_\-+=<>?:"{}|,./;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘'，。、]/im
            if (patt.test(e.key)) {
                e.returnValue = false;
            }
            // if (e.key == 'e' || e.key == 'E' || e.key == '+' || e.key == '-' || e.key == '.') {
            //     e.returnValue = false;
            // }
        },
        forgetPwd() {
            this.$message.warning("Please contact system manager");
        }
    }
}
</script>

<style>
.main-box {
    min-height: 100%;
    width: 100%;
}

.main-box .title-box {
    margin: 0 auto;
    padding-bottom: 10px;
    width: 400px;
    height: 50px;
    cursor: pointer;
}

.main-box .login-box {
    margin: 0 auto;
    padding: 30px;
    width: 450px;
}

.main-box .login-box input::-webkit-outer-spin-button,
.main-box .login-box input::-webkit-inner-spin-button {
    -webkit-appearance: none;
}

.main-box .login-box input[type="number"] {
    -moz-appearance: textfield;
}
</style>