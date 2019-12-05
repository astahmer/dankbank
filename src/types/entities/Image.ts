import { IAbstractEntity } from "./AbstractEntity";

export interface IImage extends IAbstractEntity {
    originalName: string;
    name: string;
    size: number;
    parent?: IImage;
    qualities: Quality[];
    cropData?: Cropper.Data;
    url: string;
}

export enum Quality {
    ORIGINAL = "ORIGINAL",
    HIGH = "HIGH",
    MEDIUM = "MEDIUM",
    LOW = "LOW",
}
