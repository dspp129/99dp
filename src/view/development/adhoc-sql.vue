<style lang="less">
@import '~handsontable/dist/handsontable.full.min.css';
</style>

<template>
  <Card dis-hover shadow :style="{minHeight}" :padding="0">
    <div class="adhoc-split" :style="{height: minHeight}">
      <Split v-model="leftSplit" >

        <div class="padding-16" slot="left">
          <Tree :data="root" 
           :load-data="loadChild"
           :render="renderContent"
           @on-toggle-expand="onToggleExpand" />
        </div>

        <div slot="right">
          <Split v-model="topSplit" mode="vertical" class="adhoc-split" :style="{height: minHeight}">
            <div slot="top" class="no-padding">
              <Button type="text" icon="ios-power" class="margin-left-10">保存</Button>
              <Divider type="vertical" />
              <Button type="text" icon="md-play">运行</Button>
              <Divider type="vertical" />
              <Button type="text" icon="md-close">删除</Button>
              <Divider type="vertical" />
              <Button type="text" icon="md-download">导出</Button>
              <Divider type="vertical" />
              <Select transfer
                v-model="dbType"
                placeholder="数据库类型"
                :disabled="disabled"
                size="small"
                @on-change="changeDbType"
                style="width:120px;" >
                <Option v-for="item in dbTypeList" :value="item.id" :key="item.id">{{ item.name }}</Option>
              </Select>

              <Select ref="connectionSelector"
                transfer
                clearable
                v-model="connectionId"
                :disabled="disabled"
                size="small"
                placeholder="数据库连接"
                class="margin-left-10"
                @on-change="changeConnectionId"
                style="width:170px;">
                <Option v-for="item in connectionList" :value="item.id" :key="item.id" v-if="item.dbType === dbType">{{item.name}}</Option>
              </Select>

              <SqlEditor  v-model="userStatus" ref="SqlEditor" :height="editorHeight" />
            </div>

            <div class="demo-tabs-style2 adhoc-split-pane" slot="bottom" ref="result">
              <Tabs size="small" type="card" :animated="false">
                <TabPane label="查询历史">
                  查询历史列表页
                </TabPane>
                <TabPane closable label="结果1">
                  <HotTable :data="tableList"
                    :colHeaders="columnList"
                    :readOnly="true"
                    :rowHeaders="true"
                    :height="tableHeight"
                    :width="tableWidth"
                    :copyPaste="true"
                    :autoColumnSize="true"
                    :manualColumnResize="true"
                    :manualRowResize="true"
                    licenseKey="non-commercial-and-evaluation" />
                </TabPane>
              </Tabs>
            </div>
          </Split>
        </div>
      </Split>
    </div>

    <Modal
      v-model="pathWindow"
      :title="modalTitle"
      :mask-closable="false"
      :closable="false"
      :scrollable="true"
      class-name="modal-vertical-center">
      <div slot="footer">
        <Button @click="closeNode">关闭</Button>
        <Button type="success" ghost icon="md-checkmark" @click="saveNode" :loading="saving">保存</Button>
      </div>
      <Form ref="deptForm" :model="nodeDetail" :rules="deptValidate" :label-width="160" class="margin-top-20">
        <FormItem label="上级">
          <Input readonly style="width: 200px" :value="parentNode.title" />
        </FormItem>
        <FormItem label="名称" prop="title">
          <Input v-model.trim="nodeDetail.title" style="width: 200px" />
        </FormItem>
      </Form>
    </Modal>

  </Card>

</template>

<script>

import { HotTable } from '@handsontable/vue'
import Handsontable from 'handsontable'
import Pagination from '_c/pagination'
import SqlEditor from '_c/sql-editor'
import * as adHocApi from '@/api/adhoc'

export default {
  name: 'adhoc-sql',
  components: {
    HotTable,
    SqlEditor,
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
    const validateName = async (rule, value, callback) => {
      const data = await adHocApi.checkName(this.userInfo)
      if (data.code !== 0) {
        callback(new Error(data.msg))
        return
      }
      callback()
    }
    return {
      leftSplit: 0.25,
      topSplit: 0.4,

      // Tree properties
      root: [],
      rootTitle: '我的查询',
      buttonProps: {
        type: 'text',
        size: 'small'
      },
      folderIcon: 'ios-folder-outline',
      folderOpenIcon: 'ios-folder-open',
      nodeIcon: 'md-document',
      showChildrenCount: true,
      selectedNode: {},
      parentNode: {
        nodeKey: 0,
        title: ''
      },
      nodeDetail: {},

      pathWindow: false,
      modalTitle: '',
      deptValidate: {
        title: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          { validator: validateTitle, trigger: 'blur' }
        ]
      },
      saving: false,

      hierarchy: [],

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
          { validator: validateName, trigger: 'blur' }
        ]
      },

      loadingTable: false,

      dbTypeList: this.$store.state.user.dbTypeList,
      connectionList: this.$store.state.user.connectionList,
      disabled: false,
      dbType: 0,
      connectionId: 0,
      tableWidth: 0,

      tableList: Handsontable.helper.createSpreadsheetData(16, 20),
      columnList: ['abc','XYZ ','cyf','4444']
    }
  },
  methods: {
    async init () {

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
      /*
      const data = await this.loadTree(this.root[0])
      data.forEach(el => { this.root[0].children.push(el) })
      this.resetSearch()
      */
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
      // this.updateBreadcrumb()
      // this.resetSearch()
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
      const result = await adHocApi.getPath(node.id)
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
      this.modalTitle = '新增路径'
      this.pathWindow = true
    },
    onEditNode (root, node, data) {
      this.selectedNode.root = root
      this.parentNode = root.find(el => el.nodeKey === node.parent).node
      this.nodeDetail = JSON.parse(JSON.stringify(data))
      this.nodeDetail.parent = node.parent
      this.nodeDetail.parentId = this.parentNode.id
      this.modalTitle = '编辑路径'
      this.pathWindow = true
    },
    async saveNode () {
      const valid = await this.$refs.deptForm.validate()
      if (!valid) return
      this.saving = true
      if (this.modalTitle.indexOf('新增') >= 0) {
        this.appendNode()
      }
      if (this.modalTitle.indexOf('编辑') >= 0) {
        this.updateNode()
      }
    },
    async appendNode () {
      const path = {
        name: this.nodeDetail.title,
        parentId: this.nodeDetail.parentId
      }
      const result = await adHocApi.createPath(path)
      this.saving = false

      if (result.code !== 0) {
        this.$Message.error(result.msg)
        return
      }

      const node = {
        id: result.data.id,
        title: result.data.name,
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
      this.closeNode()
      this.updateBreadcrumb()
    },
    closeNode () {
      this.saving = false
      this.pathWindow = false
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
        this.$Message.error('当前路径下有子路径，无法删除')
        return
      }
      // 有用户不可删除
      if (this.total > 0) {
        this.$Message.error('当前路径下存在用户，无法删除')
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
    changeDbType (value) {
      this.$emit('update:dbType', value)
      this.$refs.connectionSelector.clearSingleSelect()
    },
    changeConnectionId (value) {
      this.$emit('update:connectionId', value)
    }
  },
  updated () {
    console.log('updated')
    const width = this.$refs.result.offsetWidth
    if (Number.isInteger(width)) this.tableWidth = width - 10
  },
  created () {
    this.init()
  },
  computed: {
    minHeight () {
      return this.$store.state.app.fullHeight - 125 + 'px'
    },
    editorHeight () {
      const height = this.$store.state.app.fullHeight - 125
      return height * this.topSplit - 31 + 'px'
    },
    tableHeight () {
      const height = this.$store.state.app.fullHeight - 125
      return height * ( 1 - this.topSplit ) - 38
    }
  }
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

.adhoc-split{
  border: 0px solid #dcdee2;
}
.adhoc-split-pane{
  padding: 6px;
}
.adhoc-split-pane .ivu-tabs-bar {
  margin-bottom: 0px;
}
.no-padding{
  padding: 0;
}

.demo-tabs-style2 > .ivu-tabs.ivu-tabs-card > .ivu-tabs-bar .ivu-tabs-tab{
    border-radius: 0;
    background: #fff;
}
.demo-tabs-style2 > .ivu-tabs.ivu-tabs-card > .ivu-tabs-bar .ivu-tabs-tab-active{
    border-top: 1px solid #3399ff;
}
.demo-tabs-style2 > .ivu-tabs.ivu-tabs-card > .ivu-tabs-bar .ivu-tabs-tab-active:before{
    content: '';
    display: block;
    width: 100%;
    height: 1px;
    background: #3399ff;
    position: absolute;
    top: 0;
    left: 0;
}
</style>
