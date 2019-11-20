<style lang="less">
  @import './record.less';
</style>

<template>
  <div>
    <Row :gutter="10">
      <Col span="24">
        <Card icon="qr-scanner" title="调度详情">
          <Spin size="large" fix v-if="showSpin" />
          <div slot="extra">
            <Button ghost size="small" type="warning" icon="md-redo" @click="showingModal = true">重跑</Button>
            <Button ghost
              type="primary"
              icon="md-refresh"
              size="small"
              class="margin-left-10"
              @click="refreshRecord">刷新</Button>
          </div>
          <Row :gutter="10">
            <Col span="12" class="image-editor-con2">
              <p><b>任务名称</b><a @click="openTask" :title="record.jobName">{{record.jobName}}</a></p>
              <p><b>任务类型</b>{{record.taskTypeDesc}}</p>
              <p><b>执 行 器</b>{{record.agentName}}
                <Button type="text" shape="circle" icon="md-search" size="small" @click="openAgentDetail" class="margin-left-10"/>
<!--
                <Poptip placement="right" width="180">
                  <Button type="text" shape="circle" icon="md-search" size="small" :loading="loadingAgentInfo" @click="showAgentInfo"/>
                  <div slot="content">
                    <table>
                      <thead>
                        <tr>
                          <th align="left" width="100">IP</th>
                          <th align="left">Port</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{{agentInfo.host}}</td>
                          <td>{{agentInfo.port}}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Poptip>
-->
              </p>
              <p><b>执行方式</b>
                <Tag v-show="record.execType === 0" color="green">自 动</Tag>
                <Tag v-show="record.execType === 1" color="gold">手 动</Tag>
                <Tag v-show="record.execType === 2" color="gold">手 动</Tag>
                <Tag v-show="record.execType === 3" color="default">重 跑</Tag>
                <Tag v-show="record.execType === 4" color="default">批 量</Tag>
                <Tag v-show="record.execType === 5" color="warning">强 制</Tag>
              </p>

              <p><b>执行结果</b>
                <Tag v-if="record.status === -3" color="blue">未开始</Tag>
                <Tag v-else-if="record.status < 0" color="blue">等 待</Tag>
                <Tag v-else-if="record.status === 0" color="gold">执行中</Tag>
                <Tag v-else-if="record.status === 2" color="purple">停止中</Tag>
                <template v-else>
                  <Tag v-show="record.success === 0" color="red">失 败</Tag>
                  <Tag v-show="record.success === 1" color="green">成 功</Tag>
                  <Tag v-show="record.success === 2" color="purple">终 止</Tag>
                  <Tag v-show="record.success === 3" color="#80848f">超 时</Tag>
                  <Tag v-show="record.success === 4" color="red">失 联</Tag>
                  <Tag v-show="record.success === 5" color="default">取 消</Tag>
                  <Tag v-show="record.success === 6" color="grey">取 消</Tag>
                  <Tag v-show="record.success === 7" color="green">标 记</Tag>
                  <Tag v-show="record.success === -1" color="default">未调度</Tag>
                </template>
                <span class="button-beside-tag margin-left-5">
                  <Button v-if="record.status < 0"
                    size="small"
                    type="warning"
                    @click="operate('force')"
                    ghost>执 行</Button>
                  <Button v-else-if="record.status === 0"
                    size="small"
                    type="error"
                    @click="operate('kill')"
                    ghost>停 止</Button>
                </span>
              </p>
            </Col>

            <Col span="12" class="image-editor-con2">
              <p><b>负 责 人</b>{{record.username}}</p>
              <p><b>计划时间</b>{{record.fireTime}}</p>
              <p><b>开始时间</b>{{record.startTime}}</p>
              <p><b>结束时间</b>{{record.endTime}}</p>
              <p><b>运行时长</b>{{record.durationTime}}</p>
            </Col>
          </Row>

          <Row v-if="record.taskType === 1">
            <Col class="image-editor-con2">
              <p><b>执行命令</b>
                <span v-html="record.command"></span>
              </p>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
    <Row>
      <Col class="margin-top-10">
      <Card>
        <Tabs v-model="chosenTag">
          <TabPane label="日志详情" name="detail" icon="ios-film-outline">
            <pre style="white-space: pre-wrap;word-wrap: break-word;font-family:couriernew, courier;font-size:8px;">{{record.message}}</pre>
          </TabPane>
          <TabPane label="依赖详情" name="depend" icon="md-git-network">
            <Row>
              <Button ghost
                type="primary"
                icon="md-sync"
                size="small"
                @click="resetDependence"
                style="float: right;">还原</Button>
            </Row>
            <!-- 上游依赖  -->
            <template v-if="upStreamList.length > 0">
              <Row type="flex" justify="center" align="middle" >
                <div :style="{width: upStreamList.length * 330 + 'px'}">
                  <RecordCardLine stream="up" :recordList="upStreamList" @on-change="lookupDependence" />
                </div>
              </Row>
              <Row type="flex" justify="center" align="middle">
                <Icon type="md-arrow-round-down" size="50" class="flex-arrow" color="#2d8cf0"/>
              </Row>
            </template>
            <!-- 此调度  -->
            <Row type="flex" justify="center" align="middle" class="margin-top-10">
              <div :style="{width: selfList.length * 330 + 'px'}">
                <RecordCardLine :recordList="selfList" />
              </div>
            </Row>

            <!--
              <Row class="dependency-parent-bar">
                  <Card class="dependency-child-bar">
                      <p slot="title">
                          <Icon style="float: left;margin-left: 5px;" type="android-checkmark-circle" size="22" color="#ff9900"></Icon>
                          <span style="float: left;margin-left: 10px;" >
                              Classic film
                          </span>
                      </p>
                  </Card>

              </Row>
            -->
              <template v-if="downStreamList.length > 0">
                <Row type="flex" justify="center" align="middle">
                  <Icon type="md-arrow-round-down" size="50" class="flex-arrow" color="#2d8cf0"/>
                </Row>

                <Row type="flex" justify="center" align="middle" class="margin-top-10">
                  <div :style="{width: downStreamList.length * 330 + 'px'}">
                    <RecordCardLine stream="down" :recordList="downStreamList" @on-change="lookupDependence" />
                  </div>
                </Row>
              </template>
            </TabPane>
            <TabPane label="调度历史" name="history" icon="ios-paw">
              <RecordHistory :id="record.jobId" @on-open="onOpen" />
            </TabPane>
          </Tabs>
        </Card>
      </Col>
    </Row>
    <KickoffTask :id="record.jobId" :defaultFireTime="record.fireTime" v-model="showingModal" :recordId="recordId" />
  </div>
</template>

<script>

import RecordCardLine from './components/record-card-line'
import * as formatter from '@/libs/format'
import { mapMutations } from 'vuex'
import { operateRecord } from './components/record-util'
import KickoffTask from '_c/kickoff-task'
import RecordHistory from './record-history'
import * as agentApi from '@/api/cluster'
import * as recordApi from '@/api/record'
import * as esApi from '@/api/es'

export default {
  name: 'record',
  components: {
    KickoffTask,
    RecordCardLine,
    RecordHistory
  },
  data () {
    return {
      showSpin: false,
      readingLog: false,
      countSecond: Object,
      wslog: Object,
      elapsedSec: 0,
      record: {
        jobId: 0,
        message: ''
      },
      loadingAgentInfo: false,
      agentInfo: {},

      upStreamList: [],
      selfList: [],
      downStreamList: [],
      websock: null,
      chosenTag: '',
      showingModal: false
    }
  },
  methods: {
    ...mapMutations([
      'removeTask'
    ]),
    async getData () {
      this.showSpin = true
      const result = await recordApi.getRecord(this.recordId)
      this.showSpin = false
      if (result.code !== 0) return
      this.record = result.data
      this.record.durationTime = formatter.timeDiff(this.record.startTime, this.record.endTime)

      this.resetDependence()

      // this.printLogByWebSocket()
      this.printLatestLog()
    },
    openTask () {
      const params = {
        id: this.record.jobId,
        title: this.record.jobName,
        taskType: this.record.taskType,
        taskTypeName: this.record.taskTypeName
      }
      this.removeTask(params.id)
      const name = 'task-' + this.record.taskTypeName
      this.$router.push({ name, params })
    },
    openAgentDetail () {
      const params = {
        id: this.record.agentId,
        name: this.record.agentName
      }
      this.$router.push({
        name: 'agent-recent',
        params
      })
    },
    async showAgentInfo () {
      if (JSON.stringify(this.agentInfo) !== '{}') return
      this.loadingAgentInfo = true
      const result = await agentApi.getAgentInfo(this.record.agentId)
      this.loadingAgentInfo = false
      if (result.code !== 0) return
      this.agentInfo = result.data
    },
    resetDependence () {
      this.lookupDependence(this.recordId)
    },
    async lookupDependence (recordId) {
      const result = await recordApi.getRecordDependence(recordId)
      if (result.code !== 0) return
      this.upStreamList = result.data.up
      this.downStreamList = result.data.down
      this.selfList = result.data.self
    },
    refreshRecord () {
      this.closeWebSocket()
      this.getData()
    },
    async printLatestLog () {
      this.record.message = ''
      if (this.record.status === 0) {
        const result = await recordApi.printLog(this.record)
        if (result.code !== 0) return
        this.record.message = result.data
      } else if (this.record.status > 0) {
        const startDate = formatter.formatDate(this.record.startTime).replace(/-/g, '')
        const result = await esApi.getMessageByPid(startDate, this.record.pid)
        this.record.fireTime = result._source.fire_time
        this.record.startTime = result._source.start_time
        this.record.endTime = result._source.end_time
        this.record.message = result._source.message
      }
    },
    printLogByWebSocket () {
      this.record.message = ''
      this.elapsedSec = 1
      this.readingLog = true
      this.countSecond = setInterval(() => { this.elapsedSec += 1 }, 1000)
      const wsProtocol = location.protocol.startsWith('https') ? 'wss' : 'ws'
      this.wslog = new WebSocket(`${wsProtocol}://${location.host}/api/webSocket/${this.record.agentId}/${this.record.pid}`)

      /*  客户端接受服务器端数据时触发
      wslog.onopen = (evnet) => {
          console.log('发送数据')
          wslog.send('发送数据')
      }
      */

      // 接收服务端的实时日志并添加到HTML页面中
      this.wslog.onmessage = (event) => {
        this.record.message += event.data
      }

      // 连接关闭时触发
      this.wslog.onclose = (event) => {
        this.readingLog = false
        console.log('webSocket closes after ' + this.elapsedSec + ' seconds')
      }
    },
    closeWebSocket () {
      if (this.wslog !== Object) {
        this.wslog.close()
      }
    },
    onOpen (id) {
      this.chosenTag = 'detail'
    },
    operate (operation) {
      operateRecord(operation, this.recordId, this)
    }
  },
  mounted () {
    this.getData()
  },
  activated () {
  },
  created () {
  },
  deactivated () {
    this.closeWebSocket()
  },
  computed: {
    recordId () {
      if (typeof this.$route.params === 'undefined') return -1
      if (typeof this.$route.params.recordId === 'undefined') return -1
      return this.$route.params.recordId
    }
  },
  watch: {
    'recordId' (recordId) {
      if (recordId > 0) this.getData()
    },
    elapsedSec (second) {
      // 每隔30秒发送心跳，防止Nginx 60秒无通讯自动断开
      if (second % 30 === 0) {
        this.wslog.send('发送心跳')
      }
    },
    readingLog (isReading) {
      if (!isReading) {
        // 停止计时器
        clearInterval(this.countSecond)
      }
    }
  }
}

</script>
