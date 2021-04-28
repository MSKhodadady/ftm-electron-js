import React from 'react';
import { Driver } from '../../common/types';

interface Props {
  drivers: Driver[],
  onSelect: (d: Driver) => void,
  selectedDriver: Driver,
  className: string
}

export const DriverChoose = (props: Props) => {
  const selectedStyle = d => `${d === props.selectedDriver ? 'bg-blue-100' : 'bg-white'}  rounded-sm p-2 mr-4`;

  return (
    <div className={props.className}>
      <h1 className="mb-2 p-2">Drivers:</h1>

      {props.drivers.map(d => (
        <div className={selectedStyle(d)} onClick={e => props.onSelect(d)} key={d.name}>
          <div>{d.name}</div>
          <div className="text-gray-400 text-xs">{d.path}</div>
        </div>
      ))}
    </div>
  )
}