export interface IAbstractEntity {
    "@id": string;
    "@type": string;
    dateCreated: Date;
    dateUpdated: Date;
    id: number;
}

export interface IAbstractEntityDocument {
    iri: string;
    id: number;
}
