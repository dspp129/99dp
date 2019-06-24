<template>
  <div ref="dom" class="charts chart-bar"></div>
</template>

<script>
import echarts from 'echarts'
import { on, off } from '@/libs/tools'
export default {
  name: 'ChartBar',
  props: {
    value: Array,
    title: String,
    subtitle: String
  },
  data () {
    return {
      dom: null
    }
  },
  methods: {
    resize () {
      this.dom.resize()
    },
    init () {
      if (this.value.length === 0) return
      const xAxisData = [], yAxisData1 = [], yAxisData2 = [], yAxisData3 = []
      let max = 0
      this.value.forEach(e => {
        const total = e.success + e.failure
        xAxisData.push(e.date)
        yAxisData1.push(e.success)
        yAxisData2.push(e.failure)
        yAxisData3.push((e.success / total * 100).toFixed(2))
        max = max > total ? max : total
      })

      this.$nextTick(() => {
        const option = {
          title: {
            text: '7天任务成功率',
            x: 'center'
          },
          tooltip : {
            trigger: 'axis',
            axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
          },
          grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true
          },
          xAxis : [
              {
                type : 'category',
                data : xAxisData,
                axisTick: {
                  alignWithLabel: true
                }
              }
          ],
          yAxis: [
            {
              type: 'value',
              name: '任务数',
              position: 'left',
              min: 0,
              max: max
            },
            {
              type: 'value',
              name: '成功率',
              min: 90,
              max: 100,
              position: 'right',
              axisLabel: {
                  formatter: '{value} %'
              }
            }
          ],
          series : [
            {
              name:'成功率',
              type:'line',
              color: '#2db7f5',
              yAxisIndex: 1,
              data: yAxisData3
            },
            {
              name:'成功',
              type:'bar',
              barWidth: '60%',
              color:'#19be6b',
              stack: '1',
              yAxisIndex: 0,
              data: yAxisData1
            },
            {
              name:'失败',
              type:'bar',
              color: '#c5c8ce',
              stack: '1',
              yAxisIndex: 0,
              data: yAxisData2
            }
          ]
        }
        this.dom = echarts.init(this.$refs.dom, 'light')
        this.dom.setOption(option)
        on(window, 'resize', this.resize)
      })
    }
  },
  mounted () {
    this.init()
  },
  beforeDestroy () {
    off(window, 'resize', this.resize)
  },
  watch : {
    value () {
      this.init()
    }
  }
}
</script>
