import iView from 'iview'

const notice = params => {
  switch (params.type) {
    case 'success' : iView.Notice.success(params)
     break
    case 'warning' : iView.Notice.warning(params)
     break
    case 'error' : iView.Notice.error(params)
      break
    default : iView.Notice.info(params)
  }
}

export default {
  state: {
    model: { type: 'group', id: 0 },
    DataAll: { edges: [], nodes: [] },
    svgSize: 1,
    historyList: []
  },
  actions: {
    initGraph: ({ commit }, {edges , nodes}) => {
      // 打开图
      // startLoading('正在初始化模型')
      let ordinal = 0
      const _nodes = nodes.map((node, i) => {
        // level[nodeId] 节点层级  leveltTrans[level[nodeId]].indexOf(nodeId) 相同层级节点的序号 0为主节点 其余为辅助节点
        const deep = parseInt(node.level)
        if (i === 0 || parseInt(nodes[i-1].level) !== deep) ordinal = 0
        else ordinal++
        const isOdd = deep % 2 !== 0 ? -1 : 1
        node.posX = node.posX ||
            700 +
            250 * isOdd +
            (Math.random() - 0.5) * 10 +
            (ordinal === 0
              ? 0
              : isOdd * 500 + Math.abs(5 - ordinal) * isOdd * -75)
        node.posY = node.posY ||
            deep * 170 -
            100 +
            (ordinal === 0 ? 0 : (4 - ordinal) * 50) +
            (Math.random() - 0.5) * 10
        return node
      })
      const _edges = edges.map((item, i) => {
        return {
          id: item.from + '-' + item.to,
          status: item.status,
          dst_input_idx: 0,
          dst_node_pid: item.to,
          src_output_idx: 0,
          src_node_pid: item.from
        }
      })
      commit('UPDATE_DATA', { edges: _edges, nodes: _nodes })
    },
    commitGraph: ({ commit }, params) => {
      commit('INIT_DATA', params)
    },
    // 模型激活
    activeGraph: ({ commit, state }, step) => {
      const action = state.historyList[step].action
      commit('ACTIVE_DATA', action)
    },
    // 模型暂停
    stopGraph: ({ commit, state }) => {
      commit('STOP_DATA')
    },
    showGraph: ({ commit }, model_id) => {
      // 打开暂存的图
    },
    newGraph: ({ commit }, params) => {
      // 新增图
    },
    addEdge: ({ commit }, edge) => {
      // 增加边
      commit('ADD_EDGE_DATA', edge)
    },
    removeEdge: ({ commit }, { id }) => {
      // 删除边
      commit('DEL_EDGE_DATA', id)
    },
    moveNode: ({ commit }, params) => {
      // 移动点的位置
      commit('MOVE_NODE_DATA', params)
    },
    mergeNode: ({ commit }, node) => {
      // 增加节点
      commit('ADD_NODE_DATA', node)
    },
    removeNode: ({ commit }, { jobId }) => {
      // 删除节点
      commit('DEL_NODE_DATA', jobId)
    },
    saveGraph: () => {},
    changeSize: ({ commit }, action) => {
      // 改变size
      commit('CHANGE_SIZE', action)
    }
  },
  mutations: {
    CHANGE_SIZE: (state, action) => {
      switch (action) {
        case 'init':
          state.svgSize = 1
          break
        case 'expend':
          state.svgSize += 0.1
          break
        case 'shrink':
          if (state.svgSize > 0.2) state.svgSize -= 0.1
          break
        default:
          break
      }
      sessionStorage['svgScale'] = state.svgSize
    },
    INIT_DATA: (state, params) => {
      state.historyList = params
    },
    ACTIVE_DATA: (state, action) => {
      const nodes = state.DataAll.nodes
      const edges = state.DataAll.edges
      const typeToText = {
        waiting: ['等待资源', 'info', '等待', 'waiting'],
        running: ['任务运行', 'info', '运行', 'running'],
        success: ['运行成功', 'success', '完成', 'success'],
        failure: ['运行失败', 'error', '失败', 'failure'],
        timeout: ['运行超时', 'error', '超时', 'timeout'],
        termination: ['训练终止', 'error', '终止', 'termination']
      }
      action.forEach((item, i) => {
        // 节点的动作
        nodes.forEach(node => {
          if (node.jobId === item.jobId) {
            node.status = typeToText[item.status][3]
            node.startTime = item.startTime
            node.endTime = item.endTime
            window.setTimeout(() => {
              notice({
                title: typeToText[item.status][0],
                type: typeToText[item.status][1],
                desc: `${node.jobName}节点已${typeToText[item.status][2]}`
              })
            }, i * 200)
          }
        })
        edges.forEach(each => {
          if (each.dst_node_pid === item.jobId) {
            each.status = typeToText[item.status][3]
          }
        })
      })
      state.DataAll = JSON.parse(JSON.stringify(state.DataAll))
    },
    STOP_DATA: state => {
      const nodes = state.DataAll.nodes
      const edges = state.DataAll.edges
      console.log(nodes, edges)
      nodes.forEach(item => {
        item.status === 'running' ? (item.status = 'pause') : ''
      })
      edges.forEach(item => {
        item.status === 'running' ? (item.status = 'pause') : ''
      })
      notice({
        title: '停止训练',
        type: 'error',
        message: `模型训练已暂停!`
      })
      state.DataAll = JSON.parse(JSON.stringify(state.DataAll))
    },
    // 更新图示内容
    UPDATE_DATA: (state, data) => {
      state.DataAll = data
      // closeLoading()
    },
    MOVE_NODE_DATA: (state, params) => {
      const _DataAll = state.DataAll
      params.jobIds.forEach(jobId => {
        _DataAll.nodes.forEach(node => {
          if (node.jobId === jobId) {
            node.posX += params.offsetX
            node.posY += params.offsetY
          }
        })
      })
    },
    ADD_EDGE_DATA: (state, edge) => {
      if (edge.src_node_pid === edge.dst_node_pid) return
      const _nodes = state.DataAll.nodes
      const _edges = state.DataAll.edges

      const startingPoint = _nodes.findIndex(item => item.jobId === edge.src_node_pid)
      const destination = _nodes.findIndex(item => item.jobId === edge.dst_node_pid)
      if (startingPoint < 0 || destination < 0) return // 未找到起点与终点，无法连线

      const index = _edges.findIndex(item => item.src_node_pid === edge.src_node_pid && item.dst_node_pid === edge.dst_node_pid)
      if (index >= 0) _edges.splice(index, 1, edge)
      else _edges.push(edge)
      /**
       * 检测是否成环
       **/
      let isCircle = false
      const { dst_node_pid } = edge // 出口 入口id
      const checkCircle = (dst_node_pid, nth) => {
        if (nth > _edges.length) {
          isCircle = true
          return false
        } else {
          _edges.forEach(item => {
            if (item.src_node_pid === dst_node_pid) {
              console.log('目标节点是', item.src_node_pid, '次数为', nth)
              checkCircle(item.dst_node_pid, ++nth)
            }
          })
        }
      }
      checkCircle(dst_node_pid, 1)
      if (isCircle) {
        _edges.pop()
        alert('禁止成环')
      }
    },
    DEL_EDGE_DATA: (state, id) => {
      const _edges = []
      state.DataAll.edges.forEach((item, i) => {
        if (item.id !== id) {
          _edges.push(item)
        }
      })
      state.DataAll.edges = _edges
    },
    DEL_NODE_DATA: (state, jobId) => {
      const _edges = []
      const _nodes = []
      state.DataAll.edges.forEach(item => {
        if (item.dst_node_pid !== jobId && item.src_node_pid !== jobId) {
          _edges.push(item)
        }
      })
      state.DataAll.nodes.forEach(item => {
        if (item.jobId !== jobId) {
          _nodes.push(item)
        }
      })
      state.DataAll.edges = _edges
      state.DataAll.nodes = _nodes
    },
    ADD_NODE_DATA: (state, node) => {
      const _nodes = state.DataAll.nodes
      const i = _nodes.findIndex(item => item.jobId === node.jobId)
      if (i >= 0) {
        node.posX = _nodes[i].posX
        node.posY = _nodes[i].posY
        node.level = _nodes[i].level
        _nodes.splice(i, 1, node)
      } else {
        _nodes.push(node)
      }
    }
  }
}
