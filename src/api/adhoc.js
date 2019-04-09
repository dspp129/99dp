import api from '@/libs/api.request'

export const getPath = id => {
  return api.getRequest(`/adhoc/path/${id}`)
}

export const getFile = id => {
  return api.getRequest(`/adhoc/file/${id}`)
}

export const saveFile = data => {
  return api.postRequest(`/adhoc/file/save`, data)
}

export const createPath = data => {
  return api.postRequest(`/adhoc/path/create`, data)
}

export const updatePath = data => {
  return api.postRequest(`/adhoc/path/update`, data)
}

export const deletePath = id => {
  return api.postRequest(`/adhoc/path/delete/${id}`)
}

export const runQuery = data => {
  return api.postRequest(`/adhoc/runQuery`, data)
}

export const getList = ({ size, page }) => {
  return api.getRequest(`/adhoc/list?size=${size}&page=${page}`)
}
