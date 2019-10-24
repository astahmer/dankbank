import { Box, Flex } from "@chakra-ui/core";
import { useContext } from "react";

import TwitterLogin from "@/components/buttons/TwitterLogin";
import { LoginForm } from "@/forms/LoginForm";
import { AuthContext, Tokens } from "@/functions/hooks/useAuth";
import { AuthAccess } from "@/services/AuthManager";

export default function Login() {
    const auth = useContext(AuthContext);
    const onLogged = (tokens: Tokens) => auth.actions.login(tokens.accessToken, tokens.refreshToken);

    return (
        <Flex height="100%" justify="center" align="center">
            <Box>
                <LoginForm />
                <Flex justify="flex-end">
                    <TwitterLogin onLogged={onLogged} />
                </Flex>
            </Box>
        </Flex>
    );
}

Login.AuthAccess = AuthAccess.ANONYMOUS;
Login.PageHead = {
    title: "Login",
    description: "Dankbank login",
    keywords: "dankbank dank bank index home memes meme 420 69 login",
};
