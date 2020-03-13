const { app, BrowserWindow } = require('electron')
const { session } = require('electron')

// Quit if not first instance
if (!app.requestSingleInstanceLock()) app.quit()

// Disable security warnings
delete process.env.ELECTRON_ENABLE_SECURITY_WARNINGS
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true
// Fix deprecation warning
app.allowRendererProcessReuse = true

function createWindow () {
    var window = new BrowserWindow({
            width: 2400,
            height: 1050,
            webPreferences: { nodeIntegration: true }
    })

    window.loadFile('index.html')

    // DevTools
    window.webContents.openDevTools()

    // Focus existing instance instead if second instance started
    app.on('second-instance', (event, argv, cwd) => {
      if (window) {
        if (window.isMinimized()) window.restore()
        window.focus()
      }
    })
}

app.on('ready', () => {
    createWindow()
})

app.on('window-all-closed', () => {
    app.quit()
})
