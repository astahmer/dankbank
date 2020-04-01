import Head from "next/head";
import { ReactNode } from "react";

export type PageHeadProps = { title: string; description?: string; keywords?: string; metatags?: ReactNode };

export function PageHead({ title, description, keywords, metatags }: PageHeadProps) {
    return (
        <Head>
            {description && <meta name="description" content={description} />}
            {keywords && <meta name="keywords" content={keywords} />}
            {metatags}
            <title> {title || "Dankbank"} </title>
        </Head>
    );
}
