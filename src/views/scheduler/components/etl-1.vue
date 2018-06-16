<template>
    <Row class="margin-top-10">
        <Col span="11">
            <Card>
                <p slot="title">
                    <Icon type="log-in"></Icon>
                    Source
                </p>
                <Row type="flex" justify="center">
                    <Form ref="value" 
                        :model="value" 
                        :rules="ruleSource" 
                        label-position="right" 
                        :label-width="70" 
                        style="margin-top: 70px; margin-bottom: 70px">

                        <FormItem label="来源表" prop="sourceTableId" required>
                            <Input readonly 
                                icon="edit"
                                v-model="sourceTableFullName"
                                placeholder="请点击图标编辑目标表"
                                @on-click="editTable('source',0)"
                                style="width:250px">
                                <span slot="prepend">来源表</span>
                            </Input>
                        </FormItem>

                    </Form>
                </Row>
            </Card>
        </Col>
        <Col span='2' style="text-align: center;line-height: 300px">
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
                    <Form ref="value" 
                        :model="value" 
                        label-position="right" 
                        :label-width="70" 
                        style="margin-top: 70px; margin-bottom: 70px">

                        <FormItem label="目标表" prop="targetTableId" required>
                            <Input readonly 
                                icon="edit"
                                v-model="targetTableFullName"
                                placeholder="请点击图标编辑目标表"
                                @on-click="editTable('target',0)"
                                style="width:250px">
                            </Input>
                            <!--
                            <Poptip 
                                confirm
                                transfer
                                placement="top-end"
                                title="您确认删除这张表吗？"
                                class="margin-left-10"
                                @on-ok="removeItem">
                                <Button size="small" 
                                    shape="circle" 
                                    icon="minus-round" 
                                    type="error" 
                                    disabled>
                                </Button>
                            </Poptip>
                        -->
                        </FormItem>
<!--
                        <FormItem>
                            <Button 
                                type="dashed" 
                                long 
                                @click="handleAdd"
                                style="width:220px">
                                新增表
                            </Button>
                            <Button size="small" 
                                shape="circle" 
                                icon="plus-round" 
                                type="success"
                                @click="handleAdd"
                                class="margin-left-10"></Button>
                        </FormItem>
                    -->
                    </Form>
                </Row>
            </Card>
        </Col>

        <Modal
            v-model="editModal.showingModal"
            :title="editModal.title"
            :mask-closable="false"
            :closable="false"
            @on-ok="ok"
            @on-cancel="cancel"
            class-name="vertical-center-modal">
            <Row type="flex" justify="center">
                <Form label-position="right" :label-width="70" class="margin-top-20">
                    <FormItem label="类型">
                        <Select v-model="editModal.dbType" placeholder="请选择数据库类型..." style="width: 150px" @on-change="changeDbType">
                            <Option v-for="item in dbTypeList" :value="item.id" :key="item.id" v-if="item.isEtlTarget">{{item.name}}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="数据库">
                        <Select v-model="editModal.dbId"
                            filterable
                            clearable
                            transfer
                            remote
                            label-in-value
                            :loading="editModal.loadingDb"
                            :disabled = "editModal.dbType === '' "
                            @on-change="changeDb"
                            :remote-method="searchDb"
                            ref="modalDb"
                            placeholder="请输入关键字..."
                            style="width:250px" >
                            <OptionGroup v-for="server in serverList" :label="server.serverName" :key="server.id">
                                <Option v-for="db in server.dbList" :value="db.id" :label="db.name" :key="db.id" :disabled="db.importedTableCount === 0">
                                <span>{{ db.name }}</span>
                                <span style="float:right;color:#ccc">{{ db.importedTableCount }} Tables</span>
                                </Option>
                            </OptionGroup>
                        </Select>
                    </FormItem>
                    <FormItem label="表名">
                        <Select
                            v-model="editModal.tableId"
                            filterable
                            clearable
                            transfer
                            remote
                            label-in-value
                            :loading="editModal.loadingTable"
                            ref="modalTable"
                            :disabled = "editModal.dbId=== '' "
                            placeholder="请输入关键字..."
                            @on-change="changeTable"
                            :remote-method="searchTable"
                            style="width: 250px">
                            <Option v-for="table in tableList" :value="table.id" :key="table.id">{{table.tableName}}</Option>
                        </Select>
                    </FormItem>
                </Form>
            </Row>
        </Modal>
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
            editModal: {
                loadingDb: false,
                loadingTable: false,
                showingModal: false,
                position: '',
                title: ''
            },
            dbTypeList:[],
            serverList:[],
            tableList:[]
        };
    },
    methods: {
        editTable(position){
            this.editModal = {showingModal: true, position}

            if(position === 'source'){
                this.editModal.title = '编辑来源表'
            } else {
                this.editModal.title = '编辑目标表'
            }

        },
        removeItem () {
            console.log('remove table');
        },
        handleAdd () {

        },
        ok () {
            if(this.editModal.position === 'source'){
                this.value.sourceServerId = this.editModal.serverId
                this.value.sourceDbId = this.editModal.dbId
                this.value.sourceDbName = this.editModal.dbName
                this.value.sourceTableId = this.editModal.tableId
                this.value.sourceTableName = this.editModal.tableName
            } else {
                this.value.targetServerId = this.editModal.serverId
                this.value.targetDbId = this.editModal.dbId
                this.value.targetDbName = this.editModal.dbName
                this.value.targetTableId = this.editModal.tableId
                this.value.targetTableName = this.editModal.tableName
            }
        },
        cancel () {

        },
        changeDbType () {
            this.$refs.modalDb.clearSingleSelect()
            this.getTop10Db('')
        },
        changeDb (option) {
            this.editModal.dbName = option.label
            this.$refs.modalTable.clearSingleSelect()
            this.tableList = []
            const dbId = option.value
            if(isNaN(dbId)) return;

            this.getTop10Tables('')
        },
        changeTable(option){
            const tableId = option.value
            if(isNaN(tableId)) return;

            const table = this.tableList.filter(table => table.id === tableId)[0]

            if(isNaN(table.id)) return;

            this.editModal.dbType = table.dbType
            this.editModal.serverId = table.serverId
            this.editModal.dbId = table.dbId
            this.editModal.dbName = table.dbName
            this.editModal.tableId = table.id
            this.editModal.tableName = table.tableName
        },

        searchDb: _.debounce(function (keyWord){
            if(keyWord.length < 2 && this.serverList.length >= 5) return;
            this.getTop10Db(keyWord)
        },500),

        getTop10Db(keyWord){
            this.editModal.loadingDb = true
            const dbType = Util.formatNumber(this.editModal.dbType)
            this.getRequest(`/metadata/top10Db?dbType=${dbType}&keyWord=${keyWord}`).then(res=>{
                this.editModal.loadingDb = false
                const result = res.data
                if(result.code === 0){
                    this.serverList = result.data
                }
            })
        },

        searchTable: _.debounce(function (keyWord){
            const filteredList = this.tableList.filter(table => table.tableName.indexOf(keyWord) >= 0)
            if(keyWord.length < 2 && filteredList.length >= 5) return;
            this.getTop10Tables(keyWord);
        },500),

        getTop10Tables(keyWord){
            this.editModal.loadingTable = true
            const dbId = this.editModal.dbId
            this.getRequest(`/metadata/top10Tables?dbId=${dbId}&keyWord=${keyWord}`).then(res => {
                this.editModal.loadingTable = false
                const result = res.data
                if(result.code === 0){
                    this.tableList = result.data
                }
            })
        }
    },
    computed : {
        sourceTableFullName () {
            return this.value.sourceDbName + '.' + this.value.sourceTableName
        },
        targetTableFullName () {
            return this.value.targetDbName + '.' + this.value.targetTableName
        }
    },
    mounted () {
        this.getRequest('/metadata/dbType').then(res =>{
            const result = res.data;
            if(result.code === 0){
                this.dbTypeList = result.data;
            }
        })
    }
};


</script>