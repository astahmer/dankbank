import { Input, Text } from "@chakra-ui/core";
import { InputProps } from "@chakra-ui/core/dist/Input";
import { forwardRef, useRef, useState } from "react";

import { useEnhancedEffect } from "@/functions/utils";

export type AutogrowInputProps = InputProps & {
    value: string;
    hasIcon?: boolean;
    shouldHidePlaceholder?: boolean;
};

export const AutogrowInput = forwardRef<HTMLInputElement, AutogrowInputProps>(
    ({ value, onChange, placeholder, hasIcon, shouldHidePlaceholder, ...props }: AutogrowInputProps, ref) => {
        const textRef = useRef<HTMLInputElement>();
        const [inputWidth, setInputWidth] = useState("2px");

        // Whenever value changes, resize input & always keep at least 1px to display cursor flickering
        useEnhancedEffect(() => {
            const textWidth = getComputedStyle(textRef.current).width;
            setInputWidth(textWidth !== "0px" ? Math.ceil(parseFloat(textWidth)) + "px" : "1px");
        }, [value]);

        return (
            <>
                <Text
                    pos="absolute"
                    ref={textRef}
                    whiteSpace="nowrap"
                    fontSize={props.fontSize}
                    style={{ visibility: "hidden" }}
                >
                    {value.replace(/\s/g, ".")}
                </Text>
                <Input
                    {...props}
                    ref={ref}
                    boxSizing="content-box"
                    transition="none"
                    style={{ width: inputWidth }}
                    onChange={onChange}
                />
                <Text
                    pos="absolute"
                    whiteSpace="nowrap"
                    top="50%"
                    transform="translateY(-50%)"
                    fontSize={props.fontSize}
                    opacity={shouldHidePlaceholder ? 0 : 0.5}
                    transition="opacity 0.1s ease-out"
                    pl={hasIcon ? "30px" : 0}
                >
                    {placeholder}
                </Text>
            </>
        );
    }
);

AutogrowInput.displayName = "AutogrowInput";
