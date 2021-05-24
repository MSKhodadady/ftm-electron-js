import React, { useState, useEffect, useContext } from 'react';

import { Driver, UseState, } from "../common/types";
import { DriverChoose } from './components/DriverChoose';
import { ImportFile } from './components/ImportFile';
import { Explore } from './components/Explore';
import { DriverContext } from './contexts/DriverContext';

import { ipcRenderer } from "electron";
import { MenuItem } from 'primereact/components/menuitem/MenuItem';
import { Menubar } from "primereact/menubar";

type Drivers = Driver[];

const App = () => {

  const { driverState: { selectedDriver } } = useContext(DriverContext);

  const [drivers, setDrivers]: UseState<Drivers> = useState([]);
  const [route, setRoute]: UseState<string> = useState('explore');

  const routeDispatch = (routeName) => {
    switch (routeName) {
      case 'import-file':
        return <ImportFile />
      case 'explore':
        return (selectedDriver == null) ?
          <div className="p-3 bg-yellow-300 w-full h-12 text-center" >Please select driver!</div> :
          <Explore />;
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
    }
  ];

  return (
    <div>
      <Menubar model={menu} />
      <div className="flex p-2">
        <DriverChoose drivers={drivers} className="w-1/4" />
        {routeDispatch(route)}
      </div>
    </div>
  );
}

export default App;