import React, { useState, useEffect } from 'react';

import { Driver, UseState } from '../../common/types';
import { ipcRenderer } from 'electron';

import { Chip } from 'primereact/chip';
import { InputText } from "primereact/inputtext";
import { Checkbox } from 'primereact/checkbox';

interface Props {
  selectedDriver: Driver
}

interface FileTag { fileName: string, tagList: string[] }

const FileItem = (
  { fileTagged: { fileName, tagList }, selectedDriver, refreshList }: { fileTagged: FileTag, selectedDriver: Driver, refreshList: Function }) => {

  const [isEditFileName, setIsEditFileName]: UseState<boolean> = useState(false);
  const [newFileName, setNewFileName]: UseState<string> = useState(fileName);

  //: open file in the OS
  const openFile = e => {
    ipcRenderer.invoke('open-file', selectedDriver, fileName).then(err => {
      console.log(err);
    });
  };

  const editFileName = async e => {
    if (isEditFileName) {
      //: rename file
      await ipcRenderer.invoke('rename-file', selectedDriver, fileName, newFileName);
      setIsEditFileName(false);
      refreshList();
    } else setIsEditFileName(true);
  }

  return (
    <div
      className="flex shadow-md rounded-md w-full p-0 mb-2 file-row">
      {/* file icon (or thumbnail) */}
      <div className="bg-gray-200 mr-2 h-auto rounded-l-md p-3 cursor-pointer" onClick={openFile}>
        <span className="pi pi-image" />
      </div>
      <div className="w-full flex items-center my-3">
        {/* tags */}
        <div className="flex items-center w-1/2">
          <div className={"mr-2" + (isEditFileName ? ' hidden' : '')}>{fileName}</div>
          {/* for renaming file */}
          <InputText
            value={newFileName}
            onChange={e => setNewFileName(e.target.value)}
            className={isEditFileName ? '' : 'hidden'}
          />
          {tagList.map(v => <Chip className="mr-2" label={v} key={v} />)}
        </div>
        {/* details */}
        <div
          className="w-1/2 flex flex-row-reverse mx-3 details hidden">
          <span className="pi pi-pencil cursor-pointer" onClick={editFileName} />
        </div>
      </div>
    </div>
  );
}

export const Explore = ({ selectedDriver }: Props) => {
  if (selectedDriver == null) return <div className="p-3 bg-yellow-300 w-full h-12 text-center" >Please select driver!</div>;

  const [filesList, setFilesList]: UseState<FileTag[]> = useState(null);

  const refresh = () => {
    ipcRenderer.invoke('files-list', selectedDriver).then((dbFileTagList: { file_name: string, tag_name: string }[]) => {
      const output = dbFileTagList.reduce((acc: FileTag[], v) => {
        //: extract a FileTag from acc with same fileName as v
        const [extracted] = acc.filter(fileTag => fileTag.fileName === v.file_name);
        if (extracted) return [
          //: acc without this extracted
          ...acc.filter(fileTag => fileTag.fileName !== v.file_name),
          { fileName: extracted.fileName /* or v.file_name */, tagList: [...extracted.tagList, v.tag_name] }
        ]
        else return [
          ...acc,
          { fileName: v.file_name, tagList: [v.tag_name] }
        ]
      }, []);

      setFilesList(output);
    });
  }

  useEffect(refresh, [selectedDriver]);

  return (<div className="w-full">
    {
      filesList && filesList.map(v => <FileItem fileTagged={v} selectedDriver={selectedDriver} key={v.fileName} refreshList={refresh} />)
    }
  </div>);
}