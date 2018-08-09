<template>
    <Modal
        v-model="showing"
        title="导入表"
        :mask-closable="false"
        :closable="false"
        class-name="modal-vertical-center"
        width="800">
        <Row>
            <Col>
                <Select v-model="dbType" 
                    ref="dbType"
                    clearable
                    label-in-value
                    @on-change="changeDbType"
                    placeholder="数据库类型..."
                    style="width:120px">
                    <Option v-for="item in dbTypeList" v-if="item.isEtlSource" :value="item.id" :key="item.id">{{item.name}}</Option>
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
                        <span style="float:right;color:#ccc">{{ db.tableCount }} Tables</span>
                        </Option>
                    </OptionGroup>
                </Select>

                <Tooltip placement="top">
                    <Button shape="circle" icon="help" size="small" style="margin-left:6px;"></Button>
                    <span slot="content">
                        未找到数据库？<br/>
                        进入<a type="text" href="#" @click.prevent="openServerList"> 数据集成</a>，刷新连接。
                    </span>
                </Tooltip>

                <Input v-model="keyWord" icon="search" placeholder="请输入表名关键字..." style="margin-left:6px;width: 250px;" @on-enter="onSearch" @on-click="onSearch"></Input>


                <Tooltip placement="top">
                    <Button shape="circle" icon="help" size="small" style="margin-left:6px;"></Button>
                    <span slot="content">
                        未找到表？<br/>
                        请检查表是否存在。
                    </span>
                </Tooltip>
                
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

        <div slot="footer">
            <Button @click="cancel">关闭</Button>

            <Button icon="archive" type="primary" @click="importTable">导入</Button>
        </div>
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
        value: Boolean,
        dbTypeList: Array
    },
    data () {
        return {
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
            showing: false,

            columnsList: [],
            tableList:[],
            serverList:[],
            selected:[]
        };
    },
    methods: {
        cancel () {
            this.total = 0
            this.filter.page = 1
            this.$refs.dbType.clearSingleSelect()
            this.serverList = []
            this.tableList = []
            this.$emit('input', false)
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
            const page = this.filter.page
            const size = this.filter.size
            const dbType = Util.formatNumber(this.dbType)
            this.getRequest(`/metadata/remoteTable?serverId=${this.serverId}&dbType=${dbType}&dbId=${this.dbId}&dbName=${this.dbName}&keyWord=${this.keyWord}&page=${page}&size=${size}`).then(res => {
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

            this.$Message.loading({
                content: '正在导入 ' + importList.length + ' 张表，请稍后刷新。',
                duration: 10
            });

            this.postRequest('/metadata/table/import', importList).then(res => {
                const result = res.data
                this.$Message.destroy()
                if(result.code === 0){
                    // this.$Message.success('导入完毕。')
                } else {

                }
            })
        },
        openServerList(){
            this.cancel()
            this.$router.push({
                name: 'server-list'
            });
        },

        /*
        refreshDatabase(){
            this.refreshing = true;
            this.$Message.loading('刷新数据库中，请稍候...');

            this.getRequest('/metadata/db/reload/' + this.dbId).then(res=>{
                this.refreshing = false
                const result = res.data
                if(result.code === 0){
                    this.$Message.success(`刷新成功！共找到${result.data}条记录，请再次搜索。`);
                }
            })
        },
        */
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
    computed : {
    },
    watch : {
        value (value) {
            this.showing = value
        }
    }
}
</script>