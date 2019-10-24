import { Button, Icon, useColorMode } from "@chakra-ui/core";
import { ButtonProps } from "@chakra-ui/core/dist/Button";

import { COMMON_COLORS } from "@/config/theme";

enum BtnIconSize {
    xs = "10px",
    sm = "14px",
    md = "18px",
    lg = "22px",
    xl = "26px",
}

export type BtnIconSpecificProps = { icon?: string; size?: BtnIconSize };
export type BtnIconProps = Omit<ButtonProps, "children"> & Pick<Required<BtnIconSpecificProps>, "icon">;

export function BtnIcon({ icon, size, ...props }: BtnIconProps) {
    const { colorMode } = useColorMode();

    return (
        <Button
            _focus={{}}
            _hover={{ bg: COMMON_COLORS.hover[colorMode] }}
            border="none"
            bg={COMMON_COLORS.bgColor[colorMode]}
            color={COMMON_COLORS.color[colorMode]}
            p="0"
            w={BtnIconSize[size || "md"]}
            variant="ghost"
            cursor="pointer"
            {...props}
        >
            <Icon size="50%" name={icon} />
        </Button>
    );
}
