import { Dispatch, SetStateAction } from 'react';
export interface Driver {
    name: string,
    path: string
}

export type UseStateFunction<T> = Dispatch<SetStateAction<T>>;
export type UseState<T> = [T, UseStateFunction<T>];

export interface FileTag { fileName: string, tagList: string[] }