import { Grid } from "@chakra-ui/core";
import { ReactElement } from "react";

import { useWindowSize } from "@/hooks/dom";

import { ExpandableGridItem } from "./ExpandableGridItem";

export function ExpandableGrid({ items, getFlipId, selected, ...props }: ExpandableGridProps) {
    const { width, height } = useWindowSize();
    const gridItemProps = { width, height, ...props };

    return (
        <Grid gridTemplateColumns="repeat(3, 1fr)" autoRows="100px" gap={1}>
            {items.map((item, i) => (
                <ExpandableGridItem
                    key={i}
                    item={item}
                    flipId={getFlipId(item)}
                    isSelected={selected && getFlipId(selected) === getFlipId(item)}
                    {...gridItemProps}
                />
            ))}
        </Grid>
    );
}

export type ExpandableGridProps<T extends object = object> = {
    items: T[];
    getFlipId: (item: T) => string;
    render: (item: T) => ReactElement;
    selected: T;
    zIndexQueue: string[];
    setSelected: (result: T) => void;
    unselect: (result: T) => void;
    storeSpringSet: (id: string, set: UseSpringSet) => void;
    setBackgroundSpring: UseSpringSet;
};
