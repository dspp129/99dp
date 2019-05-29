<style lang="less">
@import './task-etl.less';
</style>

<template>
  <Card dis-hover shadow :style="{minHeight}">
    <Spin size="large" fix v-if="showSpin" />
    <div class="ivu-tabs-style2">
      <Tabs v-model="tabStep"
        type="card"
        :animated="false"
        :before-remove="beforeRemove"
        @on-click="onClickTab">
        <TabPane label="任务说明" name="step0" :index="1">
          <TaskDesc ref="taskName" v-model="dwTask" @on-change-name="onChangeName" />
        </TabPane>
        <TabPane label="报表配置" name="step1" :index="2" :disabled="!addable">
          <Report1 ref="report1" v-model="dwTaskReport" @on-test="onTest" />
        </TabPane>
        <TabPane v-for="(item, index) in dwTaskReport.sheets"
          closable
          :label="item.label"
          :index="item.position + 10"
          :name="item.label"
          :key="index"
          :disabled="!addable">
        </TabPane>
        <Report2 v-model="dwTaskReport.sheets[selectedIndex]"
          v-if="selectedIndex >= 0"
          @on-move-forward="onMoveForward"
          @on-move-backward="onMoveBackward" />
        <TabPane icon="md-add" name="add-tab" :disabled="!addable" :index="600" />
        <TabPane label="参数设计" name="step98" :disabled="!addable" :index="700" >
          <Param v-model="dwTaskParam" />
        </TabPane>
        <TabPane label="周期依赖" name="step99" :disabled="!addable" :index="800" >
          <CycleDependence v-model="dwTask" :dependenceList.sync="dependenceList" />
        </TabPane>
        <TabPane label="调度历史" name="recordHistory" :index="900" v-if="dwTask.jobId > 0">
          <RecordHistory :id="dwTask.jobId" v-model="dwRecordHistory" />
        </TabPane>
        <Operation slot="extra" :id="dwTask.jobId" :cronExpr="dwTask.cronExpr" @on-close="closePage" @on-save="onSave" />
      </Tabs>
    </div>
  </Card>
</template>

<script>

const initTaskReport = {
  id: 0,
  subject: '',
  recipient: '',
  testRecipient: '',
  attachmentType: 2,
  content: '',
  expireDate: ['',''],
  sheets: []
}

import Operation from './components/operation'
import TaskDesc from './components/task-desc'
import Report1 from './components/report-1'
import Report2 from './components/report-2'
import Param from './components/task-param'
import CycleDependence from './components/cycle-dependence'
import RecordHistory from '../monitor/record-history'
import { mapMutations } from 'vuex'
import * as formatter from '@/libs/format'
import * as taskApi from '@/api/task'
import initData from './init-task.js'

export default {
  name: 'task-Report',
  components: {
    Operation,
    TaskDesc,
    CycleDependence,
    RecordHistory,
    Report1,
    Report2,
    Param
  },
  data () {
    return {
      showSpin: false,
      pageName: 'task-Report',
      tabStep: 'step0',
      sheetCount: 0,

      dwTask: JSON.parse(JSON.stringify(initData.initTask)),
      dependenceList: [],
      dwTaskParam: [],
      dwRecordHistory: [],
      nameIsValid: false,
      dwTaskReport: JSON.parse(JSON.stringify(initTaskReport))
    }
  },
  methods: {
    ...mapMutations([
      'clearTask',
      'setTask',
      'closeTag'
    ]),
    reset () {
      this.dwTask = JSON.parse(JSON.stringify(initData.initTask))
      this.dwTask.userId = this.$store.state.user.userId
      this.dwTask.email = this.$store.state.user.email
      this.dwTask.taskType = this.$route.params.taskType // 5-Report

      this.dwTaskReport = JSON.parse(JSON.stringify(initTaskReport))
      this.sheetCount = 0
      this.nameIsValid = false
      this.addNewSheet()

      this.dwTaskParam = []
      this.dependenceList = []
      this.dwRecordHistory = []

      this.tabStep = 'step0'
    },
    closePage () {
      this.closeTag({
        name: this.pageName,
        params: this.$route.params
      })
    },
    onChangeName (value) {
      this.nameIsValid = value
    },
    async onSave () {
      // begin validate
      let valid = await this.$refs.taskName.validate()
      if (!valid) {
        this.tabStep = 'step0'
        return
      }

      valid = await this.$refs.report1.validate()
      if (!valid) {
        this.tabStep = 'step1'
        return
      }

      const errorIndex = this.dwTaskReport.sheets.findIndex(e => !e.connectionId)
      if (errorIndex >= 0) {
        this.tabStep = this.dwTaskReport.sheets[errorIndex].label
        this.$Message.error('请选择数据库连接')
        return
      }
      // end validate

      const dwTask = this.dwTask
      const dwTaskReport = this.dwTaskReport
      const dwTaskParam = this.dwTaskParam
      const dependenceList = this.dependenceList

      this.$Loading.start()
      const result = await taskApi.saveTask({ dwTask, dwTaskReport, dwTaskParam, dependenceList })
      if (result.code !== 0) {
        this.$Message.error(result.msg)
        this.$Loading.error()
        return
      }
      const id = result.data
      this.$Message.success('保存成功！')
      this.$Loading.finish()

      // 如果是新建任务，将其缓存
      if (this.dwTask.jobId === 0) {
        this.dwTask.jobId = id
        this.$route.params.id = id
        this.cacheTask()
      }

      if ( this.$route.params.title === this.dwTask.jobName) return
      const params = { id, title: this.dwTask.jobName }
      this.closePage()
      this.$router.replace({
        name: this.pageName,
        params
      })
    },
    async getTask () {
      const id = this.$route.params.id
      const item = this.$store.state.user.taskList.find(_ => _.jobId === id)

      // 如果找到了该任务，将其恢复
      if (item) {
        this.dwTask = item.task.dwTask
        this.dwTaskReport = item.task.dwTaskReport
        this.dwTaskParam = item.task.dwTaskParam
        this.dependenceList = item.task.dependenceList
        this.dwRecordHistory = item.task.dwRecordHistory
        this.sheetCount = item.sheetCount

        this.tabStep = item.tabStep
        return
      }

      this.tabStep = 'step0'
      // 如果未找到该任务，初始化，并存入缓存
      if (id > 0) { // 非新建任务
        this.showSpin = true
        const result = await taskApi.getTask(id)
        this.showSpin = false
        if (result.code !== 0) return
        this.dwTask = result.data.dwTask
        this.dwTaskReport = result.data.dwTaskReport
        this.dwTaskParam = result.data.dwTaskParam
        this.dependenceList = result.data.dependenceList
        this.dwRecordHistory = []
        this.sheetCount = this.dwTaskReport.sheets.length
        this.dwTaskReport.sheets.forEach((item, index) => {
          item.label = 'Sheet' + (index + 1)
        })
      } else {
        this.reset()
      }
      this.cacheTask()
    },
    cacheTask () {
      this.setTask({
        jobId: this.$route.params.id,
        task: {
          dwTask: this.dwTask,
          dwTaskReport: this.dwTaskReport,
          dwTaskParam: this.dwTaskParam,
          dependenceList: this.dependenceList,
          dwRecordHistory: this.dwRecordHistory,
        },
        sheetCount: this.sheetCount,
        tabStep: this.tabStep
      })
    },
    onClickTab (tabName) {
      if (tabName === 'add-tab') this.addNewSheet()
    },
    addNewSheet () {
      this.sheetCount++
      const newTabName = 'Sheet' + this.sheetCount
      const tab = {
        label: newTabName,
        name: '新建' + newTabName,
        dbType: 0,
        connectionId: 0,
        content: '',
        position: this.dwTaskReport.sheets.length + 1
      }
      this.dwTaskReport.sheets.push(tab)
      this.tabStep = newTabName
    },
    onMoveForward () {
      if(!this.selectedIndex) {
        this.$Message.warning('无法前移')
        return
      }
      const current = this.dwTaskReport.sheets[this.selectedIndex]
      const previous = this.dwTaskReport.sheets[this.selectedIndex-1]
      current.position--
      previous.position++
      this.dwTaskReport.sheets.splice(this.selectedIndex-1, 2, current, previous)
    },
    onMoveBackward () {
      if(this.selectedIndex === this.dwTaskReport.sheets.length - 1) {
        this.$Message.warning('无法后移')
        return
      }
      const current = this.dwTaskReport.sheets[this.selectedIndex]
      const next = this.dwTaskReport.sheets[this.selectedIndex+1]
      current.position++
      next.position--
      this.dwTaskReport.sheets.splice(this.selectedIndex, 2, next, current)
    },
    beforeRemove (i) {
      if (this.dwTaskReport.sheets.length === 1) {
        this.$Message.warning('请至少保留一个表格')
        return new Promise((resolve, reject) => { reject() })
      }
      const index = i - 2 // dwTaskReport.sheets中的位置

      return new Promise((resolve, reject) => {
        this.$Modal.confirm({
          title: '删除 ' + this.dwTaskReport.sheets[index].label,
          content: '<p>确定要删除这张表格吗？</p>',
          onOk: () => {
            if (index === this.selectedIndex) {
              this.tabStep = !index ? this.dwTaskReport.sheets[index+1].label : this.dwTaskReport.sheets[index-1].label
            }
            this.dwTaskReport.sheets.splice(index, 1)
            this.dwTaskReport.sheets.forEach(e => {
              if(e.position > i - 1) e.position--
            })
          }
        })
        reject()
      })
    },
    async onTest () {
      this.$Message.info('运行中，请稍后。')
      const result = await taskApi.testReport(this.dwTaskReport)
      if (result.code !== 0) {
        this.$Message.error(result.msg)
        return
      }
      this.$Message.success('发送成功')
    }
  },
  created () {
  },
  beforeDestroy () {
    this.clearTask(this.dwTask.taskType)
  },
  mounted () {
    this.getTask()
  },
  computed: {
    selectedIndex () {
      if (!this.tabStep.startsWith('Sheet')) return -1
      return this.dwTaskReport.sheets.findIndex(e => e.label === this.tabStep)
    },
    addable () {
      return this.dwTask.jobId > 0 || this.nameIsValid
    },
    minHeight () {
      return this.$store.state.app.fullHeight + 'px'
    },
    nextAble2 () {
      return (!!this.dwTask.pause || this.dwTask.cronExpr.length > 0) && (!this.dwTask.warning || this.dwTask.email.length > 0)
    },
    routerId () {
      if (typeof this.$route.params === 'undefined') return -1
      if (typeof this.$route.params.id === 'undefined') return -1
      if (this.$route.name !== this.pageName) return -1
      return this.$route.params.id
    }
  },
  watch: {
    tabStep (tabStep) {
      const item = this.$store.state.user.taskList.find(_ => _.jobId === this.$route.params.id)
      if (item) item.tabStep = tabStep
    },
    'routerId' (id) {
      if (id < 0) return
      this.getTask()
    }
  }
}
</script>
