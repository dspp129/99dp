<template>
  <div class="slot-list">
    <Row type="flex" justify="center">
      <Col span="22" offset="2">
        <Steps>
          <Step title="开始" />
          <Step title="前插槽" />
          <Step v-for="item in stepList" :title="item" :key="item" />
          <Step title="后插槽" />
          <Step title="结束" />
        </Steps>
      </Col>
    </Row>

    <Row type="flex" justify="space-between" align="top" class="margin-top-20">
      <Col span="7">
        <Card title="前插槽" icon="ios-options" :padding="0" dis-hover>
          <Dropdown transfer
            slot="extra"
            trigger="click"
            placement="bottom-end"
            @on-click="addItem">
            <a href="javascript:void(0)"><Icon type="md-add" size="20" /></a>
            <DropdownMenu slot="list">
              <DropdownItem name="left-1">数据校验</DropdownItem>
              <DropdownItem name="left-2">双源比对</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Draggable
            v-model="leftList"
            v-bind="dragOptions"
            class="list-group"
            handle=".reorder"
            :disabled="hasSlot === 0"
            :style="{minHeight}"
            @end="transback">

            <div
              type="transition"
              class="list-group-item item"
              v-for="(item, index) in leftList"
              :key="item.name">
              <Icon type="md-reorder" size="20" style="cursor: move;" class="reorder" />
              <span class="margin-left-10">{{ item.name }}</span>
              <div style="float: right;">
                <Icon type="md-create" size="16" @click="editItem('left', index)"/>
                <Poptip
                  confirm
                  transfer
                  placement="right"
                  title="您确认删除这个插槽吗？"
                  @on-ok="removeItem('left', index)">
                  <Icon type="md-close" size="20" class="margin-left-10" />
                </Poptip>
              </div>
            </div>
          </Draggable>
        </Card>
      </Col>

      <Col :style="{lineHeight: minHeight}">
        <a>
          <Poptip
            confirm
            transfer
            placement="top"
            title="清空左侧列表？"
            @on-ok="clearItem('left')">
            <Icon type="md-arrow-round-forward" size="40" />
          </Poptip>
        </a>
      </Col>

      <Col span="7">
        <Card title="保留列表" icon="ios-options" :padding="0" dis-hover :style="{minHeight}">
          <Checkbox
            slot="extra"
            :value="hasSlot"
            :true-value="1"
            :false-value="0"
            @on-change="onChangeHasSlot">
            <span class="margin-left-5 non-select">启用插槽</span>
          </Checkbox>

          <Draggable
            v-model="middleList"
            v-bind="dragOptions"
            class="list-group"
            handle=".reorder"
            :disabled="hasSlot === 0"
            :style="{minHeight}"
            @end="transback">

            <div
              type="transition"
              class="list-group-item item"
              v-for="(item, index) in middleList"
              :key="item.name">

              <Icon type="md-reorder" size="20" style="cursor: move;" class="reorder" />
              <span class="margin-left-10">{{ item.name }}</span>
                <div style="float: right;">
                  <Icon type="md-create" size="16" @click="editItem('middle', index)"/>
                  <Poptip
                    confirm
                    transfer
                    placement="right"
                    title="您确认删除这个插槽吗？"
                    @on-ok="removeItem('middle', index)">
                    <Icon type="md-close" size="20" class="margin-left-10" />
                  </Poptip>
                </div>
            </div>
          </Draggable>
        </Card>
      </Col>

      <Col :style="{lineHeight: minHeight}">
        <a>
          <Poptip
            confirm
            transfer
            placement="top"
            title="清空右侧列表？"
            @on-ok="clearItem('right')">
            <Icon type="md-arrow-round-back" size="40" />
          </Poptip>
        </a>
      </Col>

      <Col span="7">
        <Card title="后插槽" icon="ios-options" :padding="0" dis-hover :style="{minHeight}">
          <Dropdown transfer
            slot="extra"
            trigger="click"
            placement="bottom-end"
            @on-click="addItem">
            <a href="javascript:void(0)"><Icon type="md-add" size="20" /></a>
            <DropdownMenu slot="list">
              <DropdownItem name="right-1">数据校验</DropdownItem>
              <DropdownItem name="right-2">双源比对</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Draggable
            v-model="rightList"
            v-bind="dragOptions"
            class="list-group"
            handle=".reorder"
            :disabled="hasSlot === 0"
            :style="{minHeight}"
            @end="transback"
            >
            <div type="transition" class="list-group-item item" v-for="(item, index) in rightList" :key="item.name" >
              <Icon type="md-reorder" size="20" style="cursor: move;" class="reorder" />
              <span class="margin-left-10">{{ item.name }}</span>
              <div style="float: right;">
                <Icon type="md-create" size="16" @click="editItem('right', index)"/>
                <Poptip
                  confirm
                  transfer
                  placement="right"
                  title="您确认删除这个插槽吗？"
                  @on-ok="removeItem('right', index)">
                  <Icon type="md-close" size="20" class="margin-left-10" />
                </Poptip>
              </div>
            </div>
          </Draggable>
        </Card>
      </Col>
    </Row>

    <Modal
      width="800"
      v-model="modal1"
      :title="modalTitle"
      :mask-closable="false"
      class-name="modal-vertical-center">
      <div slot="footer">
        <Poptip
          confirm
          transfer
          placement="top-end"
          title="确定要放弃本次修改吗？"
          @on-ok="closeModal">
          <Button shape="circle" icon="md-close" class="margin-right-10" />
        </Poptip>
        <Button ghost type="success" shape="circle" icon="md-checkmark" @click="ok" />
      </div>
      <Form ref="form1"
        :model="editSlot"
        :label-width="100"
        class="margin-top-20 slot-form"
        :rules="ruleValidate1"
        :show-message="false"
        @submit.native.prevent>
        <Row>
          <Col span="11">
            <FormItem label="标题" prop="name">
              <Input v-model="editSlot.name" placeholder="请输入标题..." style="width: 260px;"/>
            </FormItem>
          </Col>
          <Col span="13">
            <FormItem label="规则" prop="slotRule" >
              <Select v-model="editSlot.slotRule" style="width: 260px;">
                <Option value="1">发送结果</Option>
                <Option value="2">仅当有结果时发送结果</Option>
                <Option value="3">仅当有结果时成功结束任务</Option>
                <Option value="4">仅当有结果时失败结束任务</Option>
              </Select>
            </FormItem>
          </Col>
        </Row>

        <Row>
          <Col span="11">
            <FormItem label="说明" prop="description" >
              <Input v-model="editSlot.description" type="textarea" style="width: 260px;" :autosize="{minRows: 4,maxRows: 5}" placeholder="常见的监控规则有：主键监控、表数据量及波动监控、重要字段的非空监控、重要枚举字段的离散值监控、指标值波动监控、业务规则监控等。" />
            </FormItem>
          </Col>
          <Col span="13">
            <FormItem label="邮箱" >
              <Input v-model="editSlot.email" type="textarea" style="width: 260px;" :autosize="{minRows: 4,maxRows: 5}" placeholder="请以回车或者逗号分隔。" />
            </FormItem>
          </Col>
        </Row>

        <FormItem label="数据库连接" prop="firstConnectionId" >
          <Select transfer
            size="small"
            v-model="editSlot.firstDbType"
            placeholder="数据库类型"
            @on-change="changeFirstDbType"
            style="width:120px;" >
            <Option v-for="item in dbTypeList" :value="item.id" :key="item.id">{{ item.name }}</Option>
          </Select>
          <Select ref="firstConnectionSelector"
            transfer
            clearable
            size="small"
            v-model="editSlot.firstConnectionId"
            placeholder="数据库连接"
            class="margin-left-10"
            style="width:170px;">
            <Option v-for="item in connectionList" :value="item.id" :key="item.id" v-if="item.dbType === editSlot.firstDbType">{{item.name}}</Option>
          </Select>

          <Select transfer
            v-if="editSlot.slotType === 2"
            v-model="editSlot.secondDbType"
            placeholder="数据库类型2"
            class="margin-left-10"
            size="small"
            @on-change="changeSecondDbType"
            style="width:120px;" >
            <Option v-for="item in dbTypeList" :value="item.id" :key="item.id">{{ item.name }}</Option>
          </Select>
          <Select ref="secondConnectionSelector"
            v-if="editSlot.slotType === 2"
            transfer
            clearable
            size="small"
            v-model="editSlot.secondConnectionId"
            placeholder="数据库连接2"
            class="margin-left-10"
            style="width:170px;">
            <Option v-for="item in connectionList" :value="item.id" :key="item.id" v-if="item.dbType === editSlot.secondDbType">{{item.name}}</Option>
          </Select>
        </FormItem>

        <FormItem label="SQL">
          <SqlEditor v-if="editSlot.slotType === 1"
            v-model="editSlot.firstContent"
            :height="200"
            :width="611"
            class="editor-round" />

          <div v-else>
          <SqlEditor 
            v-model="editSlot.firstContent"
            :height="200"
            :width="300"
            class="editor-round"
            style="float: left;"/>

            <SqlEditor 
            v-model="editSlot.secondContent"
            :height="200"
            :width="300"
            class="editor-round margin-left-10"
            style="float: left;"/>
          </div>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>

const initSlot = {
  oldName: '',
  name: '',
  email: '',
  slotType: 1,
  slotRule: 0,
  description: '',
  firstDbType: 0,
  firstConnectionId: 0,
  firstContent: '',
  secondDbType: 0,
  secondConnectionId: 0,
  secondContent: '',
  position: 0
}

const listDic = {
  left: 'leftList',
  middle: 'middleList',
  right: 'rightList'
}

import Draggable from 'vuedraggable'
import SqlEditor from '_c/sql-editor'

export default {
  name: 'task-slot',
  components: {
    Draggable,
    SqlEditor
  },
  props: {
    value: Array,
    step: Array,
    hasSlot: Number,
    id: Number
  },
  data () {
    const validateSlotRule = (rule, value, callback) => {
      if (value > 0) {
        callback()
        return
      }
      callback(new Error('规则不能为空'))
    }
    const validateConnection = (rule, value, callback) => {
      if (this.editSlot.slotType === 1
          && this.editSlot.firstConnectionId > 0) {
        callback()
        return
      }
      if (this.editSlot.slotType === 2 
          && this.editSlot.firstConnectionId > 0
          && this.editSlot.secondConnectionId > 0) {
        callback()
        return
      }
      callback(new Error('数据库连接不能为空'))
    }
    const validateName = (rule, value, callback) => {
      if (value.trim() === '') {
        this.$Message.error('名称不能为空')
        callback(new Error('名称不能为空'))
        return
      } else if (this.editSlot.oldName !== value && this.value.filter(e => e.name === value).length > 0) {
        this.$Message.error('该名称已存在')
        callback(new Error('该名称已存在'))
        return
      } 
      callback()
    }

    return {
      stepList: this.step,
      leftList: [],
      middleList: [],
      rightList: [],

      dbTypeList: this.$store.state.user.dbTypeList,
      connectionList: this.$store.state.user.connectionList,

      dragOptions: {
        animation: 200,
        group: "description",
        disabled: false,
        ghostClass: "ghost"
      },

      editSlot: JSON.parse(JSON.stringify(initSlot)),

      modal1: false,

      ruleValidate1: {
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' },
          { validator: validateName, trigger: 'blur' }
        ],
        firstConnectionId: [
          { required: true, validator: validateConnection, trigger: 'none' }
        ],
        slotRule: [
          { required: true, validator: validateSlotRule, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    addItem (name) {
      if (this.hasSlot === 0) {
        this.$Message.error('请启用插槽')
        return
      }
      const location = name.split('-')[0]
      const slotType = name.split('-')[1]

      this.editSlot = JSON.parse(JSON.stringify(initSlot))
      this.editSlot.location = location
      this.editSlot.slotType = Number(slotType)
      this.modal1 = true
    },
    editItem (location, index) {
      if (this.hasSlot === 0) {
        this.$Message.error('请启用插槽')
        return
      }
      this.editSlot = JSON.parse(JSON.stringify(this[listDic[location]][index]))
      this.editSlot.location = location
      this.editSlot.oldName = this.editSlot.name
      this.modal1 = true
    },
    removeItem (location, index) {
      this[listDic[location]].splice(index, 1)
      this.transback()
    },
    onChangeHasSlot (value) {
      this.$emit('update:hasSlot', value)
    },
    clearItem (location) {
      const source = this[listDic[location]]
      this.middleList = this.middleList.concat(source)
      this[listDic[location]] = []
      this.transback()
    },
    transback () {
      let position = this.leftList.length * -1
      this.leftList.forEach(e => e.position = position++)
      this.rightList.forEach(e => e.position = ++position)
      this.middleList.forEach(e => e.position = 0)
      const list = [...this.leftList, ...this.middleList, ...this.rightList]
      this.value = list
      console.log(list)
      //this.$emit('input', list)
    },
    changeFirstDbType (value) {
      this.$refs.firstConnectionSelector.clearSingleSelect()
    },
    changeSecondDbType (value) {
      this.$refs.secondConnectionSelector.clearSingleSelect()
    },
    async ok () {
      const valid = await this.$refs.form1.validate()
      if (!valid) return
      const location = this.editSlot.location
      const list = this[listDic[location]]
      const newSlot = JSON.parse(JSON.stringify(this.editSlot))
      if (newSlot.oldName === '') {
        list.push(newSlot)
      } else {
        list.forEach((e, i) => {
          if(e.name === newSlot.oldName) list.splice(i, 1, newSlot)
        })
      }
      this.closeModal()
      this.transback()
    },
    closeModal () {
      this.modal1 = false
      this.$refs.form1.resetFields()
    }
  },
  mounted () {

  },
  created () {

  },
  computed: {
    minHeight () {
      return this.$store.state.app.fullHeight - 305 + 'px'
    },
    modalTitle () {
      let name = ''
      if (this.editSlot.oldName === '') name = '新增'
      else name = '编辑'
      switch (this.editSlot.slotType) {
        case 1: name += '数据校验'
          break
        case 2: name += '双源比对'
          break
      }
      return name
    }
  },
  watch: {
    leftList (list) {

    },
    middleList (list) {

    },
    rightList (list) {

    }
  }
}
</script>



<style lang="less">
.ghost {
  opacity: 0.5;
}

.list-group-item {
  position: relative;
  display: block;
  padding: 7px 16px;
  margin: -1px;
  border: 1px solid #e8eaec;
  transition:all 0.5s linear;
}

.list-group-item:hover {
  color: #2d8cf0;
  border-color: #2d8cf0 !important;
  transition: all .2s;
}

.slot-form .ivu-form-item {
  margin-bottom: 10px;
}
</style>

