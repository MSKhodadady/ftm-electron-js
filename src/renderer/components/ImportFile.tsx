import React, { useRef, useState } from 'react';

import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { AutoComplete } from "primereact/autocomplete";
import { Messages } from "primereact/messages";
import { Checkbox } from "primereact/checkbox";
import { ipcRenderer } from 'electron';
import { Driver, UseState } from '../../common/types';

interface Props {
  selectedDriver: Driver
}

export const ImportFile = ({ selectedDriver }: Props) => {

  const [selectedPaths, setSelectedPaths]: UseState<string[] | ''> = useState('');
  const [moveFile, setMoveFile]: UseState<boolean> = useState(false);
  const [selectedTags, setSelectedTags]: UseState<string[]> = useState(null);
  const [filteredTags, setFilteredTags]: UseState<string[]> = useState(null);

  const msgRef = useRef(null);

  const chooseFile = () => {
    ipcRenderer.invoke('choose-file').then((v: Electron.OpenDialogReturnValue) => {
      if (!v.canceled) setSelectedPaths(v.filePaths);
    });
  }

  const searchTag = e => {
    const query: string = e.query.trim();

    ipcRenderer.invoke('tag-list', query, selectedDriver).then((res: string[]) => {
      // add the query to list if it isn't in list
      if (!res.includes(query)) res.push(query);

      // filter the selected tags from list
      if (selectedTags != null) res = res.filter(v => !selectedTags.includes(v));

      setFilteredTags(res);
    });
  }

  const tagFile = async e => {
    if (selectedDriver == null) {
      msgRef.current.show({
        severity: 'error', summary: 'Please choose driver'
      });
    } else if (selectedPaths === '') {
      msgRef.current.show({
        severity: 'error', summary: 'Please select a file'
      });
    } else {
      const error = await ipcRenderer.invoke('save-file',
        selectedPaths,
        selectedTags == null ? [] : selectedTags,
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

        setSelectedPaths('');
        setSelectedTags(null);
        setMoveFile(false);
      }
    }
  }

  return (<div className="grid grid-cols-1 gap-y-2 w-3/4">
    <div className="flex">
      <Button label="Choose File" onClick={chooseFile} className="w-1/5 mr-2" />
      <InputText
        value={
          selectedPaths &&
          (selectedPaths as string[]).map(v => v + ';').reduce((sum, v) => sum + v)
        }
        contentEditable="false"
        className="w-4/5"
        placeholder="File path"
      />
    </div>
    <AutoComplete
      className="tag-input"
      value={selectedTags}
      multiple
      suggestions={filteredTags}
      completeMethod={searchTag}
      onChange={e => setSelectedTags(e.value)}
      placeholder="Enter tags"
    />
    <div className="p-field-checkbox">
      <Checkbox inputId="binary" checked={moveFile} onChange={e => setMoveFile(e.checked)} />
      <label htmlFor="binary">Move File</label>
    </div>
    <Button label="Move file" onClick={tagFile} />
    <Messages ref={msgRef} />
  </div>)
};