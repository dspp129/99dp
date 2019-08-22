<template>
  <g v-show="isEditAreaShow.value">
    <foreignObject width="100%" height="100%" style="position: relative" @click="click_menu_cover($event)">
    <div :style="menuStyle">
      <div class="menu_contain non-select">
        <span @click="openRecord">查看详情</span>
        <span @click="openTask">打开该任务</span>
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
    isEditAreaShow: {
      type: Object,
      default: () => {
        return {
          value: false,
          x: -9999,
          y: -9999,
          id: null
        }
      }
    }
  },
  methods: {
    ...mapActions([
      'removeNode'
    ]),
    click_menu_cover(e) {
      this.$emit('close_click_nodes')
      e.preventDefault()
      e.cancelBubble = true
      e.stopPropagation()
    },
    remove() {
      const params = {
        model_id: sessionStorage['newGraph'],
        id: this.isEditAreaShow.id
      }
      if (this.isEditAreaShow.id) {
        this.removeNode(params)
      }
      this.$emit('close_click_nodes')
    },
    openTask () {
      this.$Message.info('打开任务')
    },
    openRecord () {
      this.$Message.info('查看详情')
    },
    openUpstream () {
      this.$emit('init-graph')
    },
    openDownstream () {
      this.$emit('init-graph')
    }
  },
  computed: {
    menuStyle() {
      const left = this.isEditAreaShow.x
      const top = this.isEditAreaShow.y
      return {
        position: 'absolute',
        left: left + 'px',
        top: top + 'px'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
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
