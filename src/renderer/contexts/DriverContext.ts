import { createContext, useReducer } from "react";
import { Driver } from "../../common/types";

//: types
export type DriverState = {
  selectedDriver: Driver | null
  driverList: Driver[]
};

export type DriverDispatchAction =
  { type: 'unselect' } |
  { type: 'select', selectedDriver: Driver } |
  { type: 'set-drivers', driverList: Driver[] };

export type DriverDispatch = (action: DriverDispatchAction) => void;

const defaultValue: {
  dispatchDriver: DriverDispatch, driverState: DriverState
} = {
  dispatchDriver: () => null,
  driverState: { selectedDriver: null, driverList: [] }
};

export const DriverContext = createContext(defaultValue);

const reducer = (state: DriverState, action: DriverDispatchAction): DriverState => {
  switch (action.type) {
    case 'unselect':
      return { ...state, selectedDriver: null };
    case 'select':
      return { ...state, selectedDriver: action.selectedDriver }
    case 'set-drivers':
      return { ...state, driverList: action.driverList }
    default:
      return state;
  }
}

export const driverContextValue = () => {
  const [driverState, dispatchDriver]: [DriverState, DriverDispatch]
    = useReducer(reducer, { selectedDriver: null, driverList: [] });
  return { driverState, dispatchDriver }
}