import React, { useState, useContext } from 'react';

import { DriverChoose } from './components/DriverChoose';
import { ImportFile } from './components/ImportFile';
import { Explore } from './components/Explore';
import { DriverContext } from './contexts/DriverContext';

import { Menubar } from "primereact/menubar";
import { MenuItem } from 'primereact/menuitem';

const App = () => {

  const { driverState: { selectedDriver } } = useContext(DriverContext);

  const [route, setRoute]: UseState<string> = useState('explore');

  const routeDispatch = (routeName: string) => {
    switch (routeName) {
      case 'import-file':
        return <ImportFile />
      case 'explore':
        return (selectedDriver == null) ?
          <div className="p-3 bg-yellow-300 h-12 text-center" >Please select driver!</div> :
          <Explore />;
    }
  }

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
        <DriverChoose className="w-96" />
        <div className="w-full">
          {routeDispatch(route)}
        </div>
      </div>
    </div>
  );
}

export default App;