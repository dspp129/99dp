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
        <Button shape="circle" icon="md-sync" @click="resetFilter" class="margin-left-5" />
      </div>
    </Row>
    <Row class="margin-top-10">
      <Pagination :total="total" :size="size" @on-page-info-change="changePageInfo" ref="pagination">
        <Table stripe
        :columns="columnList"
        :data="tableList"
        :loading="loadingTable"
        slot="table"
        size="small"/>
      </Pagination>
    </Row>
    <Modal
      v-model="showingWindow"
      title="编辑调度器"
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
          <Select v-model="agent.userId" style="width:100px;">
            <Option v-for="item in userList" :value="item.id" :key="item.id">{{item.realName}}</Option>
          </Select>
        </FormItem>
        <FormItem label="失联报警">
          <i-switch v-model="agent.warning" :true-value="1" :false-value="0">
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
        <Button type="success" shape="circle" icon="md-checkmark" @click="asyncOK" :loading="savingAgent" />
      </div>
    </Modal>
  </div>
</template>

<script>

import Pagination from '_c/pagination'
import * as formatter from '@/libs/format'
import { oneOf } from '@/libs/tools'
import * as api from '@/api/cluster'

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
      type: 'info',
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
      color: currentRowData.status === 1 ? 'success' : 'error'
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
        id: this.agent.id
      }

      const result = await api.checkAgentName(data)
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
      const result = await api.getAgentList(data)
      this.loadingTable = false
      if (result.code !== 0) return
      this.tableList = result.data.content
      this.total = result.data.total
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
      const result = await api.saveAgent(this.agent)
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
  },
  destroyed () {
    console.log('destroyed')
  },
  watch: {
  }
}
</script>
