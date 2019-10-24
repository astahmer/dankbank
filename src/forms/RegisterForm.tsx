import { Box, Button, Input, Stack } from "@chakra-ui/core";
import { FormEvent, useContext } from "react";

import { PasswordInput } from "@/components/field/PasswordInput";
import { API_ROUTES } from "@/config/api";
import { FormState, useForm } from "@/functions/hooks/form/useForm";
import { useAPI } from "@/functions/hooks/useAPI";
import { AuthContext } from "@/functions/hooks/useAuth";
import { RegisterBody, RegisterResponse } from "@/types/routes/register";

export function RegisterTemplate({ onSubmit, isLoading }: FormProps) {
    const [form, actions] = useForm({ email: "", name: "", password: "" });
    const { email, name, password } = form.fields;
    const handleSubmit = (event: FormEvent) => onSubmit(form);

    return (
        <Box as="form" paddingY="10px" marginY="10px" onSubmit={handleSubmit}>
            <Stack spacing={2}>
                <Input isRequired type="email" value={email} onChange={actions.onChange("email")} placeholder="Email" />
                <Input isRequired value={name} onChange={actions.onChange("name")} placeholder="Username" />
                <PasswordInput isRequired value={password} onChange={actions.onChange("password")} />
            </Stack>
            <Button mt={4} variantColor="blue" isFullWidth variant="outline" isLoading={isLoading} type="submit">
                Register
            </Button>
        </Box>
    );
}

type RegisterFormState = { email: string; name: string; password: string };

export function RegisterForm() {
    const [async, run] = useAPI<RegisterResponse, RegisterBody>(API_ROUTES.Auth.register, null, { method: "post" });
    const { actions } = useContext(AuthContext);

    const onSubmit = async (form: FormState<RegisterFormState>) => {
        event.preventDefault();
        const { email, name, password } = form.fields;
        const [err, result] = await run({ email, name, password });

        if (result) {
            actions.login(result.tokens.accessToken, result.tokens.refreshToken);
        }
    };

    return <RegisterTemplate onSubmit={onSubmit} isLoading={async.isLoading} />;
}
