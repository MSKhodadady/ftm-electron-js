import React, { useContext, useRef, useState } from 'react';

import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Messages } from "primereact/messages";
import { Checkbox } from "primereact/checkbox";
import { ipcRenderer } from 'electron';

import { UseState } from '../../common/types';
import { DriverContext } from '../contexts/DriverContext';
import { TagAutoComplete } from './TagAutoComplete';


export const ImportFile = () => {

  const { driverState: { selectedDriver } } = useContext(DriverContext);

  const [selectedPaths, setSelectedPaths]: UseState<string[]> = useState([]);
  const [moveFile, setMoveFile]: UseState<boolean> = useState(false);
  const [selectedTags, setSelectedTags]: UseState<string[]> = useState([]);

  const msgRef = useRef(null);

  const chooseFile = () => {
    ipcRenderer.invoke('choose-file').then((v: Electron.OpenDialogReturnValue) => {
      if (!v.canceled) setSelectedPaths(v.filePaths);
    });
  }

  const tagFile = async e => {
    if (selectedDriver == null) {
      msgRef.current.show({
        severity: 'error', summary: 'Please choose driver'
      });
    } else if (selectedPaths.length == 0) {
      msgRef.current.show({
        severity: 'error', summary: 'Please select a file'
      });
    } else {
      const error = await ipcRenderer.invoke('save-file',
        selectedPaths,
        selectedTags,
        selectedDriver,
        moveFile
      );

      if (error != undefined) {
        msgRef.current.show({
          severity: 'error', summary: 'Error occurred!'
        });
        console.error(error);
      } else {
        msgRef.current.show({
          severity: 'success', summary: 'File tagged successfully!'
        });

        setSelectedPaths([]);
        setSelectedTags([]);
        setMoveFile(false);
      }
    }
  }

  return (<div className="grid grid-cols-1 gap-y-2 w-3/4">
    <div className="flex">
      <Button label="Choose File" onClick={chooseFile} className="w-1/5 mr-2" />
      <InputText
        value={
          selectedPaths.map(v => v + ';').reduce((sum, v) => sum + v, '')
        }
        contentEditable="false"
        className="w-4/5"
        placeholder="File path"
      />
    </div>
    <TagAutoComplete
      selectedTags={selectedTags}
      onChange={xs => setSelectedTags(xs)}
    />
    <div className="p-field-checkbox">
      <Checkbox inputId="binary" checked={moveFile} onChange={e => setMoveFile(e.checked)} />
      <label htmlFor="binary">Move File</label>
    </div>
    <Button label="Move file" onClick={tagFile} />
    <Messages ref={msgRef} />
  </div>)
};