import React, { useEffect, useState } from 'react';

import { Chip } from 'primereact/chip';

import { Driver, UseState } from '../../common/types';
import { ipcRenderer } from 'electron';


interface Props {
  selectedDriver: Driver
}

interface FileTag { fileName: string, tagList: string[] }

const FileItem = ({ fileTagged: { fileName, tagList }, selectedDriver }: { fileTagged: FileTag, selectedDriver: Driver }) => (
  <div className="flex shadow-md rounded-md w-full p-0 mb-2">
    <div className="bg-gray-200 mr-2 h-auto rounded-l-md p-3 cursor-pointer" onClick={e => {
      ipcRenderer.invoke('open-file', selectedDriver, fileName).then(err => {
        console.log(err);
      });
    }}>
      <span className="pi pi-image" />
    </div>
    <div className="flex items-center my-3">
      <div className="mr-2">{fileName}</div>
      {tagList.map(v => <Chip className="mr-2" label={v} key={v} />)}
    </div>
  </div>
);

export const Explore = ({ selectedDriver }: Props) => {
  if (selectedDriver == null) return <div className="p-3 bg-yellow-300 w-full h-12 text-center" >Please select driver!</div>;

  const [filesList, setFilesList]: UseState<FileTag[]> = useState(null);

  useEffect(() => {
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
  }, [selectedDriver]);

  return (<div className="w-full">
    {
      filesList && filesList.map(v => <FileItem fileTagged={v} selectedDriver={selectedDriver} key={v.fileName} />)
    }
  </div>);
}