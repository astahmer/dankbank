import { IAbstractEntity } from "./AbstractEntity";
import { IUser } from "./User";
import { ITag } from "./Tag";
import { IMemeBank } from "./MemeBank";

export interface IMeme extends IAbstractEntity {
    title: string;
    description: string;
    tags: ITag[];
    upvoteCount: number;
    downvoteCount: number;
    views: number;
    isMultipartMeme: boolean;
    pictures: File[];
    banks: IMemeBank[];
    comments: Comment[];
    owner: IUser;
}
