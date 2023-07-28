import request from '@/utils/request'

export function login(data) {
  return request({
    url: `/api/v1/sys/login`,
    method: 'post',
    data
  })
}

export function refreshtoken(data) {
  return request({
    url: '/refreshtoken',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: '/api/v1/sys/getinfo',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/api/v1/sys/logout',
    method: 'post'
  })
}

