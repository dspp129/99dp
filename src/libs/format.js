import moment from 'moment'

/**
 * 格式化数字
 */
export const formatNumber = (num) => {
  const regPos = new RegExp(/^\d+$/) // 非负整数
  const regNeg = new RegExp(/^-[1-9][0-9]*$/) // 负整数
  if (regPos.test(num) || regNeg.test(num)) {
    return num
  } else {
    return -1
  }
}

/**
 * 格式日期时间
 */
export const formatDateTime = (timestamp) => {
  const objRegExp = new RegExp(/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/)
  const dateTime = moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
  if (!objRegExp.test(dateTime)) {
    return '— —'
  } else {
    return dateTime
  }
}

/**
 * 格式化日期
 */
export const formatDate = (timestamp) => {
  const objRegExp = new RegExp(/^\d{4}-\d{2}-\d{2}$/)
  const date = moment(timestamp).format('YYYY-MM-DD')
  if (!objRegExp.test(date)) {
    return '— —'
  } else {
    return date
  }
}

export const timeDiff = (startTimestamp, endTimestamp) => {
  if (endTimestamp === null) {
    return ''
  }
  const start = moment(startTimestamp)
  const end = endTimestamp === null ? new Date() : moment(endTimestamp)
  const du = moment.duration(end - start, 'ms')

  const days = du.get('days')
  const hours = du.get('hours')
  const minutes = du.get('minutes')
  const seconds = du.get('seconds')
  if (isNaN(seconds)) return '— —'

  let txt = seconds + '秒'
  if (minutes > 0) txt = minutes + '分' + txt
  if (hours > 0) txt = hours + '小时' + txt
  if (days > 0) txt = days + '天' + txt

  return txt
}
