import { ColorModeProvider, CSSReset, ThemeProvider } from "@chakra-ui/core";
import { ReactNode } from "react";

type ColorMode = "light" | "dark";

export function ColorTheme({ children, cookies }: { children: ReactNode; cookies: Record<string, string> }) {
    const { colorMode } = cookies as { colorMode: ColorMode };

    return (
        <ThemeProvider>
            <ColorModeProvider value={colorMode}>
                <CSSReset />
                {children}
            </ColorModeProvider>
        </ThemeProvider>
    );
}
