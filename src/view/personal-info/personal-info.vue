<style lang="less">
@import './personal-info.less';
</style>

<template>
  <div>
    <Card icon="md-person" title="个人信息" dis-hover shadow :style="{minHeight}">
      <Form
        ref="userForm"
        :model="userForm"
        :label-width="150"
        label-position="right"
        :rules="inforValidate">
        <FormItem label="用户名">
          <span>{{ userForm.username }}</span>
        </FormItem>
        <FormItem label="真实姓名" prop="realName">
          <Input v-model="userForm.realName" readonly style="width:204px;"/>
        </FormItem>
        <FormItem label="手机" prop="phone" >
            <Input v-model="userForm.phone" @on-keydown="hasChangePhone" style="width:204px;" />
            <!--
            <div style="display:inline-block;position:relative;">
                <Button @click="getIdentifyCode" :disabled="canGetIdentifyCode">{{ gettingIdentifyCodeBtnContent }}</Button>
                <div class="personal-info-input-identifycode-con" v-if="inputCodeVisible">
                    <div style="background-color:white;z-index:110;margin:10px;">
                        <Input v-model="securityCode" placeholder="请填写短信验证码" />
                        <div style="margin-top:10px;text-align:right">
                            <Button @click="cancelInputCodeBox">取消</Button>
                            <Button type="primary" @click="submitCode" :loading="checkIdentifyCodeLoading">确定</Button>
                        </div>
                    </div>
                </div>
            </div>
          -->
        </FormItem>
        <FormItem label="邮箱" prop="email">
          <Input v-model="userForm.email" readonly style="width:204px;"/>
        </FormItem>
        <FormItem label="QQ" prop="QQ" >
          <Input v-model="userForm.qq" style="width:204px;"/>
          <Tooltip placement="right" class="margin-left-10">
            <div slot="content">
              <p>填写QQ后，你所有开启失败通知的任务</p>
              <p>在失败后将同时通知你的QQ邮箱。</p>
            </div>
            <Icon type="ios-information-circle-outline" size="20" />
          </Tooltip>
          <Poptip trigger="hover" placement="right" class="margin-left-10">
            <div slot="content">
              <a href="http://kf.qq.com/touch/faq/150612YrMBvY150612YN3mUz.html" target="_blank">微信如何开启或关闭QQ邮箱提醒？</a>
            </div>
            <Icon type="ios-help-circle-outline" size="20" />
          </Poptip>
        </FormItem>
        <FormItem label="公司">
          <span>{{ userForm.company }}</span>
        </FormItem>
        <FormItem label="部门">
          <span>{{ userForm.department }}</span>
        </FormItem>
        <div>
          <Button type="text" style="width: 100px;" @click="cancelEditUserInfo">取消</Button>
          <Button type="primary" style="width: 100px;" :loading="save_loading" @click="saveEdit">保存</Button>
        </div>
      </Form>
    </Card>
  </div>
</template>

<script>

import * as userApi from '@/api/user'

export default {
  name: 'personal-info-page',
  data () {
    const validePhone = (rule, value, callback) => {
      var re = /^1[0-9]{10}$/
      if (!re.test(value)) {
        callback(new Error('请输入正确格式的手机号'))
      } else {
        callback()
      }
    }
    return {
      userForm: {
        username: '',
        realName: '',
        phone: '',
        email: '',
        qq: '',
        company: '',
        department: ''
      },
      uid: '', // 登录用户的userId
      securityCode: '', // 验证码
      phoneHasChanged: false, // 是否编辑了手机
      save_loading: false,
      identifyError: '', // 验证码错误
      identifyCodeRight: false, // 验证码是否正确
      hasGetIdentifyCode: false, // 是否点了获取验证码
      canGetIdentifyCode: false, // 是否可点获取验证码
      checkIdentifyCodeLoading: false,
      inforValidate: {
        realName: [ { required: true, message: '请输入姓名', trigger: 'blur' } ],
        phone: [
          { required: true, message: '请输入手机号码' },
          { validator: validePhone }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' }
        ]
      },
      inputCodeVisible: false, // 显示填写验证码box
      initPhone: '',
      gettingIdentifyCodeBtnContent: '获取验证码' // “获取验证码”按钮的文字
    }
  },
  methods: {
    async getIdentifyCode () {
      this.hasGetIdentifyCode = true
      const valid = await this.$refs['userForm'].validate()
      if (valid) {
        this.canGetIdentifyCode = true
        let timeLast = 60
        let timer = setInterval(() => {
          if (timeLast >= 0) {
            this.gettingIdentifyCodeBtnContent = timeLast + '秒后重试'
            timeLast -= 1
          } else {
            clearInterval(timer)
            this.gettingIdentifyCodeBtnContent = '获取验证码'
            this.canGetIdentifyCode = false
          }
        }, 1000)
        this.inputCodeVisible = true
        // you can write ajax request here
      }
    },
    cancelEditUserInfo () {
      this.$store.commit('removeTag', 'ownspace_index')
      localStorage.pageOpenedList = JSON.stringify(this.$store.state.app.pageOpenedList)
      let lastPageName = ''
      if (this.$store.state.app.pageOpenedList.length > 1) {
        lastPageName = this.$store.state.app.pageOpenedList[1].name
      } else {
        lastPageName = this.$store.state.app.pageOpenedList[0].name
      }
      this.$router.push({
        name: lastPageName
      })
    },
    async saveEdit () {
      const valid = await this.$refs['userForm'].validate()
      if (valid) {
        /*
        if (this.phoneHasChanged && this.userForm.phone !== this.initPhone) {
            // 手机号码修改过了而且修改之后的手机号和原来的不一样
            if (this.hasGetIdentifyCode) { // 判断是否点了获取验证码
                if (this.identifyCodeRight) { // 判断验证码是否正确
                    this.saveInfoAjax()
                } else {
                    this.$Message.error('验证码错误，请重新输入')
                }
            } else {
                this.$Message.warning('请先点击获取验证码')
            }
        } else {
            this.saveInfoAjax()
        }
        */
        this.saveUserInfo()
      }
    },
    async init () {
      const result = await userApi.getUserInfo()
      if (result.code !== 0) return
      const userInfo = result.data
      this.userForm.username = userInfo.username
      this.userForm.realName = userInfo.realName
      this.userForm.phone = userInfo.phone
      this.userForm.email = userInfo.email
      this.userForm.qq = userInfo.qq
      this.initPhone = userInfo.phone
      this.userForm.company = userInfo.company
      this.userForm.department = userInfo.department
    },
    cancelInputCodeBox () {
      this.inputCodeVisible = false
      this.userForm.phone = this.initPhone
    },
    submitCode () {
      this.checkIdentifyCodeLoading = true
      if (this.securityCode.length === 0) {
        this.$Message.error('请填写短信验证码')
      } else {
        setTimeout(() => {
          this.$Message.success('验证码正确')
          this.inputCodeVisible = false
          this.checkIdentifyCodeLoading = false
        }, 1000)
      }
    },
    hasChangePhone () {
      this.phoneHasChanged = true
      this.hasGetIdentifyCode = false
      this.identifyCodeRight = false
    },
    async saveUserInfo () {
      this.$Loading.start()
      this.save_loading = true

      const data = {
        realName: this.userForm.realName,
        phone: this.userForm.phone,
        email: this.userForm.email,
        qq: this.userForm.qq
      }
      const result = await userApi.updateUserInfo(data)
      this.save_loading = false
      if (result.code === 0) {
        this.$Loading.finish()
        this.$Message.success('保存成功')
      } else {
        this.$Loading.error()
        this.$Message.error('保存失败')
      }
    }
  },
  mounted () {
    this.init()
  },
  computed: {
    minHeight () {
      return this.$store.state.app.fullHeight + 'px'
    }
  }
}
</script>
