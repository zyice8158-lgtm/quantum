import { FetchClient } from '@libs/service'



export const TestFetch = new FetchClient({


})
export function QTLocalService(params: { query: string }) {
  const { query } = params
  const queryStr = `query=${query}`
  return TestFetch.stream('http://10.183.155.155:10089/chat?' + encodeURI(queryStr))
}