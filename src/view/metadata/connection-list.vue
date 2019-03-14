<template>
  <div>
    <Row>
      <Select v-model.number="dbType" @on-change="resetSearch" clearable placeholder="数据库类型" style="width:100px">
        <Option v-for="item in dbTypeList" :value="item.id" :key="item.id">{{ item.name }}</Option>
      </Select>
      <Input v-model="name" @on-enter="resetSearch" @on-blur="resetSearch" placeholder="请输入连接名..." class="margin-left-5" style="width: 160px" />
      <Input v-model="jdbcUrl" @on-enter="resetSearch" @on-blur="resetSearch" placeholder="请输入 JDBC URL" class="margin-left-5" style="width: 160px" />
      <Button type="primary" shape="circle" icon="md-search" @click="getData" :loading="loadingTable" class="margin-left-5" />
      <Button shape="circle" icon="md-sync" @click="resetFilter" class="margin-left-5" />
      <Dropdown style="float: right" placement="bottom-end" @on-click="openAddWindow" trigger="click">
        <Button type="primary" shape="circle" icon="md-add"/>
        <DropdownMenu slot="list">
          <DropdownItem v-for="item in dbTypeList" v-if="item.isEtlSource" :name="item.id" :key="item.id">{{item.name}}</DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <Modal
        width="700"
        v-model="modal"
        class-name="modal-vertical-center"
        :title="title"
        :mask-closable="false">
        <Row type="flex" justify="center" align="middle" class="margin-top-10">
          <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" label-position="right" :label-width="80" @submit.native.prevent>
            <FormItem label="连接名称" prop="name">
              <Input v-model.trim="formValidate.name" placeholder="请输入连接名" style="width: 200px" />
            </FormItem>
            <FormItem label="Jdbc Url" prop="jdbcUrl">
              <Input v-model.trim="formValidate.jdbcUrl" placeholder="请输入 JDBC URL" style="width: 280px" />
            </FormItem>
            <FormItem label="用户名" prop="username">
              <Input v-model.trim="formValidate.username" placeholder="请输入用户名" style="width: 200px" />
            </FormItem>
            <FormItem label="密码" prop="password">
              <Input @input="formValidate.passwordChanged = true" v-model="formValidate.password" placeholder="请输入密码" type="password" style="width: 200px" />
            </FormItem>
            <FormItem label="描述信息" prop="description">
              <Input v-model="formValidate.description" type="textarea" :autosize="{minRows: 3, maxRows: 5}" placeholder="Please enter something" style="width: 280px" />
            </FormItem>
          </Form>
        </Row>
        <div slot="footer">
          <Tooltip content="重置" placement="top" class="margin-right-10" transfer>
            <Button v-if="resetButton" shape="circle" icon="md-sync" @click="handleReset('formValidate')" />
          </Tooltip>
          <Tooltip content="测试连接" placement="top" class="margin-right-10" transfer>
            <Button type="primary" shape="circle" icon="ios-link" @click="toTestConnection" :loading="testing" ghost/>
          </Tooltip>
          <Button type="success" shape="circle" icon="md-checkmark" @click="asyncOK" :model="submitButton" :disabled="!submitButton.addable" :loading="submitButton.loading" ghost/>
        </div>
      </Modal>
    </Row>
    <Row class="margin-top-10">
      <Col>
        <Pagination :total="total" :size="size" @on-page-info-change="changePageInfo" ref="pagination">
          <Table stripe border
          :columns="columnList"
          :data="tableList"
          :loading="loadingTable"
          slot="table"
          size="small" />
        </Pagination>
      </Col>
    </Row>
  </div>
</template>

<script>

import Pagination from '_c/pagination'
import { oneOf } from '@/libs/tools'
import * as metadataApi from '@/api/metadata'

const deleteButton = (vm, h, currentRowData, index) => {
  return h('Poptip', {
    props: {
      // information-circled
      confirm: true,
      title: '您确定要删除这个连接吗?',
      transfer: true,
      placement: 'top-end'
    },
    on: {
      'on-ok': () => {
        vm.deleteRequest(`/metadata/connection/${currentRowData.id}`).then(res => {
          const result = res.data
          if (result.code === 0) {
            vm.tableList.splice(index, 1)
            vm.$Message.success('删除了第' + (index + 1) + '行数据')
          }
        })
      }
    }
  }, [
    h('Button', {
      props: {
        ghost: true,
        type: 'error',
        size: 'small',
        icon: 'md-trash',
        shape: 'circle'
      }
    })
  ])
}

const refreshButton = (vm, h, currentRowData) => {
  return h('Tooltip', {
    props: {
      placement: 'top',
      content: '刷新',
      transfer: true
    },
    style: {
      marginRight: '10px'
    },
  }, [
    h('Button', {
      props: {
        ghost: true,
        type: 'info',
        size: 'small',
        icon: 'md-refresh',
        shape: 'circle'
      },
      on: {
        click: async () => {
          vm.$Message.loading({
            content: '刷新中，请稍后...',
            duration: 10
          })
          const result = await metadataApi.reloadConnection(currentRowData.id)
          vm.$Message.destroy()
          if (result.code === 0) {
            vm.$Message.success('已成功更新 ' + result.data + ' 个数据库')
          } else {
            vm.$Message.error(result.msg)
          }
        }
      }
    })
  ])
}

/*
const reviewButton = (vm, h, currentRowData) => {
  return h('Button', {
    props: {
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
          name: 'server-explorer',
          params: argu
        })
      }
    }
  })
}
*/
const editButton = (vm, h, currentRowData, index) => {
  return h('Tooltip', {
    props: {
      placement: 'top',
      content: '编辑',
      transfer: true
    },
    style: {
      marginRight: '10px'
    },
  }, [
    h('Button', {
      props: {
        size: 'small',
        icon: 'md-create',
        shape: 'circle'
      },
      on: {
        click: () => {
          vm.handleReset('formValidate')
          vm.modal = true
          vm.submitButton.loading = vm.submitButton.addable = false
          vm.title = '编辑 ' + vm.dbTypeList[currentRowData.dbType - 1].name
          vm.formValidate = JSON.parse(JSON.stringify(currentRowData))
          vm.formValidate.password = 'abcdef'
          vm.formValidate.passwordChanged = false
          vm.formValidate.index = index
          vm.resetButton = false
          vm.testing = false
        }
      }
    })
  ])
}

const heartBeatIcon = (vm, h, currentRowData, index) => {
  return h('Icon', {
    props: {
      size: 22,
      color: currentRowData.status === 0 ? '#19be6b' : '#ed3f14',
      type: currentRowData.status === 0 ? 'md-pulse' : 'md-link'
    }
  })
}

const initColumnList = [
  {
    key: 'status',
    title: '状态',
    align: 'center',
    width: 65,
    fixed: 'left'
  },
  {
    key: 'dbType',
    title: '数据库类型',
    width: 110,
    ellipsis: true
  },
  {
    key: 'name',
    title: '连接名称',
    width: 200,
    ellipsis: true
  },
  {
    key: 'jdbcUrl',
    title: 'JDBC URL',
    ellipsis: true
  },
  {
    key: 'username',
    title: '用户名',
    width: 150,
    ellipsis: true
  },
  {
    key: 'operation',
    title: '操作',
    align: 'center',
    width: 140,
    fixed: 'right'
  }
]

export default {
  name: 'connection-list',
  components: {
    Pagination
  },
  data () {
    return {
      loadingTable: false,
      submitButton: {
        loading: false,
        addable: false
      },
      resetButton: false,
      jdbcUrl: '',
      name: '',
      dbType: 0,

      total: 0,
      page: 1,
      size: 10,

      columnList: initColumnList,
      tableList: [],

      dbTypeList: this.$store.state.user.dbTypeList,

      currentDb: {},

      modal: false,
      title: '',
      testing: false,
      formValidate: {
        dbType: '',
        name: '',
        jdbcUrl: '',
        username: '',
        password: '',
        description: '',
        passwordChanged: false
      },
      ruleValidate: {
        name: [
          { required: true, message: '必填项', trigger: 'blur' }
        ],
        jdbcUrl: [
          { required: true, message: '必填项', trigger: 'blur' }
        ],
        username: [
          { required: true, message: '必填项', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '必填项', trigger: 'blur' }
        ],
        description: [
          { type: 'string', max: 200, message: 'Introduce no more than 200 words', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    init () {
      this.columnList.forEach(item => {
        if (!oneOf(item.key, ['status', 'dbType', 'operation'])) return

        item.render = (h, param) => {
          const currentRowData = param.row
          switch (item.key) {
            case 'status' : return h('a', {
              on: {
                click: () => {
                  this.$Loading.start()
                  setTimeout(() => {
                    currentRowData.status = currentRowData.status === 1 ? 0 : 1
                    this.$Loading.finish()
                  }, 2000)
                }
              }
            }, [ heartBeatIcon(this, h, currentRowData, param.index) ])
            case 'dbType' : return h('span', this.dbTypeList[currentRowData.dbType - 1].name)
            case 'operation' : return h('div', [
              refreshButton(this, h, currentRowData),
              /*  reviewButton(this, h, currentRowData), */
              editButton(this, h, currentRowData, param.index),
              deleteButton(this, h, currentRowData, param.index)
            ])
          }
        }
      })
    },
    resetFilter () {
      this.dbType = 0
      this.name = ''
      this.jdbcUrl = ''
    },
    resetSearch () {
      this.$refs.pagination.first()
    },
    async getData () {
      this.loadingTable = true
      this.$Loading.start()

      const data = {
        page: this.page,
        size: this.size,
        dbType: this.dbType,
        jdbcUrl: this.jdbcUrl,
        name: this.name
      }

      const result = await metadataApi.getConnectionList(data)
      this.loadingTable = false
      if (result.code === 0) {
        this.$Loading.finish()
        this.tableList = result.data.content
        this.total = result.data.total
      } else {
        this.$Loading.error()
      }
    },
    openAddWindow (id) {
      this.formValidate.dbType = id
      this.formValidate.index = -1
      this.formValidate.id = null
      this.formValidate.passwordChanged = false
      this.title = '新增 ' + this.dbTypeList[id - 1].name
      this.handleReset('formValidate')
      this.formValidate.jdbcUrl = this.dbTypeList[id - 1].jdbcUrlFormat
      this.submitButton.loading = this.submitButton.addable = false
      this.modal = true
      this.resetButton = true
    },
    handleReset (name) {
      this.$refs[name].resetFields()
      this.submitButton.loading = this.submitButton.addable = false
    },
    async toTestConnection () {
      const valid = await this.$refs['formValidate'].validate()
      if (!valid) {
        this.$Message.error('请输入必填项!')
        return
      }

      this.testing = true
      this.$Loading.start()
      const newDb = JSON.parse(JSON.stringify(this.formValidate))
      const result = await metadataApi.testConnection(newDb)
      this.testing = false
      if (result.code === 0) {
        this.submitButton.addable = true
        this.$Message.success('连接成功！')
        this.$Loading.finish()
      } else {
        this.submitButton.addable = false
        this.$Message.error(result.msg)
        this.$Loading.error()
      }
    },
    async asyncOK () {
      this.submitButton.loading = true
      this.$Loading.start()

      // 重新渲染Table
      let newDb = JSON.parse(JSON.stringify(this.formValidate))
      newDb.status = 0

      const result = newDb.index >= 0 ? await metadataApi.updateConnection(newDb) : await metadataApi.createConnection(newDb)
      this.submitButton.loading = false
      if (result.code === 0) {
        this.$Loading.finish()
        this.modal = false
        this.getData()
        this.$Message.success('添加成功！')
      } else {
        this.$Message.error(result.msg)
        this.$Loading.error()
      }
    },
    changePageInfo ({ page, size }) {
      this.page = page
      this.size = size
      this.getData()
    }
  },
  mounted () {
    this.getData()
  },
  created () {
    this.init()
  }
}
</script>
