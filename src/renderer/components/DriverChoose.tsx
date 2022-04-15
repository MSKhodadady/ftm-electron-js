import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Menubar } from 'primereact/menubar';
import React, { useContext, useEffect, useState } from 'react';
import { DriverContext } from '../contexts/DriverContext';

interface Props {
  className: string
}

export const DriverChoose = (props: Props) => {
  const { dispatchDriver, driverState } = useContext(DriverContext);

  const [selectedPath, setSelectedPath] = useState<string>("");
  const [selectedName, setSelectedName] = useState<string>("");

  const [dialogType, setDialogType] = useState<{ type: 'add-driver' }
    | { type: 'delete-sure', driver: Driver }>({ type: 'add-driver' });
  const [showDialog, setShowDialog] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const driverList = await window.handler.invoke('get-drivers');
      dispatchDriver({ type: 'set-drivers', driverList })
    })();

  }, []);

  const openFolder = async () => {
    const path =
      await window.handler.invoke('choose-folder');
    if (!path.canceled) {
      setSelectedPath(path.filePaths[0]);
    }
  }

  const addDriver = async () => {
    if (selectedPath.length == 0 || selectedName.length == 0)
      return;

    setShowDialog(false);

    const newDrivers = await window.handler.invoke('add-driver', {
      name: selectedName, path: selectedPath
    });

    dispatchDriver({ type: 'set-drivers', driverList: newDrivers });

    setSelectedName('');
    setSelectedPath('');
  }

  const removeDriver = async (driver: Driver) => {
    const newDrivers = await window.handler.invoke('remove-driver', driver);
    dispatchDriver({ type: 'set-drivers', driverList: newDrivers });
    dispatchDriver({ type: 'unselect' });
  }

  const renameDriver = async (driver: Driver, newName: string) => {
    const newDrivers = await window.handler.invoke('rename-driver', driver, newName);
    dispatchDriver({ type: 'set-drivers', driverList: newDrivers });
  }

  const dialogDispatch = () => {
    switch (dialogType.type) {
      case 'add-driver':
        return <Dialog
          header="Add Driver"
          visible={showDialog}
          onHide={() => setShowDialog(false)}
        >
          <div className="flex flex-col">
            <InputText
              placeholder="Driver Name"
              className="mb-2"
              value={selectedName}
              onChange={e => setSelectedName(e.target.value)} />
            <Button
              label="Choose Driver Path" className="mb-2" onClick={() => openFolder()} />
            <div className="mb-2">{
              selectedPath.length == 0 ?
                <h1 className="text-red-500">No path selected</h1> :
                <h1>{selectedPath}</h1>
            }</div>
            <Button label="Confirm" onClick={() => addDriver()} />
          </div>
        </Dialog>;

      case 'delete-sure':
        if (dialogType.driver) {
          return <Dialog
            onHide={() => setShowDialog(false)}
            visible={showDialog}
            header="Are you sure?"
          >
            <p className="mb-3 w-72">By pressing <i>Yes</i>, neither files or tags would remove.
            If you want to delete them, delete them from driver path.
            If you want to delete delete all tags but not files, remove <i>.ftm</i> folder in
            the driver path.
            <br />
            You can also delete fils and tags <i>before</i> removing driver.
            </p>

            <Button
              label="Yes"
              className="w-full p-button-danger"
              onClick={() => {
                removeDriver(dialogType.driver);
                setShowDialog(false);
              }} />
          </Dialog>
        }
    }
  }

  return (
    <div className={props.className + " px-2"}>
      <Menubar
        className="mb-2"
        model={[
          {
            icon: 'pi pi-plus',
            className: 'just-icon-menu-item',
            command: () => {
              setDialogType({ type: 'add-driver' });
              setShowDialog(true);
            }
          }
        ]}
        start={<h1 className="mr-2">Drivers</h1>}
      />

      {driverState.driverList.map(driver => <DriverItem
        key={driver.path}
        driver={driver}
        onRemove={() => {
          setDialogType({ type: 'delete-sure', driver });
          setShowDialog(true);
        }}
        onRename={renameDriver} />)
      }

      {dialogDispatch()}
      {/* <Button onClick={e => window.handler.invoke('tag-list-all', driverState.selectedDriver, 50).then(console.log)}
        label="tag-list-all" /> */}
    </div>
  );
}

const DriverItem = (p: { driver: Driver, onRemove: () => void, onRename: (driver: Driver, newName: string) => Promise<void> }) => {

  const { dispatchDriver, driverState } = useContext(DriverContext);

  const [editingName, setEditingName] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>(p.driver.name);

  return (<div
    className={
      "flex items-center rounded-sm p-2 detail-hidable" +
      " " + (p.driver.path === driverState.selectedDriver?.path ? 'bg-red-100' : 'bg-white')
    }>
    <div
      className="w-full cursor-pointer"
      onClick={() => dispatchDriver({ type: 'select', selectedDriver: p.driver })}>
      {
        editingName ?
          <InputText
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyUp={e => {
              if (e.code == 'Enter') {
                p.onRename(p.driver, newName);
                setEditingName(false);
              }
            }} />
          :
          <div>{p.driver.name}</div>
      }
      <div className="text-gray-400 text-xs">{p.driver.path}</div>
    </div>
    <div className="flex details">
      <i className="pi pi-trash cursor-pointer" onClick={p.onRemove} />
      <i className="pi pi-pencil cursor-pointer ml-2" onClick={() => {
        if (editingName) {
          p.onRename(p.driver, newName);
          setEditingName(false);
        } else {
          setEditingName(true);
        }
      }} />
    </div>
  </div>)
}