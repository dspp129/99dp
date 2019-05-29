export const initTask = {
  jobId: 0,
  userId: 0,
  jobName: '',
  command: '',
  comment: '',
  email: '',
  agentId: 0,
  pause: 1,
  taskType: 0, // 1-Shell, 2-SQL, 3-ETL, 4-threshold, 5-Report
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
