import api from '@/libs/api.request'

export const getPath = id => {
  return api.getRequest(`/adhoc/path/${id}`)
}

export const createPath = data => {
  return api.postRequest(`/adhoc/path/create`, data)
}

export const updatePath = data => {
  return api.postRequest(`/adhoc/path/update`, data)
}

export const checkPathName = data => {
  return api.postRequest(`/adhoc/path/checkName`, data)
}

export const deletePath = id => {
  return api.postRequest(`/adhoc/path/delete/${id}`)
}

export const runSQL = data => {
  return api.postRequest(`/adhoc/runSQL`, data)
}