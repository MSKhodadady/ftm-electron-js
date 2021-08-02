import { InputText } from 'primereact/inputtext';
import React, { useContext, useState } from 'react';
import { FileTag, UseState } from "../../common/types";
import { DriverContext } from '../contexts/DriverContext';
import { Checkbox } from 'primereact/checkbox';


interface Props {
  file: FileTag,
  selected: boolean,
  editFileName: (fileName: string, newFileName: string) => Promise<void>,
  selectFile: Function,
  unselectFile: Function,
  removeTag: (file: FileTag, tag: string) => Promise<void>
}

const MyChip = ({ label, className, onRemove }: any) => (<div className={"p-chip p-component chip " + className}>
  <span className="p-chip-text">{label}</span>
  <span className="pi pi-times-circle ml-2 remove hidden cursor-pointer" onClick={onRemove} />
</div>);

export const FileItem = (p: Props) => {
  const { fileName, tagList } = p.file;

  const { driverState: { selectedDriver } } = useContext(DriverContext);

  const [isEditFileName, setIsEditFileName]: UseState<boolean> = useState(false);
  const [newFileName, setNewFileName]: UseState<string> = useState(fileName);

  //: open file in the OS
  const openFile = (e: any) => {
    window.handler.invoke('open-file', selectedDriver, fileName).then((err: any) => {
      if (err) console.error(err);
    });
  };

  const editFileName = async (e: any) => {
    if (isEditFileName) {
      //: rename file
      p.editFileName(fileName, newFileName);
      setIsEditFileName(false);
    } else
      setIsEditFileName(true);
  }

  return (
    <div
      className={`flex shadow-md rounded-md w-full p-0 mb-2 detail-hidable ${p.selected ? 'bg-blue-100' : ''}`}>
      {/* file icon (or thumbnail) */}
      <div className="bg-gray-100 mr-2 h-auto rounded-l-md p-3 cursor-pointer" onClick={openFile}>
        <span className="pi pi-image" />
      </div>
      <div className="flex items-center my-3 w-full ">
        {/* tags */}
        <div className="w-full flex items-center w-1/2">
          {/* for renaming file */}
          {

            isEditFileName ?
              <InputText
                value={newFileName}
                onChange={e => setNewFileName(e.target.value)}
                onKeyUp={e => {
                  if (e.code === 'Enter') {
                    p.editFileName(fileName, newFileName);
                    setIsEditFileName(false);
                  }
                }}
              />
              :
              <div className="mr-2">{fileName}</div>
          }
          {tagList
            .filter(v => v !== ':EXISTS:')
            .map(v => <MyChip
              className="mr-2"
              label={v} key={v}
              onRemove={() => p.removeTag(p.file, v)}
            />)}
        </div>
        {/* details */}
        <div className="flex flex-row-reverse mx-3 details">
          <Checkbox
            className="ml-2"
            checked={p.selected}
            onChange={e => e.checked ? p.selectFile(p.file) : p.unselectFile(p.file)} />
          <span className="pi pi-pencil cursor-pointer" onClick={editFileName} />
        </div>
      </div>
    </div>
  );
}