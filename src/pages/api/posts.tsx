import { API } from "../../config/api";

export default async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;

    try {
        const url = "/users?take=10";
        const result = await API.get(url);
        console.log(result.data);
        res.end(JSON.stringify(result.data));
    } catch (error) {
        console.log(error.message);
    }

    res.end(JSON.stringify({ name: "Nextjs" }));
};
