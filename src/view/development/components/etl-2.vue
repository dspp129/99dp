<template>
  <Row class="margin-top-10">
    <Col span="11">
      <Card dis-hover icon="md-cloud-upload" :title="readerTitle" :style="{minHeight}" :padding="0">
        <div slot="extra" v-show="value.sourceConnectionId > 0">
          <small>自定义SQL</small>
          <Checkbox
            class="margin-left-10"
            v-model="value.useSql"
            :true-value="1"
            :false-value="0" />
        </div>
        <Row class="padding-16">
          <Col span="22">
            <Input readonly
              icon="md-create"
              v-model="sourceTableFullName"
              placeholder="点击图标选定来源表..."
              @on-click="onEditSourceTable">
              <span slot="prepend">来源表</span>
            </Input>
          </Col>
          <Col class="margin-top-5">
            <Tooltip v-if="!value.useSql" placement="bottom" content="刷新字段" class="padding-left-10">
              <Button 
                ghost
                type="primary"
                icon="md-refresh"
                shape="circle"
                size="small"
                :loading="refreshingReader"
                :disabled="sourceTableFullName === ''"
                @click="toLoadReader" />
            </Tooltip>
            <Tooltip v-else placement="bottom" content="生成SQL" class="margin-left-10">
              <Button 
                ghost
                type="primary"
                icon="md-code-working"
                shape="circle"
                size="small"
                :disabled="sourceTableFullName === ''"
                @click="createQuerySql" />
            </Tooltip>
          </Col>
        </Row>
<!--
1. 由于Sql的plan异常，导致的抽取时间长； 在抽取时，尽可能使用全表扫描代替索引扫描;
2. 合理sql的并发度，减少抽取时间；根据表的大小， <50G可以不用并发， <100G添加如下hint: parallel(a,2）,
   100G添加如下hint : parallel(a,4);
3. 抽取sql要简单，尽量不用replace等函数，这个非常消耗cpu，会严重影响抽取速度;
-->

        <div v-if="value.useSql === 1" class="margin-top-16 editor-sqaure">
          <SqlEditor v-model="value.querySql" :height="editorHeight" />
        </div>
        <template v-else>
          <Collapse simple accordion class="margin-top-16" v-model="leftCollapse">
            <Panel name="1">
              <small v-if="leftCollapse.length > 0">收起字段</small>
              <small v-else>展开字段</small>
              <DragableTable
                slot="content"
                v-model="value.sourceColumns"
                :columns="dataXColumnList"
                :loading="refreshingReader"
                class="dragable-table"/>
            </Panel>
          </Collapse>
          <Row v-if="value.sourceDbType !== 4" class="padding-16">
            <Form :label-width="60"
              @submit.native.prevent>
              <FormItem label="WHERE">
              <!-- Hive表 无Where -->
                <Input type="textarea"
                  :autosize="{minRows: 1,maxRows: 5}"
                  v-model="value.whereSql"/>
              </FormItem>
              <FormItem label="Channel">
                <InputNumber v-if="!value.useSql"
                  :min="1"
                  :max="10"
                  v-model.number="value.channel"
                  style="width: 100px" />

                <Tooltip placement="right" class="margin-left-10" max-width="400">
                  <span slot="content">
                    <p>一个DataX Job会切分成多个Task，</p>
                    <p>每个Task会按TaskGroup进行分组，</p>
                    <p>一个Task内部会有一组Reader->Channel->Writer。</p>
                    <p>Channel是连接Reader和Writer的数据交换通道，</p>
                    <p>所有的数据都会经由Channel进行传输。</p>
                  </span>
                  <Icon type="ios-information-circle-outline" size="20" />
                </Tooltip>

              </FormItem>
            </Form>
          </Row>
          <Row v-else v-for="item in value.sourcePartitionColumns" :key="item.columnPosition" class="margin-top-10">
            <Col span="24">
              <Input v-model="item.columnValue">
                <span slot="prepend">{{ item.columnName }} = </span>
              </Input>
            </Col>
          </Row>
        </template>
      </Card>
    </Col>

    <Col span='2' :style="{textAlign: 'center',lineHeight: minHeight}">
      <a href="#" @click.prevent="autoMatch"><Icon type="md-arrow-round-forward" size="50" /></a>
    </Col>

    <Col span="11">
      <Card dis-hover icon="md-cloud-download" :title="writerTitle" :style="{minHeight}" :padding="0">
        <div slot="extra" v-show="value.targetConnectionId > 0">
          <small>使用临时表</small>
          <Checkbox
            class="margin-left-10"
            v-model="value.useTmpTable"
            :true-value="1"
            :false-value="0"
          />
        </div>
        <Row class="padding-16">
          <Col span="22">
            <Input v-if="value.useTmpTable === 1" v-model.trim="value.tmpTableName"
              icon="md-search"
              placeholder="请输入 <数据库名>.<表名>"
              @on-enter="toLoadWriter"
              @on-click="toLoadWriter">
              <span slot="prepend">临时表</span>
            </Input>
            <Input v-else
              readonly
              v-model="targetTableFullName"
              placeholder="点击图标选定目标表..."
              @on-click="onEditTargetTable"
              icon="md-create">
              <span slot="prepend">目标表</span>
            </Input>
          </Col>
          <Col>
            <Tooltip placement="bottom" content="刷新字段" class="margin-left-10 margin-top-5">
              <Button ghost
                type="primary"
                icon="md-refresh"
                shape="circle"
                size="small"
                :loading="refreshingWriter"
                :disabled="targetTableFullName === ''"
                @click="toLoadWriter" />
            </Tooltip>
          </Col>
        </Row>
        <Collapse simple accordion class="margin-top-16" v-model="rightCollapse">
          <Panel name="1">
            <small v-if="rightCollapse.length > 0">收起字段</small>
            <small v-else>展开字段</small>
            <DragableTable
              slot="content"
              v-model="value.targetColumns"
              :columns="dataXColumnList"
              :loading="refreshingWriter"
              class="dragable-table" />
          </Panel>
        </Collapse>
        <Row class="padding-16" v-for="item in value.targetPartitionColumns" :key="item.columnPosition">
          <Col span="24">
            <Input v-model="item.columnValue">
              <span slot="prepend">{{ item.columnName }} = </span>
            </Input>
          </Col>
        </Row>
      </Card>
    </Col>
    <Drawer :title="drawerTitle" width="50%" placement="left" v-model="leftDrawer">
      <Row>
        <Select clearable
          v-model.number="dbType"
          placeholder="数据库类型..."
          style="width: 120px"
          @on-change="resetDbType">
          <Option v-for="item in dbTypeList" :value="item.id" :key="item.id">{{item.name}}</Option>
        </Select>
        <Select clearable
          v-model.number="connectionId"
          placeholder="请选择数据库连接..."
          class="margin-left-5"
          style="width: 180px" >
          <Option v-for="item in connectionList" :value="item.id" :key="item.id" v-if="item.dbType === dbType">{{item.name}}</Option>
        </Select>
        <Input search v-model="keyword" @on-search="resetSearch" placeholder="请输入关键字..." class="margin-left-5" style="width: 250px" />
      </Row>

      <Row class="margin-top-10">
        <Pagination :total="total" :size="size" @on-page-info-change="changePageInfo" ref="pagination">
          <Table stripe border
          :columns="columnList"
          :data="tableList"
          :loading="loadingTable"
          slot="table"
          size="small" />
        </Pagination>
      </Row>
    </Drawer>

    <Drawer title="表字段" width="50%" :closable="false" v-model="rightDrawer">
      <Table stripe border
        :columns="tableColumnList"
        :data="chosenColumnList"
        :loading="loadingChosenTable"
        size="small" />

      <template v-if="partitionColumnList.length > 0">
        <Divider orientation="left">分区字段</Divider>
        <Table stripe border
          :columns="tableColumnList"
          :data="partitionColumnList"
          :loading="loadingChosenTable"
          class="margin-top-10"
          size="small" />
      </template>
    </Drawer>

  </Row>
</template>

<script>

import DragableTable from '_c/drag-table'
import Pagination from '_c/pagination'
import SqlEditor from '_c/sql-editor'
import { oneOf } from '@/libs/tools'
import * as metadataApi from '@/api/metadata'
import * as taskApi from '@/api/task'

const reviewButton = (vm, h, currentRowData) => {
  return h('Tooltip', {
    props: {
      placement: 'top',
      content: '查看'
    },
    style: {
      marginRight: '10px'
    },
  }, [
    h('Button', {
      props: {
        size: 'small',
        icon: 'md-search',
        shape: 'circle'
      },
      on: {
        click: () => {
          vm.loadChosenTable(currentRowData.id)
        }
      }
    })
  ])
}

const chooseButton = (vm, h, currentRowData) => {
  return h('Tooltip', {
    props: {
      placement: 'top',
      content: '选定'
    },
  }, [
    h('Button', {
      props: {
        ghost: vm.isEditingWriter ? vm.value.targetTableId !== currentRowData.id : vm.value.sourceTableId !== currentRowData.id,
        type: 'primary',
        size: 'small',
        icon: 'md-pin',
        shape: 'circle'
      },
      on: {
        click: () => {
          vm.chooseTable(currentRowData)
        }
      }
    })
  ])
}

const initColumnList = [
  {
    key: 'dbType',
    title: '数据库类型',
    width: 110,
    ellipsis: true
  },
  {
    key: 'dbName',
    title: '库名',
    width: 130,
    ellipsis: true
  },
  {
    key: 'tableName',
    title: '表名',
    ellipsis: true
  },
  {
    key: 'operation',
    title: '操作',
    align: 'center',
    width: 110,
    fixed: 'right'
  }
]

const initDataXColumnList = [
  {
    key: 'columnName',
    title: '列名',
    sortable: true
  },
  {
    key: 'columnType',
    title: '类型',
    width: 110,
    align: 'center'
  },
  {
    key: 'columnLength',
    title: '长度',
    width: 100,
    align: 'center'
  },
  {
    type: 'selection',
    width: 50
  }
]

const tableColumnList = [
  {
    key: 'columnPosition',
    title: '序号',
    width: 65,
    align: 'center'
  },
  {
    key: 'columnName',
    title: '名称'
  },
  {
    key: 'columnType',
    title: '类型',
    width: 120,
    align: 'center'
  },
  {
    key: 'columnLength',
    title: '长度',
    width: 120,
    align: 'center'
  },
  {
    key: 'isNullable',
    title: '可为空',
    width: 80,
    align: 'center',
    render: (h, params) => {
      const row = params.row
      if (row.isNullable === 0) return
      return h('Icon', {
        props: {
          type: 'md-checkmark'
        }
      })
    }
  }
]

export default {
  name: 'etl-2',
  components: {
    DragableTable,
    Pagination,
    SqlEditor
  },
  props: {
    value: Object
  },
  data () {
    return {
      leftDrawer: false,
      rightDrawer: false,
      isEditingWriter: false,
      loadingTable: false,

      leftCollapse: [],
      rightCollapse: [],
      refreshingReader: false,
      refreshingWriter: false,
      dataXColumnList: initDataXColumnList,

      showingModal: false,

      dbType: 0,
      dbTypeList: this.$store.state.user.dbTypeList,
      connectionId: 0,
      connectionList: this.$store.state.user.connectionList,
      keyword: '',
      loadingChosenTable: false,

      total: 0,
      page: 1,
      size: 10,
      columnList: initColumnList,
      tableList: [],

      chosenColumnList: [],
      partitionColumnList: [],
      chosenTable: {},
      tableColumnList: tableColumnList
    }
  },
  methods: {
    init () {
      this.columnList.forEach(item => {
        if (!oneOf(item.key, ['dbType', 'operation'])) return
        item.render = (h, param) => {
          const currentRowData = param.row
          switch (item.key) {
            case 'dbType' : return h('span', this.dbTypeList[currentRowData.dbType - 1].name)
            case 'operation' : return h('div', [
              reviewButton(this, h, currentRowData),
              chooseButton(this, h, currentRowData)
            ])
          }
        }
      })
    },
    toLoadReader () {
      const data = {
        connectionId: this.value.sourceConnectionId,
        dbName: this.value.sourceDbName,
        tableName: this.value.sourceTableName
      }
      this.fillReaderColumn(data)
    },
    async fillReaderColumn (data) {
      this.$Loading.start()
      this.refreshingReader = true
      const result = await taskApi.refreshColumns(data)
      this.refreshingReader = false
      this.value.sourceColumns = []
      this.value.sourcePartitionColumns = []
      if (result.code === 0 && result.data.length > 0) {
        this.$Loading.finish()
        result.data.forEach(e => {
          this.value.sourceColumns.push(e)
          if (e.columnKey === 'PAR') {
            this.value.sourcePartitionColumns.push(e)
          }
        })
        this.leftCollapse = ['1']
      } else {
        this.$Loading.error()
        this.$Message.warning(result.msg)
      }
    },
    toLoadWriter () {
      let dbName = this.value.targetDbName
      let tableName = this.value.targetTableName

      if (this.value.useTmpTable === 1) {
        dbName = this.value.tmpTableName.substr(0, this.value.tmpTableName.indexOf('.'))
        tableName = this.value.tmpTableName.substr(this.value.tmpTableName.indexOf('.') + 1)
      }

      if (dbName.length * tableName.length === 0) {
        this.$Message.warning('请填写完整表名')
        return
      }

      const data = {
        connectionId: this.value.targetConnectionId,
        dbName,
        tableName
      }
      this.fillWriterColumn(data)
    },
    async fillWriterColumn (data) {
      this.$Loading.start()
      this.refreshingWriter = true
      const result = await taskApi.refreshColumns(data)
      this.refreshingWriter = false
      this.value.targetColumns = []
      this.value.targetPartitionColumns = []

      if (result.code === 0 && result.data.length > 0) {
        this.$Loading.finish()
        result.data.forEach(e => {
          if (e.columnKey === 'PAR') {
            this.value.targetPartitionColumns.push(e)
          } else {
            this.value.targetColumns.push(e)
          }
          this.rightCollapse = ['1']
        })
      } else {
        this.$Message.warning('请检查表名是否正确')
        this.$Loading.error()
      }
    },
    createQuerySql () {
      if (this.value.sourceColumns.length === 0) return

      let querySql = 'SELECT '
      this.value.sourceColumns.forEach(col => { querySql += col.columnName + ',\n' })
      querySql = querySql.substr(0, querySql.length - 2) + '\n'
      querySql += 'FROM ' + this.sourceTableFullName

      if (this.value.whereSql.length > 0) {
        querySql += '\nWHERE ' + this.value.whereSql
      }

      this.value.querySql = querySql
    },
    onEditSourceTable () {
      this.leftDrawer = true
      this.isEditingWriter = false
    },
    onEditTargetTable () {
      this.leftDrawer = true
      this.isEditingWriter = true
    },
    resetDbType () {
      this.connectionId = 0
      this.resetSearch()
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
      this.$Loading.start()
      this.loadingTable = true

      const data = {
        page: this.page,
        size: this.size,
        dbType: this.dbType,
        connectionId: this.connectionId,
        keyword: this.keyword
      }

      const result = await metadataApi.getTableList(data)
      this.loadingTable = false
      if (result.code === 0) {
        this.$Loading.finish()
        this.tableList = result.data.content
        this.total = result.data.total
      } else {
        this.$Loading.error()
      }
    },
    async loadChosenTable (id) {
      this.rightDrawer = true
      this.loadingChosenTable = true
      this.partitionColumnList = []
      const result = await metadataApi.getTableDetail(id)
      this.loadingChosenTable = false
      if (result.code !== 0) return
      this.chosenTable = result.data.table
      this.chosenColumnList = []
      result.data.columnList.forEach(e => {
        if (e.columnKey === 'PAR') {
          this.partitionColumnList.push(e)
        } else {
          this.chosenColumnList.push(e)
        }
      })
    },
    chooseTable (table) {
      this.leftDrawer = false
      if (this.isEditingWriter) {
        this.value.useTmpTable = 0
        this.value.targetDbType = table.dbType
        this.value.targetConnectionId = table.connectionId
        this.value.targetDbId = table.dbId
        this.value.targetDbName = table.dbName
        this.value.targetTableId = table.id
        this.value.targetTableName = table.tableName
        this.toLoadWriter()
      } else {
        this.value.useSql = 0
        this.value.sourceDbType = table.dbType
        this.value.sourceConnectionId = table.connectionId
        this.value.sourceDbId = table.dbId
        this.value.sourceDbName = table.dbName
        this.value.sourceTableId = table.id
        this.value.sourceTableName = table.tableName
        this.toLoadReader()
      }
    },
    autoMatch () {
      if (this.value.sourceColumns.length === 0) return
      if (this.value.targetColumns.length === 0) return
      this.value.useSql = 0
      this.leftCollapse = ['1']
      this.rightCollapse = ['1']

      let shortArr = [], longArr = []
      if (this.value.sourceColumns.length > this.value.targetColumns.length) {
        shortArr = this.value.targetColumns
        longArr = this.value.sourceColumns
      } else {
        shortArr = this.value.sourceColumns
        longArr = this.value.targetColumns
      }

      longArr.forEach(e => e._checked = false)

      shortArr.forEach((target, newIndex) => {
        target._checked = false
        const oldIndex = longArr.findIndex(source => source.columnName.toLowerCase() === target.columnName.toLowerCase())
        if (oldIndex >= 0) {
          const source = longArr[oldIndex]
          source._checked = true
          target._checked = true
          longArr.splice(oldIndex, 1)
          longArr.splice(newIndex, 0, source)
        }
      })
    }
  },
  mounted () {
  },
  created () {
    this.init()
  },
  watch: {
  },
  computed: {
    minHeight () {
      return this.$store.state.app.fullHeight - 80 + 'px'
    },
    editorHeight () {
      return this.$store.state.app.fullHeight - 210
    },
    sourceTableFullName () {
      if (this.value.sourceTableName.length > 0) {
        return this.value.sourceDbName + '.' + this.value.sourceTableName
      } else {
        return ''
      }
    },
    targetTableFullName () {
      if (this.value.targetTableName.length > 0) {
        return this.value.targetDbName + '.' + this.value.targetTableName
      } else {
        return ''
      }
    },
    drawerTitle () {
      return this.isEditingWriter ? '选择目标表' : '选择来源表'
    },
    readerTitle () {
      if (this.value.sourceConnectionId > 0) {
        const item = this.connectionList.find(item => item.id === this.value.sourceConnectionId)
        return 'Reader - ' + item.dbTypeName
      } else return 'Reader'
      
    },
    writerTitle () {
      if (this.value.targetConnectionId > 0) {
        const item = this.connectionList.find(item => item.id === this.value.targetConnectionId)
        return 'Writer - ' + item.dbTypeName
      } else return 'Writer'
    }
  }
}
</script>

<style lang="less">
.dragable-table td {
    height: 32px;
}
</style>
