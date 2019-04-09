<style lang="less">
@import './adhoc-sql.less';
</style>

<template>
  <Card dis-hover shadow :padding="0">
    <div class="adhoc-split" :style="{height: minHeight}">
      <Split v-model="leftSplit">
        <Card dis-hover
          slot="left"
          :icon="showFolder ? 'md-folder-open' : 'md-globe'"
          :bordered="false"
          :title="showFolder ? '文件目录' : '数据库'">
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
            @on-clickoutside="visible = !visible">
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
              <Button type="text"
                icon="md-checkmark"
                size="small"
                :disabled="file.id === 0"
                @click="saveFile">保存</Button>
              <Divider type="vertical" />
              <Button type="text" size="small" disabled>另存为</Button>
              <Divider type="vertical" />
              <Select transfer
                v-model="file.dbType"
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
                v-model="file.connectionId"
                :disabled="disabled"
                size="small"
                placeholder="数据库连接"
                class="margin-left-10"
                style="width:170px;">
                <Option v-for="item in connectionList" :value="item.id" :key="item.id" v-if="item.dbType === file.dbType">{{item.name}}</Option>
              </Select>

              <SqlEditor v-model="file.content" ref="SqlEditor" :height="editorHeight" class="margin-top-5" />
            </div>

            <div class="demo-tabs-style2 adhoc-split-pane" slot="bottom" ref="result">
              <Tabs v-model="tabName"
                size="small"
                type="card"
                :animated="false"
                @on-tab-remove="onRemoveTab" >
                <div slot="extra">
                  <span style="font-size: 12px;" class="margin-right-5">导出</span>
                  <Button type="text" size="small" @click="exportExcel">xlsx</Button>
                  <Button type="text" size="small" @click="exportCsv" disabled>csv</Button>
                  <Button type="text" size="small" @click="getData">刷新</Button>
                </div>
                <TabPane name="-1" label="查询历史">
                  <Pagination :total="total" :size="size" @on-page-info-change="changePageInfo" ref="pagination">
                    <Table stripe
                      :height="tableHeight"
                      :columns="columnList"
                      :data="tableList"
                      :loading="loadingTable"
                      slot="table"
                      size="small">

    <template slot-scope="{ row, index }" slot="id">
      <span>{{ row.id }}</span>
    </template>

    <template slot-scope="{ row, index }" slot="status">
      <Tag v-if="row.status === 0" color="gold">执行中</Tag>
      <Tag v-if="row.status === 1" color="green">成 功</Tag>
      <Tag v-if="row.status === 2" color="red">失 败</Tag>
    </template>

    <template slot-scope="{ row, index }" slot="dbTypeName">
      <span>{{ row.dbTypeName }}</span>
    </template>

    <template slot-scope="{ row, index }" slot="connectionName">
      <span>{{ row.connectionName }}</span>
    </template>

    <template slot-scope="{ row, index }" slot="content">
      <span>{{ row.content }}</span>
    </template>

    <template slot-scope="{ row, index }" slot="startTime">
      <Time :time="row.startTime" type="datetime" />
    </template>

    <template slot-scope="{ row, index }" slot="durationTime">
      <span>{{ timeDiff(row.startTime, row.endTime) }}</span>
    </template>

    <template slot-scope="{ row, index }" slot="operation">
      <Button size="small" shape="circle" ghost type="info" icon="md-open" :disabled="row.status !== 1"/>
      <Button size="small" shape="circle" ghost type="error" icon="md-pause" :disabled="row.status !== 0" class="margin-left-10"/>
    </template>

                    </Table>
                  </Pagination>
                </TabPane>
                <TabPane v-for="(item, index) in tabList"
                  closable
                  :key="item"
                  :name="item + ''"
                  :label="item > 0 ? '结果' + item : '错误信息'" />
                <HotTable v-show="tabName >= 0"
                  ref='hotTable'
                  :data="presentData"
                  :columns="presentColumns"
                  :height="hotTableHeight"
                  :width="tableWidth"
                  :stretchH="stretchH" />
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

const initFile = {
  id: 0,
  dbType: 0,
  connectionId: 0,
  content: ''
}

const initColumnList = [
  {
    title: 'ID',
    slot: 'id',
    width: 50
  },
  {
    title: '运行状态',
    slot: 'status',
    align: 'center',
    width: 100,
    ellipsis: true
  },
  {
    title: '数据库类型',
    slot: 'dbTypeName',
    width: 100,
    ellipsis: true
  },
  {
    title: '连接名',
    slot: 'connectionName',
    width: 120,
    ellipsis: true
  },
  {
    title: 'SQL语句',
    slot: 'content',
    width: 200,
    tooltip: true,
    ellipsis: true
  },
  {
    title: '开始时间',
    slot: 'startTime',
    align: 'center',
    width: 160,
    ellipsis: true
  },
  {
    title: '运行时长',
    slot: 'durationTime',
    align: 'center',
    width: 160,
    ellipsis: true
  },
  {
    title: '操作',
    slot: 'operation',
    align: 'center',
    width: 100,
    fixed: 'right'
  }
]

import Pagination from '_c/pagination'
import SqlEditor from '_c/sql-editor'
import HotTable from '_c/hot-table'
import excel from '@/libs/excel'
import * as formatter from '@/libs/format'
import * as adHocApi from '@/api/adhoc'

export default {
  name: 'adhoc-sql',
  components: {
    Pagination,
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
      dbTypeList: this.$store.state.user.dbTypeList,
      connectionList: this.$store.state.user.connectionList,
      fileMap: new Map(),
      file: JSON.parse(JSON.stringify(initFile)),
      tabName: '-1',
      tableList: [],
      columnList: initColumnList,
      tabList: [],
      resultMap: new Map(),
      presentData: [],
      presentColumns: [],
      result: {
        data: [],
        columns: []
      },

      // search condition
      loadingTable: false,
      total: 0,
      page: 1,
      size: 10,

      disabled: false,
      tableWidth: 0,

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
      this.getData()
    },
    async getData () {
      const data = {
        page: this.page,
        size: this.size
      }

      this.loadingTable = true
      const result = await adHocApi.getList(data)
      this.loadingTable = false
      if (result.code === 0) {
        this.tableList = result.data.content
        this.total = result.data.total
      } else {
        this.tableList = []
        this.total = 0
      }

    },
    async onClickNode (root, node, data) {
      this.selectedNode = { root, node, data }
      if (data.selected) return
      root.forEach(el => { if (el.node.selected) el.node.selected = false })
      data.selected = true
      if (data.folder) return
      this.updateBreadcrumb()

      if (this.fileMap.has(data.id)) {
        this.file = this.fileMap.get(data.id)
        return
      }
      const result = await adHocApi.getFile(data.id)
      if (result.code !== 0) {
        this.$Message.error(result.msg)
        return
      }
      this.file = result.data
      this.fileMap.set(this.file.id, this.file)
    },
    async saveFile () {
      this.$Loading.start()
      const result = await adHocApi.saveFile(this.file)
      if (result.code !== 0) {
        this.$Message.error(result.msg)
        this.$Loading.error()
        return
      }
      this.$Message.success('保存成功')
      this.$Loading.finish()
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
      // 考虑是否重新按名称排序节点
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
      const dbType = this.file.dbType
      const connectionId = this.file.connectionId
      if (!connectionId > 0) {
        this.$Message.error('请选择数据库连接')
        return
      }
      const data = { connectionId, dbType, query, async: true }
      this.$Loading.start()
      const result = await adHocApi.runQuery(data)
      if (result.code !== 0) {
        this.$Loading.error()
        this.presentColumns = ['error_msg']
        this.presentData = [{ 'error_msg' : result.msg }]
        this.stretchH = 'last'
        if (this.tabList.findIndex(_ => _ === 0) === -1) this.tabList.splice(0, 0, 0)
        this.tabName = '0' // 进入错误信息
        return
      }
      this.$Loading.finish()
      this.$Message.success('提交成功')
      if (this.tabList.findIndex(_ => _ === 0) > -1) this.tabList.splice(0, 1)
      this.tabName = '-1' // 进入查询历史
      this.resetSearch() // 刷新查询历史
      // this.resultMap.set(10000, result.data)
    },
    onRemoveTab (tabName) {
      this.tabList = this.tabList.filter(_ => _ !== parseInt(tabName))
    },
    exportExcel () {
      const params = {
        title: this.presentColumns,
        key: this.presentColumns,
        data: this.presentData,
        autoWidth: true,
        filename: this.tabName
      }
      excel.export_array_to_excel(params)
    },
    exportCsv () {
    },
    timeDiff (startTime, endTime) {
      return formatter.timeDiff(startTime, endTime)
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
  mounted () {
    this.getData()
  },
  computed: {
    treeHeight () {
      return this.$store.state.app.fullHeight - 127 + 'px'
    },
    minHeight () {
      return this.$store.state.app.fullHeight + 'px'
    },
    editorHeight () {
      return this.$store.state.app.fullHeight * this.topSplit - 63 + 'px'
    },
    hotTableHeight () {
      return this.$store.state.app.fullHeight * ( 1 - this.topSplit ) - 38
    },
    tableHeight () {
      return this.$store.state.app.fullHeight * ( 1 - this.topSplit ) - 85
    },
    isFolder () {
      const data = this.selectedNode.data
      return typeof data !== 'undefined' && data.folder
    }
  },
  watch: {
    visible (visible) {
    },
    tabName (tabName) {
      const tab = parseInt(tabName)
      if (tab <= 0) return
      this.stretchH = 'none'
      this.presentData = this.resultMap.get(tab).rows
      this.presentColumns = this.resultMap.get(tab).columns
    }
  },
  beforeDestroy () {
    this.fileMap.clear()
    this.resultMap.clear()
  }
}

</script>
