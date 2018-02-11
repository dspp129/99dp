<template>
    <Row class="margin-top-10">
        <Col span="11">
            <Card >
                <p slot="title">
                    <Icon type="log-in"></Icon>
                    Source
                </p>
                <div slot="extra">
                    <small>自定义SQL</small>
                    <i-switch class="margin-left-10" v-model="useSql"></i-switch>
                </div>
                <Row>
                    <Col span="22">
                        <Input v-model="sourceTableName" disabled>
                            <span slot="prepend">表名</span>
                        </Input>
                    </Col>
                    <Col>
                        <Button type="primary" icon="refresh" shape="circle" size="small" :disabled="useSql" :loading="refreshingSource" @click="toLoadSource" style="margin-left: 10px;margin-top: 5px;"></Button>
<!-- 

1. 由于Sql的plan异常，导致的抽取时间长； 在抽取时，尽可能使用全表扫描代替索引扫描;
2. 合理sql的并发度，减少抽取时间；根据表的大小， <50G可以不用并发， <100G添加如下hint: parallel(a,2）,
   100G添加如下hint : parallel(a,4);
3. 抽取sql要简单，尽量不用replace等函数，这个非常消耗cpu，会严重影响抽取速度;
-->

                    </Col>
                </Row>

                <template v-if="useSql">
                    <Input v-model.trim="querySql" type="textarea" class="margin-top-20" :autosize="{minRows: 10}">
                    </Input>
                </template>
                <template v-else>
                    <DragableTable 
                        v-model="sourceColumnList" 
                        :columns="columnsList" 
                        :loading="refreshingSource" 
                        class="margin-top-20"
                    ></DragableTable>
                    <Row class="margin-top-20">
                        <Col span="22">
                            <Input v-model.trim="where" style="float: left;">
                                <span slot="prepend">WHERE</span>
                            </Input>
                        </Col>
                        <Col span="2">
                             <Button type="primary" shape="circle" size="small" icon="help"
                                style="margin-left: 10px;margin-top: 5px;"></Button>
                        </Col>
                    </Row>
                </template>
            </Card>
        </Col>
        <Col span='2' style="text-align: center;line-height: 300px">
            <a>
                <Icon type="arrow-right-a" size="50"></Icon>
            </a>
        </Col>
        <Col span="11">
            <Card style="min-height: 394px">
                <p slot="title">
                    <Icon type="log-out"></Icon>
                    Target
                </p>
                <div slot="extra">
                    <small>使用临时表</small>
                    <i-switch class="margin-left-10" v-model="useTmpTable"></i-switch>
                </div>

                <Row>
                    <Col span="22">
                        <template v-if="useTmpTable">
                            <Input v-model.trim="tmpTableName"
                                @on-enter="toLoadTarget">
                                <span slot="prepend">表名</span>
                                <Button slot="append" icon="search" @click="toLoadTarget"></Button>
                            </Input>
                        </template>
                        <template v-else>
                            <Input v-model="targetTableName"
                                :disabled="true">
                                <span slot="prepend">表名</span>
                            </Input>
                        </template>
                    </Col>
                    <Col>
                        <Button type="primary" icon="refresh" shape="circle" size="small" :loading="refreshingTarget" @click="toLoadTarget" style="margin-left: 10px;margin-top: 5px;"></Button>
                    </Col>
                </Row>
                <DragableTable v-model="targetColumnList" :columns="columnsList" :loading="refreshingTarget" class="margin-top-20"></DragableTable>
            </Card>
        </Col>
    </Row>
</template>

<script>

import DragableTable from './dragableTable';

export default {
    name: 'workflow',
    components: {
        DragableTable
    },
    props : {
        value: Object,
        sourceTable : Object,
        targetTable : Object,
        sourceColumns : Array,
        targetColumns : Array
    },
    data () {
        return {
            where:'',
            refreshingSource: false,
            refreshingTarget: false,

            tmpTableName: '',

            columnsList: [],
            sourceColumnList: this.sourceColumns,
            targetColumnList: this.targetColumns,
            useSql: false,
            useTmpTable: false,
            querySql:''
        };
    },
    methods: {
        toLoadSource(){

            const serverId = this.sourceTable.serverId
            const dbName = this.sourceTable.dbName
            const tableName = this.sourceTable.tableName
            
            this.refreshingSource = true
            this.$Loading.start()

            this.$http.get('/api/task/refreshColumns'
                + '?serverId=' + serverId
                + '&dbName=' + dbName
                + '&tableName=' + tableName).then(res=>{
                const result = res.data
                if(result.code === 0){
                    this.sourceColumnList = result.data
                    this.refreshingSource = false
                    this.$Loading.finish()
                }
            })
        },
        toLoadTarget(){

            const serverId = this.targetTable.serverId
            let dbName = this.targetTable.dbName
            let tableName = this.targetTable.tableName

            if(this.useTmpTable){
                dbName = this.tmpTableName.substr(0, this.tmpTableName.indexOf('.'))
                tableName = this.tmpTableName.substr(this.tmpTableName.indexOf('.') + 1)
            }

            if(dbName.length * tableName.length === 0){
                this.$Message.warning('请填写完整表名')
                return;
            }
            this.refreshingTarget = true
            this.$Loading.start()

            this.$http.get('/api/task/refreshColumns'
                + '?serverId=' + serverId
                + '&dbName=' + dbName
                + '&tableName=' + tableName).then(res=>{
                const result = res.data
                this.refreshingTarget = false
                if(result.code === 0 && result.data.length > 0){
                    this.targetColumnList = result.data
                    this.$Loading.finish()
                } else {
                    this.$Message.warning('请检查表名是否正确')
                    this.$Loading.error()
                    this.targetColumnList = []
                }
            })
        }
    },
    mounted () {
        this.columnsList = [
            {
                key: 'columnName',
                title: '列名',
                sortable: true
            },
            {
                key: 'columnType',
                title: '类型'
            },
            {
                key: 'columnLength',
                title: '长度',
                width: 70
            },
            {
                type: 'selection',
                align: 'center',
                width: 60
            }
        ]
    },
    watch : {
        'sourceTable.tableName' (tableName){
            if(tableName==='') return;

            this.useSql = false
            this.$http.get('/api/task/refreshColumns'
                + '?serverId=' + this.sourceTable.serverId
                + '&dbName=' + this.sourceTable.dbName
                + '&tableName=' + this.sourceTable.tableName).then(res=>{
                const result = res.data
                if(result.code === 0){
                    this.sourceColumnList = result.data
                }
            })
        },
        'targetTable.tableName' (tableName){
            if(tableName==='') return;

            this.useTmpTable = false
            this.$http.get('/api/task/refreshColumns'
                + '?serverId=' + this.targetTable.serverId
                + '&dbName=' + this.targetTable.dbName
                + '&tableName=' + this.targetTable.tableName).then(res=>{
                const result = res.data
                if(result.code === 0){
                    this.targetColumnList = result.data
                }
            })
        },
        useSql(useSql){
            if(!useSql) return;
            if(this.querySql.length > 0) return;
            if(this.sourceColumnList.length === 0) return;

            this.querySql = 'SELECT '
            this.sourceColumnList.map(x => { this.querySql += x.columnName + ',\n'})
            this.querySql = this.querySql.substr(0,this.querySql.length-2) + '\n'
            this.querySql += 'FROM ' + this.sourceTableName
            if(this.where.length > 0) {
                this.querySql += '\nWHERE ' + this.where
            }
        },
        sourceColumnList (sourceColumnList) {
            this.$emit('on-source-columns-change', sourceColumnList)
        },
        targetColumnList (targetColumnList) {
            this.$emit('on-target-columns-change', targetColumnList)
        }
    },
    computed : {
        sourceTableName () {
            return this.sourceTable.dbName + '.' + this.sourceTable.tableName
        },
        targetTableName () {
            return this.targetTable.dbName + '.' + this.targetTable.tableName
        }
    }
};
</script>
