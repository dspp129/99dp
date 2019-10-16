<template>
  <div>
    <Row>
      <div class="margin-bottom-10">
        <Select
          v-model.number="userId"
          @on-change="resetSearch"
          clearable
          placeholder="创建人"
          style="width:100px;">
          <Option v-for="item in userList" :value="item.id" :key="item.id">{{item.realName}}</Option>
        </Select>
        <Select
          v-model.number="groupType"
          @on-change="resetSearch"
          clearable
          placeholder="类型"
          class="margin-left-5"
          style="width:100px;">
          <Option :value="0">全 部</Option>
          <Option :value="1">日 常</Option>
          <Option :value="2">手 动</Option>
        </Select>
        <HistoryDatePicker @on-date-change="onDateChange" placement="bottom-start" class="margin-left-5" />

        <Input v-model="keyword"
          placeholder="请输入名称..."
          @on-enter="resetSearch"
          clearable
          class="margin-left-5"
          style="width: 230px" />
        <Button type="primary" shape="circle" icon="md-search" @click="resetSearch" :loading="loadingTable" class="margin-left-5" />
      </div>
    </Row>
    <Row class="margin-top-10">
      <Pagination :total="total" :size="size" @on-page-info-change="changePageInfo" ref="pagination">
        <Table stripe
        :columns="columnList"
        :data="dataList"
        :loading="loadingTable"
        size="small"
        slot="table" />
      </Pagination>
    </Row>
  </div>
</template>

<script>

import * as formatter from '@/libs/format'
import { oneOf } from '@/libs/tools'
import Pagination from '_c/pagination'
import HistoryDatePicker from '_c/history-date-picker'
import * as recordApi from '@/api/record'

const initColumnList = [
  {
    key: 'username',
    title: '创建人',
    width: 90,
    ellipsis: true
  },
  {
    key: 'groupType',
    title: '类型',
    width: 100
  },
  {
    key: 'groupName',
    title: '名称',
    ellipsis: true,
    tooltip: true
  },
  {
    key: 'progress',
    title: '运行状态',
    align: 'center',
    width: 300
  },
  {
    key: 'createTime',
    title: '创建时间',
    align: 'center',
    width: 150
  }
]

export default {
  name: 'record-group',
  components: {
    Pagination,
    HistoryDatePicker
  },
  data () {
    return {
      showingModal: false,
      jobId: 0,
      recordId: 0,
      groupId: 0,
      groupType: 0,
      fireTime: '',

      loadingTable: false,
      startDate: '',
      endDate: '',
      taskType: 0,
      keyword: '',
      userId: this.$store.state.user.userId,
      agentId: 0,
      currentStatus: '',
      warning: 1,

      total: 0,
      page: 1,
      size: 10,

      columnList: initColumnList,
      dataList: [],
      userList: this.$store.state.user.userList,
    }
  },
  methods: {
    init () {
      this.columnList.forEach(item => {
        if (!oneOf(item.key, [
          'groupName',
          'progress',
          'groupType'
        ])) return

        item.render = (h, param) => {
          const currentRowData = param.row
          const isManual = currentRowData.recordIds && currentRowData.recordIds.length > 0
          switch (item.key) {
            case 'groupName' : 
              return h('a', {
                on: {
                  click: () => {
                    this.$store.state.dag.model = {
                      type: 'group',
                      id: currentRowData.groupId
                    }
                    this.$router.push({
                      name: 'record-dag'
                    })
                  }
                }
              }, currentRowData.groupName)
            case 'progress':
              break
            case 'groupType':
              return h('Tag', {
                props: {
                  color: isManual ? 'gold' : 'green'
                }
              }, isManual ? '手 动' : '日 常')
          }
        }
      })
    },
    resetSearch () {
      this.$refs.pagination.first()
    },
    onDateChange (date) {
      if (date[0] === '') {
        this.startDate = this.endDate = ''
      } else {
        this.startDate = formatter.formatDate(date[0])
        this.endDate = formatter.formatDate(date[1])
      }
      this.resetSearch()
    },
    async getData () {
      this.loadingTable = true
      const data = {
        page: this.page,
        size: this.size,
        userId: formatter.formatNumber(this.userId),
        keyword: this.keyword,
        groupType: this.groupType,
        startDate: this.startDate,
        endDate: this.endDate
      }
      const result = await recordApi.getRecordGroupList(data)
      this.loadingTable = false
      if (result.code !== 0) {
        this.$Loading.error()
        this.dataList = []
        this.total = 0
        return
      }

      this.dataList = result.data.content.map(item => {
        item.createTime = formatter.formatDateTime(item.createTime)
        return item
      })
      this.total = result.data.total
    },
    changePageInfo ({ page, size }) {
      this.page = page
      this.size = size
      this.getData()
    }
  },
  activated () {
  },
  mounted () {
    // this.getData() // 日期初始化自动触发
  },
  created () {
    this.init()
    document.onkeydown = e => {
      e = window.event || e
      var keycode = e.keyCode || e.which
      if (keycode === 116) {
        if (window.event) { // ie
          try { e.keyCode = 0 } catch (e) {}
          e.returnValue = false
        } else { // firefox
          e.preventDefault()
        }
      }
    }
  }
}
</script>
