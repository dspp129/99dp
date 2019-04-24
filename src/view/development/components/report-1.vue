<template>
  <Card dis-hover :style="{minHeight}">
    <Row type="flex" justify="center" align="top" class="margin-top-40">
      <Col span="12">
        <Form :label-width="180" @submit.native.prevent>
          <FormItem label="邮件标题" required>
            <Input v-model="value.subject"
              icon="ios-email-outline"
              style="width: 260px;">
            </Input>
          </FormItem>
          <FormItem label="邮箱列表" required>
            <Input v-model="value.recipient"
              type="textarea"
              :autosize="{minRows: 5}"
              placeholder="多个邮箱请用换行分隔"
              style="width: 260px;">
            </Input>
          </FormItem>
          <FormItem label="发送形式">
            <RadioGroup v-model="value.attachmentType">
              <Radio :label="1">仅正文</Radio>
              <Radio :label="2">仅附件</Radio>
              <Radio :label="3">正文+附件</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="有效期">
            <DatePicker type="datetimerange" format="yyyy-MM-dd" placeholder="请选择日期" style="width: 260px" />
          </FormItem>
        </Form>
      </Col>
      <Col span="12">
        <Form :label-width="80" @submit.native.prevent>
          <FormItem label="邮件正文">
            <Input v-model="value.content"
              type="textarea"
              :autosize="{minRows: 11}"
              style="width: 300px;" />
          </FormItem>
          <FormItem label="邮件试发">
            <Input v-model="value.testRecipient" 
              icon="ios-mail-outline"
              placeholder="请输入试发邮箱地址"
              style="width: 270px;" />
            <Button size="small" :loading="true" shape="circle" icon="md-paper-plane" ghost type="primary" class="margin-left-10" />
          </FormItem>
        </Form>
      </Col>
    </Row>
  </Card>
</template>

<script>

export default {
  name: 'report-1',
  components: {
  },
  props: {
    value: Object
  },
  data () {
    return {
    }
  },
  methods: {

  },
  mounted () {
  },
  created () {
  },
  computed: {
    minHeight () {
      return this.$store.state.app.fullHeight - 80 + 'px'
    }
  }
}
</script>
