
import { app, BrowserWindow } from "electron";
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import path from 'path';

//: pre run configs
import './lib/preRunConfig';

/* async function createWindow () {
  const win = new BrowserWindow({
    // width: 100,
    // height: 100,
    webPreferences: {
      nodeIntegration: true,
      devTools: true
    }
  });

  win.loadFile(path.resolve('.', 'dist', 'renderer', 'index.html'));

  // win.maximize();

  // const reactDevToolExtensionPath = '/home/sadeq/.config/google-chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi'
  // await session.defaultSession.loadExtension(reactDevToolExtensionPath);
  // installExtension(REACT_DEVELOPER_TOOLS).then(name => console.log(`extension added: ${name}`))
  //   .catch(err => `error adding 'react devtool extension, err: ${err}`);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
}); */

function createWindow () {
  const win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile(path.resolve('.', 'dist', 'renderer', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin')
    app.quit();
});

//: handlers
import './lib/handlers';
