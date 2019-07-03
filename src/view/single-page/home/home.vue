<template>
  <div>
    <Row :gutter="10">
      <Col :xs="12" :md="8" :lg="4" v-for="(infor, i) in inforCardData" :key="`infor-${i}`" style="height: 120px;">
        <infor-card shadow :color="infor.color" :icon="infor.icon" :icon-size="36" :path="infor.path">
          <count-to :end="infor.count" count-class="count-style"/>
          <p>{{ infor.title }}</p>
        </infor-card>
      </Col>
    </Row>
    <Row :gutter="10" class="margin-top-10">
      <Col :md="24" :lg="8">
        <Card shadow>
          <chart-pie style="height: 300px;" :value="pieData" title="任务类型分布"/>
        </Card>
      </Col>
      <Col :md="24" :lg="16">
        <Card shadow>
          <chart-bar style="height: 300px;" :value="barData" title="用户任务数排名"/>
        </Card>
      </Col>
    </Row>
    <Row class="margin-top-10">
      <Card shadow>
        <example style="height: 310px;"/>
      </Card>
    </Row>
  </div>
</template>

<script>
import InforCard from '_c/info-card'
import CountTo from '_c/count-to'
import { ChartPie, ChartBar } from '_c/charts'
import Example from './example.vue'
import * as homeApi from '@/api/home'
export default {
  name: 'home',
  components: {
    InforCard,
    CountTo,
    ChartPie,
    ChartBar,
    Example
  },
  data () {
    return {
      inforCardData: [
        { title: '执行器', icon: 'ios-link', count: 0, color: '#ff9900', path:'agent-list' },
        { title: '新增表', icon: 'ios-list-box-outline', count: 0, color: '#5cadff' },
        { title: '新增任务', icon: 'md-paw', count: 0, color: '#E46CBB' },
        { title: '新增报表', icon: 'md-map', count: 0, color: '#9A66E4' },
        { title: '今日成功', icon: 'ios-thumbs-up', count: 0, color: '#19be6b' },
        { title: '今日失败', icon: 'ios-thumbs-down', count: 0, color: '#ed4014' }
      ],
      pieData: [],
      barData: []
    }
  },
  methods: {
    async init () {
      const result = await homeApi.getHomeData()
      if (result.code !== 0) return
      this.inforCardData[0].count = result.data.activeAgent
      this.inforCardData[1].count = result.data.newTable
      this.inforCardData[2].count = result.data.newTask
      this.inforCardData[3].count = result.data.newReport
      this.inforCardData[4].count = result.data.success
      this.inforCardData[5].count = result.data.failure
      this.pieData = [
        { name: 'ETL任务', value: result.data.etlTask },
        { name: 'SQL任务', value: result.data.sqlTask },
        { name: 'Shell', value: result.data.shellTask },
        { name: '阈值监控', value: result.data.thresholdTask },
        { name: '微报表', value: result.data.miniReport }
      ]
      this.barData = result.data.oneWeekRecords
    }
  },
  mounted () {
    this.init()
  }
}
</script>

<style lang="less">
.count-style{
  font-size: 50px;
}
</style>
