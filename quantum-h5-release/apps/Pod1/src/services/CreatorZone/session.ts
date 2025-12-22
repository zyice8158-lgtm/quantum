import localforage from 'localforage'
import { GET, POST } from './http'

export const addSession = async (body) => {
  const domain = await localforage.getItem('DOMAIN')
  const voucher = await localforage.getItem('VOUCHER')

  return await POST(`${domain}/quantumapi/enduser/image/session/add`, voucher, body, false)
}

export const editSession = async (body) => {
  const domain = await localforage.getItem('DOMAIN')
  const voucher = await localforage.getItem('VOUCHER')

  return await POST(`${domain}/quantumapi/enduser/image/session/edit`, voucher, body, false)
}

export const addSessionRecord = async (body) => {
  const domain = await localforage.getItem('DOMAIN')
  const voucher = await localforage.getItem('VOUCHER')

  return await POST(`${domain}/quantumapi/enduser/image/record/add`, voucher, body, false)
}

export const getSessionInfo = async (params) => {
  const domain = await localforage.getItem('DOMAIN')
  const voucher = await localforage.getItem('VOUCHER')

  return await GET(`${domain}/quantumapi/enduser/image/session/get`, voucher, params)
}

export const getSessionList = async (params = {}) => {
  const domain = await localforage.getItem('DOMAIN')
  const voucher = await localforage.getItem('VOUCHER')

  return await GET(`${domain}/quantumapi/enduser/image/session/listAll`, voucher, params)
}
