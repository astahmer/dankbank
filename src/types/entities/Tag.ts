import { IAbstractEntity } from "./AbstractEntity";
import { IMeme } from "./Meme";

export interface ITag extends IAbstractEntity {
    tag: string;
    meme: IMeme;
    upvoteCount: number;
}
