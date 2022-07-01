<template>
    <div :class="pageConfig.className + ' dynamic-table'" ref="dyTable">
        <a-icon class="refresh-button" @click="refresh" type="reload"/>
        <a-spin :spinning="loading">
            <div ref="top" class="table-top">
                <slot name="table-top"></slot>
            </div>

            <div ref="query" v-if="pageConfig.query && pageConfig.query.queryList.length" class="query-box">
                <a-form layout="inline" labelAlign="left">

                    <a-form-item v-for="item in pageConfig.query.queryList" :label="item.label" :key="item.key">
                        <a-input v-if="item.type === 'text'" v-model="queryData[item.key]" placeholder="请输入"
                                 allowClear/>
                        <a-input v-else-if="item.type === 'number'" v-model="queryData[item.key]" placeholder="请输入"
                                 type="number" @keydown.native="keyRules" allowClear/>
                        <a-select v-else-if="item.type === 'select'" v-model="queryData[item.key]" placeholder="请选择"
                                  style="width: 174px;" allowClear>
                            <a-select-option v-for="option in item.options" :key="option.value" :value="option.value">
                                {{ option.label }}
                            </a-select-option>
                        </a-select>
                        <a-slider v-else-if="item.type === 'range'" v-model="queryData[item.key]" range
                                  :default-value="item.defaultValue" :max="item.max" :min="item.min"
                                  style="width: 150px;"/>
                    </a-form-item>

                    <a-form-item class="query-button-container">
                        <a-button @click="resetQuery">重置</a-button>
                        <a-button type="primary" @click="queryPage">查询</a-button>
                        <slot name="query-button"></slot>
                    </a-form-item>
                </a-form>
            </div>

            <a-icon slot="indicator" type="loading" style="font-size: 30px" spin/>
            <a-table class="table" :data-source="tableData" :bordered="true" rowKey="id" :pagination="false"
                     :scroll="{x: tableWidth-60, y: tableHeight}" :style="'max-width: ' + (tableWidth+21) + 'px;'">
                <a-table-column v-for="item in pageConfig.columns" :key="item.key" :title="item.title"
                                :data-index="item.key" :width="item.width" :fixed="item.fixed">
                    <template slot-scope="value, scope">
                        <span v-if="!item.type || item.type === ''">{{ value }}</span>
                        <template v-else-if="item.type === 'tag'">
                            <template v-if="Array.isArray(value)">
                                <a-tag v-for="tag in value" :key="tag"
                                       :color="item.color ? (typeof item.color === 'function'? item.color(scope) : item.color) : 'blue'">
                                    {{ tag }}
                                </a-tag>
                            </template>
                            <a-tag v-else
                                   :color="item.color ? (typeof item.color === 'function'? item.color(scope) : item.color) : 'blue'">
                                {{ value }}
                            </a-tag>
                        </template>
                        <template v-else-if="item.type === 'rate'">
                            <a-rate :default-value="value" disabled/>
                            <!--                            <span class="ant-rate-text">{{ value }}</span>-->
                        </template>

                    </template>
                </a-table-column>

                <a-table-column class="handle-container" v-if="pageConfig.handle" :title="pageConfig.handle.title"
                                :width="pageConfig.handle.width" key="handle" :fixed="pageConfig.handle.fixed">
                    <template slot-scope="scope">
                        <template v-for="btn in pageConfig.handle.btns">
                            <a-button v-if="!btn.ifRender || btn.ifRender(scope, store)" class="handle-btn"
                                      :size="pageConfig.handle.size" :key="btn.event" :type="btn.type" :icon="btn.icon"
                                      @click="handleClick(btn.event, scope)">
                                {{ btn.label }}
                            </a-button>
                        </template>

                    </template>

                </a-table-column>
            </a-table>
            <div class="pagination-container">
                <a-pagination show-size-changer show-quick-jumper :show-total="total => `共 ${total} 条`"
                              :current="currentPage" :total="totalCount" :page-size="pageSize"
                              @showSizeChange="handleSizeChange" @change="handleCurrentChange"/>
            </div>
        </a-spin>

    </div>
</template>

<script>
export default {
    name: "dynamic-table",
    props: {
        //表格配置（className：自定义类名，columns：表格列配置，query：查询项配置，handle：操作栏配置）
        pageConfig: {
            type: Object,
            default: () => {
            }
        },
        //格式化data
        formatData: {
            type: Function,
            default: v => v
        }
    },
    created() {
        this.store = this.$store.state;
        if (this.pageConfig.requestOptions) {
            const {url, method, params} = this.pageConfig.requestOptions;
            this.initData(url, method, params);
        }
    },
    mounted() {
        this.tableHeight = this.$refs.dyTable.clientHeight - (this.$refs.query ? this.$refs.query.clientHeight : 0) - (this.$refs.top ? this.$refs.top.clientHeight : 0) - 120;
        this.pageConfig.columns.forEach(item => {
            if (item.width) {
                this.tableWidth += item.width;
            }
        })
        if (this.pageConfig.handle && this.pageConfig.handle.width) {
            this.tableWidth += this.pageConfig.handle.width;
        }
    },
    data() {
        return {
            store: {},
            data: [],
            queryData: {}, //查询输入框绑定值
            queryParams: {}, //当前查询条件
            currentPage: 1,
            totalCount: 0,
            pageSize: 10,

            loading: true,

            tableWidth: 0,
            tableHeight: 0
        }
    },
    computed: {
        tableData() {
            return this.formatData(this.data)
        }
    },
    methods: {
        handleCurrentChange(page, pageSize) {
            this.currentPage = page;
            this.pageSize = pageSize;
            this.initData();
        },
        handleSizeChange(page, pageSize) {
            this.currentPage = page;
            this.pageSize = pageSize;
            this.initData();
        },
        handleClick(event, row) {
            this.$emit('handleClick', event, row);
        },
        refresh() {
            this.initData();
        },
        async initData() {
            this.loading = true;
            const {url, method, params} = this.pageConfig.requestOptions;
            let entireParams = {
                page: this.currentPage,
                pageSize: this.pageSize
            }
            Object.assign(entireParams, params);
            Object.assign(entireParams, this.queryParams);
            this.$request({
                url: url,
                method: method,
                data: entireParams
            }).then(res => {
                if (res.data.success) {
                    res.data.data.forEach(item => {
                        for (let data in item) {
                            if (!item[data] || item[data] === 'null') {
                                item[data] = '';
                            }
                        }
                        return item;
                    })
                    this.data = res.data.data;
                    this.totalCount = res.data.data.totalCount;
                    this.loading = false;
                } else if (res.data.status === 403) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                    this.$modal.warning({
                        title: '登陆超时，请重新登录',
                        okText: '确 定',
                        centered: true,
                        maskClosable: false,
                        onOk: () => {
                            parent.location.reload();
                        }
                    })
                }
            }).catch(error => {
                this.$message.error("服务器错误，请稍后再试（错误代码:"+error.response.status+"）")
                this.loading = false;

            })
        },
        //查询
        queryPage() {
            let queryParams = this.queryData;
            for (let item in queryParams) {
                if (queryParams[item] === '') {
                    delete queryParams[item];
                }
            }
            this.queryParams = queryParams;
            this.initData();
        },
        //重置查询条件
        resetQuery() {
            this.queryData = {};
            this.queryParams = {};
            this.currentPage = 1;
            this.refresh();
        },
        keyRules(e) {
            if (e.key == 'e' || e.key == 'E' || e.key == '+' || e.key == '-' || e.key == '.') {
                e.returnValue = false;
            }
        }
    }
}
</script>

<style>
.dynamic-table {
    height: 100vh;
}

.table-top {
    padding: 5px 10px;
}

.table {
    padding: 5px 10px;
    margin-bottom: 0 !important;
    /*max-height: calc(100vh - 90px);*/
    /*overflow-y: auto;*/
}

.table table {
    border-bottom: 1px solid #e8e8e8 !important;
}

.table .ant-table-body, .ant-table-body-inner {
    overflow: auto !important;
}

.table .ant-table-placeholder {
    height: calc(100vh - 170px);
}

.table .ant-rate .ant-rate-star {
    margin-right: 1px;
}

.refresh-button {
    position: fixed;
    right: 2px;
    top: 2px;
    font-size: 18px;
    color: dimgray;
    z-index: 2;
}

.handle-btn {
    margin-right: 5px;
    margin-bottom: 5px;
}

.pagination-container {
    width: 100%;
    position: fixed;
    bottom: 5px;
    display: flex;
    justify-content: center;
    z-index: 1;
}

.query-box {
    padding: 0px 10px;
    width: 100%;
}

.query-button-container button {
    margin-right: 7px;
}

.dynamic-table .query-box input::-webkit-outer-spin-button,
.dynamic-table .query-box input::-webkit-inner-spin-button {
    -webkit-appearance: none;
}

.dynamic-table .query-box input[type="number"] {
    -moz-appearance: textfield;
}
</style>