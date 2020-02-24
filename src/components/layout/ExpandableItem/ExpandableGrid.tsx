import { Grid } from "@chakra-ui/core";

import { useWindowSize } from "@/hooks/dom";

import { ExpandableItem } from "./ExpandableItem";
import { ExpandableListProps } from "./ExpandableList";

export function ExpandableGrid({ items, getFlipId, selected, memoData, ...props }: ExpandableRenderListProps) {
    const { width, height } = useWindowSize();
    const gridItemProps = { width, height, ...props };

    // TODO use react-window & react-virtualized-auto-sizer

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
