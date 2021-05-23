import React, { useState, useEffect, useContext } from 'react';

import { Driver, FileTag, UseState, } from "../common/types";
import { DriverChoose } from './components/DriverChoose';
import { ImportFile } from './components/ImportFile';
import { Explore } from './components/Explore';
import { DriverContext } from './contexts/DriverContext';

import { ipcRenderer } from "electron";
import { MenuItem } from 'primereact/components/menuitem/MenuItem';
import { Menubar } from "primereact/menubar";
import { Dialog } from "primereact/dialog";
import { Button } from 'primereact/button';
import { TagAutoComplete } from './components/TagAutoComplete';

type Drivers = Driver[];

const useFileList = () => {
  const [filesList, setFilesList]: UseState<FileTag[]> = useState([]);

  const refreshFileList = () => {
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
  }

  return { filesList, refreshFileList };
}

const App = () => {

  const { driverState: { selectedDriver } } = useContext(DriverContext);

  const [drivers, setDrivers]: UseState<Drivers> = useState([]);
  const [route, setRoute]: UseState<string> = useState('explore');
  const [selectedFiles, setSelectedFiles]: UseState<FileTag[]> = useState([]);
  //: for add tag action
  const [selectedTags, setSelectedTags]: UseState<string[]> = useState(null);
  //: dialog
  const [showDialog, setShowDialog] = useState(false);
  const [dialogContent, setDialogContent]: UseState<{ type: 'none' | 'tag-auto-complete' | 'file-not-selected' }>
    = useState({ type: 'none' });

  const { filesList, refreshFileList } = useFileList();

  const selectFile = (fileTag: FileTag) => {
    setSelectedFiles([...selectedFiles, fileTag]);
  }

  const unselectFile = (fileTag: FileTag) => {
    setSelectedFiles(selectedFiles.filter(v => v.fileName != fileTag.fileName));
  }

  const routeDispatch = (routeName) => {
    switch (routeName) {
      case 'import-file':
        return <ImportFile />
      case 'explore':
        return (selectedDriver == null) ?
          <div className="p-3 bg-yellow-300 w-full h-12 text-center" >Please select driver!</div> :
          <Explore
            selectFile={selectFile}
            unselectFile={unselectFile}
            selectedFiles={selectedFiles}
            filesList={filesList}
            refresh={refreshFileList}
          />;
    }
  }

  useEffect(() => {
    (async () => {
      const driversList = await ipcRenderer.invoke('get-drivers');
      setDrivers(driversList);
    })();

  }, []);

  const selectedButtonColor = 'bg-blue-100'

  const menu: MenuItem[] = [
    {
      label: 'Import',
      icon: 'pi pi-arrow-circle-down',
      command() {
        setRoute('import-file');
      },
      className: route == 'import-file' ? selectedButtonColor : ''
    },
    {
      label: 'Explore',
      icon: 'pi pi-compass',
      command() {
        setRoute('explore');
      },
      className: route == 'explore' ? selectedButtonColor : ''
    },
    {
      label: 'Actions',
      className: route !== 'explore' ? 'hidden' : '',
      items: [
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
        }
      ]
    }
  ];

  const addTag = async () => {
    await ipcRenderer.invoke('files-tag-add', selectedDriver, selectedFiles, selectedTags);
    setShowDialog(false);
    setSelectedTags([]);
    setSelectedFiles([]);
    refreshFileList();
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
    }
  }

  return (
    <div>
      <Menubar model={menu} />
      <div className="flex p-2">
        <DriverChoose drivers={drivers} className="w-1/4" />
        {routeDispatch(route)}
        {dialogDispatch()}
      </div>
    </div>
  );
}

export default App;