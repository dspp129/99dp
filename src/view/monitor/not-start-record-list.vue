<style>
    .demo-load-more {
        text-align: center;
        color: #2d8cf0;
    }
    .demo-spin-icon-load {
        margin-top: 20px;
        animation: ani-demo-spin 1s linear infinite;
    }
    @keyframes ani-demo-spin {
        from { transform: rotate(0deg);}
        50%  { transform: rotate(180deg);}
        to   { transform: rotate(360deg);}
    }
</style>
<template>
  <div>
    <Row>
      <div style="float: left">
        <Select
          v-model.number="userId"
          @on-change="resetSearch"
          clearable
          placeholder="所有人..."
          style="width:120px">
          <Option v-for="item in userList" :value="item.id" :key="item.id">{{item.realName}}</Option>
        </Select>
        <Select
          v-model.number="taskType"
          ref="taskType"
          @on-change="resetSearch"
          clearable
          placeholder="所有类型..."
          class="margin-left-5"
          style="width:120px">
          <Option v-for="item in taskTypeList" :value="item.id" :key="item.id">{{item.description}}</Option>
        </Select>
        <Select
          v-model="warning"
          ref="warning"
          @on-change="resetSearch"
          clearable
          placeholder="失败通知"
          class="margin-left-5"
          style="width:120px">
          <Option :value="0">无通知</Option>
          <Option :value="1">邮件通知</Option>
        </Select>
        <Input search
          v-model="keyword"
          placeholder="请输入任务名称..."
          @on-search="resetSearch"
          class="margin-left-5"
          style="width: 230px" />
        <Button shape="circle" icon="md-sync" @click="resetFilter" class="margin-left-5" />
      </div>
      <Button style="float: right" ghost type="success" icon="md-download" @click="exportExcel" class="margin-left-10">导出Excel</Button>
    </Row>
    <Row class="margin-top-8">
      <Table stripe
        :columns="columnList"
        :data="taskList"
        :loading="loadingTable"
        size="small"/>
    </Row>
    <Row class="margin-top-10">
      <Col span="8" offset="8">
        <template v-if="loadingTable">
          <Spin fix>
            <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
            <div>加载中...</div>
          </Spin>
        </template>
        <template v-else>
          <template v-if="taskList.length === total">
            <div class="demo-load-more">
              <span>我是有底线的</span>
            </div>
          </template>
          <template v-else>
            <div class="demo-load-more">
              <a @click.prevent="loadMore">加载更多</a>
            </div>
          </template>
        </template>
      </Col>
    </Row>
  </div>
</template>

<script>

import * as formatter from '@/libs/format'
import excel from '@/libs/excel'
import * as recordApi from '@/api/record'
import * as taskApi from '@/api/task'

const initColumnList = [
  {
    type: 'index',
    width: 60,
    align: 'center'
  },
  {
    key: 'username',
    title: '开发人员',
    width: 100,
    ellipsis: true
  },
  {
    key: 'taskTypeName',
    title: '任务类型',
    width: 100,
    ellipsis: true
  },
  {
    key: 'fireTime',
    title: '执行时间',
    align: 'center',
    width: 180
  },
  {
    key: 'jobName',
    title: '任务名称',
    ellipsis: true
  }
]

export default {
  name: 'not-start-record-list',
  components: {
  },
  data () {
    return {
      loadingTable: true,
      taskType: 0,

      keyword: '',
      userId: 0,
      warning: 1,

      total: 0,
      page: 1,
      size: 20,

      columnList: initColumnList,
      taskList: [],
      userList: this.$store.state.user.userList,
      taskTypeList: this.$store.state.user.taskTypeList
    }
  },
  methods: {
    async getData () {
      const data = {
        page: this.page,
        size: this.size,
        taskType: this.taskType,
        userId: this.userId,
        keyword: this.keyword,
        warning: this.warning
      }

      this.$Loading.start()
      const result = await recordApi.getNotStartRecordList(data)
      this.loadingTable = false
      if (result.code === 0) {
        this.$Loading.finish()
        this.total = result.data.total
        const list = result.data.content
        list.forEach(e => e.fireTime = formatter.formatDateTime(e.fireTime))
        if (this.page > 1) {
          this.taskList = this.taskList.concat(list)
        } else {
          this.taskList = list
        }
      } else {
        this.$Loading.error()
        this.taskList = []
        this.total = 0
      }
    },
    resetSearch () {
      this.page = 1
      this.getData()
    },
    resetFilter () {
      this.keyword = ''
      this.taskType = ''
      this.userId = 0
    },
    exportExcel () {
      const title = this.columnList.slice(1).map(e => e.title)
      const key = this.columnList.slice(1).map(e => e.key)
      const params = {
        title,
        key,
        data: this.taskList,
        autoWidth: true,
        filename: '待执行任务'
      }
      excel.export_array_to_excel(params)
    },
    loadMore () {
      this.loadingTable = true
      setTimeout(() => {
        this.page++
        this.getData()
      }, 1 * 1000)
    }
  },
  mounted () {
    this.getData()
  },
  created () {
  },
  computed: {
  },
  watch: {
  }
}
</script>