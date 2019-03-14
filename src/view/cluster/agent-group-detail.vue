<template>
  <Card icon="social-buffer" title="组详情">
    <Row>
      <div style="float: left;">
        <Select
          v-model="status"
          ref="status"
          @on-change="resetSearch"
          clearable
          placeholder="状态"
          style="width:80px">
          <Option v-for="item in statusList" :value="item.id" :key="item.id">{{item.name}}</Option>
        </Select>
        <Input v-model="keyword" @on-enter="resetSearch" @on-blur="resetSearch" placeholder="请输入执行器名称..." style="width: 180px" />
        <Input v-model="host" @on-enter="resetSearch" @on-blur="resetSearch" placeholder="请输入host..." style="width: 180px" />
        <Button type="primary" shape="circle" icon="md-search" @click="resetSearch" :loading="loadingTable"/>
        <Button shape="circle" icon="md-sync" @click="resetFilter"/>
      </div>
    </Row>
    <Row class="margin-top-10">
      <Pagination :total="total" :size="size" @on-page-info-change="changePageInfo" ref="pagination">
      <Table stripe
        :columns="columnList"
        :data="tableList"
        :loading="loadingTable"
        slot="table"
        size="small"/>
      </Pagination>
    </Row>
  </Card>
</template>

<script>

import Pagination from '_c/pagination'
import * as formatter from '@/libs/format'

const statusList = [
  {
    id: 1,
    name: '正常'
  },
  {
    id: 0,
    name: '失联'
  },
  {
    id: 2,
    name: '错误'
  }
]

const editButton = (vm, h, currentRowData) => {
  return h('Button', {
    props: {
      type: 'info',
      size: 'small',
      icon: 'md-create',
      shape: 'circle'
    },
    style: {
      //  marginRight: '10px'
    },
    on: {
      click: () => {
        vm.agent = JSON.parse(JSON.stringify(currentRowData))
        vm.openModal()
      }
    }
  })
}

const statusTag = (vm, h, currentRowData, index) => {
  return h('Tag', {
    props: {
      color: currentRowData.status === 1 ? 'green' : 'red'
    }
  }, currentRowData.status === 1 ? '正 常' : '失 联')
}

const warningTag = (vm, h, currentRowData, index) => {
  return h('Tag', {
    props: {
      color: currentRowData.warning ? 'green' : 'yellow'
    }
  }, currentRowData.warning ? '启 动' : '忽 略')
}

const initColumnList = [
  {
    key: 'name',
    title: '执行器名称',
    ellipsis: true
  },
  {
    key: 'host',
    title: 'Host',
    ellipsis: true
  },
  {
    key: 'username',
    title: '负责人',
    align: 'center',
    ellipsis: true
  },
  {
    key: 'status',
    title: '通信状态',
    align: 'center',
    width: 100
  },
  {
    key: 'warning',
    title: '失联报警',
    align: 'center',
    width: 100
  },
  {
    key: 'comment',
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
  name: 'agent-group-detail',
  components: {
    Pagination
  },
  data () {
    return {
      loadingTable: false,
      showingWindow: false,

      keyword: '',
      host: '',
      status: '',

      total: 0,
      page: 1,
      size: 10,

      agent: {},

      columnList: [],
      tableList: [],
      userList: this.$store.state.user.userList,
      statusList: []
    }
  },
  methods: {
    init () {
      this.statusList = statusList
      this.columnList = initColumnList
      this.columnList.forEach(item => {
        if (item.key === 'status') {
          item.render = (h, param) => {
            const currentRowData = param.row
            return h('a', [
              statusTag(this, h, currentRowData, param.index)
            ])
          }
        }

        if (item.key === 'warning') {
          item.render = (h, param) => {
            const currentRowData = param.row
            return h('a', [
              warningTag(this, h, currentRowData, param.index)
            ])
          }
        }

        if (item.key === 'operation') {
          item.render = (h, param) => {
            const currentRowData = param.row
            return h('div', [
              editButton(this, h, currentRowData)
            ])
          }
        }
      })
    },
    resetFilter () {
      this.$refs.status.clearSingleSelect()
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
    getData () {
      this.loadingTable = true
      const page = this.filter.page
      const size = this.filter.size
      const status = formatter.formatNumber(this.status)

      this.getRequest(`/cluster/agent/list?keyword=${this.keyword}&host=${this.host}&size=${size}&page=${page}&status=${status}`).then(res => {
        this.loadingTable = false
        const result = res.data
        if (result.code === 0) {
          this.tableList = result.data.content
          this.total = result.data.total
        }
      })
    },
    openModal () {
      this.showingWindow = true
    },
    closeModal () {
      this.showingWindow = false
    },
    asyncOK () {
      this.$refs.agent.validate((valid) => {
        if (valid) {
          this.savingAgent = true
          this.patchRequest('/cluster/agent/save', this.agent).then(res => {
            const result = res.data
            if (result.code === 0) {
              this.$Message.success('操作成功')
              this.closeModal()
              this.getData()
            } else {
              this.$Message.error(result.msg)
            }
          })
        } else {
          this.$Message.error('Fail!')
        }
      })
    },
    onChange () {
      this.icon = ''
    }
  },
  activated () {
  },
  deactivated () {
  },
  mounted () {
    this.getData()
  },
  created () {
    this.init()
  },
  watch: {
  }
}
</script>
