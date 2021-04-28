import React, { useState, useEffect, useRef } from 'react';
import { ipcRenderer } from "electron";

import { Menubar } from "primereact/menubar";

import { Driver, UseState } from "../common/types";
import { DriverChoose } from './components/DriverChoose';
import { MenuItem } from 'primereact/components/menuitem/MenuItem';
import { ImportFile } from './components/ImportFile';
import { Explore } from './components/Explore';

type Drivers = [] | Driver[];

const App = () => {

  const [drivers, setDrivers]: UseState<Drivers> = useState([]);
  const [selectedDriver, setSelectedDriver]: UseState<Driver | null> = useState(null);

  const [route, setRoute]: UseState<string> = useState('explore');
  const routeDispatch = (routeName) => {
    switch (routeName) {
      case 'import-file':
        return <ImportFile selectedDriver={selectedDriver} />
      case 'explore':
        return <Explore selectedDriver={selectedDriver} />
    }
  }


  useEffect(() => {
    (async () => {
      const driversList = await ipcRenderer.invoke('get-drivers');
      setDrivers(driversList);
    })();

  }, []);

  const menu: MenuItem[] = [
    {
      label: 'Import',
      icon: 'pi pi-arrow-circle-down',
      command() {
        setRoute('import-file');
      }
    },
    {
      label: 'Explore',
      icon: 'pi pi-compass',
      command() {
        setRoute('explore');
      }
    }
  ];

  return (
    <div>
      <Menubar model={menu} />
      <div className="flex p-2">
        <DriverChoose drivers={drivers} selectedDriver={selectedDriver} onSelect={d => setSelectedDriver(d)} className="w-1/4" />
        {routeDispatch(route)}
      </div>
    </div>
  )
}

export default App;