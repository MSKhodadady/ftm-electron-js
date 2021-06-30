
import { app, BrowserWindow, globalShortcut } from "electron";
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import path from 'path';

//: pre run configs
import { preRunSetup } from './lib/preRunConfig';
preRunSetup();

function createWindow() {
  const win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  //: TODO: load this file in production
  // win.loadFile(path.resolve('.', 'dist', 'renderer', 'main.html'));
  // win.loadURL('http://localhost:8080/');
  win.loadURL('http://localhost:1234/');

  win.maximize();

  //: load extension
  installExtension(REACT_DEVELOPER_TOOLS).then(name => console.log(`extension added: ${name}`))
    .catch(err => `error adding 'react devtool extension, err: ${err}`);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });

  //: hot reload handlers module {
  //: TODO: this code is just for development!
  const reloadKeyboardKey = 'CmdOrCtrl+Shift+S'
  const ret = globalShortcut.register(reloadKeyboardKey, () => {
    console.log(reloadKeyboardKey + ' pressed, handlers module reloaded!');
    //: remove the module from cache
    delete require.cache[require.resolve('./lib/handlers.ts')];
    //: reload module
    require('./lib/handlers').registerHandlers();
  });
  if (!ret) console.error(reloadKeyboardKey + ' not registered!');
  else console.log(reloadKeyboardKey + ' registered!');
  //: }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin')
    app.quit();
});

//: handlers
require('./lib/handlers').registerHandlers();
