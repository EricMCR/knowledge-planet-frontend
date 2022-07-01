<template>
    <div class="charts-page">
        <a-icon class="refresh-button" @click="refresh" type="reload"/>
        <a-row :gutter="[16, 16]" style="height: 35%;">
            <a-col :span="12">
                <div class="col-item">
                    <a-card>
                        <a-card-meta :title="userInfo.name">
                            <a-avatar
                                slot="avatar"
                                src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                            />
                            <!--                            <a-avatar-->
                            <!--                                slot="avatar"-->
                            <!--                                :style="{ backgroundColor: color, verticalAlign: 'middle' }">-->
                            <!--                                {{userInfo.name[0]}}-->
                            <!--                            </a-avatar>-->
                            <template slot="description">
                                <a-descriptions :column="1">
                                    <a-descriptions-item label="角色">
                                        {{ userInfo.authName }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="性别">
                                        {{ userInfo.sex }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="年龄">
                                        {{ userInfo.age }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="手机号">
                                        {{ userInfo.phone }}
                                    </a-descriptions-item>
                                </a-descriptions>

                            </template>
                        </a-card-meta>
                    </a-card>
                </div>
            </a-col>
            <a-col :span="12">
                <div class="col-item">
                    <a-card>
                        <a-spin :spinning="loading">
                            <a-icon slot="indicator" type="loading" style="font-size: 30px" spin/>

                            <a-statistic title="今日订单量" :value="todayData.orderNum"/>
                            <a-statistic title="今日完成总金额 (CNY)" :precision="2" :value="todayData.totalMoney"/>
                            <a-statistic
                                title="今日新增客户数"
                                :value="todayData.userNum"
                                :value-style="{ color: '#3f8600' }"
                                style="margin-right: 50px"
                            >
                                <template #prefix>
                                    <a-icon type="arrow-up"/>
                                </template>
                            </a-statistic>
                        </a-spin>

                    </a-card>


                </div>
            </a-col>
        </a-row>
        <a-row :gutter="[16, 16]" style="height: 65%;">
            <a-col :span="12">
                <div id="chart1" class="col-item"></div>
            </a-col>
            <a-col :span="12">
                <div id="chart2" class="col-item"></div>
            </a-col>
        </a-row>

    </div>
</template>

<script>
import {mapMutations} from "vuex";

export default {
    name: "chartsPage",
    data() {
        return {
            userInfo: {
                age: '',
                auth: '',
                authName: "",
                id: '',
                idCard: '',
                name: "",
                phone: "",
                sex: "",
            },
            todayData: {
                orderNum: '',
                totalMoney: '',
                userNum: ''
            },
            weekOrders: [],
            driverOrders: [],

            chart1: '',
            chart2: '',

            color: '#f56a00',
            colorList: ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae'],
            loading: true
        }
    },
    created() {
        this.initUserData();
        this.initData();
    },
    mounted() {
        this.chart1 = this.$echarts.init(document.getElementById('chart1'));
        this.chart1.showLoading();
        this.chart2 = this.$echarts.init(document.getElementById('chart2'));
        this.chart2.showLoading();
        this.chart2.setOption({
            title: {
                text: '近一月代驾接单量TOP7'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'line'
                }
            },
            xAxis: {
                data: []
            },
            yAxis: {
                minInterval: 1
            },
            series: [{
                name: '接单量',
                type: 'bar',
                data: []
            }]
        });
        this.chart1.setOption({
            title: {
                text: '近一周内订单量'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'line'
                }
            },
            xAxis: {
                type: 'category',
                data: this.getOneWeekDate()
            },
            yAxis: {
                type: 'value',
                minInterval: 1
            },
            series: [{
                name: '订单量',
                data: [],
                type: 'line'
            }]
        });
        this.chart1.resize();
        this.chart2.resize();
        window.onresize = () => {
            this.chart1.resize();
            this.chart2.resize();
        }
    },
    methods: {
        ...mapMutations(['removeLogin']),
        refresh() {
            this.loading = true;
            this.chart1.showLoading();
            this.chart2.showLoading();
            this.initUserData();
            this.initData();
        },
        //加载用户信息数据
        initUserData() {
            this.userInfo = this.$store.getters.getUserInfo;
        },
        //加载图表数据
        initData() {
            this.$request({
                url: '/homePage/getData',
                method: 'POST',
                data: {}
            }).then(res => {
                if (res.data.status == '200') {
                    this.todayData = {
                        orderNum: res.data.data.orderNum,
                        totalMoney: res.data.data.totalMoney,
                        userNum: res.data.data.userNum
                    }
                    this.loading = false;
                    this.weekOrders = res.data.data.weekOrders;
                    this.driverOrders = res.data.data.driverOrders;
                    this.initChart();
                } else if (res.data.status == '403') {
                    this.removeLogin();
                    this.$modal.warning({
                        title: '登陆超时，请重新登录',
                        okText: '确 定',
                        centered: true,
                        maskClosable: false,
                        onOk: () => {
                            parent.location.reload();
                        }
                    })
                } else {
                    this.$message.warning(res.data.desc);
                }
            }).catch(error => {
                this.$message.error("服务器错误，请稍后再试（错误代码:" + error.response.status + "）")
                this.loading = false;

            })
        },
        //获取一周内日期列表
        getOneWeekDate() {
            let dateList = [];
            const now = new Date();
            for (let i = 6; i >= 0; i--) {
                let day = new Date();
                day.setTime(now.getTime() - 24 * 3600 * 1000 * i);
                dateList.push('' + (day.getMonth() + 1) + '-' + day.getDate());
            }
            return dateList;
        },
        initChart() {
            this.chart1.setOption({
                series: [{
                    data: this.weekOrders,
                    type: 'line'
                }]
            });
            this.chart1.hideLoading();

            this.chart2.setOption({
                xAxis: {
                    data: this.driverOrders.map(item => {
                        return item.driverName;
                    })
                },
                series: [{
                    name: '接单量',
                    type: 'bar',
                    data: this.driverOrders.map(item => {
                        return item.orderCount;
                    })
                }]
            });
            this.chart2.hideLoading();
        }
    }
}
</script>

<style scoped>
.charts-page {
    height: 100%;
    padding: 10px;
}

.charts-page .refresh-button {
    position: fixed;
    right: 2px;
    top: 2px;
    font-size: 18px;
    color: dimgray;
    z-index: 2;
}

.charts-page .ant-row {
    /*height: 50%;*/
}

.charts-page .ant-row .ant-col {
    height: 100%;
}

.charts-page .ant-row .ant-col .col-item {
    height: 100%;
    /*background-color: antiquewhite;*/
}

#chart1, #chart2 {
    height: 100%;
}

.charts-page .ant-row .ant-col .col-item .ant-card {
    height: 100%;
}
</style>