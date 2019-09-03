import * as recordApi from '@/api/record'
import { oneOf } from '@/libs/tools'
import * as formatter from '@/libs/format'

const reviewButton = (h, currentRowData, vm) => {
  return h('Button', {
    props: {
      ghost: true,
      type: 'info',
      size: 'small',
      icon: 'md-open',
      shape: 'circle'
    },
    on: {
      click: () => {
        vm.$router.push({
          name: 'record',
          params: currentRowData
        })
        vm.$emit('on-open', currentRowData.recordId)
      }
    }
  })
}

const dependButton = (h, currentRowData, vm) => {
  return h('Button', {
    props: {
      size: 'small',
      icon: 'md-git-network',
      shape: 'circle'
    },
    style: {
      marginLeft: '10px'
    },
    on: {
      click: () => {
        vm.$store.state.dag.centerId = currentRowData.recordId
        vm.$router.push({
          name: 'record-dag'
        })
      }
    }
  })
}

const forceButton = (h, currentRowData, vm) => {
  return h('Poptip', {
    props: {
      // information-circled
      confirm: true,
      title: '强制执行这个任务?',
      placement: 'top-end'
    },
    style: {
      marginLeft: '10px'
    },
    on: {
      'on-ok': () => {
        operateRecord('force', currentRowData.recordId, vm)
      }
    }
  }, [
    h('Button', {
      props: {
        size: 'small',
        icon: 'md-play',
        shape: 'circle'
      }
    })
  ])
}

const cancelButton = (h, currentRowData, vm) => {
  return h('Poptip', {
    props: {
      // information-circled
      confirm: true,
      title: '取消这个任务?',
      placement: 'top-end'
    },
    style: {
      marginLeft: '10px'
    },
    on: {
      'on-ok': () => {
        operateRecord('cancel', currentRowData.recordId, vm)
      }
    }
  }, [
    h('Button', {
      props: {
        ghost: true,
        type: 'error',
        size: 'small',
        icon: 'md-power',
        shape: 'circle'
      }
    })
  ])
}

const killButton = (h, currentRowData, vm) => {
  return h('Poptip', {
    props: {
      // information-circled
      confirm: true,
      title: '终止当前任务及重跑?',
      'cancel-text': '终止当前',
      'ok-text': '终止全部',
      placement: 'top-end'
    },
    style: {
      marginLeft: '10px'
    },
    on: {
      'on-cancel': async () => {
        operateRecord('kill', currentRowData.recordId, vm)
      },
      'on-ok': async () => {
        operateRecord('terminate', currentRowData.recordId, vm)
      }
    }
  }, [
    h('Button', {
      props: {
        ghost: true,
        type: 'error',
        size: 'small',
        icon: 'md-pause',
        shape: 'circle'
      }
    })
  ])
}

export const rerunButton = (h, currentRowData, vm) => {
  return h('Tooltip', {
    props: {
      placement: 'top',
      content: '再次执行'
    },
    style: {
      marginLeft: '10px'
    },
  }, [
    h('Button', {
      props: {
        ghost: true,
        type: 'warning',
        size: 'small',
        icon: 'md-redo',
        shape: 'circle'
      },
      on: {
        click: () => {
          vm.rerun(currentRowData)
        }
      }
    })
  ])
}

export const markAsSuccessButton = (h, currentRowData, vm) => {
  return h('Poptip', {
    props: {
      confirm: true,
      placement: 'top-end',
      title: '将其标记为成功?'
    },
    style: {
      marginLeft: '10px'
    },
    on: {
      'on-ok': () => {
        operateRecord('markAsSuccess', currentRowData.recordId, vm)
      }
    }
  }, [
    h('Button', {
      props: {
        ghost: true,
        type: 'success',
        size: 'small',
        icon: 'md-checkmark',
        shape: 'circle'
      }
    })
  ])
}

export const operateRecord = async (action, recordId, vm) => {
  vm.$Loading.start()
  let result = {}
  switch (action) {
    case 'kill' : result = await recordApi.killRecord(recordId)
      break
    case 'terminate' : result = await recordApi.terminateRecord(recordId)
      break
    case 'force' : result = await recordApi.forceRecord(recordId)
      break
    case 'cancel' : result = await recordApi.cancelRecord(recordId)
      break
    case 'markAsSuccess' : result = await recordApi.markAsSuccessRecord(recordId)
      break
  }

  if (result.code !== 0) {
    vm.$Loading.error()
    vm.$Message.error(result.msg)
    return
  }
  setTimeout(() => {
    vm.$Loading.finish()
    vm.$Message.success('操作成功')
    vm.getData()
  }, 1000)
}

export const renderExecType = (h, currentRowData) => {
  switch (currentRowData.execType) {
    case 0: return h('Tag', { props: { color: 'green' } }, '自 动')
    case 1: return h('Tag', { props: { color: 'gold' } }, '手 动')
    case 2: return h('Tag', { props: { color: 'gold' } }, '手 动') // 调用api
    case 3: return h('Tag', { props: { color: 'default' } }, '重 跑')
    case 4: return h('Tag', { props: { color: 'default' } }, '批 量')
    case 5: return h('Tag', { props: { color: 'warning' } }, '强 制')
    default : return h('Tag', { props: { color: 'green' } }, '自 动')
  }
}

// 0-未调度, 1-等待中, 2-执行中, 3-成功, 4-失败, 5-超时被杀, 6-手动被杀
export const renderSuccess = (h, currentRowData) => {
  switch (currentRowData.status) {
    case -3: return h('Tag', { props: { color: 'blue' } }, '未开始')
    case -2:
    case -1: return h('Tag', { props: { color: 'blue' } }, '等 待')
    case 0: return h('Tag', { props: { color: 'gold' } }, '执行中')
    case 2: return h('Tag', { props: { color: 'red' } }, '终 止')
  }
  switch (currentRowData.success) {
    case 0 : return h('Tag', { props: { color: 'red' } }, '失 败')
    case 1 : return h('Tag', { props: { color: 'green' } }, '成 功')
    case 2 : return h('Tag', { props: { color: 'purple' } }, '被 杀')
    case 3 : return h('Tag', { props: { color: '#80848f' } }, '超 时')
    case 4 : return h('Tag', { props: { color: 'red' } }, ' 失 联')
    case 5 : return h('Tag', { props: { color: 'default' } }, ' 取 消')
    case 6 : return h('Tag', { props: { color: 'grey' } }, ' 取 消')
    case 7 : return h('Tag', { props: { color: 'green' } }, '标 记')
    default : return h('Tag', { props: { color: 'default' } }, '未 知')
  }
}

export const renderOperation = (h, currentRowData, vm) => {
  const review = reviewButton(h, currentRowData, vm)
  const kill = killButton(h, currentRowData, vm)
  const cancel = cancelButton(h, currentRowData, vm)
  const force = forceButton(h, currentRowData, vm)
  const depend = dependButton(h, currentRowData, vm)
  const rerun = rerunButton(h, currentRowData, vm)
  const markAsSuccess = markAsSuccessButton(h, currentRowData, vm)

  const buttonList = [review, depend]

  if (currentRowData.status === 0) { // 执行中
    buttonList.push(kill)
  } else if (currentRowData.status < 0) { // 等待中
    buttonList.push(cancel)
    buttonList.push(force)
  } else if (currentRowData.status === 1 && oneOf(currentRowData.success, [1, 7])) { // 运行结束，成功
    buttonList.push(rerun)
  } else { // 运行结束，非成功
    buttonList.push(rerun)
    buttonList.push(markAsSuccess)
  }
  return h('div', buttonList)
}


export const renderDurationTime = (h, currentRowData) => {
  if (oneOf(currentRowData.success, [5, 6])) return h('span','- -')
  switch (currentRowData.status) {
    case -3: 
    case -2:
    case -1: return h('span','- -')
    default: return h('span', formatter.timeDiff(currentRowData.startTime, currentRowData.endTime))
  }
}