import { IoMdPricetag } from "react-icons/io";

import { API_ROUTES } from "@/config/api";
import { useAPI } from "@/hooks/async/useAPI";

import { Autocomplete, AutocompleteWrapperProps } from "./Autocomplete/Autocomplete";

export function TagsAutocomplete({ setSelecteds, ...props }: AutocompleteWrapperProps) {
    const [async, run, reset, canceler] = useAPI(API_ROUTES.Search.tag, { initialData: { items: [] } });

    const suggestionFn = (value: string) => {
        canceler && canceler();
        return run({ q: value.toLowerCase(), size: 25 });
    };
    const displayFn = (suggestion: ElasticDocument) => ("" + suggestion.text).toLowerCase();
    const getId = (suggestion: ElasticDocument) => suggestion._id;
    const createFn = (text: string) => ({ text });
    const autocompleteProps = { async, reset, suggestionFn, displayFn, getId, createFn };

    return (
        <Autocomplete
            placeholder="Add tags"
            icon={IoMdPricetag}
            shouldShowResultsOnFocus
            withGhostSuggestion
            max={20}
            onSelectionChange={setSelecteds}
            {...autocompleteProps}
            {...props}
        />
    );
}
