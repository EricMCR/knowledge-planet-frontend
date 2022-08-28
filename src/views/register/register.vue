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
                <h1 class="title is-4 container" style="width: fit-content; color: hsl(0, 0%, 29%);">Sign up</h1>
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
                    <a-form-model-item prop="checkPassword">
                        <a-input-password v-model="form.checkPassword" placeholder="Check Password">
                            <a-icon slot="prefix" type="lock" style="color: rgba(0,0,0,.25)"/>
                        </a-input-password>
                    </a-form-model-item>
                    <a-form-model-item>
                        <a-button type="primary" :loading="loading" style="width: 100%; margin-top: 15px;"
                                  @click="submit('form')">Sign up
                        </a-button>
                        <a style="margin-left: 5px;" @click="$router.push('/login')">Already have an account? Sign in now. </a>
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
    name: "register",
    data() {
        let validateCheckPassword = (rule, value, callback) => {
            if (value !== this.form.password) {
                callback(new Error("Inconsistent passwords"))
            }
            callback();
        }
        return {
            form: {
                username: '',
                password: '',
                checkPassword: ''
            },
            rules: {
                username: [
                    {required: true, message: 'Please input username', trigger: 'change'},
                    {min: 4, message: 'Minimum 4 digits', trigger: 'change'},
                    {max: 20, message: 'Maximum 20 digits', trigger: 'change'}
                ],
                password: [
                    {required: true, message: 'Please input password', trigger: 'change'},
                    {min: 8, message: 'Minimum 8 digits', trigger: 'change'},
                    {max: 30, message: 'Maximum 30 digits', trigger: 'change'}
                ],
                checkPassword: [
                    {validator: validateCheckPassword, trigger: 'change'}
                ]
            },
            loading: false
        }
    },
    created() {

    },
    methods: {
        ...mapMutations(['changeLogin', 'updateState']),
        submit(formName) {
            this.$refs[formName].validate(valid => {
                if (valid) {
                    this.loading = true;
                    this.$request({
                        url: '/user/register',
                        method: 'POST',
                        data: {
                            username: this.form.username,
                            password: this.form.password,
                            checkPassword: this.form.checkPassword
                        }
                    }).then(res => {
                        this.loading = false;
                        if (!res.data.success) {
                            this.$message.warning(res.data.desc);
                        } else {
                            this.$message.success("Sign up successfully")
                            this.$router.push('/login');

                        }
                    })
                }
            })
        },
        // Remember user login information
        rememberLoginInfo() {
            Cookie.set('username', this.form.username, {expires: 7});
            Cookie.set('password', this.form.password, {expires: 7});
            Cookie.set('rememberMe', this.rememberMe, {expires: 7});
        },
        // Delete user login information
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