<template>
<a-layout class="full-height">
    <global-header>

    </global-header>
    <a-layout>
        <a-layout-content class="main-content">
            <div class="graph-name">{{ graphInfo.name }}</div>
            <a-divider style="background-color: #cad0d5; margin: 10px 0;"></a-divider>
            <div class="center-box">
                <div class="left-sider">
                    <div>{{graphInfo.createTime}}</div>
                    <div>Created by {{graphInfo.username}}</div>
                    <div><a-icon style="margin-right: 5px;" type="eye" />{{graphInfo.views}} views</div>
                    <div>{{graphInfo.description}}</div>
                    <a-button @click="updateGraph" type="primary">Update Graph</a-button>
                </div>

                <div class="main-box">
                    <div id="graph"></div>
                </div>
            </div>

        </a-layout-content>
    </a-layout>
<!--    <div>{{$route.params.id}}</div>-->
    <a-modal dialogClass="form-modal" v-model="visibleUpdateGraph" centered
             title="Update Graph"
             @ok="submitGraphForm('graphForm')" :width="450">
        <a-form-model ref="graphForm" :model="graphForm" :rules="graphRules" layout="horizontal" labelAlign="left"
                      :label-col="{ span: 6 }" :wrapper-col="{ span: 17 }">

            <a-form-model-item label="Name" prop="name">
                <a-input v-model="graphForm.name" placeholder="Graph name"> </a-input>
            </a-form-model-item>
            <a-form-model-item label="Description" prop="description">
                <a-textarea v-model="graphForm.description" placeholder="Graph description"
                            :auto-size="{ minRows: 3, maxRows: 15 }"> </a-textarea>
            </a-form-model-item>
        </a-form-model>
    </a-modal>
</a-layout>
</template>

<script>
export default {
    name: "graph",
    data() {
        return {
            graphInfo: {
                id: 2313,
                name: "Graph 1",
                description: "This is a graph.",
                createTime: "2022.7.20",
                updatedTime: "2022.8.20",
                views: 23,
                username: "Eric",
                userId: 23
            },
            graph: '',

            graphForm: {
                name: '',
                description: ''
            },
            graphRules: {
                name: [
                    { required: true, message: 'Please input name', trigger: 'change' },
                    { max: 100, message: 'Name too long', trigger: 'change' }
                ],
                description: [

                ]
            },

            nodes: [
                {
                    name: 'node 1',
                    content: "hhh, this is content."
                },
                {
                    name: 'node 2',
                    content: "hhh, this is content."
                },
                {
                    name: 'node 3',
                    content: "hhh, this is content."
                },
            ],

            rels: [
                {
                    source: "node 1",
                    target: "node 2",
                    relationship: "have"
                },
                {
                    source: "node 2",
                    target: "node 3",
                    relationship: "father"
                },
            ],

            visibleUpdateGraph: false
        }
    },
    created() {
        this.initGraphData();
    },
    mounted() {
        this.initGraph();
    },
    methods: {
        initGraphData() {

        },
        initGraph() {
            this.graph = this.$echarts.init(document.getElementById('graph'));
            this.graph.showLoading();
            this.graph.setOption({
                // legend : {
                //     type : 'plain',
                //     show : true,
                //     orient : 'vertical',
                //     right : 10,
                //     top : 20,
                //     bottom : 20,
                //     data : cats,
                // },
                backgroundColor : '#FAFAFA',
                animationDurationUpdate : 0,
                animationEasingUpdate : 'quinticInOut',
                tooltip: {
                    show: true,
                    triggerOn: 'click',
                    enterable: true,
                    confine: true,
                    extraCssText: 'width: 300px; white-space: pre-wrap;box-shadow: 0 0 6px rgba(0, 0, 0, 0.4);',
                    formatter: (param) => {
                        if (this.nodes[param.dataIndex].content != null){
                            return "<h5>"+param.name+"</h5>"+this.nodes[param.dataIndex].content;
                        }
                    },
                    backgroundColor: '#f8f9fa',
                    textStyle: {
                        color: '#323030'
                    },
                    padding: 10
                },
                toolbox: {
                    feature: {
                        saveAsImage: {}
                    }
                },
                series : [ {
                    type : 'graph',
                    layout : 'force',
                    symbolSize : 55,
                    label : {
                        show : true
                    },
                    focusNodeAdjacency : true,
                    edgeSymbol : [ 'none', 'none' ],
                    edgeSymbolSize : [ 2, 10 ],
                    edgeLabel: {
                        show: true,
                        formatter: (param) => {
                            return this.rels[param.dataIndex].relationship;
                        },
                        fontSize: 15
                    },
                    force : {
                        repulsion : 2500,
                        edgeLength : [ 10, 50 ],
                        layoutAnimation : false
                    },
                    roam : true,
                    itemStyle : {
                        borderColor : '#fff',
                        borderWidth : 1,
                        shadowBlur : 10,
                        shadowColor : 'rgba(0, 0, 0, 0.3)'
                    },
                    lineStyle : {
                        color : 'source',
                        width : 2,
                        curveness : 0
                    },
                    emphasis : {
                        lineStyle : {
                            width : 10
                        }
                    },
                    // categories : cats,
                    data : this.nodes,
                    links: this.rels
                } ]
            });
            this.graph.resize();
            window.onresize = () => {
                this.graph.resize();
            }
            this.graph.hideLoading();
        },

        updateGraph() {
            this.graphForm = {
                id: this.graphInfo.id,
                name: this.graphInfo.name,
                description: this.graphInfo.description
            }
            this.visibleUpdateGraph = true;
        },
        submitGraphForm(formName) {
            this.$refs[formName].validate(valid => {
                if (valid) {
                    let params = {
                        id: this.graph.id,
                        name: this.graphForm.name,
                        description: this.graphForm.description
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
    },


}
</script>

<style scoped>
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
    flex-direction: column;
    justify-content: start;
}
.main-content .graph-name {
    font-size: 25px;
    font-weight: normal;
}
.main-content .center-box {
    display: flex;
    justify-content: space-around;
}
.center-box .left-sider {
    padding: 10px;
    width: 20%;
}
.center-box .left-sider > * {
    margin-bottom: 5px;
}
.center-box .main-box {
    padding-top: 10px;
    width: 76%;
}
#graph {
    width: 95%;
    min-height: 600px;
}
</style>