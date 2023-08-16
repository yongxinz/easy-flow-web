import request from '@/utils/request'

// 创建模版
export function createTemplate(data) {
  return request({
    url: '/api/v1/workflow/template',
    method: 'post',
    data
  })
}

// 模版列表
export function templateList(params) {
  return request({
    url: '/api/v1/workflow/template',
    method: 'get',
    params
  })
}

// 模版详情
export function templateDetails(templateId) {
  return request({
    url: '/api/v1/workflow/template/' + templateId,
    method: 'get'
  })
}

// 更新模版
export function editTemplate(data) {
  return request({
    url: '/api/v1/workflow/template/' + data.templateId,
    method: 'put',
    data
  })
}

// 删除模版
export function deleteTemplate(templateId) {
  return request({
    url: '/api/v1/workflow/template/' + templateId,
    method: 'delete'
  })
}
