<template>
    <Modal
        v-model="value"
        :title="title"
        :mask-closable="false"
        :closable="false"
        class-name="modal-vertical-center">
        <Row type="flex" justify="center">
            <Form label-position="right" :label-width="70" class="margin-top-20">
                <FormItem label="类型">
                    <Select v-model="dbType" 
                        ref="dbType"
                        clearable
                        label-in-value
                        style="width: 150px" 
                        @on-change="changeDbType"
                        placeholder="数据库类型...">
                        <Option v-for="item in dbTypeList" :value="item.id" :key="item.id" v-if="item.isEtlTarget">{{item.name}}</Option>
                    </Select>
                </FormItem>
                <FormItem label="数据库">
                    <Select v-model="dbId"
                        ref="modalDb"
                        filterable
                        clearable
                        transfer
                        remote
                        label-in-value
                        :loading="loadingDb"
                        @on-change="changeDb"
                        @on-query-change="onQueryChangeDb"
                        placeholder="请输入数据库名..."
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
                        v-model="tableId"
                        filterable
                        clearable
                        transfer
                        remote
                        label-in-value
                        :loading="loadingTable"
                        ref="modalTable"
                        placeholder="请输入关键字..."
                        @on-change="changeTable"
                        @on-query-change="onQueryChangeTable"
                        style="width: 250px">
                        <Option v-for="table in tableList" :value="table.id" :key="table.id">{{table.tableName}}</Option>
                    </Select>
                </FormItem>
            </Form>
        </Row>

        <div slot="footer">
            <Button type="ghost" shape="circle" icon="close" @click="close" ></Button>
            <Button type="success" shape="circle" icon="checkmark-round" @click="ok" :disabled="!tableId > 0"></Button>
        </div>

    </Modal>
</template>

<script>

import lodash from 'lodash'
import Util from '@/libs/util';

export default {
    name: 'ChooseTable',
    props: {
        value: Boolean,
        title: String,
        dbTypeList: Array
    },
    data () {
        return {

            loadingDb: false,
            loadingTable: false,

            serverId: '',
            dbType: '',
            dbId: '',
            dbName: '',
            tableId: '',
            tableName : '',

            serverList:[],
            tableList:[]

        }
    },
    methods: {
        ok () {
            const editModal = { 
                dbType: this.dbType ,
                serverId: this.serverId ,
                dbId: this.dbId ,
                dbName: this.dbName ,
                tableId: this.tableId,
                tableName: this.tableName 
            };
            this.$emit('onChooseTable', editModal)
            this.close()
        },
        close () {
            this.$emit('input', false)
            
            this.$refs.modalDb.clearSingleSelect()
            this.$refs.dbType.clearSingleSelect()

            this.serverList = []
            this.tableList = []
        },
        changeDbType (option) {
            this.$refs.modalDb.clearSingleSelect()
            this.getTop10Db('')
        },
        changeDb (option) {

            this.tableList = []
            this.$refs.modalTable.clearSingleSelect()
            if(typeof option === 'undefined') {
                this.dbId = ''
                this.dbName = ''
                this.serverList = []
            } else {
                this.dbId = option.value
                this.dbName = option.label
                this.getTop10Tables('')
            }

        },
        changeTable (option) {

            if(typeof option === 'undefined') {
                return;
            }
            const tableId = option.value
            if(!tableId > 0) return;

            const table = this.tableList.filter(table => table.id === tableId)[0]
            if(!table.id > 0) return;

            this.serverId = table.serverId
            this.tableName = table.tableName
        },
        onQueryChangeDb: _.debounce(function (keyWord){
            if(keyWord.length < 2 && this.serverList.length >= 5) return;
            this.getTop10Db(keyWord)
        },500),
        onQueryChangeTable: _.debounce(function (keyWord){
            const filteredList = this.tableList.filter(table => table.tableName.indexOf(keyWord) >= 0)
            if(keyWord.length < 2 && filteredList.length >= 5) return;
            this.getTop10Tables(keyWord);
        },500),
        getTop10Db (keyWord) {
            this.loadingDb = true
            this.dbType = Util.formatNumber(this.dbType)

            if(this.dbType <= 0) return;

            this.getRequest(`/metadata/top10Db?dbType=${this.dbType}&keyWord=${keyWord}`).then(res=>{
                this.loadingDb = false
                const result = res.data
                if(result.code === 0){
                    this.serverList = result.data
                }
            })
        },
        getTop10Tables (keyWord) {
            this.loadingTable = true
            const dbId = this.dbId

            if(dbId === undefined || dbId <= 0 ) return;

            this.getRequest(`/metadata/top10Tables?dbId=${dbId}&keyWord=${keyWord}`).then(res => {
                this.loadingTable = false
                const result = res.data
                if(result.code === 0){
                    this.tableList = result.data
                }
            })
        }
    },
    mounted () {
    }
};
</script>

