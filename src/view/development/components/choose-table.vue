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
            <OptionGroup v-for="conn in connectionList" :label="conn.connectionName" :key="conn.id">
              <Option v-for="db in conn.dbList" :value="db.id" :label="db.name" :key="db.id" :disabled="db.importedTableCount === 0">
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
      <Button shape="circle" icon="md-close" @click="close" />
      <Button type="success" shape="circle" icon="md-checkmark" @click="ok" :disabled="!tableId > 0"/>
    </div>

  </Modal>
</template>

<script>

import lodash from 'lodash'
import * as formatter from '@/libs/format'
import * as metadataApi from '@/api/metadata'

export default {
  name: 'choose-table',
  props: {
    value: Boolean,
    title: String
  },
  data () {
    return {
      loadingDb: false,
      loadingTable: false,

      connectionId: '',
      dbType: '',
      dbId: '',
      dbName: '',
      tableId: '',
      tableName: '',

      dbTypeList: this.$store.state.user.dbTypeList,
      connectionList: [],
      tableList: []
    }
  },
  methods: {
    ok () {
      const editModal = {
        dbType: this.dbType,
        connectionId: this.connectionId,
        dbId: this.dbId,
        dbName: this.dbName,
        tableId: this.tableId,
        tableName: this.tableName
      }
      this.$emit('onChooseTable', editModal)
      this.close()
    },
    close () {
      this.$emit('input', false)

      this.$refs.modalDb.clearSingleSelect()
      this.$refs.dbType.clearSingleSelect()

      this.connectionList = []
      this.tableList = []
    },
    changeDbType (option) {
      this.$refs.modalDb.clearSingleSelect()
      this.getTop10Db('')
    },
    changeDb (option) {
      this.tableList = []
      this.$refs.modalTable.clearSingleSelect()
      if (typeof option === 'undefined') {
        this.dbId = ''
        this.dbName = ''
        this.connectionList = []
      } else {
        this.dbId = option.value
        this.dbName = option.label
        this.getTop10Tables('')
      }
    },
    changeTable (option) {
      if (typeof option === 'undefined') return
      const tableId = option.value
      if (!tableId > 0) return
      const table = this.tableList.filter(table => table.id === tableId)[0]
      if (!table.id > 0) return
      this.connectionId = table.connectionId
      this.tableName = table.tableName
    },
    onQueryChangeDb: _.debounce(function (keyword) {
      if (keyword.length < 2 && this.connectionList.length >= 5) return
      this.getTop10Db(keyword)
    }, 500),
    onQueryChangeTable: _.debounce(function (keyword) {
      const filteredList = this.tableList.filter(table => table.tableName.indexOf(keyword) >= 0)
      if (keyword.length < 2 && filteredList.length >= 5) return
      this.getTop10Tables(keyword)
    }, 500),
    async getTop10Db (keyword) {
      this.loadingDb = true
      this.dbType = formatter.formatNumber(this.dbType)
      if (this.dbType <= 0) return
      const data = {
        dbType: this.dbType,
        keyword
      }
      const result = await metadataApi.top10db(data)
      this.loadingDb = false
      if (result.code === 0) {
        this.connectionList = result.data
      }
    },
    async getTop10Tables (keyword) {
      const dbId = this.dbId
      if (typeof dbId === 'undefined' || dbId <= 0) return
      const data = { dbId, keyword }
      this.loadingTable = true
      const result = await metadataApi.top10table(data)
      this.loadingTable = false
      if (result.code === 0) {
        this.tableList = result.data
      }
    }
  },
  mounted () {
  }
}
</script>
