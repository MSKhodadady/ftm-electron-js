
import { app, BrowserWindow, globalShortcut } from "electron";
import path from 'path';
import { watch } from 'fs/promises';

//: pre run configs
import { preRunSetup } from './lib/preRunConfig';
preRunSetup();

function createWindow() {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.resolve(__dirname, 'preload.js')
    }
  });

  //: TODO: load this file in production
  if (process.env.NODE_ENV == 'development') {
    mainWindow.loadURL('http://localhost:1234');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'main.html'))
  }

  // mainWindow.maximize();

  //: load extension
  if (process.env.NODE_ENV = 'development') {
    const installExtension = require('electron-devtools-installer');
    const { REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');
    installExtension(REACT_DEVELOPER_TOOLS).then(name => console.log(`extension added: ${name}`))
    .catch(err => `error adding 'react devtool extension, err: ${err}`);
  }
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
require('./handlers').registerHandlers();
if (process.env.NODE_ENV == 'development') {
  (async () => {
    const handlersFile = require.resolve('./handlers');
    const watcher = watch(handlersFile);

    for await (const event of watcher) {
      if (event.eventType == 'change') {
        console.log("handlers module changed. RELOAD!");
        //: remove the module from cache
        delete require.cache[handlersFile];
        //: reload module
        const { registerHandlers } = require('./handlers');
        //: it is possible when we save file multiple time afterward, the file doesn't load correctly.
        //: So we check for it.
        if (registerHandlers) registerHandlers();
      }
    }
  })();
}
