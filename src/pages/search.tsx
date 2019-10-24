import { Heading } from "@chakra-ui/core";
import { useState } from "react";

import { Autocomplete } from "@/components/field/Autocomplete/Autocomplete";
import { API_ROUTES } from "@/config/api";
import { useAPI } from "@/functions/hooks/useAPI";
import { AuthAccess } from "@/services/AuthManager";

export type MemeDoc = {
    text?: string;
    _id: number;
    _index: string;
    _type: string;
    _score: string;
    _source: {
        title: string;
    };
};

export default function Search() {
    const [selecteds, setSelecteds] = useState([]);
    const [async, run] = useAPI(API_ROUTES.Search.memes);

    const suggestionFn = (value: string) => run({ q: value, size: 25 });
    const displayFn = (hit: MemeDoc) => hit._source.title.split(" ")[0];
    const getId = (hit: MemeDoc) => hit._id;

    return (
        <div>
            <Heading>Search page</Heading>
            <Autocomplete
                label="Meme search"
                isLoading={async.isLoading}
                onSelectionChange={setSelecteds}
                icon={{ name: "search" }}
                suggestionFn={suggestionFn}
                displayFn={displayFn}
                getId={getId}
                shouldShowResultsOnFocus
            />
        </div>
    );
}

Search.AuthAccess = AuthAccess.BOTH;

Search.PageHead = {
    title: "Search",
    description: "Dankbank Search",
    keywords: "dankbank dank bank index home memes meme 420 69 search",
};
