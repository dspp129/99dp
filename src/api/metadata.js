import api from '@/libs/api.request'

export const getTableList = ({ dbType, connectionId, keyword, page, size }) => {
  let url = `/metadata/table/list?page=${page}&size=${size}`

  if (typeof dbType !== 'undefined' && dbType > 0) {
    url += `&dbType=${dbType}`
  }

  if (typeof connectionId !== 'undefined' && connectionId > 0) {
    url += `&connectionId=${connectionId}`
  }

  if (typeof keyword !== 'undefined') {
    url += `&keyword=${keyword}`
  }

  return api.getRequest(url)
}

export const getTableDetail = id => {
  return api.getRequest(`/metadata/table/${id}`)
}

export const deleteTable = id => {
  return api.postRequest(`/metadata/table/delete/${id}`)
}

export const updateColumn = data => {
  return api.postRequest('/metadata/column/save', data)
}

export const updateTable = data => {
  return api.postRequest('/metadata/table/save', data)
}

export const getRemoteTable = ({ dbType, connectionId, dbId, dbName, keyword, page, size }) => {
  let url = `/metadata/remoteTable?page=${page}&size=${size}`

  if (typeof dbType !== 'undefined' && dbType > 0) {
    url += `&dbType=${dbType}`
  }

  if (typeof connectionId !== 'undefined' && connectionId > 0) {
    url += `&connectionId=${connectionId}`
  }

  if (typeof dbId !== 'undefined' && dbId > 0) {
    url += `&dbId=${dbId}`
  }

  if (typeof dbName !== 'undefined') {
    url += `&dbName=${dbName}`
  }

  if (typeof keyword !== 'undefined') {
    url += `&keyword=${keyword}`
  }

  return api.getRequest(url)
}

export const getDbType = () => {
  return api.getRequest('/metadata/dbType')
}

export const createConnection = data => {
  return api.postRequest('/metadata/connection/add', data)
}

export const updateConnection = data => {
  return api.postRequest('/metadata/connection/save', data)
}

export const getAllConnectionList = () => {
  return api.getRequest('/metadata/connection/onlyName')
}

export const getConnectionList = ({ dbType, name, jdbcUrl, page, size }) => {
  let url = `/metadata/connection/list?page=${page}&size=${size}`

  if (typeof dbType !== 'undefined' && dbType > 0) {
    url += `&dbType=${dbType}`
  }

  if (typeof name !== 'undefined') {
    url += `&name=${name}`
  }

  if (typeof jdbcUrl !== 'undefined') {
    url += `&jdbcUrl=${jdbcUrl}`
  }

  return api.getRequest(url)
}

export const testConnection = data => {
  return api.postRequest('/metadata/connection/test', data)
}

export const reloadConnection = id => {
  return api.getRequest(`/metadata/connection/reload/${id}`)
}

export const top10db = ({ dbType, keyword }) => {
  return api.getRequest(`/metadata/top10Db?dbType=${dbType}&keyword=${keyword}`)
}

export const top10table = ({ dbId, keyword }) => {
  return api.getRequest(`/metadata/top10Tables?dbId=${dbId}&keyword=${keyword}`)
}

export const importTable = data => {
  return api.postRequest('/metadata/table/import', data)
}
