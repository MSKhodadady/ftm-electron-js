import { createContext, useReducer } from "react";
import { Driver } from "../../common/types";

//: types
export type DriverState = { selectedDriver: Driver | undefined | null };
export type DriverDispatchAction = {
  type: string,
  selectedDriver?: Driver
};
export type DriverDispatch = (action: DriverDispatchAction) => void;

const defaultValue: {
  dispatchDriver: DriverDispatch, driverState: DriverState
} = { dispatchDriver: () => null, driverState: { selectedDriver: undefined } };

export const DriverContext = createContext(defaultValue);

const reducer = (state: DriverState, action: DriverDispatchAction): DriverState => {
  switch (action.type) {
    case 'unselect':
      return { selectedDriver: null };
    case 'select':
      return { selectedDriver: action.selectedDriver }
    default:
      return state;
  }
}

export const driverContextValue = (): { driverState: DriverState, dispatchDriver: DriverDispatch } => {
  const [driverState, dispatchDriver]: [DriverState, DriverDispatch]
    = useReducer(reducer, { selectedDriver: null });
  return { driverState, dispatchDriver }
}