import localforage from 'localforage'
import { POST } from './http'

const PUT = async (url = '', headers, body) => {
  await fetch(url, {
    method: 'PUT',
    headers: {
      ...headers,
    },
    body,
  })
}

export const getFileObjectKey = async ({ fileType, file }) => {
  const domain = await localforage.getItem('DOMAIN')
  const voucher = await localforage.getItem('VOUCHER')

  const generatePresignedUrlRes = await POST(
    `${domain}/quantumapi/enduser/oss/generatePresignedUrl`,
    voucher,
    {
      fileType,
    },
    false
  )

  if (generatePresignedUrlRes.success) {
    await PUT(
      generatePresignedUrlRes.data.presignedUrl,
      {
        'Content-Type': file.type,
      },
      file
    )

    return generatePresignedUrlRes.data.objectKey
  } else {
    return ''
  }
}
