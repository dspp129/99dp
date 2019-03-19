<template>
  <div>
    <Row>
      <Select transfer
        v-model="execType"
        ref="execType"
        @on-change="resetSearch"
        clearable
        placeholder="执行方式"
        style="width:100px">
        <Option v-for="item in execTypeList" :value="item.id" :key="item.id">{{item.name}}</Option>
      </Select>
      <Select transfer
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
      <DateRangePicker @on-date-change="onDateChange" :placement="'bottom-start'" class="margin-left-5" />
      <Button type="primary" shape="circle" icon="md-search" @click="startSearch" :loading="loadingTable" class="margin-left-5" />
      <Button shape="circle" icon="md-sync" @click="resetFilter" class="margin-left-5" />
    </Row>

    <Row class="margin-top-10">
      <Pagination :total="total" :size="size" @on-page-info-change="changePageInfo" ref="pagination">
        <Table stripe :columns="columnList" :data="taskList" size="small" slot="table" :loading="loadingTable" />
      </Pagination>
              <!--
                </TabPane>
                <TabPane label="趋势分析" name="name2">
                    <Card icon="stats-bars" title="时间趋势">
                        <div style="height: 300px;">
                            <TimeTrend :dateRange="dateRange" :data="trendData"></TimeTrend>
                        </div>
                    </Card>
                    <Card icon="pie" title="成功率" class="margin-top-10">
                        <div style="height: 300px;">
                            <SuccessRatePie :data="pieData"></SuccessRatePie>
                        </div>
                    </Card>
                </TabPane>
            </Tabs>
          -->
    </Row>
    <KickoffTask :id="jobId" :defaultFireTime="fireTime" v-model="showingModal"/>
  </div>
</template>

<script>

const execTypeList = [
  {
    id: 0,
    name: '　自　动'
  },
  {
    id: 1,
    name: '　手　动'
  },
  {
    id: 2,
    name: '　重　跑'
  }
]

const initColumnList = [
  {
    key: 'command',
    title: '执行命令',
    tooltip: true,
    ellipsis: true
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
    width: 160
  },
  {
    key: 'startTime',
    title: '开始时间',
    align: 'center',
    width: 160
  },
  {
    key: 'durationTime',
    title: '运行时长',
    align: 'center',
    width: 160
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
    width: 150
  }
]

import * as formatter from '@/libs/format'
import * as recordApi from '@/api/record'
import { renderExecType, renderSuccess, renderOperation } from './components/record-util'
import { oneOf } from '@/libs/tools'
import Pagination from '_c/pagination'
import KickoffTask from '_c/kickoff-task'
import DateRangePicker from '_c/date-range-picker'
import SuccessRatePie from '_c/success-rate-pie'
import moment from 'moment'

export default {
  name: 'record-history',
  components: {
    Pagination,
    DateRangePicker,
    KickoffTask,
    SuccessRatePie
  },
  props: {
    value: {
      type: Array,
      default: () => []
    },
    id: Number
  },
  data () {
    return {
      showingModal: false,
      jobId: 0,
      fireTime: '',

      loadingTable: false,
      enableSearch: false,

      startDate: '',
      endDate: '',
      dateRange: [],
      trendData: [],
      pieData: [],

      currentStatus: '',

      total: 0,
      page: 1,
      size: 10,

      columnList: [],
      taskList: [],

      execType: '',
      execTypeList
    }
  },
  methods: {
    init () {
      this.columnList = initColumnList
      this.columnList.forEach(item => {
        if (!oneOf(item.key, [
          'execType',
          'success',
          'operation'
        ])) return

        item.render = (h, param) => {
          const currentRowData = param.row
          switch (item.key) {
            case 'execType' : return renderExecType(h, currentRowData)
            case 'success' : return renderSuccess(h, currentRowData)
            case 'operation' : return renderOperation(h, currentRowData, this)
          }
        }
      })
    },
    resetSearch () {
      this.$refs.pagination.first()
    },
    resetFilter () {
      this.currentStatus = ''
    },
    changePageInfo ({ page, size }) {
      this.page = page
      this.size = size
      this.getData()
    },
    onDateChange (date) {
      if (date[0] === '') {
        this.startDate = this.endDate = ''
      } else {
        this.startDate = formatter.formatDate(date[0])
        this.endDate = formatter.formatDate(date[1])
        // this.loadECharts()
      }
      this.resetSearch()
    },
    startSearch () {
      this.enableSearch = true
      this.getData()
    },
    async getData () {
      if (!this.enableSearch) return

      const taskId = formatter.formatNumber(this.id)
      if (taskId < 0) return

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

      const reg = /^[0-9]+$/
      if (!reg.test(this.execType)) {
        this.execType = ''
      }

      const data = {
        page: this.page,
        size: this.size,
        execType: this.execType,
        startDate: this.startDate,
        endDate: this.endDate,
        status: status,
        success: success,
        taskId: taskId
      }

      this.loadingTable = true
      const result = await recordApi.getRecordList(data)
      this.loadingTable = false

      if (result.code !== 0) {
        this.taskList = []
        this.total = 0
        return
      }
      this.taskList = result.data.content.map(item => {
        item.durationTime = formatter.timeDiff(item.startTime, item.endTime)
        item.fireTime = formatter.formatDateTime(item.fireTime)
        item.startTime = formatter.formatDateTime(item.startTime)
        item.endTime = formatter.formatDateTime(item.endTime)
        return item
      })
      this.total = result.data.total

      this.taskList.total = this.total
      this.taskList.page = this.page
      this.taskList.size = this.size
      this.$emit('input', this.taskList)
    },
    loadECharts () {
      if (!this.enableSearch) return

      const taskId = formatter.formatNumber(this.id)
      if (taskId < 0) return

      const dateRange = []
      let addDate = this.startDate
      while (addDate <= this.endDate) {
        dateRange.push(addDate)
        addDate = moment(addDate).add(1, 'days').format('YYYY-MM-DD')
      }

      this.dateRange = dateRange

      this.getRequest(`/echarts/recordLine?taskId=${taskId}&startDate=${this.startDate}&endDate=${this.endDate}`).then(res => {
        const result = res.data
        if (result.code === 0) {
          console.log(result.data)
          this.trendData = result.data
        }
      })

      this.getRequest(`/echarts/recordPie?taskId=${taskId}&startDate=${this.startDate}&endDate=${this.endDate}`).then(res => {
        const result = res.data
        if (result.code === 0) {
          this.pieData = result.data
        }
      })
    },
    onCurrentChange (current) {
      this.current = current
      this.getData()
    },
    rerun (record) {
      this.jobId = record.jobId
      this.fireTime = formatter.formatDateTime(record.fireTime)
      this.showingModal = true
    }
  },
  mounted () {
    this.init()
  },
  watch: {
    id () {
      this.taskList = this.value
      this.total = this.value.total > 0 ? this.value.total : 0
      this.page = this.value.page > 0 ? this.value.page : 1
      this.size = this.value.size > 0 ? this.value.size : 10
    }
  },
  created () {
  }
}
</script>
