import api from '@/libs/api.request'

export const getMessage = () => {
  return api.getRequest('/message/internal')
}

export const getUnreadCount = () => {
  return api.getRequest('/message/internal/unreadCount')
}

export const getContentByMsgId = msgId => {
  return api.getRequest(`/message/content?msgId=${msgId}`)
}

export const hasRead = id => {
  return api.patchRequest('/message/internal', { id, status: 1 })
}

export const removeReaded = id => {
  return api.patchRequest('/message/internal', { id, status: 2 })
}

export const restoreTrash = id => {
  return api.patchRequest('/message/internal', { id, status: 1 })
}
