import { IAbstractEntity } from "./AbstractEntity";
import { Visibility } from "./Visibility";
import { IMemeBank } from "./MemeBank";

export interface IUser extends IAbstractEntity {
    name: string;
    email: string;
    visibility: Visibility;
    favorites: IMemeBank;
    banks: IMemeBank[];
    profilePicture: File;
}
