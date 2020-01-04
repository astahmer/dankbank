import { Heading } from "@chakra-ui/core";
import { IoMdImages } from "react-icons/io";

import { CustomIcon } from "@/components/common/CustomIcon";
import { CustomImage } from "@/components/common/CustomImage";
import { ExpandableBoxContainer } from "@/components/layout/ExpandableBox/ExpandableBoxContainer";
import {
    ExpandableGridContainer
} from "@/components/layout/ExpandableGrid/ExpandableGridContainer";
import {
    ExpandableMemesAutocomplete, MemeSearchResult
} from "@/components/modules/meme/ExpandableMemesAutocomplete";
import { ExpandableImageContainer } from "@/components/modules/meme/MemeResultsGrid";
import { API_ROUTES } from "@/config/api";
import { useAPI } from "@/hooks/async";
import { AutocompleteResponse } from "@/hooks/form/useAutocomplete";
import { useCallbackRef } from "@/hooks/useCallbackRef";
import { AuthAccess } from "@/services/AuthManager";

export default function Search() {
    const [containerRef, getRef] = useCallbackRef();

    return (
        <div>
            <Heading>Search page</Heading>
            <div ref={getRef}></div>
            <ExpandableMemesAutocomplete
                options={{ resultListContainer: containerRef.current }}
                render={{
                    resultList: (args) => (
                        <ExpandableGridContainer
                            ref={args.resultListRef}
                            items={args.items}
                            getId={(item: MemeSearchResult) => item._id}
                            render={(item: MemeSearchResult, isSelected) => (
                                <>
                                    <CustomImage objectFit="cover" src={item._source.pictures[0].url} />
                                    {item._source.pictures.length > 1 ? (
                                    {item._source.pictures.length > 1 && !isSelected ? (
                                        <CustomIcon
                                            icon={IoMdImages}
                                            color="white"
                                            pos="absolute"
                                            top="5px"
                                            right="5px"
                                            size="20px"
                                        />
                                    ) : null}
                                </>
                            )}
                        />
                    ),
                }}
                setSelecteds={() => {}}
            />
            <ExpandableBoxContainer identifier="yes" boxProps={{ ml: "auto", w: "100px", h: "100px" }}>
                <CustomImage
                    objectFit="cover"
                    src="http://api.dankbank.lol/public/uploads/999jfgnf88h6qspe_1576527685351.jpg"
                />
            </ExpandableBoxContainer>
        </div>
    );
}

export function ExpandableGridTest() {
    const [async] = useAPI<AutocompleteResponse<MemeSearchResult>>(
        API_ROUTES.Search.memes,
        { q: "a", size: 100 },
        null,
        null,
        { onMount: true }
    );

    return (
        <ExpandableGridContainer
            items={async.data ? async.data.items : []}
            getId={(item: MemeSearchResult) => item._id}
            render={(item: MemeSearchResult) => (
                <>
                    <CustomImage objectFit="cover" src={item._source.pictures[0].url} />
                    {item._source.pictures.length > 1 ? (
                        <CustomIcon icon={IoMdImages} color="white" pos="absolute" top="5px" right="5px" size="20px" />
                    ) : null}
                </>
            )}
        />
    );
}

Search.AuthAccess = AuthAccess.BOTH;

Search.PageHead = {
    title: "Search",
    description: "Dankbank Search",
    keywords: "dankbank dank bank index home memes meme 420 69 search",
};
