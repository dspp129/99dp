<template>
  <div>
    <Poptip confirm
      v-show="!!id"
      title="您确定要删除这个任务吗?"
      placement="top-end"
      @on-ok="remove">
      <Button ghost icon="md-close" type="error" size="small">删除</Button>
    </Poptip>
    <Button ghost
      v-show="!!id"
      type="primary"
      icon="md-paper-plane"
      :disabled="disabled"
      size="small"
      @click="showingModal = true"
      class="margin-left-10">执行</Button>
    <Button ghost
      type="success"
      icon="md-checkmark"
      :disabled="disabled"
      size="small"
      @click="save"
      class="margin-left-10">保存</Button>
    <KickoffTask :id="id" :cronExpr="cronExpr" v-model="showingModal" />
  </div>
</template>

<script>

import KickoffTask from '_c/kickoff-task'
import * as taskApi from '@/api/task'

export default {
  name: 'operation',
  components: {
    KickoffTask
  },
  props: {
    id: Number,
    disabled: Boolean,
    cronExpr: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      saveAble: this.disabled,
      showingModal: false
    }
  },
  methods: {
    async remove () {
      this.$Loading.start()
      const taskId = this.id
      const result = await taskApi.deleteTask(taskId)
      if (result.code !== 0) {
        this.$Loading.error()
        this.$Message.error('删除失败。' + result.msg)
        return
      }
      this.$Loading.finish()
      this.$Message.success('删除成功！')
      this.$emit('on-close')
    },
    save () {
      this.$emit('on-save')
    }
  }
}
</script>
