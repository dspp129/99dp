<template>
  <div class="user-avatar-dropdown">
    <Dropdown @on-click="handleClick">
      <Badge :dot="!!unreadCount">
        <Avatar :style="{background: color}">{{ realName }}</Avatar>
      </Badge>
      <Icon :size="18" type="md-arrow-dropdown"></Icon>
      <DropdownMenu slot="list">
        <DropdownItem name="message">
          消息中心<Badge class="margin-left-10" :count="unreadCount"></Badge>
        </DropdownItem>
        <DropdownItem name="changePassword">修改密码</DropdownItem>
        <DropdownItem name="personalInfo">个人信息</DropdownItem>
        <DropdownItem name="logout" divided>退出登录</DropdownItem>
      </DropdownMenu>
    </Dropdown>
    <Password v-model="modifyPassword" />
  </div>
</template>

<script>
import './user.less'
import { mapState, mapActions } from 'vuex'
import Password from './password'

const ColorList = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae']

export default {
  name: 'User',
  components: {
    Password
  },
  data () {
    return {
      reg: /^[\u4E00-\u9FA5]+$/,
      color: ColorList[parseInt(Math.random()*ColorList.length)],
      modifyPassword: false // 修改密码模态框显示
    }
  },
  methods: {
    ...mapActions([
      'handleLogOut'
    ]),
    openWindow () {
      this.modifyPassword = true
    },
    logout () {
      this.handleLogOut().then(() => {
        this.$router.push({
          name: 'login'
        })
      })
    },
    message () {
      this.$router.push({
        name: 'message-list'
      })
    },
    handleClick (name) {
      switch (name) {
        case 'logout': this.logout()
          break
        case 'message': this.message()
          break
        case 'changePassword': this.openWindow()
          break
        case 'personalInfo':
          this.$router.push({
            name: 'personal-info-page'
          })
          break
      }
    }
  },
  computed: {
    ...mapState({
      unreadCount: state => state.user.unreadCount
    }),
    realName () {
      const realName = this.$store.state.user.realName
      if (this.reg.test(realName) && realName.length > 2) return realName.substr(realName.length-2)
      else return realName
    }
  }
}
</script>
