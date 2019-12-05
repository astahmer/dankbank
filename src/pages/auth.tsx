import { Box, Flex } from "@chakra-ui/core";

import { AuthForm } from "@/forms/AuthForm";
import { AuthAccess } from "@/services/AuthManager";

export default function Login() {
    return (
        <Flex height="100%" justify="center" align="center">
            <Box>
                <AuthForm />
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
