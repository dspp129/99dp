<template>
  <DatePicker
    type="daterange"
    :options="dateOptions"
    :placement="placement"
    :editable="false"
    separator=" 至 "
    split-panels
    placeholder="请选择起止日期"
    v-model="initDate"
    style="width: 220px">
  </DatePicker>
</template>

<script>

export default {
  name: 'date-range-picker',
  props: {
    width: Number,
    defaultRange: {
      type: Number,
      default: 7
    },
    placement: {
      type: String,
      default: 'bottom-end'
    }
  },
  data () {
    return {
      initDate: [],

      dateOptions: {
        shortcuts: [
          {
            text: '今天',
            value () {
              const end = new Date()
              const start = new Date()
              return [start, end]
            }
          },
          {
            text: '昨天',
            value () {
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 1)
              const end = start
              return [start, end]
            }
          },
          {
            text: '最近三天',
            value () {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 2)
              return [start, end]
            }
          },
          {
            text: '最近一周',
            value () {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 6)
              return [start, end]
            }
          },
          {
            text: '最近一月',
            value () {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              return [start, end]
            }
          },
          {
            text: '最近三月',
            value () {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              return [start, end]
            }
          }
        ]
      }
    }
  },
  methods: {
  },
  created () {
    const range = 7
    const end = new Date()
    const start = new Date()
    start.setTime(start.getTime() - 3600 * 1000 * 24 * range)
    this.initDate = [start, end]
  },
  watch: {
    initDate (initDate) {
      this.$emit('on-date-change', initDate)
    },
    defaultRange (range) {
      if (range > 0) {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * range)
        this.initDate = [start, end]
      }
    }
  }
}

</script>
