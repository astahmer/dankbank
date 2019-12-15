import { Box, Grid, useColorMode } from "@chakra-ui/core";
import { IoMdImages } from "react-icons/io";

import { API_ROUTES } from "@/config/api";
import { useAPI } from "@/hooks/async/useAPI";
import {
    AutocompleteResultListRenderPropArg, AutocompleteDataProps, AutocompleteFnProps,
    AutocompleteOptionsProps, AutocompleteProps, AutocompleteResponseProps
} from "@/hooks/form/useAutocomplete";
import { IMeme } from "@/types/entities/Meme";

import {
    ExpandableAutocompleteBtn, ExpandableAutocompleteWrapperBtnProps
} from "../buttons/ExpandableAutocompleteBtn";
import { CustomIcon } from "../common/CustomIcon";
import { CustomImage } from "../common/CustomImage";

export function ExpandableMemesAutocomplete({
    setSelecteds,
    ...props
}: ExpandableAutocompleteWrapperBtnProps<MemeSearchResult>) {
    const [async, run, resetFn, canceler] = useAPI(API_ROUTES.Search.memes, {
        initialData: { items: [], total: undefined },
    });

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
                <Box key={key} pos="relative" display="flex" bg={colorMode === "light" ? "gray.100" : "blue.900"}>
                    <CustomImage ignoreFallback objectFit="cover" src={item._source.pictures[0].url} />
                    {item._source.pictures.length > 1 ? (
                        <CustomIcon icon={IoMdImages} pos="absolute" top="5px" right="5px" size="20px" />
                    ) : null}
                </Box>
            ))}
        </Grid>
    );

    const data: AutocompleteDataProps = { onSelectionChange: setSelecteds, ...async.data };
    const response: AutocompleteResponseProps = { ...async, resetFn };
    const fn: AutocompleteFnProps = { suggestionFn, displayFn, getId, createFn };
    const autocompleteProps: AutocompleteProps = { data, response, fn };

    return (
        <ExpandableAutocompleteBtn
            display={{ placeholder: "Search memes by tags", icon: "search-2", max: 20 }}
            expandableProps={{ isFloating: true, btnProps: { position: "relative" }, direction: "left" }}
            options={{ usePortal: true } as AutocompleteOptionsProps}
            render={{ resultList }}
            {...autocompleteProps}
        />
    );
}

type MemeSearchResult = Omit<ElasticDocument<IMeme>, "text">;
