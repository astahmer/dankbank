import { MouseEvent } from "react";
import { useInput } from "@/functions/hooks/form/useInput";
import { Input, Button } from "@chakra-ui/core";
import { Memory } from "@/services/MemoryManager";

export function MemoryForm() {
    const [key, bindKey] = useInput("");
    const [value, bindValue] = useInput("");

    const onGet = (event: MouseEvent) => {
        console.log(key, Memory.get(key));
    };
    const onSet = (event: MouseEvent) => {
        console.log(key, value);
        Memory.set(key, value);
        console.log(Memory.get(key));
    };

    return (
        <>
            <Input {...bindKey} placeholder="Key" />
            <Input {...bindValue} placeholder="Value" />
            <Button mt={4} variantColor="blue" onClick={onGet}>
                Get
            </Button>
            <Button mt={4} variantColor="blue" onClick={onSet}>
                Set
            </Button>
        </>
    );
}
