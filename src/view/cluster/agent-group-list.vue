<template>
  <div>
    <Row>
      <div style="float: left;">
        <Input search v-model="keyword" @on-search="resetSearch" placeholder="请输入执行器组名称..." style="width: 180px" />
        <Button shape="circle" icon="md-sync" @click="resetFilter" class="margin-left-5" />
      </div>
      <div style="float: right;">
        <Button type="primary" shape="circle" icon="md-add" @click="addAgentGroup" />
      </div>
    </Row>
    <Row class="margin-top-10">
      <Pagination :total="total" :size="size" @on-page-info-change="changePageInfo" ref="pagination">
        <Table stripe
          :columns="columnList"
          :data="tableList"
          :loading="loadingTable"
          slot="table"
          size="small" />
      </Pagination>
    </Row>
    <Modal
      v-model="showingWindow"
      :title="windowName"
      class-name="modal-vertical-center"
      :mask-closable="false"
      :closable="false">

      <Form ref="agentGroup" :model="agentGroup" :rules="ruleValidate" :label-width="160">
        <FormItem label="执行器组名称" prop="name">
          <Input v-model.trim="agentGroup.name"
            :icon="icon"
            @on-change="onChange"
            style="width: 200px" />
        </FormItem>

        <FormItem label="负责人">
          <Select v-model="agentGroup.userId" style="width:100px;">
            <Option v-for="item in userList" :value="item.id" :key="item.id">{{item.realName}}</Option>
          </Select>
        </FormItem>
        <FormItem label="备注">
          <Input type="textarea" :autosize="{minRows: 3,maxRows: 5}" v-model="agentGroup.comment" style="width: 220px" />
        </FormItem>
      </Form>

      <div slot="footer">
        <Button shape="circle" icon="md-close" @click="closeModal"/>
        <Button type="success" shape="circle" icon="md-checkmark" @click="asyncOK" :loading="savingAgentGroup"/>
      </div>
    </Modal>
  </div>
</template>

<script>

import Pagination from '_c/pagination'
import * as api from '@/api/cluster'

const editButton = (vm, h, currentRowData) => {
  return h('Button', {
    props: {
      type: 'info',
      size: 'small',
      icon: 'md-create',
      shape: 'circle'
    },
    style: {
      marginRight: '10px'
    },
    on: {
      click: () => {
        vm.agentGroup = JSON.parse(JSON.stringify(currentRowData))
        vm.windowName = '编辑执行器组'
        vm.openModal()
      }
    }
  })
}

const deleteButton = (vm, h, currentRowData, index) => {
  return h('Poptip', {
    props: {
      // information-circled
      confirm: true,
      title: '您确定要删除这个组吗?',
      transfer: true,
      placement: 'top-end'
    },
    on: {
      'on-ok': () => {
        // 判断是否有JobCount

        vm.deleteRequest('/cluster/agent-group/' + currentRowData.id).then(res => {
          const result = res.data
          if (result.code === 0) {
            vm.tableList.splice(index, 1)
            vm.$Message.success('删除了第' + (index + 1) + '行数据')
          } else {
            vm.$Message.error(result.msg)
          }
        })
      }
    }
  }, [
    h('Button', {
      props: {
        type: 'error',
        size: 'small',
        icon: 'md-trash',
        shape: 'circle'
      }
    })
  ])
}

const reviewButton = (vm, h, currentRowData) => {
  return h('Button', {
    props: {
      ghost: true,
      type: 'info',
      size: 'small',
      icon: 'md-open',
      shape: 'circle'
    },
    style: {
      marginRight: '10px'
    },
    on: {
      click: () => {
        const argu = { id: currentRowData.id }
        vm.$router.push({
          name: 'agent-group-detail',
          params: argu
        })
      }
    }
  })
}

const initColumnList = [
  {
    key: 'name',
    title: '执行器组名称',
    ellipsis: true
  },
  {
    key: 'username',
    title: '负责人',
    align: 'center',
    ellipsis: true
  },
  {
    key: 'agentCount',
    title: '执行器数',
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
    key: 'comment',
    title: '注释'
  },
  {
    key: 'operation',
    title: '操作',
    align: 'center',
    width: 150,
    fixed: 'right'
  }
]

export default {
  name: 'agent-group-list',
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
        name: this.agentGroup.name,
        id: this.agentGroup.id
      }

      const result = await api.checkAgentGroupName(data)
      if (result.code === 0) {
        this.icon = 'md-checkmark'
        callback()
      } else {
        this.icon = 'md-close'
        callback(new Error(result.msg))
      }
    }

    return {
      loadingTable: false,
      showingWindow: false,
      windowName: '',
      savingAgentGroup: false,

      icon: '',

      keyword: '',

      total: 0,
      page: 1,
      size: 10,

      agentGroup: {},

      columnList: [],
      tableList: [],
      userList: this.$store.state.user.userList,

      ruleValidate: {
        name: [{ validator: validateName, trigger: 'blur' }]
      }
    }
  },
  methods: {
    init () {
      this.columnList = initColumnList
      this.columnList.forEach(item => {
        if (item.key === 'name') {
          item.render = (h, param) => {
            const currentRowData = param.row
            return h('a', {
              on: {
                click: () => {
                  const argu = { id: currentRowData.id }
                  this.$router.push({
                    name: 'agent-group-detail',
                    params: argu
                  })
                }
              }
            },
            currentRowData.name)
          }
        }

        if (item.key === 'operation') {
          item.render = (h, param) => {
            const currentRowData = param.row
            return h('div', [
              reviewButton(this, h, currentRowData),
              editButton(this, h, currentRowData),
              deleteButton(this, h, currentRowData, param.index)
            ])
          }
        }
      })
    },
    resetFilter () {
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
        keyword: this.keyword
      }
      this.loadingTable = true
      const result = await api.getAgentGroupList(data)
      this.loadingTable = false
      if (result.code === 0) {
        this.tableList = result.data.content
        this.total = result.data.total
      }
    },
    addAgentGroup () {
      this.agentGroup = { id: -1, name: '', comment: '' }
      this.windowName = '新增执行器组'
      this.openModal()
    },
    openModal () {
      this.showingWindow = true
    },
    closeModal () {
      this.showingWindow = false
      this.savingAgentGroup = false
      this.$refs.agentGroup.resetFields()
      this.icon = ''
    },
    async asyncOK () {
      const valid = await this.$refs.agentGroup.validate()
      if (!valid) {
        this.$Message.error('Fail!')
        return
      }
      this.savingAgentGroup = true
      const result = await api.saveAgentGroup(this.agentGroup)
      this.savingAgentGroup = false
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
  activated () {
  },
  deactivated () {
  },
  mounted () {
    this.getData()
  },
  created () {
    this.init()
  },
  watch: {
  }
}
</script>
