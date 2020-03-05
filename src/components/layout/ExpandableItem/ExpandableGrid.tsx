import { Grid } from "@chakra-ui/core";
import { memo } from "react";
import { areEqual, FixedSizeGrid, GridChildComponentProps } from "react-window";

import { useWindowSize } from "@/hooks/dom";
import { useAvailableHeight } from "@/hooks/dom/useAvailableHeight";
import { useCallbackRef } from "@/hooks/useCallbackRef";

import { ExpandableItem } from "./ExpandableItem";
import { ExpandableListProps } from "./ExpandableList";

export function ExpandableGrid({
    items,
    getFlipId,
    selected,
    memoData,
    columnCount = 3,
    ...props
}: ExpandableGridProps) {
    const { width, height } = useWindowSize();
    const gridItemProps = { width, height, ...props };
    const data = { items, getFlipId, selected, memoData, gridItemProps };

    const [ref, setRef] = useCallbackRef();
    const availableHeight = useAvailableHeight(ref);

    return (
        <FixedSizeGrid
            outerRef={setRef}
            columnCount={columnCount}
            columnWidth={width / columnCount}
            rowCount={Math.round(items.length / columnCount + (items.length % columnCount))}
            rowHeight={100}
            width={width}
            height={availableHeight}
            itemData={data}
            style={{ willChange: "unset" }}
        >
            {GridCell}
        </FixedSizeGrid>
    );
}

type ExpandableGridItemData = {
    items: object[];
    getFlipId: (item: object) => string;
    selected: object;
    memoData: Record<string | number, any>;
};

const GridCell = memo(
    ({ columnIndex, rowIndex, style, data }: GridChildComponentProps & { data: ExpandableGridItemData }) => {
        const { items, getFlipId, selected, memoData, gridItemProps } = data;
        const index = columnIndex + rowIndex * 3;
        const item = items[index];

        return (
            <ExpandableItem
                style={style}
                index={index}
                item={item}
                flipId={getFlipId(item)}
                isSelected={selected ? getFlipId(selected) === getFlipId(item) : false}
                memoData={memoData ? memoData[index] : undefined}
                {...gridItemProps}
            />
        );
    },
    areEqual
);

export function ExpandableClassicGrid({ items, getFlipId, selected, memoData, ...props }: ExpandableRenderListProps) {
    const { width, height } = useWindowSize();
    const gridItemProps = { width, height, ...props };

    return (
        <Grid gridTemplateColumns="repeat(3, 1fr)" autoRows="100px" gap={1}>
            {items.map((item, i) => (
                <ExpandableItem
                    key={i}
                    index={i}
                    item={item}
                    flipId={getFlipId(item)}
                    isSelected={selected ? getFlipId(selected) === getFlipId(item) : false}
                    memoData={memoData ? memoData[i] : undefined}
                    {...gridItemProps}
                />
            ))}
        </Grid>
    );
}

export type ExpandableRenderListProps<T extends object = object> = {
    items: T[];
    getFlipId: (item: T) => string;
    renderItem: ExpandableListProps["renderItem"];
    selected: T;
    zIndexQueue: string[];
    setSelected: (result: T) => void;
    unselect: (result: T) => void;
    storeSpringSet: (id: string, set: UseSpringSet) => void;
    setBackgroundSpring: UseSpringSet;
    memoData?: ExpandableListProps["memoData"];
};
export type ExpandableGridProps<T extends object = object> = ExpandableRenderListProps<T> & {
    columnCount?: number;
};
