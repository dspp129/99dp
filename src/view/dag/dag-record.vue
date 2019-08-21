<template>
  <svg
    id="svgContent"
    :style="{cursor: this.currentEvent === 'move_graph' ? 'grabbing' : 'grab'}"
    xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="100%" height="1029" data-spm-anchor-id="TODO.11007039.0.i6.12b64a9bcbXQmm"
    @mousedown="svgMouseDown"
    @mousemove="dragIng($event)"
    @mouseleave="atMouseOut"
    @mouseup="dragEnd($event)">
    <g :transform="`translate(${svg_left}, ${svg_top}) scale(${svgScale})`">
      <g v-for="(item, i) in DataAll.nodes"
        :key="'_' + i" class="svgEach"
        :transform="`translate(${item.pos_x}, ${item.pos_y})`"
        @contextmenu="r_click_nodes($event, i)"
        @dblclick="focusInput($event.path[0])"
        @mousedown="dragPre($event, i, item)">
        <foreignObject width="180" height="30">
          <Tooltip placement="top" transfer>
            <div slot="content">
              <span>{{item.jobName}}</span>
              <br />
              <span>计划时间：{{item.fireTime}}</span>
              <br />
              <span>开始时间：{{item.startTime}}</span>
              <br />
              <span>结束时间：{{item.endTime}}</span>
            </div>
            <body xmlns="http://www.w3.org/1999/xhtml" style="margin: 0; background-color: rgba(255,255,255,0);" >
            <div>
              <div :class="`${getPaneNodeClass(item)} pane-node-content`">
                <Icon :type="`${getPaneNodeIconClass(item.status)} icon icon-data`" />
                <span class="name">{{item.jobName}}</span>
              </div>
              <div :class="currentEvent === 'dragLink' ? 'pane-node-parent-hl' : 'pane-node-parent' ">
                <div v-for="(poi, nth) in item.in_ports" :key="'__' + nth" :style="{width: `${ 100 / (item.in_ports.length + 1)}%`}">
                  <span class="space" @mouseup="linkEnd(i, nth)"></span>
                </div>
              </div>
              <div class="pane-node-children">
                <div v-for="(poi, nth) in item.out_ports" :key="'___' + nth" :style="{width: `${ 100 / (item.out_ports.length + 1)}%`}">
                  <span class="space" @mousedown="linkPre($event, i, nth)"></span>
                </div>
              </div>
            </div>
            </body>
          </Tooltip>
        </foreignObject>
      </g>
      <SimulateArrow v-if="currentEvent === 'dragLink'" :dragLink="dragLink"/>
      <SimulateFrame  v-if="currentEvent === 'PaneDraging'" :dragFrame="dragFrame" />
      <Arrow v-for="(each, n) in DataAll.edges" :key="'____' + n" :DataAll="DataAll" :each="each" :index="n" />
      <SimulateSelArea v-if="['sel_area', 'sel_area_ing'].indexOf(currentEvent) !== -1" :simulate_sel_area="simulate_sel_area" />
    </g>
    <EditArea :isEditAreaShow="is_edit_area" @close_click_nodes="close_click_nodes"/>
    <Control
      @changeModelRunningStatus="changeModelRunningStatus"
      @sizeInit="sizeInit"
      @sizeExpend="sizeExpend"
      @sizeShrink="sizeShrink"
      @sel_area="sel_area"
      :modelRunningStatus="modelRunningStatus"
      :currentEvent="currentEvent" />
  </svg>
</template>
<script>

import edges from './edges.js'
import nodes from './nodes.js'

import { mapState, mapActions } from 'vuex'
import SimulateSelArea from './components/simulateSelArea.vue'
import SimulateArrow from './components/simulateArrow.vue'
import SimulateFrame from './components/simulateFrame.vue'
import EditArea from './components/editArea.vue'
import Control from './components/control.vue'
import Arrow from './components/arrow.vue'

export default {
  name: 'dag-record',
  components: {
    Arrow,
    SimulateArrow,
    SimulateFrame,
    EditArea,
    Control,
    SimulateSelArea
  },
  props: {
    model_id: {
      // 入参model_id 如果此入参存在,则认为是打开已保存的模型
      type: String,
      default: null
    },
    template: {
      // 入参template 如果model_id不存在, 则会新建一个此类型的模型.
      type: String,
      default: "default"
    }
  },
  data() {
    return {
      choice: {
        paneNode: [], // 选取的节点下标组
        index: -1,
        point: -1 // 选取的点数的下标
      },
      dragFrame: {
        // 节点模态
        posX: 9999,
        posY: 9999
      },
      dragLink: {
        // 连线模态
        fromX: 0,
        fromY: 0,
        toX: 0,
        toY: 0
      },
      currentEvent: null, // 当前执行的方法
      initPos: {
        // 初始化svg dom位置
        left: -1,
        top: -1
      },
      timeStamp: '',
      is_edit_area: {
        value: false,
        x: -9999,
        y: -9999
      }, // 是否在编辑节点
      simulate_sel_area: {
        // 框选节点
        left: 10,
        top: 50,
        width: 0,
        height: 0
      },
      svg_left: 0,
      svg_top: 0,
      svg_trans_init: {
        x: 0,
        y: 0
      },
      canMouseWheelUse: true,
      step: 0, // 模型训练计步
      modelRunningStatus: false,
      nextStep: null,
      map: new Map()
    }
  },
  computed: mapState({
    DataAll: state => state.dag.DataAll,
    svgScale: state => state.dag.svgSize,
    historyList: state => state.dag.historyList
  }),
  created() {
    this.$nextTick(() => {
      this.setMouseWheelEvent()
    })
    this.init()
  },
  mounted() {
    sessionStorage["svg_left"] = 0
    sessionStorage["svg_top"] = 0
  },
  methods: {
    ...mapActions([
      'initGraph',
      'newGraph',
      'addEdge',
      'removeEdge',
      'addNode',
      'removeNode',
      'showGraph',
      'saveGraph',
      'moveNode',
      'changeSize',
      'activeGraph',
      'stopGraph'
    ]),
    async init() {
      edges.forEach(edge => {
        const from = this.map.get(edge.from) || { parent: [], child: [], level: 1 }
        from.child.push(edge.to)
        this.map.set(edge.from, from)

        const to = this.map.get(edge.to) || { parent: [], child: [], level: 1 }
        to.parent.push(edge.from)
        this.map.set(edge.to, to)
      })

      // 计算level
      this.map.forEach((v, k) => {
        if (v.parent.length === 0) this.renderLevel(k)
      })
      nodes.forEach(node => node.level = this.map.get(node.nodeId).level)

      // 根据level排序
      const sortBy = (a, b) => a.level - b.level
      nodes.sort(sortBy)

      //nodes.forEach(node => console.log(`nodeId: ${node.nodeId} , level: ${node.level}, name: ${node.jobName}`))

      // 获取图像
      this.initGraph({edges , nodes})
    },
    renderLevel(parentNodeId) {
      this.map.get(parentNodeId).child.forEach(nodeId => {
        let parentLevel = this.map.get(parentNodeId).level
        const child = this.map.get(nodeId)
        parentLevel += child.parent.length / 1000
        if (child.child.length > 0) parentLevel++
        if (parentLevel > child.level) child.level = parentLevel
        this.renderLevel(nodeId)
      })
    },
    startActive() {
      // 激活图像状态变更
      console.log(this.step)
      const step = this.step
      if (step === this.historyList.length || !this.modelRunningStatus) return false
      this.activeGraph(step)
      
      let timeout = 0
      if (step < this.historyList.length - 1) {
        timeout = (this.historyList[step + 1].timer - this.historyList[step].timer) * 1000
      }
      this.nextStep = setTimeout(() => {
        this.step++
        this.startActive()
      }, timeout)
    },
    atMouseOut() {
      // 鼠标移出
      this.currentEvent = null
    },
    /**
     * 事件分发器
     */
    dragPre(e, i, item) {
      // 准备拖动节点
      this.setInitRect() // 工具类 初始化dom坐标
      this.currentEvent = "dragPane" // 修正行为
      this.choice.index = i
      this.timeStamp = e.timeStamp
      this.selPaneNode(item.id)
      this.setDragFramePosition(e)
      e.preventDefault()
      e.stopPropagation()
      e.cancelBubble = true
    },
    dragIng(e) {
      // 事件发放器 根据currentEvent来执行系列事件
      switch (this.currentEvent) {
        case 'dragPane':
          if (e.timeStamp - this.timeStamp > 200) {
            this.currentEvent = "PaneDraging" // 确认是拖动节点
          }
          break
        case 'PaneDraging':
           this.setDragFramePosition(e) // 触发节点拖动
           break
        case 'dragLink':
          this.setDragLinkPostion(e) // 触发连线拖动
          break
        case 'sel_area_ing':
          this.setSelAreaPostion(e) // 触发框选
          break
        case 'move_graph':
          this.graphMoveIng(e)
          break
        default: () => {}
      }
    },
    dragEnd(e) {
      // 拖动结束
      switch (this.currentEvent) {
        case 'PaneDraging': this.paneDragEnd(e) // 触发节点拖动结束
          break
        case 'sel_area_ing': this.getSelNodes(this.simulate_sel_area)
          break
        default: () => {}
      }
      this.currentEvent = null
    },
    svgMouseDown(e) {
      if (e.button === 2) return
      // svg鼠标按下触发事件分发
      this.setInitRect()
      if (this.currentEvent === "sel_area") {
        this.selAreaStart(e)
      } else {
        // 那就拖动画布
        this.currentEvent = "move_graph"
        this.graphMovePre(e)
      }
    },
    /**
     * 连线系列事件
     */
    linkPre(e, i, nth) {
      // 开始连线
      this.setInitRect()
      this.currentEvent = "dragLink"
      this.choice = Object.assign({}, this.choice, { index: i, point: nth })
      this.setDragLinkPostion(e, true)
      e.preventDefault()
      e.stopPropagation()
    },

    linkEnd(i, nth) {
      // 连线结束 i, 目标点序号 nth 出发点 choice.index 出发点序号 choice.point
      if (this.currentEvent === "dragLink") {
        let params = {
          model_id: sessionStorage["newGraph"],
          desp: {
            src_node_id: this.DataAll.nodes[this.choice.index].id,
            src_output_idx: this.choice.point,
            dst_node_id: this.DataAll.nodes[i].id,
            dst_input_idx: nth
          }
        }
        this.addEdge(params)
      }
      this.currentEvent = null
    },
    /**
     *  svg画板缩放行为
     */
    sizeInit() {
      this.changeSize("init") // 回归到默认倍数
      this.svg_left = 0 // 回归到默认位置
      this.svg_top = 0
      sessionStorage["svg_left"] = 0
      sessionStorage["svg_top"] = 0
    },
    sizeExpend() {
      this.changeSize("expend") // 画板放大0.1
    },
    sizeShrink() {
      this.changeSize("shrink") // 画板缩小0.1
    },
    onMouseWheel(e) { // 鼠标滚动或mac触摸板可以改变size
        if (!e) return false
        let multiple = (e.wheelDelta / 10)
        if (this.canMouseWheelUse && (multiple * multiple) > 1) {
          multiple > 0
          ? this.sizeExpend()
          : this.sizeShrink()
          this.canMouseWheelUse = false
          setTimeout(() => { // 节流
            this.canMouseWheelUse = true
          }, 50)
        }
      },
    setMouseWheelEvent() { // 绑定鼠标滚轮事件
      const addEvent = (obj, xEvent, fn) => {
        if (obj.attachEvent) {
          obj.attachEvent('on' + xEvent, fn)
        } else {
          obj.addEventListener(xEvent, fn, false)
        }
      }

      const oDiv = document.getElementById('svgContent')
      // 当滚轮事件发生时，执行onMouseWheel这个函数
      addEvent(oDiv, 'mousewheel', this.onMouseWheel)
      addEvent(oDiv, 'DOMMouseScroll', this.onMouseWheel)
    },
    /**
     * 节点事件 单选 框选 拖动
     */
    sel_area() {
      this.currentEvent = "sel_area"
      this.simulate_sel_area = {
        left: 0,
        top: 0,
        width: 0,
        height: 0
      }
    },
    paneDragEnd(e) {
      // 节点拖动结束
      this.dragFrame = { dragFrame: false, posX: 0, posY: 0 }
      const x = (e.x - this.initPos.left - (sessionStorage["svg_left"] || 0)) / this.svgScale - 90
      const y = (e.y - this.initPos.top - (sessionStorage["svg_top"] || 0)) / this.svgScale - 15
      const params = {
        model_id: sessionStorage["newGraph"],
        id: this.DataAll.nodes[this.choice.index].id,
        pos_x: x,
        pos_y: y
      }
      this.moveNode(params)
    },
    selPaneNode(id) {
      // 单选节点
      this.choice.paneNode = []
      if (id) {
        this.choice.paneNode.push(id)
      }
      console.log('1目前选择的节点是' + id + ' , level:'+this.map.get(id).level)
    },
    selAreaStart(e) {
      // 框选节点开始
      this.currentEvent = "sel_area_ing"
      const x = (e.x - this.initPos.left - (sessionStorage["svg_left"] || 0)) / this.svgScale
      const y = (e.y - this.initPos.top - (sessionStorage["svg_top"] || 0)) / this.svgScale
      this.simulate_sel_area = {
        left: x,
        top: y,
        width: 0,
        height: 0
      }
    },
    setSelAreaPostion(e) {
      // 框选节点ing
      const x = (e.x - this.initPos.left - (sessionStorage["svg_left"] || 0)) / this.svgScale
      const y = (e.y - this.initPos.top - (sessionStorage["svg_top"] || 0)) / this.svgScale
      const width = x - this.simulate_sel_area.left
      const height = y - this.simulate_sel_area.top
      this.simulate_sel_area.width = width
      this.simulate_sel_area.height = height
    },
    getSelNodes(postions) {
      // 选取框选的节点
      console.log('position', this.DataAll)
      const { left, top, width, height } = postions
      this.choice.paneNode.length = 0
      this.DataAll.nodes.forEach(item => {
        if (
          item.pos_x > left &&
          item.pos_x < left + width &&
          item.pos_y > top &&
          item.pos_y < top + height
        ) {
          this.choice.paneNode.push(item.id)
        }
      })
      console.log('2目前选择的节点是', this.choice.paneNode)
      this.simulate_sel_area = {
        // 触发框选结束
        left: 0,
        top: 0,
        width: 0,
        height: 0
      }
    },
    focusInput(el) { // 双击选中input
      if (el) { el.focus() }
    },
    /**
     * 画布拖动
     */
    graphMovePre(e) {
      const { x, y } = e
      this.svg_trans_init = { x, y }
      this.svg_trans_pre = { x: this.svg_left, y: this.svg_top }
    },
    graphMoveIng(e) {
      const { x, y } = this.svg_trans_init
      this.svg_left = e.x - x + this.svg_trans_pre.x
      this.svg_top = e.y - y + this.svg_trans_pre.y
      sessionStorage["svg_left"] = this.svg_left
      sessionStorage["svg_top"] = this.svg_top
    },
    /**
     * 模态框类
     */
    setDragFramePosition(e) {
      // 节点拖拽模态
      const x = e.x - this.initPos.left - (sessionStorage["svg_left"] || 0)
      const y = e.y - this.initPos.top - (sessionStorage["svg_top"] || 0)
      this.dragFrame = {
        posX: x / this.svgScale - 90,
        posY: y / this.svgScale - 15
      }
    },
    setDragLinkPostion(e, init) {
      // 节点连线模态
      const x = (e.x - this.initPos.left - (sessionStorage["svg_left"] || 0)) / this.svgScale
      const y = (e.y - this.initPos.top - (sessionStorage["svg_top"] || 0)) / this.svgScale
      if (init) {
        this.dragLink = Object.assign({}, this.dragLink, {
          fromX: x,
          fromY: y
        })
      }
      this.dragLink = Object.assign({}, this.dragLink, { toX: x, toY: y })
    },
    close_click_nodes() {
      // 关闭模态
      this.is_edit_area = { value: false }
    },
    r_click_nodes(e, i) {
      // 节点右键模态
      this.setInitRect()
      const id = this.DataAll.nodes[i].id
      const x = e.x - this.initPos.left
      const y = e.y - this.initPos.top
      this.is_edit_area = {
        value: true,
        x,
        y,
        id
      }
      e.stopPropagation()
      e.cancelBubble = true
      e.preventDefault()
    },
    /**
     * 工具类
     */
    setInitRect() {
      // 矫正svg组件坐标
      const { left, top } = document.getElementById("svgContent").getBoundingClientRect()
      this.initPos = { left, top }
    },
    /**
     * 执行&暂停模型训练模拟
     */
    changeModelRunningStatus(status) {
       if (!status) {
         if (this.step > 0) { this.step-- }
        this.modelRunningStatus = status
        this.stopGraph()
      } else {
        this.modelRunningStatus = status
        this.startActive()
      }
    },
    getPaneNodeClass(node) {
      let className = 'pane-node-waiting'
      switch (node.status) {
        case 'waiting':
          className = 'pane-node-waiting'
          break
        case 'running':
          className = 'pane-node-running'
          break
        case 'success':
          className = 'pane-node-success'
          break
        case 'pause':
          className = ''
          break
        case 'failure':
          className = 'pane-node-error'
          break
        default:
      }
      if (this.choice.paneNode.indexOf(node.id) >= 0) className += ' selected'
      return className
    },
    getPaneNodeIconClass(status) {
      switch (status) {
        case 'running': return 'ios-loading pane-icon-running'
        case 'success': return 'md-checkmark pane-icon-success'
        case 'pause':   return 'ios-pause'
        case 'failure': return 'ios-close pane-icon-error'
        case 'waiting':
        default:
          return 'ios-timer-outline pane-icon-waiting'
      }
    }
  },
  activated () {
    console.log('activated')
    document.getElementsByClassName('content-wrapper')[0].style.overflowY = 'hidden'
  },
  deactivated () {
    console.log('deactivated')
    document.getElementsByClassName('content-wrapper')[0].style.overflowY = 'auto'
  },
}
</script>

<style lang="scss" scoped>
.svgEach {
  position: relative;
}
.pane-node-content {
  box-sizing: border-box;
  width: 180px;
  height: 30px;
  background-color: hsla(0, 0%, 100%, 0.9);
  border: 1px solid #289de9;
  border-radius: 15px;
  font-size: 12px;
  -webkit-transition: background-color 0.2s;
  transition: background-color 0.2s;
  .icon {
    width: 26px;
    height: 26px;
    margin: 1px;
    border-radius: 100%;
    float: left;
    color: #fff;
    font-size: 26px;
    background-color: #289de9;
    cursor: pointer;
  }
  .name {
    float: left;
    margin-left: 4px;
    width: 135px;
    // height: 28px;
    line-height: 28px;
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
    height: 26px;
    background: transparent;
    border: none;
  }
  .parentLink {
    font-size: 0;
    height: 12px;
    width: 12px;
    position: absolute;
    top: 0;
    left: 90px;
    transform: translateX(-50%);
    border-top: 6px solid black;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
  }
  .childLink {
    height: 10px;
    width: 10px;
    position: absolute;
    bottom: 0;
    left: 90px;
    transform: translate(-50%, 50%);
    border-radius: 50%;
    background: #ffffff;
    cursor: crosshair;
  }
}
.pane-node-parent-hl {
  position: fixed;
  top: -5px;
  height: 10px;
  width: 100%;
  display: flex;
  transform: translateX(6px);
  .space {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1px solid gray;
    background: #ffffff;
    position: absolute;
    right: 0;
    top: 0;
    cursor: crosshair;
  }
  .space:hover {
    box-shadow: 0 0 0 6px #3ddd73;
  }
}
.pane-node-running {
  border-color: #ff9900 !important;
}
.pane-node-success {
  border-color: #19be6b !important;
}
.pane-node-error {
  border-color: #ed4014 !important;
}
.pane-icon-waiting {
  background: #5cadff !important;
}
.pane-icon-success {
  background: #19be6b !important;
}
.pane-icon-error {
  background: #ed4014 !important;
}
.pane-icon-running {
  background: #ff9900 !important;
  -webkit-animation:circle 1.5s infinite linear;
}
@-webkit-keyframes circle {
  0% {
    transform:rotate(0deg);
  }
  100% {
    transform:rotate(360deg);
  }
}

.pane-node-parent-hl > div {
  position: relative;
  display: inline-block;
}

.pane-node-parent {
  position: fixed;
  top: -5px;
  height: 10px;
  width: 100%;
  display: flex;
  opacity: 0;
  transform: translateX(6px);
  .space {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1px solid gray;
    background: #ffffff;
    position: absolute;
    right: 0;
    top: 0;
  }
}

.pane-node-parent > div {
  position: relative;
  display: inline-block;
}

.pane-node-children {
  position: fixed;
  bottom: 0;
  width: 100%;
  display: flex;
  opacity: 0;
  transform: translateX(6px);
  .space {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1px solid gray;
    background: #ffffff;
    position: absolute;
    right: 0px;
    bottom: -6px;
    cursor: crosshair;
  }
  .space:hover {
    background: #cccccc;
  }
}
.pane-node-children:hover {
  opacity: 1;
}

.pane-node-children > div {
  position: relative;
  display: inline-block;
}

.selected {
  background: rgba(227, 244, 255, 0.9) !important;
}
.connector {
  stroke: hsla(0, 0%, 50%, 0.6);
  stroke-width: 2px;
  fill: none;
}
</style>
