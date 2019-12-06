import { Box, Grid, useColorMode } from "@chakra-ui/core";

import { API_ROUTES } from "@/config/api";
import { useAPI } from "@/hooks/async/useAPI";
import { IMeme } from "@/types/entities/Meme";

import {
    ExpandableAutocompleteBtn, ExpandableAutocompleteWrapperBtnProps
} from "../buttons/ExpandableAutocompleteBtn";
import { AutocompleteResultListRenderPropArg } from "./Autocomplete/Autocomplete";

export function ExpandableMemesAutocomplete({
    setSelecteds,
    ...props
}: ExpandableAutocompleteWrapperBtnProps<MemeSearchResult>) {
    const [async, run, reset, canceler] = useAPI(API_ROUTES.Search.memes, { initialData: { items: [] } });

    const suggestionFn = (value: string) => {
        canceler && canceler();
        return run({ q: value.toLowerCase(), size: 100 });
    };
    const displayFn = (suggestion: ElasticDocument) => ("" + suggestion.text).toLowerCase();
    const getId = (suggestion: ElasticDocument) => suggestion._id;
    const createFn = (text: string) => ({ text });

    const { colorMode } = useColorMode();
    const resultList = (args: AutocompleteResultListRenderPropArg<MemeSearchResult>) => (
        <Grid gridTemplateColumns="repeat(3, 1fr)" autoRows="100px" gap={1}>
            {args.items.map((item, key) => (
                <Box key={key} bg={colorMode === "light" ? "gray.100" : "blue.900"}>
                    {item._source.id}
                </Box>
            ))}
        </Grid>
    );
    const autocompleteProps = { async, reset, suggestionFn, displayFn, getId, createFn, resultList };

    return (
        <ExpandableAutocompleteBtn
            placeholder="Search memes by tags"
            icon="search-2"
            shouldShowResultsOnFocus
            withGhostSuggestion
            max={20}
            onSelectionChange={setSelecteds}
            isFloating
            position="relative"
            direction="left"
            usePortal
            {...autocompleteProps}
            {...props}
        />
    );
}

type MemeSearchResult = Omit<ElasticDocument<IMeme>, "text">;
