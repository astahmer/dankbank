import { Reducer } from "react";

export type BasicReducerAction = "SET" | "ADD" | "REMOVE";
export type BasicReducerActionPayload<ReducerAction = string, ReducerInitialState = object> = {
    type: ReducerAction;
    property: keyof ReducerInitialState;
    value: any;
};

export const basicReducer: Reducer<object, BasicReducerActionPayload> = (state, action) => {
    switch (action.type) {
        case "SET":
            return { ...state, [action.property]: action.value };

        case "ADD":
            return { ...state, [action.property]: (state[action.property] || []).push(action.value) };

        case "REMOVE":
            const updatedArray = (state[action.property] as any[]).splice(action.value, 1);
            return { ...state, [action.property]: updatedArray };

        default:
            throw new Error("Action type must be one of : SET|ADD|REMOVE");
    }
};
