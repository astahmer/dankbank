import { Grid } from "@chakra-ui/core";
import { memo } from "react";
import { areEqual, FixedSizeGrid, GridChildComponentProps } from "react-window";

import { useWindowSize } from "@/hooks/dom";
import { Flipper, FlipperOnFlipParams } from "@/services/Flipper";

import { ExpandableItem } from "./ExpandableItem";
import { ExpandableListProps } from "./ExpandableList";

export function ExpandableGrid({
    items,
    getFlipId,
    selected,
    memoData,
    columnCount = 3,
    getEl,
    rowHeight = 100,
    ...props
}: ExpandableGridProps) {
    const { width, height } = useWindowSize();
    const columnWidth = width / columnCount;
    const rowCount = Math.ceil(items.length / columnCount); // Min count of row to fit all items
    const gridHeight = rowHeight * rowCount > height ? height : rowHeight * rowCount;

    const gridProps = { columnCount, columnWidth, rowCount, rowHeight, width };
    const gridItemProps = { width, height, columnWidth, ...props };
    const data = { items, getFlipId, selected, memoData, gridItemProps, getEl };

    return items.length ? (
        <FixedSizeGrid {...gridProps} height={gridHeight} itemData={data} style={{ willChange: "unset" }}>
            {GridCell}
        </FixedSizeGrid>
    ) : null;
}

type ExpandableGridItemData = Pick<
    ExpandableRenderListProps,
    "items" | "selected" | "getFlipId" | "memoData" | "getEl"
> & {
    gridItemProps: any;
};

const GridCell = memo(
    ({ columnIndex, rowIndex, style, data }: GridChildComponentProps & { data: ExpandableGridItemData }) => {
        const { items, getFlipId, selected, memoData, gridItemProps, getEl } = data as ExpandableGridItemData;
        const index = columnIndex + rowIndex * 3;
        const item = items[index];

        return item ? (
            <ExpandableItem
                style={style}
                index={index}
                item={item}
                getEl={getEl}
                flipId={getFlipId(item)}
                isSelected={selected ? getFlipId(selected) === getFlipId(item) : false}
                memoData={memoData ? memoData[index] : undefined}
                {...gridItemProps}
            />
        ) : null;
    },
    areEqual
);

export function ExpandableClassicGrid({
    items,
    getFlipId,
    selected,
    memoData,
    rowHeight = 100,
    ...props
}: ExpandableGridProps) {
    const { width, height } = useWindowSize();
    const columnWidth = width / 3;
    const gridItemProps = { width, height, columnWidth, ...props };

    return (
        <Grid gridTemplateColumns="repeat(3, 1fr)" autoRows={rowHeight} gap={1}>
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
    getEl: Flipper["getEl"];
    renderItem: ExpandableListProps["renderItem"];
    selected: T;
    zIndexQueue: string[];
    setSelected: (result: T) => void;
    unselect: (result: T) => void;
    storeSpringSet: (id: string, set: UseSpringSet) => void;
    setBackgroundSpring: UseSpringSet;
    memoData?: ExpandableListProps["memoData"];
    after?: FlipperOnFlipParams["after"];
};
export type ExpandableGridProps<T extends object = object> = ExpandableRenderListProps<T> & {
    columnCount?: number;
    rowHeight?: number;
};
