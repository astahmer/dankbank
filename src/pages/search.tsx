import { Heading } from "@chakra-ui/core";

import { ExpandableTagsAutocomplete } from "@/components/field/ExpandableTagsAutocomplete";
import { AuthAccess } from "@/services/AuthManager";

export default function Search() {
    return (
        <div>
            <Heading>Search page</Heading>
            <ExpandableTagsAutocomplete isFloating position="relative" direction="left" setSelecteds={console.log} />
        </div>
    );
}

Search.AuthAccess = AuthAccess.BOTH;

Search.PageHead = {
    title: "Search",
    description: "Dankbank Search",
    keywords: "dankbank dank bank index home memes meme 420 69 search",
};
