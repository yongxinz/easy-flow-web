import request from '@/utils/request'

// 创建流程
export function createProcess(data) {
  return request({
    url: '/api/v1/workflow/process',
    method: 'post',
    data
  })
}

// 流程列表
export function processList(params) {
  return request({
    url: '/api/v1/workflow/process',
    method: 'get',
    params
  })
}

// 更新流程
export function updateProcess(data) {
  return request({
    url: '/api/v1/workflow/process/' + data.processId,
    method: 'put',
    data
  })
}

// 删除流程
export function deleteProcess(processId) {
  return request({
    url: '/api/v1/workflow/process/' + processId,
    method: 'delete'
  })
}

// 流程详情
export function processDetails(processId) {
  return request({
    url: '/api/v1/workflow/process/' + processId,
    method: 'get'
  })
}

// 分类流程列表
export function classifyProcessList(params) {
  return request({
    url: '/api/v1/workflow/process/classify',
    method: 'get',
    params
  })
}
