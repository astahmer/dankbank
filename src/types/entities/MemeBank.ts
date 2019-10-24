import { IAbstractEntity } from "./AbstractEntity";
import { IMeme } from "./Meme";
import { IUser } from "./User";
import { Visibility } from "./Visibility";

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
