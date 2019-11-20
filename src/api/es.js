import api from '@/libs/es.request'

export const getMessageByPid = (startDate, pid) => {
  return api.getRequest(`/dts_dmp_record_${startDate}/_doc/${pid}`)
}

export const updatePath = data => {
  return api.postRequest(`/adhoc/path/update`, data)
}