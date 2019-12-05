import { IAbstractEntity } from "./AbstractEntity";
import { IMemeBank } from "./MemeBank";
import { ITag } from "./Tag";
import { IUser } from "./User";
import { Visibility } from "./Visibility";

export interface IMeme extends IAbstractEntity {
    tags: ITag[];
    upvoteCount: number;
    downvoteCount: number;
    views: number;
    isMultipartMeme: boolean;
    visibility: Visibility;
    pictures: File[];
    banks: IMemeBank[];
    comments: Comment[];
    owner: IUser | number;
}
