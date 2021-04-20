import { Dispatch, SetStateAction } from 'react';
export interface Driver {
    name: string,
    path: string
}

export interface Test {
    name: string
}

export interface Test3 {
    name: string
}

export type UseStateFunction<T> = Dispatch<SetStateAction<T>>;
export type UseState<T> = [T, UseStateFunction<T>];