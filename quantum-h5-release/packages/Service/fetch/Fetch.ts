export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'
export type ResponseType = 'json' | 'text' | 'blob' | 'arraybuffer' | 'stream'

export interface FetchRequestConfig<T = unknown> {
  method?: HttpMethod
  headers?: Record<string, string>
  params?: Record<string, string | number>
  data?: T
  timeout?: number
  responseType?: ResponseType
  signal?: AbortSignal
  baseURL?: string
  mock?: {
    isMock: boolean
    response: unknown
  }
  credentials?: 'include'
  linkPostMessage?: string | boolean;
  url:string
}

export interface FetchResponse<T = unknown> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  config: FetchRequestConfig
  request?: Request
}

export interface StreamFetchResponse<T = Uint8Array> extends FetchResponse<ReadableStream<T>> {
  // 扩展流式响应特有属性
}

export class FetchError extends Error {
  constructor(
    public message: string,
    public status?: number,
    public config?: FetchRequestConfig,
    public request?: Request,
    public response?: FetchResponse
  ) {
    super(message)
    this.name = 'FetchError'
  }
}

type Interceptor<V> = (value: V, url?: string) => V | Promise<V>

export class FetchClient {
  private baseURL: string = ''
  private defaultConfig: FetchRequestConfig = {
    // timeout: 10000,
    responseType: 'json',
    headers: {
      'Content-Type': 'application/json'
    }
  }
  private requestInterceptors: Array<Interceptor<FetchRequestConfig>> = []
  private responseInterceptors: Array<Interceptor<FetchResponse>> = []
  private errorHandlers: Array<(err: Error) => void> = []

  constructor(config?: Partial<FetchRequestConfig>) {
    this.defaultConfig = { ...this.defaultConfig, ...config }
  }

  setBaseURL(url: string) {
    this.baseURL = url.replace(/\/$/, '')
    return this
  }

  async request<T = unknown>(url: string, config: Partial<FetchRequestConfig>): Promise<FetchResponse<T>> {
    console.log('requesturl', config);
    const mergedConfig = this.mergeConfig(config, url)
    const processedConfig = await this.processRequestConfig(mergedConfig, mergedConfig.baseURL + url)

    // 处理请求参数
    const requestUrl = this.buildURL(url, processedConfig.baseURL, processedConfig.params)
    const abortController = new AbortController()
    const timeoutId = processedConfig.timeout
      ? setTimeout(() => abortController.abort(), processedConfig.timeout)
      : null

    try {
      if (mergedConfig.mock?.isMock && mergedConfig.mock.response) {

        return this.processResponse<T>(new Response(JSON.stringify(mergedConfig.mock.response) as BodyInit), processedConfig)
      }

    } catch (error) {
      console.log(error);

    }



    try {
      const request = new Request(requestUrl, {
        method: processedConfig.method,
        headers: processedConfig.headers,
        body: processedConfig.data ? JSON.stringify(processedConfig.data) : undefined,
        signal: processedConfig.signal || abortController.signal, // 使用传递的 signal 或者 abortController 的 signal
        credentials: processedConfig.credentials
      });

      const response = await fetch(request);
      console.log('fetchreaponse----------', response.body.getReader);
      clearTimeout(timeoutId!)

      if (!response.ok) {
        throw new FetchError(
          `Request failed with status ${response.status}`,
          response.status,
          processedConfig,
          request
        )
      }
      return this.processResponse<T>(response, processedConfig)
    } catch (error) {
      clearTimeout(timeoutId!)
      return this.handleError(error, processedConfig)
    }
  }

  // 流式请求方法
  async stream<T extends Uint8Array = Uint8Array>(
    url: string,
    config?: Omit<FetchRequestConfig, 'responseType'>
  ): Promise<StreamFetchResponse<T>> {
    // 将 signal 传递给请求
    return this.request<ReadableStream<T>>(url, {
      ...config,
      responseType: 'stream'
    }) as Promise<StreamFetchResponse<T>>
  }

  get<T = unknown>(url: string, config?: Omit<Partial<FetchRequestConfig>, 'method' | 'data'>) {
    return this.request<T>(url, { ...config, method: 'GET' })
  }

  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: Omit<Partial<FetchRequestConfig>, 'method' | 'data'>
  ) {
    return this.request<T>(url, { ...config, method: 'POST', data })
  }

  // 添加其他 HTTP 方法...

  private buildURL(
    path: string,
    baseURL = this.baseURL,
    params?: Record<string, string | number>
  ): string {
    const url = path.startsWith('http') ? path : `${baseURL}/${path.replace(/^\//, '')}`

    if (!params) return url

    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      query.append(key, value.toString())
    })

    return `${url}?${query.toString()}`
  }

  private async processRequestConfig(config: FetchRequestConfig, url: string): Promise<FetchRequestConfig> {
    let currentConfig = config
    for (const interceptor of this.requestInterceptors) {
      currentConfig = await interceptor(currentConfig, url)
    }
    return currentConfig
  }

  private async processResponse<T>(
    response: Response,
    config: FetchRequestConfig
  ): Promise<FetchResponse<T>> {
    const responseData = await this.parseResponse<T>(response, config)

    const fetchResponse: FetchResponse<T> = {
      data: responseData,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      config
    }

    return this.applyResponseInterceptors(fetchResponse)
  }

  private async parseResponse<T>(response: Response, config: FetchRequestConfig): Promise<T> {
    switch (config.responseType) {
      case 'json':
        return response.json()
      case 'text':
        return response.text() as T
      case 'blob':
        return response.blob() as T
      case 'arraybuffer':
        return response.arrayBuffer() as T
      case 'stream':
        console.log('stream---------', response.body.getReader)
        return response.body as T
      default:
        return response.json()
    }
  }

  private async applyResponseInterceptors<T>(
    response: FetchResponse<T>
  ): Promise<FetchResponse<T>> {
    let currentResponse = response
    for (const interceptor of this.responseInterceptors) {
      currentResponse = (await interceptor(currentResponse)) as FetchResponse<T>
    }
    return currentResponse
  }

  private handleError(error: unknown, config: FetchRequestConfig): never {
    for (const handleError of this.errorHandlers) {
      handleError(error as Error)
    }
    if (error instanceof FetchError) throw error

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new FetchError(`Request timed out after ${config.timeout}ms`, 408, config)
    }

    throw new FetchError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      undefined,
      config
    )
  }

  private mergeConfig(config?: Partial<FetchRequestConfig>, url: string = ''): FetchRequestConfig {
    return {
      ...this.defaultConfig,
      ...config,
      headers: {
        ...this.defaultConfig.headers,
        ...config?.headers
      },
      url,
    }
  }

  // 拦截器管理
  useRequestInterceptor(interceptor: Interceptor<FetchRequestConfig>) {
    this.requestInterceptors.push(interceptor)
    return this
  }

  useResponseInterceptor(interceptor: Interceptor<FetchResponse>) {
    this.responseInterceptors.push(interceptor)
    return this
  }

  useErrorHandler(cb: (err: Error) => void) {
    this.errorHandlers.push(cb)
  }
}
