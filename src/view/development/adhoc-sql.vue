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
            <Tooltip placement="top" content="刷新">
              <Button icon="md-refresh" type="text" size="small" :loading="refreshing" @click="refreshTree"/>
            </Tooltip>
            <Tooltip placement="top" content="切换视图">
              <Button icon="md-swap" type="text" size="small" @click="showFolder = !showFolder"/>
            </Tooltip>
          </div>
          <AdhocPath v-if="showFolder"
            ref="path"
            @on-click-node="onClickNode"
            @on-update-breadcrumb="updateBreadcrumb" />
        </Card>
        <div slot="right">
          <Split v-model="topSplit" mode="vertical" class="adhoc-split" :style="{height: minHeight}">
            <div slot="top" class="no-padding">
              <Breadcrumb class="padding-left-20">
                <BreadcrumbItem><Icon type="md-home" /></BreadcrumbItem>
                <BreadcrumbItem v-for="(item, index) in breadcrumb" :key="index">{{item}}</BreadcrumbItem>
              </Breadcrumb>
              <Divider />
              <Tooltip placement="top" :delay="1000" class="margin-left-10">
                <div slot="content">
                  <p>运行选中语句</p>
                  <p>快捷键 F8</p>
                </div>
                <Button type="text"
                  icon="md-play"
                  size="small"
                  :disabled="!file.id"
                  @click="runQuery">运行</Button>
              </Tooltip>
              <Divider type="vertical" />
              <Button type="text"
                icon="md-checkmark"
                size="small"
                :disabled="!file.id"
                @click="saveFile">保存</Button>
              <Divider type="vertical" />
              <Tooltip placement="top" :delay="5000" content="心累了，写不动了">
                <Button type="text" size="small" disabled>另存为</Button>
              </Tooltip>
              <Divider type="vertical" />
              <Select
                v-model="file.dbType"
                placeholder="数据库类型"
                :disabled="!file.id"
                size="small"
                @on-change="changeDbType"
                style="width:120px;" >
                <Option v-for="item in dbTypeList" :value="item.id" :key="item.id">{{ item.name }}</Option>
              </Select>
              <Select ref="connectionSelector"
                clearable
                v-model="file.connectionId"
                :disabled="!file.id"
                size="small"
                placeholder="数据库连接"
                class="margin-left-10"
                style="width:170px;">
                <Option v-for="item in connectionList" :value="item.id" :key="item.id" v-if="item.dbType === file.dbType">{{item.name}}</Option>
              </Select>
              <SqlEditor ref="SqlEditor"
                v-model="file.content"
                :height="editorHeight"
                :readonly="!file.id"
                class="margin-top-5" />
            </div>
            <div class="ivu-tabs-style2 adhoc-split-pane" slot="bottom" ref="result">
              <Tabs v-model="tabName"
                size="small"
                type="card"
                :animated="false"
                @on-tab-remove="onTabRemove" >
                <div slot="extra">
                  <Button type="text" size="small" @click="exportExcel" :disabled="tabName <= 0">xlsx</Button>
                  <Button type="text" size="small" @click="exportCsv" disabled>csv</Button>
                  <Button type="text" size="small" @click="refreshTable">刷新</Button>
                  <Button type="text" size="small" @click="fullScreen = true" :disabled="tabName <= 0">全屏</Button>
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
                        <Button ghost
                          v-if="row.status > 0"
                          size="small"
                          shape="circle"
                          type="info"
                          icon="md-open"
                          @click="readResult(row.id, row.uuid)" />
                        <Button ghost
                          v-if="!row.status"
                          size="small"
                          shape="circle"
                          type="error"
                          icon="md-pause"
                          @click="interrupt(row.id)" />
                        <Tooltip placement="top-end" :delay="3000" content="复制到剪贴板" class="margin-left-10">
                          <Button
                            size="small"
                            shape="circle"
                            icon="md-copy"
                            v-clipboard="copyToClipboard(row.content)" />
                        </Tooltip>
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
                <Modal v-model="fullScreen"
                  fullscreen
                  footer-hide
                  class-name="full-screen-modal"
                  title="运行结果" >
                  <HotTable 
                    :data="presentData"
                    :columns="presentColumns"
                    :stretchH="stretchH" />
                </Modal>
              </Tabs>
            </div>
          </Split>
        </div>
      </Split>
    </div>
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

import AdhocPath from './components/adhoc-path'
import Pagination from '_c/pagination'
import SqlEditor from '_c/sql-editor'
import HotTable from '_c/hot-table'
import excel from '@/libs/excel'
import * as formatter from '@/libs/format'
import * as adHocApi from '@/api/adhoc'

export default {
  name: 'adhoc-sql',
  components: {
    AdhocPath,
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
      showFolder: true,
      refreshing: false,
      leftSplit: 0.25,
      topSplit: 0.4,
      breadcrumb: [],

      dbTypeList: this.$store.state.user.dbTypeList,
      connectionList: this.$store.state.user.connectionList,
      file: initFile,

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

      loadingTable: false,
      total: 0,
      page: 1,
      size: 10,

      tableWidth: 0,

      stretchH: 'none',
      fullScreen: false,
      pressF8: e => {
        if (e.code === 'F8') this.runQuery()
      }
    }
  },
  methods: {
    refreshTree () {
      this.refreshing = true
      setTimeout(() => {
        if (this.showFolder) this.$refs.path.init()
        else console.log('refresh database')
        this.refreshing = false
      }, 1000)
    },
    onClickNode (file) {
      if (file) {
        this.file = file
        this.$refs.SqlEditor.focus()
      } else {
        this.file = initFile
      }
    },
    updateBreadcrumb (breadcrumb) {
      this.breadcrumb = breadcrumb
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
    },
    onTabRemove (tabName) {
      const id = parseInt(tabName)
      this.tabList = this.tabList.filter(_ => _ !== id)
      if (id > 0) this.resultMap.delete(id)
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
    },
    async readResult (id, uuid) {
      if (this.tabList.findIndex(_ => _ === id) === -1) {
        this.$Loading.start()
        const result = await adHocApi.readResult(uuid)
        if (result.code !== 0) {
          this.$Loading.error()
          this.$Message.error(result.msg)
          return
        }
        this.$Loading.finish()
        this.tabList.push(id)
        this.resultMap.set(id, result.data)
      }
      this.tabName = id + ''
    },
    async interrupt (id) {
      const result = await adHocApi.interruptQuery(id)
      if (result.code === 0) {
        this.$Message.success('操作成功')
        this.getData()
        return
      }
      this.$Message.error(result.msg)
    },
    refreshTable () {
      this.tabName = '-1'
      this.resetSearch()
    },
    copyToClipboard (value) {
      return {
        value,
        success: (e) => {
          this.$Message.success('复制成功')
        },
        error: () => {
          this.$Message.error('复制失败')
        }
      }
    }
  },
  updated () {
    const width = this.$refs.result.offsetWidth
    if (Number.isInteger(width)) this.tableWidth = width - 10
  },
  created () {
  },
  activated () {
    document.addEventListener('keyup', this.pressF8)
  },
  deactivated () {
    document.removeEventListener('keyup', this.pressF8)
  },
  mounted () {
    this.getData()
  },
  computed: {
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
    }
  },
  watch: {
    tabName (tabName) {
      const tab = parseInt(tabName)
      if (tab <= 0) return
      this.presentData = this.presentColumns = []
      this.stretchH = 'none'
      this.presentData = this.resultMap.get(tab).rows
      this.presentColumns = this.resultMap.get(tab).columns
    }
  },
  beforeDestroy () {
    this.resultMap.clear()
  }
}

</script>
