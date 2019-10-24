import { IUser } from "../entities/User";

// TODO Bien définir les prop optionnelles sur chaque entité, ex: IUser.profilePicture?
export type RegisterResponse = IUser & {
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
};

export type RegisterBody = {
    name: string;
    email: string;
    password: string;
};
