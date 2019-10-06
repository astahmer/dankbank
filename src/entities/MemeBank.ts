import { Visibility } from "./Visibility";
import { IAbstractEntity } from "./AbstractEntity";
import { IUser } from "./User";
import { IMeme } from "./Meme";

export interface IMemeBank extends IAbstractEntity {
    title: string;
    description: string;
    coverPicture: File;
    visibility: Visibility;
    owner: IUser;
    isCollaborative: boolean;
    members: IUser[];
    memes: IMeme[];
}
