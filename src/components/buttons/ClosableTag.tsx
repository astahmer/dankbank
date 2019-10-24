import { Tag, TagCloseButton, TagLabel, TagProps } from "@chakra-ui/core";
import { MouseEventHandler } from "react";

export type ClosableTagProps = TagProps & { label: string; onCloseClick: MouseEventHandler };
export function ClosableTag({ label, onCloseClick, ...props }: ClosableTagProps) {
    return (
        <Tag size="sm" rounded="full" variant="solid" variantColor="cyan" {...props}>
            <TagLabel>{label}</TagLabel>
            <TagCloseButton onClick={onCloseClick} />
        </Tag>
    );
}
