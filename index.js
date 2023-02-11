require('./server');
const { screen,app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow () {
 const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  win = new BrowserWindow({ width, height });
  win.loadURL("http://localhost:8100");
  win.focus();
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
