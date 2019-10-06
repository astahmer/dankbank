import Link from "next/link";
import Head from "next/head";

const linkStyle = {
    marginRight: 15,
};

const Header = () => (
    <div>
        <Head>
            <meta key="viewport" name="viewport" content="width=device-width, initial-scale=1" />
        </Head>

        <Link href="/">
            <a style={linkStyle}>Home</a>
        </Link>
        <Link href="/about">
            <a style={linkStyle}>About</a>
        </Link>
    </div>
);

export default Header;
