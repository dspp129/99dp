<template>
  <div>
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
          :transform="`translate(${item.posX}, ${item.posY})`"
          @contextmenu="r_click_nodes($event, i)"
          @dblclick="focusInput($event.path[0])"
          @mousedown="dragPre($event, i, item)">
          <foreignObject width="180" height="30">
            <Tooltip placement="top" transfer>
              <div slot="content">
                <span>{{item.jobName}}</span>
                <br />
                <span>计划时间：</span><Time :time="item.fireTime" type="datetime" />
                <br />
                <span>开始时间：</span><Time :time="item.startTime" type="datetime" />
                <br />
                <span>结束时间：</span><Time :time="item.endTime" type="datetime" />
              </div>
              <body xmlns="http://www.w3.org/1999/xhtml" style="margin: 0; background-color: rgba(255,255,255,0);" >
              <div>
                <div :class="`${getPaneNodeClass(item)} pane-node-content`">
                  <Icon :type="`${getPaneNodeIconClass(item.status)} icon`" />
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
        <SimulateArrow v-show="currentEvent === 'dragLink'" :dragLink="dragLink"/>
        <SimulateFrame  v-show="currentEvent === 'PaneDraging'" :dragFrame="dragFrame" />
        <Arrow v-for="edge in DataAll.edges" :key="edge.id" :each="edge" />
        <SimulateSelArea v-if="currentEvent === 'sel_area_ing'" :simulate_sel_area="simulate_sel_area" />
      </g>
      <EditArea
        v-model="showEditArea"
        :editAreaCoord="editAreaCoord"
        :chosenNode="chosenNode"
        @lookupUpstream="lookupUpstream"
        @lookupDownstream="lookupDownstream" />
      <Control
        @changeModelRunningStatus="changeModelRunningStatus"
        @initSize="initSize"
        @searchNode="drawer = true"
        @expandSize="expandSize"
        @shrinkSize="shrinkSize"
        @sel_area="sel_area"
        :modelRunningStatus="modelRunningStatus"
        :currentEvent="currentEvent" />
    </svg>
    <Drawer width="25" title="新增节点" draggable placement="left" :mask-closable="false" :mask="false" v-model="drawer">
    </Drawer>
  </div>
</template>

<script>

import historyList from './level.js'

import { mapState, mapActions } from 'vuex'
import SimulateSelArea from './components/simulateSelArea.vue'
import SimulateArrow from './components/simulateArrow.vue'
import SimulateFrame from './components/simulateFrame.vue'
import EditArea from './components/editArea.vue'
import Control from './components/control.vue'
import Arrow from './components/arrow.vue'

import * as recordApi from '@/api/record'

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
      showSpin: true,
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
      showEditArea: false, // 是否在编辑节点
      editAreaCoord: {
        x: -9999,
        y: -9999
      },
      chosenNode: {},
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
      drawer: false,
      map: new Map()
    }
  },
  computed: mapState({
    centerId: state => state.dag.centerId,
    DataAll: state => state.dag.DataAll,
    svgScale: state => state.dag.svgSize,
    historyList: state => state.dag.historyList
  }),
  watch: {
    centerId (centerId) {
      if (centerId && centerId > 0) this.init()
    }
  },
  created() {
    this.$nextTick(() => {
      this.setMouseWheelEvent()
    })
    this.commitGraph(historyList)
    this.init()
  },
  mounted() {
    sessionStorage["svg_left"] = 0
    sessionStorage["svg_top"] = 0
    document.getElementsByClassName('content-wrapper')[0].style.overflowY = 'hidden'
  },
  methods: {
    ...mapActions([
      'initGraph',
      'newGraph',
      'addEdge',
      'removeEdge',
      'mergeNode',
      'removeNode',
      'commitGraph',
      'showGraph',
      'saveGraph',
      'moveNode',
      'changeSize',
      'activeGraph',
      'stopGraph'
    ]),
    convertRecordToNode (record) {
      let status = 'error'
      if (record.status < 0) status = 'waiting'
      if (record.status === 0) status = 'running'
      if (record.status === 1 && [1, 7].indexOf(record.success) >= 0) status = 'success'

      return {
        pid: record.pid,
        jobName: record.jobName,
        recordId: record.recordId,
        posX: record.posX || 0,
        posY: record.posY || 0,
        fireTime: record.fireTime,
        startTime: record.startTime,
        endTime: record.endTime,
        in_ports: [0],
        out_ports: [0],
        status
      }
    },
    async init () {
      let result = await recordApi.getRecord(this.centerId)
      const self = this.convertRecordToNode(result.data)

      result = await recordApi.getRecordUpstream(this.centerId)
      const upstream = result.data

      const edges = upstream.map(e => {
        return {
          from: e.pid,
          to: self.pid,
          status: self.status
        }
      })

      const nodes = upstream.map(this.convertRecordToNode).concat(self)

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

      if (upstream.length === 0) nodes[0].level = 1
      else nodes.forEach(node => node.level = this.map.get(node.pid).level)
      

      // 根据level排序
      const sortBy = (a, b) => a.level - b.level
      nodes.sort(sortBy)

      // 获取图像
      this.initGraph({edges , nodes})
    },
    renderLevel(parentPid) {
      this.map.get(parentPid).child.forEach(pid => {
        let parentLevel = this.map.get(parentPid).level
        const child = this.map.get(pid)
        parentLevel += child.parent.length / 1000
        if (child.child.length > 0) parentLevel++
        if (parentLevel > child.level) child.level = parentLevel
        this.renderLevel(pid)
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
      this.selPaneNode(item.pid)
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
      if (this.currentEvent === 'sel_area') {
        this.selAreaStart(e)
      } else {
        // 那就拖动画布
        this.currentEvent = 'move_graph'
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
        const params = {
          model_id: sessionStorage["newGraph"],
          desp: {
            src_node_pid: this.DataAll.nodes[this.choice.index].pid,
            src_output_idx: this.choice.point,
            dst_node_pid: this.DataAll.nodes[i].pid,
            dst_input_idx: nth
          }
        }
        console.log(params)
        this.addEdge(params)
      }
      this.currentEvent = null
    },
    /**
     *  svg画板缩放行为
     */
    initSize() {
      this.changeSize("init") // 回归到默认倍数
      this.svg_left = 0 // 回归到默认位置
      this.svg_top = 0
      sessionStorage["svg_left"] = 0
      sessionStorage["svg_top"] = 0
    },
    expandSize() {
      this.changeSize("expend") // 画板放大0.1
    },
    shrinkSize() {
      this.changeSize("shrink") // 画板缩小0.1
    },
    onMouseWheel(e) { // 鼠标滚动或mac触摸板可以改变size
        if (!e) return false
        let multiple = (e.wheelDelta / 10)
        if (this.canMouseWheelUse && (multiple * multiple) > 1) {
          multiple > 0
          ? this.expandSize()
          : this.shrinkSize()
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
      this.currentEvent = 'sel_area'
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
        pid: this.DataAll.nodes[this.choice.index].pid,
        posX: x,
        posY: y
      }
      this.moveNode(params)
    },
    selPaneNode(pid) {
      // 单选节点
      this.choice.paneNode = []
      if (pid) {
        this.choice.paneNode.push(pid)
      }
      console.log('1目前选择的节点是' + pid)
    },
    selAreaStart(e) {
      // 框选节点开始
      this.currentEvent = 'sel_area_ing'
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
      const { left, top, width, height } = postions
      this.choice.paneNode.length = 0
      this.DataAll.nodes.forEach(item => {
        if (
          item.posX > left &&
          item.posX < left + width &&
          item.posY > top &&
          item.posY < top + height
        ) {
          this.choice.paneNode.push(item.pid)
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
    r_click_nodes(e, i) {
      // 节点右键模态
      this.setInitRect()
      const x = e.x - this.initPos.left
      const y = e.y - this.initPos.top
      this.showEditArea = true
      this.editAreaCoord = {x,y}
      this.chosenNode = this.DataAll.nodes[i]
      e.stopPropagation()
      e.cancelBubble = true
      e.preventDefault()
    },
    async lookupStream(direction, record, addEdgeOnly) {
      const isUpStream = direction === 'up'
      const direction_zh_cn = isUpStream ? '上游' : '下游'
      if (!addEdgeOnly) this.$Message.loading({
        content: `正在查询所有${direction_zh_cn}依赖`,
        duration: 10
      })

      let result
      if (isUpStream) result = await recordApi.getRecordUpstream(record.recordId)
      else result = await recordApi.getRecordDownstream(record.recordId)
      if (!addEdgeOnly) this.$Message.destroy()
      const stream = result.data
      if (stream.length === 0) {
        if (!addEdgeOnly) this.$Message.info(`无${direction_zh_cn}依赖`)
        return
      }

      const existingNodes = stream.filter(item => this.DataAll.nodes.findIndex(node => node.pid === item.pid) >= 0)
      const newNodeCount = stream.length - existingNodes.length

      if (!addEdgeOnly) {
        const message = newNodeCount === 0 ? `所有${direction_zh_cn}依赖已存在` : '找到了' + newNodeCount + '个新的调度'
        this.$Message.info(message)
      }

      const mergeNodes = addEdgeOnly ? existingNodes : stream
      mergeNodes.forEach(item => {
        const node = this.convertRecordToNode(item)
        this.mergeNode(node)
      })

      let node = this.convertRecordToNode(record)
      stream.forEach(item => {
        if (!isUpStream) node = this.convertRecordToNode(item)
        const src_node_pid = isUpStream ? item.pid : record.pid
        const dst_node_pid = isUpStream ? record.pid : item.pid
        const edge = {
          id: `${src_node_pid}-${dst_node_pid}`,
          status: node.status,
          src_output_idx: 0,
          dst_input_idx: 0,
          src_node_pid,
          dst_node_pid
        }
        this.addEdge(edge)
        if (!addEdgeOnly) {
          this.lookupStream('up', item, true)
          this.lookupStream('down', item, true)
        }
      })
    },
    lookupUpstream (record) {
      this.lookupStream('up', record)
    },
    lookupDownstream (record) {
      this.lookupStream('down', record)
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
      if (this.choice.paneNode.indexOf(node.pid) >= 0) className += ' selected'
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
    document.getElementsByClassName('content-wrapper')[0].style.overflowY = 'hidden'
  },
  deactivated () {
    document.getElementsByClassName('content-wrapper')[0].style.overflowY = 'auto'
  }
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
