import localforage from 'localforage'
import { GET, POST } from './http'

export const getCloudTasks = async () => {
  const domain = await localforage.getItem('DOMAIN')
  const voucher = await localforage.getItem('VOUCHER')

  return await GET(`${domain}/quantumapi/enduser/image/session/listAllTask`, voucher, {})
}

export const updateCloudTask = async ({
  taskId,
  taskStatus,
  content,
  ratioId,
  width,
  height,
  generationResultList,
}: {
  taskId: string
  taskStatus: number
  content?: string
  ratioId?: string
  width?: number
  height?: number
  generationResultList?
}) => {
  const domain = await localforage.getItem('DOMAIN')
  const voucher = await localforage.getItem('VOUCHER')

  return await POST(
    `${domain}/quantumapi/enduser/image/session/updateTask`,
    voucher,
    {
      taskId,
      taskStatus,
      ...(generationResultList
        ? {
            generationRecordVO: {
              generationParam: {
                content,
                // negContent: '',
                // modelId: '',
                // modelType: '',
                // cfgScale: 0,
                // steps: 0,
                width,
                height,
                ratioId,
                // referenceObjectKey: '',
                // referenceImageType: 1,
                // referenceDimension: '',
                // referenceStrength: 0.11,
                // operateType: 1,
                // styleIdList: [],
              },
              generationResultList,
            },
          }
        : {}),
    },
    false
  )
}
