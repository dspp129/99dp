import HttpRequest from '@/libs/axios'
// import config from '@/config'
const baseUrl = '/api' // process.env.NODE_ENV === 'development' ? config.baseUrl.dev : config.baseUrl.pro

const axios = new HttpRequest(baseUrl)

const getRequest = (url) => {
  return axios.request({
    method: 'get',
    url
  })
}

const postRequest = (url, data) => {
  return axios.request({
    method: 'post',
    url,
    data
  })
}

const patchRequest = (url, data) => {
  return axios.request({
    method: 'patch',
    url,
    data
  })
}

const putRequest = (url, data) => {
  return axios.request({
    method: 'put',
    url,
    data
  })
}

const deleteRequest = (url) => {
  return axios.request({
    method: 'delete',
    url
  })
}

export default {
  getRequest,
  postRequest,
  patchRequest,
  putRequest,
  deleteRequest
}
