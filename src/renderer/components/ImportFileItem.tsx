import React from 'react';
import { TagAutoComplete } from './TagAutoComplete';

interface Props {
  selectedFile: MoveableFileTag,
  injectSuggestTags: string[],
  addTagFile: (selectedFile: MoveableFileTag, tagList: string[]) => void,
  unselectFile: (selectedFile: MoveableFileTag) => void
}

export const ImportFileItem = ({ selectedFile, addTagFile, injectSuggestTags, unselectFile }: Props) => {
  return (<div
    className="flex shadow-md rounded-md w-full p-2 mb-2 file-row items-center" >
    {/* file icon (or thumbnail) */}
    <div className="flex w-full">
      <div
        className="bg-gray-200 mr-2 h-auto rounded-md p-3 cursor-pointer"
        onClick={() => window.handler.invoke('open-external-file', selectedFile.path)}>
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
    </div>
    <div>
      <span className="pi pi-trash cursor-pointer ml-2" onClick={() => unselectFile(selectedFile)} />
    </div>
  </div>);
}