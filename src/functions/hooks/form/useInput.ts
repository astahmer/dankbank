import { ChangeEvent, ChangeEventHandler, useState } from "react";

export function useInput(
    initialValue = ""
): [string, { value: string; onChange: ChangeEventHandler<HTMLInputElement> }] {
    const [value, setValue] = useState(initialValue);
    const onChange = (event: ChangeEvent<HTMLInputElement>) => setValue(event.target.value);

    return [value, { value, onChange }];
}
