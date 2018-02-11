<template>
    <Row class="margin-top-10" type="flex" align="middle" justify="center">
        <Col span="11">
            <Card>
                <p slot="title">
                    <Icon type="log-in"></Icon>
                    Source
                </p>
                <Row type="flex" justify="center">
                    <Form ref="value.sourceTable" :model="value.sourceTable" :rules="ruleSource" label-position="right" :label-width="70" class="margin-top-20">
                        <FormItem label="类型" prop="dbType">
                            <Select v-model="value.sourceTable.dbType" placeholder="请选择数据库类型..." style="width: 150px" @on-change="changeDbType('source')">
                                <Option v-for="item in dbTypeList" :value="item.id" :key="item.id" :label="item.name" v-if="item.isEtlSource"></Option>
                            </Select>
                        </FormItem>
                        <FormItem label="数据库" prop="dbId">
                            <Select v-model="value.sourceTable.dbId"
                                filterable
                                clearable
                                transfer
                                remote
                                label-in-value
                                :loading="source.loadingDb"
                                :disabled = "value.sourceTable.dbType===''"
                                @on-change="changeSourceDb"
                                :remote-method="searchSourceDb"
                                ref="sourceDb"
                                placeholder="请输入关键字..."
                                style="width:250px" >
                                <OptionGroup v-for="dbs in sourceDbList" :label="dbs.serverName" :key="dbs.id">
                                    <Option v-for="db in dbs.dbList" :value="db.id" :label="db.name" :key="db.id" :disabled="db.importedTableCount === 0">
                                    <span>{{ db.name }}</span>
                                    <span style="float:right;color:#ccc">{{db.importedTableCount}} Tables</span>
                                    </Option>
                                </OptionGroup>
                            </Select>
                        </FormItem>
                        <FormItem label="表名" prop="tableId">
                            <Select
                                v-model="value.sourceTable.tableId"
                                clearable
                                filterable
                                transfer
                                remote
                                label-in-value
                                :loading="source.loadingTable"
                                :remote-method="searchSourceTable"
                                ref="sourceTable"
                                :disabled = "value.sourceTable.dbId===''"
                                placeholder="请输入关键字..."
                                @on-change="changeSourceTable"
                                style="width: 250px">
                                <Option v-for="table in sourceTableList" :value="table.id" :key="table.id" :label="table.tableName"></Option>
                            </Select>
                        </FormItem>
                    </Form>
                </Row>
            </Card>
        </Col>
        <Col span='2' style="text-align: center;">
            <a>
                <Icon type="arrow-right-a" size="50"></Icon>
            </a>
        </Col>
        <Col span="11">
            <Card>
                <p slot="title">
                    <Icon type="log-out"></Icon>
                    Target
                </p>
                <Row type="flex" justify="center">
                    <Form ref="value.targetTable" :model="value.targetTable" :rules="ruleSource" label-position="right" :label-width="70" class="margin-top-20">
                        <FormItem label="类型" prop="dbType">
                            <Select v-model="value.targetTable.dbType" placeholder="请选择数据库类型..." style="width: 150px" @on-change="changeDbType('target')">
                                <Option v-for="item in dbTypeList" :value="item.id" :key="item.id" :label="item.name" v-if="item.isEtlTarget"></Option>
                            </Select>
                        </FormItem>
                        <FormItem label="数据库" prop="dbId">
                            <Select v-model="value.targetTable.dbId"
                                filterable
                                clearable
                                transfer
                                remote
                                label-in-value
                                :loading="target.loadingDb"
                                :disabled = "value.targetTable.dbType===''"
                                @on-change="changeTargetDb"
                                :remote-method="searchTargetDb"
                                ref="targetDb"
                                placeholder="请输入关键字..."
                                style="width:250px" >
                                <OptionGroup v-for="dbs in targetDbList" :label="dbs.serverName" :key="dbs.id">
                                    <Option v-for="db in dbs.dbList" :value="db.id" :label="db.name" :key="db.id" :disabled="db.importedTableCount === 0">
                                    <span>{{ db.name }}</span>
                                    <span style="float:right;color:#ccc">{{db.importedTableCount}} Tables</span>
                                    </Option>
                                </OptionGroup>
                            </Select>
                        </FormItem>
                        <FormItem label="表名" prop="tableId">
                            <Select
                                v-model="value.targetTable.tableId"
                                filterable
                                clearable
                                transfer
                                remote
                                label-in-value
                                :loading="target.loadingTable"
                                ref="targetTable"
                                :disabled = "value.targetTable.dbId===''"
                                placeholder="请输入关键字..."
                                @on-change="changeTargetTable"
                                :remote-method="searchTargetTable"
                                style="width: 250px">
                                <Option v-for="table in targetTableList" :value="table.id" :key="table.id" :label="table.tableName"></Option>
                            </Select>
                        </FormItem>
                    </Form>
                </Row>
            </Card>
        </Col>
    </Row>
</template>

<script>

import lodash from 'lodash'
export default {
    name: 'etl-1',
    props :{
        value: Object
    },
    data () {
        return {
            ruleSource: {
                dbType: [{ required: true, message: '请选择数据库类型'}],
                dbId: [{ required: true, message: '请选择数据库'}],
                tableId: [{ required: true, message: '请输入表名'}]
            },
            source : {
                loadingDb: false,
                loadingTable: false
            },
            target : {
                loadingDb: false,
                loadingTable: false
            },
            
            dbTypeList:[],
            sourceDbList:[],
            targetDbList:[],
            sourceTableList:[],
            targetTableList:[]
        };
    },
    methods: {
        changeDbType(value){
            this.$refs[value+'Db'].clearSingleSelect()
            this.getTop10Db(value, '')
        },
        changeTargetDb(option){
            this.value.targetTable.dbName = option.label
            this.$refs['targetTable'].clearSingleSelect()
            this.targetTableList = []
            const dbId = option.value
            if(dbId === '') return;
            this.getTop10Tables('target','')
        },
        changeSourceDb(option){
            this.value.sourceTable.dbName = option.label
            this.$refs['sourceTable'].clearSingleSelect()
            this.sourceTableList = []
            const dbId = option.value

            if(dbId === '') return;
            this.getTop10Tables('source','')
        },
        changeSourceTable(option){
            const tableId = option.value
            if(tableId === '') return;
            const table = this.sourceTableList.filter(table => table.id === tableId)[0]
            this.value.sourceTable.serverId = table.serverId
            // watch tableName in etl-2
            this.value.sourceTable.tableName = option.label

        },
        changeTargetTable(option){
            const tableId = option.value
            if(tableId === '') return;
            const table = this.targetTableList.filter(table => table.id === tableId)[0]
            this.value.targetTable.serverId = table.serverId
            // watch tableName in etl-2
            this.value.targetTable.tableName = option.label

        },

        changeTable(value){
            if(value==='source'){
                const sourceTableId = this.value.sourceTable.tableId
                const sourceTable = sourceTableId === '' ? null : this.sourceTableList.filter(x=> x.id === sourceTableId)[0]
                this.$emit('on-source-change', sourceTable)
            } else {
                const targetTableId = this.value.targetTable.tableId
                const targetTable = targetTableId === '' ? null : this.targetTableList.filter(x=> x.id === targetTableId)[0]
                this.$emit('on-target-change', targetTable)
            }
        },

        getTop10Db(value, keyWord){
            this.source.loadingDb = true
            this.target.loadingDb = true
            const dbType = value === 'source' ? this.value.sourceTable.dbType : this.value.targetTable.dbType
            this.$http.get('/api/task/top10Db' 
                +'?dbType=' + dbType
                +'&keyWord=' + keyWord).then(res=>{
                    this.source.loadingDb = false
                    this.target.loadingDb = false
                    const result = res.data
                if(result.code === 0){
                    if(value === 'source') {
                        this.sourceDbList = result.data
                    } else {
                        this.targetDbList = result.data
                    }
                }
            })
        },
        searchSourceDb: _.debounce(function (keyWord){
            if(keyWord.length < 2 && this.sourceDbList.length >= 5) return;
            this.getTop10Db('source', keyWord)
        },500),

        searchTargetDb: _.debounce(function (keyWord){
            if(keyWord.length < 2 && this.targetDbList.length >= 5) return;
            this.getTop10Db('target', keyWord)
        },500),

        searchSourceTable: _.debounce(function (keyWord){
            const filteredList = this.sourceTableList.filter(table => table.tableName.indexOf(keyWord) >= 0)
            if(keyWord.length < 2 && filteredList.length >= 5) return;
            this.getTop10Tables('source', keyWord);
        },500),

        searchTargetTable: _.debounce(function (keyWord){
            const filteredList = this.targetTableList.filter(table => table.tableName.indexOf(keyWord) >= 0)
            if(keyWord.length < 2 && filteredList.length >= 5) return;
            this.getTop10Tables('target', keyWord);
        },500),

        getTop10Tables(value , keyWord){
            this.source.loadingTable = true
            this.target.loadingTable = true
            const dbId = value === 'source' ? this.value.sourceTable.dbId : this.value.targetTable.dbId
            this.$http.get('/api/task/top10Tables' 
                +'?dbId=' + dbId
                +'&keyWord=' + keyWord).then(res=>{
                    this.source.loadingTable = false
                    this.target.loadingTable = false
                const result = res.data
                if(result.code === 0){
                    if(value === 'source') {
                        this.sourceTableList = result.data
                    } else {
                        this.targetTableList = result.data
                    }
                }
            })
        }
    },
    computed: {
        
    },
    mounted () {
        this.$http.get('/api/metadata/dbType').then(res =>{
            const result = res.data;
            if(result.code === 0){
                this.dbTypeList = result.data;
            }
        })
    }
};


</script>