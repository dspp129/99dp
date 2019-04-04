<style lang="less">
@import './adhoc-sql.less';
</style>

<template>
  <Card dis-hover shadow :padding="0">
    <div class="adhoc-split" :style="{height: minHeight}">
      <Split v-model="leftSplit">
        <Card dis-hover :bordered="false" icon="md-folder-open" title="目录" slot="left">
          <div slot="extra">
            <Tooltip transfer placement="top" content="刷新">
              <Button icon="md-refresh" type="text" size="small" :loading="refreshing" @click="refreshing = true"/>
            </Tooltip>
            <Tooltip transfer placement="top" content="切换视图">
              <Button icon="md-swap" type="text" size="small" @click="showFolder = !showFolder"/>
            </Tooltip>
          </div>
          <Tree v-if="showFolder"
            :data="root" 
            :load-data="loadChild"
            :render="renderContent"
            class="non-select"
            :style="{maxHeight: treeHeight}"
            @on-toggle-expand="onToggleExpand" />
          <Dropdown transfer
            ref="contentMenu"
            trigger="custom"
            :visible="visible"
            placement="right-start"
            @on-click="onOperateNode"
            @on-clickoutside="clickOutside">
            <DropdownMenu slot="list" class="non-select" style="min-width: 60px;">
              <Dropdown transfer placement="right-start" v-show="isFolder">
                <DropdownItem name="new">新　建
                  <Icon type="ios-arrow-forward" class="margin-left-5" /></DropdownItem>
                <DropdownMenu slot="list" class="non-select" style="min-width: 60px;">
                  <DropdownItem name="add-folder">文件夹</DropdownItem>
                  <DropdownItem name="add-file">文　件</DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <DropdownItem name="rename-node">重命名</DropdownItem>
              <DropdownItem name="refresh-node" v-show="isFolder">刷　新</DropdownItem>
              <DropdownItem name="remove-node" style="color: #ed4014">删　除</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </Card>
        <div slot="right">
          <Split v-model="topSplit" mode="vertical" class="adhoc-split" :style="{height: minHeight}">
            <div slot="top" class="no-padding">
              <Breadcrumb class="padding-left-20">
                <BreadcrumbItem><Icon type="md-home" /></BreadcrumbItem>
                <BreadcrumbItem v-for="(item, index) in hierarchy" :key="index">{{item}}</BreadcrumbItem>
              </Breadcrumb>
              <Divider />
              <Button type="text" icon="md-play" size="small" class="margin-left-10" @click="runQuery">运行</Button>
              <Divider type="vertical" />
              <Button type="text" icon="md-checkmark" size="small" disabled>保存</Button>
              <Divider type="vertical" />
              <Button type="text" size="small" disabled>另存为</Button>
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
                style="width:170px;">
                <Option v-for="item in connectionList" :value="item.id" :key="item.id" v-if="item.dbType === dbType">{{item.name}}</Option>
              </Select>

              <SqlEditor v-model="query" ref="SqlEditor" :height="editorHeight" class="margin-top-5" />
            </div>

            <div class="demo-tabs-style2 adhoc-split-pane" slot="bottom" ref="result">
              <Tabs size="small" type="card" :animated="false">
                <div slot="extra">
                  <span style="font-size: 12px;" class="margin-right-5">导出</span>
                  <Button type="text" size="small">xls</Button>
                  <Button type="text" size="small">csv</Button>
                </div>

                <TabPane label="查询历史">
                  查询历史列表页
                </TabPane>
                <TabPane closable label="结果1">
                  <HotTable :data="tableList"
                    :columns="columnList"
                    :height="tableHeight"
                    :width="tableWidth"
                    :stretchH="stretchH" />
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
        <Button icon="md-close" shape="circle" @click="closeWindow" />
        <Button icon="md-checkmark" ghost type="success" shape="circle" @click="saveNode" :loading="saving" />
      </div>
      <Form
        ref="pathForm"
        :model="nodeDetail"
        :rules="pathValidate"
        :label-width="160"
        @submit.native.prevent
        @keydown.enter.native="saveNode"
        class="margin-top-20">
        <FormItem label="原名称" v-show="modalTitle.startsWith('重命名')">{{ selectedNode.data.title }}</FormItem>
        <FormItem label="新名称" prop="title">
          <Input ref="input" v-model.trim="nodeDetail.title" style="width: 200px" />
        </FormItem>
      </Form>
    </Modal>
  </Card>
</template>

<script>

import SqlEditor from '_c/sql-editor'
import HotTable from '_c/hot-table'
import * as adHocApi from '@/api/adhoc'
import * as taskApi from '@/api/task'

export default {
  name: 'adhoc-sql',
  components: {
    HotTable,
    SqlEditor
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
      const data = {

      }
      const result = await adHocApi.checkPathName(data)
      if (result.code !== 0) {
        callback(new Error(data.msg))
        return
      }
      callback()
    }
    return {
      refreshing: false,
      leftSplit: 0.25,
      topSplit: 0.4,

      // Tree properties
      showFolder: true,
      root: [],
      rootTitle: 'home',
      folderIcon: 'ios-folder-outline',
      folderOpenIcon: 'ios-folder-open-outline',
      fileIcon: 'md-document',
      showChildrenCount: true,
      selectedNode: {},
      parentNode: {
        nodeKey: 0,
        title: ''
      },
      nodeDetail: {},
      visible: false,

      pathWindow: false,
      modalTitle: '',
      pathValidate: {
        title: [
          { required: true, message: '请输入名称', trigger: 'none' },
          { validator: validateTitle, trigger: 'blur' }
        ]
      },
      saving: false,

      hierarchy: [],

      // search condition
      query: 'select * from radix.jobx_job limit 11',
      total: 0,
      page: 1,
      size: 10,

      dbTypeList: this.$store.state.user.dbTypeList,
      connectionList: this.$store.state.user.connectionList,
      disabled: false,
      dbType: 0,
      connectionId: 0,
      tableWidth: 0,

      tableList: [],
      columnList: [],
      stretchH: 'none'
    }
  },
  methods: {
    async init () {
      this.selectedNode.data = {
        id: 0,
        title: this.rootTitle,
        expand: false,
        folder: true,
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
              on: {
                click: () => { //单击事件
                  this.onClickNode(root, node, data)
                },
                contextmenu: e => { //右键点击事件
                  e.preventDefault()
                  this.onClickNode(root, node, data)
                  this.$refs.contentMenu.$refs.reference = event.target
                  this.visible = !this.visible
                }
              }
            }, data.title)
          ])
        ])
      } else {
        return h('span', [
          h('span', [
            h('Icon', {
              props: { 
                type: data.folder ? (data.expand ? this.folderOpenIcon : this.folderIcon) : this.fileIcon,
                size: 12
              }
            }),
            h('span', {
              class: ['ivu-tree-title', data.selected ? 'ivu-tree-title-selected' : ''],
              on: {
                click: () => { //单击事件
                  this.onClickNode(root, node, data)
                },
                contextmenu: e => { //右键点击事件
                  e.preventDefault()
                  this.onClickNode(root, node, data)
                  this.$refs.contentMenu.$refs.reference = event.target
                  this.visible = !this.visible
                }
              }
            }, data.title)
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
      if (data.folder) return
      this.updateBreadcrumb()
      // load content from db
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
    onOperateNode (name) {
      switch (name) {
        case 'new': return
        case 'remove-node': this.confirmRemoveNode(); break;
        case 'rename-node':
        case 'add-folder':
        case 'add-file': this.onEditNode(name); break;
        case 'refresh-node': this.refreshNode(); break;
      }
      this.visible = false
    },
    clickOutside (e) {
      console.log(e)
      this.visible = false
    },
    async refreshNode (node) {
      const refreshNode = typeof node === 'undefined' ? this.selectedNode.data : node
      this.$Loading.start()
      const children = await this.loadTree(refreshNode)
      this.$set(refreshNode, 'children', children)
      this.$Loading.finish()
      refreshNode.expand = true
    },
    onEditNode (name) {
      const { root, node, data } = this.selectedNode
      let nodeType = data.folder ? '文件夹' : '文件'
      if (!data.owner) {
        this.$Message.error(`只能编辑自己的${nodeType}`)
        return
      }

      if (name.startsWith('add-')) {
        this.modalTitle = '新建'
        nodeType = name.endsWith('folder') ? '文件夹' : '文件'
        this.parentNode = data
        this.nodeDetail = { parent: data.nodeKey, parentId: data.id }
      } else {
        this.modalTitle = '重命名'
        this.parentNode = root.find(el => el.nodeKey === node.parent).node
        this.nodeDetail = JSON.parse(JSON.stringify(data))
        this.nodeDetail.parent = node.parent
        this.nodeDetail.parentId = this.parentNode.id
      }
      this.modalTitle += nodeType
      this.pathWindow = true
    },
    async saveNode () {
      const valid = await this.$refs.pathForm.validate()
      if (!valid) return
      if (this.modalTitle.startsWith('新建')) {
        this.appendNode()
      }
      if (this.modalTitle.startsWith('重命名')) {
        this.updateNode()
      }
    },
    async appendNode () {
      const folder = this.modalTitle.endsWith('文件夹')
      const path = {
        name: this.nodeDetail.title,
        parentId: this.nodeDetail.parentId,
        isFolder: folder ? 1 : 0
      }
      this.saving = true
      const result = await adHocApi.createPath(path)
      this.saving = false

      if (result.code !== 0) {
        this.$Message.error(result.msg)
        return
      }
      this.$Message.success('操作成功')

      const node = {
        id: result.data.id,
        title: result.data.name,
        folder: folder,
        owner: true,
        selected: false,
        expand: false
      }

      if (this.parentNode.expand) {
        const children = this.parentNode.children || []
        // 插入指定
        let hasInsert = false
        let folderSize = 0
        children.forEach((item, index) => {
          if (item.folder) folderSize += 1
          if (!hasInsert && item.folder === node.folder && item.title > node.title) {
            hasInsert = true
            children.splice(index, 0, node)
          }
        })
        if (!hasInsert) {
          if (node.folder) children.splice(folderSize, 0, node)
          else children.push(node)
        }
        this.$set(this.parentNode, 'children', children)
      } else {
        this.refreshNode(this.parentNode)
      }
      this.closeWindow()
    },
    async updateNode () {
      const path = {
        id: this.nodeDetail.id,
        name: this.nodeDetail.title,
        parentId: this.nodeDetail.parentId
      }
      this.saving = true
      const result = await adHocApi.updatePath(path)
      this.saving = false

      if (result.code !== 0) {
        this.$Message.error(result.msg)
        return
      }

      this.$Message.success('操作成功')
      const nodeKey = this.nodeDetail.nodeKey
      const node = this.parentNode.children.find(el => el.nodeKey === nodeKey)
      node.title = this.nodeDetail.title
      this.closeWindow()
      this.updateBreadcrumb()
    },
    closeWindow () {
      this.pathWindow = false
      this.$refs.pathForm.resetFields()
      this.saving = false
    },
    confirmRemoveNode () {
      // 根节点不可删除
      const data = this.selectedNode.data
      const nodeType = data.folder ? '文件夹' : '文件'
      if (typeof data === 'undefined' || data.nodeKey === 0) {
        this.$Message.error('无法执行该操作')
        return
      }
      if (!data.owner) {
        this.$Message.error(`只能删除本人创建的${nodeType}`)
        return
      }
      // 有子节点不可删除
      if (data.children) {
        this.$Message.error('该文件夹下存在子文件夹，无法删除')
        return
      }
      // 有用户不可删除
      if (this.total > 0) {
        this.$Message.error('该文件夹下存在文件，无法删除')
        return
      }
      this.$Modal.confirm({
        title: `删除 ${data.title}`,
        content: `<p>您确定要删除该${nodeType}吗？</p>`,
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          this.removeNode()
        }
      })
    },
    async removeNode () {
      this.$Loading.start()
      const result = await adHocApi.deletePath(this.selectedNode.data.id)
      if (result.code !== 0) {
        this.$Loading.error()
        this.$Message.error(result.msg)
        return
      }
      this.$Loading.finish()
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

      /* 删除完毕后 
         自动选择parentNode
      parent.node.selected = true
      this.selectedNode.node = parent
      this.selectedNode.data = parent.node
      */
      this.updateBreadcrumb()
    },
    onToggleExpand (node) {
      console.log('onToggleExpand')
      console.log(node)
      if (node.expand) {
        // node.children = []
        // node.loading = true // 手动控制加载状态
      }
    },
    resetSearch () {
      this.$refs.pagination.first()
    },
    changeDbType (value) {
      this.$refs.connectionSelector.clearSingleSelect()
    },
    async runQuery () {
      const query = this.$refs.SqlEditor.getSelection().trim()
      if (query === '') {
        this.$Message.error('请选择要运行的语句')
        return
      }
      if (!this.connectionId > 0) {
        this.$Message.error('请选择数据库连接')
        return
      }
      const data = {
        connectionId: this.connectionId,
        query,
        async: true
      }
      this.$Loading.start()
      const result = await taskApi.runQuery(data)
      if (result.code !== 0) {
        this.$Loading.error()
        this.columnList = ['error_msg']
        this.tableList = [{ 'error_msg' : result.msg }]
        this.stretchH = 'last'
        return
      }
      this.$Loading.finish()
      this.columnList = result.data.columns
      this.tableList = result.data.rows
      this.stretchH = 'none'
    }
  },
  updated () {
    console.log('updated')
    if (this.pathWindow) {
      this.$refs.input.focus()
      return
    }
    const width = this.$refs.result.offsetWidth
    if (Number.isInteger(width)) this.tableWidth = width - 10
  },
  created () {
    this.init()
  },
  computed: {
    treeHeight () {
      return this.$store.state.app.fullHeight - 252 + 'px'
    },
    minHeight () {
      return this.$store.state.app.fullHeight - 125 + 'px'
    },
    editorHeight () {
      const height = this.$store.state.app.fullHeight - 125
      return height * this.topSplit - 63 + 'px'
    },
    tableHeight () {
      const height = this.$store.state.app.fullHeight - 125
      return height * ( 1 - this.topSplit ) - 38
    },
    isFolder () {
      const data = this.selectedNode.data
      return typeof data !== 'undefined' && data.folder
    }
  }
}

</script>
