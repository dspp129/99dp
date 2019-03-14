import api from '@/libs/api.request'

export const createDept = data => {
  return api.putRequest(`/sys/dept/create`, data)
}

export const updateDept = data => {
  return api.postRequest(`/sys/dept/update`, data)
}

export const deleteDept = id => {
  return api.postRequest(`/sys/dept/delete/${id}`)
}

export const getDeptTree = id => {
  return api.getRequest(`/sys/dept/tree?id=${id}`)
}

export const getUserList = ({ deptId, keyword, status, page, size }) => {
  return api.getRequest(`/sys/user/list?deptId=${deptId}&keyword=${keyword}&status=${status}&page=${page}&size=${size}`)
}

export const checkUserEmail = data => {
  return api.postRequest(`/sys/user/checkEmail`, data)
}

export const checkUsername = data => {
  return api.postRequest(`/sys/user/checkUsername`, data)
}

export const checkUserPhone = data => {
  return api.postRequest(`/sys/user/checkPhone`, data)
}

export const createUser = data => {
  return api.postRequest(`/sys/user/create`, data)
}

export const updateUser = data => {
  return api.postRequest(`/sys/user/update`, data)
}

export const deleteUser = data => {
  return api.postRequest(`/sys/user/delete`, data)
}
