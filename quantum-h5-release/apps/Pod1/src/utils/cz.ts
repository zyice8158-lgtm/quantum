import watermark from '@/assets/img/svg/watermark.svg'

const watermarkSize = {
  width: 118,
  height: 28,
}

export const calculateCharacterLength = (value) => {
  return value.length
}

export const encodeUrl = (url = '') => {
  if (!url) {
    return
  }

  let _url = url.split('?')?.[0]

  if (_url?.includes('file:///')) {
    _url = _url.split('file:///')[1]
  }

  let protocol = ''

  if (_url?.includes('https://')) {
    protocol = 'https://'
  } else if (_url?.includes('http://')) {
    protocol = 'http://'
  } else {
    protocol = _url?.match(/^([A-Za-z]):/)?.[0] || ''
  }

  let body = _url?.replaceAll(protocol, '')

  const characters = Array.from(new Set([...body?.match(/[^a-zA-Z0-9]/g), ' ']))

  for (let index = 0; index < characters.length; index++) {
    const character = characters[index]

    if (!['/', '\\', '.', '%'].includes(character)) {
      try {
        body = body.replaceAll(character, encodeURIComponent(character))
      } catch (e) {
        throw new Error('Error merging segment info: ' + e.message)
      }
    }
  }

  return `${protocol}${body}`
}

export const getUrlParams = (url: string) => {
  const searchParams = new URLSearchParams(url.split('?')[1])
  const params = { theme: '' }

  for (const [key, value] of searchParams.entries()) {
    params[key] = value
  }

  return params
}

export const addWatermark = (width, height, imageBase64) => {
  return new Promise((resolve) => {
    const canvas = window.document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')

    const image = new Image()
    image.onload = () => {
      ctx.drawImage(image, 0, 0)

      const _image = new Image()
      _image.onload = () => {
        ctx.drawImage(
          _image,
          0,
          0,
          watermarkSize.width,
          watermarkSize.height,
          12,
          height - watermarkSize.height - 12,
          watermarkSize.width,
          watermarkSize.height
        )

        resolve(canvas.toDataURL())
      }

      _image.src = watermark
    }

    image.src = imageBase64
  })
}

export const colorToRGBA = (color) => {
  const regExp = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/
  const match = color?.match(regExp)

  if (match) {
    return {
      r: parseInt(match?.[1], 10),
      g: parseInt(match?.[2], 10),
      b: parseInt(match?.[3], 10),
      a: match?.[4] ? parseInt(parseFloat(match?.[4]) * 255) : 255,
    }
  }

  if (color?.[0] === '#') {
    color = color.slice(1)
    const value = parseInt(color, 16)

    return {
      r: (value >> 16) & 255,
      g: (value >> 8) & 255,
      b: value & 255,
      a: 255,
    }
  }

  return { r: 255, g: 255, b: 255, a: 0 }
}

export const getPointOnLine = (pointA, pointB, theta) => {
  const x = Math.floor((1 - theta) * pointA.x + theta * pointB.x)
  const y = Math.floor((1 - theta) * pointA.y + theta * pointB.y)

  return { x, y }
}

export const getChessStyle = (width) => {
  let w = Math.floor(width / 20)

  if (width <= 300) {
    w = Math.floor(width / 10)
  }

  return {
    'background-position': `0 0, ${w}px ${w}px`,
    'background-size': `${w * 2}px  ${w * 2}px`,
  }
}
