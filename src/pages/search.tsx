import { Heading } from "@chakra-ui/core";

import { MemeSearch } from "@/components/modules/meme/MemeSearch";
import { AuthAccess } from "@/services/AuthManager";

export default function Search() {
    return (
        <>
            <Heading>Search page</Heading>
            <MemeSearch />
        </>
    );
}

Search.AuthAccess = AuthAccess.BOTH;

Search.PageHead = {
    title: "Search",
    description: "Dankbank Search",
    keywords: "dankbank dank bank index home memes meme 420 69 search",
};
