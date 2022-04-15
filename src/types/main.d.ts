interface Driver {
    name: string,
    path: string
}

type Dispatch<T> = import('react').Dispatch<T>
type SetStateAction<T> = import('react').SetStateAction<T>

type UseStateFunction<T> = Dispatch<SetStateAction<T>>;
type UseState<T> = [T, UseStateFunction<T>];

interface FileTag {
    fileName: string, tagList: string[]
}
interface MoveableFileTag extends FileTag {
    path: string
}

declare module "my-module" {
    global {
        //: injected from 'preload.js'
        interface Window { handler: { invoke: (channel: string, ...args: any[]) => Promise<any> } }

        //: injected from 'parcel'
        interface NodeModule {
            hot: any
        }
    }

}