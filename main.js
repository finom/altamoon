const { app, BrowserWindow } = require('electron')
const { session } = require('electron')
const { config } = require('./js/config')

// Quit if not first instance
if (!app.requestSingleInstanceLock()) app.quit()

// Disable security warnings
delete process.env.ELECTRON_ENABLE_SECURITY_WARNINGS
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true
// Fix deprecation warning
app.allowRendererProcessReuse = true

function createWindow () {
    var mainWindow = new BrowserWindow({
            width: config.get('window.width'),
            height: config.get('window.height'),
            webPreferences: { nodeIntegration: true }
    })

    mainWindow.loadFile('index.html')

    // DevTools
    mainWindow.webContents.openDevTools()

    // Focus existing instance instead if second instance started
    app.on('second-instance', (event, argv, cwd) => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }
    })

    // On window resize
    mainWindow.on('resize', () => {
        let { width, height } = mainWindow.getBounds()
        config.set({ 'window.width': width, 'window.height': height })
    })

}

app.on('ready', () => {
    createWindow()
})

app.on('window-all-closed', () => {
    app.quit()
})
