<style lang="less">
@import './task-etl.less';
</style>

<template>
  <Card dis-hover shadow :style="{minHeight}">
    <Spin size="large" fix v-if="showSpin" />
    <div class="demo-tabs-style2">
      <Tabs v-model="tabStep" :animated="false" type="card">
        <TabPane label="任务说明" name="step0">
          <StepController v-show="showController" v-model="step" :disabled="!nameIsValid" />
          <TaskDesc v-model="dwTask" @on-change-name="onChangeName" />
        </TabPane>
        <TabPane label="执行SQL" name="step1" :disabled="showController && maxStep < 2">
          <StepController v-show="showController" v-model="step" :disabled="!nextAble1" />
          <Threshold1 ref="threshold-1" v-model="dwTaskThreshold" />
        </TabPane>
        <TabPane label="周期依赖" name="step2" :disabled="showController && maxStep < 3">
          <StepController v-show="showController" v-model="step" :disabled="!nextAble2" @on-finish="onSave" />
          <CycleDependence v-model="dwTask" :dependenceList.sync="dependenceList" />
        </TabPane>
        <TabPane label="调度历史" name="recordHistory" v-if="!showController">
          <RecordHistory :id="dwTask.jobId" v-model="dwRecordHistory"/>
        </TabPane>
        <Operation :id="dwTask.jobId" :cronExpr="dwTask.cronExpr" v-show="!showController" @on-close="closePage" @on-save="onSave" slot="extra" />
      </Tabs>
    </div>
  </Card>
</template>

<script>

import StepController from './components/step-controller'
import Operation from './components/operation'
import TaskDesc from './components/task-desc'
import Threshold1 from './components/threshold-1'
import CycleDependence from './components/cycle-dependence'
import RecordHistory from '../monitor/record-history'
import { mapMutations } from 'vuex'
import * as taskApi from '@/api/task'
import initData from './init-task.js'

const initTaskThreshold = {
  id: '',
  dbType: 0,
  connectionId: 0,
  sqlStatement: '',
  frequency: 0,
  alertType: 1,
  alertMode: 1,
  emailSubject: '',
  emailAddress: '',
  emailContent: ''
}

export default {
  name: 'task-threshold',
  components: {
    StepController,
    Operation,
    TaskDesc,
    CycleDependence,
    RecordHistory,
    Threshold1
  },
  data () {
    return {
      showSpin: false,
      pageName: 'task-threshold',
      step: { length: 3, current: 0 },
      tabStep: 'step0',
      maxStep: 0,

      dwTask: JSON.parse(JSON.stringify(initData.initTask)),
      dwTaskThreshold: JSON.parse(JSON.stringify(initTaskThreshold)),
      dependenceList: [],
      dwRecordHistory: [],
      nameIsValid: false
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
      this.dwTask.taskType = this.$route.params.taskType // 4-threshold

      this.dwTaskThreshold = JSON.parse(JSON.stringify(initTaskThreshold))
      this.dependenceList = []
      this.dwRecordHistory = []
      this.step.current = 0
      this.maxStep = 0
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
      const dwTask = this.dwTask
      const dwTaskThreshold = this.dwTaskThreshold
      const dependenceList = this.dependenceList

      this.$Loading.start()
      const result = await taskApi.saveTask({ dwTask, dwTaskThreshold, dependenceList })
      if (result.code !== 0) {
        this.$Message.error(result.msg)
        this.$Loading.error()
        return
      }
      this.$Message.success('保存成功！')
      this.$Loading.finish()

      // 如果是新建任务，将其缓存
      const id = result.data
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
        this.dwTaskThreshold = item.task.dwTaskThreshold
        this.dependenceList = item.task.dependenceList
        this.dwRecordHistory = item.task.dwRecordHistory
        this.tabStep = item.tabStep
        this.maxStep = item.maxStep
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
        this.dwTaskThreshold = result.data.dwTaskThreshold
        this.dependenceList = result.data.dependenceList
        this.dwRecordHistory = []
      } else { // 新建任务 id = 'new-threshold'
        this.reset()
      }
      this.cacheTask()
    },
    cacheTask () {
      this.setTask({
        jobId: this.$route.params.id,
        task: {
          dwTask: this.dwTask,
          dwTaskThreshold: this.dwTaskThreshold,
          dependenceList: this.dependenceList,
          dwRecordHistory: this.dwRecordHistory
        },
        tabStep: this.tabStep,
        maxStep: this.maxStep
      })
    }
  },
  created () {
  },
  updated () {
  },
  beforeDestroy () {
    this.clearTask(this.dwTask.taskType)
  },
  mounted () {
    this.getTask()
  },
  computed: {
    showController () {
      return this.dwTask.jobId === 0
    },
    minHeight () {
      return this.$store.state.app.fullHeight - 125 + 'px'
    },
    nextAble1 () {
      return this.dwTaskThreshold.sqlStatement.length > 0 &&
        this.dwTaskThreshold.emailSubject.length > 0 &&
        this.dwTaskThreshold.emailAddress.length > 0 &&
        this.dwTaskThreshold.connectionId > 0
    },
    nextAble2 () {
      return this.dwTask.agentId > 0 &&
      (this.dwTask.pause === 1 || this.dwTask.cronExpr.length > 0) &&
      (this.dwTask.warning === 0 || this.dwTask.email.length > 0)
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

      // 仅当新建任务时，控制条与Tab会互相影响
      if (this.dwTask.jobId > 0) return
      this.step.current = Number(tabStep.replace('step', ''))
    },
    'step.current' (currentStep) {
      this.maxStep = currentStep > this.maxStep ? currentStep : this.maxStep
      this.tabStep = 'step' + currentStep

      const item = this.$store.state.user.taskList.find(_ => _.jobId === this.$route.params.id)
      if (item) item.maxStep = this.maxStep
    },
    'routerId' (id) {
      if (id < 0) return
      this.getTask()
    }
  }
}
</script>
