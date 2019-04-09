<template>
  <Row type="flex" justify="center" :style="{alignItems: 'center' , minHeight}">
    <Form label-position="right"
      :label-width="70"
      :model="value"
      :rules="ruleScheduler"
      @submit.native.prevent>
      <FormItem label="创建人">
        <Select v-model="value.userId" style="width:100px">
          <Option v-for="user in userList" :value="user.id" :key="user.id">{{user.realName}}</Option>
        </Select>
      </FormItem>
      <FormItem label="任务名称" prop="jobName">
        <Input style="width: 280px;"
          v-model.trim="value.jobName"
          @on-change="onChange"
          :icon="icon">
        </Input>
      </FormItem>
      <FormItem label="任务描述">
        <Input style="width: 280px;" type="textarea" v-model.trim="value.comment" :autosize="{minRows: 10}" />
      </FormItem>
    </Form>
  </Row>
</template>

<script>

import * as taskApi from '@/api/task'

export default {
  name: 'task-desc',
  props: {
    value: Object
  },
  data () {
    const validateName = async (rule, value, callback) => {
      const data = {
        name: value,
        id: this.value.jobId
      }
      const result = await taskApi.checkTaskName(data)
      if (result.code === 0) {
        this.nameIsValid = true
        callback()
      } else {
        this.nameIsValid = false
        callback(new Error(result.msg))
      }
    }
    return {
      nameIsValid: false,
      userList: this.$store.state.user.userList,
      ruleScheduler: {
        jobName: [
          { required: true, message: '请输入任务名称', trigger: 'blur' },
          { validator: validateName, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    onChange () {
      this.nameIsValid = null
    }
  },
  created () {
  },
  mounted () {
  },
  computed: {
    minHeight () {
      return this.$store.state.app.fullHeight - 80 + 'px'
    },
    icon () {
      if (this.value.jobName === '') return ''
      if (this.nameIsValid === null) return ''
      if (this.nameIsValid) return 'md-checkmark'
      else return 'md-close'
    }
  },
  watch: {
    'value.jobId' () {
    },
    nameIsValid (valid) {
      this.$emit('on-change-name', valid)
    }
  }
}

</script>
