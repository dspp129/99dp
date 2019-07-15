<style lang="less">
  @import './record-list.less';
</style>

<template>
  <div>
    <Row>
      <transition name="openness-con">
        <div v-show="advancedQuery" class="openness-radio-con ">
          <div class="margin-bottom-10">
            <Select
              v-model.number="userId"
              @on-change="resetSearch"
              clearable
              placeholder="负责人"
              style="width:100px;">
              <Option v-for="item in userList" :value="item.id" :key="item.id">{{item.realName}}</Option>
            </Select>
            <Select v-model="agentId" placeholder="执行器" clearable @on-change="resetSearch" class="margin-left-5" style="width: 200px;">
              <Option v-for="item in agentList" :value="item.agentId" :key="item.agentId">{{item.name}}</Option>
            </Select>
            <HistoryDatePicker @on-date-change="onDateChange" :placement="'bottom-start'" class="margin-left-5" />
          </div>
        </div>
      </transition>
    </Row>
    <Row>
      <div style="float: left;">
        <Select
          v-model.number="taskType"
          @on-change="resetSearch"
          clearable
          placeholder="任务类型"
          style="width:100px">
          <Option v-for="item in taskTypeList" :value="item.id" :key="item.id">{{item.description}}</Option>
        </Select>
        <Select
          v-model="currentStatus"
          ref="currentStatus"
          @on-change="resetSearch"
          clearable
          label-in-value
          placeholder="运行状态"
          class="margin-left-5"
          style="width:100px">
          <Option :value="-1" label="　等　待" />
          <Option :value="1" label="　执行中" />
          <Option :value="2" label="　成　功" />
          <Option :value="3" label="　失　败" />
          <Option :value="4" label="　被　杀" />
          <Option :value="5" label="　超　时" />
        </Select>
        <Select
          v-model="warning"
          ref="warning"
          @on-change="resetSearch"
          clearable
          placeholder="失败通知"
          class="margin-left-5"
          style="width:120px">
          <Option :value="0">无通知</Option>
          <Option :value="1">邮件通知</Option>
        </Select>
        <Input v-model="keyword"
          placeholder="请输入调度名称..."
          @on-enter="resetSearch"
          clearable
          class="margin-left-5"
          style="width: 230px" />
        <Button type="primary" shape="circle" icon="md-search" @click="resetSearch" :loading="loadingTable" class="margin-left-5" />
        <Tooltip content="重置查询条件" placement="right">
          <Button shape="circle" icon="md-sync" @click="resetFilter" class="margin-left-5"/>
        </Tooltip>
      </div>
      <div style="float: right;">
        <Button v-show="!advancedQuery" @click="openAdvancedQuery" type="primary" icon="ios-arrow-down">高级查询</Button>
        <Button  v-show="advancedQuery" @click="closeAdvancedQuery" icon="ios-arrow-up">收起</Button>
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
    <KickoffTask :id="jobId" :defaultFireTime="fireTime" v-model="showingModal" @onSubmit="getData"/>
  </div>
</template>

<script>

import * as formatter from '@/libs/format'
import { mapMutations } from 'vuex'
import { renderExecType, renderSuccess, renderOperation } from './components/record-util'
import { oneOf } from '@/libs/tools'
import KickoffTask from '_c/kickoff-task'
import Pagination from '_c/pagination'
import HistoryDatePicker from '_c/history-date-picker'
import * as recordApi from '@/api/record'
import * as clusterApi from '@/api/cluster'

const initColumnList = [
  {
    key: 'taskTypeDesc',
    title: '任务类型',
    width: 90,
    ellipsis: true
  },
  {
    key: 'jobName',
    title: '调度名称',
    ellipsis: true,
    tooltip: true
  },
  {
    key: 'execType',
    title: '执行方式',
    align: 'center',
    width: 90
  },
  {
    key: 'fireTime',
    title: '计划时间',
    align: 'center',
    width: 150
  },
  {
    key: 'startTime',
    title: '开始时间',
    align: 'center',
    width: 150
  },
  {
    key: 'durationTime',
    title: '运行时长',
    align: 'center',
    ellipsis: true,
    tooltip: true,
    width: 120
  },
  {
    key: 'success',
    title: '运行状态',
    align: 'center',
    width: 100
  },
  {
    key: 'operation',
    title: '操作',
    align: 'center',
    fixed: 'right',
    width: 140
  }
]

export default {
  name: 'record-list',
  components: {
    Pagination,
    HistoryDatePicker,
    KickoffTask
  },
  data () {
    return {
      showingModal: false,
      jobId: 0,
      fireTime: '',

      loadingTable: false,
      advancedQuery: false,
      enableSearch: true,
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
      agentList: [],
      userList: this.$store.state.user.userList,
      taskTypeList: this.$store.state.user.taskTypeList
    }
  },
  methods: {
    ...mapMutations([
      'removeTask'
    ]),
    init () {
      this.columnList.forEach(item => {
        if (!oneOf(item.key, [
          'execType',
          'success',
          'operation',
          'jobName'
        ])) return

        item.render = (h, param) => {
          const currentRowData = param.row
          switch (item.key) {
            case 'execType' : return renderExecType(h, currentRowData)
            case 'success' : return renderSuccess(h, currentRowData)
            case 'operation' : return renderOperation(h, currentRowData, this)
          }

          if (item.key === 'jobName') {
            return h('a', {
              on: {
                click: () => {
                  const params = {
                    id: currentRowData.jobId,
                    title: currentRowData.jobName,
                    taskType: currentRowData.taskType
                  }
                  const name = 'task-' + currentRowData.taskTypeName
                  this.openTask(name, params)
                }
              }
            },
            currentRowData.jobName)
          }
        }
      })
      this.initCluster()
    },
    async initCluster () {
      const result = await clusterApi.getAgentNameList()
      if (result.code !== 0) return
      this.agentList = result.data.filter(e => e.agentId > 0)
    },
    openTask (name, params) {
      this.removeTask(params.id)
      this.$router.push({ name, params })
    },
    openAdvancedQuery () {
      this.advancedQuery = true
    },
    closeAdvancedQuery () {
      this.advancedQuery = false
    },
    resetFilter () {
      // 关闭自动触发查询
      this.enableSearch = false
      this.keyword = ''
      this.currentStatus = ''
      this.taskType = ''
      this.userId = this.$store.state.user.userId
      // 打开自动触发查询
      this.enableSearch = true
    },
    resetSearch () {
      if (this.enableSearch) {
        this.$refs.pagination.first()
      }
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
      let status = ''
      let success = ''
      switch (this.currentStatus) {
        case -1: status = '-1'; break
        case 1: status = '0'; break // 执行 && success = 1
        case 2: success = '1'; break // 成功
        case 3: success = '0'; break // 失败
        case 4: success = '2'; break // 被杀 && success in (2,3)
        case 5: success = '3'; break
      }

      const data = {
        status: status,
        success: success,
        page: this.page,
        size: this.size,
        taskType: formatter.formatNumber(this.taskType),
        userId: formatter.formatNumber(this.userId),
        warning: formatter.formatNumber(this.warning),
        agentId: this.agentId,
        keyword: this.keyword,
        startDate: this.startDate,
        endDate: this.endDate
      }

      this.loadingTable = true
      const result = await recordApi.getRecordList(data)
      this.loadingTable = false
      if (result.code !== 0) {
        this.$Loading.error()
        this.dataList = []
        this.total = 0
        return
      }
      this.dataList = result.data.content.map(item => {
         item.fireTime = formatter.formatDateTime(item.fireTime)
         item.startTime = formatter.formatDateTime(item.startTime)
         item.endTime = formatter.formatDateTime(item.endTime)
         item.durationTime = formatter.timeDiff(item.startTime, item.endTime)
        return item
      })
      this.total = result.data.total
    },
    changePageInfo ({ page, size }) {
      this.page = page
      this.size = size
      this.getData()
    },
    rerun (record) {
      this.jobId = record.jobId
      this.fireTime = record.fireTime
      this.showingModal = true
    }
  },
  activated () {
  },
  mounted () {
    // this.getData() // 日期初始化自动触发
  },
  created () {
    this.init()
    document.onkeydown = (e) => {
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
