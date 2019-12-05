import { IMeme } from "../entities/Meme";
import { ITag } from "../entities/Tag";

type Tag = Optional<Pick<ITag, "id" | "tag">, "id">;

export type MemeBody = Pick<IMeme, "isMultipartMeme" | "visibility" | "owner"> & {
    tags: Tag[];
    pictures: number[];
};
export type MemeResponse = Pick<
    ItemResponse<IMeme>,
    "upvoteCount" | "downvoteCount" | "views" | "isMultipartMeme" | "visibility" | "id" | "pictures" | "banks" | "owner"
>;
