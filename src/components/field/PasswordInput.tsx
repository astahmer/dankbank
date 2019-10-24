import { Button, Input, InputGroup, InputRightElement } from "@chakra-ui/core";
import { InputProps } from "@chakra-ui/core/dist/Input";
import { ChangeEvent, useState } from "react";

export type PasswordInputProps = InputProps & { onValueChange?: (value: string) => void };

export function PasswordInput({ value, onValueChange, ...props }: PasswordInputProps) {
    const [show, setShow] = useState(false);
    const handleClick = () => setShow(!show);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => onValueChange(event.target.value);

    return (
        <InputGroup size="md">
            <Input
                value={value}
                onChange={handleChange}
                pr="4.5rem"
                type={show ? "text" : "password"}
                placeholder="Enter password"
                {...props}
            />
            <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={handleClick}>
                    {show ? "Hide" : "Show"}
                </Button>
            </InputRightElement>
        </InputGroup>
    );
}
