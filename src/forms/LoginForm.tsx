import { Box, Button, Input, Stack } from "@chakra-ui/core";
import { FormEvent, useContext } from "react";

import { PasswordInput } from "@/components/field/PasswordInput";
import { API_ROUTES } from "@/config/api";
import { useAPI } from "@/hooks/async/useAPI";
import { AuthContext } from "@/hooks/async/useAuth";
import { FormState, useForm } from "@/hooks/form/useForm";
import { LoginBody, LoginResponse } from "@/types/routes/login";

export function LoginTemplate({ onSubmit, isLoading }: FormProps) {
    const [form, actions] = useForm({ username: "", password: "" });
    const { username, password } = form.fields;
    const handleSubmit = (event: FormEvent) => onSubmit(form);

    return (
        <Box as="form" paddingY="10px" marginY="10px" onSubmit={handleSubmit}>
            <Stack spacing={2}>
                <Input
                    isRequired
                    value={username}
                    onChange={actions.onChange("username")}
                    placeholder="Username or email"
                />
                <PasswordInput isRequired value={password} onChange={actions.onChange("password")} />
            </Stack>
            <Button mt={4} variantColor="blue" isFullWidth variant="outline" isLoading={isLoading} type="submit">
                Login
            </Button>
        </Box>
    );
}

type LoginFormState = { username: string; password: string };

export function LoginForm() {
    const [async, run] = useAPI<LoginResponse, LoginBody>(API_ROUTES.Auth.login, null, { method: "post" });
    const { actions } = useContext(AuthContext);

    const onSubmit = async (form: FormState<LoginFormState>) => {
        event.preventDefault();
        const { username, password } = form.fields;
        const [err, result] = await run({ name: username, email: username, password });
        if (result) {
            actions.login(result.accessToken, result.refreshToken);
        }
    };

    return <LoginTemplate onSubmit={onSubmit} isLoading={async.isLoading} />;
}
