import React, { useContext, useRef, useState } from 'react';

import { Button } from "primereact/button";
import { Messages } from "primereact/messages";
import { Checkbox } from "primereact/checkbox";

import { DriverContext } from '../contexts/DriverContext';
import { TagAutoComplete } from './TagAutoComplete';
import { ImportFileItem } from './ImportFileItem';
import { deduplicate, EXISTS } from '../../main/common/lib';

interface Props {
  className?: string
}

export const ImportFile = (p: Props) => {

  const { driverState: { selectedDriver } } = useContext(DriverContext);

  // const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [moveFile, setMoveFile] = useState<boolean>(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [selectedFiles, setSelectedFiles] = useState<MoveableFileTag[]>([]);

  const msgRef = useRef<Messages | null>(null);

  const chooseFile = () => {
    window.handler.invoke('choose-file').then((v: Electron.OpenDialogReturnValue) => {
      if (!v.canceled)
        setSelectedFiles(
          v.filePaths.map((filePath: string) => {
            const fileName = filePath.replace(/^.*[\\\/]/, '');
            return { fileName, path: filePath, tagList: [] };
          })
        );
    });
  }

  const tagFile = async (e: any) => {
    if (selectedDriver == null) {
      msgRef?.current?.show({
        severity: 'error', summary: 'Please choose driver'
      });
    } else if (selectedFiles.length == 0) {
      msgRef?.current?.show({
        severity: 'error', summary: 'Please select some file'
      });
    } else {
      await window.handler.invoke('import-files',
        selectedDriver,
        selectedFiles.map(f => ({
          ...f,
          tagList: deduplicate([...f.tagList, ...selectedTags, EXISTS])
        })),
        moveFile
      );

      msgRef?.current?.show({
        severity: 'success', summary: 'File tagged successfully!'
      });

      setSelectedFiles([]);
      setSelectedTags([]);
      setMoveFile(false);
    }
  }

  const addTagFile = (selectedFile: MoveableFileTag, tagList: string[]) => {
    setSelectedFiles(
      selectedFiles.map(f => f.path === selectedFile.path ?
        { path: selectedFile.path, fileName: selectedFile.fileName, tagList } :
        f
      )
    );
  }

  const injectSuggestTags = selectedFiles
    .reduce<string[]>(
      (acc, i: MoveableFileTag) => {
        return [...acc, ...i.tagList];
      }, []);

  return (<div className={p?.className + " grid grid-cols-1 gap-y-2"}>
    <Button label="Choose File" onClick={chooseFile} />
    <TagAutoComplete
      selectedTags={selectedTags}
      onChange={xs => setSelectedTags(xs)}
      disabled={selectedFiles.length == 0}
      placeHolder={selectedFiles.length > 1 ? "Enter tags for all files" : "Enter tags"}
    />
    <div className="p-field-checkbox">
      <Checkbox inputId="binary" checked={moveFile} onChange={e => setMoveFile(e.checked)} />
      <label htmlFor="binary">Move File(s)</label>
    </div>
    {selectedFiles.map(f => <ImportFileItem
      injectSuggestTags={injectSuggestTags}
      selectedFile={f}
      addTagFile={addTagFile}
      unselectFile={file => setSelectedFiles(selectedFiles.filter(f => f.path !== file.path))}
      key={f.path}
    />)}
    <Button label="Import" onClick={tagFile} />
    <Messages ref={msgRef} />
  </div>);
};