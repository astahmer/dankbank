import { Input, Text } from "@chakra-ui/core";
import { InputProps } from "@chakra-ui/core/dist/Input";
import { Ref, useRef, useState } from "react";

import { useEnhancedEffect } from "@/functions/utils";

export type AutogrowInputProps = InputProps & { forwardedRef?: Ref<any> };
export const AutogrowInput = ({ forwardedRef, value, onChange, ...props }: AutogrowInputProps) => {
    const textRef = useRef();
    const [inputWidth, setInputWidth] = useState("2px");

    // Whenever value changes, resize input & always keep at least 1px to display cursor flickering
    useEnhancedEffect(() => {
        const width = getComputedStyle(textRef.current).width;
        setInputWidth(width !== "0px" ? width : "1px");
    }, [value]);

    return (
        <>
            <Text pos="absolute" ref={textRef} style={{ visibility: "hidden" }}>
                {value}
            </Text>
            <Input
                {...props}
                ref={forwardedRef}
                boxSizing="content-box"
                transition="none"
                style={{ width: inputWidth }}
                onChange={onChange}
            />
        </>
    );
};
