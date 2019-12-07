import { ChangeEvent, FormEvent, Reducer, useCallback, useMemo, useRef } from "react";

import { getProp } from "@/functions/utils";

export function useForm<Values extends FormValues>(
    data: Values,
    validations?: FormState<Values>["validations"]
): FormReturn<Values> {
    const state = useRef({ ...initialState, data, validations });
    const dispatch = useCallback((action: FormActionPayload) => reducer(state.current, action), []);

    const doAction = <T = FieldType>(type: FormActionType) => (name: string, value: T) =>
        (state.current = dispatch({ type, name, value }));

    const actions = useMemo(
        () => ({
            // Getters
            get: (path: string | string[]) =>
                typeof path === "string"
                    ? getProp(state.current.data, path)
                    : path.map((pathItem) => getProp(state.current.data, pathItem)),
            getValues: () => state.current.data,
            getState: () => state.current,
            // Values
            set: doAction(FormActionType.SET),
            add: doAction(FormActionType.ADD),
            remove: doAction<number>(FormActionType.REMOVE),
            reset: () => dispatch({ type: FormActionType.RESET, value: { data, validations } }),
            // Error
            addError: doAction(FormActionType.ADD_ERROR),
            removeError: doAction<number>(FormActionType.REMOVE_ERROR),
            // Events
            onChange: (name: string) => (event: ChangeEvent<HTMLInputElement>) =>
                doAction(FormActionType.SET)(name, event.target.value),
            onSubmit: (callback: FormSubmitCallback<Values>) => (event: FormEvent) => {
                if (event) {
                    event.preventDefault();
                    event.persist();
                }
                callback(state.current.data, event);
            },
        }),
        []
    );

    return [state.current, actions];
}

export type FormValues = Record<string, any>;

export enum FormActionType {
    SET,
    ADD,
    REMOVE,
    RESET,
    ADD_ERROR,
    REMOVE_ERROR,
}

type FieldBasicType = string | number | boolean | object;
type FieldType = FieldBasicType | Array<FieldBasicType>;

type Validator<T> = (value: T) => boolean;
type FieldsValidation<Values> = { [P in keyof Values]: Validator<Values[P]> };

export type FormState<Values = any> = {
    data: Values;
    validations: Partial<FieldsValidation<Values>>;
    errors: Record<string, string[]>;
    isValid: boolean;
};
const initialState: FormState<any> = { data: {}, validations: {}, errors: {}, isValid: undefined };

export type FormSubmitCallback<Values extends FormValues> = (data: Values, event: FormEvent) => void;
export type FormActions<Values extends FormValues> = {
    // Getters
    get: (path: string | string[]) => any;
    getValues: () => Values;
    getState: () => FormState<Values>;
    // Values
    set: (name: string, value: FieldType) => void;
    add: (name: string, value: FieldType) => void;
    remove: (name: string, value: FieldType) => void;
    reset: () => void;
    // Errors
    addError: (name: string, value: FieldType) => void;
    removeError: (name: string, value: FieldType) => void;
    // Events
    onChange: (name: string) => (event: ChangeEvent<any>) => void;
    onSubmit: (callback: FormSubmitCallback<Values>) => (event: FormEvent<Element>) => void;
};
export type FormReturn<Values extends FormValues> = [FormState<Values>, FormActions<Values>];

type FormActionPayload = { type: FormActionType; name?: string; value?: any };

const reducer: Reducer<FormState<any>, FormActionPayload> = (state, { type, name, value }) => {
    const hasChanged = didValueChange(type);

    switch (type) {
        case FormActionType.SET: {
            const data = { ...state.data, ...{ [name]: value } };
            if (hasChanged) {
                const validationResult = getValidationResult(state.validations, data);
                state.isValid = validationResult.isValid;
            }

            return { ...state, data: data };
        }

        case FormActionType.ADD: {
            const data = { ...state.data, ...{ [name]: state.data[name].concat(value) } };
            if (hasChanged) {
                const validationResult = getValidationResult(state.validations, data);
                state.isValid = validationResult.isValid;
            }
            return { ...state, data: data };
        }

        case FormActionType.REMOVE: {
            if (value >= 0 && state.data[name][value]) {
                state.data[name].splice(value, 1);
            }

            const data = { ...state.data, ...{ [name]: state.data[name] } };
            if (hasChanged) {
                const validationResult = getValidationResult(state.validations, data);
                state.isValid = validationResult.isValid;
            }

            return { ...state, data: data };
        }

        case FormActionType.RESET:
            return { ...initialState, ...value };

        case FormActionType.ADD_ERROR:
            return { ...state, errors: { ...state.errors, ...{ [name]: state.errors[name].concat(value) } } };

        case FormActionType.REMOVE_ERROR:
            if (value >= 0 && state.errors[name][value]) {
                state.errors[name].splice(value, 1);
            }

            return { ...state, errors: { ...state.errors, ...{ [name]: state.errors[name] } } };

        default:
            throw new Error("Action type is unknown");
    }
};

const changeActions = [FormActionType.SET, FormActionType.ADD, FormActionType.REMOVE];
const didValueChange = (type: FormActionType) => changeActions.includes(type);
const getValidationResult = <Values extends FormValues>(
    validations: Partial<FieldsValidation<Values>>,
    data: Values
) => {
    const validationResult: Pick<FormState<Values>, "errors" | "isValid"> = { errors: {}, isValid: true };
    let errorCount = 0;

    for (const key in validations) {
        if (validations.hasOwnProperty(key)) {
            errorCount += validations[key](data[key]) ? 0 : 1;
            console.log(validations[key](data[key]));
            // TODO add error when validator has a custom error message
            // result.errors[key] = validations[key](fields[key])
        }
    }

    validationResult.isValid = errorCount < 1;

    return validationResult;
};
