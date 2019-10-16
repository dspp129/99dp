<template>
  <Card dis-hover shadow>
    <Row class="message-page">
      <Col span="4">
        <Menu width="auto" active-name="unread" @on-select="handleSelect">
          <MenuItem name="unread">
            <span class="category-title">未读消息</span>
            <Badge :count="unreadCount" />
          </MenuItem>
          <MenuItem name="readed">
            <span class="category-title">已读消息</span>
            <Badge class-name="gray-dadge" :count="messageReadedCount" />
          </MenuItem>
          <MenuItem name="trash">
            <span class="category-title">回收站</span>
            <Badge class-name="gray-dadge" :count="messageTrashCount" />
          </MenuItem>
        </Menu>
      </Col>

      <Col span="6" class="message-content">
        <Scroll :distance-to-edge="15" :on-reach-bottom="handleReachBottom"
          :height="scrollHeight"
          :loading-text="loadingText">
          <Alert v-if="currentMessageType === 'trash' && messageList.length > 0 "
            class="margin-left-10 margin-right-10"
            type="warning"
            show-icon
            >回收站消息将于十天后自动清除</Alert>
          <Spin fix v-if="loadingList" size="large" />
          <div @mouseenter="showScroll = true" @mouseleave="showScroll = false">
            <Menu
              width="auto"
              :class="titleClass"
              @on-select="handleView">
              <transition-group name="slide-fade">
              <MenuItem v-for="item in messageList" :name="item.id" :key="`msg_${item.id}`">
                <p class="msg-title">{{ item.title }}</p>
                <Badge :status="item.id === showingMsgItem.id ? 'processing' : 'default' " :text="item.createTime" />
                <Button
                  :style="{ float: 'right', display: item.loading ? 'inline-block !important' : '' }"
                  :loading="item.loading"
                  size="small"
                  type="text"
                  shape="circle"
                  :icon="currentMessageType !== 'trash' ? 'md-trash' : 'md-undo'"
                  :title="currentMessageType !== 'trash' ? '删除' : '还原'"
                  v-show="currentMessageType !== 'unread'"
                  @click.native.stop="removeMsg(item)" />
              </MenuItem>
              </transition-group>
            </Menu>
          </div>
        </Scroll>
      </Col>
      <Col span="14" :style="{minHeight: scrollHeight + 'px'}">
        <Spin fix v-if="loadingContent" size="large" />
        <div class="margin-left-20 margin-top-10" v-if="showingMsgItem">
          <h3>{{ showingMsgItem.title }}</h3>
          <span>{{showingMsgItem.createTime}}</span>
          <pre class="margin-top-20">{{showingMsgItem.content}}</pre>
        </div>
      </Col>
    </Row>
  </Card>
</template>

<script>

import { mapMutations, mapState } from 'vuex'
import * as formatter from '@/libs/format'
import * as messageApi from '@/api/message'

const listDic = {
  unread: 'messageUnreadList',
  readed: 'messageReadList',
  trash: 'messageTrashList'
}

export default {
  name: 'message-list',
  data () {
    return {
      messageUnreadList: [],
      messageReadList: [],
      messageTrashList: [],

      loadingList: true,
      loadingContent: false,
      currentMessageType: 'unread',
      showingMsgItem: {},
      showScroll: false

    }
  },
  computed: {
    ...mapState({
      scrollHeight: state => state.app.fullHeight - 160
    }),
    unreadCount () {
      return this.$store.state.user.unreadCount
    },
    messageList () {
      return this[listDic[this.currentMessageType]]
    },
    titleClass () {
      return {
        'not-unread-list': this.currentMessageType !== 'unread'
      }
    },
    loadingText () {
      return this.messageList.length < 10 ? '爱护鼠标，人人有责' : '加载中...'
    },
    messageReadedCount () {
      return this.messageReadList.length
    },
    messageTrashCount () {
      return this.messageTrashList.length
    }
  },
  methods: {
    ...mapMutations([
      'setUnreadCount'
    ]),
    moveMsg ({ from, to, id }) {
      const index = this[from].findIndex(_ => _.id === id)
      const msgItem = this[from].splice(index, 1)[0]
      msgItem.loading = false
      this[to].unshift(msgItem)
    },
    // 获取消息列表，其中包含未读、已读、回收站三个列表
    async getMessageList () {
      this.loadingList = true
      const result = await messageApi.getMessage()
      this.loadingList = false
      if (result.code !== 0) return

      this.messageUnreadList = []
      this.messageReadList = []
      this.messageTrashList = []
      result.data.sort((a, b) => b.createTime - a.createTime).forEach(mes => {
        mes.loading = false
        mes.createTime = formatter.formatDateTime(mes.createTime)
        switch (mes.status) {
          case 0 : this.messageUnreadList.push(mes); break
          case 1 : this.messageReadList.push(mes); break
          case 2 : this.messageTrashList.push(mes); break
          default: break
        }
      })
      this.setUnreadCount(this.messageUnreadList.length)
    },
    // 把一个未读消息标记为已读
    async hasRead (id) {
      const result = await messageApi.hasRead(id)
      if (result.code !== 0) return
      this.moveMsg({
        from: 'messageUnreadList',
        to: 'messageReadList',
        id
      })
      this.setUnreadCount(this.unreadCount - 1)
    },
    // 删除一个已读消息到回收站
    async moveToTrash (id) {
      const result = await messageApi.moveToTrash(id)
      if (result.code !== 0) return
      this.moveMsg({
        from: 'messageReadList',
        to: 'messageTrashList',
        id
      })
    },
    // 还原一个已删除消息到已读消息
    async restoreTrash (id) {
      const result = await messageApi.restoreTrash(id)
      if (result.code !== 0) return
      this.moveMsg({
        from: 'messageTrashList',
        to: 'messageReadList',
        id
      })
    },
    handleSelect (name) {
      this.currentMessageType = name
      this.showingMsgItem = {}
    },
    // 根据当前点击的消息的id获取内容
    handleView (id) {
      /*
      this.loadingContent = true
      const result = await messageApi.getContentByMsgId(id)
      this.loadingContent = false
      */
      this.showingMsgItem = this.messageList.find(item => item.id === id)
    },
    removeMsg (item) {
      item.loading = true
      if (this.currentMessageType !== 'trash') {
        this.moveToTrash(item.id)
      } else {
        this.restoreTrash(item.id)
      }
    },
    handleReachBottom () {
      this.$Message.success('到底啦')
    }
  },
  mounted () {
    // 请求获取消息列表
    this.getMessageList()
  },
  created () {
  },
  watch: {
    showingMsgItem (newItem, oldItem) {
      const item = this.messageUnreadList.find(item => item.id === oldItem.id)
      if (item) this.hasRead(oldItem.id)
    },
    showScroll (show) {
      const x = document.getElementsByClassName('ivu-scroll-container')
      x[0].style.overflowY = show ? 'auto' : 'hidden'
    }
  }
}
</script>

<style lang="less">

.message-page{
  .ivu-scroll-container{
    overflow-y: hidden;
    overflow-x: hidden;
    &::-webkit-scrollbar {/*滚动条整体样式*/
        width: 2px;     /*高宽分别对应横竖滚动条的尺寸*/
        height: 1px;
    }
    &::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
        border-radius: 10px;
         -webkit-box-shadow: inset 0 0 2px rgba(0,0,0,0.2);
        background: #535353;
    }
    &::-webkit-scrollbar-track {/*滚动条里面轨道*/
        -webkit-box-shadow: inset 0 0 2px rgba(0,0,0,0.2);
        border-radius: 10px;
        background: #e6e6e6;
    }
    .ivu-scroll-loader-wrapper{
      padding: 0px;
    }
  }
  .message-content{
    border-right: 1px solid #e6e6e6;
  }
  .gray-dadge{
    background: gainsboro;
  }
  .category-title{
    display: inline-block;
    width: 80px;
  }
  .not-unread-list{
    .msg-title{
      color: rgb(170, 169, 169);
    }
    .ivu-menu-item{
      .ivu-btn.ivu-btn-text.ivu-btn-small.ivu-btn-icon-only{
        display: none;
      }
      &:hover{
        .ivu-btn.ivu-btn-text.ivu-btn-small.ivu-btn-icon-only{
          display: inline-block;
        }
      }
    }
  }
  .ivu-alert.ivu-alert-with-icon {
    padding: 8px 20px 8px 38px;
  }
  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    font-size:8px;
  }
  /* 可以设置不同的进入和离开动画 */
  /* 设置持续时间和动画函数 */
  .slide-fade-leave-active {
    transition: all .4s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  }
  .slide-fade-leave-to
  /* .slide-fade-leave-active for below version 2.1.8 */ {
    transform: translateX(-250px);
    opacity: 0;
  }
  .slide-fade-enter-active {
    transition: all .1s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  }
  .slide-fade-enter {
    transform: translateX(-40px);
    opacity: 0;
  }
}
</style>
