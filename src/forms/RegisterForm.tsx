import { Box, Button, Input, Stack } from "@chakra-ui/core";
import { useCallback, useContext } from "react";

import { PasswordInput } from "@/components/field/PasswordInput";
import { API_ROUTES } from "@/config/api";
import { useAPI } from "@/hooks/async/useAPI";
import { AuthContext } from "@/hooks/async/useAuth";
import { FormSubmitCallback, useForm } from "@/hooks/form/useForm";
import { RegisterBody, RegisterResponse } from "@/types/routes/register";

export function RegisterTemplate({ onSubmit, isLoading }: FormProps) {
    const [form, actions] = useForm({ email: "", name: "", password: "" });
    const handleSubmit = useCallback(actions.onSubmit(onSubmit), []);

    return (
        <Box as="form" paddingY="10px" marginY="10px" onSubmit={handleSubmit}>
            <Stack spacing={2}>
                <Input isRequired type="email" onChange={actions.onChange("email")} placeholder="Email" />
                <Input isRequired onChange={actions.onChange("name")} placeholder="Username" />
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
                Register
            </Button>
        </Box>
    );
}

type RegisterFormState = { email: string; name: string; password: string };

export function RegisterForm() {
    const [async, run] = useAPI<RegisterResponse, RegisterBody>(API_ROUTES.Auth.register, null, { method: "post" });
    const { actions } = useContext(AuthContext);

    const onSubmit: FormSubmitCallback<RegisterFormState> = async (data, e) => {
        e.preventDefault();
        const { email, name, password } = data;
        const [err, result] = await run({ email, name, password });

        if (result) {
            actions.login(result.tokens.accessToken, result.tokens.refreshToken);
        }
    };

    return <RegisterTemplate onSubmit={onSubmit} isLoading={async.isLoading} />;
}
