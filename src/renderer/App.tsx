import React, { useState, useEffect, useRef } from 'react';
import { ipcRenderer } from "electron";

import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { AutoComplete } from "primereact/autocomplete";
import { RadioButton } from "primereact/radiobutton";
import { Messages } from "primereact/messages";
import { Checkbox } from "primereact/checkbox";

import { Driver, UseState } from "../common/types";

type Drivers = [] | Driver[];

const App = () => {

  const [selectedPaths, setSelectedPaths]: UseState<string[] | ''> = useState('');
  const [selectedTags, setSelectedTags]: UseState<string[]> = useState(null);
  const [filteredTags, setFilteredTags]: UseState<string[]> = useState(null);

  const [drivers, setDrivers]: UseState<Drivers> = useState([]);
  const [selectedDriver, setSelectedDriver]: UseState<Driver | null> = useState(null);
  const [moveFile, setMoveFile]: UseState<boolean> = useState(false);

  const msgRef = useRef(null);
  

  useEffect(() => {
    (async () => {
      console.log('useEffect called!');

      const driversList = await ipcRenderer.invoke('get-drivers');
      setDrivers(driversList);
    })();

  }, []);

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

  const isChecked = (driver) => {
    return selectedDriver ? selectedDriver.name == driver.name : false;
  }

  const tagFile = async e => {
    if (selectedDriver == null) {
      msgRef.current.show({
        severity: 'error', summary: 'Please choose driver'
      });
    } else if (selectedPaths === null) {
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
      }
    }
  }

  const DriverChoose = (
    <div className="driver-choose">
      {
        drivers == [] ? <div>Loading ...</div> : (drivers as Driver[]).map(
          driver => (
            <div key={driver.name}>
              <RadioButton
                inputId={driver.name}
                value={driver}
                onChange={(e) => setSelectedDriver(e.value)}
                checked={isChecked(driver)}
              />
              <div className="label">
                <span>{driver.name}</span>
                <span>path: {driver.path}</span>
              </div>
            </div>
          )
        )
      }
    </div>
  );

  return (
    <div className="app-root">
      {DriverChoose}
      <div className="choose-file-div">
        <Button label="Choose File" onClick={chooseFile} />
        <InputText 
          value={selectedPaths && (selectedPaths as string[]).map(v => v + ';').reduce((sum, v) => sum + v)}
          contentEditable="false"
          className="file-input"
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
      <div className="move-file-checkbox">
          <Checkbox inputId="binary" checked={moveFile} onChange={e => setMoveFile(e.checked)} />
          <label htmlFor="binary">Move File</label>
      </div>
      <Button label="Move file" onClick={tagFile} />
      <Messages ref={msgRef} />
      {/* <Card title="File Properties" className="file-option">
                <div className="image"></div>

                <p>name: test_file.txt</p>
                <p>size: 12 KB</p>
                <p>type: video</p>
            </Card> */}
    </div>
  )
}

export default App;