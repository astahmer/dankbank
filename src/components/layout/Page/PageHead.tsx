import Head from "next/head";
import { ReactNode } from "react";

export type PageHeadProps = { title: string; description?: string; keywords?: string; metatags?: ReactNode };

export function PageHead({ title, description, keywords, metatags }: PageHeadProps) {
    return (
        <Head>
            <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            <meta name="Author" content="Alexandre STAHMER" />
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            {metatags}
            <title> {title || "DK"} </title>
        </Head>
    );
}
