import { Box, Flex } from "@chakra-ui/core";
import { useContext } from "react";

import TwitterLogin from "@/components/buttons/TwitterLogin";
import { RegisterForm } from "@/forms/RegisterForm";
import { AuthContext, Tokens } from "@/functions/hooks/useAuth";

export default function Register() {
    const auth = useContext(AuthContext);
    const onLogged = (tokens: Tokens) => auth.actions.login(tokens.accessToken, tokens.refreshToken);

    return (
        <Flex height="100%" justify="center" align="center">
            <Box>
                <RegisterForm />
                <Flex justify="flex-end">
                    <TwitterLogin onLogged={onLogged} />
                </Flex>
            </Box>
        </Flex>
    );
}

Register.PageHead = {
    title: "Register",
    description: "Dankbank register",
    keywords: "dankbank dank bank index home memes meme 420 69 register",
};
