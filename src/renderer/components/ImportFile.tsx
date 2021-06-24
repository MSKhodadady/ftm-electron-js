import React, { useContext, useRef, useState } from 'react';

import { Button } from "primereact/button";
import { Messages } from "primereact/messages";
import { Checkbox } from "primereact/checkbox";
import { ipcRenderer } from 'electron';

import { UseState } from '../../common/types';
import { DriverContext } from '../contexts/DriverContext';
import { TagAutoComplete } from './TagAutoComplete';
import { ImportFileItem } from './ImportFileItem';
import { EXISTS } from '../../common/constants';

interface Props {
  className?: string
}

export const ImportFile = (p: Props) => {

  const { driverState: { selectedDriver } } = useContext(DriverContext);

  const [selectedPaths, setSelectedPaths]: UseState<string[]> = useState([]);
  const [moveFile, setMoveFile]: UseState<boolean> = useState(false);
  const [selectedTags, setSelectedTags]: UseState<string[]> = useState([]);

  const msgRef = useRef<Messages | null>(null);

  const chooseFile = () => {
    ipcRenderer.invoke('choose-file').then((v: Electron.OpenDialogReturnValue) => {
      if (!v.canceled) setSelectedPaths(v.filePaths);
    });
  }

  const tagFile = async (e: any) => {
    if (selectedDriver == null) {
      msgRef?.current?.show({
        severity: 'error', summary: 'Please choose driver'
      });
    } else if (selectedPaths.length == 0) {
      msgRef?.current?.show({
        severity: 'error', summary: 'Please select a file'
      });
    } else {
      const error = await ipcRenderer.invoke('save-file',
        selectedPaths,
        [
          ...new Set(
            [EXISTS, ...selectedTags]
          )
        ],
        selectedDriver,
        moveFile
      );

      if (error != undefined) {
        msgRef?.current?.show({
          severity: 'error', summary: 'Error occurred!'
        });
        console.error(error);
      } else {
        msgRef?.current?.show({
          severity: 'success', summary: 'File tagged successfully!'
        });

        setSelectedPaths([]);
        setSelectedTags([]);
        setMoveFile(false);
      }
    }
  }

  return (<div className={p?.className + " grid grid-cols-1 gap-y-2"}>
    <Button label="Choose File" onClick={chooseFile} />
    <TagAutoComplete
      selectedTags={selectedTags}
      onChange={xs => setSelectedTags(xs)}
      disabled={selectedPaths.length == 0}
      placeHolder={selectedPaths.length > 1 ? "Enter tags for all files" : "Enter tags"}
    />
    <div className="p-field-checkbox">
      <Checkbox inputId="binary" checked={moveFile} onChange={e => setMoveFile(e.checked)} />
      <label htmlFor="binary">Move File(s)</label>
    </div>
    {selectedPaths.map(filePath => <ImportFileItem
      filePath={filePath}
      key={filePath}
    />)}
    <Button label="Import" onClick={tagFile} />
    <Messages ref={msgRef} />
  </div>);
};