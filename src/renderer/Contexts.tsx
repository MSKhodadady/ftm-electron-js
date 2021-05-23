import React from 'react';
import { DriverContext, driverContextValue } from "./contexts/DriverContext";

export const Contexts = ({ children }) => {
    return (
        <DriverContext.Provider value={driverContextValue()}>
            {children}
        </DriverContext.Provider>
    );
}