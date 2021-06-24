import { ipcRenderer } from 'electron';
import React from 'react';

interface Props {
  filePath: string
}

export const ImportFileItem = (p: Props) => {
  const fileName = p.filePath.replace(/^.*[\\\/]/, '');
  return (<div
    className="flex shadow-md rounded-md w-full p-0 mb-2 file-row" >
    {/* file icon (or thumbnail) */}
    <div
      className="bg-gray-200 mr-2 h-auto rounded-l-md p-3 cursor-pointer"
      onClick={() => ipcRenderer.invoke('open-external-file', p.filePath)}>
      <span className="pi pi-image" />
    </div>
    <div>
      <h2 className="text-xs text-gray-400">{p.filePath.substring(0, p.filePath.length - fileName.length)}</h2>
      <h1>{fileName}</h1>
    </div>
  </div>);
}