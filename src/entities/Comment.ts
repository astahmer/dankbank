import { IAbstractEntity } from "./AbstractEntity";
import { IUser } from "./User";
import { IMeme } from "./Meme";

export interface IComment extends IAbstractEntity {
    message: string;
    meme: IMeme;
    user: IUser;
    parent: IComment;
    answers: IComment[];
}
