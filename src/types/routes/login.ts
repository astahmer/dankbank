export type LoginResponse = {
    accessToken: string;
    refreshToken: string;
    success: boolean;
};

export type LoginBody = {
    name: string;
    email: string;
    password: string;
};
