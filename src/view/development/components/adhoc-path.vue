<template>
  <div>
    <Tree
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
        <Dropdown transfer placement="right-start" v-show="nodeIsFolder">
          <DropdownItem name="new">新　建
            <Icon type="ios-arrow-forward" class="margin-left-5" /></DropdownItem>
          <DropdownMenu slot="list" class="non-select" style="min-width: 60px;">
            <DropdownItem name="add-folder">文件夹</DropdownItem>
            <DropdownItem name="add-file">文　件</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <DropdownItem name="rename-node">重命名</DropdownItem>
        <DropdownItem name="refresh-node" v-show="nodeIsFolder">刷　新</DropdownItem>
        <DropdownItem name="remove-node" style="color: #ed4014">删　除</DropdownItem>
      </DropdownMenu>
    </Dropdown>
    <Modal
      v-model="modal"
      :title="title"
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
        <FormItem label="原名称" v-show="title.startsWith('重命名')">{{ selectedNode.data.title }}</FormItem>
        <FormItem label="新名称" prop="title">
          <Input ref="input" v-model.trim="nodeDetail.title" style="width: 200px" />
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>

const rootTitle = 'home'

import * as adHocApi from '@/api/adhoc'

export default {
  name: 'adhoc-path',
  components: {
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
      // Tree properties
      root: [],
      rootTitle: rootTitle,
      breadcrumb: [rootTitle],
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

      modal: false,
      title: '',
      pathValidate: {
        title: [
          { required: true, message: '请输入名称', trigger: 'none' },
          { validator: validateTitle, trigger: 'blur' }
        ]
      },
      saving: false,
      fileMap: new Map()
    }
  },
  methods: {
    init () {
      this.selectedNode.data = {
        id: 0,
        title: this.rootTitle,
        expand: false,
        folder: true,
        selected: true, // mandatory
        children: [],
        loading: false
      }
      this.root = [this.selectedNode.data]
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
    async onClickNode (root, node, data) {
      this.selectedNode = { root, node, data }
      if (data.selected) return
      root.forEach(el => { if (el.node.selected) el.node.selected = false })
      data.selected = true
      if (data.folder) return
      this.updateBreadcrumb()

      if (!this.fileMap.has(data.id)) {
        const result = await adHocApi.getFile(data.id)
        if (result.code !== 0) {
          this.$Message.error(result.msg)
          return
        }
        this.fileMap.set(data.id, result.data)
      }
      this.$emit('on-click-node', this.fileMap.get(data.id))
    },
    updateBreadcrumb () {
      // 拼接面包屑
      const node = this.selectedNode.node
      this.breadcrumb = [ node.node.title ]
      if (node.nodeKey > 0) {
        this.findParent(node)
      }
      this.$emit('on-update-breadcrumb', this.breadcrumb)
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
      this.breadcrumb.unshift(el.node.title)
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
        this.title = '新建'
        nodeType = name.endsWith('folder') ? '文件夹' : '文件'
        this.parentNode = data
        this.nodeDetail = { parent: data.nodeKey, parentId: data.id }
      } else {
        this.title = '重命名'
        this.parentNode = root.find(el => el.nodeKey === node.parent).node
        this.nodeDetail = JSON.parse(JSON.stringify(data))
        this.nodeDetail.parent = node.parent
        this.nodeDetail.parentId = this.parentNode.id
      }
      this.title += nodeType
      this.modal = true
    },
    async saveNode () {
      const valid = await this.$refs.pathForm.validate()
      if (!valid) return
      if (this.title.startsWith('新建')) {
        this.appendNode()
      }
      if (this.title.startsWith('重命名')) {
        this.updateNode()
      }
    },
    async appendNode () {
      const isFolder = this.title.endsWith('文件夹')
      const path = {
        name: this.nodeDetail.title,
        parentId: this.nodeDetail.parentId,
        isFolder: isFolder ? 1 : 0
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
        folder: isFolder,
        owner: true,
        selected: false,
        expand: false
      }

      if (this.parentNode.expand) {
        const children = this.parentNode.children || []
        // 按名称顺序插入指定位置
        let hasInsert = false
        let folderSize = 0
        children.forEach((item, index) => {
          if (item.folder) folderSize += 1
          if (!hasInsert && item.folder === isFolder && item.title > node.title) {
            hasInsert = true
            children.splice(index, 0, node)
          }
        })
        if (!hasInsert) {
          if (isFolder) children.splice(folderSize, 0, node)
          else children.push(node)
        }
        this.$set(this.parentNode, 'children', children)
      } else {
        // 文件夹未展开时直接从数据库获取
        this.refreshNode(this.parentNode)
      }
      this.closeWindow()
      // TODO if (!isFolder) 选中新建文件
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
      // TODO 考虑是否重新按名称排序节点
    },
    closeWindow () {
      this.modal = false
      this.$refs.pathForm.resetFields()
      this.saving = false
    },
    confirmRemoveNode () {
      const data = this.selectedNode.data
      const nodeType = data.folder ? '文件夹' : '文件'
      // 根节点不可删除
      if (typeof data === 'undefined' || data.nodeKey === 0) {
        this.$Message.error('无法执行该操作')
        return
      }
      // 非本人创建无权限删除
      if (!data.owner) {
        this.$Message.error(`只能删除本人创建的${nodeType}`)
        return
      }
      // 有子文件夹不可删除
      if (data.children) {
        this.$Message.error('该文件夹下存在子项，无法删除')
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

      // 删除完毕后自动选择parentNode
      parent.node.selected = true
      this.selectedNode.node = parent
      this.selectedNode.data = parent.node
      this.$emit('on-click-node', null)
      this.updateBreadcrumb()
    },
    onToggleExpand (node) {
      if (node.expand) {
        // node.children = []
        // node.loading = true // 手动控制加载状态
      }
    }
  },
  updated () {
    if (this.modal) this.$refs.input.focus()
  },
  mounted () {
    // TODO 每隔n分钟，自动保存有更新的文件
  },
  created () {
    this.init()
  },
  computed: {
    treeHeight () {
      return this.$store.state.app.fullHeight - 127 + 'px'
    },
    nodeIsFolder () {
      const data = this.selectedNode.data
      return typeof data !== 'undefined' && data.folder
    }
  },
  beforeDestroy () {
    this.fileMap.clear()
  }
}

</script>
