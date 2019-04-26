<template>
  <Row :gutter="10">
    <Col span="12">
      <Card dis-hover :style="{minHeight}">
        <Row type="flex" justify="center" align="middle">
          <Form :model="value"
            :label-width="80"
            class="margin-top-20"
            @submit.native.prevent>
            <FormItem label="执行器">
              <Select v-model="value.agentId" style="width: 200px;">
                <Option v-for="item in agentList" :value="item.id" :key="item.id" :disabled="!item.status">{{item.name}}</Option>
              </Select>
            </FormItem>
            <FormItem label="并行调度">
              <RadioGroup v-model.number="value.concurrent">
                <Radio :label="2">并行等待</Radio>
                <Radio :label="1">并行执行</Radio>
                <Radio :label="3">并行取消</Radio>
              </RadioGroup>
              <Tooltip placement="right" class="margin-left-10">
                <div slot="content">
                  <p>并行等待：同一时间只允许执行一轮调度</p>
                  <p>并行执行：允许多轮调度并行执行</p>
                  <p>并行取消：上一轮调度未完成时本轮取消</p>
                </div>
                <Icon type="ios-information-circle-outline" size="20" />
              </Tooltip>
            </FormItem>
            <FormItem label="执行方式">
              <i-switch
                v-model="pause"
                size="large"
                :true-value="0"
                :false-value="1"
                :loading="loadingDownStream"
                @on-change="onChangePause">
                <span slot="open">自动</span>
                <span slot="close">手动</span>
              </i-switch>
              <Tooltip
                v-if="value.hasDownStream > 0"
                placement="right"
                class="margin-left-10">
                <div slot="content">
                  <p>无法置为手动？请先通知下游任务移除依赖。</p>
                  <p><a>单击此处</a>查看下游依赖</p>
                </div>
                <Button shape="circle" icon="md-help" size="small"/>
              </Tooltip>
            </FormItem>
<!--
            <transition name="bounce">
              <FormItem label="有效期起" v-if="!value.pause">
                <DatePicker
                  type="datetime"
                  placeholder="起始日期"
                  v-model="activeTime"
                  @on-change="handleChange"
                  @on-clear="handleClear"
                  style="width: 200px" />
              </FormItem>
            </transition>
            <transition name="bounce">
              <FormItem label="有效期止" v-if="!value.pause">
                <DatePicker type="datetime" placeholder="截止日期" v-model="expiredTime" style="width: 200px"></DatePicker>
              </FormItem>
            </transition>
-->
            <transition name="bounce">
              <div v-if="!value.pause">
                <FormItem label="Cron表达式">
                  <Input
                    v-model.trim="value.cronExpr"
                    placeholder="点击图标选择周期"
                    style="width: 200px"
                    @on-click="showCron = true"
                    icon="ios-clock-outline" />
                  <SelectCron v-model="showCron" @on-change-cron="onChangeCron" />
                </FormItem>
              </div>
            </transition>
            <FormItem label="重跑次数">
              <InputNumber :min="0" :max="10" v-model.number="value.runCount"></InputNumber>
              <Tooltip placement="right" class="margin-left-10">
                <div slot="content">
                  <p>当设置为 0 时，失败后不重跑。</p>
                </div>
                <Icon type="ios-information-circle-outline" size="20" />
              </Tooltip>
            </FormItem>
            <FormItem label="超时时间">
              <InputNumber :min="0" :max="999" v-model.number="value.timeout"></InputNumber>
              <span>&nbsp;分钟</span>
              <Tooltip placement="right" class="margin-left-10">
                <div slot="content">
                  <p>允许任务执行的最长时间。</p>
                  <p>当设置为 0 时，任务无超时时间。</p>
                </div>
                <Icon type="ios-information-circle-outline" size="20" />
              </Tooltip>
            </FormItem>
            <FormItem label="失败通知">
              <RadioGroup v-model="value.warning">
                <Radio :label="0">无</Radio>
                <Radio :label="1">邮件通知</Radio>
              </RadioGroup>
            </FormItem>
            <transition name="bounce">
              <FormItem label="接警邮箱" prop="email" v-show="value.warning === 1">
                <Input v-model.trim="value.email"
                  type="textarea"
                  :autosize="true"
                  placeholder="多邮箱请用逗号或换行分隔"
                  style="width: 200px;">
                </Input>
              </FormItem>
            </transition>
          </Form>
        </Row>
      </Card>
    </Col>
    <Col span="12">
      <Card dis-hover :style="{minHeight}">
        <Row>
          <Tooltip
            placement="top-end"
            class="margin-left-10"
            style="float: right;">
                <div slot="content">
                  <p>当且仅当上游依赖全部成</p>
                  <p>功后才会启动当前任务。</p>
                </div>
                <Button ghost
                type="warning"
                size="small"
                icon="md-git-network"
                @click="openDrawer">添加上游依赖
              </Button>
          </Tooltip>
        </Row>
        <Row class="margin-top-10" />
        <Timeline>
          <TimelineItem v-for="(item,index) in addedDependence" :color="renderDependColor(item)" :key="item.parentJobId">
            <Icon :type="renderDependIcon(item)" slot="dot" size="24"></Icon>
            <Dropdown style="float: right;" placement="bottom-end" @on-click="clickDropDown">
              <Button v-if="item.dependOn === 1" type="text" shape="circle" size="small" icon="md-close"/>
              <Button v-if="item.dependOn === 2" type="text" shape="circle" size="small" icon="md-close"/>
              <DropdownMenu slot="list">
<!--
        <DropdownItem :disabled="item.dependOn === 1" :selected="item.dependOn === 1" :name="'time-'+index">
            <Icon type="android-time"></Icon>&nbsp;&nbsp;时间依赖
        </DropdownItem>
-->
                <DropdownItem :disabled="item.dependOn === 2" :selected="item.dependOn === 2" :name="'logic-'+index">
                  <Icon type="network"></Icon>&nbsp;&nbsp;逻辑依赖
                </DropdownItem>
                <DropdownItem divided :name="'delete-'+index">
                  <Icon type="md-trash"></Icon>&nbsp;&nbsp;删除依赖
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <p class="notwrap timelineitem-title" :title="item.parentName">{{item.parentName}}</p>
            <p class="timelineitem-content">计划时间<Time :time="item.nextFireTime" type="datetime" /></p>
            <p class="timelineitem-content">开始时间<Time :time="item.startTime" type="datetime" /></p>
            <p class="timelineitem-content">结束时间<Time :time="item.endTime" type="datetime" /></p>
          </TimelineItem>
          <TimelineItem>
            <Icon type="md-star-outline" slot="dot" size="24"></Icon>
            <p class="timelineitem-title">{{value.jobName}}</p>
          </TimelineItem>
        </Timeline>
      </Card>
    </Col>
    <Drawer title="添加上游依赖" :closable="false" width="50%" placement="left" v-model="addDependence">
      <Input
        search
        v-model.trim="keyword"
        placeholder="请输入关键字..."
        style="width: 300px"
        @on-search="resetSearch" />
      <Pagination :total="total" :size="size" @on-page-info-change="changePageInfo" ref="pagination">
        <Table stripe
          size="small"
          :columns="columnList"
          :data="taskList"
          :loading="loadingTable"
          class="margin-top-10"
          slot="table" />
      </Pagination>
    </Drawer>
  </Row>
</template>

<script>

import Pagination from '_c/pagination'
import SelectCron from './select-cron'
import expandRow from './table-expand'
import * as clusterApi from '@/api/cluster'
import * as taskApi from '@/api/task'

export default {
  name: 'cycle-dependence',
  props: {
    value: Object,
    dependenceList: Array
  },
  components: {
    Pagination,
    expandRow,
    SelectCron
  },
  data () {
    return {
      loadingDownStream: false,
      loadingTable: false,
      keyword: '',

      total: 0,
      page: 1,
      size: 10,

      addedDependence: this.dependenceList,
      columnList: [],
      agentList: [],
      taskList: [],
      pause: this.value.pause,
      showCron: false,
      addDependence: false,

      expiredTime: '9999-12-31 23:59:59',
      activeTime: '2010-01-01 00:00:00'
    }
  },
  methods: {
    async getData () {
      const data = {
        page: this.page,
        size: this.size,
        keyword: this.keyword
      }

      this.loadingTable = true
      this.$Loading.start()
      const result = await taskApi.getTaskList(data)
      this.loadingTable = false
      if (result.code !== 0) {
        this.taskList = []
        this.$Loading.error()
        return
      }
      this.$Loading.finish()
      this.taskList = result.data.content
      this.total = result.data.total

      this.taskList.forEach(x => {
        x.addingTime = false
        x.addingLogic = false
        x.dependOn = 0 // need to update real-time
        this.addedDependence.forEach(d => {
          if (d.parentJobId === x.jobId) x.dependOn = d.dependOn
        })
      })
    },
    resetSearch () {
      this.$refs.pagination.first()
    },
    changePageInfo ({ page, size }) {
      this.page = page
      this.size = size
      this.getData()
    },
    addDepend (scheduler, type) {
      if (scheduler.jobId === this.value.jobId) {
        this.$Message.error('无法添加当前任务为依赖')
        return
      }
      if (type === 'time') {
        scheduler.addingTime = true
      } else {
        scheduler.addingLogic = true
      }

      this.$Loading.start()
      setTimeout(() => {
        if (type === 'time') {
          scheduler.addingTime = false
        } else {
          scheduler.addingLogic = false
        }

        scheduler.dependOn = type === 'time' ? 1 : 2
        this.$Loading.finish()
        const dependence = this.scheduler2depend(scheduler)
        this.modifyDependency(dependence)
      }, 500)
    },
    removeDependence (dependence) {
      this.$Loading.start()
      setTimeout(() => {
        dependence.dependOn = 0
        this.addedDependence = this.addedDependence.filter(x => x.parentJobId !== dependence.parentJobId)

        for (var i = 0; i < this.taskList.length; i++) {
          if (this.taskList[i].jobId === dependence.parentJobId) {
            this.taskList[i].dependOn = 0
            this.taskList.splice(i, 1, this.taskList[i])
            break
          }
        }
        this.$Loading.finish()
      }, 500)
    },
    clickDropDown (name) {
      const str = name.split('-')
      const dependName = str[0]
      const idx = Number(str[1])
      const dependence = this.addedDependence[idx]
      if (dependName === 'time') {
        dependence.dependOn = 1
        this.modifyDependency(dependence)
      }
      if (dependName === 'logic') {
        dependence.dependOn = 2
        this.modifyDependency(dependence)
      }
      if (dependName === 'delete') {
        this.removeDependence(dependence)
      }
    },
    scheduler2depend (scheduler) {
      const depend = {
        parentJobId: scheduler.jobId,
        parentName: scheduler.jobName,
        nextFireTime: scheduler.nextFireTime,
        startTime: scheduler.startTime,
        endTime: scheduler.endTime,
        success: scheduler.success,
        dependOn: scheduler.dependOn
      }
      return depend
    },
    renderDependColor (record) {
      let color = ''

      if (record.status < 0) {
        /* 等待 */
        color = '#5cadff'
      } else if (record.status === 0) {
        /* 运行中 */
        color = '#ff9900'
      } else if (record.success === 1) {
        /* 成功 */
        color = '#19be6b'
      } else if (record.success === 2) {
        /* 强制 */
        color = '#ed3f14'
      } else if (record.success === 3) {
        /* 失败 */
        color = '#ed3f14'
      }

      return color
    },
    renderDependIcon (record) {
      let icon = ''

      if (record.status < 0) {
        /* 等待 */
        icon = 'ios-loading'
      } else if (record.status === 0) {
        /* 运行中 */
        icon = 'md-play'
      } else if (record.success === 1) {
        /* 成功 */
        icon = 'md-checkmark-circle-outline'
      } else if (record.success === 2) {
        /* 强制 */
        icon = 'md-pause'
      } else if (record.success === 3) {
        /* 失败 */
        icon = 'md-close'
      }

      return icon
    },
    modifyDependency (dependence) {
      const i = this.taskList.findIndex(item => item.jobId === dependence.parentJobId)
      if (i >= 0) {
        this.taskList[i].dependOn = dependence.dependOn
        this.taskList.splice(i, 1, this.taskList[i])
      }

      const index = this.addedDependence.findIndex(item => item.parentJobId === dependence.parentJobId)
      if (index >= 0) {
        this.addedDependence.splice(index, 1, dependence)
      } else {
        this.addedDependence.push(dependence)
      }
    },
    onChangeCron (cron) {
      this.value.cronExpr = cron
    },
    async onChangePause (pause) {
      if (pause === 0) {
        this.value.pause = pause
        return
      }

      this.loadingDownStream = true
      // api 检测是否有依赖
      const result = await taskApi.getChildTask(this.value.jobId)
      this.loadingDownStream = false

      // 如果下游无依赖
      if (result.code !== 0) {
        this.value.pause = pause
        return
      }
      this.pause = 0
      this.$Message.error('下游存在依赖无法置为手动')
      // 打开对话框展现依赖
      // 请通知下游任务移除依赖
      console.log(result.data)
    },
    async initCluster () {
      const result = await clusterApi.getAgentNameList()
      if (result.code !== 0) return
      this.agentList = result.data
    },
    openDrawer () {
      this.addDependence = true
      this.loadingTable = false
    },
    handleChange (date) {
      console.log(this.activeTime)
      this.activeTime = date
      console.log(date)
    },
    handleClear () {
      console.log('handleClear')
    }
  },
  watch: {
    dependenceList (value) {
      this.addedDependence = value
    },
    addedDependence (value) {
      this.$emit('update:dependenceList', value)
    },
    'value.pause' (pause) {
      this.pause = pause
    }
  },
  computed: {
    minHeight () {
      return this.$store.state.app.fullHeight - 80 + 'px'
    }
  },
  mounted () {
    this.columnList = [
      {
        type: 'expand',
        width: 30,
        render: (h, params) => {
          return h(expandRow, {
            props: {
              row: params.row
            }
          })
        }
      },
      {
        title: '任务名称',
        key: 'jobName'
      },
      {
        title: '执行方式',
        key: 'pause',
        align: 'center',
        width: 100,
        render: (h, params) => {
          if (params.row.pause === 1) return h('Tag', { props: { color: 'default' } }, '手 动')
          else return h('Tag', { props: { color: 'green' } }, '自 动')
        }
      },
      {
        key: 'operation',
        title: '操作',
        align: 'center',
        width: 100,
        render: (h, params) => {
          const depend = params.row
          return h('div', [
          /*
          h('Button', {
              props: {
                  type: depend.dependOn === 1 ? 'primary':'dashed',
                  size: 'small',
                  icon: 'fork-repo',
                  shape: 'circle',
                  loading: depend.addingTime
              },
              on: {
                  click: () => {
                      if(depend.dependOn === 1) return
                      this.addDepend(depend,'time')
                  }
              }
          }),
          */
            h('Button', {
              props: {
                ghost: depend.dependOn !== 2,
                type: 'primary',
                size: 'small',
                icon: 'md-add',
                shape: 'circle',
                loading: depend.addingLogic
              },
              // class: ['margin-left-10'],
              on: {
                click: () => {
                  if (depend.pause === 1) {
                    this.$Message.error('无法添加手动任务为依赖')
                    return
                  }
                  if (depend.dependOn === 2) return
                  this.addDepend(depend, 'logic')
                }
              }
            })
          ])
        }
      }
    ]
    this.initCluster()
  }
}
</script>


<style lang="less">
.bounce-enter-active {
  animation: bounce-in .5s;
}
.bounce-leave-active {
  animation: bounce-in .5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

</style>
