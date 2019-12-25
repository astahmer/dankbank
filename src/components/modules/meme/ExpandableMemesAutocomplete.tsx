import { Box, Grid, useColorMode } from "@chakra-ui/core";
import { MouseEvent, useRef } from "react";
import { IoMdImages } from "react-icons/io";

import { CustomIcon } from "@/components/common/CustomIcon";
import { CustomImage } from "@/components/common/CustomImage";
import { Debug } from "@/components/common/Debug";
import {
    ExpandableAutocompleteBtn, ExpandableAutocompleteWrapperBtnProps
} from "@/components/field/ExpandableAutocompleteBtn";
import { FullscreenModal } from "@/components/layout/Modal/FullscreenModal";
import { API_ROUTES } from "@/config/api";
import { useAPI } from "@/hooks/async";
import {
    AutocompleteDataProps, AutocompleteFnProps, AutocompleteProps, AutocompleteResponseProps,
    AutocompleteResultListRenderPropArg
} from "@/hooks/form/useAutocomplete";
import { useToggle } from "@/hooks/useToggle";
import { IMeme } from "@/types/entities/Meme";

import { MemeBox } from "./MemeBox";

export function ExpandableMemesAutocomplete({
    setSelecteds,
    ...props
}: ExpandableAutocompleteWrapperBtnProps<MemeSearchResult>) {
    const { colorMode } = useColorMode();

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

    const [isOpen, { open, close }] = useToggle();
    const openedMemeRef = useRef<MemeSearchResult>(null);
    const openMeme = (item: MemeSearchResult) => (event: MouseEvent) => {
        console.log("oui");
        openedMemeRef.current = item;
        open();
    };

    // TODO Display selecteds in FullScreenModal header (still as (removable) tags)
    // API: Search by current inpue value + selecteds tags
    const resultList = (args: AutocompleteResultListRenderPropArg<MemeSearchResult>) => (
        <>
            <Grid gridTemplateColumns="repeat(3, 1fr)" autoRows="100px" gap={1}>
                {args.items.map((item, key) => (
                    <Box
                        key={key}
                        pos="relative"
                        display="flex"
                        bg={colorMode === "light" ? "gray.100" : "blue.900"}
                        onMouseDown={openMeme(item)}
                    >
                        <CustomImage ignoreFallback objectFit="cover" src={item._source.pictures[0].url} />
                        {item._source.pictures.length > 1 ? (
                            <CustomIcon
                                icon={IoMdImages}
                                color="white"
                                pos="absolute"
                                top="5px"
                                right="5px"
                                size="20px"
                            />
                        ) : null}
                    </Box>
                ))}
            </Grid>
            <FullscreenModal
                isOpen={isOpen}
                close={close}
                body={
                    <Box w="100%" h="100%">
                        <Debug data={openedMemeRef.current?._source} initialState={false} />
                        <MemeBox meme={openedMemeRef.current?._source} layout="slider" />
                    </Box>
                }
                withHeader={false}
                withCloseBtn={false}
            />
        </>
    );

    const data: AutocompleteDataProps = { onSelectionChange: setSelecteds, ...async.data };
    const response: AutocompleteResponseProps = { ...async, resetFn };
    const fn: AutocompleteFnProps = { suggestionFn, displayFn, getId, createFn };
    const autocompleteProps: AutocompleteProps = { data, response, fn };

    return (
        <ExpandableAutocompleteBtn
            expandableProps={{
                isFloating: true,
                btnProps: { position: "relative", icon: "search-2" },
                direction: "left",
                inputProps: { placeholder: "Search memes by tags", max: 20 },
            }}
            options={props.options}
            render={{ resultList }}
            {...autocompleteProps}
        />
    );
}

export type MemeSearchResult = Omit<ElasticDocument<IMeme>, "text">;
