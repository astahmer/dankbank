import { Heading } from "@chakra-ui/core";

import { MemeSearch } from "@/components/modules/meme/MemeSearch";
import { AuthAccess } from "@/services/AuthManager";

export default function Search() {
    return (
        <div>
            <Heading>Search page</Heading>
            {/* <ExpandableBoxExample /> */}
            {/* <ExpandableGridTest /> */}
            {/* <DraggableListTest /> */}
            {/* <FullscreenModal
                isOpen={false}
                close={() => {}}
                body={
                    <Box w="100%" h="100%">
                        <Debug data={selected?._source} initialState={false} />
                        <MemeBox meme={selected?._source} layout="slider" />
                    </Box>
                }
                withHeader={false}
                withCloseBtn={false}
            /> */}
            <MemeSearch />
        </div>
    );
}

Search.AuthAccess = AuthAccess.BOTH;

Search.PageHead = {
    title: "Search",
    description: "Dankbank Search",
    keywords: "dankbank dank bank index home memes meme 420 69 search",
};
