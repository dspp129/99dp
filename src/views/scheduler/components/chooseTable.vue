<template>
    <Modal
        v-model="showing"
        :title="title"
        :mask-closable="false"
        :closable="false"
        class-name="vertical-center-modal">
        <Row type="flex" justify="center">
            <Form label-position="right" :label-width="70" class="margin-top-20">
                <FormItem label="类型">
                    <Select v-model="editModal.dbType" 
                        label-in-value
                        style="width: 150px" 
                        @on-change="changeDbType"
                        placeholder="请选择数据库类型...">
                        <Option v-for="item in dbTypeList" :value="item.id" :key="item.id" :label="item.name" v-if="item.isEtlTarget"></Option>
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
                        placeholder="请输入关键字..."
                        @on-change="changeTable"
                        :remote-method="searchTable"
                        style="width: 250px">
                        <Option v-for="table in tableList" :value="table.id" :key="table.id" :label="table.tableName"></Option>
                    </Select>
                </FormItem>
            </Form>
        </Row>

        <div slot="footer">
            <Button type="ghost" shape="circle" icon="close" @click="cancel" ></Button>
            <Button type="success" shape="circle" icon="checkmark-round" @click="ok" :disabled="!editModal.tableId > 0"></Button>
        </div>

    </Modal>
</template>

<script>

import lodash from 'lodash'

export default {
    name: 'ChooseTable',
    props: {
        show: Boolean,
        title: String,
        dbTypeList: Array
    },
    data () {
        return {
            editModal: {
                loadingDb: false,
                loadingTable: false,
            },

            showing: this.show,

            serverList:[],
            tableList:[]

        }
    },
    methods: {
        ok () {
            this.$emit('onChooseTable', this.editModal)
            this.$emit('onCloseModal')
        },
        cancel () {
            this.$emit('onCloseModal')
        },
        changeDbType (option) {
            this.$refs.modalDb.clearSingleSelect()
            this.getTop10Db('')
        },
        changeDb (option) {
            this.editModal.dbName = option.label
            this.$refs.modalTable.clearSingleSelect()
            this.tableList = []
            const dbId = option.value
            if(!dbId > 0) return;

            this.getTop10Tables('')
        },
        changeTable (option) {
            const tableId = option.value
            if(!tableId > 0) return;

            const table = this.tableList.filter(table => table.id === tableId)[0]

            if(!table.id > 0) return;

            this.editModal.serverId = table.serverId
            this.editModal.tableName = table.tableName
        },

        searchDb: _.debounce(function (keyWord){
            if(keyWord.length < 2 && this.serverList.length >= 5) return;
            this.getTop10Db(keyWord)
        },500),

        getTop10Db (keyWord) {
            this.editModal.loadingDb = true
            const dbType = this.editModal.dbType

            if(dbType <= 0) return;

            this.$http.get(`/api/metadata/top10Db?dbType=${dbType}&keyWord=${keyWord}`).then(res=>{
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

        getTop10Tables (keyWord) {
            this.editModal.loadingTable = true
            const dbId = this.editModal.dbId

            if(dbId <= 0) return;

            this.$http.get(`/api/metadata/top10Tables?dbId=${dbId}&keyWord=${keyWord}`).then(res => {
                this.editModal.loadingTable = false
                const result = res.data
                if(result.code === 0){
                    this.tableList = result.data
                }
            })
        }
    },
    mounted () {
    },
    watch : {
        show (show) {
            this.editModal = {}
            this.showing = show
            this.serverList = []
        }
    }
};
</script>

