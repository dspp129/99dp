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
                        <Input v-model="sourceTableFullName" readonly>
                            <span slot="prepend">表名</span>
                        </Input>
                    </Col>
                    <Col>
                        <Button type="primary" 
                            icon="refresh" 
                            shape="circle" 
                            size="small" 
                            v-if="value.useSql === 0" 
                            :loading="refreshingSource" 
                            @click="toLoadSource" 
                            style="margin-left: 10px;margin-top: 5px;">
                        </Button>

                        <Button type="primary"
                            icon="code-working"
                            shape="circle" 
                            size="small" 
                            v-if="value.useSql === 1"
                            @click="createQuerySql" 
                            style="margin-left: 10px;margin-top: 5px;">
                        </Button>
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
                        class="margin-top-20"
                    ></DragableTable>
                    <Row class="margin-top-20">
                        <Col span="22">
                            <Input v-model.trim="value.whereSql" style="float: left;">
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
                    <i-switch
                        class="margin-left-10"
                        v-model="value.useTmpTable"
                        :true-value="1"
                        :false-value="0"></i-switch>
                </div>

                <Row>
                    <Col span="22">
                        <template v-if="value.useTmpTable === 1">
                            <Input v-model.trim="value.tmpTableName"
                                @on-enter="toLoadTarget">
                                <span slot="prepend">表名</span>
                                <Button slot="append" icon="search" @click="toLoadTarget"></Button>
                            </Input>
                        </template>
                        <template v-else>
                            <Input v-model="targetTableFullName" readonly>
                                <span slot="prepend">表名</span>
                            </Input>
                        </template>
                    </Col>
                    <Col>
                        <Button type="primary" icon="refresh" shape="circle" size="small" :loading="refreshingTarget" @click="toLoadTarget" style="margin-left: 10px;margin-top: 5px;"></Button>
                    </Col>
                </Row>
                <DragableTable v-model="value.targetColumns" :columns="columnsList" :loading="refreshingTarget" class="margin-top-20"></DragableTable>
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
        value: Object
    },
    data () {
        return {
            refreshingSource: false,
            refreshingTarget: false,
            columnsList: []
        };
    },
    methods: {
        toLoadSource(){
            const serverId = this.value.sourceServerId
            const dbName = this.value.sourceDbName
            const tableName = this.value.sourceTableName
            
            this.refreshingSource = true
            this.$Loading.start()

            this.$http.get(`/api/task/refreshColumns?serverId=${serverId}&dbName=${dbName}&tableName=${tableName}`).then(res=>{
                const result = res.data
                if(result.code === 0){
                    this.value.sourceColumns = result.data
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

            this.$http.get(`/api/task/refreshColumns?serverId=${serverId}&dbName=${dbName}&tableName=${tableName}`).then(res=>{
                const result = res.data
                this.refreshingTarget = false
                if(result.code === 0 && result.data.length > 0){
                    this.value.targetColumns = result.data
                    this.$Loading.finish()
                } else {
                    this.$Message.warning('请检查表名是否正确')
                    this.$Loading.error()
                    this.value.targetColumns = []
                }
            })
        },
        createQuerySql(){
            if(this.value.sourceColumns.length === 0) return;

            let querySql = 'SELECT '
            this.value.sourceColumns.forEach(col => { querySql += col.columnName + ',\n'})
            querySql = querySql.substr(0, querySql.length-2) + '\n'
            querySql += 'FROM ' + this.sourceTableName

            if(this.value.whereSql.length > 0) {
                querySql += '\nWHERE ' + this.value.whereSql
            }

            this.value.querySql = querySql
        }
    },
    mounted () {

        console.log('etl-2 mounted: ' + this.value.sourceDbName);

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
            return this.value.sourceDbName + '.' + this.value.sourceTableName
        },
        targetTableFullName () {
            return this.value.targetDbName + '.' + this.value.targetTableName
        }
    }
};
</script>
