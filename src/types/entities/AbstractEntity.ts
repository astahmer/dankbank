export interface IAbstractEntity {
    "@id": string;
    "@type": string;
    dateCreated: Date;
    dateUpdated: Date;
    id: number;
}

export interface IAbstractEntityDocument {
    "@id": string;
    iri: string;
    id: number;
}
