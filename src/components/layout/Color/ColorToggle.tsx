import { IconButton, useColorMode } from "@chakra-ui/core";
import { ButtonProps } from "@chakra-ui/core/dist/Button";

import { Cookies } from "@/services/CookieManager";

export function ColorToggle(props: Omit<ButtonProps, "children"> & any) {
    const { colorMode, toggleColorMode } = useColorMode();
    const icon = colorMode === "light" ? "moon" : "sun";

    const handleOnClick = () => {
        Cookies.set("colorMode", colorMode === "dark" ? "light" : "dark", "3y");
        toggleColorMode();
    };

    return <IconButton aria-label="Color toggle" icon={icon} onClick={handleOnClick} {...props} />;
}
