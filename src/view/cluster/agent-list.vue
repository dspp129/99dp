<template>
  <div>
    <Row>
      <div style="float: left;">
        <Select
          v-model="status"
          ref="status"
          @on-change="resetSearch"
          clearable
          placeholder="状态"
          style="width:80px;">
          <Option v-for="item in statusList" :value="item.id" :key="item.id">{{item.name}}</Option>
        </Select>
        <Input v-model="keyword" @on-enter="resetSearch" @on-blur="resetSearch" placeholder="请输入执行器名称..." class="margin-left-5" style="width: 180px" />
        <Input v-model="host" @on-enter="resetSearch" @on-blur="resetSearch" placeholder="请输入host..." class="margin-left-5" style="width: 180px" />
        <Button type="primary" shape="circle" icon="md-search" @click="resetSearch" :loading="loadingTable" class="margin-left-5" />
        <Tooltip content="重置查询条件" placement="right">
          <Button shape="circle" icon="md-sync" @click="resetFilter" class="margin-left-5" />
        </Tooltip>
      </div>
      <ButtonGroup shape="circle" style="float: right;">
        <Button :type="showAsGrid ? 'default' : 'primary'" icon="ios-list" @click="showAsGrid = false"></Button>
        <Button :type="showAsGrid ? 'primary' : 'default'" icon="ios-keypad" @click="showAsGrid = true"></Button>
      </ButtonGroup>
    </Row>
    <Row v-show="!showAsGrid" class="margin-top-10">
      <Pagination :total="total" :size="size" @on-page-info-change="changePageInfo" ref="pagination">
        <Table stripe
          :columns="columnList"
          :data="tableList"
          :loading="loadingTable"
          slot="table"
          size="small"/>
      </Pagination>
    </Row>
    <Row v-show="showAsGrid" :gutter="10">
      <Col span="6" v-for="(item, index) in tableList" :key="index">
        <Card class="margin-top-10 agent-item">
          <span slot="title">
            <Tag :color="item.status === 1 ? 'green' : 'red'">{{item.status === 1 ? '正 常' : '失 联'}}</Tag>
            <b class="margin-left-5">{{item.name}}</b>
            <span class="margin-left-5">({{item.host}})</span>
          </span>
          <div slot="extra">
            <Button shape="circle" icon="md-trash" type="text" size="small" class="margin-left-5" />
          </div>
          <Form class="padding-16" :label-width="50">
            <FormItem label="CPU">
              <Progress 
                :percent="formatPercent(agentArr[item.agentId].cpuTotal - agentArr[item.agentId].cpuIdle, agentArr[item.agentId].cpuTotal)"
                :stroke-width="5"
                stroke-color="#ed4014" />
            </FormItem>
            <FormItem label="内存">
              <Tooltip
                placement="top-start"
                :content="formatBytes(agentArr[item.agentId].memoryUsed) + ' / ' + formatBytes(agentArr[item.agentId].memoryTotal)"
                style="width: 100%">
                <Progress
                  :percent="formatPercent(agentArr[item.agentId].memoryUsed, agentArr[item.agentId].memoryTotal)"
                  :stroke-width="7"
                  stroke-color="#19be6b" />
              </Tooltip>
            </FormItem>
            <FormItem label="JVM">
              <Tooltip
                placement="top-start"
                style="width: 100%">
                <div slot="content">
                  Used: {{formatBytes(agentArr[item.agentId].jvmTotal - agentArr[item.agentId].jvmFree)}}
                  <br />
                  Total: {{formatBytes(agentArr[item.agentId].jvmTotal)}}
                  <br />
                  Max: {{formatBytes(agentArr[item.agentId].jvmMax)}}
                </div>
                <Progress
                  :success-percent="formatPercent(agentArr[item.agentId].jvmTotal - agentArr[item.agentId].jvmFree, agentArr[item.agentId].jvmMax)"
                  :percent="formatPercent(agentArr[item.agentId].jvmTotal, agentArr[item.agentId].jvmMax)"
                  :stroke-width="7" />
              </Tooltip>
            </FormItem>
            <FormItem label="磁盘">
              <Tooltip
                placement="top-start"
                :content="formatBytes(agentArr[item.agentId].fsUsed) + ' / ' + formatBytes(agentArr[item.agentId].fsTotal)"
                style="width: 100%">
                <Progress :percent="formatPercent(agentArr[item.agentId].fsUsed, agentArr[item.agentId].fsTotal)" stroke-color="#ff9900" />
              </Tooltip>
            </FormItem>
            <FormItem label="任务数">
               <Progress :percent="formatPercent(agentArr[item.agentId].runningJob, item.maxJob)">{{agentArr[item.agentId].runningJob}} / {{item.maxJob}}</Progress>
            </FormItem>
          </Form>
          <span class="create-time">统计时间：{{formatDateTime(agentArr[item.agentId].createTime)}}</span>
          <Divider />
          <Button type="text" style="width: 33%" @click="onEditAgent(item)">编 辑</Button>
          <Divider type="vertical"/>
          <Button type="text" style="width: 33%" @click="onOpenDetail(item)">详 情</Button>
          <Divider type="vertical"/>
          <Button type="text" style="width: 33%" @click="onOpenRecent(item)">近 况</Button>
        </Card>
      </Col>
    </Row>
    <Modal
      v-model="showingWindow"
      title="编辑执行器"
      class-name="modal-vertical-center"
      :mask-closable="false"
      :closable="false">

      <Form ref="agent" :model="agent" :rules="ruleValidate" :label-width="160">
        <FormItem label="执行器名称" prop="name">
          <Input v-model.trim="agent.name"
          :icon="icon"
          @on-change="onChange"
          style="width: 200px" />
        </FormItem>
        <FormItem label="Host">
          <Input v-model="agent.host" readonly style="width: 180px" />
        </FormItem>
        <FormItem label="Port">
          <Input v-model="agent.port" readonly style="width: 100px"/>
        </FormItem>
        <FormItem label="负责人">
          <Select v-model.number="agent.userId" style="width:100px;">
            <Option v-for="item in userList" :value="item.id" :key="item.id">{{item.realName}}</Option>
          </Select>
        </FormItem>
        <FormItem label="最大任务数">
          <InputNumber :min="0" :max="999" v-model.number="agent.maxJob" style="width:100px;" />
        </FormItem>
        <FormItem label="失联报警">
          <i-switch v-model="agent.warning">
            <span slot="open">开</span>
            <span slot="close">关</span>
          </i-switch>
        </FormItem>
        <FormItem label="接警邮箱" :required="agent.warning" prop="email">
          <Input v-model.trim="agent.email" style="width: 200px" :disabled="!agent.warning"/>
        </FormItem>
        <FormItem label="备注">
          <Input type="textarea" :autosize="{minRows: 3,maxRows: 5}" v-model="agent.comment" style="width: 220px"/>
        </FormItem>
      </Form>

      <div slot="footer">
        <Button shape="circle" icon="md-close" @click="closeModal"/>
        <Button ghost type="success" shape="circle" icon="md-checkmark" @click="asyncOK" :loading="savingAgent" />
      </div>
    </Modal>
  </div>
</template>

<script>

const statusList = [
  {
    id: 1,
    name: '正常'
  },
  {
    id: 0,
    name: '失联'
  },
  {
    id: 2,
    name: '错误'
  }
]

const editButton = (vm, h, currentRowData) => {
  return h('Button', {
    props: {
      size: 'small',
      icon: 'md-create',
      shape: 'circle'
    },
    style: {
      //  marginRight: '10px'
    },
    on: {
      click: () => {
        vm.agent = JSON.parse(JSON.stringify(currentRowData))
        vm.openModal()
      }
    }
  })
}

const statusTag = (vm, h, currentRowData, index) => {
  return h('Tag', {
    props: {
      color: currentRowData.status === 1 ? 'green' : 'red'
    }
  }, currentRowData.status === 1 ? '正 常' : '失 联')
}

const warningTag = (vm, h, currentRowData, index) => {
  return h('Tag', {
    props: {
      color: currentRowData.warning ? 'green' : 'default'
    }
  }, currentRowData.warning ? '启 动' : '忽 略')
}

const initColumnList = [
  {
    key: 'name',
    title: '执行器名称',
    ellipsis: true
  },
  {
    key: 'host',
    title: 'Host',
    ellipsis: true
  },
  {
    key: 'port',
    title: 'Port',
    ellipsis: true
  },
  {
    key: 'username',
    title: '负责人',
    align: 'center',
    width: 100
  },
  {
    key: 'jobCount',
    title: '任务数',
    align: 'center',
    width: 100
  },
  {
    key: 'status',
    title: '通信状态',
    align: 'center',
    width: 100
  },
  {
    key: 'warning',
    title: '失联报警',
    align: 'center',
    width: 100
  },
  {
    key: 'comment',
    title: '注释'
  },
  {
    key: 'operation',
    title: '操作',
    align: 'center',
    width: 100,
    fixed: 'right'
  }
]


import Pagination from '_c/pagination'
import { oneOf } from '@/libs/tools'
import * as formatter from '@/libs/format'
import * as agentApi from '@/api/cluster'

export default {
  name: 'agent-list',
  components: {
    Pagination
  },
  data () {
    const validateName = async (rule, value, callback) => {
      if (value.length === 0) {
        callback(new Error('请输入执行器名称'))
        return
      }

      const data = {
        name: this.agent.name,
        agentId: this.agent.agentId
      }

      const result = await agentApi.checkAgentName(data)
      if (result.code === 0) {
        this.icon = 'md-checkmark'
        callback()
      } else {
        this.icon = 'md-close'
        callback(new Error(result.msg))
      }
    }

    const validateAlertEmail = (rule, value, callback) => {
      if (!this.agent.warning) {
        callback()
        return
      }

      if (value.length === 0) {
        callback(new Error('请输入邮箱'))
        return
      }

      const reg = new RegExp('^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$')
      if (!reg.test(value)) {
        callback(new Error('请输入正确的邮箱'))
      } else {
        callback()
      }
    }

    return {
      showAsGrid: true,
      loadingTable: false,
      showingWindow: false,
      savingAgent: false,

      icon: '',

      keyword: '',
      host: '',
      status: '',

      total: 0,
      page: 1,
      size: 10,

      agent: {},

      columnList: [],
      tableList: [],
      userList: this.$store.state.user.userList,
      statusList: [],

      agentArr: [],
      timer: -1,

      ruleValidate: {
        name: [{ validator: validateName, trigger: 'blur' }]
      // email: [{ validator: validateAlertEmail, trigger: 'blur' }]
      }
    }
  },
  methods: {
    init () {
      this.statusList = statusList
      this.columnList = initColumnList
      this.columnList.forEach(item => {
        if (!oneOf(item.key, ['status', 'warning', 'operation'])) return
        item.render = (h, param) => {
          const currentRowData = param.row
          switch (item.key) {
            case 'status' : return h('a', [ statusTag(this, h, currentRowData, param.index) ])
            case 'warning' : return h('a', [ warningTag(this, h, currentRowData, param.index) ])
            case 'operation' : return h('div', [ editButton(this, h, currentRowData) ])
          }
        }
      })
    },
    resetFilter () {
      this.$refs.status.clearSingleSelect()
      this.keyword = ''
    },
    changePageInfo ({ page, size }) {
      this.page = page
      this.size = size
      this.getData()
    },
    resetSearch () {
      this.$refs.pagination.first()
    },
    async getData () {
      const data = {
        page: this.page,
        size: this.size,
        status: formatter.formatNumber(this.status),
        keyword: this.keyword,
        host: this.host
      }
      this.loadingTable = true
      const result = await agentApi.getAgentList(data)
      this.loadingTable = false
      if (result.code !== 0) return
      result.data.content.forEach(e => this.agentArr[e.agentId] = {
        cpuIdle: 0,
        cpuTotal: 0,
        memoryTotal: 0,
        memoryUsed: 0,
        jvmMax: 0,
        jvmTotal: 0,
        jvmFree: 0,
        fsTotal: 0,
        fsUsed: 0,
        runningJob: 0
      })
      this.tableList = result.data.content
      this.total = result.data.total
      this.loadResource()
    },
    openModal () {
      this.showingWindow = true
    },
    closeModal () {
      this.showingWindow = false
      this.savingAgent = false
      this.icon = ''
      this.$refs.agent.resetFields()
    },
    async asyncOK () {
      const valid = await this.$refs.agent.validate()
      if (!valid) {
        this.$Message.error('Fail!')
        return
      }
      this.savingAgent = true
      const result = await agentApi.saveAgent(this.agent)
      this.savingAgent = false
      if (result.code !== 0) {
        this.$Message.error(result.msg)
        return
      }
      this.$Message.success('操作成功')
      this.closeModal()
      this.getData()
    },
    onChange () {
      this.icon = ''
    },
    onEditAgent (agent) {
      this.agent = JSON.parse(JSON.stringify(agent))
      this.openModal()
    },
    onOpenDetail (agent) {
    },
    onOpenRecent (agent) {
      const params = {
        id: agent.agentId,
        name: agent.name
      }
      this.$router.push({
        name: 'agent-recent',
        params
      })
    },
    async loadResource () {
      let ids = ''
      this.tableList.forEach(e => ids += e.agentId + ',')
      if (ids.endsWith(',')) ids = ids.substr(0, ids.length-1)
      const result = await agentApi.getAgentResourceByAgentIds(ids)
      if (result.code !== 0) {
        this.$Message.error(result.msg)
        return
      }
      result.data.forEach(e => this.agentArr.splice(e.agentId, 1, e))
    },
    formatBytes (bytes) {
      return formatter.formatBytes(bytes)
    },
    formatPercent (numerator, denominator) {
      if (denominator === 0) return 0
      let i = numerator / denominator * 100
      return i.toFixed(2) * 1
    },
    formatDateTime (dateTime) {
      return formatter.formatDateTime(dateTime)
    }
  },

  beforeCreate () {
    console.log('beforeCreate')
  },
  created () {
    console.log('created')
    this.init()
  },
  beforeMount () {
    console.log('beforeMount')
  },
  mounted () {
    console.log('mounted')
    this.getData()
    // 每隔10秒钟，获取最新agent详情
    this.timer = setInterval(() => {
      this.loadResource()
    }, 1000 * 10)

  },
  beforeUpdate () {
    console.log('beforeUpdate')
  },
  updated () {
    console.log('updated')
  },
  activated () {
    console.log('activated')
  },
  deactivated () {
    console.log('deactivated')
  },
  beforeDestroy () {
    console.log('beforeDestroy')
    clearInterval(this.timer)
    this.agentArr = []
  },
  destroyed () {
    console.log('destroyed')
  },
  watch: {
  }
}
</script>


<style lang="less">

.agent-item .ivu-form-item{
  margin-bottom: 0px;
}
.agent-item .ivu-card-body{
  padding: 0px;
}
.agent-item .ivu-divider{
  margin: 0;
}
.agent-item .ivu-divider-vertical{
  height: 2.5em;
}
.agent-item .create-time{
  float: right;
  margin: -10px 10px 5px 0px;
  font-size: 11px;
}
</style>
