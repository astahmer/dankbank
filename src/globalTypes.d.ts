import {
    AppContextType, NextComponentType, NextPageContext
} from "next/dist/next-server/lib/utils";
import { Router } from "next/router";
import { ReactElement, ReactNode } from "react";
import { useSpring } from "react-spring";

import { FormState, FormSubmitCallback, FormValues } from "@/hooks/form/useForm";

import { PageHeadProps } from "./components/layout/Page/PageHead";
import { AuthAccess } from "./hooks/async/useAuth";
import { IAbstractEntity } from "./types/entities/AbstractEntity";

declare global {
    // https://stackoverflow.com/questions/43159887/make-a-single-property-optional-in-typescript
    type Overwrite<T1, T2> = {
        [P in Exclude<keyof T1, keyof T2>]: T1[P];
    } &
        T2;

    // https://github.com/piotrwitek/utility-types/blob/master/src/mapped-types.ts
    type Optional<T extends object, K extends keyof T = keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

    // https://stackoverflow.com/questions/43537520/how-do-i-extract-a-type-from-an-array-in-typescript
    type Unpacked<T> = T extends (infer U)[] ? U : T;

    // Modified version of
    // https://github.com/sindresorhus/type-fest/blob/master/source/set-required.d.ts
    type SetRequiredKeys<T, K extends keyof T = keyof T> = Pick<T, Exclude<keyof T, K>> &
        Required<Pick<T, K>> extends infer U
        ? { [KT in keyof U]: U[KT] }
        : never;
    type RequiredKeys<T, K extends keyof T = keyof T> = Pick<T, Exclude<keyof T, K>> & Required<Pick<T, K>>;

    // https://stackoverflow.com/questions/52703321/make-some-properties-optional-in-a-typescript-type
    type OptionalExceptFor<T, TRequired extends keyof T> = Partial<T> & Pick<T, TRequired>;

    type UseSpringReturn = ReturnType<typeof useSpring>;
    type UseSpringSet = UseSpringReturn["1"];

    type ResponseContext = {
        operation: string;
        entity: string;
        retrieveItems: number;
        totalItems: number;
    };
    type ResponseContextProp = { "@context": ResponseContext };

    type CollectionResponse<EntityType extends IAbstractEntity> = ResponseContextProp & { items: EntityType[] };
    type ItemResponse<EntityType extends IAbstractEntity> = ResponseContextProp & EntityType;
    type DeleteResponse = ResponseContextProp & { deleted: number };

    type PartialEntity<EntityType extends IAbstractEntity, Props> = Required<IAbstractEntity> & Pick<EntityType, Props>;
    type ElasticDocument<Source = any> = {
        text?: string;
        _id: string;
        _index: string;
        _type: string;
        _score: string;
        _source?: Source;
    };

    type ChildrenProp<Props = null> = Props extends null
        ? { children: ReactNode }
        : { children: ReactElement<Props> | Array<ReactElement<Props>> };
    type RenderProp<Prop = any> = { render: (state: Prop) => ReactNode };

    type FormHandler = (form: FormState) => void;
    type FormProps<Values extends FormValues = any> = { onSubmit: FormSubmitCallback<Values>; isLoading?: boolean };
}

type Component = NextComponentType<NextPageContext> & { PageHead: PageHeadProps; AuthAccess: AuthAccess };
declare module "next/app" {
    type AppContext = AppContextType<Router> & { Component: Component };
}
