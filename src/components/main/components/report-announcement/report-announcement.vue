<template>
  <div class="full-screen-btn-con">
    <Tooltip content="报表公告" placement="bottom">
      <Icon @click.native="showAnnouncement" type="md-notifications" :size="22" />
    </Tooltip>
    <Modal v-model="modal" class-name="modal-vertical-center" width="600" title="公告详情">
      <div slot="footer">
        <span v-if="level > 0" class="float-left"><i>该公告将显示在报表邮件的上方</i></span>
        <Button shape="circle" icon="md-close" @click="modal = false" />
        <Button type="success"
          ghost
          shape="circle"
          icon="md-checkmark"
          @click="saveAnnouncement"
          class="margin-left-10"
          :loading="submitting" />
      </div>
      <Row type="flex" justify="center" align="middle" class="margin-top-20 margin-bottom-10">
        <Spin size="large" fix v-if="spin" />
        <Select v-model="level" class="margin-right-10" style="width:100px;">
          <Option :value="1">正 常</Option>
          <Option :value="2">警 告</Option>
          <Option :value="3">错 误</Option>
          <Option :value="4">通 知</Option>
          <Option :value="0">关 闭</Option>
        </Select>
        <Input v-model="content" :disabled="!level" placeholder="今日某业务线数据异常，工程师正拼了老命抢修中..." style="width: 300px;" />
      </Row>
      <Row v-if="level > 0" type="flex" justify="center" align="middle" class="margin-top-10">
        <span class="margin-right-10" style="text-align:right; width:100px;">效果展示：</span>
        <Alert style="width:300px;" :type="contentType">{{content}}&nbsp;</Alert>
      </Row>
    </Modal>
  </div>
</template>

<!--

<Icon type="md-notifications-outline" />
<Icon type="md-notifications-off" />
<Icon type="md-notifications" />

-->
<script>

import * as taskApi from '@/api/task'

export default {
  name: 'report-announcement',
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      modal: false,
      spin: false,
      submitting: false,
      level: 1,
      content: ''
    }
  },
  methods: {
    showAnnouncement () {
      this.modal = true
      this.loadAnnouncement()
    },
    async loadAnnouncement () {
      this.spin = true
      const result = await taskApi.findAnnouncement()
      this.spin = false
      if (result.code !== 0) {
        this.$Message.error(result.msg)
        return
      }
      const announcement = result.data
      this.level = announcement.level
      this.content = announcement.content
    },
    async saveAnnouncement () {
      this.submitting = true
      const data = {
        level: this.level,
        content: this.content
      }
      this.$Loading.start()
      const result = await taskApi.saveAnnouncement(data)
      this.submitting = false
      if (result.code !== 0) {
        this.$Loading.error()
        this.$Message.error(result.msg)
        return
      }
      this.$Loading.finish()
      this.$Message.success('操作成功')
      this.modal = false
    }
  },
  computed: {
    contentType () {
      switch (this.level) {
        case 1: return 'success'
        case 2: return 'warning'
        case 3: return 'error'
        case 4: return 'info'
        default: return 'info'
      }
    }
  }
}

</script>
