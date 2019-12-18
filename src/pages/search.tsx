import { Heading } from "@chakra-ui/core";

import { ExpandableMemesAutocomplete } from "@/components/modules/meme/ExpandableMemesAutocomplete";
import { useCallbackRef } from "@/hooks/useCallbackRef";
import { AuthAccess } from "@/services/AuthManager";

export default function Search() {
    // TODO grid via ratio des items found ? useTransition + check masongrid
    // TODO infinite scroll meme search ?

    const [containerRef, getRef] = useCallbackRef();

    return (
        <div>
            <Heading>Search page</Heading>
            <div ref={getRef}></div>
            <ExpandableMemesAutocomplete
                options={{ resultListContainer: containerRef.current }}
                setSelecteds={console.log}
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
