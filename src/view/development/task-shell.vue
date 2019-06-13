<style lang="less">
@import './task-etl.less';
</style>

<template>
  <Card dis-hover shadow :style="{minHeight}">
    <Spin size="large" fix v-if="showSpin" />
    <Tabs v-model="tabStep" type="card">
      <TabPane label="任务说明" name="step0">
        <StepController v-show="showController" v-model="step" :disabled="!nameIsValid" />
        <TaskDesc ref="taskName" v-model="dwTask" @on-change-name="onChangeName"/>
      </TabPane>
      <TabPane label="执行Shell" name="step1" :disabled="showController && maxStep < 2">
        <StepController v-show="showController" v-model="step" :disabled="!nextAble1" />
        <Shell1 v-model="dwTask.command" />
      </TabPane>
      <TabPane label="周期依赖" name="step2" :disabled="showController && maxStep < 3">
        <StepController v-show="showController" v-model="step" :disabled="!nextAble2" @on-finish="onSave"/>
        <CycleDependence v-model="dwTask" :dependenceList.sync="dependenceList" />
      </TabPane>
      <TabPane label="调度历史" name="recordHistory" v-if="!showController">
        <RecordHistory :id="dwTask.jobId" v-model="dwRecordHistory" />
      </TabPane>
      <Operation :id="dwTask.jobId" :cronExpr="dwTask.cronExpr" v-show="!showController" @on-close="closePage" @on-save="onSave" slot="extra" />
    </Tabs>
  </Card>
</template>

<script>

import StepController from './components/step-controller'
import Operation from './components/operation'
import TaskDesc from './components/task-desc'
import Shell1 from './components/shell-1'
import CycleDependence from './components/cycle-dependence'
import RecordHistory from '../monitor/record-history'
import { mapMutations } from 'vuex'
import * as taskApi from '@/api/task'
import initData from './init-task.js'


export default {
  name: 'task-Shell',
  components: {
    StepController,
    Operation,
    TaskDesc,
    CycleDependence,
    RecordHistory,
    Shell1
  },
  data () {
    return {
      showSpin: false,
      pageName: 'task-Shell',
      step: { length: 3, current: 0 },
      tabStep: 'step0',
      maxStep: 0,

      dwTask: JSON.parse(JSON.stringify(initData.initTask)),
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
      this.dwTask.taskType = this.$route.params.taskType // 3-Shell

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
      // begin validate
      let valid = await this.$refs.taskName.validate()
      if (!valid) {
        this.tabStep = 'step0'
        return
      }

      const dwTask = this.dwTask
      const dependenceList = this.dependenceList

      this.$Loading.start()
      const result = await taskApi.saveTask({ dwTask, dependenceList })
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
        this.dependenceList = result.data.dependenceList
        this.dwRecordHistory = []
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
      return this.$store.state.app.fullHeight + 'px'
    },
    nextAble1 () {
      return this.dwTask.command.trim() !== ''
    },
    nextAble2 () {
      return this.dwTask.agentId > 0 &&
      (!!this.dwTask.pause || this.dwTask.cronExpr.length > 0) &&
      (!this.dwTask.warning || this.dwTask.email.length > 0)
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
