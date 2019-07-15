<template>
  <div ref="scrollCon" @DOMMouseScroll="handlescroll" @mousewheel="handlescroll" class="tags-outer-scroll-con">
    <div ref="scrollBody" class="tags-inner-scroll-body dependency-parent-bar" :style="{left: tagBodyLeft + 'px'}">
      <Card v-for="record in recordList" class="dependency-child-bar" :key="record.jobId">
        <p slot="title">
            <!--
            <Icon style="float: left;margin-left: 2px;"
            :type="renderDependIcon(record)"
            size="22"
            :color="renderDependColor(record)"></Icon>
          -->
          <Poptip trigger="hover" transfer >
            <span>
              {{record.jobName}}
            </span>
            <div slot="title"><b>{{record.jobName}}</b></div>
            <div slot="content">
              <a @click="openTask(record)">打开任务</a>
              <template v-if="hasExtra(record)">
                &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                <a @click="lookupDependence(record)">查看依赖</a>
              </template>
            </div>
          </Poptip>
        </p>

        <!--
          <a slot="extra" @click.prevent="lookupDependence(record)" v-if="hasExtra(record)">
              <Icon :type="extra" size="22"></Icon>
          </a>
        -->

        <p>
          <span>
            <b>执行结果：</b>
            <Tag v-if="record.status === -3" color="blue">未开始</Tag>
            <Tag v-else-if="record.status < 0" color="blue">等 待</Tag>
            <Tag v-else-if="record.status === 0" color="gold">执行中</Tag>
            <template v-else>
              <Tag v-show="record.success === 0" color="red">失 败</Tag>
              <Tag v-show="record.success === 1" color="green">成 功</Tag>
              <Tag v-show="record.success === 2" color="purple">被 杀</Tag>
              <Tag v-show="record.success === 3" color="#80848f">超 时</Tag>
              <Tag v-show="record.success === 4" color="red">失 联</Tag>
              <Tag v-show="record.success === 5" color="default">取 消</Tag>
              <Tag v-show="record.success === -1" color="default">未调度</Tag>
            </template>
          </span>
          <span style="float: right;">
            <b>执行方式：</b>
            <Tag v-show="record.execType === 0" color="green">自 动</Tag>
            <Tag v-show="record.execType === 1" color="blue">手 动</Tag>
            <Tag v-show="record.execType === 2" color="gold">手 动</Tag>
            <Tag v-show="record.execType === 3" color="default">重 跑</Tag>
            <Tag v-show="record.execType === 4" color="default">现 场</Tag>
            <Tag v-show="record.execType === 5" color="warning">强 制</Tag>
          </span>
        </p>
        <p class="margin-top-5"><span><b>计划时间：</b>{{formatDateTime(record.fireTime)}}</span></p>
        <p class="margin-top-5"><span><b>开始时间：</b>{{formatDateTime(record.startTime)}}</span></p>
        <p class="margin-top-5"><span><b>结束时间：</b>{{formatDateTime(record.endTime)}}</span>
          <a @click="lookupDependence(record)">
            <Icon :type="extra" color="#ff9900" style="float: right;" size="18"></Icon>
          </a>
        </p>

      </Card>
    </div>
  </div>
</template>

<script>

import { mapMutations } from 'vuex'
import * as formatter from '@/libs/format'

export default {
  name: 'record-card-line',
  props: {
    recordList: {
      type: Array
    },
    stream: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      tagBodyLeft: 0,
      card: {
        width: 300,
        space: 20
      }
    }
  },
  methods: {
    ...mapMutations([
      'removeTask'
    ]),
    openTask (record) {
      const params = {
        id: record.jobId,
        title: record.jobName,
        taskType: record.taskType,
        taskTypeName: record.taskTypeName
      }
      this.removeTask(params.id)
      this.$router.push({
        name: 'task-' + record.taskTypeName,
        params
      })
    },
    hasExtra (record) {
      return record.recordId > 0 && (this.stream === 'up' || this.stream === 'down')
    },
    lookupDependence (record) {
      if (record.recordId <= 0) {
        this.$Message.info('该调度未生成，无法查看。')
      }
      this.$emit('on-change', record.recordId)
    },
    renderDependColor (record) {
      let color = ''

      if (record.status === -3) {
        /* 未开始 */
        color = '#5cadff'
      } else if (record.status < 0) {
        /* 等待 */
        color = '#ff9900'
      } else if (record.status === 0) {
        /* 运行中 */
        color = '#ff9900'
      } else if (record.success === 1) {
        /* 成功 */
        color = '#19be6b'
      } else if (record.success === 2) {
        /* 强制 */
        color = '#ed3f14'
      } else if (record.success === 3) {
        /* 失败 */
        color = '#ed3f14'
      }

      return color
    },
    renderDependIcon (record) {
      let icon = ''

      if (record.status === -3) {
        /* 未开始 */
        icon = 'md-play'
      } else if (record.status < 0) {
        /* 等待 */
        icon = 'ios-skipforward'
      } else if (record.status === 0) {
        /* 运行中 */
        icon = 'load-a'
      } else if (record.success === 1) {
        /* 成功 */
        icon = 'android-checkmark-circle'
      } else if (record.success === 2) {
        /* 强制 */
        icon = 'md-pause'
      } else if (record.success === 3) {
        /* 失败 */
        icon = 'close-round'
      }

      return icon
    },
    handlescroll (e) {
      e.preventDefault()
      const totalWidth = this.recordList.length * (this.card.width + this.card.space) - this.$refs.scrollCon.offsetWidth // 可偏移量 = 总宽度 - this.$refs.scrollCon.offsetWidth
      const type = e.type
      let delta = 0
      if (type === 'DOMMouseScroll' || type === 'mousewheel') {
        delta = (e.wheelDelta) ? e.wheelDelta : -(e.detail || 0) * 40
      }
      let left = 0
      if (delta > 0) {
        left = Math.min(0, this.tagBodyLeft + delta)
      } else {
        if (this.$refs.scrollCon.offsetWidth - totalWidth < this.$refs.scrollBody.offsetWidth) {
          if (this.tagBodyLeft < -(this.$refs.scrollBody.offsetWidth - this.$refs.scrollCon.offsetWidth + totalWidth)) {
            left = this.tagBodyLeft
          } else {
            left = Math.max(this.tagBodyLeft + delta, this.$refs.scrollCon.offsetWidth - this.$refs.scrollBody.offsetWidth - totalWidth)
          }
        } else {
          left = 0
        }
      }
      this.tagBodyLeft = left
    },
    formatDateTime (time) {
      return formatter.formatDateTime(time)
    }
  },
  computed: {
    extra () {
      if (this.stream === 'up') {
        return 'md-arrow-round-up'
      } else if (this.stream === 'down') {
        return 'md-arrow-round-down'
      } else {
        return 'md-star'
      }
    }
  },
  mounted () {
  },
  created () {
  }
}

</script>
