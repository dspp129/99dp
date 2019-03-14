<template>
  <Row :gutter="10" class="margin-top-10">
    <Col span="6">
      <Card dis-hover>
        <p slot="title">
          <Icon type="md-flag"></Icon>
          预处理
          <Tooltip content="ETL抽取前执行" placement="right">
            <Button type="text" shape="circle" size="small" icon="md-information-circle" />
          </Tooltip>
        </p>
        <Button slot="extra" ghost type="primary" icon="md-add" shape="circle" size="small" @click="newItem('Pre')"/>
        <div>
          <ul id="value.preSql" class="iview-admin-draggable-list">
            <li v-for="(item, index) in value.preSql" :key="index" class="notwrap todolist-item" :data-index="index" @click="showItem('Pre', index)">
              Pre-{{index+1}} {{ item.name }}
            </li>
          </ul>
        </div>
      </Card>
      <Card dis-hover class="margin-top-10">
        <p slot="title">
          <Icon type="md-checkmark-circle"></Icon>
          后处理
          <Tooltip content="ETL完成后执行" placement="right">
            <Button type="text" shape="circle" size="small" icon="md-information-circle" />
          </Tooltip>
        </p>
        <Button slot="extra" ghost type="primary" icon="md-add" shape="circle" size="small" @click="newItem('Post')"/>
        <div>
          <ul id="value.postSql" class="iview-admin-draggable-list">
            <li v-for="(item, index) in value.postSql" :key="index" class="notwrap todolist-item" :data-index="index" @click="showItem('Post', index)">
              Post-{{index+1}} {{ item.name }}
            </li>
          </ul>
        </div>
      </Card>
    </Col>
    <Col span="18">
      <Card dis-hover icon="md-code-working" title="SQL详情" :style="{minHeight}">
        <div slot="extra">
          <ButtonGroup size="small" >
            <Button :disabled="removable" type="dashed">Insert</Button>
            <Button :disabled="removable" type="dashed">Delete</Button>
            <Button :disabled="removable" type="dashed">Update</Button>
            <Button :disabled="removable" type="dashed">Merge</Button>
            <Button :disabled="removable" type="default" @click="appendDrop">Drop Partition</Button>
          </ButtonGroup>
          <Poptip
            confirm
            transfer
            placement="top-end"
            title="您确认删除这条内容吗？"
            @on-ok="removeItem"
            class="padding-left-10">
            <Button size="small" ghost shape="circle" icon="md-trash" type="error" :disabled="removable"/>
          </Poptip>
        </div>
        <Input v-model="task.name" :readonly="removable" :placeholder="placeholder">
          <span slot="prepend">{{prepend}}</span>
        </Input>

        <div class="margin-top-10 editor-round">
          <SqlEditor v-model="task.content" :height="editorHeight" :readonly="removable" />
        </div>
      </Card>
    </Col>
  </Row>
</template>

<script>

import SqlEditor from '_c/sql-editor'

const initTask = {
  name: '',
  content: '',
  position: '',
  index: ''
}

export default {
  name: 'etl-3',
  components: {
    SqlEditor
  },
  props: {
    value: Object
  },
  data () {
    return {
      removable: true,
      task: initTask
    }
  },
  methods: {
    showItem (position, index) {
      this.task = position === 'Pre' ? this.value.preSql[index] : this.value.postSql[index]
      this.task.position = position
      this.task.index = index
      this.removable = false
      this.value.selectedIndex = position + '-' + index
    },
    newItem (position) {
      const index = position === 'Pre' ? this.value.preSql.length : this.value.postSql.length
      this.task = {
        name: '新建' + position,
        content: '',
        index: index,
        position: position
      }
      if (position === 'Pre') {
        this.value.preSql.push(this.task)
      } else {
        this.value.postSql.push(this.task)
      }
      this.removable = false
    },
    removeItem () {
      const task = this.task
      if (task.position === 'Pre') {
        this.value.preSql.splice(task.index, 1)
      } else {
        this.value.postSql.splice(task.index, 1)
      }
      this.removable = true
      this.task = {
        name: '',
        content: '',
        position: ''
      }
    },
    appendDrop () {
      let sql = 'alter table ' + this.value.targetDbName + '.' + this.value.targetTableName
      if (this.value.targetPartitionColumns.length > 0) {
        sql += ' drop partition ('
        this.value.targetPartitionColumns.forEach(e => {
          sql += e.columnName + '=' + e.columnValue + ','
        })
        sql = sql.substring(0, sql.length - 1)
        sql += ')'
      }
      this.task.content += '\n' + sql
      // alter table ods.ta_rpt_ipo_clr_txn_audit_day drop partition (data_date='${startDate}')
    }
  },
  computed: {
    minHeight () {
      return this.$store.state.app.fullHeight - 205 + 'px'
    },
    prepend () {
      if (this.task.position.length > 0) {
        return this.task.position + '-' + (this.task.index + 1)
      } else {
        return ''
      }
    },
    editorHeight () {
      const length = this.value.preSql.length + this.value.postSql.length
      const height = this.$store.state.app.fullHeight - 335
      const listHeight = length * 46 + 51
      return height > listHeight ? height : listHeight
    },
    placeholder () {
      return this.removable ? '请在执行列表添加或选择SQL' : '请输入SQL标题'
    }
  },
  mounted () {
  },
  watch: {
    'value.id' (id) {
      if (typeof id === 'undefined') {
        this.task = initTask
        return
      }
      if (typeof this.value.selectedIndex === 'undefined') {
        this.task = initTask
      } else {
        const arr = this.value.selectedIndex.split('-')
        this.showItem(arr[0], arr[1])
      }
    }
  }
}
</script>
