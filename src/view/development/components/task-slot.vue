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
                <Icon type="md-create" size="16" @click="editItem('left', index)" />
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
        <Card title="保留列表(不执行)" icon="ios-options" :padding="0" dis-hover :style="{minHeight}">
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
      :closable="false"
      :mask-closable="false"
      class-name="modal-vertical-center">
      <div slot="footer">
        <Poptip
          confirm
          transfer
          placement="top-end"
          title="确定要放弃本次修改吗？"
          @on-ok="closeModal"
          class="margin-right-10">
          <Button shape="circle" icon="md-close"/>
        </Poptip>
        <Tooltip placement="top" content="试运行" class="margin-right-10">
          <Button ghost shape="circle" type="primary" icon="md-paper-plane" @click="testQuery" />
        </Tooltip>
        <Button ghost shape="circle" type="success" icon="md-checkmark" @click="ok" :disabled="true" />
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
                <Option v-for="item in slotRuleList" :value="item.id" :key="item.id" v-if="item.id % 10000 === editSlot.slotType">{{item.name}}</Option>
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

    <Modal v-model="modal2" fullscreen footer-hide :title="firstConnectionName">
      <!--
      <Table stripe border :columns="sampleColumn1" :data="sampleData1" :loading="loadingTable1" size="small" />
    -->
    <HotTable :columns="sampleColumn1" :data="sampleData1" width="110px"/>
    </Modal>

    <Drawer
      transfer
      :title="firstConnectionName"
      v-model="drawer"
      width="50%"
      placement="left"
      :mask="false"
      class-name="slot-drawer">
      <HotTable :columns="sampleColumn1" :data="sampleData1" width="100%"/>
      <!--
      <Table stripe border :columns="sampleColumn1" :data="sampleData1" :loading="loadingTable1" size="small" />
    -->

    </Drawer>
    <Drawer
      transfer
      :title="secondConnectionName"
      v-model="drawer"
      width="50%"
      placement="right"
      :mask="false"
      class-name="slot-drawer">
      <HotTable :columns="sampleColumn2" :data="sampleData2" />
      <!--
      <Table stripe border :columns="sampleColumn2" :data="sampleData2" :loading="loadingTable2" size="small" />
    -->
    </Drawer>
  </div>
</template>

<script>

const slotRuleList = [
  {
    id: 10001,
    name: '发送邮件'
  },
  {
    id: 20001,
    name: '仅有结果时发送邮件'
  },
  {
    id: 30001,
    name: '有结果时成功结束任务'
  },
  {
    id: 40001,
    name: '有结果时失败结束任务'
  },
  {
    id: 50001,
    name: '无结果时成功结束任务'
  },
  {
    id: 60001,
    name: '无结果时失败结束任务'
  },
  {
    id: 10002,
    name: '结果不一致时发送邮件'
  },
  {
    id: 20002,
    name: '结果不一致时发送邮件并失败结束任务'
  }
]

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
import HotTable from '_c/hot-table'
import * as taskApi from '@/api/task'
import * as adHocApi from '@/api/adhoc'

export default {
  name: 'task-slot',
  components: {
    Draggable,
    HotTable,
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
      modal2: false,
      drawer: false,
      firstConnectionName: '',
      secondConnectionName: '',
      loadingTable1: false,
      loadingTable2: false,
      sampleColumn1: [],
      sampleColumn2: [],
      sampleData1: [],
      sampleData2: [],
      slotRuleList,

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
      this.$emit('input', list)
    },
    changeFirstDbType (value) {
      this.$refs.firstConnectionSelector.clearSingleSelect()
    },
    changeSecondDbType (value) {
      this.$refs.secondConnectionSelector.clearSingleSelect()
    },
    async testQuery () {
      const valid = await this.$refs.form1.validate()
      if (!valid) return

      this.sampleColumn1 = this.sampleColumn2 = this.sampleData1 = this.sampleData2 = []

      if (this.editSlot.slotType === 1) {
        this.modal2 = true
        this.testQuery1()
      } else if (this.editSlot.slotType === 2) {
        this.drawer = true
        const column1 = await this.testQuery1()
        const column2 = await this.testQuery2()

        console.log([...column1, ...column2])
        // 2个请求并行
        // const result1 = await promise1
        // const result2 = await promise2
      }
    },
    async testQuery1 () {
      this.firstConnectionName = this.editSlot.firstConnectionId > 0 ? this.connectionList.find(item => item.id === this.editSlot.firstConnectionId).name : ''

      const data = {
        connectionId: this.editSlot.firstConnectionId,
        dbType: this.editSlot.firstDbType,
        query: this.editSlot.firstContent
      }
      const result = await adHocApi.runQuery(data)
      if (result.code !== 0) {
        this.$Message.error(result.msg)
        this.sampleColumn1 = ['error_msg']
        this.sampleData1 = [{ 'error_msg' : result.msg }]
        return
      }

      this.sampleData1 = result.data.rows
      this.sampleColumn1 = result.data.columns
      return this.sampleColumn1
    },
    async testQuery2 () {
      this.secondConnectionName = this.editSlot.secondConnectionId > 0 ? this.connectionList.find(item => item.id === this.editSlot.secondConnectionId).name : ''

      const data = {
        connectionId: this.editSlot.secondConnectionId,
        dbType: this.editSlot.secondDbType,
        query: this.editSlot.secondContent
      }
      const result = await adHocApi.runQuery(data)
      if (result.code !== 0) {
        this.$Message.error(result.msg)
        this.sampleColumn2 = ['error_msg']
        this.sampleData2 = [{ 'error_msg' : result.msg }]
        return
      }
      this.sampleData2 = result.data.rows
      this.sampleColumn2 = result.data.columns
      return this.sampleColumn2
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
    },
    init () {
      this.leftList = this.value.filter(e => e.position < 0)
      this.middleList = this.value.filter(e => e.position === 0)
      this.rightList = this.value.filter(e => e.position > 0)
    }
  },
  mounted () {
  },
  created () {
    this.init()
  },
  computed: {
    minHeight () {
      return this.$store.state.app.fullHeight - 180 + 'px'
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
    value (list) {
      this.init()
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

.slot-drawer {
  z-index: 2888;
}
</style>

