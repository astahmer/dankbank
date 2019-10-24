import { IAbstractEntity } from "./AbstractEntity";
import { IMeme } from "./Meme";
import { IUser } from "./User";

export interface IComment extends IAbstractEntity {
    message: string;
    meme: IMeme;
    user: IUser;
    parent: IComment;
    answers: IComment[];
}
