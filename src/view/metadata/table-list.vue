<template>
  <div>
    <Row>
      <div style="float: left;">
        <Select
          v-model.number="dbType"
          ref="dbType"
          @on-change="resetSearch"
          clearable
          placeholder="数据库类型..."
          style="width:120px">
          <Option v-for="item in dbTypeList" :value="item.id" :key="item.id">{{item.name}}</Option>
        </Select>
        <Input v-model="keyword" @on-enter="resetSearch" placeholder="请输入关键字..." class="margin-left-5" style="width: 250px" />
        <Button type="primary" shape="circle" icon="md-search" @click="resetSearch" :loading="loadingTable" class="margin-left-5" />
        <Tooltip content="重置查询条件" placement="right">
          <Button shape="circle" icon="md-sync" @click="resetFilter" class="margin-left-5" />
        </Tooltip>
      </div>
      <div style="float: right">
        <Button ghost icon="md-archive" type="primary" @click="showingDrawer = true">导入</Button>
      </div>
    </Row>
    <Row class="margin-top-10">
      <Pagination :total="total" :size="size" @on-page-info-change="changePageInfo" ref="pagination">
        <Table stripe border
        :columns="columnList"
        :data="tableList"
        :loading="loadingTable"
        slot="table"
        size="small" />
      </Pagination>
    </Row>
    <Drawer title="导入表" width="70%" v-model="showingDrawer">
      <ImportTable @close-drawer="showingDrawer = false" @has-new-table="hasNewTable = true" />
    </Drawer>
  </div>
</template>

<script>

import Pagination from '_c/pagination'
import ImportTable from './components/import-table'
import { oneOf } from '@/libs/tools'
import * as metadataApi from '@/api/metadata'

const deleteButton = (vm, h, currentRowData, index) => {
  return h('Poptip', {
    props: {
      // information-circled
      confirm: true,
      title: '您确定要删除这张表吗?',
      transfer: true,
      placement: 'top-end'
    },
    on: {
      'on-ok': () => {
        vm.deleteTable(index, currentRowData.id)
      }
    }
  }, [
    h('Button', {
      props: {
        ghost: true,
        type: 'error',
        size: 'small',
        icon: 'md-trash',
        shape: 'circle'
      }
    })
  ])
}

const openButton = (vm, h, currentRowData) => {
  return h('Button', {
    props: {
      ghost: true,
      type: 'info',
      size: 'small',
      icon: 'md-open',
      shape: 'circle'
    },
    style: {
      marginRight: '10px'
    },
    on: {
      click: () => {
        vm.$router.push({
          name: 'table-detail',
          params: currentRowData
        })
      }
    }
  })
}

const startIcon = (vm, h, currentRowData, index) => {
  return h('Icon', {
    props: {
      size: 20,
      color: currentRowData.isCore === 0 ? '#19be6b' : '#ff9900',
      type: currentRowData.isCore === 0 ? '' : 'star'
    }
  })
}

const initColumnList = [
  {
    key: 'dbType',
    title: '数据库类型',
    width: 110,
    ellipsis: true
  },
  {
    key: 'dbName',
    title: '库名',
    width: 130,
    ellipsis: true
  },
  {
    key: 'tableName',
    title: '表名',
    ellipsis: true
  },
  {
    key: 'isCore',
    title: '核心',
    align: 'center',
    width: 65
  },
  {
    key: 'tableTypeName',
    title: '表类型',
    ellipsis: true,
    align: 'center',
    width: 80
  },
  {
    key: 'tableComment',
    title: '注释'
  },
  {
    key: 'operation',
    title: '操作',
    align: 'center',
    width: 100,
    fixed: 'right'
  }
]

export default {
  name: 'table-list',
  components: {
    Pagination,
    ImportTable
  },
  data () {
    return {
      loadingTable: false,
      showingDrawer: false,
      hasNewTable: false,

      keyword: '',
      dbType: 0,

      total: 0,
      page: 1,
      size: 10,

      columnList: initColumnList,
      tableList: [],

      dbTypeList: this.$store.state.user.dbTypeList
    }
  },
  methods: {
    init () {
      this.columnList.forEach(item => {
        if (!oneOf(item.key, ['isCore', 'dbType', 'operation'])) return

        item.render = (h, param) => {
          const currentRowData = param.row
          switch (item.key) {
            case 'isCore' : return h('a', [ startIcon(this, h, currentRowData, param.index) ])
            case 'dbType' : return h('span', this.dbTypeList[currentRowData.dbType - 1].name)
            case 'operation' : return h('div', [
              openButton(this, h, currentRowData),
              deleteButton(this, h, currentRowData, param.index)
            ])
          }
        }
      })
    },
    resetFilter () {
      this.$refs.dbType.clearSingleSelect()
      this.keyword = ''
    },
    changePageInfo ({ page, size }) {
      this.page = page
      this.size = size
      this.getData()
    },
    resetSearch () {
      this.$refs.pagination.first()
    },
    async getData () {
      this.$Loading.start()
      this.loadingTable = true

      const data = {
        page: this.page,
        size: this.size,
        dbType: this.dbType,
        keyword: this.keyword
      }

      const result = await metadataApi.getTableList(data)
      this.loadingTable = false
      if (result.code === 0) {
        this.$Loading.finish()
        this.tableList = result.data.content
        this.total = result.data.total
      } else {
        this.$Loading.error()
      }
    },
    async deleteTable (index, id) {
      this.loadingTable = true
      const result = await metadataApi.deleteTable(id)
      this.loadingTable = false
      if (result.code === 0) {
        this.tableList.splice(index, 1)
        this.$Message.success('删除了第' + (index + 1) + '行数据')
      } else {
        this.$Message.error('删除失败')
      }
    }
  },
  activated () {
    // this.getData()
  },
  deactivated () {
  },
  mounted () {
    this.getData()
  },
  created () {
    this.init()
  },
  watch : {
    showingDrawer (open) {
      if (!open && this.hasNewTable) {
        this.hasNewTable = false
        this.resetSearch()
      }
    }
  }
}
</script>
