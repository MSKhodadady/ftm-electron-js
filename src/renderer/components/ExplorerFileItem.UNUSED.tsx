import { ipcRenderer } from 'electron';
import React, { useContext, useState } from 'react';
import { FileTag, UseState } from '../../common/types';
import { DriverContext } from '../contexts/DriverContext';

interface Props {
  file: FileTag,
  selected: boolean,
  refreshList: Function,
  selectFile: Function,
  unselectFile: Function,
  removeTag: (file: FileTag, tag: string) => Promise<void>
}

export const ExploreFileItem = (p: Props) => {

  const { driverState: { selectedDriver } } = useContext(DriverContext);

  const [isEditFileName, setIsEditFileName]: UseState<boolean> = useState(false);
  const [newFileName, setNewFileName]: UseState<string> = useState(p.file.fileName);

  const editFileName = async (e: any) => {
    if (isEditFileName) {
      //: rename file
      await ipcRenderer.invoke('rename-file', selectedDriver, p.file.fileName, newFileName);
      setIsEditFileName(false);
      p.refreshList();
    } else setIsEditFileName(true);
  }

}