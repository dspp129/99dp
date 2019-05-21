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

export const getAgentInfo = id => {
  return api.getRequest(`/cluster/agent/${id}`)
}

export const getAgentNameList = () => {
  return api.getRequest('/cluster/agent/all')
}
