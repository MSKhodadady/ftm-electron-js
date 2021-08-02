const {
  contextBridge,
  ipcRenderer: { invoke }
} = require('electron');

contextBridge.exposeInMainWorld('handler', {
  invoke
});