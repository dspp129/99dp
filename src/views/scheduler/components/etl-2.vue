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
                    <i-switch 
                        class="margin-left-10"
                        v-model="value.useSql"
                        :true-value="1"
                        :false-value="0"></i-switch>
                </div>
                <Row>
                    <Col span="22">
                        <Input readonly 
                            icon="edit"
                            v-model="sourceTableFullName"
                            placeholder="请点击图标编辑..."
                            @on-click="onOpenModal">
                            <span slot="prepend">来源表</span>
                        </Input>
                    </Col>
                    <Col>
                        <template v-if="value.useSql === 0">
                            <Button type="primary" 
                                icon="refresh" 
                                shape="circle" 
                                size="small" 
                                :loading="refreshingSource" 
                                :disabled="sourceTableFullName === ''"
                                @click="toLoadSource" 
                                style="margin-left: 10px;margin-top: 5px;">
                            </Button>
                        </template>
                        <template v-else>
                            <Button type="primary"
                                icon="code-working"
                                shape="circle" 
                                size="small" 
                                :disabled="sourceTableFullName === ''"
                                @click="createQuerySql" 
                                style="margin-left: 10px;margin-top: 5px;">
                            </Button>
                        </template>

<!-- 
1. 由于Sql的plan异常，导致的抽取时间长； 在抽取时，尽可能使用全表扫描代替索引扫描;
2. 合理sql的并发度，减少抽取时间；根据表的大小， <50G可以不用并发， <100G添加如下hint: parallel(a,2）,
   100G添加如下hint : parallel(a,4);
3. 抽取sql要简单，尽量不用replace等函数，这个非常消耗cpu，会严重影响抽取速度;
-->
                    </Col>
                </Row>

                <template v-if="value.useSql === 1">
                    <Input 
                        v-model.trim="value.querySql" 
                        type="textarea" 
                        class="margin-top-20" 
                        :autosize="{minRows: 10}">
                    </Input>
                </template>
                <template v-else>
                    <DragableTable 
                        v-model="value.sourceColumns" 
                        :columns="columnsList" 
                        :loading="refreshingSource" 
                        class="margin-top-20">
                    </DragableTable>
                    <Row class="margin-top-10">
                    </Row>
                    <template v-if="value.sourceDbType !== 4">
                        <Row class="margin-top-10">
                            <Col span="22">
                                <!-- Hive表 无Where -->
                                <Input v-model.trim="value.whereSql" style="float: left;">
                                    <span slot="prepend">WHERE</span>
                                </Input>
                            </Col>
                            <Col span="2">
                                 <Button type="ghost" shape="circle" size="small" icon="help"
                                    style="margin-left: 10px;margin-top: 5px;"></Button>
                            </Col>
                        </Row>
                    </template>
                    <template v-else>
                        <Row class="margin-top-10" v-for="(item, index) in value.sourcePartitionColumns" :key="item.columnPosition">
                            <Col span="22">
                                <Input v-model="item.columnValue">
                                    <span slot="prepend">{{ item.columnName }} = </span>
                                </Input>
                            </Col>
                            <Col span="2">
                                 <Button v-show="index === 0" type="ghost" shape="circle" size="small" icon="help"
                                    style="margin-left: 10px;margin-top: 5px;"></Button>
                            </Col>
                        </Row>
                    </template>
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
                    <i-switch
                        class="margin-left-10"
                        v-model="value.useTmpTable"
                        :true-value="1"
                        :false-value="0">
                    </i-switch>
                </div>

                <Row>
                    <Col span="22">
                        <template v-if="value.useTmpTable === 1">
                            <Input v-model.trim="value.tmpTableName"
                                icon="search"
                                placeholder="数据库名.表名"
                                @on-enter="toLoadTarget"
                                @on-click="toLoadTarget">
                                <span slot="prepend">临时名</span>
                            </Input>
                        </template>
                        <template v-else>
                            <Input readonly v-model="targetTableFullName">
                                <span slot="prepend">目标表</span>
                            </Input>
                        </template>
                    </Col>
                    <Col>
                        <Button type="primary" icon="refresh" shape="circle" size="small" :loading="refreshingTarget" @click="toLoadTarget" style="margin-left: 10px;margin-top: 5px;"></Button>
                    </Col>
                </Row>

                <DragableTable v-model="value.targetColumns" :columns="columnsList" :loading="refreshingTarget" class="margin-top-20"></DragableTable>

                <Row class="margin-top-10">
                </Row>

                <Row class="margin-top-10" v-for="(item, index) in value.targetPartitionColumns" :key="item.columnPosition">
                    <Col span="22">
                        <Input v-model="item.columnValue">
                            <span slot="prepend">{{ item.columnName }} = </span>
                        </Input>
                    </Col>
                    <Col span="2">
                         <Button v-show="index === 0" type="ghost" shape="circle" size="small" icon="help"
                            style="margin-left: 10px;margin-top: 5px;"></Button>
                    </Col>
                </Row>
            </Card>
        </Col>
        <ChooseTable title="编辑来源表" :show="showingModal" 
            @onChooseTable="onChooseTable"
            @onCloseModal="onCloseModal"
            :dbTypeList="dbTypeList">
        </ChooseTable>
    </Row>
</template>

<script>

import DragableTable from './dragableTable'
import ChooseTable from './chooseTable'

export default {
    name: 'workflow',
    components: {
        DragableTable,
        ChooseTable
    },
    props : {
        value: Object,
        dbTypeList: Array
    },
    data () {
        return {
            refreshingSource: false,
            refreshingTarget: false,
            columnsList: [],

            showingModal: false,

            serverList:[],
            tableList:[]

        };
    },
    methods: {
        toLoadSource(){
            const serverId = this.value.sourceServerId
            const dbName = this.value.sourceDbName
            const tableName = this.value.sourceTableName
            
            this.refreshingSource = true
            this.$Loading.start()
            this.value.sourceColumns = []
            this.value.sourcePartitionColumns = []

            this.$http.get(`/api/task/refreshColumns?serverId=${serverId}&dbName=${dbName}&tableName=${tableName}`).then(res=>{
                const result = res.data
                if(result.code === 0){
                    result.data.forEach(e => {
                        this.value.sourceColumns.push(e)
                        if(e.columnKey === 'PAR'){
                            this.value.sourcePartitionColumns.push(e)
                        }
                    })
                    this.refreshingSource = false
                    this.$Loading.finish()
                }
            })
        },
        toLoadTarget(){

            const serverId = this.value.targetServerId
            let dbName = this.value.targetDbName
            let tableName = this.value.targetTableName

            if(this.value.useTmpTable === 1){
                dbName = this.value.tmpTableName.substr(0, this.value.tmpTableName.indexOf('.'))
                tableName = this.value.tmpTableName.substr(this.value.tmpTableName.indexOf('.') + 1)
            }

            if(dbName.length * tableName.length === 0){
                this.$Message.warning('请填写完整表名')
                return
            }
            this.refreshingTarget = true
            this.$Loading.start()
            this.value.targetColumns = []
            this.value.targetPartitionColumns = []

            this.$http.get(`/api/task/refreshColumns?serverId=${serverId}&dbName=${dbName}&tableName=${tableName}`).then(res=>{
                const result = res.data
                this.refreshingTarget = false
                if(result.code === 0 && result.data.length > 0){
                    result.data.forEach(e => {
                        if(e.columnKey === 'PAR'){
                            this.value.targetPartitionColumns.push(e)
                        } else {
                            this.value.targetColumns.push(e)
                        }
                    })
                    this.$Loading.finish()
                } else {
                    this.$Message.warning('请检查表名是否正确')
                    this.$Loading.error()
                }
            })
        },
        createQuerySql(){
            if(this.value.sourceColumns.length === 0) return;

            let querySql = 'SELECT '
            this.value.sourceColumns.forEach(col => { querySql += col.columnName + ',\n'})
            querySql = querySql.substr(0, querySql.length-2) + '\n'
            querySql += 'FROM ' + this.sourceTableFullName

            if(this.value.whereSql.length > 0) {
                querySql += '\nWHERE ' + this.value.whereSql
            }

            this.value.querySql = querySql
        },
        onOpenModal () {
            this.showingModal = true
        },
        onChooseTable (source) {
            if(this.value.sourceTableId !== source.tableId){
                this.value.sourceDbType = source.dbType
                this.value.sourceServerId = source.serverId
                this.value.sourceDbId = source.dbId
                this.value.sourceDbName = source.dbName
                this.value.sourceTableId = source.tableId
                this.value.sourceTableName = source.tableName
                this.toLoadSource()
            }
        },
        onCloseModal () {
            this.showingModal = false
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
    },
    computed : {
        sourceTableFullName () {
            if(this.value.sourceTableName.length > 0)
                return this.value.sourceDbName + '.' + this.value.sourceTableName
            else 
                return ''
        },
        targetTableFullName () {
            if(this.value.targetTableName.length > 0)
                return this.value.targetDbName + '.' + this.value.targetTableName
            else
                return ''
        }
    }
};
</script>
