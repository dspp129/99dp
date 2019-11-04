<template>
  <div>
    <Row>
      <div style="float: left;">
        <Input
          v-model="keyword"
          @on-enter="resetSearch"
          placeholder="请输入关键字..."
          class="margin-left-5"
          style="width: 250px"
        />
        <Button
          type="primary"
          shape="circle"
          icon="md-search"
          @click="resetSearch"
          :loading="loadingTable"
          class="margin-left-5"
        />
        <Tooltip content="重置查询条件" placement="right">
          <Button shape="circle" icon="md-sync" @click="resetFilter" class="margin-left-5" />
        </Tooltip>
      </div>
      <div style="float: right">
        <Button ghost shape="circle" icon="md-add" type="primary" @click="newRole" />
      </div>
    </Row>
    <Row class="margin-top-10">
      <Pagination
        :total="total"
        :size="size"
        @on-page-info-change="changePageInfo"
        ref="pagination"
      >
        <Table
          stripe
          border
          :columns="columnList"
          :data="tableList"
          :loading="loadingTable"
          slot="table"
          size="small"
        >
          <template slot-scope="{ row, index }" slot="operation">
            <Button
              type="default"
              size="small"
              shape="circle"
              icon="md-create"
              @click="editRole(row)"
            />
            <Button
              type="primary"
              size="small"
              ghost
              shape="circle"
              icon="md-link"
              class="margin-left-10"
              @click="openDrawer(row)"
            />
          </template>
        </Table>
      </Pagination>
    </Row>
    <Drawer title="权限编辑" width="30%" :styles="styles" v-model="showingDrawer">
      <Spin size="large" fix v-if="spin" />
      <Tree :data="roleTree" show-checkbox multiple check-directly/>
      <div class="drawer-footer">
        <Button shape="circle" icon="md-close" @click="closeDrawer" />
        <Button
          type="success"
          ghost
          shape="circle"
          icon="md-checkmark"
          class="margin-left-10"
          @click="saveRoleMenu"
          :loading="submitting"
        />
      </div>
    </Drawer>
    <Modal
      v-model="showingModal"
      width="500"
      :title="modalTitle"
      :closable="false"
      class-name="modal-vertical-center"
    >
      <Form ref="roleForm" label-position="right" :label-width="150" :model="tempRole" :rules="rules" @submit.native.prevent class="margin-top-20">
        <FormItem label="角色名称" prop="title">
          <Input v-model="tempRole.title" placeholder="请输入角色名称" style="width: 200px"/>
        </FormItem>
        <FormItem label="角色代号" prop="name">
          <Input v-model="tempRole.name" placeholder="请输入角色代号" style="width: 200px"/>
        </FormItem>
        <FormItem label="描述信息" prop="description">
          <Input type="textarea" :autosize="{minRows: 5,maxRows: 8}" v-model="tempRole.description" style="width: 200px"/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button shape="circle" icon="md-close" @click="closeModal" />
        <Button
          type="success"
          ghost
          shape="circle"
          icon="md-checkmark"
          class="margin-left-10"
          @click="saveRole"
          :loading="submitting"
        />
      </div>
    </Modal>
  </div>
</template>


<script>
const initColumnList = [
  {
    type: "index",
    width: 60,
    align: "center"
  },
  {
    key: "title",
    title: "角色名称",
    width: 230,
    ellipsis: true
  },
  {
    key: "name",
    title: "角色代号",
    width: 230,
    ellipsis: true
  },
  {
    key: "description",
    title: "描述",
    ellipsis: true
  },
  {
    slot: "operation",
    title: "操作",
    align: "center",
    width: 200,
    fixed: "right"
  }
];

const initRole = {
  id: 0,
  name: '',
  title: '',
  description: ''
};

import Pagination from '_c/pagination'
import * as adminApi from '@/api/admin'

export default {
  name: 'role-list',
  components: {
    Pagination
  },
  data() {
    const validateRoleName = async (rule, value, callback) => {
      const data = {
        name: value,
        id: this.tempRole.id
      }
      const result = await adminApi.checkRoleName(data)
      if (result.code === 0) {
        callback()
      } else {
        callback(new Error(result.msg))
      }
    }
    return {
      loadingTable: false,
      showingDrawer: false,
      submitting: false,
      spin: false,
      keyword: '',

      showingModal: false,
      modalTitle: '',
      rules: {
        title: [
          { required: true, message: '角色名称不能为空', trigger: 'blur' },
          { validator: validateRoleName, trigger: 'blur' }
        ],
        name: [
          { required: true, message: '角色代号不能为空', trigger: 'blur' },
          { validator: validateRoleName, trigger: 'blur' }
        ]
      },
      styles: {
        height: 'calc(100% - 55px)',
        overflow: 'auto',
        paddingBottom: '53px',
        position: 'static'
      },
      
      tempRole: JSON.parse(JSON.stringify(initRole)),

      total: 0,
      page: 1,
      size: 10,

      columnList: initColumnList,
      tableList: [],
      menuTree: [],
      roleTree: [],
      acl: [],
      roleId: 0
    }
  },
  methods: {
    closeModal () {
      this.$refs.roleForm.resetFields()
      this.showingModal = false
    },
    newRole () {
      this.modalTitle = "新增角色"
      this.tempRole = JSON.parse(JSON.stringify(initRole))
      this.showingModal = true
    },
    editRole (role) {
      this.tempRole = JSON.parse(JSON.stringify(role))
      this.modalTitle = "编辑角色"
      this.showingModal = true
    },
    async saveRole () {
      this.$refs.roleForm.validate(valid => {
        if (!valid) return false
      })

      this.submitting = true
      this.$Loading.start()
      const result = await adminApi.saveRole(this.tempRole)
      this.submitting = false
      if (result.code !== 0) {
        this.$Loading.error()
        this.$Message.error({
            background: true,
            content: result.msg
        })
        return
      }
      this.closeModal()
      this.getData()
    },
    async openDrawer (role) {
      this.roleTree = []
      this.showingDrawer = true
      this.spin = true
      const result = await adminApi.getRoleMenu(role.id)
      this.roleId = role.id
      this.acl = result.data
      this.spin = false
      this.fillTree(this.menuTree)
      this.roleTree = JSON.parse(JSON.stringify(this.menuTree))
    },
    fillTree (tree) {
      tree.forEach(node => {
        const index = this.acl.findIndex(item => item.menuId === node.id)
        node.checked = index >= 0
        if (node.children && node.children.length > 0) this.fillTree(node.children)
      })
    },
    async saveRoleMenu () {
      this.acl = [{
        roleId: this.roleId,
        menuId: 0
      }]
      this.parseTree(this.roleTree)
      const result = await adminApi.saveRoleMenu(this.acl)
      if (result.code !== 0) {
        this.$Message.error({
            background: true,
            content: result.msg
        })
        return
      }
      this.$Message.success('操作成功')
      this.closeDrawer()
    },
    closeDrawer () {
      this.showingDrawer = false
    },
    parseTree (tree) {
      tree.forEach(node => {
        if (node.checked) this.acl.push({
          roleId: this.roleId,
          menuId: node.id
        })
        if (node.children && node.children.length > 0) this.parseTree(node.children)
      })
    },
    resetFilter () {
      this.$refs.dbType.clearSingleSelect()
      this.keyword = ''
    },
    changePageInfo({ page, size }) {
      this.page = page
      this.size = size
      this.getData()
    },
    resetSearch () {
      this.$refs.pagination.first()
    },
    async getData () {
      this.$Loading.start()
      this.loadingTable = true

      const data = {
        page: this.page,
        size: this.size,
        keyword: this.keyword
      }

      const result = await adminApi.getRoleList(data)
      this.loadingTable = false
      if (result.code === 0) {
        this.$Loading.finish()
        this.tableList = result.data.content
        this.total = result.data.total
      } else {
        this.$Loading.error()
      }
    },
    async getTree () {
      const result = await adminApi.getAllMenu()
      this.menuTree = result.data
    }
  },
  mounted () {
    this.getData()
    this.getTree()
  },
  created () {}
}
</script>
<style>
.drawer-footer{
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  border-top: 1px solid #e8e8e8;
  padding: 10px 16px;
  text-align: right;
  background: #fff;
}
</style>