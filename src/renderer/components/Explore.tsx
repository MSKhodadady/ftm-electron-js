import React, { useState, useEffect, useContext } from 'react';

import { FileTag, UseState, UseStateFunction } from '../../common/types';
import { ipcRenderer } from 'electron';

import { DriverContext } from '../contexts/DriverContext';
import { FileItem } from './FileItem';
import { Button } from 'primereact/button';
import { Menubar } from 'primereact/menubar';
import { MenuItem } from 'primereact/components/menuitem/MenuItem';
import { Dialog } from 'primereact/dialog';
import { TagAutoComplete } from './TagAutoComplete';

export const useFileList = () => {
  const { driverState: { selectedDriver } } = useContext(DriverContext);
  const [filesList, setFilesList]: UseState<FileTag[]> = useState([]);
  const [page, setPage]: UseState<number> = useState(0);

  const limit = 50;
  const offset = limit * page;

  const refreshFileList = (setLoadMoreButtonLabel: UseStateFunction<string>) => {
    ipcRenderer.invoke('files-list', selectedDriver, limit, offset)
      .then(newFilesList => {
        if (page == 0)
          setFilesList(newFilesList);
        else if (newFilesList.length == 0) {
          setLoadMoreButtonLabel("No More File!");
          setTimeout(() => setLoadMoreButtonLabel("Load More"), 2000);
        } else
          setFilesList([
            ...filesList,
            ...newFilesList
          ]);
      });
  }

  const removeTag = async (file: FileTag, tag: string) => {
    await ipcRenderer.invoke('tag-remove', selectedDriver, file, tag);
    setFilesList(
      filesList.map(v => {
        if (v.fileName == file.fileName) return {
          fileName: v.fileName,
          tagList: v.tagList.filter(t => t != tag)
        }
        else return v;
      })
    );
  }

  return {
    filesList,
    page,
    setFilesList,
    refreshFileList,
    setPage,
    removeTag
  };
}

interface Props {
}

export const Explore = ({ }: Props) => {

  const { driverState: { selectedDriver } } = useContext(DriverContext);

  const [loadMoreButtonLabel, setLoadMoreButtonLabel]: UseState<string> = useState("Load More");
  const [selectedFiles, setSelectedFiles]: UseState<FileTag[]> = useState([]);
  //: for add tag action
  const [selectedTags, setSelectedTags]: UseState<string[]> = useState([]);
  //: dialog
  const [showDialog, setShowDialog] = useState(false);
  const [dialogContent, setDialogContent]: UseState<{
    type: 'none' | 'tag-auto-complete' | 'file-not-selected' | 'delete-sure'
  }>
    = useState({ type: 'none' });

  const { filesList, page, refreshFileList, setPage, setFilesList, removeTag } = useFileList();

  useEffect(() => refreshFileList(setLoadMoreButtonLabel), [selectedDriver, page]);

  const removeFiles = async () => {
    await ipcRenderer.invoke('remove-files', selectedDriver, selectedFiles);

    setFilesList(
      filesList.filter(v => !selectedFiles.some(x => x.fileName == v.fileName))
    );
    setSelectedFiles([]);
    setShowDialog(false);
  }

  const menu: MenuItem[] = [
    {
      command: () => setPage(0),
      icon: 'pi pi-refresh',
      className: 'refresh-menu-item'
    },
    {
      label: 'Add tag',
      icon: 'pi pi-tag',
      command() {
        if (selectedFiles.length == 0) {
          setShowDialog(true);
          setDialogContent({ type: 'file-not-selected' });
        } else {
          setShowDialog(true);
          setDialogContent({ type: 'tag-auto-complete' });
        }
      }
    },
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      command() {
        if (selectedFiles.length == 0) {
          setDialogContent({ type: 'file-not-selected' });
          setShowDialog(true);
        } else {
          // removeFiles(selectedFiles, setSelectedFiles);
          setDialogContent({ type: 'delete-sure' });
          setShowDialog(true);
        }
      }
    }
  ]

  const selectFile = (fileTag: FileTag) => {
    setSelectedFiles([...selectedFiles, fileTag]);
  }

  const unselectFile = (fileTag: FileTag) => {
    setSelectedFiles(selectedFiles.filter(v => v.fileName != fileTag.fileName));
  }

  const addTag = async () => {
    await ipcRenderer.invoke('files-tag-add', selectedDriver, selectedFiles, selectedTags);
    //: show tags in the files list
    setFilesList(filesList.map(v => {
      if (selectedFiles.filter(f => f.fileName == v.fileName).length != 0) {
        return {
          fileName: v.fileName,
          tagList: [... new Set([
            ...v.tagList,
            ...selectedTags
          ])]
        };
      } else return v;
    }));
    //: close dialog
    setShowDialog(false);
    //: unselect files and tags
    setSelectedTags([]);
    setSelectedFiles([]);
  }

  const dialogDispatch = () => {
    switch (dialogContent.type) {
      case 'none':
        return <template></template>;
      case 'file-not-selected':
        return <Dialog
          onHide={() => setShowDialog(false)}
          visible={showDialog}
          footer={<div></div>}
          position='top'
        >
          <div>Please select some files!</div>
        </Dialog>;
      case 'tag-auto-complete':
        return <Dialog
          onHide={() => setShowDialog(false)}
          visible={showDialog}
          position='top'
          footer={<Button onClick={e => addTag()}>Confirm</Button>} >
          <TagAutoComplete
            selectedTags={selectedTags}
            onChange={xs => setSelectedTags(xs)}
          />
        </Dialog>
      case 'delete-sure':
        return <Dialog
          onHide={() => setShowDialog(false)}
          visible={showDialog}
          position='top'
          header='Are you sure?'>
          <Button label="Yes" onClick={removeFiles} className="w-full p-button-danger" />
        </Dialog>
    }
  }

  return (<div className="w-full">
    <Menubar model={menu} className="mb-2 sticky top-0" />
    {
      filesList && filesList.map(v => <FileItem
        file={v}
        key={v.fileName}
        refreshList={refreshFileList}
        selectFile={selectFile}
        unselectFile={unselectFile}
        selected={selectedFiles.filter(f => f.fileName === v.fileName).length !== 0}
        removeTag={removeTag}
      />)
    }
    <Button className="w-full text-center p-button-rounded p-button-outlined"
      label={loadMoreButtonLabel} onClick={() => setPage(page + 1)} />
    {dialogDispatch()}
  </div>);
}