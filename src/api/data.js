import api from '@/libs/api.request'

export const getTableData = () => {
  return api.getRequest('get_table_data')
}

export const getDragList = () => {
  return api.getRequest('get_drag_list')
}

export const errorReq = () => {
  return api.postRequest('error_url')
}

export const saveErrorLogger = info => {
  return api.postRequest('save_error_logger', info)
}

export const uploadImg = formData => {
  return api.postRequest('image/upload', formData)
}

export const getOrgData = () => {
  return api.getRequest('get_org_data')
}

export const getTreeSelectData = () => {
  return api.getRequest('get_tree_select_data')
}
