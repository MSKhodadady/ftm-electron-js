import { ipcRenderer } from 'electron';
import React from 'react';
import { MoveableFileTag } from '../../common/types';
import { TagAutoComplete } from './TagAutoComplete';

interface Props {
  selectedFile: MoveableFileTag,
  addTagFile: (selectedFile: MoveableFileTag, tagList: string[]) => void,
  injectSuggestTags: string[]
}

export const ImportFileItem = ({ selectedFile, addTagFile, injectSuggestTags }: Props) => {
  return (<div
    className="flex shadow-md rounded-md w-full p-0 mb-2 file-row" >
    {/* file icon (or thumbnail) */}
    <div
      className="bg-gray-200 mr-2 h-auto rounded-l-md p-3 cursor-pointer"
      onClick={() => ipcRenderer.invoke('open-external-file', selectedFile.path)}>
      <span className="pi pi-image" />
    </div>
    <div>
      <h2 className="text-xs text-gray-400">{
        selectedFile.path.substring(0, selectedFile.path.length - selectedFile.fileName.length)}</h2>
      <h1>{selectedFile.fileName}</h1>
    </div>
    <TagAutoComplete
      selectedTags={selectedFile.tagList}
      onChange={ts => addTagFile(selectedFile, ts)}
      className="ml-5"
      injectSuggestTags={injectSuggestTags} />
  </div>);
}