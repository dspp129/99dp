<template>
  <div>
    <Row>
      <Col>
        <Select v-model.number="dbType"
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
          class="margin-left-5"
          style="width:250px" >
          <OptionGroup v-for="conn in connectionList" :label="conn.connectionName" :key="conn.id">
            <Option v-for="db in conn.dbList" :value="db.id" :label="db.name" :key="db.id">
              <span>{{ db.name }}</span>
              <span style="float:right;color:#ccc">{{ db.tableCount }} Tables</span>
            </Option>
          </OptionGroup>
        </Select>

        <Tooltip transfer placement="top">
          <Button shape="circle" icon="md-help" size="small" class="margin-left-5" />
          <span slot="content">
            未找到数据库？<br/>
            进入<a type="text" href="#" @click.prevent="openConnectionList"> 数据集成</a>，刷新连接。
          </span>
        </Tooltip>

        <Input search v-model="keyword" placeholder="请输入表名关键字..." @on-search="resetSearch" class="margin-left-5" style="width: 250px;" />

        <Tooltip transfer placement="top">
          <Button shape="circle" icon="md-help" size="small" class="margin-left-5" />
          <span slot="content">
            未找到表？<br/>
            请检查表是否存在。
          </span>
        </Tooltip>
        <div style="float: right;">
          <Button icon="md-archive"
            type="primary"
            @click="importTable"
            :loading="importingTable"
            :disabled="importList.length === 0">导入</Button>
        </div>
      </Col>
    </Row>
    <Row class="margin-top-10">
      <Col>
        <Pagination :total="total" :size="size" @on-page-info-change="changePageInfo" ref="pagination">
          <Table slot="table" size="small" border
          ref="tmpList"
          :data="tableList"
          :columns="columnsList"
          :loading="loadingTable"
          @on-selection-change="onSelectionChange" />
        </Pagination>
      </Col>
    </Row>
  </div>
</template>

<script>

import lodash from 'lodash'
import Pagination from '_c/pagination'
import * as metadataApi from '@/api/metadata'

const initColumnList = [
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
    width: 60
  }
]

export default {
  name: 'import-table',
  components: {
    Pagination
  },
  props: {
    value: Boolean
  },
  data () {
    return {
      connectionId: '',
      dbType: 0,
      dbId: 0,
      dbName: '',
      keyword: '',
      total: 0,
      page: 1,
      size: 10,

      loadingDb: false,
      loadingTable: false,
      importingTable: false,

      dbTypeList: this.$store.state.user.dbTypeList,

      columnsList: initColumnList,
      tableList: [],
      connectionList: [],
      importList: []
    }
  },
  methods: {
    reset () {
      this.total = 0
      this.page = 1
      this.$refs.dbType.clearSingleSelect()
      this.connectionList = []
      this.tableList = []
    },
    changeDbType (option) {
      this.$refs.modalDb.clearSingleSelect()
      this.getTop10Db('')
    },
    changeDb (option) {
      this.keyword = ''
      this.tableList = []
      if (typeof option === 'undefined') {
        this.dbId = ''
        this.dbName = ''
        this.connectionId = ''
        this.connectionList = []
      } else {
        this.dbId = option.value
        this.dbName = option.label
        let dbList = []
        this.connectionList.forEach(e => {
          dbList = dbList.concat(e.dbList)
        })
        dbList.forEach(e => {
          if (e.id === this.dbId) {
            this.connectionId = e.connectionId
          }
        })
      }
    },
    onQueryChange: _.debounce(function (keyword) {
      if (keyword.length < 2 && this.connectionList.length >= 5) return
      this.getTop10Db(keyword)
    }, 1500),
    async getTop10Db (keyword) {
      const data = {
        dbType: this.dbType,
        keyword
      }
      this.loadingDb = true
      const result = await metadataApi.top10db(data)
      this.loadingDb = false
      if (result.code !== 0) return
      this.connectionList = result.data
    },
    resetSearch () {
      this.$refs.pagination.first()
    },
    async getTable () {
      this.importList = []
      if (!this.dbId > 0) {
        this.$Message.error('请选择数据库')
        return
      }

      const data = {
        connectionId: this.connectionId,
        dbType: this.dbType,
        dbId: this.dbId,
        dbName: this.dbName,
        keyword: this.keyword,
        page: this.page,
        size: this.size
      }

      this.loadingTable = true
      const result = await metadataApi.getRemoteTable(data)
      this.loadingTable = false
      if (result.code !== 0) return
      this.tableList = result.data.content
      this.total = result.data.total
    },
    onSelectionChange (e) {
      this.importList = e.map(row => {
        return {
          connectionId: this.connectionId,
          dbId: this.dbId,
          dbName: this.dbName,
          tableName: row.tableName
        }
      })
    },
    async importTable () {
      this.importingTable = true
      this.$Message.loading({
        content: '正在导入 ' + this.importList.length + ' 张表，请稍后。',
        duration: 10
      })
      const result = await metadataApi.importTable(this.importList)
      this.importingTable = false
      this.$Message.destroy()
      if (result.code !== 0) {
        this.$Message.error(result.msg)
        return
      } else {
        this.$Message.success('导入成功')
        this.$emit('has-new-table')
      }
    },
    openConnectionList () {
      this.$emit('close-drawer')
      this.reset()
      this.$router.push({
        name: 'connection-list'
      })
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
    changePageInfo ({ page, size }) {
      this.page = page
      this.size = size
      this.getTable()
    }
  },
  mounted () {
  },
  computed: {
  },
  watch: {
  }
}
</script>
