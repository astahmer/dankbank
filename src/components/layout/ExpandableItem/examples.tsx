import { IoMdImages } from "react-icons/io";

import { CustomIcon } from "@/components/common/CustomIcon";
import { CustomImage } from "@/components/common/CustomImage";
import { MemeSearchResult } from "@/components/modules/meme/ExpandableMemesAutocomplete";
import { API_ROUTES } from "@/config/api";
import { useInitialAPI } from "@/hooks/async/useAPI";
import { AutocompleteResponse } from "@/hooks/form/useAutocomplete";

import { ExpandableBox } from "./ExpandableBox";
import { ExpandableGrid } from "./ExpandableGrid";
import { ExpandableList } from "./ExpandableList";

export function ExpandableGridTest() {
    const [async] = useInitialAPI<AutocompleteResponse<MemeSearchResult>>(API_ROUTES.Search.memes, {
        q: "a",
        size: 100,
    });

    return (
        <ExpandableList
            items={async.data ? async.data.items : []}
            getId={(item) => (item as MemeSearchResult)._id}
            renderList={(props) => <ExpandableGrid {...props} />}
            renderItem={({ item }) => (
                <>
                    <CustomImage objectFit="cover" src={(item as MemeSearchResult)._source.pictures[0].url} />
                    {(item as MemeSearchResult)._source.pictures.length > 1 ? (
                        <CustomIcon icon={IoMdImages} color="white" pos="absolute" top="5px" right="5px" size="20px" />
                    ) : null}
                </>
            )}
        />
    );
}

export function ExpandableBoxExample() {
    return (
        <ExpandableBox
            identifier="yes"
            boxProps={{ ml: "auto", w: "100px", h: "100px" }}
            renderItem={() => (
                <CustomImage
                    objectFit="cover"
                    src="http://api.dankbank.lol/public/uploads/999jfgnf88h6qspe_1576527685351.jpg"
                />
            )}
        />
    );
}
