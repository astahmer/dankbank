import { useColorMode } from "@chakra-ui/core";
import { ButtonProps } from "@chakra-ui/core/dist/Button";

import { BtnIcon, BtnIconSpecificProps } from "@/components/buttons/BtnIcon";
import { Cookies } from "@/services/CookieManager";

export function ColorToggle(props: Omit<ButtonProps, "children"> & BtnIconSpecificProps) {
    const { colorMode, toggleColorMode } = useColorMode();
    const icon = colorMode === "light" ? "moon" : "sun";

    const handleOnClick = () => {
        Cookies.set("colorMode", colorMode === "dark" ? "light" : "dark", "3y");
        toggleColorMode();
    };

    return <BtnIcon icon={icon} onClick={handleOnClick} {...props} />;
}
