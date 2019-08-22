<template>
  <g>
    <foreignObject width="220px" height="30px" style="position: relative">
      <div class="control_menu">
        <span @click="addNode" title="添加节点">
          <Icon type="md-bulb" size="16"/>
        </span>
        <span @click="changeModelRunningStatus">
          <Icon :type="modelRunningStatus ? 'md-pause' : 'md-play'" size="16"/>
        </span>
        <span @click="expandSize" title="放大">
          <Icon type="ios-search" size="16"/>
        </span>
        <span @click="shrinkSize" title="缩小">
          <Icon type="md-remove" size="16"/>
        </span>
        <span @click="initSize" title="重置">
          <Icon type="md-locate" size="16"/>
        </span>
        <span :class="['sel_area', 'sel_area_ing'].indexOf(currentEvent) !== -1 ? 'sel_ing' : ''" @click="sel_area($event)" title="选择">
          <Icon type="md-square-outline" size="16"/>
        </span>
        <span @click="fullScreen" title="全屏">
          <Icon :type="isFullScreen ? 'md-contract' : 'md-expand' " size="16"/>
        </span>
      </div>
    </foreignObject>
  </g>
</template>

<script>

export default {
  props: {
    currentEvent: {
      type: String,
      default: () => ''
    },
    modelRunningStatus: {
      type: Boolean,
      default: () => false
    }
  },
  data() {
    return {
      isFullScreen: false
    }
  },
  methods: {
    addNode () {
      this.$emit("addNode")
    },
    expandSize() {
      this.$emit("expandSize")
    },
    shrinkSize() {
      this.$emit("shrinkSize")
    },
    initSize() {
      this.$emit("initSize")
    },
    sel_area(e) {
      this.$emit("sel_area")
      e.preventDefault()
      e.stopPropagation()
      e.cancelBubble = true
    },
    fullScreen() {
      if (!this.isFullScreen) {
        const root = document.getElementById("svgContent")
        root.webkitRequestFullScreen()
      } else {
        document.webkitExitFullscreen()
      }
      this.isFullScreen = !this.isFullScreen
    },
    changeModelRunningStatus() {
      this.$emit('changeModelRunningStatus', !this.modelRunningStatus)
    }
  }
}
</script>

<style lang="scss" scoped>
.control_menu {
  height: 30px;
  background: #cccccc;
  padding-left: 5px;
  padding-right: 5px;
  justify-content: space-around;
  display: flex;
  position: fixed;
  user-select: none;
  span {
    height: 20px;
    width: 30px;
    cursor: pointer;
    display: block;
    border-radius: 50%;
    text-align: center;
    transform: translateY(5px);
  }
  span:hover {
    transform: scale(1.4);
    transform-origin: 50% 0;
  }
}
.sel_ing {
  color: #289de9;
  border: 1px solid #289de9 !important;
}
.icon {
  /* 通过设置 font-size 来改变图标大小 */
  width: 1em; height: 1em;
  /* 图标和文字相邻时，垂直对齐 */
  vertical-align: -0.15em;
  /* 通过设置 color 来改变 SVG 的颜色/fill */
  fill: currentColor;
  /* path 和 stroke 溢出 viewBox 部分在 IE 下会显示
      normalize.css 中也包含这行 */
  overflow: hidden;
}
</style>
