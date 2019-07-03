import api from '@/libs/api.request'

export const getAgentList = ({ keyword, host, status, size, page }) => {
  return api.getRequest(`/cluster/agent/list?keyword=${keyword}&host=${host}&status=${status}&size=${size}&page=${page}`)
}

export const getAgentGroupList = ({ keyword, size, page }) => {
  return api.getRequest(`/cluster/agent-group/list?keyword=${keyword}&size=${size}&page=${page}`)
}

export const saveAgent = data => {
  return api.patchRequest('/cluster/agent/save', data)
}

export const saveAgentGroup = data => {
  return api.patchRequest('/cluster/agent-group/save', data)
}

export const checkAgentName = ({ name, agentId }) => {
  return api.getRequest(`/cluster/agent/checkName?name=${name}&agentId=${agentId}`)
}

export const checkAgentGroupName = ({ name, id }) => {
  return api.getRequest(`/cluster/agent-group/checkName?name=${name}&id=${id}`)
}

export const monitor = id => {
  return api.getRequest(`/cluster/agent/monitor/${id}`)
}

export const getAgentInfo = id => {
  return api.getRequest(`/cluster/agent/${id}`)
}

export const getAgentResourceByAgentIds = ids => {
  return api.getRequest(`/cluster/agent/resources?agentIds=${ids}`)
}

export const getAgentResource = ({agentId, startTime, endTime}) => {
  let url = `/cluster/agent/resource?agentId=${agentId}`
  if (typeof startTime !== 'undefined') {
    url += `&startTime=${startTime}`
  }
  if (typeof endTime !== 'undefined') {
    url += `&endTime=${endTime}`
  }
  return api.getRequest(url)
}

export const getAgentNameList = () => {
  return api.getRequest('/cluster/agent/all')
}
