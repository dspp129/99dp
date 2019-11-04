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
          <template slot-scope="{ row, index }" slot="status">
            <Tag color="green">正&nbsp;常</Tag>
          </template>
          <template slot-scope="{ row, index }" slot="operation">
            <Button
              type="primary"
              size="small"
              ghost
              shape="circle"
              icon="md-create"
              @click="editUser(row)"
            />
          </template>
        </Table>
      </Pagination>
    </Row>
    <Drawer title="编辑用户" width="30%" :styles="styles" v-model="showingDrawer">
      <Form label-position="right" :label-width="150" @submit.native.prevent class="margin-top-20">
        <FormItem label="中文名" prop="realName">
          <Input v-model="tempUser.realName" readonly style="width: 200px"/>
        </FormItem>
        <FormItem label="邮箱" prop="email">
          <Input v-model="tempUser.email" readonly style="width: 200px"/>
        </FormItem>
        <FormItem label="电话" prop="phone">
          <Input v-model="tempUser.phone" style="width: 200px"/>
        </FormItem>
        <FormItem label="QQ" prop="qq">
          <Input v-model="tempUser.qq" style="width: 200px"/>
        </FormItem>
        <FormItem label="角色" prop="roleId">
          <Select v-model="roleIds" multiple style="width: 260px">
            <Option v-for="item in roleList" :value="item.id" :key="item.id">{{ item.title }}</Option>
          </Select>
        </FormItem>
      </Form>
      <div class="drawer-footer">
        <Button shape="circle" icon="md-close" @click="closeDrawer" />
        <Button
          type="success"
          ghost
          shape="circle"
          icon="md-checkmark"
          class="margin-left-10"
          @click="saveUser"
          :loading="submitting"
        />
      </div>
    </Drawer>
  </div>
</template>


<script>
const initColumnList = [
  {
    key: "id",
    width: 100,
    align: "center"
  },
  {
    key: "realName",
    title: "中文名",
    width: 130,
    ellipsis: true
  },
  {
    key: "email",
    title: "邮箱",
    width: 230,
    ellipsis: true
  },
  {
    key: "phone",
    title: "电话",
    width: 230,
    ellipsis: true
  },
  {
    key: "qq",
    title: "QQ",
    ellipsis: true
  },
  {
    slot: "status",
    title: "状态",
    align: "center",
    width: 120
  },
  {
    slot: "operation",
    title: "操作",
    align: "center",
    width: 100,
    fixed: "right"
  }
]

import Pagination from '_c/pagination'
import * as adminApi from '@/api/admin'

export default {
  name: 'user-role',
  components: {
    Pagination
  },
  data() {
    return {
      loadingTable: false,
      submitting: false,
      keyword: '',

      showingDrawer: false,
      tempUser: {},
      styles: {
        height: 'calc(100% - 55px)',
        overflow: 'auto',
        paddingBottom: '53px',
        position: 'static'
      },

      total: 0,
      page: 1,
      size: 10,

      columnList: initColumnList,
      tableList: [],
      roleIds: [],
      roleList: []
    }
  },
  methods: {
    editUser (row) {
      if (this.roleList.length === 0) this.getAllRole()
      this.tempUser = JSON.parse(JSON.stringify(row))
      this.roleIds = typeof row.roleId === 'string' ? row.roleId.split(',').map(Number) : []
      this.showingDrawer = true
    },
    async getAllRole () {
      const { data } = await adminApi.getAllRole()
      this.roleList = data
    },
    async saveUser () {
      this.tempUser.roleId = this.roleIds.toString()
      const result = await adminApi.updateUser(this.tempUser)
      if (result.code !== 0) {
        this.$Message.error(result.msg)
        return
      }
      this.$Message.success('操作成功')
      this.closeDrawer()
      const index = this.tableList.findIndex(e => e.id === this.tempUser.id)
      if (index >= 0) this.tableList.splice(index, 1, this.tempUser)
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

      const result = await adminApi.getUserList(data)
      this.loadingTable = false
      if (result.code === 0) {
        this.$Loading.finish()
        this.tableList = result.data.content
        this.total = result.data.total
      } else {
        this.$Loading.error()
      }
    },
    closeDrawer () {
      this.showingDrawer = false
    }
  },
  mounted () {
    this.getData()
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