import { useCallback, useState } from "react";

import {
    ExpandableAutocompleteBtn, ExpandableAutocompleteWrapperBtnProps
} from "@/components/field/ExpandableAutocompleteBtn";
import { API_ROUTES } from "@/config/api";
import { useRequestAPI } from "@/hooks/async/useAPI";
import {
    AutocompleteDataProps, AutocompleteFnProps, AutocompleteProps, AutocompleteResponse,
    AutocompleteResponseProps
} from "@/hooks/form/useAutocomplete";
import { MemeDocument } from "@/types/entities/Meme";

export function ExpandableMemesAutocomplete({
    setSelecteds,
    ...props
}: ExpandableAutocompleteWrapperBtnProps<MemeSearchResult>) {
    const [async, run, resetFn, canceler] = useRequestAPI<AutocompleteResponse<MemeSearchResult>>(
        API_ROUTES.Search.memes,
        null,
        { withToken: false },
        {
            initialData: { items: [], total: undefined },
        }
    );

    const [tags, setTags] = useState([]);
    const onSelectionChange: AutocompleteDataProps["onSelectionChange"] = useCallback(
        (selecteds) => {
            setTags(selecteds.map((item) => item.text));
            setSelecteds(selecteds);
        },
        [setSelecteds]
    );

    const suggestionFn = (value: string) => {
        canceler && canceler();
        return run({ q: value.toLowerCase(), size: 100, tags });
    };
    const displayFn = (suggestion: ElasticDocument) => ("" + suggestion.text).toLowerCase();
    const getId = (suggestion: ElasticDocument) => suggestion._id;
    const createFn = (text: string) => ({ text });

    const data: AutocompleteDataProps = { onSelectionChange, ...async.data };
    const response: AutocompleteResponseProps = { ...async, resetFn };
    const fn: AutocompleteFnProps = { suggestionFn, displayFn, getId, createFn };
    const autocompleteProps: AutocompleteProps = { data, response, fn };

    return (
        <ExpandableAutocompleteBtn
            expandableProps={{
                isFloating: true,
                btnProps: { position: "relative", icon: "search-2" },
                direction: "left",
                inputProps: { placeholder: "Search memes by tags", max: 20 },
                ...props.expandableProps,
            }}
            options={{ ...props.options, shouldResetOnEmptyInput: false }}
            render={props.render}
            {...autocompleteProps}
        />
    );
}

export type MemeSearchResult = Omit<ElasticDocument<MemeDocument>, "text">;
