import { IAbstractEntity } from "./AbstractEntity";
import { IMemeBank } from "./MemeBank";
import { ITag } from "./Tag";
import { IUser } from "./User";

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
