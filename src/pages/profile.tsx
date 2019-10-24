import { useState } from "react";

import { LogoutBtn } from "@/components/buttons/LogoutBtn";
import { Autocomplete } from "@/components/field/Autocomplete/Autocomplete";
import { API_ROUTES } from "@/config/api";
import { useAPI } from "@/functions/hooks/useAPI";
import { AuthAccess } from "@/services/AuthManager";

import { MemeDoc } from "./search";

export default function Profile() {
    const [selecteds, setSelecteds] = useState([]);
    const [async, run] = useAPI(API_ROUTES.Search.tag);

    const suggestionFn = (value: string) => run({ q: value, size: 25 });
    const displayFn = (suggestion: MemeDoc) => suggestion.text;
    const getId = (suggestion: MemeDoc) => suggestion._id;

    return (
        <div>
            <h1>Profile page</h1>
            <Autocomplete
                label="Tag search"
                isLoading={async.isLoading}
                onSelectionChange={setSelecteds}
                icon={{ name: "search" }}
                suggestionFn={suggestionFn}
                displayFn={displayFn}
                getId={getId}
                shouldShowResultsOnFocus
                withGhostSuggestion
            />
            <div>
                <LogoutBtn />
            </div>
        </div>
    );
}

Profile.AuthAccess = AuthAccess.LOGGED;

Profile.PageHead = {
    title: "Profile",
    description: "Dankbank User profile ",
    keywords: "dankbank dank bank index home memes meme 420 69 user",
};
