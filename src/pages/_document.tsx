import Document, { Head, Main, NextScript } from "next/document";

import { NoFlashScript } from "@/components/layout/Color/NoFlashScript";

// https://github.com/TjaartBroodryk/nextjs-typescript-custom-express-server/blob/master/pages/_document.tsx

export default class BaseDocument extends Document {
    render() {
        return (
            <html>
                <Head>
                    <link href="https://fonts.googleapis.com/css?family=Lato" rel="stylesheet" />
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
