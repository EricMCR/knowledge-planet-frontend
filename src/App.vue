<template>
    <a-config-provider :locale="zh_CN">
        <div id="app" @click="handleOperation">
            <router-view></router-view>
        </div>
    </a-config-provider>
</template>

<script>
import zh_CN from 'ant-design-vue/lib/locale-provider/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';
import {mapMutations} from "vuex";

moment.locale('zh-cn');
export default {
    name: 'App',
    data() {
        return {
            zh_CN,

            timeRange: 20 * 60 * 1000,  //超时时长（毫秒）
        }
    },
    components: {

    },
    created() {
        localStorage.setItem('lastClickTime', new Date().getTime().toString());
    },
    methods: {
        ...mapMutations(['removeLogin']),
        handleOperation() {
            let currentClickTime = new Date().getTime();
            if (currentClickTime - parseInt(localStorage.getItem('lastClickTime')) > this.timeRange) {
                let token = localStorage.getItem('token');
                if (token !== null && token !== '') {
                    this.removeLogin();
                    this.$modal.warning({
                        title: '登陆超时，请重新登录',
                        okText: '确 定',
                        centered: true,
                        maskClosable: false,
                        onOk: () => {
                            if (window === window.parent) {
                                location.reload();
                            }else {
                                parent.location.reload();
                            }
                        }
                    })
                }else {
                    localStorage.setItem('lastClickTime', new Date().getTime().toString());
                }
            }else {
                localStorage.setItem('lastClickTime', new Date().getTime().toString());
            }
        }
    }
}
</script>

<style>
html{
    padding: 0;
    margin: 0;
    height: 100%;
    overflow-y: hidden!important;
}
body{
    height: 100%;
    padding: 0;
    margin: 0;
}
#app{
    height: 100%;
    position: relative;
    /*超出内容被修剪隐藏，只显示报表部分，el-table有滚动条，其余的滚动条不需要*/
    overflow: hidden;
}
</style>
