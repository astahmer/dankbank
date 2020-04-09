import { Box, ButtonGroup, Flex, Portal, Tag } from "@chakra-ui/core";
import { AxiosRequestConfig } from "axios";
import React, {
    ForwardRefExoticComponent, memo, RefAttributes, useCallback, useContext, useMemo, useState
} from "react";
import { IoMdHeart, IoMdHeartEmpty, IoMdImages } from "react-icons/io";

import { ActionBtn } from "@/components/buttons";
import { MenuModalBtn } from "@/components/buttons/MenuModalBtn";
import { CustomIcon } from "@/components/common/CustomIcon";
import { Picture } from "@/components/common/Picture";
import { AutocompleteItem } from "@/components/field/Autocomplete/AutocompleteItem";
import { ExpandableGrid } from "@/components/layout/ExpandableItem/ExpandableGrid";
import {
    ExpandableList as ExpList, ExpandableListFlipperData, ExpandableListProps,
    ExpandableListRenderBoxArgs, ExpandableListRenderItemArgs
} from "@/components/layout/ExpandableItem/ExpandableList";
import { getAuthorizedAccess } from "@/components/layout/Page/PageLayout";
import { SwipableProps, SwipeDirection, SwipePosition } from "@/components/layout/Swipable";
import { API_ROUTES } from "@/config/api";
import { downloadUrl, isType, shallowDiffers } from "@/functions/utils";
import { useInitialAPI, useRequestAPI, useTriggerAPI } from "@/hooks/async/useAPI";
import { AuthContext, useAuth } from "@/hooks/async/useAuth";
import { useWindowSize } from "@/hooks/dom";
import {
    AutocompleteResponse, AutocompleteResultListRenderPropArg, AutocompleteSelectedListRenderPropArg
} from "@/hooks/form/useAutocomplete";
import { useCallbackRef } from "@/hooks/useCallbackRef";
import { Auth, AuthAccess } from "@/services/AuthManager";
import { FlipperProps } from "@/services/Flipper";
import { IMeme } from "@/types/entities/Meme";

import { ExpandableMemesAutocomplete, MemeSearchResult } from "./ExpandableMemesAutocomplete";
import { MemeSlider, MemeSliderProps } from "./MemePictures";

export function MemeSearch() {
    const { isTokenValid } = useAuth();
    const [async, run] = useInitialAPI<AutocompleteResponse<MemeSearchResult>>(
        "/memes/list",
        { size: 100 },
        null,
        {
            withToken: isTokenValid,
        },
        {
            initialData: { items: [], total: undefined },
        }
    );

    const [containerRef, getRef] = useCallbackRef();

    const setSelecteds = useCallback((selecteds) => {
        selecteds.length && console.log(selecteds);
    }, []);

    return (
        <div ref={getRef}>
            <ExpandableMemesAutocomplete
                options={{ resultListContainer: containerRef.current }}
                render={{
                    resultList: (args) => (
                        <MemeResultList
                            items={args.shouldDisplayList ? args.items : async.data.items}
                            resultListRef={containerRef}
                        />
                    ),
                    selectedList: (args) => <MemeSelectedTags {...args} />,
                }}
                setSelecteds={setSelecteds}
            />
        </div>
    );
}

export const MemeResultList = memo(function (
    args: Pick<AutocompleteResultListRenderPropArg<MemeSearchResult>, "resultListRef" | "items">
) {
    const [sliderPos, setSliderPos] = useState<Record<string, SwipePosition>>({});
    const storeSliderPos = (id: string, pos: SwipePosition) => setSliderPos((prevPos) => ({ ...prevPos, [id]: pos }));

    const { isTokenValid } = useContext(AuthContext);

    const onBeforeFlip: FlipperProps<ExpandableListFlipperData>["onBeforeFlip"] = ({ id, element, data }) => {
        if (data?.isLeaving) return;

        const rect = element.getBoundingClientRect();
        const top = `calc(50vh - ${rect.height / 2}px)`;
        element.style.top = top;
    };

    return (
        <ExpandableList
            ref={args.resultListRef}
            items={args.items}
            getId={(item) => item._id}
            memoData={sliderPos}
            onBeforeFlip={onBeforeFlip}
            renderBox={(props) => props.selected && <MemeBox {...props} isTokenValid={isTokenValid} />}
            renderList={(props) => <ExpandableGrid {...props} />}
            renderItem={(props) => <MemeResult {...props} {...{ storeSliderPos, resultListRef: args.resultListRef }} />}
        />
    );
});

type MemeBoxProps = ExpandableListRenderBoxArgs<MemeSearchResult> & {
    isTokenValid: AuthContext["isTokenValid"];
};

const getFavReqParams = (defaultMemeBankId: number, memeId: number, shouldAdd: boolean): AxiosRequestConfig => ({
    method: shouldAdd ? "post" : "delete",
    data: shouldAdd ? { id: memeId } : null,
    url: API_ROUTES.MemeBank.baseRoute + defaultMemeBankId + API_ROUTES.Meme.baseRoute + (!shouldAdd ? memeId : ""),
});

// TODO Check how to merge Swipable.as component's props to SwipableProps automatically
// const Swipable = BaseSwipable as React.ForwardRefExoticComponent<React.PropsWithChildren<SwipableProps<StackProps>>>;
const MemeBox = (props: MemeBoxProps) => {
    const meme = props.selected._source;
    const decoded = Auth.getDecoded();

    // On Meme selected check that it is in any User.MemeBank if logged
    const [isInAnyBankReq] = useTriggerAPI<{ result: boolean }>(
        meme.iri + API_ROUTES.Meme.isInAnyBank,
        props.isTokenValid
    );
    // Add/remove selected Meme to default MemeBank
    const [async, run] = useRequestAPI<ItemResponse<IMeme> | DeleteResponse>();

    // Checks that selected meme was either already in a User.MemeBank or was added
    const wasFavorited = async.data && isType<ItemResponse<IMeme>>(async.data, "id" in async.data);
    const isInAnyBank = async.data ? wasFavorited : isInAnyBankReq.data?.result;

    const toggleFavorite = () => run(null, getFavReqParams(decoded.defaultMemeBank, meme.id, !isInAnyBank));
    const addFavorite = () => run(null, getFavReqParams(decoded.defaultMemeBank, meme.id, true));

    // TODO add to specific MemeBank / create it
    // TOOD loading state heart (opacity down / icon change)

    return (
        <>
            <Box pos="absolute" top="0" w="100%" h="calc(50vh - 50vw)">
                top
                <Flex justifyContent="space-between">
                    <ButtonGroup>
                        <ActionBtn
                            variant="ghost"
                            size="md"
                            label="Back"
                            icon={"arrow-back"}
                            fontSize="2xl"
                            onClick={() => props.unselect()}
                        />
                    </ButtonGroup>
                    <MenuModalBtn
                        items={[
                            {
                                label: "Enregistrer",
                                onClick: () => {
                                    downloadUrl(meme.pictures[0].url, meme.pictures[0].originalName);
                                },
                            },
                            {
                                label: "Ajouter aux favoris",
                                onClick: addFavorite,
                                hidden: !getAuthorizedAccess(props.isTokenValid).includes(AuthAccess.LOGGED),
                            },
                            { label: "Signaler", onClick: () => console.log("report") },
                        ]}
                        options={{
                            placement: ["right", "top"],
                            topModifier: ({ value, triggerRect }) => value - triggerRect.height - 5,
                        }}
                    />
                </Flex>
                <Flex wrap="wrap">
                    {meme.tags.map((tag, index) => (
                        <Tag
                            key={index}
                            size="sm"
                            rounded="full"
                            variant="solid"
                            variantColor="cyan"
                            ml="2"
                            mb="2"
                            _last={{ mr: 2 }}
                        >
                            {tag}
                        </Tag>
                    ))}
                </Flex>
            </Box>
            {/* Logged user can add the selected Meme as favorite */}
            {props.isTokenValid && (
                <Flex
                    pos="fixed"
                    bottom="0"
                    w="100%"
                    h="calc(50vh - 50vw - 50px)"
                    direction="column"
                    justifyContent="center"
                >
                    <Flex justifyContent="center">
                        {isInAnyBank ? (
                            <Box as={IoMdHeart} size="32px" color="red.400" onClick={toggleFavorite} />
                        ) : (
                            <Box as={IoMdHeartEmpty} size="32px" onClick={toggleFavorite} />
                        )}
                        {/* <Box as={IoMdHeartDislike} size="32px" color="red.400" /> */}
                    </Flex>
                </Flex>
            )}
        </>
    );
};

type MemeResultProps = ExpandableListRenderItemArgs<MemeSearchResult, SwipableProps["currentPos"]> & {
    storeSliderPos: (id: string | number, pos: SwipePosition) => void;
    resultListRef: AutocompleteResultListRenderPropArg<MemeSearchResult>["resultListRef"];
};
const MemeResult = memo(
    function ({
        item,
        index,
        isSelected,
        isDragging,
        storeSliderPos,
        memoData: currentPos = { x: 0, y: 0 },
        isResting,
        columnWidth,
        resultListRef,
    }: MemeResultProps) {
        const onSwipe = (direction: SwipeDirection, pos: SwipePosition) => storeSliderPos(index, pos);

        const { width } = useWindowSize();
        const isMultipartMeme = useMemo(() => item._source.pictures.length > 1, [item]);

        const sliderSelectedProps: Partial<MemeSliderProps> = {
            wrapperProps: {
                display: "flex",
                alignItems: "center",
            },
            slideProps: { height: "auto" },
        };

        const shouldHidePreview = isMultipartMeme && isSelected && isResting && !isDragging;
        const shouldHideSlider = !(isSelected && isResting) || isDragging;

        const component = (
            <>
                <Box overflow="hidden" w="100%" h={!isSelected ? "100%" : undefined}>
                    <Picture
                        useResponsive={false}
                        item={item._source.pictures[currentPos.x]}
                        w="100%"
                        minH={!isSelected ? "96px" : undefined}
                        style={{ visibility: shouldHidePreview ? "hidden" : undefined }}
                    />
                </Box>
                {isMultipartMeme ? (
                    <Portal container={resultListRef.current}>
                        <MemeSlider
                            {...(isSelected ? sliderSelectedProps : {})}
                            meme={item._source}
                            flexProps={{
                                w: "100%",
                                h: "100vh",
                                pos: "fixed",
                                top: 0,
                                zIndex: 5,
                                style: { visibility: shouldHideSlider ? "hidden" : undefined },
                            }}
                            stackProps={{
                                top: "calc(100% - 32px)",
                                style: { display: isDragging ? "none" : undefined },
                            }}
                            width={isSelected ? width : columnWidth}
                            isFullHeight
                            onSwipe={onSwipe}
                            currentPos={currentPos}
                            isDisabled={isDragging}
                        />
                    </Portal>
                ) : null}

                {isMultipartMeme && !isSelected ? (
                    <CustomIcon icon={IoMdImages} color="white" pos="absolute" top="5px" right="5px" size="20px" />
                ) : null}
                <Box pos="absolute" bottom="0">
                    {currentPos.x}
                    {isDragging ? "oui" : "non"}
                    {isResting ? "stop" : "start"}
                </Box>
            </>
        );

        return (
            <Flex w="100%" h="100%">
                {component}
            </Flex>
        );
    },
    (prevProps, nextProps) => {
        const areMemoEqual =
            prevProps.memoData || nextProps.memoData
                ? prevProps.memoData && nextProps.memoData && !shallowDiffers(prevProps.memoData, nextProps.memoData)
                : true;
        const areEqual =
            prevProps.item._id === nextProps.item._id &&
            prevProps.isSelected === nextProps.isSelected &&
            prevProps.isDragging === nextProps.isDragging &&
            prevProps.after === nextProps.after &&
            prevProps.isResting === nextProps.isResting &&
            areMemoEqual;

        return areEqual;
    }
);

// Typing forwardRef component with generic args
const ExpandableList = ExpList as ForwardRefExoticComponent<
    ExpandableListProps<MemeSearchResult> & RefAttributes<HTMLElement>
>;

function MemeSelectedTags(props: AutocompleteSelectedListRenderPropArg) {
    const displaySelecteds = useMemo(
        () =>
            props.selecteds.map((item, index) => (
                <AutocompleteItem
                    {...props.bind(item, index)}
                    height="32px"
                    fontSize="18px"
                    marginRight="4px"
                    marginBottom="8px"
                />
            )),
        [props.selecteds, props.bind]
    );

    return props.selecteds.length ? <div>{displaySelecteds}</div> : null;
}
