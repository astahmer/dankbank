import {
    ExpandableAutocompleteBtn, ExpandableAutocompleteWrapperBtnProps
} from "@/components/field/ExpandableAutocompleteBtn";
import { API_ROUTES } from "@/config/api";
import { useAPI } from "@/hooks/async";
import {
    AutocompleteDataProps, AutocompleteFnProps, AutocompleteProps, AutocompleteResponse,
    AutocompleteResponseProps
} from "@/hooks/form/useAutocomplete";
import { IMeme } from "@/types/entities/Meme";

export function ExpandableMemesAutocomplete({
    setSelecteds,
    ...props
}: ExpandableAutocompleteWrapperBtnProps<MemeSearchResult>) {
    const [async, run, resetFn, canceler] = useAPI<AutocompleteResponse<MemeSearchResult>>(API_ROUTES.Search.memes, {
        initialData: { items: [], total: undefined },
    });

    const suggestionFn = (value: string) => {
        canceler && canceler();
        return run({ q: value.toLowerCase(), size: 100 });
    };
    const displayFn = (suggestion: ElasticDocument) => ("" + suggestion.text).toLowerCase();
    const getId = (suggestion: ElasticDocument) => suggestion._id;
    const createFn = (text: string) => ({ text });

    // TODO Display selecteds in FullScreenModal header (still as (removable) tags)
    // API: Search by current inpue value + selecteds tags
    const data: AutocompleteDataProps = { onSelectionChange: setSelecteds, ...async.data };
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
            options={props.options}
            render={props.render}
            {...autocompleteProps}
        />
    );
}

export type MemeSearchResult = Omit<ElasticDocument<IMeme>, "text">;
