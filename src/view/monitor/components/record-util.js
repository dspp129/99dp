import * as recordApi from '@/api/record'

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

const forceButton = (h, currentRowData, vm) => {
  return h('Poptip', {
    props: {
      // information-circled
      confirm: true,
      title: '强制执行这个任务?',
      transfer: true,
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
      transfer: true,
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
      title: '终止这个任务?',
      transfer: true,
      placement: 'top-end'
    },
    style: {
      marginLeft: '10px'
    },
    on: {
      'on-ok': async () => {
        operateRecord('kill', currentRowData.recordId, vm)
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
      content: '再次执行',
      transfer: true
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


export const operateRecord = async (action, recordId, vm) => {
  vm.$Loading.start()
  let result = {}
  switch (action) {
    case 'kill' : result = await recordApi.killRecord(recordId)
      break
    case 'force' : result = await recordApi.forceRecord(recordId)
      break
    case 'cancel' : result = await recordApi.cancelRecord(recordId)
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
    default : return h('Tag', { props: { color: 'default' } }, '未 知')
    // case 6 : return h('Tag', {props:{color:'red'}}, '被 杀')
  }
}

export const renderOperation = (h, currentRowData, vm) => {
  if (currentRowData.status === 0) { // 执行中
    return h('div', [
      reviewButton(h, currentRowData, vm),
      killButton(h, currentRowData, vm)
    ])
  } else if (currentRowData.status < 0) { // 等待中
    return h('div', [
      reviewButton(h, currentRowData, vm),
      cancelButton(h, currentRowData, vm),
      forceButton(h, currentRowData, vm)
    ])
  } else { // 运行结束，非成功
    return h('div', [
      reviewButton(h, currentRowData, vm),
      rerunButton(h, currentRowData, vm)
    ])
  }
}
