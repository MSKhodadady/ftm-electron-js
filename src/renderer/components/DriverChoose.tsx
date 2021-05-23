import React, { useContext } from 'react';
import { Driver } from '../../common/types';
import { DriverContext } from '../contexts/DriverContext';

interface Props {
  drivers: Driver[],
  className: string
}

export const DriverChoose = (props: Props) => {
  const { dispatchDriver, driverState } = useContext(DriverContext);

  const selectedStyle = d => `${d === driverState.selectedDriver ? 'bg-red-100' : 'bg-white'}  rounded-sm p-2 mr-4`;

  return (
    <div className={props.className}>
      <h1 className="mb-2 p-2">Drivers:</h1>

      {props.drivers.map(d => (
        <div className={selectedStyle(d)} onClick={e => dispatchDriver({ type: 'select', selectedDriver: d })} key={d.name}>
          <div>{d.name}</div>
          <div className="text-gray-400 text-xs">{d.path}</div>
        </div>
      ))}
    </div>
  );
}