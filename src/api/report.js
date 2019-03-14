import api from '@/libs/api.request'

export const getAutoReportList = ({ keyword, username, name, subject, size, page }) => {
  let url = `/report/auto/list?size=${size}&page=${page}`

  if (typeof keyword !== 'undefined') {
    url += `&keyword=${keyword}`
  }

  if (typeof username !== 'undefined') {
    url += `&username=${username}`
  }

  if (typeof name !== 'undefined') {
    url += `&name=${name}`
  }

  if (typeof subject !== 'undefined') {
    url += `&subject=${subject}`
  }

  return api.getRequest(url)
}

export const checkName = (name) => {
  return api.getRequest(`/report/auto/checkName?name=${name}`)
}

export const getAutoReport = (name) => {
  return api.getRequest(`/report/auto/${name}`)
}

export const saveAutoReport = data => {
  return api.postRequest('/report/auto/save', data)
}

export const getAutoReportLog = ({ name, startDate, endDate, size, page }) => {
  let url = `/report/auto/log?name=${name}&size=${size}&page=${page}&startDate=${startDate}&endDate=${endDate}`
  return api.getRequest(url)
}