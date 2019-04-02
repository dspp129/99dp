import { getUnreadCount } from '@/api/message'
import { login, logout, getUserInfo, getRealNameList } from '@/api/user'
import { getDbType, getAllConnectionList } from '@/api/metadata'
import { getTaskType } from '@/api/task'
import { clearCookies, getToken } from '@/libs/util'
import { Notice } from 'iview'

export default {
  state: {
    username: '',
    realName: '',
    userId: '',
    email: '',
    avatarImgPath: '',
    token: getToken(),
    access: '',
    hasUserInfo: false,
    unreadCount: 0,
    userList: [],
    dbTypeList: [],
    taskTypeList: [],
    taskList: [],
    connectionList: []
  },
  mutations: {
    setAvatar (state, avatarPath) {
      state.avatarImgPath = avatarPath
    },
    setUserId (state, id) {
      state.userId = id
    },
    setUsername (state, name) {
      state.username = name
    },
    setRealName (state, name) {
      state.realName = name
    },
    setEmail (state, email) {
      state.email = email
    },
    setAccess (state, access) {
      state.access = access
    },
    setHasUserInfo (state, status) {
      state.hasUserInfo = status
    },
    setUserList (state, list) {
      state.userList = list
    },
    setDbTypeList (state, list) {
      state.dbTypeList = list
    },
    setTaskTypeList (state, list) {
      state.taskTypeList = list
    },
    setConnectionList (state, list) {
      state.connectionList = list
    },
    setUnreadCount (state, count) {
      state.unreadCount = count
    },
    setTask (state, task) {
      const index = state.taskList.findIndex(_ => _.jobId === task.jobId)
      if (index > -1) {
        state.taskList.splice(index, 1, task)
      } else {
        state.taskList.push(task)
      }
    },
    removeTask (state, id) {
      const index = state.taskList.findIndex(_ => _.jobId === id)
      if (index > -1) {
        state.taskList.splice(index, 1)
      }
    },
    clearTask (state, taskType) {
      let index = state.taskList.findIndex(_ => _.task.dwTask.taskType === taskType)
      while (index > -1) {
        state.taskList.splice(index, 1)
        index = state.taskList.findIndex(_ => _.task.dwTask.taskType === taskType)
      }
    }
  },
  getters: {
  },
  actions: {
    // 登录
    async handleLogin ({ commit }, { username, password }) {
      username = username.trim()
      const data = await login({ username, password })
      if (data.code === 0) {
        commit('setHasUserInfo', false)
        commit('setUsername', data.username)
        commit('setUserId', data.id)
      }
      return data
    },
    // 退出登录
    async handleLogOut ({ state, commit }) {
      commit('setHasUserInfo', false)
      commit('setAccess', [])
      try {
        const result = await logout()
        return result
      } catch (err) {
        console.log(err)
      }
      clearCookies()
    },
    // 获取用户相关信息
    async getUserInfo ({ state, commit }) {
      const { data } = await getUserInfo()
      data.access = ['admin']
      const department = data.department
      if (typeof department === 'string' && department.startsWith('技术研发中心_基础产品研发部_数据技术服务组')) {
        data.access.push('super_admin')
      }
      commit('setAvatar', 'https://i2.wp.com/coding.memory-forest.com/wp-content/uploads/2011/07/github.png')
      commit('setUsername', data.username)
      commit('setRealName', data.realName)
      commit('setEmail', data.email)
      commit('setUserId', data.id)
      commit('setAccess', data.access)
      commit('setHasUserInfo', true)
      return data
    },
    // 获取用户列表
    async getUserList ({ state, commit }) {
      const { data } = await getRealNameList()
      commit('setUserList', data)
      return data
    },
    // 获取数据库类型列表
    async getDbTypeList ({ state, commit }) {
      const { data } = await getDbType()
      commit('setDbTypeList', data)
      return data
    },
    // 获取任务类型列表
    async getTaskTypeList ({ state, commit }) {
      const { data } = await getTaskType()
      commit('setTaskTypeList', data)
      return data
    },
    // 获取数据库连接列表
    async getConnectionList ({ state, commit }) {
      const { data } = await getAllConnectionList()
      commit('setConnectionList', data)
      return data
    },
    // 此方法用来获取未读消息条数，接口只返回数值，不返回消息列表
    async getUnreadCount ({ state, commit }) {
      const { data } = await getUnreadCount()
      const newCount = data - state.unreadCount
      if (newCount > 0) {
        Notice.open({
          title: '您有' + newCount + '条新的未读消息'
        })
      }
      commit('setUnreadCount', data)
    }
  }
}
