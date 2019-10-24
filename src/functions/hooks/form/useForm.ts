import { ChangeEvent, Reducer, useReducer } from "react";

export enum FormActionType {
    SET,
    ADD,
    REMOVE,
    RESET,
    ADD_ERROR,
    REMOVE_ERROR,
}

type FieldBasicType = string | number | boolean;
type FieldType = FieldBasicType | Array<FieldBasicType>;

// type ComplexField = { name: string; type: FieldType; validation?: Function; defaultValue?: FieldType };
// type Field = string | ComplexField;

export type FormState<Fields = any> = { fields: Fields; errors: Record<string, string[]>; isValid: boolean };
const initialState: FormState<any> = { fields: {}, errors: {}, isValid: undefined };

export type FormActions = {
    set: (name: string, value: FieldType) => void;
    add: (name: string, value: FieldType) => void;
    remove: (name: string, value: FieldType) => void;
    reset: () => void;
    addError: (name: string, value: FieldType) => void;
    removeError: (name: string, value: FieldType) => void;
    onChange: (name: string) => (event: ChangeEvent<any>) => void;
};
export type FormReturn<Fields> = [FormState<Fields>, FormActions];

export function useForm<Fields>(fields: Fields): FormReturn<Fields> {
    const [state, dispatch] = useReducer(reducer, { ...initialState, fields });

    const doAction = <T = FieldType>(type: FormActionType) => (name: string, value: T) =>
        dispatch({ type, name, value });

    const set = doAction(FormActionType.SET);
    const add = doAction(FormActionType.ADD);
    const remove = doAction<number>(FormActionType.REMOVE);
    const reset = () => dispatch({ type: FormActionType.RESET });

    const addError = doAction(FormActionType.ADD_ERROR);
    const removeError = doAction<number>(FormActionType.REMOVE_ERROR);

    const onChange = (name: string) => (event: ChangeEvent<HTMLInputElement>) => set(name, event.target.value);

    return [state, { set, add, remove, reset, addError, removeError, onChange }];
}

type FormActionPayload = { type: FormActionType; name?: string; value?: any };

const reducer: Reducer<FormState<any>, FormActionPayload> = (state, { type, name, value }) => {
    switch (type) {
        case FormActionType.SET:
            return { ...state, fields: { ...state.fields, ...{ [name]: value } } };

        case FormActionType.ADD:
            return { ...state, fields: { ...state.fields, ...{ [name]: state.fields[name].concat(value) } } };

        case FormActionType.REMOVE:
            if (value >= 0 && state.fields[name][value]) {
                state.fields[name].splice(value, 1);
            }

            return { ...state, fields: { ...state.fields, ...{ [name]: state.fields[name] } } };

        case FormActionType.RESET:
            return initialState;

        case FormActionType.ADD_ERROR:
            return { ...state, errors: { ...state.errors, ...{ [name]: state.errors[name].concat(value) } } };

        case FormActionType.REMOVE:
            if (value >= 0 && state.errors[name][value]) {
                state.errors[name].splice(value, 1);
            }

            return { ...state, errors: { ...state.errors, ...{ [name]: state.errors[name] } } };

        default:
            throw new Error("Action type is unknown");
    }
};
