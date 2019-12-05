import {
    AppContextType, NextComponentType, NextPageContext
} from "next/dist/next-server/lib/utils";
import { Router } from "next/router";
import { ReactElement, ReactNode } from "react";

import { FormState } from "@/hooks/form/useForm";

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

    type ResponseContext = {
        operation: string;
        entity: string;
        retrieveItems: number;
        totalItems: number;
    };

    type CollectionResponse<EntityType extends IAbstractEntity> = {
        "@context": ResponseContext;
        items?: EntityType[];
    };

    type ItemResponse<EntityType extends IAbstractEntity> = { "@context": ResponseContext } & EntityType;

    type PartialEntity<EntityType extends IAbstractEntity, Props> = Required<IAbstractEntity> & Pick<EntityType, Props>;
    type ElasticDocument<Source = any> = {
        text?: string;
        _id: number;
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
    type FormProps = { onSubmit: FormHandler; isLoading?: boolean };
}

type Component = NextComponentType<NextPageContext> & { PageHead: PageHeadProps; AuthAccess: AuthAccess };
declare module "next/app" {
    type AppContext = AppContextType<Router> & { Component: Component };
}
