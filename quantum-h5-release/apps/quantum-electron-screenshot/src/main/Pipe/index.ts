import net from 'net'

class PipeClient {
  private client: net.Socket | null = null
  private pipeName: string
  private isConnected: boolean = false

  constructor(pipeName: string) {
    this.pipeName = pipeName
  }
  connectAndListen(onMessage: Function, onError?: Function): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected && this.client) {
        resolve()
        return
      }

      this.client = net.createConnection({ path: '\\\\.\\pipe\\' + this.pipeName }, () => {
        console.log('client:连接成功')
        this.isConnected = true
        resolve()
      })

      this.client.on('data', (data) => {
        console.log(`client:收到消息: ${data.toString()}`)
        try {
          const parsedData = JSON.parse(data.toString())
          onMessage(parsedData)
        } catch (e) {
          console.error('解析服务端消息失败:', e)
          onMessage(data.toString())
        }
      })

      this.client.on('end', () => {
        console.log('Disconnected from the client pipe')
        this.isConnected = false
      })

      this.client.on('error', (err) => {
        console.error(`client:Connection error: ${err.message}`)
        this.isConnected = false
        if (onError) {
          onError(err)
        }
        reject(err)
      })
    })
  }
  
  disconnect() {
    if (this.client) {
      this.client.destroy()
      this.client = null
      this.isConnected = false
    }
  }
  
  sendMessage(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.client && this.isConnected) {
        console.log(`client:发送消息: ${message}`)

        this.client.write(message, (err) => {
          if (err) {
            console.error('发送消息失败:', err)
            resolve(false)
          } else {
            resolve(true)
          }
        })
      } else {
        console.error('客户端未连接，无法发送消息')
        resolve(false)
      }
    })
  }
  
  get isConnectedStatus(): boolean {
    return this.isConnected
  }
}

const clientPipeName = 'ainow20250225259876989'

const client = new PipeClient(clientPipeName)

export { client }