import { Box, BoxProps, Icon, IconProps } from "@chakra-ui/core";
import { Icons } from "@chakra-ui/core/dist/theme/icons";
import { IconType } from "react-icons/lib/cjs";

import { isType } from "@/functions/utils";

export type CustomIconProps<T extends Icons | IconType = any> = { icon: T } & (T extends Icons ? IconProps : BoxProps);

/** Render either Chakra's Icon with name={props.icon} if icon is string or else Chakra's Box as={icon} */
export function CustomIcon({ icon, ...props }: CustomIconProps) {
    return isType<IconType>(icon, icon instanceof Function) ? (
        <Box as={icon as IconType} {...props} />
    ) : (
        isType<IconProps>(props, "size" in props) && <Icon name={icon} {...props} />
    );
}
