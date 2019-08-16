import api from '@/libs/api.request'

export const getRecordList = ({ taskType, keyword, status, success, userId, taskId, agentId, startDate, endDate, warning, page, size }) => {
  let url = `/record/list?size=${size}&page=${page}`
  if (typeof taskType !== 'undefined') {
    url += `&taskType=${taskType}`
  }
  if (typeof keyword !== 'undefined') {
    url += `&keyword=${keyword}`
  }
  if (typeof status !== 'undefined') {
    url += `&status=${status}`
  }
  if (typeof success !== 'undefined') {
    url += `&success=${success}`
  }
  if (typeof userId !== 'undefined') {
    url += `&userId=${userId}`
  }
  if (typeof taskId !== 'undefined') {
    url += `&taskId=${taskId}`
  }
  if (typeof agentId !== 'undefined' && agentId > 0) {
    url += `&agentId=${agentId}`
  }
  if (typeof warning !== 'undefined') {
    url += `&warning=${warning}`
  }
  url += `&startDate=${startDate}&endDate=${endDate}`
  return api.getRequest(url)
}

export const markAsSuccessRecord = recordId => {
  return api.postRequest(`/record/markAsSuccess/${recordId}`)
}

export const cancelRecord = recordId => {
  return api.postRequest(`/record/cancel/${recordId}`)
}

export const forceRecord = recordId => {
  return api.postRequest(`/record/force/${recordId}`)
}

export const killRecord = recordId => {
  return api.postRequest(`/record/kill/${recordId}/false`)
}

export const terminateRecord = recordId => {
  return api.postRequest(`/record/kill/${recordId}/true`)
}

export const getRecord = recordId => {
  return api.getRequest(`/record/${recordId}`)
}

export const getRecordDependence = recordId => {
  return api.getRequest(`/record/${recordId}/dependence`)
}

export const getNotStartRecordList = ({ taskType, keyword, userId, warning, page, size }) => {
  let url = `/record/not-start-list?size=${size}&page=${page}`
  if (typeof taskType !== 'undefined') {
    url += `&taskType=${taskType}`
  }
  if (typeof keyword !== 'undefined') {
    url += `&keyword=${keyword}`
  }
  if (typeof userId !== 'undefined') {
    url += `&userId=${userId}`
  }
  if (typeof warning !== 'undefined') {
    url += `&warning=${warning}`
  }
  return api.getRequest(url)
}
