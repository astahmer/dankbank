import { IAbstractEntity } from "./AbstractEntity";
import { IMemeBank } from "./MemeBank";
import { Visibility } from "./Visibility";

export interface IUser extends IAbstractEntity {
    name: string;
    email: string;
    visibility: Visibility;
    favorites: IMemeBank;
    banks: IMemeBank[];
    profilePicture: File;
}
