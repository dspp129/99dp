<template>
  <div>
    <Row>
      <Select v-model="recentHour" size="large" @on-change="onChangeSelect" style="width:100px">
        <Option v-for="i in 12" :value="i" :key="i">最近{{ i }}小时</Option>
      </Select>
      <!--
      <RadioGroup v-model="radio" type="button" size="large" @on-change="onChangeRadio">
        <Radio :disabled="showSpin" :label="1">1小时</Radio>
        <Radio :disabled="showSpin" :label="2">12小时</Radio>
        <Radio :disabled="showSpin" :label="3">24小时</Radio>
      </RadioGroup>
      -->
      <DatePicker v-model="selectedDate" size="large" type="date" placeholder="自定义日期" :options="dateOptions" class="margin-left-5" @on-change="onChangeDate" style="width: 120px" />
      <span class="margin-left-10">
        展示时间：{{ startDate }} 至 {{ endDate }}
      </span>
      <Slider v-model="range" :min="0" :max="23" range show-stops :disabled="radio > 0" @on-change="onChangeDate" />
    </Row>
    <Row class="margin-top-10">
      <Card shadow>
        <TrendCpu v-model="trend" :loading="showSpin" style="height: 350px;"/>
      </Card>
      <Card shadow class="margin-top-10">
        <TrendMemory v-model="trend" :loading="showSpin" style="height: 350px;"/>
      </Card>
    </Row>
    <Row class="margin-top-10">
      <div style="float: left;">
        <Select
          v-model="currentStatus"
          ref="currentStatus"
          @on-change="getData"
          label-in-value
          placeholder="运行状态"
          style="width:100px">
          <Option :value="-1" label="　等　待" />
          <Option :value="1" label="　执行中" />
        </Select>
        <Select
          v-model.number="taskType"
          @on-change="getData"
          clearable
          placeholder="任务类型"
          class="margin-left-5"
          style="width:100px">
          <Option v-for="item in taskTypeList" :value="item.id" :key="item.id">{{item.description}}</Option>
        </Select>

        <Input v-model="keyword"
          placeholder="请输入调度名称..."
          @on-enter="getData"
          clearable
          class="margin-left-5"
          style="width: 230px" />
        <Button type="primary" shape="circle" icon="md-search" @click="getData" :loading="loadingTable" class="margin-left-5" />
      </div>
    </Row>
    <Row class="margin-top-10">
      <Table stripe
        :columns="columnList"
        :data="dataList"
        :loading="loadingTable"
        size="small" />
    </Row>
  </div>
</template>

<script>


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


import { renderDurationTime, renderExecType, renderSuccess, renderOperation } from '../monitor/components/record-util'
import moment from 'moment'
import { mapMutations } from 'vuex'
import { oneOf } from '@/libs/tools'
import TrendCpu from './components/trend-cpu.vue'
import TrendMemory from './components/trend-memory.vue'
import * as formatter from '@/libs/format'
import * as agentApi from '@/api/cluster'
import * as recordApi from '@/api/record'

export default {
  name: 'agent-recent',
  components: {
    TrendCpu,
    TrendMemory
  },
  data () {
    return {
      recentHour: 1,
      radio: 1,
      startDate: '',
      endDate: '',
      selectedDate: '',
      range: [0, 23],
      dateOptions: {
        disabledDate (date) {
          return date && date.valueOf() > Date.now()
        }
      },
      trend: [],
      showSpin: false,
      timer: -1,

      taskType: 0,
      currentStatus: 1,
      keyword: '',
      taskTypeList: this.$store.state.user.taskTypeList,
      loadingTable: false,
      columnList: initColumnList,
      dataList: [],
      total: 0
    }
  },
  methods: {
    ...mapMutations([
      'removeTask',
      'closeTag'
    ]),
    init () {
      this.columnList.forEach(item => {
        if (!oneOf(item.key, [
          'durationTime',
          'execType',
          'success',
          'jobName'
        ])) return

        item.render = (h, param) => {
          const currentRowData = param.row
          switch (item.key) {
            case 'durationTime' : return renderDurationTime(h, currentRowData)
            case 'execType' : return renderExecType(h, currentRowData)
            case 'success' : return renderSuccess(h, currentRowData)
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
      const id = this.$route.params.id
      if (typeof id === 'undefined') return
      this.radio = 1
      this.onChangeRadio(1)
      this.getData()
    },
    openTask (name, params) {
      this.removeTask(params.id)
      this.$router.push({ name, params })
    },
    async reload () {
      const data = {
        agentId: this.$route.params.id,
        startTime: this.startDate,
        endTime: this.endDate
      }
      this.$Loading.start()
      this.showSpin = true
      const result = await agentApi.getAgentResource(data)
      this.showSpin = false
      if (result.code !== 0) {
        this.$Loading.error()
        this.$Message.error(result.msg)
        return
      }
      this.$Loading.finish()
      this.trend = result.data
    },
    async loadMore () {
      const agentId = this.$route.params.id
      if (typeof agentId === 'undefined' || agentId <= 0) return
      const startTime = this.endDate
      const endTime = formatter.formatDateTime(moment())
      const data = { agentId, startTime, endTime}

      this.$Loading.start()
      const result = await agentApi.getAgentResource(data)
      if (result.code !== 0) {
        this.$Loading.error()
        this.$Message.error(result.msg)
        return
      }
      this.$Loading.finish()
      this.startDate = this.endDate
      this.endDate = endTime

      this.trend = this.trend.concat(result.data)

    },
    closePage () {
      this.closeTag({
        name: 'agent-recent',
        params: this.$route.params
      })
    },
    onChangeSelect () {
      if (this.recentHour === 0) return
      this.endDate = formatter.formatDateTime(moment())
      this.startDate = formatter.formatDateTime(moment().add(this.recentHour * -1, 'hour'))
      this.reload()
    },
    onChangeRadio (radio) {
      this.endDate = formatter.formatDateTime(moment())
      switch (radio) {
        case 1: this.startDate = formatter.formatDateTime(moment().add(-1, 'hour'))
          break
        case 2: this.startDate = formatter.formatDateTime(moment().add(-12, 'hour'))
          break
        case 3: this.startDate = formatter.formatDateTime(moment().add(-1, 'day'))
          break
      }
      this.reload()
    },
    onChangeDate () {
      this.recentHour = 0
      this.radio = -1
      const date = formatter.formatDate(this.selectedDate)
      let startHour = this.range[0]
      let endHour = this.range[1]
      startHour = startHour < 10 ? '0' + startHour : startHour
      endHour = endHour < 10 ? '0' + endHour : endHour
      this.startDate = `${date} ${startHour}:00:00`
      this.endDate = `${date} ${endHour}:59:59`
      this.reload()
    },
    async getData () {
      let status = ''
      let success = ''
      switch (this.currentStatus) {
        case -1: status = '-1'; break // 等待中
        case 1: status = '0'; break // 执行中
      }

      const startDate = formatter.formatDate(moment().add(-7, 'day'))
      const endDate = formatter.formatDate(moment().add(1, 'day'))

      const data = {
        status: status,
        success: success,
        page: 1,
        size: 99,
        taskType: formatter.formatNumber(this.taskType),
        agentId: this.$route.params.id,
        keyword: this.keyword,
        startDate: startDate,
        endDate: endDate
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
        return item
      })
      this.total = result.data.total
    }
  },
  created () {

  },
  mounted () {
    this.init()
    this.timer = setInterval(() => {
      if (this.recentHour !== 1) return
      this.loadMore()
    }, 1000 * 10)
  },
  beforeDestroy () {
    clearInterval(this.timer)
  },
  watch: {
    '$route.params.id' (id) {
      this.init()
    }
  }
}
</script>
