import { ColorModeProvider, CSSReset, ThemeProvider } from "@chakra-ui/core";
import { ReactNode } from "react";

export function ColorTheme({ children, cookies }: { children: ReactNode; cookies: Record<string, string> }) {
    const { colorMode } = cookies;
    return (
        <ThemeProvider>
            <CSSReset />
            <ColorModeProvider value={colorMode as "light" | "dark"}>{children}</ColorModeProvider>
        </ThemeProvider>
    );
}
