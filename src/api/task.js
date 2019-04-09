import api from '@/libs/api.request'

export const deleteTask = id => {
  return api.deleteRequest(`/task/${id}`)
}

export const getTask = id => {
  return api.getRequest(`/task/${id}`)
}

export const getChildTask = id => {
  return api.getRequest(`/task/child/${id}`)
}

export const getTaskList = ({ keyword, taskType, userId, size, page }) => {
  let url = `/task/list?size=${size}&page=${page}`

  if (typeof keyword !== 'undefined') {
    url += `&keyword=${keyword}`
  }

  if (typeof taskType !== 'undefined') {
    url += `&taskType=${taskType}`
  }

  if (typeof userId !== 'undefined' && userId > 0) {
    url += `&userId=${userId}`
  }

  return api.getRequest(url)
}

export const runTask = data => {
  return api.postRequest('/task/run', data)
}

export const getTaskType = () => {
  return api.getRequest('/task/taskType')
}

export const saveTask = data => {
  return api.postRequest('/task/save', data)
}

export const checkTaskName = ({ name, id }) => {
  return api.getRequest(`/task/checkName?taskName=${name}&id=${id}`)
}

export const checkCronExpr = ({ cronExpr, startTime, endTime }) => {
  let url = `/task/checkCron?cronExpr=${cronExpr}`
  if (typeof startTime !== 'undefined') {
    url += `&startTime=${startTime}`
  }
  if (typeof endTime !== 'undefined') {
    url += `&endTime=${endTime}`
  }
  return api.getRequest(url)
}

export const refreshColumns = ({ connectionId, dbName, tableName }) => {
  return api.getRequest(`/task/refreshColumns?connectionId=${connectionId}&dbName=${dbName}&tableName=${tableName}`)
}

