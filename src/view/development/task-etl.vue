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
        <TabPane label="ETL抽取" name="step1" :disabled="showController && maxStep < 2">
          <StepController v-show="showController" v-model="step" :disabled="!nextAble1" />
          <ETL2 v-model="dwTaskETL" />
        </TabPane>
        <TabPane label="预处理" name="step2" :disabled="showController && maxStep < 3">
          <StepController v-show="showController" v-model="step" />
          <SQL2 v-model="dwTaskETL.preSql"
            :disabled="true"
            :id="dwTask.jobId"
            :dbType="dwTaskETL.targetDbType"
            :connectionId="dwTaskETL.targetConnectionId" />
        </TabPane>
        <TabPane label="后处理" name="step3" :disabled="showController && maxStep < 4">
          <StepController v-show="showController" v-model="step" />
          <SQL2 v-model="dwTaskETL.postSql"
            :disabled="true"
            :id="dwTask.jobId"
            :dbType="dwTaskETL.targetDbType"
            :connectionId="dwTaskETL.targetConnectionId"/>
        </TabPane>
        <TabPane label="参数设计" name="step4" :disabled="showController && maxStep < 5">
          <StepController v-show="showController" v-model="step" />
          <Param v-model="dwTaskParam" />
        </TabPane>
        <TabPane label="周期依赖" name="step5" :disabled="showController && maxStep < 6">
          <StepController v-show="showController" v-model="step" :disabled="!nextAble3" @on-finish="onSave"/>
          <CycleDependence v-model="dwTask" :dependenceList.sync="dependenceList" />
        </TabPane>
        <TabPane label="扩展插槽" name="TaskHook" v-if="!showController">
          <TaskSlot v-model="dwTaskSlot" :hasSlot.sync="dwTask.hasSlot" :step="stepList" />
        </TabPane>
        <TabPane label="调度历史" name="recordHistory" v-if="!showController">
          <RecordHistory :id="dwTask.jobId" v-model="dwRecordHistory" />
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
import SQL2 from './components/sql-2'
import ETL2 from './components/etl-2'
import Param from './components/task-param'
import CycleDependence from './components/cycle-dependence'
import TaskSlot from './components/task-slot'
import RecordHistory from '../monitor/record-history'
import { mapMutations } from 'vuex'
import * as taskApi from '@/api/task'
import initData from './init-task.js'

const stepList = ['预处理','ETL抽取','后处理']

const initTaskETL = {
  id: 0,
  channel: 1,
  sourceDbType: 0,
  sourceConnectionId: 0,
  sourceDbId: '',
  sourceTableId: '',
  sourceDbName: '',
  sourceTableName: '',
  sourceColumns: [],
  sourcePartitionColumns: [],
  whereSql: '',
  useSql: 0,
  querySql: '',

  targetDbType: 0,
  targetConnectionId: 0,
  targetDbId: '',
  targetTableId: '',
  targetDbName: '',
  targetTableName: '',
  targetColumns: [],
  targetPartitionColumns: [],
  useTmpTable: 0,
  tmpTableName: '',
  preSql: [],
  postSql: []
}

export default {
  name: 'task-ETL',
  components: {
    StepController,
    Operation,
    TaskDesc,
    CycleDependence,
    TaskSlot,
    RecordHistory,
    ETL2,
    SQL2,
    Param
  },
  data () {
    return {
      showSpin: false,
      pageName: 'task-ETL',
      step: { length: 6, current: 0 },
      tabStep: 'step0',
      maxStep: 0,
      stepList,

      dwTask: JSON.parse(JSON.stringify(initData.initTask)),
      dwTaskETL: JSON.parse(JSON.stringify(initTaskETL)),
      dwTaskSlot: [],
      dependenceList: [],
      dwTaskParam: [],
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
      this.dwTask.email = this.$store.state.user.username + '@99bill.com'
      this.dwTask.taskType = this.$route.params.taskType // 1-ETL

      this.dwTaskETL = JSON.parse(JSON.stringify(initTaskETL))
      this.dwTaskSlot = []
      this.dependenceList = []
      this.dwTaskParam = []
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
      this.$Loading.start()
      const result = await taskApi.saveTask({
        dwTask: this.dwTask,
        dwTaskETL: this.dwTaskETL,
        dwTaskParam: this.dwTaskParam,
        dependenceList: this.dependenceList,
        dwTaskSlot: this.dwTaskSlot
      })
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
        this.dwTaskETL = item.task.dwTaskETL
        this.dwTaskParam = item.task.dwTaskParam
        this.dependenceList = item.task.dependenceList
        this.dwTaskSlot = item.task.dwTaskSlot
        this.dwRecordHistory = item.task.dwRecordHistory
        this.tabStep = item.tabStep
        this.maxStep = item.maxStep
        return
      }

      this.tabStep = 'step0'
      // 如果未找到该任务，初始化，并存入缓存
      // 新建任务 id = 'new-ETL'
      // 非新建任务 id >= 10000
      if (id > 0) {
        this.showSpin = true
        const result = await taskApi.getTask(id)
        this.showSpin = false
        if (result.code !== 0) return
        this.dwTask = result.data.dwTask
        this.dwTaskETL = result.data.dwTaskETL
        this.dwTaskParam = result.data.dwTaskParam
        this.dependenceList = result.data.dependenceList
        this.dwTaskSlot = result.data.dwTaskSlot
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
          dwTaskETL: this.dwTaskETL,
          dwTaskParam: this.dwTaskParam,
          dependenceList: this.dependenceList,
          dwTaskSlot: this.dwTaskSlot,
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
      return this.$store.state.app.fullHeight - 125 + 'px'
    },
    nextAble1 () {
      return this.dwTaskETL.targetColumns.length > 0 && this.dwTaskETL.sourceTableId > 0 && this.dwTaskETL.targetTableId > 0
    },
    nextAble3 () {
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
