<template>
  <div ref="dom"></div>
</template>

<script>

import echarts from 'echarts'
import { on, off } from '@/libs/tools'
import * as formatter from '@/libs/format'
export default {
  name: 'trend-cpu',
  props: {
    value: Array,
    loading: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      dom: null,
      yData: [],
      xData: [],
      option: {}
    }
  },
  methods: {
    init () {
      this.option = {
        title: {
            text: 'CPU使用率'
        },
        tooltip: {
          trigger: 'axis',
          /*
          formatter: '{b0} <br />CPU使用率: {c0}%',
          axisPointer: {
            type: 'cross',
            animation: false,
            label: {
              backgroundColor: '#ccc',
              borderColor: '#aaa',
              borderWidth: 1,
              shadowBlur: 0,
              shadowOffsetX: 0,
              shadowOffsetY: 0,
              textStyle: {
                color: '#222'
              }
            }
          }*/
        },
        grid: {
          left: '3%',
          right: '7%',
          bottom: 50,
          containLabel: true
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        dataZoom: [
          {
            show: true,
            realtime: true,
            start: 30,
            end: 100
          },
          {
            type: 'inside',
            realtime: true,
            start: 30,
            end: 100
          }
        ],
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.yData
        },
        yAxis: [
          {
            type: 'value',
            min: 0,
            max: 100,
            axisLabel: {
              formatter: '{value} %'
            }
          }
        ],
        series: [
          {
            name: 'CPU使用率',
            type: 'line',
            showSymbol: false,
            smooth: true,
            data: this.xData
          }
        ]
      }
    },
    resize () {
      this.dom.resize()
    },
    random (lower, upper) {
      return Math.floor(Math.random() * (upper - lower)) + lower
    },
    push (value) {
      this.yData.push(formatter.formatDateTime(value.datetime))
      const percent = (1 - value.cpuIdle / value.cpuTotal) * 100
      this.xData.push(percent.toFixed(2) * 1)
      this.flush()
    },
    flush () {
      this.dom.setOption({
        xAxis: {
          data: this.yData.map(e => e.replace(' ', '\n'))
        },
        series: [{
          data: this.xData
        }]
      })
    }
  },
  mounted () {
    this.init()
    this.$nextTick(() => {
      this.dom = echarts.init(this.$refs.dom, 'light')
      this.dom.setOption(this.option)
      on(window, 'resize', this.resize)
    })
/*
    setInterval(() => {
      const data = {
        createTime: new Date(),
        cpuTotal: 100,
        cpuIdle: this.random(60,90) + this.random(1,90) / 100
      }
      this.push(data)
    }, 1000)
*/
  },
  beforeDestroy () {
    off(window, 'resize', this.resize)
  },
  watch: {
    value (value) {
      this.yData = []
      this.xData = []
      value.forEach(e => {
        this.yData.push(formatter.formatDateTime(e.createTime))
        const percent = (1 - e.cpuIdle / e.cpuTotal) * 100
        this.xData.push(percent.toFixed(2) * 1)
      })
      this.flush()
    },
    loading (loading) {
      if (this.dom === null || typeof this.dom === 'undefined') return
      if (loading) {
        this.dom.showLoading({ text: '正在加载数据' })
      } else {
        this.dom.hideLoading()
      }
    }
  }
}
</script>
