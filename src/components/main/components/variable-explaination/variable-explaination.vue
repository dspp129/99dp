<template>
  <div class="full-screen-btn-con">
    <Tooltip content="参数说明" placement="bottom">
      <Icon @click.native="showVariable" type="logo-usd" :size="20" />
    </Tooltip>
    <Modal v-model="showingWindow" class-name="modal-vertical-center" width="800">
      <p slot="header" style="color:#2d8cf0;text-align:center;">
        <Icon type="md-information-circle" />
        <span class="margin-left-5">全局参数</span>
      </p>
      <Table :columns="columnList" :data="tableList" size="small" height="310" />
      <p slot="footer" style="color:#80848f;text-align: center;">需要更多参数？请联系管理员。</p>
    </Modal>
  </div>
</template>

<script>

const initColumnList = [
  {
    title: '参数名称',
    key: 'name',
    width: 150
  },
  {
    title: '描述说明',
    key: 'description',
    width: 240
  },
  {
    title: '示例',
    key: 'sample',
    width: 150
  },
  {
    title: '表达式',
    key: 'expression'
  }
]

import moment from 'moment'
import * as paramApi from '@/api/param'
import * as formatter from '@/libs/format'

export default {
  name: 'variable-explaination',
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      showingWindow: false,
      columnList: initColumnList,
      tableList: []
    }
  },
  methods: {
    async getParamList () {
      const result = await paramApi.getList()
      if (result.code !== 0) return
      this.tableList = result.data.map(e => {
        switch (e.name) {
          case '${fireTime}' : e.sample = formatter.formatDateTime(moment())
            break 
          case '${fireDate}' : e.sample = formatter.formatDate(moment())
            break
          case '${startDate}' : e.sample = formatter.formatDate(moment().add(-1, 'days'))
            break 
          case '${endDate}' : e.sample = formatter.formatDate(moment())
            break
          case '${startMonth}' : e.sample = moment().add(-1, 'days').startOf('month').format('YYYY-MM-DD')
            break
          case '${endMonth}' : e.sample = moment().add(-1, 'days').endOf('month').format('YYYY-MM-DD')
            break
          case '${shortDate}' : e.sample = moment().add(-1, 'days').format('YYYYMMDD')
            break
          case '${shortMonth}' : e.sample = moment().add(-1, 'days').startOf('month').format('YYYYMM')
            break
        }
        return e
      })
    },
    showVariable () {
      this.getParamList()
      this.showingWindow = true
    }
  }
}
</script>
