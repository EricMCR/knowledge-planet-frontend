import Vue from 'vue'

import DyTable from './dynamic-table/dynamic-table.vue'
import ChartsPage from './charts-page/chartsPage.vue'
import GlobalHeader from "@/components/global-header/global-header";

Vue.component('dynamic-table', DyTable)
Vue.component('charts-page', ChartsPage);
Vue.component('global-header', GlobalHeader)