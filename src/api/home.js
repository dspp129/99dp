import api from '@/libs/api.request'

export const getHomeData = () => {
  return api.getRequest(`/home/data`)
}