import {
  app,
  screen,
  shell,
  BrowserWindow,
  ipcMain,
  clipboard,
  nativeImage,
  globalShortcut
} from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { getSnipToolHotKeyConfig } from './utils'
import { client } from './Pipe/index'
import { saveBase64ToFile } from './utils'
let mainWindow: BrowserWindow
import log from 'electron-log/main'


log.initialize() // 本地日志文件 ~\AppData\Roaming\@ainow\desktop\logs\main.log
global.console = console
global.console.log = console.log = log.log
global.console.warn = console.warn = log.warn
global.console.error = console.error = log.error

const screenshotPath = app.isPackaged
  ? path.join(process.resourcesPath, 'app.asar.unpacked/resources/native/screenshot.node') // 打包后的路径
  : path.join(__dirname, '../../resources/native/screenshot.node') // 开发环境路径

console.log('screenshotPath:', screenshotPath)

// eslint-disable-next-line @typescript-eslint/no-require-imports
const screenshot = require(screenshotPath)

function createWindow(): void {

  mainWindow = new BrowserWindow({
    show: false,
    frame: false,
    alwaysOnTop: true,
    fullscreen: true,
    transparent: true,
    autoHideMenuBar: true,
    skipTaskbar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  // mainWindow.webContents.openDevTools()

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function showShotWindow(size): void {
  mainWindow.setPosition(0, 0)
  mainWindow.moveTop()
  mainWindow.setSize(size.width, size.height)
  mainWindow.setAlwaysOnTop(true, 'screen-saver')
  // mainWindow.setIgnoreMouseEvents(false)
  console.log('showShotWindow:', size, Date.now())
  mainWindow.show()
  const escRet = globalShortcut.register('Escape', () => {
    mainWindow.webContents.send('pre-hide')
  })
}

app.whenReady().then(async () => {
  const gotTheLock = app.requestSingleInstanceLock()
  if (!gotTheLock) {
    console.log('Another instance is running.')
    app.quit()
  }

  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  registerShortcut()
  connectPipServer()

 
  ipcMain.handle('sendto-csharp', (_, data) => {
    console.log('sendto-csharp', data)

    client.sendMessage(JSON.stringify(data)).then((result) => {
      
      if(result){
        console.log('消息发送成功');
      }

    }).catch((error) => {
      console.error('发送消息到Server失败:', error);
    })
  
  })

  ipcMain.handle('save-img', (_, base64Image) => {
    return saveBase64ToFile(base64Image)
  })


  ipcMain.handle('save-to-clipboard', (_, base64Image) => {
    const nativeImg = nativeImage.createFromDataURL(base64Image)
    clipboard.writeImage(nativeImg)
  })


  ipcMain.handle('hide-window', () => {
    mainWindow.setPosition(-5000, 0)
    globalShortcut.unregister('Escape')
  })

  ipcMain.handle('take-screenshot', async (): Promise<string> => {
    try {
      const start = Date.now()
      const primaryDisplay = screen.getPrimaryDisplay()
      showShotWindow(primaryDisplay.size)
      const base64Image = screenshot.captureMainScreen()
      console.log('sceneshot:', Date.now() - start)
      return base64Image
    } catch (error) {
      console.error('截图失败:', error)
      return ''
    }
  })
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

const registerShortcut = async () => {
  let hotKey = {}
  try {
    hotKey = await getSnipToolHotKeyConfig()
  } catch (error) {
    console.log('获取快捷键配置失败:', error)
  }
  const screenshotApp = hotKey['screenshotApp'] || 'CommandOrControl+E'
  const screenshotArea = hotKey['screenshotArea'] || 'CommandOrControl+W'
  console.log('screenshotApp:', screenshotApp, 'screenshotArea:', screenshotArea)

  const retArea = globalShortcut.register(screenshotArea, () => {
    mainWindow?.setPosition(0, 0)
    mainWindow.webContents.send('trigger-screenshot', { screenshotMode: 'Area' })
  })
  if (!retArea) {
    console.error(`快捷键${screenshotArea}注册失败`)
  }

  const retApp = globalShortcut.register(screenshotApp, () => {
    const primaryDisplay = screen.getPrimaryDisplay()
    mainWindow?.setPosition(0, 0)
    const foreWndPosAndRect = screenshot.GetForegroundWindowPosAndRect()

    const rectObj = JSON.parse(foreWndPosAndRect)
    for (const key in rectObj) {
      if (Object.prototype.hasOwnProperty.call(rectObj, key)) {
        if (key === 'x' || key === 'y') {
          if (rectObj[key] < 0) {
            rectObj[key] = 0
          }
        }
        rectObj[key] = rectObj[key] / primaryDisplay.scaleFactor
      }
    }
    rectObj['screenshotMode'] = 'App'
    mainWindow.webContents.send('trigger-screenshot-app', JSON.stringify(rectObj))
  })
  if (!retApp) {
    console.error(`快捷键${screenshotApp}注册失败`)
  }

  

}
const connectPipServer = async () => {
  try {
    await client.connectAndListen(
      (data) => {
        console.log('收到来自服务端的消息:', data)
        const { Method } = data

        if (Method === 'StartScreenShot') {
          mainWindow?.setPosition(0, 0)
          mainWindow.webContents.send('trigger-screenshot', { screenshotMode: 'Area', showDefautToolbar: true })
        } 
        if (Method === 'SendScreenshotToGetAction') {
          mainWindow.webContents.send('show-suggestion', data)
        }
        
      },
      (error) => {
        console.error('管道连接出错:', error)
      }
    )
    console.log('管道监听已建立')

  } catch (error) {

    console.error('建立管道监听失败:', error)
  }

}
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})