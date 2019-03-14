<template>
  <Modal v-model="showing"
    :closable='false'
    :mask-closable=false
    :width="500"
    class-name="modal-vertical-center">
    <h3 slot="header" style="color:#2D8CF0">修改密码</h3>
    <Form ref="editPasswordForm" :model="editPasswordForm" :label-width="150" label-position="right" :rules="passwordValidate" class="margin-top-20" @submit.native.prevent>
      <FormItem label="原密码" prop="oldPass" :error="oldPassError">
        <div class="password-con">
          <Input v-model="editPasswordForm.oldPass" placeholder="请输入现在使用的密码" type="password" class="input-width" />
        </div>
      </FormItem>
      <FormItem label="新密码" prop="newPass">
        <div class="password-con">
          <Input v-model="editPasswordForm.newPass" placeholder="请输入新密码，至少6位字符" type="password" class="input-width" />
        </div>
      </FormItem>
      <FormItem label="确认新密码" prop="rePass">
        <div class="password-con">
          <Input v-model="editPasswordForm.rePass" placeholder="请再次输入新密码" type="password" class="input-width" />
        </div>
      </FormItem>
    </Form>
    <div slot="footer">
      <Button type="text" @click="closeWindow">取消</Button>
      <Button type="primary" :loading="savePassLoading" icon="md-checkmark" @click="savePassword">确定</Button>
    </div>
  </Modal>
</template>

<script>

import { changePassword } from '@/api/user'

export default {
  components: {
  },
  props: {
    value: Boolean
  },
  data () {
    const newPassord = (rule, value, callback) => {
      this.$refs.editPasswordForm.validateField('rePass')
      callback()
    }
    const validatePassword = (rule, value, callback) => {
      if (value !== this.editPasswordForm.newPass) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    }
    return {
      showing: false, // 修改密码模态框显示
      savePassLoading: false,
      oldPassError: '',
      editPasswordForm: {
        oldPass: '',
        newPass: '',
        rePass: ''
      },
      passwordValidate: {
        oldPass: [
          { required: true, message: '请输入原密码', trigger: 'blur' }
        ],
        newPass: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '请至少输入6个字符', trigger: 'blur' },
          { max: 32, message: '最多输入32个字符', trigger: 'blur' },
          { validator: newPassord, trigger: 'blur' }
        ],
        rePass: [
          { required: true, message: '请再次输入新密码', trigger: 'blur' },
          { validator: validatePassword, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    closeWindow () {
      this.savePassLoading = false
      this.$emit('input', false)
      this.$refs.editPasswordForm.resetFields()
    },
    async savePassword () {
      const valid = await this.$refs.editPasswordForm.validate()
      if (!valid) return
      this.$Loading.start()
      this.savePassLoading = true
      const password = this.editPasswordForm.oldPass
      const newPassword = this.editPasswordForm.newPass
      const result = await changePassword({ password, newPassword })
      this.savePassLoading = false
      if (result.code === 0) {
        this.$Loading.finish()
        this.$Message.success('修改成功')
        this.closeWindow()
      } else {
        this.$Loading.error()
        this.$Message.error(result.msg)
      }
    }
  },
  computed: {
  },
  watch: {
    value (value) {
      this.showing = value
    }
  }
}

</script>

<style lang="less">
.input-width {
  width: 200px !important;
}
</style>
