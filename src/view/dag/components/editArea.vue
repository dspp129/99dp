<template>
  <g v-show="showing">
    <foreignObject width="100%" height="100%" style="position: relative" @click="click_menu_cover($event)">
    <div :style="menuStyle">
      <div class="menu_contain non-select">
        <span @click="openRecord">查看详情</span>
        <!--
        <span @click="openTask">打开该任务</span>
        -->
        <span @click="openUpstream">查看上游</span>
        <span @click="openDownstream">查看下游</span>
        <span @click="remove">删除节点</span>
      </div>
    </div>
    </foreignObject>
  </g>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    editAreaCoord: {
      type: Object,
      default: () => {
        return {
          x: -9999,
          y: -9999
        }
      }
    },
    chosenNode: {
      type: Object
    }
  },
  data () {
    return {
      showing: false
    }
  },
  methods: {
    ...mapActions([
      'removeNode'
    ]),
    click_menu_cover(e) {
      this.$emit('input', false)
      e.preventDefault()
      e.cancelBubble = true
      e.stopPropagation()
    },
    remove() {
      const params = {
        model_id: sessionStorage['newGraph'],
        jobId: this.chosenNode.jobId
      }
      if (this.chosenNode.jobId) {
        this.removeNode(params)
      }
      this.$emit('input', false)
    },
    openTask () {
      this.$Message.info('打开任务')
    },
    openRecord () {
      if (this.chosenNode.recordId > 0) this.$router.push({
        name: 'record',
        params: this.chosenNode
      })
      else this.$Message.info('该调度尚未生成，无法查看')
    },
    openUpstream () {
      if (this.chosenNode.recordId > 0) this.$emit('lookupUpstream')
      else this.$Message.info('该调度尚未生成，无法查看')
    },
    openDownstream () {
      if (this.chosenNode.recordId > 0) this.$emit('lookupDownstream')
      else this.$Message.info('该调度尚未生成，无法查看')
    }
  },
  computed: {
    menuStyle() {
      const left = this.editAreaCoord.x
      const top = this.editAreaCoord.y
      return {
        position: 'absolute',
        left: left + 'px',
        top: top + 'px'
      }
    }
  },
  watch: {
    value (value) {
      this.showing = value
    }
  }
}
</script>

<style lang="less" scoped>
.connector {
  stroke: hsla(0, 0%, 50%, 0.6);
  stroke-width: 2px;
  fill: none;
}
.menu_cover {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}
.connector-hl {
  stroke: hsla(0, 0%, 50%, 0.4);
  stroke-width: 5px;
  fill: none;
}
.menu_contain {
  width: 150px;
  border: 1px solid rgba(1, 1, 1, 0.3);
  background: #ffffff;
  border-radius: 5px;
  padding: 3px;
  span {
    width: 100%;
    display: inline-block;
  }
}
.menu_contain span:hover {
  background-color: rgba(40, 157, 233, 0.3);
  cursor: pointer;
}
</style>
