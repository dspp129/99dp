<template>
  <g v-if="isEditAreaShow.value">
    <foreignObject width="100%" height="100%" style="position: relative" @click="click_menu_cover($event)">
    <div :style="get_menu_style()">
      <div class="menu_contain">
        <span @click="openRecord">查看详情</span>
        <span @click="openTask">打开该任务</span>
        <span>查看上游</span>
        <span>查看下游</span>
        <span @click="delEdges">删除节点</span>
      </div>
    </div>
    </foreignObject>
  </g>
</template>

<script>
import { mapActions } from 'vuex';
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
    ...mapActions(['delNode']),
    click_menu_cover(e) {
      this.$emit('close_click_nodes')
      e.preventDefault();
      e.cancelBubble = true;
      e.stopPropagation();
    },
    get_menu_style() {
      let left = this.isEditAreaShow.x;
      let top = this.isEditAreaShow.y;
      return {
        position: "absolute",
        left: left + 'px',
        top: top + 'px'
      }
    },
    delEdges() {
      let params = {
        model_id: sessionStorage['newGraph'],
        id: this.isEditAreaShow.id
      }
      if (this.isEditAreaShow.id) {
        this.delNode(params)
      }
      this.$emit('close_click_nodes')
    },
    openTask () {
      this.$Message.info('打开任务')
    },
    openRecord () {
      this.$Message.info('查看详情')
    }
  }
};
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
