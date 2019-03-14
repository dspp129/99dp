import api from '@/libs/api.request'

export const getList = () => {
  return api.getRequest(`/param/list`)
}