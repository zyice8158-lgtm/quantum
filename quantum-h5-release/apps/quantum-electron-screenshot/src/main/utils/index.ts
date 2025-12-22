import fs from 'fs'
import path from 'path'
import os from 'os'
import dayjs from 'dayjs'
import { app } from 'electron'
export function saveBase64ToFile(base64String: string) {
  // 获取当前操作系统的用户名
  const username = os.userInfo().username
  // 获取用户的主目录路径
  const userHomeDir = os.homedir()
  const time = dayjs(Date.now()).format('YYYYMMDDHHmmss')
  // 获取用户名文件夹路径（例如：C:\Users\username 或 /home/username）
  const filePath = path.join(
    userHomeDir,
    'Pictures',
    'LenovoAINowscreenshot',
    `ScreenShot_${time}.png`
  ) // \Pictures\\LenovoAINowscreenshot

  try {
    // 去掉Base64字符串的前缀（如"data:image/png;base64,"）
    const base64Data = base64String.split(',')[1]

    // 将Base64字符串解码为二进制数据
    const buffer = Buffer.from(base64Data, 'base64')

    // 确保目标文件夹存在
    const folderPath = path.dirname(filePath)
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true })
    }

    fs.writeFileSync(filePath, buffer)
    console.log(`文件已成功保存到：${filePath}`)
    return { filePath, folderPath }
  } catch (error) {
    console.error('保存文件时出错：', error)
    return { filePath: '', folderPath: '' }
  }
}
export const getSnipToolHotKeyConfig = async () => {
  try {
    const homePath = app.getPath('home')
    const logPath = path.join(homePath, '\\AppData\\Local\\Lenovo\\qtprompt\\snip_tool_hotkey_config.json')

    if (!fs.existsSync(logPath)) {
      console.log('配置文件不存在:', logPath)
      return {}
    }
    const configStr = await getFile(logPath)    
    const config = JSON.parse(configStr)
    console.log('获取配置文件成功:', config)
    return config as Record<string, string>
  } catch (error) {
    console.log(error, '获取配置文件失败')
    return {}
  }
}
export const getFile = async (path: string) => {
  try {
    const data = await fs.promises.readFile(path, 'utf-8')
    return data
  } catch (error) {
    console.log(error)
    return ''
  }
}
