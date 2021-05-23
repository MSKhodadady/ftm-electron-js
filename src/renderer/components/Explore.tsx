import React, { useState, useEffect, useContext, EffectCallback } from 'react';

import { FileTag, UseState } from '../../common/types';
import { ipcRenderer } from 'electron';

import { DriverContext } from '../contexts/DriverContext';
import { FileItem } from './FileItem';

interface Props {
  selectFile: Function,
  unselectFile: Function,
  selectedFiles: FileTag[],
  filesList: FileTag[],
  refresh: EffectCallback
}
export const Explore = ({ selectFile, unselectFile, selectedFiles, filesList, refresh }: Props) => {

  const { driverState: { selectedDriver } } = useContext(DriverContext);

  useEffect(refresh, [selectedDriver]);

  return (<div className="w-full">
    {
      filesList && filesList.map(v => <FileItem
        fileTagged={v}
        key={v.fileName}
        refreshList={refresh}
        selectFile={selectFile}
        unselectFile={unselectFile}
        selected={selectedFiles.filter(f => f.fileName === v.fileName).length !== 0}
      />)
    }
  </div>);
}