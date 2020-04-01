import { Button } from "@chakra-ui/core";
import { ButtonProps } from "@chakra-ui/core/dist/Button";
import { useRef } from "react";
import { IoLogoTwitter } from "react-icons/io";

import { API_ROUTES, baseURL } from "@/config/api";
import { isDev } from "@/functions/utils";
import { Tokens } from "@/hooks/async/useAuth";
import { Memory } from "@/services/MemoryManager";

type TwitterLoginProps = Optional<ButtonProps, "children"> & { onLogged: (tokens: Tokens) => void; label?: string };

export function TwitterLogin({ onLogged, label = "Login with Twitter", ...props }: TwitterLoginProps) {
    // Open a window for OAuth process
    const callbackWindow = useRef<Window>();
    const checkTwitter = useRef(null);

    const onClick = () => {
        callbackWindow.current = window.open(
            baseURL + API_ROUTES.Auth.twitter,
            "TwitterAuth",
            "width=972,height=660,status=0"
        );
        checkTwitter.current = setInterval(() => {
            if (!callbackWindow.current || !callbackWindow.current.closed) {
                return;
            }

            clearInterval(checkTwitter.current);
            // Retrieve tokens set by callback window
            const tokens: Tokens = Memory.get("tokens");
            const err = Memory.get("twitter_error");

            if (tokens && tokens.accessToken && tokens.refreshToken) {
                onLogged(tokens);
            } else {
                if (isDev) {
                    console.error("There was an error while logging with Twitter:", err);
                }
                Memory.remove("twitter_error");
            }
        }, 300);
    };

    return (
        <Button
            size="sm"
            leftIcon={IoLogoTwitter as any}
            variantColor="blue"
            variant="outline"
            {...props}
            onClick={onClick}
        >
            {label}
        </Button>
    );
}
