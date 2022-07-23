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
                        <div>{{ graphInfo.createTime }}</div>
                        <div>Created by {{ graphInfo.username }}</div>
                        <div>
                            <a-icon style="margin-right: 5px;" type="eye"/>
                            {{ graphInfo.views }} views
                        </div>
                        <div>{{ graphInfo.description }}</div>
                        <a-button @click="updateGraph" type="primary">Update Graph</a-button>
                    </div>

                    <div class="main-box">
                        <div id="graph"></div>
                    </div>
                </div>

            </a-layout-content>
        </a-layout>

        <a-modal dialogClass="form-modal" v-model="visibleUpdateGraph" centered
                 title="Update Graph"
                 @ok="submitGraphForm('graphForm')" :width="450">
            <a-form-model ref="graphForm" :model="graphForm" :rules="graphRules" layout="horizontal" labelAlign="left"
                          :label-col="{ span: 6 }" :wrapper-col="{ span: 17 }">

                <a-form-model-item label="Name" prop="name">
                    <a-input v-model="graphForm.name" placeholder="Graph name"></a-input>
                </a-form-model-item>
                <a-form-model-item label="Description" prop="description">
                    <a-textarea v-model="graphForm.description" placeholder="Graph description"
                                :auto-size="{ minRows: 3, maxRows: 15 }"></a-textarea>
                </a-form-model-item>
            </a-form-model>
        </a-modal>

        <a-modal dialogClass="form-modal" v-model="visibleEditNode" centered
                 title="Edit Node"
                 @ok="submitNodeForm('nodeForm')" :width="450">
            <a-form-model ref="nodeForm" :model="nodeForm" :rules="nodeRules" layout="horizontal" labelAlign="left"
                          :label-col="{ span: 6 }" :wrapper-col="{ span: 17 }">

                <template v-if="nodeFormType!==1">
                    <a-form-model-item label="Source Node" prop="sourceName">
                        {{nodeForm.sourceName}}
                    </a-form-model-item>
                    <a-form-model-item label="Relationship" prop="relationship">
                        <a-input v-model="nodeForm.relationship" placeholder="Relationship"></a-input>
                    </a-form-model-item>
                </template>

                <a-form-model-item label="Name" prop="name">
                    <a-input v-model="nodeForm.name" placeholder="Node name"></a-input>
                </a-form-model-item>
                <a-form-model-item label="Content" prop="content">
                    <a-textarea v-model="nodeForm.content" placeholder="Node content"
                                :auto-size="{ minRows: 3, maxRows: 15 }"></a-textarea>
                </a-form-model-item>
            </a-form-model>
        </a-modal>

        <a-modal dialogClass="node-modal" v-model="visibleNodeInfo" :width="450"
            centered :closable="false">
            <template slot="title">
                <div v-if="!nodeInfoEditable">{{nodeInfo.name}}</div>
                <a-input v-else v-model="nodeUpdateForm.name" placeholder="Please input name"></a-input>
            </template>
            <div v-if="!nodeInfoEditable">{{nodeInfo.content}}</div>
            <a-textarea v-else v-model="nodeUpdateForm.content" placeholder="Node content"
                        :auto-size="{ minRows: 2, maxRows: 15 }"></a-textarea>
            <template slot="footer">
                <a-popconfirm title="Are you sure delete this node?" ok-text="Yes" cancel-text="No"
                    @confirm="deleteNode">
                    <a-button icon="delete" type="danger"></a-button>
                </a-popconfirm>
                <a-button v-if="!nodeInfoEditable" icon="edit" @click="handleNodeEdit"></a-button>
                <a-button v-else icon="check" @click="handleNodeUpdate"></a-button>
                <a-button icon="plus-square" @click="handleAppendNode"></a-button>
            </template>
        </a-modal>

        <a-modal dialogClass="relation-modal" v-model="visibleRelationInfo" :width="450"
                 centered :closable="false">
            <template slot="title">
                <div v-if="!relationInfoEditable">{{relationInfo.relationship}}</div>
                <a-input v-else v-model="relationUpdateForm.relationship" placeholder="Please input relationship"></a-input>
            </template>
            <a-form-model ref="relationForm" :model="relationInfo" :rules="relationRules" layout="horizontal" labelAlign="left"
                          :label-col="{ span: 6 }" :wrapper-col="{ span: 17 }">
                <a-form-model-item label="Source Node" prop="sourceName">
                    {{relationInfo.sourceName}}
                </a-form-model-item>
                <a-form-model-item label="Target Node" prop="sourceName">
                    {{relationInfo.targetName}}
                </a-form-model-item>
            </a-form-model>
            <template slot="footer">
                <a-button v-if="!relationInfoEditable" icon="edit" @click="handleRelationEdit"></a-button>
                <a-button v-else icon="check" @click="handleRelationUpdate"></a-button>
            </template>
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
                    {required: true, message: 'Please input name', trigger: 'change'},
                    {max: 100, message: 'Name too long', trigger: 'change'}
                ],
                description: []
            },

            nodes: [],

            rels: [],

            visibleUpdateGraph: false,


            nodeForm: {
                name: '',
                content: '',
                source: '',
                sourceName: '',
                relationship: ''
            },
            nodeRules: {
                name: [
                    {required: true, message: 'Please input name', trigger: 'change'},
                    {max: 100, message: 'Name too long', trigger: 'change'}
                ],
                content: [],
                relationship: [
                    {required: true, message: 'Please input relationship', trigger: 'change'}
                ]
            },

            visibleEditNode: false,
            nodeFormType: 1,  //1-create without source, 2-update or create with a source node


            nodeInfo: {
                content: "",
                createTime: "",
                graphId: 0,
                id: 0,
                isDelete: 0,
                name: "",
                updateTime: ""
            },
            nodeUpdateForm: {
                content: "",
                createTime: "",
                graphId: 0,
                id: 0,
                isDelete: 0,
                name: "",
                updateTime: ""
            },
            visibleNodeInfo: false,
            nodeInfoEditable: false,

            visibleRelationInfo: false,
            relationInfoEditable: false,
            relationInfo: {
                createTime: "",
                graphId: 0,
                id: 0,
                isDelete: 0,
                relationship: "",
                source: "",
                sourceName: "",
                target: "",
                targetName: "",
                updateTime: ""
            },
            relationRules: {
                name: [
                    {required: true, message: 'Please input relationship', trigger: 'change'}
                ]
            },
            relationUpdateForm: {
                relationship: ''
            }
        }
    },
    created() {
        this.initGraphInfo();
        this.initGraphData();
    },
    mounted() {
        this.initGraph();
    },
    methods: {
        initGraphInfo() {
            this.$request({
                url: '/graph/getGraphById',
                method: 'POST',
                data: {
                    id: this.$route.params.id
                },
            }).then(res => {
                if (!res.data.success) {
                    this.$message.warning(res.data.desc);
                } else {
                    this.graphInfo = res.data.data;
                }
            })
        },
        initGraphData() {
            this.$request({
                url: '/graph/getGraphData',
                method: 'POST',
                data: {
                    id: this.$route.params.id
                },
            }).then(res => {
                if (!res.data.success) {
                    this.$message.warning(res.data.desc);
                } else {
                    this.nodes = res.data.data.nodes;
                    this.rels = res.data.data.relations;
                    this.graph.setOption({
                        series: [{
                            type: 'graph',
                            layout: 'force',
                            symbolSize: 55,
                            label: {
                                show: true
                            },
                            focusNodeAdjacency: true,
                            edgeSymbol: ['none', 'none'],
                            edgeSymbolSize: [2, 10],
                            edgeLabel: {
                                show: true,
                                formatter: (param) => {
                                    return param.data.relationship;
                                },
                                fontSize: 15
                            },
                            force: {
                                repulsion: 2500,
                                edgeLength: [10, 50],
                                layoutAnimation: false
                            },
                            roam: true,
                            itemStyle: {
                                borderColor: '#fff',
                                borderWidth: 1,
                                shadowBlur: 10,
                                shadowColor: 'rgba(0, 0, 0, 0.3)'
                            },
                            lineStyle: {
                                color: 'source',
                                width: 2,
                                curveness: 0
                            },
                            emphasis: {
                                lineStyle: {
                                    width: 10
                                }
                            },
                            // categories : cats,
                            data: this.nodes,
                            links: this.rels
                        }]
                    })
                    this.graph.hideLoading();
                }
            })
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
                backgroundColor: '#FAFAFA',
                animationDurationUpdate: 0,
                animationEasingUpdate: 'quinticInOut',
                toolbox: {
                    feature: {
                        myToolNewNode: {
                            show: true,
                            title: 'New node',
                            icon: 'path://M511.637489 1024.00002c-282.362169 0-511.259142-228.896973-511.259142-511.259142S229.276343 1.482758 511.637489 1.482758s511.259142 228.896973 511.259142 511.259142S793.999658 1024.00002 511.637489 1024.00002zM511.637489 33.43671c-264.714278 0-479.30519 214.590913-479.30519 479.30519s214.590913 479.30519 479.30519 479.30519 479.30519-214.590913 479.30519-479.30519S776.351767 33.43671 511.637489 33.43671zM543.591441 768.370449l-63.906882 0L479.68456 544.69483 256.008941 544.69483l0-63.906882 223.675619 0L479.68456 257.112329l63.906882 0 0 223.675619 223.675619 0 0 63.906882L543.591441 544.69483 543.591441 768.370449z',
                            onclick: () => {
                                this.createNode()
                            }
                        },
                        saveAsImage: {
                            title: 'Save as image'
                        }
                    }
                }
            });
            this.graph.on('click', (params) => {
                if (params.dataType === 'node') {
                    this.nodeInfo = params.data;
                    this.visibleNodeInfo = true;
                }
                if (params.dataType === 'edge') {
                    this.relationInfo = params.data;
                    this.relationInfo.sourceName = this.getNodeNameById(this.relationInfo.source);
                    this.relationInfo.targetName = this.getNodeNameById(this.relationInfo.target);
                    this.visibleRelationInfo = true;
                }

            });
            this.graph.resize();
            window.onresize = () => {
                this.graph.resize();
            }
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
                        id: this.graphInfo.id,
                        name: this.graphForm.name,
                        description: this.graphForm.description
                    };

                    console.log()
                    this.$request({
                        url: '/graph/update',
                        method: 'POST',
                        data: params
                    }).then(res => {
                        if (res.data.success) {
                            this.visibleUpdateGraph = false;
                            this.$message.success("Update successfully")
                            this.initGraphInfo();
                        } else {
                            this.$message.warn(res.data.desc)
                        }
                    })
                }
            })
        },
        createNode() {
            this.nodeForm = {
                name: '',
                content: '',
                source: '',
                sourceName: '',
                relationship: ''
            }
            this.nodeFormType = 1;
            this.visibleEditNode = true;
        },
        submitNodeForm(formName) {
            this.$refs[formName].validate(valid => {
                if (valid) {
                    let params = {
                        name: this.nodeForm.name,
                        content: this.nodeForm.content,
                        graphId: this.graphInfo.id,
                        source: this.nodeForm.source,
                        relationship: this.nodeForm.relationship
                    };

                    this.$request({
                        url: '/node/create',
                        method: 'POST',
                        data: params
                    }).then(res => {
                        if (res.data.success) {
                            this.visibleEditNode = false;
                            this.visibleNodeInfo = false;
                            this.graph.showLoading();
                            this.$message.success("Update successfully")
                            this.initGraphData();
                        } else {
                            this.$message.warn(res.data.desc)
                        }
                    })
                }
            })
        },
        deleteNode() {
            this.$request({
                url: '/node/delete',
                method: 'POST',
                data: this.nodeInfo
            }).then(res => {
                if (res.data.success) {
                    this.visibleNodeInfo = false;
                    this.nodeInfoEditable = false;
                    this.$message.success("Delete successfully")
                    this.graph.showLoading();
                    this.initGraphData();
                } else {
                    this.$message.warn(res.data.desc)
                }
            })
        },
        handleNodeEdit() {
            this.nodeUpdateForm = {
                content: this.nodeInfo.content,
                createTime: this.nodeInfo.createTime,
                graphId: this.nodeInfo.graphId,
                id: this.nodeInfo.id,
                isDelete: this.nodeInfo.isDelete,
                name: this.nodeInfo.name,
                updateTime: this.nodeInfo.updateTime
            }
            this.nodeInfoEditable = true;
        },
        handleNodeUpdate() {
            if (this.nodeInfo.name === this.nodeUpdateForm.name
            && this.nodeInfo.content === this.nodeUpdateForm.content) {
                this.nodeInfoEditable = false;
            }else {
                this.$request({
                    url: '/node/update',
                    method: 'POST',
                    data: this.nodeUpdateForm
                }).then(res => {
                    if (res.data.success) {
                        this.nodeInfo = res.data.data;
                        this.nodeInfoEditable = false;
                        this.$message.success("Update successfully")
                        this.graph.showLoading();
                        this.initGraphData();
                    } else {
                        this.$message.warn(res.data.desc)
                    }
                })
            }

        },
        handleAppendNode() {
            this.nodeForm = {
                name: '',
                content: '',
                source: '',
                sourceName: '',
                relationship: ''
            }
            this.nodeForm.source = this.nodeInfo.id;
            this.nodeForm.sourceName = this.nodeInfo.name;
            this.nodeFormType = 2;
            this.visibleEditNode = true;
        },
        handleRelationEdit() {
            this.relationUpdateForm.relationship = this.relationInfo.relationship;
            this.relationInfoEditable = true;
        },
        handleRelationUpdate() {
            if (this.relationUpdateForm.relationship === this.relationInfo.relationship) {
                this.relationInfoEditable = false;
            }else {
                let params = {
                    id: this.relationInfo.id,
                    relationship: this.relationUpdateForm.relationship
                }
                this.$request({
                    url: '/relation/update',
                    method: 'POST',
                    data: params
                }).then(res => {
                    if (res.data.success) {
                        this.relationInfo = res.data.data;
                        this.relationInfo.sourceName = this.getNodeNameById(this.relationInfo.source);
                        this.relationInfo.targetName = this.getNodeNameById(this.relationInfo.target);
                        this.relationInfoEditable = false;
                        this.$message.success("Update successfully")
                        this.graph.showLoading();
                        this.initGraphData();
                    } else {
                        this.$message.warn(res.data.desc)
                    }
                })
            }
        },
        getNodeNameById(id) {
            const node = this.nodes.find((node) => {
                return node.id.toString() === id;
            })
            return node.name;
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

.main-box .graph-tools {
    position: relative;
    background-color: #42b983;
    width: 200px;
    height: 60px;
    z-index: 5;
}
</style>