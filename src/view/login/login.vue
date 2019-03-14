<style lang="less">
  @import './login.less';
</style>

<template>
  <div class="login">
    <div class="login-con">
      <Card icon="md-log-in" title="欢迎登录" :bordered="false">
        <div class="form-con">
          <login-form @on-success-valid="handleSubmit"></login-form>
          <p class="login-tip">
            忘了密码？<Divider type="vertical" />注册新帐号<Divider type="vertical" />意见反馈
          </p>
        </div>
      </Card>
    </div>
  </div>
</template>

<script>
import LoginForm from '_c/login-form'
import { mapActions } from 'vuex'
export default {
  components: {
    LoginForm
  },
  methods: {
    ...mapActions([
      'handleLogin'
    ]),
    async handleSubmit ({ username, password }) {
      this.$Message.loading({
        content: '登录中...',
        duration: 0
      })
      const data = await this.handleLogin({ username, password })
      if (data.code === 0) {
        this.$router.push({
          name: this.$config.homeName
        })
      } else {
        this.$Message.destroy()
        this.$Message.error(data.msg)
      }
    }
  }
}
</script>

<style>

</style>
