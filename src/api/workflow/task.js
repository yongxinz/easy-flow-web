import request from '@/utils/request'

// 新建任务
export function createTask(data) {
  return request({
    url: '/api/v1/workflow/task',
    method: 'post',
    data
  })
}

// 任务列表
export function taskList(params) {
  return request({
    url: '/api/v1/workflow/task',
    method: 'get',
    params
  })
}

// 更新任务
export function updateTask(data) {
  return request({
    url: '/api/v1/workflow/task/' + data.taskId,
    method: 'put',
    data
  })
}

// 删除任务
export function deleteTask(taskId) {
  return request({
    url: '/api/v1/workflow/task/' + taskId,
    method: 'delete'
  })
}

// 任务详情
export function taskDetails(taskId) {
  return request({
    url: '/api/v1/workflow/task/' + taskId,
    method: 'get'
  })
}
