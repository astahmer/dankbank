import { IMeme } from "./Meme";
import { IAbstractEntity } from "./AbstractEntity";

export interface ITag extends IAbstractEntity {
    tag: string;
    meme: IMeme;
    upvoteCount: number;
}
