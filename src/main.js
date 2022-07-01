import Vue from 'vue'
import App from './App.vue'
import router from '@/router'
import store from '@/store'
import Antd from 'ant-design-vue'
import {Modal} from "ant-design-vue";
import 'ant-design-vue/dist/antd.css'
import 'bulma/css/bulma.min.css'
import request from './utils/request'
import '@/components'
import * as echarts from 'echarts'

Vue.config.productionTip = false

Vue.use(Antd);

Vue.prototype.$request = request;
Vue.prototype.$store = store;
Vue.prototype.$modal = Modal;
Vue.prototype.$echarts = echarts;

new Vue({
  store,
  router,
  render: h => h(App),
}).$mount('#app')