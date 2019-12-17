import { Button, Flex } from "@chakra-ui/core";
import { useCallback, useContext } from "react";

import { TwitterLogin } from "@/components/buttons";
import { AuthContext, Tokens } from "@/hooks/async/useAuth";
import { useToggle } from "@/hooks/useToggle";

import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

export function AuthForm() {
    const [isRegistering, { toggle }] = useToggle();

    const auth = useContext(AuthContext);
    const onLogged = useCallback((tokens: Tokens) => auth.actions.login(tokens.accessToken, tokens.refreshToken), []);

    const TwitterBtn = () => (
        <Flex justify="flex-end" wrap="wrap">
            <TwitterLogin label={isRegistering ? "Register with Twitter" : "Login with Twitter"} onLogged={onLogged} />
        </Flex>
    );

    return (
        <>
            <Flex justify="flex-end" wrap="wrap">
                <Button size="sm" variantColor="blue" variant="link" onClick={() => toggle()}>
                    {isRegistering ? "Login" : "Register"}
                </Button>
            </Flex>
            {isRegistering ? <RegisterForm /> : <LoginForm />}
            <TwitterBtn />
        </>
    );
}
