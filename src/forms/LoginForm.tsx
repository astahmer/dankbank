import { Box, Button, Input, Stack } from "@chakra-ui/core";
import { useCallback, useContext } from "react";

import { PasswordInput } from "@/components/field/PasswordInput";
import { API_ROUTES } from "@/config/api";
import { useRequestAPI } from "@/hooks/async/useAPI";
import { AuthContext } from "@/hooks/async/useAuth";
import { FormSubmitCallback, useForm } from "@/hooks/form/useForm";
import { LoginResponse } from "@/types/routes/login";

export function LoginTemplate({ onSubmit, isLoading }: FormProps) {
    const [form, actions] = useForm({ username: "", password: "" }, { username: (value) => value.length > 3 });
    const handleSubmit = useCallback(actions.onSubmit(onSubmit), []);

    return (
        <Box as="form" paddingY="10px" marginY="10px" onSubmit={handleSubmit}>
            <Stack spacing={2}>
                <Input isRequired onChange={actions.onChange("username")} placeholder="Username or email" />
                <PasswordInput isRequired onChange={actions.onChange("password")} />
            </Stack>
            <Button
                type="submit"
                mt={4}
                variantColor="blue"
                isFullWidth
                variant="outline"
                isLoading={isLoading}
                isDisabled={!form.isValid}
            >
                Login
            </Button>
        </Box>
    );
}

type LoginFormState = { username: string; password: string };

export function LoginForm() {
    const [async, run] = useRequestAPI<LoginResponse>(API_ROUTES.Auth.login, { method: "post" }, { withToken: false });
    const { actions } = useContext(AuthContext);

    const onSubmit: FormSubmitCallback<LoginFormState> = async (data, e) => {
        e.preventDefault();
        const { username, password } = data;
        const [err, result] = await run({ name: username, email: username, password });
        if (result) {
            actions.login(result.accessToken, result.refreshToken);
        }
    };

    return <LoginTemplate onSubmit={onSubmit} isLoading={async.isLoading} />;
}
