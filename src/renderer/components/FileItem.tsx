import { ipcRenderer } from 'electron';
import { Chip } from 'primereact/chip';
import { InputText } from 'primereact/inputtext';
import React, { useContext, useState } from 'react';
import { FileTag, UseState } from "../../common/types";
import { DriverContext } from '../contexts/DriverContext';
import { Checkbox } from 'primereact/checkbox';


interface Props {
  fileTagged: FileTag,
  selected: boolean,
  refreshList: Function,
  selectFile: Function,
  unselectFile: Function
}

export const FileItem = (
  { fileTagged, refreshList, selectFile, unselectFile, selected }: Props) => {
  const { fileName, tagList } = fileTagged;

  const { driverState: { selectedDriver } } = useContext(DriverContext);

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
      className={`flex shadow-md rounded-md w-full p-0 mb-2 file-row ${selected ? 'bg-blue-100' : ''}`}>
      {/* file icon (or thumbnail) */}
      <div className="bg-gray-200 mr-2 h-auto rounded-l-md p-3 cursor-pointer" onClick={openFile}>
        <span className="pi pi-image" />
      </div>
      <div className="w-full flex items-center my-3">
        {/* tags */}
        <div className="w-full flex items-center w-1/2">
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
        <div className="flex flex-row-reverse details mx-3 hidden">
          <Checkbox
            className="ml-2"
            checked={selected}
            onChange={e => e.checked ? selectFile(fileTagged) : unselectFile(fileTagged)} />
          <span className="pi pi-pencil cursor-pointer" onClick={editFileName} />
        </div>
      </div>
    </div>
  );
}