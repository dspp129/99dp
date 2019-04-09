<template>
  <Row class="margin-top-10">
    <Col span="11">
      <Card dis-hover icon="md-log-in" title="Source" :style="{minHeight}">
        <Row type="flex" justify="center" align="middle">
          <Form
            :model="value"
            label-position="right"
            :label-width="72"
            style="margin-top: 30%; margin-bottom: 30%">
            <FormItem v-for="(item, index) in value.sourceTableList"
              :label="'来源表' + (index + 1)"
              :key="index"
              required>
              <Input readonly
                v-model="item.tableFullName"
                icon="md-create"
                placeholder="请点击图标编辑来源表"
                @on-click="onOpenModal(index)"
                style="width:280px" />
              <template v-if="item.id > 0">
                <Poptip
                  confirm
                  transfer
                  placement="top-end"
                  title="您确认删除这张表吗？"
                  class="margin-left-10"
                  @on-ok="removeItem(index)">
                  <Button size="small"
                  shape="circle"
                  icon="md-remove"
                  type="error"
                  :disabled="index === 0" />
                </Poptip>
              </template>
              <template v-else>
                <Button size="small"
                shape="circle"
                icon="md-remove"
                type="error"
                class="margin-left-10"
                @click="removeItem(index)"
                :disabled="index === 0"
                style="margin-right: 30px;"/>
            </template>
          </FormItem>
          <Button
            type="dashed"
            long
            @click="handleAdd"
            style="width:280px;margin-left: 72px;margin-right: 64px;">
            <Icon type="plus-round"></Icon>&nbsp;&nbsp;新增来源表
          </Button>
          </Form>
          </Row>
        </Card>
      </Col>
      <Col span='2' :style="{textAlign: 'center',lineHeight: minHeight}">
      <a>
        <Icon type="md-arrow-round-forward" size="50"></Icon>
      </a>
      </Col>
      <Col span="11">
        <Card dis-hover icon="md-log-out" title="Target" :style="{minHeight}">
          <Row type="flex" justify="center" align="middle">
            <Form
              :model="value"
              label-position="right"
              :label-width="70"
              style="margin-top: 30%;margin-bottom: 30%;">
              <FormItem label="目标表" prop="targetTableId">
                <Input readonly
                v-model="targetTableFullName"
                icon="md-create"
                placeholder="请点击图标编辑目标表"
                @on-click="onOpenTargetModal"
                style="width:280px" />
              </FormItem>
            </Form>
          </Row>
        </Card>
      </Col>
    <ChooseTable :title="title" v-model="showingModal" @onChooseTable="onChooseTable" />
  </Row>
</template>

<script>
import ChooseTable from './choose-table'

export default {
  name: 'sql-1',
  components: {
    ChooseTable
  },
  props: {
    value: Object
  },
  data () {
    return {
      showingModal: false,
      title: '',
      connectionList: [],
      tableList: []
    }
  },
  methods: {
    init () {
      if (this.value.sourceTableList.length === 0) {
        this.handleAdd()
      }
    },
    removeItem (index) {
      this.value.sourceTableList.splice(index, 1)
    },
    handleAdd () {
      this.value.sourceTableList.push({ tableFullName: '' })
    },
    onChooseTable (source) {
      if (this.title.indexOf('目标表') > 0) {
        this.changeTarget(source)
        return
      }

      const id = source.tableId
      const index = Number(this.title.replace('编辑来源表', '')) - 1
      if (this.value.sourceTableList.filter(x => x.id === id).length > 0) {
        this.value.sourceTableList.splice(index, 1, { tableFullName: '' })
        this.$Message.warning('该表已存在')
        return
      }

      const tableFullName = source.dbName + '.' + source.tableName
      const table = { id, tableFullName }
      this.value.sourceTableList.splice(index, 1, table)
    },
    changeTarget (target) {
      this.value.targetDbType = target.dbType
      this.value.targetConnectionId = target.connectionId
      this.value.targetDbId = target.dbId
      this.value.targetDbName = target.dbName
      this.value.targetTableId = target.tableId
      this.value.targetTableName = target.tableName
    },
    onOpenModal (index) {
      this.showingModal = true
      this.title = '编辑来源表' + (index + 1)
    },
    onOpenTargetModal () {
      this.showingModal = true
      this.title = '编辑目标表'
    }
  },
  computed: {
    minHeight () {
      return this.$store.state.app.fullHeight - 80 + 'px'
    },
    targetTableFullName () {
      if (this.value.targetTableName.length > 0) { return this.value.targetDbName + '.' + this.value.targetTableName } else { return '' }
    }
  },
  mounted () {
    this.init()
  }
}
</script>
