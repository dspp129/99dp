<template>
  <Row :gutter="10">
    <Col span="6">
      <Card dis-hover shadow :style="{minHeight}">
        <Tree :data="root"
         :load-data="loadChild"
         :render="renderContent"
         @on-toggle-expand="onToggleExpand" />
      </Card>
    </Col>
    <Col span="18">
    <Card dis-hover shadow :style="{minHeight}" >
      <div slot="extra">
        <Button size="small" type="error" icon="md-trash" @click="confirmRemoveNode" shape="circle" />
      </div>
      <Breadcrumb separator="->" slot="title">
        <BreadcrumbItem>用户列表</BreadcrumbItem>
        <BreadcrumbItem v-for="(item, index) in hierarchy" :key="index">{{item}}</BreadcrumbItem>
      </Breadcrumb>
      <Select clearable
        v-model="userStatus"
        @on-change="resetSearch"
        placeholder="用户状态"
        style="width:100px">
        <Option value="1">正常</Option>
        <Option value="0">冻结</Option>
      </Select>
      <Input v-model="keyword"
        prefix="md-search"
        placeholder="请输入关键字..."
        @on-enter="resetSearch"
        @on-blur="resetSearch"
        style="margin-left: 10px; width: 180px" />
      <Button icon="md-sync" @click="loadTable" shape="circle" :loading="loadingTable" style="margin-left: 10px;"/>
      <Button type="primary" icon="md-add" class="float-right" @click="onAddUser" shape="circle" />

      <Modal
        v-model="userWindow"
        :title="userWindowTitle"
        :mask-closable="false"
        :closable="false"
        :scrollable="true"
        class-name="modal-vertical-center"
        >
        <Form ref="userForm" :model="userInfo" :rules="userValidate" :label-width="160" class="margin-top-20">
          <FormItem label="部门">
            <Input style="width: 200px" :value="userInfo.deptName" readonly />
          </FormItem>
          <FormItem label="姓名" prop="realName">
            <Input style="width: 200px" v-model="userInfo.realName" />
          </FormItem>
          <FormItem label="用户名" prop="username">
            <Input style="width: 200px" v-model="userInfo.username" />
          </FormItem>
          <FormItem label="手机" prop="phone">
            <Input style="width: 200px" v-model="userInfo.phone" />
          </FormItem>
          <FormItem label="邮箱" prop="email">
            <Input style="width: 200px" v-model="userInfo.email" />
          </FormItem>
          <FormItem label="状态">
            <i-switch size="large"
              v-model="userInfo.status"
              :true-value="1"
              :false-value="0">
                <span slot="open">正常</span>
                <span slot="close">冻结</span>
            </i-switch>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button @click="closeUser">关闭</Button>
          <Button type="success" icon="md-checkmark" @click="saveUser" :loading="saving">保存</Button>
        </div>
      </Modal>
      <Pagination :total="total" :size="size" @on-page-info-change="changePageInfo" ref="pagination">
        <Table
          class="margin-top-20"
          :columns="columnList"
          :data="tableList"
          :loading="loadingTable"
          size="small"
          stripe
          border
          slot="table" />
      </Pagination>
    </Card>
  </Col>
  <Modal
    v-model="deptWindow"
    :title="deptWindowTitle"
    :mask-closable="false"
    :closable="false"
    :scrollable="true"
    class-name="modal-vertical-center">
    <div slot="footer">
      <Button @click="closeNode">关闭</Button>
      <Button type="success" icon="md-checkmark" @click="saveNode" :loading="saving">保存</Button>
    </div>
    <Form ref="deptForm" :model="nodeDetail" :rules="deptValidate" :label-width="160" class="margin-top-20">
        <FormItem label="上级">
          <Input readonly style="width: 200px" :value="parentNode.title" />
          <!--
          <template v-if="deptWindowTitle ==='编辑'">
            <Select v-model="parentNode.nodeKey" style="width: 200px">
                <Option :value="parentNode.nodeKey" :label="parentNode.title">{{parentNode.title}}</Option>
            </Select>
          </template>
           <template v-else>
            <Input readonly style="width: 200px" :value="parentNode.title" />
          </template>
          -->
        </FormItem>
        <FormItem label="名称" prop="title">
          <Input v-model.trim="nodeDetail.title" style="width: 200px" />
        </FormItem>
        <FormItem label="备注" prop="remark">
          <Input type="textarea"
            :autosize="{minRows: 3,maxRows: 5}"
            v-model="nodeDetail.remark"
            style="width: 200px" />
        </FormItem>
      </Form>
    </Modal>
  </Row>
</template>

<script>

import Pagination from '_c/pagination'
import * as api from '@/api/admin'

export default {
  name: 'admin-dept-user',
  components: {
    Pagination
  },
  props: {
  },
  data () {
    const validateTitle = (rule, value, callback) => {
      const node = this.selectedNode.root.find(el => value === el.node.title && this.nodeDetail.parent === el.parent)
      if (typeof node !== 'undefined' && node.nodeKey !== this.nodeDetail.nodeKey) {
        callback(new Error('该名称已存在'))
        return
      }
      callback()
    }
    const validateUsername = async (rule, value, callback) => {
      const data = await api.checkUsername(this.userInfo)
      if (data.code !== 0) {
        callback(new Error(data.msg))
        return
      }
      callback()
    }
    const validatePhone = async (rule, value, callback) => {
      const regPhone = /^1[3-9]{1}[0-9]{9}$/
      if (!regPhone.test(value)) {
        callback(new Error('请输入正确的手机号码'))
        return
      }
      const data = await api.checkUserPhone(this.userInfo)
      if (data.code !== 0) {
        callback(new Error(data.msg))
        return
      }
      callback()
    }
    const validateEmail = async (rule, value, callback) => {
      const regEmail = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/
      if (!regEmail.test(value)) {
        callback(new Error('请输入正确的邮箱'))
        return
      }
      const data = await api.checkUserEmail(this.userInfo)
      if (data.code !== 0) {
        callback(new Error(data.msg))
        return
      }
      callback()
    }
    return {
      // Tree properties
      root: [],
      rootTitle: '集团',
      buttonProps: {
        type: 'text',
        size: 'small'
      },
      folderIcon: 'ios-folder-outline',
      folderOpenIcon: 'ios-folder-open',
      nodeIcon: 'md-people',
      showChildrenCount: true,
      selectedNode: {},
      parentNode: {
        nodeKey: 0,
        title: ''
      },
      nodeDetail: {},

      deptWindow: false,
      deptWindowTitle: '',
      deptValidate: {
        title: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          { validator: validateTitle, trigger: 'blur' }
        ]
      },
      saving: false,

      hierarchy: [],
      columnList: [],
      tableList: [],

      // search condition
      userStatus: '',
      keyword: '',
      total: 0,
      page: 1,
      size: 10,
      userWindow: false,
      userWindowTitle: '',
      userInfo: {},
      userValidate: {
        realName: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ],
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { validator: validateUsername, trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: validatePhone, trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: validateEmail, trigger: 'blur' }
        ]
      },

      loadingTable: false

    }
  },
  methods: {
    async init () {
      this.columnList = initColumnList
      this.columnList.forEach(item => {
        if (item.key === 'status') {
          item.render = (h, param) => {
            const currentRowData = param.row
            return h('a', [
              statusTag(this, h, currentRowData, param.index)
            ])
          }
        }

        if (item.key === 'operation') {
          item.render = (h, param) => {
            const currentRowData = param.row
            return h('div', [
              editButton(this, h, currentRowData, param.index),
              deleteButton(this, h, currentRowData, param.index)
            ])
          }
        }
      })

      this.selectedNode.data = {
        id: 0,
        title: this.rootTitle,
        expand: false,
        selected: true, // mandatory
        children: [],
        loading: false
      }
      this.root.push(this.selectedNode.data)
      this.hierarchy.push(this.rootTitle)
      const data = await this.loadTree(this.root[0])
      data.forEach(el => { this.root[0].children.push(el) })
      this.resetSearch()
    },
    renderContent (h, { root, node, data }) {
      // 渲染一级目录
      if (node.nodeKey === 0) {
        return h('span', {
          style: {
            display: 'inline-block',
            width: '100%',
            cursor: 'default'
          }
        }, [
          h('span', [
            h('Icon', {
              props: { type: 'md-home' },
              style: { marginRight: '3px' }
            }),
            h('span', {
              class: ['ivu-tree-title', data.selected ? 'ivu-tree-title-selected' : ''],
              on: { click: () => { this.onClickNode(root, node, data) } }
            }, data.title),
            h('span', this.showChildrenCount && data.children && data.children.length > 0 ? ' (' + data.children.length + ')' : '')
          ]),
          h('span', {
            style: {
              display: 'inline-block',
              float: 'right',
              marginRight: '5px'
            }
          }, [
            h('Button', {
              props: Object.assign({}, this.buttonProps, {
                icon: 'md-add'
              }),
              on: {
                click: () => { this.onAddNode(root, node, data) }
              }
            })
          ])
        ])
      } else {
        // 渲染二级目录
        return h('span', {
          style: {
            display: 'inline-block',
            width: '100%'
          }
        }, [
          h('span', [
            h('Icon', {
              props: { type: data.children ? (data.expand ? this.folderOpenIcon : this.folderIcon) : this.nodeIcon },
              style: { marginRight: '3px' }
            }),
            h('span', {
              class: ['ivu-tree-title', data.selected ? 'ivu-tree-title-selected' : ''],
              on: { click: () => { this.onClickNode(root, node, data) } }
            }, data.title),
            h('span', this.showChildrenCount && data.children && data.children.length > 0 ? ' (' + data.children.length + ')' : '')
          ]),
          h('span', {
            style: {
              display: 'inline-block',
              float: 'right',
              marginRight: '5px'
            }
          }, [
            h('Button', {
              props: Object.assign({}, this.buttonProps, {
                icon: 'md-create'
              }),
              on: {
                click: () => { this.onEditNode(root, node, data) }
              }
            }),
            h('Button', {
              props: Object.assign({}, this.buttonProps, {
                icon: 'md-add'
              }),
              on: {
                click: () => { this.onAddNode(root, node, data) }
              }
            })
          ])
        ])
      }
    },
    async loadChild (item, callback) {
      // trigged before expand node and if(node.children === [])
      const data = await this.loadTree(item)
      callback(data)
    },
    changePageInfo ({ page, size }) {
      this.page = page
      this.size = size
      this.loadTable()
    },
    onClickNode (root, node, data) {
      this.selectedNode = { root, node, data }
      if (data.selected) return
      root.forEach(el => { if (el.node.selected) el.node.selected = false })
      data.selected = true
      this.updateBreadcrumb()
      this.resetSearch()
    },
    updateBreadcrumb () {
      // 拼接面包屑
      const node = this.selectedNode.node
      this.hierarchy = [ node.node.title ]
      if (node.nodeKey > 0) {
        this.findParent(node)
      }
    },
    async loadTree (node) {
      const result = await api.getDeptTree(node.id)
      if (result.code !== 0) {
        this.$Message.error(result.msg)
        return null
      }
      return result.data.map(el => {
        el.expand = false
        el.selected = false
        // 有 children 时手动添加 loading: false
        if (el.length > 0) {
          el.children = []
          el.loading = false
        }
        return el
      })
    },
    findParent (node) {
      if (node.nodeKey === 0) return
      const el = this.selectedNode.root.find(el => el.nodeKey === node.parent)
      this.hierarchy.unshift(el.node.title)
      this.findParent(el)
    },
    onAddNode (root, node, data) {
      this.selectedNode.root = root
      this.parentNode = data
      this.nodeDetail = { parent: data.nodeKey, parentId: data.id }
      this.deptWindowTitle = '新增部门'
      this.deptWindow = true
    },
    onEditNode (root, node, data) {
      this.selectedNode.root = root
      this.parentNode = root.find(el => el.nodeKey === node.parent).node
      this.nodeDetail = JSON.parse(JSON.stringify(data))
      this.nodeDetail.parent = node.parent
      this.nodeDetail.parentId = this.parentNode.id
      this.deptWindowTitle = '编辑部门'
      this.deptWindow = true
    },
    async saveNode () {
      const valid = await this.$refs.deptForm.validate()
      if (!valid) return
      this.saving = true
      if (this.deptWindowTitle.indexOf('新增') >= 0) {
        this.appendNode()
      }
      if (this.deptWindowTitle.indexOf('编辑') >= 0) {
        this.updateNode()
      }
    },
    async appendNode () {
      const dept = {
        name: this.nodeDetail.title,
        remark: this.nodeDetail.remark,
        parentId: this.nodeDetail.parentId
      }
      const result = await api.createDept(dept)
      this.saving = false

      if (result.code !== 0) {
        this.$Message.error(result.msg)
        return
      }

      const node = {
        id: result.data.id,
        title: result.data.name,
        remark: result.data.remark,
        selected: false,
        expand: false
      }
      const children = this.parentNode.children || []
      children.push(node)
      this.$Message.success('操作成功')

      this.$set(this.parentNode, 'children', children)
      if (!this.parentNode.expand) this.parentNode.expand = true
      this.closeNode()
    },
    async updateNode () {
      const dept = {
        id: this.nodeDetail.id,
        name: this.nodeDetail.title,
        remark: this.nodeDetail.remark,
        parentId: this.nodeDetail.parentId
      }
      const result = await api.updateDept(dept)
      this.saving = false

      if (result.code !== 0) {
        this.$Message.error(result.msg)
        return
      }

      this.$Message.success('操作成功')
      const nodeKey = this.nodeDetail.nodeKey
      const node = this.parentNode.children.find(el => el.nodeKey === nodeKey)
      node.title = this.nodeDetail.title
      node.remark = this.nodeDetail.remark
      this.closeNode()
      this.updateBreadcrumb()
    },
    closeNode () {
      this.saving = false
      this.deptWindow = false
      this.$refs.deptForm.resetFields()
    },
    confirmRemoveNode () {
      // 根节点不可删除
      const data = this.selectedNode.data
      if (typeof data === 'undefined' || data.nodeKey === 0) {
        this.$Message.error('无法执行该操作')
        return
      }
      // 有子节点不可删除
      if (data.children) {
        this.$Message.error('当前部门下有子部门，无法删除')
        return
      }
      // 有用户不可删除
      if (this.total > 0) {
        this.$Message.error('当前部门下存在用户，无法删除')
        return
      }

      this.$Modal.confirm({
        title: '删除记录',
        content: '<p>您确定要删除该分组吗？</p>',
        okText: '删除',
        cancelText: '取消',
        onOk: () => {
          this.removeNode()
        }
      })
    },
    async removeNode () {
      const result = await api.deleteDept(this.selectedNode.data.id)
      if (result.code !== 0) {
        this.$Message.error(result.msg)
        return
      }
      this.$Message.success('操作成功')
      const parent = this.selectedNode.root.find(el => el.nodeKey === this.selectedNode.node.parent)
      const children = parent.node.children
      const index = children.indexOf(this.selectedNode.data)
      children.splice(index, 1)
      if (children.length === 0) {
        parent.node.expand = false // 收起父级
        // loading 与 children 共存亡
        delete parent.node.loading // 移除toggle按钮
        delete parent.node.children // 删除children可以改变icon
      }
      // 删除完毕后 自动选择parentNode
      parent.node.selected = true
      this.selectedNode.node = parent
      this.selectedNode.data = parent.node
      this.updateBreadcrumb()
    },
    onToggleExpand (node) {
      if (node.expand) {

      } else {
        // node.children = []
        // node.loading = true // 手动控制加载状态
      }
    },
    onEditUser (user) {
      const data = this.selectedNode.data
      this.userWindowTitle = '编辑用户'
      this.userInfo = user
      this.userInfo.deptName = data.title
      this.userWindow = true
    },
    onAddUser () {
      const data = this.selectedNode.data
      this.userWindowTitle = '新增用户'
      this.userInfo = {
        deptName: data.title,
        deptId: data.id,
        status: 1
      }
      this.userWindow = true
    },
    async saveUser () {
      /*
      const fields = ['username', 'phone', 'email']
      for (const field of fields) {
        const res1 = await this.$refs.userForm.validateField(field, (data) => {
          console.log(data)
        })
      }
      */
      let res = {}
      this.saving = true
      if (this.userWindowTitle.indexOf('新增') >= 0) {
        res = await api.createUser(this.userInfo)
      }
      if (this.userWindowTitle.indexOf('编辑') >= 0) {
        res = await api.updateUser(this.userInfo)
      }
      this.saving = false
      if (res.code !== 0) {
        this.$Message.error(res.msg)
        return
      }
      this.$Message.success('操作成功')
      this.closeUser()
      this.loadTable()
    },
    closeUser () {
      this.userWindow = false
      this.$refs.userForm.resetFields()
    },
    resetSearch () {
      this.$refs.pagination.first()
    },
    async loadTable () {
      const data = {
        page: this.page,
        size: this.size,
        status: typeof this.userStatus === 'undefined' ? '' : this.userStatus,
        deptId: this.selectedNode.data.id,
        keyword: this.keyword
      }

      this.loadingTable = true
      const result = await api.getUserList(data)
      this.loadingTable = false
      if (result.code !== 0) {
        this.tableList = []
        this.total = 0
        return
      }
      this.tableList = result.data.content
      this.total = result.data.total
    },
    async deleteUser (data, index) {
      this.$Loading.start()
      const result = await api.deleteUser(data)
      if (result.code !== 0) {
        this.$Loading.error()
        this.$Message.error('删除失败。' + result.msg)
        return false
      }
      this.$Loading.finish()
      this.tableList.splice(index, 1)
      this.total -= 1
      this.$Message.success('删除成功')
      return true
    }
  },
  created () {
    this.init()
  },
  computed: {
    minHeight () {
      return this.$store.state.app.fullHeight + 'px'
    }
  }
}

const initColumnList = [
  {
    key: 'realName',
    title: '姓名',
    width: 100,
    ellipsis: true
  },
  {
    key: 'username',
    title: '用户名',
    width: 150,
    ellipsis: true
  },
  {
    key: 'phone',
    title: '手机',
    width: 120,
    ellipsis: true
  },
  {
    key: 'email',
    title: '邮箱',
    ellipsis: true
  },
  {
    key: 'status',
    title: '状态',
    align: 'center',
    width: 100
  },
  {
    key: 'operation',
    title: '操作',
    align: 'center',
    width: 100,
    fixed: 'right'
  }
]

const statusTag = (vm, h, currentRowData, index) => {
  return h('Tag', {
    props: {
      color: currentRowData.status === 1 ? 'success' : 'default'
    }
  }, currentRowData.status === 1 ? '正 常' : '冻 结')
}

const editButton = (vm, h, currentRowData) => {
  return h('Button', {
    props: {
      // type: 'info',
      size: 'small',
      icon: 'md-create',
      shape: 'circle'
    },
    style: {
      marginRight: '10px'
    },
    on: {
      click: () => {
        const user = JSON.parse(JSON.stringify(currentRowData))
        vm.onEditUser(user)
      }
    }
  })
}

const deleteButton = (vm, h, currentRowData, index) => {
  return h('Poptip', {
    props: {
      confirm: true,
      title: '您确定要删除这个用户吗?',
      transfer: true,
      placement: 'top-end'
    },
    on: {
      'on-ok': () => {
        vm.deleteUser(currentRowData, index)
      }
    }
  }, [
    h('Button', {
      props: {
        size: 'small',
        icon: 'md-trash',
        shape: 'circle'
      }
    })
  ])
}

</script>

<style>
.ivu-tree{
  -moz-user-select:none;/*火狐*/
  -webkit-user-select:none;/*webkit浏览器*/
  -ms-user-select:none;/*IE10*/
  -khtml-user-select:none;/*早期浏览器*/
  user-select:none;
}
.float-right{
  float: right;
}
</style>
