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
          @on-change="resetSearch"
          clearable
          placeholder="所有类型..."
          class="margin-left-5"
          style="width:120px">
          <Option v-for="item in taskTypeList" :value="item.id" :key="item.id">{{item.description}}</Option>
        </Select>
        <Select
          v-model.number="categoryId"
          @on-change="resetSubCategory"
          clearable
          placeholder="主题域..."
          class="margin-left-5"
          style="width:120px">
          <Option v-for="item in categoryList" :value="item.id" :key="item.id">{{item.name}}</Option>
        </Select>
        <Select
          v-model.number="subCategoryId"
          @on-change="resetSearch"
          clearable
          placeholder="数据层..."
          class="margin-left-5"
          style="width:120px">
          <Option v-for="item in subCategoryList" :value="item.id" :key="item.id">{{item.name}}</Option>
        </Select>
        <Input
          v-model="keyword"
          placeholder="请输入任务名称..."
          @on-enter="resetSearch"
          class="margin-left-5"
          style="width: 230px" />
        <Button type="primary" shape="circle" icon="md-search" @click="resetSearch" :loading="loadingTable" class="margin-left-5" />
        <Tooltip content="重置查询条件" placement="right">
          <Button shape="circle" icon="md-sync" @click="resetFilter" class="margin-left-5" />
        </Tooltip>
      </div>
      <Dropdown style="float: right" placement="bottom-end"  @on-click="newTask" trigger="click">
        <Button type="primary" shape="circle" icon="md-add" />
        <DropdownMenu slot="list">
          <DropdownItem v-for="item in taskTypeList" :name="item.id" :key="item.id">{{item.description}}</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </Row>
    <Row class="margin-top-8">
      <Pagination :total="total" :size="size" @on-page-info-change="changePageInfo" ref="pagination">
        <Table stripe
          :columns="columnList"
          :data="taskList"
          :loading="loadingTable"
          size="small"
          slot="table" />
      </Pagination>
    </Row>
    <KickoffTask :id="execJobId" :cronExpr="execCronExpr" v-model="showingModal" />
  </div>
</template>

<script>

import { oneOf } from '@/libs/tools'
import { mapMutations } from 'vuex'
import Pagination from '_c/pagination'
import KickoffTask from '_c/kickoff-task'
import * as formatter from '@/libs/format'
import * as taskApi from '@/api/task'

const dependButton = (vm, h, currentRowData, index) => {
  return h('Tooltip', {
    props: {
      placement: 'top',
      content: '查看上下游'
    },
    style: {
      marginRight: '10px'
    },
  }, [
    h('Button', {
      props: {
        size: 'small',
        icon: 'md-git-network',
        shape: 'circle',
        loading: currentRowData.loading
      },
      on: {
        click: () => {
          vm.openDAG(currentRowData, index)
        }
      }
    })
  ])
}

const playButton = (vm, h, currentRowData, index) => {
  return h('Tooltip', {
    props: {
      placement: 'top',
      content: '执行'
    },
    style: {
      marginRight: '10px'
    },
  }, [
    h('Button', {
      props: {
        ghost: true,
        size: 'small',
        type: 'success',
        icon: 'md-paper-plane',
        shape: 'circle'
      },
      on: {
        click: () => {
          vm.execJobId = currentRowData.jobId
          vm.execCronExpr = currentRowData.cronExpr
          vm.showingModal = true
        }
      }
    })
  ])
}

const deleteButton = (vm, h, currentRowData, index) => {
  return h('Poptip', {
    props: {
      // information-circled
      confirm: true,
      title: '您确定要删除这个任务吗?',
      placement: 'top-end'
    },
    on: {
      'on-ok': async () => {
        vm.$Loading.start()
        const result = await taskApi.deleteTask(currentRowData.jobId)
        if (result.code === 0) {
          vm.$Loading.finish()
          vm.taskList.splice(index, 1)
          vm.$Message.success('删除了第' + (index + 1) + '个任务')
          vm.total--
        } else {
          vm.$Loading.error()
          vm.$Message.error('删除失败。' + result.msg)
        }
      }
    }
  }, [
    h('Button', {
      props: {
        ghost: true,
        type: 'error',
        size: 'small',
        icon: 'md-trash',
        shape: 'circle'
      }
    })
  ])
}

const reviewButton = (vm, h, currentRowData) => {
  return h('Button', {
    props: {
      ghost: true,
      type: 'info',
      size: 'small',
      icon: 'md-open',
      shape: 'circle'
    },
    style: {
      marginRight: '10px'
    },
    on: {
      click: () => {
        const params = {
          id: currentRowData.jobId,
          title: currentRowData.jobName,
          taskType: currentRowData.taskType
        }
        const name = 'task-' + currentRowData.taskTypeName
        vm.openTask(name, params)
      }
    }
  })
}

const initColumnList = [
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
    key: 'jobName',
    title: '任务名称',
    ellipsis: true
  },
  {
    key: 'pause',
    title: '执行方式',
    align: 'center',
    width: 90
  },
  {
    key: 'nextFireTime',
    title: '下次执行时间',
    align: 'center',
    width: 160
  },
  {
    key: 'currentStatus',
    title: '运行状态',
    align: 'center',
    width: 100
  },
  {
    key: 'operation',
    title: '操作',
    align: 'center',
    width: 160,
    fixed: 'right'
  }
]

export default {
  name: 'task-list',
  components: {
    Pagination,
    KickoffTask
  },
  data () {
    return {
      loadingTable: true,
      showingModal: false,
      taskType: 0,

      keyword: '',
      userId: this.$store.state.user.userId,
      categoryId: 0,
      subCategoryId: 0,

      total: 0,
      page: 1,
      size: 10,

      columnList: initColumnList,
      taskList: [],
      userList: this.$store.state.user.userList,
      taskTypeList: this.$store.state.user.taskTypeList,
      categoryList: [],
      subCategoryList: [],

      execJobId: 0,
      execCronExpr: ''
    }
  },
  methods: {
    ...mapMutations([
      'removeTask'
    ]),
    async init () {
      this.columnList.forEach(item => {
        if (!oneOf(item.key, ['jobName', 'pause', 'currentStatus', 'nextFireTime', 'taskType', 'operation'])) return

        item.render = (h, param) => {
          const currentRowData = param.row
          if (item.key === 'jobName') {
            return h('a', {
              on: {
                click: () => {
                  const params = {
                    id: currentRowData.jobId,
                    title: currentRowData.jobName,
                    taskType: currentRowData.taskType
                  }
                  const name = 'task-' + currentRowData.taskTypeName
                  this.openTask(name, params)
                }
              }
            },
            currentRowData.jobName)
          }

          if (item.key === 'pause') {
            if (currentRowData.pause) {
              return h('Tag', { props: { color: 'default' } }, '手 动')
            } else {
              return h('Tag', { props: { color: 'green' } }, '自 动')
            }
          }

          // 0-未调度, 1-等待中, 2-执行中, 3-成功, 4-失败, 5-超时被杀, 6-手动被杀
          if (item.key === 'currentStatus') {
            switch (currentRowData.success) {
              case 1 : return h('Tag', { props: { color: 'green' } }, '成 功')
              case 0 : return h('Tag', { props: { color: 'red' } }, '失 败')
              case 2 : return h('Tag', { props: { color: 'purple' } }, '被 杀')
              case 3 : return h('Tag', { props: { color: '#80848f' } }, '超 时')
              default : return h('Tag', { props: { color: 'default' } }, '未调度')
            }
          }

          if (item.key === 'nextFireTime') {
            if (currentRowData.pause) {
              return h('span', '— —')
            } else {
              return h('span', formatter.formatDateTime(currentRowData.nextFireTime))
            }
          }

          if (item.key === 'operation') {
            return h('div', [
              reviewButton(this, h, currentRowData),
              // dependButton(this, h, currentRowData, param.index),
              playButton(this, h, currentRowData, param.index),
              deleteButton(this, h, currentRowData, param.index)
            ])
          }
        }
      })
      this.categoryList = await this.findCategoryByParentId(0)
    },
    async resetSubCategory () {
      if (typeof this.categoryId !== 'undefined' && this.categoryId > 0) {
        this.subCategoryList = await this.findCategoryByParentId(this.categoryId)
      }
      if (typeof this.subCategoryId === 'undefined' || this.subCategoryId === 0) {
        this.resetSearch()
      } else {
        this.subCategoryId = 0
      }
    },
    resetSearch () {
      this.$refs.pagination.first()
    },
    resetFilter () {
      this.keyword = ''
      this.taskType = ''
      this.userId = this.$store.state.user.userId
    },
    newTask (taskType) {
      const item = this.taskTypeList.find(e => e.id === taskType)
      const params = {
        id: 'new-' + item.name,
        title: 'New',
        taskType
      }
      const name = 'task-' + item.name
      this.openTask(name, params)
    },
    openTask (name, params) {
      this.removeTask(params.id)
      this.$router.push({ name, params })
    },
    async openDAG (item, index) {
      item.loading = true
      this.taskList.splice(index, 1, item)
      setTimeout(() => {
        item.loading = false
        this.taskList.splice(index, 1, item)
        this.$Message.info('开发中')
      }, 500)
    },
    async getData () {
      const data = {
        page: this.page,
        size: this.size,
        taskType: this.taskType,
        userId: this.userId,
        keyword: this.keyword,
        categoryId: this.categoryId,
        subCategoryId: this.subCategoryId
      }

      this.$Loading.start()
      this.loadingTable = true
      const result = await taskApi.getTaskList(data)
      this.loadingTable = false
      if (result.code === 0) {
        this.$Loading.finish()
        this.taskList = result.data.content
        this.total = result.data.total
      } else {
        this.$Loading.error()
        this.taskList = []
        this.total = 0
      }
    },
    changePageInfo ({ page, size }) {
      this.page = page
      this.size = size
      this.getData()
    },
    refresh () {
      parent.location.reload()
    },
    async findCategoryByParentId (id) {
      const result = await taskApi.findCategoryByParentId(id)
      if (result.code === 0) {
        return result.data
      } else {
        this.$Message.error(result.msg)
        return []
      }
    }
  },
  activated () {
  },
  mounted () {
    this.getData()
  },
  created () {
    this.init()
  },
  computed: {
  },
  watch: {
  }
}
</script>
