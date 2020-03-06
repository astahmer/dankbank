import { BoxProps } from "@chakra-ui/core";
import { IoMdPricetag } from "react-icons/io";

import { API_ROUTES } from "@/config/api";
import { useRequestAPI } from "@/hooks/async/useAPI";
import {
    AutocompleteDataProps, AutocompleteFnProps, AutocompleteProps, AutocompleteResponseProps,
    AutocompleteWrapperProps
} from "@/hooks/form/useAutocomplete";

import { AutocompleteInput } from "../../field/Autocomplete/AutocompleteInput";

type TagsAutocomplete = Pick<AutocompleteProps, "display" | "options" | "inputProps"> &
    AutocompleteWrapperProps & { boxProps?: BoxProps };

export function TagsAutocomplete({ setSelecteds, ...props }: TagsAutocomplete) {
    const [async, run, resetFn, canceler] = useRequestAPI(
        API_ROUTES.Search.tag,
        null,
        { withToken: false },
        {
            initialData: { items: [], total: undefined },
        }
    );

    const suggestionFn = (value: string) => {
        canceler && canceler();
        return run({ q: value.toLowerCase(), size: 25 });
    };
    const displayFn = (suggestion: ElasticDocument) => ("" + suggestion.text).toLowerCase();
    const getId = (suggestion: ElasticDocument) => suggestion._id;
    const createFn = (text: string) => ({ text });

    const data: AutocompleteDataProps = { onSelectionChange: setSelecteds, ...async.data };
    const response: AutocompleteResponseProps = { ...async, resetFn };
    const fn: AutocompleteFnProps = { suggestionFn, displayFn, getId, createFn };
    const autocompleteProps: AutocompleteProps = { data, response, fn };

    return (
        <AutocompleteInput
            {...autocompleteProps}
            display={{ icon: IoMdPricetag, ...props.display }}
            inputProps={{ max: 20, placeholder: "Add tags", ...props.inputProps }}
            options={props.options}
            boxProps={props.boxProps}
        />
    );
}
