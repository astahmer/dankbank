import { IAbstractEntity } from "./AbstractEntity";

export interface File extends IAbstractEntity {
    originalName: string;
    name: string;
    size: number;
}
