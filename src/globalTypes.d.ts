import { IAbstractEntity } from "./entities/AbstractEntity";

export type ResponseContext = {
    operation: string;
    entity: string;
    retrieveItems: number;
    totalItems: number;
};

export type CollectionResponse<EntityType extends IAbstractEntity> = {
    "@context": ResponseContext;
    items?: EntityType[];
};

export type PartialEntity<EntityType extends IAbstractEntity, Props> = Required<IAbstractEntity> &
    Pick<EntityType, Props>;
