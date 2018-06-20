<template>
    <Modal
        v-model="showing"
        title="导入表"
        :mask-closable="false"
        :closable="false"
        class-name="vertical-center-modal"
        width="800"
        @on-ok="ok"
        @on-cancel="cancel">
        <Row>
            <Col>
                <Select v-model="dbType" 
                    ref="dbType"
                    clearable
                    label-in-value
                    @on-change="changeDbType"
                    placeholder="数据库类型..."
                    style="width:120px">
                    <Option v-for="item in dbTypeList" :value="item.id" :key="item.id">{{item.name}}</Option>
                </Select>
                <Select v-model="dbId"
                    filterable
                    clearable
                    transfer
                    label-in-value
                    remote
                    :loading="loadingDb"
                    @on-change="changeDb"
                    @on-query-change="onQueryChange"
                    ref="modalDb"
                    placeholder="请输入数据库名..."
                    style="width:250px" >
                    <OptionGroup v-for="server in serverList" :label="server.serverName" :key="server.id">
                        <Option v-for="db in server.dbList" :value="db.id" :label="db.name" :key="db.id">
                        <span>{{ db.name }}</span>
                        <span style="float:right;color:#ccc">{{ db.importedTableCount }} Tables</span>
                        </Option>
                    </OptionGroup>
                </Select>
                <Input v-model="keyWord" icon="search" placeholder="请输入关键字..." style="width: 250px" @on-enter="onSearch" @on-click="onSearch"></Input>
                <Tooltip placement="right" :disabled="disableRefresh">
                    <Button shape="circle" icon="help" size="small" :loading="refreshing"></Button>
                    <span slot="content">
                        未找到需要的表？<br/>
                        点此<a type="text" href="#" @click.prevent="refreshDatabase">刷新数据库</a>
                    </span>
                </Tooltip>
                <Button icon="archive" type="primary" style="float: right;" @click="importTable">导入</Button>
            </Col>
        </Row>
        <Row class="margin-top-20">
            <Col>
                <TablePagination ref="tmpList" :total="total" :size="filter.size" @on-page-info-change="changePageInfo">
                    <Table slot="table" size="small" border
                    ref="tmpList"
                    :data="tableList" 
                    :columns="columnsList"
                    :loading="loadingTable"
                    @on-selection-change="onSelectionChange"
                    ></Table>
                </TablePagination>
            </Col>
        </Row>

    </Modal>
</template>

<script>

import lodash from 'lodash';
import Util from '@/libs/util';
import TablePagination from '@/views/my-components/tablePagination'

export default {
    name: 'importTable',
    components: {
        TablePagination
    },
    props: {
        show: Boolean,
        dbTypeList: Array
    },
    data () {
        return {
            showing: this.show,
            serverId: '',
            dbType: '',
            dbId: '',
            dbName: '',
            keyWord: '',
            total:0,
            filter:{
                page: 1,
                size: 5
            },

            loadingDb: false,
            loadingTable: false,
            refreshing: false,

            columnsList: [],
            tableList:[],
            serverList:[],
            selected:[]
        };
    },
    methods: {
        ok () {
            this.cancel()
        },
        cancel () {
            this.$emit('onCloseModal')
            this.total = 0
            this.filter.page = 1
        },
        changeDbType (option) {
            this.$refs.modalDb.clearSingleSelect()
            this.getTop10Db('')
        },
        changeDb (option) {
            this.keyWord = ''
            this.tableList = []
            if(typeof option === 'undefined') {
                this.dbId = ''
                this.dbName = ''
                this.serverId = ''
                this.serverList = []
            } else {
                this.dbId = option.value
                this.dbName = option.label
                let dbList = []
                this.serverList.forEach(e => dbList = dbList.concat(e.dbList))
                dbList.forEach(e => {
                    if(e.id === this.dbId){
                        this.serverId = e.serverId
                    }
                })
            }
        },
        onQueryChange: _.debounce(function (keyWord){
            if(keyWord.length < 2 && this.serverList.length >= 5) return;
            this.getTop10Db(keyWord)
        },1500),
        getTop10Db (keyWord) {
            this.loadingDb = true
            const dbType = Util.formatNumber(this.dbType)
            this.getRequest(`/metadata/top10Db?dbType=${dbType}&keyWord=${keyWord}`).then(res=>{
                this.loadingDb = false
                const result = res.data
                if(result.code === 0){
                    this.serverList = result.data
                }
            })
        },
        onSearch () {
            this.filter.page = 1;
            this.getTable()
        },
        getTable(){
            this.selected = []
            if(!this.dbId > 0){
                this.$Message.error('请选择数据库')
                return 
            }

            this.loadingTable = true
            const page = this.filter.page - 1
            const size = this.filter.size
            this.getRequest(`/metadata/tmpTable?dbId=${this.dbId}&keyWord=${this.keyWord}&page=${page}&size=${size}`).then(res => {
                this.loadingTable = false
                const result = res.data
                if(result.code === 0){
                    this.tableList = result.data.content
                    this.total = result.data.totalElements
                }
            })
        },
        onSelectionChange(e){
            this.selected = e.map(row => row.tableName)
        },
        importTable () {
            if(this.selected.length === 0){
                this.$Message.error('请选择要导入的表')
                return 
            }

            const importList = this.selected.map(table => {
                return { 
                    serverId: this.serverId,
                    dbId: this.dbId,
                    dbName: this.dbName,
                    tableName: table
                }
            })

            this.postRequest('/metadata/table/import', importList).then(res => {
                const result = res.data
                if(result.code === 0){
                    this.$Message.loading('正在导入 ' + importList.length + ' 张表');
                }
            })
        },
        refreshDatabase(){
            this.refreshing = true;
            this.$Message.loading('刷新数据库中，请稍候...');

            this.getRequest('/metadata/db/refresh/' + this.dbId).then(res=>{
                this.refreshing = false
                const result = res.data
                if(result.code === 0){
                    this.$Message.success(`刷新成功！共找到${result.data}条记录，请再次搜索。`);
                }
            })
        },
        changePageInfo(filter) {
            this.filter = filter;
            this.getTable()
        }
    },
    mounted () {
        this.columnsList = [
            {
                key: 'tableName',
                title: '表名'
            },
            {
                key: 'tableComment',
                title: '注释'
            },
            {
                type: 'selection',
                align: 'center',
                width: 60
            }
        ]
    },
    watch : {
        show (show) {
            this.$refs.dbType.clearSingleSelect()
            this.serverList = []
            this.tableList = []
            this.showing = show
        }
    },
    computed : {
        disableRefresh () {
            return !this.dbId > 0 || this.refreshing
        }
    }
}
</script>