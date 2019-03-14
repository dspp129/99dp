export const initTask = {
  jobId: 0,
  userId: 0,
  jobName: '',
  command: '',
  comment: '',
  email: '',
  agentId: 0,
  pause: 0,
  taskType: 0, // 1-ETL, 2-SQL, 3-Shell, 4-threshold
  concurrent: 2, // 并行：1-并行执行,2-并行等待,3-并行取消
  hasSlot: 0,
  hasDownStream: 0,
  runCount: 0,
  timeout: 0,
  warning: 0,
  cronExpr: ''
}

const initData = {
  initTask
}

export default initData
