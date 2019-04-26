<template>
  <Card dis-hover :padding="0" :style="{minHeight}">
    <div slot="title">
      <Button type="text" @click="moveLeft" icon="ios-arrow-back" size="small" :disabled="value.position === 1">前 移</Button>
      <Divider type="vertical" />
      <Input size="small"
        v-model="value.name"
        placeholder="请输入表格名称"
        class="margin-left-10 margin-right-10"
        style="width:230px;"/>
      <Divider type="vertical" />
      <Select
        v-model="value.dbType"
        placeholder="数据库类型"
        size="small"
        @on-change="changeDbType"
        class="margin-left-10"
        style="width:120px;" >
        <Option v-for="item in dbTypeList" :value="item.id" :key="item.id">{{ item.name }}</Option>
      </Select>
      <Select ref="connectionSelector"
        clearable
        v-model="value.connectionId"
        size="small"
        placeholder="数据库连接"
        class="margin-left-10 margin-right-10"
        style="width:170px;">
        <Option v-for="item in connectionList" :value="item.id" :key="item.id" v-if="item.dbType === value.dbType">{{item.name}}</Option>
      </Select>
      <Divider type="vertical" />
      <Tooltip placement="top" :delay="1000">
        <div slot="content">
          <p>运行选中语句</p>
          <p>快捷键 F8</p>
        </div>
        <Button type="text"
          icon="md-play"
          size="small"
          @click="runQuery">运 行</Button>
      </Tooltip>
    </div>
    <Button slot="extra" type="text" @click="moveRight" size="small" >
      <span>后 移
        <Icon type="ios-arrow-forward" class="margin-left-5" />
      </span>
    </Button>
    <SqlEditor ref="SqlEditor"
      v-model="value.content"
      :height="editorHeight" />
    <Modal v-model="fullScreen"
      fullscreen
      footer-hide
      class-name="full-screen-modal"
      title="运行结果" >
      <HotTable 
        :data="presentData"
        :columns="presentColumns" />
    </Modal>
  </Card>
</template>

<script>

import HotTable from '_c/hot-table'
import SqlEditor from '_c/sql-editor'
import * as adHocApi from '@/api/adhoc'

export default {
  name: 'report-2',
  components: {
    HotTable,
    SqlEditor
  },
  props: {
    value: Object
  },
  data () {
    return {
      running: false,

      dbTypeList: this.$store.state.user.dbTypeList,
      connectionList: this.$store.state.user.connectionList,

      presentColumns: [],
      presentData: [],

      fullScreen: false,
      pressF8: e => {
        if (e.code === 'F8') this.runQuery()
      }
    }
  },
  methods: {
    async runQuery () {
      if (this.value.content.trim() === '') {
        this.$Message.error('执行语句不能为空')
        return
      }
      const connectionId = this.value.connectionId
      if (!connectionId > 0) {
        this.$Message.error('请选择数据库连接')
        return
      }
      const data = {
        connectionId,
        dbType: this.value.dbType,
        query: this.value.content,
        async: false
      }
      this.$Loading.start()
      const result = await adHocApi.runQuery(data)
      if (result.code !== 0) {
        this.$Loading.error()
        this.presentColumns = ['error_msg']
        this.presentData = [{ 'error_msg' : result.msg }]
      } else {
        this.presentColumns = result.data.columns
        this.presentData = result.data.rows
        this.$Loading.finish()
        this.$Message.success('提交成功')
      }
      this.fullScreen = true
    },
    changeDbType () {
      this.$refs.connectionSelector.clearSingleSelect()
    },
    moveLeft () {
      this.$emit('on-move-forward')
    },
    moveRight () {
      this.$emit('on-move-backward')
    }
  },
  activated () {
    document.addEventListener('keyup', this.pressF8)
  },
  deactivated () {
    document.removeEventListener('keyup', this.pressF8)
  },
  mounted () {
  },
  created () {
  },
  computed: {
    minHeight () {
      return this.$store.state.app.fullHeight - 80 + 'px'
    },
    editorHeight () {
      return this.$store.state.app.fullHeight - 135
    },
    runnable () {
      return this.value.content.toLowerCase().indexOf('rownum') > 0 ||
             this.value.content.toLowerCase().indexOf('limit') > 0 ||
             this.value.content.toLowerCase().indexOf('top') > 0
    }
  },
  watch: {
    'value.taskId' () {
      this.$refs.SqlEditor.resize()
    },
    position () {
      this.$refs.SqlEditor.resize()
    }
  }
}
</script>
