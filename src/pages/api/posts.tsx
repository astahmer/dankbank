import { NextApiRequest, NextApiResponse } from "next";

import { API } from "@/services/ApiManager";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;

    try {
        const url = "/users?take=10";
        const result = await API.get(url);
        res.end(JSON.stringify(result.data));
    } catch (error) {
        console.log(error.message);
    }

    res.end(JSON.stringify({ name: "Nextjs" }));
};
