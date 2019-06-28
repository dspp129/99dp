<template>
  <div>
    <Row>
      <RadioGroup v-model="radio" type="button" size="large" @on-change="onChangeRadio">
        <Radio :disabled="showSpin" :label="1">1小时</Radio>
        <Radio :disabled="showSpin" :label="2">12小时</Radio>
        <Radio :disabled="showSpin" :label="3">24小时</Radio>
      </RadioGroup>

      <DatePicker v-model="selectedDate" size="large" type="date" placeholder="自定义日期" :options="dateOptions" class="margin-left-5" @on-change="onChangeDate" style="width: 120px" />
      <span class="margin-left-10">
        展示时间：{{ startDate }} 至 {{ endDate }}
      </span>
      <Slider v-model="range" :min="0" :max="23" range show-stops :disabled="radio > 0" @on-change="onChangeDate" />
    </Row>
    <Row class="margin-top-10">
      <Card shadow>
        <TrendCpu v-model="trend" :loading="showSpin" style="height: 350px;"/>
      </Card>
      <Card shadow class="margin-top-10">
        <TrendMemory v-model="trend" :loading="showSpin" style="height: 350px;"/>
      </Card>
    </Row>
  </div>
</template>

<script>

import moment from 'moment'
import { mapMutations } from 'vuex'
import TrendCpu from './components/trend-cpu.vue'
import TrendMemory from './components/trend-memory.vue'
import * as formatter from '@/libs/format'
import * as agentApi from '@/api/cluster'

export default {
  name: 'agent-recent',
  components: {
    TrendCpu,
    TrendMemory
  },
  data () {
    return {
      radio: 1,
      startDate: '',
      endDate: '',
      selectedDate: '',
      range: [0, 23],
      dateOptions: {
        disabledDate (date) {
          return date && date.valueOf() > Date.now()
        }
      },
      trend: [],
      showSpin: false,
      timer: -1
    }
  },
  methods: {
    ...mapMutations([
      'closeTag'
    ]),
    init () {
      const id = this.$route.params.id
      if (typeof id === 'undefined') return
      this.radio = 1
      this.onChangeRadio(1)
    },
    async reload () {
      const data = {
        agentId: this.$route.params.id,
        startTime: this.startDate,
        endTime: this.endDate
      }
      this.$Loading.start()
      this.showSpin = true
      const result = await agentApi.getAgentResource(data)
      this.showSpin = false
      if (result.code !== 0) {
        this.$Loading.error()
        this.$Message.error(result.msg)
        return
      }
      this.$Loading.finish()
      this.trend = result.data
    },
    async loadMore () {
      const agentId = this.$route.params.id
      if (typeof agentId === 'undefined' || agentId <= 0) return
      const startTime = this.endDate
      const endTime = formatter.formatDateTime(moment())
      const data = { agentId, startTime, endTime}

      this.$Loading.start()
      const result = await agentApi.getAgentResource(data)
      if (result.code !== 0) {
        this.$Loading.error()
        this.$Message.error(result.msg)
        return
      }
      this.$Loading.finish()
      this.startDate = this.endDate
      this.endDate = endTime

      this.trend = this.trend.concat(result.data)

    },
    closePage () {
      this.closeTag({
        name: 'agent-recent',
        params: this.$route.params
      })
    },
    onChangeRadio (radio) {
      this.endDate = formatter.formatDateTime(moment())
      switch (radio) {
        case 1: this.startDate = formatter.formatDateTime(moment().add(-1, 'hour'))
          break
        case 2: this.startDate = formatter.formatDateTime(moment().add(-12, 'hour'))
          break
        case 3: this.startDate = formatter.formatDateTime(moment().add(-1, 'day'))
          break
      }
      this.reload()
    },
    onChangeDate () {
      this.radio = -1
      const date = formatter.formatDate(this.selectedDate)
      let startHour = this.range[0]
      let endHour = this.range[1]
      startHour = startHour < 10 ? '0' + startHour : startHour
      endHour = endHour < 10 ? '0' + endHour : endHour
      this.startDate =  `${date} ${startHour}:00:00`
      this.endDate =   `${date} ${endHour}:59:59`
      this.reload()
    }
  },
  created () {

  },
  mounted () {
    this.init()
    this.timer = setInterval(() => {
      if (this.radio <= 0) return
      this.loadMore()
    }, 1000 * 10)
  },
  beforeDestroy () {
    clearInterval(this.timer)
  },
  watch: {
    '$route.params.id' (id) {
      this.init()
    }
  }
}
</script>
