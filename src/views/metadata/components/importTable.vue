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
                    <Option v-for="item in dbTypeList" :value="item.id" :key="item.id" :label="item.name"></Option>
                </Select>
                <Select v-model="dbId"
                    filterable
                    clearable
                    transfer
                    remote
                    label-in-value
                    :loading="loadingDb"
                    :remote-method="searchDb"
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
                <Button icon="archive" type="primary" style="float: right;" @click="importTable">导入</Button>
            </Col>
        </Row>
        <Row class="margin-top-20">
            <Col>
                <Table
                    :columns="columnsList"
                    :loading="loadingTable"
                    :data="tableList"
                    @on-selection-change="onSelectionChange"
                    border
                    stripe
                    size="small">
                </Table>
            </Col>
        </Row>

    </Modal>
</template>

<script>

import lodash from 'lodash'

export default {
    name: 'importTable',
    props: {
        show: Boolean,
        dbTypeList: Array
    },
    data () {
        return {
            showing: this.show,
            dbType: '',
            dbId: '',
            keyWord: '',

            loadingDb: false,
            loadingTable: false,

            columnsList: [],
            tableList:[],
            dbList:[],
            serverList:[]
        };
    },
    methods: {
        ok () {
            this.cancel()
        },
        cancel () {
            this.$emit('onCloseModal')
        },
        changeDbType (option) {
            this.$refs.modalDb.clearSingleSelect()
            this.getTop10Db('')
        },
        searchDb: _.debounce(function (keyWord){
            if(keyWord.length < 2 && this.serverList.length >= 5) return;
            this.getTop10Db(keyWord)
        },500),
        getTop10Db (keyWord) {
            this.loadingDb = true
            if(this.dbType <= 0) return;

            this.$http.get(`/api/metadata/top10Db?dbType=${this.dbType}&keyWord=${keyWord}`).then(res=>{
                this.loadingDb = false
                const result = res.data
                if(result.code === 0){
                    this.serverList = result.data
                }
            })
        },
        onSearch () {
           if(!this.dbId > 0){
                this.$Message.error('请选择数据库')
                return 
            }
            this.loadingTable = true
            this.$http.get(`/api/metadata/top10RemoteTables?dbId=${this.dbId}&keyWord=${this.keyWord}`).then(res => {
                this.loadingTable = false
                const result = res.data
                if(result.code === 0){
                    this.tableList = result.data
                }
            })
        },
        onSelectionChange(e){
            const selected = e.map(row => row.tableName)
            this.tableList.forEach((row,index) => {
                const isChecked = selected.includes(row.tableName)
                if(row._checked !== isChecked){
                    row._checked = isChecked
                    this.tableList.splice(index, 1, row);
                }
            })
        },
        importTable () {
            const importList = this.tableList.filter(table => table._checked)
            if(importList.length === 0){
                this.$Message.error('请选择要导入的表')
                return 
            }
            this.$http.post('/api/metadata/table/import', importList).then(res => {
                const result = res.data
                if(result.code === 0){
                    this.$Message.loading('正在导入 ' + importList.length + ' 张表');
                }
            })

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
    }
}
</script>