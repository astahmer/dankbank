import { IAbstractEntity } from "./AbstractEntity";

export interface IFile extends IAbstractEntity {
    originalName: string;
    name: string;
    size: number;
    parent: IFile;
    url: string;
}
