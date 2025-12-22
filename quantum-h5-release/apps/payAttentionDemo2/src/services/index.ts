import { AppFetch, BaseRes, ShellReq, ShellRes } from '@libs/service'

export const chatInterface = (params: {query: string}) => {
  return AppFetch.stream(
    `https://10.183.152.98:5888/chat?query=${params.query}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream'
      },
      // signal: params.signal
    }
  )
}

