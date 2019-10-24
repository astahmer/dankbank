export type IAutocompleteResponseTotal = { relation: string; value: number } | number;
export interface IAutocompleteResponse<T = any> {
    items: T[];
    total?: IAutocompleteResponseTotal;
}

export type AutocompleteInitialstate = { error?: string; items?: any[]; total: IAutocompleteResponseTotal };
export type AutocompleteAction = "SET_RESPONSE" | "SET_ERROR";
export type AutocompleteActionPayload = { type: AutocompleteAction; value: any };
