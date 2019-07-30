<style lang="less">
@import './table-detail.less';
</style>

<template>
  <div>
    <Row :gutter="10">
      <Col span="24">
        <Card icon="md-book" title="表详情">
          <Spin size="large" fix v-if="showSpin" />
          <div slot="extra">
            <Button
                ghost
                type="primary"
                size="small"
                icon="md-code-download"
                @click="reimportTable">重新导入</Button>
            <Tooltip placement="top" content="查看建表语句" transfer :delay="500">
              <Button
                ghost
                type="primary"
                size="small"
                icon="md-code-working"
                @click="showCreateTable"
                class="margin-left-10">建表语句</Button>
            </Tooltip>
            <template v-if="!isEditing">
              <Button
                ghost
                type="success"
                size="small"
                icon="md-create"
                @click="isEditing = true"
                class="margin-left-10">编辑</Button>
                <Poptip confirm
                title="您确定要删除这张表吗?"
                transfer
                placement="top-end"
                @on-ok="deleteTable">
                <Button ghost size="small" icon="md-trash" type="error" class="margin-left-10">删除</Button>
              </Poptip>
            </template>
            <template v-else>
              <Poptip confirm
              title="您确定要放弃修改吗?"
              transfer
              placement="top-end"
              @on-ok="cancelEdit">
              <Button size="small" icon="md-close" class="margin-left-10">取消</Button>
            </Poptip>
              <Button
                ghost
                size="small"
                icon="md-checkmark"
                type="success"
                @click="saveTable"
                class="margin-left-10">保存</Button>
            </template>
          </div>

          <Drawer placement="left"
            :closable="false"
            width="70%"
            v-model="drawer.show"
            :title="drawer.title">
            <pre>{{drawer.content}}</pre>
          </Drawer>

          <Modal
            v-model="showSampleData"
            title="查看Sample数据"
            scrollable
            width="auto"
            class-name="modal-vertical-center">
            <Table stripe border :columns="sampleColumns" :data="sampleData" size="small" />
          </Modal>

          <Row>
            <Col span="10">
              <Form :label-width="120">
                <FormItem label="数据库类型">{{tableInfo.dbTypeName}}</FormItem>
                <FormItem label="库名">{{ table.dbName }}</FormItem>
                <FormItem label="表类型">{{ table.tableTypeName}}</FormItem>
                <FormItem label="导入人">{{tableInfo.dev}}</FormItem>
                <FormItem label="使用中">
                  <Icon v-if="!isEditing" :type="table.isOffline === 1 ? 'md-checkbox-outline' : 'md-square-outline'" size="18"></Icon>
                  <i-switch v-else v-model="table.isOffline" :true-value="1" :false-value="0">
                    <Icon type="md-checkmark" slot="open"></Icon>
                    <Icon type="md-close" slot="close"></Icon>
                  </i-switch>
                </FormItem>
              </Form>
            </Col>
            <Col span="14">
              <Form :label-width="100">
                <FormItem label="连接名称">{{ tableInfo.connectionName }}</FormItem>
                <FormItem label="表名">{{ table.tableName }}</FormItem>
                <FormItem label="核心表">
                  <Icon v-if="!isEditing" :type="table.isCore === 1 ? 'md-checkbox-outline' : 'md-square-outline'" size="18"></Icon>
                  <i-switch v-else v-model="table.isCore" :true-value="1" :false-value="0">
                    <Icon type="md-checkmark" slot="open"></Icon>
                    <Icon type="md-close" slot="close"></Icon>
                  </i-switch>
                </FormItem>
                <FormItem label="业务负责人">
                  <span v-if="!isEditing">{{ table.owner }}</span>
                  <Input v-else v-model="table.owner" icon="person" style="width:200px" />
                </FormItem>
                <FormItem label="负责人邮箱">
                  <span v-if="!isEditing">{{ table.ownerEmail }}</span>
                  <Input v-else v-model="table.ownerEmail" icon="email" style="width:200px" />
                </FormItem>
              </Form>
            </Col>
            <Col span="22">
              <Form :label-width="120">
                <FormItem label="注解">{{ table.tableComment }}</FormItem>
                <FormItem label="自定义描述">
                  <pre v-if="!isEditing" style="margin-top: 0px">{{table.tableDesc}}</pre>
                  <Input v-else type="textarea" v-model="table.tableDesc" :autosize="{ minRows: 3}" />
                </FormItem>
              </Form>
            </Col>
          </Row>
        </Card>
      </Col>
<!--
      <Col span="7">
        <Card icon="ios-pricetags-outline" title="标签">
          <Row>
            <Col span="18">
              <Select v-model="articleTagSelected" multiple @on-change="handleSelectTag" placeholder="请选择表标签">
                <Option v-for="item in tableTagList" :value="item.value" :key="item.value">{{ item.value }}</Option>
              </Select>
            </Col>
            <Col span="6" class="padding-left-10">
            <Button v-show="!addingNewTag" @click="addingNewTag = true" long>新建</Button>
          </Col>
          </Row>
          <transition name="add-new-tag">
            <div v-show="addingNewTag" class="add-new-tag-con">
              <Col span="18">
                <Input v-model="newTagName" placeholder="请输入标签名" icon="md-checkmark" @on-enter="createNewTag" @on-click="createNewTag" />
              </Col>
              <Col span="6" class="padding-left-10">
                <Button @click="cancelCreateNewTag" long>取消</Button>
              </Col>
            </div>
          </transition>
        </Card>
      </Col>
-->
    </Row>

    <Row class="margin-top-10">
      <Card icon="md-grid" title="字段详情">
        <Spin size="large" fix v-if="showSpin" />
        <div slot="extra">

          <Button v-if="tableInfo.dbTypeName !== 'Hive'"
            ghost
            type="primary"
            icon="md-code-working"
            size="small"
            @click="showHiveCreateTable">Hive建表语句</Button>
          <Button ghost type="success" icon="md-download" size="small" @click="exportExcel" class="margin-left-10">导出Excel</Button>
        </div>
        <canEditTable
          v-model="dataList"
          :edit-incell="true"
          :hover-show="false"
          :columns-list="columnList"
          @on-cell-change="handleCellChange" >
        </canEditTable>
      </Card>
    </Row>
  </div>
</template>

<script>

import { oneOf } from '@/libs/tools'
import { mapMutations } from 'vuex'
import canEditTable from './components/canEditTable.vue'
import excel from '@/libs/excel'
import * as metadataApi from '@/api/metadata'

const initColumnList = [
  {
    key: 'columnPosition',
    title: '序号',
    width: 65,
    align: 'center'
  },
  {
    key: 'columnName',
    title: '名称',
    width: 200
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
  },
  {
    key: 'columnComment',
    title: '字段注解'
  },
  {
    key: 'columnDesc',
    title: '自定义描述',
    editable: true
  }
]

export default {
  name: 'table-detail',
  components: {
    canEditTable
  },
  data () {
    return {
      showSpin: false,
      showTableInfo: false,
      isEditing: false,
      createTableSQL: '',
      showSampleData: false,
      sampleColumns: [],
      sampleData: [],
      columnList: initColumnList,
      tableInfo: {},
      table: {},
      initTable: {},
      dataList: [],
      initDataList: [],
      tableTagList: [], // 所有标签列表
      articleTagSelected: [], // 文章选中的标签
      addingNewTag: false, // 添加新标签
      newTagName: '', // 新建标签名

      drawer: {
        show: false,
        title: '',
        content: ''
      }

    }
  },
  methods: {
    ...mapMutations([
      'closeTag'
    ]),
    async init () {
      const id = this.$route.params.id
      if (typeof id === 'undefined') return
      this.showSpin = true
      const result = await metadataApi.getTableDetail(id)
      this.showSpin = false
      if (result.code === 0) {
        this.tableInfo = result.data
        this.table = this.tableInfo.table
        this.initTable = JSON.parse(JSON.stringify(this.tableInfo.table))
        this.dataList = this.tableInfo.columnList
        this.initDataList = JSON.parse(JSON.stringify(this.tableInfo.columnList))
      }
    },
    handleSelectTag () {
      localStorage.tagsList = JSON.stringify(this.articleTagSelected) // 本地存储文章标签列表
    },
    cancelCreateNewTag () {
      this.newTagName = ''
      this.addingNewTag = false
    },
    createNewTag () {
      if (this.newTagName.length !== 0) {
        this.tableTagList.push({ value: this.newTagName })
        this.addingNewTag = false
        setTimeout(() => {
          this.newTagName = ''
        }, 200)
      } else {
        this.$Message.error('请输入标签名')
      }
    },
    async handleCellChange (val, index, key) {
      const column = this.dataList[index]
      column.columnDesc = val[index].columnDesc
      const result = await metadataApi.updateColumn(column)
      if (result.code === 0) {
        this.$Message.success('成功修改第 ' + (index + 1) + ' 行数据')
      }
    },
    async deleteTable () {
      const id = this.table.id
      const result = await metadataApi.deleteTable(id)
      if (result.code === 0) {
        this.$Message.success('删除成功')
        this.closePage()
      }
    },
    async reimportTable () {
      const importList = [{
        connectionId: this.table.connectionId,
        dbId: this.table.dbId,
        dbName: this.table.dbName,
        tableName: this.table.tableName
      }]
      this.$Message.loading({
        content: '正在重新导入，请稍后。',
        duration: 10
      })
      this.$Loading.start()
      const result = await metadataApi.importTable(importList)
      this.$Message.destroy()
      if (result.code !== 0) {
        this.$Loading.error()
        this.$Message.error(result.msg)
        return
      }
      this.$Loading.finish()
      this.$Message.success('导入成功')
    },
    closePage () {
      this.closeTag({
        name: 'table-detail',
        params: this.$route.params
      })
    },
    cancelEdit () {
      this.isEditing = false
      this.table = JSON.parse(JSON.stringify(this.initTable))
    },
    async saveTable () {
      this.$Loading.start()
      const result = await metadataApi.updateTable(this.table)
      if (result.code === 0) {
        this.$Message.success('保存成功')
        this.initTable = JSON.parse(JSON.stringify(this.table))
        this.isEditing = false
        this.$Loading.finish()
      } else {
        this.$Loading.error()
      }
    },
    exportExcel () {
      const title = []
      const key = []
      this.columnList.forEach(e => {
        title.push(e.title)
        key.push(e.key)
      })
      const params = {
        title,
        key,
        data: this.dataList,
        autoWidth: true,
        filename: this.table.tableName
      }
      excel.export_array_to_excel(params)
    },
    showCreateTable () {
      this.drawer = {
        show: true,
        title: '查看建表语句',
        content: this.table.createSql
      }
    },
    showHiveCreateTable () {
      let HiveSQL = 'create table ' + this.table.dbName + '.' + this.table.tableName + '\n'
      HiveSQL += '('
      this.dataList.forEach(e => {
        console.log(e)
        const columnType = e.columnType.toLowerCase()
        const columnName = e.columnName.toLowerCase()
        if (oneOf(columnType, ['float', 'decimal', 'double'])) {
          HiveSQL += '\n' + columnName + ' double,'
        } else if (columnType.indexOf('int') >= 0 || columnType === 'number') {
          HiveSQL += '\n' + columnName + ' bigint,'
        } else {
          HiveSQL += '\n' + columnName + ' string,'
        }
      })

      HiveSQL = HiveSQL.substring(0, HiveSQL.length - 1) + '\n'
      HiveSQL += ')' + '\n'
      HiveSQL += '-- partitioned by(data_date string)' + '\n'
      HiveSQL += 'row format delimited' + '\n'
      HiveSQL += 'fields terminated by \'\\t\'' + '\n'
      HiveSQL += 'null defined as \'\'' + '\n'
      HiveSQL += 'stored as orc tblproperties("orc.compression"="snappy");'

      this.drawer = {
        show: true,
        title: '查看Hive建表语句',
        content: HiveSQL
      }
    }
  },
  created () {
    this.tableTagList = [
      { value: 'vue' },
      { value: 'iview' },
      { value: 'ES6' },
      { value: 'webpack' },
      { value: 'babel' },
      { value: 'eslint' }
    ]
  },
  mounted () {
    this.init()
  },
  watch: {
    '$route.params.id' (id) {
      this.init()
    }
  }
}
</script>
