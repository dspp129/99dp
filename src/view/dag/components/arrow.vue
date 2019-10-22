<!--  箭头渲染组件  -->
<template>
  <g>
    <path
      @mouseover="pathHover"
      @mouseout="pathOut"
      :class="lineClass"
      :d="computedLink"
      @contextmenu="rightClick($event)"
    />
    <polyline class="only-watch-el" :points="computedArrow" style="stroke:#006600;"/>
    <circle class="only-watch-el" :cx="computedCx" :cy="computedCy" r="5" style="stroke:#006600; stroke-width: 2; fill:#FFFFFF"/>
    <g v-show="rightClickMenu">
      <foreignObject width="100%" height="100%" style="position: relative" @click="click_menu_cover($event)">
        <body xmlns="http://www.w3.org/1999/xhtml" :style="menuStyle">
          <div class="menu_contain">
            <span @click="removeLink">删除</span>
          </div>
        </body>
      </foreignObject>
    </g>
  </g>
</template>
<script>

import { mapState, mapActions } from 'vuex'

export default {
  props: {
    each: {
      type: Object
    }
  },
  data() {
    return {
      isHover: false,
      rightClickMenu: false,
      menuStyle: {
        backgroundColor: 'rgba(255,255,255,0)',
        position: 'absolute',
        left: `${358}px`,
        top: `${264}px`,
        width: '150px',
        height: '26px'
      }
    }
  },
  methods: {
    ...mapActions(['removeEdge']),
    pathHover() {
      this.isHover = true
    },
    pathOut() {
      this.isHover = false
    },
    click_menu_cover(e) {
      // 点击遮罩
      this.rightClickMenu = false
      e.stopPropagation()
      e.preventDefault()
      e.cancelBubble = true
    },
    removeLink() { // 删除此条连线
      const params = {
        model_id: sessionStorage['newGraph'],
        id: this.each.id
      }
      this.removeEdge(params)
    },
    rightClick(e) {
      const x = e.offsetX
      const y = e.offsetY
      const svgScale = sessionStorage['svgScale'] || 1
      this.menuStyle = Object.assign({}, this.menuStyle, {
        left: `${(x - (sessionStorage['svgLeft'] || 0)) / svgScale}px`,
        top: `${(y - (sessionStorage['svgTop'] || 0)) / svgScale}px`
      })
      this.rightClickMenu = true
      e.stopPropagation()
      e.preventDefault()
      e.cancelBubble = true
    }
  },
  computed: mapState({
    DataAll: state => state.dag.DataAll,
    lineClass () {
      if (this.isHover || this.rightClickMenu) return 'connector-hl'
      switch (this.each.status) {
        case 'waiting' : return 'defaultArrow'
        case 'running' : return 'connector-active'
        case 'success' : return 'connector'
        case 'failure' :
        case 'timeout' :
        case 'termination' : return 'connector-error'
        default : return 'defaultArrow'
      }
      return 'connector'
    },
    computedLink () {
      // 计算起始点坐标
      if (!this.DataAll) {
        return `M 0 0 T 0 0`
      } else {
        const {
          dst_input_idx, // 目标
          dst_node_pid, // 目标id
          src_node_pid, // 来源id
          src_output_idx // 来源
        } = this.each
        const f_Pos = this.DataAll.nodes.find(item => item.jobId === src_node_pid)
        const t_Pos = this.DataAll.nodes.find(item => item.jobId === dst_node_pid)
        // if (!f_Pos) {
        //   alert(src_node_pid)
        // }
        // if (!t_Pos) {
        //   alert(dst_node_pid)
        // }
        const f_X = f_Pos.posX + (180 / (f_Pos.out_ports.length + 1)) * (src_output_idx + 1)
        const f_Y = f_Pos.posY + 30
        const t_X = t_Pos.posX + (180 / (t_Pos.in_ports.length + 1)) * (dst_input_idx + 1)
        const t_Y = t_Pos.posY
        return `M ${f_X} ${f_Y}  Q ${f_X} ${f_Y + 50} ${(t_X + f_X) / 2} ${(t_Y + f_Y) / 2} T ${t_X} ${t_Y}`
      }
    },
    computedArrow() {
      // 计算箭头坐标
      if (!this.DataAll) {
        return `0,0 0,0 0,0`
      } else {
        const {
          dst_input_idx,
          dst_node_pid,
          src_node_pid,
          src_output_idx
        } = this.each
        const t_Pos = this.DataAll.nodes.find(item => item.jobId === dst_node_pid)
        const t_X = t_Pos.posX + (180 / (t_Pos.in_ports.length + 1)) * (dst_input_idx + 1)
        const t_Y = t_Pos.posY
        return `${t_X} ${t_Y + 3} ${t_X - 3} ${t_Y - 3} ${t_X + 3} ${t_Y - 3}`
      }
    },
    computedCx () {
      const { src_node_pid, src_output_idx } = this.each
      const f_Pos = this.DataAll.nodes.find(item => item.jobId === src_node_pid)
      const f_X = f_Pos.posX + (180 / (f_Pos.out_ports.length + 1)) * (src_output_idx + 1)
      return `${f_X}`
    },
    computedCy () {
      const { src_node_pid } = this.each
      const f_Pos = this.DataAll.nodes.find(item => item.jobId === src_node_pid)
      const f_Y = f_Pos.posY + 30
      return `${f_Y}`
    }
  })
}
</script>

<style lang="less" scoped>
.only-watch-el {
  pointer-events: none;
}
.connector {
  stroke: hsla(0, 0%, 50%, 0.6);
  stroke-width: 2px;
  fill: none;
  cursor: pointer;
  stroke-dasharray: 100%;
  animation: line_success 2s;
  @keyframes line_success {
    0% {
      stroke-dashoffset: 100%;
    }
    100% {
      stroke-dashoffset: 0%;
    }
  }
}
.connector-active {
  stroke: rgba(255, 153, 0, 0.6);
  stroke-dasharray: 5;
  fill: none;
  cursor: pointer;
  stroke-width: 2px;
  stroke-dashoffset: 20px;
  animation: grown 4s infinite linear;
}
.connector-error {
  stroke: rgba(237, 64, 20, 0.6);
  stroke-width: 2px;
  fill: none;
  cursor: pointer;
}
.defaultArrow {
  stroke: hsla(0, 0%, 50%, 0.1);
  stroke-width: 2px;
  fill: none;
  cursor: pointer;
}
@keyframes grown {
  to{
    stroke-dashoffset: 0px;
  }
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
  cursor: pointer;
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
.menu_contain  span:hover {
    background-color: rgba(40, 157, 233, 0.3);
    cursor: none;
}
</style>
