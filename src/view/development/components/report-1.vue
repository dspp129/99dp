<template>
  <Card dis-hover :style="{minHeight}">
    <Row type="flex" justify="center" align="top" class="margin-top-40">
      <Col span="12">
        <Form :label-width="180"
          ref="form1"
          :model="value"
          :rules="rules"
          @submit.native.prevent>
          <FormItem label="邮件标题" prop="subject">
            <Input v-model.trim="value.subject"
              icon="ios-email-outline"
              style="width: 230px;">
            </Input>
          </FormItem>
          <FormItem label="邮箱列表" prop="recipient">
            <Input v-model.trim="value.recipient"
              type="textarea"
              :autosize="{minRows: 5}"
              placeholder="多个邮箱请用换行分隔"
              style="width: 230px;">
            </Input>
          </FormItem>
          <FormItem label="发送形式">
            <RadioGroup v-model="value.attachmentType">
              <Radio :label="1" disabled>仅正文</Radio>
              <Radio :label="2" disabled>仅附件</Radio>
              <Radio :label="3" disabled>正文+附件</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="有效期" prop="expireDate">
            <DatePicker
              type="daterange"
              v-model="value.expireDate"
              :clearable="false"
              :editable="false"
              separator=" 至 "
              split-panels
              :options="expiredOptions"
              placeholder="请选择日期"
              style="width: 230px" />
          </FormItem>
        </Form>
      </Col>
      <Col span="12">
        <Form ref="form2"
          :rules="rules"
          :model="value"
          :label-width="80"
          @submit.native.prevent>
          <FormItem label="邮件正文">
            <Input v-model="value.content"
              type="textarea"
              :autosize="{minRows: 11}"
              style="width: 300px;" />
          </FormItem>
          <FormItem label="邮件试发" prop="testRecipient">
            <Input v-model="value.testRecipient" 
              icon="ios-mail-outline"
              placeholder="请输入试发邮箱地址"
              style="width: 270px;" />
            <Button
              ghost
              size="small"
              shape="circle"
              type="primary"
              icon="md-paper-plane"
              @click="sendEmail"
              class="margin-left-10" />
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
    const validateExpired = (rule, value, callback) => {
      if (this.value.expireDate[0] === '') {
        callback(new Error('请选择有效日期'))
        return
      }
      callback()
    }
    return {
      rules: {
        subject: [
          { required: true, message: '标题不能为空', trigger: 'blur' }
        ],
        recipient: [
          { required: true, message: '标题不能为空', trigger: 'blur' }
        ],
        expireDate: [
          { required: true, validator: validateExpired,  trigger: 'change' }
        ],
        testRecipient: [
          { required: true, message: '试发地址不能为空', trigger: 'none' }
        ]
      },
      expiredOptions: {
        shortcuts: [
          {
            text: '三个月',
            value () {
              const start = new Date()
              const end = new Date()
              end.setMonth(start.getMonth() + 3)
              return [start, end]
            }
          },
          {
            text: '六个月',
            value () {
              const start = new Date()
              const end = new Date()
              end.setMonth(start.getMonth() + 6)
              return [start, end]
            }
          },
          {
            text: '一年',
            value () {
              const start = new Date()
              const end = new Date()
              end.setFullYear(start.getFullYear() + 1)
              return [start, end]
            }
          },
          {
            text: '长期',
            value () {
              const start = new Date()
              const end = new Date('9999-12-31')
              return [start, end]
            }
          }
        ]
      }
    }
  },
  methods: {
    validate () {
      return this.$refs.form1.validate()
    },
    async sendEmail () {
      let valid = false
      this.$refs.form1.validateField('subject', data => { valid = data === '' })
      if (!valid) return
      this.$refs.form2.validateField('testRecipient', data => { valid = data === '' })
      setTimeout(() => {
        this.$refs.form2.resetFields()
      }, 3000)
      if (!valid) return
      this.$emit('on-test')
    }
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
