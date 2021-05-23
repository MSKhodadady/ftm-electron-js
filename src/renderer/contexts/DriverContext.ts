import { createContext, useReducer } from "react";
import { Driver } from "../../common/types";

//: types
export type DriverState = { selectedDriver: Driver };
export type DriverDispatchAction = {
  type: string,
  selectedDriver?: Driver
};
export type DriverDispatch = (action: DriverDispatchAction) => void;

const defaultValue: {
  dispatchDriver: DriverDispatch, driverState: DriverState
} = { dispatchDriver: () => null, driverState: { selectedDriver: null } };

export const DriverContext = createContext(defaultValue);

const reducer = (state: DriverState, action: DriverDispatchAction) => {
  switch (action.type) {
    case 'unselect':
      return { selectedDriver: null };
    case 'select':
      return { selectedDriver: action.selectedDriver }
  }
}

export const driverContextValue = (): { driverState: { selectedDriver: Driver }, dispatchDriver: DriverDispatch } => {
  const [driverState, dispatchDriver]: [{ selectedDriver: Driver }, DriverDispatch]
    = useReducer(reducer, { selectedDriver: null });
  return { driverState, dispatchDriver }
}