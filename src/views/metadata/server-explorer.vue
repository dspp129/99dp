<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Spin fix v-if="loadingPage" size="large"></Spin>
        <Row :gutter="10">
            <Col span="7">
                <Card>
                    <p slot="title" @click="clickServerInfo">{{serverTitle}}</p>
                    <div slot="extra" >
                        <a href="#" @click.prevent="reload">
                            <Icon type="ios-reload" size="20"></Icon>
                        </a>
                        &nbsp;&nbsp;
                        <a href="#" @click.prevent="importTable">
                            <Icon type="ios-cloud-download-outline" size="20"></Icon>
                        </a>
                    </div>
                    <Row style="min-height: 394px;">
                        <Spin size="large" fix v-if="reloadingTree"></Spin>
                        <Tree ref="tree" :data="tree" show-checkbox 
                        @on-select-change="selectNode" 
                        @on-toggle-expand="expandNode"
                        ></Tree>
                    </Row>
                </Card>
            </Col>
            <Col span="17">
                <Card>
                    <p slot="title">
                        <Icon type="stats-bars"></Icon>
                        详细信息
                    </p>
                    <Row style="min-height: 394px;">
                        <div v-if="showServerInfo" >
                            <p>show server info</p>
                            <p>广告位常年招租1</p>
                        </div>
                        <div v-if="showDbInfo" >
                            <p>show db info</p>
                            <p>广告位常年招租2</p>
                        </div>

                        <div v-if="showTableInfo" >
                            <Button icon="ios-grid-view" type="success" @click="getSampleData" :loading="loadingSampleData">查看Sample数据</Button>
                            <Button icon="code-working" type="success" @click="getCreateSQL" :loading="loadingCreateSQL">查看建表语句</Button>

                            <Modal
                                v-model="showSQL"
                                title="查看建表语句"
                                scrollable
                                width="auto"
                                class-name="modal-vertical-center">
                                <pre>{{ createTableSQL }}</pre>
                            </Modal>

                            <Modal
                                v-model="showSampleData"
                                title="查看Sample数据"
                                scrollable
                                width="auto"
                                class-name="modal-vertical-center">
                                <Table stripe border :columns="sampleColumns" :data="sampleData" size="small"></Table>
                            </Modal>

                            <Table stripe border :columns="columnList" :data="dataList" size="small" :loading="loadingColumns" class="margin-top-10"></Table>

                        </div>
                    </Row>
                </Card>
            </Col>
        </Row>
    </div>
</template>


<script>
export default {
    name: 'order-info',
    
    data () {
        return {
            serverId: 0,
            serverTitle: '',
            loadingPage: true,
            showServerInfo: true,
            showDbInfo: false,
            showTableInfo: false,
            reloadingTree: false,
            tree: [],
            columnList: [],
            dataList:[],
            showSQL: false,
            createTableSQL: '',
            showSampleData:false,
            sampleColumns:[],
            sampleData:[],
            loadingSampleData: false,
            loadingCreateSQL: false,
            dbName:'',
            tableName:''
        };
    },
    methods: {
        init () {
            const req = this.$route.params
            this.serverId = req.id
            this.getServerTree()
            this.getServerInfo()
            this.columnList = [
                    {
                        key: 'columnPosition',
                        title: '序号',
                        width: 80,
                        align: 'center'
                    },
                    {
                        key: 'columnName',
                        title: '名称'
                    },
                    {
                        key: 'columnType',
                        title: '类型'
                    },
                    {
                        key: 'columnLength',
                        title: '长度',
                        align: 'center',
                        ellipsis: true
                    },
                    {
                        key: 'isNullable',
                        title: '可否为空',
                        width: 100,
                        align: 'center',
                        render: (h, params) => {
                            const row = params.row
                            if(row.isNullable === 0) return;
                            return h('Icon', {
                                props: {
                                    type: 'checkmark-round'
                                }
                            })
                        }
                    },
                    {
                        key: 'columnComment',
                        title: '字段描述'
                    }
                ];
        },
        getServerInfo(){
            this.$Loading.start()
            this.getRequest('/metadata/server/' + this.serverId).then(res=>{
                const result = res.data
                if(result.code === 0){
                    const data = result.data
                    this.serverTitle = data.name
                    this.$Loading.finish()
                }
            })
        },
        getServerTree(){
            this.$Loading.start()
            this.loadingPage = true
            this.getRequest('/metadata/server/tree/' + this.serverId).then(res=>{
                this.loadingPage = false
                const result = res.data
                if(result.code === 0){
                    this.tree = result.data
                    this.$Loading.finish()
                }
            })
        },
        reloadServerTree(){
            this.$Loading.start()
            this.loadingPage = true
            this.getRequest('/metadata/server/tree/reload/' + this.serverId).then(res=>{
                this.loadingPage = false
                const result = res.data
                if(result.code === 0){
                    this.tree = result.data
                    this.$Loading.finish()
                }
            })
        },
        getDbTree(node){
            this.$Loading.start()
            this.reloadingTree = true
            this.getRequest('/metadata/db/tree/' + node.id).then(res=>{
                this.reloadingTree = false
                const result = res.data
                if(result.code === 0){
                    node.children = result.data
                    node.fakeChildren = false
                    this.$Loading.finish()
                }
            })
        },
        reloadDbTree(node){
            this.$Loading.start()
            this.reloadingTree = true
            this.getRequest('/metadata/db/tree/reload/' + node.id).then(res=>{
                this.reloadingTree = false
                const result = res.data
                if(result.code === 0){
                    node.children = result.data
                    this.$Loading.finish()
                }
            })
        },
        reloadTableInfo(node){

        },
        reload(){
            const selectedNodes = this.$refs['tree'].getSelectedNodes()
            // reload server info
            if(selectedNodes.length === 0) {
                this.reloadServerTree()
                return;
            }

            const node = selectedNodes[0]

            if(node.nodeType === 'db'){
                this.reloadDbTree(node)
                return;
            }
            
            if(node.nodeType === 'table'){
                this.reloadTableInfo(node)
                return;
            }

        },
        importTable(){
            const checkedTables = this.$refs['tree'].getCheckedNodes().filter(x => x.nodeType === 'table')
            if(checkedTables.length === 0){
                this.$Message.info('请选择要导入的表')
                return
            }

            const importTables = checkedTables.map(table => {
                return { serverId: table.serverId, dbId: table.dbId, dbName: table.dbName, tableName: table.title}
            })
            this.postRequest('/metadata/table/import', importTables).then(res => {
                const result = res.data
                if(result.code === 0){
                    this.$Message.loading('正在导入 ' + importTables.length + ' 张表');
                }
            })
        },
        clickServerInfo(){
            this.showServerInfo = true;
            this.showDbInfo = this.showTableInfo = false;
            this.$refs['tree'].getSelectedNodes().map(x => x.selected = false)
        },
        selectNode(data){
            const node = data[0]
            if(!node) return;
            switch(node.nodeType){
                case 'db':
                    this.showDbInfo = true;
                break;
                case 'table':
                    this.showTableInfo = true
                    this.dbName = node.dbName
                    this.tableName = node.title
                    this.reloadRemoteTableDetail()
                break;
            }
        },
        reloadRemoteTableDetail(){
            this.loadingColumns = true
            this.$Loading.start()
            this.getRequest(`/metadata/table/remoteDetail?serverId=${this.serverId}&dbName=${this.dbName}&tableName=${this.tableName}`).then(res=>{
                this.loadingColumns = false;
                const result = res.data
                if(result.code === 0){
                    this.$Loading.finish()
                    this.dataList = result.data
                    this.sampleColumns = this.dataList.map(x=> { return {
                        key: x.columnName , title: x.columnName , ellipsis: true
                    }})
                }
            })
        },
        getCreateSQL(){
            this.$Loading.start()
            this.loadingCreateSQL = true
            this.getRequest(`/metadata/table/createTableSQL?serverId=${this.serverId}&dbName=${this.dbName}&tableName=${this.tableName}`).then(res=>{

                const result = res.data
                if(result.code === 0){
                    this.$Loading.finish()
                    this.createTableSQL = result.data
                    this.loadingCreateSQL = false
                    this.showSQL = true
                }
            })
        },
        getSampleData(){
            this.$Loading.start()
            this.loadingSampleData = true
            this.getRequest(`/metadata/table/sampleData?serverId=${this.serverId}&dbName=${this.dbName}&tableName=${this.tableName}`).then(res=>{
                this.loadingSampleData = false
                const result = res.data
                if(result.code === 0){
                    this.$Loading.finish()
                    this.sampleData = result.data
                    this.showSampleData = true
                }
            })
        },
        expandNode(node){
            if(!node.expand) return;
            if(node.fakeChildren){
                // Ajax get dbTree  getDbTree
                this.getDbTree(node)
            }
        }
    },
    watch:{
        showServerInfo: function(val) {
            if(val) this.showDbInfo = this.showTableInfo = false;
        },
        showDbInfo: function(val) {
            if(val) this.showServerInfo = this.showTableInfo = false;
        },
        showTableInfo: function(val) {
            if(val) this.showServerInfo = this.showDbInfo = false;
        }
    },
    mounted () {
        this.init();
    }
};
</script>
