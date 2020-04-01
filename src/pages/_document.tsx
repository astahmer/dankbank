import Document, { Head, Main, NextScript } from "next/document";

import { NoFlashScript } from "@/components/layout/Color/NoFlashScript";

// https://github.com/TjaartBroodryk/nextjs-typescript-custom-express-server/blob/master/pages/_document.tsx
// TODO robots.txt

export default class BaseDocument extends Document {
    render() {
        return (
            <html>
                <Head>
                    <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
                    <meta
                        name="viewport"
                        content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
                    />
                    <meta name="Author" content="Alexandre STAHMER" />
                    <meta name="apple-mobile-web-app-capable" content="yes"></meta>
                    <meta name="mobile-web-app-capable" content="yes"></meta>

                    <link href="https://fonts.googleapis.com/css?family=Lato" rel="stylesheet" />
                    <link rel="manifest" href="/manifest.json" />
                    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
                    <link rel="icon" href="/favicon.ico" type="image/x-icon" />

                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:url" content="https://dankbank.lol" />
                    <meta name="twitter:title" content="Dankbank" />
                    <meta name="twitter:description" content="banque de memes du cul" />
                    <meta name="twitter:image" content="/icon-128.png" />
                    <meta name="twitter:creator" content="@dankbanklol" />
                    <meta property="og:type" content="website" />
                    <meta property="og:title" content="Dankbank" />
                    <meta property="og:description" content="banque de memes du cul" />
                    <meta property="og:site_name" content="Dankbank" />
                    <meta property="og:url" content="https://dankbank.lol" />
                    <meta property="og:image" content="/icon-192.png" />
                </Head>
                <body>
                    <NoFlashScript />
                    <Main />
                    <NextScript />
                    <div id="full-portals"></div>
                </body>
            </html>
        );
    }
}
