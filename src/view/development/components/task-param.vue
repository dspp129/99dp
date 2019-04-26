<template>
  <div>
    <Divider orientation="left">检测到的参数</Divider>
    <Tag v-for="(item, i) in value"
      :color="colorList[i%12]"
      :key="i"
      :checked="item.isActive">
      <span @click.stop="checkTag(i)" class="non-select">{{item.name}}</span>
    </Tag>
    <Input v-if="isAddingTag"
      ref="input"
      v-model.trim="tempName"
      style="width: 83px"
      icon="md-close"
      size="small"
      @on-click="isAddingTag = false"
      @on-enter="addParam" />
    <Button v-else icon="ios-add" type="dashed" size="small" @click="openInput">添加参数</Button>

    <Row class="margin-top-40"></Row>
    <Divider orientation="left" >已配置的参数</Divider>

    <Table :columns="columnList" :data="value">
      <template slot-scope="{ row, index }" slot="name">
        <Input type="text" v-model="editName" v-if="editIndex === index" />
        <span v-else>{{ row.name }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="isActive">
        <Checkbox v-model="row.isActive" size="large" @on-change="checkTag(index)" />
      </template>

      <template slot-scope="{ row, index }" slot="connectionName">
        <Cascader v-model="editConnectionId" :data="connectionList" trigger="hover" v-if="editIndex === index" />
        <span v-else>{{ getConnectionName(row.connectionId) }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="expression">
        <Input type="textarea" :autosize="true" v-model="editExpression" v-if="editIndex === index" />
        <pre v-else>{{ row.expression }}</pre>
      </template>

      <template slot-scope="{ row, index }" slot="operation">
        <div v-if="editIndex === index">
          <Button type="success" size="small" shape="circle" icon="md-checkmark" ghost @click="handleSave(index)" />
          <Button size="small" shape="circle" icon="md-close" @click="editIndex = -1" style="margin-left: 10px;"/>
        </div>
        <div v-else>
          <Button size="small" shape="circle" icon="md-create" @click="handleEdit(row, index)" />
          <Poptip
            confirm
            placement="top-end"
            title="您确认删除这个参数吗？"
            @on-ok="removeParam(index)"
            class="margin-left-10">
            <Button size="small" ghost shape="circle" icon="md-trash" type="error" />
          </Poptip>
        </div>
      </template>
    </Table>

  </div>
</template>

<script>

const colorList = [
  'magenta', 'red', 'volcano',
  'orange', 'gold', 'yellow',
  'lime', 'green', 'cyan',
  'blue', 'geekblue', 'purple'
]

const initColumnList = [
  {
    type: 'index',
    width: 60,
    align: 'center'
  },
  {
    slot: 'name',
    title: '参数名称',
    width: 150,
    ellipsis: true
  },
  {
    slot: 'isActive',
    title: '有效',
    width: 80
  },
  {
    slot: 'connectionName',
    title: '参数类型 / 连接名称',
    width: 250
  },
  {
    slot: 'expression',
    title: '表达式'
  },
  {
    slot: 'operation',
    title: '操作',
    align: 'center',
    width: 100,
    fixed: 'right'
  }
]

export default {
  name: 'task-param',
  components: {
  },
  props: {
    value: Array
  },
  data () {
    return {
      colorList,

      isAddingTag: false,
      tempName: '',

      columnList: initColumnList,

      editIndex: -1, // 当前聚焦的输入框的行数
      editName: '',
      editConnectionId: [],
      editExpression: '',
      connectionList: [{
        value: 0,
        label: '常量'
      }]
    }
  },
  methods: {
    checkTag (i) {
      this.value[i].isActive = !this.value[i].isActive
    },
    addParam () {
      this.isAddingTag = false
      if (this.tempName.replace(/(^s*)|(s*$)/g, '').length === 0) return
      if (!this.checkNameExist(this.tempName)) {
        this.value.push({
          name: this.tempName,
          isActive: true,
          connectionId: [0],
          connectionName: '常量',
          expression: ''
        })
      }
    },
    openInput () {
      this.tempName = ''
      this.isAddingTag = true
    },
    handleEdit (row, index) {
      this.editName = row.name
      this.editExpression = row.expression
      this.editConnectionId = row.connectionId
      this.editIndex = index
    },
    handleSave (index) {
      if (this.value[index].name !== this.editName) {
        if (this.checkNameExist(this.editName)) return
      }
      this.value[index].name = this.editName
      this.value[index].expression = this.editExpression
      this.value[index].connectionId = this.editConnectionId
      this.editIndex = -1
    },
    removeParam (index) {
      this.value.splice(index, 1)
      this.$Message.success('删除了第' + (index + 1) + '行数据')
    },
    getConnectionName (connectionId) {
      const level1 = this.connectionList.find(item => item.value === connectionId[0])
      if (connectionId.length === 1) return level1.label
      const level2 = level1.children.find(item => item.value === connectionId[1])
      return level1.label + ' / ' + level2.label
    },
    checkNameExist (name) {
      const exist = this.value.filter(item => item.name === name)
      if (exist.length > 0) {
        this.$Message.error('该名称已存在')
        return true
      } else return false
    },
    initConnectionList () {
      this.$store.state.user.connectionList.forEach(e => {
        const item = { value: e.id, label: e.name }
        const parent = this.connectionList.find(_ => _.value === e.dbType)
        if (parent) {
          parent.children.push(item)
        } else {
          this.connectionList.push({
            value: e.dbType,
            label: e.dbTypeName,
            children: [item]
          })
        }
      })
    }
  },
  computed: {
  },
  activated () {
  },
  updated () {
    if (this.$refs.input) this.$refs.input.focus()
  },
  mounted () {
  },
  created () {
    this.initConnectionList()
  }
}
</script>

