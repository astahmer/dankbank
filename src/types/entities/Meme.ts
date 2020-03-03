import { IAbstractEntity, IAbstractEntityDocument } from "./AbstractEntity";
import { IImage } from "./Image";
import { IMemeBank } from "./MemeBank";
import { ITag } from "./Tag";
import { IUser } from "./User";
import { Visibility } from "./Visibility";

export interface IMeme extends IAbstractEntity {
    tags: ITag[];
    upvoteCount: number;
    downvoteCount: number;
    views: number;
    visibility: Visibility;
    pictures: IImage[];
    banks: IMemeBank[];
    comments: Comment[];
    owner: IUser | number;
}

export type MemeDocument = IAbstractEntityDocument & {
    owner: string;
    tags: string[];
} & Pick<IMeme, "upvoteCount" | "downvoteCount" | "views" | "visibility" | "pictures" | "dateCreated">;

export type Meme = IMeme | MemeDocument;
