import { forwardRef } from "react";

import { useWindowSize } from "@/hooks/dom";

import { ExpandableRenderListProps } from "./ExpandableGrid";
import { ExpandableItem } from "./ExpandableItem";
import { ExpandableList, ExpandableListProps } from "./ExpandableList";

export const ExpandableBox = forwardRef<HTMLElement, ExpandableBoxProps>(({ identifier, ...props }, ref) => {
    return (
        <ExpandableList
            {...props}
            ref={ref}
            items={[{ id: identifier }]}
            getId={(item) => (item as any).id}
            renderList={(props) => <ExpandableBoxItem {...props} />}
        />
    );
});

export function ExpandableBoxItem({ items, getFlipId, selected, memoData, ...props }: ExpandableRenderListProps) {
    const { width, height } = useWindowSize();

    const listItemProps = { width, height, ...props };
    const [item] = items;

    return (
        <ExpandableItem
            item={item}
            index={0}
            flipId={getFlipId(item)}
            isSelected={selected && getFlipId(selected) === getFlipId(item)}
            memoData={memoData ? memoData[0] : undefined}
            {...listItemProps}
        />
    );
}

export type ExpandableBoxProps = Pick<ExpandableListProps, "renderItem" | "boxProps" | "onSelected"> & {
    identifier: string;
};
