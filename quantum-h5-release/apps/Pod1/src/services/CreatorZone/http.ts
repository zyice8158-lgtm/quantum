const showTip = (res) => {}

const noInternet = () => {}

export const GET = async (url, headers, params = {}) => {
  const _url = new URL(url)

  const _params = new URLSearchParams()

  Object.keys(params).forEach((key) => {
    _params.append(key, params[key])
  })

  _url.search = _params.toString()

  let res = null

  try {
    res = await (
      await fetch(_url, {
        method: 'GET',
        headers: {
          ...headers,
        },
      })
    ).json()
  } catch (e) {
    noInternet()
  }

  showTip(res)

  return res
}

export const POST = async (url = '', headers, body, isForm?, params?) => {
  const _url = new URL(url)

  const _params = new URLSearchParams()

  Object.keys(params || {}).forEach((key) => {
    _params.append(key, params?.[key])
  })

  _url.search = _params.toString()

  if (isForm) {
    const formData = new FormData()

    Object.keys(body).forEach((key) => {
      formData.append(key, body[key])
    })

    let res = null

    try {
      res = await (
        await fetch(_url, {
          method: 'POST',
          headers: {
            ...headers,
          },
          body: formData,
        })
      ).json()
    } catch (e) {
      noInternet()
    }

    showTip(res)

    return res
  }

  const res = await (
    await fetch(_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    })
  ).json()

  showTip(res)

  return res
}
