<template>
  <Modal v-model="showing"
    width="500"
    :mask-closable="false"
    :closable="false"
    class-name="modal-vertical-center">
    <Divider orientation="left">执行时间</Divider>
    <Row type="flex" justify="center" align="middle" class="margin-top-10">
      <Col>
        <RadioGroup v-model="execType">
          <Radio label="immediate">立即执行</Radio>
          <Radio label="planned">预约执行</Radio>
        </RadioGroup>
        <DatePicker
          type="datetime"
          :disabled="execType === 'immediate'"
          :options="options"
          v-model="startTime"
          :clearable="false"
          format="yyyy-MM-dd HH:mm:ss"
          placeholder="请选择日期时间"
          class="margin-left-5 margin-right-10"
          style="width: 160px"
        />
      </Col>
    </Row>

    <Divider orientation="left" class="margin-top-20">执行区间</Divider>
    <Row type="flex" justify="center" align="middle" class="margin-top-10">
      <RadioGroup v-model="execTimes" vertical>
        <Radio label="single">
          <span>单次提交</span>
          <span class="margin-left-10">
            <Tooltip placement="top" content="${fireTime}">计划时间</Tooltip>
          </span>
          <span class="margin-left-10 margin-right-5">=</span>
          <DatePicker :disabled="execTimes === 'batch'"
            :readonly="defaultFireTime !== ''"
            type="datetime"
            v-model="fireTime"
            :clearable="false"
            format="yyyy-MM-dd HH:mm:ss"
            placeholder="单击此处选择计划时间"
            class="margin-left-5"
            style="width: 160px" />
        </Radio>
        <Radio label="batch" v-if="cronExpr !== ''" class="margin-top-20">
          <span>批量提交</span>
          <DatePicker :disabled="execTimes === 'single'"
            transfer
            type="daterange"
            v-model="dateRange"
            split-panels
            class="margin-left-5"
            placeholder="单击此处选择日期区间"
            @on-change="getData"
            style="width: 240px" />
        </Radio>
      </RadioGroup>
    </Row>

    <div v-if="execTimes === 'batch' && dataList.length > 0">
      <Divider dashed orientation="right">
        <Checkbox
          :indeterminate="indeterminate"
          :value="isCheckedAll"
          @click.prevent.native="checkAllFireTime">全选
        </Checkbox>
      </Divider>
      <Row>
        <CheckboxGroup v-model="fireTimeCheckList" :style="{minHeight: dataList.length > size ? '170px' : '0px'}">
          <Checkbox class="margin-left-10" v-for="(item, index) in dataList" :label="item" :key="index" v-show="index >= startOffset && index < endOffset"/>
        </CheckboxGroup>
      </Row>
      <Row type="flex" justify="center" align="middle" class="margin-top-10">
        <Page :current.sync="page"
          :total="dataList.length"
          :page-size="size"
          show-total
          size="small"/>
      </Row>
    </div>
    <Row v-else class="margin-top-10" />
    <div slot="footer">
      <Button shape="circle" icon="md-close" @click="close"/>
      <Button type="success"
        ghost
        shape="circle"
        :icon="hasChild ? 'md-checkmark' : 'md-paper-plane'"  
        @click="ok"
        :loading="submitting" />
    </div>
    <Modal v-model="choosingChild" fullscreen title="选择子依赖">
      <tree-table border
        expand-key="name"
        :tree-type="true"
        :expand-type="false"
        :selectable="false"
        :is-fold="false"
        :max-height="10"
        :columns="columnList"
        :data="tableList"
        @cell-click="clickCell"
        @cell-dblclick="clickCell">
        <template slot="choose" slot-scope="{ row, index }">
          <Checkbox v-model="row.checked" :disabled="row.disabled" style="margin-right: 0px;" />
        </template>
      </tree-table>
      <div slot="footer">
        <Button shape="circle" icon="md-close" @click="choosingChild = false" />
        <Tooltip :content="checkAllJobs ? '全选' : '反选'" placement="top">
          <Button type="success" ghost shape="circle" :icon="checkAllJobs ? 'md-checkbox-outline' : 'md-square-outline'" @click="checkAllOrUncheck" class="margin-left-10" />
        </Tooltip>
        <Button type="success"
          ghost
          shape="circle"
          icon="md-paper-plane"
          @click="submitWithDependence"
          class="margin-left-10"
          :loading="submitting" />
      </div>
      <!--
      <Tree :data="children" show-checkbox />
      -->
    </Modal>
  </Modal>
</template>

<script>

const columnList = [
  {
    title: '选择执行',
    align: 'center',
    headerAlign: 'center',
    key: 'checked',
    width: '100px',
    type: 'template',
    template: 'choose'
  },
  {
    title: '任务名',
    key: 'name',
    minWidth: '500px'
  },
  {
    title: '负责人',
    key: 'username',
    align: 'center',
    headerAlign: 'center',
    width: '100px'
  },
  {
    title: '任务类型',
    key: 'taskTypeName',
    align: 'center',
    headerAlign: 'center',
    width: '100px'
  }
]

import * as formatter from '@/libs/format'
import * as taskApi from '@/api/task'

export default {
  name: 'kickoff-task',
  components: {
  },
  props: {
    value: Boolean,
    id: Number,
    recordId: {
      type: Number,
      default: 0
    },
    cronExpr: {
      type: String,
      default: ''
    },
    defaultFireTime: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      showing: false,
      submitting: false,
      startTime: new Date(),
      fireTime: new Date(),
      execType: 'immediate',
      execTimes: 'single',
      dateRange: [],
      options: {
        disabledDate (date) {
          return date && date.valueOf() < Date.now() - 86400000
        }
      },
      page: 1,
      size: 24,
      fireTimeCheckList: [],
      dataList: [],
      hasChild: false,
      choosingChild: false,
      columnList: columnList,
      tableList: [],
      checkAllJobs: false,
      dependenceCheckList: []
    }
  },
  methods: {
    validate () {
      if (this.execType !== 'immediate' && this.startTime === '') {
        this.$Message.error('时间格式有误，请重新输入。')
        return false
      }
      if (this.execTimes === 'single' && this.fireTime === '') {
        this.$Message.error('时间格式有误，请重新输入。')
        return false
      }
      if (this.execTimes === 'batch' && this.fireTimeCheckList.length === 0) {
        this.$Message.error('请选择计划时间。')
        return false
      }
      return true
    },
    ok () {
      if(!this.validate()) return
      if (this.hasChild) this.choosingChild = true
      else this.submitSingle()
    },
    async submitSingle () {
      const jobId = this.id
      const startTime = this.execType === 'immediate' ? new Date() : this.startTime
      let data = []
      if (this.execTimes === 'single') {
        data.push({
          jobId,
          recordId: this.recordId,
          startTime,
          fireTime: this.fireTime
        })
      } else {
        data = this.fireTimeCheckList.map(e => {
          return { jobId, startTime, fireTime: new Date(e) }
        })
      }

      this.submitting = true
      const result = await taskApi.runTask(data)
      this.submitting = false
      if (result.code !== 0) {
        this.$Message.error(result.msg)
        return
      }
      this.$Message.success('操作成功')
      this.$emit('onSubmit')
      this.close()
    },
    async submitWithDependence () {
      const jobId = this.tableList[0].id
      if (this.execTimes === 'single') {
        const fireTime = this.fireTime
        this.dependenceCheckList = [{ jobId, fireTime }]
      } else {
        this.dependenceCheckList = this.fireTimeCheckList.map(fireTime => {
          return { jobId, fireTime }
        })
      }
      this.fillDependenceCheckList(this.tableList[0].children)

      this.submitting = true
      const result = await taskApi.runTask(this.dependenceCheckList)
      this.submitting = false
      if (result.code !== 0) {
        this.$Message.error(result.msg)
        return
      }
      this.$Message.success('操作成功')
      this.$emit('onSubmit')
      this.close()
    },
    fillDependenceCheckList (children) {
      children.forEach(e => {
        if (e.checked) {
          const item = this.dependenceCheckList.find(job => job.jobId === e.id)
          if(item) item.dependOnJobIds += ',' + e.parentId
          else {
            const item = {
              jobId: e.id,
              dependOnJobIds: e.parentId.toString()
            }
            this.dependenceCheckList.push(item)
          }
        }
        if (e.children) this.fillDependenceCheckList(e.children)
      })
    },
    close () {
      this.choosingChild = false
      this.$emit('input', false)
    },
    checkAllFireTime () {
      if (this.indeterminate) {
        this.fireTimeCheckList = Object.assign([], this.dataList)
      } else {
        this.fireTimeCheckList = this.isCheckedAll ? [] : Object.assign([], this.dataList)
      }
    },
    async getChild () {
      this.submitting = true
      const result = await taskApi.getChildTask(this.id)
      this.submitting = false
      if (result.code !== 0) {
        this.hasChild = false
        this.tableList = []
        return
      }
      this.hasChild = true
      this.tableList = result.data
      this.tableList[0].disabled = true
    },
    async getData () {
      if(this.dateRange[0] === '') return
      this.fireTimeCheckList = []
      this.page = 1

      const data = {
        cronExpr: this.cronExpr,
        startTime: formatter.formatDateTime(this.dateRange[0]),
        endTime: formatter.formatDate(this.dateRange[1]) + ' 23:59:59'
      }

      this.$Loading.start()
      const result = await taskApi.checkCronExpr(data)
      if (result.code !== 0) {
        this.$Loading.error()
        this.$Message.error('Cron表达式有误，无法获取批量执行时间。')
        return
      }
      this.$Loading.finish()
      this.dataList = result.data.map(e => formatter.formatDateTime(e))
      if (this.dataList.length == 0) {
        this.$Message.error('未检测到该区间内有计划执行任务。')
      }
    },
    clickCell (row, rowIndex, column, columnIndex, $event) {
      if(column.key !== 'checked') return
      if(row.parentId === 0) return
      row.checked = !row.checked
      // 需要手动更新children
      this.flushChild(row)
    },
    flushChild (item, children) {
      let result = false
      const list = children ? children : this.tableList[0].children
      list.forEach((e, index) => {
        if(e.id === item.id && e.parentId === item.parentId) {
          list.splice(index, 1, item)
          result = item.checked
          // 如果取消选中，将子节点全部取消选择
          if(!result && e.children){
            e.children.forEach(e1 => {
              e1.checked = false
              this.flushChild(e1, e.children)
            })
          }
        } else if (e.children) {
          const checked = this.flushChild(item, e.children)
          // 如果选择，将父节点也设置为选择
          if (!e.checked && checked) {
            e.checked = true
            this.flushChild(e)
          }
        }
      })
      return result
    },
    checkAllOrUncheck () {
      this.checkAllDownStream(this.tableList[0].children)
      this.checkAllJobs = !this.checkAllJobs
    },
    checkAllDownStream (children) {
      children.forEach((e, index) => {
        e.checked = this.checkAllJobs
        children.splice(index, 1, e)
        if(e.children) this.checkAllDownStream(e.children)
      })
    }
  },
  mounted () {
  },
  created () {
  },
  computed: {
    indeterminate () {
      return this.fireTimeCheckList.length > 0 && this.dataList.length !== this.fireTimeCheckList.length
    },
    isCheckedAll () {
      return this.fireTimeCheckList.length > 0 && this.dataList.length === this.fireTimeCheckList.length
    },
    startOffset () {
      return this.size * (this.page - 1)
    },
    endOffset () {
      return this.size * this.page
    }
  },
  watch: {
    value (value) {
      this.showing = value
      if(!value) return
      this.execType = 'immediate'
      this.execTimes = 'single'
      this.startTime = new Date()
      this.fireTime = this.defaultFireTime === '' ? new Date() : new Date(this.defaultFireTime)
      this.submitting = false
      this.hasChild = false
      this.choosingChild = false
      this.checkAllJobs = false
      this.dataList = []
      this.dateRange = []
      this.fireTimeCheckList = []
      this.tableList = []
      this.page = 1
      // this.getChild()
    }
  }
}

</script>


<style lang="less">
.dragable-table td {
    height: 32px;
}
</style>
